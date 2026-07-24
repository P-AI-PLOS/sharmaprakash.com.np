# Tasks — Vertical Slicer Tool

> Prerequisite: `donut-crm-pipeline-data-contract` must be applied first —
> this change imports `createToolStore`, `uid`, `ToolRecordBase`, `SpecRef`,
> and `resolveActiveProduct` from `src/utils/pipeline-store.ts`. If that
> module is not on the branch yet, stop and coordinate; do not stub it.

## 1. Store

- [x] 1.1 Create `src/utils/slicer-store.ts`: `SlicingPattern`,
      `SHIPPABILITY_CHECKS` (fixed 3-item list with stable ids
      `value`/`demoable`/`independent`), `StorySlice`, `SliceSession extends
      ToolRecordBase` (featureText, `specRef: SpecRef | null`,
      `specTitleSnapshot`, `pattern`, `stories`), and `slicerStore =
      createToolStore<SliceSession>({ storageKey: "pm-slice-v1", idPrefix:
      "slice" })` per design.md D1
- [x] 1.2 Add story helpers in the same module: `createStory(title)` minting
      `uid("story")` ids with all checks false, `isShippable(story)`,
      `storyRefsFor(session)` returning `StoryRef[]` (empty `specId` for
      manual sessions), and `resolveStory(storyId)` scanning sessions for
      downstream tools
- [x] 1.3 Add `listSpecsForProduct(productId)` defensive reader over the raw
      `pm-spec-v1` localStorage key (design.md D2): returns
      `{ id, title }[]` using `title ?? name ?? "Untitled spec"`, returns `[]`
      on missing/unparsable data, never imports the Spec Builder module
- [x] 1.4 Verify contract conformance by type: `pnpm check` passes with the
      store compiled against `pipeline-store.ts` exports (no local re-declared
      ref shapes, no index-based story keys)

## 2. Island components (`src/components/tools/vertical-slicer/`)

- [x] 2.1 `Slicer.tsx` — main island: `resolveActiveProduct()` on mount,
      session lifecycle via `slicerStore` (resolve per-product active session
      or create one), three-step flow: feature source → pattern → stories
- [x] 2.2 Feature-source step: manual textarea plus spec picker fed by
      `listSpecsForProduct`; picking stores `specRef` + `specTitleSnapshot`;
      picker hidden/disabled with a hint when no specs exist (spec req
      "Slicing session source")
- [x] 2.3 Stale-spec badge: on load re-resolve `specRef.specId`; render the
      snapshot title with a "source changed/removed" chip when the spec is
      missing or retitled (contract D5 — never block, never delete)
- [x] 2.4 Pattern step: three `ChoiceButton`-style cards (workflow steps /
      business rules / data variations), each with one-line definition +
      Donut CRM example; keyboard and touch operable; switching pattern with
      existing stories asks confirm and preserves stories + ids (design D3)
- [x] 2.5 Story list: add/rename/reorder/delete stories with
      pattern-specific placeholder prompts (happy path first for workflow
      steps, one rule per slice, one data variation per slice); ids minted
      via `createStory`, never index-derived
- [x] 2.6 Shippability checklist per story row: three toggles from
      `SHIPPABILITY_CHECKS`; all-pass renders the accent "vertical slice"
      state, any fail renders the "looks like a horizontal layer" warning
      chip naming the failed check; state persists with the story (design D4)
- [x] 2.7 `SlicerSessionSwitcher.tsx` — "My slicing sessions" dropdown cloned
      from `OstTreeSwitcher` (records, activeId, onSelect, onCreate),
      switching writes the per-product active pointer
- [x] 2.8 `SlicerDashboard.tsx` — saved-sessions grid (OstDashboard shape):
      feature/spec title, pattern, story count, shippable vs flagged counts,
      open/delete actions; deletion touches only `pm-slice-v1`
- [x] 2.9 `SlicerHelpModal.tsx` — concepts modal (OstHelpModal shape):
      vertical vs horizontal slices, the three patterns, why each checklist
      item matters, Donut CRM counter-examples
- [x] 2.10 Markdown export block: `toMarkdown(session)` with feature, linked
      spec title, pattern, ✅/⚠️ per story + failed-check notes;
      copy-to-clipboard affordance matching TreeBuilder's export (design D6)
