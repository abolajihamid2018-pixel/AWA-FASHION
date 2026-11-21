import { RISK_STYLES } from '../../lib/risk';
import type { RiskLevel } from '../../lib/types';

/** Circular 0–100 score meter. The number is always shown, so colour is never the only signal. */
export function RiskGauge({ score, level, size = 132 }: { score: number; level: RiskLevel; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const s = RISK_STYLES[level];
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Risk score ${score} out of 100, ${s.label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={s.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tabular-nums text-slate-50">{score}</span>
        <span className="text-[11px] text-slate-400">out of 100</span>
      </div>
    </div>
  );
}
