import { ClipboardPaste, LoaderCircle, ScanSearch, X } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { samplesFor } from '../../data/samples';
import type { SubmissionType } from '../../lib/types';
import { MESSAGE_MAX_CHARS, URL_MAX_CHARS, validateMessage, validateUrl } from '../../lib/validation';
import { analyzeMessage, analyzeUrl } from '../../services/analysisService';
import { Button } from '../ui/Button';

const COPY: Record<SubmissionType, { label: string; placeholder: string; hint: string; cta: string }> = {
  message: {
    label: 'Suspicious message',
    placeholder:
      'Paste the message here: WhatsApp, SMS, email, a job advert, an investment offer…\n\nRemove any real passwords, PINs or OTPs before pasting.',
    hint: 'Tip: include the whole message. Do not include passwords, PINs or OTPs.',
    cta: 'Analyse message',
  },
  url: {
    label: 'Suspicious link',
    placeholder: 'https://example.com/login',
    hint: 'The link will not be opened in your browser.',
    cta: 'Analyse link',
  },
};

export function AnalysisForm({ type }: { type: SubmissionType }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const inputId = useId();
  const errorId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const copy = COPY[type];
  const max = type === 'message' ? MESSAGE_MAX_CHARS : URL_MAX_CHARS;
  const over = value.length > max;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const check = type === 'message' ? validateMessage(value) : validateUrl(value);
    if (!check.ok) {
      setError(check.error);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const outcome =
        type === 'message' ? await analyzeMessage(check.value as string) : await analyzeUrl((check.value as URL).href);
      if (outcome.kind === 'report') {
        navigate(`/results/${outcome.result.id}`);
      } else {
        // Real content stays in memory only, never in storage or browser history.
        navigate('/results/not-analysed');
      }
    } catch {
      setError('Something went wrong while starting the analysis. Please try again.');
      setBusy(false);
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setValue(text);
        setError(null);
      }
    } catch {
      setError('Your browser blocked clipboard access. Paste with Ctrl+V or long-press instead.');
    }
  }

  const fieldClass = `w-full rounded-xl border bg-ink-950/70 px-4 text-[15px] text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 ${
    error || over
      ? 'border-red-400/50 focus:ring-red-400/30'
      : 'border-white/10 focus:border-sky-400/60 focus:ring-sky-400/20'
  }`;
  const describedBy = `${hintId}${error ? ` ${errorId}` : ''}`;

  return (
    <form onSubmit={submit} noValidate className="card p-5 sm:p-6" aria-busy={busy}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="font-medium text-slate-100">
          {copy.label}
        </label>
        <div className="flex items-center gap-1">
          {value && (
            <Button variant="ghost" size="sm" onClick={() => setValue('')} disabled={busy}>
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={pasteFromClipboard} disabled={busy}>
            <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
            Paste
          </Button>
        </div>
      </div>

      <div className="mt-3">
        {type === 'message' ? (
          <textarea
            id={inputId}
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            rows={9}
            placeholder={copy.placeholder}
            className={`${fieldClass} resize-y py-3 leading-relaxed`}
            aria-invalid={!!error || over}
            aria-describedby={describedBy}
            disabled={busy}
            spellCheck={false}
          />
        ) : (
          <input
            id={inputId}
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            type="text"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={copy.placeholder}
            className={`${fieldClass} h-12 font-mono text-sm`}
            aria-invalid={!!error || over}
            aria-describedby={describedBy}
            disabled={busy}
          />
        )}
      </div>

      <div className="mt-2 flex items-start justify-between gap-4 text-xs">
        <p id={hintId} className="text-slate-500">
          {copy.hint}
        </p>
        <p className={`shrink-0 tabular-nums ${over ? 'text-red-300' : 'text-slate-500'}`} aria-live="polite">
          {value.length.toLocaleString()} / {max.toLocaleString()}
        </p>
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ExampleChips type={type} disabled={busy} onPick={(c) => { setValue(c); setError(null); }} />
        <Button type="submit" size="lg" disabled={busy} className="sm:min-w-44">
          {busy ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Checking…
            </>
          ) : (
            <>
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              {copy.cta}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function ExampleChips({
  type,
  disabled,
  onPick,
}: {
  type: SubmissionType;
  disabled: boolean;
  onPick: (content: string) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs text-slate-500">Try a built-in example (demo report):</p>
      <div className="flex flex-wrap gap-2">
        {samplesFor(type).map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s.content)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-sky-400/40 hover:text-slate-50 disabled:opacity-50"
          >
            {s.chip}
          </button>
        ))}
      </div>
    </div>
  );
}
