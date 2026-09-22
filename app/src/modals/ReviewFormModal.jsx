import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import RatingEditor from '../components/ui/RatingEditor';
import { sanitizeRatings } from '../lib/normalize';
import { DEFAULT_CATEGORIES, BUCKET_LIMITS } from '../lib/constants';
import { uploadPublicFile } from '../lib/storage';
import { getSupabase } from '../lib/supabase';

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ErrorNote({ children }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-caption text-red-200"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mt-px h-4 w-4 shrink-0 text-red-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5" />
        <path d="M12 16h.01" />
      </svg>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
        <h3 className="font-display text-caption font-semibold uppercase tracking-[0.14em] text-accent">
          {title}
        </h3>
        {hint && <span className="shrink-0 text-caption text-faint">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function initialForm(review) {
  return {
    pfp: review?.pfp || review?.avatar_url || '',
    nickname: review?.nickname || '',
    discord: review?.discord || review?.discord_username || '',
    role: review?.role || '',
    game_title: review?.game_title || '',
    text: review?.text || review?.review_text || '',
    ratings: Array.isArray(review?.ratings)
      ? review.ratings.map((entry) => ({ ...entry }))
      : DEFAULT_CATEGORIES.map((entry) => ({ ...entry })),
    published: review?.published ?? true,
  };
}

/** Admin-side create/edit form for a feedback entry. */
export default function ReviewFormModal({ review, onSave, onCancel, onError }) {
  const [form, setForm] = useState(() => initialForm(review));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const patch = (changes) => setForm((current) => ({ ...current, ...changes }));

  const handleAvatar = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadPublicFile(file, 'review-avatar', {
        maxBytes: BUCKET_LIMITS.avatar,
      });
      patch({ pfp: url });
    } catch (uploadError) {
      setError(uploadError.message);
      onError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    const client = getSupabase();
    if (!client) return;

    if (!form.nickname.trim() || !form.text.trim()) {
      const message = 'Nickname and feedback text are required.';
      setError(message);
      return onError(message);
    }

    setSaving(true);
    setError('');

    const payload = {
      nickname: form.nickname.trim(),
      discord_username: form.discord.trim() || null,
      role: form.role.trim() || null,
      game_title: form.game_title.trim() || null,
      review_text: form.text.trim(),
      avatar_url: form.pfp.trim() || null,
      ratings: sanitizeRatings(form.ratings),
      published: Boolean(form.published),
    };

    const result = review
      ? await client.from('reviews').update(payload).eq('id', review.id)
      : await client.from('reviews').insert(payload);

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return onError(result.error.message);
    }

    await onSave();
  };

  const busy = saving || uploading;

  return (
    <Modal
      title={review ? 'Edit feedback' : 'Add feedback'}
      onClose={onCancel}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-5">
        <Section title="Reviewer">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Avatar" hint="Optional">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface-2 text-faint">
                  {form.pfp ? (
                    <img src={form.pfp} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="9" r="3.5" />
                      <path d="M5 20a7 7 0 0 1 14 0" />
                    </svg>
                  )}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(event) => handleAvatar(event.target.files?.[0])}
                  className="block w-full cursor-pointer text-caption text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-3 file:px-3 file:py-1.5 file:text-caption file:font-semibold file:text-ink hover:file:bg-surface-3/80 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {uploading && <p className="mt-1.5 text-caption text-faint">Uploading...</p>}
            </Field>

            <Field label="Nickname">
              <input
                value={form.nickname}
                onChange={(event) => patch({ nickname: event.target.value })}
                className="form-input"
                required
              />
            </Field>

            <Field label="Discord">
              <input
                value={form.discord}
                onChange={(event) => patch({ discord: event.target.value })}
                className="form-input font-mono"
              />
            </Field>

            <Field label="Role">
              <input
                value={form.role}
                onChange={(event) => patch({ role: event.target.value })}
                className="form-input"
              />
            </Field>

            <Field label="Game title">
              <input
                value={form.game_title}
                onChange={(event) => patch({ game_title: event.target.value })}
                className="form-input"
              />
            </Field>
          </div>
        </Section>

        <Section title="Review">
          <Field label="Review text">
            <textarea
              value={form.text}
              onChange={(event) => patch({ text: event.target.value })}
              className="form-input h-32"
              required
            />
          </Field>
        </Section>

        <RatingEditor ratings={form.ratings} onChange={(ratings) => patch({ ratings })} />

        <Section title="Visibility">
          <label className="flex cursor-pointer select-none items-center gap-3 rounded-lg border border-line bg-surface-2/40 px-3 py-2.5 text-caption font-medium text-muted transition-colors duration-250 ease-expo hover:border-line-strong hover:text-ink">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => patch({ published: event.target.checked })}
              className="h-4 w-4 shrink-0 rounded accent-accent"
            />
            Publish immediately
          </label>
        </Section>

        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="flex flex-col gap-2.5 border-t border-line pt-4 sm:flex-row-reverse">
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy && <Spinner />}
            {saving ? 'Saving...' : 'Save feedback'}
          </button>

          <button type="button" onClick={onCancel} className="btn-ghost flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
