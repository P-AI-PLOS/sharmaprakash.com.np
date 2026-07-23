# OKR Check-In — Feedback & Adoption (Stage 06)

## Why

The Donut CRM pipeline's five upstream stages produce OKRs, specs, slices,
priorities, and cadence — but nothing closes the loop. Teams that set OKRs and
never reconcile them against actual outcome numbers restart every quarter from
a blank page, and "adoption" gets judged on launch-week spikes. OKR Check-In is
the sixth and final stage, and the only one designed to loop rather than
terminate: at quarter close it logs what each key result actually did, and then
drafts next quarter's OKR entry back into Stage 01 (OKR Organizer) pre-filled
with what really moved.

## What Changes

- Add `/tools/okr-check-in/` — a static Astro page hosting a React island
  (localStorage only, no backend), following the proven shape of
  `src/pages/tools/opportunity-solution-tree.astro` +
  `src/components/tools/ost/`.
- Add `src/utils/checkin-store.ts` built with `createToolStore` from the
  pipeline data contract (`storageKey: "pm-checkin-v1"`, `idPrefix: "chk"`).
- Quarter-close ritual: for each key result of the active quarter's OKR entry
  (joined via `OkrKeyResultRef` from OKR Organizer's `pm-okr-v1` store), log
  the actual outcome number, a confidence flag (solid / noisy / contested),
  and a free-text reflection.
- Adoption-isn't-launch-week signal: each key result entry accepts multiple
  timestamped metric snapshots across the quarter (early / mid / close), and
  the UI shows whether the trend held or was a spike that faded.
- Loop-closing handoff: a "Draft next quarter's OKR" action creates a new
  `okr` record in OKR Organizer's own store with
  `quarter = nextQuarter(checkIn.quarter)`, seeded from the key results that
  actually moved, marked `draft: true` with provenance — OKR Organizer's UI
  surfaces it for the user to accept or edit. OKR Check-In never silently
  rewrites committed OKR entries and never keeps a private copy of the draft.

## Capabilities

### New Capabilities

- `okr-check-in`: the quarter-close check-in tool — per-quarter check-in
  records with per-key-result actuals, confidence, reflections, mid-quarter
  metric snapshots with trend display, and the draft handoff of next quarter's
  OKR entry into OKR Organizer's store.

### Modified Capabilities

- `pipeline-data-contract`: delta adding one requirement — the draft-OKR
  handoff marker (`draft?: true` plus `draftedFrom` provenance on `okr`
  records), which is contract-level because OKR Check-In writes it and OKR
  Organizer reads it. The capability is introduced by the sibling change
  `donut-crm-pipeline-data-contract` (not yet applied); this delta extends it
  per that change's design.md instruction ("propose a delta against the
  `pipeline-data-contract` capability").

## Impact

- **New code:** `src/pages/tools/okr-check-in.astro`,
  `src/components/tools/okr-check-in/` (React 19 island components),
  `src/utils/checkin-store.ts`. No existing files modified except possibly a
  link from site chrome (out of scope here; see Non-goals).
- **Depends on (must land first):**
  - `donut-crm-pipeline-data-contract` — `src/utils/pipeline-store.ts`
    (`createToolStore`, `QuarterRef`/`nextQuarter`, `OkrKeyResultRef`,
    `ToolRecordBase`, `resolveActiveProduct`).
  - `okr-organizer-tool` — `src/utils/okr-store.ts` and its `OkrRecord` shape
    (contract design.md D8); Check-In writes draft records through that store
    and reads key results from it. OKR Organizer's UI must also surface
    `draft: true` records (coordination noted in design.md).
- **Constraints honored:** static Astro 6.3, localStorage only, React islands
  only, tokens from `tokens.css`, no new dependencies.
- **Trackers:** no open beads exist for this work today; a close-out task
  files the follow-up beads.

## Non-goals

- No OKR analytics platform: no charts library, no historical dashboards
  beyond the per-KR snapshot trend, no scoring frameworks (0.0–1.0 grading).
- No changes to OKR Organizer's components — surfacing drafts is a small
  contract-level requirement on that lane, not code shipped here.
- No pipeline-wide chrome/nav (deferred `pipeline-tools-chrome` follow-up per
  the contract change) and no site-nav link changes.
- No cross-tab sync, export/import, reminders/notifications, or multi-user
  anything.
