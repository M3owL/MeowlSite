import { RATE_NOTES, RATES } from '../lib/constants';

/**
 * Rate card for the Services tab.
 *
 * Every figure is framed as a starting point -- the column reads "From", and
 * the closing note says the quote is fixed. Nothing here may read as a price
 * list, so no figure is ever presented without the "from" framing.
 *
 * Layout: one row per service, three columns at `sm:` and up; below that the
 * same row stacks (service / unit + from) so nothing overflows at 320px.
 */

/** Structural labels only -- candidates for constants.js. */
const COPY = {
  eyebrow: 'Rates',
  heading: 'Starting prices',
  note: 'Every figure below is a floor, not a quote. Send the files and the deadline and you get one fixed number back.',
  cta: 'Request a quote',
  from: 'From',
  modelHeading: 'How I price',
  driversHeading: 'What moves the number',
};

/* ------------------------------------------------------------------ icons */

/*
 * Size lives in the `width`/`height` attributes, not in the default
 * `className`. Callers pass their own class for colour and margin, which used
 * to replace the `h-4 w-4` default outright -- leaving an SVG with no intrinsic
 * size that expanded to fill the flex row and squeezed the text beside it.
 */

function CheckIcon({ className = '', size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

function ClockIcon({ className = '', size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function SliderIcon({ className = '', size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 8h10" />
      <path d="M18 8h2" />
      <path d="M4 16h4" />
      <path d="M12 16h8" />
      <circle cx="16" cy="8" r="2.2" />
      <circle cx="10" cy="16" r="2.2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ card */

export default function RateCard({ onNavigate }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line p-6 sm:p-8">
        <p className="eyebrow">{COPY.eyebrow}</p>
        <h2 className="mt-3 text-h2">{COPY.heading}</h2>
        <p className="mt-3 max-w-2xl text-body text-muted">{COPY.note}</p>
      </div>

      {/* ------------------------------------------------------------ table */}
      <ul className="divide-y divide-line px-6 sm:px-8">
        {RATES.map((rate) => (
          <li
            key={rate.service}
            className="grid gap-1.5 py-4 sm:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,auto)] sm:items-baseline sm:gap-4"
          >
            <span className="font-display text-h4 font-semibold text-ink">{rate.service}</span>

            <div className="flex items-baseline justify-between gap-4 sm:contents">
              <span className="text-caption text-muted">{rate.unit}</span>
              <span className="flex items-baseline gap-1.5 sm:justify-end">
                <span className="text-caption text-faint">{COPY.from}</span>
                <span className="font-display text-h4 font-semibold text-accent">{rate.from}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* ------------------------------------------------------------ notes */}
      <div className="grid gap-8 border-t border-line p-6 sm:p-8 lg:grid-cols-2">
        <div>
          <h3 className="eyebrow text-muted">{COPY.modelHeading}</h3>
          <ul className="mt-4 space-y-2.5">
            {RATE_NOTES.model.map((line) => (
              <li key={line} className="flex gap-3 text-body text-muted">
                <CheckIcon className="mt-1 text-accent" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-lg border border-line bg-surface-2/40 p-4 text-body text-muted">
            {RATE_NOTES.payment}
          </p>
        </div>

        <div>
          <h3 className="eyebrow text-muted">{COPY.driversHeading}</h3>
          <ul className="mt-4 space-y-2.5">
            {RATE_NOTES.drivers.map((line) => (
              <li key={line} className="flex gap-3 text-caption text-muted">
                <SliderIcon className="mt-0.5 text-faint" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-3 px-6 pb-6 sm:grid-cols-2 sm:px-8 sm:pb-8">
        <div className="flex gap-3 rounded-lg border border-line bg-surface-2/40 p-4">
          <ClockIcon className="mt-0.5 text-accent" />
          <p className="text-caption text-muted">{RATE_NOTES.turnaround}</p>
        </div>

        <div className="flex gap-3 rounded-lg border border-line bg-surface-2/40 p-4">
          <CheckIcon className="mt-0.5 text-accent" />
          <p className="text-caption text-muted">{RATE_NOTES.revisions}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-line bg-surface-2/30 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <p className="meta max-w-md">
          Not sure which of these applies? Describe the build in a sentence and I will tell you.
        </p>

        <button
          type="button"
          className="btn-primary shrink-0 self-start sm:self-auto"
          onClick={() => onNavigate?.('contact')}
        >
          {COPY.cta}
        </button>
      </div>
    </div>
  );
}
