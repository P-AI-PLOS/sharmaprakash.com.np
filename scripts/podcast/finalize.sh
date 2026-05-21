#!/usr/bin/env bash
# Normalize loudness, transcode to MP3, and emit metadata for a raw episode.
#
#   scripts/podcast/finalize.sh <series-slug> <NN>
#   scripts/podcast/finalize.sh ai-coding-setup 01
#
# Reads:  podcast/<series>/ep-<NN>-raw.m4a
# Writes: podcast/<series>/ep-<NN>.mp3        (gitignored — released as asset)
#         podcast/<series>/ep-<NN>.json       (committed — metadata)
set -euo pipefail

series="${1:?series-slug required}"
nn="${2:?episode number (zero-padded) required}"

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
dir="$repo_root/podcast/$series"
raw="$dir/ep-${nn}-raw.m4a"
mp3="$dir/ep-${nn}.mp3"
meta="$dir/ep-${nn}.json"

[[ -f "$raw" ]] || { echo "missing $raw" >&2; exit 1; }

echo "→ encoding $raw → $mp3 (mono 96k, loudnorm -16 LUFS)"
ffmpeg -y -hide_banner -loglevel error \
  -i "$raw" \
  -ac 1 \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
  -codec:a libmp3lame -b:a 96k \
  "$mp3"

duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$mp3" | awk '{printf "%d", $1}')"
size_bytes="$(stat -f%z "$mp3")"
sha="$(shasum -a 256 "$mp3" | awk '{print $1}')"

cat > "$meta" <<JSON
{
  "series": "$series",
  "order": $((10#$nn)),
  "raw": "ep-${nn}-raw.m4a",
  "audio": "ep-${nn}.mp3",
  "durationSeconds": $duration,
  "sizeBytes": $size_bytes,
  "sha256": "$sha"
}
JSON

echo "→ wrote $meta"
echo "   duration=${duration}s  size=$((size_bytes / 1024 / 1024)) MB"
