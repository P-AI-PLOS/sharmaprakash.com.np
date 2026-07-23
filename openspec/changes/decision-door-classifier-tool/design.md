## Context

Static Astro 6.3 site; interactive widgets are either (a) course-exercise
React islands embedded directly in MDX posts, no persistence, plain
`useState` (`InterviewQuestionQuiz.tsx`, `AssumptionClassifier.tsx`,
`OpportunitySorter.tsx`, all sharing chrome from
`src/components/course/exercises/exercise-ui.tsx`:
`ExerciseShell`/`ChoiceButton`/`Feedback`/`ScoreBar`), or (b) standalone
`/tools/*` pages hosting a React island that persists to localStorage via
`createToolStore` (`src/utils/pipeline-store.ts`), following the
`opportunity-solution-tree.astro` + `src/components/tools/ost/` reference
shape. `OstHelpModal.tsx` is the precedent for a per-concept definition/
example/gotchas/how-to modal, portal-rendered, Escape-to-close.

The source post,
`2025-01-20-risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure.md`,
is currently plain `.md`. Its "One-way doors and two-way doors" section (the
scope of this change) teaches the framework through narrated anecdotes only:
a button-color A/B test and a library-prototype choice as two-way-door
examples; a baked-in data-model choice, a multi-year vendor contract, and a
public API contract as one-way-door examples. The same post's "The RAID log,
and why it goes stale" section describes a Risks/Assumptions/Issues/
Dependencies tracking practice — a different, fillable-document shape, not a
binary classification exercise. I read the full post to confirm this before
scoping (see Decisions D1).

The (not-yet-applied) sibling change `agreement-certainty-matrix-tool`
proposes the closest analog to what this change needs: a reusable classify-
and-reveal component embedded in curated-mode across posts, a per-zone help
modal mirroring `OstHelpModal`, and a standalone page with a freeform mode
backed by a `createToolStore`-based store used purely for engineering
consistency, no cross-tool references. This design follows the same shape.

## Goals / Non-Goals

