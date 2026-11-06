export function Logo({ className = '' }: { className?: string }) {
  return (
    <a href="#top" className={`flex items-center gap-2.5 ${className}`} aria-label="CareRoute AI home">
      <svg viewBox="0 0 32 32" className="h-9 w-9" aria-hidden="true">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#logo-g)" />
        <path d="M9 21c3 0 4-10 7-10s4 10 7 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="9" cy="21" r="2" fill="#fff" />
        <circle cx="23" cy="21" r="2" fill="#fff" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        CareRoute <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">AI</span>
      </span>
    </a>
  )
}
