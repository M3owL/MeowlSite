import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import RatingEditor from '../components/ui/RatingEditor';
import { avatarFallback } from '../lib/format';
import { sanitizeRatings } from '../lib/normalize';
import { DEFAULT_CATEGORIES } from '../lib/constants';
import { getSupabase } from '../lib/supabase';

/**
 * Public review submission, gated by a single-use invite code.
 * Both steps go through SECURITY DEFINER RPCs so the client never needs
 * insert/update rights on the reviews table.
 */
export default function InviteCodeModal({ onClose, onSubmitted, onError }) {
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [ratings, setRatings] = useState(() => DEFAULT_CATEGORIES.map((c) => ({ ...c })));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const normalizedCode = code.trim().toUpperCase();

  const verify = async (event) => {
    event.preventDefault();

    const client = getSupabase();
    if (!client) return;

    setBusy(true);
    setError('');

    const { data, error: rpcError } = await client.rpc('get_invite_code_preview', {
      input_code: normalizedCode,
    });

    setBusy(false);

    if (rpcError) return setError(rpcError.message);
    if (!Array.isArray(data) || data.length === 0) return setError('Invalid or already used code.');

    setPreview(data[0]);
  };

  const submit = async (event) => {
    event.preventDefault();

    const client = getSupabase();
    if (!client || !preview || !reviewText.trim()) return;

    setBusy(true);
    setError('');

    const { error: rpcError } = await client.rpc('submit_review_with_code', {
      input_code: normalizedCode,
      input_review_text: reviewText.trim(),
      input_ratings: sanitizeRatings(ratings),
    });

    setBusy(false);

    if (rpcError) return setError(rpcError.message);

    await onSubmitted();
  };

  return (
    <Modal title="Use invite code" onClose={onClose} maxWidth="max-w-lg">
      {!preview ? (
        <form onSubmit={verify} className="space-y-4">
          <Field label="Code" hint="Six characters, case does not matter.">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              className="form-input font-mono font-bold tracking-widest"
              placeholder="ABC123"
              autoFocus
              required
            />
          </Field>

          {error && <p className="text-sm font-bold text-red-400">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-3 rounded border border-slate-700 bg-slate-950/60 p-3">
            <img
              src={preview.avatar_url || avatarFallback(preview.nickname)}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
              onError={(event) => {
                event.currentTarget.src = avatarFallback(preview.nickname);
              }}
            />

            <div className="min-w-0">
              <b className="text-white">{preview.nickname}</b>
              <div className="text-xs font-bold text-accent">{preview.role}</div>
              {preview.game_title && (
                <div className="text-[10px] font-bold text-cyan-400">
                  Game: {preview.game_title}
                </div>
              )}
              {preview.discord_username && (
                <div className="font-mono text-[10px] text-slate-400">
                  Discord: {preview.discord_username}
                </div>
              )}
            </div>
          </div>

          <Field label="Your feedback">
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              className="form-input min-h-32 font-medium"
              required
            />
          </Field>

          <RatingEditor ratings={ratings} onChange={setRatings} />

          {error && <p className="text-sm font-bold text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>

            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Sending…' : 'Submit feedback'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
