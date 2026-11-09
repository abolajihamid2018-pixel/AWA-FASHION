from datetime import datetime, timedelta, timezone

import pandas as pd
import pytest

from atlas.killswitch import KillSwitch
from atlas.logging_setup import redact
from atlas.risk.monitor import enforce, evaluate
from atlas.settings import RiskLimits

LIM = RiskLimits()  # 0.25 / 2 / 10


def _eq(points):
    t0 = datetime(2026, 3, 1, tzinfo=timezone.utc)
    return pd.DataFrame([{"ts": pd.Timestamp(t0 + timedelta(hours=h)), "balance": e, "equity": e}
                         for h, e in points])


NO_POS = pd.DataFrame(columns=["ticket", "symbol", "sl"])


def test_within_limits():
    rep = evaluate(_eq([(0, 10000), (20, 10050), (30, 9900)]), NO_POS, LIM)
    assert rep.ok


def test_daily_loss_breach_engages_kill(tmp_path):
    rep = evaluate(_eq([(20, 10000), (30, 9790)]), NO_POS, LIM)  # -2.1% vs prior-day close
    assert any("Daily loss" in b for b in rep.breaches)
    ks = KillSwitch(tmp_path)
    assert enforce(rep, ks).engaged and ks.status().by == "risk-monitor"


def test_drawdown_breach():
    rep = evaluate(_eq([(0, 10000), (5, 11000), (30, 9890), (50, 9880)]), NO_POS, LIM)
    assert any("Drawdown" in b for b in rep.breaches)


def test_missing_stop_loss_flagged():
    pos = pd.DataFrame([{"ticket": 1, "symbol": "EURUSD", "sl": 0.0}])
    rep = evaluate(_eq([(0, 10000)]), pos, LIM)
    assert any("NO stop-loss" in w for w in rep.warnings)


def test_kill_switch_cycle(tmp_path):
    ks = KillSwitch(tmp_path)
    assert not ks.status().engaged
    ks.engage("first", by="cli")
    ks.engage("second", by="cli")
    assert ks.status().reason == "first"  # original reason kept
    with pytest.raises(PermissionError):
        ks.release("yes")
    assert ks.status().engaged
    assert not ks.release("RELEASE").engaged


def test_enforce_never_releases(tmp_path):
    ks = KillSwitch(tmp_path)
    ks.engage("manual")
    assert enforce(evaluate(_eq([(0, 10000)]), NO_POS, LIM), ks).engaged


def test_corrupt_flag_fails_safe(tmp_path):
    ks = KillSwitch(tmp_path)
    ks.flag.write_text("{not json", encoding="utf-8")
    assert ks.status().engaged


@pytest.mark.parametrize("text", ["password=hunter2", "PASSWORD: hunter2", "token hunter2",
                                  "api_key='hunter2'", "connect secret=hunter2 ok"])
def test_redaction(text):
    out = redact(text)
    assert "hunter2" not in out and "REDACTED" in out
