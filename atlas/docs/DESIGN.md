# ATLAS 2.0 — Phase 0 Design Package

Status: **PROPOSAL — awaiting approval. No trading code has been written.**

This document covers the seven Phase 0 deliverables:

1. Architecture diagram
2. Folder structure
3. Dependency list
4. Data flow
5. Testing methodology
6. Implementation sequence (with gates)
7. Hardware compatibility assessment (Windows, 4 GB RAM)

It ends with the safety model and the open questions that need answers before Phase 1.

> **Honesty clause.** None of the strategy families listed here are assumed to
> be profitable. Classic Donchian, MA-crossover, momentum, breakout, mean-reversion
> and volatility-expansion systems are widely known, and many fail after costs
> on retail FX/CFD data. ATLAS is built to *measure* that, not to assume it. A
> strategy is only called "validated" when it passes the out-of-sample and
> robustness gates in §5, and even then it says nothing certain about future
> returns. "Aggressive growth" rankings will, by construction, surface strategies
> with high risk of ruin; that risk is always reported next to the return.

---

## 1. Architecture

```
                         ┌───────────────────────────────────────────────┐
                         │                WINDOWS PC (4 GB)              │
                         │                                               │
  ┌─────────────┐        │  ┌──────────────────────────────────────────┐ │
  │   Broker    │◄──────►│  │        MetaTrader 5 Terminal             │ │
  │ (demo/live  │  MT5   │  │                                          │ │
  │   server)   │  proto │  │  ┌──────────────┐   ┌─────────────────┐  │ │
  └─────────────┘        │  │  │ ATLAS EA     │   │ Strategy Tester │  │ │
                         │  │  │ (MQL5)       │   │ (MT5 backtest / │  │ │
                         │  │  │ - signals    │   │  optimisation,  │  │ │
                         │  │  │ - risk gate  │   │  parity check)  │  │ │
                         │  │  │ - orders     │   └────────┬────────┘  │ │
                         │  │  │ - kill sw.   │            │ reports   │ │
                         │  │  └──────┬───────┘            │ (XML/HTML)│ │
                         │  │         │ Common\Files       │           │ │
                         │  │         │ (heartbeat, KILL   │           │ │
                         │  │         │  flag, .set params)│           │ │
                         │  └─────────┼────────────────────┼───────────┘ │
                         │            │   MetaTrader5 Python API (IPC)   │
                         │            │   read-only wrapper in Ph.1–3    │
                         │  ┌─────────▼────────────────────▼───────────┐ │
                         │  │           ATLAS Python core              │ │
                         │  │                                          │ │
                         │  │  connector ─► ingest ─► data store       │ │
                         │  │     │                    (Parquet bars)  │ │
                         │  │     │                        │           │ │
                         │  │     │        research engine ◄┘          │ │
                         │  │     │   (strategies, backtester, costs,  │ │
                         │  │     │    walk-forward, Monte Carlo,      │ │
                         │  │     │    rankings)                       │ │
                         │  │     │              │                     │ │
                         │  │     ▼              ▼                     │ │
                         │  │  ┌──────────────────────────────┐        │ │
                         │  │  │ SQLite: atlas.db             │        │ │
                         │  │  │ accounts, deals, positions,  │        │ │
                         │  │  │ equity snapshots, runs,      │        │ │
                         │  │  │ metrics, params, audit log   │        │ │
                         │  │  └──────────────┬───────────────┘        │ │
                         │  └─────────────────┼────────────────────────┘ │
                         │                    │ read-only queries        │
                         │  ┌─────────────────▼────────────────────────┐ │
                         │  │ Streamlit dashboard (localhost:8501)     │ │
                         │  │ dark theme; one write action only:       │ │
                         │  │ "KILL SWITCH" -> writes KILL flag file   │ │
                         │  └──────────────────────────────────────────┘ │
                         └───────────────────────────────────────────────┘
```

### Responsibility split

| Component | Owns | Never does |
|---|---|---|
| **MQL5 EA** | Live/demo signal evaluation on closed bars, position sizing, pre-trade validation, order send + verification, SL enforcement, kill switch, connection recovery | Optimisation, analytics, storing credentials |
| **Python research engine** | Data ingest, vectorised/event backtests, cost modelling, walk-forward, Monte Carlo, rankings, exporting approved parameter sets as `.set` files | Sending orders (until Phase 5, and then only via a separately gated module — preferred design keeps *all* order flow in the EA) |
| **MT5 Strategy Tester** | Independent second backtest of each approved strategy using the real EA code and broker tick/spread data | — |
| **SQLite** | Single persistent store for trades, equity, research runs, metrics, audit | Storing bar data (too large; Parquet is used) or secrets |
| **Streamlit** | Visualisation | Placing or modifying orders |

