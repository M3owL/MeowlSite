import { calculateAverageRating } from '../../lib/format';

/**
 * Star rating with half-star precision.
 * The old version rendered a nested absolutely-positioned overlay per half
 * star; this clips a filled row against an empty row instead -- same look,
 * a third of the DOM.
 */
export default function Stars({ value, size = 'sm' }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));
  const percent = (rating / 5) * 100;

  const scale = size === 'lg' ? 'text-xl' : size === 'xs' ? 'text-[10px]' : 'text-sm';

  return (
    <span
      className={`relative inline-block leading-none tracking-tight ${scale}`}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5`}
    >
      <span className="text-slate-600">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden whitespace-nowrap text-yellow-400"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      >
        ★★★★★
      </span>
    </span>
  );
}

/** Score + stars, the pattern repeated in several cards. */
export function RatingBadge({ ratings, size = 'sm' }) {
  if (!Array.isArray(ratings) || ratings.length === 0) return null;

  const average = calculateAverageRating(ratings);

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-mono text-xs font-bold text-yellow-400">
        {average.toFixed(1)} / 5
      </span>
      <Stars value={average} size={size} />
    </div>
  );
}
