---
title: "A 3-Week Plan to Make Your Legacy React Codebase Agent-Ready"
date: "2026-05-08T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Three weeks, one engineer, one opinionated order. Stop the drift, collapse the duplicates, and let the rules you already have actually start working."
cover: "/images/blog/ai/agent-ready-react-plan.png"
thumb: "/images/blog/ai/agent-ready-react-plan.png"
last_modified_at: "2026-05-08T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 2
---

You've read Part 1. You agree your codebase has the "multiple parallel hierarchies" problem. You want a plan.

Here it is. Three weeks, one engineer (or two, part-time). The goal isn't to rewrite the codebase — it's to **stop the drift** and **collapse the duplicates** so the rules you already have start working.

I'm going to be opinionated about the order. The order matters more than the work itself. Most teams attempt the architectural cleanup first (Week 2 work), discover it's slow, get pulled back to features, and the cleanup never finishes. **Do the cheap stuff first.** Lock in the wins. Then the expensive stuff has guard-rails.

---

## Pre-flight: run the audit (half a day)

Before you plan anything, count things. Open a terminal in your `src/` directory and run:

```bash
# TypeScript escape hatches
grep -rE "@ts-ignore|@ts-nocheck" src --include="*.ts" --include="*.tsx" | wc -l

# `any` types
grep -rE ": any\b|as any\b" src --include="*.ts" --include="*.tsx" | wc -l

# Barrel imports
grep -rE "from 'components/(atoms|molecules|organisms)'" src --include="*.ts" --include="*.tsx" | wc -l

# Console statements
grep -rE "console\.(log|warn|error|debug)" src --include="*.ts" --include="*.tsx" | wc -l

# Imports from deprecated dirs (adapt to your dir names)
grep -rE "from 'components/(__v2__|__v_old__|legacy|old|form)/" src --include="*.ts" --include="*.tsx" | wc -l

# Per-module theme duplication
find src -name "createCommonTheme*.ts" | wc -l
```

Write the numbers down. You're going to compare against them in 3 weeks and 6 months.

In one audit I did the numbers came in around 3,141 / 74 / 714 / 33 / hundreds / 55. In another, an order of magnitude smaller across the board but the same shape. Yours will be different. The shape will be similar.

You also need to inventory:

- How many directories in `components/`? List them.
- How many implementations of `Drawer` / `Select` / `Modal` / `Button`? `grep -rl "function Drawer\|const Drawer =" src/components/`.
- How many state libraries are in `package.json` and actively imported?
- How many styling systems? (Sass partials + CSS Modules + styled-components / Emotion + Tailwind utilities + a few stray inline `style={…}` blocks — count each).

This becomes your audit report. Save it as `docs/audits/YYYY-MM-DD-agentic-readiness.md`. You're going to refer back to it.

---

## Week 1: Stop the bleeding

**Goal**: new code stops adding to the problem. Old violations are tolerated for now.

You will not touch a single component file this week. Everything is tooling, gates, and clarification.

### Day 1–2: write a `lint:codebase-rules` script

This is the single highest-leverage thing you'll do all three weeks. It's a shell script (or a Node script) that greps for your top 6–8 rules and exits non-zero on any violation **not in the allowlist**.

Skeleton:

```bash
#!/usr/bin/env bash
# scripts/lint-codebase-rules.sh
set -euo pipefail

ALLOWLIST=".codebase-rules-allowlist"
VIOLATIONS=0

check() {
  local rule="$1"
  local pattern="$2"
  local paths="$3"

  local hits
  hits=$(grep -rE "$pattern" $paths 2>/dev/null \
    | grep -v -f "$ALLOWLIST" || true)

  if [ -n "$hits" ]; then
    echo "❌ $rule"
    echo "$hits" | head -20
    VIOLATIONS=$((VIOLATIONS + $(echo "$hits" | wc -l)))
  fi
}

check "Barrel imports" \
  "from 'components/(atoms|molecules|organisms)'" \
  "src --include=*.ts --include=*.tsx"

check "Deprecated dir imports" \
  "from 'components/(__v2__|__v_old__|form|legacy)/" \
  "src --include=*.ts --include=*.tsx"

check "TypeScript escape hatches" \
  "@ts-(ignore|nocheck)" \
  "src --include=*.ts --include=*.tsx"

check "Hex literals outside theme" \
  "#[0-9a-fA-F]{6}" \
  "src/components src/pages --include=*.tsx"

check "console.* in app code" \
  "console\.(log|warn|error|debug)" \
  "src --include=*.ts --include=*.tsx --exclude=*.test.*"

# ... etc.

if [ $VIOLATIONS -gt 0 ]; then
  echo ""
  echo "Total violations: $VIOLATIONS"
  exit 1
fi
```

