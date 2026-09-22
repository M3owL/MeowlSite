import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import { uploadPublicFile } from '../lib/storage';
import { BUCKET_LIMITS } from '../lib/constants';
import { getSupabase } from '../lib/supabase';

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

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

/** Creates a single-use invite code, optionally pre-filled with reviewer details. */
export default function GenerateCodeModal({ onClose, onCreated, onError, onToast }) {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAvatar = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      setAvatarUrl(await uploadPublicFile(file, 'invite-avatar', { maxBytes: BUCKET_LIMITS.avatar }));
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

    const form = new FormData(event.currentTarget);
    const nickname = String(form.get('nickname') || '').trim();
    const role = String(form.get('role') || '').trim();
    const gameTitle = String(form.get('game_title') || '').trim();
    const discord = String(form.get('discord_username') || '').trim();

    if (!nickname || !role) {
      const message = 'Nickname and role are required.';
      setError(message);
      return onError(message);
    }

    setSaving(true);
    setError('');

    // Retry on unique-violation (Postgres 23505) only.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = randomCode();

      const { error: insertError } = await client.from('invite_codes').insert({
        code,
        nickname,
        role,
        game_title: gameTitle || null,
        discord_username: discord || null,
        avatar_url: avatarUrl || null,
        used: false,
      });

      if (!insertError) {
        setSaving(false);
        onToast(`Generated code: ${code}`);
        await onCreated();
        return;
      }

      if (insertError.code !== '23505') {
        setSaving(false);
        setError(insertError.message);
        return onError(insertError.message);
      }
    }

    setSaving(false);
    const message = 'Could not generate a unique code after 8 attempts.';
    setError(message);
    onError(message);
  };

  const busy = saving || uploading;

  return (
    <Modal
      title="Generate invite code"
      subtitle="Single use. The reviewer fills in their own feedback."
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={submit} className="space-y-5">
        <Section title="Reviewer">
          <div className="space-y-4">
            <Field label="Avatar" hint="Optional. Shown on the feedback card.">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface-2 text-faint">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
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
              <input name="nickname" className="form-input" required />
            </Field>

            <Field label="Role" hint="e.g. Developer, Studio Owner">
              <input name="role" className="form-input" required />
            </Field>
          </div>
        </Section>

        <Section title="Details" hint="Optional">
          <div className="space-y-4">
            <Field label="Game title">
              <input name="game_title" className="form-input" placeholder="Optional" />
            </Field>

            <Field label="Discord username">
              <input
                name="discord_username"
                className="form-input font-mono"
                placeholder="Optional"
              />
            </Field>
          </div>
        </Section>

        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row-reverse">
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy && <Spinner />}
            {saving ? 'Generating...' : 'Generate code'}
          </button>

          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
