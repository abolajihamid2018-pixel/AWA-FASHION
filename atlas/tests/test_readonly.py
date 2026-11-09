"""ATLAS Python must be unable to trade. These tests enforce that."""
import re
from collections import namedtuple
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

from atlas.settings import MT5Settings
from atlas.sources.base import EnvironmentMismatch, SourceError
from atlas.sources.mt5_readonly import ALLOWED_CALLS, MT5ReadOnlySource, ReadOnlyMT5

SRC = Path(__file__).resolve().parents[1] / "src"
TRADE_FUNCS = {"order_send", "order_check", "order_calc_margin", "order_calc_profit", "orders_get",
               "positions_close", "Buy", "Sell", "PositionClose"}

Acct = namedtuple("Acct", "login server currency balance equity margin margin_free leverage trade_mode margin_mode")
Pos = namedtuple("Pos", "ticket symbol type volume price_open price_current sl tp profit swap magic time")
DealT = namedtuple("DealT", "ticket position_id time symbol type entry volume price profit commission swap fee magic comment")


class FakeMT5:
    def __init__(self, trade_mode=0, margin_mode=2, fail_init=0, logged_in=True):
        self.trade_mode, self.margin_mode = trade_mode, margin_mode
        self.fail_init, self.logged_in = fail_init, logged_in
        self.init_kwargs, self.deal_bounds, self.shut = None, None, False
        self.order_send_called = False

    def initialize(self, **kw):
        self.init_kwargs = kw
        if self.fail_init:
            self.fail_init -= 1
            return False
        return True

    def shutdown(self): self.shut = True
    def last_error(self): return (1, "fake")
    def account_info(self):
        if not self.logged_in:
            return None
        return Acct(12345, "Broker-Demo", "USD", 1000.0, 990.0, 50.0, 940.0, 100, self.trade_mode, self.margin_mode)
    def positions_get(self):
        return [Pos(7, "EURUSD", 1, 0.1, 1.1, 1.09, 1.12, 0.0, 10.0, -0.5, 1101, 1_700_000_000)]
    def history_deals_get(self, a, b):
        self.deal_bounds = (a, b)
        return [DealT(1, 0, 1_700_000_000, "", 2, 0, 0, 0, 1000.0, 0, 0, 0, 0, "dep"),
                DealT(2, 9, 1_700_003_600, "EURUSD", 0, 0, 0.1, 1.1, 0.0, -0.35, 0, 0, 1101, ""),
                DealT(3, 9, 1_700_007_200, "EURUSD", 1, 1, 0.1, 1.101, 10.0, -0.35, 0, 0, 1101, "")]
    def order_send(self, *a, **k):
        self.order_send_called = True


CFG = MT5Settings(server_utc_offset_hours=2, connect_retries=3)


def test_whitelist_contains_no_trade_functions():
    assert not (ALLOWED_CALLS & TRADE_FUNCS)


@pytest.mark.parametrize("name", sorted(TRADE_FUNCS | {"order_send", "anything_else"}))
def test_proxy_blocks_non_whitelisted(name):
    fake = FakeMT5()
    with pytest.raises(PermissionError):
        getattr(ReadOnlyMT5(fake), name)
    assert not fake.order_send_called


@pytest.mark.parametrize("kw", [{"login": 1}, {"password": "x"}, {"server": "s"}])
def test_initialize_refuses_credentials(kw):
    with pytest.raises(PermissionError):
        ReadOnlyMT5(FakeMT5()).initialize(**kw)


def test_no_trade_calls_anywhere_in_source():
    pattern = re.compile(r"\.\s*(%s)\s*\(" % "|".join(sorted(TRADE_FUNCS)))
    offenders = [str(p) for p in SRC.rglob("*.py") if pattern.search(p.read_text(encoding="utf-8"))]
    assert offenders == []


def test_connect_without_credentials_and_maps_fields():
    fake = FakeMT5(margin_mode=0)
    src = MT5ReadOnlySource(CFG, "demo", module=fake)
    src.connect()
    assert set(fake.init_kwargs) <= {"timeout", "path"}
    a = src.account()
    assert a.trade_mode == "demo" and a.margin_mode == "netting" and a.account_key == "mt5:Broker-Demo:12345"
    p = src.positions()[0]
    assert p.type == "sell" and p.time == datetime.fromtimestamp(1_700_000_000, timezone.utc) - timedelta(hours=2)
    deals = src.deals(datetime(2023, 1, 1, tzinfo=timezone.utc), datetime(2024, 1, 1, tzinfo=timezone.utc))
    assert [d.type for d in deals] == ["balance", "buy", "sell"] and deals[2].entry == "out"
    assert fake.deal_bounds[0] == datetime(2023, 1, 1, 2, tzinfo=timezone.utc)  # converted to server time
    src.close()
    assert fake.shut


def test_real_account_refused():
    fake = FakeMT5(trade_mode=2)
    with pytest.raises(EnvironmentMismatch, match="REAL"):
        MT5ReadOnlySource(CFG, "demo", module=fake).connect()
    assert fake.shut


def test_contest_account_refused_in_demo_env():
    with pytest.raises(EnvironmentMismatch):
        MT5ReadOnlySource(CFG, "demo", module=FakeMT5(trade_mode=1)).connect()


def test_not_logged_in():
    with pytest.raises(SourceError, match="no account"):
        MT5ReadOnlySource(CFG, "demo", module=FakeMT5(logged_in=False)).connect()


def test_retry_then_success(monkeypatch):
    monkeypatch.setattr("atlas.sources.mt5_readonly.time.sleep", lambda s: None)
    src = MT5ReadOnlySource(CFG, "demo", module=FakeMT5(fail_init=2))
    src.connect()


def test_retry_exhausted(monkeypatch):
    monkeypatch.setattr("atlas.sources.mt5_readonly.time.sleep", lambda s: None)
    with pytest.raises(SourceError, match="Could not attach"):
        MT5ReadOnlySource(CFG, "demo", module=FakeMT5(fail_init=5)).connect()


def test_utc_offset_must_be_explicit():
    with pytest.raises(SourceError, match="server_utc_offset_hours"):
        MT5ReadOnlySource(MT5Settings(), "demo", module=FakeMT5())
