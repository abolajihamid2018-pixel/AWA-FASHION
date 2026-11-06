import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { RequestStatus } from '../lib/api'
import { STATUS_INFO, TONE_CLASSES } from '../lib/format'
import { AlertIcon } from './Icons'

export function PageShell({ title, intro, children, narrow = false }: {
  title: string
  intro?: ReactNode
  children: ReactNode
  narrow?: boolean
}) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-blue-50 to-transparent" />
      <div className={`mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 ${narrow ? 'max-w-2xl' : 'max-w-5xl'}`}>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {intro && <div className="mt-3 text-lg leading-relaxed text-slate-600">{intro}</div>}
        <div className="mt-10">{children}</div>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const info = STATUS_INFO[status]
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${TONE_CLASSES[info.tone]}`}>
      {info.label}
    </span>
  )
}

export function Alert({ tone = 'red', title, children }: { tone?: 'red' | 'amber'; title: string; children?: ReactNode }) {
  const cls = tone === 'red' ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'
  return (
    <div role="alert" className={`flex gap-3 rounded-xl border p-4 text-sm ${cls}`}>
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-1 leading-relaxed">{children}</div>}
      </div>
    </div>
  )
}

export function NotConfigured() {
  return (
    <Alert tone="amber" title="Supabase is not configured">
      This build has no <code>VITE_SUPABASE_URL</code> / <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, so it can't
      load services or save requests. See the README for setup.
    </Alert>
  )
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      {label}
    </div>
  )
}

export function ButtonLink({ to, children, variant = 'primary' }: { to: string; children: ReactNode; variant?: 'primary' | 'secondary' }) {
  const cls =
    variant === 'primary'
      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
      : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
  return (
    <Link to={to} className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${cls}`}>
      {children}
    </Link>
  )
}
