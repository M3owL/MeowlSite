import { ABOUT, BRAND, CONTACT, ENGINES, FORMATS, STATS, TOOLS } from '../lib/constants';
import Reveal from '../components/ui/Reveal';
import { useCountUp, useInView } from '../lib/motion';

/**
 * Landing page. `DEFAULT_TAB` is 'about', so this is the first thing a visitor
 * sees: hero, numbers, language pairs, bio, toolkit, facts, closing CTA.
 *
 * All editorial copy comes from `lib/constants.js`. The few structural labels
 * this component needs (section headings, CTA button text) are declared in
 * `COPY` below and are candidates for moving into constants.
 */
const COPY = {
  getQuote: 'Get a quote',
  seeWork: 'See the work',
  statsEyebrow: 'At a glance',
  pairsHeading: 'Language pairs',
  bioHeading: 'About me',
  toolkitHeading: 'Toolkit',
  factsHeading: 'Quick facts',
  primaryBadge: 'Primary',
  groups: [
    { id: 'tools', label: 'CAT tools', items: TOOLS },
    { id: 'formats', label: 'File formats', items: FORMATS },
    { id: 'engines', label: 'Engines', items: ENGINES },
  ],
};

/* ------------------------------------------------------------------ icons */

function ArrowRight({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function AvailabilityDot({ open }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {open ? (
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
      ) : null}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          open ? 'bg-emerald-400' : 'bg-faint'
        }`}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ stats */

/** Counts up once the row is on screen. Must be its own component -- hooks. */
function StatValue({ value, suffix, active }) {
  const count = useCountUp(value, active);

  return (
    <span className="font-display text-h1 font-semibold leading-none text-ink">
      {count.toLocaleString('en-US')}
      {suffix ? <span className="text-accent">{suffix}</span> : null}
    </span>
  );
}

/* ------------------------------------------------------------------- tab */

export default function AboutTab({ projects = [], onNavigate }) {
  const [statsRef, statsInView] = useInView();

  /**
   * `live: 'projects'` is the database count. Tiles that resolve to zero are
   * dropped, and if that empties the row the whole section disappears rather
   * than showing four zeros.
   */
  const stats = STATS.map((stat) => ({
    ...stat,
    value: stat.live === 'projects' ? projects.length : stat.value,
  })).filter((stat) => Number(stat.value) > 0);

  const [lead, ...rest] = ABOUT.body;

  return (
    <div className="mx-auto max-w-5xl space-y-16 sm:space-y-24">
      {/* ------------------------------------------------------------- hero */}
      <section className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-6rem] h-72 w-[42rem] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute right-[-4rem] top-24 h-56 w-56 rounded-full bg-iris/20 blur-3xl" />
        </div>

        <div className="relative">
          <Reveal index={0} className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="eyebrow">{BRAND.role}</span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-line-strong sm:block" />
            <span className="meta">{BRAND.location}</span>
          </Reveal>

          <Reveal as="h2" index={1} className="mt-5 max-w-4xl text-display-1 text-ink">
            {ABOUT.heading}
          </Reveal>

          <Reveal as="p" index={2} className="lead mt-6 max-w-2xl">
            {ABOUT.intro}
          </Reveal>

          <Reveal index={3} className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
            <AvailabilityDot open={BRAND.availability.open} />
            <span className="text-caption font-semibold text-ink">{BRAND.availability.label}</span>
            <span className="meta">{BRAND.availability.note}</span>
          </Reveal>

          <Reveal index={4} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="btn-primary btn-lg"
              onClick={() => onNavigate?.('contact')}
            >
              {COPY.getQuote}
              <ArrowRight />
            </button>
            <button
              type="button"
              className="btn-ghost btn-lg"
              onClick={() => onNavigate?.('portfolio')}
            >
              {COPY.seeWork}
            </button>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ stats */}
      {stats.length > 0 ? (
        <section ref={statsRef} aria-labelledby="about-stats">
          <Reveal as="h2" id="about-stats" className="eyebrow">
            {COPY.statsEyebrow}
          </Reveal>

          {/* Single column below `xs`: "120,000" cannot wrap, so two narrow
              tiles at 320px would push the number past the card edge. */}
          <div className="mt-6 grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Reveal
                key={stat.id}
                index={index}
                className="rounded-xl border border-line bg-surface-2/40 px-5 py-6"
              >
                <StatValue value={stat.value} suffix={stat.suffix} active={statsInView} />
                <span className="meta mt-3 block">{stat.label}</span>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------- language pairs */}
      <section aria-labelledby="about-pairs">
        <Reveal as="h2" id="about-pairs" className="text-h2">
          {COPY.pairsHeading}
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ABOUT.languagePairs.map((pair, index) => (
            <Reveal
              key={`${pair.from}-${pair.to}`}
              index={index}
              className={`flex items-center justify-between gap-4 rounded-xl border p-5 ${
                pair.primary
                  ? 'border-accent/30 bg-accent/[0.07]'
                  : 'border-line bg-surface-2/40'
              }`}
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-display text-h4 font-semibold text-ink">{pair.from}</span>
                <ArrowRight className="h-5 w-5 text-accent" />
                <span className="font-display text-h4 font-semibold text-ink">{pair.to}</span>
              </span>

              {pair.primary ? <span className="chip-accent shrink-0">{COPY.primaryBadge}</span> : null}
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- bio */}
      <section aria-labelledby="about-bio">
        <Reveal as="h2" id="about-bio" className="text-h2">
          {COPY.bioHeading}
        </Reveal>

        {lead ? (
          <Reveal className="mt-6 rounded-xl border-l-2 border-accent/60 bg-surface-2/40 p-6 sm:p-7">
            <p className="text-body-lg text-ink">{lead}</p>
          </Reveal>
        ) : null}

        {rest.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {rest.map((paragraph, index) => (
              <Reveal
                key={paragraph}
                index={index}
                className="rounded-xl border border-line bg-surface-2/25 p-6"
              >
                <p className="text-body text-muted">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        ) : null}
      </section>

      {/* ---------------------------------------------------------- toolkit */}
      <section aria-labelledby="about-toolkit">
        <Reveal as="h2" id="about-toolkit" className="text-h2">
          {COPY.toolkitHeading}
        </Reveal>

        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {COPY.groups.map((group, index) => (
            <Reveal key={group.id} index={index}>
              <h3 className="eyebrow text-muted">{group.label}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ facts */}
      <section aria-labelledby="about-facts">
        <Reveal as="h2" id="about-facts" className="text-h2">
          {COPY.factsHeading}
        </Reveal>

        <dl className="mt-6 grid gap-4 rounded-2xl border border-line bg-surface-2/40 p-6 sm:grid-cols-3 sm:p-7">
          {ABOUT.facts.map((fact, index) => (
            <Reveal key={fact.label} index={index}>
              <dt className="meta">{fact.label}</dt>
              <dd className="mt-1.5 font-display text-h4 font-semibold text-ink">{fact.value}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* -------------------------------------------------------- closing cta */}
      <Reveal className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.12] via-surface-2/60 to-iris/[0.10] p-8 sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="relative">
          <h2 className="max-w-2xl text-h1">{CONTACT.heading}</h2>
          <p className="lead mt-4 max-w-xl">{CONTACT.intro}</p>

          <button
            type="button"
            className="btn-primary btn-lg mt-8"
            onClick={() => onNavigate?.('contact')}
          >
            {COPY.getQuote}
            <ArrowRight />
          </button>
        </div>
      </Reveal>
    </div>
  );
}
