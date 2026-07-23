# Design — OKR Check-In (Stage 06: Feedback & Adoption)

> **Contract of record:**
> `openspec/changes/archive/2026-07-23-donut-crm-pipeline-data-contract/design.md`. Every type,
> storage key, id prefix, and cross-tool reference in this document is taken
> from that contract (D2, D4, D5, D6, D8). Where this tool needs one shape the
> contract does not yet provide (the draft-OKR marker), this change carries a
> delta against the `pipeline-data-contract` capability, exactly as that
> contract instructs.

## Context

Static Astro 6.3 site; interactive tools are React 19 islands persisting to
localStorage only. Reference implementation:
`src/pages/tools/opportunity-solution-tree.astro` +
`src/components/tools/ost/{TreeBuilder,OstDashboard,OstHelpModal,OstTreeSwitcher,TreeDiagram}.tsx`
+ `src/utils/ost-store.ts` (versioned key, `Record<id, record>`, in-memory
cache, silent try/catch JSON I/O, separate active-pointer key).

OKR Check-In is stage 6 of 6 in the Donut CRM pipeline — the only stage
designed to loop rather than terminate. Inputs: the active quarter's OKR entry
from OKR Organizer (`pm-okr-v1`, joined via `OkrKeyResultRef`). Output: a
`draft: true` OKR record for `nextQuarter(...)` written back into OKR
Organizer's store, so Stage 01 never restarts from a blank page.

Sibling lanes in flight: `donut-crm-pipeline-data-contract` (this tool's
prerequisite), `okr-organizer-tool` (scaffolded, artifacts not yet written —
coordination point noted below), `donut-crm-spec-builder` (no overlap).

## Goals / Non-Goals

**Goals:**
- Minimum viable quarter-close ritual: per key result, log actual, confidence
  flag, reflection.
- "Adoption isn't launch-week": 2–3 timestamped metric snapshots per key
  result across the quarter, with a trend readout that distinguishes sustained
  movement from a spike that faded.
- Loop-closing handoff: draft next quarter's OKR entry into OKR Organizer's
  store, surfaced by that tool for accept/edit — never a silent mutation of
  committed entries, never a private copy.
- Same page/component/store shape as the OST tool; contract compliance via
  `createToolStore`.

**Non-Goals:**
- OKR scoring frameworks, weighted grading, history dashboards, charts
  libraries (the trend readout is a hand-rolled 3-dot sparkline, tokens only).
- Editing OKR Organizer's committed records, or shipping any OKR Organizer
  component code from this lane.
- Pipeline chrome/nav (deferred `pipeline-tools-chrome`), export/import,
  cross-tab sync, reminders.

## Decisions

### D1. Store: `createToolStore` with the contract's assigned key/prefix

`src/utils/checkin-store.ts` wraps
`createToolStore<CheckInRecord>({ storageKey: "pm-checkin-v1", idPrefix: "chk" })`
(contract D4 tables) and adds tool-specific helpers (`resolveCheckIn`,
snapshot/entry mutators). No hand-rolled persistence.

### D2. Record shape: one check-in per OKR entry, entries keyed by key-result id

```ts
export type CheckInConfidence = "solid" | "noisy" | "contested";

export interface MetricSnapshot {
  at: number;        // epoch ms — when the number was read
  value: number;
  note?: string;     // e.g. "launch week", "post-onboarding fix"
}

export interface KeyResultCheckIn {
  ref: OkrKeyResultRef;                              // contract D2
  krSnapshot: { who: string; doesWhat: string; byHowMuch: string }; // D5 snapshot at link time
  snapshots: MetricSnapshot[];                       // 0..n, sorted by `at`
  actual: number | null;                             // quarter-close outcome
  confidence: CheckInConfidence | null;
  reflection: string;
}

export interface CheckInRecord extends ToolRecordBase {
  quarter: QuarterRef;        // contract D6 — the quarter being closed
  okrId: string;              // the OKR Organizer entry this check-in closes
  okrObjectiveSnapshot: string; // D5 snapshot for rendering after drift
  entries: KeyResultCheckIn[];  // one per key result at link time
  draftedOkrId: string | null;  // uid("okr") of the drafted next-quarter entry
}
```

