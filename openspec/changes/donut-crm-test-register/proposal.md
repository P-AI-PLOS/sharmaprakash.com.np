# Donut CRM Pipeline — Test Register (QA ring flagship)

## Why

The Donut CRM pipeline covers how work gets defined and shipped, but nothing
covers how anyone knows it works. The Test Register is the flagship tool of a
new QA ring — a full parallel persona ring that co-operates stages 03
Definition, 05 Delivery Cadence, and 06 Feedback & Adoption alongside the core
Product/PO pipeline. It is the pipeline's deepest content investment, aimed
squarely at testing practice in 2026 and beyond, where AI writes and maintains
a meaningful share of test code: the register makes AI-authored test debt
*visible* — when the story or acceptance criterion a test scenario verifies
changes underneath it, the scenario is flagged stale instead of silently
continuing to look green.

## What Changes

- Add `/tools/test-register/` — a free, browser-only tool page
  (`src/pages/tools/test-register.astro`) following the shape of
  `/tools/opportunity-solution-tree/`: SiteShell, hero copy, one React island,
  everything in localStorage, nothing leaves the browser.
- Add `src/utils/test-register-store.ts` built on the pipeline data contract's
  `createToolStore<T>()` (storage key `pm-testreg-v1`, id prefix `test`, per
  the contract's normative tables). Each `TestScenarioRecord` carries:
  - a description of the scenario in plain language;
  - at least one link to what it verifies — a `StoryRef` (Vertical Slicer)
    and/or an `AcceptanceCriterionRef` (Spec Builder), each stored alongside a
    text snapshot taken at link time (contract rule D5);
  - an automation status: `not-automated` → `ai-drafted` → `human-reviewed`;
  - a `specPath` — where the Playwright spec file would live in a real
    codebase (e.g. `e2e/orders/discount-code.spec.ts`). The tool is a
    planning/tracking register; it never executes anything.
- **Staleness as real product behavior, not copy**: on load, each scenario's
  refs are re-resolved against the Spec Builder and Vertical Slicer stores.
  If the referenced story/criterion text no longer matches the stored
  snapshot — or the target was deleted — the scenario is flagged
  **"stale — spec may need AI regeneration"**, overriding its stored status
  in every list and rollup. A "mark regenerated" action re-snapshots and
  resets the scenario to `ai-drafted` (pending human review again).
- Add a coverage view: per spec, the fraction of acceptance criteria with at
  least one non-stale scenario; per spec, the fraction of its sliced stories
  with at least one non-stale scenario — surfaced as an explicit **gap list**
  (uncovered criteria/stories), not a vanity percentage.
- Add components under `src/components/tools/test-register/` (React island,
  icon-island rule respected: this is an interactive tool island like
  `tools/ost/`, not runtime site chrome).
- Substantive teaching content on the page (practitioner-voiced): how to run
  a test register when AI drafts the specs, why "stale" is the status that
  matters, and how `specPath` conventions map register rows to a real
  Playwright suite.

## Capabilities

### New Capabilities

- `test-register-tool`: the QA-ring test scenario register — scenario records
  linked to stories and acceptance criteria via contract refs, snapshot-based
  staleness detection, automation-status lifecycle, and the coverage gap
  rollup, all persisted browser-side per product.

### Modified Capabilities

_None. `openspec/specs/` has no deployed capabilities yet; the
`pipeline-data-contract` capability (proposed in
`openspec/changes/archive/2026-07-23-donut-crm-pipeline-data-contract/`) is consumed as-is —
this tool needs no new shared shapes beyond what its design.md already
defines for Test Register (`StoryRef`, `AcceptanceCriterionRef`,
`pm-testreg-v1`, prefix `test`)._

## Impact

- **New code:** `src/pages/tools/test-register.astro`,
  `src/utils/test-register-store.ts`,
  `src/components/tools/test-register/*` (React 19 island components).
- **Depends on (proposal-level):** `donut-crm-pipeline-data-contract`
  (`src/utils/pipeline-store.ts` — `createToolStore`, `ToolRecordBase`,
  `StoryRef`, `AcceptanceCriterionRef`, `resolveActiveProduct`). Must land
  first.
- **Reads sibling stores (parallel lanes):** Spec Builder
  (`openspec/changes/donut-crm-spec-builder/`, store `pm-spec-v1`,
  `acceptanceCriteria: Array<{ id, text }>`) and Vertical Slicer
  (`openspec/changes/vertical-slicer-tool/`, store `pm-slice-v1`, stories
  with `uid("story")` ids). Read-only via `listForProduct`; the register
  degrades gracefully (guided empty state) if either sibling hasn't shipped
  or holds no data. It never mutates their records.
- **No changes** to `ost-store.ts`, routes, or existing pages. No new
  dependencies. Static build unaffected (`pnpm build`).
- **Trackers:** no open beads exist for this work today; a close-out task
  files follow-up beads for deferred items.

## Non-goals

- No test execution, no Playwright runner, no CI integration, no code
  generation — the register tracks intent and staleness only.
- No shared "pipeline chrome" (stage nav / product switcher) — deferred to
  the `pipeline-tools-chrome` follow-up named in the data contract.
- No import of real spec files or repo scanning; `specPath` is a declared
  convention, not a verified path.
- No sample scenario seeding beyond the contract's "Donut CRM" product seed
  (sample scenarios are meaningless until sibling tools hold sample specs and
  stories — revisit as a cross-tool follow-up).
