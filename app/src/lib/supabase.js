import { createClient } from '@supabase/supabase-js';

/**
 * The publishable key is *designed* to ship in client code -- it is not a
 * secret. What actually protects the data is Row Level Security on the
 * Supabase tables. Make sure RLS is enabled on `reviews`, `projects`,
 * `invite_codes` and `admin_users`, and that the storage bucket has a
 * read policy. Never put the service_role key here.
 *
 * Override with a .env file if you ever rotate the project:
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_KEY=...
 */
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://empvklffqwrlllovhgzx.supabase.co';

export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY ?? 'sb_publishable_an1FqOGAgwRQCzxp6UWuvQ_TFadZ9EW';

const REMEMBER_KEY = 'm3owl_remember_session';

/** localStorage/sessionStorage throw in some privacy modes -- probe first. */
function probeStorage(kind) {
  try {
    const store = kind === 'local' ? window.localStorage : window.sessionStorage;
    const probe = '__m3owl_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

export function isRemembering() {
  const local = probeStorage('local');
  if (!local) return true;
  try {
    const stored = local.getItem(REMEMBER_KEY);
    if (stored === null) {
      local.setItem(REMEMBER_KEY, 'true');
      return true;
    }
    return stored === 'true';
  } catch {
    return true;
  }
}

export function setRemembering(value) {
  try {
    probeStorage('local')?.setItem(REMEMBER_KEY, value ? 'true' : 'false');
  } catch {
    /* non-fatal */
  }
}

/**
 * Routes Supabase auth tokens to localStorage ("remember me") or sessionStorage.
 * Both are cleared on removeItem so toggling the flag can never strand a token.
 */
const authStorage = {
  getItem(key) {
    try {
      return isRemembering()
        ? probeStorage('local')?.getItem(key) ?? null
        : probeStorage('session')?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      const target = isRemembering() ? probeStorage('local') : probeStorage('session');
      target?.setItem(key, value);
    } catch {
      /* non-fatal */
    }
  },
  removeItem(key) {
    try {
      probeStorage('local')?.removeItem(key);
      probeStorage('session')?.removeItem(key);
    } catch {
      /* non-fatal */
    }
  },
};

let client = null;

/**
 * Lazily created singleton. Safe to call from anywhere, including render --
 * it never touches the network on creation.
 */
export function getSupabase() {
  if (client) return client;
  try {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: authStorage,
      },
    });
  } catch (error) {
    console.error('[supabase] failed to create client', error);
    return null;
  }
  return client;
}

/**
 * Turns a thrown error into something a human can act on.
 * The old build blamed ad-blockers for every failure, which sent people down
 * the wrong path when the real cause was a missing table or an RLS denial.
 */
export function describeError(error) {
  if (!error) return '';

  const message = String(error.message ?? error);

  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Could not reach Supabase. A privacy extension or offline connection is blocking it.';
  }
  if (/row-level security|permission denied|violates row-level/i.test(message)) {
    return 'Supabase rejected the request (row level security). Check the table policies.';
  }
  if (/does not exist|schema cache/i.test(message)) {
    return `Missing table or column in Supabase: ${message}`;
  }
  if (/invalid api key|jwt/i.test(message)) {
    return 'Supabase API key is invalid or expired.';
  }

  return message;
}
