import { useEffect, useMemo, useState } from 'react';

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
 */
export default function SteamImage({
  candidates = [],
  fallback = null,
  alt = '',
  className = '',
  style,
  eager = false,
  onResolved,
}) {
  const urls = useMemo(
    () => candidates.filter((url) => typeof url === 'string' && url.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(candidates)],
  );

  const primary = urls[0] ?? null;
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  // A new candidate list (different project, newly picked app id) starts over.
  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [primary]);

  if (!urls.length || failed) return fallback;

  const src = urls[Math.min(index, urls.length - 1)];

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onLoad={() => onResolved?.(src)}
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
