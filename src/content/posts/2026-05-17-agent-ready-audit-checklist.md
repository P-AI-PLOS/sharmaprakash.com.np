---
title: "The Agent-Ready Audit: A Runnable Checklist for Any React Codebase"
date: "2026-05-17T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "One bash script, six numbers, an opinion about each. Run it on Monday morning and you have a prioritised list of what to fix before agents can help."
cover: "/images/blog/ai/agent-ready-audit-checklist.png"
thumb: "/images/blog/ai/agent-ready-audit-checklist.png"
last_modified_at: "2026-05-17T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 11
---

Across every audit I've done this past year, I keep running the same handful of commands first. They take under a minute. The numbers they print tell me — before I open a single component file — whether the codebase is closer to "agents will help" or "agents will make this worse."

This post is that script, plus how I interpret the numbers.

The whole thing fits in one file (`scripts/agent-ready-audit.sh`). Commit it. Run it weekly. The numbers should trend toward zero. If they don't, your team is adding to the problem faster than you're closing it.

---

## What the audit measures

Six measurements, in order of leverage:

1. **TypeScript escape hatches** — every `@ts-ignore`, `@ts-nocheck`, `: any`, `as any`. The cheapest signal of "the type system isn't trusted here."
2. **Deprecated-directory imports** — code that the docs say is frozen but is still being imported.
3. **Component-hierarchy duplication** — how many parallel `Drawer`, `Select`, `Modal`, `Button` implementations exist.
4. **Hex literals outside the theme** — magic colours that don't go through the token system.
5. **State-library plurality** — Redux + Zustand + Context + Jotai, all live, in the same repo.
6. **Styling-system plurality** — Sass + CSS Modules + styled-components + Tailwind, all live.

These six numbers, taken together, predict almost perfectly how much an agent will struggle in the repo. I haven't seen a counter-example.

---

## The script

Drop this in `scripts/agent-ready-audit.sh`. Make it executable. It assumes a standard React layout (`src/` rooted, components under `src/components/`, pages under `src/pages/`). Adjust the paths to your repo on first run.

