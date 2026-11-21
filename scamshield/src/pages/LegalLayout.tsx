import type { ReactNode } from 'react';
import { Notice } from '../components/ui/Notice';
import { PageHeader } from '../components/ui/PageHeader';

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <PageHeader eyebrow="Legal" title={title}>
          Last updated {updated}
        </PageHeader>
        <Notice tone="warning" title="Draft for a prototype">
          This is a plain-language draft written for the prototype. It is not legal advice and must be reviewed before
          public launch.
        </Notice>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-slate-300 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
}
