## Why

"Backlog Cleanup: How to Actually Do It"
(`src/content/posts/2025-04-10-backlog-cleanup-how-to-actually-do-it.md`, "Step
two: triage the survivors into now, next, never") defines a 3-bucket triage —
**Now** (committed, this cycle), **Next** (a size-limited short queue, within a
quarter), **Never** (said out loud, closed with a reason) — entirely as static
prose. The site already has a live, working precedent for exactly this
interaction — classify N items into a small fixed set of labeled buckets with
instant feedback — in `src/components/course/exercises/OpportunitySorter.tsx`
and `AssumptionClassifier.tsx`. Making the post's own framework interactive,
using the reader's real backlog items instead of Donut CRM's fictional ones,
turns "read about triage" into "do the triage," the same way
`/tools/opportunity-solution-tree/` did for the OST posts.

## What Changes

- Add `/tools/backlog-triage/` — a static Astro page hosting a React island
  (localStorage only, no backend), following the page-shell shape of
  `src/pages/tools/opportunity-solution-tree.astro`.
- Add `src/components/tools/backlog-triage/` (React 19 island components):
  a reader types or bulk-pastes their own backlog items, then sorts each into
  **Now / Next / Never** — a linear 3-bucket board (not a 2x2 grid; see design
  D1 for why this is intentionally simpler than the sibling matrix tool). Both
  a keyboard-operable move action and native pointer drag are supported —
  no drag-and-drop library is added.
- Add `src/utils/backlog-triage-store.ts` built with `createToolStore` from
  the pipeline data contract (`storageKey: "pm-backlog-triage-v1"`,
  `idPrefix: "triage"`), used as-is (no contract changes) exactly the way
  `src/utils/ost-store.ts` already uses it for a tool that isn't part of the
  Donut CRM pipeline stages either.
- Convert `2025-04-10-backlog-cleanup-how-to-actually-do-it.md` to `.mdx` and
  embed the board directly under "Step two," next to the existing prose
  (prose stays; the board makes it interactive), mirroring how
  `TreeBuilder` is embedded in the continuous-discovery `.mdx` posts. The
  post's locked URL is unaffected — content-collection ids strip the file
  extension (`src/content.config.ts`), so `.md` → `.mdx` does not change the
  slug.
- "Never" items carry an optional one-line reason field, reflecting the
  post's point that closing with a stated reason is the whole mechanism (not
  enforced/blocking — the tool nudges, it doesn't gate).
- A soft, non-blocking nudge appears when the Next column grows past a small
  threshold, reflecting the post's "Next has a size limit by definition."
- Markdown export of the board, grouped by bucket, for pasting into a real
  tracker.

## Capabilities

### New Capabilities
- `backlog-triage-sorter`: the Now/Next/Never triage board — reader-authored
  items, bulk paste, click-to-move and drag-to-move between three buckets,
  optional never-reason, a soft Next-size nudge, Markdown export, and the
  standalone-page + post-embed pattern with per-context active board
  resolution.

### Modified Capabilities
- (none) — this change is additive only and uses the existing
  `pipeline-data-contract` capability (`createToolStore`, `ToolRecordBase`,
  `resolveActiveProduct`) without modification, the same way the OST tool
  does.

## Impact

- **New code:** `src/pages/tools/backlog-triage.astro`,
  `src/components/tools/backlog-triage/*.tsx`,
  `src/utils/backlog-triage-store.ts`.
- **Modified content:** rename
  `src/content/posts/2025-04-10-backlog-cleanup-how-to-actually-do-it.md` to
  `.mdx` and add an import + embed under "Step two." No other prose content
  changes; frontmatter (`directory`, `series`, `seriesOrder`, dates) carries
  over unchanged.
- **Depends on (must already be applied):** `donut-crm-pipeline-data-contract`
  — `src/utils/pipeline-store.ts` (`createToolStore`, `ToolRecordBase`, `uid`,
  `resolveActiveProduct`). Already applied and in use by `ost-store.ts`.
- **Sibling changes noted, no shared code:** `agreement-certainty-matrix-tool`
  (being authored concurrently) adapts the same two exercise components into
  a 2x2 quadrant tool for a different post; `backlog-prioritizer-tool`
  (Donut CRM pipeline stage 04) is a different, product/quarter-scoped
  Agreement/Certainty matrix over Vertical Slicer stories. Neither overlaps
  this change's files or store keys.
- **Constraints honored:** static Astro 6.3, localStorage only, React islands
  only, tokens from `tokens.css` (no new color tokens — buckets are
  distinguished by label/icon/emphasis, not a red/green palette that doesn't
  exist in the token set), no new dependencies.
- **Trackers:** no open beads exist for this work today; a close-out task
  files the follow-up beads.
