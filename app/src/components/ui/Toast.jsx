import { useEffect, useRef, useState } from 'react';

/** Must match the exit transition duration below. */
const EXIT_MS = 200;

/**
 * Transient status message.
 *
 * `App.jsx` clears the message after `TOAST_MS`, so the toast keeps the last
 * message mounted for one exit animation instead of vanishing on the same
 * frame. The dismiss button clears it locally, which means no extra wiring is
 * required -- pass `onDismiss` only if the caller wants to clear its own state.
 */
export default function Toast({ message, onDismiss }) {
  const [shown, setShown] = useState('');
  const [closing, setClosing] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (message) {
      setShown(message);
      setClosing(false);
      return undefined;
    }

    if (!shown) return undefined;

    setClosing(true);
    timerRef.current = setTimeout(() => {
      setShown('');
      setClosing(false);
    }, EXIT_MS);

    return () => clearTimeout(timerRef.current);
  }, [message, shown]);

  const dismiss = () => {
    if (closing) return;

    setClosing(true);
    onDismiss?.();

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShown('');
      setClosing(false);
    }, EXIT_MS);
  };

  if (!shown) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 z-[300] flex items-start gap-3 rounded-xl border border-line-strong bg-surface-2/95 p-3.5 shadow-e3 backdrop-blur-xl transition-[opacity,transform] duration-250 ease-expo sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm ${
        closing ? 'translate-y-2 opacity-0' : 'animate-fade-up'
      }`}
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
        strokeLinejoin="round"
        className="mt-0.5 shrink-0 text-accent"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
      </svg>

      <p className="min-w-0 flex-1 text-body text-ink">{shown}</p>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-muted transition-colors duration-250 ease-expo hover:bg-white/[0.06] hover:text-ink"
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
