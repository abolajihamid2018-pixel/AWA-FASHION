import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { HistoryList } from '../components/analysis/HistoryList';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { useHistory } from '../lib/useHistory';
import type { RiskLevel, SubmissionType } from '../lib/types';
import { clearHistory } from '../services/historyStore';

type TypeFilter = 'all' | SubmissionType;
type LevelFilter = 'all' | RiskLevel;

export default function HistoryPage() {
  const entries = useHistory();
  const [type, setType] = useState<TypeFilter>('all');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [confirming, setConfirming] = useState(false);

  const filtered = entries.filter((e) => (type === 'all' || e.type === type) && (level === 'all' || e.level === level));

  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="History"
        title="Your previous checks"
        actions={
          entries.length > 0 &&
          (confirming ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  clearHistory();
                  setConfirming(false);
                }}
              >
                Delete all {entries.length}
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear history
            </Button>
          ))
        }
      >
        Stored only in this browser for now. Only the report summary is kept, never the message or link you pasted.
      </PageHeader>

      {entries.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-3">
          <Select label="Type" value={type} onChange={(v) => setType(v as TypeFilter)} options={[['all', 'All types'], ['message', 'Messages'], ['url', 'Links']]} />
          <Select
            label="Risk"
            value={level}
            onChange={(v) => setLevel(v as LevelFilter)}
            options={[['all', 'All risk levels'], ['CRITICAL', 'Critical'], ['HIGH', 'High'], ['MEDIUM', 'Medium'], ['LOW', 'Low']]}
          />
        </div>
      )}

      {entries.length > 0 && filtered.length === 0 ? (
        <p className="card px-6 py-10 text-center text-sm text-slate-400">No checks match these filters.</p>
      ) : (
        <HistoryList entries={filtered} showDelete />
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-400">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-white/10 bg-ink-850 px-3 text-sm text-slate-200 focus:border-sky-400/60 focus:outline-none"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