**Key design decision:** order execution lives in exactly one place — the EA.
Python only *reads* from MT5. This means the same EA code is tested in the
Strategy Tester, run on demo, and (only if explicitly enabled) run live, and
there is no second order path to secure.

Each strategy exists twice: a Python reference implementation (for fast
research) and an MQL5 port (for execution). A **parity test** (§5.6) proves they
produce the same trades on the same data before the MQL5 version may run on demo.

---

## 2. Folder structure

The repository currently holds the AWA Fashion website. ATLAS is proposed to
live entirely under `atlas/` (or in a separate repository — see §9). The
existing `vercel.json` only builds `index.html`, so nothing under `atlas/` is deployed.

```
atlas/
├── README.md
├── pyproject.toml                 # deps, pinned; ruff/pytest config
├── requirements.txt               # pinned, for plain `pip install -r`
├── .env.example                   # non-secret settings template (no passwords)
├── .gitignore                     # data/, db/, logs/, *.set outputs, .env
│
├── config/
│   ├── base.yaml                  # shared defaults (risk limits, costs, paths)
│   ├── demo.yaml                  # demo environment: server, login id, magic range
│   ├── live.yaml.example          # template only; real live.yaml is git-ignored
│   └── strategies/
│       ├── donchian.yaml          # parameter ranges, search budget
│       ├── ma_trend.yaml
│       ├── momentum.yaml
│       ├── breakout_pullback.yaml
│       ├── mean_reversion.yaml
│       └── vol_expansion.yaml
│
├── src/atlas/
│   ├── __init__.py
│   ├── settings.py                # pydantic models; loads yaml + env; validates
│   ├── secrets.py                 # keyring (Windows Credential Manager) access
│   ├── logging_setup.py           # rotating logs + secret-redaction filter
│   │
│   ├── mt5/
│   │   ├── connector.py           # initialize/login/shutdown, retry + backoff
│   │   ├── readonly.py            # ReadOnlyMT5: whitelisted calls only
│   │   └── symbols.py             # contract specs: tick size/value, lots, swaps
│   │
│   ├── data/
│   │   ├── ingest.py              # copy_rates_range -> Parquet, incremental
│   │   ├── store.py               # Parquet read/write, float32, per symbol/TF
│   │   ├── quality.py             # gaps, duplicates, spikes, weekend bars, TZ
│   │   └── splits.py              # chronological train/val/OOS + embargo
│   │
│   ├── db/
│   │   ├── schema.sql
│   │   ├── migrations/
│   │   └── repo.py                # thin DAO, parameterised SQL only
│   │
│   ├── analytics/
│   │   ├── account.py             # balance/equity/P&L from deals
│   │   ├── metrics.py             # CAGR, MDD, PF, Sharpe, RF, expectancy …
│   │   ├── risk_of_ruin.py        # bootstrap / Monte Carlo ruin estimates
│   │   └── breakdown.py           # by strategy / symbol / timeframe
│   │
│   ├── research/
│   │   ├── strategies/
│   │   │   ├── base.py            # Strategy interface (signals from closed bars)
│   │   │   ├── donchian.py
│   │   │   ├── ma_trend.py
│   │   │   ├── momentum.py
│   │   │   ├── breakout_pullback.py
│   │   │   ├── mean_reversion.py
│   │   │   └── vol_expansion.py
│   │   ├── sizing.py              # fixed-fractional, vol-target, fixed lot; caps
│   │   ├── costs.py               # spread, commission, slippage, swap model
│   │   ├── backtester.py          # bar-based, next-bar-open fills, SL/TP intrabar
│   │   ├── optimizer.py           # bounded grid / random search with budget
│   │   ├── walkforward.py         # rolling/anchored WF on train+val only
│   │   ├── robustness.py          # param-neighbourhood, cost stress, MC shuffles
│   │   ├── ranking.py             # aggressive vs survival leaderboards
│   │   └── export_set.py          # approved params -> MT5 .set files
│   │
│   ├── tester/
│   │   ├── run_tester.py          # launches terminal64.exe /config:… (optional)
│   │   └── parse_report.py        # MT5 tester XML/HTML -> SQLite
│   │
│   └── cli.py                     # `atlas ingest|account|backtest|wf|rank|export`
│
├── dashboard/
│   ├── app.py                     # Streamlit entry point
│   ├── .streamlit/config.toml     # dark theme, headless, localhost only
│   ├── pages/
│   │   ├── 1_Account.py           # balance, equity, realised/unrealised P&L
│   │   ├── 2_Equity_Drawdown.py
│   │   ├── 3_Positions.py
│   │   ├── 4_History.py
│   │   ├── 5_Strategies.py        # comparison + both leaderboards
│   │   ├── 6_Instruments_Timeframes.py
│   │   └── 7_Risk.py              # risk metrics, ruin estimates, kill switch
│   └── components/                # shared charts, KPI tiles
│
├── mql5/
│   ├── Experts/ATLAS/ATLAS_EA.mq5
│   ├── Include/ATLAS/
│   │   ├── Config.mqh             # inputs, environment + live-lock checks
│   │   ├── RiskManager.mqh        # sizing, daily loss, max DD, exposure caps
│   │   ├── OrderManager.mqh       # validate -> send -> verify -> reconcile
│   │   ├── Guards.mqh             # spread, duplicate, session, kill switch
│   │   ├── Connection.mqh         # connection monitor + state reconcile
│   │   ├── Logger.mqh             # file journal, no secrets
│   │   └── Strategies/            # MQL5 ports, one .mqh per strategy
│   └── Presets/                   # exported .set files (git-ignored outputs)
│
├── tests/
│   ├── unit/                      # metrics, sizing, costs, splits, settings
│   ├── lookahead/                 # truncation-invariance tests per strategy
│   ├── integration/               # SQLite, ingest with fake MT5
│   ├── parity/                    # Python vs MT5 tester trade lists
│   └── fixtures/                  # small synthetic + recorded OHLC samples
│
├── data/        (git-ignored)     # parquet bars: data/{symbol}/{tf}.parquet
├── db/          (git-ignored)     # atlas.db
├── logs/        (git-ignored)
└── docs/
    ├── DESIGN.md                  # this file
    ├── RISK_POLICY.md             # Phase 1
    └── RUNBOOK.md                 # start/stop, kill switch, recovery (Phase 5)
```

