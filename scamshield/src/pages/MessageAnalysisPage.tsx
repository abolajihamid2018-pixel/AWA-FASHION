import { ArrowLeft } from 'lucide-react';
import { AnalysisForm } from '../components/analysis/AnalysisForm';
import { ButtonLink } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';

const LOOKS_FOR = [
  'Requests for OTPs, PINs or passwords',
  'Urgent demands for money',
  'Unusual payment instructions',
  'Pretending to be a bank, company or person you know',
  'Promises of unrealistic profits',
  'Threats and pressure tactics',
  'Moving you to WhatsApp or Telegram',
  'Suspicious phone numbers and links',
];

export default function MessageAnalysisPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <ButtonLink to="/analyse" variant="ghost" size="sm" className="-ml-3 mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </ButtonLink>
      <PageHeader eyebrow="Message analysis" title="Check a message">
        Paste a message you received. ScamShield looks for the warning signs scammers commonly use.
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalysisForm type="message" />
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
        </aside>
      </div>
    </div>
  );
}
