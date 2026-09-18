/** Small presentation helpers shared across cards and modals. */

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateAverageRating(ratings) {
  if (!Array.isArray(ratings) || ratings.length === 0) return 0;

  const values = ratings.map((entry) => Number(entry?.value)).filter(Number.isFinite);
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Initials-based avatar, rendered locally as an SVG data URI.
 * The old build called out to ui-avatars.com, which meant a third-party
 * request (and a third-party failure mode) for every review without a photo.
 */
export function avatarFallback(name) {
  const label = String(name || 'User').trim();
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="32" fill="#0f172a"/>
<text x="32" y="41" font-family="Segoe UI,sans-serif" font-size="26"
 font-weight="700" fill="#06b6d4" text-anchor="middle">${initials}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Move an item inside an array; returns a new array, or the original if it cannot move. */
export function moveItem(list, from, to) {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
