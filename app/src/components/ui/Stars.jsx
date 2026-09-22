import { calculateAverageRating } from '../../lib/format';

/**
 * Star rating with half-star precision.
 *
 * Renders a muted SVG row and clips a filled row against it by percentage --
 * the same trick as before, but with real vector stars instead of the Unicode
 * glyph, which rendered differently on every platform and could not be sized
 * consistently.
 *
 * Exports are unchanged (`Stars`, `RatingBadge`) because two other workstreams
 * depend on this interface.
 */

/** Sizes are in px so the clipped overlay lines up exactly with the base row. */
const SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 24,
};

const STAR_PATH =
  'M12 2.6l2.86 5.8 6.4.93-4.63 4.51 1.09 6.37L12 17.2l-5.72 3.01 1.09-6.37L2.74 9.33l6.4-.93z';

/**
 * Gap is computed in px rather than `em`: the two rows are clipped against each
 * other, so their spacing must be identical and independent of inherited
 * font-size.
 */
function StarRow({ size, className }) {
  return (
    <span
      className={`flex shrink-0 ${className}`}
      style={{ gap: `${Math.round(size * 0.12)}px` }}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <svg
          key={index}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

export default function Stars({ value, size = 'sm' }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));
  const percent = (rating / 5) * 100;
  const px = SIZES[size] ?? SIZES.sm;

  return (
    <span
      className="relative inline-flex align-middle leading-none"
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5`}
    >
      <StarRow size={px} className="text-line-strong" />

      <span
        className="absolute inset-y-0 left-0 flex overflow-hidden text-amber-400"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      >
        <StarRow size={px} className="" />
      </span>
    </span>
  );
}

/** Score + stars, the pattern repeated in several cards. */
export function RatingBadge({ ratings, size = 'sm' }) {
  if (!Array.isArray(ratings) || ratings.length === 0) return null;

  const average = calculateAverageRating(ratings);

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <span className="font-mono text-caption font-semibold text-amber-400">
        {average.toFixed(1)} / 5
      </span>
      <Stars value={average} size={size} />
    </div>
  );
}
