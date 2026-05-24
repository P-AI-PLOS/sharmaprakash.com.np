#!/usr/bin/env bash
# Transcribe a finalized episode MP3 with mlx-whisper (Apple Silicon).
#
#   scripts/podcast/transcribe.sh <series-slug> <NN>
#
# Reads:  podcast/<series>/ep-<NN>.mp3
# Writes: podcast/<series>/ep-<NN>.transcript.md
set -euo pipefail

series="${1:?series-slug required}"
nn="${2:?episode number required}"
model="${MLX_WHISPER_MODEL:-mlx-community/whisper-base.en-mlx}"

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
dir="$repo_root/podcast/$series"
mp3="$dir/ep-${nn}.mp3"
out_dir="$dir/_tx"
final="$dir/ep-${nn}.transcript.md"

[[ -f "$mp3" ]] || { echo "missing $mp3" >&2; exit 1; }
mkdir -p "$out_dir"

echo "→ transcribing $mp3 with $model"
mlx_whisper "$mp3" \
  --model "$model" \
  --output-format txt \
  --output-dir "$out_dir" \
  --language en

txt="$out_dir/ep-${nn}.txt"
[[ -s "$txt" ]] || { echo "no transcript text produced" >&2; exit 1; }

# Wrap as committed markdown with a small header.
title_slug="$(jq -r '.audio // empty' "$dir/ep-${nn}.json" 2>/dev/null || echo "")"
{
  echo "# Transcript — ${series} ep ${nn}"
  echo
  echo "_Auto-generated with mlx-whisper (${model}). Lightly readable; not edited._"
  echo
  cat "$txt"
} > "$final"

rm -f "$txt"
rmdir "$out_dir" 2>/dev/null || true

echo "→ wrote $final ($(wc -w < "$final") words)"
