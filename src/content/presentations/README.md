# Presentations

Marp-based slide decks. Source markdown lives here; generated HTML, PDF, and
thumbnails live under `public/presentations/<slug>/` and are committed.

## Add or edit a deck

1. Create or edit `src/content/presentations/<slug>.md`. Front-matter must include
   `marp: true` and should set `theme: sharmaprakash`, `title`, `description`,
   `author`, and `date`. Use `<!-- _class: lead -->` on title/closing slides.
2. Run `pnpm presentations:build`. This regenerates:
   - `public/presentations/<slug>/index.html`
   - `public/presentations/<slug>/slides.pdf` (requires Chromium)
   - `public/presentations/<slug>/thumb.png`
   - `public/presentations/manifest.json`
3. Commit the markdown change and the regenerated files together.

`pnpm presentations:check` verifies the manifest sha256 matches every source —
useful for CI or a pre-commit hook. Marp generation is **not** wired into
`pnpm build`, so the site builds stay fast.

## Theme

The Marp theme is `src/styles/marp-theme.css`. It mirrors the site's design
tokens; if you change accent/ink values in `src/styles/tokens.css`, update the
`:root` block in the Marp theme to match.

## Routes

- Listing: `/presentations/` (rendered by `src/pages/presentations.astro`)
- Deck: `/presentations/<slug>/`
- PDF: `/presentations/<slug>/slides.pdf`
