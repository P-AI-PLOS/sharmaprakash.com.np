#!/usr/bin/env bash
# Normalize loudness, transcode to MP3, optionally layer intro/outro, and emit
# metadata for a raw episode.
#
#   scripts/podcast/finalize.sh <series-slug> <NN>
#   scripts/podcast/finalize.sh ai-coding-setup 01
#
# Reads:  podcast/<series>/ep-<NN>-raw.{m4a,mp3,wav}
#         podcast/_assets/intro.mp3   (optional — prepended via crossfade)
#         podcast/_assets/outro.mp3   (optional — appended via crossfade)
# Writes: podcast/<series>/ep-<NN>.mp3        (gitignored — released as asset)
#         podcast/<series>/ep-<NN>.json       (committed — metadata)
set -euo pipefail

series="${1:?series-slug required}"
nn="${2:?episode number (zero-padded) required}"

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
dir="$repo_root/podcast/$series"
assets="$repo_root/podcast/_assets"
mp3="$dir/ep-${nn}.mp3"
meta="$dir/ep-${nn}.json"
intro="$assets/intro.mp3"
outro="$assets/outro.mp3"

raw=""
for ext in m4a mp3 wav; do
  candidate="$dir/ep-${nn}-raw.${ext}"
  [[ -f "$candidate" ]] && { raw="$candidate"; break; }
done
[[ -n "$raw" ]] || { echo "missing $dir/ep-${nn}-raw.{m4a,mp3,wav}" >&2; exit 1; }

has_intro=0; [[ -f "$intro" ]] && has_intro=1
has_outro=0; [[ -f "$outro" ]] && has_outro=1

# Build the ffmpeg invocation. Three shapes:
#   (a) no intro/outro       → loudnorm the raw dialogue, same as before.
#   (b) intro + outro        → acrossfade intro→dialogue→outro.
#   (c) intro only or outro only → degraded version of (b).
#
# Single ffmpeg pass with loudnorm at the end so the whole mix is leveled
# consistently — avoids per-segment normalization producing audible jumps at
# the crossfade boundaries.
CROSSFADE_D=1     # seconds of crossfade between segments
TAIL_PAD=0.8      # seconds of silence appended after dialogue, before outro

if [[ $has_intro -eq 0 && $has_outro -eq 0 ]]; then
  echo "→ encoding $raw → $mp3 (mono 96k, loudnorm -16 LUFS, no intro/outro)"
  ffmpeg -y -hide_banner -loglevel error \
    -i "$raw" \
    -ac 1 \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
    -codec:a libmp3lame -b:a 96k \
    "$mp3"
elif [[ $has_intro -eq 1 && $has_outro -eq 1 ]]; then
  echo "→ encoding [intro → $raw → ${TAIL_PAD}s pad → outro] → $mp3 (mono 96k, loudnorm -16 LUFS)"
  ffmpeg -y -hide_banner -loglevel error \
    -i "$intro" -i "$raw" -i "$outro" \
    -filter_complex "[1:a]apad=pad_dur=${TAIL_PAD}[padded];[0:a][padded]acrossfade=d=${CROSSFADE_D}:c1=tri:c2=tri[a01];[a01][2:a]acrossfade=d=${CROSSFADE_D}:c1=tri:c2=tri,loudnorm=I=-16:TP=-1.5:LRA=11" \
    -ac 1 -codec:a libmp3lame -b:a 96k \
    "$mp3"
elif [[ $has_intro -eq 1 ]]; then
  echo "→ encoding [intro → $raw] → $mp3 (mono 96k, loudnorm -16 LUFS)"
  ffmpeg -y -hide_banner -loglevel error \
    -i "$intro" -i "$raw" \
    -filter_complex "[0:a][1:a]acrossfade=d=${CROSSFADE_D}:c1=tri:c2=tri,loudnorm=I=-16:TP=-1.5:LRA=11" \
    -ac 1 -codec:a libmp3lame -b:a 96k \
    "$mp3"
else
  echo "→ encoding [$raw → ${TAIL_PAD}s pad → outro] → $mp3 (mono 96k, loudnorm -16 LUFS)"
  ffmpeg -y -hide_banner -loglevel error \
    -i "$raw" -i "$outro" \
    -filter_complex "[0:a]apad=pad_dur=${TAIL_PAD}[padded];[padded][1:a]acrossfade=d=${CROSSFADE_D}:c1=tri:c2=tri,loudnorm=I=-16:TP=-1.5:LRA=11" \
    -ac 1 -codec:a libmp3lame -b:a 96k \
    "$mp3"
fi

duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$mp3" | awk '{printf "%d", $1}')"
size_bytes="$(stat -f%z "$mp3")"
sha="$(shasum -a 256 "$mp3" | awk '{print $1}')"

mix_label="none"
if [[ $has_intro -eq 1 && $has_outro -eq 1 ]]; then mix_label="intro+outro"
elif [[ $has_intro -eq 1 ]]; then mix_label="intro"
elif [[ $has_outro -eq 1 ]]; then mix_label="outro"
fi

cat > "$meta" <<JSON
{
  "series": "$series",
  "order": $((10#$nn)),
  "raw": "$(basename "$raw")",
  "audio": "ep-${nn}.mp3",
  "mix": "$mix_label",
  "durationSeconds": $duration,
  "sizeBytes": $size_bytes,
  "sha256": "$sha"
}
JSON

echo "→ wrote $meta"
echo "   duration=${duration}s  size=$((size_bytes / 1024 / 1024)) MB  mix=$mix_label"
