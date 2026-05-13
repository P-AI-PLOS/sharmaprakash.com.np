---
draft: true
title: "Rules That Agents Actually Follow: Enforcement Over Aspiration"
date: "2026-05-09T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "A perfectly written CLAUDE.md cannot fix a contradictory codebase. The most effective rules file is short, opinionated, and backed by tooling."
cover: "/images/blog/ai/enforced-agent-rules.png"
thumb: "/images/blog/ai/enforced-agent-rules.png"
last_modified_at: "2026-05-09T10:00:00+05:45"
show_category_hero_image: true
series: agent-ready-react
seriesOrder: 3
---

You've read Parts 1 and 2. Your codebase is shaped. Now the rules file.

This post is the one most teams want to skip to. Resist the urge. A perfectly written `CLAUDE.md` cannot fix a contradictory codebase — but a well-shaped codebase makes a tiny rules file genuinely powerful. The rules come last because they're the easiest part.

I want to make a specific argument: **the most effective `CLAUDE.md` is short, opinionated, and backed by tooling**. Most rules files in the wild are long, exhaustive, and rely on the agent's discipline. They don't work.

---

## Why long rules files fail

The default instinct, when an agent does the wrong thing, is to add a rule.

> "The agent used `console.log`. Add: 'never use console.log'."
> "The agent wrote a default export. Add: 'always use named exports'."
> "The agent used `any`. Add a paragraph about `any` with three examples."

Six months later your `CLAUDE.md` is 1,200 lines and the agent **still** writes `console.log` sometimes. Here's why.

### 1. Context-window dilution

Every token of `CLAUDE.md` is a token the agent could have spent on your codebase. At 1,200 lines, you've consumed ~15K tokens before the agent reads a single file. Quality of output drops.

Worse: at length, rules contradict each other. The agent satisfies whichever it noticed last. The 200th rule fights the 50th.

### 2. Probability, not compliance

Rules in a prompt are *probabilistic priors*, not deterministic gates. They shift the distribution of agent output. They don't enforce.

"Never use `console.log`" makes the agent ~95% less likely to write `console.log`. Across 100 PRs, you ship ~5 `console.log` violations. The rule is doing work — it's just not doing *enforcement*.

### 3. Rules can't outrun example code

A rule says "use named exports." The agent reads a nearby file, sees 50 default exports, concludes the rule is aspirational, and writes a default export.

You can't out-rule a corrupted neighbour. You can only fix the neighbour.

---

## The principle: rules vs. gates

Distinguish two kinds of constraints:

- **Rules**: live in `CLAUDE.md` / `AGENTS.md`. Read by the agent. Probabilistic. Cheap to write, weak to enforce.
- **Gates**: live in pre-commit hooks, CI, type-checker. Run on every change. Deterministic. Expensive to set up, impossible to bypass.

**The bug-fix for "agents drift" is to convert rules into gates wherever possible.** Anything that can be grepped should be gated. Anything that can be type-checked should be strict-typed. The rules file then describes only the things that *cannot* be mechanically enforced.

Concrete examples:

| Concern | Rules approach (weak) | Gate approach (strong) |
|---|---|---|
| No `console.log` | Tell agent in `CLAUDE.md` | `eslint-plugin-no-console` errors on commit |
| No barrel imports | Tell agent | Custom lint rule or grep in pre-commit |
| No `any` type | Tell agent | `noImplicitAny: true` in `tsconfig` |
| Named exports only | Tell agent | ESLint `import/no-default-export` |
| No deprecated dirs | Tell agent | Pre-commit grep blocks the import |
| Test coverage | Tell agent | `lint-staged` requires sibling `.test.tsx` |
| Token discipline (no hex) | Tell agent | Pre-commit grep, allowlist for theme files |
| Use co-located `style.ts` | Tell agent | ESLint custom rule (harder, optional) |

For each row, the agent will respect the rule maybe 90% of the time. The gate enforces it 100%. The gate is the answer.

**Use the rules file for what can't be gated**: architectural intent, design taste, decisions that require judgement. The rest belongs in tooling.

---

## A skeleton `CLAUDE.md` that actually works

