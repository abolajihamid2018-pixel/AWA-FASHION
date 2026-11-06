import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, CalendarIcon, InboxIcon } from '../components/Icons'
import { Alert, NotConfigured, PageShell, Spinner } from '../components/ui'
import { fetchServices, type Service } from '../lib/api'
import { CLINIC_NAME } from '../lib/format'
import { isSupabaseConfigured } from '../lib/supabase'

type State = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'ready'; services: Service[] }

export function ServicesPage() {
  const [state, setState] = useState<State>(isSupabaseConfigured ? { kind: 'loading' } : { kind: 'ready', services: [] })

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    fetchServices()
      .then((services) => !cancelled && setState({ kind: 'ready', services }))
      .catch((e: Error) => !cancelled && setState({ kind: 'error', message: e.message }))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <PageShell
      title="Clinic services"
      intro={
        <>
          Choose the service that best matches your request to <strong className="text-slate-800">{CLINIC_NAME}</strong>{' '}
          <span className="text-base text-slate-500">(fictional demo clinic)</span>.
        </>
      }
    >
      {!isSupabaseConfigured && <NotConfigured />}
      {state.kind === 'loading' && <Spinner label="Loading services…" />}
      {state.kind === 'error' && <Alert title="Couldn't load services">{state.message}</Alert>}
      {state.kind === 'ready' && isSupabaseConfigured && state.services.length === 0 && (
        <p className="text-slate-600">No services are available right now.</p>
      )}

      {state.kind === 'ready' && state.services.length > 0 && (
        <ul className="grid gap-5 sm:grid-cols-2">
          {state.services.map((s) => {
            const isAppointment = s.kind === 'appointment'
            return (
              <li key={s.id}>
                <Link
                  to={`/request/${s.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-900/5 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${isAppointment ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'}`}
                    >
                      {isAppointment ? <CalendarIcon className="h-6 w-6" /> : <InboxIcon className="h-6 w-6" />}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {isAppointment ? 'Appointment' : 'Administrative'}
                    </span>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-slate-900">{s.name}</h2>
                  <p className="mt-2 flex-1 leading-relaxed text-slate-600">{s.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">
                    {isAppointment ? 'Request an appointment' : 'Send a request'}
                    <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </PageShell>
  )
}
