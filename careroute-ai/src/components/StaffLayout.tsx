import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Logo } from './Logo'
import { Alert, Spinner } from './ui'

/** Layout + guard for /staff pages. Signed-out users go to the login page. */
export function StaffLayout() {
  const { loading, session, staff, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking your session…" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/staff/login" replace state={{ from: location.pathname }} />
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 sm:inline">
              Staff
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden max-w-[16rem] truncate text-slate-600 md:inline">
              {staff?.display_name || session.user.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {staff ? (
          <Outlet />
        ) : (
          <div className="mx-auto max-w-xl px-4 py-16">
            <Alert tone="amber" title="This account is not on the clinic staff list">
              You're signed in as {session.user.email}, but this account hasn't been granted staff access. Ask the
              project owner to add your email to the staff allow-list.
            </Alert>
            <Link to="/" className="mt-6 inline-block text-sm font-medium text-blue-700 hover:underline">
              ← Back to the patient site
            </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        CareRoute AI staff area · requests are not confirmed until approved by staff · AI output is advisory only
      </footer>
    </div>
  )
}
