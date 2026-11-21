import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Spinner } from '../../components/ui'
import { STAFF_STATUS_LABELS, formatClock, formatDate, formatDateTime } from '../../lib/format'
import {
  listAllStatusEvents,
  listRequests,
  listStaff,
  type ReportEvent,
  type RequestStatus,
  type StaffMember,
  type StaffRequest,
} from '../../lib/staffApi'
import { StaffStatusBadge } from './StaffDashboardPage'

type Range = 'today' | '7' | '30' | 'all'
const RANGES: { key: Range; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7', label: 'Last 7 days' },
  { key: '30', label: 'Last 30 days' },
  { key: 'all', label: 'All time' },
]

const GROUPS: { key: string; label: string; statuses: RequestStatus[] }[] = [
  { key: 'new', label: 'New', statuses: ['submitted'] },
  { key: 'review', label: 'In review', statuses: ['in_review'] },
  { key: 'approved', label: 'Approved', statuses: ['approved'] },
  { key: 'closed', label: 'Declined / cancelled', statuses: ['declined', 'cancelled'] },
]

function rangeStart(range: Range): number {
  if (range === 'all') return 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (range !== 'today') d.setDate(d.getDate() - (Number(range) - 1))
  return d.getTime()
}

function formatDuration(ms: number): string {
  const mins = Math.round(ms / 60000)
  if (mins < 60) return `${mins} min`
  const hours = mins / 60
  if (hours < 48) return `${hours.toFixed(1)} h`
  return `${(hours / 24).toFixed(1)} days`
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function StaffReportsPage() {
  const [requests, setRequests] = useState<StaffRequest[] | null>(null)
  const [events, setEvents] = useState<ReportEvent[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<Range>('30')
  const [staffFilter, setStaffFilter] = useState<string>('all')

  useEffect(() => {
    let cancelled = false
    Promise.all([listRequests(), listAllStatusEvents(), listStaff()])
      .then(([r, e, s]) => {
        if (cancelled) return
        setRequests(r)
        setEvents(e)
        setStaff(s)
      })
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [])

  const staffName = (uid: string | null) => {
    if (!uid) return 'Clinic staff'
    const s = staff.find((m) => m.user_id === uid)
    return s?.display_name || s?.email || 'Staff member'
  }

  const report = useMemo(() => {
    if (!requests) return null
    const from = rangeStart(range)
    const inRange = requests.filter((r) => Date.parse(r.created_at) >= from)

    // Latest status change per request = who "handled" it most recently.
    const byRequest = new Map<string, ReportEvent[]>()
    for (const e of events) {
      const list = byRequest.get(e.request_id) ?? []
      list.push(e)
      byRequest.set(e.request_id, list)
    }
    const handledBy = (r: StaffRequest) => {
      const changes = (byRequest.get(r.id) ?? []).filter((e) => e.event_type === 'status_changed')
      return changes.length ? changes[changes.length - 1].actor_user_id : null
    }

    const visible = staffFilter === 'all' ? inRange : inRange.filter((r) => handledBy(r) === staffFilter)

    const counts = Object.fromEntries(GROUPS.map((g) => [g.key, visible.filter((r) => g.statuses.includes(r.status)).length]))
    const flagged = visible.filter((r) => r.ai_needs_review).length

    // Per staff member: actions taken in the selected period.
    const perStaff = new Map<string, { approved: number; declined: number; review: number; cancelled: number; messages: number }>()
    for (const e of events) {
      if (Date.parse(e.created_at) < from || !e.actor_user_id) continue
      if (staffFilter !== 'all' && e.actor_user_id !== staffFilter) continue
      const row = perStaff.get(e.actor_user_id) ?? { approved: 0, declined: 0, review: 0, cancelled: 0, messages: 0 }
      if (e.event_type === 'staff_message') row.messages++
      else if (e.to_status === 'approved') row.approved++
      else if (e.to_status === 'declined') row.declined++
      else if (e.to_status === 'in_review') row.review++
      else if (e.to_status === 'cancelled') row.cancelled++
      perStaff.set(e.actor_user_id, row)
    }

    const perService = new Map<string, number>()
    for (const r of visible) perService.set(r.service?.name ?? 'Unknown', (perService.get(r.service?.name ?? 'Unknown') ?? 0) + 1)

    // Average time from submission to the first staff action.
    const waits: number[] = []
    for (const r of visible) {
      const first = (byRequest.get(r.id) ?? []).find((e) => e.event_type === 'status_changed' || e.event_type === 'staff_message')
      if (first) waits.push(Date.parse(first.created_at) - Date.parse(r.created_at))
    }
    const avgWait = waits.length ? waits.reduce((a, b) => a + b, 0) / waits.length : null

    return { visible, counts, flagged, perStaff, perService, avgWait, handledBy }
  }, [requests, events, range, staffFilter])

  function downloadCsv() {
    if (!report) return
    const header = ['Reference', 'Patient', 'Email', 'Service', 'Status', 'Preferred date', 'Appointment time', 'Handled by', 'AI flagged', 'Received']
    const rows = report.visible.map((r) => [
      r.reference_code,
      r.patient_name,
      r.patient_email,
      r.service?.name ?? '',
      STAFF_STATUS_LABELS[r.status],
      r.preferred_date ?? '',
      r.appointment_time?.slice(0, 5) ?? '',
      r.status === 'submitted' ? '' : staffName(report.handledBy(r)),
      r.ai_needs_review ? 'Yes' : 'No',
      new Date(r.created_at).toISOString(),
    ])
    const csv = [header, ...rows].map((row) => row.map((v) => csvCell(String(v))).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `careroute-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectCls =
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Reports</h1>
          <p className="mt-1 text-sm text-slate-600">Requests received in the selected period, and what the team did with them.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Time period" value={range} onChange={(e) => setRange(e.target.value as Range)} className={selectCls}>
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
          <select aria-label="Staff member" value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} className={selectCls}>
            <option value="all">All staff</option>
            {staff.map((s) => (
              <option key={s.user_id} value={s.user_id}>{s.display_name || s.email}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={!report || report.visible.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="mt-6">
        {error && <Alert title="Couldn't load reports">{error}</Alert>}
        {!report && !error && <Spinner label="Building report…" />}
      </div>

      {report && (
        <>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="New" value={report.counts.new} tone="text-blue-700" />
            <Stat label="In review" value={report.counts.review} tone="text-amber-700" />
            <Stat label="Approved" value={report.counts.approved} tone="text-teal-700" />
            <Stat label="Declined / cancelled" value={report.counts.closed} tone="text-slate-700" />
            <Stat label="AI flagged" value={report.flagged} tone="text-amber-700" />
            <Stat label="Avg. first response" value={report.avgWait === null ? '—' : formatDuration(report.avgWait)} tone="text-slate-900" />
          </div>

          <div className="mt-8 space-y-3">
            {GROUPS.map((g) => {
              const rows = report.visible.filter((r) => g.statuses.includes(r.status))
              return (
                <details key={g.key} className="group rounded-2xl border border-slate-200 bg-white shadow-sm" open={g.key === 'new' && rows.length > 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                    <span className="flex items-center gap-3">
                      <span className="text-slate-400 transition group-open:rotate-90">▸</span>
                      <span className="font-semibold text-slate-900">{g.label}</span>
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-700 tabular-nums">{rows.length}</span>
                  </summary>
                  <div className="border-t border-slate-100 px-5 py-3">
                    {rows.length === 0 ? (
                      <p className="py-2 text-sm text-slate-500">Nothing here for this period.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {rows.map((r) => (
                          <li
                            key={r.id}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm lg:grid lg:grid-cols-[6.5rem_minmax(0,1fr)_12.5rem_12rem_minmax(0,1fr)_10.5rem] lg:gap-x-4"
                          >
                            <Link to={`/staff/requests/${r.id}`} className="font-semibold text-blue-700 hover:underline">{r.reference_code}</Link>
                            <span className="font-medium text-slate-900 lg:truncate">{r.patient_name}</span>
                            <span className="basis-full text-slate-600 lg:basis-auto lg:truncate">{r.service?.name}</span>
                            <span className="text-slate-600">
                              {formatDate(r.preferred_date)}
                              {r.appointment_time && <span className="font-semibold text-teal-700"> · {formatClock(r.appointment_time.slice(0, 5))}</span>}
                            </span>
                            <span className="text-slate-500 lg:truncate">
                              {r.status === 'submitted' ? `Received ${formatDateTime(r.created_at)}` : `by ${staffName(report.handledBy(r))}`}
                            </span>
                            <span className="flex items-center gap-2 justify-self-start lg:justify-self-end">
                              {r.ai_needs_review && <span className="text-xs font-semibold whitespace-nowrap text-amber-700">AI flagged</span>}
                              <StaffStatusBadge status={r.status} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              )
            })}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Panel title="By staff member">
              {report.perStaff.size === 0 ? (
                <p className="text-sm text-slate-500">No staff actions in this period.</p>
              ) : (
                <div className="-mx-1 overflow-x-auto px-1">
                <table className="w-full min-w-[30rem] text-sm">
                  <thead className="text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="py-2">Staff</th>
                      <th className="py-2 text-right">Approved</th>
                      <th className="py-2 text-right">In review</th>
                      <th className="py-2 text-right">Declined</th>
                      <th className="py-2 text-right">Cancelled</th>
                      <th className="py-2 text-right">Messages</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    {[...report.perStaff.entries()].map(([uid, s]) => (
                      <tr key={uid}>
                        <td className="py-2 font-medium text-slate-900">{staffName(uid)}</td>
                        <td className="py-2 text-right">{s.approved}</td>
                        <td className="py-2 text-right">{s.review}</td>
                        <td className="py-2 text-right">{s.declined}</td>
                        <td className="py-2 text-right">{s.cancelled}</td>
                        <td className="py-2 text-right">{s.messages}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </Panel>
            <Panel title="By service">
              {report.perService.size === 0 ? (
                <p className="text-sm text-slate-500">No requests in this period.</p>
              ) : (
                <ul className="space-y-2.5">
                  {[...report.perService.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => {
                    const max = Math.max(...report.perService.values())
                    return (
                      <li key={name} className="text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-700">{name}</span>
                          <span className="font-semibold text-slate-900 tabular-nums">{n}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-teal-500" style={{ width: `${(n / max) * 100}%` }} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            “Handled by” is the staff member who made the latest status change. Average first response is the time from a
            request arriving to the first status change or message.
          </p>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}
