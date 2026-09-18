/**
 * Copies the Vite build output from ./dist to the repository root.
 *
 * GitHub Pages on this repo serves from "main / (root)", so the built files
 * have to physically live at the root for the public site to work without
 * changing any repository settings.
 *
 * Run via `npm run build` (which chains vite build -> this script).
 */
import { cp, rm, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(repoRoot, 'dist');

/** Files/directories at the repo root that must never be touched. */
const PROTECTED = new Set([
  'app',
  'dist',
  'node_modules',
  'tools',
  '.git',
  '.github',
  '.vscode',
  '.idea',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'README.md',
  '.gitignore',
  '.gitattributes',
  '.env.example',
]);

/** Build artefacts that get replaced on every build. */
const GENERATED = ['index.html', 'assets', 'favicon.svg'];

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(dist))) {
    console.error('dist/ not found. Run `npm run build` instead of this script directly.');
    process.exit(1);
  }

  const entries = await readdir(dist);

  // Guard: refuse to publish anything that collides with the source tree.
  const collisions = entries.filter((name) => PROTECTED.has(name));
  if (collisions.length > 0) {
    console.error(
      `Refusing to publish: build output contains protected path(s): ${collisions.join(', ')}`,
    );
    process.exit(1);
  }

  // Clear stale hashed bundles so assets/ does not accumulate forever.
  for (const name of GENERATED) {
    await rm(path.join(repoRoot, name), { recursive: true, force: true });
  }

  for (const name of entries) {
    await cp(path.join(dist, name), path.join(repoRoot, name), { recursive: true });
  }

  console.log(`Published ${entries.length} item(s) to the repository root: ${entries.join(', ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
