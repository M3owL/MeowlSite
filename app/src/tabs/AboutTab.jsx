export default function AboutTab() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      <h2 className="mb-8 border-b border-slate-800 pb-4 text-4xl font-extrabold text-white">
        About Me
      </h2>

      <div className="glass rounded-xl p-8">
        <h3 className="mb-4 text-2xl font-bold text-accent">Hi, I'm M3owL</h3>

        <p className="mb-4 text-lg leading-relaxed text-slate-300">
          I am a Junior Polish Game Translator. I translate video games and help developers
          adapt their titles for Polish players. I focus on natural-sounding translations and
          preserving the original vibe.
        </p>

        <p className="text-lg leading-relaxed text-slate-300">
          If you need a translation that doesn't sound like AI, you've come to the right place.
        </p>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-700 pt-6">
          <p>
            <strong className="text-white">Discord:</strong>{' '}
            <span className="font-mono text-accent">_m3owl</span>
          </p>

          <p>
            <strong className="text-white">Position:</strong> Polish Game Translator /
            Localization Junior
          </p>
        </div>
      </div>
    </div>
  );
}
