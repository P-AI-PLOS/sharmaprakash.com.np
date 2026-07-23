# Design — Spec Builder Tool

> Contract of record:
> `openspec/changes/donut-crm-pipeline-data-contract/design.md`. Every shape
> this tool persists or references (`OstPickRef`, `SpecRef`,
> `AcceptanceCriterionRef`, `ToolRecordBase`, `createToolStore`, `uid`, the
> `pm-spec-v1` key and `spec`/`ac` prefixes) is defined there and consumed
> here unchanged.

## Context

The site is static Astro 6.3; tools are React 19 islands persisting to
localStorage. The shipped reference is the OST builder:
`src/pages/tools/opportunity-solution-tree.astro` (thin page, SiteShell, one
`client:load` island) and `src/components/tools/ost/` (TreeBuilder ~460
lines, dashboard, help modal, switcher, diagram), persisting via
`src/utils/ost-store.ts`.

In OST, an opportunity has a boolean `target` flag (the 🎯 "starred"
opportunity — at most one per tree, toggled in `TreeBuilder`), and its
`solutions` are plain strings. "Starred opportunity + solution" therefore
means: the target opportunity plus one solution the visitor picks under it.
Neither carries a stable id — which is exactly why the contract's
`OstPickRef` is index+snapshot based.

Spec Builder is stage 03 (Definition) in the Donut CRM pipeline: it consumes
the Discovery output (OST) and produces the spec that Vertical Slicer
(`SpecRef`) and Test Register (`AcceptanceCriterionRef`) consume.

## Goals / Non-Goals

**Goals:**
- Turn one `OstPickRef` into one spec record with a consciously chosen format.
- Make the output format a visible, stored, switchable choice among three
  shapes: lightweight PRD, Shape Up pitch, story-map outline.
- A light framing moment before the picker that names the job each format
  does — align a room, hand off scope, sequence a release.
- Stable `uid("spec")` / `uid("ac")` ids so downstream joins never touch
  array indexes.
- Read OST data without ost-store knowing Spec Builder exists.

**Non-Goals:**
- Rich-text editing, templates beyond the three formats, spec versioning,
  collaboration, import/export beyond Markdown download.
- Content migration between formats when the visitor switches format mid-spec
  (see D4 — sections are per-format; shared fields carry over).
- Any change to `ost-store.ts` or `pipeline-store.ts`.
- Pipeline chrome (stage nav, product switcher UI) — `pipeline-tools-chrome`
  follow-up owns that; this page uses `resolveActiveProduct()` silently.

## Decisions

### D1. One-directional read of ost-store (the integration risk, addressed)

**Risk being designed around:** Spec Builder must resolve and re-resolve an
`OstPickRef` against live OST data, but `ost-store.ts` must not learn that
Spec Builder exists — no callbacks, no registry, no new exports, no schema
change (no ids retrofitted onto tree nodes).

**Decision:** Spec Builder imports only ost-store's existing public API —
`listTrees()`, `getTree(id)`, `titleFor(record)` and the `OstRecord` /
`OstOpportunity` types — all of which already exist for the OST UI. The pick
flow reads: `listTrees()` to populate the tree selector, `getTree(id)` to
show opportunities/solutions, and on selection writes an `OstPickRef`
(ids + indexes + text snapshots) into the spec record. Re-resolution on later
loads is a pure function `resolvePick(ref): { status: "live" | "drifted" |
"missing"; text }` living in Spec Builder's own code
(`src/utils/spec-store.ts` or a component-local helper), comparing
`getTree(ref.ostRecordId)?.tree.opportunities[ref.opportunityIndex]` texts
against the snapshots per contract rule D5. The dependency arrow points one
way; deleting Spec Builder leaves OST byte-identical. Verified by tasks:
`git diff` must show `ost-store.ts` untouched.

Alternative (add `getPickables()` or node ids to ost-store) rejected — churns
a shipped tool and violates the contract's explicit non-goal.

### D2. Record shape

Per contract D8, plus tool-internal fields:

```ts
export type SpecFormat = "prd" | "shape-up-pitch" | "story-map";

export interface SpecRecord extends ToolRecordBase {   // id = uid("spec")
  title: string;                    // defaults from the picked solution text
  sourcePick: OstPickRef | null;    // null = manual entry (no trees yet)
  framingJob: "align" | "handoff" | "sequence" | null; // null = skipped
  format: SpecFormat;               // stored + visible, never hardcoded
  sections: Record<string, string>; // keys defined per format, D4
  acceptanceCriteria: Array<{ id: string /* uid("ac") */; text: string }>;
}
```

Store: `createToolStore<SpecRecord>({ storageKey: "pm-spec-v1", idPrefix:
"spec" })` in `src/utils/spec-store.ts`, plus the format-section definitions
and `resolvePick`. No hand-rolled persistence.

### D3. Framing moment is guidance, not a gate

A single question card above the format picker: "What's the job here?" with
three answers — *align a room* → suggests pitch, *hand off unambiguous
scope* → suggests PRD, *sequence a release* → suggests story map. Choosing
one pre-selects (highlights) the suggested format; the visitor can still pick
any format, and a "skip" affordance goes straight to the picker. The answer
is stored (`framingJob`) purely so reopening a spec doesn't re-ask.
Alternative (multi-step wizard with the framing as step 1 of N) rejected —
heavier than the job warrants and gates the tool on a reflective question.

