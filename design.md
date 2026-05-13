# Design System — sharmaprakash.com.np

> The visual language of this site. If `astro` is the engine and `tokens.css` is the
> wiring, this file is the schematic. Read this before changing colors, type, motion,
> or building a new component.

---

## 0. Brand voice

A founder who codes (and ships). The site should feel:

- **Sharp** — short sentences, no marketing fluff, type that earns its size.
- **Technical without cosplay** — no neon-on-black "hacker" tropes; we read like a
  notebook, not a terminal.
- **Founder-ish, calm** — confident defaults, generous whitespace, one accent color
  used like a highlighter, never wallpaper.
- **Warm over cold** — amber accent over the default tech blue.

If a design choice feels like a SaaS landing page, it's probably wrong.

---

## 1. Color tokens

All color is **OKLCH-leaning hex** committed to CSS variables. Tailwind utilities
consume these via `tailwind.config.cjs`. **Never** hardcode a color in a component.

### 1.1 Neutral — `--ink-*`

The text & surface backbone. Cool, slightly blue-grey neutrals so amber pops without
fighting.

| Token       | Hex       | Use                                                           |
| ----------- | --------- | ------------------------------------------------------------- |
| `--ink-50`  | `#F8FAFC` | Page background (light surfaces, body bg)                     |
| `--ink-100` | `#F1F5F9` | Subtle band background (alternating sections)                 |
| `--ink-200` | `#E2E8F0` | Card border, divider line                                     |
| `--ink-300` | `#CBD5E1` | Disabled text, placeholder, faint icon                        |
| `--ink-400` | `#94A3B8` | Caption, meta text (dates, reading time)                      |
| `--ink-500` | `#64748B` | Secondary body text                                           |
| `--ink-600` | `#475569` | Primary body text on light bg                                 |
| `--ink-700` | `#334155` | Headings on light bg                                          |
| `--ink-800` | `#1E293B` | Inverse surface (dark hero, dark CTA band)                    |
| `--ink-900` | `#0F172A` | Deepest dark surface (footer, modal scrim)                    |
| `--ink-950` | `#020617` | Pure depth — only for the hero base before the aurora layer   |

### 1.2 Accent — `--accent-*` (deep amber)

One signature color. Used like a highlighter: links, primary buttons, focus rings,
the underline in the hero, chart strokes, never a section background.

| Token          | Hex       | Use                                                |
| -------------- | --------- | -------------------------------------------------- |
| `--accent-50`  | `#FFFBEB` | Hover tint on cards, soft accent washes            |
| `--accent-100` | `#FEF3C7` | Selected chip background                           |
| `--accent-200` | `#FDE68A` | (reserve)                                          |
| `--accent-300` | `#FCD34D` | Focus ring (50% alpha)                             |
| `--accent-400` | `#FBBF24` | (reserve)                                          |
| `--accent-500` | `#F59E0B` | Hover state of primary actions                     |
| `--accent-600` | `#D97706` | **Primary accent.** Buttons, links, hero highlight |
| `--accent-700` | `#B45309` | Pressed state of primary actions                   |
| `--accent-800` | `#92400E` | (reserve)                                          |
| `--accent-900` | `#78350F` | (reserve)                                          |
| `--accent-950` | `#451A03` | (reserve)                                          |