Run it. It will explode with thousands of violations. Good.

Now generate the allowlist:

```bash
./scripts/lint-codebase-rules.sh 2>&1 | grep "^src/" \
  | cut -d: -f1 | sort -u > .codebase-rules-allowlist
```

Commit the allowlist. The script now passes on `main`. You haven't fixed a single violation yet — but **new violations will now fail CI**.

Wire it into:

- Pre-commit hook (`.husky/pre-commit` or equivalent)
- CI (a GitHub Action step)
- A `npm run lint:rules` script in `package.json`

This is the single change that stops drift. Everything else from here on is about *closing the allowlist*.

### Day 3: flip the typecheck gate

Most "permissive" TypeScript setups have these in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

You can't flip them globally — too much code breaks. Instead, add a `tsconfig.strict.json` that extends the main one:

```jsonc
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*"],
  "exclude": [
    "src/components/__v_old__/**",
    "src/legacy-store/**",
    // ...list every legacy area
  ]
}
```

Add `npm run typecheck:strict` that runs `tsc --noEmit -p tsconfig.strict.json`. Wire it into CI. The exclusion list **shrinks** over time, never grows.

### Day 4: write `docs/MIGRATIONS.md`

The single most useful document in an agent-ready codebase is one that says, in plain English:

> "If you find pattern X in this codebase, here is what to do."

Template:

```markdown
# Migrations

This document is the authoritative answer to "I see two ways to do X — which is current?"

## State management
- ✅ **Current**: Zustand for client state, TanStack Query for server state.
- ❄️ **Frozen**: Redux Toolkit (under `src/legacy-store/`). Do not add to it. Do not delete it. If you touch a file that uses it, leave the legacy usage as-is.
- 🎯 **Target**: all client state on Zustand by Q4. No active migration sprint.

## Styling
- ✅ **Current**: Tailwind utilities, plus CSS Modules for anything Tailwind can't express.
- ❄️ **Frozen**: Sass partials under `src/styles/_legacy/`. Do not add. Do not delete.
- 🎯 **Target**: Sass gone by Q4.

## Components
- ✅ **Current**: `atoms/`, `molecules/`, `organisms/`.
- ❄️ **Frozen**: `__legacy__/`, `__v_old__/`, `form/`. Do not add. Migrate to molecules as you touch them.
- 🎯 **Target**: deleted by end of Week 3 of the readiness plan.

## Forms
- ✅ **Current**: react-hook-form + Zod, fields from `molecules/Form*`.
- ❄️ **Frozen**: Formik forms (under `pages/<Module>/_legacy-forms/`), inline `useState` forms.

## Tables
- ✅ **Current**: TanStack Table via `atoms/Table`.
- ❄️ **Frozen**: custom table components in `components/MyTable/`.
```

That's a real `MIGRATIONS.md` from one of the repos I audited — your libraries will differ, but the *shape* is what to copy. From the other audits I've done, real entries land somewhere in this menu:

| Domain | Common "Current" | Common "Frozen" |
|---|---|---|
| Client state | Zustand, Jotai, Context+reducer | Redux Toolkit, classic Redux, MobX |
| Server state | TanStack Query, SWR, RTK Query | hand-rolled `useEffect(() => fetch())` |
| Styling | Tailwind, CSS Modules, vanilla-extract | Sass/SCSS partials, styled-components, Emotion |
| Forms | react-hook-form + Zod, TanStack Form | Formik, inline `useState`, custom validators |
| Tables | TanStack Table, AG Grid, react-table | bespoke `<table>` + custom hooks |
| Component library | Mid-major-version of MUI / Chakra / Mantine | Older major of same, or a homegrown system |

The point isn't which row applies to you. It's that every team has these rows — and almost no team has them written down in this form.

That's it. **One page.** Every entry has three states: current, frozen, target. Every entry tells the agent (and the human) what to do when they meet that pattern.

This is the document I want to send people who say "AI agents make my codebase worse." Their codebase doesn't have this document.

### Day 5: fix the migration guides

