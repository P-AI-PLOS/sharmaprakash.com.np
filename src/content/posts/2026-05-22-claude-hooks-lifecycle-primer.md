---
title: "The Claude Hooks Lifecycle: A Primer You Can Bookmark"
date: "2026-05-22T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Eight events, one JSON payload format, three exit codes that matter. The reference doc I wish I had open the first time I wrote a Claude Code hook."
cover: "/images/blog/ai/claude-hooks-lifecycle-primer.png"
thumb: "/images/blog/ai/claude-hooks-lifecycle-primer.png"
last_modified_at: "2026-05-22T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 14
---

I forget the hook lifecycle every time I sit down to write a new one. Which events fire? What's the payload shape? Does `exit 2` block the tool or just warn? Is `stdout` injected as context or shown to the user?

The [official Claude Code hooks reference](https://docs.claude.com/en/docs/claude-code/hooks) has the answers — but it's structured as a spec, not as a "I just want to write a guard for `Edit`" cheat sheet. This post is the cheat sheet. Keep the official doc open in a tab; come here when you need the shape of a thing fast.

---

## The eight events

A hook is a shell command wired to a *lifecycle event*. Claude Code fires the event, your script runs, and what your script does — exit code, stdout, stderr — shapes what happens next.

| Event              | When it fires                                              | Most common use                              |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------- |
| `SessionStart`     | Once, at session open (and on resume/compact)              | Inject non-inferable rules + git state       |
| `UserPromptSubmit` | Every time the user sends a message                        | Re-assert a constraint the agent keeps drifting on |
| `PreToolUse`       | Before any tool fires (matched by tool name)               | **Guards** — block bad edits, bad bash       |
| `PostToolUse`      | After a tool returns successfully                          | Auto-format, regenerate types, run linters   |
| `Stop`             | When the agent decides it's done (end of turn)             | Pre-handoff checks (typecheck, tests, secrets) |
| `SubagentStop`     | When a spawned sub-agent finishes                          | Same as Stop, but for delegated work         |
| `PreCompact`       | Before context compaction                                  | Persist working state into a file the agent can re-read |
| `Notification`     | When Claude Code surfaces a system-level event             | Pipe to your own desk notifier               |

The two you'll write 80% of the time are `PreToolUse` (guards) and `Stop` (pre-handoff checks). The remaining six exist; reach for them when you have a specific reason.

---

## The payload

Every hook is invoked the same way: Claude Code spawns your command and **pipes a JSON payload to stdin**. No environment variables, no CLI args — read `stdin`, parse it with `jq`, branch on what's inside.

Minimum useful payload for a `PreToolUse` on `Edit`:

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/you/.claude/projects/.../transcript.jsonl",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/abs/path/to/file.tsx",
    "old_string": "...",
    "new_string": "..."
  }
}
```

The boilerplate at the top of every hook script:

```bash
#!/bin/bash
PAYLOAD=$(cat)
FILE=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // ""')
CONTENT=$(echo "$PAYLOAD" | jq -r '.tool_input.new_string // .tool_input.content // ""')
```

`.new_string` is for `Edit`; `.content` is for `Write`. The `//` fallback handles both with one extractor.

For `Bash` tools, the relevant field is `tool_input.command`. For `Stop` hooks, there's no `tool_input` at all — you work from the working directory and `git status`.

---

## The three exit codes that matter

| Exit code | Meaning                                                              |
| --------- | -------------------------------------------------------------------- |
| `0`       | OK. Continue normally. Anything on `stdout` is **injected as context** for the agent (in `SessionStart` / `UserPromptSubmit`) or **shown to the user only** (most other events). |
| `2`       | **Block** the tool/action. `stderr` is shown to the agent as an error it must respond to. Only meaningful for `PreToolUse` and `UserPromptSubmit`. |
| any other | Soft failure. The hook didn't run cleanly; the action proceeds anyway. Warnings go to stderr but don't block. |

The pattern most guards follow:

```bash
if echo "$CONTENT" | grep -qE 'forbidden-pattern'; then
  echo "BLOCKED: explanation the agent should read." >&2
  exit 2
fi
exit 0
```

The `>&2` matters. On `exit 2`, only **stderr** reaches the agent — stdout is discarded. Send your explanation to stderr or the agent gets a block with no reason.

For `Stop` hooks, blocking doesn't apply (the agent is already done). Use `stdout` with a `systemMessage` JSON envelope to surface a reminder:

```bash
jq -n --arg m "Run typecheck before handoff." '{systemMessage:$m}'
```

That envelope is rendered to the agent as a system reminder on its *next* turn.

---

## Where hooks live

Two locations, with team/personal split:

```
.claude/
├── settings.json          # team-shared, checked into repo
├── settings.local.json    # personal, gitignored
└── hooks/
    └── *.sh               # the actual scripts
```

Wiring in `settings.json`:

```jsonc
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/check-barrel-imports.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/auto-format.sh" }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/validation-stop-check.sh" }
        ]
      }
    ]
  }
}
```

The `matcher` is a regex against `tool_name`. For events without a tool (`SessionStart`, `Stop`, `UserPromptSubmit`), omit it.

Hook scripts must be executable: `chmod +x .claude/hooks/*.sh`. If a hook silently doesn't run, that's almost always why.

---

## Matchers, more carefully

The matcher is what most people get wrong on day one. A few rules:

- `"Edit|Write"` matches both `Edit` and `Write` tools. It's a regex, not a glob.
- `"*"` is not a wildcard. Use `".*"` if you really want to match every tool — but you almost never do; it's expensive and noisy.
- For `SessionStart`, the matcher is one of `startup` / `resume` / `compact`, depending on which kind of session-start you want to fire on. No matcher = all three.
- Multiple matcher blocks at the same event run in order. Use this to split concerns: one block for `Edit|Write`, a separate one for `Bash`.

---

## Working directory

Hooks run with `CLAUDE_PROJECT_DIR` set to the project root. Use it explicitly if your script does git work:

```bash
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
```

The fallback to `.` and `exit 0` makes the script safe if it's run outside a Claude session (e.g., during testing).

---

## Testing a hook

Two ways. Neither requires starting a real Claude session:

**Direct invocation:**

```bash
echo '{"tool_input":{"file_path":"src/foo.tsx","new_string":"import x from \"components/atoms\";"}}' \
  | bash .claude/hooks/check-barrel-imports.sh
echo "exit: $?"
```

You should see your BLOCKED message and `exit: 2`.

**Real session, dry run:** start `claude`, ask it to make a deliberately-bad edit, and watch whether the hook fires. If you don't see the block message in the transcript, check (in order):

1. Script is executable.
2. Path in `settings.json` is correct (relative to project root).
3. JSON in `settings.json` parses (`jq . .claude/settings.json`).
4. Matcher regex actually matches the tool name.

---

## What hooks can't do

Worth knowing before you over-design:

- **Hooks can't modify tool input.** A `PreToolUse` hook can block or allow — it can't rewrite the `new_string` mid-flight. To "fix" something automatically, block in `PreToolUse` with a useful error and let the agent retry, *or* let it through and fix in `PostToolUse`.
- **Hooks can't pause indefinitely.** Long-running hooks (>5s) make every interaction painful. Keep them snappy; if you need a slow check, run it on a schedule and have the hook read the cached result.
- **Hooks don't run on read-only tools.** `Read`, `Grep`, `Glob`, `Bash` with a non-mutating command — these fire `PreToolUse` if matched, but most of your guards target `Edit|Write` and `Bash`.
- **Hooks aren't per-file-type aware.** You filter inside the script: read the payload, check `file_path` extension, `exit 0` if irrelevant.

---

## A minimal scaffold

If you're starting fresh, four files cover 90% of the value:

```
.claude/
├── settings.json
└── hooks/
    ├── session-start-reminder.sh      # SessionStart
    ├── dangerous-bash-guard.sh        # PreToolUse on Bash
    ├── auto-format.sh                 # PostToolUse on Edit|Write
    └── validation-stop-check.sh       # Stop
```

That's a session reminder, a Bash guard against the most common foot-guns (rm -rf, force push, --no-verify), auto-format on every edit, and a pre-handoff reminder. ~60 lines of shell, total. The companion post in this series ([From Audit to Hook](/ai/from-audit-to-hook-enforcement/)) walks through real scripts from a production codebase.

---

## When to reach for the official doc

Keep this primer for the day-to-day. Open the [official hooks reference](https://docs.claude.com/en/docs/claude-code/hooks) when you need:

- The full list of fields in the JSON payload (it grows; this post stays small).
- Newer events not covered here (Claude Code ships new hook types occasionally).
- The exact semantics of `systemMessage` vs `decision` vs `additionalContext` in the JSON-envelope response format.

The primer is the map. The doc is the legend.

---

## Closing thought

Hooks feel like an obscure feature until the first one saves you an hour of "no, not like that" — then they feel essential. The lifecycle isn't complicated; there are only eight events and three exit codes that matter. Once that's in your head, the question shifts from "how do I write this" to "what should I write" — which is the topic of the companion post.

Bookmark this one. You'll forget the matcher regex syntax at least once a month, and that's fine — the doc is right here.
