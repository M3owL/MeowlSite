import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Renders the first URL in `candidates` that actually loads.
 *
 * Why this exists: the previous code used a single hardcoded URL per slot and
 * a CSS `background-image` for the card art. CSS backgrounds never fire an
 * error event, so a 404 there was completely invisible -- you got a blank card
 * and no way to know why. The logo had the opposite problem: one failure
 * triggered `style.display = 'none'`, permanently hiding it for the session.
 *
 * This component uses a real <img> so failures are catchable, then walks the
 * candidate list. If everything fails it renders `fallback` instead of leaving
 * a hole.
 *
 * The candidate walk is host-major (see lib/steam.js) and can make up to 15
 * requests before it settles, which is exactly why `onLoadingChange` exists:
 * the caller gets to paint a skeleton for the whole walk instead of showing an
 * empty frame.
 */
export default function SteamImage({
  candidates = [],
  fallback = null,
  alt = '',
  className = '',
  style,
  sizes,
  aspect,
  eager = false,
  onResolved,
  onLoadingChange,
}) {
  const urls = useMemo(
    () => candidates.filter((url) => typeof url === 'string' && url.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(candidates)],
  );

  const primary = urls[0] ?? null;
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // A new candidate list (different project, newly picked app id) starts over.
  useEffect(() => {
    setIndex(0);
    setFailed(false);
    setLoaded(false);
  }, [primary]);

  const loading = urls.length > 0 && !failed && !loaded;

  /**
   * Held in a ref so an inline arrow from the parent does not re-fire the
   * reporting effect on every render.
   */
  const notify = useRef(onLoadingChange);
  useEffect(() => {
    notify.current = onLoadingChange;
  });

  useEffect(() => {
    notify.current?.(loading);
  }, [loading]);

  if (!urls.length || failed) return fallback;

  const src = urls[Math.min(index, urls.length - 1)];

  // `aspect` reserves the box before the bytes arrive; an explicit `style`
  // still wins so object-position offsets keep working.
  const composed = aspect ? { aspectRatio: aspect, ...style } : style;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={composed}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onLoad={() => {
        setLoaded(true);
        onResolved?.(src);
      }}
      onError={() => {
        if (index + 1 < urls.length) {
          setIndex((current) => current + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
