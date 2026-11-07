# CareRoute AI — LinkedIn Launch Kit

**Live:** https://careroute-ai.vercel.app

---

## 1. The post (main version)

> **Most AI demos show what AI *can* do. I built one that's careful about what it *shouldn't* do.**
>
> Meet **CareRoute AI** — a patient navigation and clinic coordination platform.
>
> 🏥 **For patients:** browse a clinic's services, send a request in minutes, and follow it on a private status page — with email updates at every step.
>
> 🗂️ **For clinic staff:** one organised dashboard. AI summarises every request, suggests the right service, and flags anything uncertain. Staff confirm the appointment time, message the patient, and approve — and the patient is notified instantly.
>
> The design decisions I'm proudest of:
> → AI is **administrative only**. It never diagnoses, assesses symptoms or recommends treatment. If a note mentions medical details, it's flagged for a human and not repeated.
> → **Nothing is confirmed** until a person approves it.
> → Patients can only ever see **their own** request — enforced at the database level.
> → If the AI or email ever fails, the request is **never lost**.
> → It ignores notes that try to give the AI instructions.
>
> I also used this project to test a new way of building: I owned the product — the problem, priorities and safety rules — and worked with Claude as my AI engineering partner to ship it end to end: database, secure staff login, the AI pipeline, email notifications and a live deployment.
>
> Stack: React · TypeScript · Supabase · OpenAI · Brevo · Vercel
>
> The biggest lesson? In healthcare, the hard part of AI isn't the model — it's deciding exactly where the AI stops and the human begins.
>
> Try it (link in the comments) — I'd love your feedback. 👇
>
> #HealthTech #ResponsibleAI #ArtificialIntelligence #ProductManagement #BuildInPublic

### First comment (post this immediately after publishing)

> 🔗 Try it: https://careroute-ai.vercel.app
> Submit a request with your own email to see the confirmation (check spam if it doesn't arrive). It's a product showcase, so requests aren't sent to a real clinic.

---

## 2. Short version (if you prefer punchy)

> I built **CareRoute AI**: patients request clinic services and track them online; staff get an AI-organised inbox.
>
> The AI summarises and routes requests — but never gives medical advice, flags anything uncertain for a human, and nothing is confirmed until staff approve it.
>
> Built with React, Supabase, OpenAI, Brevo and Vercel — with Claude as my AI engineering partner.
>
> Link in comments 👇 #HealthTech #ResponsibleAI #BuildInPublic

---

## 3. Demo video script (≈60 seconds, screen recording)

Record in a desktop browser at 1440px wide. Use two windows: **Patient** (normal) and **Staff** (incognito, signed in).
Use your own email as the patient and keep your phone nearby for the email shot.

| Time | Screen | Voice-over / caption |
|---|---|---|
| 0–5s | Home page hero | "Getting in touch with a clinic shouldn't be this hard." |
| 5–15s | Services → pick **Vaccination** → fill form → tick box → **Send request** | "Patients pick a service and send a request in under a minute." |
| 15–20s | Confirmation page → open status link | "They get a reference and a private status page — and it's clearly *not* confirmed yet." |
| 20–32s | Staff window: dashboard with the **New** banner → open the request | "Staff see every request in one place. AI summarises it and suggests the right service." |
| 32–42s | Click **Approve** → pick a time → type a message → **Confirm** | "Staff confirm the appointment time and add a note for the patient." |
| 42–50s | Phone: approval email arrives | "The patient is emailed instantly…" |
| 50–57s | Patient window: refresh status page → **Your appointment** box | "…and their status page shows the confirmed time." |
| 57–60s | Home page "Built responsibly" section | "AI that helps — and knows where to stop. CareRoute AI." |

**Tips:** hide bookmarks and tabs, zoom the browser to 110%, add captions (most LinkedIn videos are watched muted), and keep it under 90 seconds.

---

## 4. Screenshot set (carousel order)

1. **Home page** — the hook.
2. **Services** — what patients choose from.
3. **Request form** — simple, with the "not a confirmed appointment" acknowledgement.
4. **Staff dashboard** — tabs, new-request banner, booked times.
5. **Request detail** — AI summary + history.
6. **Approve with time + message** — human in control.
7. **Patient status page** — confirmed appointment and clinic messages.
8. **Mobile status page** — works on any phone.

Each screenshot is high resolution (2× or 3×), so it stays sharp in a LinkedIn carousel or PDF document post.

---

## 5. Posting checklist

- [ ] Post Tuesday–Thursday, 8–10am in your audience's time zone.
- [ ] Put the link in the **first comment**, not the post.
- [ ] Reply to every comment in the first hour.
- [ ] Turn off public sign-ups in Supabase (Authentication → Sign In / Providers).
- [ ] Set an OpenAI monthly spending limit (Settings → Limits).
- [ ] Rotate the OpenAI key that was shared in chat.
- [ ] Add CareRoute AI to your profile's **Projects** section with the live link.

### Profile "Projects" entry

> **CareRoute AI** — AI-assisted patient navigation and clinic coordination platform. Patients request clinic
> services and track status online; staff manage an AI-summarised request queue with human approval, confirmed
> appointment times and patient messaging. Responsible-AI guardrails (administrative-only AI, human approval,
> database-level privacy). React, TypeScript, Supabase, OpenAI, Brevo, Vercel.
