import { ArrowLeft } from 'lucide-react';
import { AnalysisForm } from '../components/analysis/AnalysisForm';
import { ButtonLink } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';

const LOOKS_FOR = [
  'Lookalike names (for example "zenlx" for "zenix")',
  'Trusted names hidden in front of a different domain',
  'Shortened links that hide the destination',
  'IP addresses instead of names',
  'Reports from threat intelligence services',
  'Domain age and certificate details, where available',
  'Where redirects lead, checked safely on the server',
];

export default function UrlAnalysisPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <ButtonLink to="/analyse" variant="ghost" size="sm" className="-ml-3 mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </ButtonLink>
      <PageHeader eyebrow="Link analysis" title="Check a link">
        Paste a link you are unsure about. Do not open it first.
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalysisForm type="url" />
        </div>
        <aside className="card h-fit p-6">
          <h2 className="font-semibold">What it looks for</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            {LOOKS_FOR.map((l) => (
              <li key={l} className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-300" aria-hidden="true" />
                {l}
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-slate-500">
            A padlock (HTTPS) only means the connection is encrypted. Scam websites use HTTPS too.
          </p>
        </aside>
      </div>
    </div>
  );
}
