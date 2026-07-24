# Tasks — backlog-prioritizer-tool

> Prerequisite: `donut-crm-pipeline-data-contract` merged
> (`src/utils/pipeline-store.ts` present). Vertical Slicer / OKR Organizer
> stores are soft dependencies — every task below must work with them absent.

## 1. Store module

- [x] 1.1 Create `src/utils/backlog-store.ts`: `MatrixZone`, `Disposition`,
      `BacklogItem`, `BacklogRecord` types per design.md D1, and
      `backlogStore = createToolStore<BacklogRecord>({ storageKey: "pm-backlog-v1", idPrefix: "bklg" })`
- [x] 1.2 Implement pure helpers in the same module (kept pure for future
      test coverage): `zoneFor(agreement, certainty)` with the D2 thresholds
      (chaotic corner ≤15/≤15 checked before the complex quadrant),
      `rankItems(items)` per design.md D4 (Simple → Complicated → KR-link
      count desc → agreement+certainty desc → creation-order tiebreak;
      Complex/Chaotic never returned), and
      `resolveBoard(productId, quarter)` (find-or-create per product+quarter,
      update the active pointer)
- [x] 1.3 Implement `boardToMarkdown(record)`: quarter key header, ranked list
      with zone + off-strategy markers, then Probing / Deferred / Killed
      sections with notes (pattern: `toMarkdown` in
      `src/components/tools/ost/TreeBuilder.tsx`)

## 2. Sibling-store adapters (contract types only)

- [x] 2.1 Create `src/components/tools/backlog-prioritizer/slicer-source.ts`
      exporting `listSlicerStories(productId): Array<{ storyId, specId, title }>`
      — the ONLY file that touches Vertical Slicer internals; returns `[]`
      when the store/module is unavailable (design.md D5)
- [x] 2.2 Create `okr-source.ts` next to it: read OKR Organizer records for
      the active product (contract-fixed D8 shape), filter by the board's
      `QuarterRef`, and expose key results as
      `{ ref: OkrKeyResultRef, label }` with the `who — doesWhat by byHowMuch`
      snapshot string; returns `[]` when absent

## 3. Components (`src/components/tools/backlog-prioritizer/`)

- [x] 3.1 `MatrixBoard.tsx`: the 2x2 — axis labels (Agreement / Certainty),
      zone regions tinted via `--accent-*`/`--ink-*` tokens (no hardcoded
      colors), click-to-place and pointer-event drag for story dots, live zone
      label while dragging, off-strategy and D5 drift badges on dots; no new
      dependencies, `prefers-reduced-motion` respected
- [x] 3.2 `StoryPicker.tsx`: unplotted stories from `listSlicerStories`,
      add-to-board flow storing `StoryRef` + title snapshot; empty state links
      `/tools/vertical-slicer/`
- [x] 3.3 `DecisionQueue.tsx`: dispositionless Complex/Chaotic items with the
      post's response-mode copy; probe/kill/defer actions with optional note
      (probe hidden for Chaotic); collapsed Killed/Deferred sections
- [x] 3.4 `PriorityList.tsx`: ranked output via `rankItems`, KR labels,
      off-strategy badges, "Probing — not committed" section, copy-as-Markdown
      export button
- [x] 3.5 `MatrixHelpModal.tsx` (pattern:
      `src/components/tools/ost/OstHelpModal.tsx`): four zones + response
      modes, linking the three 2021 Agreement-Certainty case posts
- [x] 3.6 `BacklogPrioritizer.tsx` root island: `resolveActiveProduct()`,
      quarter switcher (`currentQuarter`/`nextQuarter`/`quarterKey`),
      KR filter fed by `okr-source` (empty state links
      `/tools/okr-organizer/`), composes 3.1–3.5, persists every mutation
      through `backlogStore`

## 4. Page

- [x] 4.1 Create `src/pages/tools/backlog-prioritizer.astro` mirroring
      `src/pages/tools/opportunity-solution-tree.astro`: `SiteShell` with
      title/description, "Free tool" eyebrow, intro citing the
      Agreement-Certainty Matrix with a link to
      `/product-management/agreement-certainty-matrix-backlog-triage-recap-crm/`,
      then `<BacklogPrioritizer client:load />`; `<ScrollReveal>` on sections
      per motion conventions

## 5. Verification & close-out

- [x] 5.1 `pnpm check` passes (repo has no test framework; TypeScript is the
      contract gate per the pipeline design.md) — confirm zone/rank helpers
      compile against the pipeline-store types with no `any` leaks
- [x] 5.2 `pnpm build` passes; confirm no existing route output changed and
      the new page emits at `/tools/backlog-prioritizer/`
- [x] 5.3 Manual smoke checklist in `pnpm dev` (each item maps to a spec
      scenario): fresh-localStorage load seeds Donut CRM and renders empty
      states; plot a story at high/high → Simple; drag to low/low → Complex
      and it moves list→queue; extreme corner → Chaotic with no probe option;
      kill with note → collapsed Killed section, still in localStorage; link
      a KR, filter by it, verify off-strategy badge on an unlinked item;
      switch quarter → new board, switch back → prior board intact; export
      Markdown and eyeball sections; reload survives; private-window session
      works without errors
- [x] 5.4 Simulate upstream drift: delete the source story record from
      `pm-slice-v1` via devtools → item persists with "source removed" badge
      (contract D5), no cascade
- [x] 5.5 Close-out: flag to the `donut-crm-pipeline-data-contract` lane that
      the D4 prefix table needs a `bklg` row (design.md Open Questions); file
      follow-up beads for the manual-rank-override idea, `BacklogItemRef`
      (only if a consumer appears), and adopting `pipeline-tools-chrome` when
      it lands.
      Done: `bklg` D4 row → **blog-bk1**; manual-rank-override → **blog-a2j**;
      `BacklogItemRef` → **blog-i2i**; `pipeline-tools-chrome` adoption tracked
      by the existing **blog-blx**. This work's own bead **blog-0u3** was open
      at implementation time (not empty as noted at proposal) and is claimed.
      Follow-up **blog-jyp** already covers the spec-scenario 2x2-orientation
      reword and the React-island ScrollReveal-equivalent question.
