import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, NotConfigured, PageShell, Spinner } from '../components/ui'
import { fetchServices, submitRequest, type PreferredTime, type Service } from '../lib/api'
import { CLINIC_NAME, todayISO } from '../lib/format'
import { isSupabaseConfigured } from '../lib/supabase'

const ENQUIRY_MAX = 500
const inputCls =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'

function Field({ label, htmlFor, hint, optional, children }: {
  label: string
  htmlFor: string
  hint?: ReactNode
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-800">
        {label} {optional && <span className="font-normal text-slate-500">(optional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function RequestPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [services, setServices] = useState<Service[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [serviceId, setServiceId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState<PreferredTime>('any')
  const [enquiry, setEnquiry] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('') // honeypot — real users never see or fill this

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    fetchServices()
      .then((list) => {
        if (cancelled) return
        setServices(list)
        const match = list.find((s) => s.slug === slug)
        setServiceId(match?.id ?? '')
      })
      .catch((e: Error) => !cancelled && setLoadError(e.message))
    return () => {
      cancelled = true
    }
  }, [slug])

  const service = useMemo(() => services?.find((s) => s.id === serviceId), [services, serviceId])
  const isAppointment = service?.kind !== 'administrative'
  const minDate = todayISO()
  const maxDate = todayISO(180)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (website) return // likely a bot
    if (!service) {
      setSubmitError('Please choose a service.')
      return
    }
    setSubmitting(true)
    try {
      const result = await submitRequest({
        serviceId: service.id,
        name,
        email,
        phone,
        preferredDate,
        preferredTime,
        enquiry,
        consent,
      })
      navigate('/request/submitted', {
        replace: true,
        state: { ...result, serviceName: service.name },
      })
    } catch (err) {
      setSubmitError((err as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <PageShell
      narrow
      title={service ? service.name : 'Make a request'}
      intro={
        <>
          Send a request to {CLINIC_NAME}. Clinic staff will review it — <strong className="text-slate-800">it is not a
          confirmed appointment until they approve it.</strong>
        </>
      }
    >
      {!isSupabaseConfigured && <NotConfigured />}
      {loadError && <Alert title="Couldn't load services">{loadError}</Alert>}
      {isSupabaseConfigured && !services && !loadError && <Spinner />}

      {services && (
        <form onSubmit={onSubmit} noValidate={false} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Field label="Service" htmlFor="service">
            <select
              id="service"
              required
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value)
                const next = services.find((s) => s.id === e.target.value)
                if (next) navigate(`/request/${next.slug}`, { replace: true })
              }}
              className={inputCls}
            >
              <option value="" disabled>
                Choose a service…
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name">
              <input id="name" required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Email" htmlFor="email" hint="We'll use this to contact you about your request.">
              <input id="email" type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Field label="Phone" htmlFor="phone" optional>
            <input id="phone" type="tel" maxLength={30} pattern="[0-9+()\-. ]{6,30}" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label={isAppointment ? 'Preferred appointment date' : 'Preferred contact date'}
              htmlFor="date"
              optional={!isAppointment}
            >
              <input
                id="date"
                type="date"
                required={isAppointment}
                min={minDate}
                max={maxDate}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Preferred time of day" htmlFor="time">
              <select id="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value as PreferredTime)} className={inputCls}>
                <option value="any">Any time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            </Field>
          </div>

          <Field
            label="Administrative note"
            htmlFor="enquiry"
            optional
            hint={
              <span className="flex justify-between gap-4">
                <span>Scheduling or paperwork details only. Please don't include symptoms or medical information.</span>
                <span className="shrink-0 tabular-nums">{enquiry.length}/{ENQUIRY_MAX}</span>
              </span>
            }
          >
            <textarea
              id="enquiry"
              rows={4}
              maxLength={ENQUIRY_MAX}
              value={enquiry}
              onChange={(e) => setEnquiry(e.target.value)}
              placeholder="e.g. I can only come in after 2pm on weekdays."
              className={inputCls}
            />
          </Field>

          {/* Honeypot field, hidden from people and assistive tech */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
            />
            <span>
              I understand this is a <strong>request, not a confirmed appointment</strong>, that this demo uses
              fictional data, and that I haven't included medical information.
            </span>
          </label>

          {submitError && <Alert title="Your request wasn't sent">{submitError}</Alert>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/services" className="text-center text-sm font-medium text-slate-600 hover:text-slate-900">
              ← Back to services
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      )}
    </PageShell>
  )
}
