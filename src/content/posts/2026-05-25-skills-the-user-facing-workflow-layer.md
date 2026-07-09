---
title: "Skills: The User-Facing Workflow Layer"
date: "2026-05-25T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Hooks enforce rules. Subagents review work. Commands and skills are how the team actually invokes them — thin wrappers route to detailed workflows, encoding multi-step knowledge in a single, memorable slash command. The architecture dissected."
cover: "/images/blog/ai/skills-user-facing-workflow-layer.png"
thumb: "/images/blog/ai/skills-user-facing-workflow-layer.png"
last_modified_at: "2026-05-25T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 17
---

The hardest part of an agent-ready repo isn't writing the rules. It's getting the team to *use* them — to remember which prompt doc to load, which subagent to invoke, which reference module to read first.

That's the job of commands and skills. When the user types `/migrate-list Orders`, a thin command wrapper in `.claude/commands/` triggers a detailed skill in `.claude/skills/`. The skill's prompt fires: loading the right docs, naming the right reference implementation, delegating to the right subagent, and finishing with the right validation. The user typed eight words. The skill did the workflow.

This is the top of the enforcement stack: **hooks at the bottom** (deterministic guards), **subagents in the middle** (specialist reviewers), **commands and skills at the top** (the surface a teammate actually touches).

---

## Four terms, clearly separated

Before diving in, let's nail down the terminology — these get mixed up a lot:

- **A terminal command**: Something you type in a shell. Examples: `npm test`, `npm run build`, `git commit`. One-liners, usually. These don't need skills wrapping them.
- **A slash command**: The user interface syntax `/name` that triggers a command wrapper. Examples: `/migrate-list`, `/audit-rerenders`. The slash command is what the user *sees* in chat.
- **A command** (in `.claude/commands/`): A thin `.md` file that wraps a skill or delegates to a subagent. It's the entry point — usually 2–3 lines that say "Delegate to skill X with: $ARGUMENTS" or load a simple prompt.
- **A skill** (in `.claude/skills/`): A detailed `.md` file that encodes the actual multi-step workflow. The skill *is* the knowledge — which docs to read, which references to follow, which validation to run. Commands delegate to skills; users invoke via slash commands.

So the flow is: user types slash command → command wrapper loads from `.claude/commands/` → delegates to skill in `.claude/skills/` → skill does the work. They're different layers.

---

## Commands: The thin entry point

A command is a `.md` file in `.claude/commands/`. The filename becomes the slash command users type — `migrate-list.md` becomes `/migrate-list`. Frontmatter declares the description and any expected arguments; the body delegates to a skill.

Minimum viable shape:

```markdown
---
description: Migrate a list page module to the canonical list architecture
argument-hint: <ModuleName>
---

Delegate to the `migrate-list` skill for: $ARGUMENTS
```

That's it. The command is thin — just enough to route the user to the right skill. When the user types `/migrate-list Orders`, Claude Code loads the command, substitutes `$ARGUMENTS` with `Orders`, and delegates to the skill in `.claude/skills/migrate-list.md`.

---

## Skills: The detailed workflow

A skill is a `.md` file in `.claude/skills/`. It holds the actual workflow logic — the docs to read, references to follow, validation to run. Skills are what commands delegate to.

Minimum viable shape:

```markdown
---
description: Migrate a list page module to the canonical list architecture
---

Read `docs/prompts/list-page-migration.md` in full, then migrate the list
page for the module: $ARGUMENTS

Use `src/pages/Reference/CanonicalList/` as the canonical reference.
Run `npm run typecheck` and `npm run lint` when done; report results.
```

The leverage isn't in the syntax. The leverage is in **encoding the workflow knowledge** — the doc to read, the reference module to follow, the validation to run — so the user doesn't have to remember it.

---

## Why skills, and not just "tell the agent in chat"

