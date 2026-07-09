---
title: "From Audit to Hook: Turning Drift Into Enforcement"
date: "2026-05-23T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "A tooling audit surfaces drift. CLAUDE.md tells the agent not to do it. Hooks make sure it actually doesn't. Eight real scripts from a production codebase, with the audit finding each one came from."
cover: "/images/blog/ai/from-audit-to-hook-enforcement.png"
thumb: "/images/blog/ai/from-audit-to-hook-enforcement.png"
last_modified_at: "2026-05-23T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 15
---

The [SessionStart hooks post](/ai/session-start-hooks-that-pay-for-themselves/) covers the single most-leveraged hook. The [lifecycle primer](/ai/claude-hooks-lifecycle-primer/) covers what each event does. This is the missing third piece: the **other seven hooks** in a mature setup, drawn from a real codebase, each tied to the audit finding that justified writing it.

The setting: a large React + TypeScript codebase part-way through several concurrent migrations — UI library version bump, import-style cleanup, deprecated component directories on the way out. Standard mid-life React app. The names below (`__v2__/`, `atoms/`, MUI) are illustrative of patterns most React teams will recognise; the *enforcement shape* is what matters and transfers between stacks.

The flow each time is the same: PR review surfaces a recurring violation → it goes into `CLAUDE.md` → it keeps happening → it becomes a hook.

That's the pipeline. Audit → rule → enforcement.

---

## The pattern

A hook is worth writing when **three** things are true:

1. The rule is stated in `CLAUDE.md` (or path-scoped rules) and is still being violated.
2. The violation is mechanically detectable — grep for a pattern, check a file path.
3. The cost of catching it in PR review is higher than the cost of blocking it at write-time.

If any of those is missing, the hook is the wrong fix. A rule the agent reliably follows from `CLAUDE.md` doesn't need a hook. A violation that requires semantic understanding ("did you pick the right component?") can't be a hook — that's a job for a `code-reviewer` subagent.

---

## The seven hooks

I'll walk through each one. For each: the audit finding, the script, what it actually catches, and the cost it saved.

### 1. `check-deprecated-imports.sh` — block imports from deleted directories

**Audit finding.** A large number of files still import from legacy component directories (call them `components/__v2__/`, `__v5__/`, `form/`). These directories are deprecated but can't be removed until the imports are gone. The agent, reading the codebase, naturally picks up the pattern and writes *new* code importing from them. CLAUDE.md says don't. The agent does it anyway, often enough to matter.

**Hook.** `PreToolUse` on `Edit|Write`:

```bash
#!/bin/bash
PAYLOAD=$(cat)
FILE=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // ""')
[[ "$FILE" =~ \.(ts|tsx)$ ]] || exit 0

CONTENT=$(echo "$PAYLOAD" | jq -r '.tool_input.new_string // .tool_input.content // ""')

if echo "$CONTENT" | grep -qE "components/(__v2__|__v5__|form)/"; then
  echo "BLOCKED: Do not import from deprecated component directories (__v2__, __v5__, form/). Use atoms/ or molecules/ instead." >&2
  exit 2
fi

if echo "$CONTENT" | grep -qE "from ['\"]@material-ui/(core|icons|styles|lab)['\"]"; then
  echo "BLOCKED: Do not import from @material-ui/* (MUI v4). Use @mui/material or the project's atoms/molecules wrappers." >&2
  exit 2
fi

exit 0
```

**What it catches.** Two patterns at once: deprecated dir imports, and MUI v4 package imports. Both are migration debt; both are easy to grep for; both keep showing up despite the rule being written down.

**Cost saved.** The hook fires a handful of times a week on agent edits. Each block is a redirect that would otherwise become a PR-review comment two days later. Real reviewer time saved per catch easily justifies the script.

---

### 2. `check-barrel-imports.sh` — enforce specific paths

