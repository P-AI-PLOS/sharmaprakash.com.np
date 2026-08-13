---
draft: false
title: "Beads: A Local-First Task Graph for Developers and AI Agents"
date: "2026-04-16T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "GitHub Issues is great for tracking work across a team. Beads is a Dolt-backed task graph for the local development loop — and for the AI agents running inside it."
cover: "/images/blog/ai/beads-local-first-task-graph.png"
thumb: "/images/blog/ai/beads-local-first-task-graph.png"
last_modified_at: "2026-08-14T10:00:00+05:45"
use_featured_image: true
series: parallel-developer
seriesOrder: 4
---

> **Updated August 14, 2026:** Beads moved from the SQLite/JSONL architecture described in the original article to Dolt. This revision corrects the storage, sync, backup, and agent-query guidance while preserving the original workflow argument.

You break a feature into six tasks in your head. You start on task one. Forty minutes in, a colleague pings you about an unrelated bug. You switch. You fix it. You come back the next morning and stare at the half-finished code trying to remember: was I on task two or three? Did I already do the migration? Which of the six tasks was blocked by the auth change that isn't merged yet?

That's not a memory problem. It's a data storage problem. You were keeping the task graph in your head when it belongs in a file.

---

## What Beads is

[Beads](https://github.com/gastownhall/beads) is a local-first issue tracker with a dependency graph. The `bd` binary stores canonical issue state in Dolt. A JSONL export may also live alongside the code for review and interoperability, but it is not the database or a complete backup.

It is not a project management tool. It is not a replacement for GitHub Issues or Linear or Jira. Those tools are for communicating work across teams. Beads is for the local development loop — the part that happens on your machine between "issue opened" and "PR opened." Sub-tasks, dependencies, priority ordering, status tracking, agent context.

```
GitHub Issues    →  inter-team communication
Beads            →  local development loop
```

Both have their place. They don't compete.

---

## The 8 core commands

| Command | What it does |
|---------|-------------|
| `bd create --title="…" --type=task --priority=2` | Create a new bead |
| `bd list --status=open` | List all open beads |
| `bd ready` | Only unblocked work, sorted by priority |
| `bd show bd-42.1` | Details + dependencies for one bead |
| `bd dep add bd-42.2 bd-42.1` | Make `bd-42.2` depend on `bd-42.1` |
| `bd update bd-42.1 --claim` | Claim a task |
| `bd close bd-42.1` | Mark done |
| `bd dolt push` | Sync the canonical database to its Dolt remote |

---

## `bd ready` — the killer command

This is the one that changes behaviour. `bd ready` returns only unblocked beads, sorted by priority.

"What should I work on next?" is answered by a single command. No scanning through a list of fifty items trying to remember which ones have unclosed dependencies. No opening four GitHub Issues to read their dependency comments. Just:

```bash
bd ready
# bd-42.1  [P1] Add email_change_token column to users table
# bd-15.3  [P2] Extract BillingService from UsersController
```

Two items. Both unblocked. Top priority first. Pick one, run `bd update bd-42.1 --claim`, and start.

---

## One bead, one worktree

The pairing is intentional. When you claim a bead, you also create the worktree:

```bash
# Claim the task
bd update bd-42.1 --claim

# Create the isolated environment
git worktree add ../neo-42-feat main -b 42-feat/add-avatars
cd ../neo-42-feat
bin/rails db:prepare
bin/dev  # :3042
```

One bead = one branch = one directory = one running server = one database. The structure forces isolation. You cannot be "kind of working on" two things in one place.

When the PR is merged:

```bash
bd close bd-42.1
git worktree remove ../neo-42-feat
git branch -d 42-feat/add-avatars
```

---

## Dolt is canonical; JSONL is an export

Beads now uses Dolt for its working database and versioned issue history. If the project has a configured remote, cross-machine synchronization uses the dedicated database ref through `bd dolt push` and `bd dolt pull`.

This distinction matters because `.beads/issues.jsonl` is an issue-table export. It is useful for viewers, migration, and interoperability, but it does not contain Dolt branches, commit history, working-set state, or every non-issue table. It is not a complete backup.

Use the database-native path for each job:

```bash
# Share canonical issue state through the configured Dolt remote
bd dolt push
bd dolt pull

# Create a full off-machine backup
bd backup init /path/to/backup
bd backup sync

# Produce an optional issue export for interchange
bd export -o issues.jsonl
```

That is less conceptually simple than the original SQLite-to-JSONL design I described when this article was first published. It is also the accurate model now: Dolt is the source of truth; JSONL is a projection of part of it.

---

## Three CLI queries worth keeping

```bash
# Work that is ready to claim
bd ready --json

# Canonical details and dependencies for one issue
bd show neo-09w --json

# All open work
bd list --status=open --json
```

Use `bv --robot-triage` when you want graph-aware prioritization across the whole project. Its recommendations are advisory; inspect the canonical issue with `bd show` before claiming it.

---

## Agents read through the CLI

This is the underrated part. You don't need a Beads MCP server for an agent to understand the task graph. If the `bd` CLI is installed in its environment, the agent can query canonical state directly:

```
You are implementing bead bd-42.2.

Run bd show bd-42.2 --json for full context, then inspect:
- The beads that bd-42.2 depends on (and their current status)
- The sibling beads in this feature
- The parent feature's scope

Implement only bd-42.2. Do not touch work covered by other beads.
```

No custom parser. No MCP server. The CLI returns structured state from the authoritative database. The agent knows what's in scope, what's already done, and what it must not touch.

---

## `bv` — the visual layer

For when you want to see the graph rather than query it: `bv` is a terminal UI that renders the dependency tree, shows status at a glance, and lets you navigate between beads. Optional, but useful for larger features with five or more inter-dependent tasks.

---

## How OpenSpec and Beads connect

OpenSpec and Beads solve adjacent problems, but neither connection nor task conversion is automatic unless your workflow explicitly builds that bridge.

OpenSpec describes the approved change and its implementation tasks. Beads records durable ownership, dependencies, blockers, and follow-up work across sessions. An orchestrator can create or link Beads from an OpenSpec task list, but that mutation should be explicit and verified rather than assumed from task order.

The spec remains authoritative for what the change requires. Beads tracks who is doing the work and what is executable now. If the two disagree, stop and resolve the conflict instead of letting one silently overwrite the other.

---

## Coming next

[Part 5: AI Agents That Work — Give Them Structure, Not Just Prompts](/ai/ai-agents-structured-workflow/) wires all four tools into the complete agentic loop. What the human does, what the agent does, what artifact gets produced at each step — and why this workflow eliminates the ambiguity that makes most agentic coding sessions fail.
