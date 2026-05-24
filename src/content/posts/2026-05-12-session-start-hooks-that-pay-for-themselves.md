---
title: "Session-Start Hooks That Pay for Themselves"
date: "2026-05-12T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Zero ongoing cost. Measurable improvement on every interaction. The underused feature of modern coding agents — what to put in it, and what not to."
cover: "/images/blog/ai/session-start-hooks.png"
thumb: "/images/blog/ai/session-start-hooks.png"
last_modified_at: "2026-05-12T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 6
---

Most teams configure their AI coding agent once and never look at the configuration again. They set up `CLAUDE.md` / `AGENTS.md`, maybe write a few `.cursor/rules/*.mdc` files, and consider the setup "done."

There's a feature in Claude Code (and analogues in Cursor, Aider, and others) that is wildly underused: the **session-start hook**. A small script that runs every time you open a session, whose output becomes part of the agent's prompt. Zero ongoing cost. Measurable improvement on every interaction.

In this post: what to put in it, what *not* to, and the patterns I've seen pay back the time-to-set-up within the first week.

---

## What is a session-start hook?

In Claude Code, the `SessionStart` hook is configured in `.claude/settings.json`:

```jsonc
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/session-start.sh" }
        ]
      }
    ]
  }
}
```

The shell command runs at session start. Its stdout is injected into the agent's context as a `<system-reminder>` — visible to the agent before it sees your first message, but rendered as a hint, not as content the user sees in chat.

Cursor has the equivalent in its "Rules for AI" + custom commands; Aider has command-line flags that prepend content; most agentic CLIs offer some flavour of "run this script and include its output."

The key property is the same across tools: **a small per-session payload, deterministic enough to script, dynamic enough to reflect today's state**.

---

## Why this is high-leverage

Three reasons.

### 1. It's the only place you can inject *current* state

`CLAUDE.md` is static. The rules in `.cursor/rules/` are static. Both are checked into the repo and only change when humans edit them.

The session-start hook runs every time. It can include:

- Current branch name.
- Uncommitted changes.
- Last 5 commits.
- Today's date and the project's relative timeline ("3 days into the migration sprint").
- Live counts from `lint:rules` and `typecheck:strict`.
- The PR currently being worked on (parsed from branch name).

None of that fits in a static file. All of it shifts the agent's behaviour in useful ways.

### 2. It's the highest-priority slot in the prompt

In most agentic CLIs, the `system-reminder` injection sits near the top of the prompt — above the user's first message, above the agent's tool results, above retrieved file content. That means it's the **last thing the agent reads before it starts working**.

Anything you put here gets read with full attention. Compare: rules buried 800 lines into `CLAUDE.md` may be skimmed or truncated. The session-start payload is not.

### 3. It survives context compaction

Most modern coding agents compress prior conversation as they run long. The system-reminder content is structurally protected from that compression — it stays in the prompt across compactions.

Combined with the fact that it re-fires on session restart, this is the **most durable** way to keep a fact in the agent's working memory across a long task.

---

## What to put in it

Here's the structure I use. Each section is ~5–10 lines. Total payload ~30 lines, fits comfortably in any context budget.

```bash
#!/usr/bin/env bash
# .claude/hooks/session-start.sh

cat <<EOF
Key project rules (the ones agents get wrong most often):
• Imports: NO barrels (\`from 'components/atoms'\`) — use specific path.
• Imports: NO deprecated dirs — \`__v2__/\`, \`__v_old__/\`, \`form/\` banned.
• No \`@ts-ignore\` / \`@ts-nocheck\` / \`: any\` / \`as any\` — fix root cause.
• Styles in sibling \`style.ts\` — no inline \`sx={{...}}\` in components.
• Select/dropdown: use \`molecules/FormAutocomplete\`, not \`atoms/Select\`.
• Forms: react-hook-form + zod. Server state: TanStack Query. Client state: Zustand (one store per module under \`pages/<Module>/store/\`).
• ALWAYS add a sibling *.test.tsx for new components. Pre-commit runs vitest.
• Before handoff: \`npm run typecheck && npm run lint && npm test\`.

Branch: $(git branch --show-current 2>/dev/null)
Uncommitted: $(git status --short 2>/dev/null | wc -l | tr -d ' ') files
Recent commits:
$(git log --oneline -5 2>/dev/null | sed 's/^/  /')

Violation snapshot (vs. last week):
  @ts-ignore: $(grep -rE "@ts-(ignore|nocheck)" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  barrel imports: $(grep -rE "from 'components/(atoms|molecules)'" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
EOF
exit 0
```