### D4. Three formats = one record, per-format section keys

One `SpecRecord` regardless of format; `format` selects which section keys
render as labeled textareas:

| Format | Section keys (in render order) |
|--------|-------------------------------|
| `prd` | `problem`, `outcome`, `nonGoals`, `successMetric` |
| `shape-up-pitch` | `problem`, `appetite`, `solution`, `rabbitHoles`, `noGos` |
| `story-map` | `backbone`, `walkingSkeleton`, `laterSlices` (newline-per-item outline textareas) |

Switching format keeps the whole `sections` bag — shared keys (`problem`)
reappear; format-specific ones are hidden but not deleted, so an accidental
switch loses nothing. The picked opportunity text pre-fills `problem`; the
solution text pre-fills `solution` (pitch) / seeds `outcome` context (PRD) /
seeds the `backbone` first line (story map). Acceptance criteria render as
their own list below the sections in **every** format — they are the
contract surface, not a format feature. Alternative (three distinct record
types / discriminated union) rejected: downstream tools join on `specId` and
`acceptanceCriteria` only, so format polymorphism buys nothing and costs
three code paths.

Story-map depth is deliberately shallow (an outline, not a grid) — this is a
spec scaffolder; real slicing is Vertical Slicer's job.

### D5. Page and component layout (mirrors OST)

- `src/pages/tools/spec-builder.astro` — SiteShell, hero copy (Free tool
  eyebrow, links to the CDH course and the Shape Up-adjacent post series),
  one `client:load` island.
- `src/components/tools/spec-builder/SpecBuilder.tsx` — orchestrator island
  (pick → framing → format → sections → criteria → export), owns store
  wiring, mirrors TreeBuilder's role.
- `SpecOstPicker.tsx` — tree/opportunity/solution selection + drift badge +
  "no trees yet" empty state (link to the OST tool + manual-entry fallback).
- `SpecFormatPicker.tsx` — framing question card + the three format cards.
- `SpecSwitcher.tsx` — list/create/delete/rename specs for the active
  product (mirrors OstTreeSwitcher against the factory's active pointer).
- Markdown export as a pure function beside the components (same pattern as
  TreeBuilder's exporter), rendering the format-appropriate headings plus an
  "Acceptance criteria" section and a "Source" line citing the OST pick.

Styling: existing Tailwind token utilities only (`text-display-lg`,
`text-muted`, `link-underline`, `text-accent-700`, surface classes), same as
the OST components; no new tokens expected, so no `design.md` (root) edit
unless one is actually added.

### D6. Product scoping

On mount the island calls `resolveActiveProduct()` and stamps `productId` on
every created spec; the per-product active pointer (`pm-spec-v1-active`)
remembers the open spec. No product-switcher UI in this change (contract Open
Question / `pipeline-tools-chrome` follow-up) — the single global active
product is sufficient for the guided pipeline.

## Risks / Trade-offs

- [OST pick drifts or source tree deleted after pick] → contract D5 rule:
  render the stored snapshots always; `resolvePick` badges "source
  changed/removed"; never block editing, never clear the ref. Worst case the
  visitor re-picks.
- [Visitor has trees but none has a target opportunity] → picker shows all
  opportunities but flags the 🎯 one as recommended; pick is not restricted
  to the target (the star is discovery guidance, not a lock). Avoids a dead
  end where the tool refuses input.
- [Format switch mid-writing confuses visitors] → sections persist across
  switches (D4); the format picker stays visible on the editor (a compact
  segmented control), making the current format explicit at all times.
- [Contract change not yet implemented when this lane starts] → hard
  dependency, stated in proposal Impact; tasks 1.x cannot start until
  `pipeline-store.ts` exists. If lanes run in parallel, this lane starts with
  the store module tasks stubbed against the contract's D2 interface, which
  is declared stable.
- [No test framework in repo] → same gate set as the contract change:
  TypeScript via `pnpm check`, `pnpm build`, and a scripted manual smoke
  pass; scenario steps in the spec delta double as the manual test script.

## Migration Plan

Greenfield: new page, new component dir, new store key. Nothing to migrate;
rollback = delete the three new paths (no other code imports them).
`/tools/spec-builder/` is a new URL — no locked-URL constraints apply.

## Open Questions

- Should the "Donut CRM" sample product ship with one pre-filled sample spec
  (contract Open Question, per-tool decision)? Leaning **no** for v1 — the
  OST pick flow is the point of the tool and a canned spec bypasses it;
  revisit when the running-case demo content lands.
- Exact hero/marketing copy and whether the tool gets a card on any listing
  page (there is currently no `/tools/` index) — copy at implementation
  time; a tools index page is out of scope and would be its own change.
- Whether the CDH course should embed Spec Builder as an exercise (as OST is
  embedded via `source: course`). The store factory's product-scoped pointer
  doesn't model course contexts; deferred — standalone page only in v1.