**Audit finding.** Barrel imports (`from 'components/atoms'`) blow up tree-shaking and force Vite to walk the entire atoms folder. The convention is `from 'components/atoms/Button'`. The agent, trained on idiomatic React, defaults to barrels.

**Hook.** `PreToolUse` on `Edit|Write`:

```bash
#!/bin/bash
PAYLOAD=$(cat)
FILE=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // ""')
[[ "$FILE" =~ \.(ts|tsx)$ ]] || exit 0

CONTENT=$(echo "$PAYLOAD" | jq -r '.tool_input.new_string // .tool_input.content // ""')
if echo "$CONTENT" | grep -qE "from ['\"]components/(atoms|molecules|organisms)['\"]"; then
  echo "BLOCKED: No barrel imports. Import from the specific component path, e.g. from 'components/atoms/Button'." >&2
  exit 2
fi
exit 0
```

**What it catches.** Any `from 'components/X'` without a trailing component name. The block message is *specific*: it tells the agent exactly what shape to write instead. Agents respond well to specific corrections, badly to vague ones.

---

### 3. `check-random-uuid.sh` — block a browser-compat foot-gun

**Audit finding.** `crypto.randomUUID()` is in the agent's prior — it's the modern, "correct" way to make a UUID. But the app ships to enterprise customers on older Safari builds in non-HTTPS staging environments where `crypto.randomUUID` is `undefined`. The team uses the `uuid` package universally. This rule is in `.claude/rules/no-random-uuid.md` — the agent reads it sometimes.

**Hook.** `PreToolUse` on `Edit|Write`:

```bash
#!/bin/bash
PAYLOAD=$(cat)
FILE=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // ""')
[[ "$FILE" =~ \.(ts|tsx|js|jsx)$ ]] || exit 0

CONTENT=$(echo "$PAYLOAD" | jq -r '.tool_input.new_string // .tool_input.content // ""')
if echo "$CONTENT" | grep -qE "crypto\.randomUUID\s*\("; then
  echo "BLOCKED: Do not use crypto.randomUUID(). Use \`import { v4 as uuidv4 } from 'uuid'\` instead — randomUUID is unavailable in non-secure contexts and older Safari builds." >&2
  exit 2
fi
exit 0
```

**The shape lesson.** This is the canonical "your codebase has a non-obvious constraint that contradicts what the model learned from public code" hook. Every codebase has 3–5 of these. The agent will never figure them out from grep alone. The hook is how you teach them irreversibly.

---

### 4. `dangerous-bash-guard.sh` — block destructive shell

**Audit finding.** Agents running long, frustrated sessions occasionally reach for `git reset --hard`, `git push --force`, `git commit --no-verify`, or `rm -rf` to "fix" a stuck state. Once in a while, they catch the wrong target.

**Hook.** `PreToolUse` on `Bash`:

```bash
#!/bin/bash
PAYLOAD=$(cat)
CMD=$(echo "$PAYLOAD" | jq -r '.tool_input.command // ""')
[ -z "$CMD" ] && exit 0

block() { echo "BLOCKED: $1" >&2; exit 2; }

if echo "$CMD" | grep -qE '\brm\s+(-[^[:space:];]*[rf][^[:space:];]*|-[^[:space:];]*[fr][^[:space:];]*)\s+(/|\$HOME|~|\.\.?)(\s|$)'; then
  block "rm -rf aimed at a root/home path."
fi

if echo "$CMD" | grep -qE '\bgit\s+push\b[^;]*--force(\s|$)' && ! echo "$CMD" | grep -q -- '--force-with-lease'; then
  block "git push --force forbidden. Use --force-with-lease only after explicit approval."
fi

if echo "$CMD" | grep -qE '\bgit\s+reset\s+--hard\b'; then
  block "git reset --hard discards user work. Require explicit approval."
fi

if echo "$CMD" | grep -qE '\bgit\s+clean\b[^;]*-[^[:space:];]*[fd]'; then
  block "Destructive git clean. Preserve untracked files unless explicitly approved."
fi

if echo "$CMD" | grep -qE '\b(cat|less|more|tail|head|sed|awk|grep|rg)\b[^;]*(^|[[:space:]"'\''])([^[:space:]"'\'';]*/)?\.env([.][[:alnum:]_-]+)?([[:space:]"'\'';]|$)'; then
  block "Direct .env read avoided to keep secrets out of the transcript."
fi

if echo "$CMD" | grep -qE '\bgit\s+(commit|push|merge|rebase)\b[^;]*--no-verify'; then
  block "Skipping git hooks (--no-verify) forbidden unless explicitly requested."
fi

exit 0
```

