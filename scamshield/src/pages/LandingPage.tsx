import {
  ArrowRight,
  BookOpen,
  ClipboardPaste,
  EyeOff,
  History,
  Link2,
  ListChecks,
  Lock,
  MessageSquareWarning,
  ScanSearch,
  ServerCog,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { ResultReport } from '../components/analysis/ResultReport';
import { ButtonLink } from '../components/ui/Button';
import { DemoTag } from '../components/ui/Notice';
import { buildSampleResult } from '../services/analysisService';

const STEPS = [
  {
    icon: ClipboardPaste,
    title: 'Paste it',
    body: 'Copy a suspicious message or link from WhatsApp, SMS, email or social media and paste it in.',
  },
  {
    icon: ScanSearch,
    title: 'We check for warning signs',
    body: 'ScamShield looks for known scam patterns: requests for OTPs, pressure tactics, lookalike websites and more.',
  },
  {
    icon: ListChecks,
    title: 'Understand and act',
    body: 'Get a risk level, the exact evidence behind it in plain language, and clear next steps.',
  },
];

const CAPABILITIES = [
  {
    icon: MessageSquareWarning,
    title: 'Message analysis',
    body: 'Spot impersonation, OTP and PIN requests, fake job and investment offers, threats and urgency.',
  },
  {
    icon: Link2,
    title: 'Link analysis',
    body: 'Examine lookalike domains, suspicious structure, shortened links and threat reports, without opening the link.',
  },
  {
    icon: ShieldCheck,
    title: 'Explainable risk score',
    body: 'Every score from 0 to 100 is built from listed warning signs, so you can see exactly why.',
  },
  {
    icon: History,
    title: 'Analysis history',
    body: 'Look back at earlier checks and delete any of them at any time.',
  },
  {
    icon: BookOpen,
    title: 'Learn the patterns',
    body: 'Short guides to the scams most common in Nigeria and how to protect yourself.',
  },
];

export default function LandingPage() {
  const example = useMemo(() => buildSampleResult('msg-bank-otp'), []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[480px] max-w-4xl rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="container-page relative pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/[0.06] px-3 py-1 text-xs font-medium text-teal-200">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Scam detection for everyday people
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Think before you <span className="text-teal-300">trust.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              Identify suspicious messages and links, understand potential threats and make safer decisions online.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink to="/analyse" size="lg">
                Analyse something suspicious
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="/#how-it-works" size="lg" variant="secondary">
                Learn how it works
              </ButtonLink>
            </div>
            <p className="mt-5 text-xs text-slate-500">Prototype: the detection engine is in development. Free, no account, nothing you paste is stored.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-white/[0.06] bg-ink-950/40 py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three steps to a safer decision</h2>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-slate-500">Step {i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">What ScamShield does</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">More than "scam" or "not scam"</h2>
            <p className="mt-3 text-slate-400">
              ScamShield shows what looks suspicious, why it matters, how confident the assessment is and what to do
              next.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="card p-6">
                <c.icon className="h-5 w-5 text-teal-300" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example result */}
      <section className="border-y border-white/[0.06] bg-ink-950/40 py-20">
        <div className="container-page grid items-start gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <p className="eyebrow">Example result</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">See the evidence, not just a label</h2>
            <p className="mt-3 leading-relaxed text-slate-400">
              Each warning sign shows the exact words that triggered it and how many points it added to the score.
            </p>
            <blockquote className="mt-6 rounded-xl border border-white/[0.06] bg-ink-850 p-4 text-sm leading-relaxed text-slate-300">
              “{example.sampleContent}”
            </blockquote>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink to="/example/msg-bank-otp" variant="secondary">
                Open the full report
              </ButtonLink>
              <DemoTag />
            </div>
          </div>
          <div className="lg:col-span-3">
            <ResultReport result={example} compact />
          </div>
        </div>
      </section>

      {/* Security & privacy */}
      <section className="py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Security and privacy</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built to protect you, not to collect from you</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <PrivacyPoint icon={EyeOff} title="Your content is not kept">
              What you paste is used to run the check and is not stored. History keeps only the result summary.
            </PrivacyPoint>
            <PrivacyPoint icon={ServerCog} title="Links are never opened on your device">
              Link checks (coming in Stage 3) will run on our server with strict safety limits, so suspicious pages never load in your browser.
            </PrivacyPoint>
            <PrivacyPoint icon={Lock} title="Honest about limits">
              Every report says what could not be checked. A low score is guidance, never a guarantee.
            </PrivacyPoint>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page">
        <div className="card flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Got a message that doesn't feel right?</h2>
            <p className="mt-2 text-slate-400">Check it before you click, reply or pay.</p>
          </div>
          <ButtonLink to="/analyse" size="lg">
            Analyse something suspicious
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

function PrivacyPoint({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Lock;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="card p-6">
      <Icon className="h-5 w-5 text-sky-300" aria-hidden="true" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{children}</p>
    </div>
  );
}