After the cleanup from Part 2, here's the shape of the rules file I now use. It's ~150 lines, and most of it is references to other docs.

```markdown
# Project Name — Agent Instructions

## Stack
React 18 · TypeScript 5 (strict) · Vite · MUI v5 · TanStack Query v5 ·
Zustand · react-hook-form + Zod · material-react-table v2

## Read these before non-trivial work
@docs/design.md                  ← tokens, primitives, layout patterns
@docs/MIGRATIONS.md              ← what's current, what's frozen
@docs/architecture/folder-structure.md
@docs/prompts/tableMigration.md  ← for list pages
@docs/prompts/formMigration.md   ← for forms

## Where things go
- New component → `components/atoms` or `molecules` (atomic-design rules)
- Page-specific code → `pages/<Module>/components/`
- Module state → `pages/<Module>/store/<module>List.ts` (Zustand)
- Server queries → `pages/<Module>/api/` (TanStack Query)
- Types → split: `response.ts`, `params.ts`, `store.ts`

## Naming
- Components: `PascalCase.tsx`, named export
- Hooks: `useThing.ts`
- Styles: sibling `style.ts`
- Stores: `<module>List.ts` (not `index.ts`)

## What's enforced by tooling (not negotiable; CI blocks)
- No barrel imports: `from 'components/atoms/Button'`, not `'components/atoms'`
- No imports from `__v2__/`, `__v5__/`, `form/`
- No `@ts-ignore` / `@ts-nocheck` / `: any` / `as any`
- No `console.*` in app code
- No hex literals outside `assets/colors` and `src/theme`
- Strict TypeScript on new files

If your code fails `npm run lint:rules` or `npm run typecheck:strict`,
fix the underlying issue. Do not extend the allowlist.

## Architectural taste (not gateable; please follow)
- Prefer deletion over abstraction. A bug fix needs a fix, not a refactor.
- Don't add error handling for scenarios that can't happen.
- Don't comment what the code does — only why (when surprising).
- One amber primary CTA per surface.
- Tests on new components, not backfilled.

## Validation before handoff
Run, in this order:
1. `npm run lint:rules`        ← codebase-rules grep gate
2. `npm run typecheck:strict`  ← strict TS on changed code
3. `npm run lint`              ← ESLint
4. `npm test`                  ← Vitest on touched files

Report all four. Do not skip.
```

That's the entire file. Notice what's missing:

- No section enumerating component variants.
- No section listing every prop.
- No examples of correct code.

Those live in `design.md`, `MIGRATIONS.md`, and the task-specific prompts. The agent gets pointed there with `@`-references, which Claude Code and Cursor expand into the prompt only when relevant.

---

## The four docs every agent-ready repo needs

A short rules file works because it points at four other documents. Each has a specific role.

### 1. `CLAUDE.md` (or `AGENTS.md`) — the entry point

What I just showed above. ~150 lines. Tells the agent what stack, where things go, what's gated, and which docs to read for deeper context.

### 2. `design.md` — the design system memory

Tokens, type scale, spacing, primitives, layout patterns, anti-patterns. The single canonical answer to "what does this look like." ~400–500 lines is the right size — long enough to be authoritative, short enough to fit in context.

Structure I use:

1. Brand
2. Colour (tokens, allowed namespaces, banned usages)
3. Typography
4. Spacing
5. Borders + radius
6. Shadows
7. Components — usage rules per primitive
8. Layout patterns (list page, form drawer, detail page)
9. Loading + transitions
10. Anti-patterns
11. Empty states
12. Form patterns
13. Tables
14. Toasts
15. Modals + drawers
16. Permission-aware rendering
17. Accessibility
18. How AI agents use this file

### 3. `MIGRATIONS.md` — the canonical answer to "two ways, which one?"

Covered in Part 2. ~50–100 lines. Every row: current pattern, frozen pattern, target. Every entry says what to do when the agent encounters the frozen pattern.

This document handles half the agent's "which way is right?" moments. It's wildly under-used in the industry.

### 4. `docs/prompts/<task>.md` — the task-specific agent script

