import { useEffect, useRef, useState } from 'react';
import { avatarFallback } from '../lib/format';
import { RatingBadge } from './ui/Stars';

/**
 * Horizontal strip of client feedback pinned to a project.
 * Scrolls as a marquee only when the cards actually overflow their container;
 * otherwise they wrap, so two short reviews don't get needlessly animated.
 */
export default function PinnedReviews({ reviews }) {
  const containerRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const measure = () => setOverflowing(node.scrollWidth > node.clientWidth + 4);

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [reviews]);

  if (!reviews.length) return null;

  const card = (review, idx) => (
    <div
      key={`${review.id}-${idx}`}
      className="mx-2 w-72 flex-shrink-0 rounded-lg border border-slate-700 bg-slate-900/90 p-3 backdrop-blur"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={review.pfp || avatarFallback(review.nickname)}
            alt=""
            className="h-6 w-6 shrink-0 rounded-full border border-slate-600 object-cover"
            onError={(event) => {
              event.currentTarget.src = avatarFallback(review.nickname);
            }}
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold leading-tight text-white">
              {review.nickname}
            </p>
            <p className="truncate text-[10px] font-bold text-accent">{review.role}</p>
          </div>
        </div>

        <RatingBadge ratings={review.ratings} size="xs" />
      </div>

      {review.game_title && (
        <p className="mb-1 text-[9px] font-bold text-accent">Game: {review.game_title}</p>
      )}

      <p className="line-clamp-2 text-[11px] font-medium italic text-slate-300">
        “{review.text}”
      </p>
    </div>
  );

  return (
    <div className="relative z-10 w-full overflow-hidden border-t border-slate-800 bg-slate-950/90 p-3">
      <p className="mb-2 ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Pinned Feedbacks
      </p>

      <div ref={containerRef} className="w-full overflow-hidden">
        {overflowing ? (
          <div className="marquee-container animate-scroll">
            {[...reviews, ...reviews].map(card)}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">{reviews.map(card)}</div>
        )}
      </div>
    </div>
  );
}
