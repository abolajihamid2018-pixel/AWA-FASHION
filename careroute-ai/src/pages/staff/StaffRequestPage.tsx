import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SparkleIcon } from '../../components/Icons'
import { Alert, Spinner } from '../../components/ui'
import {
  STAFF_STATUS_LABELS,
  STATUS_ACTION_LABELS,
  TIME_LABELS,
  formatClock,
  formatDate,
  formatDateTime,
} from '../../lib/format'
import {
  NEXT_STATUSES,
  getRequest,
  listRequestEvents,
  listStaff,
  notifyPatient,
  rerunAi,
  sendPatientMessage,
  setRequestStatus,
  type RequestEvent,
  type RequestStatus,
  type StaffMember,
  type NotifyResult,
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

const EMAIL_RESULT_COPY: Record<NotifyResult, string> = {
  sent: 'The patient has been emailed.',
  not_configured: 'No email was sent because email isn’t configured yet.',
  failed: 'The patient email could not be sent — see History.',
  skipped: '',
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
  const [apptTime, setApptTime] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
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

  // Poll while the AI summary is being generated.
  const processing = request?.ai_status === 'processing'
  useEffect(() => {
    if (!processing) return
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [processing, load])

  async function confirmChange() {
    if (!pending || !request) return
    setSaving(true)
    setSaveError(null)
    try {
      await setRequestStatus(request.id, pending, { time: apptTime, message: statusMessage })
      const emailed = await notifyPatient(request.id)
      setApptTime('')
      setStatusMessage('')
      await load()
      setFlash(`Status changed to “${STAFF_STATUS_LABELS[pending]}”. ${EMAIL_RESULT_COPY[emailed]}`)
      setPending(null)
    } catch (e) {
      setSaveError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // The newest status change or message is the one the email function sends for.
  const lastStatusEventId = [...events].reverse().find((e) => e.event_type === 'status_changed' || e.event_type === 'staff_message')?.id

  async function sendMessage(text: string) {
    if (!request) return
    await sendPatientMessage(request.id, text)
    const emailed = await notifyPatient(request.id)
    await load()
    setFlash(`Message sent to the patient's status page. ${EMAIL_RESULT_COPY[emailed]}`)
  }

  async function retryEmail() {
    if (!request) return
    const r = await notifyPatient(request.id)
    await load()
    setFlash(EMAIL_RESULT_COPY[r] || 'Email already sent.')
  }

  const actorName = (uid: string | null, eventType?: string) => {
    if (!uid) return eventType === 'created' ? 'Patient' : eventType?.startsWith('ai_') ? 'CareRoute AI' : 'Clinic staff'
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
              {request.appointment_time && (
                <Detail label="Confirmed appointment">
                  <span className="font-semibold text-teal-700">
                    {formatDate(request.preferred_date)} at {formatClock(request.appointment_time.slice(0, 5))}
                  </span>
                </Detail>
              )}
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
            <AiPanel request={request} onRerun={async () => { await rerunAi(request.id); await load() }} />
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
                {pending === 'approved' && request.service?.kind === 'appointment' && (
                  <div className="mt-4">
                    <label htmlFor="appt-time" className="block text-xs font-medium text-slate-700">
                      Appointment time on {formatDate(request.preferred_date)} <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="appt-time"
                      type="time"
                      required
                      step={300}
                      value={apptTime}
                      onChange={(e) => setApptTime(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Patient preferred: {TIME_LABELS[request.preferred_time as keyof typeof TIME_LABELS].toLowerCase()}
                    </p>
                  </div>
                )}
                <div className="mt-4">
                  <label htmlFor="status-msg" className="block text-xs font-medium text-slate-700">
                    Message to patient <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <textarea
                    id="status-msg"
                    rows={3}
                    maxLength={500}
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="e.g. Please arrive 10 minutes early and bring photo ID."
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-500">Shown on the patient's status page and included in the email.</p>
                </div>
                {saveError && <div className="mt-3"><Alert title="Not saved">{saveError}</Alert></div>}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={confirmChange}
                    disabled={saving || (pending === 'approved' && request.service?.kind === 'appointment' && !apptTime)}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPending(null); setSaveError(null); setApptTime(''); setStatusMessage('') }}
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

          <Card title="Message the patient">
            <MessageForm onSend={sendMessage} />
          </Card>

          <Card title="History">
            <ol className="space-y-4 border-l-2 border-slate-200 pl-5">
              {events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute top-1.5 -left-[27px] h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />
                  <p className="text-sm font-medium text-slate-800">
                    {e.event_type === 'created'
                      ? 'Request submitted'
                      : e.event_type === 'staff_message'
                        ? 'Message to patient'
                      : e.event_type === 'status_changed' && e.to_status
                        ? `${e.from_status ? STAFF_STATUS_LABELS[e.from_status] : ''} → ${STAFF_STATUS_LABELS[e.to_status]}`
                        : e.event_type === 'ai_completed'
                          ? 'AI summary generated'
                          : e.event_type === 'ai_failed'
                            ? 'AI summary failed'
                            : e.event_type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {actorName(e.actor_user_id, e.event_type)} · {formatDateTime(e.created_at)}
                  </p>
                  {e.message && (
                    <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                      “{e.message}”
                    </p>
                  )}
                  <EmailStatus event={e} onRetry={e.id === lastStatusEventId ? retryEmail : undefined} />
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AiPanel({ request, onRerun }: { request: StaffRequest; onRerun: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const rerun = async () => {
    setBusy(true)
    setErr(null)
    try {
      await onRerun()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const rerunButton = (label: string) => (
    <button
      type="button"
      onClick={rerun}
      disabled={busy}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      {busy ? 'Running…' : label}
    </button>
  )

  let body: ReactNode
  if (request.ai_status === 'completed') {
    body = (
      <div className="space-y-4">
        {request.ai_needs_review ? (
          <Alert tone="amber" title="Flagged for staff review">{request.ai_reason}</Alert>
        ) : (
          <p className="inline-flex rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 ring-1 ring-teal-200">
            No issues flagged
          </p>
        )}
        <p className="text-sm leading-relaxed text-slate-800">{request.ai_summary}</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Suggested service">{request.suggested_service?.name ?? 'No suggestion'}</Detail>
          <Detail label="Confidence"><span className="capitalize">{request.ai_confidence ?? '—'}</span></Detail>
        </dl>
        <p className="text-xs text-slate-500">
          Administrative assistance only — it may be wrong and is never clinical advice. Always check the original note.
        </p>
      </div>
    )
  } else if (request.ai_status === 'processing') {
    body = <Spinner label="Generating summary…" />
  } else if (request.ai_status === 'pending') {
    body = <p className="text-sm text-slate-600">This request hasn't been processed by the AI yet.</p>
  } else if (request.ai_status === 'skipped') {
    body = <p className="text-sm text-slate-600">{request.ai_reason ?? 'No note was provided, so there was nothing to summarise.'}</p>
  } else {
    body = (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">
          The AI summary couldn't be generated. The original request above is complete and can be handled normally.
        </p>
        {request.ai_error && (
          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer">Technical details</summary>
            <p className="mt-1 break-words">{request.ai_error}</p>
          </details>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {body}
      {err && <Alert title="AI not started">{err}</Alert>}
      {request.ai_status !== 'processing' && (
        <div>
          {rerunButton(request.ai_status === 'failed' ? 'Try again' : request.ai_status === 'pending' ? 'Generate summary' : 'Run AI again')}
        </div>
      )}
    </div>
  )
}

function EmailStatus({ event, onRetry }: { event: RequestEvent; onRetry?: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  if (!['created', 'status_changed', 'staff_message'].includes(event.event_type)) return null
  if (event.notified_at && !event.notify_error) {
    return <p className="mt-0.5 text-xs font-medium text-teal-700">✓ Patient emailed</p>
  }
  if (!event.notify_error) return null
  const notConfigured = event.notify_error.startsWith('Email is not configured')
  return (
    <div className="mt-0.5 text-xs text-amber-700">
      <span title={event.notify_error}>{notConfigured ? 'Email not sent (email not configured)' : 'Email not sent'}</span>
      {onRetry && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => { setBusy(true); await onRetry(); setBusy(false) }}
          className="ml-2 font-semibold text-blue-700 hover:underline disabled:opacity-60"
        >
          {busy ? 'Retrying…' : 'Retry'}
        </button>
      )}
    </div>
  )
}

function MessageForm({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    setErr(null)
    try {
      await onSend(text)
      setText('')
    } catch (error) {
      setErr((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea
        rows={3}
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Message to patient"
        placeholder="e.g. Please bring your insurance card to the appointment."
        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
      />
      {err && <Alert title="Not sent">{err}</Alert>}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 tabular-nums">{text.length}/500</span>
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send message'}
        </button>
      </div>
      <p className="text-xs text-slate-500">The patient sees this on their status page and receives it by email.</p>
    </form>
  )
}
