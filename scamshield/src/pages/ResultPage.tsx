import { ArrowLeft, SearchX } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { NotAnalysedReport } from '../components/analysis/NotAnalysedReport';
import { ResultReport } from '../components/analysis/ResultReport';
import { ButtonLink } from '../components/ui/Button';
import { getSample } from '../data/samples';
import { buildSampleResult, takeUnanalysed } from '../services/analysisService';
import { getResult } from '../services/historyStore';

/**
 * Handles three addresses:
 *  /results/:id            a saved report from history
 *  /results/not-analysed   real content, held in memory only (never stored)
 *  /example/:sampleId      a built-in example report (not added to history)
 */
export default function ResultPage() {
  const { id, sampleId } = useParams();

  const view = useMemo(() => {
    if (sampleId) {
      return getSample(sampleId) ? { kind: 'report' as const, result: buildSampleResult(sampleId) } : null;
    }
    if (id === 'not-analysed') {
      return takeUnanalysed();
    }
    const saved = id ? getResult(id) : undefined;
    return saved ? { kind: 'report' as const, result: saved } : null;
  }, [id, sampleId]);

  const backTo = view?.kind === 'unavailable' ? `/analyse/${view.type}` : '/analyse';

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <ButtonLink to={backTo} variant="ghost" size="sm" className="-ml-3">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          New check
        </ButtonLink>
        {view?.kind === 'report' && id && (
          <ButtonLink to="/history" variant="ghost" size="sm">
            View history
          </ButtonLink>
        )}
      </div>
      <h1 className="sr-only">Analysis result</h1>
      {!view && <NotFound isMemoryOnly={id === 'not-analysed'} />}
      {view?.kind === 'report' && <ResultReport result={view.result} />}
      {view?.kind === 'unavailable' && <NotAnalysedReport {...view} />}
    </div>
  );
}

function NotFound({ isMemoryOnly }: { isMemoryOnly: boolean }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <SearchX className="h-9 w-9 text-slate-600" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-semibold">Report not available</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
        {isMemoryOnly
          ? 'Content you submit is kept only on the screen it was shown on, so it is gone after a refresh. Please run the check again.'
          : 'This report may have been deleted, or it was saved in a different browser.'}
      </p>
      <div className="mt-6 flex gap-3">
        <ButtonLink to="/analyse">Start a new check</ButtonLink>
        <ButtonLink to="/history" variant="secondary">
          History
        </ButtonLink>
      </div>
    </div>
  );
}
