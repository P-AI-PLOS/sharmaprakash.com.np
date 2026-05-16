# Presentations

Marp-based slide decks. Markdown source in `src/content/presentations/`, generated
HTML/PDF/PNG artifacts under `public/presentations/<slug>/`. Generation is
explicit — it is **not** wired into `pnpm build`.

## Adding or updating a deck

1. Create `src/content/presentations/<slug>.md`. Required front matter:

   ```yaml
   ---
   marp: true
   theme: sharmaprakash
   paginate: true
   title: "Deck title"
   description: "One-line summary used by the listing page."
   date: 2026-05-16
   ---
   ```

   Use `<!-- _class: lead -->` on title/closing slides. Split slides with `---`.

2. Author the content. The site theme lives at `src/styles/marp-theme.css` —
   edit there if a visual change is needed (and mirror any token changes from
   `src/styles/tokens.css`).

3. Generate the static artifacts:

   ```sh
   pnpm presentations:build
   ```

   This writes `index.html`, `slides.pdf`, and `thumb.png` under
   `public/presentations/<slug>/`, plus a `manifest.json` record.

4. Verify the artifacts match the source:

   ```sh
   pnpm presentations:check
   ```

5. Commit both the source markdown and the generated `public/presentations/<slug>/`
   directory together. Deploys do not re-render decks.

## Listing page

`/presentations/` reads sources from `src/content/presentations/` and links to
each generated deck. No additional registration step is needed.
