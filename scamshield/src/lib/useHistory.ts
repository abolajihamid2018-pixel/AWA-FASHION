import { useEffect, useState } from 'react';
import { listHistory, subscribe } from '../services/historyStore';
import type { HistoryEntry } from './types';

/** React hook: the current history list, refreshed whenever it changes. */
export function useHistory(): HistoryEntry[] {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => listHistory());
  useEffect(() => {
    const refresh = () => setEntries(listHistory());
    const unsubscribe = subscribe(refresh);
    window.addEventListener('storage', refresh);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return entries;
}
