# MeowlSite

Portfolio site for **M3owL** (Jakub K.) — Polish game translator and localization junior.
Shows translation history, client feedback, and an invite-code review flow backed by Supabase.

Live: https://m3owl.github.io/MeowlSite/

---

## Why the Steam artwork was not loading

This is worth documenting because the symptom ("I add a project and neither the
background nor the logo loads") had four separate causes stacked on top of each other.

### 1. The background *was* loading — it was painted at ~5% visibility

The old card did this:

```jsx
<div className="absolute inset-0 z-0 opacity-20 bg-cover" style={{ backgroundImage: `url("${bannerUrl}")` }} />
```

That layer sits on top of the card's own `.glass` background, which is
`rgba(30, 41, 59, .75)` — 75% opaque. Then a `from-darker via-darker/80` gradient
was layered on top of that. Net contribution of the hero image: roughly
`0.20 × 0.25 ≈ 5%`. `library_hero.jpg` is a dark cinematic still to begin with,
so the result read as "no image".

**Fix:** the art is now the card. A real `<img>` fills the frame at 80% opacity and
a gradient scrim is applied only where text sits. The scrim handles legibility so
the image does not have to be hidden to be readable.

### 2. A CSS background can never report failure

`background-image` fires no `error` event. A 404 there was completely invisible to
the code — blank card, no console signal, nothing to debug. The new
`SteamImage` component uses a real `<img>` so failures are catchable.

### 3. The logo deleted itself on the first hiccup

```jsx
onError={e => { e.currentTarget.style.display = 'none'; }}
```

One transient CDN error and the logo was gone for the rest of the session. There was
no retry, no alternative asset, and no text fallback.

**Fix:** `SteamImage` walks an ordered candidate list instead of giving up.

### 4. There was no fallback chain, and the ID parser was too strict

The old code hardcoded exactly two asset names:

```
/steam/apps/{id}/library_hero.jpg
/steam/apps/{id}/logo.png
```

Both are **optional** per-app assets. Steam only serves `library_hero.jpg` if the
developer uploaded one, and `logo.png` only exists when a transparent wordmark was
provided. The code now tries, in order:

| Slot | Candidates |
|---|---|
| Background | `library_hero.jpg` → `library_hero_blur.jpg` → `header.jpg` → `capsule_616x353.jpg` → `capsule_231x87.jpg` |
| Logo | `logo.png` → `logo_2x.png` → *title text* |

Each candidate is also tried against three CDN hosts (`cdn.cloudflare.steamstatic.com`,
`cdn.akamai.steamstatic.com`, `steamcdn-a.akamaihd.net`) because which host answers
varies by region.

Separately, `getSteamAppId` used `/\/app\/(\d+)/`, which only matches a full store URL.
It silently returned `null` for a bare id like `413150` or an `s.team` short link, and a
`null` id produced no image *and* no error message. `parseSteamAppId` now accepts store
URLs, community URLs, steamdb URLs, `?appid=`, `steam://rungameid/`, `s.team/a/` links,
and bare ids.

### What the data actually shows

I tested the CDN directly before changing anything. Across 20 real, currently-listed
indie titles, **every** `library_hero.jpg`, `logo.png`, `header.jpg` and
`capsule_616x353.jpg` returned `200`. Steam was not the problem. The failure was
entirely in the rendering and fallback logic above — which is why the fix is on the
client side.

### Bonus: the form now tells you what happened

The old "Live Preview" block only rendered when a Steam ID resolved, so a link that
failed to parse made the whole section vanish with no explanation. The new form shows:

- a green badge when an app id is detected,
- an amber warning when a link cannot be parsed,
- and which exact file won for the background and the logo.

---

## Stack

| | |
|---|---|
| Build | Vite 5 |
| UI | React 18, Tailwind CSS 3 |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Deploy | GitHub Actions → GitHub Pages |

The previous version loaded React, ReactDOM, Babel and Tailwind from CDNs and
transpiled a 5,300-line inline script in the browser on every page load. That is now a
normal build: ~150 KB gzipped instead of several megabytes of CDN payload plus runtime
compilation.

---

## Project layout

The Vite app lives in `app/`. The repository **root** holds the built site
(`index.html`, `assets/`, `favicon.svg`) because GitHub Pages serves this repo
from `main` / root — see [Deploying](#deploying).

```
/                        <- what GitHub Pages actually serves
├── index.html           <- BUILT, do not edit by hand
├── assets/              <- BUILT, do not edit by hand
├── favicon.svg          <- BUILT
├── package.json         <- scripts + dependencies
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── tools/publish.mjs    <- copies dist/ to the repo root
├── .github/workflows/   <- optional Actions deploy
└── app/                 <- the actual source
    ├── index.html       <- Vite template
    ├── public/
    ├── scripts/         <- test suites
    └── src/
        ├── main.jsx     entry point
        ├── App.jsx      state, data loading, realtime, modal routing
        ├── index.css    Tailwind + design tokens
        ├── lib/
        │   ├── steam.js       app-id parsing + CDN fallback chains
        │   ├── supabase.js    client singleton, auth storage, error messages
        │   ├── storage.js     single shared upload helper
        │   ├── normalize.js   one stable row shape for every component
        │   ├── format.js      dates, rating maths, local avatar fallback
        │   └── constants.js   tabs, bucket limits, defaults
        ├── components/
        │   ├── SteamImage.jsx walks candidate URLs, renders fallback
        │   ├── ProjectCard.jsx art-forward card
        │   ├── ReviewCard.jsx
        │   ├── PinnedReviews.jsx
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   └── ui/           Modal, Field, Stars, RatingEditor, Toast, ErrorBanner
        ├── tabs/             AboutTab, PortfolioTab, ReviewsTab, AdminTab
        └── modals/           Login, InviteCode, GenerateCode, ReviewForm, ProjectForm
```

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build + publish to the repo root
npm run preview      # serve the production build
npm run verify       # run both test suites
```

To point at a different Supabase project, copy `.env.example` to `.env` and fill it in.

---

## Deploying

**It just works on push.** GitHub Pages on this repo is set to
*Deploy from a branch → main → / (root)*, so the built files are committed at the
repo root and `git push` is the whole deploy.

Run `npm run build` before committing any change to `app/`, otherwise the root
copy goes stale. The build also clears old hashed bundles from `assets/`.

### Optional: switch to GitHub Actions

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. If you
prefer that (no build artefacts in the repo, no manual rebuilds), then:

1. Repo → **Settings** → **Pages**
2. Under **Build and deployment** → **Source**, select **GitHub Actions**

Do it in that order. Switching the source *before* the workflow has ever run
leaves Pages with nothing to serve.

The site is served from `/MeowlSite/`, which is why `vite.config.js` sets
`base: '/MeowlSite/'`. If you move to a custom domain, set `VITE_BASE=/`.

---

## Supabase notes

The key in `src/lib/supabase.js` is a **publishable** key. It is designed to be public
and is not a secret. What protects your data is Row Level Security — make sure RLS is
enabled on `reviews`, `projects`, `invite_codes` and `admin_users`, and that the
`review-avatars` storage bucket has an appropriate read policy.

Expected tables:

- `reviews` — `nickname`, `role`, `game_title`, `discord_username`, `avatar_url`, `review_text`, `ratings` (jsonb), `published`, `created_at`
- `projects` — `title`, `steam_url`, `details`, `bg_url`, `logo_url`, `pinned`, `sort_order`, `pinned_reviews` (jsonb), `bg_offset_x/y`, `logo_offset_x/y`
- `invite_codes` — `code`, `nickname`, `role`, `game_title`, `discord_username`, `avatar_url`, `used`
- `admin_users` — `user_id`

RPCs used by the public review flow: `get_invite_code_preview(input_code)`,
`submit_review_with_code(input_code, input_review_text, input_ratings)`.

---

## Other bugs fixed in this pass

- **Crash on the Feedbacks tab for admins.** `ReviewsTab` passed `admin={isAdmin}` but
  hardcoded `onEdit`/`onDelete`/`onTogglePublish` to `null`. Admin controls rendered and
  clicking Edit threw `onEdit is not a function`. Admin controls are now only offered
  where the handlers exist.
- **Realtime channel never unsubscribed.** Leaked a subscription on every remount.
- **Stale `isAdmin` in realtime callbacks.** The channel was registered once, so it kept
  reading the admin flag from the first render. Now read through a ref.
- **Reordering fired N sequential writes.** `moveProject` awaited one `update` per
  project in a loop, leaving a half-applied order if one failed. Now batched with
  `Promise.all` and the first failure is surfaced.
- **Three copies of the upload logic.** Avatars, backgrounds and logos each had their own
  near-identical ~70-line function. Consolidated into `uploadPublicFile`.
- **10-second polling loop for the Supabase CDN global.** Gone — Supabase is a normal
  import, so boot is a single async sequence.
- **`localStorage` access at module scope** threw in some privacy modes, breaking the
  whole script. All storage access is now probed and guarded.
- **`crypto.randomUUID` without a fallback** broke over plain HTTP. Now falls back.
- **Third-party avatar service.** `ui-avatars.com` was called for every review without a
  photo. Now rendered locally as an SVG data URI.
- **`describeError` blamed ad-blockers for everything.** Network, RLS, missing-table and
  bad-key failures now produce distinct, accurate messages.
- Accessibility: real `<dialog>` semantics, Escape-to-close, focus rings, `aria-label`s
  on icon-only buttons, `prefers-reduced-motion` support, alt text on meaningful images.
