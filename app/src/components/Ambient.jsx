/** A quiet, fixed canvas that never changes the document's scroll geometry. */
export default function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 34% at 76% 0%, rgba(55,108,99,.21), transparent 75%), radial-gradient(ellipse 46% 28% at 0% 55%, rgba(42,72,72,.13), transparent 80%)',
        }}
      />
      <div
        className="absolute inset-0 bg-grid-lines bg-grid-size opacity-40"
        style={{
          maskImage: 'linear-gradient(to bottom, black, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 70%)',
        }}
      />
    </div>
  );
}
