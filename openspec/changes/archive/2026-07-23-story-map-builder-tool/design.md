## Context

Static Astro 6.3 site; interactive tools are React 19 islands persisting to
localStorage only. Reference implementations read in full for this design:

- `src/components/tools/ost/TreeBuilder.tsx` — editor-panel + canvas-panel
  split, fullscreen mode via `createPortal`, URL-mirrored fullscreen param,
  localStorage persistence through a store module, Markdown export, help
  modal, tree switcher.
- `src/components/tools/ost/TreeDiagram.tsx` — canvas rendering via
  `react-d3-tree` (pan/zoom/drag native to that library), `ResizeObserver`-
  driven sizing, custom node renderer using `foreignObject` + Tailwind/token
  classes.
- `src/components/course/exercises/OpportunitySorter.tsx` — click-only
  interaction (`ChoiceButton`), no drag anywhere in the course exercise set.
- `src/utils/ost-store.ts` / `src/utils/pipeline-store.ts` — the
  `createToolStore` factory (versioned key, `Record<id, record>`, in-memory
  cache, silent try/catch persistence, a separate scope-keyed active pointer),
  contract of record at `openspec/specs/pipeline-data-contract/spec.md`.
- `src/pages/tools/opportunity-solution-tree.astro` — the standalone-page
  shape: `SiteShell` + eyebrow/H1/intro hero + one `client:load` island +
  "everything saves in your browser" copy.
- `src/content/posts/2025-09-11-from-opportunities-to-solutions-ideating-alone-and-together.mdx` —
  proof that a full interactive tool island (`TreeBuilder`) already embeds
  directly inside a post's `.mdx` body via `client:load`, not just on a
  standalone page.

The gap: `src/content/posts/2025-02-06-user-story-mapping-fixing-the-flat-backlog.md`
describes a **2D grid** (backbone columns × vertical card stacks × horizontal
release-slice cuts) — a genuinely new interaction shape. Nothing in the repo
renders a grid like this; `react-d3-tree` is the wrong tool (it lays out a
tree, not an arbitrary matrix), and there is no drag-and-drop library in
`package.json` (confirmed: only `react-d3-tree` appears under tree/grid/drag/
dnd search terms).

## Goals / Non-Goals

**Goals:**
- Render a legible story map: backbone steps as columns, cards stacked under
  each step, one or more named release slices that partition cards into
  releases, and an unsliced backlog band — matching the post's own vocabulary
  exactly (backbone, slice, walking skeleton is just "the first slice").
- Let a visitor build their own map at `/tools/story-map/`: add/reorder
  backbone steps, add cards, assign a card to a step and a slice, add/reorder
  slices, export to Markdown — all localStorage-only, no backend.
- Replace the unillustrated prose walk of the onboarding vignette (three
  sprints stuck in the first backbone column, re-sliced into a crude
  end-to-end release) with an actual rendered grid, directly in the post.
- Do this with **no new dependency** — no drag-and-drop library, no grid/
  layout library, no charting library.

**Non-Goals:**
- INVEST/SPIDR card validation — that's `vertical-slicer-tool`'s job; a card
  here is a plain text label, not a validated, spec-linked story.
- Pixel-accurate drag-and-drop of cards, or drawing a literal diagonal/free-
  form cut line across variable-height columns.
- Joining Story Map cards to Vertical Slicer's `StoryRef`/`story` records —
  deferred (Open Questions).
- Multi-context embedding (course chapters, several post embeds) — today there
  is exactly one embed context (this one post) and one standalone page; no
  `OstSource`-style union is built ahead of a second use case.

## Decisions

### D1. No drag-and-drop library — slices are literal grouped bands, cards move by click-assign

Patton's paper-and-sticky-notes version cuts a physical horizontal line across
a table of note stacks of uneven height. Two ways to build that in a browser:

**(a) Freeform position + overlay line** — give every card an absolute
pixel/row position within its column, render one or more draggable horizontal
lines across the whole grid, and derive "which slice is this card in" from
whether the card's y-position falls above or below each line. This needs
either a drag library (mouse/touch/keyboard drag handlers, collision math,
accessible reordering) or a large hand-rolled equivalent, and it still has to
solve column-height mismatch (a line drawn straight across looks meaningless
the moment one column has 2 cards and its neighbor has 9).

