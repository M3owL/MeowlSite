/**
 * Steam asset resolution.
 *
 * The old build hardcoded exactly two asset names per app:
 *
 *     /steam/apps/{id}/library_hero.jpg
 *     /steam/apps/{id}/logo.png
 *
 * and gave up the moment either one 404'd. Steam treats both as *optional*
 * per-app assets -- a developer only gets a library_hero.jpg if they uploaded
 * one, and logo.png only exists when a transparent wordmark was provided.
 * Smaller and indie titles frequently have neither.
 *
 * So instead of one URL per slot we produce an ordered candidate list and let
 * <SteamImage> walk down it until something loads. We also try several CDN
 * hosts, because which Steamstatic host answers can vary by region.
 */

/** Steamstatic mirrors, tried in order. */
const CDN_HOSTS = [
  'https://cdn.cloudflare.steamstatic.com',
  'https://cdn.akamai.steamstatic.com',
  'https://steamcdn-a.akamaihd.net',
];

/** Background art, best quality first. */
export const BANNER_FILES = [
  'library_hero.jpg', // 3840x1240 cinematic hero -- the good one
  'library_hero_blur.jpg', // blurred variant, present when hero art is locked
  'header.jpg', // 460x215 store header, almost always present
  'capsule_616x353.jpg', // store capsule
  'capsule_231x87.jpg', // tiny capsule, last resort
];

/** Transparent wordmark, best quality first. */
export const LOGO_FILES = [
  'logo.png',
  'logo_2x.png',
];

/**
 * Pull a numeric Steam app id out of anything a human might paste.
 * Returns null when nothing usable is found.
 */
export function parseSteamAppId(input) {
  if (input == null) return null;

  const raw = String(input).trim();
  if (!raw) return null;

  // A bare id, e.g. "413150".
  if (/^\d{2,10}$/.test(raw)) return raw;

  const patterns = [
    /\/app\/(\d{2,10})/i, // store.steampowered.com/app/413150/...
    /steamcommunity\.com\/app\/(\d{2,10})/i,
    /steamdb\.info\/app\/(\d{2,10})/i,
    /[?&]appid=(\d{2,10})/i,
    /^steam:\/\/rungameid\/(\d{2,10})/i,
    /s\.team\/a\/(\d{2,10})/i, // Steam's own short links
  ];

  for (const re of patterns) {
    const match = raw.match(re);
    if (match) return match[1];
  }

  return null;
}

/**
 * Best-effort title guess from a store URL slug.
 * "https://store.steampowered.com/app/413150/Stardew_Valley/" -> "Stardew Valley"
 */
export function titleFromSteamUrl(input) {
  if (!input) return '';

  const match = String(input).match(/\/app\/\d{2,10}\/([^/?#]+)/);
  if (!match) return '';

  try {
    return decodeURIComponent(match[1])
      .replace(/[_+]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

/**
 * Ordered list of background image URLs for an app id.
 *
 * Ordering is host-major on purpose: walk every asset on one CDN host before
 * moving to the next. The realistic failure is "this app has no
 * library_hero.jpg" (missing on *every* host), not "this host is blocked", so
 * host-major finds a working image in far fewer requests.
 *
 * Returns [] when there is no usable id.
 */
export function steamBannerCandidates(appId) {
  const id = parseSteamAppId(appId);
  if (!id) return [];
  return CDN_HOSTS.flatMap((host) =>
    BANNER_FILES.map((file) => `${host}/steam/apps/${id}/${file}`),
  );
}

/** Ordered list of logo image URLs for an app id. */
export function steamLogoCandidates(appId) {
  const id = parseSteamAppId(appId);
  if (!id) return [];
  return CDN_HOSTS.flatMap((host) =>
    LOGO_FILES.map((file) => `${host}/steam/apps/${id}/${file}`),
  );
}

/**
 * Combine a custom uploaded image with the Steam fallbacks.
 * A custom upload always wins; Steam art is the safety net behind it.
 */
export function bannerCandidatesFor({ customUrl, appId }) {
  const list = [];
  if (customUrl) list.push(customUrl);
  list.push(...steamBannerCandidates(appId));
  return list;
}

export function logoCandidatesFor({ customUrl, appId }) {
  const list = [];
  if (customUrl) list.push(customUrl);
  list.push(...steamLogoCandidates(appId));
  return list;
}
