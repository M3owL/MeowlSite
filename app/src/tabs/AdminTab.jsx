import { useState } from 'react';
import ReviewCard from '../components/ReviewCard';
import { avatarFallback } from '../lib/format';
import { getSupabase } from '../lib/supabase';

export default function AdminTab({
  reviews,
  inviteCodes,
  reloadReviews,
  reloadCodes,
  onError,
  onToast,
  openReviewModal,
  openGenerateModal,
}) {
  const [busy, setBusy] = useState(false);
  const client = getSupabase();

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this feedback permanently?')) return;
    setBusy(true);
    const { error } = await client.from('reviews').delete().eq('id', id);
    setBusy(false);
    if (error) return onError(error.message);
    await reloadReviews();
    onToast('Feedback deleted.');
  };

  const togglePublish = async (id, published) => {
    setBusy(true);
    const { error } = await client.from('reviews').update({ published }).eq('id', id);
    setBusy(false);
    if (error) return onError(error.message);
    await reloadReviews();
    onToast(published ? 'Published.' : 'Hidden.');
  };

  const revokeCode = async (id) => {
    if (!window.confirm('Revoke this invite code?')) return;
    setBusy(true);
    const { error } = await client
      .from('invite_codes')
      .delete()
      .eq('id', id)
      .eq('used', false);
    setBusy(false);
    if (error) return onError(error.message);
    await reloadCodes();
    onToast('Code revoked.');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Admin Panel</h2>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => openReviewModal(null)} className="btn-primary">
            + Add Feedback
          </button>

          <button
            type="button"
            onClick={openGenerateModal}
            className="btn border border-purple-800 bg-purple-900/50 px-4 py-2 text-purple-300 hover:bg-purple-800"
          >
            + Generate Code
          </button>
        </div>
      </div>

      {inviteCodes.length > 0 && (
        <section className="mb-8 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-3 text-sm font-bold text-slate-400">Active Invite Codes</p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {inviteCodes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-800 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={item.pfp || avatarFallback(item.nickname)}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full border border-slate-600 object-cover"
                    onError={(event) => {
                      event.currentTarget.src = avatarFallback(item.nickname);
                    }}
                  />

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white">{item.nickname}</p>
                    <p className="truncate text-[10px] font-bold text-accent">{item.role}</p>
                    {item.game_title && (
                      <p className="truncate text-[10px] font-bold text-cyan-400">
                        Game: {item.game_title}
                      </p>
                    )}
                    {item.discord && (
                      <p className="truncate font-mono text-[10px] text-slate-400">
                        {item.discord}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <span className="rounded border border-slate-600 bg-slate-900 px-2 py-1 font-mono text-sm font-bold text-accent">
                    {item.code}
                  </span>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => revokeCode(item.id)}
                    title="Revoke"
                    aria-label={`Revoke code ${item.code}`}
                    className="px-2 text-lg font-bold text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-12">
        <h3 className="mb-4 text-xl font-bold text-slate-300">Manage Feedbacks</h3>

        {reviews.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center font-bold text-slate-500">
            No feedbacks in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                admin
                onEdit={openReviewModal}
                onDelete={deleteReview}
                onTogglePublish={togglePublish}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
