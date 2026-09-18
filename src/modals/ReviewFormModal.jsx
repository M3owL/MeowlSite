import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import RatingEditor from '../components/ui/RatingEditor';
import { sanitizeRatings } from '../lib/normalize';
import { DEFAULT_CATEGORIES, BUCKET_LIMITS } from '../lib/constants';
import { uploadPublicFile } from '../lib/storage';
import { getSupabase } from '../lib/supabase';

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

  const patch = (changes) => setForm((current) => ({ ...current, ...changes }));

  const handleAvatar = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPublicFile(file, 'review-avatar', {
        maxBytes: BUCKET_LIMITS.avatar,
      });
      patch({ pfp: url });
    } catch (error) {
      onError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    const client = getSupabase();
    if (!client) return;

    if (!form.nickname.trim() || !form.text.trim()) {
      return onError('Nickname and feedback text are required.');
    }

    setSaving(true);

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

    if (result.error) return onError(result.error.message);

    await onSave();
  };

  return (
    <Modal
      title={review ? 'Edit feedback' : 'Add feedback'}
      onClose={onCancel}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Avatar">
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(event) => handleAvatar(event.target.files?.[0])}
              className="w-full rounded border border-slate-700 bg-slate-900 p-1 text-sm font-bold text-white"
            />

            {uploading && <p className="mt-1 text-xs font-bold text-slate-500">Uploading…</p>}

            {form.pfp && (
              <img
                src={form.pfp}
                alt=""
                className="mt-2 h-10 w-10 rounded-full border border-slate-600 object-cover"
              />
            )}
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

        <Field label="Feedback text">
          <textarea
            value={form.text}
            onChange={(event) => patch({ text: event.target.value })}
            className="form-input h-28 font-medium"
            required
          />
        </Field>

        <RatingEditor ratings={form.ratings} onChange={(ratings) => patch({ ratings })} />

        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-white">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) => patch({ published: event.target.checked })}
            className="h-4 w-4 rounded accent-accent"
          />
          Publish immediately
        </label>

        <div className="flex gap-4 border-t border-slate-700 pt-4">
          <button type="button" onClick={onCancel} className="btn-ghost flex-1">
            Cancel
          </button>

          <button type="submit" disabled={saving || uploading} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
