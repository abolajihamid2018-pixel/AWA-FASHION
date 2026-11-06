import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckIcon, CopyIcon } from '../components/Icons'
import { Alert, ButtonLink, PageShell } from '../components/ui'

interface SubmittedState {
  reference_code: string
  status_token: string
  serviceName: string
}

export function SubmittedPage() {
  const state = useLocation().state as SubmittedState | null
  const [copied, setCopied] = useState(false)

  if (!state?.status_token) {
    return (
      <PageShell narrow title="Request submitted">
        <p className="text-slate-600">
          There's nothing to show here. If you just submitted a request, use the status link you saved.
        </p>
        <div className="mt-6">
          <ButtonLink to="/services">Browse services</ButtonLink>
        </div>
      </PageShell>
    )
  }

  const statusPath = `/status/${state.status_token}`
  const statusUrl = `${window.location.origin}${statusPath}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(statusUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — user can select the text manually */
    }
  }

  return (
    <PageShell narrow title="Request received">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <CheckIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm text-slate-500">Reference</p>
            <p className="text-xl font-bold tracking-wide text-slate-900">{state.reference_code}</p>
          </div>
        </div>

        <p className="mt-6 leading-relaxed text-slate-700">
          Your <strong>{state.serviceName}</strong> request has been sent to the clinic. Staff will review it.{' '}
          <strong>This is not a confirmed appointment yet.</strong>
        </p>

        <div className="mt-6">
          <Alert tone="amber" title="Save your private status link">
            This link is the only way to check your request status in this prototype, and it's shown only once.
            Anyone with the link can see the request's status, so keep it private.
          </Alert>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={statusUrl}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Private status link"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-700"
            />
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <CopyIcon className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to={statusPath}>View request status</ButtonLink>
          <Link to="/" className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
            Back to home
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
