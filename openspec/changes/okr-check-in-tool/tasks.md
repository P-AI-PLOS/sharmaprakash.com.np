# Tasks — okr-check-in-tool

## 1. Prerequisites (verify, do not build here)

- [ ] 1.1 Confirm `donut-crm-pipeline-data-contract` is applied:
      `src/utils/pipeline-store.ts` exists and exports `createToolStore`,
      `ToolRecordBase`, `QuarterRef`, `quarterKey`, `nextQuarter`,
      `compareQuarters`, `OkrKeyResultRef`, `uid`, `resolveActiveProduct`
- [ ] 1.2 Confirm `okr-organizer-tool` is applied: `src/utils/okr-store.ts`
      exists, its `OkrRecord` matches contract D8 (`quarter`, `objective`,
      `keyResults[{ id, who, doesWhat, byHowMuch }]`, `tag`), and it exposes a
      create function this tool can call for the draft handoff; if either
      differs, stop and reconcile against
      `openspec/changes/archive/2026-07-23-donut-crm-pipeline-data-contract/design.md` before
      coding

## 2. Store

- [ ] 2.1 Create `src/utils/checkin-store.ts`: `CheckInRecord`,
      `KeyResultCheckIn`, `MetricSnapshot`, `CheckInConfidence` types (design
      D2) and the store via `createToolStore<CheckInRecord>({ storageKey:
      "pm-checkin-v1", idPrefix: "chk" })`
- [ ] 2.2 Implement `resolveCheckIn(productId, okr)` — returns the existing
      record for (okrId, quarter) or creates one seeding an entry per key
      result with `OkrKeyResultRef` + who/doesWhat/byHowMuch snapshot and the
      objective snapshot
- [ ] 2.3 Implement entry mutators: set actual / confidence / reflection,
      add-remove `MetricSnapshot` (kept sorted by `at`), and
      `syncKeyResults(checkinId, okr)` that appends entries for new KRs and
      never removes existing ones
- [ ] 2.4 Implement draft handoff `draftNextQuarterOkr(checkin, includedKrIds)`
      per design D5: builds the D8-shaped record with
      `quarter = nextQuarter(...)`, fresh `uid("kr")` ids, byHowMuch baseline
      from actuals, `draft: true` + `draftedFrom`; creates via
      `okr-store`; update-in-place when `draftedOkrId` resolves and is still
      `draft: true`, fresh record otherwise; never touches the source OKR
- [ ] 2.5 Implement `resolveEntryRef(entry)` — live text / "changed" /
      "removed" states per contract D5, plus the render-time trend verdict
      helper `trendFor(snapshots)` with the design D4 thresholds

## 3. Components (`src/components/tools/okr-check-in/`)

- [ ] 3.1 `CheckInTool.tsx` — island root: `resolveActiveProduct()`, OKR
      picker listing the product's OKR entries (badge entries already
      checked-in this quarter, reopen instead of duplicate), empty state
      linking to `/tools/okr-organizer/` when no OKRs exist, quarter header
      via `quarterKey`
- [ ] 3.2 `KeyResultCheckInCard.tsx` — resolved/badged KR text, snapshot log
      (value + optional note, timestamped), hand-rolled SVG sparkline +
      trend tag (tokens only, no chart lib), actual input with "use latest
      snapshot" shortcut, solid/noisy/contested toggle, reflection textarea
- [ ] 3.3 `NextQuarterDraftPanel.tsx` — per-entry include checkboxes
      (default: solid + actual logged), Draft / Update draft / Draft again
      states driven by `draftedOkrId` resolution, success state linking to
      `/tools/okr-organizer/`
- [ ] 3.4 `CheckInSwitcher.tsx` — prior check-ins for the product sorted by
      `compareQuarters` (mirror `OstTreeSwitcher.tsx`), and
      `CheckInHelpModal.tsx` (mirror `OstHelpModal.tsx`) explaining the
      ritual, why snapshots beat launch-week numbers, and what drafting does
- [ ] 3.5 Apply site conventions: Tailwind utilities on `tokens.css`
      variables only, `<ScrollReveal delay={Math.min(i, 4) * 40}>` on entry
      lists, `prefers-reduced-motion` respected

## 4. Page

- [ ] 4.1 Create `src/pages/tools/okr-check-in.astro` mirroring
      `opportunity-solution-tree.astro`: SiteShell with title/description,
      eyebrow "Free tool" hero explaining the quarter-close ritual and the
      loop back to Stage 01, `client:load` `CheckInTool` island,
      "everything saves in your browser" copy

## 5. Verification

- [ ] 5.1 Spec scenario walkthrough in `pnpm dev` against
      `specs/okr-check-in/spec.md`: seed Donut CRM, create an OKR in the
      organizer, run a full check-in (snapshots 10/60/22 → "spike faded";
      10/25/41 → "holding"; single point → no verdict), log
      actual/confidence/reflection, reload and confirm persistence
- [ ] 5.2 Draft handoff scenarios: draft from a Q3 check-in → Q4 record with
      `draft: true`, fresh `kr` ids, source record unchanged
      (compare `pm-okr-v1` JSON before/after); re-draft updates in place;
      clear `draft` manually then re-draft → new record, accepted one
      untouched
- [ ] 5.3 Stale-ref scenarios: delete a KR and the whole OKR in the organizer
      → badges shown, logged data intact; add a KR → sync appends without
      touching existing entries
- [ ] 5.4 Quality gates: `pnpm check` and `pnpm build` pass (repo has no test
      framework — TypeScript and build are the gates per the contract's
      ruling); confirm no changes to `src/utils/ost-store.ts`,
      `pipeline-store.ts`, or any OKR Organizer component
- [ ] 5.5 Close-out: no beads existed for this work at proposal time — file
      beads for any follow-ups surfaced during implementation (draft-badge
      support in the organizer lane if it shipped without it,
      `pipeline-tools-chrome` nav link to this page), then close this
      change's bead(s) and run `openspec archive okr-check-in-tool` when
      applied
