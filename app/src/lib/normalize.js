/**
 * Supabase rows are not guaranteed to match what the UI wants: column names
 * have changed over the life of this project (steam_url -> steamLink,
 * avatar_url -> pfp, review_text -> text) and rows created before a column
 * existed come back as null.
 *
 * Every read goes through one of these normalizers so components can rely on a
 * single stable shape and never see `undefined` where a string is expected.
 */

const str = (value, fallback = '') => (value == null ? fallback : String(value));
const num = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function normalizeProject(row) {
  return {
    ...row,
    id: row.id,
    title: str(row.title),
    steamLink: str(row.steamLink ?? row.steam_url),
    details: str(row.details),
    bg_url: str(row.bg_url),
    logo_url: str(row.logo_url),
    pinnedReviews: Array.isArray(row.pinnedReviews)
      ? row.pinnedReviews
      : Array.isArray(row.pinned_reviews)
        ? row.pinned_reviews
        : [],
    pinned: Boolean(row.pinned),
    sort_order: num(row.sort_order),
    bg_offset_x: num(row.bg_offset_x),
    bg_offset_y: num(row.bg_offset_y),
    logo_offset_x: num(row.logo_offset_x),
    logo_offset_y: num(row.logo_offset_y),
  };
}

export function normalizeReview(row) {
  return {
    ...row,
    id: row.id,
    nickname: str(row.nickname),
    role: str(row.role),
    pfp: str(row.pfp ?? row.avatar_url),
    discord: str(row.discord ?? row.discord_username),
    text: str(row.text ?? row.review_text),
    date: str(row.date ?? row.created_at),
    game_title: str(row.game_title),
    ratings: Array.isArray(row.ratings) ? row.ratings : [],
    published: Boolean(row.published),
  };
}

export function normalizeCode(row) {
  return {
    ...row,
    id: row.id,
    code: str(row.code),
    nickname: str(row.nickname),
    role: str(row.role),
    pfp: str(row.pfp ?? row.avatar_url),
    discord: str(row.discord ?? row.discord_username),
    game_title: str(row.game_title),
    used: Boolean(row.used),
  };
}

/** Clamp ratings to 0..5 in half-star steps, dropping malformed entries. */
export function sanitizeRatings(ratings) {
  return (ratings ?? [])
    .map((entry) => ({
      category: str(entry?.category).trim(),
      value: Math.max(0, Math.min(5, Math.round(Number(entry?.value) * 2) / 2)),
    }))
    .filter((entry) => entry.category && Number.isFinite(entry.value));
}
