---
draft: false
title: "Project Settings, Permissions, and Team Sharing"
date: "2026-04-11T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "What your team shares, what stays personal, and how to stop the 'Claude asked me to approve running npm install' prompts that break every flow."
cover: "/images/blog/ai/project-settings-permissions-team-sharing.png"
thumb: "/images/blog/ai/project-settings-permissions-team-sharing.png"
last_modified_at: "2026-04-11T10:00:00+05:45"
use_featured_image: true
series: ai-coding-setup
seriesOrder: 4
---

Your teammate cloned the repo, opened Claude Code, asked it to run the dev server, and got a permission prompt. Then another for `git status`. Then another for reading a file. Then another for running the type-check. Forty prompts into the first session, they turned it off and went back to their previous workflow.

The tool wasn't the problem. The configuration was. Specifically, the absence of it. Permission prompts are the price of not having a committed `.claude/settings.json` in the repository. Adding one is the highest-leverage five minutes in a team's Claude Code setup.

---

## The three files and their roles

Claude Code resolves permissions from three settings files, in order:

**`~/.claude/settings.json`** — global, your machine only, never in git. Cross-project defaults. The tools you trust unconditionally across every project you work in.

**`.claude/settings.json`** — project-scoped, committed to git, shared with the team. The tools the whole team has agreed are safe to run without approval in this specific repo.

**`.claude/settings.local.json`** — project-scoped, gitignored, personal. Your personal overrides on top of the team's defaults. API keys, model preferences that differ from the team, local tool paths.

The resolution order is global → project → local. A permission denied in the global file can be allowed in the project file. A permission not in the project file can be added locally without touching the shared config.

---

## The committed settings.json

This is the file that solves the onboarding problem. When a new developer clones the repo and opens Claude Code, this file is already there. The permissions are already granted. Zero setup required.

Here's a reasonable starting point for a TypeScript/Node project:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(pnpm *)",
      "Bash(npx *)",
      "Bash(git log *)",
      "Bash(git diff *)",
      "Bash(git status)",
      "Bash(git branch *)",
      "Bash(git show *)",
      "Bash(cat *)",
      "Bash(ls *)",
      "Bash(find . *)",
      "Bash(echo *)",
      "Read(*)"
    ],
    "deny": []
  },
  "model": "claude-sonnet-4-5"
}
```

The `Read(*)` permission grants reading any file without approval. This is almost always safe — the agent reading your code is not a security concern.

The `Bash(pnpm *)` pattern allows any pnpm command. `Bash(git log *)` allows any `git log` invocation. The `*` is a glob that matches any arguments.

**Note on the model field:** Setting `"model"` in the project settings file gives the whole team a consistent default. Everyone runs on the same tier. Individuals can override in their `settings.local.json`.

---

## What to put in the project allow list

**Safe to allow in the project file (everyone on the team needs these):**

- `Read(*)` — reading files
- `Bash(pnpm *)` / `Bash(npm run *)` — running scripts from package.json
- `Bash(git log *)`, `Bash(git diff *)`, `Bash(git status)`, `Bash(git branch *)` — read-only git commands
- `Bash(ls *)`, `Bash(cat *)`, `Bash(find . *)` — filesystem reads
- `Bash(echo *)` — printing to stdout (hooks use this constantly)
- Any project-specific read-only tool your team uses: `Bash(pnpm run typecheck)`, `Bash(pnpm test *)`

**Leave out of the project file (too broad or project-specific):**

- `Bash(*)` — too broad, this grants everything including destructive commands
- `Bash(rm *)` — destructive, should require approval
- `Bash(git push *)` — should require explicit approval per session
- `Bash(git reset *)`, `Bash(git rebase *)` — high-consequence, always prompt
- Any command that touches external services or credentials

The pattern is: read-only operations are safe to allow. Writes to the filesystem (via Bash, not the Write tool) should be reviewed. Irreversible operations always prompt.

---

## The gitignore entry

The `settings.local.json` file must be gitignored. If it isn't, someone will accidentally commit an API key. Add this to your project's `.gitignore` before doing anything else:

```
.claude/settings.local.json
```

Check your `.gitignore` now. If it's not there, add it before you add any personal configuration.

---

## What goes in settings.local.json

Personal overrides that shouldn't land in the repo:

```json
{
  "permissions": {
    "allow": [
      "Bash(gh *)",
      "Bash(open *)"
    ]
  },
  "model": "claude-opus-4-5",
  "theme": "dark"
}
```

This developer prefers the `gh` CLI (GitHub CLI) and needs to open files in their local editor — tools that might not be installed on everyone's machine. They also prefer Opus when the team default is Sonnet. None of this is the team's business.

Also appropriate in `settings.local.json`: any tool that requires authentication your teammates won't have, paths to local binaries, personal key bindings, development-only flags.

---

## The global settings.json

Your `~/.claude/settings.json` is for permissions that are true regardless of project. Tools you trust unconditionally:

```json
{
  "permissions": {
    "allow": [
      "Read(*)",
      "Bash(git log *)",
      "Bash(git diff *)",
      "Bash(git status)",
      "Bash(git branch *)",
      "Bash(ls *)",
      "Bash(find . *)",
      "Bash(cat *)",
      "Bash(echo *)",
      "Bash(which *)",
      "Bash(mise *)",
      "Bash(node --version)",
      "Bash(pnpm --version)"
    ]
  }
}
```

The global file covers read-only patterns that you want to allow without thinking about them, on any project, forever. Don't put project-specific commands here — that defeats the purpose of the project layer.

---

## The common mistake: Bash(\*)

Almost everyone who wants to reduce permission prompts tries `"Bash(*)"` first. It works. It also grants the agent permission to run any command without asking — including `rm -rf`, `git reset --hard HEAD~10`, `curl ... | bash`.

The Claude Code model is trustworthy. But it makes mistakes. A misread intent, an incorrectly scoped task, a misunderstood `--all` flag — these happen. The permission prompt for destructive operations is the last line of defense. Keep it.

The pattern-based allow list takes five more minutes to write and costs you nothing in day-to-day usage. Write the specific patterns.

---

## Hooks and settings in the same file

The `settings.json` file holds both permissions and hooks. You don't need separate files. A complete project settings file with both looks like:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm *)",
      "Bash(git log *)",
      "Bash(git diff *)",
      "Bash(git status)",
      "Bash(git branch *)",
      "Bash(ls *)",
      "Bash(find . *)",
      "Read(*)"
    ]
  },
  "model": "claude-sonnet-4-5",
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo \"Branch: $(git branch --show-current)\" && git log --oneline -3 && cat .claude/context.md 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

One file. Committed. The whole team gets the permissions and the session-start hook automatically.

---

## The onboarding flow after this is set up

1. Developer clones the repo.
2. Opens Claude Code.
3. Starts a session.
4. The session-start hook fires, prints branch and context.
5. The agent runs `pnpm install` — approved automatically.
6. The agent reads files — approved automatically.
7. The agent runs `pnpm run typecheck` — approved automatically.
8. The agent tries `git push` — prompts for approval, as expected.

Zero permission prompts for the routine work. One prompt for the action that deserves human attention. This is the experience that makes the team keep using the tool.

---

## Coming next

[Not on Claude? The Cross-Tool Configuration Guide](/ai/2026-04-12-cross-tool-configuration-guide/) — how the same concepts map to Cursor, GitHub Copilot, Windsurf, and Aider, with a table covering every major tool, plus the Windows and Linux paths that differ from macOS.
