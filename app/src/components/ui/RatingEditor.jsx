import Stars from './Stars';
import { calculateAverageRating } from '../../lib/format';

/**
 * Rating rows editor, shared by the invite-code flow and the admin review form.
 *
 * Each row is its own card and stacks below `sm:`, because four controls on one
 * line is unusable on a phone. Interface (`ratings`, `onChange`) is unchanged --
 * two modals depend on it.
 */
export default function RatingEditor({ ratings, onChange }) {
  const average = calculateAverageRating(ratings);

  const update = (index, patch) => {
    const next = [...ratings];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="rounded-lg border border-line bg-surface-2/40 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-caption font-semibold text-accent">
          Ratings
          <span className="ml-2 font-mono text-muted">avg {average.toFixed(1)} / 5</span>
        </span>

        <button
          type="button"
          onClick={() => onChange([...ratings, { category: 'New category', value: 5 }])}
          className="btn-ghost btn-sm"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add category
        </button>
      </div>

      {ratings.length === 0 ? (
        <p className="text-caption italic text-faint">No ratings.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {ratings.map((rating, index) => (
            <div
              key={`rating-${index}`}
              className="flex flex-col gap-3 rounded-md border border-line bg-surface/60 p-3
                         transition-colors duration-250 ease-expo hover:border-line-strong
                         sm:flex-row sm:items-center"
            >
              <input
                value={rating.category}
                onChange={(event) => update(index, { category: event.target.value })}
                aria-label={`Rating ${index + 1} name`}
                className="form-input sm:w-44 sm:py-1.5"
              />

              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={rating.value}
                onChange={(event) => update(index, { value: parseFloat(event.target.value) })}
                aria-label={`${rating.category} score`}
                className="h-1.5 w-full flex-1 cursor-pointer appearance-none rounded-full
                           bg-white/10 accent-accent"
              />

              <div className="flex items-center justify-between gap-3 sm:w-32 sm:justify-end">
                <span className="font-mono text-caption font-semibold text-amber-400">
                  {Number(rating.value).toFixed(1)}
                </span>
                <Stars value={rating.value} size="xs" />

                <button
                  type="button"
                  onClick={() => onChange(ratings.filter((_, i) => i !== index))}
                  aria-label={`Remove ${rating.category}`}
                  className="rounded-md p-1.5 text-faint transition-colors duration-250 ease-expo
                             hover:bg-red-500/10 hover:text-red-400"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
