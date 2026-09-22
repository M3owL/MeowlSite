import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Accessible modal shell.
 *
 * Layout note: the backdrop is the scroll container, and the panel sits inside
 * an inner wrapper with `min-h-full`. Centring must happen on that inner
 * wrapper, not on the scroll container itself.
 *
 * The old version put `overflow-y-auto` and `items-center` on the same element.
 * When the panel grew taller than the viewport, centring pushed its top above
 * the scroll origin -- an area you cannot scroll back to. On a long form that
 * meant the header and the submit button were both unreachable.
 *
 * The panel is also capped to the viewport height, with the header pinned and
 * only the body scrolling, so a tall form can never run off screen.
 *
 * Motion: the backdrop fades and the panel scales in. Closing plays the reverse
 * for `EXIT_MS` before `onClose` fires, so the dialog is never yanked away
 * mid-frame.
 */

/** Must match the exit transition duration below. */
const EXIT_MS = 150;

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  const [closing, setClosing] = useState(false);
  const [entered, setEntered] = useState(false);

  const panelRef = useRef(null);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const timerRef = useRef(0);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  /** Fades the backdrop in on the frame after mount. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /**
   * Stable on purpose: the focus/scroll-lock effect below depends on it, and a
   * new identity while closing would tear the trap down and re-run it, which
   * flashes focus back to the first control mid-exit.
   */
  const requestClose = useCallback(() => {
    if (closingRef.current) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      onCloseRef.current?.();
      return;
    }

    closingRef.current = true;
    setClosing(true);
    timerRef.current = setTimeout(() => onCloseRef.current?.(), EXIT_MS);
  }, []);

  /** Focus trap, Escape to close, body scroll lock, focus restore on unmount. */
  useEffect(() => {
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement;

    const focusable = () =>
      Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (node) => node.getClientRects().length > 0,
      );

    const firstFocusable = focusable()[0];
    if (firstFocusable) firstFocusable.focus();
    else panel.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const list = focusable();

      if (list.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      const inside = panel.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first || active === panel) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [requestClose]);

  const stringTitle = typeof title === 'string';

  return (
    <div
      className={`fixed inset-0 z-[200] overflow-y-auto bg-black/80 backdrop-blur-sm transition-opacity duration-250 ease-expo ${
        entered && !closing ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="flex min-h-full items-center justify-center p-3 sm:p-4"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : 'Dialog'}
          tabIndex={-1}
          className={`relative flex max-h-[calc(100dvh-1.5rem)] w-full ${maxWidth} flex-col overflow-hidden rounded-xl border border-line bg-surface-2/95 shadow-e4 backdrop-blur-xl transition-[opacity,transform] duration-150 ease-expo sm:max-h-[calc(100dvh-2rem)] ${
            closing ? 'scale-[0.98] opacity-0' : 'animate-scale-in'
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
          />

          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {stringTitle ? (
                <h2 id={titleId} className="font-display text-h3 leading-tight text-ink">
                  {title}
                </h2>
              ) : (
                <div id={titleId}>{title}</div>
              )}

              {subtitle && <p className="mt-1 text-caption text-faint">{subtitle}</p>}
            </div>

            <button
              type="button"
              onClick={requestClose}
              aria-label="Close"
              className="-mr-1 -mt-0.5 shrink-0 rounded-md p-1.5 text-muted transition-colors duration-250 ease-expo hover:bg-white/[0.06] hover:text-ink"
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
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

          {footer && (
            <div className="shrink-0 border-t border-line bg-void/40 px-5 py-3.5 sm:px-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
