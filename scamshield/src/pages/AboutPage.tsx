import { ButtonLink } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';

const PRINCIPLES = [
  ['Explain, don\'t just label', 'Every verdict lists the warning signs and the exact evidence behind it.'],
  ['Evidence first', 'Risk scores come from documented detection rules and real threat-intelligence results. AI may help explain the findings but is not allowed to invent them or declare a website safe.'],
  ['Honest about limits', 'Reports say what could not be checked. A low score is never presented as a guarantee.'],
  ['Privacy by default', 'We avoid storing what you paste and never ask for passwords, OTPs or bank details.'],
];

const ROADMAP: [string, string, 'done' | 'now' | 'next'][] = [
  ['Stage 1', 'Interface and design prototype', 'now'],
  ['Stage 2', 'Message detection engine', 'next'],
  ['Stage 3', 'Link detection with threat intelligence', 'next'],
  ['Stage 4', 'AI explanations and unified results', 'next'],
  ['Stage 5', 'Accounts and secure history', 'next'],
  ['Stage 6', 'Testing and security review', 'next'],
  ['Stage 7', 'Public launch', 'next'],
];

export default function AboutPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="About" title="Making scam detection understandable">
        ScamShield helps everyday internet users, students, young professionals and small businesses examine suspicious
        messages and links, starting in Nigeria.
      </PageHeader>

      <div className="grid gap-5 md:grid-cols-2">
        {PRINCIPLES.map(([t, b]) => (
          <div key={t} className="card p-6">
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{b}</p>
          </div>
        ))}
      </div>

      <section className="mt-14" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title" className="text-2xl font-semibold tracking-tight">
          Where the project is
        </h2>
        <ol className="card mt-6 divide-y divide-white/[0.06]">
          {ROADMAP.map(([stage, label, status]) => (
            <li key={stage} className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="min-w-0">
                <span className="text-sm text-slate-500">{stage}</span>
                <span className="ml-3 font-medium text-slate-200">{label}</span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  status === 'now' ? 'bg-sky-500/15 text-sky-200' : status === 'done' ? 'bg-emerald-500/15 text-emerald-200' : 'text-slate-500'
                }`}
              >
                {status === 'now' ? 'In progress' : status === 'done' ? 'Done' : 'Planned'}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <ButtonLink to="/analyse">Try ScamShield</ButtonLink>
        <ButtonLink to="/privacy" variant="secondary">
          Privacy policy
        </ButtonLink>
      </div>
    </div>
  );
}
