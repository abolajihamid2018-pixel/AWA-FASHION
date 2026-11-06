import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  InboxIcon,
  ListIcon,
  RouteIcon,
  ShieldIcon,
  SparkleIcon,
  UsersIcon,
} from '../components/Icons'
import { CLINIC_NAME } from '../lib/format'

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-wide text-teal-600 uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-slate-600">{intro}</p>}
    </div>
  )
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute top-20 -right-32 h-[26rem] w-[26rem] rounded-full bg-teal-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,white,transparent_85%)]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pt-24 lg:pb-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Built for DSH Hacks V2
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Clinic requests,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">simplified</span>{' '}
            for patients and staff.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            CareRoute AI helps patients find clinic services, request appointments and follow up — and helps clinic
            staff organise incoming requests with AI-generated summaries.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Browse clinic services
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              See how it works
            </a>
          </div>

          <ul className="mt-10 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-600" /> Request in minutes
            </li>
            <li className="flex items-center gap-2">
              <RouteIcon className="h-5 w-5 text-teal-600" /> Track your status
            </li>
            <li className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5 text-blue-600" /> Private by design
            </li>
          </ul>
        </div>

        <HeroPreview />
      </div>
    </section>
  )
}

/** Static, illustrative UI mock — not live data. */
function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">Request CR-7KQ2MD</p>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
            Illustrative preview
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Service</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">Vaccination appointment</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Preferred date</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">Thu · Morning</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
            Under review
          </span>
          <span className="text-xs text-slate-500">Not yet a confirmed appointment</span>
        </div>

        <div className="mt-5 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-700 uppercase">
            <SparkleIcon className="h-4 w-4" /> Staff view · AI summary
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Patient asks for a morning vaccination slot later this week and prefers email contact.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-white px-2 py-1 font-medium text-slate-700 ring-1 ring-slate-200">
              Suggested: Vaccination appointment
            </span>
            <span className="rounded-md bg-white px-2 py-1 font-medium text-slate-700 ring-1 ring-slate-200">
              Confidence: high
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:block">
        <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <ShieldIcon className="h-4 w-4 text-teal-600" />
          Administrative support only — no medical advice
        </p>
      </div>
    </div>
  )
}

/* ---------------- Problem ---------------- */

function Problem() {
  const points = [
    {
      icon: <ListIcon className="h-6 w-6" />,
      title: 'Unclear services',
      body: "Patients often can't easily see which services a clinic offers or which one fits their request.",
    },
    {
      icon: <CalendarIcon className="h-6 w-6" />,
      title: 'Hard to request & follow up',
      body: 'Phone queues and scattered forms make it hard to ask for an appointment and know what happens next.',
    },
    {
      icon: <InboxIcon className="h-6 w-6" />,
      title: 'Overloaded front desks',
      body: 'Staff receive unstructured enquiries through many channels and spend time sorting before responding.',
    },
  ]

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The problem"
          title="Getting in touch with a clinic shouldn't be this hard"
          intro="Small administrative frictions cost patients time and keep clinic teams busy with sorting instead of helping."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                {p.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- How it works ---------------- */

function HowItWorks() {
  const steps = [
    {
      icon: <ListIcon className="h-6 w-6" />,
      title: 'Choose a service',
      body: 'Browse the services the clinic offers and pick the one that matches your request.',
    },
    {
      icon: <CalendarIcon className="h-6 w-6" />,
      title: 'Send your request',
      body: 'Share your contact details, a preferred date and an optional short administrative note.',
    },
    {
      icon: <RouteIcon className="h-6 w-6" />,
      title: 'Track the status',
      body: 'Use your private status link to see when staff review and approve your request.',
    },
  ]

  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How it works" title="Three steps for patients" />
        <div className="relative mt-14">
          <div
            aria-hidden="true"
            className="absolute top-7 right-[16%] left-[16%] hidden h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 to-blue-200 md:block"
          />
          <ol className="relative grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="relative text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-600/20">
                  {s.icon}
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-xs font-bold">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs leading-relaxed text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="mx-auto mt-12 max-w-xl text-center text-sm text-slate-500">
          A request is not a confirmed booking. Appointments are only confirmed once clinic staff approve them.
        </p>
      </div>
    </section>
  )
}

/* ---------------- For clinics ---------------- */

function Feature({ icon, title, body, soon }: { icon: ReactNode; title: string; body: string; soon?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">{icon}</div>
        {soon && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">In development</span>
        )}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 leading-relaxed text-slate-600">{body}</p>
    </div>
  )
}

function ForClinics() {
  return (
    <section id="for-clinics" className="scroll-mt-20 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="For clinic staff"
          title="An organised inbox for every request"
          intro="CareRoute AI gives clinic teams one place to review, prioritise and respond to incoming requests."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<UsersIcon className="h-6 w-6" />}
            title="Secure staff sign-in"
            body="Only authenticated clinic staff can view patient requests."

          />
          <Feature
            icon={<InboxIcon className="h-6 w-6" />}
            title="Request dashboard"
            body="See every request with its service, preferred date and current status."

          />
          <Feature
            icon={<SparkleIcon className="h-6 w-6" />}
            title="AI summaries"
            body="Concise summaries of administrative notes and a suggested service, with uncertain cases flagged for review."
            soon
          />
          <Feature
            icon={<CheckIcon className="h-6 w-6" />}
            title="Status management"
            body="Move requests through review to approval. Nothing is confirmed until staff approve it."

          />
          <Feature
            icon={<BellIcon className="h-6 w-6" />}
            title="Patient updates"
            body="Patients can see status changes through their private link, with email updates planned."
            soon
          />
          <Feature
            icon={<ShieldIcon className="h-6 w-6" />}
            title="Privacy by design"
            body="Row-Level Security keeps each request private. Patients can't see anyone else's request."
          />
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-500">
          AI in CareRoute is limited to administrative tasks. It does not diagnose, assess symptoms, recommend
          treatments or make clinical decisions.
        </p>
      </div>
    </section>
  )
}

/* ---------------- Roadmap ---------------- */

function Roadmap() {
  const items: { label: string; status: 'done' | 'next' | 'planned' }[] = [
    { label: 'Clinic service catalogue', status: 'done' },
    { label: 'Patient request submission (saved in Supabase)', status: 'done' },
    { label: 'Private patient status page', status: 'done' },
    { label: 'Secure staff sign-in & request dashboard', status: 'done' },
    { label: 'Request status management with audit history', status: 'done' },
    { label: 'AI request summaries & service suggestions (OpenAI)', status: 'next' },
    { label: 'Email notifications on status changes', status: 'planned' },
  ]
  const badge = {
    done: 'bg-teal-100 text-teal-800',
    next: 'bg-blue-100 text-blue-800',
    planned: 'bg-slate-100 text-slate-600',
  }
  const text = { done: 'Live', next: 'Up next', planned: 'Planned' }

  return (
    <section id="roadmap" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Project status"
          title="Where we are today"
          intro="CareRoute AI is a hackathon prototype. Here's exactly what works now and what's coming."
        />
        <ul className="mt-12 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {items.map((it) => (
            <li key={it.label} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <span className="font-medium text-slate-800">{it.label}</span>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badge[it.status]}`}>
                {text[it.status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- CTA ---------------- */

function CallToAction() {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 px-6 py-14 text-center shadow-xl sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">Try the patient experience</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-blue-50">
            Submit a demo request to <span className="font-semibold">{CLINIC_NAME}</span>, our fictional clinic. Please
            use made-up details.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              Browse clinic services
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingPage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <ForClinics />
      <Roadmap />
      <CallToAction />
    </>
  )
}