```bash
#!/usr/bin/env bash
# scripts/agent-ready-audit.sh
# Run from repo root. Read-only: makes zero changes.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

SRC="${AUDIT_SRC:-src}"
COMPONENTS="${AUDIT_COMPONENTS:-$SRC/components}"

# Customise these per-repo: the dirs you've marked as frozen in MIGRATIONS.md
LEGACY_DIRS_REGEX="${AUDIT_LEGACY_DIRS:-__v_old__|__v2__|legacy|deprecated|form\\b}"

# Colour output if attached to a TTY
if [ -t 1 ]; then
  R=$'\033[31m'; G=$'\033[32m'; Y=$'\033[33m'; B=$'\033[34m'; D=$'\033[2m'; X=$'\033[0m'
else
  R=""; G=""; Y=""; B=""; D=""; X=""
fi

header() { printf '\n%s%s%s\n' "$B" "$1" "$X"; printf '%s%s%s\n' "$D" "$(printf '=%.0s' $(seq 1 ${#1}))" "$X"; }
verdict() {
  local n=$1 green=$2 yellow=$3 label=$4
  if   [ "$n" -le "$green"  ]; then printf '  %s✓%s  %-44s %s\n' "$G" "$X" "$label" "$n"
  elif [ "$n" -le "$yellow" ]; then printf '  %s!%s  %-44s %s\n' "$Y" "$X" "$label" "$n"
  else                              printf '  %s✗%s  %-44s %s\n' "$R" "$X" "$label" "$n"
  fi
}

# ---- 1. TypeScript escape hatches --------------------------------------------
header "1. TypeScript escape hatches"
TS_IGNORE=$(grep -rE '@ts-(ignore|nocheck)' "$SRC" --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
ANY_TYPE=$(grep -rE ':\s*any\b|\bas\s+any\b' "$SRC" --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
verdict "$TS_IGNORE" 5 50  "@ts-ignore / @ts-nocheck"
verdict "$ANY_TYPE"  20 200 ": any / as any"

# ---- 2. Deprecated-directory imports -----------------------------------------
header "2. Deprecated-dir imports"
DEPRECATED=$(grep -rE "from ['\"][^'\"]*(($LEGACY_DIRS_REGEX))/" "$SRC" --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
verdict "$DEPRECATED" 0 25 "imports from frozen directories"

# ---- 3. Component-hierarchy duplication --------------------------------------
header "3. Component-hierarchy duplication"
TOP_DIRS=$(find "$COMPONENTS" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
verdict "$TOP_DIRS" 4 8 "top-level dirs in $COMPONENTS"

for NAME in Drawer Select Modal Button Table Dialog; do
  COUNT=$(grep -rlE "^(export\s+)?(const|function|default function)\s+$NAME\b" "$COMPONENTS" --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
  verdict "$COUNT" 1 2 "implementations of $NAME"
done

# ---- 4. Hex literals outside the theme ---------------------------------------
header "4. Hex literals outside the theme"
HEX_PAGES=$(grep -rE "#[0-9a-fA-F]{3,8}\b" "$SRC/pages" "$COMPONENTS" --include='*.ts' --include='*.tsx' 2>/dev/null \
  | grep -vE '\.(test|spec)\.|/(__tests__|__mocks__)/' | wc -l | tr -d ' ')
verdict "$HEX_PAGES" 0 30 "hex literals in pages/components"

# ---- 5. State-library plurality ----------------------------------------------
header "5. State libraries actively imported"
STATE_LIBS=0
declare -a STATE_LIST
for LIB in "@reduxjs/toolkit" "react-redux" "zustand" "jotai" "mobx" "valtio" "@tanstack/react-query" "swr"; do
  HITS=$(grep -rE "from ['\"]$LIB" "$SRC" --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
  if [ "$HITS" -gt 0 ]; then
    STATE_LIBS=$((STATE_LIBS + 1))
    STATE_LIST+=("$LIB ($HITS)")
  fi
done
verdict "$STATE_LIBS" 2 3 "distinct state libraries in use"
for ENTRY in "${STATE_LIST[@]:-}"; do [ -n "$ENTRY" ] && printf '       %s%s%s\n' "$D" "$ENTRY" "$X"; done

# ---- 6. Styling-system plurality ---------------------------------------------
header "6. Styling systems actively used"
STYLE_SYSTEMS=0
declare -a STYLE_LIST

SCSS_FILES=$(find "$SRC" -name '*.scss' -o -name '*.sass' 2>/dev/null | wc -l | tr -d ' ')
[ "$SCSS_FILES" -gt 0 ] && { STYLE_SYSTEMS=$((STYLE_SYSTEMS + 1)); STYLE_LIST+=("Sass/SCSS files ($SCSS_FILES)"); }

CSS_MODULES=$(find "$SRC" -name '*.module.css' -o -name '*.module.scss' 2>/dev/null | wc -l | tr -d ' ')
[ "$CSS_MODULES" -gt 0 ] && { STYLE_SYSTEMS=$((STYLE_SYSTEMS + 1)); STYLE_LIST+=("CSS Modules ($CSS_MODULES)"); }

STYLED_COMPONENTS=$(grep -rE "from ['\"]styled-components" "$SRC" --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
[ "$STYLED_COMPONENTS" -gt 0 ] && { STYLE_SYSTEMS=$((STYLE_SYSTEMS + 1)); STYLE_LIST+=("styled-components ($STYLED_COMPONENTS)"); }

EMOTION=$(grep -rE "from ['\"]@emotion" "$SRC" --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
[ "$EMOTION" -gt 0 ] && { STYLE_SYSTEMS=$((STYLE_SYSTEMS + 1)); STYLE_LIST+=("Emotion ($EMOTION)"); }

TAILWIND_HITS=$(grep -rE 'className=["\x27`][^"\x27`]*(\bp-[0-9]|\bm-[0-9]|\btext-(xs|sm|base|lg|xl)\b|\bbg-[a-z]+-[0-9])' "$SRC" --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
[ "$TAILWIND_HITS" -gt 0 ] && { STYLE_SYSTEMS=$((STYLE_SYSTEMS + 1)); STYLE_LIST+=("Tailwind utilities (~$TAILWIND_HITS occurrences)"); }

VANILLA_EXTRACT=$(grep -rE "from ['\"]@vanilla-extract" "$SRC" --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
[ "$VANILLA_EXTRACT" -gt 0 ] && { STYLE_SYSTEMS=$((STYLE_SYSTEMS + 1)); STYLE_LIST+=("vanilla-extract ($VANILLA_EXTRACT)"); }

verdict "$STYLE_SYSTEMS" 1 2 "distinct styling systems"
for ENTRY in "${STYLE_LIST[@]:-}"; do [ -n "$ENTRY" ] && printf '       %s%s%s\n' "$D" "$ENTRY" "$X"; done

# ---- Summary -----------------------------------------------------------------
header "Summary"
printf "  Snapshot: %s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf "  Branch:   %s\n" "$(git branch --show-current 2>/dev/null || echo '-')"
printf "  Commit:   %s\n" "$(git rev-parse --short HEAD 2>/dev/null || echo '-')"
echo
echo "Save this with: ./scripts/agent-ready-audit.sh > docs/audits/$(date +%Y-%m-%d).txt"
```

A few notes on the script's design:

- **Read-only.** No `git`, no `npm`, no `rm`. Safe to run on any branch, any time.
- **Configurable via env.** `AUDIT_SRC`, `AUDIT_COMPONENTS`, `AUDIT_LEGACY_DIRS` let you adapt to a non-standard layout without editing the script.
- **Thresholds in code.** The `verdict` calls bake my opinion (`green ≤ 5, yellow ≤ 50` for `@ts-ignore`, etc.). Override them in a fork if your team has a different bar — but be honest about it.
- **Trends matter more than absolutes.** A score of 200 today that drops to 80 next month is healthier than 80 sitting at 80 forever. Commit the output (`docs/audits/YYYY-MM-DD.txt`) and diff.

---

## How to read the numbers

The thresholds in the script (`green`, `yellow`, `red`) tell you whether each number is *acceptable*, *concerning*, or *blocking*. Here's how I actually use them.

### `@ts-ignore` / `@ts-nocheck`

| Range | Reading |
|---|---|
| 0–5 | Fine. Each one probably has a comment. |
| 5–50 | Concerning. Likely no consistent reason behind them. The agent will copy them. |
| 50+ | The type system is decoration. Agents will treat type errors as advisory. |

The leverage move: add `"no-ts-ignore"` to your `lint:rules` script with an allowlist. Every existing instance is grandfathered. New ones fail CI.

I've seen the number drop from 3,000+ to under 100 in three weeks once this gate is in place. The other 100 are usually clustered around two or three legitimate issues (third-party types, tricky generics) that a real engineer should resolve, not a `// @ts-ignore`.

### `: any` / `as any`

| Range | Reading |
|---|---|
| 0–20 | Fine. |
| 20–200 | Concerning. The team has accepted "type wins, I quit." |
| 200+ | Almost every new file introduces one. Agents will produce more. |

Same gating strategy. The most common false positive is `JSON.parse(x) as any` — wrap in a `safeParse<T>` utility instead and the count drops by ~30%.

### Deprecated-dir imports

This one is binary. If `MIGRATIONS.md` says "do not add to `__v_old__/`" and you have any non-zero count, the agent (and your team) is ignoring the rule. The fix is to add it to the lint gate **the same day you write the MIGRATIONS.md entry** — otherwise the rule never bites.

If the count is high (> 100), don't try to delete every import. Add the gate, freeze the violations in an allowlist, and let `git log` chip away at it.

### Component-hierarchy duplication

This one needs a human eye. The script counts:

- **Top-level dirs in `components/`.** More than four (`atoms/`, `molecules/`, `organisms/`, `base/`) and you have a category problem.
- **Implementations of common primitives** (`Drawer`, `Select`, `Modal`, `Button`, `Table`, `Dialog`).

> If a primitive has **3+ implementations**, agents will pick a different one each session. This is the loudest signal of a non-agent-ready codebase. Week 2 of the readiness plan (Part 2) is mostly about collapsing this number.

The trick is figuring out which is canonical. The audit doesn't tell you that. You do, by looking at:

- Which file is referenced from your form-migration prompt? That's the canonical one.
- Which file has the most recent commit activity? Probably canonical.
- Which file imports from the *current* design tokens (not the legacy palette)? Canonical.

The other implementations either get migrated to the canonical or deleted (if unused). Either is fine. **Both implementations remaining** is the only outcome that fails.

### Hex literals outside the theme

| Range | Reading |
|---|---|
| 0 | You have token discipline. Rare. |
| 1–30 | Probably status colours used inline. Not great, not fatal. |
| 30+ | Your design tokens are decorative. Agents will write `#FF0000` for errors because that's what the surrounding code does. |

The fix is mostly mechanical: grep, replace each hit with the appropriate token reference, lint-gate. The agent itself does this pass well — give it the list and the token file, and it'll produce a clean PR in one shot.

### State-library plurality

| Count | Reading |
|---|---|
| 1 | Single client-state lib. Healthy. |
| 2 | One client + one server (e.g., Zustand + TanStack Query). The normal case. |
| 3 | One is legacy. Document which in `MIGRATIONS.md`. The agent needs to know. |
| 4+ | Drift. Often you'll find old Context-based stores, abandoned MobX islands, or a half-finished migration. |

The script lists the libraries so you can spot the surprise. The most common "wait, why is THAT in here?" is a single-page experiment that imported `jotai` or `valtio` and was never removed. Delete the import; delete the file; remove from `package.json`. Five-minute fixes that pay off forever.

### Styling-system plurality

| Count | Reading |
|---|---|
| 1 | Clean. |
| 2 | Almost certainly a migration in progress. Document in `MIGRATIONS.md`. |
| 3+ | You're going to need a serious Week 2. |

The script reports the count of each — Sass files, CSS Modules, styled-components imports, Emotion imports, Tailwind className occurrences, vanilla-extract imports. If you have all three of `styled-components`, `@emotion/styled`, and Tailwind utilities, the agent has no way to know which to use. Pick one for new code, freeze the others, document.

---

## What to do with the output on day one

A typical first run on a five-year-old codebase produces something like:

```
1. TypeScript escape hatches
  ✗  @ts-ignore / @ts-nocheck                  3141
  ✗  : any / as any                            714

2. Deprecated-dir imports
  ✗  imports from frozen directories           312

3. Component-hierarchy duplication
  ✗  top-level dirs in src/components          11
  ✗  implementations of Drawer                 4
  ✗  implementations of Select                 5
  ✗  implementations of Modal                  3
  !  implementations of Button                 2
  ✓  implementations of Table                  1
  !  implementations of Dialog                 2

4. Hex literals outside the theme
  ✗  hex literals in pages/components          427

5. State libraries actively imported
  ✗  distinct state libraries in use           4
       @reduxjs/toolkit (218)
       zustand (94)
       jotai (12)
       @tanstack/react-query (310)

6. Styling systems actively used
  ✗  distinct styling systems                  3
       Sass/SCSS files (84)
       Emotion (612)
       Tailwind utilities (~38 occurrences)
```

That's a real-shape first run. Don't panic. The order of operations:

1. **Save the output.** This is your baseline. Commit to `docs/audits/`.
2. **Pick the cheapest wins.** Sections 1 and 5 are usually low effort: add `lint:rules` gates, grandfather the existing violations, stop the bleeding. Section 5 in particular: identify the single-page Jotai experiment and delete it.
3. **Write `MIGRATIONS.md`** (Part 2 of this series). Six entries, one page. This unblocks the agent immediately — most of what it's doing wrong is now "documented as legacy."
4. **Then do the hard work.** Section 3 (duplicate primitives) is the most expensive. Plan two weeks for it. Don't try to do it in parallel with feature work; you'll lose.
5. **Re-run the audit weekly.** Commit each run to `docs/audits/`. Numbers should trend down. If they go up between commits, you have a process problem, not a code problem.

---

## Wiring it into the team

Three integration points pay for themselves quickly.

### Pre-commit (optional, advisory)

```bash
# .husky/pre-commit
./scripts/agent-ready-audit.sh > /tmp/audit-current.txt
diff -u docs/audits/baseline.txt /tmp/audit-current.txt | grep -E '^\+' | head -5 || true
```

This prints any *new* lines that appeared since the last committed baseline. It doesn't block — it just shows you what your commit added. Surprisingly effective at making `@ts-ignore`-shaped commits feel awkward.

### CI weekly cron

Most CI providers support cron. Schedule the audit weekly; have it commit the new `docs/audits/YYYY-MM-DD.txt` and open a PR. The PR description should embed a diff against the previous file. Now "we got worse this week" is visible to the whole team, not just the person who happens to run the script.

### Session-start hook (Part 6)

In your Claude Code / Cursor session-start hook, run the audit and inject the most recent line for each section into the agent's context:

```
Repo readiness snapshot (auto-generated):
  ts-ignores: 312    (down from 3,141 at baseline 2026-04-01)
  any usage: 84     (down from 714)
  deprecated imports: 12 (down from 312)
  duplicate primitives: Select x3, Modal x2  ← agent: consult MIGRATIONS.md
```

The agent now knows two things it otherwise wouldn't: which problems are *being worked on* (numbers are dropping), and which primitives are still ambiguous. It will defer to `MIGRATIONS.md` when it encounters them. The drift stops accumulating in agent-written code.

---

## What the audit does not tell you

It's worth being clear about the script's limits. The audit measures **structural messiness** — things that are mechanically detectable. It does *not* measure:

- **Whether your `CLAUDE.md` is good.** A short, opinionated rules file (Part 3) is invisible to grep.
- **Whether `design.md` exists and is current.** The audit can't read prose.
- **Whether the `MIGRATIONS.md` entries are honest.** I've audited repos where `MIGRATIONS.md` said "Redux is frozen" while the engineering manager was actively shipping new Redux code that week. The doc was wrong; the audit doesn't know.
- **Whether your task prompts (Part 5) work.** That's measured by the success rate of agent runs, not by file shape.

So: run the audit. Fix the numbers. But the audit is *necessary, not sufficient*. The other artifacts in this series are what make the cleaned-up codebase actually pleasant to work in with an agent.

---

## Closing

If you've read all eleven posts in this series, the audit is the lens that makes the rest land. The principle from Part 1 — *for every question an agent might ask, there should be exactly one correct answer* — is abstract. The audit turns it into six numbers a junior engineer can produce on a Monday morning.

Run it. Save the baseline. Pick the cheapest wins. Then go back to Part 2 and start Week 1 with a real picture of what you're cleaning up.

The numbers will drop. The agent will start helping. The next person who joins the team — human or model — will get it right on the first try.
