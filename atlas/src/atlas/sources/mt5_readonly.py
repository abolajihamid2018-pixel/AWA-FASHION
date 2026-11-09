"""Read-only MetaTrader 5 source.

* ATLAS never sends credentials: it calls ``initialize()`` WITHOUT login,
  password or server, attaching to a terminal the user already logged in to.
* Only whitelisted, read-only MT5 functions are reachable through
  ``ReadOnlyMT5``; anything else (order_send, order_check, ...) raises.
* A REAL account is refused outright in this build (environment separation).
* Hedging vs netting is read from the account, never assumed.
"""
from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta, timezone
from types import ModuleType
from typing import Any, Optional

from ..settings import MT5Settings
from .base import (
    AccountSnapshot, Deal, EnvironmentMismatch, EquityPoint, Position, SourceError,
)

log = logging.getLogger("atlas.mt5")

ALLOWED_CALLS = frozenset({
    "initialize", "shutdown", "last_error", "version", "terminal_info",
    "account_info", "positions_get", "history_deals_get", "symbol_info",
    "copy_rates_range",
})
_CREDENTIAL_KWARGS = {"login", "password", "server"}

_TRADE_MODE = {0: "demo", 1: "contest", 2: "real"}
_MARGIN_MODE = {0: "netting", 1: "exchange", 2: "hedging"}
_DEAL_TYPE = {0: "buy", 1: "sell", 2: "balance", 3: "credit", 4: "charge", 5: "correction", 6: "bonus", 7: "commission"}
_DEAL_ENTRY = {0: "in", 1: "out", 2: "inout", 3: "out_by"}


class ReadOnlyMT5:
    """Proxy exposing only read-only MetaTrader5 functions."""

    def __init__(self, module: ModuleType | Any) -> None:
        object.__setattr__(self, "_module", module)

    def __getattr__(self, name: str) -> Any:
        if name not in ALLOWED_CALLS:
            raise PermissionError(f"MT5 function '{name}' is not permitted: ATLAS Python is read-only.")
        attr = getattr(self._module, name)
        if name == "initialize":
            def _init(*args: Any, **kwargs: Any) -> Any:
                if args or _CREDENTIAL_KWARGS & set(kwargs):
                    raise PermissionError("ATLAS must not pass credentials to MT5; log in via the terminal.")
                return attr(**kwargs)
            return _init
        return attr

    def __setattr__(self, name: str, value: Any) -> None:
        raise PermissionError("ReadOnlyMT5 is immutable.")


class MT5ReadOnlySource:
    name = "mt5"

    def __init__(self, settings: MT5Settings, environment: str, module: Optional[Any] = None) -> None:
        if settings.server_utc_offset_hours is None:
            raise SourceError(
                "mt5.server_utc_offset_hours is not set. Broker server time must be "
                "mapped to UTC explicitly; ATLAS will not guess it."
            )
        if module is None:
            try:
                import MetaTrader5 as module  # type: ignore[no-redef]
            except ImportError as exc:
                raise SourceError(
                    "The MetaTrader5 Python package is not installed. It is Windows-only; "
                    "install with: pip install MetaTrader5"
                ) from exc
        self._mt5 = ReadOnlyMT5(module)
        self._cfg = settings
        self._environment = environment
        self._offset = timedelta(hours=settings.server_utc_offset_hours)
        self._connected = False

    # -- connection ------------------------------------------------------
    def connect(self) -> None:
        kwargs: dict[str, Any] = {"timeout": self._cfg.connect_timeout_ms}
        if self._cfg.terminal_path:
            kwargs["path"] = self._cfg.terminal_path
        delay = 1.0
        for attempt in range(1, self._cfg.connect_retries + 1):
            if self._mt5.initialize(**kwargs):
                break
            log.warning("MT5 initialize failed (attempt %d): %s", attempt, self._mt5.last_error())
            if attempt == self._cfg.connect_retries:
                raise SourceError(f"Could not attach to MT5 terminal: {self._mt5.last_error()}")
            time.sleep(delay)
            delay *= 2
        self._connected = True
        info = self._mt5.account_info()
        if info is None:
            self.close()
            raise SourceError("MT5 terminal is running but no account is logged in.")
        mode = _TRADE_MODE.get(info.trade_mode, "unknown")
        if mode == "real":
            self.close()
            raise EnvironmentMismatch(
                "Connected account is a REAL account. This build only supports demo accounts; disconnecting."
            )
        if self._environment == "demo" and mode != "demo":
            self.close()
            raise EnvironmentMismatch(f"Environment is 'demo' but account trade mode is '{mode}'.")

    def close(self) -> None:
        if self._connected:
            self._mt5.shutdown()
            self._connected = False

    def _require(self) -> None:
        if not self._connected:
            raise SourceError("Not connected; call connect() first.")

    def _utc(self, server_seconds: float) -> datetime:
        return datetime.fromtimestamp(server_seconds, tz=timezone.utc) - self._offset

    # -- data ------------------------------------------------------------
    def account(self) -> AccountSnapshot:
        self._require()
        a = self._mt5.account_info()
        if a is None:
            raise SourceError(f"account_info failed: {self._mt5.last_error()}")
        return AccountSnapshot(
            source="mt5", login=int(a.login), server=str(a.server), currency=str(a.currency),
            balance=float(a.balance), equity=float(a.equity), margin=float(a.margin),
            margin_free=float(a.margin_free), leverage=int(a.leverage),
            trade_mode=_TRADE_MODE.get(a.trade_mode, "unknown"),  # type: ignore[arg-type]
            margin_mode=_MARGIN_MODE.get(a.margin_mode, "unknown"),  # type: ignore[arg-type]
            ts=datetime.now(timezone.utc),
        )

    def positions(self) -> list[Position]:
        self._require()
        rows = self._mt5.positions_get()
        if rows is None:
            raise SourceError(f"positions_get failed: {self._mt5.last_error()}")
        return [
            Position(
                ticket=int(p.ticket), symbol=str(p.symbol), type="buy" if p.type == 0 else "sell",
                volume=float(p.volume), price_open=float(p.price_open), price_current=float(p.price_current),
                sl=float(p.sl), tp=float(p.tp), profit=float(p.profit), swap=float(p.swap),
                magic=int(p.magic), time=self._utc(p.time),
            )
            for p in rows
        ]

    def deals(self, start: datetime, end: datetime) -> list[Deal]:
        self._require()
        # MT5 interprets the bounds in server time.
        rows = self._mt5.history_deals_get(start + self._offset, end + self._offset)
        if rows is None:
            raise SourceError(f"history_deals_get failed: {self._mt5.last_error()}")
        return [
            Deal(
                ticket=int(d.ticket), position_id=int(d.position_id), time=self._utc(d.time),
                symbol=str(d.symbol), type=_DEAL_TYPE.get(d.type, "other"),  # type: ignore[arg-type]
                entry=_DEAL_ENTRY.get(d.entry, "none"),  # type: ignore[arg-type]
                volume=float(d.volume), price=float(d.price), profit=float(d.profit),
                commission=float(d.commission), swap=float(d.swap), fee=float(getattr(d, "fee", 0.0)),
                magic=int(d.magic), comment=str(d.comment),
            )
            for d in rows
        ]

    def equity_history(self) -> list[EquityPoint]:
        return []  # MT5 does not store equity history; ATLAS builds it from snapshots.