**(b) Grouped bands (chosen)** — model a slice as a first-class row: the grid
is a step-columns × slice-rows matrix, and a card's slice is a field
(`sliceId`), not a derived position. Rendering is a plain CSS grid: one row
per slice (in release order) plus a trailing "Backlog (unsliced)" row, one
column per backbone step. Moving a card between slices, or between steps, is
a `<select>` next to the card (two dropdowns: "Move to step," "Move to
slice"); reordering cards within a step+slice cell, or reordering steps/
slices themselves, is up/down (or left/right) arrow buttons — the same
click-only mechanics as `OpportunitySorter.tsx`'s `ChoiceButton`, no pointer
drag math anywhere.

This is the same visual result readers expect (a slice cuts across every
column at once) with none of the freeform-positioning complexity, and it
follows the "Adopting a tool/library" ritual's instruction: don't reach for a
DnD dependency until the native/hand-rolled option has been checked and found
insufficient — here the grouped-band model makes it *unnecessary*, not just
avoided. Trade-off accepted: a slice band is always a straight line across
the whole grid by construction (can't have "MVP" dip lower in one column than
another) — which is arguably more correct to Patton's discipline than a
freeform cut, since a slice is supposed to be one release, not a per-column
opinion.

### D2. Data model — `sliceId`/`stepId` as plain fields, no derived geometry

```ts
export interface BackboneStep {
  id: string;      // uid("step")
  text: string;
  order: number;   // left-to-right column order
}

export interface ReleaseSlice {
  id: string;      // uid("slice")
  name: string;    // "MVP", "Release 2", ...
  order: number;   // 0 = first/top release band, ascending = later releases
}

export interface StoryCard {
  id: string;          // uid("card")
  stepId: string;      // which backbone column
  sliceId: string | null; // which release band; null = unsliced backlog
  text: string;
  order: number;       // position within its (stepId, sliceId) cell
}

export interface StoryMapRecord extends ToolRecordBase {
  title: string;         // the journey this map tells, e.g. "New account setup"
  steps: BackboneStep[];
  slices: ReleaseSlice[];
  cards: StoryCard[];
}
```

`ToolRecordBase` (contract) requires `productId`; `story-map-store.ts` follows
`ost-store.ts`'s precedent exactly — `resolveActiveProduct().id` on create,
even though this tool has no multi-product narrative of its own. One factory,
one convention, no special case. Deleting a step or slice never cascades to
its cards (contract D7 pattern, same as OST/opportunity deletion): orphaned
cards fall back to "Unassigned step" / "Backlog (unsliced)" rendering rather
than disappearing, so text is never silently lost.

### D3. Store: `createToolStore`, one scope key

`src/utils/story-map-store.ts` wraps
`createToolStore<StoryMapRecord>({ storageKey: "storymap-v1", idPrefix: "map" })`.
Unlike `ost-store.ts`, there is exactly one embed context today (the
standalone tool), so the active-pointer scope key is the constant
`"standalone"` rather than a computed `contextKeyFor(source)` — no `OstSource`-
style union is introduced ahead of a second use case (a second post embed, if
it ever happens, is the trigger to generalize, mirroring how OST only grew a
source union once course chapters needed it).

### D4. Grid rendering: plain CSS grid + horizontal scroll, no canvas library

`StoryMapGrid.tsx` renders backbone steps as `grid-template-columns` tracks
and slice rows as `grid-template-rows` tracks (CSS grid, native browser
layout — no `react-d3-tree`, no new dependency). Wide maps (many backbone
steps) scroll horizontally inside a bounded container rather than zooming;
`StoryMapBuilder.tsx` reuses the OST tool's fullscreen pattern (`createPortal`
+ `Escape`-to-exit + URL-mirrored `?map=full` param) for a maps-with-many-
columns case, matching `TreeBuilder.tsx`'s fullscreen mechanics exactly, but
there is no pan/zoom transform to reimplement — a wide CSS grid in a
`overflow-x-auto` container is the entire "canvas."

`StoryMapGrid` takes a `readOnly?: boolean` prop: when true, no `<select>`/
arrow controls render, only the backbone header, cards, and slice-row labels
— this is what the post embed uses, so the same component (and the same
Tailwind/token classes) render both the interactive builder and the
illustrative post embed. Rejected alternative: a separate static `.astro`
component duplicating the grid markup — rejected because it would drift from
the interactive version's styling the first time either changes.

### D5. Post embed: `StoryMapExample.tsx`, hardcoded data, `client:visible`

The post converts from `.md` to `.mdx` (URL unaffected — `stripDatePrefix` in
`content.config.ts` strips the extension before deriving the slug) and adds
one import + one embed under "The map: a backbone and slices," using
`client:visible` rather than `client:load` (precedent:
`TreeBuilder.tsx` embeds use `client:load` because they're interactive above
the point a reader reaches them quickly; this embed is read-only and further
down the page, so lazy hydration is the better default — no interaction is
lost by deferring it).

