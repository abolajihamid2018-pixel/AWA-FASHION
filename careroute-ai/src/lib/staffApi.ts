import type { Database } from './database.types'
import { supabase } from './supabase'

type RequestRow = Database['public']['Tables']['requests']['Row']
export type RequestStatus = Database['public']['Enums']['request_status']

export type StaffRequest = Omit<RequestRow, 'status_token_hash'> & {
  service: { name: string; kind: Database['public']['Enums']['service_kind'] } | null
  suggested_service: { name: string } | null
}

export interface RequestEvent {
  id: number
  event_type: string
  from_status: RequestStatus | null
  to_status: RequestStatus | null
  actor_user_id: string | null
  created_at: string
  message: string | null
  notified_at: string | null
  notify_error: string | null
}

export interface StaffMember {
  user_id: string
  email: string | null
  display_name: string | null
}

// Everything except the token hash, plus the joined service names.
const REQUEST_COLUMNS = `
  id, reference_code, service_id, patient_name, patient_email, patient_phone,
  preferred_date, preferred_time, appointment_time, enquiry, status,
  ai_status, ai_summary, ai_suggested_service_id, ai_confidence, ai_needs_review, ai_reason, ai_error, ai_processed_at,
  created_at, updated_at,
  service:services!requests_service_id_fkey ( name, kind ),
  suggested_service:services!requests_ai_suggested_service_id_fkey ( name )
`

function client() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

export async function listRequests(): Promise<StaffRequest[]> {
  const { data, error } = await client()
    .from('requests')
    .select(REQUEST_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw new Error('Could not load requests.')
  return data as unknown as StaffRequest[]
}

export async function getRequest(id: string): Promise<StaffRequest | null> {
  const { data, error } = await client().from('requests').select(REQUEST_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw new Error('Could not load this request.')
  return data as unknown as StaffRequest | null
}

export async function listRequestEvents(requestId: string): Promise<RequestEvent[]> {
  const { data, error } = await client()
    .from('request_events')
    .select('id, event_type, from_status, to_status, actor_user_id, created_at, message, notified_at, notify_error')
    .eq('request_id', requestId)
    .order('created_at')
  if (error) throw new Error('Could not load request history.')
  return data
}

export async function listStaff(): Promise<StaffMember[]> {
  const { data, error } = await client().from('staff').select('user_id, email, display_name')
  if (error) return []
  return data
}

const STAFF_ERRORS: Record<string, string> = {
  invalid_status_transition: 'That status change is not allowed.',
  status_unchanged: 'The request already has this status.',
  time_required: 'Choose an appointment time before approving.',
  message_required: 'Write a message first.',
  message_too_long: 'Messages can be up to 500 characters.',
  forbidden: 'You do not have permission to update this request.',
  not_found: 'This request no longer exists.',
}

/** Change status, optionally with a confirmed time ("HH:MM") and a message to the patient. */
export async function setRequestStatus(id: string, status: RequestStatus, opts: { time?: string; message?: string } = {}) {
  const { error } = await client().rpc('staff_set_status', {
    p_request_id: id,
    p_status: status,
    p_appointment_time: opts.time || null,
    p_message: opts.message?.trim() || null,
  })
  if (error) throw new Error(STAFF_ERRORS[error.message] ?? 'Could not update the status. Please try again.')
}

/** Send the patient a message without changing the status. */
export async function sendPatientMessage(id: string, message: string) {
  const { error } = await client().rpc('staff_send_message', { p_request_id: id, p_message: message })
  if (error) throw new Error(STAFF_ERRORS[error.message] ?? 'Could not send the message. Please try again.')
}

/** Staff-triggered (re)run of the AI summary for one request. */
export async function rerunAi(id: string): Promise<void> {
  const { error } = await client().functions.invoke('process-request', { body: { request_id: id } })
  if (error) throw new Error('Could not start the AI summary. Please try again.')
}

export type NotifyResult = 'sent' | 'not_configured' | 'failed' | 'skipped'

/** Email the patient about the latest status change. Never throws. */
export async function notifyPatient(id: string): Promise<NotifyResult> {
  try {
    const { data, error } = await client().functions.invoke('send-notification', { body: { request_id: id } })
    if (error) return 'failed'
    if (data?.status === 'sent') return 'sent'
    if (data?.status === 'skipped') return 'skipped'
    return data?.error === 'not_configured' ? 'not_configured' : 'failed'
  } catch {
    return 'failed'
  }
}

/** Which status changes staff can make from each status. */
export const NEXT_STATUSES: Record<RequestStatus, RequestStatus[]> = {
  submitted: ['in_review', 'approved', 'declined', 'cancelled'],
  in_review: ['approved', 'declined', 'cancelled'],
  approved: ['cancelled'],
  declined: ['in_review'],
  cancelled: ['in_review'],
}
