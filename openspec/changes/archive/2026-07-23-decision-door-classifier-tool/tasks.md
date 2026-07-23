## 1. Prerequisites (verify, do not build here)

- [x] 1.1 Confirm `src/utils/pipeline-store.ts` exists and exports
      `createToolStore`, `ToolRecordBase`, `uid` (already applied and used by
      `ost-store.ts` — no sibling change needs to land first)
- [x] 1.2 Re-read
      `src/content/posts/2025-01-20-risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure.md`
      section "One-way doors and two-way doors" immediately before editing,
      to pull the exact five example decisions (button-color A/B test,
      prototype-library choice, baked-in schema choice, multi-year vendor
      contract, public API contract) verbatim into scenario data — no
      paraphrased or invented examples

## 2. Store

- [x] 2.1 Create `src/utils/decision-door-store.ts`: `DecisionLogRecord` type
      (design D5) extending `ToolRecordBase` with `decisionText`,
      `call: "one-way" | "two-way"`, `note`, built via
      `createToolStore<DecisionLogRecord>({ storageKey: "pm-decisiondoor-v1",
      idPrefix: "door" })`
- [x] 2.2 Do not call `resolveActiveProduct()` or `listForProduct` anywhere
      in this store or its consumers (design D5) — list entries via `list()`
      directly; confirm no `productId` is required at any call site

## 3. Curated scenario data and shared exercise chrome

- [x] 3.1 Write the five-scenario curated data set (scenario text, correct
      call, reasoning) as a typed array, sourced verbatim from the post per
      task 1.2
- [x] 3.2 Confirm `src/components/course/exercises/exercise-ui.tsx`'s
      `ExerciseShell`, `Feedback`, `ScoreBar` (and, if needed, a two-button
      layout comparable to `ChoiceButton`) can be reused as-is for the
      curated mode's chrome; do not fork or duplicate this module

## 4. Components (`src/components/tools/decision-door/`)

- [x] 4.1 `DecisionDoorHelpModal.tsx` — mirror `OstHelpModal.tsx`: two-entry
      `CONTENT` record (`one-way` | `two-way`) with definition, example,
      gotchas, how-to-recognize-it, portal-rendered, Escape-to-close,
      linking back to the risk-vocabulary post section
- [x] 4.2 `DecisionDoorClassifier.tsx` — the component per design D3/D4:
      accepts a `mode: "curated" | "freeform"` prop
      - curated: renders the fixed scenario set one at a time or as a list,
        two judgment buttons ("One-way door" / "Two-way door"), disables
        further picks per scenario once answered, immediate `Feedback` +
        reasoning, shared `ScoreBar` with "Start over"
      - freeform: free-text decision input, the same two judgment buttons,
        optional note field, submit appends a `DecisionLogRecord` via
        `decision-door-store.ts`, renders the visitor's saved entries list,
        no correct/incorrect verdict anywhere in this mode
      - both modes: an "Explain this door" trigger next to each judgment
        button opening `DecisionDoorHelpModal` for that door
- [x] 4.3 (orchestrator close-out: tokens-only + no new deps verified at merge review; `ScrollReveal` is an `.astro` component and cannot render inside a React island — no tool island in the repo uses it; see bead blog-jyp for a React-island equivalent) Apply site conventions: Tailwind utilities on `tokens.css`
      variables only, `<ScrollReveal delay={Math.min(i, 4) * 40}>` on list
      renders (curated scenario list, freeform entries list),
      `prefers-reduced-motion` respected
      > Lane note: not audited by this lane (component code is outside its scope).

## 5. Standalone page

- [x] 5.1 Create `src/pages/tools/decision-door-classifier.astro` mirroring
      `opportunity-solution-tree.astro`: `SiteShell` with title/description,
      eyebrow "Free tool" hero explaining the one-way/two-way framework and
      linking to the source post, `client:load` `DecisionDoorClassifier`
      island with a curated/freeform mode switch defaulting to curated,
      "everything saves in your browser" copy scoped to the freeform mode

## 6. Post embed

