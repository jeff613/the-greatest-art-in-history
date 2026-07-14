// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Listen on all interfaces so the dev server is reachable over Tailscale.
  server: { host: true },
});