You could absolutely tell the agent in chat: "migrate the list page for Orders, follow the rules in list-page-migration.md, use CanonicalList as reference, run typecheck after". A skill does that for you, every time, with no variance.

Three things skills give you that ad-hoc prompting doesn't:

**Consistency across teammates.** The first time someone migrates a list page, they invent a prompt. The second time, they invent a slightly different one. By the fifth person, every migration looks different — same goal, six approaches, five subtle drift bugs. A skill is one canonical way to do the thing.

**Encoded knowledge.** The skill *is* the documentation. The skill file is versioned, reviewable in PRs, and updated when the workflow changes. New teammate joins, runs `/help` to see the command catalogue, then reads the skill to understand how it works.

**Composition with subagents.** Skills can delegate to subagents: "Delegate to the `module-scaffolder` agent with: $ARGUMENTS". The skill is the workflow orchestrator; commands are the user-facing entry points; subagents do the heavy lifting. Same logic from any teammate.

---

## A real commands and skills setup

Here's a mature setup with thin commands in `.claude/commands/` and detailed skills in `.claude/skills/`:

```
.claude/commands/                    .claude/skills/
├── migrate-list.md   ──────────────→ migrate-list.md
├── migrate-form.md   ──────────────→ migrate-form.md
├── migrate-mui.md    ──────────────→ migrate-mui.md
├── de-barrel.md      ──────────────→ de-barrel.md
├── add-testids.md    ──────────────→ add-testids.md
├── audit-rerenders.md ──────────────→ audit-rerenders.md
├── perf-audit.md     ──────────────→ perf-audit.md
├── a11y-audit.md     ──────────────→ a11y-audit.md
├── dep-audit.md      ──────────────→ dep-audit.md
├── security-scan.md  ──────────────→ security-scan.md
├── biweekly-audit.md ──────────────→ biweekly-audit.md
└── README.md         (command catalog for humans)
```

Each command in `.claude/commands/` is 2–3 lines delegating to a corresponding skill in `.claude/skills/`. Commands are the entry points; skills are the workflows. When a user runs `/migrate-list`, they invoke the command, which routes to the skill.

Three patterns visible from the names alone:

- **Migrations** (`migrate-list`, `migrate-form`, `migrate-mui`, `de-barrel`). Each is a heavy, repeatable workflow with a canonical reference module.
- **Audits** (`audit-rerenders`, `perf-audit`, `a11y-audit`, `dep-audit`, `security-scan`, `biweekly-audit`). Each loads a checklist and produces a report.
- **Boilerplate adds** (`add-testids`). Each does a mechanical-but-codebase-specific transform.

Notice what's *not* there: no "build the app" command, no "run tests" slash command. Why? Those are one-liners — `npm run build`, `npm test` — and don't need a workflow wrapper. Skills encode multi-step processes, not terminal commands.

---

## Anatomy of a migration workflow

A migration command and skill pair:

**The command** (`.claude/commands/migrate-list.md`):

```markdown
---
description: Migrate a list page module to the canonical list architecture
argument-hint: <ModuleName>
---

Delegate to the `migrate-list` skill for: $ARGUMENTS
```

Thin, clean, routes to the skill.

**The skill** (`.claude/skills/migrate-list.md`):

```markdown
---
description: Migrate a list page module to the canonical list architecture
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

Five design decisions in the skill:

**1. "Read the prompt doc in full" is the first instruction.** Not "consider", not "refer to" — *read*. The prompt doc is 1,600 lines of canonical patterns; without explicit instruction the agent skims it. With explicit instruction, the agent loads it into context first thing, and every subsequent decision is grounded.

**2. One primary reference, two secondary.** Not "look at the codebase" — *these three modules, in this order*. In a large codebase the agent has many possible references to choose from; without a pin it picks the wrong one half the time.

**3. The verification checklist is named.** "Work through the verification checklist at the end of the guide" forces the agent to use the explicit done-criteria rather than its own intuition about "done".

**4. Concrete handoff commands.** `npm run typecheck`, `npm run lint`. Not "validate the work" — the exact commands. This guards against the failure mode where the agent declares completion without running the checks.

**5. Reporting is required.** "report results". The agent has to surface what happened, not just silently finish. This is what makes the skill *auditable*.

---

## When a skill delegates to a subagent

For very heavy workflows, the skill can delegate to a subagent. The skill lives in `.claude/skills/`, the command in `.claude/commands/` is still thin:

**The command** (`.claude/commands/migrate-deprecated-imports.md`):
```markdown
---
description: Replace all deprecated __v2__/__v5__/form/ component imports in a module
argument-hint: <ModuleName or file path>
---

