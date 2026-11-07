import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, ButtonLink, NotConfigured, PageShell, Spinner, StatusBadge } from '../components/ui'
import { getRequestStatus, type RequestStatusView } from '../lib/api'
import { CLINIC_NAME, STATUS_INFO, TIME_LABELS, formatClock, formatDate, formatDateTime } from '../lib/format'
import { isSupabaseConfigured } from '../lib/supabase'

type State =
  | { kind: 'loading' }
  | { kind: 'not_found' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; request: RequestStatusView }

export function StatusPage() {
  const { token = '' } = useParams()
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    getRequestStatus(token)
      .then((request) => !cancelled && setState(request ? { kind: 'ready', request } : { kind: 'not_found' }))
      .catch((e: Error) => !cancelled && setState({ kind: 'error', message: e.message }))
    return () => {
      cancelled = true
    }
  }, [token])

  if (!isSupabaseConfigured) {
    return (
      <PageShell narrow title="Request status">
        <NotConfigured />
      </PageShell>
    )
  }

  return (
    <PageShell narrow title="Request status" intro={`Your request to ${CLINIC_NAME}.`}>
      {state.kind === 'loading' && <Spinner />}
      {state.kind === 'error' && <Alert title="Something went wrong">{state.message}</Alert>}
      {state.kind === 'not_found' && (
        <>
          <Alert tone="amber" title="We couldn't find this request">
            The link may be incomplete or incorrect. Check that you copied the full status link.
          </Alert>
          <div className="mt-6">
            <ButtonLink to="/services" variant="secondary">
              Browse services
            </ButtonLink>
          </div>
        </>
      )}
      {state.kind === 'ready' && <StatusCard request={state.request} />}
    </PageShell>
  )
}

function StatusCard({ request }: { request: RequestStatusView }) {
  const info = STATUS_INFO[request.status]
  const confirmed = request.status === 'approved'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Reference</p>
          <p className="text-xl font-bold tracking-wide text-slate-900">{request.reference_code}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <p className={`mt-6 rounded-xl p-4 text-sm leading-relaxed ${confirmed ? 'bg-teal-50 text-teal-900' : 'bg-slate-50 text-slate-700'}`}>
        {info.description}
      </p>

      {confirmed && request.appointment_time && (
        <div className="mt-4 rounded-xl border border-teal-200 bg-white p-4">
          <p className="text-xs font-semibold tracking-wide text-teal-700 uppercase">Your appointment</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {formatDate(request.preferred_date)} at {formatClock(request.appointment_time)}
          </p>
        </div>
      )}

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Service</dt>
          <dd className="mt-1 font-medium text-slate-900">{request.service_name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            {request.service_kind === 'appointment' ? 'Preferred date' : 'Preferred contact date'}
          </dt>
          <dd className="mt-1 font-medium text-slate-900">{formatDate(request.preferred_date)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Time of day</dt>
          <dd className="mt-1 font-medium text-slate-900">{TIME_LABELS[request.preferred_time]}</dd>
        </div>
      </dl>

      <h2 className="mt-8 text-sm font-semibold text-slate-900">History</h2>
      <ol className="mt-3 space-y-3 border-l-2 border-slate-200 pl-5">
        {request.history.map((h, i) => (
          <li key={i} className="relative">
            <span className="absolute top-1.5 -left-[27px] h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />
            <p className="text-sm font-medium text-slate-800">
              {h.type === 'staff_message' ? 'Message from the clinic' : h.status ? STATUS_INFO[h.status].label : ''}
            </p>
            <p className="text-xs text-slate-500">{formatDateTime(h.at)}</p>
            {h.message && (
              <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                {h.message}
              </p>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-8 text-xs text-slate-500">Refresh this page to see the latest status.</p>
    </div>
  )
}
