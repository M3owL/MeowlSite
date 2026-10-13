import { RATE_NOTES, RATES } from '../lib/constants';

/** Prices belong beside the opening pitch, before the detailed service list. */
export default function RateCard({ onNavigate }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-accent/25 bg-surface shadow-e3" aria-labelledby="services-rates">
      <div className="border-b border-line bg-accent/[0.06] px-6 py-5 sm:px-7">
        <p className="eyebrow">Rates at a glance</p>
        <h3 id="services-rates" className="mt-2 text-h2">A clear starting point.</h3>
      </div>

      <ul className="divide-y divide-line px-6 sm:px-7">
        {RATES.map((rate) => (
          <li key={rate.service} className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 py-4">
            <div>
              <p className="font-display text-body font-semibold text-ink">{rate.service}</p>
            </div>
            <div className="text-right">
              {rate.from !== 'On request' && <p className="text-caption text-faint">From</p>}
              <p className="font-display text-h3 font-semibold text-accent">{rate.from}</p>
              {rate.from !== 'On request' && <p className="text-caption text-faint">{rate.unit}</p>}
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-line px-6 py-5 sm:px-7">
        <p className="text-caption leading-relaxed text-muted">Starting rates are a guide. Send the files, word count and deadline for a fixed project quote.</p>
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => onNavigate?.('contact')}>
          Request a quote <span aria-hidden="true">↗</span>
        </button>
      </div>

      <details className="group border-t border-line px-6 py-4 sm:px-7">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-caption font-semibold text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
          How pricing and delivery work
          <span aria-hidden="true" className="text-accent transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="space-y-3 pt-4 text-caption leading-relaxed text-muted">
          {RATE_NOTES.model.map((line) => <p key={line}>{line}</p>)}
          {RATE_NOTES.drivers.map((line) => <p key={line}>{line}</p>)}
          <p>{RATE_NOTES.turnaround}</p>
          <p>{RATE_NOTES.revisions}</p>
          <p>{RATE_NOTES.payment}</p>
        </div>
      </details>
    </section>
  );
}
