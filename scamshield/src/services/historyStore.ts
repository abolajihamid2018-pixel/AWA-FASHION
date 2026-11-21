import type { AnalysisResult, HistoryEntry } from '../lib/types';

/**
 * Analysis history, stored in this browser only (localStorage).
 *
 * Stage 1 keeps history on the user's own device so the feature can be built
 * and tested without a backend. Stage 5 moves it to Supabase with per-user
 * access controls.
 *
 * Privacy: we store the report (score, indicators, advice) but never the text
 * or link the user pasted. Built-in examples keep their example content.
 * The storage can fail (private browsing, blocked storage), so every access
 * is wrapped and the app keeps working without it.
 */

const KEY = 'scamshield.history.v1';
const MAX_ENTRIES = 50;
const listeners = new Set<() => void>();

function readAll(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalysisResult[]) : [];
  } catch {
    return [];
  }
}

function writeAll(results: AnalysisResult[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(results.slice(0, MAX_ENTRIES)));
  } catch {
    // Storage unavailable: history simply is not kept.
  }
  listeners.forEach((fn) => fn());
}

export function saveResult(result: AnalysisResult): void {
  writeAll([result, ...readAll().filter((r) => r.id !== result.id)]);
}

export function getResult(id: string): AnalysisResult | undefined {
  return readAll().find((r) => r.id === id);
}

export function listHistory(): HistoryEntry[] {
  return readAll().map(({ id, type, createdAt, level, score, title, summary, isSimulated }) => ({
    id,
    type,
    createdAt,
    level,
    score,
    title,
    summary,
    isSimulated,
  }));
}

export function deleteResult(id: string): void {
  writeAll(readAll().filter((r) => r.id !== id));
}

export function clearHistory(): void {
  writeAll([]);
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
