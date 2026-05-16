---
draft: true
title: "Writing CLAUDE.md That Agents Actually Follow"
date: "2026-04-09T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "A 1,500-line CLAUDE.md doesn't make agents more consistent — it makes them less. The agents that work best have short rules backed by tooling, not long rules backed by hope."
cover: "/images/blog/ai/writing-claude-md-agents-follow.png"
thumb: "/images/blog/ai/writing-claude-md-agents-follow.png"
last_modified_at: "2026-04-09T10:00:00+05:45"
use_featured_image: true
series: ai-coding-setup
seriesOrder: 2
---

Six months in, 800 lines of rules, and the agent still writes `console.log`. Still reaches for a default export. Still creates a barrel `index.ts` you explicitly told it not to. You added more rules. The problem got worse.

This is the most common failure mode in AI developer tooling. Not a bad model. Not a weak agent. A rules file that violated the one property that makes rules work.

---

## Why long rules files fail

A `CLAUDE.md` is not a policy document stored in a database. It's text that gets loaded into a context window at session start. That changes everything about how to write it.

### Rules compete for attention

Every line of `CLAUDE.md` is a line the agent isn't spending on your codebase. At 800 lines, you've consumed roughly 10,000 tokens before the agent reads a single file. The model's ability to hold fine-grained rule distinctions degrades as the file grows. By line 400, the agent is probabilistically satisfying whichever rules it noticed most recently.

At length, rules also contradict each other. Line 200 says "prefer hooks over HOCs." Line 650 says "use the withPermissions HOC from auth/." The agent picks one — usually the example it finds in nearby code.

### The codebase always wins

Rules in a prompt are probabilistic priors. "Never use console.log" shifts the distribution — maybe 95% compliance. But the agent reads the files in your codebase too. If fifty files have `console.log`, the agent concludes the rule is aspirational and the codebase is the truth. The example beats the instruction, every time.

### Long rules can't be debugged

When a 50-line rules file produces a bad output, you can usually pinpoint the cause. When a 1,200-line file does it, you can't. You add another rule. The file grows. The problem recurrs.

---

## The principle: one canonical answer per question

Before writing a rule, ask: what is the question this rule answers? Then ask: is this the only place that question is answered?

If the same question is answered differently in `CLAUDE.md`, in `design.md`, and in the code itself — the agent has three answers and no way to rank them. It will pick the one with the most nearby examples backing it up. That's rarely the one you wanted.

**One canonical answer per question.** Fewer answers, not more rules. If there are two valid patterns in your codebase, the rules file can't fix that. You have to fix the codebase first — make one pattern win — and then the rule that refers to it becomes enforceable.

This is why the [Agent-Ready React series](/ai/2026-05-07-why-legacy-react-confuses-ai-agents/) starts with shaping the codebase before touching the rules file. Rules work when there's one truth in the code they can point at.

---

## The structure that works

An effective `CLAUDE.md` has five sections. Nothing more.

### 1. Stack overview (10 lines max)

What languages, frameworks, package manager, minimum runtime version. Just the nouns. No prose.

```markdown
## Stack
TypeScript 5 (strict) · React 19 · Next.js 15 · Tailwind v3 ·
Prisma · tRPC · pnpm · Node ≥ 20
```

That's the whole section. The agent knows the context. Move on.

### 2. Where things live

Key directories and their intent. Not every folder — only the ones a new agent would place something in the wrong location.

```markdown
## Where things live
src/
├── app/              Next.js App Router pages and layouts
├── components/       Shared UI — atoms/, molecules/, chrome/
├── server/           tRPC routers and Prisma queries
├── lib/              Pure utilities (no React, no server)
└── content/          MDX posts and data files
```

Four to eight entries. Point at the full architecture doc for depth.

### 3. Conventions (the locked decisions)

