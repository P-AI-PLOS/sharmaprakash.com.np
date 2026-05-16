#!/usr/bin/env bash
# cmux-up — spawn (or restart) the project's cmux workspaces:
#
#   1. "sharmaprakash"  — 2x2 grid of AI agents
#        ┌──────────────┬──────────────┐
#        │ write/claude │ design/claude│
#        ├──────────────┼──────────────┤
#        │ images/codex │ slides/claude│
#        └──────────────┴──────────────┘
#
#   2. "nvim"           — single surface running `nvim .`
#   3. "dev"            — single surface running `pnpm dev`
#   4. "preview"        — browser surface visiting http://localhost:4321/
#
# Modes:
#   (no flag)    Spawn any missing workspaces. Leave existing ones untouched.
#   --reset      Restart processes in place on existing workspaces
#                  (respawn-pane for terminals, browser reload for preview).
#                Spawns missing workspaces. Preserves IDs, tab names, layout.
#   --recreate   Close + recreate each workspace from scratch (destructive).
#
# Usage:
#   scripts/cmux-up.sh
#   scripts/cmux-up.sh --reset
#   scripts/cmux-up.sh --recreate

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
CMUX="${CMUX_BIN:-/Applications/cmux.app/Contents/Resources/bin/cmux}"
PREVIEW_URL="${PREVIEW_URL:-http://localhost:4321/}"
MODE="${1:-}"

if [[ ! -x "$CMUX" ]]; then
  echo "cmux binary not found at $CMUX (override with CMUX_BIN)" >&2
  exit 1
fi

case "$MODE" in
  ""|--reset|--recreate) ;;
  *) echo "unknown flag: $MODE (use --reset or --recreate)" >&2; exit 2 ;;
esac

existing="$("$CMUX" list-workspaces 2>/dev/null || true)"

ws_exists() { grep -q "\\b$1\\b" <<<"$existing"; }

# Return all pane refs of a workspace, in creation order, one per line.
ws_panes() {
  "$CMUX" list-panes --workspace "name:$1" 2>/dev/null \
    | grep -oE 'pane:[0-9]+' | awk '!seen[$0]++'
}

# Return the first surface ref in a given pane.
pane_first_surface() {
  local ws="$1" pane="$2"
  "$CMUX" list-pane-surfaces --workspace "name:$ws" --pane "$pane" 2>/dev/null \
    | grep -oE 'surface:[0-9]+' | head -n1
}

#=============================================================================
# 1) sharmaprakash — 2x2 grid
#=============================================================================
GRID="sharmaprakash"
GRID_LABELS=(write images design slides)        # creation order
GRID_COMMANDS=(claude codex claude claude)      # matched 1:1 with labels

create_grid() {
  read -r -d '' LAYOUT <<'JSON' || true
{
  "direction": "horizontal",
  "split": 0.5,
  "children": [
    {
      "direction": "vertical",
      "split": 0.5,
      "children": [
        { "pane": { "surfaces": [{ "type": "terminal", "command": "claude" }] } },
        { "pane": { "surfaces": [{ "type": "terminal", "command": "codex" }] } }
      ]
    },
    {
      "direction": "vertical",
      "split": 0.5,
      "children": [
        { "pane": { "surfaces": [{ "type": "terminal", "command": "claude" }] } },
        { "pane": { "surfaces": [{ "type": "terminal", "command": "claude" }] } }
      ]
    }
  ]
}
JSON

  "$CMUX" new-workspace \
    --name "$GRID" \
    --description "write · design · images · slides" \
    --cwd "$REPO" \
    --layout "$LAYOUT" \
    --focus true >/dev/null
  echo "spawned workspace: $GRID (2x2 grid)"

  mapfile -t PANES < <(ws_panes "$GRID")
  if [[ "${#PANES[@]}" -ne 4 ]]; then
    echo "  warn: expected 4 panes, found ${#PANES[@]} — skipping rename" >&2
    return
  fi
  for i in "${!GRID_LABELS[@]}"; do
    local surface
    surface=$(pane_first_surface "$GRID" "${PANES[$i]}")
    [[ -n "$surface" ]] && "$CMUX" rename-tab \
      --workspace "name:$GRID" --surface "$surface" "${GRID_LABELS[$i]}" >/dev/null \
      && echo "  renamed ${PANES[$i]} / $surface → ${GRID_LABELS[$i]}"
  done
}

