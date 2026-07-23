# Design — Cadence & Reflection Kit

> Contract of record: `openspec/changes/donut-crm-pipeline-data-contract/design.md`.
> This tool builds on `createToolStore`, `QuarterRef` (+ `currentQuarter`/
> `nextQuarter`/`compareQuarters`), `ToolRecordBase`, `OkrKeyResultRef`, and the
> D4 naming tables (`pm-cadence-v1` / `pm-cadence-v1-active`, id prefix `cad`)
> exactly as defined there. Nothing in this design invents a parallel shape.

## Context

The site is static Astro 6.3; tools are React 19 islands persisting to
localStorage (reference: `src/pages/tools/opportunity-solution-tree.astro` +
`src/components/tools/ost/*` + `src/utils/ost-store.ts`). This is stage 05
(Delivery Cadence) of the Donut CRM pipeline: it reads OKR Organizer data
(via `OkrKeyResultRef`) and is read by nothing yet — the Stakeholder Update
Composer will read it via `listForProduct`, and the Test Register will later
read the active cadence mode (see Forward compatibility).

The teaching stance is the point of the tool: delivery tooling that opens with
Scrum vocabulary smuggles in a method decision. Here the *job* comes first —
turn a backlog into shipped work, on a rhythm, with a reflection loop — and the
ritual (Sprint / Flow / Scrumban) is an explicit, changeable choice that
reshapes the UI.

## Goals / Non-Goals

**Goals:**
- One cadence record per product per quarter, mode-gated: no tracking UI until
  a mode is chosen, and the chosen mode determines which metrics exist.
- Minimum viable metric tracking per mode (a handful of numbers per period,
  hand-entered — this teaches the loop, it does not integrate with anything).
- A retro log that structurally nudges toward exactly one committed action per
  entry, with carry-over visibility.
- A demo-day checklist whose first question is "which key result does this
  demo move" (`OkrKeyResultRef`), applying the contract's D5 snapshot/badge rule.

**Non-Goals:**
- Not a Jira competitor: no boards, no work items, no drag-and-drop, no
  automatic metric computation from tickets (there are no tickets).
- No charting library — metrics render as simple token-styled lists/bars in
  plain markup. No new dependencies.
- No integration with Test Register (forward-compat note only), no export, no
  cross-tab sync.
- No changes to `pipeline-store.ts`, `ost-store.ts`, or any sibling tool store.

## Decisions

### D1. One record per product × quarter, mode stored on the record

`CadenceRecord` extends `ToolRecordBase` and carries `quarter: QuarterRef` and
`mode: "sprint" | "flow" | "scrumban" | null`. `null` means "job named, ritual
not yet chosen" — the kit renders the mode picker and nothing else until mode
is set. The record for the current quarter is resolved on load
(`listForProduct` + `compareQuarters` match on `currentQuarter()`), created
empty if absent; past quarters remain readable history.

Alternative — separate records per retro/demo entry (like OST's one-record-
per-tree): rejected; retro entries and demo items are line items *within* one
quarter's cadence, and the contract's D6 already says quarter-scoped tools
keep one record per quarter with history = sort by `compareQuarters`.

### D2. Record shape (tool-internal per contract D8, listed for the lane)

```ts
// src/utils/cadence-store.ts
import type { ToolRecordBase, QuarterRef, OkrKeyResultRef } from "~/utils/pipeline-store";

export type CadenceMode = "sprint" | "flow" | "scrumban";

/** One hand-entered tracking period (an iteration or a week, per mode). */
export interface CadencePeriod {
  id: string;                 // uid("cad") — stable, reorder-safe
  label: string;              // "Sprint 3" / "Week of Jul 20"
  // sprint: committed + completed points (velocity; burndown is the delta list)
  committed?: number;
  completed?: number;
  // flow / scrumban: WIP snapshot + finished-item cycle times (days)
  wipLimit?: number;
  wipObserved?: number;
  cycleTimesDays?: number[];
  // scrumban only: did the lightweight planning ritual happen this period?
  planningHeld?: boolean;
}

export interface RetroEntry {
  id: string;                 // uid("cad")
  date: number;               // epoch ms
  wentWell: string;
  didntGoWell: string;
  action: string;             // exactly ONE committed action — singular by schema
  actionStatus: "open" | "done" | "carried-over";
}

export interface DemoItem {
  id: string;                 // uid("cad")
  date: number;
  what: string;               // what is being demoed
  keyResult: OkrKeyResultRef | null;  // "which KR does this move" — asked first
  keyResultSnapshot: string;  // D5 snapshot of the KR text at link time ("" if none)
  done: boolean;
}

export interface CadenceRecord extends ToolRecordBase {
  quarter: QuarterRef;
  mode: CadenceMode | null;
  periods: CadencePeriod[];
  retros: RetroEntry[];
  demos: DemoItem[];
}
```

