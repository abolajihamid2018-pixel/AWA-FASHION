import type { ReactNode } from 'react'
import {
  AlertIcon,
  ArrowRightIcon,
  BuildingIcon,
  ChatIcon,
  CheckIcon,
  ClockIcon,
  HeartPulseIcon,
  MapPinIcon,
  RouteIcon,
  ShieldIcon,
  UsersIcon,
} from './Icons'

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-wide text-teal-600 uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-slate-600">{intro}</p>}
    </div>
  )
}

/* ---------------- Problem ---------------- */

export function Problem() {
  const points = [
    {
      icon: <AlertIcon className="h-6 w-6" />,
      title: 'Uncertainty',
      body: "It's hard to know whether symptoms need an ER visit, an urgent care trip, or just rest at home.",
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: 'Lost time',
      body: 'Going to the wrong place can mean long waits, extra costs and delayed treatment.',
    },
    {
      icon: <BuildingIcon className="h-6 w-6" />,
      title: 'Strained systems',
      body: 'Non-urgent visits to emergency departments take capacity away from patients who need it most.',
    },
  ]

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The problem"
          title="Navigating care shouldn't be guesswork"
          intro="When people feel unwell, the first decision — where to go — is often the hardest one."
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

export function HowItWorks() {
  const steps = [
    {
      icon: <ChatIcon className="h-6 w-6" />,
      title: 'Describe your symptoms',
      body: 'Explain what you are feeling in your own words. CareRoute asks clear follow-up questions.',
    },
    {
      icon: <RouteIcon className="h-6 w-6" />,
      title: 'Get a care recommendation',
      body: 'Receive a suggested level of care with a plain-language explanation of why.',
    },
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: 'Find where to go',
      body: 'See relevant nearby options so you can take the next step with confidence.',
    },
  ]

  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How it works" title="Three steps from symptom to next step" />
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
      </div>
    </section>
  )
}

/* ---------------- Features ---------------- */

function FeatureCard({ icon, title, body, accent }: { icon: ReactNode; title: string; body: string; accent: 'blue' | 'teal' }) {
  const color = accent === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>{icon}</div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 leading-relaxed text-slate-600">{body}</p>
    </div>
  )
}

export function Features() {
  const features = [
    {
      icon: <ChatIcon className="h-6 w-6" />,
      title: 'Conversational intake',
      body: 'A friendly, guided conversation instead of long medical forms.',
      accent: 'blue' as const,
    },
    {
      icon: <AlertIcon className="h-6 w-6" />,
      title: 'Red-flag detection',
      body: 'Warning signs are surfaced immediately with clear instructions to seek emergency help.',
      accent: 'teal' as const,
    },
    {
      icon: <RouteIcon className="h-6 w-6" />,
      title: 'Care-level guidance',
      body: 'Recommendations across self-care, telehealth, primary care, urgent care and emergency.',
      accent: 'blue' as const,
    },
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: 'Location-aware options',
      body: 'Planned support for showing relevant care facilities near you.',
      accent: 'teal' as const,
    },
    {
      icon: <HeartPulseIcon className="h-6 w-6" />,
      title: 'Clear explanations',
      body: 'Every suggestion comes with the reasoning behind it, in plain language.',
      accent: 'blue' as const,
    },
    {
      icon: <ShieldIcon className="h-6 w-6" />,
      title: 'Privacy first',
      body: 'Designed to collect only what is needed, with secure storage planned from day one.',
      accent: 'teal' as const,
    },
  ]

  return (
    <section id="features" className="scroll-mt-20 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Designed to make care navigation simple"
          intro="What we are building for the CareRoute AI experience."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Audience ---------------- */

export function Audience() {
  const groups = [
    {
      icon: <UsersIcon className="h-6 w-6" />,
      title: 'Patients & families',
      items: ['Understand symptom urgency', 'Avoid unnecessary ER visits', 'Know what to do next'],
    },
    {
      icon: <BuildingIcon className="h-6 w-6" />,
      title: 'Clinics & health systems',
      items: ['Direct patients to the right setting', 'Reduce avoidable ED load', 'Improve the front-door experience'],
    },
    {
      icon: <HeartPulseIcon className="h-6 w-6" />,
      title: 'Community health programs',
      items: ['Support underserved communities', 'Lower barriers to navigation', 'Accessible on any device'],
    },
  ]

  return (
    <section id="who-its-for" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Who it's for" title="Helping everyone at the front door of care" />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white">
                  {g.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{g.title}</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {g.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-slate-600">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Roadmap / honest project status ---------------- */

export function Roadmap() {
  const items: { label: string; status: 'done' | 'next' | 'planned' }[] = [
    { label: 'Landing page & design system', status: 'done' },
    { label: 'Symptom intake flow (UI)', status: 'next' },
    { label: 'Supabase project, auth & database', status: 'planned' },
    { label: 'AI care-level recommendation engine', status: 'planned' },
    { label: 'Nearby care facility search', status: 'planned' },
  ]
  const badge = {
    done: 'bg-teal-100 text-teal-800',
    next: 'bg-blue-100 text-blue-800',
    planned: 'bg-slate-100 text-slate-600',
  }
  const text = { done: 'Done', next: 'Up next', planned: 'Planned' }

  return (
    <section id="roadmap" className="scroll-mt-20 border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Project status"
          title="Where we are today"
          intro="CareRoute AI is an early-stage hackathon project. Here's exactly what is built and what's coming."
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

export function CallToAction() {
  return (
    <section id="get-started" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 px-6 py-14 text-center shadow-xl sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Help us shape smarter care navigation
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-blue-50">
            We're building CareRoute AI for DSH Hacks V2. Pilot sign-ups will open once our backend is live.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              disabled
              title="Sign-ups open once Supabase is connected"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-white/90 px-6 py-3 text-sm font-semibold text-blue-700 opacity-90"
            >
              Pilot sign-up — coming soon
              <ArrowRightIcon className="h-4 w-4" />
            </button>
            <a
              href="#how-it-works"
              className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Footer ---------------- */

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <strong className="font-semibold">Medical disclaimer:</strong> CareRoute AI does not provide medical
          diagnoses or replace professional medical advice. If you think you may be having a medical emergency,
          call 911 or your local emergency number immediately.
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {YEAR} CareRoute AI · A DSH Hacks V2 project</p>
          <div className="flex gap-6">
            <a href="#how-it-works" className="hover:text-slate-800">How it works</a>
            <a href="#features" className="hover:text-slate-800">Features</a>
            <a href="#roadmap" className="hover:text-slate-800">Roadmap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
