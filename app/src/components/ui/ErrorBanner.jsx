export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-8 flex animate-slide-in-down items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-body text-red-200"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="mt-0.5 shrink-0 text-red-300"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5" />
        <path d="M12 16.5h.01" />
      </svg>

      <p className="min-w-0 flex-1">
        <span className="font-semibold">Error:</span> {message}
      </p>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-red-300 transition-colors duration-250 ease-expo hover:bg-red-500/20 hover:text-white"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
