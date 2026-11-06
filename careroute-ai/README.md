# CareRoute AI

Care-navigation assistant built for **DSH Hacks V2**.

Stack: React · TypeScript · Vite · Tailwind CSS (v4) · Supabase (planned — **not connected yet**).

## Current status

- [x] Project scaffold (Vite + React + TS + Tailwind)
- [x] Landing page
- [ ] Supabase project, auth & database
- [ ] Symptom intake flow
- [ ] AI recommendation engine

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

## Preview in the browser (no local install)

Open in StackBlitz (replace `<branch>` with the branch name):

```
https://stackblitz.com/github/abolajihamid2018-pixel/AWA-FASHION/tree/<branch>/careroute-ai
```

## Supabase (later)

Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY`. Never commit `.env.local`.

## Project structure

```
src/
  App.tsx                 page composition
  index.css               Tailwind import + theme (Inter font)
  components/
    Navbar.tsx            sticky responsive nav with mobile menu
    Hero.tsx              hero + illustrative app preview
    Sections.tsx          problem, how it works, features, audience, roadmap, CTA, footer
    Icons.tsx / Logo.tsx  inline SVG icons and brand mark
```
