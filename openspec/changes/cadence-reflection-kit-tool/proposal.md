# Cadence & Reflection Kit — stage 05 delivery-cadence tool

## Why

The Donut CRM pipeline (see `openspec/changes/archive/2026-07-23-donut-crm-pipeline-data-contract/design.md`,
the contract of record) covers vision → definition → backlog, but has no stage-05
tool: nothing turns a prioritized backlog into shipped work on a rhythm with a
reflection loop. Every delivery tool on the market defaults to Scrum vocabulary;
this tool deliberately does not — it names the job first (backlog → shipped work,
on a rhythm, with reflection) and lets the visitor pick the ritual (Sprint, Flow,
or Scrumban), teaching the method-agnostic stance the site's content argues for.

## What Changes

- Add `/tools/cadence-reflection-kit/` — a static Astro page hosting one React
  island, localStorage-only, per the existing OST tool pattern
  (`src/pages/tools/opportunity-solution-tree.astro`).
- Add `src/utils/cadence-store.ts` built on the pipeline contract's
  `createToolStore` (`storageKey: "pm-cadence-v1"`, `idPrefix: "cad"`). Records
  are quarter-scoped (`quarter: QuarterRef`) and product-scoped (`productId`).
- **Cadence mode selection gates everything.** Before any tracking UI, the
  visitor picks a mode for the quarter: `sprint` (velocity + burndown-style
  per-iteration tracking), `flow` (WIP limit + cycle-time tracking, Kanban),
  or `scrumban` (flow discipline + lightweight planning-cadence check). The
  chosen mode drives which metric inputs and summaries render — there is no
  generic all-metrics dashboard.
- **Retro action log**: a running log of retro entries, each committing to
  exactly one action (the UI nudges toward one action, not a laundry list),
  with a done/carried-over status visible across entries.
- **Demo-day checklist**: each demo entry must answer "which key result does
  this demo move" via `OkrKeyResultRef` into the OKR Organizer's store
  (sibling change `okr-organizer-tool`), rendered with the contract's D5
  snapshot/badge rule when the KR is missing or reworded.
- No backend, no new dependencies, no changes to any other tool's store.

## Capabilities

### New Capabilities

- `cadence-reflection-kit`: the stage-05 delivery-cadence tool — method-agnostic
  cadence-mode selection (sprint / flow / scrumban) with mode-specific metric
  tracking, a one-action retro log, and an OKR-linked demo-day checklist,
  persisted per product and quarter in localStorage.

### Modified Capabilities

_None. `openspec/specs/` has no deployed capabilities yet; the
`pipeline-data-contract` capability (in-flight sibling change) is consumed
as-is — this tool needs no delta to it._

## Impact

- **New code:**
  - `src/pages/tools/cadence-reflection-kit.astro`
  - `src/components/tools/cadence-reflection-kit/` (React 19 islands:
    kit shell, mode picker, mode-specific metrics panel, retro log,
    demo checklist)
  - `src/utils/cadence-store.ts`
- **Depends on (proposal-level, not yet implemented):**
  - `donut-crm-pipeline-data-contract` → `src/utils/pipeline-store.ts`
    (`createToolStore`, `QuarterRef` + helpers, `OkrKeyResultRef`,
    `resolveActiveProduct`). This change cannot be implemented before that one.
  - `okr-organizer-tool` (sibling, in-flight) → read-only lookups of OKR
    records/key results for the demo checklist. The kit degrades gracefully
    (D5 badge rule) when no OKR data exists.
- **Read by (future):** the Test Register tool (QA ring, separate proposal)
  will read the active cadence mode to phase its own reflection UI —
  forward-compatibility note only, no integration built here.
- **Trackers:** no existing bd issue covers this tool (`bd list` shows none for
  stage 05); the implementation lane should file one bead when work starts and
  close it at ship. No beads are closed by this proposal.
- **Constraints honored:** static Astro 6.3, Tailwind v4 tokens, React islands
  only, localStorage only, locked URL shapes untouched, no new dependencies.
