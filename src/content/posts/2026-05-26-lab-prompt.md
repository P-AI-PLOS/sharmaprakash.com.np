---
title: "Workshop · Lab 1: A Prompt That Defines the Rule"
date: "2026-05-26T11:00:00+05:45"
category: ["Workshop"]
categories: ["workshop"]
directory: workshop
excerpt: "Twelve minutes. One markdown file. A definitive instruction document that says — once, in writing — what counts as a barrel import and what the agent should do about it. The source of truth the next three labs all reference."
cover: "/images/blog/hooks-subagents-skills-workshop/lab-prompt/cover.png"
thumb: "/images/blog/hooks-subagents-skills-workshop/lab-prompt/thumb.png"
last_modified_at: "2026-05-26T11:00:00+05:45"
use_featured_image: true
tags: ["ai", "claude-code", "prompts", "workshop"]
---

> **Workshop chapter 2 of 6.** [Setup](/workshop/setup/) → **Lab 1 (you are here)** → [Lab 2](/workshop/lab-hook/) → [Lab 3](/workshop/lab-subagent/) → [Lab 4](/workshop/lab-skill/) → [Capstone](/workshop/capstone/).

**Recap in 30 seconds.** A prompt is a static markdown file in `.claude/prompts/` — a definitive instruction document, not code. It contains rules, examples, and the suggested fix shape for one specific situation. The agent doesn't "think" against it; it reads and applies. The prompt is pulled into context when you reference it from chat (or when a hook, subagent, or skill references it on your behalf). Deep dive: [Writing Task-Specific Agent Prompts That Work First Try](/ai/task-prompts-that-work/).

**Goal.** Author `.claude/prompts/no-barrel-imports.md` — a single source of truth that the next three labs will all consume. By the end, you'll have invoked it from chat and watched the agent propose a correct fix on the planted bug.

## Why the prompt is the first lab

Hooks block. Subagents think. Skills orchestrate. None of those should re-invent the *rule itself* — the rule needs to live somewhere definitive first, in a form a human can read and edit. That place is `.claude/prompts/`.

When you decide barrel imports are banned, you don't immediately write a hook. You write down what counts as a barrel import, what doesn't, and what the rewrite looks like. That document survives across sessions, gets reviewed in PRs, and becomes the thing the next three artifacts point to.

## Step 1 — Write the prompt file

Create `.claude/prompts/no-barrel-imports.md` in the starter repo:

```markdown
# No barrel imports

## Purpose

Barrel imports break tree-shaking and slow cold-start. Every `import` from a
folder's `index.ts` pulls the entire folder into the bundle, even when only
one symbol is used. Direct leaf imports keep the dependency graph honest.

## Rule

A barrel import is any `import` whose specifier:

1. Ends in `/index` or `/index.ts` / `/index.tsx`, OR
2. Resolves to a directory whose `index.ts` re-exports siblings (e.g.
   `from '@/components'` where `src/components/index.ts` re-exports
   `Button`, `Card`, etc.).

These rules apply only to `.ts` / `.tsx` source files. Tests, generated
code, and `node_modules` are out of scope.

## Examples

**Reject:**
```ts
import { Button } from '@/components';
import { Toolbar } from '@/components/index';
import { OrdersList } from './legacy';
```

**Accept:**
```ts
import { Button } from '@/components/Button';
import { Toolbar } from '@/components/Toolbar';
import { OrdersList } from './legacy/OrdersList';
```

## Suggested fix

For each rejected import:

1. Open the source's `index.ts` (or `index.tsx`) and find the re-export.
2. Resolve the specifier to the concrete leaf file.
3. Rewrite the import to that leaf path.
4. Do not modify the symbol name or what's imported — only the path.

## Checklist before declaring done

- [ ] No `index` segment remains in any import specifier.
- [ ] No import resolves to a directory's `index.ts`.
- [ ] `pnpm typecheck` passes.
- [ ] No symbols changed, only paths.
```

That's the entire artifact. Five sections, no logic, no shell, no model. It's deliberately structured: a future hook will read the **Rule** section to know what to grep for, a future subagent will read the **Suggested fix** section to know what to propose, and a future skill will read the **Checklist** to know when it's done.

## Step 2 — Invoke it from chat

In the starter repo, open Claude Code and run:

```text
Read .claude/prompts/no-barrel-imports.md and apply it to src/App.tsx.
Propose the rewrite as a diff. Do not edit yet.
```

The agent should:

1. Read your prompt file.
2. Locate the barrel import in `src/App.tsx` (`from '@/components'`).
3. Return a proposed diff that rewrites it to the leaf path (`from '@/components/Button'`).
4. Confirm against the **Checklist** before declaring done.

If the diff is right, accept it. The agent isn't enforcing anything — it's *applying the rule you defined*.

## Step 3 — Notice what the prompt cannot do

Now ask the agent the same thing without referencing the prompt:

```text
Fix the barrel import in src/legacy/OrdersList.tsx.
```

You'll get *a* fix. It might be the right one. It might rename the symbol. It might add a comment. It might leave the import structure intact and only adjust the symbol. The behavior is non-deterministic because the rule lives in your head, not in any file the agent can read.

This is the limit of prompts as a layer. They are the **source of truth**, not the enforcement mechanism. The agent can read them, but it can also forget them, ignore them, or get distracted halfway through. Lab 2 (the hook) is what stops that last failure mode at the lifecycle.

## Reset and re-run

If you want a clean slate:

```sh
git checkout .claude/
rm -rf .claude/prompts/
```

Then re-do Step 1 from the snippet above.

## What you shipped

One file: `.claude/prompts/no-barrel-imports.md`. The definitive written description of one rule, in a form a teammate can read, a hook can grep, a subagent can apply, and a skill can call.

You haven't built any automation yet. That's the point. The rule has to *exist somewhere* before any of the next three layers earn their keep. The next lab promotes the rule into a hook — deterministic, fast, no model in the loop — so the agent physically cannot write a new violation while you're working on the existing ones.
