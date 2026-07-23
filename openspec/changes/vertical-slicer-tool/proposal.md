# Vertical Slicer — Definition-Stage Pipeline Tool

## Why

Stage 03 (Definition) of the Donut CRM pipeline currently ends at Spec Builder:
a visitor can turn a starred OST solution into a spec, but has no way to break
that spec into independently-shippable stories — the single hardest habit to
teach ("vertical slices, not horizontal layers"). Backlog Prioritizer and Test
Register are both specified to consume `StoryRef`s, so until a tool mints
`story` ids the downstream half of the pipeline has nothing to join on. The
shared data contract (`donut-crm-pipeline-data-contract`) already reserves this
tool's storage key (`pm-slice-v1`), id prefix (`story`), and reference shapes
(`SpecRef` in, `StoryRef` out) — this change builds the tool against that
contract.

## What Changes

- Add `/tools/vertical-slicer/` — a static Astro page hosting one React island,
  mirroring the shipped `/tools/opportunity-solution-tree/` page shape
  (`SiteShell`, hero copy, `client:load` island, everything in localStorage).
- Add `src/components/tools/vertical-slicer/` with a `Slicer` island plus small
  supporting components (session switcher, dashboard, help modal — same
  decomposition as `src/components/tools/ost/`).
- Add `src/utils/slicer-store.ts` built on `createToolStore` from
  `src/utils/pipeline-store.ts` (key `pm-slice-v1`, prefix `slice` for the
  session record; stories inside it carry `uid("story")` ids per the contract's
  prefix table).
- Core interaction: the visitor writes (or pulls via `SpecRef`) a "big feature"
  description, then assigns it to one of three recognized slicing patterns —
  **workflow steps** (happy path first, then edge steps), **business rules**
  (one rule variant per slice), **data variations** (one data type/format per
  slice) — and names the resulting slices as stories.
- Each story gets a visible **"independently shippable?" check**: a fixed
  3-item checklist (delivers end-to-end value on its own / demoable to a user /
  doesn't depend on a later slice to work). Stories that fail render with a
  "horizontal layer" warning, not silently accepted.
- Stories carry stable `uid("story")` ids and the `SpecRef` (+ spec-title
  snapshot) they were sliced from — the exact `StoryRef` shape Backlog
  Prioritizer and Test Register will consume.
- Markdown export of the sliced backlog (same export affordance as the OST
  tool).

## Capabilities

### New Capabilities

- `vertical-slicer-tool`: the /tools/vertical-slicer/ page and island that
  slices a spec (referenced via `SpecRef`) into independently-shippable
  stories using recognized slicing patterns, checks each slice against a
  visible shippability checklist, and persists stories with stable
  `uid("story")` ids under `pm-slice-v1` for downstream tools.

### Modified Capabilities

_None. `pipeline-data-contract` is consumed as-is (its D2/D4/D5/D8 rules cover
this tool); no requirement in it changes._

## Impact

- **New code:** `src/pages/tools/vertical-slicer.astro`,
  `src/components/tools/vertical-slicer/*` (React 19 island components),
  `src/utils/slicer-store.ts`. No new dependencies (lucide-react, existing
  Tailwind tokens only).
- **Depends on:** `donut-crm-pipeline-data-contract` — `src/utils/pipeline-store.ts`
  must land first (this change imports `createToolStore`, `uid`,
  `ToolRecordBase`, `SpecRef`, `resolveActiveProduct`).
- **Sibling in flight:** `spec-builder` is proposed in parallel. This tool
  references specs only through the contract's `SpecRef` + snapshot/badge rule
  (design.md D5), so it works — with manual spec entry — even before Spec
  Builder ships.
- **Downstream:** Backlog Prioritizer and Test Register join on the `StoryRef`
  shape (`storyId` + `specId`) minted here; story ids must survive edits and
  reorders (contract stable-id rule).
- **No route, token, or content changes**; existing OST tool untouched.
- **Beads:** no open bd issues track this work (`bd list` is empty); no
  close-outs owed.
