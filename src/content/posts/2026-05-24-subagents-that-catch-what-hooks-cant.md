---
title: "Subagents That Catch What Hooks Can't"
date: "2026-05-24T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Hooks block known-bad patterns. Subagents make the judgement calls hooks can't — type safety, architecture compliance, accessibility. One real subagent, dissected, plus a template for writing your own."
cover: "/images/blog/ai/subagents-that-catch-what-hooks-cant.png"
thumb: "/images/blog/ai/subagents-that-catch-what-hooks-cant.png"
last_modified_at: "2026-05-24T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 16
---

Hooks block patterns. A grep finds the pattern, the hook rejects the write, the agent retries. That model works for *mechanical* rules — "no barrel imports", "no `crypto.randomUUID`", "no edits to `dist/`".

It falls apart the moment the rule needs judgement. "Is this the right component for the job?" "Does this React Query hook have a sensible cache key?" "Are these `any`s genuinely necessary, or did the agent give up?" You can't grep your way to those answers. You need something that can read the code, understand it, and write a report.

That's a subagent.

---

## The split: hooks vs subagents vs commands vs skills

A quick map of the four enforcement layers, since they're easy to confuse:

| Layer       | Triggered by       | Cost per run          | What it's for                                  |
| ----------- | ------------------ | --------------------- | ---------------------------------------------- |
| **Hook**    | Lifecycle event    | Milliseconds          | Mechanical rules — block or warn at write-time |
| **Subagent**| Parent agent delegates | Tokens (a real LLM call) | Judgement calls — read, reason, report     |
| **Command** | User types `/name` | Milliseconds (thin wrapper) | Entry point that routes to a skill             |
| **Skill**   | Command delegates  | Tokens (LLM-driven workflow) | Repeatable workflows — scaffolding, migrations |

Hooks are deterministic and free. Subagents are non-deterministic and cost tokens. Reach for a subagent only when the question can't be answered by a grep — that's the dividing line.

---

## What a subagent actually is

