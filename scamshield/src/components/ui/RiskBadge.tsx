import { RISK_STYLES } from '../../lib/risk';
import type { RiskLevel } from '../../lib/types';

export function RiskBadge({ level, size = 'md' }: { level: RiskLevel; size?: 'sm' | 'md' }) {
  const s = RISK_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${s.border} ${s.bg} ${s.text} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.stroke }} aria-hidden="true" />
      {level}
    </span>
  );
}