---

## 3. Dependencies

Chosen for small footprint, Windows wheels, and no services/daemons.

### Runtime

| Package | Purpose | Notes |
|---|---|---|
| Python **3.11 64-bit** | Runtime | Must be 64-bit to match MT5; 3.11 has mature wheels for everything below |
| `MetaTrader5` | Official MT5 IPC API | Windows only; terminal must be installed and running |
| `numpy` | Numerics | |
| `pandas` | Time series | |
| `pyarrow` | Parquet bar storage | Compressed, column-typed, fast reads; ~10× smaller than CSV |
| `pydantic` (v2) | Config validation | Rejects invalid/missing settings at startup |
| `PyYAML` | Config files | |
| `keyring` | Credential storage | Uses Windows Credential Manager (DPAPI-encrypted per user) |
| `streamlit` | Dashboard | Bound to `localhost` only |
| `plotly` | Charts | Interactive equity/drawdown charts |
| `sqlite3` | Database | Python standard library — no install |

### Development

`pytest`, `pytest-cov`, `hypothesis` (property tests for look-ahead / sizing
invariants), `ruff` (lint + format).

### MQL5

MetaEditor (ships with MT5). Standard library `Trade\Trade.mqh` only. No DLL
imports — "Allow DLL imports" stays off.

### Deliberately excluded

Docker, PostgreSQL/Redis, Jupyter server as a required component, backtrader /
vectorbt / zipline (heavy, opinionated, or numba-dependent with large memory
use), TA-Lib (C build pain on Windows — indicators are a few lines of numpy each
and need to be ported to MQL5 anyway), any cloud/broker REST SDKs.

Estimated install size: ~450 MB in a venv (pyarrow and streamlit are the largest).

---

## 4. Data flow

### 4.1 Read-only analytics (Phase 1)

```
MT5 terminal ──(MetaTrader5.initialize, investor/read-only login)──► connector
connector ─► ReadOnlyMT5.account_info / positions_get / history_deals_get
          ─► normalise (UTC timestamps, account currency, deal → round-trip trades)
          ─► SQLite: accounts, deals, trades, positions_snapshot, equity_snapshot
Streamlit ─► SELECT … ─► KPI tiles, equity curve, drawdown, history, breakdowns
```

