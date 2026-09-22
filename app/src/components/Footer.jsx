import { BRAND, NAV_TABS } from '../lib/constants';

/** Smooth scrolling is opt-out for visitors who asked for less motion. */
function scrollBehavior() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'auto';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/**
 * Site footer: brand, navigation, contact and a back-to-top control.
 *
 * `onNavigate` is optional so the footer still renders (and the smoke test still
 * passes) when it is mounted without props.
 */
export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear();

  const goToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  return (
    <footer className="relative z-10 border-t border-line bg-surface/40">
      <div className="container-page py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <p className="font-display text-h4 text-ink">{BRAND.name}</p>
            <p className="mt-1 text-caption text-faint">{BRAND.role}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow">Navigate</h2>
            <ul className="mt-3 space-y-2">
              {NAV_TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(tab.id)}
                    className="text-caption text-muted transition-colors duration-250 ease-expo hover:text-accent"
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow">Contact</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="text-caption text-muted transition-colors duration-250 ease-expo hover:text-accent"
                >
                  {BRAND.email}
                </a>
              </li>
              <li className="text-caption text-muted">
                Discord <span className="font-mono text-ink">{BRAND.discord}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-faint">
            &copy; {year} {BRAND.name} &middot; {BRAND.handle} &middot;{' '}
            <span className="font-mono">_m3owl</span>
          </p>

          <button type="button" onClick={goToTop} className="btn-quiet self-start sm:self-auto">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
