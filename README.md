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

## License

This repository is **dual-licensed** — code and content are governed separately:

| What | License | File |
| --- | --- | --- |
| Code, design, styles, config (everything that makes the site *work*) | MIT | [`LICENSE`](./LICENSE) |
| Blog posts, essays, copy, images, and any other authored content | All Rights Reserved | [`LICENSE-CONTENT`](./LICENSE-CONTENT) |

**In plain English:** you're welcome to fork this repo, lift the layout, components,
tokens, and build setup, and use them for your own site. You may **not** republish
the writing in `src/content/`, the copy in `src/data/`, or any of the images and
media. If you reuse the design, strip the content and replace it with your own.

If you want to quote or adapt a post, short attributed quotations are fine under
fair use; for anything beyond that, ask first: prakash.poudel@varicon.com.au.
