// CareRoute AI — send-notification Edge Function (milestone 4)
//
// Emails the patient (via Resend) about their request. Never affects the saved request.
//   - Patient browser right after submitting: { status_token } -> "request received" email (once)
//   - Signed-in staff after a status change:  { request_id }   -> email for the latest status change (once)
//
// Secrets: RESEND_API_KEY (or resend_api_key), optional EMAIL_FROM, optional PUBLIC_APP_URL
// (defaults to the Vercel deployment; used for the private status link in the "received" email).

import { createClient } from 'npm:@supabase/supabase-js@2'

const RESEND_API_KEY = (Deno.env.get('RESEND_API_KEY') ?? Deno.env.get('resend_api_key'))?.trim()
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'CareRoute AI <onboarding@resend.dev>'
// Public site address used for the status link (override with the PUBLIC_APP_URL secret).
const APP_URL = (Deno.env.get('PUBLIC_APP_URL')?.trim() || 'https://careroute-ai.vercel.app').replace(/\/+$/, '')
const CLINIC_NAME = 'Riverside Community Clinic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function isStaffCaller(req: Request): Promise<boolean> {
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!jwt || jwt.startsWith('sb_')) return false
  const { data, error } = await admin.auth.getUser(jwt)
  if (error || !data.user) return false
  const { data: staff } = await admin.from('staff').select('user_id').eq('user_id', data.user.id).maybeSingle()
  return Boolean(staff)
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const STATUS_COPY: Record<string, { subject: string; line: string }> = {
  in_review: {
    subject: 'is being reviewed',
    line: 'A member of the clinic team is reviewing your request. It is not a confirmed appointment yet.',
  },
  approved: {
    subject: 'has been approved',
    line: 'Clinic staff have approved your request. The clinic will contact you with any final details.',
  },
  declined: {
    subject: 'could not be approved',
    line: 'The clinic could not approve this request. Please contact the clinic or submit a new request.',
  },
  cancelled: { subject: 'has been cancelled', line: 'This request has been cancelled.' },
}

function layout(title: string, paragraphs: string[], cta?: { href: string; label: string }) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px;line-height:1.55">${p}</p>`).join('')
  const button = cta
    ? `<p style="margin:20px 0"><a href="${esc(cta.href)}" style="background:#2563eb;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600;display:inline-block">${esc(cta.label)}</a></p>`
    : ''
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Inter,Segoe UI,Arial,sans-serif;color:#334155">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px">
    <p style="margin:0 0 18px;font-weight:700;font-size:18px;color:#0f172a">CareRoute <span style="color:#0d9488">AI</span></p>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:24px">
      <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a">${esc(title)}</h1>${body}${button}
    </div>
    <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#64748b">
      Sent by CareRoute AI on behalf of ${CLINIC_NAME}. Administrative messages only — not medical advice.
      In an emergency, call 911 or your local emergency number.
    </p>
  </div></body></html>`
}

async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!RESEND_API_KEY) throw new Error('Email is not configured (RESEND_API_KEY secret is missing)')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html, text }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: { status_token?: string; request_id?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_body' }, 400)
  }

  let requestId: string | null = null
  let mode: 'received' | 'status' = 'received'
  let statusToken: string | null = null

  if (typeof body.request_id === 'string') {
    if (!(await isStaffCaller(req))) return json({ error: 'forbidden' }, 403)
    requestId = body.request_id
    mode = 'status'
  } else if (typeof body.status_token === 'string' && /^[0-9a-f]{48}$/.test(body.status_token)) {
    statusToken = body.status_token
    const { data } = await admin
      .from('requests')
      .select('id')
      .eq('status_token_hash', await sha256Hex(statusToken))
      .maybeSingle()
    requestId = data?.id ?? null
  }
  if (!requestId) return json({ error: 'not_found' }, 404)

  const { data: request } = await admin
    .from('requests')
    .select('id, reference_code, patient_name, patient_email, status, service:services!requests_service_id_fkey(name)')
    .eq('id', requestId)
    .maybeSingle()
  if (!request) return json({ error: 'not_found' }, 404)

  // Pick the event this email is about.
  const eventQuery = admin.from('request_events').select('id, to_status, notified_at').eq('request_id', requestId)
  const { data: event } =
    mode === 'received'
      ? await eventQuery.eq('event_type', 'created').maybeSingle()
      : await eventQuery.eq('event_type', 'status_changed').order('id', { ascending: false }).limit(1).maybeSingle()
  if (!event) return json({ status: 'skipped', reason: 'no_event' })
  if (event.notified_at) return json({ status: 'skipped', reason: 'already_sent' })

  // Claim the event so concurrent calls don't send twice.
  const { data: claimed } = await admin
    .from('request_events')
    .update({ notified_at: new Date().toISOString(), notify_error: null })
    .eq('id', event.id)
    .is('notified_at', null)
    .select('id')
    .maybeSingle()
  if (!claimed) return json({ status: 'skipped', reason: 'already_sent' })

  const serviceName = (request.service as { name: string } | null)?.name ?? 'your request'
  const name = esc(request.patient_name)
  const ref = esc(request.reference_code)

  try {
    if (mode === 'received') {
      const link = APP_URL && statusToken ? `${APP_URL}/status/${statusToken}` : null
      const subject = `We received your request ${request.reference_code}`
      const paragraphs = [
        `Hi ${name},`,
        `${CLINIC_NAME} has received your <strong>${esc(serviceName)}</strong> request (reference <strong>${ref}</strong>).`,
        '<strong>This is not a confirmed appointment yet.</strong> Clinic staff will review it and you can follow its status online.',
        link
          ? 'Keep this email private — the button below opens your personal status page.'
          : 'Use the private status link shown when you submitted your request to follow its progress.',
      ]
      const text = [
        `Hi ${request.patient_name},`,
        `${CLINIC_NAME} has received your ${serviceName} request (reference ${request.reference_code}).`,
        'This is not a confirmed appointment yet. Clinic staff will review it.',
        link ? `Your private status page: ${link}` : '',
      ].join('\n\n')
      await sendEmail(request.patient_email, subject, layout('Request received', paragraphs, link ? { href: link, label: 'View request status' } : undefined), text)
    } else {
      const copy = STATUS_COPY[event.to_status ?? '']
      if (!copy) throw new Error(`No email template for status ${event.to_status}`)
      const subject = `Your request ${request.reference_code} ${copy.subject}`
      const paragraphs = [
        `Hi ${name},`,
        `Update on your <strong>${esc(serviceName)}</strong> request (reference <strong>${ref}</strong>):`,
        `<strong>${esc(copy.line)}</strong>`,
        'You can see the full history on your private status page.',
      ]
      const text = `Hi ${request.patient_name},\n\nUpdate on your ${serviceName} request (reference ${request.reference_code}):\n\n${copy.line}`
      await sendEmail(request.patient_email, subject, layout('Request update', paragraphs), text)
    }
    return json({ status: 'sent' })
  } catch (err) {
    const message = (err instanceof Error ? err.message : String(err)).slice(0, 500)
    console.error('send-notification failed', requestId, message)
    // Un-claim so it can be retried, and record why it failed.
    await admin.from('request_events').update({ notified_at: null, notify_error: message }).eq('id', event.id)
    return json({ status: 'failed', error: message.startsWith('Email is not configured') ? 'not_configured' : 'send_failed' })
  }
})
