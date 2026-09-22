import { useState } from 'react';
import ReviewCard from '../components/ReviewCard';
import Reveal from '../components/ui/Reveal';
import { avatarFallback } from '../lib/format';
import { getSupabase } from '../lib/supabase';

/** Inline icons -- 16px, stroke="currentColor", no Unicode glyphs anywhere. */
function IconPlus() {
  return (
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconCopy() {
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
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M6 15H5.5A1.5 1.5 0 0 1 4 13.5v-8A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5V6" />
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

  /**
   * The code is the one thing an admin actually has to hand over, so it gets a
   * copy button. `navigator.clipboard` needs a secure context; the textarea
   * path covers a plain-http preview.
   */
  const copyCode = async (code) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const area = document.createElement('textarea');
        area.value = code;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      onToast(`Code ${code} copied.`);
    } catch {
      onError('Could not copy the code. Select it manually.');
    }
  };

  return (
    <div className="relative">
      <div className="section-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h2 className="mt-2 text-h1">Admin Panel</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => openReviewModal(null)} className="btn-primary">
            <IconPlus />
            Add Feedback
          </button>

          <button type="button" onClick={openGenerateModal} className="btn-ghost">
            <IconPlus />
            Generate Code
          </button>
        </div>
      </div>

      {inviteCodes.length > 0 && (
        <Reveal as="section" className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-h3">Active Invite Codes</h3>
            <span className="chip">{inviteCodes.length}</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {inviteCodes.map((item) => (
              <div key={item.id} className="card-interactive lift group flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={item.pfp || avatarFallback(item.nickname)}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full border border-line-strong object-cover
                                 ring-2 ring-transparent transition-all duration-250 ease-expo
                                 group-hover:ring-accent/45"
                      onError={(event) => {
                        event.currentTarget.src = avatarFallback(item.nickname);
                      }}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-caption font-semibold text-ink">
                        {item.nickname}
                      </p>
                      {item.role && (
                        <p className="truncate text-caption text-muted">{item.role}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => revokeCode(item.id)}
                    title="Revoke"
                    aria-label={`Revoke code ${item.code}`}
                    className="btn-quiet shrink-0 text-red-300 hover:bg-red-500/15 hover:text-red-200"
                  >
                    <IconTrash />
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/[0.07] px-3 py-2.5">
                  <code className="min-w-0 flex-1 truncate font-mono text-h4 font-semibold tracking-[0.18em] text-accent-2">
                    {item.code}
                  </code>

                  <button
                    type="button"
                    onClick={() => copyCode(item.code)}
                    title="Copy code"
                    aria-label={`Copy code ${item.code}`}
                    className="btn-quiet shrink-0"
                  >
                    <IconCopy />
                  </button>
                </div>

                {(item.game_title || item.discord) && (
                  <div className="flex flex-wrap gap-2">
                    {item.game_title && <span className="chip-accent">{item.game_title}</span>}
                    {item.discord && <span className="chip font-mono">{item.discord}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal as="section" className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h3 className="text-h3">Manage Feedbacks</h3>
          {reviews.length > 0 && <span className="chip">{reviews.length}</span>}
        </div>

        {reviews.length === 0 ? (
          <div className="panel py-12 text-center text-body text-muted">
            No feedbacks in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
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
      </Reveal>
    </div>
  );
}
