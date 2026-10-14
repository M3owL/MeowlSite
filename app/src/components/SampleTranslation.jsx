import { useState } from 'react';
import { SAMPLES } from '../lib/constants';

const COPY = {
  tablistLabel: 'Translation and proofreading examples',
  sourceLabel: 'Original · English',
  targetLabel: 'Translated · Polish',
  machineLabel: 'Machine translation · Polish',
  correctedLabel: 'After proofreading · Polish',
};

function TextPanel({ label, accent = false, children }) {
  return (
    <div className={`relative min-w-0 overflow-hidden rounded-xl border p-5 sm:p-6 ${accent ? 'border-accent/30 bg-accent/[0.07] pl-7 sm:pl-8' : 'border-line bg-surface-2/40'}`}>
      {accent && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent-2 to-accent-3" />}
      <span className={accent ? 'chip-accent' : 'chip'}>{label}</span>
      <p className={`mt-4 font-display text-h3 leading-snug ${accent ? 'text-ink' : 'text-muted'}`}>{children}</p>
    </div>
  );
}

function AnnotatedText({ segments, corrected }) {
  return segments.map((segment, index) => {
    if (!segment.changed) return <span key={index}>{segment.text}</span>;
    return corrected ? (
      <ins key={index} className="rounded-sm bg-emerald-400/15 px-0.5 text-emerald-200 no-underline">{segment.text}</ins>
    ) : (
      <del key={index} className="rounded-sm bg-rose-400/10 px-0.5 text-rose-200 decoration-rose-400/70">{segment.text}</del>
    );
  });
}

export default function SampleTranslation({ initialSampleId = SAMPLES[0]?.id }) {
  const [activeId, setActiveId] = useState(initialSampleId);
  const active = SAMPLES.find((sample) => sample.id === activeId) ?? SAMPLES[0];

  if (!active) return null;

  return (
    <div>
      <div role="tablist" aria-label={COPY.tablistLabel} className="inline-flex flex-wrap gap-1 rounded-full border border-line-strong bg-surface-2/70 p-1">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            role="tab"
            id={`sample-tab-${sample.id}`}
            aria-selected={sample.id === active.id}
            aria-controls={`sample-panel-${sample.id}`}
            onClick={() => setActiveId(sample.id)}
            className={`rounded-full px-4 py-2 text-caption font-semibold transition-colors duration-250 ease-expo ${sample.id === active.id ? 'bg-accent/15 text-accent shadow-hairline' : 'text-muted hover:text-ink'}`}
          >
            {sample.label}
          </button>
        ))}
      </div>

      <div key={active.id} id={`sample-panel-${active.id}`} role="tabpanel" aria-labelledby={`sample-tab-${active.id}`} className="animate-fade-up">
        {active.id === 'proofreading' ? (
          <div className="mt-6 space-y-4">
            <TextPanel label={COPY.sourceLabel}>{active.source}</TextPanel>
            <div className="grid gap-4 lg:grid-cols-2">
              <TextPanel label={COPY.machineLabel}><AnnotatedText segments={active.machine} corrected={false} /></TextPanel>
              <TextPanel label={COPY.correctedLabel} accent><AnnotatedText segments={active.corrected} corrected /></TextPanel>
            </div>
            <div className="rounded-xl border border-line bg-surface/60 p-5 sm:p-6">
              <p className="text-caption font-semibold uppercase tracking-wide text-accent">What changed</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-body text-muted">
                {active.changes.map((change) => <li key={change}>{change}</li>)}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <TextPanel label={COPY.sourceLabel}>{active.source}</TextPanel>
            <TextPanel label={COPY.targetLabel} accent>{active.target}</TextPanel>
          </div>
        )}
      </div>
    </div>
  );
}
