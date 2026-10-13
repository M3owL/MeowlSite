import { ABOUT, BRAND, CONTACT, SAMPLES, STATS } from '../lib/constants';
import Reveal from '../components/ui/Reveal';
import { useCountUp, useInView } from '../lib/motion';

function ArrowRight() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}

function StatValue({ value, suffix, active }) {
  const count = useCountUp(value, active);
  return <span className="font-display text-h1 font-semibold leading-none text-ink">{count.toLocaleString('en-US')}<span className="text-accent">{suffix}</span></span>;
}

export default function AboutTab({ metrics = {}, onNavigate }) {
  const [statsRef, statsInView] = useInView();
  const stats = STATS.map((stat) => ({ ...stat, value: Number(metrics[stat.id]) || 0 }))
    .filter((stat) => stat.value > 0);
  const sample = SAMPLES[0];

  return (
    <div className="mx-auto max-w-6xl">
      <section className="hero-layout" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="hero-kicker-line" />
            <span>{BRAND.role}</span>
            <span className="text-faint">/ {BRAND.location}</span>
          </div>

          <h2 id="hero-heading" className="hero-title">
            Words that<br />
            <span className="hero-title-accent">feel at home.</span>
          </h2>
          <p className="hero-subtitle">{ABOUT.heading}</p>
          <p className="lead mt-5 max-w-xl">{ABOUT.intro}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-caption">
            <span className="inline-flex items-center gap-2 text-ink"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> English → Polish</span>
            <span className="text-faint">{ABOUT.focus}</span>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" className="btn-primary btn-lg" onClick={() => onNavigate?.('contact')}>
              Discuss a project <ArrowRight />
            </button>
            <button type="button" className="btn-ghost btn-lg" onClick={() => onNavigate?.('portfolio')}>
              Explore the work
            </button>
          </div>
          <p className="mt-7 flex items-center gap-2 text-caption text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />{BRAND.availability.label}
          </p>
        </div>

        <aside className="hero-proof" aria-label="Illustrative translation sample">
          <div className="flex items-center justify-between border-b border-line px-6 py-5 sm:px-8">
            <span className="eyebrow">The craft in practice</span>
            <span className="font-mono text-xs text-faint">EN / PL</span>
          </div>
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <p className="font-mono text-xs uppercase tracking-widest text-faint">Original · illustrative example</p>
            <p className="mt-4 max-w-sm font-display text-xl leading-snug text-muted sm:text-2xl">“{sample.source}”</p>
            <div className="my-8 flex items-center gap-4"><span className="h-px flex-1 bg-line-strong" /><span className="text-accent">↓</span><span className="h-px flex-1 bg-line-strong" /></div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Localized for Polish players</p>
            <p className="mt-4 max-w-sm font-display text-2xl leading-snug text-ink sm:text-3xl">„{sample.target}”</p>
          </div>
          <div className="border-t border-line bg-surface-2/40 px-6 py-5 sm:px-8">
            <p className="text-caption leading-relaxed text-muted">A translation should sound like it belongs in the world of the game.</p>
          </div>
        </aside>
      </section>

      <div className="hero-bottom-rule" aria-hidden="true"><span>Language is part of the experience.</span><span>01 / 03</span></div>

      {stats.length > 0 && (
        <section ref={statsRef} className="mt-20 sm:mt-28" aria-labelledby="about-stats">
          <Reveal as="h2" id="about-stats" className="eyebrow">At a glance</Reveal>
          <div className="mt-6 grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {stats.map((stat, index) => (
              <Reveal key={stat.id} index={index} className="py-7 sm:px-8 sm:py-9 first:pl-0">
                <StatValue value={stat.value} suffix={stat.suffix} active={statsInView} />
                <span className="meta mt-3 block">{stat.label}</span>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="about-editorial" aria-labelledby="about-bio">
        <div>
          <Reveal as="p" className="eyebrow">A little about me</Reveal>
          <Reveal as="h2" id="about-bio" className="mt-4 max-w-md text-display-2">A precise voice for a new world.</Reveal>
          <Reveal as="p" className="mt-6 max-w-md text-body text-faint">{BRAND.name} · {BRAND.role}</Reveal>
        </div>
        <div className="space-y-6 border-l border-line-strong pl-6 sm:pl-10">
          {ABOUT.body.map((paragraph, index) => (
            <Reveal as="p" key={paragraph} index={index} className="text-body-lg text-muted">{paragraph}</Reveal>
          ))}
        </div>
      </section>

      <Reveal as="section" className="closing-panel" aria-labelledby="about-cta">
        <div>
          <p className="eyebrow">Next step</p>
          <h2 id="about-cta" className="mt-4 max-w-2xl text-display-2">{CONTACT.heading}</h2>
          <p className="lead mt-4 max-w-xl">{CONTACT.intro}</p>
        </div>
        <button type="button" className="btn-primary btn-lg mt-8 shrink-0 lg:mt-0" onClick={() => onNavigate?.('contact')}>
          Get in touch <ArrowRight />
        </button>
      </Reveal>
    </div>
  );
}
