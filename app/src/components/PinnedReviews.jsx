import { useEffect, useId, useRef, useState } from 'react';
import { avatarFallback } from '../lib/format';
import { RatingBadge } from './ui/Stars';

/**
 * Client feedback pinned to a project.
 *
 * Layout is deliberately breakpoint-split:
 *
 *   < lg   a horizontal snap list. The old version forced 288px cards into a
 *          container that can be ~256px wide on a 320px phone, so the marquee
 *          silently clipped content inside `overflow-hidden` -- the worst place
 *          for it, since the marquee is what was clipping.
 *   >= lg  a marquee, but only when the cards actually overflow. Otherwise they
 *          wrap, so two short reviews are not needlessly animated.
 *
 * The marquee renders the review list twice. The second copy is `aria-hidden`
 * so screen readers are not read the same review twice.
 */
export default function PinnedReviews({ reviews }) {
  const containerRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);
  const labelId = useId();

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

  const renderCard = (review, idx, fluid) => (
    <li
      key={`${review.id}-${idx}`}
      className={`flex flex-col gap-2 rounded-lg border border-line bg-surface-2/80 p-3.5 backdrop-blur ${
        fluid ? 'w-[85%] shrink-0 snap-start' : 'w-72 shrink-0'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={review.pfp || avatarFallback(review.nickname)}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full border border-line-strong object-cover"
            onError={(event) => {
              event.currentTarget.src = avatarFallback(review.nickname);
            }}
          />

          <div className="min-w-0">
            <p className="truncate text-caption font-semibold text-ink">{review.nickname}</p>
            <p className="truncate text-caption text-accent">{review.role}</p>
          </div>
        </div>

        <RatingBadge ratings={review.ratings} size="sm" />
      </div>

      {review.game_title && (
        <p className="truncate text-caption font-medium text-faint">Game: {review.game_title}</p>
      )}

      <p className="line-clamp-2 text-caption italic text-muted">“{review.text}”</p>
    </li>
  );

  return (
    <section
      aria-labelledby={labelId}
      className="relative z-10 w-full border-t border-line bg-void/70"
    >
      <p
        id={labelId}
        className="px-4 pb-2.5 pt-4 text-eyebrow font-semibold uppercase text-faint sm:px-5"
      >
        Pinned reviews
      </p>

      {/* ---- mobile + tablet: horizontal snap list, never a marquee ---- */}
      <ul className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:px-5 lg:hidden">
        {reviews.map((review, idx) => renderCard(review, idx, true))}
      </ul>

      {/* ---- desktop: marquee when it overflows, wrap when it does not ---- */}
      <div ref={containerRef} className="hidden w-full overflow-hidden px-5 pb-5 lg:block">
        {overflowing ? (
          <div className="marquee-container animate-scroll">
            <ul className="flex shrink-0 gap-3 pr-3">
              {reviews.map((review, idx) => renderCard(review, idx, false))}
            </ul>

            <ul className="flex shrink-0 gap-3 pr-3" aria-hidden="true">
              {reviews.map((review, idx) => renderCard(review, idx, false))}
            </ul>
          </div>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {reviews.map((review, idx) => renderCard(review, idx, false))}
          </ul>
        )}
      </div>
    </section>
  );
}
