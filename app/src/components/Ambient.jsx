/**
 * Fixed background stack.
 *
 * Replaces the flat `#020617` canvas with real depth: a base colour, a faint
 * grid that fades out below the fold, two slow-drifting aurora blobs, and a
 * bottom fade into the page background. Purely decorative, so it is hidden from
 * assistive tech and never intercepts pointer events.
 *
 * Everything animating here is switched off by the global
 * `prefers-reduced-motion` rule in index.css.
 */
export default function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="absolute inset-0 bg-void" />

      <div
        className="absolute inset-0 bg-grid-lines bg-grid-size opacity-60"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent 75%)',
        }}
      />

      <div
        className="aurora-blob animate-aurora"
        style={{
          top: '-18rem',
          left: '-10rem',
          width: '42rem',
          height: '42rem',
          background: 'radial-gradient(circle, rgba(6,182,212,0.28), transparent 70%)',
        }}
      />

      <div
        className="aurora-blob animate-aurora-slow"
        style={{
          top: '-8rem',
          right: '-14rem',
          width: '38rem',
          height: '38rem',
          background: 'radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)',
        }}
      />

      <div
        className="aurora-blob animate-float"
        style={{
          bottom: '-16rem',
          left: '30%',
          width: '34rem',
          height: '34rem',
          background: 'radial-gradient(circle, rgba(6,182,212,0.14), transparent 70%)',
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-void" />
    </div>
  );
}