Delegate to the `migrate-deprecated-imports` skill for: $ARGUMENTS
```

**The skill** (`.claude/skills/migrate-deprecated-imports.md`):
```markdown
---
description: Replace all deprecated __v2__/__v5__/form/ component imports in a module
---

Delegate to the `deprecated-migrator` agent for: $ARGUMENTS

After migration, run `npm run typecheck` to verify no type errors.
```

Three layers now: command (thin, routes to skill) → skill (delegates to subagent) → subagent (does the work). The skill is two sentences; all the actual work — finding files, swapping imports, adjusting prop names, looping until clean — lives in the subagent's system prompt. 

This separation matters. The subagent prompt is ~150 lines of detailed scoping. The skill and command are short and human-readable. Different layers, different audiences, all versioned in the repo.

---

## Anatomy of an audit skill

**The command** (`.claude/commands/de-barrel.md`):
```markdown
---
description: Remove barrel imports/exports from a module and rewrite to direct paths
argument-hint: <ModuleName>
---

Delegate to the `de-barrel` skill for: $ARGUMENTS
```

**The skill** (`.claude/skills/de-barrel.md`):
```markdown
---
description: Remove barrel imports/exports from a module and rewrite to direct paths
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

The standout line in the skill: **"The hook will reject any reintroduced barrel imports — fix the import, do not work around the hook."** This is the skill *teaching the agent about the hook*. Without this line, the agent hits the block, gets confused, and sometimes tries to disable or bypass the hook to make progress. With it, the agent treats the block as a contract — a signal that its proposed edit is wrong, not that the system is broken.

This is the integration point between the layers. The skill tells the agent what the hook means. The hook enforces. The command routes to the skill. Each layer knows about the others.

---

## When to write a skill (and a corresponding command)

Three signals you need both:

**You've explained the same workflow to a teammate twice.** Anything you find yourself onboarding people into — "to migrate a list page, you read this doc, then look at this reference, then run these checks" — is a skill waiting to be written. Create the skill, then a thin command that delegates to it.

**The workflow is more than 3 steps long.** Anything that's "do X, then Y, then Z, then validate with W" needs a skill. The friction is in remembering the sequence; the skill removes it. The command is just the entry point — `/name` that routes to the skill.

**The workflow has a canonical reference.** If you can name the file(s) that show how this is supposed to be done, you can name them in a skill. If you can't, the skill won't help — it just blesses the agent's intuition, which is what you were trying to avoid.

---

## When *not* to write a skill

The misuse pattern: skills as aliases for terminal commands.

`/test` that just runs `npm test`? Don't bother — the user can type that directly. `/install` that runs `pnpm install`? Same. A skill should encode ~3 lines minimum of *workflow logic* — if your skill body is just one terminal command, it's a shortcut, not a skill, and the cost of remembering a new slash command outweighs the saving.

The other misuse: skills as a place to dump tribal knowledge that should be in `CLAUDE.md`. If the content is "the rules you should always follow when working on X", it belongs in path-scoped rules or `CLAUDE.md`. Skills are for *workflows you sometimes run*, not *rules that always apply*.

---

## The full stack in one example

Here's what happens when a teammate runs `/migrate-list Orders` in a repo with the full stack wired up. Four layers fire:

1. **Command loads.** The thin command wrapper in `.claude/commands/migrate-list.md` routes to the skill.
2. **Skill loads.** The skill in `.claude/skills/migrate-list.md` becomes the first message of the turn. Agent reads `list-page-migration.md` (~1,600 lines), then `src/pages/Reference/CanonicalList/` as reference.
3. **Agent starts editing.** Every `Edit`/`Write` call passes through `check-barrel-imports.sh`, `check-deprecated-imports.sh`, `check-random-uuid.sh`, `generated-file-guard.sh` (hooks). Bad imports get blocked; agent corrects in place.
4. **Auto-format fires.** Every successful edit triggers `auto-format.sh` (Prettier).
5. **Agent declares done.** `Stop` hook fires: `validation-stop-check.sh` lists files without sibling tests; `secrets-scan.sh` checks for accidental key paste.
6. **Agent reads the reminder.** Goes back, adds tests, re-runs typecheck.
7. **Final report.** Per the skill's last line: "run typecheck and lint, report results".

The user typed 22 characters. Each of the four layers did its job. The migration is consistent with the seven previous list-page migrations because the same command and skill ran them all.

---

## How commands get discovered

Two visibility surfaces:

**`/help` (or your CLI's command list).** Type the slash and the autocompleter shows the catalogue with descriptions from frontmatter. This is the discovery surface for teammates who already know commands exist. The descriptions come from the command wrappers in `.claude/commands/`.

**`README.md` in `.claude/commands/`.** This is the discovery surface for new teammates. Keep one — a flat list of commands with one-line descriptions and one-line "when to use it" hints. It's the page you point onboarding doc at. Commands that exist but aren't in the README might as well not exist — new teammates won't find them.

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

Four posts in this thread. Six components in total:

| Component       | Where it lives                       | What it's for                                    |
| --------------- | ------------------------------------ | ------------------------------------------------ |
| `CLAUDE.md`     | Repo root                            | The persistent context — conventions, pointers  |
| Path-scoped rules | `.claude/rules/`                   | Conditional context — only loads for matching paths |
| Hooks           | `.claude/hooks/` + `settings.json`   | Deterministic guards at lifecycle events         |
| Subagents       | `.claude/agents/`                    | Judgement-call workers in isolated contexts      |
| Commands        | `.claude/commands/`                  | Thin wrappers that route to skills — the user-facing entry points |
| Skills          | `.claude/skills/`                    | Detailed workflows encoding multi-step knowledge |

Each layer does what the others can't:

- `CLAUDE.md` can't enforce. → Hooks.
- Hooks can't reason. → Subagents.
- Subagents don't surface themselves. → Commands and skills.
- Commands and skills don't apply automatically. → That's why hooks and `CLAUDE.md` still exist.

Pick the right layer for each rule, write the layer well, and the agent becomes consistent across teammates, sessions, and weeks.

---

## What's next in the series

This thread wraps up the enforcement stack. The next thread will go after the *measurement* layer: how to tell whether all this scaffolding is actually working — token-per-feature trends, PR-rework rate, time-to-merge for agent-driven PRs. Without measurement, you're guessing whether the hooks/subagents/commands/skills are worth the maintenance.

For now: if you've read all four posts in this thread, you have the full template — pick a single hook, a single subagent, and a single command+skill pair, write them all, and ship them in the same PR. That's the minimum viable agent-ready setup. Everything else is iteration on the same three shapes.

---

## Closing thought

Skills are how a team makes its agentic setup *legible*. The hooks are invisible to anyone not reading `settings.json`. The subagents are invisible to anyone not reading `.claude/agents/`. But the skills — and their slash commands — show up in `/help`, in the onboarding doc, in the chat history when a teammate posts "I just ran `/migrate-list` and it worked great".

That visibility is what turns "Prakash's clever Claude setup" into "how our team works". Write the skills early, write them small, and put them in the README. Your future-self teammates will thank you.
