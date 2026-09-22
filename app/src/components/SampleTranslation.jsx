import { useState } from 'react';
import { SAMPLES } from '../lib/constants';

/**
 * The pitch: the same line in English and in Polish, side by side, with the
 * reason the Polish reads the way it does underneath.
 *
 * The two columns are deliberately not styled the same -- the source is a flat
 * surface, the target carries the accent and a leading bar -- so the eye lands
 * on the Polish first. Polish text appears only in the target column.
 *
 * Structural labels only -- candidates for constants.js.
 */
const COPY = {
  tablistLabel: 'Sample translations',
  sourceLabel: 'English source',
  targetLabel: 'Polish target',
  noteHeading: "Translator's note",
};

/* ------------------------------------------------------------------ icons */

function NoteIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
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
      <path d="M5 4.5h14v11H9.5L5 19.5v-15Z" />
      <path d="M8.5 8h7" />
      <path d="M8.5 11.5h4" />
    </svg>
  );
}

/* -------------------------------------------------------------- component */

export default function SampleTranslation() {
  const [activeId, setActiveId] = useState(SAMPLES[0]?.id ?? null);

  const active = SAMPLES.find((sample) => sample.id === activeId) ?? SAMPLES[0];

  if (!active) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label={COPY.tablistLabel}
        className="inline-flex flex-wrap gap-1 rounded-full border border-line-strong bg-surface-2/70 p-1"
      >
        {SAMPLES.map((sample) => {
          const selected = sample.id === active.id;

          return (
            <button
              key={sample.id}
              type="button"
              role="tab"
              id={`sample-tab-${sample.id}`}
              aria-selected={selected}
              aria-controls={`sample-panel-${sample.id}`}
              onClick={() => setActiveId(sample.id)}
              className={`rounded-full px-4 py-2 text-caption font-semibold transition-colors duration-250 ease-expo ${
                selected
                  ? 'bg-accent/15 text-accent shadow-hairline'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {sample.label}
            </button>
          );
        })}
      </div>

      {/* Re-keyed on the sample so the entrance replays on every switch. */}
      <div
        key={active.id}
        id={`sample-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`sample-tab-${active.id}`}
        className="animate-fade-up"
      >
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface-2/40 p-5 sm:p-6">
            <span className="chip">{COPY.sourceLabel}</span>
            <p className="mt-4 font-display text-h3 leading-snug text-muted">{active.source}</p>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-accent/[0.07] p-5 pl-7 sm:p-6 sm:pl-8">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent-2 to-accent-3"
            />
            <span className="chip-accent">{COPY.targetLabel}</span>
            <p className="mt-4 font-display text-h3 leading-snug text-ink">{active.target}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-3 rounded-xl border border-line bg-surface/60 p-5 sm:p-6">
          <NoteIcon className="mt-0.5 text-accent" />
          <div>
            <h3 className="text-caption font-semibold uppercase tracking-wide text-muted">
              {COPY.noteHeading}
            </h3>
            <p className="mt-2 text-body text-muted">{active.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
