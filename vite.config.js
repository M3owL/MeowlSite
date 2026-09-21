import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * The Vite app lives in ./app so that the repository root stays free for the
 * built site.
 *
 * Why: GitHub Pages on this repo is configured as "Deploy from a branch ->
 * main -> / (root)". That means whatever sits at the repo root is what the
 * public sees. If the Vite template lived at the root instead, the browser
 * would be handed a <script src="/MeowlSite/assets/index-*.js"> that only
 * exists after a build -- a blank page.
 *
 * So: source in ./app, build output copied to the repo root by
 * `npm run build`. The site works with zero configuration, and the GitHub
 * Actions workflow in .github/workflows/deploy.yml can take over later if the
 * Pages source is switched to "GitHub Actions".
 *
 * BASE: the site is served from the apex of the custom domain
 * https://polishforgames.com/ (declared by the CNAME file at the repo root),
 * so asset URLs must be root-relative and must NOT carry the repo name.
 * GitHub Pages 301-redirects https://m3owl.github.io/MeowlSite/ to the custom
 * domain, so a /MeowlSite/ base makes every asset 404 and the page renders
 * blank white.
 *
 * Override with VITE_BASE=/MeowlSite/ only if the custom domain is removed.
 */
const BASE = process.env.VITE_BASE ?? '/';

export default defineConfig({
  root: 'app',
  base: BASE,
  plugins: [react()],
  build: {
    outDir: path.resolve(repoRoot, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
    open: true,
  },
});
