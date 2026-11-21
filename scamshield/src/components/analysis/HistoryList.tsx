import { History, Link2, MessageSquareWarning, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelative } from '../../lib/format';
import type { HistoryEntry } from '../../lib/types';
import { deleteResult } from '../../services/historyStore';
import { DemoTag } from '../ui/Notice';
import { RiskBadge } from '../ui/RiskBadge';

export function HistoryList({ entries, showDelete = false }: { entries: HistoryEntry[]; showDelete?: boolean }) {
  if (entries.length === 0) {
    return (
      <div className="card flex flex-col items-center px-6 py-12 text-center">
        <History className="h-8 w-8 text-slate-600" aria-hidden="true" />
        <p className="mt-3 font-medium text-slate-200">No checks yet</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Reports appear here after you run a check. Only the summary is kept, never what you pasted.
        </p>
      </div>
    );
  }
  return (
    <ul className="card divide-y divide-white/[0.06]">
      {entries.map((e) => {
        const Icon = e.type === 'url' ? Link2 : MessageSquareWarning;
        return (
          <li key={e.id} className="flex items-center gap-2 pr-2 sm:pr-3">
            <Link
              to={`/results/${e.id}`}
              className="flex min-w-0 flex-1 items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-white/[0.02] sm:p-5"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{e.type === 'url' ? 'Link' : 'Message'}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <RiskBadge level={e.level} size="sm" />
                  {e.isSimulated && <DemoTag />}
                  <span className="text-xs text-slate-500">
                    {e.type === 'url' ? 'Link' : 'Message'} · <time dateTime={e.createdAt}>{formatRelative(e.createdAt)}</time>
                  </span>
                </span>
                <span className="mt-1.5 block truncate font-medium text-slate-100">{e.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-slate-400 sm:line-clamp-1">{e.summary}</span>
              </span>
            </Link>
            {showDelete && (
              <button
                type="button"
                onClick={() => deleteResult(e.id)}
                className="shrink-0 rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                aria-label={`Delete "${e.title}" from history`}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
