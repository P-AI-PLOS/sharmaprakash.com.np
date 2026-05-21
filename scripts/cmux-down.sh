#!/usr/bin/env bash
# cmux-down — close all cmux workspaces this project's cmux-up.sh spawns.
#
# Closes: sharmaprakash, nvim, dev, preview
#
# Usage:
#   scripts/cmux-down.sh

set -euo pipefail

CMUX="${CMUX_BIN:-/Applications/cmux.app/Contents/Resources/bin/cmux}"

if [[ ! -x "$CMUX" ]]; then
  echo "cmux binary not found at $CMUX (override with CMUX_BIN)" >&2
  exit 1
fi

WORKSPACES=(sharmaprakash nvim dev preview)
existing="$("$CMUX" list-workspaces 2>/dev/null || true)"

for ws in "${WORKSPACES[@]}"; do
  if grep -q "\\b${ws}\\b" <<<"$existing"; then
    "$CMUX" close-workspace --name "$ws" >/dev/null 2>&1 \
      && echo "closed: $ws" \
      || echo "warn: failed to close $ws" >&2
  else
    echo "not running: $ws"
  fi
done
