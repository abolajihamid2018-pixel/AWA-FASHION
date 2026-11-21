import { SEVERITY_STYLES } from '../../lib/risk';
import type { Indicator } from '../../lib/types';

export function IndicatorList({ indicators }: { indicators: Indicator[] }) {
  const sorted = [...indicators].sort((a, b) => b.points - a.points);
  return (
    <ul className="divide-y divide-white/[0.06]">
      {sorted.map((ind) => {
        const s = SEVERITY_STYLES[ind.severity];
        return (
          <li key={ind.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${s.dot}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h4 className="font-medium text-slate-100">{ind.title}</h4>
                <span className="text-xs text-slate-500">
                  <span className={s.text}>{s.label}</span>
                  {ind.points > 0 && <span className="tabular-nums"> · +{ind.points} pts</span>}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{ind.explanation}</p>
              {ind.evidence && (
                <p className="mt-2 rounded-lg border border-white/[0.06] bg-ink-950/60 px-3 py-2 font-mono text-xs break-words text-slate-300">
                  <span className="mr-2 font-sans text-[11px] tracking-wide text-slate-500 uppercase">Evidence</span>
                  “{ind.evidence}”
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