The five to ten most important "always/never" decisions. These are things that have been decided, aren't up for debate session to session, and aren't enforced by tooling (because if they were enforced by tooling, they wouldn't need to be here).

```markdown
## Conventions
- Named exports only. No `export default` in src/.
- Co-locate tests: `Component.test.tsx` next to `Component.tsx`.
- Server queries in `server/` only. No fetch() calls in components.
- One Zod schema per form, in the same file as the form component.
- Comments explain why, not what. Delete comments that describe obvious code.
```

If you have more than ten items here, your rules file is doing too much. Anything enforceable by a linter or type-checker should be there, not here.

### 4. Before you touch X, read Y

This is the highest-value section of any rules file, and the most under-used.

```markdown
## Before you touch X, read Y

| You want to… | Read this first |
|---|---|
| Add a new page | `docs/architecture.md` §Routes |
| Change the design system | `design.md` §Tokens |
| Migrate a component | `MIGRATIONS.md` — current vs frozen |
| Add a form | `docs/form-patterns.md` |
| Change the auth flow | `docs/auth.md` |
```

This table is doing the work that 500 lines of inline rules would otherwise attempt. The agent gets pointed to the authoritative doc for the concern at hand. The authoritative doc can be as long as it needs to be — it's only loaded when relevant.

### 5. Things NOT to do

Short. Blunt. Only things that aren't already enforced by gates.

```markdown
## Do not
- Add a CSS-in-JS library. We're Tailwind-only.
- Reach for framer-motion. Use CSS keyframes + scroll-driven animations.
- Create a new component without checking atoms/ and molecules/ first.
- Write a barrel index.ts in any directory.
```

---

## The rules/\*.md layer

Even with a tight five-section structure, some concerns need more depth than a bullet point. The answer is not to expand `CLAUDE.md`. The answer is `.claude/rules/*.md`.

Put each concern in its own file:

```
.claude/rules/
├── git-workflow.md      Branch naming, commit format, PR process
├── testing.md           Test framework, what to test, naming conventions
├── architecture.md      Module boundaries, import rules, folder structure
└── api-patterns.md      tRPC patterns, error handling, auth middleware
```

Reference them from `CLAUDE.md` with a single line per file. The agent loads them on demand; they don't bloat the main file.

Each rules file follows the same discipline as `CLAUDE.md` itself: short, one canonical answer per question, backed by examples in the code. A `testing.md` that's 400 lines with every possible test scenario is still a long rules file — just in a different file.

---

## Before/after: the testing section

Here's the same concern handled two ways.

**Before (50 lines in CLAUDE.md, bloated):**

> Testing: We use Vitest. Tests should be co-located with components. Use React Testing Library. Avoid snapshot tests — they're brittle. Prefer testing user behaviour over implementation. Mock at the boundary, not inside the unit. Use `userEvent` rather than `fireEvent`. Test ids should use `data-testid` not `id` attributes. Test file names should match the component file name with `.test.tsx` suffix. Test suites should have a `describe` block matching the component name. Use `it` not `test`. Assertion messages should be readable...

**After (2 lines in CLAUDE.md):**

> For testing conventions, see `.claude/rules/testing.md`.

**`.claude/rules/testing.md` (20 focused lines):**

```markdown
# Testing conventions

Framework: Vitest + React Testing Library
Co-locate: `Component.test.tsx` next to `Component.tsx`
Selector: `data-testid` over `id` or class selectors
Event: `userEvent` over `fireEvent`
Structure: `describe('ComponentName')` wrapping `it('...')` blocks
Mocking: mock at module boundaries, never inside units
Avoid: snapshot tests

Reference implementation: `src/components/molecules/SearchInput.test.tsx`

Verification: `pnpm test --related` before handoff
```

The after version is shorter in `CLAUDE.md`, more detailed in `testing.md`, and has a reference implementation the agent can grep. The agent gets more useful information in fewer tokens.

---

## The enforcement principle

Any rule that can be converted into a linter rule, a type constraint, or a pre-commit gate should be converted. Rules in `CLAUDE.md` shift probability. Gates enforce deterministically.

| Concern | In CLAUDE.md (probabilistic) | In tooling (deterministic) |
|---|---|---|
| No console.log | "Never use console.log" | eslint `no-console` errors |
| No barrel imports | "Use specific import paths" | Custom ESLint rule |
| No implicit any | "Use strict types" | `noImplicitAny: true` in tsconfig |
| Named exports only | "No default exports" | `import/no-default-export` ESLint |
| Test file required | "Write a test for each component" | Pre-commit script checks for sibling .test |

When a gate fires, the agent sees the error output, parses the violation, and fixes it — usually correctly, first try. You don't even have to ask. This is the hidden advantage of pre-commit hooks in an agentic workflow: they convert a failure into a re-prompt.

The rules file then contains only the things that can't be gated. That's almost always architectural taste and judgement calls — not syntax, not naming, not import patterns.

---

## First pass vs. over time

**First pass (day one):** Write the five sections. Keep each one short enough to feel incomplete. That's the right amount. The first version should be under 80 lines.

**As you work (week one and beyond):** When the agent does something wrong, ask: is there a gate I can add? If yes, add the gate. If no, add a one-line rule. Every time you add a rule, delete or consolidate something else. The file should stay the same size or shrink over time.

Rules that have been in the file for a month without preventing an error are not earning their place. Delete them. If the agent doesn't need the reminder, the reminder is consuming context for nothing.

The goal is a rules file you can read in two minutes that covers the decisions that actually matter. If your `CLAUDE.md` takes longer than two minutes to read, it's too long.

---

## Coming next

[Hooks That Pay for Themselves](/ai/2026-04-10-hooks-that-pay-for-themselves/) — the `SessionStart`, `PreToolUse`, and `PostToolUse` hooks that give your agent instant orientation at zero cost. We'll look at the concrete hooks worth writing and the cost calculation that makes them worth the ten minutes to set up.