If you have `docs/prompts/` or any "how to migrate a page module" guides, audit them this week. Find every reference to a deprecated directory and rewrite it to point at the canonical location.

If the canonical location doesn't exist yet, **move the component this week** before fixing the guide. The guide is the agent's primary prompt for that kind of work — if the guide points at banned territory, you've shipped a contradiction.

---

## Week 2: Collapse the duplicates

**Goal**: every concept has one canonical implementation. Old duplicates are deleted, not annotated.

This is the hardest week. Block time. Pair on it. Don't try to ship features in parallel.

### Day 1–2: collapse `components/`

Open your `components/` directory. List every top-level entry. For each:

1. **Atomic-design dirs (`atoms/`, `molecules/`, `organisms/`)**: keep.
2. **Deprecated dirs (`__v2__/`, `__v_old__/`, etc.)**: for each component inside, decide one of:
   - Move to `molecules/` (or appropriate tier) with the canonical name.
   - Delete if unused (`grep -r "from 'components/__v_old__/X'" src` will tell you).
3. **Root-level orphan `.tsx` files** (`Drawer.tsx`, `Select.tsx`, `Tabs.tsx`, etc.): each is either a duplicate of an `atoms`/`molecules` version (delete) or the canonical (move into `atoms`/`molecules`).
4. **One-off feature dirs at the top** (`Charts/`, `Widget/`, etc.): these usually belong inside the relevant `pages/<Module>/components/`. Move them.

At the end of Day 2, `components/` contains **exactly four directories**: `atoms/`, `molecules/`, `organisms/`, `base/` (if you have one). Nothing else.

Yes, this will break imports. That's the whole point — TypeScript will tell you every place that needs an update. Knock them out with find/replace. A codemod helps but isn't required for two days of work.

### Day 3: collapse the form field duplicates

There should be exactly one `FormTextField`, one `FormCheckbox`, one `FormSelectField` — and they all live in `molecules/`. If your form guide says "use `FormAutocomplete`", make sure `molecules/FormAutocomplete` is the only one and it's the canonical implementation.

### Day 4: clean up the design tokens

Open your colour token file. Look for:

- **Misleading names** (`secondary.dark` lighter than `secondary.main`?). Either rename to match the value, or change the value to match the name.
- **Cross-namespace pollution** (`secondary.skyBlue` is a blue colour). Move to the right namespace.
- **Duplicate scales** (numeric `g50–g900` and named `customN` greys). Pick one, delete the other.
- **Stray gradients** — count them. Reduce to two: `brand.gradient` and `brand.gradient.subtle`.

You're trying to reduce the token count by ~50%. In the audit I did, ~150 tokens became ~60. Most of the "deleted" tokens had zero or one usage.

### Day 5: collapse module-specific themes

If every page module has its own `createCommonTheme()`, lift the common parts into `src/theme/createModuleTheme.ts`. Pages that need overrides pass them in as a config object. Delete the 30–50 duplicate files.

This is the change that most reduces "the agent picked a different style each time."

---

## Week 3: Polish and lock in

**Goal**: the rules in `CLAUDE.md` / `AGENTS.md` are now *true statements* about the codebase. The lint script catches anything that drifts. The migration doc handles the rest.

### Day 1: rewrite `CLAUDE.md` (or `AGENTS.md`) to match reality

After Weeks 1 and 2, half the rules in your existing rules file are now redundant ("there are no duplicate Drawers" is true at the directory level, no rule needed) and half are now finally accurate.

Slim the rules file. Aim for ≤ 200 lines total. Anything longer gets ignored or truncated. Structure it as:

1. **Stack** (5 lines).
2. **Where things go** (10 lines — components, hooks, types, state).
3. **Naming conventions** (10 lines).
4. **What's banned** (5 lines — link to `MIGRATIONS.md`).
5. **Validation** (3 lines — "run `npm run lint:rules && npm run typecheck:strict` before commit").

Link to:
- `design.md` (your single canonical design system document)
- `MIGRATIONS.md` (your single canonical migration doc)
- `docs/prompts/*` (your task-specific agent prompts)

That's it. The agent doesn't need the whole architecture book — it needs five files, each under 500 lines.

### Day 2: write or refresh `design.md`

Tokens, primitives, layout patterns, anti-patterns. One canonical document the agent reads before any UI change. (I covered the structure of this document elsewhere — see "what to put in design.md" articles.)