Five things this is doing:

1. **The non-inferable rules**, listed bluntly. Not every rule — just the ones an agent gets wrong if it doesn't know them.
2. **Current branch and uncommitted state.** Frames the session.
3. **Recent commit history.** Agents pick up commit style and recent intent.
4. **Live violation counts.** Visible progress (or regression). This single line — *"@ts-ignore: 3141"* — is enough to make the agent more conservative about adding new ones.
5. **Always exits zero.** A hook that fails breaks the session. Even when measurements fail (`git` not available, `grep` matches nothing), the script must exit cleanly.

---

## The "non-inferable rules" principle

This is the most important content in the hook, and the one that takes the most thought.

**A rule belongs in the session-start hook only if it cannot be inferred from the surrounding code.** That's it. Three test questions:

1. Would an agent reading 10 random files in the codebase figure this out? If yes, leave it out — the agent will discover it.
2. Is this rule violated more often than 5% of the time in current code? If yes, the agent will *learn the wrong rule* from the code; the hook needs to override.
3. Is this rule unique to your codebase / non-standard for the framework? If yes, the agent's training data is pulling it the wrong way; the hook re-centers.

Rules that pass at least one test:

- ✅ "No barrel imports" — common in React codebases, contradicts atomic-design imports in most repos the agent has seen.
- ✅ "No `@ts-ignore`" — agents will see thousands in legacy code and assume it's fine here.
- ✅ "Use named exports" — agents default to `export default` from React tutorial priors.
- ✅ "Select/dropdown: use `molecules/MuiAutocomplete`" — your codebase-specific decision.

Rules that fail all three tests (leave out):

- ❌ "Use TypeScript" — visible from `.ts` extensions everywhere.
- ❌ "Use React" — visible from `package.json` and `.tsx` files.
- ❌ "Tests live in `*.test.tsx` sibling files" — visible from any directory listing.

The hook is precious context-window real estate. Don't waste it on facts the agent can verify in 5 seconds of grep.

---

## The cache-warming side effect

This is a bonus benefit most teams don't realise.