Store = `createToolStore<CadenceRecord>({ storageKey: "pm-cadence-v1",
idPrefix: "cad" })` plus a thin `resolveQuarterRecord(productId, quarter)`
helper. Nested line items get `uid("cad")` ids (stable-id rule; the contract
reserves one prefix per tool, and nothing external joins on line items, so one
prefix suffices — same reasoning as OST's single `ost_` prefix).

Alternative — deviate from the factory to store retros in their own key:
rejected, no reader needs them independently and D1 keeps one record.

### D3. Mode gates the UI; mode switch preserves data

Each mode renders a distinct metrics panel:

- **Sprint**: per-iteration committed vs completed; summary = rolling velocity
  (mean of last 3 completed) and a per-period committed/completed bar.
- **Flow**: WIP limit vs observed WIP (breach highlighted), cycle times per
  period; summary = median cycle time trend.
- **Scrumban**: the Flow panel *plus* a per-period "planning cadence held?"
  check — flow discipline with a lightweight planning heartbeat, not a third
  metric system.

There is deliberately **no** "all metrics" view. Switching mode mid-quarter is
allowed (it is a teaching tool; people should experiment): the record keeps
all previously entered `CadencePeriod` fields and simply renders the fields
the new mode cares about, with a one-line note that earlier periods were
tracked under a different mode. Alternative — wipe metrics on switch:
rejected, silently destroying typed-in data to enforce purity is hostile;
alternative — store per-mode parallel arrays: rejected as bookkeeping the
optional fields already handle.

The mode picker itself is framing-first: three cards, each stating the rhythm
and the reflection loop it implies, preceded by one sentence naming the job.
Copy must not present Sprint as the default (card order: Flow, Scrumban,
Sprint is acceptable; no card pre-selected).

### D4. Retro log: one action, enforced by shape not by validation nagging

`RetroEntry.action` is a single string, not an array — the schema cannot hold
a laundry list. The form shows one action input with helper copy ("one action
you'll actually do — if everything is a priority, nothing is"). When the
previous entry's action is still `open`, the new-entry form surfaces it and
offers "carry over" (sets old to `carried-over`, prefills the new action) or
"mark done". Alternative — allow multiple actions with a soft warning:
rejected; the single-field shape *is* the lesson.

### D5. Demo checklist leads with the key result

The add-demo form asks for the key result *before* the free-text "what are you
demoing" field. KR options come from the OKR Organizer store (records for the
active product and current quarter, per contract D8 OKR shape); picking one
stores `OkrKeyResultRef` + a text snapshot. Per contract D5: on render,
re-resolve the ref; if the OKR/KR is gone or its text changed, show the
snapshot with a "source changed/removed" badge. If no OKR data exists at all,
the field renders an empty state linking to `/tools/okr-organizer/` and allows
`keyResult: null` — the checklist must not hard-block on a sibling tool, but
the null case renders a visible "not tied to a key result" marker rather than
hiding the question.

### D6. Page & component layout (mirrors the OST tool)

- `src/pages/tools/cadence-reflection-kit.astro` — SiteShell, hero copy
  (method-agnostic framing), one `client:load` island.
- `src/components/tools/cadence-reflection-kit/`:
  - `CadenceKit.tsx` — island root: resolves active product + current-quarter
    record, owns state, renders sections below.
  - `ModePicker.tsx` — the three-card job-first chooser.
  - `MetricsPanel.tsx` — renders the mode-specific inputs/summaries (internal
    per-mode subcomponents; split files only if any grows past ~200 lines).
  - `RetroLog.tsx` — entries list + one-action form + carry-over flow.
  - `DemoChecklist.tsx` — KR-first demo items with D5 badges.
  - `QuarterSwitcher.tsx` — read-only browse of past quarters (current quarter
    is the only editable one; keeps scope tight).

Styling: Tailwind utilities on tokens only (`design.md` law), lucide-react
icons (already a dependency, used by OST components), `<ScrollReveal>` for
section fade-ins with the `Math.min(i, 4) * 40` stagger cap.

### D7. Forward compatibility: Test Register reads the mode

The Test Register (QA ring, separate proposal) will phase its reflection UI by
the active cadence mode. Contract for that future read, so it needs no delta
later: `mode` lives on the current-quarter `CadenceRecord`, reachable via
`listForProduct(productId)` + `compareQuarters`-match on `currentQuarter()`
against the public `pm-cadence-v1` store. `CadenceMode` and `CadenceRecord`
are exported from `src/utils/cadence-store.ts` for exactly this. No code in
this change anticipates the Test Register beyond keeping these exports public.

## Risks / Trade-offs

- [Contract module doesn't exist yet — `donut-crm-pipeline-data-contract` is
  unimplemented] → hard ordering dependency; tasks.md front-loads a check that
  `src/utils/pipeline-store.ts` exists and exports what D2 imports. If the
  contract lane slips, this lane blocks rather than stubbing a parallel shape.
- [OKR Organizer may land after this tool] → D5's null/empty-state path means
  the kit ships and works without any OKR data; the KR picker just shows the
  empty state until the sibling lands.
- [Hand-entered metrics can be nonsense (completed > committed, WIP 0)] →
  accept freely; this is a teaching sandbox, not a system of record. Clamp only
  to non-negative numbers.
- [Mode switch mid-quarter muddies metric history] → D3 keeps data + shows a
  note; worst case is a visibly mixed history, never data loss.
- [No test framework in repo] → per contract risk table: enforcement is
  `pnpm check` (TypeScript) + `pnpm build`; tasks include a manual QA script
  through all three modes instead of automated tests.

## Migration Plan

Greenfield: new page, new component dir, new store key. Nothing existing is
touched. Rollback = delete the three additions; `pm-cadence-v1` data in
visitors' browsers is simply orphaned (harmless). Future shape changes bump to
`pm-cadence-v2` with read-old/write-new, per the contract's migration rule.

## Open Questions

- Shared "pipeline chrome" (stage nav + product switcher) is still deferred to
  a `pipeline-tools-chrome` follow-up per the contract's open question; this
  page ships with just `resolveActiveProduct()` and a plain product-name label
  until then.
- Should past quarters be editable? Decided read-only here (scope); revisit if
  course content later needs backfilled examples.
- Whether the Donut CRM sample product should seed a pre-filled example quarter
  (one retro, two periods) — leaning no for v1 to keep the mode-picker moment
  clean; flag for the content pass.