**What it catches.** Six classes of destructive command. The `.env` reader rule is the underrated one — it stops the agent from `cat .env`-ing your secrets straight into the transcript, where they then live forever in your session history and (if shared) anyone's screenshare.

**The pattern lesson.** A Bash guard is one script with six grep branches, not six separate hook scripts. The matcher fires the script; the script's job is to triage. Splitting these into separate hooks would just be more JSON to maintain.

---

### 5. `generated-file-guard.sh` — don't hand-edit generated artefacts

**Audit finding.** Agents trying to "fix the type error" sometimes edit `*.gen.ts` files directly instead of the source schema. Or edit `dist/`. Or, once memorably, edit `node_modules/`.

**Hook.** `PreToolUse` on `Edit|Write`:

```bash
#!/bin/bash
PAYLOAD=$(cat)
FILE=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // .tool_input.path // ""')
[ -z "$FILE" ] && exit 0

block_patterns=(
  '(^|/)dist/'
  '(^|/)build/'
  '(^|/)coverage/'
  '(^|/)node_modules/'
  '(^|/)\.turbo/'
  '(^|/)\.vite/'
  '\.gen\.ts$'
)

for p in "${block_patterns[@]}"; do
  if echo "$FILE" | grep -qE "$p"; then
    echo "BLOCKED: $FILE is a generated/disposable artefact. Regenerate via the appropriate command rather than hand-editing." >&2
    exit 2
  fi
done

if echo "$FILE" | grep -qE '(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$'; then
  echo "NOTE: Lockfile edit detected ($FILE). Continue only if the dependency change is intentional." >&2
fi

exit 0
```

**The two-tier lesson.** Generated dirs are *blocked* (`exit 2`). Lockfiles are *warned* (`stderr`, `exit 0`) — sometimes you really do mean to edit them, so blocking is too strict. The two-tier pattern (block vs warn) is the same script structure with a different exit code.

---

### 6. `auto-format.sh` — format on write

**Audit finding.** Half the agent's PRs had Prettier-only diffs at the bottom — a sign the agent's output wasn't running through Prettier locally. This is a 10-line fix.

**Hook.** `PostToolUse` on `Edit|Write`:

```bash
#!/bin/bash
PAYLOAD=$(cat)
FILE=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // ""')
[[ "$FILE" =~ \.(ts|tsx)$ ]] || exit 0
[ -f "$FILE" ] || exit 0
npx prettier --write "$FILE" 2>/dev/null
exit 0
```

**Why it's tiny.** No need to block, no need to inform the agent. The file is already written; we just clean it. The `2>/dev/null` swallows Prettier's output — if formatting fails, the file is still saved and the agent can keep going.

---

### 7. `validation-stop-check.sh` — pre-handoff reminder

**Audit finding.** The agent declares "I'm done" while typecheck is failing, or while it's added 3 new components without sibling tests. The team has a `*.test.tsx` rule in CLAUDE.md; the agent forgets it on long sessions.

**Hook.** `Stop`:

