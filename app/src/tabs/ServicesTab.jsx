import { PROCESS, SERVICES } from '../lib/constants';
import Reveal from '../components/ui/Reveal';
import RateCard from '../components/RateCard';
import SampleTranslation from '../components/SampleTranslation';

export default function ServicesTab({ onNavigate }) {
  return (
    <div className="mx-auto max-w-6xl space-y-20 sm:space-y-28">
      <section className="grid gap-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start lg:gap-14" aria-labelledby="services-heading">
        <header className="pt-2 lg:pt-8">
          <p className="eyebrow">Services / EN → PL</p>
          <h2 id="services-heading" className="mt-5 max-w-xl text-display-1">Polish that belongs in your game.</h2>
          <p className="lead mt-6 max-w-lg">Localization for story, dialogue and the interface, plus a careful second pass over Polish text you already have.</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-caption text-faint">
            <span>English → Polish</span>
            <span>Fixed project quote</span>
          </div>
        </header>
        <RateCard onNavigate={onNavigate} />
      </section>

      <section aria-labelledby="services-scope">
        <div className="max-w-2xl">
          <p className="eyebrow">What I work on</p>
          <h2 id="services-scope" className="mt-3 text-display-2">The details players notice.</h2>
          <p className="lead mt-4">From a single set of strings to a full script, the work is shaped around what your game needs.</p>
        </div>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {SERVICES.map((service, index) => (
            <Reveal key={service.id} as="article" index={index} className="border-t border-line-strong pt-5">
              <div className="flex items-start gap-5">
                <span className="shrink-0 font-mono text-caption text-accent">0{index + 1}</span>
                <div>
                  <h3 className="text-h3">{service.title}</h3>
                  <p className="mt-2 text-body font-medium text-ink/85">{service.summary}</p>
                  <p className="mt-4 text-body text-muted">{service.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="services-samples">
        <Reveal as="p" className="eyebrow">A closer look</Reveal>
        <Reveal as="h2" id="services-samples" className="mt-3 text-display-2">The choices behind the words.</Reveal>
        <Reveal as="p" className="lead mt-4 max-w-2xl">Illustrative lines show how meaning, rhythm and context guide each Polish line.</Reveal>
        <Reveal className="mt-8"><SampleTranslation /></Reveal>
      </section>

      <section aria-labelledby="services-process">
        <Reveal as="p" className="eyebrow">From brief to delivery</Reveal>
        <Reveal as="h2" id="services-process" className="mt-3 text-display-2">A straightforward process.</Reveal>
        <ol className="mt-10 grid gap-x-8 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {PROCESS.map((item, index) => (
            <Reveal key={item.step} as="li" index={index} className="border-t border-line pt-5">
              <span className="font-mono text-caption text-accent">{item.step} / 06</span>
              <h3 className="mt-5 text-h4">{item.title}</h3>
              <p className="mt-2 text-body text-muted">{item.detail}</p>
            </Reveal>
          ))}
        </ol>
      </section>
    </div>
  );
}
