# sharmaprakash-astro

Astro rewrite of the original Next.js site at `../sharmaprakash.com.np`.

## Stack

- Astro 6 (static output)
- Tailwind v3 + the original SCSS (kept to preserve the design system)
- React 19 (only for `@iconify/react` islands)
- gray-matter + marked for the two legacy static pages (`about.md`, `terms.md`)

## Commands

```sh
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # -> dist/
pnpm preview
```

Set `WEBSITE_URL` in `.env` for canonical/og URLs and the sitemap.

## Routes

| URL                              | Source                                  |
|----------------------------------|-----------------------------------------|
| `/`                              | `src/pages/index.astro`                 |
| `/about/`                        | `src/pages/about.astro`                 |
| `/contact/`                      | `src/pages/contact.astro`               |
| `/resume/`                       | `src/pages/resume.astro`                |
| `/works/`                        | `src/pages/works.astro`                 |
| `/terms/`                        | `src/pages/terms.astro`                 |
| `/404`                           | `src/pages/404.astro`                   |
| `/blog/page/[n]/`                | `src/pages/blog/page/[page].astro`      |
| `/category/[slug]/[page]/`       | `src/pages/category/[slug]/[page].astro`|
| `/[directory]/[slug]/` or `/[slug]/` | `src/pages/[...slug].astro`         |

## Content

73 blog posts live in `src/content/posts/` and are loaded via Astro's content
collection (`src/content.config.ts`). Each post's URL slug is derived by
stripping the `YYYY-MM-DD-` prefix from the filename. Posts with a
`directory:` frontmatter field render under that directory (e.g.
`/javascript/...`); the rest render at the root.

## What was dropped from the original

The original Next.js boilerplate included a lot of unused work; per the brief
this migration covers only what was wired into the active site.

- 8 homepage variants (`homepage1..8.js`) — only the active `homepage4` was
  ported, as `index.astro`.
- `posts2/[slug].js` — duplicate blog list, unused.
- Framer Motion animations — replaced with plain CSS / dropped.
- React-slick / Slick Carousel sliders on the homepage — flattened to a
  responsive grid (Testimonials and PersonalBlog).
- Dark-mode toggle — the `html.light` class is set in the layout; the runtime
  toggle and `localStorage` plumbing was removed. Restoring it would be a few
  lines of inline JS in `Layout.astro`.
- NProgress route-change progress bar.
- Scroll-to-top button + react-scroll smooth scroll.
- React Query / Axios fetchers (all data was already inline constants).
- Disqus comments on blog detail.
- Lunr-style client-side blog search.
- Contact form (was wired to EmailJS) — replaced with a plain `mailto:` form;
  swap in a real provider when needed.
- The 5-section sticky Hero with TabList of company logos — simplified to a
  two-column layout listing the same three companies from `data/companies.ts`.

## Where state lives

| Concern | File |
|---|---|
| Site/SEO defaults, personal info | `src/data/site.ts` |
| Reviews / testimonials | `src/data/reviews.ts` |
| Resume content (skills, jobs, edu, services) | `src/data/resume.ts` |
| Portfolio items + filters | `src/data/portfolios.ts` |
| Companies on the home page | `src/data/companies.ts` |
| About / Terms long-form text | `src/data/static/{about,terms}.md` |
| Blog posts | `src/content/posts/*.md` |
| Post helpers (sort, paginate, URL, thumbnail) | `src/utils/posts.ts` |

## Redirects

The Next.js `redirects()` rule for the historical `/javascript/ie-alternative-to-inludes/`
typo is preserved in `astro.config.mjs`.
