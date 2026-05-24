---
draft: false
title: "Not on Claude? The Cross-Tool Configuration Guide"
date: "2026-04-12T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "The concepts in this series aren't Claude-specific. Every major AI coding tool has a configuration layer. Here's how they map — and what Windows and Linux users need to know."
cover: "/images/blog/ai/cross-tool-configuration-guide.png"
thumb: "/images/blog/ai/cross-tool-configuration-guide.png"
last_modified_at: "2026-04-12T10:00:00+05:45"
use_featured_image: true
series: ai-coding-setup
seriesOrder: 5
---

Everything in this series — layered context, short focused rules, session-start hooks, team-shared permissions — is tool-agnostic. The file names differ. The JSON keys differ. The underlying architecture is identical: a global layer for personal preferences, a project layer for the codebase and team, a local override layer for personal secrets.

If you're on Cursor, Windsurf, GitHub Copilot, or Aider, this post maps the concepts directly. If you're on macOS already running Claude Code, skim the Windows and Linux sections for the edge cases your teammates will hit.

---

## The concept-to-tool mapping

| Concept | Claude Code | Cursor | GitHub Copilot | Windsurf | Aider |
|---------|-------------|--------|----------------|----------|-------|
| Project rules | `CLAUDE.md` / `.claude/rules/*.md` | `.cursor/rules/*.mdc` | `.github/copilot-instructions.md` | `.windsurfrules` | `CONVENTIONS.md` |
| Global rules | `~/.claude/CLAUDE.md` | Cursor Settings › Rules for AI | GitHub account settings | Windsurf global settings | `~/.aider.conf.yml` |
| Team permissions | `.claude/settings.json` | N/A (trust model) | N/A | N/A | CLI flags |
| Personal overrides | `.claude/settings.local.json` | N/A | N/A | N/A | Per-directory `.aider.conf.yml` |
| Session-start hooks | `settings.json` hooks | N/A | N/A | N/A | N/A |
| Post-write hooks | `settings.json` PostToolUse | N/A | N/A | N/A | `--pre-commit` (pre-commit, not post-write) |
| Persistent memory | `~/.claude/memory/` | N/A | N/A | N/A | N/A |

The gaps in the Cursor, Copilot, Windsurf, and Aider columns aren't permanent absences — they reflect the current state of each tool's configuration surface. Hooks and granular permissions are Claude Code-specific today; the other tools handle safety through different means (sandboxed environments, trust scores, human-in-the-loop chat).

---

## Cursor

Cursor's rules system lives in `.cursor/rules/`. Each file is a `.mdc` file — Markdown with optional YAML frontmatter that controls when the rule applies.

```
.cursor/rules/
├── agent-defaults.mdc       # applies everywhere (no frontmatter filter)
├── components.mdc           # attaches when editing src/components/**
├── testing.mdc              # attaches when editing *.test.tsx
└── git-workflow.mdc         # attaches on commit messages
```

The frontmatter that scopes a rule to a glob:

```yaml
---
globs: src/components/**
---
```

Without a `globs` field, the rule applies everywhere. This is the equivalent of Claude Code's `.claude/rules/*.md` layering — topic-specific files that load only when relevant.

**Global rules** live in Cursor Settings › General › Rules for AI. This is the equivalent of `~/.claude/CLAUDE.md` — it applies across every project you open in Cursor.

**Recommended lengths:** Individual rule files work best under 80 lines. The total rule budget Cursor loads per session is finite; once you exceed roughly 10,000 tokens of rules, the model's quality degrades in the same way it does with a long `CLAUDE.md`.

**Format:** Plain Markdown works. You don't need the YAML frontmatter unless you're scoping to a glob. Bullet points and tables are understood.

---

## GitHub Copilot

Copilot's project-level instruction file is `.github/copilot-instructions.md`. It's read by Copilot Chat and by the Copilot agent in VS Code and GitHub.com.

This file doesn't support glob-scoping or topic-splitting. It's a single flat Markdown file. The same discipline applies: keep it short, one canonical answer per question, reference external docs rather than including them inline.

```markdown
# Copilot instructions

## Stack
TypeScript 5 · React 19 · Next.js 15 · Tailwind v3 · pnpm

## Conventions
- Named exports only
- Co-locate tests: Component.test.tsx next to Component.tsx
- No barrel imports
- Server logic stays in src/server/ — no fetch() in components

## Do not
- Add framer-motion. Use CSS keyframes.
- Create default exports in src/
```

**Global instructions** are in GitHub account settings › Copilot › Personal instructions. There's no file equivalent — it's UI only.

**No hooks equivalent.** Copilot doesn't have lifecycle hooks. Orientation context (branch, current task) has to come from your prompt each session, or from a well-maintained `copilot-instructions.md` "current focus" section you keep updated manually.

---

## Windsurf

Windsurf reads `.windsurfrules` at the repository root — a single Markdown file, similar in role to `CLAUDE.md`.

The same principles apply: short, opinionated, one canonical answer per question. Windsurf doesn't yet have a multi-file rules layering system equivalent to `.cursor/rules/` or `.claude/rules/*.md`, so the "reference external docs" pattern is more important. Instead of expanding detail in rules sub-files, point at your architecture docs and design docs by path.

