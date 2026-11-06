import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { Alert, NotConfigured, Spinner } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { isSupabaseConfigured } from '../../lib/supabase'

const inputCls =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'

export function StaffLoginPage() {
  const { loading, session, signIn } = useAuth()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/staff'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (session) return <Navigate to={from.startsWith('/staff') ? from : '/staff'} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-teal-50" />
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff sign-in</h1>
          <p className="mt-1 text-sm text-slate-600">For clinic staff only. Patients don't need an account.</p>

          {!isSupabaseConfigured ? (
            <div className="mt-6">
              <NotConfigured />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-800">Email</label>
                <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-800">Password</label>
                <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
              </div>
              {error && <Alert title="Couldn't sign in">{error}</Alert>}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-70"
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link to="/" className="font-medium text-slate-600 hover:text-slate-900">← Back to the patient site</Link>
        </p>
      </div>
    </div>
  )
}
