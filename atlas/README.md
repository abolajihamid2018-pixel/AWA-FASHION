# ATLAS 2.0 — Phase 1 (read-only account analytics)

Status: **read-only. Cannot place orders. Live trading is disabled and cannot
be enabled by configuration in this build.** Currently runs on **mock data**
only, because no broker or MT5 account has been selected yet.

> ATLAS lives temporarily inside the AWA Fashion repository. It is fully
> isolated: it touches no website file, the site's `vercel.json` builds only
> `index.html`, and a test checks that stays true. Move ATLAS to its own
> private repository before any production use.

## What works now

| Feature | Command |
|---|---|
| Environment inspection (read-only) | `python -m atlas env-report` or `tools/inspect_windows.ps1` |
| Ingest account data (mock now, MT5 later) | `python -m atlas ingest` |
| Summary + metrics as JSON | `python -m atlas report` |
| Risk-limit check (optionally engage kill switch) | `python -m atlas risk-check [--enforce]` |
| Kill switch | `python -m atlas kill status` / `engage --reason "…"` / `release --confirm RELEASE` |
| Dark dashboard on 127.0.0.1 | `python -m atlas dashboard` |

## Setup on Windows (when you are ready — nothing is required yet)

1. Run the inspection script first and share the output:

   ```powershell
   powershell -ExecutionPolicy Bypass -File atlas\tools\inspect_windows.ps1
   ```

2. Requirements: 64-bit Python 3.10 or newer. Core dependencies are only
   numpy, pandas, pydantic and PyYAML; the dashboard adds streamlit.

   ```powershell
   cd atlas
   python -m venv .venv
   .venv\Scripts\activate
   pip install -e ".[dashboard,dev]"
   python -m pytest -q
   python -m atlas ingest
   python -m atlas dashboard
   ```

   `MetaTrader5` is **not** installed in mock mode. It is added later with
   `pip install -e ".[mt5]"` once a demo account exists.

## Safety properties (each covered by tests in `tests/`)

* **No order path.** MT5 is reached only through `ReadOnlyMT5`, which exposes a
  whitelist of read functions; a static test fails if any trade function is
  called anywhere in `src/`.
* **No credentials.** ATLAS never logs in. It attaches to a terminal you logged
  in to yourself. The config loader rejects any password/secret/token key,
  and logs pass through a redaction filter.
* **Environment separation.** `mock` data and `demo` data use different account
  keys and can never be combined; a REAL account is refused on connect; `live`
  is not an accepted environment.
* **Risk limits (demo testing limits, not permission for live trading):**
  0.25% per trade, 2% daily loss, 10% max drawdown, with hard ceilings in code
  so a typo cannot raise them.
* **Independent kill switch.** A plain flag file (`runtime/ATLAS_KILL`) that
  works without Python, the database or the dashboard. Automatic triggers can
  only engage it; release needs `--confirm RELEASE` on the command line. An
  unreadable flag counts as engaged. The future EA will check the same file.
* **Local only.** Dashboard binds to 127.0.0.1; database, logs and runtime
  files are git-ignored.

## Labelled assumptions

* Transaction costs in `config/base.yaml` are **conservative estimates** (no
  broker selected) and are flagged `is_assumption: true`; the dashboard and
  reports display that flag.
* Mock data is random entries on a random-walk price with those costs applied.
  It is **not** a strategy and says nothing about real performance.
* MT5 broker server time must be mapped to UTC explicitly
  (`mt5.server_utc_offset_hours`); ATLAS will not guess it.

## Not yet built (by design)

Historical bar research engine, strategies, risk-of-ruin estimator (Phase 2–3),
MQL5 EA (Phase 4, Strategy Tester only), demo execution (Phase 5). See
`docs/DESIGN.md` and `docs/DECISIONS.md`.
