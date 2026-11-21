import { SAMPLES, getSample } from '../data/samples';
import type { AnalysisResult, SubmissionType } from '../lib/types';
import { saveResult } from './historyStore';

/**
 * The single entry point the interface uses to request an analysis.
 *
 * STAGE 1: NO DETECTION ENGINE YET.
 *  - Built-in examples return their hand-written, clearly labelled reports.
 *  - Real content you paste is NOT scored. We return an honest
 *    "not analysed" outcome with only factual details (length, link parts)
 *    so no made-up verdict is ever attached to real data.
 *
 * In Stages 2 and 3 the "unavailable" branch is replaced by a call to the
 * server-side detection engine, which returns a real AnalysisResult.
 * The pages that call these functions will not need to change.
 */

export type AnalysisOutcome =
  | { kind: 'report'; result: AnalysisResult }
  | { kind: 'unavailable'; type: SubmissionType; submitted: string; reason: string };

const SIMULATED_DELAY_MS = 700;

/**
 * Real content waiting to be shown on the result screen. Kept in memory only
 * (not in the URL, browser history or storage), so a refresh clears it.
 */
let unanalysed: Extract<AnalysisOutcome, { kind: 'unavailable' }> | null = null;

export function takeUnanalysed() {
  return unanalysed;
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildSampleResult(sampleId: string): AnalysisResult {
  const sample = getSample(sampleId);
  if (!sample) throw new Error(`Unknown sample: ${sampleId}`);
  return {
    ...sample.report,
    id: newId(),
    type: sample.type,
    createdAt: new Date().toISOString(),
    isSimulated: true,
    sampleId: sample.id,
    sampleContent: sample.content,
  };
}

/** Finds a built-in example whose content matches the input exactly. */
export function matchSample(type: SubmissionType, input: string) {
  const norm = (s: string) => s.trim().replace(/\/+$/, '').toLowerCase();
  return SAMPLES.find((s) => s.type === type && norm(s.content) === norm(input));
}

async function run(type: SubmissionType, input: string): Promise<AnalysisOutcome> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY_MS));
  const sample = matchSample(type, input);
  if (sample) {
    const result = buildSampleResult(sample.id);
    saveResult(result);
    return { kind: 'report', result };
  }
  unanalysed = {
    kind: 'unavailable',
    type,
    submitted: input,
    reason:
      type === 'message'
        ? 'The message detection engine is built in Stage 2. Until then, real messages are not scored.'
        : 'The URL detection engine is built in Stage 3. Until then, real links are not scored.',
  };
  return unanalysed;
}

export function analyzeMessage(text: string): Promise<AnalysisOutcome> {
  return run('message', text);
}

export function analyzeUrl(url: string): Promise<AnalysisOutcome> {
  return run('url', url);
}
