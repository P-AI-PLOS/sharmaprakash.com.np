#!/usr/bin/env bash
# Upload a finalized episode MP3 as a GitHub Release asset.
#
#   scripts/podcast/publish.sh <series-slug> <NN>
#   scripts/podcast/publish.sh ai-coding-setup 01
#
# Requires `gh` authenticated with a token that has `contents: write` on this
# repo. Idempotent: re-running clobbers the existing asset on the same tag.
set -euo pipefail

series="${1:?series-slug required}"
nn="${2:?episode number required}"

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
mp3="$repo_root/podcast/$series/ep-${nn}.mp3"
[[ -f "$mp3" ]] || { echo "missing $mp3 — run finalize.sh first" >&2; exit 1; }

tag="podcast-${series}-ep-${nn}"

if gh release view "$tag" >/dev/null 2>&1; then
  echo "→ release $tag exists, replacing asset"
  gh release upload "$tag" "$mp3" --clobber
else
  echo "→ creating release $tag"
  gh release create "$tag" \
    --title "Podcast • ${series} • Ep ${nn}" \
    --notes "Audio companion. See podcast/${series}/ep-${nn}.json for metadata." \
    "$mp3"
fi

echo "→ asset URL:"
gh release view "$tag" --json assets --jq '.assets[].url'
