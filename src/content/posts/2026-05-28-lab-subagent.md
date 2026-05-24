---
title: "Workshop · Lab 3: A Subagent That Audits the Codebase"
date: "2026-05-28T10:00:00+05:45"
category: ["Workshop"]
categories: ["workshop"]
directory: workshop
excerpt: "Twenty minutes. One markdown file. A read-only subagent that scans for remaining barrel imports and returns a pinned table with concrete fix suggestions — the judgement call the hook can't make."
cover: "/images/blog/hooks-subagents-skills-workshop/lab-subagent/cover.png"
thumb: "/images/blog/hooks-subagents-skills-workshop/lab-subagent/thumb.png"
last_modified_at: "2026-05-28T10:00:00+05:45"
use_featured_image: true
tags: ["ai", "claude-code", "subagents", "workshop"]
---

> **Workshop chapter 4 of 6.** [Setup](/workshop/setup/) → [Lab 1](/workshop/lab-prompt/) → [Lab 2](/workshop/lab-hook/) → **Lab 3 (you are here)** → [Lab 4](/workshop/lab-skill/) → [Capstone](/workshop/capstone/).

**Recap in 30 seconds.** A subagent is a `.md` file in `.claude/agents/` that defines a specialist worker — restricted tool surface, scoped responsibility, pinned output format. The main agent delegates a task; the subagent reads the code, forms an opinion, returns a structured report. Deep dive: [Subagents That Catch What Hooks Can't](/ai/subagents-that-catch-what-hooks-cant/).

**Goal.** Author `barrel-import-auditor` — read-only, scans for `@/components`-style barrels, returns a markdown table with file, line, current import, and suggested rewrite.

## Step 1 — Survey what's already there

The starter repo ships with three barrel imports in place:

- `src/App.tsx` (the original)
- `src/legacy/OrdersList.tsx`
- `src/legacy/Toolbar.tsx`

The hook from Lab 1 prevents *new* ones from being written; these three were committed before the hook existed, which is exactly the situation a real codebase finds itself in. Confirm they're there:

```bash
grep -rn 'from "@/components"' src/
```

You should see four hits across the three files (`App.tsx` pulls in two symbols on one line). The auditor's job is to find them all.

## Step 2 — Write the subagent

Create `.claude/agents/barrel-import-auditor.md`:

```markdown
---
name: barrel-import-auditor
description: Read-only auditor. Finds barrel imports from "@/components" and similar paths, returns a fix table.
tools: Read, Grep, Glob
---

You are a **read-only** code auditor. Your single job is to find barrel imports
and report them in a structured table. You never edit files. You never run
commands. You read, grep, and report.

## What to find

Any TypeScript import that resolves through a barrel (`index.ts`) re-export
in this repo. Specifically, imports of the form:

    from "@/components"
    from "@/components/<subdir>"   (only if <subdir>/index.ts exists)
    from "@/lib"
    from "@/hooks"

Use `Grep` with the pattern `from ['\"]@/(components|lib|hooks)` over `**/*.{ts,tsx}`.
For each hit, `Read` the file to confirm context and identify each symbol being
imported.

## How to suggest the fix

For each barrel-imported symbol, resolve its true source file under the barrel
directory. If the barrel re-exports `Button` from `./Button`, the suggested
direct import is `from "@/components/Button"`. Use `Read` on the barrel
`index.ts` to confirm the mapping — never guess.

## Output format

Return **only** a markdown table. No prose before or after. Columns, in this
order:

| File | Line | Current import | Suggested rewrite |
|------|------|----------------|-------------------|

One row per *symbol* imported, not per import statement. An import that pulls
in three symbols becomes three rows. If a fix is ambiguous (multiple plausible
source files), mark the suggested rewrite as `// AMBIGUOUS — manual review`
and continue.

If the codebase has zero barrel imports, return exactly:

    No barrel imports found.

Nothing else.
```

Save the file. That's the entire subagent.

## Step 3 — Invoke it

There are two ways to fire a custom subagent from the prompt. Both are useful.

**1. Inline mention (the one you'll use day-to-day).** Type `@`, pick `barrel-import-auditor (agent)` from the typeahead, then write the task in the same message:

> @agent-barrel-import-auditor scan the whole repo

The `@agent-` prefix is the canonical form ([Claude Code docs](https://docs.claude.com/en/docs/claude-code/sub-agents#using-subagents)); the typeahead inserts it for you. The main conversation still goes to Claude — the mention only controls *which* subagent picks up the work.

**2. The `/agents` panel (when you want to read or edit the definition).** Type `/agents` to open the management UI for creating, editing, viewing, and deleting subagents. Useful when you want to confirm the `tools:` surface or tweak the prompt without leaving the session.

Run the inline form now. The subagent spins up in its own context window. It greps, it reads the barrel `index.ts`, it returns a table:

| File | Line | Current import | Suggested rewrite |
|------|------|----------------|-------------------|
| src/App.tsx | 3 | `import { Button } from "@/components"` | `import { Button } from "@/components/Button"` |
| src/App.tsx | 3 | `import { Card } from "@/components"` | `import { Card } from "@/components/Card"` |
| src/legacy/OrdersList.tsx | 5 | `import { Button } from "@/components"` | `import { Button } from "@/components/Button"` |
| src/legacy/Toolbar.tsx | 2 | `import { Card } from "@/components"` | `import { Card } from "@/components/Card"` |

Pinned format. Predictable rows. A teammate can paste this into a PR description; a script can parse it. That's the contract.

## Why the constraints matter

The three lines that do the heavy lifting are the *constraints*, not the prose:

- **`tools: Read, Grep, Glob`** — no `Edit`, no `Write`, no `Bash`. The auditor cannot accidentally modify the codebase. You can hand it to a teammate without fear.
- **"Return only a markdown table"** — pinning the output format makes the auditor *consumable*. The skill in Lab 3 will iterate rows of this table; if the auditor sometimes returned a chatty summary, the skill would break.
- **"Read the barrel index.ts to confirm"** — forbids guessing. If the model can't verify the mapping, the row says `AMBIGUOUS` and a human gets involved.

A subagent without these constraints is just a chat session with extra steps.

## What this subagent can and cannot do

**Can:** scan the whole repo, judge each hit, produce a teammate-readable report, refuse to edit anything.

**Cannot:** fix the imports. That requires editing files, which the auditor isn't allowed to do — and which would entangle the *finding* with the *fixing*. Keep those jobs apart.

The fix is the next layer.

## What's next

The hook blocks new barrels. The subagent finds existing ones. Nothing has *rewritten* anything yet. [**Lab 3 — Skill**](/workshop/lab-skill/) wires both into `/de-barrel` — a single slash command that runs the auditor, walks the rows, and lets the hook guard each edit.
