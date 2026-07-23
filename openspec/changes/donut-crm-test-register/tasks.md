# Tasks — donut-crm-test-register

> Prerequisite: `donut-crm-pipeline-data-contract` implemented
> (`src/utils/pipeline-store.ts` exists and `pnpm check` passes with it).
> Sibling lanes (spec-builder, vertical-slicer) are NOT prerequisites —
> tasks 2.2 and the empty states cover their absence.

## 1. Store module

- [ ] 1.1 Create `src/utils/test-register-store.ts`: `AutomationStatus`,
      `LinkedStory`, `LinkedCriterion`, `TestScenarioRecord` (extends
      `ToolRecordBase`; `stories.length + criteria.length >= 1` enforced at
      the editor layer, documented on the type), and the store via
      `createToolStore<TestScenarioRecord>({ storageKey: "pm-testreg-v1",
      idPrefix: "test" })` — per design.md D1 and the contract's D4 tables
- [ ] 1.2 Create `src/components/tools/test-register/sources.ts` (or
      co-locate in the store module) — the narrow read-only adapter over the
      sibling stores: `listSpecsForProduct`, `listStoriesForProduct`,
      returning `[]` when a sibling module/store is absent (design.md D2);
      resolve the actual sibling module paths at integration time and confine
      any rename to this file
- [ ] 1.3 Implement `resolveScenarioLinks(rec)` as a pure function returning
      per-link `live | changed | removed` resolutions plus the derived
      `stale` boolean, using whitespace-trimmed exact text comparison
      (design.md D2); no persistence of the stale state anywhere
- [ ] 1.4 Implement the lifecycle mutations on top of the factory:
      `markRegenerated(id)` (re-snapshot changed links only, never removed
      ones; set status `ai-drafted`), `markReviewed(id)` (only when
      non-stale), `unlinkSource(id, ref)` (refuse to leave zero links)

## 2. Island components (`src/components/tools/test-register/`)

- [ ] 2.1 `StatusBadge.tsx` — single source of truth for the four displayed
      states, stale rendering as "stale — spec may need AI regeneration";
      token-based styling only (if no suitable warning token exists, add one
      to `tokens.css` and update the site `design.md` in the same commit)
- [ ] 2.2 `ScenarioEditor.tsx` — description, story picker and criterion
      picker grouped by spec (fed by the sources adapter), status select
      (`not-automated`/`ai-drafted`/`human-reviewed` only — stale is not
      selectable), `specPath` input with a `.spec.ts` placeholder hint;
      blocks link-less saves with an explanatory message; guided empty state
      linking to `/tools/…` sibling pages when both sources are empty
- [ ] 2.3 `ScenarioList.tsx` — the register: description, linked
      stories/criteria (live text when current; snapshot + drift detail when
      changed; snapshot + source-removed badge when gone), StatusBadge,
      specPath rendered as code, actions (edit, mark regenerated, mark
      reviewed, unlink, delete with confirm); `<ScrollReveal>` with the
      `Math.min(i, 4) * 40` stagger cap
- [ ] 2.4 Stale-resolution UI in the list/editor: side-by-side snapshot vs.
      current text for changed links; "mark regenerated" wired to 1.4
      including the reviewed→ai-drafted demotion; unlink flow for removed
      sources honoring the last-link rule (design.md D3)
- [ ] 2.5 `CoveragePanel.tsx` — per-spec gap lists (uncovered first, then
      covered-by-stale-only, then the non-stale fraction as a caption) for
      both acceptance criteria and stories; trailing "source removed" group
      for scenarios whose spec is gone (design.md D4)
- [ ] 2.6 `RegisterHelpModal.tsx` — operational quick reference (statuses,
      actions, "refresh after editing specs" note), mirroring
      `OstHelpModal.tsx` structure
- [ ] 2.7 `TestRegister.tsx` — root island: `resolveActiveProduct()`, load
      scenarios via `listForProduct`, register/coverage tab state, wire all
      children; `client:load`

## 3. Page

- [ ] 3.1 Create `src/pages/tools/test-register.astro` on the
      `opportunity-solution-tree.astro` pattern: SiteShell with SEO
      title/description, hero (eyebrow "Free tool", QA-ring framing across
      stages 03/05/06), the island, and a "nothing leaves your browser" line
- [ ] 3.2 Write the teaching content section (design.md D6): running a test
      register when AI drafts the specs; the four statuses with the
      regeneration-resets-review rule stated explicitly; Playwright
      `specPath` conventions (mirror app domain structure, one scenario ↦
      one `test()` block, feature-area files with a concrete example path);
      why gap lists beat coverage percentages — practitioner voice, no
      QA-101 filler, existing typography utilities only
- [ ] 3.3 Cross-link: teaching content references the Spec Builder and
      Vertical Slicer tool pages (as "coming" copy if their lanes haven't
      merged yet — verify at integration time); do NOT add nav/footer chrome
      changes (deferred to `pipeline-tools-chrome`)

## 4. Analytics

- [ ] 4.1 Emit via `trackEvent` (`src/utils/analytics.ts`):
      `test_register_scenario_created`, `test_register_marked_regenerated`,
      `test_register_marked_reviewed`, and once-per-session
      `test_register_stale_seen` when the register renders with ≥1 stale
      scenario; counts only, no scenario text in payloads

## 5. Verification

- [ ] 5.1 `pnpm check` passes (contract types consumed with no `any` leaks;
      `resolveScenarioLinks` fully typed)
- [ ] 5.2 `pnpm build` passes; confirm `/tools/test-register/index.html` is
      emitted and contains the teaching content statically
- [ ] 5.3 Manual smoke script in `pnpm dev` (no test framework in repo —
      TypeScript + build + scripted manual walk are the gates, matching the
      data-contract change): (a) fresh localStorage → page seeds Donut CRM,
      empty register with guidance; (b) with sibling data present, create a
      scenario against an AC and a story, reload, record persists;
      (c) edit the AC text in Spec Builder → reload register → scenario
      shows stale with snapshot vs. current side by side; (d) mark
      regenerated → snapshot updated, status `ai-drafted` even though it was
      `human-reviewed`; (e) delete the story in Vertical Slicer → stale +
      source-removed badge, unlink honors the last-link rule; (f) coverage
      panel shows the uncovered and covered-by-stale buckets correctly;
      (g) verify `pm-spec-v1`/`pm-slice-v1` values unchanged after every
      register action (read-only guarantee)
- [ ] 5.4 Verify `resolveScenarioLinks` link-state matrix in the browser
      console against hand-built fixtures (live/changed/removed × story/
      criterion), since it is the tool's core logic
- [ ] 5.5 Confirm no route/URL changes elsewhere, no edits to
      `ost-store.ts`, `pipeline-store.ts`, or sibling tool files outside the
      `sources.ts` adapter's imports
- [ ] 5.6 Close-out: no open beads exist for this work today; file follow-up
      beads for (a) cross-tool Donut CRM sample scenarios (blocked on
      sibling sample-data decisions), (b) `pipeline-tools-chrome`
      participation for this page, (c) the stale-fraction display question
      from design.md Open Questions — each citing this change and the data
      contract as records