Modern coding agents (Claude Code, Cursor's agent, others) use **prompt caching** to avoid re-reading the same content on every turn. The cache key is built from the prefix of the prompt — system messages, system-reminders, top-of-context content.

A stable session-start payload means **every session starts with a warm cache hit**, reducing latency by 10–40% on the first response. The savings compound over a multi-hour session.

The trick is to keep the *static parts* (the rules) at the top of the payload and the *dynamic parts* (branch, commits, counts) at the bottom. Even though the dynamic section invalidates the cache for the tail, the rules section stays cached across sessions. Order matters.

```bash
# Static — caches across sessions
cat .claude/hooks/static-rules.txt

# Dynamic — re-evaluated, doesn't break the static cache hit
echo "Branch: $(git branch --show-current)"
echo "Recent commits:"
git log --oneline -5
```

If you want to be precise about this, split into two files and concat: one cached, one fresh.

---

## What *not* to put in the hook

Some patterns I've seen that hurt more than they help:

### ❌ The entire CLAUDE.md, duplicated

Some teams `cat CLAUDE.md` from the hook. Don't. CLAUDE.md is already in the prompt; duplicating it wastes context budget and forces the agent to reconcile two copies.

### ❌ A status board

```
TODO list:
  [ ] Migrate Customers page
  [ ] Audit billing module
  [x] Fix login bug
```

Tempting, but wrong place. Status lives in your project management tool. The hook should not become a TODO list — it'll go stale and the agent will act on outdated info. Use the hook for *codebase state*, not *project state*.

### ❌ A long banner / welcome message

"Welcome to the FooBar codebase! This project was started in 2019 by..." The agent does not need history; it needs the rules that affect today's code.

### ❌ Anything that requires network

`curl`, `gh api`, anything that might hang or fail. The hook must complete in under a second and never block the session start. If a measurement requires network, run it on a schedule and cache the result to a local file; the hook reads the cached value.

### ❌ Secrets

Obvious, but worth stating: anything the hook prints lands in the prompt and might be quoted back to you in chat or logged. Never include tokens, keys, or sensitive paths.

---

## Variations: hooks for specific contexts

The session-start hook fires on every session. But the same pattern works for narrower triggers:

### `UserPromptSubmit` hook

Runs on every user message. Use sparingly — adds latency to every turn. But useful for, e.g., re-asserting a critical constraint that the agent keeps drifting on within a session:

```bash
#!/bin/bash
# .claude/hooks/user-prompt-submit.sh
echo "Reminder: the table library is on v4, not v5 — the column prop is \`renderHeader\`, not \`headerComponent\`."
```

Don't do this routinely. Do it when you've identified a specific recurring drift and want a course-correction nudge on every turn.

### `PreToolUse` hook

Runs before specific tools fire. The single most useful PreToolUse hook I write is a guard that prevents `Edit` / `Write` on banned paths:

```bash
#!/bin/bash
# .claude/hooks/check-deprecated-imports.sh
# Block writes that introduce __v5__ imports

if echo "$CLAUDE_TOOL_INPUT" | grep -qE "from 'components/(__v2__|__v5__|form)/"; then
  echo "❌ Importing from deprecated directories is banned. See MIGRATIONS.md." >&2
  exit 1
fi
```

The agent sees the failure and corrects. This is hook-as-gate: it turns a rule into an enforcement.

### `Stop` hook

Runs when the agent stops (end of turn). Useful for "did you forget something?" checks:

```bash
#!/bin/bash
# .claude/hooks/validation-stop-check.sh

if git diff --cached --name-only | grep -qE "\.(ts|tsx)$"; then
  if ! npm run --silent typecheck > /dev/null 2>&1; then
    echo "⚠ Typecheck is failing. Run \`npm run typecheck\` and fix before handoff."
  fi
fi
```

A Stop hook can't *force* the agent to fix things — but it surfaces the issue at exactly the moment the agent is asking "am I done?" Almost always, the agent reads the warning and runs the fix before declaring complete.

---

## Anatomy of a complete `.claude/hooks/` directory

In a mature setup, I have ~6–8 hook scripts. Sample:

```
.claude/hooks/
├── session-start-reminder.sh      ← non-inferable rules + git state
├── check-deprecated-imports.sh    ← PreToolUse Edit/Write — block banned dirs
├── check-barrel-imports.sh        ← PreToolUse Edit/Write — block barrel imports
├── generated-file-guard.sh        ← PreToolUse Edit/Write — block edits to generated files
├── dangerous-bash-guard.sh        ← PreToolUse Bash — block destructive commands
├── auto-format.sh                 ← PostToolUse Edit/Write — run prettier
├── validation-stop-check.sh       ← Stop — surface failing typecheck
└── secrets-scan.sh                ← Stop — grep diff for accidentally committed secrets
```

Each script is small (10–40 lines), single-purpose, and idempotent. None of them block legitimately good work; all of them block specific known-bad patterns.

The pattern: **each hook enforces one rule that previously lived in CLAUDE.md and was being violated**. As you discover drift, you write a hook for it. The drift stops.

---

## How to write your first session-start hook

Five-step process:

### 1. Write down the 5 rules agents get wrong most often

Look at your last 10 PRs from an agent (yours or a teammate's). What were the recurring corrections in review? Those are your top 5.

In my codebase, the list was:

1. Barrel imports.
2. `@ts-ignore` on TS errors instead of fixing them.
3. Inline `sx={{...}}` instead of sibling `style.ts`.
4. Using `atoms/Select` instead of `molecules/MuiAutocomplete`.
5. Forgetting the sibling `*.test.tsx`.

### 2. Write them as imperative one-liners

Each rule, one line, ≤80 characters. Use code formatting for paths and bans.

### 3. Add the dynamic state section

Branch, uncommitted count, last 5 commits. Three commands, three lines of output. Don't go overboard.

### 4. Add the violation snapshot

Pick 2–3 of the rules from step 1 that you can `grep` for, and print the count. Even a stale snapshot is useful — the agent sees "@ts-ignore: 3141" and applies more scrutiny to its own ts-ignore impulses.

### 5. Wire it into settings.json and test

```jsonc
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "bash .claude/hooks/session-start.sh" }] }
    ]
  }
}
```

Start a new session. Check that the agent's first response acknowledges the context. If it doesn't — if the agent writes `console.log` on the very first task — your hook isn't loading. Most often the path is wrong or the script isn't executable (`chmod +x`).

---

## How long should the hook output be?

Sweet spot: 20–40 lines. The shape is roughly:

- 8–12 lines of rules (the most-violated ones)
- 3–5 lines of git state
- 3–5 lines of violation snapshot
- 1–2 lines of "where to read for more"

That's ~25 lines. Comfortable.

Below 10 lines and you're under-using the slot. Above 60 lines and you're crowding the context budget — and the agent starts skimming.

---

## When the hook should change

Update your session-start hook when:

- **A new pattern of drift emerges in PR review.** Add it to the rules list.
- **An old rule is no longer needed.** If the codebase has been clean for a month, the agent can re-learn it from the code. Remove from the hook.
- **The migration phase changes.** "Don't use Redux" might shift to "Redux is deleted, this rule no longer needed" or "Redux removal in progress, follow `MIGRATIONS.md`."
- **A violation count crosses a threshold.** "barrel imports: 0" can be removed from the snapshot once you stay there for 4 weeks.

Quarterly review is enough. Don't tweak weekly — the agent doesn't need that level of churn, and you'll spend more time editing the hook than benefiting from it.

---

## The economics

Take a typical 4-hour agent-assisted task. With the hook:

- 25 lines of session-start context = ~400 tokens, cached across sessions.
- Agent gets the rules right the first time, ~85% of the time.
- Saves an estimated ~20 minutes of "no, not like that" back-and-forth.

Without the hook:

- Rules live only in `CLAUDE.md`, which is 800 lines deep. Agent reads them, but applies them less consistently.
- Agent gets the rules right ~60% of the time on first attempt.
- Loses ~20 minutes per task to corrections.

For a team doing 20 agentic tasks per week, that's 6+ hours of saved engineering time, per week, **for the cost of a 30-line shell script**.

The hook is the cheapest agentic asset in your repo. It's also the one most teams have left empty or unconfigured. Set it up.

---

## Closing thought

The session-start hook is the moment in your agent's life when it's most receptive — first context loaded, no work yet committed, all attention available. Anything you say here will shape the entire session.

Most teams use that moment for nothing. Or for a banner. Or for a duplicated copy of their rules.

Use it for the five rules that, if the agent forgets them, will cost you the most in review. Update it when the most-forgotten rules change. Let the rest stay in `CLAUDE.md`.

Your agent will start every session pre-aligned with how your codebase actually works — not how a generic React project on GitHub works.

That's the unlock. One small file, ten minutes of writing, every session a little sharper.
