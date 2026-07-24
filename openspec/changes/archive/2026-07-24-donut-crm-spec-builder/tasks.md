# Tasks — donut-crm-spec-builder

> Prerequisite: `src/utils/pipeline-store.ts` from the
> `donut-crm-pipeline-data-contract` change must exist (or be stubbed to its
> declared D2 interface) before task 1.1.

## 1. Store

- [x] 1.1 Create `src/utils/spec-store.ts`: `SpecFormat`, `SpecRecord`
      (per design.md D2 — `sourcePick: OstPickRef | null`, `framingJob`,
      `format`, `sections: Record<string, string>`, `acceptanceCriteria`
      with `uid("ac")` ids), and the store via
      `createToolStore<SpecRecord>({ storageKey: "pm-spec-v1", idPrefix: "spec" })`
- [x] 1.2 Add the per-format section-key tables (design.md D4) and label
      metadata as exported constants in `spec-store.ts`
- [x] 1.3 Implement `resolvePick(ref: OstPickRef)` in `spec-store.ts` using
      only ost-store's existing exports (`getTree`), returning
      `{ status: "live" | "drifted" | "missing"; opportunityText; solutionText }`
      per the contract's snapshot/badge rule

## 2. Components (src/components/tools/spec-builder/)

- [x] 2.1 `SpecOstPicker.tsx`: tree selector (`listTrees()` + `titleFor`),
      opportunity list with the 🎯 target recommended but not enforced,
      solution list, drift/removed badge via `resolvePick`, empty state
      linking to `/tools/opportunity-solution-tree/` with manual-entry
      fallback (opportunity + solution text fields, `sourcePick: null`)
- [x] 2.2 `SpecFormatPicker.tsx`: framing card ("What's the job here?" —
      align a room / hand off unambiguous scope / sequence a release, plus
      skip) that pre-selects but never locks the suggested format; three
      format cards; compact segmented control variant for the editor header
- [x] 2.3 `SpecBuilder.tsx` orchestrator island: pick → framing/format →
      section editor (per-format textareas, pre-fill problem/solution seeds
      from the pick, content preserved across format switches) →
      acceptance-criteria list (add/edit/remove, stable `ac` ids) → export;
      stamps `productId` from `resolveActiveProduct()`; persists via
      spec-store with the `pm-spec-v1-active` pointer
- [x] 2.4 `SpecSwitcher.tsx`: list/create/rename/delete specs for the active
      product, mirroring `OstTreeSwitcher.tsx`
- [x] 2.5 Markdown export helper: title, format-appropriate section
      headings, acceptance-criteria list, OST source line (or "manual
      entry"), download trigger mirroring TreeBuilder's export

## 3. Page

- [x] 3.1 Create `src/pages/tools/spec-builder.astro`: `SiteShell`, hero
      (Free tool eyebrow, one-paragraph pitch naming the three formats,
      links to the CDH course and the Shape Up post
      `/making-discovery-a-habit-cdh-alongside-shape-up-okrs-and-agile/`
      series entry), single `client:load` `SpecBuilder` island — same shape
      as `opportunity-solution-tree.astro`
- [x] 3.2 Styling pass: existing token utilities only; if any new token
      proves necessary, add it to `src/styles/tokens.css` AND update root
      `design.md` in the same commit (repo rule) — expected outcome: none
      needed

## 4. Verification

- [x] 4.1 `pnpm check` and `pnpm build` pass; `/tools/spec-builder/` emitted
      as static HTML; no other route output changes
- [x] 4.2 Confirm one-directional dependency: `git diff` shows
      `src/utils/ost-store.ts` and `src/utils/pipeline-store.ts` untouched;
      `rg "spec" src/utils/ost-store.ts` finds nothing new
- [x] 4.3 Manual smoke script (spec scenarios as the checklist, no test
      framework in repo): pick from a real tree incl. 🎯 recommendation;
      no-trees empty state + manual entry; framing pre-select + skip; all
      three formats render their sections; format round-trip preserves
      section text; criterion id survives sibling delete + edit (inspect
      localStorage); reload restores open spec; edit + delete source tree →
      drifted/removed badges, editing never blocked; Markdown export for
      each format; `ost-trees-v1`/`ost-active-v1` values byte-identical
      before/after a full session
- [x] 4.4 Close-out: no open beads exist for this work today; file
      follow-up beads for (a) `pipeline-tools-chrome` shared stage nav /
      product switcher, (b) optional pre-filled Donut CRM sample spec,
      (c) possible CDH-course embed of Spec Builder — each citing this
      change and the contract design.md

## Implementation notes

- **Task 1.3 — pick resolution is id-based, not index-based.** design.md D1
  describes `resolvePick` comparing
  `tree.opportunities[ref.opportunityIndex]`, written before the contract
  landed. The shipped `OstPickRef` in `src/utils/pipeline-store.ts` carries
  `opportunityId` / `solutionId` (`uid("opp")` / `uid("sol")`, backfilled onto
  every OST node by ost-store's D9 migration) instead of indexes, so
  `resolvePick` looks nodes up by id. Same rule, strictly better: a pick now
  survives reordering the tree, and "missing" means the node is really gone
  rather than merely moved. The contract is the source of record, so no delta
  was raised; design.md D1's index wording is stale prose only.
- **Tasks 2.x — the pre-existing scaffolding was replaced, not extended.** The
  five components and `spec-store.ts` on this branch were non-functional
  placeholders (Preact-style `class=` attributes, a zustand-shaped store API
  that did not exist, `require()` inside an ESM module, invented utility
  classes, `ac_${Date.now()}` ids, `ExerciseShell` props that are not in its
  signature — ~149 `pnpm check` errors). Each file was rewritten against the
  real repo idioms (TreeBuilder / OstTreeSwitcher) and the contract.
- **Task 3.1 — the Shape Up post lives under its category.** The canonical URL
  is `/product-management/making-discovery-a-habit-cdh-alongside-shape-up-okrs-and-agile/`;
  the bare-slug path in the task text does not resolve.
- **Task 3.2 — no new tokens were needed.** `src/styles/tokens.css` is
  untouched, so root `design.md` needed no edit.
