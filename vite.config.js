import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project sites are served from /<repo-name>/.
// If you ever move to a custom domain, change BASE to '/'.
const BASE = process.env.VITE_BASE ?? '/MeowlSite/';

export default defineConfig({
  plugins: [react()],
  base: BASE,
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
    open: true,
  },
});
