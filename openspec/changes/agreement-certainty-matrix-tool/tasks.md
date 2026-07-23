## 1. Prerequisites (verify, do not rebuild)

- [x] 1.1 Confirm `src/utils/pipeline-store.ts` exports `createToolStore`,
      `ToolRecordBase`, `uid`, `resolveActiveProduct` (already applied and
      already used by `ost-store.ts`) — no sibling change to wait on
- [x] 1.2 Re-read the four source posts' "running it on X" sections
      immediately before writing `curated/*.ts` (design D4) so item text is
      pulled verbatim, not paraphrased from memory

## 2. Store

- [x] 2.1 Create `src/utils/matrix-store.ts`: `MatrixZone`,
      `MatrixBoardItem`, `MatrixRecord` types (design D6) and the store via
      `createToolStore<MatrixRecord>({ storageKey: "pm-matrix-v1", idPrefix:
      "matrix" })`
- [x] 2.2 Implement `resolveActiveBoard()` mirroring `resolveActiveTree`
      (design D7): resolve active product, look up its active board id,
      create-and-activate an empty board if none exists
- [x] 2.3 Implement item mutators: `addItem(boardId, text)`,
      `placeItem(boardId, itemId, zone)`, `removeItem(boardId, itemId)`,
      each using `uid("mitem")` for new items and never touching other
      items' zones

## 3. Shared component (`src/components/tools/matrix/`)

- [x] 3.1 `AgreementCertaintyMatrix.tsx` — 2×2 grid with labeled axes (design
      D2), click-to-place interaction reusing `ChoiceButton`-style controls
      (design D3), `mode: "curated" | "freeform"` prop (design D1)
- [x] 3.2 Curated-mode reveal: scored items show correct/incorrect + `why`
      (reuse `Feedback` from `exercise-ui.tsx`); `contested: true` items show
      debate/context text with no right/wrong marking and are excluded from
      the scored tally (spec scenario: "Contested item never marked right or
      wrong")
- [x] 3.3 Freeform-mode: add-item input, place/re-place/delete any time,
      reveal shows the zone's operating instruction (from `MatrixHelpModal`'s
      content, design D5) never a verdict, wired to `matrix-store.ts`
- [x] 3.4 `MatrixHelpModal.tsx` — per-zone modal (definition, example,
      gotchas, numbered how-to) for all four zones, structured like
      `OstHelpModal.tsx`'s `CONTENT` map, Escape/backdrop-click to close
- [ ] 3.5 `MatrixTool.tsx` — standalone island: calls `resolveActiveBoard()`,
      renders `AgreementCertaintyMatrix` in `freeform` mode, owns store
      wiring, "everything saves in your browser" copy
      — NOT DONE as a separate file: the requirement is satisfied without it.
      `agreement-certainty-matrix.astro` renders `AgreementCertaintyMatrix
      client:load mode="freeform"` directly, the component owns the
      `resolveActiveBoard()` + store wiring, and the "everything saves in your
      browser" copy lives in the page hero. A `MatrixTool.tsx` wrapper would be
      a pass-through; left for a future call rather than added for symmetry.
- [x] 3.6 `curated/crm-backlog.ts`, `curated/flaky-tests.ts`,
      `curated/accrual-engine.ts`, `curated/certification-feature.ts` — one
      `MatrixItem[]` module per post, per design D4's item/zone mapping,
      text pulled from each post's own prose
- [ ] 3.7 Apply site conventions: Tailwind utilities on `tokens.css`
      variables only, `<ScrollReveal delay={Math.min(i, 4) * 40}>` on the
      item list, `prefers-reduced-motion` respected, no new dependencies

## 4. Standalone page

- [x] 4.1 Create `src/pages/tools/agreement-certainty-matrix.astro`
      mirroring `opportunity-solution-tree.astro`: `SiteShell` with
      title/description, eyebrow "Free tool" hero explaining the matrix and
      linking to
      `/product-management/agreement-certainty-matrix-backlog-triage-recap-crm/`
      for the full method, `client:load` `MatrixTool` island

## 5. Post conversions (`.md` → `.mdx`, vignette section only)

- [x] 5.1 Convert `2021-05-21-agreement-certainty-matrix-backlog-triage-recap-crm.md`
      to `.mdx`: copy frontmatter byte-for-byte, import
      `AgreementCertaintyMatrix` + `curated/crm-backlog.ts`, replace the
      "Running it on Donut CRM's quarter backlog" section's prose with the
      component embed (`mode="curated" client:visible`), leave every other
      section untouched
- [x] 5.2 Convert `2021-05-25-agreement-certainty-matrix-flaky-test-detection-shortest.md`
      to `.mdx` the same way, embedding `curated/flaky-tests.ts` in place of
      "Applying it to shortest's flaky tests"
- [x] 5.3 Convert `2021-05-28-agreement-certainty-matrix-accrual-engine-leave-balance.md`
      to `.mdx` the same way, embedding `curated/accrual-engine.ts` in place
      of "Running it on leave balance"
- [x] 5.4 Convert `2021-06-01-agreement-certainty-matrix-certification-feature-course-guru.md`
      to `.mdx` the same way, embedding `curated/certification-feature.ts`
      in place of "Running certificates through the matrix"
- [x] 5.5 Confirm each converted post's URL is unchanged (`directory` field
      preserved, filename date/slug prefix preserved) by diffing the built
      route against `pnpm build` output before and after

## 6. Verification

- [x] 6.1 Spec scenario walkthrough in `pnpm dev` against
      `specs/agreement-certainty-matrix-tool/spec.md`: for each of the four
      posts, place every scored item correctly and incorrectly and confirm
      the reveal text matches; place each post's contested item (if any) and
      confirm it never shows a verdict
- [x] 6.2 Standalone tool walkthrough: first visit seeds an empty board;
      add 4-6 items spanning all four zones; reload and confirm persistence;
      re-place an item and confirm no duplicate is created; delete an item
      and confirm it's gone after reload
- [x] 6.3 Help modal walkthrough: open and close each of the four zones'
      modals via click and Escape, confirm content matches that zone's
      definition/example/gotchas/how-to from the source posts
- [ ] 6.4 Quality gates: `pnpm check` and `pnpm build` pass (repo has no
      test framework — TypeScript and build are the gates per the
      pipeline-data-contract change's ruling, reused here); confirm
      Pagefind's search index still includes the four converted posts;
      confirm no changes to `src/utils/ost-store.ts`, `pipeline-store.ts`,
      or any Donut CRM pipeline tool component
- [ ] 6.5 Close-out: no beads existed for this work at proposal time
      (`br list` search for "agreement"/"certainty"/"matrix"/"stacey" turned
      up nothing) — file beads for any follow-ups surfaced during
      implementation (multi-board switcher per design.md Open Questions,
      inline "sort your own" affordance inside the post embeds), then close
      this change's bead(s) and run
      `openspec archive agreement-certainty-matrix-tool` when applied