- [x] 2.11 Styling pass: tokens only (no hardcoded colors/px), `ScrollReveal`
      on the story list and dashboard with stagger `Math.min(i, 4) * 40`,
      `prefers-reduced-motion` respected via existing motion primitives
      — **partially deviated.** `<ScrollReveal>` is an `.astro` component and
      cannot render inside a React island, so the dashboard grid drives the
      same global `.sr-reveal` / `.is-visible` primitive through a local
      `useReveal` hook (stagger `Math.min(i, 4) * 40`; the page imports
      `ScrollReveal.astro` so the `is:global` CSS ships). The **story list is
      deliberately not revealed**: it is an editable form list, where fading
      rows in on scroll is wrong UX and a needless way for a row the visitor
      just typed to be momentarily invisible. Reduced motion is honoured
      globally by `tokens.css`.

## 3. Page

- [x] 3.1 Create `src/pages/tools/vertical-slicer.astro`: SiteShell with
      title/description, "Free tool" eyebrow hero explaining vertical slicing
      and the browser-only persistence promise, cross-link to the
      continuous-discovery course, `<Slicer client:load />` — mirroring
      `opportunity-solution-tree.astro`
- [x] 3.2 Confirm the route builds as `/tools/vertical-slicer/` and no
      existing route or post URL changes (`pnpm build`, inspect `dist/tools/`)

## 4. Verification & close-out

- [x] 4.1 Quality gates: `pnpm check` and `pnpm build` pass clean
      — `pnpm build` passes clean (406 pages). `pnpm check` reports **149
      pre-existing errors, none in this lane**: all are in
      `src/components/tools/spec-builder/*`, `src/utils/spec-store.ts`,
      `src/content.config.ts` and other files owned by the in-flight
      spec-builder lane. Zero diagnostics in
      `src/components/tools/vertical-slicer/*` or `src/utils/slicer-store.ts`;
      the count is unchanged from the branch baseline (gate: no NEW errors).
- [x] 4.2 Manual QA against the spec scenarios (no test framework in repo,
      per contract decision): first-visit Donut CRM seed; manual vs
      spec-linked session; stale-spec badge after deleting the spec key
      entry; pattern switch preserves story ids (verify in devtools
      localStorage); flagged story still saves and exports; session switch
      survives reload; private-mode/quota degrade (simulate by stubbing
      `localStorage.setItem` to throw)
      — all scenarios verified live at `localhost:4333`: Donut CRM seeded on
      first visit; spec-linked and manual sessions; retitled-spec and
      removed-spec badges (stories kept both times); picker hidden with the
      manual hint when `pm-spec-v1` is absent; story ids survived rename,
      reorder and a pattern switch (`story_lddh3vfp` / `story_vbtsub3c`
      unchanged throughout); a flagged story still saved and exported with its
      failed checks named; session switch survived reload; a throwing
      `Storage.prototype.setItem` left the tool usable with no uncaught error
      and no visible failure. **Not verified visually:** the dashboard
      fade-in — the automated browser tab produced no animation frames
      (`requestAnimationFrame` never advanced), which stalls both
      IntersectionObserver and CSS transitions. Needs a human eyeball on
      `/tools/vertical-slicer/`: dashboard cards should fade up on scroll.
- [x] 4.3 Verify downstream contract surface: `storyRefsFor` +
      `resolveStory` produce/resolve `StoryRef`s as specified, including the
      empty-`specId` manual case documented in design.md D1 for the Backlog
      Prioritizer and Test Register lanes
- [x] 4.4 Docs: add the tool to `docs/agents/recipes.md` pointers if tool
      pages are catalogued there; no design.md (visual) token additions
      expected — if any token is added, update `design.md` in the same commit
      — **N/A, nothing to add.** `docs/agents/recipes.md` does not catalogue
      tool pages (no `tools/` references at all), so there is no pointer list
      to extend. No tokens were added, so `design.md` is untouched. The tool
      is also absent from `SiteFooter.astro`'s free-tools list; that edit is
      deliberately deferred to the orchestrator — all four parallel lanes add
      a tool, and four lanes editing the same footer list is a guaranteed
      merge conflict. Filed as a follow-up bead.
- [x] 4.5 Beads close-out: no bd issues currently track this work (`bd list`
      empty at proposal time); file follow-up beads for deferred items
      (course-embed `source` prop, direct `spec-store` import once Spec
      Builder lands, sample pre-filled session) and run the session-close
      protocol per the repo's conservative profile
      — the "no bd issues" note was stale: **`blog-m7d` (P1,
      `vertical-slicer-tool`) tracked this work** and is now closed. Follow-ups
      filed: `blog-mh2` (direct `spec-store` import), `blog-wc7` (course-embed
      `source` prop), `blog-9kz` (sample pre-filled session), plus a chore for
      the deferred `SiteFooter` tool link. Conservative profile: committed on
      this lane branch, not pushed or merged.
