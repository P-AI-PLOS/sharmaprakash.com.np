# OKR Organizer — Stage 01 of the Donut CRM Pipeline

## Why

The Donut CRM pipeline (see `openspec/changes/archive/2026-07-23-donut-crm-pipeline-data-contract/design.md`,
the contract of record) starts at stage 01 "Vision & OKRs", but no tool exists
for it yet — the only shipped pipeline-adjacent tool is the OST builder
(stage 02 Discovery, `/tools/opportunity-solution-tree/`). Four downstream
tools (Backlog Prioritizer, Cadence & Reflection Kit, OKR Check-In,
Stakeholder Update Composer) all join on OKR key results via `OkrKeyResultRef`,
so the pipeline cannot proceed until OKRs exist as addressable data. Beyond
plumbing, the tool teaches a discipline: Jeff Gothelf's customer-centric OKR
form — an accountable owner ("who"), a behavior-change verb ("does what"), a
measured amount ("by how much") — instead of vague aspirational objectives.

## What Changes

- Add `/tools/okr-organizer/` — a free, browser-only tool page
  (`src/pages/tools/okr-organizer.astro`), same page shape as the OST tool:
  `SiteShell`, hero copy, one `client:load` React island.
- Add `src/utils/okr-store.ts` built on `createToolStore<OkrRecord>()` from the
  shared contract (`pm-okr-v1` / `pm-okr-v1-active`, id prefixes `okr` and
  `kr`), with the contract-mandated record shape:
  `{ ...ToolRecordBase, quarter: QuarterRef, objective, keyResults: [{ id: uid("kr"), who, doesWhat, byHowMuch }], tag: { kind: "department" | "product", label } }`.
- Add React island components under `src/components/tools/okr/`:
  - `OkrOrganizer.tsx` — the top-level island (product resolution via
    `resolveActiveProduct()`, quarter selection, entry list + editor).
  - `OkrEntryForm.tsx` — objective + key-result editor with explicit
    who / does-what / by-how-much fields per KR, and a department/product tag.
  - `FormatChooser.tsx` — the first-principles framing moment shown before
    the entry form: "Why an OKR here — not a Rock or a bare North Star
    metric?" A dismissible explainer (persisted dismiss flag), not a gate.
  - `QuarterHistory.tsx` — quarter-over-quarter view: entries grouped by
    `quarterKey`, sorted with `compareQuarters`, so a visitor sees how OKRs
    evolved.
- Key results carry stable `uid("kr")` ids from creation — the output other
  tools consume as `OkrKeyResultRef` (Backlog Prioritizer links plots to KRs;
  OKR Check-In records actuals per KR and drafts next quarter's `okr` record
  through this tool's store).
- No backend, no CMS, nothing leaves the browser — identical constraints to
  the OST tool.

## Capabilities

### New Capabilities

- `okr-organizer`: capture and browse customer-centric OKRs (objective +
  who/does-what/by-how-much key results), tagged to a department or product,
  scoped one quarter at a time with quarter-over-quarter history, persisted in
  localStorage per the pipeline data contract, exposing stable KR ids for
  downstream tools.

### Modified Capabilities

_None. `pipeline-data-contract` is consumed as-is — this tool implements the
record shape D8 already reserves for the OKR Organizer, so no delta against
that capability is needed._

## Impact

- **New code:** `src/pages/tools/okr-organizer.astro`,
  `src/components/tools/okr/{OkrOrganizer,OkrEntryForm,FormatChooser,QuarterHistory}.tsx`,
  `src/utils/okr-store.ts`.
- **Hard dependency:** `src/utils/pipeline-store.ts` from change
  `donut-crm-pipeline-data-contract` — **that change must be implemented
  first**; this proposal builds nothing the contract doesn't sanction.
- **No changes** to `ost-store.ts`, the OST tool, routes, or content
  collections. New URL `/tools/okr-organizer/` is additive; existing locked
  URLs untouched.
- **No new dependencies:** React 19 island + Tailwind tokens + lucide-react
  (already used by the OST components).
- **Downstream consumers (future changes):** Backlog Prioritizer, Cadence &
  Reflection Kit, OKR Check-In, Stakeholder Update Composer read this store's
  records via `listForProduct` and `OkrKeyResultRef`.

## Non-goals

- No progress tracking, scoring, or confidence check-ins — that is the OKR
  Check-In tool (stage 06, its own change).
- No org hierarchy, cascading/alignment trees, multi-user anything, or
  export — this is a personal-site teaching tool, not an OKR platform.
- No shared "pipeline chrome" (stage nav / product switcher island) — still
  deferred per the contract's open question (`pipeline-tools-chrome`).
- No course-embed variant (unlike the OST builder); standalone page only,
  embeds can come later if a course needs one.
