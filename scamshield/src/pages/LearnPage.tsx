import { Banknote, Briefcase, Fish, HeartCrack, KeyRound, Link2, UserRoundX, type LucideIcon } from 'lucide-react';
import { REPORTING_GUIDANCE, TOPICS, type Topic } from '../data/education';
import { ButtonLink } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';

const ICONS: Record<Topic['icon'], LucideIcon> = {
  phishing: Fish,
  investment: Banknote,
  romance: HeartCrack,
  job: Briefcase,
  impersonation: UserRoundX,
  otp: KeyRound,
  links: Link2,
};

export default function LearnPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Learn" title="Know the warning signs">
        Short, practical guides to the scams people most often receive. Spotting the pattern is the best protection.
      </PageHeader>

      <nav aria-label="Topics" className="mb-10 flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 hover:border-teal-400/40 hover:text-slate-50"
          >
            {t.title}
          </a>
        ))}
      </nav>

      <div className="space-y-5">
        {TOPICS.map((t) => {
          const Icon = ICONS[t.icon];
          return (
            <article key={t.id} id={t.id} className="card scroll-mt-24 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight">{t.title}</h2>
                  <p className="mt-2 leading-relaxed text-slate-400">{t.summary}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-amber-200">Warning signs</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {t.signs.map((s) => (
                      <li key={s} className="flex gap-2.5">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-300" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-teal-200">What to do</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {t.actions.map((a) => (
                      <li key={a} className="flex gap-2.5">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-300" aria-hidden="true" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-14" aria-labelledby="report-title">
        <h2 id="report-title" className="text-2xl font-semibold tracking-tight">
          Where to report a scam in Nigeria
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Always find contact details on the organisation's official website. Never use numbers or links from the
          suspicious message itself.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {REPORTING_GUIDANCE.map((r) => (
            <div key={r.title} className="card p-5">
              <h3 className="font-semibold">{r.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <ButtonLink to="/analyse">Check something suspicious</ButtonLink>
      </div>
    </div>
  );
}
