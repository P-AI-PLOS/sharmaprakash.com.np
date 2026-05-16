# Marp Presentations Implementation Brief

You are working in `/Users/prakash/workspaces/2023/personal/sharmaprakash-astro`.

Read `AGENTS.md` and `design.md` first. This is an Astro 6 static personal site using pnpm, Tailwind tokens, and CSS-first design. Do not introduce a runtime UI framework. `CLAUDE.md` is a symlink to `AGENTS.md`, so keep that instruction surface effectively in sync.

## Goal

Add a Marp-based presentation feature to the blog/site.

Reference example:

https://github.com/jonathanclarke/presentations/tree/main/2026-05-15-ruby-nepal-slides

Use that repository as the implementation reference for deck structure, Marp usage, theme approach, and generated output shape. Do not copy blindly; adapt it to this Astro site's conventions and design tokens.

## Architecture Decision

- Use Marp, not Reveal.js or Slidev.
- Treat presentations as an in-repo subsystem, not a monorepo package.
- Keep editable Marp markdown sources in the repo.
- Generate static presentation artifacts only when presentations change.
- Commit generated artifacts so normal Astro deploys do not re-render presentations every time.
- Do not wire Marp generation into normal `pnpm build`.

## Desired Structure

Adjust only if current repo conventions clearly suggest a better fit.

```txt
src/content/presentations/
  <slug>.md

src/styles/
  marp-theme.css

scripts/presentations/
  build-presentations.mjs
  check-presentations.mjs

public/presentations/
  <slug>/
    index.html
    slides.pdf
    thumb.png or thumb.jpg
```

## Requirements

1. Add Marp tooling using pnpm. Prefer `@marp-team/marp-cli` unless there is a strong reason to use `@marp-team/marp-core`.

2. Add package scripts:
   - `presentations:build`
   - `presentations:check`

3. `presentations:build` should:
   - discover markdown decks in `src/content/presentations/`
   - render each deck to `public/presentations/<slug>/index.html`
   - render a PDF to `public/presentations/<slug>/slides.pdf`
   - generate or copy a thumbnail if practical
   - use the site's Marp theme
   - avoid changing unrelated files

4. `presentations:check` should:
   - verify generated artifacts are current with source decks
   - fail clearly if markdown source changed but generated files were not regenerated
   - be suitable for CI or pre-commit use later
   - avoid running as part of normal `pnpm build`

5. Add one small example deck based on the Ruby Nepal reference.
   - It should prove the feature works, not become a large content migration.
   - Use a local slug like `ruby-nepal-example` unless existing conventions suggest a better name.
   - Do not include copyrighted material from the reference unless it is clearly licensed for reuse. A short original demo deck inspired by the structure is fine.

6. Add a presentation listing page if appropriate:
   - likely `/presentations/`
   - use `SiteShell`
   - match existing page archetypes and visual style
   - link to the generated static deck and PDF
   - do not create a marketing-style landing page

7. Styling:
   - Marp theme must use existing CSS variables/tokens where possible.
   - Do not hardcode colors in Astro components.
   - If a new token is truly needed, update both `src/styles/tokens.css` and `design.md`.
   - Keep animation tasteful. Marp transitions are allowed, but respect reduced motion.

8. Documentation:
   - Add a short repo-local note explaining how to add/update a presentation and when to run `pnpm presentations:build`.
   - Update `AGENTS.md` only if presentation workflow instructions need to be recorded.

9. Verification:
   Run:
   - `pnpm presentations:build`
   - `pnpm presentations:check`
   - `pnpm check`
   - `pnpm build`

## Constraints

- Before editing, inspect current package scripts, existing content conventions, and site pages.
- Keep the diff focused.
- Preserve unrelated dirty worktree changes. At handoff time, there was an unrelated untracked file: `src/pages/slides-demo.astro`. Do not modify, delete, stage, or commit it unless the owner explicitly asks.
- Commit the implementation when done, as the cmux launcher asks.
