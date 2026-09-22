import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import { getSupabase, isRemembering, setRemembering } from '../lib/supabase';
import { BRAND } from '../lib/constants';

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
      <div className="space-y-5">
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
              <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
              <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
              <path d="M12 14.5v2.5" />
            </svg>
          </span>

          <div className="min-w-0">
            <p className="eyebrow">{BRAND.name}</p>
            <p className="mt-1 text-caption text-muted">
              Sign in to manage projects, feedback and invite codes.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Email">
            <input
              type="email"
              autoComplete="username"
              autoFocus
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

          <label className="flex cursor-pointer select-none items-center gap-3 rounded-lg border border-line bg-surface-2/40 px-3 py-2.5 text-caption font-medium text-muted transition-colors duration-250 ease-expo hover:border-line-strong hover:text-ink">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 shrink-0 accent-accent"
            />
            Remember me
          </label>

          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row-reverse">
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy && <Spinner />}
              {busy ? 'Signing in...' : 'Sign in'}
            </button>

            <button type="button" onClick={onCancel} className="btn-ghost flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
