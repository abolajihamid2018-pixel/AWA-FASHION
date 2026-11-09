"""Performance metrics. Returns None (never a made-up number) when the sample
is too small for a metric to be meaningful."""
from __future__ import annotations

import math
from typing import Optional

import pandas as pd

MIN_DAYS_FOR_CAGR = 90
MIN_DAYS_FOR_SHARPE = 60
MIN_TRADES_FOR_CONFIDENCE = 100


def _r(x: Optional[float], n: int = 4) -> Optional[float]:
    return None if x is None or (isinstance(x, float) and math.isnan(x)) else round(float(x), n)


def compute_metrics(trades: pd.DataFrame, index: pd.Series, balance: pd.Series) -> dict:
    n = int(len(trades))
    net = trades["net"] if n else pd.Series(dtype=float)
    gross_profit = float(net[net > 0].sum())
    gross_loss = float(-net[net < 0].sum())
    net_profit = float(net.sum())
    costs = float((trades["commission"] + trades["swap"] + trades["fee"]).sum()) if n else 0.0

    max_dd_pct = float((index / index.cummax() - 1.0).min() * 100.0) if len(index) else None
    max_dd_ccy = float((balance.cummax() - balance).max()) if len(balance) else None

    cagr = sharpe = None
    if len(index) > 1:
        span_days = (index.index[-1] - index.index[0]).total_seconds() / 86400
        if span_days >= MIN_DAYS_FOR_CAGR and index.iloc[-1] > 0:
            cagr = (index.iloc[-1] ** (365.25 / span_days) - 1.0) * 100.0
        daily = index.resample("B").last().ffill().pct_change().dropna()
        if span_days >= MIN_DAYS_FOR_SHARPE and len(daily) > 1 and daily.std() > 0:
            sharpe = daily.mean() / daily.std() * math.sqrt(252)

    wins, losses = net[net > 0], net[net < 0]
    warnings = []
    if n < MIN_TRADES_FOR_CONFIDENCE:
        warnings.append(f"Only {n} closed trades (< {MIN_TRADES_FOR_CONFIDENCE}); statistics are unreliable.")

    return {
        "trades": n,
        "net_profit": _r(net_profit, 2),
        "gross_profit": _r(gross_profit, 2),
        "gross_loss": _r(gross_loss, 2),
        "profit_factor": _r(gross_profit / gross_loss, 3) if gross_loss > 0 else None,
        "win_rate_pct": _r(100.0 * len(wins) / n, 2) if n else None,
        "avg_win": _r(wins.mean(), 2) if len(wins) else None,
        "avg_loss": _r(losses.mean(), 2) if len(losses) else None,
        "expectancy": _r(net.mean(), 2) if n else None,
        "max_drawdown_pct": _r(max_dd_pct, 2),
        "max_drawdown_ccy": _r(max_dd_ccy, 2),
        "recovery_factor": _r(net_profit / max_dd_ccy, 3) if max_dd_ccy else None,
        "cagr_pct": _r(cagr, 2),
        "sharpe": _r(sharpe, 3),
        "transaction_costs": _r(costs, 2),
        "costs_pct_of_gross_profit": _r(100.0 * -costs / gross_profit, 2) if gross_profit > 0 else None,
        # Phase 2 adds a block-bootstrap estimator; not computed from account history.
        "risk_of_ruin_pct": None,
        "warnings": warnings,
    }
