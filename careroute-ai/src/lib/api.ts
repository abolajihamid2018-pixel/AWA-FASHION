import type { Database } from './database.types'
import { supabase } from './supabase'

export type Service = Pick<
  Database['public']['Tables']['services']['Row'],
  'id' | 'slug' | 'name' | 'description' | 'kind'
>
export type RequestStatus = Database['public']['Enums']['request_status']
export type PreferredTime = 'morning' | 'afternoon' | 'any'

export interface SubmitRequestInput {
  serviceId: string
  name: string
  email: string
  phone: string
  preferredDate: string // yyyy-mm-dd or ''
  preferredTime: PreferredTime
  enquiry: string
  consent: boolean
}

export interface SubmitRequestResult {
  reference_code: string
  status_token: string
}

export interface RequestStatusView {
  reference_code: string
  service_name: string
  service_kind: Database['public']['Enums']['service_kind']
  preferred_date: string | null
  preferred_time: PreferredTime
  status: RequestStatus
  created_at: string
  updated_at: string
  history: { status: RequestStatus; at: string }[]
}

export class NotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured.')
  }
}

/** Friendly messages for the error codes raised by public.submit_request. */
const SUBMIT_ERRORS: Record<string, string> = {
  consent_required: 'Please confirm the acknowledgement before submitting.',
  invalid_service: 'That service is no longer available. Please choose another one.',
  invalid_name: 'Please enter your name (2–100 characters).',
  invalid_email: 'Please enter a valid email address.',
  invalid_phone: 'Please enter a valid phone number, or leave it blank.',
  invalid_time: 'Please choose a preferred time of day.',
  date_required: 'Please choose a preferred appointment date.',
  invalid_date: 'Please choose a date between today and 6 months from now.',
  enquiry_too_long: 'Your message is too long (500 characters maximum).',
  rate_limited: 'Too many requests from this email address. Please try again later.',
}

function client() {
  if (!supabase) throw new NotConfiguredError()
  return supabase
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await client()
    .from('services')
    .select('id, slug, name, description, kind')
    .order('sort_order')
  if (error) throw new Error('We could not load clinic services. Please try again.')
  return data
}

export async function submitRequest(input: SubmitRequestInput): Promise<SubmitRequestResult> {
  // Optional fields are sent as null; the database function validates everything again.
  const args = {
    p_service_id: input.serviceId,
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone.trim() || null,
    p_preferred_date: input.preferredDate || null,
    p_preferred_time: input.preferredTime,
    p_enquiry: input.enquiry.trim() || null,
    p_consent: input.consent,
  } as unknown as Database['public']['Functions']['submit_request']['Args']

  const { data, error } = await client().rpc('submit_request', args)
  if (error) {
    throw new Error(SUBMIT_ERRORS[error.message] ?? 'Something went wrong while sending your request. Please try again.')
  }
  const result = data as unknown as SubmitRequestResult
  // The request is already saved. In the background, ask the server to generate the staff-facing
  // AI summary and send the confirmation email; failures are recorded server-side only.
  const body = { status_token: result.status_token }
  void client().functions.invoke('process-request', { body }).catch(() => undefined)
  void client().functions.invoke('send-notification', { body }).catch(() => undefined)
  return result
}

export async function getRequestStatus(token: string): Promise<RequestStatusView | null> {
  const { data, error } = await client().rpc('get_request_status', { p_token: token })
  if (error) throw new Error('We could not load this request. Please try again.')
  return (data as unknown as RequestStatusView | null) ?? null
}
