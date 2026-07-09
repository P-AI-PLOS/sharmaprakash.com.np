# AGENTS.md

> If you're an agent about to touch this codebase: start here.
> Visual decisions → [`design.md`](./design.md).
> Task recipes ("how do I add a blog post / image / page?") → [`docs/agents/recipes.md`](./docs/agents/recipes.md).
> Podcast production (NotebookLM / ElevenLabs paths) → [`docs/agents/podcast.md`](./docs/agents/podcast.md) + [`podcast/README.md`](./podcast/README.md).
> Parallel cmux fan-out → [`docs/agents/cmux.md`](./docs/agents/cmux.md).

## What this is

Personal site of Prakash Poudel Sharma — static Astro 6.3 build, deployed as
plain HTML. Live: https://sharmaprakash.com.np/

## Stack

Astro 6.3 (static, View Transitions) · Tailwind v4 (tokens in `src/styles/tokens.css`) ·
React 19.2 (icon islands only) · MDX 5 · Swiper 12 · Shiki 4 + rehype-pretty-code ·
Pagefind 1.5 · Satori/resvg for OG · TypeScript 6. Package manager **pnpm**, Node ≥ 20.
Versions live in `package.json` — don't duplicate them here.

## Commands

```sh
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # -> dist/
pnpm preview
pnpm check     # astro check (TS)
```

`.env` (optional): `WEBSITE_URL=https://sharmaprakash.com.np/`

## Where things live

```
src/
├── pages/         # routes: URL = file path. [...slug].astro = posts.
├── layouts/       # SiteShell.astro is the only layout.
├── components/    # chrome/ marketing/ blog/ motion/ — domain-namespaced.
├── content/posts/ # 73 markdown posts. Schema in src/content.config.ts.
├── data/          # typed content modules (site, reviews, resume, portfolios, now, series)
├── styles/        # tokens.css (source of truth), globals.scss, interactions.css
└── utils/         # index.ts, posts.ts (URL/thumbnail/filters)
```

## Conventions

**Naming.** `PascalCase.astro`, intent-named, no version suffixes. New components go
under `chrome/ | marketing/ | blog/ | motion/`; add a new namespace for new categories.

**Tokens.** Never hardcode colors or px spacing. Use Tailwind utilities wired to
`--*` variables, or `var(--accent-600)` directly. New token → add to `tokens.css`
and update `design.md` in the same commit.

**Motion.** Wrap fade-ins with `<ScrollReveal delay={i * 80}>`. Durations/easings
come from `--dur-*` / `--ease-*`. Respect `prefers-reduced-motion`.

**URLs are locked** (`/blog/page/N/`, `/category/.../`, post URLs). Rename files
freely, never change route paths — they're indexed.

## Things to NOT do

- No CSS-in-JS, no runtime UI framework, no `framer-motion`.
- React is for icon islands only.
- No second style system (`styled-components`, UnoCSS, …).
- Don't break post URL shape (`/[directory]/[slug]/` or `/[slug]/`).

## Pointers

- Visual decisions → [`design.md`](./design.md)
- Task recipes → [`docs/agents/recipes.md`](./docs/agents/recipes.md)
- Parallel cmux fan-out → [`docs/agents/cmux.md`](./docs/agents/cmux.md) · launcher: [`scripts/cmux-fanout.sh`](./scripts/cmux-fanout.sh)
- Original Next.js source (read-only) → `../sharmaprakash.com.np/`

`CLAUDE.md` is a symlink to this file — keep them in sync (they're the same file).

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:970c3bf2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   bd dolt push
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->
## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.
<!-- END BEADS CODEX SETUP -->
