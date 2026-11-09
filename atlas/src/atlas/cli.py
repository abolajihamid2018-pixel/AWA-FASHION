"""ATLAS command line (read-only in Phase 1).

  python -m atlas env-report            inspect this machine (no changes)
  python -m atlas ingest                pull account data from the configured source
  python -m atlas report                print account summary + metrics
  python -m atlas risk-check [--enforce]
  python -m atlas kill status|engage|release
  python -m atlas dashboard             start the local dashboard (127.0.0.1)
"""
from __future__ import annotations

import argparse
import json
import sys
from typing import Optional

from .settings import load_settings


def _repo(settings, read_only: bool = False):
    from .db.repo import Repository
    return Repository(settings.paths.resolve("db_path"), read_only=read_only)


def _account_key(repo, wanted: Optional[str]) -> str:
    accts = repo.accounts()
    if accts.empty:
        raise SystemExit("No accounts in the database. Run: python -m atlas ingest")
    if wanted:
        if wanted not in set(accts["account_key"]):
            raise SystemExit(f"Unknown account '{wanted}'. Known: {list(accts['account_key'])}")
        return wanted
    return str(accts.iloc[0]["account_key"])


def cmd_env_report(args, settings) -> int:
    from .envreport import collect, format_report
    print(format_report(collect()))
    return 0


def cmd_ingest(args, settings) -> int:
    from .ingest import ingest, make_source
    repo = _repo(settings)
    res = ingest(make_source(settings), repo, lookback_days=args.lookback_days)
    print(f"Ingested {res.account_key}: {res.new_deals} new deals, {res.positions} open positions, "
          f"{res.equity_points} equity points")
    if settings.data_source == "mock":
        print("NOTE: MOCK DATA - synthetic, not a strategy, not evidence of anything.")
    return 0


def cmd_report(args, settings) -> int:
    from .analytics.account import account_summary, balance_curve, performance_index, trades_from_deals
    from .analytics.metrics import compute_metrics
    repo = _repo(settings, read_only=True)
    key = _account_key(repo, args.account)
    deals, pos, eq = repo.deals_df(key), repo.positions_df(key), repo.equity_df(key)
    trades = trades_from_deals(deals)
    out = {
        "account": key,
        "mock_data": key.startswith("mock:"),
        "summary": account_summary(deals, pos, eq),
        "metrics": compute_metrics(trades, performance_index(deals), balance_curve(deals)),
        "cost_assumptions_unverified": settings.cost_assumptions_in_use,
    }
    print(json.dumps(out, indent=2, default=str))
    return 0


def cmd_risk_check(args, settings) -> int:
    from .killswitch import KillSwitch
    from .risk.monitor import enforce, evaluate
    repo = _repo(settings, read_only=not args.enforce)
    key = _account_key(repo, args.account)
    rep = evaluate(repo.equity_df(key), repo.positions_df(key), settings.risk)
    print(f"Account {key} as of {rep.as_of}: equity={rep.equity} daily={rep.daily_change_pct}% "
          f"drawdown={rep.drawdown_pct}%")
    for b in rep.breaches:
        print(f"BREACH: {b}")
    for w in rep.warnings:
        print(f"warning: {w}")
    if args.enforce:
        state = enforce(rep, KillSwitch(settings.paths.resolve("kill_switch_dir")))
        if rep.breaches:
            repo.audit("risk_breach", "; ".join(rep.breaches))
        print(f"Kill switch engaged: {state.engaged} {state.reason}")
    return 1 if rep.breaches else 0


def cmd_kill(args, settings) -> int:
    from .killswitch import KillSwitch
    ks = KillSwitch(settings.paths.resolve("kill_switch_dir"))
    if args.action == "engage":
        st = ks.engage(args.reason or "manual", by="cli")
    elif args.action == "release":
        st = ks.release(args.confirm or "")
    else:
        st = ks.status()
    print(json.dumps(st.__dict__, indent=2))
    return 0


def cmd_dashboard(args, settings) -> int:
    """Start Streamlit bound to localhost with the ATLAS config, whatever the cwd."""
    import os
    import subprocess
    from pathlib import Path
    from .settings import ATLAS_ROOT
    dash = ATLAS_ROOT / "dashboard"
    env = dict(os.environ)
    if args.config:  # the dashboard must show the same environment as the CLI
        env["ATLAS_CONFIG"] = str(Path(args.config).resolve())
    return subprocess.call(
        [sys.executable, "-m", "streamlit", "run", str(dash / "app.py"),
         "--server.address", "127.0.0.1", "--server.port", str(args.port),
         "--browser.gatherUsageStats", "false", "--client.toolbarMode", "viewer"],
        cwd=dash,  # so dashboard/.streamlit/config.toml (dark theme) is used
        env=env,
    )


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(prog="atlas", description="ATLAS 2.0 (Phase 1, read-only)")
    p.add_argument("--config", help="path to YAML config (default: config/base.yaml)")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("env-report")
    i = sub.add_parser("ingest")
    i.add_argument("--lookback-days", type=int, default=3650)
    r = sub.add_parser("report")
    r.add_argument("--account")
    rc = sub.add_parser("risk-check")
    rc.add_argument("--account")
    rc.add_argument("--enforce", action="store_true", help="engage kill switch on breach")
    k = sub.add_parser("kill")
    k.add_argument("action", choices=["status", "engage", "release"])
    k.add_argument("--reason")
    k.add_argument("--confirm", help="must be exactly RELEASE to release")
    d = sub.add_parser("dashboard", help="start the local dashboard (127.0.0.1 only)")
    d.add_argument("--port", type=int, default=8501)
    args = p.parse_args(argv)

    if args.cmd == "env-report":
        return cmd_env_report(args, None)
    settings = load_settings(args.config)
    from .logging_setup import setup_logging
    setup_logging(settings.paths.resolve("log_dir"))
    return {"ingest": cmd_ingest, "report": cmd_report, "risk-check": cmd_risk_check,
            "kill": cmd_kill, "dashboard": cmd_dashboard}[args.cmd](args, settings)


if __name__ == "__main__":
    sys.exit(main())