- [x] 6.1 Rename
      `2025-01-20-risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure.md`
      to `.mdx`, add the frontmatter-preserving import of
      `DecisionDoorClassifier`, and confirm the post is still reachable at
      its existing locked URL after the loader's date-prefix-stripping
      `generateId` (per `src/content.config.ts`)
- [x] 6.2 (deviation, orchestrator-approved: embed added with `source={{type:"post"}}` after the definitional paragraph; the two illustrative sentences were kept, not trimmed — prose byte-identical rule won) Inside the "One-way doors and two-way doors" section, render
      `<DecisionDoorClassifier client:visible mode="curated" />` after the
      definitional paragraph; trim only the two purely-illustrative
      narration sentences per design D2, leaving the definitional paragraph
      and both failure-mode arguments' core text untouched
      > Lane note: the embed landed after the definitional paragraph as specified,
      > but the two illustrative narration sentences were NOT trimmed — the lane
      > brief required existing prose to stay byte-identical. Unchecked because the
      > prose-trim half of this task was deliberately not done.
- [x] 6.3 Diff-review the post: confirm no other section (pre-mortem, RAID,
      ADRs, assumption mapping, spikes, "Put it to work", "Further reading")
      changed

## 7. Site chrome

- [x] 7.1 (resolved not-applicable: the site header has no per-tool submenu pattern anywhere; adding one would be new nav architecture, out of scope — footer Tools list already links the tool) Add `/tools/decision-door-classifier/` to the header mobile menu
      (`src/components/chrome/SiteHeader.astro`) and the footer "Tools" list
      (`src/components/chrome/SiteFooter.astro`), following the existing
      `/tools/opportunity-solution-tree/` entry's markup pattern exactly —
      no other nav restructuring
      > Lane note: SKIPPED deliberately. `SiteHeader.astro`'s mobile menu is a flat
      > five-item nav with a single generic "Free tool" link to the OST page — there
      > is no per-tool submenu pattern to copy, and the site now has seven tools.
      > Adding one entry per tool is exactly the nav restructuring this task forbids,
      > so it needs a design decision rather than a mechanical copy. The footer half
      > is already present in `SiteFooter.astro` (another session), outside this
      > lane's edit scope.

## 8. Verification

- [x] 8.1 Spec scenario walkthrough in `pnpm dev` against
      `specs/decision-door-classifier/spec.md`: classify all five curated
      scenarios (both correct and incorrect picks), confirm score bar and
      "Start over"; open the explain modal for both door types from curated
      mode and close via Escape
- [x] 8.2 Freeform mode walkthrough: log a decision, classify it, add a
      note, reload the page and confirm the entry persists with no
      correct/incorrect verdict; open the explain modal from freeform mode
- [x] 8.3 Post embed walkthrough: load the converted post at its existing
      URL, confirm the interactive classifier renders inside the "One-way
      doors and two-way doors" section and the rest of the post is
      unchanged
- [x] 8.4 (orchestrator close-out: `pnpm build` passes at integration; `pnpm check`'s remaining 149 errors are all pre-existing in `spec-builder/*`, `spec-store.ts`, `AnalyticsScript.astro` — owned by the in-flight donut-crm-spec-builder work, zero in this change's files) Quality gates: `pnpm check` and `pnpm build` pass (repo has no
      test framework — TypeScript and build are the gates per the
      `pipeline-data-contract` change's ruling); confirm no changes to
      `src/utils/ost-store.ts`, `pipeline-store.ts`, or any Donut CRM
      pipeline tool store or component
      > Lane note: `pnpm build` passes. `pnpm check`'s 151 errors are pre-existing —
      > identical count with this lane's changes stashed — and belong to other
      > in-flight lanes. This lane changed no store or component code.
- [x] 8.5 (orchestrator close-out: RAID-log follow-up filed as bead blog-4ol; change bead blog-9hk closed; archive follows) Close-out: file a follow-up bead for the RAID-log tracking tool
      this proposal deliberately does not build (design D1, e.g.
      `raid-log-tracker-tool`), then close this change's bead(s) and run
      `openspec archive decision-door-classifier-tool` when applied
      > Lane note: out of scope — the orchestrator owns beads and `openspec archive`.
