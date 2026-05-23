---
title: "The Subagent I Deleted: A Field Note on Layer Discipline"
date: "2026-05-31T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "I wrote a subagent that worked. I deleted it ten days later. The replacement was three lines of Prettier config. A short note on the wrong-layer trap, the four-questions test, and why a mature agent-ready repo isn't the one with the most artifacts in it."
cover: "/images/blog/ai/the-subagent-i-deleted.png"
thumb: "/images/blog/ai/the-subagent-i-deleted.png"
last_modified_at: "2026-05-31T10:00:00+05:45"
use_featured_image: true
---

I want to tell you about a subagent I wrote and then deleted.

I wrote it on a Sunday afternoon. That very specific kind of clever you feel when you've just discovered a new tool and every problem in your repo starts to look like the shape of that tool. I had recently understood subagents — what they were, when they paid off, how the isolated context window worked — and I was making a list of things to delegate.

The subagent's name was `import-organizer`. Its job was to look at a TypeScript file after the agent had edited it and reorganize the imports: third-party packages first, then absolute paths from `src/`, then relative paths. Alphabetize within each group. Insert a blank line between groups.

I gave it a tight system prompt. `Read` and `Edit` in the tool list. A small skill (`/tidy-imports`) so I could invoke it on demand. Committed it. Felt very smart.

Within about ten days I noticed something.

The subagent was firing. I'd invoke it; it would whir; it would rearrange the imports; it would return a report. It was *working*. But every time I looked at the diff it produced, I felt a small, specific irritation — the same irritation I get when I see someone use a moving truck to deliver a single envelope.

The subagent was costing me tokens, in real money, every single time. To do something Prettier already does. With a config file. For free. Locally. In milliseconds. Without an LLM.

I deleted the subagent. I wrote three lines of `prettier-plugin-organize-imports` config. I never thought about import ordering again.

---

## The wrong-layer trap

The job was real. Keeping imports tidy matters — it cuts noise in PRs, makes merge conflicts less common, and helps the next reader. The job belonged *somewhere*.

The category I picked was the most expensive layer in the stack. By a factor of about five. And the right answer wasn't even in the agent stack — it was a regular development tool that has existed for years.

I've come to think of this as the **wrong-layer trap**. It's the dominant failure mode I see when teams get serious about agentic infrastructure for the first time. You learn a new layer, the layer is genuinely useful, and you start running every recurring task through it — because the new layer is the part of your brain that's lit up. The subagent system is fresh; suddenly every job looks like a subagent's job. The skills system is fresh; suddenly every workflow needs a slash command. The hook system is fresh; suddenly you're writing a hook for a rule that already lives in `CLAUDE.md` and in a path-scoped rule and in a task prompt, four layers deep, and only one of them is doing any work.

The discipline is the inverse instinct: **pick the lightest layer that catches the rule.**

If `CLAUDE.md` catches it ninety percent of the time, that might be enough. If it's not, add the hook — but don't also write a subagent for the same rule. If a regular dev tool catches it for free, that's the right layer, full stop. The agent stack is a series of layers of increasing cost and capability, and your job is to land each rule on the cheapest layer that holds it.

---

## The four questions

Here's the test I now run before I commit any new artifact in `.claude/`. Four questions, in order.

**1. Is this a rule, or is it a workflow?**

A rule is a constraint — *don't do X*. A workflow is a sequence — *to do this thing, first A, then B, then C*. Rules belong in `CLAUDE.md` or in hooks. Workflows belong in prompts, subagents, or skills. If I'm writing a hook that has to know about a sequence of steps, I've put a workflow into the rules layer — and I'll feel the pain within a week.

**2. Does this need to be automatic, or on-demand?**

Hooks are automatic; they fire every time the lifecycle event fires. Skills are on-demand; they fire when a user types the slash. Subagents are usually invoked by the parent, often through a skill. Prompts are read when pointed at. If the honest answer to "when should this fire" is *every time the agent edits a file*, it's a hook. If the answer is *when the user explicitly asks*, it's a skill. Mixing these up gets you either noisy enforcement or workflows nobody remembers to invoke.

**3. Does this need an LLM at all?**

This is the question I missed with `import-organizer`. Can a regular tool — Prettier, ESLint, Renovate, a precommit hook, a TypeScript compiler flag — do this job? If yes, use the regular tool. The agent stack is for things regular tools can't do. Don't pay LLM prices to do work that has had a `--fix` flag since 2018.

**4. If it does need an LLM, does it need a *separate* LLM?**

Subagents are separate processes. They cost a fresh context, a fresh system prompt, a fresh tool budget. You write a subagent when you genuinely need the isolation — usually because the parent shouldn't see the noise, or because the worker needs a restricted tool surface that the parent can't be trusted with. If you don't need the isolation, the job can just be the parent agent following a prompt. One LLM, not two.

Most of the artifacts I've deleted from `.claude/` over the last year failed question three or four.

---

## The inverse story

To make the shape clear, the subagent that was correct.

A few weeks after I deleted `import-organizer`, I had a different problem. A module with over two hundred files, all importing from a deprecated component directory. The codebase had a hook blocking *new* imports from that path, but the existing ones were grandfathered. I needed to swap every one of them. Multiple imports per file. Some needed prop renaming. Some had been wrapped in higher-order components that no longer existed in the canonical version. Every file needed to be opened, read, edited, run through typecheck.

I thought about writing a prompt — telling the parent agent to walk the module and do the swaps. The parent would have done it. The parent's context would also have filled up around file forty, the agent would have lost the thread, and I would have spent three hours babysitting.

I wrote a subagent instead. `deprecated-migrator`. Tools: `Read, Glob, Grep, Edit, Bash`. System prompt: find every file using the deprecated path, swap to the canonical path, adjust prop name changes, run typecheck, loop until clean or stuck. Forty-five minutes later it came back with a report: two hundred and three files migrated, typecheck clean. Diff review took fifteen minutes. Merged.

That was a subagent's job — not because it required deep reasoning, but because it required *its own context window*. The parent could not have held two hundred files in its head. The subagent didn't have to — it loaded ten at a time, made the edits, moved on. Isolated attention. That's what subagents are for.

Same artifact shape as `import-organizer`. Different fit. One was a moving truck delivering an envelope; the other was a moving truck moving a house.

---

## What "mature" actually looks like

The way you tell whether someone's agent-ready repo is mature isn't by counting how many subagents are in it. It's by looking at what each one does and asking: *could a hook have done this? Could a prompt have done this? Could Prettier have done this?*

A mature setup is not the one with the most artifacts. It's the one where every artifact is in the right place. Where the hooks do hook things, the subagents do subagent things, the prompts do prompt things — and there is no `import-organizer` quietly burning tokens in the background while a perfectly good Prettier plugin is already installed.

Five categories. Four questions. One Prettier config that should not be a subagent.

Memorize the categories. Ask the four questions before you commit any new file in `.claude/`. And give yourself permission to delete the things that aren't earning their tokens. The `import-organizer` deletion was the best commit I made that month — minus one hundred and forty lines, plus three lines of config, and the import order has been clean ever since.
