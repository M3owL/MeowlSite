import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import { uploadPublicFile } from '../lib/storage';
import { BUCKET_LIMITS } from '../lib/constants';
import { getSupabase } from '../lib/supabase';

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Creates a single-use invite code, optionally pre-filled with reviewer details. */
export default function GenerateCodeModal({ onClose, onCreated, onError, onToast }) {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatar = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      setAvatarUrl(await uploadPublicFile(file, 'invite-avatar', { maxBytes: BUCKET_LIMITS.avatar }));
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

    const form = new FormData(event.currentTarget);
    const nickname = String(form.get('nickname') || '').trim();
    const role = String(form.get('role') || '').trim();
    const gameTitle = String(form.get('game_title') || '').trim();
    const discord = String(form.get('discord_username') || '').trim();

    if (!nickname || !role) return;

    setSaving(true);

    // Retry on unique-violation (Postgres 23505) only.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = randomCode();

      const { error } = await client.from('invite_codes').insert({
        code,
        nickname,
        role,
        game_title: gameTitle || null,
        discord_username: discord || null,
        avatar_url: avatarUrl || null,
        used: false,
      });

      if (!error) {
        setSaving(false);
        onToast(`Generated code: ${code}`);
        await onCreated();
        return;
      }

      if (error.code !== '23505') {
        setSaving(false);
        return onError(error.message);
      }
    }

    setSaving(false);
    onError('Could not generate a unique code after 8 attempts.');
  };

  return (
    <Modal
      title="Generate invite code"
      subtitle="Single use. The reviewer fills in their own feedback."
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Avatar">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => handleAvatar(event.target.files?.[0])}
            className="w-full rounded border border-slate-700 bg-slate-900 p-1 text-sm font-bold text-white"
          />

          {uploading && <p className="mt-1 text-xs font-bold text-slate-500">Uploading…</p>}

          {avatarUrl && (
            <img
              src={avatarUrl}
              alt=""
              className="mt-2 h-10 w-10 rounded-full border border-slate-600 object-cover"
            />
          )}
        </Field>

        <Field label="Nickname">
          <input name="nickname" className="form-input" required />
        </Field>

        <Field label="Role" hint="e.g. Developer, Studio Owner">
          <input name="role" className="form-input" required />
        </Field>

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

        <div className="flex gap-4 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || uploading}
            className="btn flex-1 bg-purple-600 px-4 py-2 text-white hover:bg-purple-500"
          >
            {saving ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
