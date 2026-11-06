import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CloseIcon, MenuIcon } from './Icons'
import { Logo } from './Logo'

// Hash links point at landing-page sections; route links use the router.
const links: { to: string; label: string; hash?: boolean }[] = [
  { to: '/services', label: 'Services' },
  { to: '/#how-it-works', label: 'How it works', hash: true },
  { to: '/#for-clinics', label: 'For clinics', hash: true },
  { to: '/#roadmap', label: 'Project status', hash: true },
]

const linkClass = 'text-sm font-medium text-slate-600 transition hover:text-blue-700'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              {l.hash ? (
                <a href={l.to} className={linkClass}>
                  {l.label}
                </a>
              ) : (
                <NavLink
                  to={l.to}
                  className={({ isActive }) => `${linkClass} ${isActive ? 'text-blue-700' : ''}`}
                >
                  {l.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Link
            to="/services"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Make a request
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {links.map((l) => (
              <li key={l.to}>
                {l.hash ? (
                  <a href={l.to} onClick={close} className="block rounded-md px-2 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
                    {l.label}
                  </a>
                ) : (
                  <Link to={l.to} onClick={close} className="block rounded-md px-2 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <Link
            to="/services"
            onClick={close}
            className="block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Make a request
          </Link>
        </div>
      )}
    </header>
  )
}
