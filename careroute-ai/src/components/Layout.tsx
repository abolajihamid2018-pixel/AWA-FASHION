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
            <strong className="font-semibold">Important:</strong> CareRoute AI handles administrative requests for{' '}
            {CLINIC_NAME} only. It does not provide medical advice, diagnosis or treatment, so please don't include
            medical details in your request. In an emergency, call 112 or go to the nearest hospital.
            <span className="mt-2 block text-amber-800/80">
              CareRoute AI is a product showcase — requests made here are not sent to a real clinic.
            </span>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
            <p>© {YEAR} CareRoute AI</p>
            <div className="flex gap-6">
              <Link to="/services" className="hover:text-slate-800">Services</Link>
              <a href="/#how-it-works" className="hover:text-slate-800">How it works</a>
              <a href="/#safety" className="hover:text-slate-800">Safety</a>
              <Link to="/staff/login" className="hover:text-slate-800">Staff sign-in</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
