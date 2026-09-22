import ReviewCard from '../components/ReviewCard';
import Reveal from '../components/ui/Reveal';
import Stars from '../components/ui/Stars';
import { DEFAULT_CATEGORIES } from '../lib/constants';

/**
 * 0-5 value for one `{category, value}` entry, or `null` when the entry carries
 * no usable number.
 *
 * The explicit `null` / `''` guards are load-bearing: `Number(null)` and
 * `Number('')` are both `0`, so a null value would otherwise be counted as a
 * genuine zero rating -- dragging the average down and painting a phantom
 * empty bar. Anything non-finite is dropped rather than coerced.
 */
function ratingValue(entry) {
  const raw = entry?.value;
  if (raw === null || raw === undefined || raw === '') return null;

  const value = Number(raw);
  if (!Number.isFinite(value)) return null;

  return Math.max(0, Math.min(5, value));
}

/** `ratings` is always an array post-normalize; this keeps the maths total anyway. */
function entriesOf(review) {
  return Array.isArray(review.ratings) ? review.ratings : [];
}

/**
 * Rolls every rating on the visible reviews into an overall average plus a
 * per-category average.
 *
 * Returns `null` when nothing is rated at all, so the caller can drop the block
 * entirely rather than render a `0.0 / 5` built from zero data (and so no
 * division by zero can reach the UI).
 */
function buildSummary(reviews) {
  const values = [];
  const buckets = new Map();

  reviews.forEach((review) => {
    entriesOf(review).forEach((entry) => {
      const value = ratingValue(entry);
      if (value === null) return;

      values.push(value);

      const category = String(entry?.category ?? '').trim();
      if (!category) return;

      // A bucket only ever exists once something has been added to it, so
      // `count` is >= 1 wherever it is read -- the per-category mean can never
      // be 0/0 or Infinity.
      const bucket = buckets.get(category) ?? { sum: 0, count: 0 };
      bucket.sum += value;
      bucket.count += 1;
      buckets.set(category, bucket);
    });
  });

  if (values.length === 0) return null;

  // Speed / Communication / Professionalism / Reliability first, in the order
  // the rating editor uses, then anything else alphabetically.
  const preferred = DEFAULT_CATEGORIES.map((entry) => entry.category);
  const rank = (category) => {
    const index = preferred.indexOf(category);
    return index === -1 ? preferred.length : index;
  };

  const categories = [...buckets.entries()]
    .map(([category, bucket]) => ({ category, average: bucket.sum / bucket.count }))
    .sort((a, b) => rank(a.category) - rank(b.category) || a.category.localeCompare(b.category));

  const contributors = reviews.filter((review) =>
    entriesOf(review).some((entry) => ratingValue(entry) !== null),
  ).length;

  return {
    overall: values.reduce((sum, value) => sum + value, 0) / values.length,
    categories,
    contributors,
  };
}

/**
 * Public feedback wall.
 *
 * The aggregate block is derived from the same `visible` list the grid renders,
 * so an admin previewing the tab sees the numbers a guest would see -- plus the
 * unpublished reviews they are allowed to see.
 */
export default function ReviewsTab({ reviews, isAdmin, openCodeModal }) {
  const visible = isAdmin ? reviews : reviews.filter((review) => review.published);
  const summary = buildSummary(visible);

  return (
    <div className="relative">
      <div className="section-head">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-2 text-h1">What clients say</h2>
        </div>

        {!isAdmin && (
          <button type="button" onClick={openCodeModal} className="btn-ghost btn-sm">
            I have an invite code
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-body-lg text-muted">No feedbacks yet.</p>
      ) : (
        <>
          {summary && (
            <Reveal className="mb-10">
              <section className="panel relative overflow-hidden" aria-label="Average ratings">
                <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center">
                  <div>
                    <p className="eyebrow">Average rating</p>

                    <div className="mt-3 flex items-end gap-3">
                      <span className="font-display text-display-2 font-semibold leading-none text-ink">
                        {summary.overall.toFixed(1)}
                      </span>
                      <span className="pb-1 text-h4 font-medium text-faint">/ 5</span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <Stars value={summary.overall} size="lg" />
                      <span className="text-caption text-muted">
                        Based on {summary.contributors}{' '}
                        {summary.contributors === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {summary.categories.map((entry) => (
                      <div key={entry.category}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-caption font-medium text-muted">
                            {entry.category}
                          </span>
                          <span className="font-mono text-caption font-semibold text-accent-2">
                            {entry.average.toFixed(1)}
                          </span>
                        </div>

                        <div className="bar-track mt-2">
                          <div
                            className="bar-fill"
                            style={{ width: `${(entry.average / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
            {visible.map((review, index) => (
              <Reveal key={review.id} index={index} className="mb-5 break-inside-avoid">
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
