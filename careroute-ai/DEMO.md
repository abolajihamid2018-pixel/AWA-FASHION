# CareRoute AI — Demo Guide

**Live app:** https://careroute-ai.vercel.app · **Staff sign-in:** https://careroute-ai.vercel.app/staff/login

---

## One-page summary

**Problem.** Patients often can't tell which services a clinic offers, how to request an appointment, or what
happens after they ask. Clinic front desks receive unstructured requests through many channels and spend time
sorting them instead of helping people.

**Solution.** CareRoute AI is an AI-assisted patient navigation and clinic coordination platform.

- **Patients** browse the clinic's services, submit a request in minutes, receive a confirmation email, and follow
  the request on a private status page.
- **Staff** sign in to an organised dashboard. Each request arrives with an **AI summary** and a **suggested
  service**, and anything uncertain is **flagged for review**. Staff approve, decline or cancel; patients are
  emailed automatically.

**Responsible by design.**

- A request is **never a confirmed appointment** until staff approve it.
- AI is **administrative only** — it never diagnoses, assesses symptoms, or recommends treatment. Notes with medical
  details are flagged for a human, and their content is not repeated. Prompt-injection attempts are ignored.
- **Privacy:** Row-Level Security means patients can only see their own request (via a private link); only
  approved, signed-in staff can see the queue. API keys never reach the browser.
- **Resilient:** if AI or email fails, the request is still saved and staff can retry.

**Tech stack.** React · TypeScript · Vite · Tailwind CSS · Supabase (PostgreSQL, Auth, Row-Level Security,
Edge Functions) · OpenAI · Brevo · Vercel.

---

## Demo script (≈3 minutes)

> Before you start: open two browser windows — one normal (patient), one private/incognito signed in as staff.
> Use an email inbox you can open on your phone as the patient email, and check the spam folder if an email
> doesn't appear within a minute.

**1. The problem (20 s)**
"Patients don't know what a clinic offers or how to follow up, and front desks drown in unstructured requests.
CareRoute AI fixes both sides."

**2. Patient flow (60 s)** — patient window
1. Landing page → **Browse clinic services**.
2. Pick **General appointment**. Fill in a name, your email, a date, and this note:
   *"I'm moving abroad next month and need my records transferred to my new clinic."*
3. Point out the checkbox: *it's a request, not a confirmed appointment*. Submit.
4. Show the **reference code** and **private status link** → open it: "Request received — not confirmed yet."
5. Show the **confirmation email** on your phone.

**3. Staff flow (60 s)** — staff window
1. Dashboard: point out the **"new requests" banner**, status tabs and search.
2. Open the new request → the **AI summary** flags that the patient chose *General appointment* but the note is
   really a **Medical records request**. "AI does the sorting; staff stay in control."
3. Open **Sofia Alvarez** or another sample to show a ready summary, then go back to the new request.
4. Click **Approve** → read the confirmation prompt ("the patient will see this as approved") → **Confirm**.
5. Show the **history** with who changed it and "✓ Patient emailed".

**4. Close the loop (20 s)**
Refresh the patient status page → **"Approved by the clinic"**, and show the **approval email**.

**5. Responsible AI (20 s)**
"AI never gives medical advice. If a note mentions symptoms, it's flagged for a human and the details aren't
repeated. It even ignores notes that try to give it instructions."

---

## Sample data in the dashboard

| Reference | Patient | Service | Status | What it shows |
|---|---|---|---|---|
| CR-PP8GRT | Sofia Alvarez | General appointment | New | **AI flag:** note is really a records request |
| CR-DSFJ7F | Amara Okafor | General appointment | New | Clean AI summary |
| CR-CC4WDW | James Carter | Billing & insurance | In review | Billing summary |
| CR-G379TV | Grace Lee | Medical records | In review | Records request |
| CR-QB659P | Daniel Mensah | Vaccination | Approved | Approved request |
| CR-5AKBN5 | Liam O'Connor | Follow-up | Approved | Approved request |
| CR-PYGZ2H | Priya Nair | Annual check-up | Approved | No note → AI skipped |

All sample patients use `@example.com` addresses and are not real people.

## Backup plan

- If email is slow, show the status page instead — it updates immediately.
- If the AI summary is still processing, open the request again after a few seconds or click **Run AI again**.
