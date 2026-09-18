import { getSupabase } from './supabase';

export const BUCKET = 'review-avatars';

const DEFAULT_MAX_BYTES = 12 * 1024 * 1024;

/** crypto.randomUUID needs a secure context; fall back for http:// previews. */
export function uniqueId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function safeFileName(name) {
  return String(name || 'file')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+/, '')
    .slice(-80);
}

/**
 * Single upload path shared by avatars, project backgrounds and logos.
 * The old build had three near-identical copies of this logic.
 *
 * @returns {Promise<string>} public URL of the uploaded file
 */
export async function uploadPublicFile(file, prefix, { maxBytes = DEFAULT_MAX_BYTES } = {}) {
  const client = getSupabase();
  if (!client) throw new Error('No database connection.');
  if (!file) throw new Error('No file selected.');

  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / 1024 / 1024);
    throw new Error(`File is too large (max ${mb} MB).`);
  }

  const path = `${prefix}-${uniqueId()}-${safeFileName(file.name)}`;

  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'application/octet-stream',
    cacheControl: '31536000',
  });

  if (error) throw new Error(error.message);

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
