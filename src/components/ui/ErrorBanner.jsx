export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-8 flex items-start justify-between gap-4 rounded-xl border border-red-500/50 bg-red-950/40 p-4 text-sm text-red-200"
    >
      <span>
        <b>Error:</b> {message}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="-mt-1 shrink-0 text-lg font-bold leading-none hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
