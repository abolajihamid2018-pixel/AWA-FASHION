# ScamShield

**Think before you trust.** An AI-assisted scam detection and digital fraud prevention app, built in stages.

> **Status: Stage 1 (interface prototype).** There is no detection engine yet.
> Built-in examples show hand-written **demo** reports. Real content you paste is
> shown back as **"Not analysed yet"** with plain facts only, never a made-up score.

## Run it on your computer

You need [Node.js](https://nodejs.org) version 20 or newer (choose the "LTS" download).

```bash
cd scamshield
npm install        # downloads the libraries listed in package.json (first time only)
npm run dev        # starts the app at http://localhost:5173
```

Other commands:

| Command | What it does |
|---|---|
| `npm test` | Runs the automated tests |
| `npm run build` | Checks types and builds the production version into `dist/` |
| `npm run preview` | Serves the built version locally |

## How the code is organised

```
src/
  main.tsx                 Starts React and the router
  App.tsx                  Every page and its address
  index.css                Design tokens (colours, fonts) and Tailwind
  lib/
    types.ts               The AnalysisResult "contract" every report follows
    risk.ts                Score bands (0–100 → LOW/MEDIUM/HIGH/CRITICAL) and colours
    validation.ts          Input checks: length limits, http/https only
    facts.ts               Plain facts read from input (no judgement)
  services/
    analysisService.ts     THE swap point: Stage 2/3 replace the demo logic here
    historyStore.ts        History in this browser (moves to Supabase in Stage 5)
  data/
    samples.ts             Hand-written demo reports (fictional organisations)
    education.ts           Learn page content
  components/              Reusable pieces: layout, buttons, risk gauge, report
  pages/                   One file per page
  __tests__/               Unit tests
```

## Pages

`/` landing · `/analyse` dashboard · `/analyse/message` · `/analyse/url` ·
`/results/:id` · `/example/:sampleId` · `/history` · `/learn` · `/about` · `/privacy` · `/terms`

See [PROGRESS.md](./PROGRESS.md) for what is done, simulated and still to come.
