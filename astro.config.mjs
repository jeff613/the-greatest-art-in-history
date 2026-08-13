// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// Reachable over Tailscale by MagicDNS name, not just by raw IP. Astro's dev
// and preview servers 403 any Host header they don't recognise, so the tailnet
// names have to be allow-listed explicitly.
const allowedHosts = ['.ts.net', 'jeffs-mac-mini'];

export default defineConfig({
  // Listen on all interfaces so the dev server is reachable over Tailscale.
  server: { host: true, allowedHosts },
  // preview does NOT inherit server.*, so the same settings are repeated here.
  // The always-on launchd agent (com.jeffye.thegreatest) runs preview.
  preview: { host: true, allowedHosts },
});
