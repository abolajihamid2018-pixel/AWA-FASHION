import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { ButtonLink } from '../ui/Button';

const LINKS = [
  { to: '/analyse', label: 'Analyse' },
  { to: '/history', label: 'History' },
  { to: '/learn', label: 'Learn' },
  { to: '/about', label: 'About' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/[0.06] text-slate-50' : 'text-slate-400 hover:text-slate-100'
  }`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-900/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block">
          <ButtonLink to="/analyse" size="sm">
            Check something
          </ButtonLink>
        </div>
        <button
          type="button"
          className="-mr-2 rounded-lg p-2 text-slate-300 hover:bg-white/[0.06] md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-white/[0.06] md:hidden" aria-label="Main">
          <div className="container-page flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            <ButtonLink to="/analyse" className="mt-2">
              Check something
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
