# ATLAS decisions log

## 2026-11-09 — Owner decisions before Phase 1

| # | Topic | Decision | How it is implemented |
|---|---|---|---|
| 1 | Repository | Keep under `atlas/` temporarily, fully isolated from the AWA Fashion site; separate repo recommended before production | No website file or deployment config changed; `test_isolation.py` checks `vercel.json` builds only `index.html`; local artefacts git-ignored |
| 2 | Broker / account | None selected. Broker-independent; do not assume hedging or netting | `margin_mode` read from the account (`unknown` in mock); analytics work from deals, valid in both modes; server UTC offset must be set explicitly |
| 3 | Instruments / timeframes | EURUSD, GBPUSD on H4 and D1; XAUUSD later | `config/base.yaml` |
| 4 | Costs | Unknown until a broker is selected; configurable, conservative, labelled | Per-symbol cost block with `is_assumption: true`, surfaced in reports and dashboard |
| 5 | Demo risk limits | 0.25% per trade, 2% daily loss, 10% max drawdown; not permission for live; independent kill switch | `RiskLimits` with hard ceilings; `risk-check --enforce`; file-based kill switch |
| 6 | Windows / Python | Do not assume versions; inspect first; avoid heavy deps | `tools/inspect_windows.ps1` + `atlas env-report`; code supports Python 3.10+; core deps: numpy, pandas, pydantic, PyYAML |
| 7 | Access | No credentials, no account; mock data only | Mock source; credential keys rejected; ATLAS never passes login/password to MT5 |

## Open items / blockers

* **Windows environment not yet inspected.** This build session had no access
  to the owner's PC. Waiting on the output of `tools/inspect_windows.ps1`.
* **No historical market data yet.** With no MT5 terminal, the Phase 2 research
  engine needs another source of EURUSD/GBPUSD H4/D1 history (e.g. an MT5
  demo from any broker, used read-only for data only, or CSV files the owner
  supplies). To decide before Phase 2.
