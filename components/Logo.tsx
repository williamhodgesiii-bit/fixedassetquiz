export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
        {/* Paw + chart mark */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M4 19h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M7 15v-3M12 15V8M17 15v-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="7" cy="6.5" r="1.4" fill="currentColor" />
          <circle cx="12" cy="4.5" r="1.4" fill="currentColor" />
          <circle cx="17" cy="6.5" r="1.4" fill="currentColor" />
        </svg>
      </span>
      <span className="text-base font-bold tracking-tight text-slate-900">
        Mission Pet Health
      </span>
    </span>
  );
}
