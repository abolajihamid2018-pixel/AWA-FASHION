import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SparkleIcon } from '../../components/Icons'
import { Alert, Spinner } from '../../components/ui'
import {
  STAFF_STATUS_LABELS,
  STATUS_ACTION_LABELS,
  TIME_LABELS,
  formatDate,
  formatDateTime,
} from '../../lib/format'
import {
  NEXT_STATUSES,
  getRequest,
  listRequestEvents,
  listStaff,
  updateRequestStatus,
  type RequestEvent,
  type RequestStatus,
  type StaffMember,
  type StaffRequest,
} from '../../lib/staffApi'
import { StaffStatusBadge } from './StaffDashboardPage'

const ACTION_STYLES: Record<RequestStatus, string> = {
  submitted: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  in_review: 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
  approved: 'bg-teal-600 text-white hover:bg-teal-700',
  declined: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
  cancelled: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
}

/** What the patient will see after each change — shown in the confirm step. */
const CONFIRM_COPY: Record<RequestStatus, string> = {
  submitted: '',
  in_review: 'The patient will see that their request is under review (not yet confirmed).',
  approved: 'The patient will see that the clinic has APPROVED their request. Only approve once the appointment can actually go ahead.',
  declined: 'The patient will see that the clinic could not approve this request.',
  cancelled: 'The patient will see that this request has been cancelled.',
}

function Card({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{children}</dd>
    </div>
  )
}

export function StaffRequestPage() {
  const { id = '' } = useParams()
  const [request, setRequest] = useState<StaffRequest | null | undefined>(undefined)
  const [events, setEvents] = useState<RequestEvent[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [error, setError] = useState<string | null>(null)

  const [pending, setPending] = useState<RequestStatus | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [r, ev, st] = await Promise.all([getRequest(id), listRequestEvents(id), listStaff()])
      setRequest(r)
      setEvents(ev)
      setStaff(st)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [id])

  useEffect(() => {
    const t = setTimeout(load, 0)
    return () => clearTimeout(t)
  }, [load])

  async function confirmChange() {
    if (!pending || !request) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateRequestStatus(request.id, pending)
      await load()
      setFlash(`Status changed to “${STAFF_STATUS_LABELS[pending]}”.`)
      setPending(null)
    } catch (e) {
      setSaveError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const actorName = (uid: string | null) => {
    if (!uid) return 'Patient'
    const s = staff.find((m) => m.user_id === uid)
    return s?.display_name || s?.email || 'Staff member'
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert title="Couldn't load this request">{error}</Alert>
      </div>
    )
  }
  if (request === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Spinner />
      </div>
    )
  }
  if (request === null) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert tone="amber" title="Request not found" />
        <Link to="/staff" className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">← All requests</Link>
      </div>
    )
  }

  const nextStatuses = NEXT_STATUSES[request.status]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/staff" className="text-sm font-medium text-slate-600 hover:text-slate-900">← All requests</Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{request.reference_code}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {request.service?.name} · received {formatDateTime(request.created_at)}
          </p>
        </div>
        <StaffStatusBadge status={request.status} />
      </div>

      {flash && (
        <div role="status" className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
          {flash}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Patient request">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Name">{request.patient_name}</Detail>
              <Detail label="Email">
                <a href={`mailto:${request.patient_email}`} className="text-blue-700 hover:underline">{request.patient_email}</a>
              </Detail>
              <Detail label="Phone">{request.patient_phone || <span className="text-slate-400">Not provided</span>}</Detail>
              <Detail label="Service requested">{request.service?.name}</Detail>
              <Detail label={request.service?.kind === 'administrative' ? 'Preferred contact date' : 'Preferred date'}>
                {formatDate(request.preferred_date)}
              </Detail>
              <Detail label="Time of day">{TIME_LABELS[request.preferred_time as keyof typeof TIME_LABELS]}</Detail>
            </dl>
            <div className="mt-5">
              <p className="text-xs font-medium text-slate-500">Original note from patient</p>
              {request.enquiry ? (
                <p className="mt-1 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-800">{request.enquiry}</p>
              ) : (
                <p className="mt-1 text-sm text-slate-400">No note provided.</p>
              )}
            </div>
          </Card>

          <Card
            title="AI summary"
            action={<SparkleIcon className="h-5 w-5 text-teal-600" />}
          >
            <AiPanel request={request} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Update status">
            {nextStatuses.length === 0 ? (
              <p className="text-sm text-slate-500">No further changes available.</p>
            ) : pending ? (
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {STATUS_ACTION_LABELS[pending]} {request.reference_code}?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{CONFIRM_COPY[pending]}</p>
                {saveError && <div className="mt-3"><Alert title="Not saved">{saveError}</Alert></div>}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={confirmChange}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPending(null); setSaveError(null) }}
                    disabled={saving}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setPending(s); setFlash(null) }}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${ACTION_STYLES[s]}`}
                  >
                    {s === 'in_review' && (request.status === 'declined' || request.status === 'cancelled') ? 'Reopen (in review)' : STATUS_ACTION_LABELS[s]}
                  </button>
                ))}
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Patients see changes on their status page. The request is only shown as confirmed once approved.
                </p>
              </div>
            )}
          </Card>

          <Card title="History">
            <ol className="space-y-4 border-l-2 border-slate-200 pl-5">
              {events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute top-1.5 -left-[27px] h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />
                  <p className="text-sm font-medium text-slate-800">
                    {e.event_type === 'created'
                      ? 'Request submitted'
                      : e.event_type === 'status_changed' && e.to_status
                        ? `${e.from_status ? STAFF_STATUS_LABELS[e.from_status] : ''} → ${STAFF_STATUS_LABELS[e.to_status]}`
                        : e.event_type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {actorName(e.actor_user_id)} · {formatDateTime(e.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AiPanel({ request }: { request: StaffRequest }) {
  if (request.ai_status === 'completed') {
    return (
      <div className="space-y-4">
        {request.ai_needs_review && (
          <Alert tone="amber" title="Flagged for staff review">{request.ai_reason}</Alert>
        )}
        <p className="text-sm leading-relaxed text-slate-800">{request.ai_summary}</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Suggested service">{request.suggested_service?.name ?? 'No suggestion'}</Detail>
          <Detail label="Confidence">{request.ai_confidence ?? '—'}</Detail>
        </dl>
        <p className="text-xs text-slate-500">
          AI output is administrative assistance only and may be wrong. Always check the original request.
        </p>
      </div>
    )
  }
  if (request.ai_status === 'failed') {
    return (
      <p className="text-sm text-slate-600">
        The AI summary could not be generated for this request. The original request above is complete and can be
        handled normally.
      </p>
    )
  }
  return (
    <p className="text-sm text-slate-500">
      No AI summary yet. AI summaries and service suggestions (OpenAI) are being added in the next milestone.
    </p>
  )
}
