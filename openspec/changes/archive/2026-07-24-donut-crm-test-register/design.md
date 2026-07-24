# Design — Test Register (QA ring flagship)

> **Contract of record:**
> `openspec/changes/archive/2026-07-23-donut-crm-pipeline-data-contract/design.md`. This tool
> builds its store with `createToolStore` on storage key `pm-testreg-v1` and
> id prefix `test`, references sibling data only through `StoryRef` and
> `AcceptanceCriterionRef`, and follows the D5 snapshot/re-resolve/badge rule
> exactly. No shape defined here may conflict with that file.

## Context

Static Astro 6.3 site; interactive tools are React 19 islands persisting to
localStorage (reference: `src/pages/tools/opportunity-solution-tree.astro` +
`src/components/tools/ost/*` + `src/utils/ost-store.ts`). The pipeline data
contract (`src/utils/pipeline-store.ts`, proposed, not yet implemented)
supplies `createToolStore<T>()`, `ToolRecordBase`, `resolveActiveProduct()`,
and the ref shapes.

The Test Register is the flagship of the **QA ring** — a parallel persona
ring that co-operates three pipeline stages rather than owning one:

| Stage | What the QA ring does there | Register feature |
|-------|-----------------------------|------------------|
| 03 Definition | turns acceptance criteria and sliced stories into named test scenarios before code exists | scenario creation, `StoryRef`/`AcceptanceCriterionRef` links |
| 05 Delivery Cadence | tracks which scenarios are automated, AI-drafted, or human-reviewed as slices ship | automation-status lifecycle, `specPath` |
| 06 Feedback & Adoption | shows where the spec has drifted from the tests that "cover" it | stale flags, coverage gap list |

The 2026 reality this tool teaches: AI drafts and regenerates a meaningful
share of Playwright specs. The failure mode is no longer "we forgot to write
the test" — it is "the test was generated from a spec that has since changed,
and nothing tells you." Staleness detection is therefore the core product
behavior, not a badge bolted on.

Sibling lanes proposed in parallel (directories exist, artifacts pending):
`donut-crm-spec-builder` (specs with `acceptanceCriteria: Array<{ id:
uid("ac"), text }>` — contract D8) and `vertical-slicer-tool` (stories with
`uid("story")` ids and a `SpecRef`). The register reads both stores read-only.

## Goals / Non-Goals

**Goals:**
- A per-product register of test scenarios, each tied to ≥1 story and/or
  acceptance criterion via contract refs with text snapshots.
- Automatic, unavoidable stale flagging when a referenced story/criterion
  changed or was deleted after the scenario was linked or last re-baselined.
- A coverage rollup that leads with *gaps* (uncovered criteria/stories per
  spec), with the fraction as secondary context.
- An automation-status lifecycle that models AI-in-the-loop testing honestly:
  `not-automated` → `ai-drafted` → `human-reviewed`, with staleness as a
  derived override, and "mark regenerated" resetting to `ai-drafted`.
- Practitioner-grade page content: register discipline, spec-path
  conventions, why human review is the gate after every AI regeneration.

**Non-Goals:**
- Executing tests, generating Playwright code, verifying `specPath` exists,
  CI/webhook integration, flake tracking, or test-run history.
- Pipeline chrome (stage nav / product switcher island) — deferred to
  `pipeline-tools-chrome` per the contract's Open Questions.
- Editing Spec Builder or Vertical Slicer data from this tool (contract D8:
  read via `listForProduct`, never mutate).
- Sample scenario seeding (depends on sibling sample data; follow-up).

## Decisions

### D1. Record shape — status stored as lifecycle, staleness derived

```ts
// src/utils/test-register-store.ts
import type { ToolRecordBase, StoryRef, AcceptanceCriterionRef } from "~/utils/pipeline-store";

export type AutomationStatus = "not-automated" | "ai-drafted" | "human-reviewed";

/** A ref plus the D5 snapshot taken when it was linked or last re-baselined. */
export interface LinkedStory {
  ref: StoryRef;
  storyText: string;    // snapshot
  specTitle: string;    // snapshot, for grouping when the spec is gone
}
export interface LinkedCriterion {
  ref: AcceptanceCriterionRef;
  criterionText: string; // snapshot
  specTitle: string;     // snapshot
}

export interface TestScenarioRecord extends ToolRecordBase {
  // id: uid("test") — stamped by the factory
  description: string;
  stories: LinkedStory[];        // stories.length + criteria.length >= 1
  criteria: LinkedCriterion[];
  status: AutomationStatus;
  specPath: string;              // e.g. "e2e/orders/discount-code.spec.ts"; may be ""
  notes?: string;
}

export const testRegisterStore = createToolStore<TestScenarioRecord>({
  storageKey: "pm-testreg-v1",   // contract D4 table
  idPrefix: "test",
});
```

