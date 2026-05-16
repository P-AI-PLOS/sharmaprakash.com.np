---
draft: true
title: "The Two Configuration Layers Every AI Developer Needs"
date: "2026-04-08T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Global rules that follow you everywhere. Project rules that stay with the code. Getting these two layers right is the single highest-leverage thing you can do before your first agentic session."
cover: "/images/blog/ai/two-configuration-layers-ai-developer.png"
thumb: "/images/blog/ai/two-configuration-layers-ai-developer.png"
last_modified_at: "2026-04-08T10:00:00+05:45"
use_featured_image: true
series: ai-coding-setup
seriesOrder: 1
---

> **Series note:** This series is a prerequisite for [Agent-Ready React](/ai/2026-05-07-why-legacy-react-confuses-ai-agents/) and [The Parallel Developer](/ai/2026-04-13-why-agentic-coding/) series. If you're starting from scratch, you're in the right place.

You spend a week configuring Claude Code on project A. Stack overview, conventions, the "never do X" list, pointers to your design system. The agent starts producing consistent, on-pattern code. You feel the difference.

Week two. You clone project B — a different client, a different stack. First session. The agent doesn't know your name, doesn't know your preferred package manager, doesn't know that you've agreed with yourself to never use barrel imports. You're back to correcting the basics. That disorientation is fixable, and the fix costs less than an hour.

The problem is almost always the same: everything you configured lived in `.claude/CLAUDE.md` inside project A's repo. When you moved to project B, none of it came with you. You had one layer when you needed two.

---

## The two layers

AI coding tools — Claude Code specifically, but the pattern holds across Cursor, Windsurf, and Aider — read configuration from two places:

1. **A global layer** at `~/.claude/` on your machine. Always loaded. Never shared with teammates. Follows you across every project.
2. **A project layer** at `.claude/` (or `CLAUDE.md`) in your repository root. Loaded only for that project. Committed to git and shared with your team.

That's the whole architecture. Everything else is a detail about what goes where.

---

## The full map

| Layer | Location | Committed to git? | Scope |
|-------|----------|-------------------|-------|
| Global rules | `~/.claude/CLAUDE.md` | No | Every project on this machine |
| Global settings | `~/.claude/settings.json` | No | Permissions, theme, model defaults |
| Global memory | `~/.claude/memory/` | No | Persistent facts across sessions |
| Project rules | `.claude/CLAUDE.md` or `CLAUDE.md` | Yes | This repo only |
| Project settings | `.claude/settings.json` | Yes | Team-shared permissions |
| Local overrides | `.claude/settings.local.json` | No (gitignored) | Personal overrides, secret keys |
| Project rules (layered) | `.claude/rules/*.md` | Yes | Layered, topic-specific |

The loading order is: **global → project → rules/\*.md**. Later layers override earlier ones. If your global `CLAUDE.md` says "prefer pnpm" and the project `CLAUDE.md` says "use npm", the project wins for that session.

---

## What belongs in the global layer

The global layer is for **you as a developer** — things that are true regardless of what you're working on.

**`~/.claude/CLAUDE.md`** should contain:

- Your identity. Name, email, GitHub handle. Agents use this for commit messages, PR descriptions, file headers.
- Your tool defaults. Preferred package manager, preferred test runner, shell preferences.
- Personal style rules. How you like commit messages structured. How much verbosity you want in explanations.
- Cross-project conventions you've committed to personally. "I always use named exports." "I don't use `console.log` in application code."
- Pointers to your personal reference docs, if any. I keep a `~/cli-tools.md` that tracks my tool inventory — the global `CLAUDE.md` points there.

**`~/.claude/settings.json`** should contain:

- The model tier you default to globally. You might use `claude-sonnet-4-5` for exploratory work and override to Opus only for specific tasks.
- Tools you trust globally — `Read(*)` for file reading, `Bash(git log *)` for git inspection. These are the reads and low-risk commands you don't want to approve every session.
- Your preferred theme and keybindings.

**`~/.claude/memory/`** is where Claude Code persists facts it learns about you across sessions. You can also write files here directly — brief notes you want the agent to remember.

---

## What belongs in the project layer

The project layer is for **the codebase and the team** — things that are true for this repository, for everyone working in it.

