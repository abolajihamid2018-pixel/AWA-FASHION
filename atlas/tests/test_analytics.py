from datetime import datetime, timedelta, timezone

import pandas as pd
import pytest

from atlas.analytics.account import (
    account_summary, attach_strategy, balance_curve, breakdown, performance_index, trades_from_deals,
)
from atlas.analytics.metrics import compute_metrics
from atlas.db.repo import Repository
from atlas.ingest import ingest, make_source
from atlas.settings import load_settings
from atlas.sources.base import Deal
from atlas.sources.mock import MockAccountSource

T0 = datetime(2025, 1, 1, tzinfo=timezone.utc)


def _deals_df(deals):
    return pd.DataFrame([{**d.__dict__, "time": pd.Timestamp(d.time)} for d in deals])


def _book():
    d = timedelta(days=1)
    return [
        Deal(1, 0, T0, "", "balance", "in", 0, 0, 1000.0),
        Deal(2, 1, T0 + d, "EURUSD", "buy", "in", 0.1, 1.1, 0.0, commission=-1.0, magic=1101),
        Deal(3, 1, T0 + 2 * d, "EURUSD", "sell", "out", 0.1, 1.11, 100.0, commission=-1.0, swap=-2.0, magic=1101),
        Deal(4, 2, T0 + 3 * d, "GBPUSD", "sell", "in", 0.1, 1.3, 0.0, commission=-1.0, magic=1202),
        Deal(5, 2, T0 + 4 * d, "GBPUSD", "buy", "out", 0.1, 1.305, -50.0, commission=-1.0, magic=1202),
        Deal(6, 0, T0 + 5 * d, "", "balance", "in", 0, 0, 500.0),     # deposit mid-way
        Deal(7, 3, T0 + 6 * d, "EURUSD", "buy", "in", 0.1, 1.1, 0.0, magic=1101),  # still open
    ]


def test_trades_grouping_and_hand_computed_metrics():
    deals = _deals_df(_book())
    t = trades_from_deals(deals)
    assert list(t["net"]) == [96.0, -52.0]
    assert list(t["direction"]) == ["long", "short"]
    m = compute_metrics(t, performance_index(deals), balance_curve(deals))
    assert m["trades"] == 2 and m["net_profit"] == 44.0
    assert m["profit_factor"] == pytest.approx(96 / 52, abs=1e-3)
    assert m["win_rate_pct"] == 50.0 and m["expectancy"] == 22.0
    assert m["transaction_costs"] == -6.0
    assert m["cagr_pct"] is None and m["sharpe"] is None  # too short to annualise
    assert m["warnings"]  # small-sample warning present


def test_performance_index_ignores_deposits():
    deals = _deals_df(_book())
    idx = performance_index(deals)
    # nets: -1 on 1000, +97 on 999, -1 on 1096, -51 on 1095; the deposit changes nothing
    expected = (1 - 1 / 1000) * (1 + 97 / 999) * (1 - 1 / 1096) * (1 - 51 / 1095)
    assert idx.iloc[-1] == pytest.approx(expected)
    m = compute_metrics(trades_from_deals(deals), idx, balance_curve(deals))
    assert m["max_drawdown_pct"] < 0


def test_breakdowns_use_magic_map(write_cfg):
    s = load_settings(write_cfg())
    t = attach_strategy(trades_from_deals(_deals_df(_book())), s.magic_map)
    assert set(t["strategy"]) == {"donchian", "ma_trend"} and set(t["timeframe"]) == {"H4", "D1"}
    b = breakdown(t, "symbol")
    assert dict(zip(b["symbol"], b["net"])) == {"EURUSD": 96.0, "GBPUSD": -52.0}


def test_summary_realised_unrealised():
    deals = _deals_df(_book())
    pos = pd.DataFrame([{"profit": 12.5, "swap": -0.5}])
    eq = pd.DataFrame([{"ts": pd.Timestamp(T0), "balance": 1544.0, "equity": 1556.0}])
    s = account_summary(deals, pos, eq)
    assert s["realized_pnl"] == 44.0 and s["unrealized_pnl"] == 12.0 and s["net_deposits"] == 1500.0


def test_mock_is_deterministic_and_labelled():
    a = MockAccountSource(["EURUSD", "GBPUSD"], [1101], seed=7, days=60, now=T0)
    b = MockAccountSource(["EURUSD", "GBPUSD"], [1101], seed=7, days=60, now=T0)
    a.connect(); b.connect()
    assert a.deals(T0 - timedelta(days=99), T0) == b.deals(T0 - timedelta(days=99), T0)
    assert a.account().account_key.startswith("mock:") and a.account().trade_mode == "mock"
    acct = a.account()
    assert acct.equity == pytest.approx(acct.balance + sum(p.profit + p.swap for p in a.positions()), abs=0.01)


def test_ingest_idempotent_and_reports_live_equity(write_cfg):
    s = load_settings(write_cfg())
    repo = Repository(s.paths.resolve("db_path"))
    r1 = ingest(make_source(s), repo)
    r2 = ingest(make_source(s), repo)
    assert r1.new_deals > 0 and r2.new_deals == 0
    key = r1.account_key
    assert key.startswith("mock:")
    eq = repo.equity_df(key)
    pos = repo.positions_df(key)
    last = eq.iloc[-1]
    assert last["equity"] == pytest.approx(last["balance"] + (pos["profit"] + pos["swap"]).sum(), abs=0.01)
    ro = Repository(s.paths.resolve("db_path"), read_only=True)
    with pytest.raises(Exception):
        ro.conn.execute("DELETE FROM deals")
