import { BRAND, NAV_TABS } from '../lib/constants';

function scrollBehavior() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'auto';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear();
  const goToTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  return (
    <footer className="relative z-10 border-t border-line bg-surface/50">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-12 border-b border-line pb-12 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Let's make it read right</p>
            <h2 className="mt-4 max-w-2xl text-display-2">Bring your game to Polish players.</h2>
            <a href={`mailto:${BRAND.email}`} className="mt-7 inline-flex items-center gap-2 font-display text-h4 text-accent transition-colors hover:text-accent-2">
              {BRAND.email}<span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="lg:justify-self-end">
            <p className="font-display text-h3 text-ink">{BRAND.name}</p>
            <p className="mt-1 text-caption text-muted">{BRAND.role} · {BRAND.location}</p>
            <p className="mt-4 text-caption text-faint">Discord <span className="font-mono text-ink">{BRAND.discord}</span></p>
          </div>
        </div>

        <div className="flex flex-col gap-7 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_TABS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => onNavigate?.(tab.id)} className="text-caption text-muted transition-colors hover:text-accent">
                {tab.label}
              </button>
            ))}
          </nav>
          <button type="button" onClick={goToTop} className="self-start text-caption text-muted transition-colors hover:text-accent">
            Back to top ↑
          </button>
        </div>
        <p className="mt-8 font-mono text-xs text-faint">© {year} {BRAND.name} · {BRAND.handle}</p>
      </div>
    </footer>
  );
}
