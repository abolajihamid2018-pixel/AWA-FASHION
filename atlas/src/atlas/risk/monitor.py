"""Risk-limit monitor. Evaluates equity snapshots against configured limits
and, when enforcing, engages the kill switch. It never releases it."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

import pandas as pd

from ..killswitch import KillState, KillSwitch
from ..settings import RiskLimits


@dataclass
class RiskReport:
    as_of: Optional[datetime]
    equity: Optional[float]
    daily_change_pct: Optional[float]
    drawdown_pct: Optional[float]
    limits: RiskLimits
    breaches: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.breaches


def evaluate(equity: pd.DataFrame, positions: pd.DataFrame, limits: RiskLimits) -> RiskReport:
    if equity.empty:
        return RiskReport(None, None, None, None, limits, warnings=["No equity snapshots yet."])
    eq = equity.sort_values("ts")
    last = eq.iloc[-1]
    now = last["ts"]
    day_start = now.normalize()  # UTC midnight
    before = eq[eq["ts"] < day_start]
    today = eq[eq["ts"] >= day_start]
    ref = before.iloc[-1]["equity"] if not before.empty else today.iloc[0]["equity"]
    daily = (last["equity"] / ref - 1.0) * 100.0 if ref > 0 else None
    peak = eq["equity"].max()
    dd = (last["equity"] / peak - 1.0) * 100.0 if peak > 0 else None

    rep = RiskReport(now.to_pydatetime(), float(last["equity"]),
                     None if daily is None else round(daily, 3), None if dd is None else round(dd, 3), limits)
    if daily is not None and daily <= -limits.max_daily_loss_pct:
        rep.breaches.append(f"Daily loss {daily:.2f}% breaches limit -{limits.max_daily_loss_pct}%")
    if dd is not None and dd <= -limits.max_drawdown_pct:
        rep.breaches.append(f"Drawdown {dd:.2f}% breaches limit -{limits.max_drawdown_pct}%")
    if not positions.empty:
        no_sl = positions[positions["sl"] == 0]
        for r in no_sl.itertuples(index=False):
            rep.warnings.append(f"Position {r.ticket} {r.symbol} has NO stop-loss")
    rep.warnings.append("Drawdown uses equity snapshots; deposits/withdrawals can distort it.")
    return rep


def enforce(report: RiskReport, kill: KillSwitch) -> KillState:
    if report.breaches:
        return kill.engage("; ".join(report.breaches), by="risk-monitor")
    return kill.status()