Rationale: the check-in is per OKR entry (not per key result) because the
ritual is "close the quarter for this OKR", and the drafted output is one OKR
record. Entries carry no own `uid()` — nothing outside this tool references
them; they are addressed by `ref.keyResultId`, which IS a stable contract id
(prefix `kr`). This honors the stable-id rule without minting an unneeded
prefix. `actual` is separate from `snapshots` on purpose: the close-out number
is a deliberate final answer, while snapshots are observations; the UI offers
"use latest snapshot as actual" as a convenience.

Alternative considered: one record per key result — rejected; drafting and
quarter history would then need aggregation across records for no benefit.

### D3. Reading OKR data: through `src/utils/okr-store.ts`, snapshots per D5

The check-in page lists the active product's OKR entries via OKR Organizer's
store module (`okr-organizer-tool` lane; record shape fixed by contract D8).
When the visitor picks the OKR to close, the tool seeds one `KeyResultCheckIn`
per key result, storing `OkrKeyResultRef` + `krSnapshot`. On every load,
refs re-resolve against `pm-okr-v1`: live text when found, snapshot with a
"source changed/removed" badge when the KR was deleted or reworded (contract
D5). Deleting the OKR never deletes the check-in (D7).

If a key result was ADDED to the OKR after the check-in was created, the tool
offers a one-click "sync key results" that appends new entries (never removes
existing ones — their logged data is the point of the tool).

### D4. Trend readout: pure display heuristic, tool-internal

Per entry, render snapshots as a tiny 3-dot/segment sparkline (plain SVG,
`var(--accent-*)` tokens, no chart dependency) plus one computed tag:

- fewer than 2 snapshots → "not enough points yet";
- last value is the max (within 5%) → "trend holding";
- an earlier snapshot is the max and the last value has given back more than
  a third of the peak-to-first gain → "spike faded";
- otherwise → "mixed".

The tag is computed at render time, never persisted — thresholds can be tuned
without a storage migration. Alternative (persisting a trend verdict) rejected:
derived data in localStorage goes stale the moment a snapshot is added.

### D5. Write-back: a `draft: true` OKR record via OKR Organizer's store — not a mutation, not a private copy