For every repetitive task (migrating a list page, adding a form, scaffolding a settings page), one self-contained prompt. The agent is given this prompt verbatim plus the task scope ("Migrate the Suppliers module").

These prompts are your highest-leverage assets. A good list-page-migration prompt produces a correct page first try, with zero back-and-forth. A bad one produces five rounds of "no, not like that."

Structure that works:

```markdown
# Migrate a list page

## Scope
Migrate `pages/<Module>/` to the canonical list-page architecture.

## Reference implementation
Read these two before writing code:
- `pages/Settings/ResourceCostSheet/`
- `pages/DeliveryDocket/`

## Rules
1. Module entry (`index.tsx`) renders only `ThemeProvider + Outlet`.
2. Routing: parent route component must use the module entry, not the list page.
3. Folder structure exactly matches the reference. Every folder name === component name.
4. Named exports only. No `export default`.
5. Zod schema in `utils/validation.ts`, exported with inferred type.
6. ... (15–20 more rules)

## Verification checklist
- [ ] `npm run lint:rules` passes
- [ ] `npm run typecheck:strict` passes on touched files
- [ ] List loads, paginates, sorts, filters
- [ ] Create / edit / delete flows work end-to-end
- [ ] ⌘-click row opens detail in a new tab
- [ ] (etc.)
```

These prompts are *small books on how to do one thing perfectly*. Invest in them.

---

## The hook layer: where most of the work happens

The pre-commit hook is where rules become reality. Here's what I run on every commit:

```bash
#!/usr/bin/env bash
# .husky/pre-commit

set -e

# 1. The codebase-rules grep gate
npm run lint:rules

# 2. Strict typecheck on changed files only (fast)
npx lint-staged --config '{"*.{ts,tsx}": "tsc --noEmit --skipLibCheck"}'

# 3. ESLint with --max-warnings 0 on changed files
npx lint-staged --config '{"*.{ts,tsx}": "eslint --max-warnings 0"}'

# 4. Vitest related — runs tests that exist for touched files
npx vitest related --run

# 5. Block commit if a new .tsx in pages/ or components/ has no sibling .test.tsx
bash scripts/require-tests.sh
```

Five gates. Most run in a few seconds (changed files only). The two-minute version of "did you do this right" — applied by tooling, not by review.

The killer feature: **agents respond to hook failures by fixing the underlying issue**, almost always correctly. A commit that fails because of a missing sibling test prompts Claude Code to *write the test* and re-commit. This is the entire trick. The hook converts a failure into a re-prompt, and the agent does the right thing on the second try.

You don't even have to ask. The agent will see the hook output, parse it, and fix.

---

## The `.cursor/rules/` (or equivalent) layer

For Cursor specifically — but the pattern generalises to Claude Code's "path-scoped" rules and to AGENTS.md sub-files. The rule:

> Rules should *attach* to the kind of work being done, not to the whole repo.

Sample structure:

```
.cursor/rules/
├── agent-defaults.mdc        ← applies everywhere
├── components.mdc            ← attaches when editing components/
├── pages.mdc                 ← attaches when editing pages/
├── styling.mdc               ← attaches when editing *.tsx or *.ts under src/
├── git-workflow.mdc          ← attaches on commit messages
├── security-performance.mdc  ← attaches on PR changes
└── typescript.mdc            ← attaches on *.ts / *.tsx
```

Each file is ~30–80 lines of focused rules. The agent's context budget is preserved because only the relevant rules are attached for the file type at hand.

The same pattern works in Claude Code: keep `CLAUDE.md` short and put detailed rules in `.claude/rules/*.md`, then reference them with `@.claude/rules/styling.md` from `CLAUDE.md`. The agent loads them on demand.

---

## Writing rules an agent will actually follow

Some style notes from rules that have worked vs. rules that haven't:

### ✅ Specific, file-grounded

> "Place permission hooks at `hooks/permissions/use<Module>Permission.ts`. Reference: `hooks/permissions/useDocketPermission.ts`."

The agent can grep, find the reference, mimic exactly.

### ❌ Vague, abstract

> "Follow good React practices and write clean, maintainable code."

Useless. The agent does not know what "clean" means in your codebase.