**`.claude/CLAUDE.md` or `CLAUDE.md`** at the repo root should contain:

- Stack overview. Languages, frameworks, package manager, minimum Node/Python/Ruby version. Ten lines maximum.
- Where things live. Key directories and their purpose. Not exhaustive — just the ones a new agent would get wrong.
- The most important conventions. The five to ten "always/never" decisions the team has locked in. No exceptions, no "it depends."
- A "before you touch X, read Y" reference table. This is the highest-value section in most rules files. Point at `design.md`, `MIGRATIONS.md`, `architecture.md` — the detailed documents that would bloat `CLAUDE.md` if included directly.
- Things to NOT do. Short, opinionated. Enforced by tooling where possible.

**`.claude/settings.json`** (committed) should contain permissions the whole team needs. `Bash(npm run *)`, `Bash(pnpm *)`, `Bash(git status)`. This is what stops your teammate from getting 40 permission prompts in their first session. More on this in [Post 4 of this series](/ai/2026-04-11-project-settings-permissions-team-sharing/).

**`.claude/settings.local.json`** (gitignored) is where personal overrides live. API keys, personal model preferences that differ from the team default, anything that shouldn't land in the repo.

---

## The rules/\*.md layer

Long rules files fail. Context windows get saturated. Rules contradict each other at length. The fix isn't to write better long rules — it's to write shorter `CLAUDE.md` files backed by topic-specific deeper files.

The `.claude/rules/` directory is for exactly this. Each file covers one concern in depth so `CLAUDE.md` can stay short:

```
.claude/rules/
├── git-workflow.md       ← branch naming, commit conventions, PR process
├── testing.md            ← test framework, coverage expectations, naming
├── architecture.md       ← module boundaries, import rules, folder structure
└── task-management.md    ← how tasks are tracked, beads workflow if used
```

The agent loads these files when relevant. `CLAUDE.md` references them with a single line: "For git conventions, see `.claude/rules/git-workflow.md`." The main file stays under 200 lines. The deep rules are always reachable.

This layering is the same reason you split a large component into smaller focused ones — not for the reader's sake alone, but because it forces clearer separation of concerns.

---

## The common mistakes

**Putting team context in `~/.claude/`.** Your teammates won't have your global layer. Any project convention that lives only there is invisible to everyone else — and to you when you're working on a machine you don't own.

**Putting personal preferences in `.claude/CLAUDE.md`.** Everyone who clones the repo inherits them. If your personal style preference is contested in the team, it'll create friction. Keep the team file to decisions the team has actually agreed on.

**One flat `CLAUDE.md` for everything.** Putting architecture docs, testing conventions, git workflow, and design system rules all in a single file creates a 1,000-line context vacuum. Use the `rules/*.md` layer.

**No global layer at all.** The most common mistake. Most developers configure only the project layer and start from scratch on every new repo.

---

## Your first 15 minutes

If you've never set up a global `CLAUDE.md`, here's what to write right now:

```markdown
# Global agent context — Prakash Poudel

## Identity
Name: Prakash Poudel
Email: your@email.com
GitHub: your-handle

## Tool preferences
- Package manager: pnpm (prefer over npm/yarn)
- Shell: zsh
- Node: always use the version in .nvmrc or mise config if present

## Style defaults
- Commit format: conventional commits (feat:, fix:, chore:, docs:)
- Prefer named exports over default exports
- No console.log in application code
- Comments explain why, not what

## What to do on ambiguity
Ask once, then proceed. I prefer a decision over a question.
```

That's it. Twenty lines. The agent now knows who you are and how you like to work, on every project, from the first session.

The rest — project-specific context, team permissions, topic-specific rules — goes into the project layer. Building that out well is what the rest of this series is about. See [The Agentic Developer's Field Guide](/ai/2026-04-07-agentic-developer-field-guide/) for the broader picture of how these configuration layers fit into a full agentic workflow.

---

## Coming next

[Writing CLAUDE.md That Agents Actually Follow](/ai/2026-04-09-writing-claude-md-agents-follow/) — why long rules files make agents less consistent, and the structure that actually works. We'll walk through a before/after on a bloated rules file and show how the `rules/*.md` layering keeps things sane.
