---
title: "Skills: The User-Facing Workflow Layer"
date: "2026-05-25T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Hooks enforce rules. Subagents review work. Skills are how the team actually invokes them — slash commands that wrap multi-step workflows in a single, memorable name. Twelve real skills, dissected."
cover: "/images/blog/ai/skills-user-facing-workflow-layer.png"
thumb: "/images/blog/ai/skills-user-facing-workflow-layer.png"
last_modified_at: "2026-05-25T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 17
---

The hardest part of an agent-ready repo isn't writing the rules. It's getting the team to *use* them — to remember which prompt doc to load, which subagent to invoke, which reference module to read first.

That's the job of skills. A skill is a slash command. The user types `/migrate-list Orders` and a 60-line prompt fires, loading the right docs, naming the right reference implementation, delegating to the right subagent, and finishing with the right validation. The user typed eight words. The skill did the workflow.

This is the top of the enforcement stack: **hooks at the bottom** (deterministic guards), **subagents in the middle** (specialist reviewers), **skills at the top** (the surface a teammate actually touches).

---

## What a skill actually is

A skill is a `.md` file in `.claude/commands/`. The filename becomes the slash command — `migrate-list.md` → `/migrate-list`. Frontmatter declares the description and any expected arguments; the body is the prompt the agent receives when the user invokes it.

Minimum viable shape:

```markdown
---
description: Migrate a list page module to the canonical list architecture
argument-hint: <ModuleName>
---

Read `docs/prompts/list-page-migration.md` in full, then migrate the list
page for the module: $ARGUMENTS

Use `src/pages/Reference/CanonicalList/` as the canonical reference.
Run `npm run typecheck` and `npm run lint` when done; report results.
```

That's it. No magic. The user types `/migrate-list Orders`, Claude Code substitutes `$ARGUMENTS` with `Orders`, and the rendered prompt becomes the first message of the turn.

The leverage isn't in the syntax. The leverage is in **encoding the workflow knowledge** — the doc to read, the reference module to follow, the validation to run — so the user doesn't have to remember it.

---

## Why skills, and not just "tell the agent in chat"

You could absolutely tell the agent in chat: "migrate the list page for Orders, follow the rules in list-page-migration.md, use CanonicalList as reference, run typecheck after". A skill does that for you, every time, with no variance.

Three things skills give you that ad-hoc prompting doesn't:

**Consistency across teammates.** The first time someone migrates a list page, they invent a prompt. The second time, they invent a slightly different one. By the fifth person, every migration looks different — same goal, six approaches, five subtle drift bugs. A skill is one canonical way to do the thing.

**Encoded knowledge.** The skill *is* the documentation. New teammate joins the team, runs `/help` (or whatever lists skills in your CLI), and sees the catalogue of canonical workflows. That's onboarding material that updates itself.

**Composition with subagents.** Skills can delegate to subagents in a single line: "Delegate to the `module-scaffolder` agent with: $ARGUMENTS". The skill is the thin user-facing wrapper; the subagent does the work. Same logic from any teammate.

---

## A real skills directory

Here's a `.claude/commands/` directory from a mature setup. Twelve skills, all in active use. I've grouped them by what they're for.

```
.claude/commands/
├── migrate-list.md       ← migrate a list page to canonical architecture
├── migrate-form.md       ← migrate a form to react-hook-form + zod
├── migrate-mui.md        ← migrate MUI v4 → v5 in a module
├── de-barrel.md          ← remove barrel imports from a module
├── add-testids.md        ← add data-testid to a module's interactive elements
├── audit-rerenders.md    ← scan a module for unnecessary re-renders
├── perf-audit.md         ← scan a module for perf issues
├── a11y-audit.md         ← accessibility audit (axe + manual checks)
├── dep-audit.md          ← dependency audit (unused, outdated, vulnerable)
├── security-scan.md      ← scan changed files for security issues
├── biweekly-audit.md     ← run the standing biweekly health check
└── README.md             ← the index for humans
```

Three patterns visible from the names alone:

- **Migrations** are skills (`migrate-list`, `migrate-form`, `migrate-mui`, `de-barrel`). Each is a heavy, repeatable workflow with a canonical reference module.
- **Audits** are skills (`audit-rerenders`, `perf-audit`, `a11y-audit`, `dep-audit`, `security-scan`, `biweekly-audit`). Each loads a checklist and produces a report.
- **Boilerplate adds** are skills (`add-testids`). Each does a mechanical-but-codebase-specific transform.

Notice what's *not* there: no "build the app" skill, no "run tests" skill. Those are one-liners — `npm run build`, `npm test` — and don't need a wrapper. Skills wrap workflows, not commands.

---

## Anatomy of a migration skill

`migrate-list.md`:

