"""Deterministic MOCK account for building and testing without a broker.

The trades are random entries on a random-walk price with costs applied.
They are NOT a strategy and carry no information about real performance.
Every record is tagged source="mock" and server="MOCK-SERVER".
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Iterable, Optional

import numpy as np

from .base import AccountSnapshot, Deal, EquityPoint, Position

_START_PRICE = {"EURUSD": 1.0800, "GBPUSD": 1.2700, "XAUUSD": 2000.0}
_DAILY_VOL = {"EURUSD": 0.0060, "GBPUSD": 0.0075, "XAUUSD": 20.0}
CONTRACT_SIZE = 100_000  # FX standard lot; USD-quoted pairs => P&L already in USD


class MockAccountSource:
    name = "mock"

    def __init__(
        self,
        instruments: Iterable[str],
        magics: Iterable[int],
        seed: int = 42,
        days: int = 365,
        starting_balance: float = 10_000.0,
        commission_per_lot_round_turn: float = 7.0,
        now: Optional[datetime] = None,
    ) -> None:
        self.instruments = [s for s in instruments]
        self.magics = list(magics) or [0]
        self.seed = seed
        self.days = days
        self.starting_balance = starting_balance
        self.commission_side = commission_per_lot_round_turn / 2.0
        end = (now or datetime.now(timezone.utc)).replace(minute=0, second=0, microsecond=0)
        self.end = end
        self.start = end - timedelta(days=days)
        self._deals: list[Deal] = []
        self._positions: list[Position] = []
        self._equity: list[EquityPoint] = []
        self._balance = starting_balance
        self._built = False

    # -- AccountSource ---------------------------------------------------
    def connect(self) -> None:
        if not self._built:
            self._build()

    def close(self) -> None:
        pass

    def account(self) -> AccountSnapshot:
        self.connect()
        floating = sum(p.profit + p.swap for p in self._positions)
        equity = self._balance + floating
        margin = sum(p.volume * CONTRACT_SIZE * p.price_current / 100 for p in self._positions)
        return AccountSnapshot(
            source="mock", login=0, server="MOCK-SERVER", currency="USD",
            balance=round(self._balance, 2), equity=round(equity, 2),
            margin=round(margin, 2), margin_free=round(equity - margin, 2),
            leverage=100, trade_mode="mock", margin_mode="unknown", ts=self.end,
        )

    def positions(self) -> list[Position]:
        self.connect()
        return list(self._positions)

    def deals(self, start: datetime, end: datetime) -> list[Deal]:
        self.connect()
        return [d for d in self._deals if start <= d.time <= end]

    def equity_history(self) -> list[EquityPoint]:
        self.connect()
        return list(self._equity)

    # -- generation ------------------------------------------------------
    def _build(self) -> None:
        rng = np.random.default_rng(self.seed)
        hours = self.days * 24
        paths = {}
        for sym in self.instruments:
            vol_h = _DAILY_VOL.get(sym, 0.006) / np.sqrt(24)
            steps = rng.normal(0.0, vol_h, hours)
            paths[sym] = _START_PRICE.get(sym, 1.0) + np.cumsum(steps)  # additive random walk

        ticket = 1
        self._deals.append(Deal(ticket, 0, self.start, "", "balance", "in", 0.0, 0.0,
                                self.starting_balance, comment="MOCK deposit"))
        ticket += 1

        # Daily balance snapshots (realised only; labelled as such in the UI).
        realised_by_hour = np.zeros(hours)
        h = 0
        pos_id = 1000
        while h < hours - 48:
            h += int(rng.integers(8, 60))
            if h >= hours - 48:
                break
            sym = self.instruments[int(rng.integers(len(self.instruments)))]
            magic = self.magics[int(rng.integers(len(self.magics)))]
            direction = 1 if rng.random() < 0.5 else -1
            hold = int(rng.integers(4, 120))
            exit_h = min(h + hold, hours - 1)
            vol = 0.10
            p_in, p_out = float(paths[sym][h]), float(paths[sym][exit_h])
            spread = 0.00015
            p_in += direction * spread / 2
            p_out -= direction * spread / 2
            gross = round(direction * (p_out - p_in) * vol * CONTRACT_SIZE, 2)
            nights = hold // 24
            swap = round(-1.0 * nights, 2)  # pessimistic, both directions
            comm = round(-self.commission_side * vol, 2)
            t_in = self.start + timedelta(hours=h)
            t_out = self.start + timedelta(hours=exit_h)
            side_in = "buy" if direction == 1 else "sell"
            side_out = "sell" if direction == 1 else "buy"
            self._deals.append(Deal(ticket, pos_id, t_in, sym, side_in, "in", vol, round(p_in, 5), 0.0,
                                    commission=comm, magic=magic, comment="MOCK"))
            ticket += 1
            self._deals.append(Deal(ticket, pos_id, t_out, sym, side_out, "out", vol, round(p_out, 5), gross,
                                    commission=comm, swap=swap, magic=magic, comment="MOCK"))
            ticket += 1
            realised_by_hour[exit_h] += gross + 2 * comm + swap
            pos_id += 1

        cum = self.starting_balance + np.cumsum(realised_by_hour)
        for d in range(1, self.days):  # strictly before 'now'; live snapshot added by ingest
            idx = min(d * 24 - 1, hours - 1)
            bal = float(cum[idx])
            self._equity.append(EquityPoint(self.start + timedelta(hours=idx + 1), round(bal, 2), round(bal, 2)))
        self._balance = float(sum(d.net for d in self._deals))

        # Two open positions; the second has NO stop-loss on purpose so the
        # risk monitor's "missing SL" check has something to flag in mock mode.
        for i, sym in enumerate(self.instruments[:2]):
            direction = 1 if i == 0 else -1
            p_open = float(paths[sym][hours - 30])
            p_now = float(paths[sym][hours - 1])
            profit = round(direction * (p_now - p_open) * 0.10 * CONTRACT_SIZE, 2)
            sl = round(p_open - direction * 0.0050, 5) if i == 0 else 0.0
            self._positions.append(Position(
                ticket=pos_id + i, symbol=sym, type="buy" if direction == 1 else "sell", volume=0.10,
                price_open=round(p_open, 5), price_current=round(p_now, 5), sl=sl, tp=0.0,
                profit=profit, swap=-1.0, magic=self.magics[i % len(self.magics)],
                time=self.start + timedelta(hours=hours - 30),
            ))
        self._built = True