A scheduled poll (every 30–60 s while the dashboard is open, via a lightweight
`atlas account --watch` process) appends equity snapshots. Deals are ingested
incrementally by ticket number, so re-runs are idempotent (`INSERT OR IGNORE`).

### 4.2 Research (Phases 2–3)

```
copy_rates_range ─► quality checks ─► Parquet (float32, UTC)
Parquet ─► splits.py: TRAIN 60% | VAL 20% | OOS 20%  (chronological, embargo gaps)
TRAIN       ─► optimizer (bounded budget) ─► candidate params
TRAIN+VAL   ─► walk-forward (rolling re-fit on past, test on next window)
            ─► robustness (neighbourhood, cost ×1.5/×2, MC trade shuffle)
            ─► shortlist (pre-registered pass criteria)
OOS         ─► ONE evaluation per shortlisted config, results frozen in SQLite
            ─► ranking.py ─► aggressive & survival leaderboards
approved    ─► export_set.py ─► .set ─► MT5 Strategy Tester (real ticks/spread)
            ─► parse_report.py ─► parity comparison ─► SQLite
```

The OOS segment is "sealed": `splits.py` refuses to hand OOS data to the
optimiser or walk-forward modules, and every OOS read is logged to the audit
table with the run ID. A config that is re-tuned after seeing OOS results is
marked `oos_contaminated` and cannot be promoted.

### 4.3 Demo execution (Phase 5)

```
.set params ─► ATLAS_EA (demo account) ─► on new closed bar: signal
           ─► Guards: kill flag? connected? spread ≤ max? session ok?
                      duplicate (magic+symbol+bar) ? exposure caps? daily loss?
           ─► RiskManager: lots from SL distance & risk %, clamp to min/max/step
           ─► OrderManager: OrderCheck ─► OrderSend (SL attached) ─► verify
           ─► journal file + MT5 history
Python ─► history_deals_get (read-only) ─► SQLite ─► dashboard
Dashboard "KILL" ─► writes Common\Files\ATLAS\KILL ─► EA halts + (optionally) flattens
```

---

## 5. Testing methodology

### 5.1 Bias prevention (built into the engine, not left to discipline)

| Risk | Control |
|---|---|
| Look-ahead | Signals computed only from *closed* bars; fills at **next bar open**. Indicators use only trailing windows. **Truncation-invariance test** for every strategy: signal at bar *t* computed on `data[:t+1]` must equal signal at *t* computed on full data. Run with hypothesis on random data. |
| Intrabar ambiguity | If SL and TP both fall inside one bar, assume **SL hit first** (pessimistic). Optionally refine with lower-TF bars. |
| Data leakage | Indicator warm-up computed per segment; normalisation stats fit on train only; embargo of `max_lookback` bars between segments. |
| Survivorship / symbol bias | Instrument universe fixed *before* research and recorded in the run. |
| Over-optimisation | Per-strategy search budget (e.g. ≤ 200 configs), ≤ 4 free params, coarse grids; number of trials recorded and used in a **Deflated Sharpe Ratio** adjustment; plateau requirement (neighbours within ±1 grid step must keep ≥ 70% of performance). |
| Cost blindness | Costs always on: spread (historical per-bar spread from MT5 where available, else configured), commission per lot, slippage (fixed ticks + fraction of spread), swap from symbol specs. Results also reported at 1.5× and 2× costs. |
| Timezone/DST | All storage in UTC; broker server time converted once at ingest. |

### 5.2 Chronological datasets

```
|<------- TRAIN 60% ------->|e|<-- VAL 20% -->|e|<-- OOS 20% -->|
                             ^ embargo = max indicator lookback
```

Walk-forward on TRAIN+VAL: rolling windows (e.g. 2 y fit / 6 m test), reporting
walk-forward efficiency (OOS-annualised / IS-annualised return). OOS is touched once.

### 5.3 Metrics (all per run, stored in SQLite)

Net profit, CAGR, maximum drawdown (% and currency, plus duration), profit
factor, Sharpe (annualised from daily equity returns, not per trade), Sortino,
recovery factor (net profit / max DD), expectancy (per trade, in R and currency),
win rate, average win/loss, trade count, exposure %, total transaction costs and
costs as % of gross profit, and **estimated risk of ruin**.

**Risk of ruin** is estimated by bootstrap: resample the trade-return sequence
(block bootstrap to keep streaks) 10,000 times at the chosen position size and
report P(equity falls below the ruin threshold — default −50% from peak — within
the horizon), with a confidence interval. Reported separately for the configured
risk-per-trade and at 2× that size.

