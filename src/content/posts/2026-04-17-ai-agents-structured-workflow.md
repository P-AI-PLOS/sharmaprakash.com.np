---
draft: false
title: "AI Agents That Work: Give Them Structure, Not Just Prompts"
date: "2026-04-17T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Agents don't fail because they're dumb. They fail because they're given ambiguous context. This is how the four tools in this series eliminate that ambiguity."
cover: "/images/blog/ai/ai-agents-structured-workflow.png"
thumb: "/images/blog/ai/ai-agents-structured-workflow.png"
last_modified_at: "2026-04-17T10:00:00+05:45"
use_featured_image: true
series: parallel-developer
seriesOrder: 5
---

Compare these two ways of starting an agentic session.

**Freeform:** "Add avatar uploads to the profile page."

**Structured:** "Execute bead `bd-42.1` against the spec in `openspec/changes/add-avatar-uploads/`, in the `neo-42-feat/` worktree. The server is on port 3042. The database is `neo_development_wt_42-feat`. Follow `.claude/rules/git-workflow.md` for commit conventions."

The model is the same. The context is different. The first version asks the agent to determine what to build, where to build it, how to structure it, and what "done" means — all from a six-word sentence. The second version has already answered every one of those questions. The agent's job is execution, not interpretation.

This is the whole thesis of the series: structure is the product. The AI accelerates it.

---

## Teaching Claude the workflow

The structure lives in files the agent reads at the start of every session. Not in the system prompt you type. In committed files that travel with the repo.

```
CLAUDE.md                           ← top-level: project conventions, stack overview
.claude/rules/git-workflow.md       ← worktree naming + git commands
.claude/rules/task-management.md   ← beads workflow
.claude/rules/architecture.md      ← stack overview, service boundaries
.claude/rules/testing.md           ← test conventions, which specs to write
```

The rules files are short and concrete. Here is what `.claude/rules/task-management.md` looks like in practice:

```markdown
## Task Management (Beads)

Before starting any implementation:
1. Run `bd ready` to see unblocked tasks sorted by priority.
2. Claim with `bd update <id> --status=in_progress`.
3. Create the matching worktree: `git worktree add ../neo-<issue>-<type> main -b <branch>`.
4. Implement, commit, push, open PR.
5. Run `bd close <id>` when the PR is merged.

Never work on a task that is not `bd ready` — if everything is blocked, report back.
Never work on more than one bead at a time in a single session.
```

The agent reads this once. It behaves this way for the rest of the session and every subsequent session in this project. You do not remind it each time. The file does.

---

## The full agentic loop

This is the repeatable workflow, from issue creation to bead closed:

| Step | Who | What |
|------|-----|------|
| 1 | Human | Opens GitHub Issue #42 |
| 2 | Agent | Reads `CLAUDE.md` + `.claude/rules/*` |
| 3 | Agent | Runs `bd list` to check existing work, avoid duplication |
| 4 | Agent | Runs `/opsx:propose` → writes `proposal.md`, `design.md`, `tasks.md` |
| 5 | Human | Reviews all three spec files, edits where needed, accepts |
| 6 | Agent | Runs `/opsx:apply` → creates beads from `tasks.md` |
| 7 | Agent | Runs `bd update bd-42.1 --status=in_progress` |
| 8 | Agent | Runs `git worktree add ../neo-42-feat ...` |
| 9 | Agent | Implements, commits per task, pushes, opens PR |
| 10 | Agent | Runs `bd close bd-42.1` |
| 11 | Human | Reviews PR, merges |

Two human steps in the loop: spec review (step 5) and PR review (step 11). Everything between is agent work. Both human steps are review, not execution. The human is the architect and the auditor. The agent is the builder.

Notice where the human review falls: *before* code is written (the spec), and *after* code is complete (the PR). There is no "while coding, check with me on every decision" step. That would defeat the purpose. The spec makes the mid-implementation check-ins unnecessary.

---

## A typical working day

Three worktrees. Three streams.

```
localhost:3042  →  neo-42-feat/   agent implementing avatar uploads (bd-42.1 in_progress)
localhost:3015  →  neo-15-fix/    you, debugging a login edge case (bd-15.2 in_progress)
localhost:3033  →  neo-33-refactor/  agent extracting billing service (bd-33.1 in_progress)
```

You are not mentally juggling three features. You are switching terminal tabs. When you're in `neo-15-fix/` debugging, the agent in `neo-42-feat/` is running independently. When it opens a PR, you get a notification. You review when you're ready.

Context switches now cost seconds instead of twenty minutes of rebuild. You are not restoring mental state — you are reading a spec and a diff.

---

## Why agents fail — and the fix

Agents don't fail because the model is bad at coding. They fail because the model is given ambiguous context and forced to guess. Each source of ambiguity has a structural answer:

| Ambiguity | Source | Fix |
|-----------|--------|-----|
| "Which task?" | No task tracker | `bd ready` returns exactly one answer |
| "Which directory?" | No naming convention | `neo-<issue>-<type>/` is deterministic |
| "What's the spec?" | No spec | `openspec/changes/<name>/proposal.md` |
| "Which conventions?" | No rules | `.claude/rules/*.md` |
| "What does done mean?" | No checklist | `tasks.md` checkboxes |
| "Which files should change?" | No impact list | `proposal.md` names them all |

Every cell in the right column is a committed file. Not a memory. Not a prompt you remember to include. A file the agent reads at the start of the session.

The structure is the product. Once you have it, every session — human or agent — starts oriented.

---

## The cost, revisited

This workflow has genuine upfront investment:

- `CLAUDE.md` and `.claude/rules/*.md` files for your project: 2–3 hours, once
- OpenSpec habit (explore before propose, review before apply): 20–30 minutes per feature, always
- Beads setup and `bd export` discipline: 30 minutes once, then seconds per task

Against that: no more "the agent went in the wrong direction for an hour." No more "I can't remember where I left this feature." No more "the agent changed files it shouldn't have." No more "which migration state was this branch in?"

The break-even point is fast. Most teams hit it within the first week of consistent use.

---

## The tool, not the replacement

We learned git without replacing the engineer. We learned CI/CD without replacing the reviewer. We learned code review tools without replacing the senior dev. AI is the next tool. Same pattern. It augments the structure a good engineer would build anyway — then executes inside it faster than a human can.

The engineers who thrive with AI agents are not the ones who give the best freeform prompts. They're the ones who build the best structure: clear rules, isolated environments, spec discipline, dependency graphs. The AI makes that investment pay back at a speed that wasn't previously possible.

The structure was always the right call. Now it has a faster multiplier.

---

## Where to go from here

If you haven't set up your `.claude` folder yet, [Configure Your AI Coding Environment](/ai/2026-04-08-two-configuration-layers-ai-developer/) is the prerequisite — global rules, project rules, hooks, and permissions in one place.

For the broader agent ecosystem beyond your coding IDE — MCP servers, CLI tradeoffs, token cost accounting, and more — [AI Tooling for Developers](/ai/2026-04-18-mcp-vs-cli-token-cost/) is the next stop.

The tools referenced in this series:
- **Git worktrees** — `git worktree --help`
- **OpenSpec** — [openspec.dev](https://openspec.dev)
- **Beads** — [github.com/gastownhall/beads](https://github.com/gastownhall/beads)
- **Claude Code** — [claude.ai/code](https://claude.ai/code)
