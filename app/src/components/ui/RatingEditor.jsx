import Stars from './Stars';
import { calculateAverageRating } from '../../lib/format';

/**
 * Rating rows editor, shared by the invite-code flow and the admin review form.
 * The old build duplicated this ~120 lines of JSX in two places.
 */
export default function RatingEditor({ ratings, onChange }) {
  const average = calculateAverageRating(ratings);

  const update = (index, patch) => {
    const next = [...ratings];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="rounded border border-slate-700 bg-slate-950/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-accent">
          Ratings (average: {average.toFixed(1)} / 5)
        </span>

        <button
          type="button"
          onClick={() => onChange([...ratings, { category: 'New category', value: 5 }])}
          className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold hover:bg-slate-700"
        >
          + Add category
        </button>
      </div>

      {ratings.length === 0 ? (
        <p className="text-xs font-bold italic text-slate-500">No ratings.</p>
      ) : (
        ratings.map((rating, index) => (
          <div
            key={`rating-${index}`}
            className="mb-2 flex items-center gap-3 last:mb-0"
          >
            <input
              value={rating.category}
              onChange={(event) => update(index, { category: event.target.value })}
              aria-label={`Rating ${index + 1} name`}
              className="w-1/3 rounded border border-slate-700 bg-slate-900 p-2 text-xs font-bold text-white"
            />

            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={rating.value}
              onChange={(event) => update(index, { value: parseFloat(event.target.value) })}
              aria-label={`${rating.category} score`}
              className="w-1/3 accent-accent"
            />

            <div className="flex w-28 items-center justify-end gap-2">
              <span className="font-mono text-xs font-bold text-yellow-400">
                {Number(rating.value).toFixed(1)}
              </span>
              <Stars value={rating.value} size="xs" />
            </div>

            <button
              type="button"
              onClick={() => onChange(ratings.filter((_, i) => i !== index))}
              aria-label={`Remove ${rating.category}`}
              className="rounded border border-red-900/50 bg-red-950/40 px-2 py-1 text-xs font-bold text-red-500 hover:text-red-400"
            >
              ×
            </button>
          </div>
        ))
      )}
    </div>
  );
}