### 5.4 Rankings

Both rankings use **OOS + walk-forward results only**, and only for configs with
≥ 100 trades (configurable) that passed the robustness gates.

* **Aggressive growth:** maximise CAGR subject to hard constraints
  `P(ruin) < 10%` and `PF(2× costs) > 1.0`. Tie-break by recovery factor.
* **Survival:** maximise CAGR / MaxDD (MAR) subject to `MaxDD < 20%` and
  `P(ruin) < 1%`. Tie-break by lowest ulcer index.

Thresholds live in `config/base.yaml`, not in code. The dashboard shows both
boards side by side with ruin probability always visible next to return.

### 5.5 Software tests

* **Unit:** metrics against hand-computed fixtures; sizing (lot rounding, min/max,
  margin); cost model; split boundaries; config validation; log redaction.
* **Property (hypothesis):** look-ahead invariance; equity = balance + open P&L;
  position size never exceeds risk cap; no trade without SL.
* **Integration:** fake MT5 module (same function signatures, canned data) so the
  whole pipeline runs in CI on Linux without a terminal.
* **Static guard:** test fails if `order_send`, `order_check` or
  `positions_close` appear anywhere in `src/atlas` (enforces read-only Python).

### 5.6 Python ↔ MT5 parity

For each approved config: run the MQL5 port in the Strategy Tester ("1-minute
OHLC" then "Every tick based on real ticks") on the same period. Pass if trade
entries match ≥ 95% by bar timestamp and direction, and net result is within a
documented tolerance attributable to spread/tick differences. Mismatches are
treated as bugs until explained.

### 5.7 Demo forward test (gate before anything else)

Minimum 3 months **and** ≥ 50 trades on demo per strategy/instrument; compare live
fills to backtest expectations (slippage, spread at entry, rejection rate).
Promotion criteria are written down before the demo starts.

---

## 6. Implementation sequence

Each phase ends with a gate you approve. No phase starts early.

| Phase | Deliverable | Gate to pass |
|---|---|---|
| **0** | This design package | Your approval + answers to §9 |
| **1** | Project skeleton, settings/keyring, log redaction, **read-only** MT5 connector (investor password recommended), deal ingest → SQLite, account analytics, dashboard pages 1–4 | Dashboard reproduces MT5 account history to the cent on your demo account; static read-only test passes |
| **2** | Bar ingest + quality checks, Parquet store, splits, cost model, backtester, metrics, risk-of-ruin, look-ahead test harness | Backtester matches hand-worked examples; look-ahead tests pass; a known buy-and-hold baseline reproduces |
| **3** | Six strategies (one at a time, each with its own tests), optimiser with budgets, walk-forward, robustness, rankings, dashboard pages 5–7 | Each strategy passes look-ahead tests; full research report per strategy, including the ones that fail |
| **4** | MQL5 EA in **Strategy Tester only**: guards, risk manager, order manager, kill switch, one strategy port at a time; `.set` export; tester report parser | Python↔MT5 parity per §5.6; EA cannot send an order with no SL in any test |
| **5** | EA on **demo** with conservative risk; heartbeat, connection recovery, reconcile, dashboard kill switch; runbook | §5.7 forward-test criteria met |
| **6** | *(Only on your explicit, separate instruction)* live-mode documentation and checklist. ATLAS will never switch this on itself. | Your written decision |

---

## 7. Hardware compatibility (Windows, 4 GB RAM)

### Typical resident memory

| Process | RAM |
|---|---|
| Windows 10/11 baseline | 1.5 – 2.0 GB |
| MT5 terminal, few charts, 1 EA | 250 – 500 MB |
| MT5 Strategy Tester, 1 local agent | +300 – 800 MB (tick mode is the heavy one) |
| Python research process | 200 – 800 MB (depends on data window) |
| Streamlit dashboard | 150 – 300 MB |
| Browser tab for dashboard | 150 – 300 MB |

**Assessment: feasible, but not everything at once.** Live-ish monitoring
(terminal + EA + dashboard + browser ≈ 0.8–1.4 GB above baseline) fits. Heavy
research must run with the dashboard closed, and MT5 optimisation must not run
at the same time as Python optimisation.

### Mitigations built into the design

* Bars stored as **float32 Parquet**, loaded per symbol/timeframe/date-range only.
  10 years of H1 ≈ 62k bars ≈ 2 MB in memory; M5 ≈ 740k bars ≈ 25 MB; M1 ≈ 3.7M
  bars ≈ 110 MB — M1 research is possible but one symbol at a time.
* Default research timeframes **M15 and above**; M1/M5 opt-in.
* Optimiser runs configs sequentially (or `--workers 2` max), streaming results to
  SQLite instead of holding them in memory; peak memory is logged per run.
* Monte Carlo done in chunks of 1,000 paths.
* Strategy Tester limited to **1–2 local agents**; prefer "1-minute OHLC" for
  optimisation and "real ticks" only for final verification of a shortlist.
* Streamlit caches query results with TTL and downsamples long equity curves for
  plotting (e.g. ≤ 5,000 points).
* SQLite in WAL mode (dashboard reads while ingest writes, no locking stalls).
* An SSD and ≥ 10 GB free disk are strongly recommended (page file + tick data).

---

## 8. Safety and security model

### Live trading is off by default — four independent locks

Live orders are possible only if **all four** are true; any one missing → EA
runs in "observe" mode and logs `LIVE_BLOCKED`:

1. `config/live.yaml` exists (git-ignored) with `live_trading_enabled: true`
   and the exact account number.
2. EA input `InpAllowLive = true` (default `false`).
3. The connected account number matches the one in (1) and in an EA input.
4. MT5 "Algo Trading" is enabled by the user in the terminal (MT5's own lock).

The EA reads `ACCOUNT_TRADE_MODE` at start-up and on every reconnect. On a
`REAL` account without all locks it refuses to trade. Demo and live use
different magic-number ranges and different config files, so a demo config can
never be loaded against a live account.

### Credentials

* No credentials in code, YAML, `.env`, logs or SQLite. Passwords are stored with
  `keyring` (Windows Credential Manager) via `atlas secrets set`.
* Phase 1–3 use the **investor (read-only) password** where possible — the broker
  itself then rejects any trade request.
* A logging filter redacts any value registered as a secret plus patterns such
  as `password=`; tested in `tests/unit/test_redaction.py`.
* Dashboard binds to `127.0.0.1` only.

### Execution controls (EA, Phase 4–5)

* **Pre-trade validation:** symbol tradable, market open, volume within
  min/max/step, SL present and ≥ `SYMBOL_TRADE_STOPS_LEVEL`, margin via
  `OrderCheck`, risk per trade ≤ cap, total exposure ≤ cap.
* **Spread validation:** skip if current spread > configured max or >
  k × rolling median spread.
* **Duplicate protection:** one entry per strategy/symbol/bar — keyed on magic
  number + symbol + bar open time, persisted in terminal global variables so it
  survives restarts; existing position/pending order check before every send.
* **Order verification:** check `retcode`; confirm the position by ticket; confirm
  SL is attached; if the SL is missing or wrong after 1 retry, close the position
  and halt that strategy.
* **Connection recovery:** `OnTimer` monitors `TERMINAL_CONNECTED`; no new orders
  while disconnected; on reconnect, reconcile open positions against EA state
  before resuming.
* **Kill switch:** file flag in `Common\Files\ATLAS\KILL` checked on every tick and
  timer; dashboard button and a `atlas kill` CLI write it. Modes: *halt new
  entries* or *halt + flatten*. Also triggered automatically by daily-loss limit,
  max-drawdown limit, or N consecutive order errors.
* **Prohibited by design:** martingale, lot increases after losses, averaging down,
  unlimited grids, trades without SL. Position count per symbol is capped.

---

## 9. Open questions (please answer with your approval)

1. **Repository.** This branch is in the `AWA-FASHION` website repo. Do you want
   ATLAS kept under `atlas/` here, or should it move to its own repository
   (recommended — unrelated code and a different security profile)?
2. **Broker and account type.** Which broker, and is the account **hedging** or
   **netting**? This changes order and position handling in the EA.
3. **Instrument universe.** Which symbols to research first (e.g. EURUSD, GBPUSD,
   XAUUSD, US500)? And which timeframes?
4. **Commission structure** of your account (per lot, per side?), so the cost model
   matches reality.
5. **Default risk limits** for demo: proposed 0.5% risk per trade, 3% daily loss
   halt, 15% max-drawdown halt. Accept or change?
6. **Python version** already installed on the Windows machine (3.11 64-bit
   preferred), and Windows 10 or 11?
7. Is an **investor (read-only) password** available for Phase 1?

On approval, Phase 1 starts: skeleton, secure settings, read-only MT5 connector,
deal ingest, and the account analytics dashboard.
