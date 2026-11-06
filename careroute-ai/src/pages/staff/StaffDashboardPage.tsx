import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SparkleIcon } from '../../components/Icons'
import { Alert, Spinner } from '../../components/ui'
import { STAFF_STATUS_LABELS, STATUS_INFO, TIME_LABELS, TONE_CLASSES, formatDate, formatDateTime } from '../../lib/format'
import { listRequests, type RequestStatus, type StaffRequest } from '../../lib/staffApi'

type Filter = 'open' | RequestStatus | 'all'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'submitted', label: 'New' },
  { key: 'in_review', label: 'In review' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All' },
]

const REFRESH_MS = 30_000
const SEEN_KEY = 'careroute.staff.lastSeen'

function readLastSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0
  } catch {
    return 0
  }
}

function matchesFilter(r: StaffRequest, f: Filter) {
  if (f === 'all') return true
  if (f === 'open') return r.status === 'submitted' || r.status === 'in_review'
  return r.status === f
}

export function StaffStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ${TONE_CLASSES[STATUS_INFO[status].tone]}`}>
      {STAFF_STATUS_LABELS[status]}
    </span>
  )
}

function AiCell({ r }: { r: StaffRequest }) {
  if (r.ai_status === 'completed' && r.ai_needs_review) {
    return <span className="text-xs font-semibold text-amber-700">Needs review</span>
  }
  if (r.ai_status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
        <SparkleIcon className="h-3.5 w-3.5" /> Summary ready
      </span>
    )
  }
  if (r.ai_status === 'failed') return <span className="text-xs text-red-700">AI failed</span>
  if (r.ai_status === 'processing') return <span className="text-xs text-blue-700">Processing…</span>
  if (r.ai_status === 'skipped') return <span className="text-xs text-slate-400">No note</span>
  return <span className="text-xs text-slate-400">Not processed</span>
}

export function StaffDashboardPage() {
  const [requests, setRequests] = useState<StaffRequest[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('open')
  const [query, setQuery] = useState('')
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  // Requests newer than this are highlighted as new; captured once per visit.
  const [lastSeen] = useState(readLastSeen)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      setRequests(await listRequests())
      setError(null)
      setLastLoaded(new Date())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // Initial load plus a light polling refresh so new requests appear.
    const first = setTimeout(load, 0)
    const id = setInterval(load, REFRESH_MS)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [load])

  const counts = useMemo(() => {
    const c = Object.fromEntries(FILTERS.map((f) => [f.key, 0])) as Record<Filter, number>
    for (const r of requests ?? []) for (const f of FILTERS) if (matchesFilter(r, f.key)) c[f.key]++
    return c
  }, [requests])

  const newCount = useMemo(
    () => (requests ?? []).filter((r) => r.status === 'submitted' && Date.parse(r.created_at) > lastSeen).length,
    [requests, lastSeen],
  )

  // Remember this visit and surface new requests in the browser tab title.
  useEffect(() => {
    if (!requests) return
    try {
      localStorage.setItem(SEEN_KEY, String(Date.now()))
    } catch {
      /* storage unavailable */
    }
    document.title = newCount > 0 ? `(${newCount}) New requests · CareRoute AI` : 'Requests · CareRoute AI'
    return () => {
      document.title = 'CareRoute AI'
    }
  }, [requests, newCount])

  const isNew = (r: StaffRequest) => r.status === 'submitted' && Date.parse(r.created_at) > lastSeen

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (requests ?? []).filter(
      (r) =>
        matchesFilter(r, filter) &&
        (!q ||
          r.reference_code.toLowerCase().includes(q) ||
          r.patient_name.toLowerCase().includes(q) ||
          r.patient_email.toLowerCase().includes(q)),
    )
  }, [requests, filter, query])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Requests</h1>
          <p className="mt-1 text-sm text-slate-600">
            {lastLoaded ? `Updated ${lastLoaded.toLocaleTimeString()} · refreshes every 30 seconds` : 'Loading…'}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search reference, name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search requests"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:w-72"
          />
          <button
            type="button"
            onClick={load}
            disabled={refreshing}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {newCount > 0 && (
        <div role="status" className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">
          {newCount} new {newCount === 1 ? 'request has' : 'requests have'} arrived since your last visit.
        </div>
      )}

      <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" aria-label="Filter by status" className="flex gap-2">
          {FILTERS.map((f) => {
            const active = f.key === filter
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 tabular-nums ${active ? 'text-blue-100' : 'text-slate-400'}`}>{counts[f.key]}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        {error && <Alert title="Couldn't load requests">{error}</Alert>}
        {!requests && !error && <Spinner label="Loading requests…" />}
        {requests && visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No requests match this view.
          </div>
        )}

        {requests && visible.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Preferred</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">AI</th>
                    <th className="px-4 py-3">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50/40">
                      <td className="px-4 py-3">
                        <Link to={`/staff/requests/${r.id}`} className="font-semibold text-blue-700 hover:underline">
                          {r.reference_code}
                        </Link>
                        {isNew(r) && <span className="ml-2 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">New</span>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{r.patient_name}</p>
                        <p className="text-xs text-slate-500">{r.patient_email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{r.service?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDate(r.preferred_date)}
                        <p className="text-xs text-slate-500">{TIME_LABELS[r.preferred_time as keyof typeof TIME_LABELS]}</p>
                      </td>
                      <td className="px-4 py-3"><StaffStatusBadge status={r.status} /></td>
                      <td className="px-4 py-3"><AiCell r={r} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDateTime(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {visible.map((r) => (
                <li key={r.id}>
                  <Link to={`/staff/requests/${r.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-blue-700">{r.reference_code}</span>
                      <StaffStatusBadge status={r.status} />
                    </div>
                    <p className="mt-2 font-medium text-slate-900">{r.patient_name}</p>
                    <p className="text-sm text-slate-600">{r.service?.name}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Preferred {formatDate(r.preferred_date)}</span>
                      <AiCell r={r} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
