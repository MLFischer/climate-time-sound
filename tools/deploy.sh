#!/bin/sh
# Deploy the web app to GitHub Pages (MLFischer/climate-time-sound).
# Bumps the cache-busting version on every deploy so returning visitors
# never mix old and new modules, then syncs and pushes.
set -e
cd "$(dirname "$0")/.."
V="v=$(date +%Y%m%d%H%M)"
LC_ALL=C sed -i '' -E "s/v=[0-9]{8}[0-9a-z]*/$V/g" index.html js/app.js js/score.js js/classic.js
echo "cache version: $V"
CLONE="${TMPDIR:-/tmp}/climate-time-sound-deploy"
[ -d "$CLONE/.git" ] || git clone -q https://github.com/MLFischer/climate-time-sound.git "$CLONE"
git -C "$CLONE" pull -q
rsync -a --delete --exclude '.git' --exclude '.nojekyll' ./ "$CLONE/"
git -C "$CLONE" add -A
git -C "$CLONE" commit -m "${1:-update}" || true
git -C "$CLONE" push -q origin main
echo "deployed: https://mlfischer.github.io/climate-time-sound/"
