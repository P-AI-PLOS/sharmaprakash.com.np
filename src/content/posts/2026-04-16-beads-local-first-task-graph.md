---
draft: false
title: "Beads: A Local-First Task Graph for Developers and AI Agents"
date: "2026-04-16T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "GitHub Issues is great for tracking work across a team. Beads is great for the local development loop — and for the AI agents running inside it. It's the same data, in the same repo, queryable with jq."
cover: "/images/blog/ai/beads-local-first-task-graph.png"
thumb: "/images/blog/ai/beads-local-first-task-graph.png"
last_modified_at: "2026-04-16T10:00:00+05:45"
use_featured_image: true
series: parallel-developer
seriesOrder: 4
---

You break a feature into six tasks in your head. You start on task one. Forty minutes in, a colleague pings you about an unrelated bug. You switch. You fix it. You come back the next morning and stare at the half-finished code trying to remember: was I on task two or three? Did I already do the migration? Which of the six tasks was blocked by the auth change that isn't merged yet?

That's not a memory problem. It's a data storage problem. You were keeping the task graph in your head when it belongs in a file.

---

## What Beads is

[Beads](https://github.com/gastownhall/beads) is a local-first issue tracker with a dependency graph. Single binary (`bd`), SQLite working store, JSONL source of truth committed to git alongside your code.

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
| `bd update bd-42.1 --status=in_progress` | Claim a task |
| `bd close bd-42.1` | Mark done |
| `bd export > .beads/issues.jsonl` | Write the graph to git |

---

## `bd ready` — the killer command

This is the one that changes behaviour. `bd ready` returns only unblocked beads, sorted by priority.

"What should I work on next?" is answered by a single command. No scanning through a list of fifty items trying to remember which ones have unclosed dependencies. No opening four GitHub Issues to read their dependency comments. Just:

```bash
bd ready
# bd-42.1  [P1] Add email_change_token column to users table
# bd-15.3  [P2] Extract BillingService from UsersController
```

Two items. Both unblocked. Top priority first. Pick one, run `bd update bd-42.1 --status=in_progress`, and start.

---

## One bead, one worktree

The pairing is intentional. When you claim a bead, you also create the worktree:

```bash
# Claim the task
bd update bd-42.1 --status=in_progress

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

## SQLite for speed, JSONL for git

The local working store is SQLite — fast queries, dependency traversal, no network latency. But SQLite files are binary and don't diff cleanly. So Beads maintains a parallel JSONL representation:

```bash
bd export > .beads/issues.jsonl
```

Commit `.beads/issues.jsonl` to git. The full graph — every bead, every dependency, every status — is in your repository history. Anyone who clones the repo can run `bd import < .beads/issues.jsonl` to rebuild the SQLite working store in seconds.

Lose the SQLite? Re-import. Switch machines? Re-import. Onboard a new agent? Feed it the JSONL.

A single bead in the JSONL looks like this:

```json
{
  "id": "neo-09w",
  "title": "Build theme toggle Stimulus controller",
  "status": "closed",
  "priority": 2,
  "issue_type": "task",
  "owner": "hi@jonathanclarke.ie",
  "created_at": "2026-02-17T20:15:04Z",
  "closed_at": "2026-02-17T20:21:06Z",
  "dependencies": [
    {"depends_on_id": "neo-tiu", "type": "blocks"}
  ]
}
```

Every field is meaningful. `status` is machine-readable. `dependencies` is a proper graph edge, not a freetext "blocked by #42" comment.

---

## Three `jq` queries worth keeping

```bash
# Ready and high priority (priority 1 or 2)
jq '[.[] | select(.status == "open" and .dependencies == [] and .priority <= 2)]' \
  .beads/issues.jsonl

# Everything blocking a given bead
jq --arg id "neo-09w" \
  '[.[] | select(.dependencies[]?.depends_on_id == $id)]' \
  .beads/issues.jsonl

# Beads closed this week
jq --argjson since "$(date -d '7 days ago' +%s 2>/dev/null || date -v-7d +%s)" \
  '[.[] | select(.status == "closed" and (.closed_at | fromdateiso8601) > $since)] | length' \
  .beads/issues.jsonl
```

The JSONL format makes the graph queryable with standard tools. No API key, no network call, no third-party service.

---

## Agents read the JSON directly

This is the underrated part. You don't need a Beads MCP server for an agent to understand the task graph. The JSONL is already in the repo. The agent can read it directly:

```
You are implementing bead bd-42.2.

Read .beads/issues.jsonl for full context:
- The beads that bd-42.2 depends on (and their current status)
- The sibling beads in this feature
- The parent feature's scope

Implement only bd-42.2. Do not touch work covered by other beads.
```

No custom tooling. No MCP server. Just `cat .beads/issues.jsonl` and structured JSON the model can reason over. The agent knows what's in scope, what's already done (closed beads), and what it must not touch (work owned by other beads).

---

## `bv` — the visual layer

For when you want to see the graph rather than query it: `bv` is a terminal UI that renders the dependency tree, shows status at a glance, and lets you navigate between beads. Optional, but useful for larger features with five or more inter-dependent tasks.

---

## How OpenSpec and Beads connect

When `/opsx:apply` runs against an approved spec, it reads `tasks.md` and creates one bead per checkbox. The dependency graph comes from the task order: task 3 that requires the migration from task 1 to exist gets a `depends_on` edge added automatically.

The spec writes the graph. Beads tracks it. `bd ready` surfaces what's executable right now. The agent picks from `bd ready`, updates the status, and works.

---

## Coming next

[Part 5: AI Agents That Work — Give Them Structure, Not Just Prompts](/ai/2026-04-17-ai-agents-structured-workflow/) wires all four tools into the complete agentic loop. What the human does, what the agent does, what artifact gets produced at each step — and why this workflow eliminates the ambiguity that makes most agentic coding sessions fail.
