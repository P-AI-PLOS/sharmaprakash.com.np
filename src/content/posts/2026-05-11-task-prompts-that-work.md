---
draft: true
title: "Writing Task-Specific Agent Prompts That Work First Try"
date: "2026-05-11T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "If design.md is the agent's memory, task prompts are its muscle memory — the highest-leverage agentic asset you can build, and the most underused."
cover: "/images/blog/ai/task-specific-agent-prompts.png"
thumb: "/images/blog/ai/task-specific-agent-prompts.png"
last_modified_at: "2026-05-11T10:00:00+05:45"
show_category_hero_image: true
series: agent-ready-react
seriesOrder: 5
---

In Part 3 of the series, I described four canonical docs every agent-ready repo needs: `CLAUDE.md`, `design.md`, `MIGRATIONS.md`, and **task-specific prompts** in `docs/prompts/`.

The first three are about the codebase. The fourth is different. A task prompt is a **runnable recipe** — a self-contained document that, when given to an agent along with a scope ("migrate the Suppliers list page"), produces correct code on the first attempt.

If `design.md` is the agent's memory, task prompts are its muscle memory.

In every codebase I've worked in, task prompts produce the largest reduction in "the agent did it differently this time" — usually 50–80% of repetitive UI work becomes deterministic. They're underused in the industry. This post is about how to write them.

---

## What counts as a "task" worth a prompt

Two tests. A task is prompt-worthy when:

1. **You'll do it more than four times.** Migrate a list page; add a settings sub-page; scaffold a CRUD module; spin up an audit log view. If you've written one of these and you know you'll write three more, write the prompt before the second one.
2. **The work is mostly mechanical, with a handful of judgement calls.** ~85% of the lines are predictable from the pattern. The remaining 15% require domain knowledge (column definitions, the specific Zod schema, the API endpoints).

Tasks that fail one of these tests don't need a prompt. A one-off "build a complex search UI for a specific page" is too bespoke. A "migrate one list page" is exactly right.

---

## The shape of a good task prompt

Every task prompt I've shipped has the same skeleton:

```markdown
# <Task name>

## Purpose
One paragraph: what this prompt does and why. The agent reads this to
confirm it's the right prompt before continuing.

## Reference implementations
Two real paths in the codebase. The agent reads both before writing.

## Rules (apply all, in order)
~20 numbered rules. Each rule is a single decision. Each rule is testable
by grep or eye.

## Verification checklist
~15 bullets. Each bullet is a thing the agent (or a human reviewer)
ticks before declaring "done."
```

That's the whole pattern. The variation is in the rules section — the rules for migrating a list page are different from the rules for adding a settings sub-page — but the **shape is constant**.

Let me unpack each section.

---

## Purpose: tell the agent it's in the right place

```markdown
## Purpose

This document is a reusable prompt/guide for migrating any old list-page
module to the established architecture. Apply every rule below verbatim
to the target module. Replace `<Module>` / `<module>` / `<MODULE>` with
the actual module name (e.g. `PurchaseOrder` / `purchaseOrder` /
`PURCHASE_ORDER`).
```

Three things this paragraph does:

1. **Scopes the prompt.** "Migrating any old list-page module" — not other things.
2. **Tells the agent what to do with placeholders.** `<Module>` etc. become real values; not literal angle brackets in the output.
3. **Tells the agent to apply the rules verbatim**. This single phrase reduces "agent creativity" massively. The agent will substitute names and follow the rules — not invent new patterns it thinks are better.

You'd be surprised how often agents skip this when it's missing. They'll read the rules as suggestions if you don't explicitly say "verbatim."

---

## Reference implementations: the agent's training data for this task

```markdown
## Reference implementations

- `src/pages/DeliveryDocket/` — canonical reference for routing + Outlet pattern
- `src/pages/Settings/ResourceCostSheet/` — most up-to-date working example
  (all rules below are drawn from it)

Read both before starting.
```

This is the most important section. The rules in the prompt are *abstractions* over what the reference implementations do. The reference is the truth. When the rules are unclear, the agent falls back to mimicking the reference.

A few principles for picking references:

- **Pick the cleanest, not the newest.** Recency is not correctness. The cleanest implementation may be 3 months old; the newest may have been written under deadline.
- **Pick one canonical reference and at most one alternative.** Three references confuse more than they help — the agent has to reason about which differences are meaningful.
- **Re-check references quarterly.** If the canonical pattern evolves, the reference shifts too. Update the path in the prompt; don't leave the agent reading a stale example.

If you can't pick a clean reference because every existing implementation has drift, **migrate one cleanly first**. Then write the prompt against the clean one. Don't write the prompt and the reference in parallel — they'll disagree.

---

## Rules: small, numbered, testable

This is where most of the document lives. The rules section in my list-page prompt has 21 numbered rules. The form prompt has 14. Sizes I've seen work: 10–25.

A good rule looks like this:

```markdown
### 2. Named Exports — No Default Exports

**Every component, hook, and utility uses a named export.** Never use
`export default` in any component file.

```tsx
// ✅ Correct
export const CostSheetFilter: FC = () => { ... };

// ❌ Wrong
export default function CostSheetFilter() { ... }
```

In `navs` files, `Loadable` must extract the named export:

```ts
const <Module>ListPageComponent = Loadable({
  loader: () =>
    import('pages/<Module>/containers/<Module>ListPage').then((m) => ({
      default: m.<Module>ListPage,
    })),
});
```
```

Five things it does well:

1. **Title is the rule.** Not a category. Not a topic. The thing the agent has to do.
2. **Bold statement of the rule** in one sentence at the top.
3. **Code blocks for both correct and incorrect.** The ✅ / ❌ contrast is more useful than 200 words of explanation.
4. **Concrete handling of the edge case** (the `Loadable` wrapper for named exports). The agent will encounter this within the first hour of doing the task; pre-emptively answering it saves a back-and-forth.
5. **Uses the prompt's placeholder convention** (`<Module>`). The agent already knows from the Purpose section to substitute.

A bad rule looks like this:

```markdown
### 7. Follow modern React patterns

Use functional components, hooks, and TypeScript. Avoid class components
and PropTypes. Write code that is clean, readable, and maintainable.
```

That's not a rule, that's a vibe. Agents don't act on vibes.

---

## Things to include in every rule set

Not every prompt has the same content, but every prompt I've written has dealt with the same recurring issues:

### Folder structure

```markdown
### 1. Folder Structure

Every **folder name must exactly match the exported component name**
inside it. Never use generic folder names like `TableAction`, `TableFooter`,
`Skeleton` — always use the full component name.

Create the following layout under `src/pages/<Module>/`:

[ASCII tree of the exact structure]
```

Show the entire folder tree. Don't describe it — render it. Agents will follow tree drawings much more reliably than they will follow prose descriptions of folder structure.

### Naming conventions

Spell out the file naming pattern: `<module>List.ts` not `index.ts`; `<MODULE>_FORM_DEFAULT_VALUES` for constants; `Styled*` prefix for styled components. Even when these are documented elsewhere, restating them here costs 5 lines and saves the agent the cross-reference.

### Import rules

```markdown
| Rule                                  | ✅ Correct                                  | ❌ Wrong                       |
| ------------------------------------- | ------------------------------------------- | ------------------------------ |
| Absolute imports for cross-folder     | `from 'pages/<Module>/api/mutations'`       | `from '../../../api/mutations'`|
| No barrel from `components/atoms`     | `from 'components/atoms/Button'`            | `from 'components/atoms'`      |
| No top-level `components` barrel      | `from 'components/molecules/ErrorBoundary'` | `from 'components'`            |
```

The "rules table" pattern is extremely effective for import conventions. Agents will look at this table while writing imports and self-correct in real time.

### The thing your codebase does that's not standard

Every codebase has one. Maybe it's the inverted button convention. Maybe it's a custom theming pattern. Maybe it's the way pagination state lives in Zustand instead of in URL params.

Whatever it is, write a rule for it. The agent will not infer non-standard patterns from references — it pattern-matches to the most common version it has seen across all of GitHub.

---

## Verification checklist: what "done" looks like

```markdown
## Verification Checklist

### Structure
- [ ] `index.tsx` renders only `ThemeProvider + Outlet`
- [ ] Parent route in `home.navs.tsx` uses the module entry, not the list page
- [ ] Every folder name exactly matches its exported component name
- [ ] Zustand store at `store/<module>List.ts` (not `store/index.ts`)
- [ ] Store interface in `types/store.ts`, not inside the store file

### Exports & Imports
- [ ] Every component uses named export — no `export default`
- [ ] Navs use `.then((m) => ({ default: m.ComponentName }))` for named exports
- [ ] No deeply-nested relative imports
- [ ] No barrel imports from `components/atoms`, `components/molecules`

### API Layer
- [ ] Endpoints in `constant/endpoints/<module>.ts`
- [ ] Path params use endpoint functions
- [ ] Query params passed as axios `params` object
- [ ] No unused keys, services, queries, or mutations remaining

### Final
- [ ] Old list-page files deprecated with `// TODO: Not in use. Remove later.`
- [ ] Navigation works: row click → details page
- [ ] `tsc --noEmit` passes with zero errors
```

The checklist isn't a recap of the rules — it's a **distillation**. Each entry maps to one or two rules but is phrased as "the artefact to verify." The agent will tick these as it works.

Two characteristics of a good checklist:

1. **Each item is independently verifiable** in 30 seconds. "All rules followed" is not an item; "tsc --noEmit passes with zero errors" is.
2. **The checklist is grouped.** "Structure / Imports / API / UI / Final" or similar. Agents work top-down through groups; humans review group-by-group. The grouping helps both.

Aim for 25–40 items in a list-page or form-page checklist. Fewer than 20 and you've under-specified. More than 50 and the agent skims.

---

## The biggest prompt-writing mistake: rules that aren't rules

Look at a sample of prompts on GitHub and you'll see lots of this:

```markdown
### Best Practices