**Rationale.** Amber `#D97706` (Tailwind's amber-600) sits warm against cool ink
neutrals, reads as confident and distinct from the ten thousand other tech-blue
personal sites. Fallback if it ever reads "too Substack": electric violet `#7C3AED`.

### 1.3 Semantic surfaces

Convenience tokens layered on top of the scales. **Use these in components when you
mean a role, not a value.**

| Token                | → resolves to                            | Use                              |
| -------------------- | ---------------------------------------- | -------------------------------- |
| `--surface-base`     | `--ink-50`                               | Main page background             |
| `--surface-raised`   | `#FFFFFF`                                | Cards, dropdowns                 |
| `--surface-sunken`   | `--ink-100`                              | Alternate section, code block bg |
| `--surface-inverse`  | `--ink-900`                              | Hero, CTA band, footer           |
| `--surface-glow`     | `color-mix(in oklab, --accent-600, transparent 90%)` | Aurora blobs, button glow |
| `--text-strong`      | `--ink-900`                              | h1, h2                           |
| `--text-default`     | `--ink-700`                              | h3-h6, body                      |
| `--text-muted`       | `--ink-500`                              | secondary body, meta             |
| `--text-faint`       | `--ink-400`                              | captions, breadcrumb separator   |
| `--text-on-inverse`  | `--ink-50`                               | text on `--surface-inverse`      |
| `--text-on-inverse-muted` | `--ink-300`                         | secondary text on inverse        |
| `--border-default`   | `--ink-200`                              | hairline divider                 |
| `--border-strong`    | `--ink-300`                              | input border                     |
| `--border-accent`    | `--accent-600`                           | focus outline base               |

#### Code surface

Dedicated tokens for fenced code blocks. Code is dark even when the page is light.

| Token                | → resolves to                            | Use                                        |
| -------------------- | ---------------------------------------- | ------------------------------------------ |
| `--code-bg`          | `--ink-900`                              | Code-block background                       |
| `--code-bg-raised`   | `--ink-800`                              | Header strip inside a code figure          |
| `--code-fg`          | `--ink-100`                              | Default code text (Shiki tokens layer on)  |
| `--code-gutter`      | `--ink-500`                              | Line-number gutter                         |
| `--code-line-hl`     | accent at 12% alpha                      | `{1-3}` highlighted-line background        |
| `--code-border`      | `--ink-700`                              | Hairline around the code figure            |

Authoring fences:

- ` ```jsx ` — language hint → syntax color + lang pill (top-left).
- ` ```tsx title="App.tsx" ` — adds a filename header strip.
- ` ```ts {1-3,5} ` — highlights specific lines.
- ` ```diff ` — `+` / `-` lines get green / red.
- Any fence longer than 24 lines auto-collapses with a "Show all N lines" button.

### 1.4 Dark mode (documented, not yet wired)

`.dark { … }` mirror in `tokens.css`. Inverts `--surface-base ↔ --surface-inverse`,
text-strong becomes `--ink-50`, accent stays the same (amber works on both). Not
turned on at runtime in v1 — the body class stays `light`.

---

## 2. Typography

### 2.1 Families

- **Inter** (variable) — UI, headings, navigation, captions. Loaded from Google Fonts.
- **Source Serif 4** (variable) — long-form post body only. Loaded from Google Fonts.
- **JetBrains Mono** — inline code, code blocks. (already shipped with system fallback)

### 2.2 Type scale

Each token = `font-size / line-height / letter-spacing / font-weight`.

| Token           | Size     | Line | Tracking | Weight | Use                                            |
| --------------- | -------- | ---- | -------- | ------ | ---------------------------------------------- |
| `display-2xl`   | 76px     | 1.05 | -0.03em  | 700    | Hero title (`/`)                               |
| `display-xl`    | 60px     | 1.1  | -0.025em | 700    | Post hero title                                |
| `display-lg`    | 48px     | 1.1  | -0.02em  | 700    | Page hero on About/Contact/etc                 |
| `h1`            | 36px     | 1.15 | -0.02em  | 700    | First-level in-page heading                    |
| `h2`            | 28px     | 1.2  | -0.015em | 600    | Section heading                                |
| `h3`            | 22px     | 1.3  | -0.01em  | 600    | Sub-section, card title                        |
| `h4`            | 18px     | 1.4  | -0.005em | 600    | Eyebrow / small heading                        |
| `body-lg`       | 18px     | 1.65 | 0        | 400    | Post body, intro paragraphs                    |
| `body`          | 16px     | 1.6  | 0        | 400    | Default UI body                                |
| `body-sm`       | 14px     | 1.55 | 0        | 400    | Card meta, secondary copy                      |
| `caption`       | 12px     | 1.5  | 0.02em   | 500    | Tag chips, byline meta                         |
| `mono`          | 14px     | 1.55 | 0        | 400    | Inline code (`JetBrains Mono`)                 |

### 2.3 Measure

- Post body: `max-w-[68ch]` (≈ 720px at 16px).
- UI body: `max-w-prose` (Tailwind default, 65ch).
- Display titles: `max-w-[18ch]` so they break at the right rhythm.

---

## 3. Spacing — 4px base

`--space-0` (0) · `--space-1` (4px) · `--space-2` (8) · `--space-3` (12) · `--space-4`
(16) · `--space-5` (20) · `--space-6` (24) · `--space-8` (32) · `--space-10` (40) ·
`--space-12` (48) · `--space-16` (64) · `--space-20` (80) · `--space-24` (96) ·
`--space-32` (128).

Use Tailwind's matching utility (`p-6` = `--space-6`). When the spec doesn't have a
value you need, you're probably reaching for a token that doesn't exist yet — pause
and ask.

---

## 4. Radius

| Token         | Px   | Use                              |
| ------------- | ---- | -------------------------------- |
| `--radius-sm` | 4    | Chips, small badges              |
| `--radius-md` | 8    | Inputs, buttons (default)        |
| `--radius-lg` | 16   | Cards, modals                    |
| `--radius-xl` | 24   | Hero portrait mask, feature card |
| `--radius-pill` | 9999 | Pills, round buttons            |
| `--radius-full` | 50%  | Avatars                         |

---

## 5. Shadow

Soft, layered shadows. Never use Tailwind's defaults — they're too dark for amber.

| Token           | Value                                                | Use                                |
| --------------- | ---------------------------------------------------- | ---------------------------------- |
| `--shadow-sm`   | `0 1px 2px 0 rgb(15 23 42 / 0.04)`                   | Subtle separation                  |
| `--shadow-md`   | `0 4px 12px -2px rgb(15 23 42 / 0.06)`               | Cards at rest                      |
| `--shadow-lg`   | `0 12px 32px -8px rgb(15 23 42 / 0.10)`              | Cards on hover, modals             |
| `--shadow-glow` | `0 0 32px -4px rgb(217 119 6 / 0.25)`                | Primary button hover, hero accents |

---

## 6. Motion

### 6.1 Principles

1. **Motion is feedback, never decoration that interrupts.** Exception: the hero
   aurora is allowed to be decorative because it lives at the page entry point and
   never blocks reading.
2. **Default is fast.** Most micro-interactions are 150–250ms. Page-level transitions
   may go up to 600ms.
3. **Always respect `prefers-reduced-motion: reduce`** — set animation/transition to
   `0.01ms` or fall back to a static state.
4. **One thing at a time.** When two elements move, they should be casually related
   (a button scales while its glow fades). Never four things moving at once.

### 6.2 Tokens

```
--ease-out-quad   : cubic-bezier(0.5, 1, 0.89, 1)     /* UI exit, button release */
--ease-out-expo   : cubic-bezier(0.16, 1, 0.3, 1)     /* page enter, hero reveal */
--ease-in-out-cubic : cubic-bezier(0.65, 0, 0.35, 1)  /* loops (aurora drift)   */

--dur-fast        : 150ms   /* hover state                    */
--dur-normal      : 250ms   /* enter / exit on small elements */
--dur-slow        : 400ms   /* enter on big elements          */
--dur-pageturn    : 600ms   /* Astro view transition          */
```

### 6.3 Patterns

- **Hover lift** — `translateY(-2px)` + shadow upgrade `md → lg`, 200ms `ease-out-quad`.
- **Underline grow** — pseudo-element `width: 0 → 100%`, anchored left, 200ms.
- **Focus ring** — `outline: 2px solid var(--accent-600); outline-offset: 2px` on
  `:focus-visible`. **Never** remove without a replacement.
- **Aurora drift** — two radial gradients, 14s `ease-in-out-cubic infinite alternate`,
  CSS-only.
- **Page turn** — Astro `<ClientRouter />` default + `transition:animate="slide"` with
  `--dur-pageturn` and `--ease-out-expo`.

---

## 7. Component primitives

Anatomy → states → token references. When you build a new instance of one of these,
use these exact tokens.

### 7.1 Button

**Variants**: `primary` (filled amber) · `secondary` (ghost on ink) · `ghost`
(transparent) · `link` (text-only, hover-underline).

| State    | primary                                          | secondary                                | ghost                                       |
| -------- | ------------------------------------------------ | ---------------------------------------- | ------------------------------------------- |
| rest     | bg `--accent-600`, text `white`                  | border `--ink-700`, text `--ink-700`     | text `--text-default`                       |
| hover    | bg `--accent-500`, `shadow-glow`                 | bg `--ink-700`, text `white`             | bg `--ink-100`                              |
| active   | bg `--accent-700`                                | bg `--ink-800`                           | bg `--ink-200`                              |
| focus    | `+ focus ring`                                   | same                                     | same                                        |
| disabled | bg `--ink-200`, text `--ink-400`, no shadow      | border `--ink-200`, text `--ink-400`     | text `--ink-400`                            |

Padding: `px-5 py-3` default, `px-4 py-2` for `btn-small`. Radius: `--radius-pill`.

### 7.2 Card

**Variants**: `default` (static) · `interactive` (clickable, lifts on hover) ·
`featured` (1.5x scale on home feature slot, soft accent border).

Anatomy: `figure` → `header` (title + meta) → `body` (excerpt) → `footer` (read-time
+ action). Background `--surface-raised`, radius `--radius-lg`, shadow `--shadow-md`
at rest, `--shadow-lg` on `.card-interactive:hover`.

### 7.3 Tag / Chip

Pill, `caption` type, `bg --ink-100` / `text --ink-700` at rest. Active (selected
filter) → `bg --accent-100` / `text --accent-700`.

### 7.4 Field

Anatomy: `label` (eyebrow type, `--text-default`) → `input/textarea` (`--text-default`,
border `--border-strong`, radius `--radius-md`, padding `px-4 py-3`). Focus:
border becomes `--accent-600`, focus ring shown. Error: border `#DC2626`, hint text
red below.

### 7.5 Nav link

Rest: `--text-on-inverse-muted` (in inverse contexts) or `--text-default` (in light).
Hover: `--accent-600`. Active: `--accent-600` + underline (always-on, 2px).
`transition: color var(--dur-fast) var(--ease-out-quad)`.

### 7.6 Breadcrumbs

Caption type, separator `›` in `--text-faint`. Last crumb in `--text-default`
non-link.

### 7.7 PostCard

Used in: home feature slot, home compact slots, related posts row, essays index.
- `figure` cover (16:9), `transition:name={post.id}-thumb` for view transition.
- `header`: category chip + reading time (`--text-muted`)
- `h3` title (clamp 2 lines)
- `body`: excerpt (clamp 2 lines, `--text-muted`)
- whole card is a `.card-interactive`.

### 7.8 BlogIndexRow

Reading-list variant used on `/blog/page/N/`. No cover image. Larger title
(`h2`), excerpt (`body-lg`), chips, separator hairline (`--border-default`).

### 7.9 PostHero

Magazine post header. Display-xl title, byline row, optional full-bleed cover.

### 7.10 Footer

Inverse surface, three columns on lg (brand / quick links / social).

### 7.11 Post engagement primitives

These live under `src/components/blog/` and are composed in `src/pages/[...slug].astro`.

- **AuthorByline** — avatar (48px) + name (links to /about/) + role/company + date + computed reading time + ShareRow. Sits inside PostHero above the cover.
- **ShareRow** — three pill chips: copy-link (with `.is-copied` feedback), X intent, LinkedIn intent. Uses `--surface-raised` chips on `--border-default`; hover swaps to `--accent-700`/`--accent-600` border.
- **SeriesNavStrip** — `--surface-sunken` band right below the hero. Eyebrow + "Part N of M" + numbered chip row. Current chip is `--accent-600` filled and non-interactive. Hover chips tooltip with the part title.
- **TableOfContents** — sticky right column at `top: 96px` on lg+. Renders H2 + H3 only. H3 indented `--space-4`. Active link gets `--accent-700` text + `--accent-600` left border via IntersectionObserver scroll-spy. Mobile collapses into a `<details>` summary above the body.
- **AuthorBioCard** — 88px avatar + name + role + bio (from `src/data/site.ts`) + LinkedIn CTA + "More essays →" ghost link. Card on `--surface-raised` with `--border-default`.
- **SeriesContinueBlock** — `--surface-sunken` card at the foot of the post: eyebrow + "N parts" + Prev/Next part cards + full numbered list (current row tinted, prev/next labelled).
- **PrevNextPosts** — two cards (`prev` = older, `next` = newer in the global feed) with category chip + title clamped to 2 lines.

Series flow: define in `src/data/series.ts` → add `series` + `seriesOrder` to each post's frontmatter. RelatedPosts is intentionally suppressed on series posts to keep the foot focused.

---

## 8. Page archetypes

```
HOME
┌───────────────────────────────────────────────────┐
│ HomepageHero (full-bleed inverse, aurora bg)      │ inverse
├───────────────────────────────────────────────────┤
│ CurrentRoleStrip (the journey timeline)           │ base
├───────────────────────────────────────────────────┤
│ NowFocus (3 cards · what I'm focused on)          │ sunken
├───────────────────────────────────────────────────┤
│ RecentEssaysList (feature + reading list)         │ base
├───────────────────────────────────────────────────┤
│ RecentTechnicalPostsCarousel                      │ sunken
├───────────────────────────────────────────────────┤
│ ClientTestimonialsCarousel                        │ ink-900 (dark)
├───────────────────────────────────────────────────┤
│ NewsletterSignup (light card · breaks dark seam)  │ base
├───────────────────────────────────────────────────┤
│ SiteFooter (CTA + meta · scribble + glow)         │ inverse
└───────────────────────────────────────────────────┘

Surface alternation pattern: inverse → base → sunken → base → sunken →
ink-900 → base → inverse. No two adjacent sections share a tone.

ESSAYS INDEX
┌───────────────────────────────────────────────────┐
│ SiteHeader                                         │
│ Page intro: display-lg "Essays" + chip filters    │
├───────────────────────────────────────────────────┤
│ BlogIndexRow                                       │
│ ────── hairline ──────                             │
│ BlogIndexRow                                       │
│ ...                                                │
│ Pager (Prev | Page n of m | Next)                 │
└───────────────────────────────────────────────────┘

ESSAY DETAIL
┌───────────────────────────────────────────────────┐
│ ReadingProgressBar (sticky 2px)                    │
│ SiteHeader                                         │
│ PostHero (display-xl, byline, optional cover)     │
│ Body (Source Serif, max-w 68ch)                   │
│ ────── hairline ──────                             │
│ RelatedPosts (3x PostCard)                        │
│ SiteFooter                                        │
└───────────────────────────────────────────────────┘
```

About/Contact/Works/Resume/Terms/404 — single-column content under a small
page hero, no breadcrumb crutch.

---

## 9. Accessibility baseline

- **Contrast**: all body & UI text ≥ WCAG AA. Display type may dip if oversize.
- **Focus**: every interactive element must show a visible `:focus-visible` ring.
- **Motion**: every animation respects `prefers-reduced-motion`.
- **Landmarks**: every page has `<header>`, `<main>`, `<footer>`. Headings nest
  monotonically.
- **Alt text**: every `<img>` has meaningful `alt=""` or empty `alt=""` if decorative.
- **Color is never the only signal** (link underline + color, error icon + text).

---

## 10. How to extend

- **New section on home** → propose it in this doc first, then build it.
- **New token** → add to `tokens.css` + this doc in the same commit.
- **Component needs a new state** → document it in §7 before shipping.
- **Page that doesn't fit an archetype** → add a new archetype sketch in §8.

If you find yourself reaching for an inline hex / px / ms value, stop and add a token.
