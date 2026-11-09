"""Broker-independent, read-only data model.

Nothing here assumes hedging or netting. Deals are the source of truth for
realised P&L in both modes; `margin_mode` is recorded, never assumed.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal, Optional, Protocol

TradeMode = Literal["mock", "demo", "contest", "real", "unknown"]
MarginMode = Literal["hedging", "netting", "exchange", "unknown"]
DealType = Literal["buy", "sell", "balance", "credit", "charge", "correction", "bonus", "commission", "other"]
DealEntry = Literal["in", "out", "inout", "out_by", "none"]


class SourceError(RuntimeError):
    """A data source could not provide data."""


class EnvironmentMismatch(SourceError):
    """The connected account does not match the configured environment."""


@dataclass(frozen=True)
class AccountSnapshot:
    source: str
    login: int
    server: str
    currency: str
    balance: float
    equity: float
    margin: float
    margin_free: float
    leverage: int
    trade_mode: TradeMode
    margin_mode: MarginMode
    ts: datetime  # UTC

    @property
    def account_key(self) -> str:
        # Source is part of the key so mock and real data can never merge.
        return f"{self.source}:{self.server}:{self.login}"


@dataclass(frozen=True)
class Deal:
    ticket: int
    position_id: int
    time: datetime  # UTC
    symbol: str
    type: DealType
    entry: DealEntry
    volume: float
    price: float
    profit: float
    commission: float = 0.0
    swap: float = 0.0
    fee: float = 0.0
    magic: int = 0
    comment: str = ""

    @property
    def net(self) -> float:
        return self.profit + self.commission + self.swap + self.fee


@dataclass(frozen=True)
class Position:
    ticket: int
    symbol: str
    type: Literal["buy", "sell"]
    volume: float
    price_open: float
    price_current: float
    sl: float  # 0.0 = no stop-loss
    tp: float
    profit: float
    swap: float
    magic: int
    time: datetime  # UTC


@dataclass(frozen=True)
class EquityPoint:
    ts: datetime
    balance: float
    equity: float
    margin: float = 0.0
    margin_free: float = 0.0


class AccountSource(Protocol):
    """Read-only account data. Implementations must not expose order functions."""

    name: str

    def connect(self) -> None: ...
    def close(self) -> None: ...
    def account(self) -> AccountSnapshot: ...
    def positions(self) -> list[Position]: ...
    def deals(self, start: datetime, end: datetime) -> list[Deal]: ...
    def equity_history(self) -> list[EquityPoint]: ...
