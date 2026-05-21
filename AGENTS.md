# AGENTS.md

> If you're an agent about to touch this codebase: start here.
> Visual decisions → [`design.md`](./design.md).
> Task recipes ("how do I add a blog post / image / page?") → [`docs/agents/recipes.md`](./docs/agents/recipes.md).
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
