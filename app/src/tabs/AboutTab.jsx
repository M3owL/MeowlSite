import { ABOUT, BRAND, CONTACT, STATS } from '../lib/constants';
import Reveal from '../components/ui/Reveal';
import { useCountUp, useInView } from '../lib/motion';

/**
 * Landing page. `DEFAULT_TAB` is 'about', so this is the first thing a visitor
 * sees: hero, numbers, bio, toolkit, closing CTA.
 *
 * Deliberately plain. An earlier pass dressed every block in its own bordered
 * panel and split the bio across three mismatched boxes, which read as
 * decoration rather than information. The bio is prose now, in one column.
 *
 * All editorial copy comes from `lib/constants.js`. The few structural labels
 * this component needs are declared in `COPY` below.
 */
const COPY = {
  getQuote: 'Get a quote',
  seeWork: 'See the work',
  statsEyebrow: 'At a glance',
  bioHeading: 'About me',
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

export default function AboutTab({ metrics = {}, onNavigate }) {
  const [statsRef, statsInView] = useInView();

  const stats = STATS.map((stat) => ({
    ...stat,
    value: Number(metrics[stat.id]) || 0,
  })).filter((stat) => Number(stat.value) > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-16 sm:space-y-20">
      {/* ------------------------------------------------------------- hero */}
      <section className="relative max-w-5xl">
        <Reveal index={0} className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="eyebrow">{BRAND.role}</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-line-strong sm:block" />
          <span className="meta">{ABOUT.focus}</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-line-strong sm:block" />
          <span className="meta">{BRAND.location}</span>
        </Reveal>

        <Reveal as="h2" index={1} className="mt-6 max-w-4xl text-display-2 text-ink sm:mt-8">
          {ABOUT.heading}
        </Reveal>

        <Reveal as="p" index={2} className="lead mt-5 max-w-2xl sm:mt-6">
          {ABOUT.intro}
        </Reveal>

        <Reveal index={3} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          {ABOUT.languagePairs.map((pair, index) => (
            <span key={`${pair.from}-${pair.to}`} className="flex items-center gap-3">
              {index > 0 ? (
                <span aria-hidden="true" className="text-faint">
                  ·
                </span>
              ) : null}
              <span
                className={`text-body ${
                  pair.primary ? 'font-semibold text-ink' : 'text-muted'
                }`}
              >
                {pair.from} → {pair.to}
              </span>
            </span>
          ))}
        </Reveal>

        <Reveal index={4} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <AvailabilityDot open={BRAND.availability.open} />
          <span className="text-caption font-semibold text-ink">{BRAND.availability.label}</span>
          <span className="meta">{BRAND.availability.note}</span>
        </Reveal>

        <Reveal index={5} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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
      </section>

      {/* ------------------------------------------------------------ stats */}
      {stats.length > 0 ? (
        <section ref={statsRef} aria-labelledby="about-stats">
          <Reveal as="h2" id="about-stats" className="eyebrow">
            {COPY.statsEyebrow}
          </Reveal>

          {/* Two published figures get equal space and a quiet divider. */}
          <div className="mt-5 grid grid-cols-1 border-y border-line sm:grid-cols-2">
            {stats.map((stat, index) => (
              <Reveal
                key={stat.id}
                index={index}
                className={`py-6 sm:py-7 ${index === 0 && stats.length > 1 ? 'border-b border-line sm:border-b-0 sm:border-r sm:pr-8' : ''} ${index > 0 ? 'sm:pl-8' : ''}`}
              >
                <StatValue value={stat.value} suffix={stat.suffix} active={statsInView} />
                <span className="meta mt-2.5 block">{stat.label}</span>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------------- bio */}
      <section aria-labelledby="about-bio">
        <Reveal as="h2" id="about-bio" className="text-h2">
          {COPY.bioHeading}
        </Reveal>

        <div className="mt-6 max-w-2xl space-y-5">
          {ABOUT.body.map((paragraph, index) => (
            <Reveal as="p" key={paragraph} index={index} className="text-body-lg text-muted">
              {paragraph}
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- closing cta */}
      <Reveal className="rounded-2xl border border-line bg-white p-7 shadow-e1 sm:p-10">
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
      </Reveal>
    </div>
  );
}
