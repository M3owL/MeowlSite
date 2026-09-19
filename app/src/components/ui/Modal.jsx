import { useEffect } from 'react';

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
 */
export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/80">
      <div
        className="flex min-h-full items-center justify-center p-3 sm:p-4"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose?.();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : undefined}
          className={`glass flex max-h-[calc(100dvh-1.5rem)] w-full ${maxWidth} flex-col overflow-hidden rounded-xl border border-slate-700 shadow-2xl sm:max-h-[calc(100dvh-2rem)]`}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-700/70 px-5 py-3.5">
            <div className="min-w-0">
              {typeof title === 'string' ? (
                <h2 className="text-lg font-bold leading-tight text-accent">{title}</h2>
              ) : (
                title
              )}
              {subtitle && (
                <p className="mt-0.5 text-xs font-bold text-slate-500">{subtitle}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-0.5 shrink-0 rounded p-1 text-2xl font-bold leading-none text-slate-500 transition-colors hover:text-white"
            >
              ×
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer && (
            <div className="shrink-0 border-t border-slate-700/70 bg-slate-950/40 px-5 py-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
