---
title: "Why Your Legacy React Codebase Confuses AI Coding Agents"
date: "2026-05-07T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "AI agents stumble on mature codebases because they have accreted multiple valid answers to the same question — and an agent has no way to know which one is current."
cover: "/images/blog/ai/legacy-react-ai-agents.png"
thumb: "/images/blog/ai/legacy-react-ai-agents.png"
last_modified_at: "2026-05-07T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 1
---

Over the past year I've audited several mature React codebases for AI-agent readiness — different teams, different stacks, different sizes. One was four years old with a component library mid-major-version. One was deep into a state-management migration that had stalled twice. One had three styling systems running in parallel (Sass partials, CSS Modules, and a thin layer of Tailwind utilities someone added last quarter). All three were healthy by every traditional measure: shipping features weekly, passing type-check, with real test suites and decent docs.

They also confused AI coding agents on the very first file. And they confused them for the same handful of reasons, regardless of stack.

Not because the agents are bad. Because each codebase had accreted **multiple valid answers to the same question**, and an agent — unlike a senior engineer — has no way to know which answer is the current one.

This post is about why that happens, and how to recognise it in your own codebase before you write a single rule for Claude Code, Cursor, or Copilot.

---

## The symptom: "Claude wrote it differently this time"

You set up Claude Code or Cursor with a good `CLAUDE.md` / `.cursor/rules/`. You write a task description. The output is reasonable. You run it again on a similar task — and the output uses a different component, a different state pattern, a different import path.

Same prompt. Same rules. Different answer.

The natural reaction is to write more rules. **Don't.** More rules rarely fix this. The agent isn't ignoring the rules; the rules are contradicting nearby code, and the agent is splitting the difference each time.

Here's what's actually happening.

---

## What an AI agent sees when it opens your repo

A human developer working in your codebase has organisational memory:

> "Oh, `components/__v2__/` was the second attempt at the design system. We moved to `atoms/`/`molecules/` in 2024 but didn't migrate `__v2__` because it's expensive. Don't touch it. New work goes in `molecules/`."

You know this. Your team knows this. None of it is written down anywhere a model can find.

An agent has exactly three inputs:

