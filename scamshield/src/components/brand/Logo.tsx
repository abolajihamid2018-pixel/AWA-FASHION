import { Link } from 'react-router-dom';

/** The ScamShield mark: a shield (protection) with a check (trust confirmed). */
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ss-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 4.5 6.8v8.4c0 7.1 4.9 12.4 11.5 14.3 6.6-1.9 11.5-7.2 11.5-14.3V6.8L16 2.5Z"
        fill="#0f1a30"
        stroke="url(#ss-edge)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m10.5 16 3.8 3.8 7.4-7.6"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5 rounded-lg" aria-label="ScamShield home">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-slate-50">
        Scam<span className="text-teal-300">Shield</span>
      </span>
    </Link>
  );
}
