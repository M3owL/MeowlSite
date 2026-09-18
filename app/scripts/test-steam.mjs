/**
 * Smoke test for the Steam resolution layer.
 * Run: node scripts/test-steam.mjs
 *
 * This is the logic that was broken, so it gets an actual test rather than a
 * "looks right to me".
 */
import {
  parseSteamAppId,
  titleFromSteamUrl,
  steamBannerCandidates,
  steamLogoCandidates,
  bannerCandidatesFor,
  logoCandidatesFor,
} from '../src/lib/steam.js';

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL  ${label}\n      expected ${JSON.stringify(expected)}\n      got      ${JSON.stringify(actual)}`);
  }
}

// --- app id parsing: the old regex only handled one of these ---
check('full store url', parseSteamAppId('https://store.steampowered.com/app/413150/Stardew_Valley/'), '413150');
check('store url no slug', parseSteamAppId('https://store.steampowered.com/app/413150'), '413150');
check('bare id', parseSteamAppId('413150'), '413150');
check('id with spaces', parseSteamAppId('  413150  '), '413150');
check('s.team short link', parseSteamAppId('https://s.team/a/413150'), '413150');
check('community url', parseSteamAppId('https://steamcommunity.com/app/413150/discussions/'), '413150');
check('steamdb url', parseSteamAppId('https://steamdb.info/app/413150/'), '413150');
check('appid query', parseSteamAppId('https://example.com/x?appid=413150'), '413150');
check('steam protocol', parseSteamAppId('steam://rungameid/413150'), '413150');
check('url with utm junk', parseSteamAppId('https://store.steampowered.com/app/413150/Game/?utm_source=x'), '413150');
check('empty', parseSteamAppId(''), null);
check('null', parseSteamAppId(null), null);
check('garbage', parseSteamAppId('hello world'), null);
// Two-digit ids are real (app 10 is Counter-Strike), so they must be accepted.
check('two digit id', parseSteamAppId('10'), '10');
check('single digit rejected', parseSteamAppId('9'), null);
check('letters rejected', parseSteamAppId('abc'), null);

// --- title guessing ---
check('title from slug', titleFromSteamUrl('https://store.steampowered.com/app/413150/Stardew_Valley/'), 'Stardew Valley');
check('title none', titleFromSteamUrl('https://store.steampowered.com/app/413150'), '');

// --- fallback chains ---
const banners = steamBannerCandidates('413150');
check('banner candidate count', banners.length, 15); // 5 files x 3 hosts
check('first banner is library_hero', banners[0], 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/library_hero.jpg');
check('second host tried', banners[5], 'https://cdn.akamai.steamstatic.com/steam/apps/413150/library_hero.jpg');
check('header.jpg is in the chain', banners.some((u) => u.endsWith('/header.jpg')), true);

const logos = steamLogoCandidates('413150');
check('logo candidate count', logos.length, 6); // 2 files x 3 hosts
check('first logo is logo.png', logos[0], 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/logo.png');

// --- custom upload must win over Steam ---
const withCustom = bannerCandidatesFor({ customUrl: 'https://x/y.png', appId: '413150' });
check('custom background first', withCustom[0], 'https://x/y.png');
check('steam art behind custom', withCustom[1], banners[0]);

const noId = bannerCandidatesFor({ customUrl: 'https://x/y.png', appId: null });
check('custom only when no id', noId, ['https://x/y.png']);
check('empty when nothing', bannerCandidatesFor({ customUrl: '', appId: '' }), []);

const logoCustom = logoCandidatesFor({ customUrl: '', appId: '413150' });
check('logo falls through to steam', logoCustom[0], logos[0]);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
