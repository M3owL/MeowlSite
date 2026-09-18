import ReviewCard from '../components/ReviewCard';

/**
 * Public feedback wall.
 *
 * Bug fixed here: the old version rendered <ReviewCard admin={isAdmin}> but
 * hardcoded onEdit/onDelete/onTogglePublish to null. For an admin viewing this
 * tab, ReviewCard renders those buttons -- so clicking Edit threw
 * "onEdit is not a function". Now admin controls are simply not offered on the
 * public tab; editing happens in the Admin tab where the handlers exist.
 */
export default function ReviewsTab({ reviews, isAdmin, openCodeModal }) {
  const visible = isAdmin ? reviews : reviews.filter((review) => review.published);

  return (
    <div className="relative animate-fade-in">
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Feedbacks</h2>

        {!isAdmin && (
          <button type="button" onClick={openCodeModal} className="btn-ghost text-sm">
            I have an invite code
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="mt-12 text-center text-xl font-bold text-slate-500">
          No feedbacks yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
