## Why

The "One-way doors and two-way doors" section of
[Risk Reduction: The Vocabulary I Use Under Pressure](/product-management/risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure/)
teaches Bezos's two-way/one-way decision-classification vocabulary entirely
through narrated anecdotes — a reader watches someone else classify a button
color test or a schema decision, but never has to do the classification
themselves before the reasoning is handed to them. The site already has two
live precedents for exactly this shape — binary judge-then-reveal
(`InterviewQuestionQuiz.tsx`) and per-concept "explain" depth
(`OstHelpModal.tsx`) — but no component joins them for a scenario-based
one-way/two-way check. This closes that gap with one reusable component,
embedded in the post and given a standalone page, matching the precedent set
by the (not-yet-applied) sibling change `agreement-certainty-matrix-tool`.

## What Changes

- Add a reusable scenario classify-and-reveal React component,
  `src/components/tools/decision-door/DecisionDoorClassifier.tsx`: a reader
  reads a short decision scenario, picks "one-way door" or "two-way door",
  and immediately sees the reasoning — mirroring the pick/reveal shape of
  `InterviewQuestionQuiz.tsx` and the correct/incorrect `Feedback` +
  `ScoreBar` chrome shared by all three existing course exercises.
- Add a per-decision-type help/explain modal,
  `DecisionDoorHelpModal.tsx`, mirroring `OstHelpModal.tsx`'s
  definition/example/gotchas/how-to-recognize-it structure, one entry each
  for "one-way door" and "two-way door".
- Embed the component in the post (curated-scenario mode): convert
  `2025-01-20-risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure.md`
  to `.mdx` (matching the existing MDX-embed precedent used by
  `2025-09-15-assumption-mapping-...mdx` and others) and render
  `<DecisionDoorClassifier client:visible />` inside the "One-way doors and
  two-way doors" section, using that section's own examples (button color
  A/B test, prototype-library choice, schema decision, vendor contract,
  public API contract) as the scenario set — no invented examples replace
  real ones. Section prose is trimmed only where the interactive scenarios
  now carry the illustrative weight (see design.md D2); the classification
  vocabulary and both failure-mode paragraphs are preserved.
- Add `/tools/decision-door-classifier/` — a static Astro page (mirroring
  `opportunity-solution-tree.astro`) hosting the same component in two
  built-in modes: the curated scenario set (read-only judging, same as the
  post embed) and a **"classify your own decision"** freeform mode where a
  visitor types a decision they're facing and records their own one-way/
  two-way call plus a note — persisted to localStorage only via
  `src/utils/decision-door-store.ts`, built on `createToolStore` from
  `src/utils/pipeline-store.ts` for engineering consistency (versioned key,
  in-memory cache, silent-degrade persistence) — no cross-tool references,
  no product/quarter join, no backend.
- No new dependencies; no changes to `ost-store.ts`, `pipeline-store.ts`, or
  any Donut CRM pipeline tool store or spec.

## Capabilities

### New Capabilities

- `decision-door-classifier`: the reusable one-way/two-way scenario
  classify-and-reveal component, its per-decision-type help modal, its
  curated-mode embed in the risk-vocabulary post, and the standalone
  `/tools/decision-door-classifier/` page with its freeform "classify your
  own decision" mode and localStorage store.

### Modified Capabilities

_None._ `pipeline-data-contract` is consumed as-is: `decision-door-store.ts`
uses `createToolStore` purely for the same engineering reasons
`agreement-certainty-matrix-tool`'s `matrix-store.ts` does (versioned key,
cache, silent-degrade persistence), not because this tool needs any
cross-tool reference, quarter concept, or product join the contract
provides. No delta is proposed; see design.md D5 for the explicit call.

## Impact

- **New code:** `src/components/tools/decision-door/DecisionDoorClassifier.tsx`,
  `src/components/tools/decision-door/DecisionDoorHelpModal.tsx`,
  `src/utils/decision-door-store.ts`,
  `src/pages/tools/decision-door-classifier.astro`.
- **Modified content:**
  `2025-01-20-risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure.md`
  converted to `.mdx` to import and render the component; only the "One-way
  doors and two-way doors" section changes, the rest of the post (pre-mortem,
  RAID, ADRs, assumption mapping, spikes) is untouched. Locked post URL is
  unaffected (only the file extension changes, not the route).
- **Depends on:** `src/utils/pipeline-store.ts` (`createToolStore`, `uid`,
  `ToolRecordBase`) — already applied and in use by `ost-store.ts`; no
  sibling change needs to land first.
- **Constraints honored:** static Astro 6.3, localStorage only, React 19
  islands only, `tokens.css` tokens only, no new dependencies, locked post
  URL shape unchanged.
- **Trackers:** no open bd issues reference this work today (`bd list`
  turns up nothing for "door", "one-way", "two-way", or "decision
  classifier"); tasks.md files a close-out bead for the RAID-tracking
  follow-up this proposal deliberately does not build (see Non-goals in
  design.md).