### ✅ One canonical answer

> "For dropdowns, use `components/molecules/MuiAutocomplete`. The atoms `Select` is legacy; do not use."

### ❌ Multiple valid answers

> "Use a dropdown component appropriate to the context."

What does "appropriate" mean? Pick one.

### ✅ Cite a working example

> "Migrate forms following the reference implementation at `pages/Settings/ResourceCostSheet/containers/ResourceCostSheetFormPage/`."

The reference is verified. The rule is reproducible.

### ❌ Cite a target without an example

> "Use modern React patterns."

The agent's "modern React patterns" and yours are not the same set.

### ✅ Tell the agent what to do on conflict

> "If a documented rule conflicts with nearby code, default to the rule and surface the conflict in the PR description."

This single line dramatically reduces "agent picked the example over the rule" errors.

### ❌ Leave conflict resolution implicit

The agent will pick the example every time without an explicit instruction to do otherwise.

---

## The session-start hook (Claude Code specific, but generalisable)

Claude Code lets you run a shell command at session start whose stdout becomes a system reminder in the agent's context. This is a *huge* opportunity that most teams underuse.

I use it to:

1. **Restate the 5 non-inferable rules.** The ones the agent gets wrong most often. Short and blunt.
2. **Print current branch + uncommitted changes.** Frames the session.
3. **Print recent commits.** The agent picks up on commit style and recent intent.
4. **Print current lint/typecheck violation counts.** Visible progress (or regression).

Sample script:

```bash
#!/usr/bin/env bash
# .claude/hooks/session-start-reminder.sh
cat <<EOF
Key rules:
• Imports: NO barrels. Use specific paths.
• NO @ts-ignore, no \`: any\`, no \`as any\`.
• Styles in sibling style.ts. Colors from assets/colors.
• Forms: react-hook-form + Zod. Server state: TanStack Query.
• ALWAYS add a sibling *.test.tsx for new components.

Branch: $(git branch --show-current)
Recent commits:
$(git log --oneline -5)

Codebase rules score:
$(npm run --silent lint:rules:count 2>/dev/null || echo "N/A")
EOF
```

Cost: zero. Benefit: the agent starts every session knowing the five things it most often gets wrong, plus context about the work in flight.

---

## Putting it all together

The agent-ready setup, after all three parts:

1. **Shaped codebase**: one of each thing. (Parts 1 + 2.)
2. **Five canonical docs**: `CLAUDE.md`, `design.md`, `MIGRATIONS.md`, `architecture/folder-structure.md`, task-specific prompts. (This part.)
3. **Five gates**: codebase-rules grep, strict typecheck, ESLint, vitest related, sibling-test requirement. (This part.)
4. **Session-start reminder** with the 5 non-inferable rules. (This part.)
5. **Allowlists that shrink** over time, monitored weekly. (Part 2.)

Total ongoing cost: maybe 1 hour per week to review the violation count and shrink the allowlist by one entry. That's it.

The payoff is real: an agent that produces consistent, correct, on-pattern code on the first try, ~90% of the time. The remaining 10% is genuine judgement calls that no amount of tooling can replace — and those are exactly the calls you want a human reviewer focused on.

---

## Closing thought

The reason "AI agents make code worse" reports keep showing up is that most teams **add agents to a codebase that wasn't shaped for them**. The agent surfaces the existing entropy faster than humans were adding to it.

The fix is not to abandon the agent. The fix is to do the work the agent's existence is now forcing you to do — work that would have made the codebase better with or without AI: delete duplicates, tighten types, write a migration doc, wire up gates.

You'll find that "preparing for agentic coding" turns out to be a fancy name for *engineering hygiene*. The agent is just the forcing function.

Three weeks. One engineer. Lasting compounding wins. Worth it.

---

*If this series helped, the three-part flow:*

1. *[Why your legacy React codebase confuses AI coding agents](/ai/why-legacy-react-confuses-ai-agents/)*
2. *[A 3-week plan to make your legacy React codebase agent-ready](/ai/three-week-plan-agent-ready-react/)*
3. *Rules that agents actually follow: enforcement over aspiration (this post)*
