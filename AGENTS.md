# AGENTS.md

> If you're an agent (human or otherwise) about to touch this codebase: start here.
> If you're about to make a visual decision, also read [`design.md`](./design.md).

## What this is

The personal site of Prakash Poudel Sharma — homepage, essays, about/contact/works.
Static Astro 6 build, deployed as plain HTML.

Live: https://sharmaprakash.com.np/

## Stack

- **Astro 6** (static output, View Transitions enabled)
- **Tailwind v3** (configured to read CSS variables from `src/styles/tokens.css`)
- **React 19** (only as Astro islands for `@iconify/react`)
- **Swiper Element** (web component carousels — no React wrapper)
- **gray-matter + marked** (for the two legacy static pages: `about.md`, `terms.md`)
- **Inter** + **Source Serif 4** (Google Fonts)

Package manager: **pnpm**. Node ≥ 20.

## Commands

```sh
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # -> dist/
pnpm preview
pnpm check     # astro check (TS)
```

`.env` (optional): `WEBSITE_URL=https://sharmaprakash.com.np/` — used for canonical
URLs and the sitemap.

## Where things live

```
src/
├── pages/                # Astro routes. URL = file path.
│   ├── index.astro             /
│   ├── about.astro             /about/
│   ├── contact.astro           /contact/
│   ├── resume.astro            /resume/
│   ├── works.astro             /works/
│   ├── terms.astro             /terms/
│   ├── 404.astro               /404
│   ├── blog/page/[page].astro  /blog/page/N/
│   ├── category/[slug]/[page].astro  /category/<slug>/N/
│   └── [...slug].astro         /<directory>/<post>/ or /<post>/
│
├── layouts/
│   └── SiteShell.astro    # The only layout. Wraps every page.
│
├── components/
│   ├── chrome/            # Site-wide shell: header, footer, nav, breadcrumbs, SEO head
│   ├── marketing/         # Homepage-only sections
│   ├── blog/              # Post-related: card, sidebar, hero, progress bar, related
│   └── motion/            # Animation primitives (ScrollReveal)
│
├── content/posts/         # 73 markdown blog posts
├── content.config.ts      # Content collection schema (don't change without a reason)
│
├── data/                  # Typed content modules. Edit here to update site copy.
│   ├── site.ts            # Personal info, SEO defaults, head titles
│   ├── reviews.ts         # Client testimonials
│   ├── resume.ts          # Skills, jobs, education, services
│   ├── portfolios.ts      # Works grid items + filters
│   └── static/            # Long-form markdown (about, terms)
│
├── styles/
│   ├── tokens.css         # Design tokens. The single source of truth.
│   ├── globals.scss       # Tailwind imports, base styles, .prose-post (post body)
│   └── interactions.css   # Hover/focus primitives: .btn, .chip, .field, etc.
│
└── utils/
    ├── index.ts           # createSlug, formatBlogDate, paginate
    └── posts.ts           # post collection helpers (URL, thumbnail, filters)
```

## Conventions

### Naming
- Component files = `PascalCase.astro`, intent-named. No abbreviations, no version
  suffixes (no `Hero2`, `BlogV4`). When in doubt, pick the longer name.
- New components live under one of `chrome/`, `marketing/`, `blog/`, `motion/`.
  Add a new top-level namespace if a new category appears (e.g. `forms/`).
- Page-only sections live under `marketing/`. Reusable building blocks live where
  they belong by domain.

### Tokens and styling
- **Never** hardcode a color (`#xxx`, `rgb(...)`) in a component. Use a token via
  the Tailwind utility (`text-strong`, `bg-accent-600`, `border-default`) or
  reference the CSS variable directly (`var(--accent-600)`).
- **Never** hardcode a pixel value for spacing. Use the 4px scale (Tailwind `p-4`,
  `gap-6`, etc.) which is wired to `--space-N`.
- New token? Add to `src/styles/tokens.css` AND update `design.md` in the same
  commit. Tailwind will pick it up automatically if you also extend the config.
- Hover/focus states use the existing primitives (`.btn`, `.card-interactive`,
  `.link-underline`, `.chip`, `.field`) — don't roll a new one without checking.

### Motion
- Wrap any list/section that should fade in with `<ScrollReveal delay={i * 80}>`.
- All animation durations and easings come from `--dur-*` and `--ease-*` tokens.
- Every animation must respect `prefers-reduced-motion` — the global rule in
  `tokens.css` handles `transition-*` and `animation-*` for free; complex CSS
  animations must add their own `@media` override.

### URLs
- **Public URLs are locked** (`/blog/page/N/`, `/category/.../`, post URLs).
  Rename internal files freely, but don't change route paths — search engines have
  indexed them.