A subagent is a `.md` file in `.claude/agents/`. Frontmatter declares its name, description, tool access, and model; the body is its system prompt. The parent agent (the one you're chatting with) can delegate to it via the `Agent` tool, passing a task description; the subagent runs in its own context window, does its work, and returns a single message back.

The minimum viable shape:

```markdown
---
name: type-safety-auditor
description: Scan a module for type safety issues. Read-only.
tools: Read, Glob, Grep, Bash
model: sonnet
---

You are a read-only auditor for the X codebase.
The user will give you a module name. Do these things, in this order:
...
Output format: <specific schema the parent can parse>
```

Three things make a subagent worth writing:

1. **Isolated context.** The subagent's reads don't pollute the parent's context window. You can ask it to scan 40 files and come back with a 200-word report; the parent only sees the report.
2. **Specialised system prompt.** The subagent has one job, written in detail, with no other distractions. Higher signal-to-noise than asking the parent to do everything.
3. **Restricted tool surface.** A read-only auditor literally cannot write to disk. You don't have to *trust* that it won't — the tool list makes it impossible.

That third one is the underrated property. A code-reviewer subagent that can only `Read | Glob | Grep | Bash` is structurally incapable of "helpfully fixing" something while it's supposed to be reviewing.

---

## Anatomy of a real subagent

Here's `type-safety-auditor.md` from a real `.claude/agents/` directory. It scans a module for type-safety regressions and returns a structured report.

```markdown
---
name: type-safety-auditor
description: Scan a module for type safety issues — @ts-nocheck, @ts-ignore, any usage, missing return types, untyped API responses. Read-only.
tools: Read, Glob, Grep, Bash
model: sonnet
---

You are a read-only type-safety auditor for this codebase.

## Scope

The user will give you a module name or path. Scan `src/pages/<ModuleName>/`.
Do not modify any files. Do not run typecheck or installs.
Your only output is a report.

## What to scan for

### 1. Suppression directives
- `@ts-nocheck` — file-level, banned in new code.
- `@ts-ignore` — line-level, banned.
- `@ts-expect-error` — fine if it has a comment; flag any without one.

### 2. `any` usage
- Explicit `: any`, `as any`, `Array<any>`, `Record<string, any>`, `Promise<any>`.
- Implicit `any` via untyped callback parameters.

### 3. Missing return types on exported functions
Exported functions, hooks (`use*`), and component factories should have explicit return types.

### 4. Untyped API responses
- `axios.get(...)` without a generic.
- Service functions returning `Promise<any>`.
- React Query hooks without a typed generic.

### 5. Untyped event handlers
`(e) => ...` where `e` should be `React.ChangeEvent<HTMLInputElement>` etc.

### 6. Loose form schemas
`z.any()` / `z.unknown()` in Zod schemas without a follow-up `.refine()`.

## Methodology

Use `Grep` for the patterns. Read suspicious files with `Read` to verify
context — a pattern in a comment or test mock is not a real finding.

## Output format

A markdown report with these sections, each a table. Skip empty sections.

1. Suppression directives — file:line · directive · file LOC · suggested approach
2. `any` usage — file:line · expression · suggested type
3. Missing return types — file:line · function · suggested return type
4. Untyped API calls — file:line · call · response type to apply
5. Untyped event handlers — file:line · handler · correct event type
6. Loose Zod schemas — file:line · field · suggested narrowing

End with a **Prioritized fix list**: top 5 files, one line each (impact × effort).

## Constraints

- Read-only. Never edit, write, or stage.
- Do not run `tsc` / installs.
- Do not chase findings into unrelated modules.
- Omit empty sections. Do not pad.
```

Four design decisions in that file worth calling out:

**1. The job is described as a *scope*, not a script.** The subagent isn't told "run these greps". It's told "scan for these six classes of issue, here's what each looks like". The LLM picks the right combination of `Grep`, `Read`, and `Bash` to find them. That's the difference between using an LLM and writing a shell pipeline.

**2. The output format is pinned.** Six numbered sections, each a table, plus a prioritized fix list at the end. The parent agent can either render the report to the user or parse it to decide what to do next. Unstructured output ("here's what I found...") makes the subagent harder to chain.

**3. False-positive guidance is explicit.** "A pattern in a comment or test mock is not a real finding." Without that line, the subagent flags every `// any` in a comment. With it, the report stays signal-rich.

**4. "Do not pad" is the most underrated line.** LLMs left to their own devices fill space — they explain, they hedge, they add a "Summary" section that summarises the summary. Tell them to omit empty sections explicitly and the report gets ~40% shorter.

---

## When a subagent earns its keep

Three signals it's the right tool:

**The check requires reading multiple files together.** A grep tells you `useQuery` is used. A subagent tells you whether the query key naming matches the project's convention, whether the cache invalidation in the matching mutation references the right key, and whether the typed generic flows through. That's three files of context for one decision.

**The check produces a *report*, not a verdict.** Hooks are binary — block or allow. Subagents return prose, tables, prioritized lists. If the right output is "here are 12 places to look, ranked by impact", you want a subagent.

**You want to call it on demand, not on every edit.** Type-safety audits, accessibility audits, performance audits — these are weekly cadence, not per-edit cadence. Hooks would be wasteful; subagents are right-sized.

---

## When *not* to use a subagent

The misuse pattern: reaching for a subagent when a hook would do.

If you find yourself writing a subagent whose entire job is "check whether file X contains pattern Y", stop and write a hook. The hook is deterministic, free, and synchronous. The subagent costs tokens, can fail flaky, and adds latency.

Conversely, if you're writing a hook with elaborate semantic logic — "block this edit *unless* the surrounding context shows the author intended it" — you've outgrown hooks. Promote to a subagent.

The simple test: can you write the check as 20 lines of `grep | jq`? Use a hook. Does the check need to *read code and form an opinion*? Use a subagent.

---

## Three more subagents worth writing

A typical mature setup has one or two subagents in production and a backlog of others worth writing. The ones I'd reach for next:

### `code-reviewer` — convention compliance review

Read the current diff (`git diff` + `git diff --cached`), check against the project's eight-category checklist (imports, components, naming, architecture, styling, state, forms, tables), output PASS/FAIL per category with file:line evidence. Tools: `Read, Glob, Grep, Bash`. Critically, no write access — a code reviewer that can fix things is a code reviewer that fixes things you didn't ask it to.

### `module-scaffolder` — generate new module structure

Given a module name, generate the canonical folder structure (api/, store/, types/, constants/, containers/, theme/) by reading the reference implementation and following its patterns. Tools: `Read, Glob, Grep, Write, Edit, Bash`. This one *does* write — it's a scaffolder. The trade-off: you give up read-only safety in exchange for hands-off module creation.

### `deprecated-migrator` — drive a migration

Given a deprecated import path, find every file using it, swap to the canonical replacement, adjust any prop name changes, run typecheck, report. Tools: `Read, Glob, Grep, Edit, Bash`. Loops until typecheck is clean or it's genuinely stuck. This is the subagent that pays the team back the most hours — driving a multi-hundred-file migration that no one wants to do by hand.

Each follows the same shape: tight scope, pinned output format, restricted tool surface, explicit false-positive guidance.

---

## Composition: subagents calling subagents

The parent agent calls a subagent via the `Agent` tool. That subagent can — in turn — call more subagents. The pattern that emerges:

- **User asks parent** for a module migration.
- **Parent calls `code-reviewer`** to scope what needs to change.
- **Parent calls `deprecated-migrator`** to do the swap.
- **Parent calls `type-safety-auditor`** to confirm types are still clean.
- **Parent summarises** the chain back to the user.

Each subagent has its own context window. None of them sees the other's full conversation. The parent is the orchestrator and the only thing that holds the user-facing thread.

This is where the [Hermes-style stack](/ai/hermes-self-improving-agents-cheap-infrastructure/) earns its keep: small, specialised, isolated workers managed by a thin orchestrator. The subagent pattern is the same shape at a smaller scale, inside one Claude Code session.

---

## How to wire one up

Two steps:

**1. Drop the file.** `.claude/agents/<name>.md` with the frontmatter shape above. The file is read on session start; if you edit it mid-session, restart.

**2. Invite the parent to use it.** Mention the subagent in your `CLAUDE.md`:

```markdown
## Subagents available

- `type-safety-auditor` — read-only scan of a module for ts-suppressions, `any`,
  untyped API. Use for: pre-PR audits, weekly module reviews.
- `code-reviewer` — convention check against the project checklist.
  Use for: every diff before opening a PR.
```

Without that mention, the parent agent has to *discover* that the subagent exists. With it, the parent knows to delegate.

---

## Cost notes

A subagent call is a fresh context, fresh system prompt, fresh tool budget. That's not free.

Rough costs from a real run:

- `type-safety-auditor` on one module (~30 files): ~8–15k tokens in, ~2k tokens out.
- `code-reviewer` on a 20-file diff: ~12–25k tokens in, ~3k tokens out.

Multiply by the model you've assigned. Sonnet is the right default for most auditors; reach for Opus only when the judgement calls are genuinely hard.

The `model:` field in the frontmatter pins this. If you don't pin it, the subagent inherits the parent's model — usually Opus, often overkill for a structured grep-and-report job.

---

## Failure modes

**The subagent returns a wall of text.** Output format wasn't specific enough. Pin the exact section headers, the exact table columns. "Markdown report" is too vague.

**The subagent finds nothing because it didn't look hard enough.** Single-shot scans miss things. For high-stakes audits, the system prompt should instruct it to do a coverage check: "list the files you scanned at the end of the report". If the file count is suspiciously small, the parent can re-invoke with narrower scope.

**The subagent contradicts itself.** Long context, conflicting findings. Usually the scope was too big. Split the module in half, audit each half separately, merge the reports in the parent.

**The subagent writes things you didn't ask for.** Tool-list scoping. If `Edit` isn't in `tools:`, the subagent can't edit. If you find a subagent "fixing" things mid-audit, take `Edit` off its list.

---

## What's next

The fourth and final post in this enforcement-layer thread covers **commands and skills** — the user-facing layer. The relationship is:

- A **command** (`/migrate-list`) is what the user invokes — a thin 2–3 line wrapper in `.claude/commands/`.
- The command delegates to a **skill** (in `.claude/skills/`) which loads the workflow prompt.
- The skill can delegate to **subagents** (`module-scaffolder`, `deprecated-migrator`).
- The subagents run inside a session that's already gated by **hooks** (no barrel imports, no deprecated paths).

Four layers, one stack. Hooks at the bottom, subagents in the middle, commands route to skills at the top. The next post walks through a real `.claude/commands/` and `.claude/skills/` directory — the command wrappers and skills that wire the whole thing together.

---

## Closing thought

Subagents are where Claude Code stops being "an LLM in your terminal" and starts being "a small team of specialists you can compose". The cost is that you now have to design the team — what each specialist does, what they can touch, how they hand off.

Start with one. `type-safety-auditor` is a good first one: read-only, single-purpose, immediately useful. Add the next only when you have a *judgement-call* check that a hook can't handle and that you'd otherwise be doing manually every week.

Hooks block. Subagents review. Both belong in the repo, side by side, doing the work each is shaped for.
