"""ATLAS dashboard. Reads SQLite in read-only mode. The only action it can take
is ENGAGING the kill switch; it cannot place, modify or close orders, and it
cannot release the kill switch (that is CLI-only, with confirmation)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import pandas as pd
import streamlit as st

from atlas.analytics.account import (
    account_summary, attach_strategy, balance_curve, breakdown, drawdown, performance_index, trades_from_deals,
)
from atlas.analytics.metrics import compute_metrics
from atlas.db.repo import Repository
from atlas.killswitch import KillSwitch
from atlas.risk.monitor import evaluate
from atlas.settings import load_settings

st.set_page_config(page_title="ATLAS 2.0", layout="wide")
settings = load_settings()
db_path = settings.paths.resolve("db_path")
kill = KillSwitch(settings.paths.resolve("kill_switch_dir"))

st.title("ATLAS 2.0 — Account Analytics")
st.caption(f"Environment: **{settings.environment}** · data source: **{settings.data_source}** · "
           "live trading: **DISABLED** · read-only")

if not db_path.exists():
    st.warning("No database yet. Run `python -m atlas ingest` first.")
    st.stop()


@st.cache_data(ttl=30)
def load(key: str):
    repo = Repository(db_path, read_only=True)
    try:
        return repo.deals_df(key), repo.positions_df(key), repo.equity_df(key)
    finally:
        repo.close()


repo = Repository(db_path, read_only=True)
accounts = repo.accounts()
repo.close()
if accounts.empty:
    st.warning("Database has no accounts. Run `python -m atlas ingest`.")
    st.stop()

key = st.sidebar.selectbox("Account", list(accounts["account_key"]))
acct = accounts[accounts["account_key"] == key].iloc[0]
is_mock = key.startswith("mock:")
if is_mock:
    st.error("MOCK DATA — synthetic random trades for software testing. Not a strategy; not evidence of performance.")
if settings.cost_assumptions_in_use:
    st.info("Cost settings for " + ", ".join(settings.cost_assumptions_in_use)
            + " are ASSUMPTIONS (no broker selected).")

deals, positions, equity = load(key)
trades = attach_strategy(trades_from_deals(deals), settings.magic_map)
idx = performance_index(deals)
bal = balance_curve(deals)
summary = account_summary(deals, positions, equity)
metrics = compute_metrics(trades, idx, bal)
risk = evaluate(equity, positions, settings.risk)
ks = kill.status()


def downsample(s: pd.Series, n: int = 5000) -> pd.Series:
    return s if len(s) <= n else s.iloc[:: max(1, len(s) // n)]


ccy = acct["currency"]
r1, r2 = st.columns(3), st.columns(3)
r1[0].metric(f"Balance ({ccy})", f"{summary['balance']:,.2f}")
r1[1].metric(f"Equity ({ccy})", f"{summary['equity']:,.2f}")
r1[2].metric("Kill switch", "ENGAGED" if ks.engaged else "off")
r2[0].metric("Realised P&L", f"{summary['realized_pnl']:,.2f}")
r2[1].metric("Unrealised P&L", f"{summary['unrealized_pnl']:,.2f}")
r2[2].metric("Current drawdown", f"{risk.drawdown_pct if risk.drawdown_pct is not None else 0:.2f}%")
st.caption(f"Account type: trade mode **{acct['trade_mode']}**, margin mode **{acct['margin_mode']}** "
           f"(read from source, not assumed) · as of {summary['as_of']}")

tabs = st.tabs(["Equity & Drawdown", "Positions", "History", "Strategies", "Instruments & Timeframes", "Risk"])

with tabs[0]:
    if not equity.empty:
        eq = equity.set_index("ts")[["balance", "equity"]]
        st.subheader("Balance and equity (snapshots)")
        if is_mock:
            st.caption("Mock history snapshots are end-of-day realised balance only.")
        st.line_chart(downsample(eq))
    st.subheader("Growth index (deposit-neutral) and drawdown %")
    col1, col2 = st.columns(2)
    col1.line_chart(downsample(idx))
    col2.area_chart(downsample(drawdown(idx)), color="#E5534B")

with tabs[1]:
    if positions.empty:
        st.write("No open positions.")
    else:
        view = positions[["ticket", "symbol", "type", "volume", "price_open", "price_current",
                          "sl", "tp", "profit", "swap", "magic", "time"]].copy()
        view["stop_loss_set"] = view["sl"] != 0
        st.dataframe(view, hide_index=True)

with tabs[2]:
    st.dataframe(trades.sort_values("close_time", ascending=False), hide_index=True)
    with st.expander("Raw deals"):
        st.dataframe(deals.drop(columns=["account_key"]), hide_index=True)

with tabs[3]:
    st.subheader("Performance by strategy (from magic-number map)")
    st.dataframe(breakdown(trades, "strategy"), hide_index=True)

with tabs[4]:
    a, b = st.columns(2)
    a.subheader("By instrument")
    a.dataframe(breakdown(trades, "symbol"), hide_index=True)
    b.subheader("By timeframe")
    b.dataframe(breakdown(trades, "timeframe"), hide_index=True)

with tabs[5]:
    st.subheader("Risk metrics")
    show = {k: v for k, v in metrics.items() if k != "warnings"}
    st.dataframe(pd.DataFrame({"metric": list(show), "value": [str(v) for v in show.values()]}), hide_index=True)
    st.caption("risk_of_ruin_pct is computed by the Phase 2 research engine (bootstrap), not from account history.")
    for w in metrics["warnings"] + risk.warnings:
        st.warning(w)
    st.subheader("Demo limits (not permission for live trading)")
    lim = settings.risk
    st.write(f"Risk per trade ≤ {lim.risk_per_trade_pct}% · daily loss ≤ {lim.max_daily_loss_pct}% · "
             f"max drawdown ≤ {lim.max_drawdown_pct}%")
    st.write(f"Today: {risk.daily_change_pct}% · drawdown from peak: {risk.drawdown_pct}%")
    for b_ in risk.breaches:
        st.error(b_)

    st.subheader("Kill switch")
    if ks.engaged:
        st.error(f"ENGAGED by {ks.by} at {ks.at}: {ks.reason}")
        st.caption("Release from the command line only: `python -m atlas kill release --confirm RELEASE`")
    else:
        confirm = st.checkbox("I want to halt all ATLAS trading activity")
        if st.button("ENGAGE KILL SWITCH", type="primary", disabled=not confirm):
            kill.engage("dashboard button", by="dashboard")
            st.rerun()
