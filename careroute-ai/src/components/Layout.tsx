import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { CLINIC_NAME } from '../lib/format'
import { Navbar } from './Navbar'

/** Scroll to top on route change, or to the #section when a hash is present. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

const YEAR = new Date().getFullYear()

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollManager />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <strong className="font-semibold">Prototype notice:</strong> CareRoute AI is a hackathon prototype using
            fictional demo data for <em>{CLINIC_NAME}</em>, a fictional clinic. It handles administrative requests only
            and does not give medical advice. Please don't enter real personal or medical information. In an
            emergency, call 911 or your local emergency number.
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
            <p>© {YEAR} CareRoute AI · A DSH Hacks V2 project</p>
            <div className="flex gap-6">
              <Link to="/services" className="hover:text-slate-800">Services</Link>
              <a href="/#how-it-works" className="hover:text-slate-800">How it works</a>
              <a href="/#roadmap" className="hover:text-slate-800">Project status</a>
              <Link to="/staff/login" className="hover:text-slate-800">Staff sign-in</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
