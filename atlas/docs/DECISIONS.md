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

## 2026-11-09 — MT5 demo account available

* Owner installed MT5 and is logged in to **MetaQuotes-Demo**, a **demo**
  account with **hedging**. Algo Trading is off.
* Server clock observed 2 h ahead of UTC → `server_utc_offset_hours: 2`
  (expected +3 in summer). On connect ATLAS checks this against the latest tick
  and refuses to run if the offset is clearly too small.
* MetaQuotes-Demo showed zero spread on EURUSD/GBPUSD. That is not
  representative of real costs, so the conservative estimates stay.
* The account number is not stored in config; it only appears in the local,
  git-ignored database.

## Open items / blockers

* **Windows environment not yet inspected.** This build session had no access
  to the owner's PC. Waiting on the output of `tools/inspect_windows.ps1`.
* **Historical data source for Phase 2:** the MetaQuotes-Demo terminal can
  supply EURUSD/GBPUSD H4/D1 history read-only. Its history is a test-server
  feed, not a broker's, so results will be labelled with that source.
