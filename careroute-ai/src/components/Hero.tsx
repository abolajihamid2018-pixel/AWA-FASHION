import { ArrowRightIcon, ClockIcon, MapPinIcon, ShieldIcon } from './Icons'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* soft background accents */}
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
            The right care,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              the right place
            </span>
            , right away.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            CareRoute AI helps people describe what they're experiencing in plain language and guides them toward
            the most appropriate level of care — from self-care and telehealth to urgent care or the emergency room.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#get-started"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Join the pilot
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              See how it works
            </a>
          </div>

          <ul className="mt-10 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-600" /> Guidance in minutes
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-teal-600" /> Nearby care options
            </li>
            <li className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5 text-blue-600" /> Privacy by design
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
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Care assessment</p>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
            Illustrative preview
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-3 text-sm text-white">
            I've had a sore throat and a mild fever for two days. No trouble breathing.
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 text-sm text-slate-700">
            Thanks. A few quick questions to understand how you're feeling…
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50 p-4">
          <p className="text-xs font-semibold tracking-wide text-teal-700 uppercase">Suggested level of care</p>
          <p className="mt-1 text-lg font-bold text-slate-900">Primary care or telehealth</p>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            <span className="h-1.5 flex-1 rounded-full bg-teal-500" />
            <span className="h-1.5 flex-1 rounded-full bg-teal-500" />
            <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
            <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
            <span>Self-care</span>
            <span>Emergency</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {['Telehealth visit', 'Primary care clinic'].map((t) => (
            <div key={t} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800">{t}</p>
              <p className="mt-0.5 text-xs text-slate-500">Example option</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:block">
        <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <ShieldIcon className="h-4 w-4 text-teal-600" />
          Not a diagnosis — always call 911 in an emergency
        </p>
      </div>
    </div>
  )
}
