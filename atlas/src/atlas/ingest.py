"""Pull read-only account data from a source into SQLite. Idempotent."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from .db.repo import Repository
from .settings import Settings
from .sources.base import AccountSource, EquityPoint

log = logging.getLogger("atlas.ingest")


@dataclass
class IngestResult:
    account_key: str
    new_deals: int
    positions: int
    equity_points: int


def make_source(settings: Settings, module: Optional[object] = None) -> AccountSource:
    if settings.data_source == "mock":
        from .sources.mock import MockAccountSource
        first_cost = settings.costs[settings.instruments[0]]
        return MockAccountSource(
            instruments=settings.instruments, magics=list(settings.magic_map) or [0],
            seed=settings.mock.seed, days=settings.mock.days,
            starting_balance=settings.mock.starting_balance,
            commission_per_lot_round_turn=first_cost.commission_per_lot_round_turn,
        )
    from .sources.mt5_readonly import MT5ReadOnlySource
    return MT5ReadOnlySource(settings.mt5, settings.environment, module=module)


def ingest(source: AccountSource, repo: Repository, lookback_days: int = 3650,
           now: Optional[datetime] = None) -> IngestResult:
    source.connect()
    try:
        acct = source.account()
        key = repo.upsert_account(acct)
        end = now or acct.ts
        new_deals = repo.insert_deals(key, source.deals(end - timedelta(days=lookback_days), end))
        n_pos = repo.replace_positions(key, source.positions(), acct.ts)
        n_eq = repo.insert_equity(key, source.equity_history())
        # The live snapshot always wins over any history point with the same timestamp.
        n_eq += repo.insert_equity(
            key, [EquityPoint(acct.ts, acct.balance, acct.equity, acct.margin, acct.margin_free)], replace=True)
        repo.audit("ingest", f"{key} new_deals={new_deals} positions={n_pos} equity_points={n_eq}")
        log.info("Ingested %s: %d new deals, %d positions, %d equity points", key, new_deals, n_pos, n_eq)
        return IngestResult(key, new_deals, n_pos, n_eq)
    finally:
        source.close()
