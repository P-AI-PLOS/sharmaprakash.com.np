# Donut CRM Pipeline — Shared Data Contract

## Why

Eight interactive PM tools (OKR Organizer, Spec Builder, Vertical Slicer, Backlog
Prioritizer, Cadence & Reflection Kit, OKR Check-In, Test Register, Stakeholder
Update Composer) are about to be built as separate OpenSpec changes, each by an
independent agent lane. They all hang off one per-product record (the "Donut CRM"
running case) and reference each other's data — a starred OST solution feeds Spec
Builder, specs feed the Vertical Slicer, stories feed the Backlog Prioritizer and
Test Register, and three tools share quarter scoping. Without one agreed contract
defined up front, eight lanes will invent eight incompatible localStorage shapes
and the pipeline never joins up.

## What Changes

- Add `src/utils/pipeline-store.ts`: the shared, localStorage-only contract module
  that every pipeline tool imports. It defines:
  - `ProductRecord` — the per-product umbrella record (name, timestamps) with its
    own versioned store (`pm-products-v1`) and a single active-product pointer
    (`pm-active-product-v1`). `ProductRecord.id` is the join key every tool store
    carries as `productId`. First visit seeds a "Donut CRM" sample product.
  - `QuarterRef` (`{ year, quarter: 1|2|3|4 }`) plus `quarterKey`/`parseQuarterKey`/
    `currentQuarter` helpers — the single quarter representation used by OKR
    Organizer, Cadence & Reflection Kit, and OKR Check-In.
  - Cross-tool reference shapes: `OstPickRef` (starred opportunity + solution from
    an existing `OstRecord`, joined by stable `opportunityId`/`solutionId` post
    migration, with text snapshots for badge display), `SpecRef`, `StoryRef`,
    `OkrKeyResultRef`, `AcceptanceCriterionRef`.
  - `ToolRecordBase` (`id`, `productId`, `createdAt`, `updatedAt`) and a minimal
    `createToolStore<T>()` factory replicating the proven ost-store persistence
    pattern (versioned key, in-memory cache, try/catch JSON, scope-keyed active
    pointer) so the eight tools — and OST itself — share one implementation
    instead of hand-rolling divergent copies.
  - Shared `uid(prefix)` id generator and the id-prefix / storage-key naming
    conventions each tool must follow.
- Document (in `design.md`) the entity-ownership map: which tool owns which
  entity, which ids are referenced by whom, and the stale-reference rule
  (snapshot at pick time, re-resolve on load, badge when the source is gone).
- Migrate `src/utils/ost-store.ts` onto the factory (see `design.md` D9): add
  stable ids to tree/opportunity/solution nodes, add `productId`, keep the
  existing `ost-trees-v1`/`ost-active-v1` storage keys and every public
  function signature the OST page and course embed already call — no callers
  change.

## Capabilities

### New Capabilities

- `pipeline-data-contract`: the shared product record, quarter scoping, id and
  storage-key conventions, cross-tool reference shapes, and tool-store factory
  that all Donut CRM pipeline tools persist against in localStorage.

### Modified Capabilities

_None. `openspec/specs/` is empty; this is the repo's first capability._

## Impact

- **New code:** `src/utils/pipeline-store.ts` (types + ~150 lines of helpers).
  No pages, no components, no visible UI ship in this change.
- **Changed code:** `src/utils/ost-store.ts` re-implemented on top of
  `createToolStore` (D9) — storage keys and every exported function
  name/signature stay the same, so the OST tool page and course embed need no
  changes.
- **Downstream:** the eight follow-up tool proposals each build their own store
  on `createToolStore` and import the reference shapes from this module; their
  design docs must cite this change's `design.md` as the contract of record.
- **Constraints honored:** static Astro site, localStorage only, no backend/CMS,
  React islands only. No new dependencies.

## Non-goals

- No cross-tab sync, export/import, or schema-validation library — see
  `design.md` Goals/Non-Goals for the rationale (minimum viable contract for a
  personal-site teaching tool, not a general-purpose framework).
- No implementation of any of the eight tools — each gets its own proposal.