## Before you touch X, read Y

| You want to… | Read these first |
| --- | --- |
| Add a blog post | `src/content/posts/` using filename pattern `YYYY-MM-DD-slug.md` only; do not create undated post filenames. The `date` frontmatter must match the filename date. Schema lives in `src/content.config.ts`. Required frontmatter: `title`, `date`. Common optional: `excerpt`, `category`/`categories`, `tags`, `cover`, `thumb`, `directory`, `series` + `seriesOrder`. Set `draft: true` to hide a post from all listings, feeds, and the sitemap (filter lives in `src/utils/posts.ts`). |
| Create a featured blog image | Use Codex image generation for an editorial header image, no embedded text, no logos, no watermarks. Save the 21:9 hero image as `cover` and the 16:9 card crop as `thumb` under `public/images/blog/<category-or-series>/`. Set `use_featured_image: true`. Post heroes and OG tags read `cover` through `postCoverImage()`; cards/listings read `thumb` through `postThumbnail()`. If only one generated image exists, use the same public path for both fields. Category images are only a fallback for posts without a featured image. |
| Add a new homepage section | `design.md` §8 (page archetypes), then add to `src/components/marketing/` and import in `src/pages/index.astro`. |
| Change the accent color | `design.md` §1.2, then update `--accent-*` in `src/styles/tokens.css`. All consumers update for free. |
| Add a new page | `design.md` §8 (does it fit an archetype?). Create `src/pages/<name>.astro` using `<SiteShell title="…">`. Add to nav if user-facing. |
| Add an animation | `design.md` §6. Reuse `<ScrollReveal>` for fade-in; reuse `--dur-*` and `--ease-*` tokens; check `prefers-reduced-motion`. |
| Change navigation items | `src/components/chrome/PrimaryNavigation.astro` (the only place — used by both header and homepage hero). |
| Change a homepage testimonial | Edit `src/data/reviews.ts`. |
| Change the homepage journey timeline | Edit the `milestones` array in `src/components/marketing/CurrentRoleStrip.astro`. |
| Touch the post detail layout | `src/pages/[...slug].astro` + `src/components/blog/PostHero.astro` + `RelatedPosts.astro`. |
| Author a code block | Use a language hint (`` ```tsx ``), optional filename via `` ```tsx title="App.tsx" ``, optional line highlight via `` ```ts {1-3,5} ``, optional diff via `` ```diff ``. Fences over 24 lines auto-collapse with a "Show all N lines" button. Chrome (copy button, lang pill) is added automatically. |
| Update "what I'm working on now" | Edit `src/data/now.ts` — three to four `NowItem` entries (icon, title, body, updated, optional href). The homepage `NowFocus` section reads it directly. |
| Wire a real newsletter provider | Set `PUBLIC_NEWSLETTER_ENDPOINT` in `.env` (a POST endpoint that accepts `{ email }`). The form auto-enables and posts via fetch. Until then, the form renders a "follow on LinkedIn" fallback. |
| Start a new essay series | Add an entry to `src/data/series.ts` (key = kebab slug, value = `{ title, description }`). Set `series: <slug>` + `seriesOrder: N` (1-based) in each post's frontmatter. The post detail page renders the series chip strip below the hero and a "continue the series" card at the foot automatically. |
| Tweak the post detail layout | `src/pages/[...slug].astro` orchestrates: `PostHero` → `SeriesNavStrip` (if series) → `prose-post` content + sticky `TableOfContents` sidebar → `CodeBlockEnhancements` → `AuthorBioCard` → `SeriesContinueBlock` (if series) → `PrevNextPosts` → `RelatedPosts` (hidden if series). All under `src/components/blog/`. |

## Things to NOT do

- Don't add a CSS-in-JS library. We're CSS-first.
- Don't add a runtime UI framework. React is for icon islands only.
- Don't reach for `framer-motion`. `<ScrollReveal>` + CSS keyframes do everything we
  need at a fraction of the bundle cost.
- Don't introduce a second style system (no `styled-components`, no UnoCSS).
- Don't break post URL shape (`/[directory]/[slug]/` or `/[slug]/`).

## Pointers

- Visual decisions → [`design.md`](./design.md)
- Plan / history → `/Users/prakash/.claude/plans/time-to-plan-for-functional-boole.md`
- Original Next.js source (read-only, for reference) → `../sharmaprakash.com.np/`

## CLAUDE.md

This file is also the source of `CLAUDE.md` (Claude Code reads `CLAUDE.md` by
convention). Keep them in sync — they're symlinks.