### Day 3: write task-specific agent prompts

For each repetitive task (migrating a list page, adding a form, scaffolding a settings tab, etc.), write a single self-contained prompt in `docs/prompts/`. The prompt is given verbatim to the agent for that task.

These are by far your highest-leverage assets. A good `tableMigration.md` will produce a correct list page on the first try, every time, with zero back-and-forth. A bad one produces five iterations of "no, not like that."

The pattern that works:

1. **Scope** (one sentence: "Migrate the X list page following these rules.")
2. **Reference implementation** (link to a real file: "Match the structure of `pages/Y/...`.")
3. **Rules** (numbered, ~20 of them, copy-pasteable).
4. **Verification checklist** (what "done" looks like).

### Day 4: enforce tests on new code (incremental)

Don't backfill tests for legacy code in Week 3. That's a months-long project. Just stop the gap from growing:

Pre-commit hook:

> "If a changed file is in `src/components/` or `src/pages/*/containers/` and is `.tsx`, require a sibling `*.test.tsx`."

Old files: tolerated. New files: blocked without tests. The agent will start writing tests automatically because the hook blocks the commit otherwise. (Agents are *great* at writing tests when prompted by a hook failure — it's the equivalent of TDD without the human.)

### Day 5: shrink the allowlists

Open `.codebase-rules-allowlist` and `tsconfig.strict.json`'s `exclude` list. Pick the smallest exclusion and remove it. Fix whatever it surfaces. Repeat for an afternoon.

You won't finish. That's fine. The pattern is established: every week from here, the allowlist shrinks. Set a recurring calendar entry. Make the violation count visible in your team dashboard.

---

## What you should see after 3 weeks

Concrete outcomes if you follow the plan:

| Metric | Day 0 | After Week 3 |
|---|---|---|
| `components/` top-level dirs | 5–8 | 3–4 |
| Duplicate form-field implementations | 2–4 each | 1 |
| Module-specific theme files | 30–60 | 1 |
| Colour tokens | 100–200 | 40–80 |
| `lint:codebase-rules` script | absent | passing in CI |
| Strict typecheck on new code | no | yes |
| `MIGRATIONS.md` | absent | present |
| `design.md` | partial | canonical |
| `CLAUDE.md` length | 800+ lines | ~200 lines |

You will *not* have:

- Zero `@ts-ignore`. That's a 6-month project.
- Zero legacy code. That's a 12-month project.
- Perfect test coverage. That's an 18-month project.

What you *will* have is **a codebase where new code is consistent**, and the gap between rules and reality is small enough that the agent's first answer is usually correct.

---

## The mistakes to avoid

A few traps I've seen teams fall into:

**Trap 1: starting with the architectural cleanup.**
Week 2 is the visible work, so it feels like the most important. It isn't. Without Week 1's lint gate, Week 2's cleanup gets undone by next week's PRs. Always lint-gate first.

**Trap 2: trying to fix the allowlist instead of stopping at it.**
The allowlist is *deliberately tolerated debt*. You don't need to fix the 3,141 ts-ignores this sprint. You need to make sure number 3,142 can't ship. The allowlist is the boundary between "ratchet open" and "ratchet closed."

**Trap 3: writing more rules instead of deleting more code.**
The instinct to write more `CLAUDE.md` is exactly backwards. Every duplicate you delete is a rule you didn't have to write.

**Trap 4: doing the cleanup in feature branches.**
Cleanup belongs on `main` (or its equivalent), small PRs, immediate review. Long-lived "agentic-readiness" branches will collide with feature work and get abandoned.

**Trap 5: assuming agents will follow the new rules without re-running.**
After Week 3, send the team a one-paragraph memo summarising what changed. Pin it in Slack. Agents read what they're prompted with — but humans need to know the rules they're enforcing in PR review have changed.

---

## Coming next

Part 3 is about the rules themselves: how to write `CLAUDE.md` / `AGENTS.md` / `.cursor/rules/` so they're *enforced*, not aspirational, and how the pre-commit hook does most of the work that a rules file pretends to do.

The takeaway from this part: **most of "agent-ready" is regular software engineering.** Delete duplicates. Tighten types. Write a migration doc. Wire up a lint gate. The agent shows up at the end and benefits from the same things a senior engineer would benefit from.

If your codebase is hard for an agent, it's probably also harder than it needs to be for the humans on the team. Three weeks of cleanup is rarely a bad investment.
