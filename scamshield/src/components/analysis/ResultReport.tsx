import { CircleCheck, Clock, FileText, Link2, MessageSquareWarning, ShieldAlert } from 'lucide-react';
import { RISK_STYLES } from '../../lib/risk';
import { formatDateTime } from '../../lib/format';
import type { AnalysisResult } from '../../lib/types';
import { RiskBadge } from '../ui/RiskBadge';
import { RiskGauge } from '../ui/RiskGauge';
import { DemoTag, Notice } from '../ui/Notice';
import { IndicatorList } from './IndicatorList';

const CONFIDENCE_TEXT = {
  low: 'Low: limited evidence, so treat this as a rough guide.',
  medium: 'Medium: clear signals, but some things could not be checked.',
  high: 'High: several strong, independent warning signs.',
};

/** The complete structured report. Used on the results page and, compactly, on the landing page. */
export function ResultReport({ result, compact = false }: { result: AnalysisResult; compact?: boolean }) {
  const style = RISK_STYLES[result.level];
  const warnings = result.indicators.filter((i) => i.severity !== 'info');
  const TypeIcon = result.type === 'url' ? Link2 : MessageSquareWarning;

  return (
    <div className="space-y-5">
      {/* Verdict */}
      <section className={`card overflow-hidden ring-1 ${style.ring}`} aria-labelledby="verdict-title">
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
          <RiskGauge score={result.score} level={result.level} size={compact ? 112 : 132} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <RiskBadge level={result.level} />
              {result.isSimulated && <DemoTag />}
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {result.type === 'url' ? 'Link' : 'Message'}
              </span>
            </div>
            <h2 id="verdict-title" className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
              {result.title}
            </h2>
            <p className="mt-2 leading-relaxed text-slate-300">{result.summary}</p>
            {!compact && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <time dateTime={result.createdAt}>{formatDateTime(result.createdAt)}</time>
              </p>
            )}
          </div>
        </div>
      </section>

      {result.sampleContent && !compact && (
        <section className="card p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Example content that was assessed
          </h3>
          <p className="mt-3 rounded-xl border border-white/[0.06] bg-ink-950/60 p-4 text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-300">
            {result.sampleContent}
          </p>
        </section>
      )}

      <div className={compact ? 'space-y-5' : 'grid gap-5 lg:grid-cols-5'}>
        <section className="card p-5 sm:p-6 lg:col-span-3" aria-labelledby="ind-title">
          <h3 id="ind-title" className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4 text-slate-400" aria-hidden="true" />
            What we found
            <span className="text-sm font-normal text-slate-500">
              · {warnings.length} warning sign{warnings.length === 1 ? '' : 's'}
            </span>
          </h3>
          <div className="mt-5">
            <IndicatorList indicators={compact ? result.indicators.slice(0, 2) : result.indicators} />
          </div>
        </section>

        {!compact && (
          <div className="space-y-5 lg:col-span-2">
            <section className="card p-5 sm:p-6" aria-labelledby="rec-title">
              <h3 id="rec-title" className="flex items-center gap-2 font-semibold">
                <CircleCheck className="h-4 w-4 text-teal-300" aria-hidden="true" />
                What to do next
              </h3>
              <ol className="mt-4 space-y-3">
                {result.recommendations.map((r, i) => (
                  <li key={r} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                    <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-400/10 text-[11px] font-semibold text-teal-300">
                      {i + 1}
                    </span>
                    {r}
                  </li>
                ))}
              </ol>
            </section>

            <section className="card p-5 sm:p-6" aria-labelledby="lim-title">
              <h3 id="lim-title" className="font-semibold">
                Confidence and limits
              </h3>
              <p className="mt-3 text-sm text-slate-300">
                <span className="font-medium text-slate-100">Confidence: </span>
                {CONFIDENCE_TEXT[result.confidence]}
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-400 marker:text-slate-600">
                {result.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>

      {result.isSimulated && !compact && (
        <Notice tone="demo" title="This is a demonstration report">
          It was written by hand for a built-in example so the report layout can be reviewed. It was not produced by a
          detection engine.
        </Notice>
      )}
    </div>
  );
}
