import { PROCESS, SERVICES } from '../lib/constants';
import Reveal from '../components/ui/Reveal';
import RateCard from '../components/RateCard';
import SampleTranslation from '../components/SampleTranslation';

/**
 * Services tab: what I do, how a project runs, what it costs, and -- the part
 * that actually convinces anyone -- a worked sample translation.
 *
 * Structural labels only -- candidates for constants.js.
 */
const COPY = {
  eyebrow: 'Services',
  heading: 'What I translate',
  intro:
    'Everything below is EN to PL game text. Pick the piece you need, or hand me the whole build and I will take it from strings to store page.',
  processEyebrow: 'Process',
  processHeading: 'How a project runs',
  samplesEyebrow: 'Samples',
  samplesHeading: 'See it before you buy it',
  samplesIntro:
    'The same way I would hand them to you: the English, the Polish, and why the Polish reads the way it does.',
};

/* ------------------------------------------------------------------ icons */

function ServiceIcon({ id, className = '', size = 24 }) {
  const shared = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': 'true',
    focusable: 'false',
  };

  switch (id) {
    case 'localization':
      return (
        <svg {...shared}>
          <path d="M12 6.5C10.5 5 8.5 4.5 6 4.5H4v13h2c2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2h2v-13h-2c-2.5 0-4.5.5-6 2Z" />
          <path d="M12 6.5v13" />
        </svg>
      );
    case 'proofreading':
      return (
        <svg {...shared}>
          <path d="M4 6h11" />
          <path d="M4 11h8" />
          <path d="M4 16h5" />
          <path d="m14 17 2.5 2.5L21 15" />
        </svg>
      );
    default:
      return (
        <svg {...shared}>
          <path d="M12 6.5C10.5 5 8.5 4.5 6 4.5H4v13h2c2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2h2v-13h-2c-2.5 0-4.5.5-6 2Z" />
          <path d="M12 6.5v13" />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------- tab */

export default function ServicesTab({ onNavigate }) {
  return (
    <div className="mx-auto max-w-5xl space-y-16 sm:space-y-24">
      {/* ------------------------------------------------------------ header */}
      <header className="section-head">
        <div>
          <p className="eyebrow">{COPY.eyebrow}</p>
          <h2 className="mt-3 text-display-2">{COPY.heading}</h2>
        </div>
        <p className="lead max-w-md">{COPY.intro}</p>
      </header>

      {/* ---------------------------------------------------------- services */}
      <section aria-label={COPY.heading}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <Reveal
              key={service.id}
              as="article"
              index={index}
              className="card-interactive lift group flex flex-col p-6"
            >
              <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong bg-surface-3/70 text-accent transition-colors duration-250 ease-expo group-hover:border-accent/40 group-hover:text-accent-2">
                <ServiceIcon id={service.id} />
              </span>

              <h3 className="text-h4 font-semibold text-ink">{service.title}</h3>
              <p className="mt-2 text-body text-muted">{service.summary}</p>
              <p className="mt-4 border-t border-line pt-4 text-caption text-faint">
                {service.detail}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- process */}
      <section aria-labelledby="services-process">
        <Reveal as="p" className="eyebrow">
          {COPY.processEyebrow}
        </Reveal>
        <Reveal as="h2" id="services-process" className="mt-3 text-h2">
          {COPY.processHeading}
        </Reveal>

        <ol className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-x-6">
          {PROCESS.map((item, index) => (
            <Reveal
              key={item.step}
              as="li"
              index={index}
              className="relative flex gap-5 lg:block lg:border-t lg:border-line lg:pt-6"
            >
              <span
                aria-hidden="true"
                className="absolute -top-px left-0 hidden h-px w-10 bg-accent lg:block"
              />

              {/* Vertical connector for the stacked (mobile / tablet) layout.
                  -2rem matches the row gap, so it stops at the next number. */}
              {index < PROCESS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-2rem] left-[1.375rem] top-12 w-px bg-line lg:hidden"
                />
              ) : null}

              <span className="flex w-11 shrink-0 justify-center lg:w-auto lg:justify-start">
                <span className="bg-gradient-to-br from-accent-2 to-accent bg-clip-text font-display text-h2 font-bold leading-none text-transparent lg:text-h1">
                  {item.step}
                </span>
              </span>

              <div className="pt-1 lg:pt-4">
                <h4 className="text-h4 font-semibold text-ink">{item.title}</h4>
                <p className="mt-1.5 text-body text-muted">{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------- rates */}
      <RateCard onNavigate={onNavigate} />

      {/* ----------------------------------------------------------- samples */}
      <section aria-labelledby="services-samples">
        <Reveal as="p" className="eyebrow">
          {COPY.samplesEyebrow}
        </Reveal>
        <Reveal as="h2" id="services-samples" className="mt-3 text-h2">
          {COPY.samplesHeading}
        </Reveal>
        <Reveal as="p" className="lead mt-4 max-w-2xl">
          {COPY.samplesIntro}
        </Reveal>

        <Reveal className="mt-8">
          <SampleTranslation />
        </Reveal>
      </section>
    </div>
  );
}