The user-facing status vocabulary is four values — *not yet automated /
AI-drafted / human-reviewed / stale* — but **stale is never persisted**. It is
computed on every load by re-resolving refs (D2). Rationale: a stored `stale`
flag rots the moment the source changes again while the tab is closed;
deriving it means the register can never *display* fresh while the source has
drifted, which is the entire point. Alternative (persist `stale` on a
detection pass) rejected: it turns a pure function of two stores into state
that needs its own invalidation.

`update()` on the factory bumps `updatedAt`; re-baselining (D3) rewrites the
snapshot fields through the same `update` path — no extra timestamps needed.

### D2. Drift detection — resolver over both sibling stores

A pure helper in the store module (unit of logic, island-independent):

```ts
export type LinkResolution =
  | { state: "live"; currentText: string }
  | { state: "changed"; currentText: string }  // id found, text ≠ snapshot
  | { state: "removed" };                      // spec/story/criterion gone

export function resolveScenarioLinks(rec: TestScenarioRecord): {
  perStory: LinkResolution[];
  perCriterion: LinkResolution[];
  stale: boolean;   // true iff any link is "changed" or "removed"
};
```

- Story lookup: Vertical Slicer's store (`pm-slice-v1`) →
  record containing `storyId`; compare current story text to `storyText`.
- Criterion lookup: Spec Builder's store (`pm-spec-v1`) → spec by `specId`,
  criterion by `criterionId` in `acceptanceCriteria`; compare `text` to
  `criterionText`.
- Whitespace-trimmed exact comparison. Any rewording counts as drift — for
  AI-generated specs, "the words changed" *is* the regeneration trigger;
  fuzzy-matching "minor" edits would hide exactly the class of change this
  tool exists to surface.

