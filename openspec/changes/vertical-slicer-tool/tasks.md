# Tasks — Vertical Slicer Tool

> Prerequisite: `donut-crm-pipeline-data-contract` must be applied first —
> this change imports `createToolStore`, `uid`, `ToolRecordBase`, `SpecRef`,
> and `resolveActiveProduct` from `src/utils/pipeline-store.ts`. If that
> module is not on the branch yet, stop and coordinate; do not stub it.

## 1. Store

- [ ] 1.1 Create `src/utils/slicer-store.ts`: `SlicingPattern`,
      `SHIPPABILITY_CHECKS` (fixed 3-item list with stable ids
      `value`/`demoable`/`independent`), `StorySlice`, `SliceSession extends
      ToolRecordBase` (featureText, `specRef: SpecRef | null`,
      `specTitleSnapshot`, `pattern`, `stories`), and `slicerStore =
      createToolStore<SliceSession>({ storageKey: "pm-slice-v1", idPrefix:
      "slice" })` per design.md D1
- [ ] 1.2 Add story helpers in the same module: `createStory(title)` minting
      `uid("story")` ids with all checks false, `isShippable(story)`,
      `storyRefsFor(session)` returning `StoryRef[]` (empty `specId` for
      manual sessions), and `resolveStory(storyId)` scanning sessions for
      downstream tools
- [ ] 1.3 Add `listSpecsForProduct(productId)` defensive reader over the raw
      `pm-spec-v1` localStorage key (design.md D2): returns
      `{ id, title }[]` using `title ?? name ?? "Untitled spec"`, returns `[]`
      on missing/unparsable data, never imports the Spec Builder module
- [ ] 1.4 Verify contract conformance by type: `pnpm check` passes with the
      store compiled against `pipeline-store.ts` exports (no local re-declared
      ref shapes, no index-based story keys)

## 2. Island components (`src/components/tools/vertical-slicer/`)

- [ ] 2.1 `Slicer.tsx` — main island: `resolveActiveProduct()` on mount,
      session lifecycle via `slicerStore` (resolve per-product active session
      or create one), three-step flow: feature source → pattern → stories
- [ ] 2.2 Feature-source step: manual textarea plus spec picker fed by
      `listSpecsForProduct`; picking stores `specRef` + `specTitleSnapshot`;
      picker hidden/disabled with a hint when no specs exist (spec req
      "Slicing session source")
- [ ] 2.3 Stale-spec badge: on load re-resolve `specRef.specId`; render the
      snapshot title with a "source changed/removed" chip when the spec is
      missing or retitled (contract D5 — never block, never delete)
- [ ] 2.4 Pattern step: three `ChoiceButton`-style cards (workflow steps /
      business rules / data variations), each with one-line definition +
      Donut CRM example; keyboard and touch operable; switching pattern with
      existing stories asks confirm and preserves stories + ids (design D3)
- [ ] 2.5 Story list: add/rename/reorder/delete stories with
      pattern-specific placeholder prompts (happy path first for workflow
      steps, one rule per slice, one data variation per slice); ids minted
      via `createStory`, never index-derived
- [ ] 2.6 Shippability checklist per story row: three toggles from
      `SHIPPABILITY_CHECKS`; all-pass renders the accent "vertical slice"
      state, any fail renders the "looks like a horizontal layer" warning
      chip naming the failed check; state persists with the story (design D4)
- [ ] 2.7 `SlicerSessionSwitcher.tsx` — "My slicing sessions" dropdown cloned
      from `OstTreeSwitcher` (records, activeId, onSelect, onCreate),
      switching writes the per-product active pointer
- [ ] 2.8 `SlicerDashboard.tsx` — saved-sessions grid (OstDashboard shape):
      feature/spec title, pattern, story count, shippable vs flagged counts,
      open/delete actions; deletion touches only `pm-slice-v1`
- [ ] 2.9 `SlicerHelpModal.tsx` — concepts modal (OstHelpModal shape):
      vertical vs horizontal slices, the three patterns, why each checklist
      item matters, Donut CRM counter-examples
- [ ] 2.10 Markdown export block: `toMarkdown(session)` with feature, linked
      spec title, pattern, ✅/⚠️ per story + failed-check notes;
      copy-to-clipboard affordance matching TreeBuilder's export (design D6)
- [ ] 2.11 Styling pass: tokens only (no hardcoded colors/px), `ScrollReveal`
      on the story list and dashboard with stagger `Math.min(i, 4) * 40`,
      `prefers-reduced-motion` respected via existing motion primitives

## 3. Page

- [ ] 3.1 Create `src/pages/tools/vertical-slicer.astro`: SiteShell with
      title/description, "Free tool" eyebrow hero explaining vertical slicing
      and the browser-only persistence promise, cross-link to the
      continuous-discovery course, `<Slicer client:load />` — mirroring
      `opportunity-solution-tree.astro`
- [ ] 3.2 Confirm the route builds as `/tools/vertical-slicer/` and no
      existing route or post URL changes (`pnpm build`, inspect `dist/tools/`)

## 4. Verification & close-out

- [ ] 4.1 Quality gates: `pnpm check` and `pnpm build` pass clean
- [ ] 4.2 Manual QA against the spec scenarios (no test framework in repo,
      per contract decision): first-visit Donut CRM seed; manual vs
      spec-linked session; stale-spec badge after deleting the spec key
      entry; pattern switch preserves story ids (verify in devtools
      localStorage); flagged story still saves and exports; session switch
      survives reload; private-mode/quota degrade (simulate by stubbing
      `localStorage.setItem` to throw)
- [ ] 4.3 Verify downstream contract surface: `storyRefsFor` +
      `resolveStory` produce/resolve `StoryRef`s as specified, including the
      empty-`specId` manual case documented in design.md D1 for the Backlog
      Prioritizer and Test Register lanes
- [ ] 4.4 Docs: add the tool to `docs/agents/recipes.md` pointers if tool
      pages are catalogued there; no design.md (visual) token additions
      expected — if any token is added, update `design.md` in the same commit
- [ ] 4.5 Beads close-out: no bd issues currently track this work (`bd list`
      empty at proposal time); file follow-up beads for deferred items
      (course-embed `source` prop, direct `spec-store` import once Spec
      Builder lands, sample pre-filled session) and run the session-close
      protocol per the repo's conservative profile