- Write clean, maintainable code
- Follow the principle of single responsibility
- Use descriptive variable names
- Add comments where appropriate
- Test your code thoroughly
```

None of those are rules. They're values. An agent reads "use descriptive variable names" and asks: *more descriptive than what?* In the absence of an answer, it does whatever its training data suggests.

**Every rule should be specific enough that you could write a lint rule for it, even if you haven't.** Tests:

- Can you grep for a violation? ("No `export default` in component files.")
- Can you write a TypeScript constraint? ("`I<Module>FormSchema` must be typed via `z.infer`.")
- Can you point at a file that does it right? ("Match `pages/Settings/ResourceCostSheet/containers/ResourceCostSheetFormPage/`.")

If none of those work, the rule is a value, not a rule. Move it to a "Principles" section at the top, or delete it.

---

## How long should a task prompt be?

For list-page migration: ~900 lines.
For form-page migration: ~700 lines.
For settings sub-page scaffold: ~400 lines.
For "add an audit log to an existing module": ~250 lines.

These feel long. They're not. A task prompt is a one-time investment that runs every time someone (human or agent) does the task. 900 lines that produce a correct list page in 20 minutes, vs. 2 hours of back-and-forth, pays back the first time it's used.

Some teams resist the length. Two pieces of pushback I hear:

> *"This will be hard to maintain."*

Less than `CLAUDE.md`. The prompt only changes when the underlying pattern changes — usually quarterly, not weekly. And when it does change, you update one place and every future task benefits.

> *"It feels prescriptive."*

It is. That's the point. The 20% of judgement calls you genuinely care about are not in the prompt — they're in the scope you give the agent each time. The prompt handles the 80% of mechanical decisions where consistency matters more than creativity.

---

## Where to put task prompts

`docs/prompts/` is the convention I use. The file name is the task name, kebab-cased:

- `docs/prompts/list-page-migration.md`
- `docs/prompts/form-migration.md`
- `docs/prompts/settings-subpage.md`
- `docs/prompts/audit-log.md`
- `docs/prompts/feature-flag.md`

Reference them from `CLAUDE.md`:

```markdown
## Task-specific guides

For repetitive tasks, read the matching prompt before writing code:
- `@docs/prompts/list-page-migration.md` — when adding or migrating a list page
- `@docs/prompts/form-migration.md` — when adding or migrating a form
- `@docs/prompts/settings-subpage.md` — when adding a new settings sub-page
```

When the user (or you) starts a task, you can point Claude Code / Cursor at the matching prompt:

> "Migrate the Suppliers list page following `docs/prompts/list-page-migration.md`."

That single sentence — pointing at the prompt — is the entire instruction the agent needs. Everything else lives in the prompt.

---

## How to write your first task prompt

If you've never written one, this is the path I recommend:

1. **Do the task once, by hand, cleanly.** Pick a real module. Do the migration / addition / refactor following your own best judgement. Don't take shortcuts. Don't optimise for speed.
2. **The result becomes your reference implementation.** Make sure it's in good shape; you'll be pointing at it for months.
3. **Write the prompt.** Start from the skeleton in this post. For each section, look at what you did in step 1 and codify it. Be specific.
4. **Do the task a second time using only the prompt.** Pick another module. Give the prompt and the scope to an agent. See what the agent gets wrong.
5. **Fix the prompt where the agent got it wrong.** Don't fix the agent's output and call it good — fix the prompt so the *next* run gets it right.
6. **Do the task a third time.** Now you should be at 95%+ correct on the first try.
7. **Ship.** The prompt is now reusable across the team.

The whole cycle takes maybe 8–10 hours spread across two weeks. The payoff is every future instance of that task being deterministic.

---

## Closing thought

When I see teams getting wildly inconsistent output from coding agents, the cause is almost always one of two things: a contradictory codebase (covered in the rest of this series) or a missing task-prompt layer (covered here).

The task-prompt layer is the cheaper of the two to fix. You can write your first list-page prompt this afternoon. Within a week you'll have three or four covering the patterns you do most often. Within a month you've built a small library of recipes that turns repetitive UI work from "creative writing" into "filling in a form."

That's the goal. Not "agent does everything." Just "agent does the 80% mechanical stuff perfectly, so humans can think about the 20% that matters."

Build the prompts. They're the cheapest, highest-leverage agentic asset you can ship.

---

*Related posts in this series:*

- *[Why your legacy React codebase confuses AI coding agents](/ai/why-legacy-react-confuses-ai-agents/)*
- *[A 3-week plan to make your legacy React codebase agent-ready](/ai/three-week-plan-agent-ready-react/)*
- *[Rules that agents actually follow: enforcement over aspiration](/ai/rules-agents-actually-follow/)*
- *[What to put in design.md: a complete template](/ai/design-md-template/)*
