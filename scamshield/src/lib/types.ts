/**
 * The shape of every ScamShield analysis report.
 *
 * This is the "contract" between the interface and the detection engine.
 * In Stage 1 the reports come from pre-written demo data. In Stages 2 and 3
 * real detection code will produce objects of exactly this shape, so the
 * pages built now will keep working without being rewritten.
 */

export type SubmissionType = 'message' | 'url';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** How much a single warning sign contributes to the overall risk. */
export type Severity = 'info' | 'low' | 'medium' | 'high';

/** How much evidence the report is based on. */
export type Confidence = 'low' | 'medium' | 'high';

/** One warning sign (or reassuring sign) found in a submission. */
export interface Indicator {
  /** Stable machine-readable name, e.g. "otp_request". */
  id: string;
  /** Short, plain-language title, e.g. "Asks for your OTP". */
  title: string;
  /** Why this matters, written for a non-technical reader. */
  explanation: string;
  severity: Severity;
  /** The exact text or signal that triggered this indicator, if any. */
  evidence?: string;
  /** Points this indicator added to the 0–100 risk score. */
  points: number;
}

export interface AnalysisResult {
  id: string;
  type: SubmissionType;
  /** ISO 8601 timestamp of when the analysis ran. */
  createdAt: string;
  /** 0 (no warning signs found) to 100 (overwhelming warning signs). */
  score: number;
  level: RiskLevel;
  /** Short label used in history, e.g. "Bank account 'restriction' message". */
  title: string;
  /** One- or two-sentence plain-language summary of the verdict. */
  summary: string;
  indicators: Indicator[];
  recommendations: string[];
  /** What this analysis could NOT check, so users know its limits. */
  limitations: string[];
  confidence: Confidence;
  /** True whenever the report was not produced by real detection. */
  isSimulated: boolean;
  /** Set when the report is one of the built-in examples. */
  sampleId?: string;
  /**
   * The example content the report describes. Only filled in for built-in
   * examples: we never store what a user pasted.
   */
  sampleContent?: string;
}

/** What the history list keeps: a summary, never the submitted content. */
export interface HistoryEntry {
  id: string;
  type: SubmissionType;
  createdAt: string;
  level: RiskLevel;
  score: number;
  title: string;
  summary: string;
  isSimulated: boolean;
}
