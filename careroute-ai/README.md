# CareRoute AI

AI-powered patient navigation and clinic coordination prototype, built for **DSH Hacks V2**.
Patients find clinic services, submit administrative/appointment requests and track their status;
clinic staff review and manage incoming requests.

> Prototype using fictional data only ("Riverside Community Clinic" is fictional).
> CareRoute AI does **not** diagnose, assess symptoms, recommend treatments or make clinical decisions.
> A request is never a confirmed booking until clinic staff approve it.

Stack: React · TypeScript · Vite · Tailwind CSS v4 · Supabase (Postgres, Auth, RLS, Edge Functions) · OpenAI (planned) · Vercel.

## Status

| Milestone | State |
|---|---|
| 1. Services catalogue, patient request submission, private status page, DB + RLS | ✅ Done |
| 2. Staff sign-in, dashboard, status management | Next |
| 3. OpenAI summaries + service suggestions (Edge Function) | Planned |
| 4. Email notifications | Planned |
| 5. Polish + Vercel deployment | Planned |

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production build
```

`.env` contains only **public** Supabase values (project URL + publishable key) and is committed so previews work.
The publishable key is designed to be exposed; all access control is enforced by Row-Level Security.
**Never** put the `service_role`/secret key or the OpenAI key in a `VITE_` variable — those live only in
Supabase Edge Function secrets.

## Routes

| Path | Page |
|---|---|
| `/` | Landing page |
| `/services` | Clinic service catalogue |
| `/request/:slug` | Request form for a service |
| `/request/submitted` | Confirmation with reference code + private status link |
| `/status/:token` | Patient status page |

## Database (`supabase/migrations`)

- `services` — configured clinic services (public read of active services).
- `requests` — patient requests incl. AI fields for milestone 3. **No anon access.** Staff read + update `status` only.
- `request_events` — audit trail (created / status changes with acting staff user).
- `staff` — allow-list of auth users who are clinic staff (`private.is_staff()` gates RLS).
- RPC `submit_request(...)` — validates & inserts; returns reference code + one-time status token (only its SHA-256 hash is stored). Rate-limited to 5 requests/hour per email.
- RPC `get_request_status(token)` — returns minimal, non-identifying status info for a valid token.

Migrations are applied to the Supabase project via the Supabase connector; the SQL files here are the source of truth.

## Structure

```
src/
  App.tsx              routes
  components/          Layout, Navbar, Logo, Icons, ui (shared UI)
  pages/               Landing, Services, Request, Submitted, Status, NotFound
  lib/supabase.ts      browser client (publishable key only)
  lib/api.ts           services + RPC calls, friendly error mapping
  lib/format.ts        status copy, date helpers, clinic name
  lib/database.types.ts generated DB types
supabase/migrations/   schema + seed SQL
vercel.json            SPA rewrites for deep links
```
