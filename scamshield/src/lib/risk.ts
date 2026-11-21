import type { RiskLevel, Severity } from './types';

/**
 * Score bands. A score is turned into a level using these lower bounds.
 * These are provisional: Stage 2 documents and tests the real scoring logic.
 *
 *   0–24  LOW       no meaningful warning signs found
 *  25–49  MEDIUM    some warning signs; verify before acting
 *  50–74  HIGH      several strong warning signs; very likely a scam
 *  75–100 CRITICAL  classic scam pattern; do not engage
 */
export const RISK_BANDS: { level: RiskLevel; min: number; max: number; meaning: string }[] = [
  { level: 'LOW', min: 0, max: 24, meaning: 'No meaningful warning signs found' },
  { level: 'MEDIUM', min: 25, max: 49, meaning: 'Some warning signs. Verify before acting' },
  { level: 'HIGH', min: 50, max: 74, meaning: 'Several strong warning signs' },
  { level: 'CRITICAL', min: 75, max: 100, meaning: 'Matches a known scam pattern. Do not engage' },
];

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function levelFromScore(score: number): RiskLevel {
  const s = clampScore(score);
  if (s >= 75) return 'CRITICAL';
  if (s >= 50) return 'HIGH';
  if (s >= 25) return 'MEDIUM';
  return 'LOW';
}

/** Tailwind classes for each risk level, kept in one place for consistency. */
export const RISK_STYLES: Record<
  RiskLevel,
  { label: string; text: string; bg: string; border: string; ring: string; stroke: string }
> = {
  LOW: {
    label: 'Low risk',
    text: 'text-emerald-300',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    ring: 'ring-emerald-400/30',
    stroke: '#34d399',
  },
  MEDIUM: {
    label: 'Medium risk',
    text: 'text-amber-300',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    ring: 'ring-amber-400/30',
    stroke: '#fbbf24',
  },
  HIGH: {
    label: 'High risk',
    text: 'text-orange-300',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    ring: 'ring-orange-400/30',
    stroke: '#fb923c',
  },
  CRITICAL: {
    label: 'Critical risk',
    text: 'text-red-300',
    bg: 'bg-red-500/10',
    border: 'border-red-400/40',
    ring: 'ring-red-400/40',
    stroke: '#f87171',
  },
};

export const SEVERITY_STYLES: Record<Severity, { label: string; dot: string; text: string }> = {
  info: { label: 'Reassuring', dot: 'bg-sky-400', text: 'text-sky-300' },
  low: { label: 'Minor', dot: 'bg-emerald-400', text: 'text-emerald-300' },
  medium: { label: 'Moderate', dot: 'bg-amber-400', text: 'text-amber-300' },
  high: { label: 'Serious', dot: 'bg-red-400', text: 'text-red-300' },
};
