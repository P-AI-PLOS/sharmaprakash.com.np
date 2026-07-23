## Why

`src/content/posts/2025-02-06-user-story-mapping-fixing-the-flat-backlog.md`
teaches Jeff Patton's story map — a backbone of user activities across the top,
story cards stacked under each, horizontal release slices cutting across the
whole grid — entirely in prose. The two things the post says make the map
powerful ("read the backbone aloud as a sentence," "a slice is a complete,
walkable journey," "a column with a tower of cards is depth-first polishing in
progress") are exactly the things a reader can't verify without seeing a real
grid. The site already turns prose frameworks into working artifacts
(`/tools/opportunity-solution-tree/` for the OST posts); this post has the same
gap and no worked example rendered anywhere in it.

## What Changes

- Add `/tools/story-map/` — a static Astro page hosting a React island
  (localStorage only, no backend), following the shape of
  `src/pages/tools/opportunity-solution-tree.astro` +
  `src/components/tools/ost/`.
- Add `src/utils/story-map-store.ts` built with `createToolStore` from the
  shared pipeline data contract (`src/utils/pipeline-store.ts`), storage key
  `storymap-v1`, id prefix `map`. Consumes the contract as-is — no delta.
- New component namespace `src/components/tools/story-map/`:
  - `StoryMapGrid.tsx` — the reusable, presentational grid: backbone columns
    across the top, one release-band row per slice underneath (in release
    order), an "unsliced backlog" band at the bottom; renders in a read-only
    mode with no store/interaction dependency.
  - `StoryMapBuilder.tsx` — the editing island: add/rename/reorder backbone
    steps, add cards under a step, move a card between steps or between
    slices via a small `<select>` (no drag-and-drop library — see design.md),
    reorder cards within a step+slice cell with up/down controls, add/rename/
    reorder release slices, Markdown export, fullscreen mode for wide maps.
  - `StoryMapSwitcher.tsx`, `StoryMapDashboard.tsx`, `StoryMapHelpModal.tsx` —
    mirror `OstTreeSwitcher`/`OstDashboard`/`OstHelpModal`.
  - `StoryMapExample.tsx` — a thin, hardcoded-data wrapper around
    `StoryMapGrid` in read-only mode, rendering the exact onboarding vignette
    from the post's "backbone and slices" section (sign up → set up project →
    invite team → do core work → share result, sliced into MVP and Release 2),
    plus a link to the standalone builder.
- Convert `2025-02-06-user-story-mapping-fixing-the-flat-backlog.md` to
  `.mdx` and embed `StoryMapExample` (via `client:visible`) directly under
  "The map: a backbone and slices," replacing the unillustrated prose walk of
  that same example with a rendered grid. No other post content changes.
- Markdown export mirrors OST's `toMarkdown` pattern: backbone read aloud as a
  sentence, then one section per slice (in release order) plus a trailing
  "Backlog (unsliced)" section, cards listed under their backbone step.

## Capabilities

### New Capabilities

- `story-map-builder`: the `/tools/story-map/` page and island that models a
  Patton-style story map — backbone steps as columns, cards under each step,
  one or more named release slices that partition cards into releases, an
  unsliced backlog band — with click-to-assign card placement (no
  drag-and-drop dependency), Markdown export, and a read-only embeddable
  worked-example rendering used in the story mapping post.

### Modified Capabilities

_None._ `pipeline-data-contract` is consumed as-is (`createToolStore`,
`ToolRecordBase`, `resolveActiveProduct`, `uid`) — this tool introduces no
shape the contract doesn't already provide, unlike `okr-check-in-tool`'s draft
marker.

## Impact

- **New code:** `src/pages/tools/story-map.astro`,
  `src/components/tools/story-map/` (six components), `src/utils/story-map-store.ts`.
- **Modified content:** `src/content/posts/2025-02-06-user-story-mapping-fixing-the-flat-backlog.md`
  renamed to `.mdx` with one import and one embed added; no prose rewritten,
  no frontmatter fields changed, URL unaffected (route is derived from the
  slug, not the extension).
- **Depends on (must exist first):** `donut-crm-pipeline-data-contract` —
  `src/utils/pipeline-store.ts` (`createToolStore`, `ToolRecordBase`, `uid`,
  `resolveActiveProduct`). Already applied (`src/utils/pipeline-store.ts` and
  `src/utils/ost-store.ts` exist in the tree).
- **Constraints honored:** static Astro 6.3, localStorage only, React 19
  islands only, tokens from `tokens.css`, no new dependencies (no drag-and-drop
  library, no new grid/canvas library — plain CSS grid).
- **Trackers:** no open beads exist for this work today; a close-out task
  files the follow-up beads.

## Non-goals

- No INVEST/SPIDR validation of individual cards — that discipline belongs to
  the sibling `vertical-slicer-tool` change; Story Map Builder is purely
  structural (backbone + slices), and a card here is a plain text label, not a
  `StoryRef`.
- No pixel-drag reordering or a drag-and-drop dependency — see design.md for
  the click-to-assign rationale.
- No cross-tool join with Vertical Slicer's sliced stories in this change
  (deferred follow-up, noted in design.md's Open Questions).
- No pipeline-wide chrome/nav, export/import beyond Markdown, cross-tab sync,
  reminders, or multi-user anything.
