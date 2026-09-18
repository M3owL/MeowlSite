import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import { getSupabase, isRemembering, setRemembering } from '../lib/supabase';

export default function LoginModal({ onSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(isRemembering);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    const client = getSupabase();
    if (!client) return setError('No database connection.');

    setBusy(true);
    setError('');
    setRemembering(remember);

    const { data, error: loginError } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setBusy(false);

    if (loginError) return setError(loginError.message);
    if (!data?.session) return setError('Logged in, but no session was returned.');

    onSuccess(data.session);
  };

  return (
    <Modal title="Admin Login" onClose={onCancel} maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="form-input"
            required
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="form-input"
            required
          />
        </Field>

        <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-bold text-slate-300">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Remember me
        </label>

        {error && <p className="text-sm font-bold text-red-400">{error}</p>}

        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy ? 'Logging in…' : 'Login'}
          </button>

          <button type="button" onClick={onCancel} className="btn-ghost flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