```markdown
---
description: Migrate a list page module to the canonical list architecture
argument-hint: <ModuleName>
---

Read `docs/prompts/list-page-migration.md` in full, then migrate the list page
for the module: $ARGUMENTS

Follow every rule in the guide exactly. Use `src/pages/Reference/CanonicalList/`
as the primary canonical reference and `src/pages/Reference/SecondaryList/` /
`src/pages/Reference/TertiaryList/` as additional references — read their files as
needed to match patterns precisely.

Work through the verification checklist at the end of the guide before
considering the migration complete. After the migration, run
`npm run typecheck` and `npm run lint` and report results.
```

Five design decisions in twelve lines:

**1. "Read the prompt doc in full" is the first instruction.** Not "consider", not "refer to" — *read*. The prompt doc is 1,600 lines of canonical patterns; without explicit instruction the agent skims it. With explicit instruction, the agent loads it into context first thing, and every subsequent decision is grounded.

**2. One primary reference, two secondary.** Not "look at the codebase" — *these three modules, in this order*. In a large codebase the agent has many possible references to choose from; without a pin it picks the wrong one half the time.

**3. The verification checklist is named.** "Work through the verification checklist at the end of the guide" forces the agent to use the explicit done-criteria rather than its own intuition about "done".

**4. Concrete handoff commands.** `npm run typecheck`, `npm run lint`. Not "validate the work" — the exact commands. This guards against the failure mode where the agent declares completion without running the checks.

**5. Reporting is required.** "report results". The agent has to surface what happened, not just silently finish. This is what makes the skill *auditable*.

---

## Anatomy of a thin skill (delegate to a subagent)

When a workflow is heavy, the skill becomes a one-liner that delegates to a subagent. The shape:

```markdown
---
description: Replace all deprecated __v2__/__v5__/form/ component imports in a module
argument-hint: <ModuleName or file path>
---

Delegate to the `deprecated-migrator` agent for: $ARGUMENTS

After migration, run `npm run typecheck` to verify no type errors.
```

The skill is two sentences. All the actual work — finding files, swapping imports, adjusting prop names, looping until clean — lives in the subagent's system prompt. The skill is just the entry point.

This separation matters. The subagent prompt is ~150 lines of detailed scoping. The skill is two sentences a human can read at a glance. Different audiences, different formats, both versioned in the repo.

---

## Anatomy of an audit skill

`de-barrel.md`:

```markdown
---
description: Remove barrel imports/exports from a module and rewrite to direct paths
argument-hint: <ModuleName>
---

Read `docs/prompts/de-barrel.md` in full, then eliminate barrel imports
and exports from: $ARGUMENTS

Follow every rule in the guide exactly. Use `src/pages/Reference/SecondaryList/` as the
canonical reference.

The hook `check-barrel-imports.sh` will reject any reintroduced barrel
imports as you work — fix the import, do not work around the hook.

After the migration, run `npm run typecheck` and `npm run lint` and
report results.
```

The standout line: **"The hook will reject any reintroduced barrel imports — fix the import, do not work around the hook."** This is the skill *teaching the agent about the hook*. Without this line, the agent hits the block, gets confused, and sometimes tries to disable or bypass the hook to make progress. With it, the agent treats the block as a contract — a signal that its proposed edit is wrong, not that the system is broken.

This is the integration point between the three layers. The skill tells the agent what the hook means. The hook enforces. The subagent (if invoked) does the heavy lifting. Each layer knows about the others.

---

## When to write a skill

Three signals:

**You've explained the same workflow to a teammate twice.** Anything you find yourself onboarding people into — "to migrate a list page, you read this doc, then look at this reference, then run these checks" — is a skill waiting to be written.

**The workflow is more than 3 steps long.** Anything you do in a single command doesn't need a skill. Anything that's "do X, then Y, then Z, then validate with W" does. The friction is in remembering the sequence; the skill removes it.

**The workflow has a canonical reference.** If you can name the file(s) that show how this is supposed to be done, you can name them in a skill. If you can't, the skill won't help — it just blesses the agent's intuition, which is what you were trying to avoid.

---

## When *not* to write a skill

The misuse pattern: skills as aliases for trivial commands.

`/test` that just runs `npm test`? Don't bother — the user can type `npm test`. `/install` that runs `pnpm install`? Same. A skill should be ~3 lines minimum of *workflow encoding*. If your skill body is one command, it's a shortcut, not a skill, and the cost of remembering yet another slash command outweighs the saving.

The other misuse: skills as a place to dump tribal knowledge that should be in `CLAUDE.md`. If the content is "the rules you should always follow when working on X", it belongs in path-scoped rules or `CLAUDE.md`. Skills are for *workflows you sometimes run*, not *rules that always apply*.

---

## The full stack in one example

Here's what happens when a teammate runs `/migrate-list Orders` in a repo with the full stack wired up. All three layers fire:

