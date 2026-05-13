# sharmaprakash.com.np

Personal site of Prakash Poudel Sharma — homepage, essays, about, contact, works.

Built with Astro 6, Tailwind v3, and a small handful of React islands.

## Run it

```sh
pnpm install
pnpm dev      # http://localhost:4321
pnpm build
pnpm preview
pnpm check    # astro check
```

## Where to look next

| You're trying to… | Open this |
| --- | --- |
| Understand the codebase, conventions, where things live | [`AGENTS.md`](./AGENTS.md) |
| Make a visual decision (color, type, motion, component state) | [`design.md`](./design.md) |
| Add a blog post | `src/content/posts/` (`YYYY-MM-DD-slug.md`) |
| Change site copy | `src/data/*.ts` |

## Stack

- Astro 6 (static SSG, View Transitions enabled)
- Tailwind v3 wired to CSS variables in `src/styles/tokens.css`
- React 19 (only as islands for `@iconify/react`)
- Swiper Element for carousels
- Inter + Source Serif 4 fonts
