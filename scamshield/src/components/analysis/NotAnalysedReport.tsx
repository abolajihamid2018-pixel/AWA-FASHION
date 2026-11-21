import { Construction, Link2, MessageSquareWarning } from 'lucide-react';
import { Link } from 'react-router-dom';
import { extractLinks, messageFacts, urlFacts } from '../../lib/facts';
import type { SubmissionType } from '../../lib/types';
import { validateUrl } from '../../lib/validation';
import { ButtonLink } from '../ui/Button';
import { Notice } from '../ui/Notice';

/**
 * Shown when real content was submitted but no detection engine exists yet.
 * Deliberately has no score or verdict: only facts read straight from the input.
 */
export function NotAnalysedReport({ type, submitted, reason }: { type: SubmissionType; submitted: string; reason: string }) {
  const parsed = type === 'url' ? validateUrl(submitted) : null;
  const facts = type === 'message' ? messageFacts(submitted) : parsed?.ok ? urlFacts(parsed.value) : [];
  const links = type === 'message' ? extractLinks(submitted) : [];
  const Icon = type === 'url' ? Link2 : MessageSquareWarning;

  return (
    <div className="space-y-5">
      <section className="card p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <Construction className="h-5 w-5 text-slate-300" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-slate-500/40 bg-slate-500/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-slate-300">
              NOT SCORED
            </span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">Not analysed yet</h2>
            <p className="mt-2 leading-relaxed text-slate-300">
              {reason} ScamShield will not guess a risk level for your content. Below are only plain facts read from what
              you submitted.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="card p-5 sm:p-6 lg:col-span-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            What you submitted
          </h3>
          <p className="mt-3 max-h-72 overflow-auto rounded-xl border border-white/[0.06] bg-ink-950/60 p-4 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-300">
            {submitted}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Shown only on this screen. It is not saved, not added to history and not sent anywhere.
          </p>
        </section>

        <section className="card p-5 sm:p-6 lg:col-span-2">
          <h3 className="font-semibold">Facts, not a verdict</h3>
          <dl className="mt-4 space-y-3">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col gap-0.5 text-sm">
                <dt className="text-slate-500">{f.label}</dt>
                <dd className="font-medium break-words text-slate-200">{f.value}</dd>
              </div>
            ))}
          </dl>
          {links.length > 0 && (
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <p className="text-sm text-slate-400">Links inside the message (not opened):</p>
              <ul className="mt-2 space-y-1">
                {links.map((l) => (
                  <li key={l} className="font-mono text-xs break-all text-slate-300">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <Notice tone="info" title="While detection is being built">
        If this involves money, codes or passwords, do not act on it until you have checked with the organisation or
        person through contact details you already trust. See{' '}
        <Link to="/learn" className="font-medium underline underline-offset-2">
          common scam warning signs
        </Link>
        .
      </Notice>

      <div className="flex flex-wrap gap-3">
        <ButtonLink to={type === 'url' ? '/analyse/url' : '/analyse/message'} variant="secondary">
          Check something else
        </ButtonLink>
        <ButtonLink to={`/analyse/${type}`} variant="ghost">
          Try a built-in example
        </ButtonLink>
      </div>
    </div>
  );
}
