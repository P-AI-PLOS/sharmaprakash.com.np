#!/usr/bin/env bash
# cmux-fanout — spawn one cmux workspace per plan section, each running Claude
# Code pointed at that section. Use for parallel work on multi-section plans,
# batch blog drafting, or batch design fixes.
#
# Usage:
#   scripts/cmux-fanout.sh <plan-file-or-topic> <label1> [<label2> ...]
#
# Examples:
#   # Multi-section plan: claude in each session reads PLAN.md and works on its section
#   scripts/cmux-fanout.sh PLAN.md "Section A: tokens" "Section B: hero" "Section C: footer"
#
#   # Batch blog drafts: each session drafts one post from a shared brief
#   scripts/cmux-fanout.sh briefs/may-batch.md "post-1-claude-md" "post-2-hooks" "post-3-worktrees"
#
#   # Batch design fixes: each session owns one file/area
#   scripts/cmux-fanout.sh "design.md §3 token cleanup" \
#     "src/components/marketing/Hero.astro" \
#     "src/components/marketing/CurrentRoleStrip.astro"
#
# Each spawned workspace runs:
#   claude "Read <plan>. Work only on: <label>. Do not touch other sections."
# from the repo root. Parent shell exits as soon as all workspaces are spawned.

set -euo pipefail

if [[ $# -lt 2 ]]; then
  sed -n '2,24p' "$0"
  exit 1
fi

PLAN="$1"; shift
REPO="$(cd "$(dirname "$0")/.." && pwd)"
CMUX="${CMUX_BIN:-/Applications/cmux.app/Contents/Resources/bin/cmux}"

if [[ ! -x "$CMUX" ]]; then
  echo "cmux binary not found at $CMUX (override with CMUX_BIN)" >&2
  exit 1
fi

for label in "$@"; do
  prompt="Read ${PLAN}. Work only on: ${label}. Do not touch other sections. Commit when done."
  # shell-escape the prompt for the --command string
  escaped=$(printf '%q' "$prompt")
  "$CMUX" new-workspace \
    --cwd "$REPO" \
    --name "$label" \
    --command "claude $escaped" \
    --focus false >/dev/null
  echo "spawned: $label"
done

echo "all sessions launched — parent can exit"