```bash
#!/bin/bash
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

mapfile -t CHANGED < <(
  {
    git diff --name-only 2>/dev/null
    git diff --cached --name-only 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | sort -u
)

[ ${#CHANGED[@]} -eq 0 ] && exit 0

src_changed=0; test_changed=0; src_without_test=()
for f in "${CHANGED[@]}"; do
  case "$f" in
    src/*.test.ts|src/*.test.tsx|src/*.spec.ts|src/*.spec.tsx) test_changed=1 ;;
    src/*.ts|src/*.tsx)
      src_changed=1
      base="${f%.tsx}"; base="${base%.ts}"
      if [ ! -f "${base}.test.ts" ] && [ ! -f "${base}.test.tsx" ]; then
        src_without_test+=("$f")
      fi ;;
  esac
done

reminders=()
[ "$src_changed" -eq 1 ] && reminders+=("• Run \`npm run typecheck\` and \`npm test\` before handoff.")
if [ ${#src_without_test[@]} -gt 0 ] && [ "$test_changed" -eq 0 ]; then
  reminders+=("• ${#src_without_test[@]} source file(s) changed without a matching test file.")
  for f in "${src_without_test[@]:0:10}"; do reminders+=("    - $f"); done
fi

[ ${#reminders[@]} -eq 0 ] && exit 0

msg=$'Pre-handoff validation reminders:\n'
for r in "${reminders[@]}"; do msg+="$r"$'\n'; done
jq -n --arg m "$msg" '{systemMessage:$m}'
exit 0
```

**The lesson on Stop hooks.** A Stop hook can't *force* the agent to fix anything — the turn is over. But it can surface the issue at exactly the moment the agent is asking "am I done?" In practice the agent reads the reminder and runs the fix ~85% of the time. The `systemMessage` JSON envelope is the right shape — it gets rendered as a system reminder on the agent's next turn.

---

### 8. `secrets-scan.sh` — last-chance secrets check

**Audit finding.** Twice, an agent committed a `.env`-style line into a code file while debugging ("let me hardcode this just to test"). Twice it shipped to a feature branch before review caught it. Never to main, but the pattern needed a guard.

**Hook.** `Stop`:

```bash
#!/bin/bash
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

DIFF=$(git diff --unified=0 --no-ext-diff -- . 2>/dev/null)
DIFF+=$'\n'$(git diff --cached --unified=0 --no-ext-diff -- . 2>/dev/null)
# (untracked file scan elided for brevity; see the repo)

ADDED=$(echo "$DIFF" | grep -E '^\+' | grep -vE '^\+\+\+')
FILTERED=$(echo "$ADDED" | grep -vEi 'your-(api-)?key|example|placeholder|process\.env|import\.meta\.env')

PATTERNS=(
  '-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----'
  '\bsk-(proj-)?[A-Za-z0-9_-]{32,}\b'
  '\bsk-ant-[A-Za-z0-9_-]{32,}\b'
  '\bgh[pousr]_[A-Za-z0-9_]{30,}\b'
  '\bAKIA[0-9A-Z]{16}\b'
  '(api[_-]?key|secret|token|password)[[:space:]]*[:=][[:space:]]*['\''"]?[A-Za-z0-9_./+=:@-]{20,}'
)

HITS=""
for p in "${PATTERNS[@]}"; do
  m=$(echo "$FILTERED" | grep -E -i -e "$p")
  [ -n "$m" ] && HITS+="$m"$'\n'
done

[ -z "$HITS" ] && exit 0

msg=$'Possible secret material in changed lines (review and rotate if real):\n'
msg+="$(echo "$HITS" | awk 'NF && !seen[$0]++' | head -10)"
jq -n --arg m "$msg" '{systemMessage:$m}'
exit 0
```

**Why this lives in Stop, not PreToolUse.** A `PreToolUse` secrets check would have to scan *every* edit, even small ones. Most of those are clean — high cost, low yield. The Stop hook scans the accumulated diff once, at the end, when it actually matters.

**The filtering pattern.** The `FILTERED` step strips out lines containing `process.env`, `import.meta.env`, `your-api-key`, `placeholder`, etc. — the false-positives. Without that filter, every documentation example trips the regex and the warning becomes noise the agent learns to ignore.