**Goals:**
- A scenario-based, judge-then-reveal one-way/two-way door classifier
  component, reusable in curated mode (fixed scenario set, reveal reasoning)
  and freeform mode (visitor's own decision, no "correct" answer).
- A per-decision-type help modal (one-way door, two-way door) with
  definition/example/gotchas/how-to-recognize-it content, mirroring
  `OstHelpModal`.
- Embed the curated component in the risk-vocabulary post, replacing static
  narration with an interactive check, without inventing new example content
  — every scenario traces to that post's own text.
- A standalone `/tools/decision-door-classifier/` page offering both modes,
  matching the OST/Spec-Builder page shape, with the freeform mode's entries
  persisted to localStorage only.
- Same engineering conventions as every other tool on the site: static
  Astro, React 19 islands, Tailwind on `tokens.css` variables, no new
  dependencies.

**Non-Goals:**
- No RAID-log tracking tool. The post's RAID section describes a different
  artifact (a living, fillable risk/assumption/issue/dependency log with a
  review cadence) that doesn't fit a binary classify-and-reveal shape and
  would need its own record model, list UI, and staleness-review concept.
  Explicit call: this proposal does not build it; see D1 for the reasoning
  and the tasks.md close-out bead that files it as a follow-up.
- No drag-and-drop, no 2×2 grid (this is a binary axis, unlike the sibling
  Agreement-Certainty Matrix's two independent axes).
- No cross-tool references, no product/quarter join, no OKR/spec/backlog
  pipeline involvement — this tool has nothing to do with the Donut CRM
  pipeline suite.
- No scoring/leaderboard, no export/import, no cross-tab sync, no chrome-wide
  nav restructuring beyond the two existing "Tools" link lists (header
  mobile menu, footer) each gaining one more entry.

## Decisions

### D1. Scope cut: RAID tracking is a named follow-up, not part of this change

I read the full post before scoping. It contains exactly two frameworks that
could plausibly warrant an interactive companion: one-way/two-way doors
(binary classification — this change) and the RAID log (a fillable, living
tracking document with a review-cadence concept — explicitly cut). The RAID
section's own thesis is "the tool isn't the document, it's the standing
review" — an interactive RAID *tracker* would need list CRUD, an owner field,
a staleness/last-reviewed indicator, and possibly a "review reminder" concept
this repo's other tools (OKR Check-In) already flag as a non-goal
(reminders/notifications). That's a meaningfully different, larger build than
a binary quiz, and conflating both under one change name and one
`decision-door-classifier-tool` proposal would blur scope and break the
"~days, one lane" sizing this repo's proposals aim for. Cutting it here
keeps this change shippable in isolation and leaves a clean, nameable
follow-up (`raid-log-tracker-tool` or similar) for whoever picks it up next.
tasks.md files the close-out bead.

### D2. Curated scenarios come verbatim from the post; prose is trimmed, not rewritten

The five example decisions already in the post (button-color test,
prototype-library choice, baked-in schema choice, multi-year vendor
contract, public API contract) become the curated scenario set — no invented
examples. Only the two narrated illustration sentences ("I've watched teams
spend more calendar time...", "I've seen a schema decision made in a
fifteen-minute stand-up...") are trimmed to shorter framing, since the
interactive component now carries the illustrative weight those sentences
existed for; the definitional paragraph, both failure-mode paragraphs' core
argument, and the section heading are preserved untouched. This mirrors how
`agreement-certainty-matrix-tool` treats its four source posts: "prose is
otherwise preserved, not rewritten."

### D3. Component shape: mirrors `InterviewQuestionQuiz`, not `AssumptionClassifier`

`InterviewQuestionQuiz` is the better precedent because it is already a
binary judge-then-reveal (good question / bad question) rather than an
n-way bucket sort (`AssumptionClassifier`'s five categories,
`OpportunitySorter`'s three kinds). `DecisionDoorClassifier` follows its
shape: one scenario at a time, two buttons (`One-way door` / `Two-way door`),
immediate `Feedback` with the "why," and a shared `ScoreBar` — reusing
`ExerciseShell`/`ChoiceButton`/`Feedback`/`ScoreBar` from
`src/components/course/exercises/exercise-ui.tsx` for the curated mode so
the widget reads as the same system as the other course exercises. The
freeform ("classify your own decision") mode used on the standalone page
does not use `ScoreBar` (there's no "correct" answer) — it swaps in a
short reflection prompt and a saved-entries list instead; see D4.

Alternative considered: building on top of `AssumptionClassifier`'s
category-button chrome instead — rejected, since a two-option judgment reads
better as two prominent buttons than as a category-button row sized for five
options.

### D4. Two modes, one component: `mode: "curated" | "freeform"` prop

- **Curated mode** (used in the post embed and as the default tab on the
  standalone page): renders the fixed scenario array, `ScoreBar`, "why"
  reveal — exactly `InterviewQuestionQuiz`'s shape, no persistence, no
  store. This is the mode embedded via `<DecisionDoorClassifier client:visible
  mode="curated" />` in the post.
- **Freeform mode** (standalone page's second tab): the visitor types their
  own decision text, picks one-way or two-way, and writes an optional note
  on why; each entry is appended to a list persisted via
  `decision-door-store.ts`. There is no "why" reveal to check against (no
  correct answer exists for someone else's decision) — instead, picking a
  door type opens `DecisionDoorHelpModal` pre-scrolled to that door's
  gotchas, so the visitor cross-checks their own reasoning against the
  framework's failure modes before committing.
- Both modes share `DecisionDoorHelpModal` (triggered by an "Explain this
  door" link next to each door button in both modes) and the same
  `tokens.css`-only visual language.

Alternative considered: two separate components (`DecisionDoorQuiz` +
`DecisionDoorLog`) — rejected; the scenario-card layout, door buttons, and
help-modal trigger are identical between modes, and one component with a
mode prop avoids duplicating that markup, matching how `TreeBuilder.tsx`
takes a `source` prop to run in both course-embed and standalone contexts.

### D5. Store: `createToolStore` for engineering consistency only, no contract delta

`decision-door-store.ts` wraps
`createToolStore<DecisionLogRecord>({ storageKey: "pm-decisiondoor-v1",
idPrefix: "door" })`. This is the same explicit call
`agreement-certainty-matrix-tool` makes for `matrix-store.ts`: reuse the
versioned-key/in-memory-cache/silent-degrade persistence engineering pattern
for consistency with every other tool store on the site, without pretending
this tool needs anything else the `pipeline-data-contract` capability
provides (no `productId` join is meaningful here — a visitor's decision log
isn't scoped to a Donut CRM "product" — so `DecisionLogRecord` extends
`ToolRecordBase` but the tool never calls `resolveActiveProduct()` or
`listForProduct`; it lists its own store's entries directly via `list()`).
No delta against `pipeline-data-contract` is proposed.

```ts
export interface DecisionLogRecord extends ToolRecordBase {
  decisionText: string;
  call: "one-way" | "two-way";
  note: string;
}
```

Alternative considered: no persistence at all for the freeform mode (mirror
the curated mode's plain `useState`) — rejected; the standalone page's whole
value proposition over the post embed is "classify your own decision and
keep the log," so losing entries on reload would make the freeform mode
pointless. Alternative considered: scoping entries to `resolveActiveProduct()`
like the pipeline tools — rejected, this tool is deliberately usable by a
visitor who has never touched the Donut CRM pipeline tools at all.

### D6. Page and components mirror the OST/Spec-Builder tool pages

- `src/pages/tools/decision-door-classifier.astro` — `SiteShell`,
  eyebrow "Free tool" hero, one `client:load` island rendering
  `DecisionDoorClassifier` with a mode toggle (curated / classify your own),
  "everything saves in your browser" copy for the freeform mode only.
- `src/components/tools/decision-door/`:
  - `DecisionDoorClassifier.tsx` — the component described in D3/D4.
  - `DecisionDoorHelpModal.tsx` — the two-entry (`one-way` | `two-way`)
    modal mirroring `OstHelpModal`'s `CONTENT` record and portal/Escape
    behavior, each entry linking back to the source post section.
- Site chrome: add one entry to the header mobile menu and the footer
  "Tools" list (both currently list only
  `/tools/opportunity-solution-tree/`), following the existing markup
  pattern exactly — no nav restructuring.

### D7. Empty/default states

- Post embed: curated mode always has its five scenarios; no empty state
  needed.
- Standalone page, freeform mode, first visit: empty log with a one-line
  prompt ("What decision are you facing right now?") and a link to the
  source post for the full framework.
- Standalone page defaults to curated mode on load (same "try it before you
  log your own" ordering the post uses), with a tab to switch to freeform.

## Risks / Trade-offs

- [Trimming post prose could read as gutting the essay's voice] → only the
  two purely-illustrative sentences are trimmed (D2); the definitional
  paragraph and both failure-mode arguments — the parts carrying the
  author's actual point — are untouched. Reviewable in the diff as a small,
  scoped edit.
- [Five curated scenarios reused from prose might feel thin as quiz
  content] → this is the same scenario count `InterviewQuestionQuiz` ships
  with; if it proves too short in review, the fix is adding more scenarios
  from the post's own examples, not inventing unrelated ones.
- [Freeform log with no "correct" answer might feel directionless] →
  the help-modal cross-check (D4) gives the visitor something concrete to
  compare their own reasoning against, without the tool pretending to grade
  a personal decision.
- [localStorage quota/private mode] → inherited silent-degrade behavior from
  `createToolStore`; the freeform mode remains usable in-session even if
  nothing persists.
- [No test framework in repo] → per the `pipeline-data-contract` change's
  ruling (still the operative call for tool-shaped work on this site), gates
  are `pnpm check` and `pnpm build` plus a scripted manual smoke test in
  tasks.md; no vitest added for one tool.
- [Converting the post from `.md` to `.mdx` could regress rendering] →
  identical precedent already exercised by every `ls-decide`/course-series
  MDX post; frontmatter schema is shared across `.md`/`.mdx` via the same
  `glob` loader (`src/content.config.ts`), and the route (URL slug) is
  derived by stripping the date prefix regardless of extension, so the
  locked URL is unaffected.

## Migration Plan

Greenfield: new component directory, new store key (`pm-decisiondoor-v1`),
new page, one post converted from `.md` to `.mdx` with a scoped prose edit
inside one section. Nothing existing is modified beyond that one post file
and the two nav lists (header mobile menu, footer). Rollback = revert the
post to `.md` with its original prose, remove the new component directory,
store, and page, and remove the two nav entries. Future store shape changes
bump to `pm-decisiondoor-v2` with a read-old/write-new migration, mirroring
`migrateLegacy` in `ost-store.ts`.

## Open Questions

- Should the standalone page's curated mode reuse the exact five post
  scenarios, or should it ship a slightly larger/rotated set once the
  component exists independently of the post? Shipping the same five for v1
  keeps the two surfaces in sync and avoids maintaining two scenario lists;
  revisit if the standalone page's own analytics (none currently exist)
  ever suggest visitors want more.
- Exact name for the RAID follow-up change (`raid-log-tracker-tool` used as
  a placeholder in tasks.md) — left for whoever picks up that bead to
  finalize during scoping.
