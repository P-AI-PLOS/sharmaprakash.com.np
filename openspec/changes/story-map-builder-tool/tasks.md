## 1. Prerequisites (verify, do not rebuild)

- [ ] 1.1 Confirm `src/utils/pipeline-store.ts` exists and exports
      `createToolStore`, `ToolRecordBase`, `uid`, `resolveActiveProduct` (the
      `donut-crm-pipeline-data-contract` change is already applied in-tree)
- [ ] 1.2 Re-read `src/components/tools/ost/TreeBuilder.tsx`,
      `TreeDiagram.tsx`, `src/utils/ost-store.ts`, and
      `src/pages/tools/opportunity-solution-tree.astro` immediately before
      coding each mirrored piece, so naming/shape stays aligned as details are
      implemented (design.md D3/D4/D6)
- [ ] 1.3 Confirm no drag-and-drop or grid/canvas library exists in
      `package.json` beyond `react-d3-tree` (already checked at proposal
      time) — re-check before adding any dependency; the design commits to
      adding none

## 2. Store

- [ ] 2.1 Create `src/utils/story-map-store.ts`: `BackboneStep`,
      `ReleaseSlice`, `StoryCard`, `StoryMapRecord` types (design D2) and the
      store via `createToolStore<StoryMapRecord>({ storageKey:
      "storymap-v1", idPrefix: "map" })`
- [ ] 2.2 Implement CRUD helpers: `createMap`, `saveMapData` (steps/slices/
      cards/title), `deleteMap`, `listMaps`, `getMap`, `getActiveId`/
      `setActiveId` scoped to the constant `"standalone"` key (design D3 — no
      `OstSource`-style union yet)
- [ ] 2.3 Implement step/slice/card mutators: add/rename/reorder step, add/
      rename/reorder slice, add card (under a step, default `sliceId: null`),
      move card's `stepId`/`sliceId`, reorder card within its (stepId,
      sliceId) grouping — each bumping `updatedAt` via the store's `update`
- [ ] 2.4 Implement delete-step and delete-slice as non-cascading: removing a
      step/slice leaves referencing cards' `stepId`/`sliceId` pointing at the
      now-missing id; rendering handles the orphan case (task 3.1), no data
      is deleted from `cards` (spec: "Deleting a step or slice never deletes
      cards")
- [ ] 2.5 Implement `toMarkdown(record)`: backbone as one "A → B → C" line,
      one section per slice in `order`, cards grouped by step label within
      each section, trailing "Backlog (unsliced)" section for `sliceId: null`
      cards (design D7)

## 3. Components (`src/components/tools/story-map/`)

- [ ] 3.1 `StoryMapGrid.tsx` — presentational grid: CSS grid columns per
      backbone step (in `order`), rows per slice (in `order`) plus a trailing
      backlog row; resolves orphaned `stepId`/`sliceId` references to
      "Unassigned step"/"Backlog (unsliced)" groupings (spec scenarios);
      accepts `readOnly?: boolean` that omits all controls (design D4)
- [ ] 3.2 `StoryMapBuilder.tsx` — editing island: title input, add/rename/
      reorder step controls, add/rename/reorder slice controls, add-card
      input per step, per-card `<select>`s for step and slice assignment,
      up/down reorder controls scoped to a card's own (step, slice) grouping
      only, Markdown export + copy, fullscreen mode mirroring
      `TreeBuilder.tsx`'s `createPortal`/`Escape`/URL-param pattern, help
      modal trigger, `showDashboard` prop (mirrors `TreeBuilder.tsx`'s prop
      shape: `kicker`/`title`/`instructions`/`showDashboard`)
- [ ] 3.3 `StoryMapSwitcher.tsx` (mirrors `OstTreeSwitcher.tsx`) and
      `StoryMapDashboard.tsx` (mirrors `OstDashboard.tsx`): list/create/
      switch/delete maps
- [ ] 3.4 `StoryMapHelpModal.tsx` (mirrors `OstHelpModal.tsx`): explains
      backbone, slice, and the "tower of cards under one step" warning sign,
      using the post's own vocabulary
- [ ] 3.5 `StoryMapExample.tsx` — hardcoded `StoryMapRecord`-shaped literal
      for the vignette (Sign up / Set up project / Invite team / Do core work
      / Share result; slices MVP, Release 2), rendered via
      `<StoryMapGrid readOnly .../>` with a "Build your own map →" link to
      `/tools/story-map/`; imports nothing from `story-map-store.ts` (spec:
      "SHALL NOT read from or write to the story map store")
- [ ] 3.6 Apply site conventions throughout: Tailwind utilities on
      `tokens.css` variables only, `<ScrollReveal delay={Math.min(i, 4) *
      40}>` on card/step lists, `prefers-reduced-motion` respected, no new
      dependency added anywhere in this component set

## 4. Pages and post embed

- [ ] 4.1 Create `src/pages/tools/story-map.astro` mirroring
      `opportunity-solution-tree.astro`: `SiteShell`, eyebrow "Free tool"
      hero naming Jeff Patton's story map and linking to
      `/product-management/user-story-mapping-fixing-the-flat-backlog/`,
      `client:load` `StoryMapBuilder` island with `showDashboard`,
      "everything saves in your browser" copy
- [ ] 4.2 Rename
      `src/content/posts/2025-02-06-user-story-mapping-fixing-the-flat-backlog.md`
      to `.mdx` via `git mv` (URL unaffected — confirmed against
      `content.config.ts`'s `stripDatePrefix`), add the `StoryMapExample`
      import, and embed it with `client:visible` directly under "The map: a
      backbone and slices," immediately after the paragraph that narrates the
      same vignette — no other prose changed, no frontmatter fields changed
- [ ] 4.3 Verify the post still renders correctly end to end (`pnpm dev`):
      frontmatter parses, MDX compiles, the embed hydrates on scroll, the rest
      of the post (headings, links, further-reading list) is byte-identical
      to before aside from the added import/embed block

## 5. Verification

- [ ] 5.1 Spec scenario walkthrough in `pnpm dev` against
      `specs/story-map-builder/spec.md`: create a map, add three backbone
      steps and two slices, add cards, assign/reorder via dropdowns and
      arrows (no drag), reload and confirm persistence
- [ ] 5.2 Non-cascading delete scenarios: delete a step with cards under it →
      cards persist under "Unassigned step" with text intact; delete a slice
      with cards assigned → cards persist under "Backlog (unsliced)"
- [ ] 5.3 Markdown export scenario: build the exact onboarding vignette from
      the post, export, and confirm backbone line + slice section order +
      backlog section match design D7's example output
- [ ] 5.4 Post-embed scenarios: confirm `StoryMapExample` renders read-only
      with no controls, creates no `storymap-v1` record (inspect
      `localStorage` before/after viewing the post), and that editing a
      separate map at `/tools/story-map/` never changes what the post embed
      shows on reload
- [ ] 5.5 Quality gates: `pnpm check` and `pnpm build` pass (repo has no test
      framework — TypeScript and build are the gates per the contract's
      ruling); confirm no changes to `src/utils/ost-store.ts`,
      `pipeline-store.ts`, or any other tool's components; confirm
      `package.json` has no new dependency
- [ ] 5.6 Close-out: no beads existed specifically for this tool at proposal
      time (related: `blog-j08`, "Article: PRD, pitch, or story map — naming
      the job before naming the artifact," is a separate essay topic, not
      this build) — file any follow-up beads surfaced during implementation
      (e.g. the deferred Vertical Slicer `StoryRef` join from design.md's
      Open Questions), then close this change's bead(s) and run
      `openspec archive story-map-builder-tool` when applied