---

## The combined `.claude/hooks/` directory

```
.claude/hooks/
├── session-start-reminder.sh      ← SessionStart   (see previous post)
├── check-deprecated-imports.sh    ← PreToolUse Edit|Write
├── check-barrel-imports.sh        ← PreToolUse Edit|Write
├── check-random-uuid.sh           ← PreToolUse Edit|Write
├── dangerous-bash-guard.sh        ← PreToolUse Bash
├── generated-file-guard.sh        ← PreToolUse Edit|Write
├── auto-format.sh                 ← PostToolUse Edit|Write
├── validation-stop-check.sh       ← Stop
└── secrets-scan.sh                ← Stop
```

Nine scripts. ~250 lines of shell, total. Each one ties back to a specific audit finding and a specific recurring violation. None of them block legitimately good work; all of them block specific known-bad patterns.

---

## The audit-to-hook flow in practice

The mechanical version, if you're starting from scratch:

1. **Run an audit.** Use the agent itself — ask it to review the last 20 PRs and surface recurring corrections. (Or the `code-reviewer` subagent if you have one.) Cluster by theme.
2. **Triage.** For each finding: is it mechanically detectable? If yes, candidate for a hook. If it requires judgement, candidate for a subagent or a checklist.
3. **Add the rule to CLAUDE.md first.** Hooks are the enforcement layer, not the documentation layer. If the rule isn't written down, the hook block message will land on an agent that doesn't know *why* it's wrong.
4. **Write the hook.** 10–30 lines. Same template: read payload, extract field, grep, exit. Use one of the eight above as a starting point.
5. **Test it.** Pipe a fake payload into the script and check `$?`. Do this *before* wiring it into `settings.json`.
6. **Wire it.** Add to `.claude/settings.json` under the right event + matcher. Commit.
7. **Watch.** Over the next 1–2 weeks, the hook should fire a handful of times. If it never fires, the rule was already being followed and the hook is wasted lines. If it fires constantly, the rule itself might be wrong.

---

## Three failure modes to watch for

**Hooks that fire too often.** A hook firing 20 times a day is a hook telling you the rule is wrong, or the agent has no path to comply. Either fix the rule or give the agent a working alternative in the block message ("use X instead").

**Hooks that produce noise the agent ignores.** Especially common with Stop-hook warnings. If the message is generic enough, the agent acknowledges it and moves on without action. Make warnings specific (file paths, counts) and the agent responds.

**Hooks that block legitimate work.** A guard against `crypto.randomUUID` is great until the agent is editing a Node.js script that doesn't ship to browsers. Scope the guard tightly — by file path, by directory, by extension — or accept the occasional false positive as cheaper than the loophole.

---

## What's next in the series

The next two posts in this series go after the layers *above* hooks:

- **Subagents that catch what hooks can't** — code review, architecture compliance, the judgement calls.
- **Commands and skills as the user-facing surface** — thin command wrappers (`/create-module`, `/migrate-table`) that delegate to detailed skills encoding workflows.

Hooks are enforcement. Subagents are review. Skills are user-facing entry points. Together they're the spine of an agent-ready repo.

---

## Closing thought

The hook system is the cheapest enforcement layer in a Claude-driven repo. It doesn't replace `CLAUDE.md` (which explains the *why*) or path-scoped rules (which scope guidance). It catches the gap between rule-stated and rule-followed.

Eight hooks. ~250 lines of shell. Every audit finding that survived being-written-down gets one. The repo that started with an open-ended drift problem ends with a deterministic refusal at write-time, every time, with the explanation right there in the block message.

If you're new to the team and inheriting a setup like this, that's the mental model: each hook script is a fossil of a specific drift that someone got tired of correcting in PR review. Read the block messages. Each one tells you something about the codebase that isn't written anywhere else.