1. **The rules document** (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`).
2. **The files it reads at runtime** (the surrounding code in the directory it's editing).
3. **Statistical priors from training data** (the average React app on GitHub).

When (1) contradicts (2), the agent has to choose. Most of the time it picks (2) — the example in the nearest file — because that example is concrete and the rule is abstract. The result is consistent-with-the-neighbours, but **inconsistent with your stated direction**.

Run the task again with a different file as the agent's starting point, and it picks a different neighbour. New "correct" answer.

---

## The five patterns that confuse agents most

In one of the codebases I audited — a 200k-LOC product with a five-year-old `components/` tree — I measured these against the documented rules:

| Stated rule | Actual count |
|---|---|
| "No `@ts-ignore` / `@ts-nocheck`" | **3,141** in committed code |
| "No barrel imports from `components/atoms`" | **714** violations |
| "No code in deprecated dirs" | **3 deprecated dirs**, actively imported |
| "One canonical theme per module" | 30 modules, **55** theme files |
| "No hex literals — use design tokens" | Theme file itself contains literal hex |

Each row is an agent's nightmare: the rule and the code disagree, and they disagree thousands of times per repo. The agent reads ten files in the area it's editing, sees ts-ignores in nine of them, and concludes "ts-ignore is normal here." It then writes one too.

The fix is not "tell the agent harder." The fix is to remove the contradiction.

### Pattern 1: Multiple parallel component hierarchies

Look at your `components/` directory right now. How many of these do you have?

- `atoms/` / `molecules/` / `organisms/`
- `__v2__/`, `legacy/`, `old/`, `deprecated/`
- A `forms/` or `form/` dir (often older)
- A handful of `.tsx` files at the root (`Drawer.tsx`, `Select.tsx`, `Tabs.tsx`)
- Feature-specific dirs at the top level (`Charts/`, `Widget/`, `MyTable/`)

Three or more of these and your agent has no canonical answer to "where do I put a button?". I've seen codebases with **five parallel hierarchies** in `components/`, each containing its own `Drawer`, `Select`, and `Modal`. Every one of them is a `from 'components/Drawer'` away from being imported.

### Pattern 2: Form fields scattered across several directories

In one repo I audited (a Chakra UI app that had partially migrated to a homegrown design system), I found four competing implementations:

1. `FormTextField` in `molecules/` **and** in `__legacy__/`
2. `FormCheckbox` in `molecules/` **and** `FormCheckBox` (different casing!) in `__legacy__/`
3. `FormSelectField` **only** in `__legacy__/` — banned dir, but the only implementation
4. Radio buttons scattered across `atoms/`, radio groups in `molecules/`, form-control primitive in `components/base/`

Watch what happens when an agent tries to build a form field. The rules say: "use `molecules/`." The agent reads the guide and sees an example importing `FormSelectField`. It checks `molecules/` — empty. It searches the codebase, finds `FormSelectField` only in `__legacy__/`, and imports it anyway. The agent did exactly what the guide told it to do. It also violated the rules.

The migration guide told agents "use `molecules`" and then **directly instructed imports from `__legacy__/FormSelectField`** because there was no canonical replacement. The repo's rules and its docs were in open conflict, and they were both trying to guide the same action. The agent had no way to know which instruction to follow.

### Pattern 3: Design tokens that mean the opposite of their name

A composite from `colors.ts` files I've seen — every line below is something that existed in a real codebase, just not all in the same file:

```ts
secondary: {
  main:  '#F19100', // a warm accent
  dark:  '#FBC064', // LIGHTER than main
  light: '#C17400', // DARKER than main
}
```

`secondary.dark` is lighter than `secondary.main`. `secondary.light` is darker. An agent reading "use the dark variant for hover" will produce the wrong colour every single time, and no rule can save it because the *token name itself* is misleading.

The same kind of file often had stragglers like `secondary.skyBlue` (a blue colour inside an otherwise warm namespace) or `custom2.background` set to a bright red in a namespace called "custom orange" — names left over from a renaming nobody finished.

When the type system can't tell you the colour is wrong, no agent can either.

### Pattern 4: Two state libraries, two styling systems, no migration doc

This one repeated in *every* audit I did, with different libraries each time:

- One repo: the architecture doc listed Redux Toolkit as a first-class option with examples. The `CLAUDE.md` said "client state: Zustand." Reality: both wired up across pages.
- Another: Jotai atoms in newer features, a Context-based "store" still serving 30+ legacy pages, and a handful of `useReducer` modules nobody touches.
- A third: Sass partials under `src/styles/`, CSS Modules under `src/features/`, and a thin layer of Tailwind utilities someone introduced last quarter — all live, all imported, none documented as "the current way."

The pattern is the same regardless of which libraries are involved: two docs that contradict each other, and neither says **"X is legacy, do not add, do not delete."** An agent reading the docs concludes both are valid. An agent reading nearby code does the same. The codebase keeps growing in two directions at once.

### Pattern 5: Migration guides that reference banned territory

This is the most painful one because the migration guides are usually the **best** content in the repo — clear, opinionated, code-templated. But when the guide says "use `molecules/X`" and X doesn't exist in `molecules/` yet, the guide quietly redirects to the banned dir.

The guide is now self-contradicting. The rules don't work.

---

## Gotchas beyond duplication

Duplication is the loudest problem, but it's not the only one. The other class of agent failure is subtler: the agent makes a **locally correct** call — the file it's editing supports the choice — that's **globally wrong** for the codebase. A senior engineer would have known better. The agent has no way to.

A few I've seen repeatedly:

### Effect-dependency staleness

Most codebases that have lived long enough have one or two custom hooks with a *deliberately omitted* dep — usually because the dep is a fresh object on every render and including it would cause an infinite loop. The fix is upstream (memoize the object, lift the state, or accept primitives only), but the workaround is "leave the dep out and add an `eslint-disable`."

An agent reading that file sees the `eslint-disable` and the missing dep, concludes "this is how we do effects here," and starts writing new effects the same way. Three weeks later a junior engineer hits a stale-closure bug in production that nobody can reproduce locally.

The codebase has a convention. The convention is *"only the two hooks that have to do this are allowed to."* That convention exists in a senior engineer's head, not in any file.

### Controlled vs uncontrolled form drift

In a long-lived form codebase, you'll find a mix of:

- React Hook Form `<Controller>`-wrapped fields (controlled by RHF)
- Native `<input>` with a `register("name")` call (uncontrolled, with the value pulled at submit)
- Stray `useState` + `<input value={…} onChange={…}>` patterns from before RHF arrived

All three are valid; all three appear in the same repo; none of the docs say which is canonical. An agent asked to add a field to an existing form will pattern-match to whichever style is closest in the file. If the field needs to react to other fields (e.g., conditional disable), the choice matters — the wrong one silently breaks validation.

### The data-fetching boundary

The most common mid-migration in mature React apps is "we're moving fetches into TanStack Query / SWR / RTK Query, but half the screens still have `useEffect(() => fetch())` from the old days."

An agent asked to add a new screen will:

1. Read the closest existing screen.
2. See `useEffect(() => fetch())`.
3. Copy it.

The query-library would have given the screen caching, deduplication, refetch-on-focus, and error boundaries for free. The agent didn't choose against those — it never knew it had a choice.

### Memoization cargo-cult

One codebase I audited wrapped every callback in `useCallback` and every derived value in `useMemo`, because at some point a team lead had told everyone "wrap callbacks to keep RHF happy." Five years later, the rule had spread far beyond RHF and nobody remembered why.

When agents read that code, they extend the pattern. New components arrive pre-wrapped in `useMemo` for primitive values, `useCallback` for handlers that don't cross a memo boundary, and `React.memo` for components that re-render once a minute. The performance cost is invisible; the readability cost is real.

This is the inverse of the previous three: the original convention was a workaround, not a design. But because the workaround is everywhere, the agent treats it as the design.

---

The common thread: **an agent without organisational memory will preserve whatever pattern is most visible in the surrounding code, even if that pattern is a scar, not a choice.** Documentation that says "do X" doesn't fix this if the file the agent is editing does ¬X — the agent will still copy what's in front of it.

The way out isn't writing more rules. It's reducing the cases where the surrounding code disagrees with the rules in the first place.

---

## Why "just write better rules" fails

I've seen teams react to agent inconsistency by writing longer `CLAUDE.md` files. 800 lines. 1,500 lines. Every edge case enumerated.

The longer the rules, the **less** consistent the agent gets. Three reasons:

1. **Rules conflict with each other** at length. The agent satisfies whichever it noticed last.
2. **Rules conflict with the code** more often, because there are more rules and the code hasn't kept up.
3. **Rules get truncated** when the context window fills. The first 500 lines and the last 500 lines are what the agent sees; the middle is lost.

The trick is not more rules. The trick is **fewer answers to each question** so most rules become unnecessary.

---

## The principle: one canonical answer per question

A codebase is ready for AI agents when:

> For every question an agent might ask while writing a change, there is **exactly one correct answer**, and that answer is findable by reading either a 50-line rule file or a single grep.

Examples of "questions":

- "Where do I put a new component?"
- "What's the right way to make a form field?"
- "What colour is the primary CTA?"
- "Where does pagination state live?"
- "What's the import path for `Drawer`?"
- "What's the error-handling pattern for mutations?"

In an agent-ready codebase, each of those has one answer. In a typical legacy codebase, each has three to five.

The work of "preparing for agentic coding" is **deleting answers until one remains**.

---

## What agent-ready does *not* mean

Some misconceptions to clear up:

**It doesn't mean rewriting everything.** Most of your codebase is fine. The issue is the seams — the parts where old and new patterns coexist without a stated direction.

**It doesn't mean strict TypeScript everywhere immediately.** That's a target, not a starting point. The starting point is *stopping the drift* — making sure new code is correct even if old code isn't yet.

**It doesn't mean banning the old patterns.** It means **explicitly marking** them as frozen, with a stated path to deletion or migration.

**It doesn't mean a perfect design system.** It means tokens that are *internally consistent* — names that match values, semantics that match namespaces, one canonical place per concept.

---

## Coming next

In Part 2 I'll walk through a concrete 3-week plan to take a legacy React codebase from "agent confuses" to "agent helps." Week 1 is the audit and the lint gate (the cheap stuff that stops the bleeding). Weeks 2 and 3 are the architectural collapse (the expensive stuff that unlocks the wins).

In Part 3 I'll dig into the rules themselves: how to write `CLAUDE.md` / `AGENTS.md` / `.cursor/rules/` so that the rules are *enforced*, not aspirational — and how to use pre-commit hooks and CI to make the rule *the* path of least resistance.

The short version: **agents are great at writing code in well-shaped codebases.** Most of the work is shaping the codebase, not configuring the agent. Once you do, the agent stops being a coin flip and starts feeling like a senior engineer who actually read the docs.
