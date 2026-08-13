#!/bin/bash
# Rebuild the site and restart the always-on local server.
#
# The launchd agent (com.jeffye.thegreatest) serves dist/ as static files, so
# content edits only go live after a rebuild. Run this after any content change.
set -euo pipefail

cd "$(dirname "$0")/.."

npm run check
npm run build

launchctl kickstart -k "gui/$(id -u)/com.jeffye.thegreatest"

echo
echo "Live at http://localhost:4321 (and over Tailscale)."
