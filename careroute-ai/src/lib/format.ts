import type { PreferredTime, RequestStatus } from './api'

/** Clinic shown throughout the app. */
export const CLINIC_NAME = 'CareRoute Clinic'

export function formatDate(iso: string | null): string {
  if (!iso) return 'No preference'
  // Date-only strings are parsed as local dates to avoid timezone shifts.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export const TIME_LABELS: Record<PreferredTime, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  any: 'Any time',
}

/**
 * Patient-facing status copy. Only `approved` is ever presented as confirmed.
 */
export const STATUS_INFO: Record<
  RequestStatus,
  { label: string; description: string; tone: 'blue' | 'amber' | 'teal' | 'slate' | 'red' }
> = {
  submitted: {
    label: 'Request received',
    description: 'Your request has been received and is waiting for clinic staff. It is not a confirmed appointment yet.',
    tone: 'blue',
  },
  in_review: {
    label: 'Under review',
    description: 'A member of the clinic team is reviewing your request. It is not a confirmed appointment yet.',
    tone: 'amber',
  },
  approved: {
    label: 'Approved by the clinic',
    description: 'Clinic staff have approved your request. The clinic will contact you with any final details.',
    tone: 'teal',
  },
  declined: {
    label: 'Not approved',
    description: 'The clinic could not approve this request. Please contact the clinic or submit a new request.',
    tone: 'red',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This request has been cancelled.',
    tone: 'slate',
  },
}

export const TONE_CLASSES = {
  blue: 'bg-blue-50 text-blue-800 ring-blue-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  teal: 'bg-teal-50 text-teal-800 ring-teal-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  red: 'bg-red-50 text-red-800 ring-red-200',
} as const

export function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Staff-facing status labels (shorter than the patient copy). */
export const STAFF_STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: 'New',
  in_review: 'In review',
  approved: 'Approved',
  declined: 'Declined',
  cancelled: 'Cancelled',
}

/** Button labels for moving a request *to* a status. */
export const STATUS_ACTION_LABELS: Record<RequestStatus, string> = {
  submitted: 'Mark as new',
  in_review: 'Mark in review',
  approved: 'Approve',
  declined: 'Decline',
  cancelled: 'Cancel request',
}
