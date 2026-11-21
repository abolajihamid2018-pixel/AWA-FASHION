import { ArrowRight, Link2, MessageSquareWarning } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HistoryList } from '../components/analysis/HistoryList';
import { ButtonLink } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { PageHeader } from '../components/ui/PageHeader';
import { useHistory } from '../lib/useHistory';

const OPTIONS = [
  {
    to: '/analyse/message',
    icon: MessageSquareWarning,
    title: 'Check a message',
    body: 'WhatsApp, SMS, email, social media, job adverts or investment offers.',
  },
  {
    to: '/analyse/url',
    icon: Link2,
    title: 'Check a link',
    body: 'A website address you were sent or found and are not sure about.',
  },
];

export default function DashboardPage() {
  const history = useHistory();
  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Analyse" title="What would you like to check?">
        Choose what you received. You will get a risk level, the warning signs behind it and what to do next.
      </PageHeader>

      <div className="mb-8">
        <Notice tone="demo" title="Prototype stage">
          Detection is not connected yet. Built-in examples show demonstration reports. Your own content will be shown
          back to you as "Not analysed yet", with no made-up score.
        </Notice>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {OPTIONS.map((o) => (
          <Link
            key={o.to}
            to={o.to}
            className="card group flex items-start gap-5 p-6 transition-colors hover:border-sky-400/30 sm:p-7"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
              <o.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 text-lg font-semibold text-slate-50">
                {o.title}
                <ArrowRight
                  className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-300"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-slate-400">{o.body}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-14" aria-labelledby="recent-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-title" className="text-lg font-semibold">
            Recent checks
          </h2>
          {history.length > 0 && (
            <ButtonLink to="/history" variant="ghost" size="sm">
              View all
            </ButtonLink>
          )}
        </div>
        <div className="mt-4">
          <HistoryList entries={history.slice(0, 3)} />
        </div>
      </section>
    </div>
  );
}
