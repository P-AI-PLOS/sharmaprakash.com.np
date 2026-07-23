# Tasks — Cadence & Reflection Kit

## 1. Preconditions

- [x] 1.1 Verify `src/utils/pipeline-store.ts` exists (from
      `donut-crm-pipeline-data-contract`) and exports `createToolStore`,
      `ToolRecordBase`, `QuarterRef`, `quarterKey`, `currentQuarter`,
      `compareQuarters`, `OkrKeyResultRef`, `resolveActiveProduct`, `uid`.
      If missing, STOP — this lane is blocked on the contract lane; do not
      stub a parallel shape.
- [x] 1.2 Check whether `okr-organizer-tool` has landed
      (`src/utils/okr-store.ts`): if yes, note its exported record/list API
      for the KR picker; if no, build the picker against the contract's D8 OKR
      shape behind the empty-state path (design D5).
- [x] 1.3 File a bd issue for this implementation lane
      (`bd create "Cadence & Reflection Kit tool (stage 05)"`), claim it.

## 2. Store

- [x] 2.1 Create `src/utils/cadence-store.ts`: `CadenceMode`, `CadencePeriod`,
      `RetroEntry`, `DemoItem`, `CadenceRecord` exactly per design D2, store
      via `createToolStore<CadenceRecord>({ storageKey: "pm-cadence-v1",
      idPrefix: "cad" })`.
- [x] 2.2 Add `resolveQuarterRecord(productId, quarter)` — find via
      `listForProduct` + quarter match, create empty (`mode: null`) if absent —
      and small mutators for periods/retros/demos that stamp `uid("cad")` ids
      and route through `store.update` (so `updatedAt` bumps).
- [x] 2.3 Add pure helpers with exported types: rolling velocity (mean of last
      3 completed), median cycle time per period, WIP-breach predicate — kept
      in the store module so they're testable by `pnpm check` consumers and
      reusable later by Stakeholder Update Composer.

## 3. Page and island shell

- [x] 3.1 Create `src/pages/tools/cadence-reflection-kit.astro` mirroring
      `opportunity-solution-tree.astro`: SiteShell, hero with method-agnostic
      framing copy (name the job before the ritual; do not lead with Scrum
      vocabulary), one `client:load` island.
- [x] 3.2 Create `src/components/tools/cadence-reflection-kit/CadenceKit.tsx`:
      resolve active product (`resolveActiveProduct`) + current-quarter record,
      own all state, render ModePicker OR (metrics + retro + demo) per spec
      "mode must be chosen before any tracking UI".
- [x] 3.3 Create `QuarterSwitcher.tsx`: list this product's cadence records in
      `compareQuarters` order; selecting a past quarter renders it read-only,
      current quarter editable.

## 4. Mode picker and metrics

- [x] 4.1 Create `ModePicker.tsx`: one-sentence job statement + three peer
      cards (Flow, Scrumban, Sprint — none pre-selected, Sprint not first),
      each naming its rhythm and reflection loop; selection persists `mode`.
- [x] 4.2 Create `MetricsPanel.tsx` — sprint variant: per-iteration
      committed/completed inputs (non-negative clamp), rolling-velocity
      summary, simple token-styled committed-vs-completed bars (no chart lib).
- [x] 4.3 MetricsPanel — flow variant: WIP limit, observed WIP (breach
      visibly flagged), cycle-time entries per period, median cycle-time
      summary.
- [x] 4.4 MetricsPanel — scrumban variant: flow inputs + per-period
      "planning session held?" check; no point inputs.
- [x] 4.5 Mode switching: keep entered period data, re-render for new mode,
      show the "earlier periods were tracked under a different mode" note
      (design D3).

## 5. Retro log

- [x] 5.1 Create `RetroLog.tsx`: entries list (went well / didn't / the one
      action + status chip), newest first.
- [x] 5.2 New-entry form with a single action field and the one-action helper
      copy; saving stores status `open`.
- [x] 5.3 Carry-over flow: when the latest action is `open`, surface it at
      new-entry time with "mark done" / "carry over" (carry-over sets old
      entry to `carried-over` and prefills the new action).

## 6. Demo-day checklist

- [x] 6.1 Create `DemoChecklist.tsx`: add-item form asking the key result
      FIRST (options from the OKR store for the active product), then the
      what-are-you-demoing text; stores `OkrKeyResultRef` + text snapshot.
- [x] 6.2 Empty state when the product has no OKR data: form still works,
      stores `keyResult: null`, renders the visible "not tied to a key
      result" marker + link to `/tools/okr-organizer/`.
- [x] 6.3 D5 drift handling: re-resolve each item's ref on load; missing or
      reworded KR renders the snapshot with a "source changed/removed" badge;
      items stay editable/completable.
- [x] 6.4 Done toggling and item delete for demo items.

## 7. Polish

- [x] 7.1 Wrap section reveals in `<ScrollReveal>` with the
      `Math.min(i, 4) * 40` stagger cap; respect `prefers-reduced-motion`.
- [x] 7.2 Token audit: no hardcoded colors/px; lucide-react icons only;
      component naming/namespace per AGENTS.md.
- [x] 7.3 Page metadata: title/description in the OST page's style; confirm
      the new route doesn't collide with locked URL shapes.

## 8. Verification

- [x] 8.1 `pnpm check` (TypeScript) passes — this is the contract-conformance
      gate (no test framework in repo, per contract risk table).
- [x] 8.2 `pnpm build` and `pnpm preview` pass; page renders with JS disabled
      (hero + shell) and hydrates the island with JS on.
- [x] 8.3 Manual QA script, fresh browser profile: (a) first visit seeds Donut
      CRM product + empty current-quarter record showing ONLY the mode picker;
      (b) walk each of the three modes and confirm only that mode's metrics
      render; (c) mode switch preserves periods + shows the note; (d) retro
      carry-over flow; (e) demo item with and without OKR data; (f) delete the
      linked OKR (if okr-organizer landed) and confirm the badge; (g) past
      quarter read-only via a hand-seeded older record.
- [x] 8.4 Verify localStorage keys used are exactly `pm-cadence-v1` and
      `pm-cadence-v1-active`, and that no other tool's keys are written.
- [x] 8.5 Close the bd issue from 1.3 with a summary; file follow-up beads for
      anything deferred (pipeline chrome, sample-data seed, Test Register
      mode read).
