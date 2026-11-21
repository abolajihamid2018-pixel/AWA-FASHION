import { Link } from 'react-router-dom';
import { LogoMark } from '../brand/Logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-ink-950/60">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            <span className="font-semibold text-slate-100">ScamShield</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            Think before you trust. ScamShield explains warning signs in suspicious messages and links so you can make
            safer decisions online.
          </p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-500">
            ScamShield gives guidance, not guarantees. If money or bank details are involved, contact your bank directly.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ['/analyse/message', 'Check a message'],
            ['/analyse/url', 'Check a link'],
            ['/history', 'History'],
            ['/learn', 'Learn about scams'],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ['/about', 'About'],
            ['/privacy', 'Privacy policy'],
            ['/terms', 'Terms of use'],
          ]}
        />
      </div>
      <div className="border-t border-white/[0.05]">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} ScamShield</span>
          <span>Prototype. Detection engine in development.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-slate-400 hover:text-slate-100">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