**Import coupling:** the register imports the sibling stores' public list
functions (expected `src/utils/spec-store.ts`, `src/utils/slice-store.ts` per
the contract's per-tool-module rule D1). Because lanes land independently,
all sibling reads go through one internal `sources.ts` adapter with a
narrow interface (`listSpecsForProduct`, `listStoriesForProduct`); if a
sibling module is absent or renamed at integration time, only the adapter
changes. If a store simply has no data, pickers show a guided empty state
linking to the sibling tool ("Slice a story in the Vertical Slicer first, or
add a scenario against an acceptance criterion"). Alternative (read sibling
localStorage keys raw, bypassing their modules) rejected: it duplicates their
parsing and breaks the moment they bump `-v2`.

### D3. The stale lifecycle — flag, regenerate, re-review

Displayed status = `stale` whenever `resolveScenarioLinks().stale`, rendered
as **"stale — spec may need AI regeneration"** with per-link detail
(which story/criterion changed, snapshot vs. current text shown side by
side; removed sources render the snapshot with the contract's
"source removed" badge). Two actions resolve it:

1. **Mark regenerated** — re-snapshots every *changed* link to current text
   and sets `status: "ai-drafted"`. Even if the scenario was
   `human-reviewed`, regeneration demotes it: an AI-regenerated spec is
   unreviewed by definition. This demotion is the single most important
   teaching beat in the tool and MUST NOT be softened into "keep status".
2. **Unlink** — removes a dead link (e.g. story deleted deliberately); if it
   was the last link, the scenario cannot be saved link-less — the visitor
   either links something else or deletes the scenario (contract D7: we never
   cascade, but we also never allow creating/keeping an unanchored scenario).

`removed` sources cannot be "regenerated" — only unlinked — since there is no
current text to re-baseline against.

Alternative considered: auto-re-baseline silently on load ("always show
current text"). Rejected outright — that is precisely the invisible-test-debt
behavior the tool exists to prevent.

### D4. Coverage view — gap list first, fraction second

Grouped by spec (from Spec Builder, plus a trailing group for scenarios whose
spec was removed):

- **Criteria coverage:** for each spec, list acceptance criteria with zero
  non-stale scenarios ("uncovered"), then criteria whose only coverage is
  stale ("covered by stale tests" — visually distinct, this is the AI-debt
  bucket), then the fraction `covered-non-stale / total` as a caption.
- **Story coverage:** same treatment over the spec's sliced stories.
- A scenario counts toward coverage only when **it itself is non-stale** —
  one drifted link poisons the whole scenario's coverage contribution,
  because a scenario half-generated from an old spec is not trustworthy
  coverage.

Rationale for gap-first: a percentage invites gaming and hides *which*
criterion is naked; the register's job is to hand the visitor tomorrow
morning's list. Alternative (donut/percent hero metric) rejected as vanity.

### D5. Page and component architecture (mirrors the OST tool)

```
src/pages/tools/test-register.astro          # SiteShell + hero + island + teaching content
src/components/tools/test-register/
  TestRegister.tsx        # root island (client:load): resolves active product,
                          # loads scenarios + sibling data, owns tab state
  ScenarioList.tsx        # register table/cards: description, links, status
                          # badge (incl. derived stale), specPath, actions
  ScenarioEditor.tsx      # create/edit form: description, story picker,
                          # criterion picker (grouped by spec), status, specPath
  CoveragePanel.tsx       # D4 gap lists + fractions, grouped by spec
  StatusBadge.tsx         # single source of truth for the 4-state badge styling
  RegisterHelpModal.tsx   # method explainer (mirrors OstHelpModal)
```

One island, `client:load`, on a static page — same as `TreeBuilder`. Styling
uses existing tokens/utilities only (`text-caption`, `border-ink-200`,
`bg-accent-50`, `link-underline`, …), per `design.md` law; the stale badge
uses existing warning-adjacent tokens — if none exists, add the token to
`tokens.css` and update the site `design.md` in the same commit, rather than
hardcoding a hex value. Fade-ins via `<ScrollReveal>` with the
`Math.min(i, 4) * 40` stagger cap for the register list. Icons from
`lucide-react` (already a dependency, used by OST components).

Active-record pointer (`pm-testreg-v1-active`) is unused-by-design in v1: the
register is a single flat view per product, not a switch-between-documents
tool. The factory provides it for free; the UI simply doesn't surface a
switcher. Recorded here so nobody "fixes" the missing switcher.

### D6. Teaching content lives on the page, help modal stays operational

The `.astro` page carries the deep content (the QA-ring flagship investment):
what a test register is, the four statuses with the regeneration-demotes-
review rule, `specPath` conventions (mirror the app's route/domain structure,
one scenario ↦ one `test()` block, file per feature area — e.g.
`e2e/orders/discount-code.spec.ts`), and why gap lists beat coverage
percentages. Written in the practitioner voice of someone who maintains
Playwright suites — concrete, no QA-101 filler. The help modal repeats only
the operational quick-reference (statuses + actions). Rationale: page content
is crawlable/linkable (this page should rank for "test register" the way the
OST page does for its term); modal content is not.

### D7. Analytics

`src/utils/analytics.ts` (`trackEvent`) just landed behind a vendor-agnostic
service. The register emits a minimal set: `test_register_scenario_created`,
`test_register_marked_regenerated`, `test_register_marked_reviewed`, and
`test_register_stale_seen` (fired once per session when the register renders
with ≥1 stale scenario — the signal that the core behavior is being
witnessed). No PII, counts only.

## Risks / Trade-offs

- [Sibling lanes (spec-builder, vertical-slicer) slip or rename their store
  modules] → all reads isolated in `sources.ts`; the tool builds and works
  with empty pickers + guided empty states. Integration is a one-file fix.
  Do not block this lane on theirs beyond the shared data contract landing.
- [Exact-text drift comparison flags trivial edits (typo fixes)] → accepted
  on purpose; "mark regenerated" is one click, and under-flagging is the
  failure mode that costs real teams real escapes. Documented in page copy.
- [Scenario links N stories × M criteria → resolver cost on load] →
  localStorage-scale data (tens of records); resolution is O(links) against
  in-memory-cached stores. No memoization until it's a measured problem.
- [No test framework in repo] → same gate as the contract change: TypeScript
  (`pnpm check`) + `pnpm build` + scripted manual smoke (tasks list the exact
  drift scenarios to walk). `resolveScenarioLinks` is written as a pure
  function precisely so it's trivially unit-testable if vitest ever lands.
- [Stale derived on load only — drift while the tab is open isn't re-flagged
  live] → acceptable: cross-tab sync is a contract non-goal; a re-render or
  reload re-derives. Noted in help modal ("refresh after editing specs").

## Migration Plan

Greenfield: new page, new component dir, new store module under a fresh
localStorage key. Nothing existing changes; rollback = delete the three new
paths. Requires `donut-crm-pipeline-data-contract` implemented first
(hard dependency on `pipeline-store.ts` exports). Future record-shape changes
bump to `pm-testreg-v2` with read-old/write-new migration per the contract's
migration pattern.

## Open Questions

- Should "covered by stale tests only" partially count in the fraction
  (e.g. shown as `3/5 (+2 stale)`)? Current design: it does not count;
  displayed as a separate bucket. Revisit after first real use.
- Cross-tool sample data (Donut CRM demo scenarios pre-linked to demo
  specs/stories) needs coordination across three lanes — proposed as a
  follow-up change once spec-builder and vertical-slicer land their sample
  decisions (contract Open Question 3).
- Whether the QA ring eventually gets a second tool (e.g. exploratory-testing
  charter log) is out of scope; the ring framing on this page should not
  promise one.
