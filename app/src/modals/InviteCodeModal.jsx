import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import RatingEditor from '../components/ui/RatingEditor';
import { avatarFallback } from '../lib/format';
import { sanitizeRatings } from '../lib/normalize';
import { DEFAULT_CATEGORIES } from '../lib/constants';
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
        <form onSubmit={verify} className="space-y-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent shadow-glow-sm"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8.5" cy="12" r="3.5" />
                <path d="M12 12h8" />
                <path d="M17 12v3" />
                <path d="M20 12v2" />
              </svg>
            </span>

            <p className="text-caption text-muted">
              Enter the six-character code you were sent. Each code can only be used once.
            </p>
          </div>

          <Field label="Code" hint="Six characters, case does not matter.">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              className="form-input text-center font-mono text-h3 font-semibold uppercase tracking-[0.3em]"
              placeholder="ABC123"
              autoFocus
              required
            />
          </Field>

          {error && <ErrorNote>{error}</ErrorNote>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy && <Spinner />}
            {busy ? 'Checking...' : 'Verify code'}
          </button>
        </form>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <Section title="Reviewer" hint="Code verified">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-3">
              <img
                src={preview.avatar_url || avatarFallback(preview.nickname)}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full border border-line-strong object-cover"
                onError={(event) => {
                  event.currentTarget.src = avatarFallback(preview.nickname);
                }}
              />

              <div className="min-w-0">
                <p className="truncate font-display text-body font-semibold text-ink">
                  {preview.nickname}
                </p>
                <p className="truncate text-caption font-medium text-accent">{preview.role}</p>
                {preview.game_title && (
                  <p className="truncate text-caption text-muted">Game: {preview.game_title}</p>
                )}
                {preview.discord_username && (
                  <p className="truncate font-mono text-caption text-faint">
                    Discord: {preview.discord_username}
                  </p>
                )}
              </div>
            </div>
          </Section>

          <Field label="Your feedback">
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              className="form-input h-32"
              required
            />
          </Field>

          <RatingEditor ratings={ratings} onChange={setRatings} />

          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row-reverse">
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy && <Spinner />}
              {busy ? 'Submitting...' : 'Submit feedback'}
            </button>

            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
