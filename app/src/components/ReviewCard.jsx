import { avatarFallback, formatDate } from '../lib/format';
import Stars, { RatingBadge } from './ui/Stars';

export default function ReviewCard({
  review,
  admin = false,
  onEdit,
  onDelete,
  onTogglePublish,
}) {
  const hidden = admin && !review.published;

  return (
    <div
      className={`glass flex flex-col rounded-xl p-6 shadow-xl ${
        hidden ? 'border border-dashed border-slate-600 opacity-60 grayscale' : ''
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-700 pb-4">
        <div className="flex min-w-0 items-center gap-4">
          <img
            src={review.pfp || avatarFallback(review.nickname)}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full border border-slate-500 object-cover"
            onError={(event) => {
              event.currentTarget.src = avatarFallback(review.nickname);
            }}
          />

          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold leading-tight text-white">
              {review.nickname}
            </h3>

            {review.role && <p className="text-xs font-bold text-accent">{review.role}</p>}

            {review.game_title && (
              <span className="mt-1 inline-block rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                Game: {review.game_title}
              </span>
            )}

            {review.discord && (
              <p className="mt-1 truncate font-mono text-[10px] text-slate-500">
                {review.discord}
              </p>
            )}

            {formatDate(review.date) && (
              <p className="mt-1 text-[10px] font-bold text-slate-500">
                {formatDate(review.date)}
              </p>
            )}
          </div>
        </div>

        <RatingBadge ratings={review.ratings} />
      </div>

      <p className="mb-6 flex-grow text-sm font-medium italic text-slate-300">
        “{review.text}”
      </p>

      {review.ratings.length > 0 && (
        <div className="mb-4 space-y-1 rounded-lg bg-slate-950/60 p-3">
          {review.ratings.map((rating, idx) => (
            <div key={`${rating.category}-${idx}`} className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{rating.category}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-yellow-400">
                  {Number(rating.value).toFixed(1)}
                </span>
                <Stars value={rating.value} size="xs" />
              </div>
            </div>
          ))}
        </div>
      )}

      {admin && (
        <div className="mt-auto flex gap-2 border-t border-slate-700 pt-4">
          <button
            type="button"
            onClick={() => onTogglePublish(review.id, !review.published)}
            className={`flex-1 rounded py-1 text-xs font-bold ${
              review.published
                ? 'border border-green-800 bg-green-900/50 text-green-400'
                : 'border border-slate-600 bg-slate-700 text-slate-400'
            }`}
          >
            {review.published ? 'Published' : 'Hidden'}
          </button>

          <button
            type="button"
            onClick={() => onEdit(review)}
            className="flex-1 rounded border border-blue-800 bg-blue-900/50 py-1 text-xs font-bold text-blue-300"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(review.id)}
            className="flex-1 rounded border border-red-800 bg-red-900/50 py-1 text-xs font-bold text-red-300"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