**Global rules** live in Windsurf's settings UI. No file-based global equivalent as of this writing.

---

## Aider

Aider is the most configuration-file-first of the group. It reads from multiple sources in priority order:

1. `~/.aider.conf.yml` — global, applies to every project
2. `.aider.conf.yml` in the project root — project-scoped
3. Command-line flags — session-scoped overrides

The `.aider.conf.yml` format is YAML, not Markdown:

```yaml
# .aider.conf.yml
model: claude-sonnet-4-5
auto-commits: false
dark-mode: true
test-cmd: pnpm test
lint-cmd: pnpm run lint
```

For rules-file behaviour, Aider reads `CONVENTIONS.md` (or any file you pass with `--read`). This is closest to `CLAUDE.md` — a Markdown file of conventions the agent references when writing code.

**Hooks equivalent:** Aider has `--pre-commit` which runs a command before every commit it makes. This is not a session-start hook — it's a commit-gate. For orientation context, update `CONVENTIONS.md` with a "Current focus" section or pass a context file with `--read .claude/context.md` at session start.

---

## The AGENTS.md convention

`AGENTS.md` at the repository root is a newer convention, initially popularised by OpenAI's Codex and increasingly recognised by Hermes and other agent runtimes. If your tool doesn't have a specifically named config file, `AGENTS.md` is the emerging neutral ground.

The format is the same as `CLAUDE.md`. The five-section structure from [Writing CLAUDE.md That Agents Actually Follow](/ai/2026-04-09-writing-claude-md-agents-follow/) applies identically: stack overview, where things live, conventions, before-you-touch-read-this table, and what not to do.

Some teams maintain both `CLAUDE.md` and `AGENTS.md` as symlinks to the same file. This is valid and avoids duplication when multiple tools are in use on the same codebase.

---

## Windows notes

**File paths in hooks:** In `.claude/settings.json` hook commands, use forward slashes. Claude Code on Windows (running via WSL2 or Git Bash) handles forward-slash paths correctly in hook commands. Native PowerShell paths with backslashes can fail silently.

**The `~/.claude/` directory:** On Windows, the global configuration lives at `C:\Users\<username>\.claude\`. In PowerShell, `~` resolves to `$env:USERPROFILE`, which maps to the same location. If you're in WSL2, the Linux home (`/home/<username>/.claude/`) is a separate location from the Windows home — keep your global config in whichever environment you run Claude Code from.

**Hook commands on Windows:** Commands in hook JSON run via the configured shell. If you're running Claude Code in PowerShell, hook commands that use `cat`, `echo`, or `&&` will fail. Options:

1. Run Claude Code via WSL2 (recommended — full bash hook support)
2. Prefix hook commands with `cmd /c ` for CMD-compatible syntax
3. Use `powershell -Command "..."` for PowerShell commands

WSL2 is the lowest-friction path. Hooks written with bash syntax work unmodified.

**Credentials:** No Keychain on Windows. Store credentials in `.env` files (gitignored) or Windows Credential Manager, and reference them as environment variables (`$MY_API_KEY`) in hook commands. Never put credentials in `settings.json`.

---

## Linux notes

Minimal differences from macOS. The `~/.claude/` directory works identically. Bash hooks work without modification. The one difference: no macOS Keychain. Same solution as Windows — `.env` files and environment variables.

File permissions: ensure `.claude/` directory and files are `700`/`600` if you store any sensitive configuration, though no credentials should live there in the first place.

---

## The universal principles

The tool names change. These don't:

**Short rules beat long rules.** Every tool has a context limit. Every context limit degrades quality at saturation. The discipline of keeping rules files under 200 lines is tool-agnostic.

**Code must match rules.** If the codebase has fifty default exports and the rules file says "named exports only," the rule has no enforcement and the agent will drift. Fix the codebase first. Then the rule is just a reminder of what's already true.

**One canonical answer per question.** Two valid patterns in a codebase means two competing examples. The agent picks one. Usually the wrong one. Eliminate the ambiguity at the source.

**Reference, don't include.** Long documentation belongs in dedicated docs files, not in the rules file. Point at them. Let the agent load them when relevant.

**Invest once, benefit every session.** A well-configured `.claude/settings.json` with the right permissions and a session-start hook is configured in under an hour. Every session from that point forward starts with a correctly oriented agent that doesn't ask for routine approvals. The investment compounds.

---

## Where to go from here

This series covered the foundation: the two configuration layers, writing rules that agents follow, hooks that orient every session, permissions that onboard teammates without friction, and how the concepts translate across the tool ecosystem.

Two places to go next:

**[The Parallel Developer series](/ai/2026-04-13-why-agentic-coding/)** — once your environment is configured, the next unlock is running multiple features in flight simultaneously using git worktrees, OpenSpec, and Beads. The configuration you've set up here is a prerequisite for that workflow.

**[Agent-Ready React](/ai/2026-05-07-why-legacy-react-confuses-ai-agents/)** — if you're working in a React codebase, this series covers the codebase-shaping work that makes the configuration layer actually effective. Rules files are the last step; this series covers the first two.

The configuration you've built this week will outlast every model update and every tool version bump. The principles don't change. The files do.