reset_grid_in_place() {
  mapfile -t PANES < <(ws_panes "$GRID")
  if [[ "${#PANES[@]}" -ne 4 ]]; then
    echo "  warn: $GRID has ${#PANES[@]} panes, expected 4 — falling back to --recreate" >&2
    "$CMUX" close-workspace --name "$GRID" 2>/dev/null || true
    create_grid
    return
  fi
  for i in "${!GRID_LABELS[@]}"; do
    local surface
    surface=$(pane_first_surface "$GRID" "${PANES[$i]}")
    if [[ -n "$surface" ]]; then
      "$CMUX" respawn-pane --workspace "name:$GRID" --surface "$surface" \
        --command "${GRID_COMMANDS[$i]}" >/dev/null \
        && echo "  restarted ${GRID_LABELS[$i]} ($surface) → ${GRID_COMMANDS[$i]}"
    fi
  done
}

handle_grid() {
  if ws_exists "$GRID"; then
    case "$MODE" in
      --reset)    echo "resetting $GRID in place"; reset_grid_in_place ;;
      --recreate) echo "recreating $GRID"; "$CMUX" close-workspace --name "$GRID" 2>/dev/null || true; create_grid ;;
      *)          echo "workspace '$GRID' exists — skipping" ;;
    esac
  else
    create_grid
  fi
}

#=============================================================================
# 2/3) simple single-surface terminal workspaces
#=============================================================================
create_simple_ws() {
  local name="$1" desc="$2" cmd="$3"
  "$CMUX" new-workspace \
    --name "$name" \
    --description "$desc" \
    --cwd "$REPO" \
    --command "$cmd" \
    --focus false >/dev/null
  echo "spawned workspace: $name"
}

reset_simple_ws_in_place() {
  local name="$1" cmd="$2"
  local pane surface
  pane=$(ws_panes "$name" | head -n1)
  if [[ -z "$pane" ]]; then
    echo "  warn: $name has no panes — skipping" >&2
    return
  fi
  surface=$(pane_first_surface "$name" "$pane")
  if [[ -n "$surface" ]]; then
    "$CMUX" respawn-pane --workspace "name:$name" --surface "$surface" \
      --command "$cmd" >/dev/null \
      && echo "  restarted $name ($surface) → $cmd"
  fi
}

handle_simple_ws() {
  local name="$1" desc="$2" cmd="$3"
  if ws_exists "$name"; then
    case "$MODE" in
      --reset)    echo "resetting $name in place"; reset_simple_ws_in_place "$name" "$cmd" ;;
      --recreate) echo "recreating $name"; "$CMUX" close-workspace --name "$name" 2>/dev/null || true; create_simple_ws "$name" "$desc" "$cmd" ;;
      *)          echo "workspace '$name' exists — skipping" ;;
    esac
  else
    create_simple_ws "$name" "$desc" "$cmd"
  fi
}

#=============================================================================
# 4) preview — browser workspace
#=============================================================================
create_preview() {
  read -r -d '' PREVIEW_LAYOUT <<JSON || true
{
  "pane": {
    "surfaces": [
      { "type": "browser", "url": "${PREVIEW_URL}" }
    ]
  }
}
JSON
  "$CMUX" new-workspace \
    --name "preview" \
    --description "browser: ${PREVIEW_URL}" \
    --cwd "$REPO" \
    --layout "$PREVIEW_LAYOUT" \
    --focus false >/dev/null
  echo "spawned workspace: preview (${PREVIEW_URL})"
}

reset_preview_in_place() {
  local pane surface
  pane=$(ws_panes "preview" | head -n1)
  surface=$(pane_first_surface "preview" "$pane")
  if [[ -n "$surface" ]]; then
    "$CMUX" browser --surface "$surface" reload >/dev/null 2>&1 \
      && echo "  reloaded preview ($surface)" \
      || { "$CMUX" browser --surface "$surface" goto "$PREVIEW_URL" >/dev/null \
           && echo "  navigated preview ($surface) → $PREVIEW_URL"; }
  fi
}

handle_preview() {
  if ws_exists "preview"; then
    case "$MODE" in
      --reset)    echo "resetting preview in place"; reset_preview_in_place ;;
      --recreate) echo "recreating preview"; "$CMUX" close-workspace --name "preview" 2>/dev/null || true; create_preview ;;
      *)          echo "workspace 'preview' exists — skipping" ;;
    esac
  else
    create_preview
  fi
}

#=============================================================================
# orchestrate
#=============================================================================
handle_grid
handle_simple_ws "nvim" "editor"                "nvim ."
handle_simple_ws "dev"  "astro dev server (:4321)" "pnpm dev"
handle_preview

echo
echo "workspaces now:"
"$CMUX" list-workspaces | grep -iE "${GRID}|nvim|dev|preview" || true
echo
echo "drive a grid surface:"
echo "  cmux send --workspace name:${GRID} --surface surface:<N> '<text>'"
