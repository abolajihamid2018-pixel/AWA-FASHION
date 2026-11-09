"""Account analytics built from deals. Works for hedging and netting accounts.

Notes on netting accounts: MT5 keeps one position_id per symbol and a
reversal is a single 'inout' deal. Grouping by position_id therefore yields
one long-lived "trade" per netting position. Realised P&L totals are exact in
both modes; per-trade statistics on netting accounts are approximate.
"""
from __future__ import annotations

from typing import Mapping

import numpy as np
import pandas as pd

TRADING_TYPES = ("buy", "sell")
CLOSING_ENTRIES = ("out", "inout", "out_by")
CASH_TYPES = ("balance", "credit", "bonus", "correction", "charge")


def _net(df: pd.DataFrame) -> pd.Series:
    return df["profit"] + df["commission"] + df["swap"] + df["fee"]


def trades_from_deals(deals: pd.DataFrame) -> pd.DataFrame:
    cols = ["position_id", "symbol", "direction", "magic", "open_time", "close_time",
            "volume", "gross", "commission", "swap", "fee", "net"]
    d = deals[deals["type"].isin(TRADING_TYPES)].copy()
    if d.empty:
        return pd.DataFrame(columns=cols)
    d["net"] = _net(d)
    rows = []
    for pid, g in d.groupby("position_id", sort=False):
        if not g["entry"].isin(CLOSING_ENTRIES).any():
            continue  # still open
        ins = g[g["entry"] == "in"]
        first = ins.iloc[0] if not ins.empty else g.iloc[0]
        rows.append({
            "position_id": int(pid), "symbol": first["symbol"],
            "direction": "long" if first["type"] == "buy" else "short",
            "magic": int(first["magic"]), "open_time": g["time"].min(), "close_time": g["time"].max(),
            "volume": float(ins["volume"].sum()) if not ins.empty else float(first["volume"]),
            "gross": float(g["profit"].sum()), "commission": float(g["commission"].sum()),
            "swap": float(g["swap"].sum()), "fee": float(g["fee"].sum()), "net": float(g["net"].sum()),
        })
    return pd.DataFrame(rows, columns=cols).sort_values("close_time").reset_index(drop=True)


def performance_index(deals: pd.DataFrame) -> pd.Series:
    """Deposit/withdrawal-neutral growth index (starts at 1.0).

    Each trading deal's net P&L is converted to a return on the balance just
    before it; cash movements change the balance but not the index.
    """
    if deals.empty:
        return pd.Series(dtype=float)
    balance, idx = 0.0, 1.0
    times, values = [], []
    for row in deals.sort_values(["time", "ticket"]).itertuples(index=False):
        net = row.profit + row.commission + row.swap + row.fee
        if row.type in TRADING_TYPES:
            if balance > 0:
                idx *= 1.0 + net / balance
            balance += net
        else:
            balance += net
        times.append(row.time)
        values.append(idx)
    s = pd.Series(values, index=pd.DatetimeIndex(times), name="index")
    return s[~s.index.duplicated(keep="last")]


def balance_curve(deals: pd.DataFrame) -> pd.Series:
    if deals.empty:
        return pd.Series(dtype=float)
    d = deals.sort_values(["time", "ticket"])
    s = pd.Series(_net(d).cumsum().to_numpy(), index=pd.DatetimeIndex(d["time"]), name="balance")
    return s[~s.index.duplicated(keep="last")]


def drawdown(series: pd.Series) -> pd.Series:
    if series.empty:
        return series
    peak = series.cummax()
    return (series / peak - 1.0).fillna(0.0) * 100.0


def account_summary(deals: pd.DataFrame, positions: pd.DataFrame, equity: pd.DataFrame) -> dict:
    trading = deals[deals["type"].isin(TRADING_TYPES)]
    cash = deals[deals["type"].isin(CASH_TYPES)]
    latest = equity.iloc[-1] if not equity.empty else None
    unreal = float((positions["profit"] + positions["swap"]).sum()) if not positions.empty else 0.0
    out = {
        "balance": float(latest["balance"]) if latest is not None else float(_net(deals).sum()),
        "equity": float(latest["equity"]) if latest is not None else float(_net(deals).sum()) + unreal,
        "realized_pnl": float(_net(trading).sum()),
        "unrealized_pnl": unreal,
        "net_deposits": float(_net(cash).sum()),
        "transaction_costs": float((trading["commission"] + trading["swap"] + trading["fee"]).sum()),
        "open_positions": int(len(positions)),
        "as_of": latest["ts"] if latest is not None else None,
    }
    return {k: round(v, 2) if isinstance(v, float) else v for k, v in out.items()}


def attach_strategy(trades: pd.DataFrame, magic_map: Mapping[int, object]) -> pd.DataFrame:
    t = trades.copy()
    t["strategy"] = [getattr(magic_map.get(m), "strategy", "unmapped") for m in t["magic"]]
    t["timeframe"] = [getattr(magic_map.get(m), "timeframe", "unmapped") for m in t["magic"]]
    return t


def breakdown(trades: pd.DataFrame, by: str) -> pd.DataFrame:
    if trades.empty:
        return pd.DataFrame(columns=[by, "trades", "net", "win_rate_pct", "profit_factor", "expectancy"])

    def _agg(g: pd.DataFrame) -> pd.Series:
        wins, losses = g.loc[g["net"] > 0, "net"].sum(), -g.loc[g["net"] < 0, "net"].sum()
        return pd.Series({
            "trades": len(g), "net": round(g["net"].sum(), 2),
            "win_rate_pct": round(100.0 * (g["net"] > 0).mean(), 1),
            "profit_factor": round(wins / losses, 2) if losses > 0 else np.nan,
            "expectancy": round(g["net"].mean(), 2),
        })

    rows = [{by: key, **_agg(g).to_dict()} for key, g in trades.groupby(by)]
    return pd.DataFrame(rows).sort_values("net", ascending=False).reset_index(drop=True)
