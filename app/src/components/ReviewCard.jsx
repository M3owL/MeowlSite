import { avatarFallback, formatDate } from '../lib/format';
import { useSpotlight } from '../lib/motion';
import { RatingBadge } from './ui/Stars';

/** Inline icons -- 16px, stroke="currentColor", no Unicode glyphs anywhere. */
function IconGamepad() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="20" height="10" rx="5" />
      <path d="M7 10v4M5 12h4" />
      <circle cx="16" cy="11" r="1" />
      <circle cx="18.5" cy="13.5" r="1" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20h4l10-10a2.5 2.5 0 0 0-4-4L4 16v4Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M6.5 7l.9 12a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-12" />
    </svg>
  );
}

/**
 * 0-5 value for one `{category, value}` entry, or `null` when it carries no
 * usable number. `Number(null)` / `Number('')` are both `0`, so those are
 * rejected explicitly instead of being drawn as a genuine zero bar.
 */
function ratingValue(entry) {
  const raw = entry?.value;
  if (raw === null || raw === undefined || raw === '') return null;

  const value = Number(raw);
  if (!Number.isFinite(value)) return null;

  return Math.max(0, Math.min(5, value));
}

/**
 * One review.
 *
 * The reviewer's name used to be an <h3>, which put a person into the document
 * outline as a section. It is now a <p> inside a <figure>/<blockquote> pair --
 * the semantics a quote actually wants. The rating badge keeps the `4.8 / 5`
 * format; the per-category ratings are bars instead of rows of 12px text.
 */
export default function ReviewCard({
  review,
  admin = false,
  onEdit,
  onDelete,
  onTogglePublish,
}) {
  const hidden = admin && !review.published;
  const spotlight = useSpotlight();
  const date = formatDate(review.date);

  // Malformed entries are dropped, not rendered as 0.0 with an empty bar.
  const ratings = (Array.isArray(review.ratings) ? review.ratings : [])
    .map((entry) => ({
      category: String(entry?.category ?? '').trim(),
      value: ratingValue(entry),
    }))
    .filter((entry) => entry.category && entry.value !== null);

  return (
    <figure
      {...spotlight}
      className={`card-interactive lift spotlight group flex h-full flex-col p-5 sm:p-6 ${
        hidden ? 'border-dashed border-line-strong opacity-60 grayscale' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <img
            src={review.pfp || avatarFallback(review.nickname)}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full border border-line-strong object-cover ring-2
                       ring-transparent transition-all duration-250 ease-expo group-hover:ring-accent/45"
            onError={(event) => {
              event.currentTarget.src = avatarFallback(review.nickname);
            }}
          />

          <div className="min-w-0">
            <p className="truncate font-display text-h4 font-semibold text-ink">
              {review.nickname}
            </p>

            {review.role && (
              <p className="truncate text-caption font-medium text-accent">{review.role}</p>
            )}
          </div>
        </div>

        <RatingBadge ratings={ratings} />
      </div>

      {review.text && (
        <blockquote className="mt-5 flex-grow text-body italic text-muted">
          {review.text}
        </blockquote>
      )}

      {(review.game_title || review.discord || date) && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {review.game_title && (
            <span className="chip-accent">
              <IconGamepad />
              {review.game_title}
            </span>
          )}

          {review.discord && <span className="chip font-mono">{review.discord}</span>}

          {date && <span className="text-caption text-faint">{date}</span>}
        </div>
      )}

      {ratings.length > 0 && (
        <div className="mt-5 grid gap-3 rounded-lg border border-line bg-surface-2/50 p-3.5">
          {ratings.map((entry, index) => (
            <div key={`${entry.category}-${index}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-caption font-medium text-muted">{entry.category}</span>
                <span className="font-mono text-caption font-semibold text-accent-2">
                  {entry.value.toFixed(1)}
                </span>
              </div>

              <div className="bar-track mt-2">
                <div className="bar-fill" style={{ width: `${(entry.value / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {admin && (
        <div className="mt-5 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => onTogglePublish(review.id, !review.published)}
            className={`btn btn-sm w-full ${
              review.published
                ? 'border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20'
                : 'border border-line-strong bg-white/[0.05] text-muted hover:text-ink'
            }`}
          >
            {review.published ? 'Published' : 'Hidden'}
          </button>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit(review)}
              className="btn btn-sm border border-iris/30 bg-iris/10 text-iris hover:bg-iris/20"
            >
              <IconPencil />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(review.id)}
              className="btn-danger"
            >
              <IconTrash />
              Delete
            </button>
          </div>
        </div>
      )}
    </figure>
  );
}