`StoryMapExample.tsx` hardcodes the exact vignette the post already narrates
in prose (backbone: Sign up → Set up project → Invite team → Do core work →
Share result; slices: MVP, Release 2) as a literal `StoryMapRecord`-shaped
object — not persisted, not editable, no store import at all — passed to
`<StoryMapGrid readOnly .../>`, plus a "Build your own map →" link to
`/tools/story-map/`. This is deliberately *not* a live, editable `TreeBuilder`-
style embed (rejected alternative): the post's own example is fixed narrative
content the essay refers back to by name ("the previous plan... had scheduled
three consecutive sprints inside the first backbone column"), so letting a
reader's edits silently replace it would break the essay's argument on next
load. A reader who wants to experiment gets the link to the standalone tool
instead, which is a fresh, editable map of their own.

### D6. Page and components mirror the OST tool

- `src/pages/tools/story-map.astro` — `SiteShell`, eyebrow "Free tool" hero
  naming Jeff Patton's story map and linking back to the blog post, one
  `client:load` `StoryMapBuilder` island, "everything saves in your browser"
  copy.
- `src/components/tools/story-map/`:
  - `StoryMapGrid.tsx` — presentational grid (D4), shared by builder and
    example embed.
  - `StoryMapBuilder.tsx` — editor: step/card/slice CRUD, `<select>`-based
    step/slice assignment, up/down reordering, Markdown export, fullscreen,
    help modal trigger, dashboard toggle (mirrors `TreeBuilder.tsx`'s props:
    `kicker`/`title`/`instructions`/`showDashboard`).
  - `StoryMapSwitcher.tsx` — mirrors `OstTreeSwitcher.tsx`: list/create/
    delete maps.
  - `StoryMapDashboard.tsx` — mirrors `OstDashboard.tsx`: management grid on
    the standalone page.
  - `StoryMapHelpModal.tsx` — mirrors `OstHelpModal.tsx`: explains backbone,
    slice, and "why a tower of cards under one step is a warning sign,"
    tying back to the post's own vocabulary.
  - `StoryMapExample.tsx` — the read-only post embed (D5).

React is already sanctioned for tool islands; styling uses Tailwind utilities
wired to `tokens.css` variables only; list fade-ins use
`<ScrollReveal delay={Math.min(i, 4) * 40}>` per site convention.

### D7. Markdown export

Mirrors `TreeBuilder.tsx`'s `toMarkdown`: backbone read aloud as one line,
then one section per slice in release order, then a trailing "Backlog
(unsliced)" section, cards listed under their backbone step's label within
each section.

```md
# Story map: <title>

**Backbone:** Sign up → Set up project → Invite team → Do core work → Share result

## MVP
- Sign up: <card text>
- Set up project: <card text>
...

## Release 2
...

## Backlog (unsliced)
...
```

## Risks / Trade-offs

- [Grouped-band model can't show a slice that's "mostly done in one column,
  barely started in another" the way a freeform cut line visually would] →
  accepted (D1): the post's own discipline is that a slice is one release
  cutting across every column equally; a per-column dip would be the "backbone
  as org chart" failure mode the post warns against, not a feature to
  preserve.
- [Wide maps with many backbone steps could be awkward on mobile] →
  `overflow-x-auto` container (same pattern already used for `TreeDiagram`'s
  bounded canvas) plus the existing fullscreen affordance; no new mobile-
  specific work scoped here.
- [Two dropdowns per card (step + slice) could feel like more clicks than a
  drag] → accepted trade-off per the library-adoption ritual: matches
  `OpportunitySorter.tsx`'s existing click-only precedent and avoids a new
  dependency; revisit only if usage feedback says otherwise.
- [`.md` → `.mdx` rename touches a file with edit history] → purely additive
  (one import, one embed, no prose changed); `content.config.ts`'s
  `generateId`/`stripDatePrefix` already handles both extensions identically,
  confirmed by reading the loader config.
- [localStorage quota/private mode] → inherited silent-degrade behavior from
  `createToolStore`; tool remains usable in-session.
- [No test framework in repo] → gates are `pnpm check` and `pnpm build` plus a
  scripted manual smoke in tasks.md, per the contract's ruling (no vitest
  added for one tool).

## Migration Plan

Greenfield: new page, new component directory, new store key (`storymap-v1`).
One existing file renamed with an additive edit
(`2025-02-06-user-story-mapping-fixing-the-flat-backlog.md` →
`...-flat-backlog.mdx`, plus one import and one embed block). Rollback: delete
the new page/components/store, revert the rename (git handles the rename as a
delete+add or a tracked rename depending on similarity — either reverts
cleanly). No storage migration needed for a future shape change: bump to
`storymap-v2` with a read-old/write-new migration function passed to
`createToolStore`, mirroring `migrateLegacy`/`backfillIds` in `ost-store.ts`.

## Open Questions

- **Cross-tool join with Vertical Slicer:** a card here could optionally carry
  a `StoryRef` to pull in an already-sliced story instead of retyping its
  text. Deferred — this change's cards are plain text by design (structural
  tool, not a spec-splitting output), and adding the join now would couple two
  independently-shippable proposals. Revisit as a follow-up bead if both tools
  ship and users ask for it.
- **Second embed context:** if a second post or course chapter ever wants its
  own editable (not read-only) map, that's the trigger to generalize
  `story-map-store.ts`'s single `"standalone"` scope key into an
  `OstSource`-style union (D3) — not built preemptively here.
