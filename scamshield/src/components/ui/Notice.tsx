import { FlaskConical, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'demo' | 'info' | 'warning';

const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  demo: {
    box: 'border-violet-400/30 bg-violet-500/10 text-violet-100',
    icon: <FlaskConical className="h-4 w-4 text-violet-300" aria-hidden="true" />,
  },
  info: {
    box: 'border-sky-400/25 bg-sky-500/10 text-sky-100',
    icon: <Info className="h-4 w-4 text-sky-300" aria-hidden="true" />,
  },
  warning: {
    box: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    icon: <TriangleAlert className="h-4 w-4 text-amber-300" aria-hidden="true" />,
  },
};

export function Notice({ tone = 'info', title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  const t = tones[tone];
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${t.box}`} role="note">
      <div className="mt-0.5 shrink-0">{t.icon}</div>
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>
      </div>
    </div>
  );
}

/** Small pill that marks anything simulated. */
export function DemoTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-violet-200">
      <FlaskConical className="h-3 w-3" aria-hidden="true" />
      DEMO
    </span>
  );
}