1. **Skill loads.** `migrate-list.md` body becomes the first message of the turn. Agent reads `list-page-migration.md` (~1,600 lines), then `src/pages/Reference/CanonicalList/` as reference.
2. **Agent starts editing.** Every `Edit`/`Write` call passes through `check-barrel-imports.sh`, `check-deprecated-imports.sh`, `check-random-uuid.sh`, `generated-file-guard.sh`. Bad imports get blocked; agent corrects in place.
3. **Auto-format fires.** Every successful edit triggers `auto-format.sh` (Prettier).
4. **Agent declares done.** `Stop` hook fires: `validation-stop-check.sh` lists files without sibling tests; `secrets-scan.sh` checks for accidental key paste.
5. **Agent reads the reminder.** Goes back, adds tests, re-runs typecheck.
6. **Final report.** Per the skill's last line: "run typecheck and lint, report results".

The user typed 22 characters. Each of the three layers did its job. The migration is consistent with the seven previous list-page migrations because the same skill ran them all.

---

## How skills get discovered

Two visibility surfaces:

**`/help` (or your CLI's command list).** Type the slash and the autocompleter shows the catalogue with descriptions from frontmatter. This is the discovery surface for teammates who already know skills exist.

**`README.md` in `.claude/commands/`.** This is the discovery surface for new teammates. Keep one — a flat list of skills with one-line descriptions and one-line "when to use it" hints. It's the page you point onboarding doc at.

Skills that exist but aren't in the README might as well not exist. New teammates won't find them.

---

## How skills change over time

Skills are versioned in the repo. Treat them like code:

- **Reviewable in PRs.** A new skill or a meaningful change to an existing one should land in a PR with a teammate review, not as a sneaky commit. The skill *is* the canonical workflow; changes have blast radius.
- **Updated when the underlying doc changes.** If `list-page-migration.md` gets restructured, every skill that says "read list-page-migration.md" should be checked. Usually nothing changes. Sometimes the reference module name changed and the skill needs to follow.
- **Deleted when the migration finishes.** When MUI v4 is fully removed, `/migrate-mui` has no remaining work. Delete it. Stale skills mislead — a teammate runs the skill, the agent confidently does nothing, everyone wonders why.

Quarterly skill review takes 20 minutes and is worth it.

---

## Cost notes

A skill itself costs nothing to load — it's a `.md` file. The *prompt it loads* has the same cost as any other prompt: the input tokens of the doc the skill says to read, plus the work the agent does.

If your skill's first line is "read `docs/prompts/list-page-migration.md`" and that doc is 1,600 lines, every invocation pays ~10–15k input tokens just to get started. That's fine for a migration workflow that runs five times a release. It would be wasteful for a workflow that runs five times a day.

For high-frequency skills, the prompt should be small and self-contained. For low-frequency, high-stakes skills, load the big doc — it's the right trade.

---

## The stack, summarised

Four posts in this thread. Five components in total:

| Component       | Where it lives                       | What it's for                                    |
| --------------- | ------------------------------------ | ------------------------------------------------ |
| `CLAUDE.md`     | Repo root                            | The persistent context — conventions, pointers  |
| Path-scoped rules | `.claude/rules/`                   | Conditional context — only loads for matching paths |
| Hooks           | `.claude/hooks/` + `settings.json`   | Deterministic guards at lifecycle events         |
| Subagents       | `.claude/agents/`                    | Judgement-call workers in isolated contexts      |
| Skills          | `.claude/commands/`                  | User-facing slash commands that wrap workflows   |

Each layer does what the others can't:

- `CLAUDE.md` can't enforce. → Hooks.
- Hooks can't reason. → Subagents.
- Subagents don't surface themselves. → Skills.
- Skills don't apply automatically. → That's why hooks and `CLAUDE.md` still exist.

Pick the right layer for each rule, write the layer well, and the agent becomes consistent across teammates, sessions, and weeks.

---

## What's next in the series

This thread wraps up the enforcement stack. The next thread will go after the *measurement* layer: how to tell whether all this scaffolding is actually working — token-per-feature trends, PR-rework rate, time-to-merge for agent-driven PRs. Without measurement, you're guessing whether the hooks/subagents/skills are worth the maintenance.

For now: if you've read all four posts in this thread, you have the full template — pick a single hook, a single subagent, and a single skill, write all three, and ship them in the same PR. That's the minimum viable agent-ready setup. Everything else is iteration on the same three shapes.

---

## Closing thought

Skills are how a team makes its agentic setup *legible*. The hooks are invisible to anyone not reading `settings.json`. The subagents are invisible to anyone not reading `.claude/agents/`. But the skills show up in `/help`, in the onboarding doc, in the chat history when a teammate posts "I just ran `/migrate-list` and it worked great".

That visibility is what turns "Prakash's clever Claude setup" into "how our team works". Write the skills early, write them small, and put them in the README. Your future-self teammates will thank you.
