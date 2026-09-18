import { useEffect } from 'react';

/** Accessible modal shell: Escape to close, click-outside to close, scroll locked. */
export default function Modal({ title, subtitle, onClose, children, maxWidth = 'max-w-lg' }) {
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
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`glass my-8 w-full ${maxWidth} rounded-xl border border-slate-700 p-6 shadow-2xl`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {typeof title === 'string' ? (
              <h2 className="text-xl font-bold text-accent">{title}</h2>
            ) : (
              title
            )}
            {subtitle && <p className="mt-1 text-xs font-bold text-slate-500">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded p-1 text-2xl font-bold leading-none text-slate-500 transition-colors hover:text-white"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