This is the loop-closing feature, and the contract already dictates the
mechanism (D8: "the drafted next-quarter OKR is created through OKR
Organizer's store (a new `okr` record with `quarter: nextQuarter(...)`), not a
private copy"). Concretely, "Draft next quarter's OKR":

1. Builds an `OkrRecord` (contract D8 shape) with `quarter:
   nextQuarter(checkIn.quarter)`, the same `productId` and `tag`, objective
   copied from the closed entry, and one key result per entry the visitor
   includes in the draft (default-selected: entries with `confidence:
   "solid"` and a logged actual). Each drafted KR gets a **fresh `uid("kr")`**
   (ids are never reused across quarters), `who`/`doesWhat` carried over, and
   `byHowMuch` pre-filled from the achieved actual as the new baseline (e.g.
   "from 42/week to —"), left for the user to finish in OKR Organizer.
2. Stamps the handoff marker `draft: true` and
   `draftedFrom: { checkinId, quarterKey }` — the small contract extension
   this change's `pipeline-data-contract` delta adds. OKR Organizer's UI
   surfaces draft records distinctly ("Drafted from your Q3 check-in") and
   accepting is simply clearing `draft` (that requirement lives in the delta,
   implemented by the organizer lane).
3. Persists via `createOkr(...)` from `src/utils/okr-store.ts` and stores the
   returned id in `checkIn.draftedOkrId`.

Why not write `pm-okr-v1` directly with a second `createToolStore` handle?
Two modules owning one key means two in-memory caches and duplicated
domain helpers — exactly the "duplicate OKR Organizer's internal logic"
failure mode. Importing the store module keeps one owner per key; the contract
types make the import safe. Why not a "pending drafts" inbox inside
`pm-checkin-v1` that OKR Organizer polls? That inverts the dependency (Stage
01 reading Stage 06's store) and duplicates the OKR shape — rejected.

**Graceful degradation:** if OKR Organizer ships before its draft-badge UI,
a `draft: true` record still renders as a normal editable OKR entry — the
handoff loses its badge, not its data. So the lanes can land in either order
once both proposals agree on the field (they do, via the shared delta).

**Idempotency:** if `draftedOkrId` still resolves, the button becomes "Update
draft" and rewrites that record's key results *only while it is still
`draft: true`*; once accepted (or if deleted), Check-In offers "Draft again"
creating a fresh record. Committed entries are never touched.

### D6. Page and components mirror the OST tool

- `src/pages/tools/okr-check-in.astro` — SiteShell, eyebrow/H1/intro hero,
  one `client:load` island, copy states "everything saves in your browser".
  New URL (locked URLs are unaffected; this adds a route).
- `src/components/tools/okr-check-in/`:
  - `CheckInTool.tsx` — the island: resolves active product
    (`resolveActiveProduct()`), OKR picker, quarter display, entry list,
    draft panel; owns store wiring.
  - `KeyResultCheckInCard.tsx` — one key result: resolved/badged KR text,
    snapshot log + sparkline + trend tag, actual, confidence toggle,
    reflection textarea.
  - `NextQuarterDraftPanel.tsx` — include/exclude checkboxes per entry,
    draft/update-draft action, link-out to `/tools/okr-organizer/`.
  - `CheckInSwitcher.tsx` — prior-quarter check-ins for the product
    (list via `listForProduct`, sorted `compareQuarters`), mirrors
    `OstTreeSwitcher`.
  - `CheckInHelpModal.tsx` — mirrors `OstHelpModal`: what a check-in is, why
    snapshots beat launch-week numbers, what drafting does.

React is already sanctioned for tool islands (the OST tool is precedent);
styling uses Tailwind utilities wired to `tokens.css` variables only; list
fade-ins use `<ScrollReveal delay={Math.min(i, 4) * 40}>` per site convention.

### D7. Empty states drive the ritual

- No products / first visit → `resolveActiveProduct()` seeds "Donut CRM".
- No OKR entries for the product → explainer + link to `/tools/okr-organizer/`
  ("Stage 01 — set the OKR this stage will close").
- OKR picked, mid-quarter → the tool is still useful: snapshot logging is
  enabled immediately; actual/confidence/draft sit under a "Quarter close"
  section that works at any time (no date gating — visitors control their own
  ritual).

## Risks / Trade-offs

- [okr-organizer-tool lane defines a conflicting store API] → the record shape
  is contract-fixed (D8); this design depends only on `createOkr`-style
  create + list/get, which `createToolStore` guarantees. The draft fields ride
  in this change's `pipeline-data-contract` delta so both lanes read one
  normative source. Flagged in Open Questions for the orchestrator.
- [Draft field forgotten by organizer UI] → degradation is graceful (D5):
  draft renders as a normal entry; no data loss.
- [Visitor closes the same OKR twice] → the OKR picker badges entries that
  already have a check-in for that quarter and opens the existing record
  instead of duplicating (one check-in per okrId+quarter, enforced in
  `resolveCheckIn`).
- [Numbers vs free-form KRs — `byHowMuch` is prose, actual is a number] →
  `actual` stays a plain number with no unit parsing; the KR text renders next
  to it so the visitor supplies context. Unit-aware parsing is out of scope.
- [localStorage quota/private mode] → inherited silent-degrade behavior from
  `createToolStore`; tool remains usable in-session.
- [No test framework in repo] → per the contract's ruling, gates are
  TypeScript (`pnpm check`) and `pnpm build` plus a scripted manual smoke in
  tasks.md; no vitest added for one tool.

## Migration Plan

Greenfield: new page, new component dir, new store key (`pm-checkin-v1`).
Nothing existing is modified. Rollback = delete the three additions; the only
external artifacts are `draft: true` OKR records, which remain valid,
user-deletable OKR Organizer entries. Future shape changes bump to
`pm-checkin-v2` with a read-old/write-new migration, mirroring
`migrateLegacy` in ost-store.

## Open Questions

- **Cross-lane sync (for the orchestrator):** `okr-organizer-tool` is
  scaffolded but its artifacts are not yet written. Its proposal must (a)
  export a `createOkr`/store handle from `src/utils/okr-store.ts` and (b)
  include the draft-surfacing requirement from this change's
  `pipeline-data-contract` delta (badge + accept action). Both are one-liners
  against the contract D8 shape, but they need to be in that lane's specs.
- Should the drafted objective be copied verbatim or prefixed ("Continue:
  …")? Shipping verbatim copy — the user edits it in OKR Organizer anyway;
  revisit if drafts prove confusing.
- Snapshot cadence nudges ("you haven't logged a mid-quarter point") are
  deferred — they edge toward reminders, a stated non-goal.
