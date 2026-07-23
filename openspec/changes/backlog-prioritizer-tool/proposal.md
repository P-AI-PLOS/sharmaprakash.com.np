# Backlog Prioritizer — Agreement/Certainty Matrix Tool

## Why

The Donut CRM pipeline (see `openspec/changes/archive/2026-07-23-donut-crm-pipeline-data-contract/design.md`,
the contract of record) defines Backlog Prioritizer as stage 04, downstream of
Vertical Slicer and OKR Organizer: the place where sliced stories become an
ordered, strategy-checked backlog. The site already teaches this exact method —
the 2021 post "Agreement-Certainty Matrix: Sorting a CRM Backlog by How Well
It's Actually Understood"
(`src/content/posts/2021-05-21-agreement-certainty-matrix-backlog-triage-recap-crm.md`)
walks through Stacey's Agreement & Certainty 2x2 on a CRM backlog. This tool
makes that post interactive, the same way `/tools/opportunity-solution-tree/`
made the OST posts interactive. The differentiator over generic prioritizers:
it surfaces what to **kill or probe**, not just what to rank — low-agreement /
low-certainty stories are pulled into an explicit decision queue instead of
being silently sorted to the bottom.

## What Changes

- New page `src/pages/tools/backlog-prioritizer.astro` (route
  `/tools/backlog-prioritizer/`), mirroring the OST tool page shape:
  `SiteShell` + one `client:load` React island, localStorage only, no backend.
- New component namespace `src/components/tools/backlog-prioritizer/`:
  - `BacklogPrioritizer.tsx` — root island (product/quarter resolution, store wiring)
  - `MatrixBoard.tsx` — the Agreement/Certainty 2x2; place and move story dots
  - `StoryPicker.tsx` — lists Vertical Slicer stories for the active product; adds them as `StoryRef`s
  - `DecisionQueue.tsx` — Complex/Chaotic items awaiting an explicit probe / kill / defer call
  - `PriorityList.tsx` — the ordered per-quarter output, with Markdown export
  - `MatrixHelpModal.tsx` — zone explainer, linking the 2021 posts
- New store `src/utils/backlog-store.ts` built with
  `createToolStore<BacklogRecord>({ storageKey: "pm-backlog-v1", idPrefix: "bklg" })`
  per the contract's D2/D4. One `BacklogRecord` per (product, quarter), carrying
  `quarter: QuarterRef` and an `items[]` of plotted stories.
- Cross-tool joins use the contract's reference types only: `StoryRef` (into
  Vertical Slicer's output) and `OkrKeyResultRef` (into OKR Organizer's key
  results), each with title snapshots and D5 drift badges. Sibling tools'
  internal shapes are never assumed.
- Quadrant logic and terminology match the 2021 post exactly: **Simple**
  (execute), **Complicated** (bring in the expert), **Complex** (probe before
  committing — or kill), **Chaotic** (stabilize now). No invented 2x2 scheme.

## Capabilities

### New Capabilities

- `backlog-prioritizer`: the Agreement/Certainty matrix tool — plotting
  Vertical Slicer stories on the 2x2, Stacey-zone classification, the
  kill/probe decision queue for Complex and Chaotic items, OKR key-result
  linkage and filtering, and the ordered per-quarter priority list persisted
  under the pipeline data contract.

### Modified Capabilities

_None with requirement changes. Note: the contract's D4 id-prefix table
(`donut-crm-pipeline-data-contract`, not yet applied) has no row for the
Backlog Prioritizer's own record prefix; this proposal uses `bklg` and asks the
contract lane to add that row — see design.md Open Questions. No behavioral
requirement of `pipeline-data-contract` changes._

## Impact

- **New code only:** one page, six components under a new
  `tools/backlog-prioritizer/` namespace, one store module. No changes to
  existing routes, posts, or `ost-store.ts`.
- **Depends on (merge order):** `donut-crm-pipeline-data-contract`
  (`src/utils/pipeline-store.ts` must exist first), and — for live data —
  the Vertical Slicer and OKR Organizer store modules. The tool degrades
  gracefully when those stores are empty or their changes haven't landed yet
  (empty states link to the sibling tools); only the type-level contract
  imports are hard dependencies.
- **Read by:** Stakeholder Update Composer, via
  `listForProduct(productId)` on `pm-backlog-v1` (already sanctioned by the
  contract's D8). No tool references individual backlog items by id today;
  item ids stay tool-internal (see design.md for a suggested future
  `BacklogItemRef` if that changes).
- **Constraints honored:** static Astro, React island only, Tailwind tokens
  (no hardcoded colors/px), no new dependencies (drag/placement via pointer
  events, icons via existing `lucide-react`), locked URL shape.
- **Beads:** no open beads exist for this work today (`bd ready` is empty);
  tasks include filing follow-up beads at close-out.
