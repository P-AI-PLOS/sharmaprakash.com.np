# Agreement-Certainty Matrix — Sort-and-Reveal Tool

## Why

Four posts in the `ls-decide` series teach the Stacey Agreement-Certainty
Matrix (Simple / Complicated / Complex / Chaotic) entirely as prose — a
reader sees the four zones explained, then reads someone else's placement
of a CRM backlog, a flaky-test cluster, an accrual-rate backlog, and a
certification feature, with no chance to place an item themselves before
the answer is revealed. The site already has two precedents for
click-and-reveal classification (`AssumptionClassifier`, `OpportunitySorter`
in `src/components/course/exercises/`) and a precedent for a standalone,
localStorage-only tool page built from a course concept
(`/tools/opportunity-solution-tree/`, `src/components/tools/ost/`) — but no
component yet handles a **2×2** (two independent axes, four zones) rather
than a linear bucket list, and neither existing sorter has OST's per-concept
"why" depth (`OstHelpModal`). This change closes both gaps with one
component, replacing the static vignette in all four posts and giving the
matrix a standalone page.

## What Changes

- Add a reusable 2×2 sort-and-reveal React component,
  `src/components/tools/matrix/AgreementCertaintyMatrix.tsx`, that renders
  the four Stacey zones as a real grid (agreement × certainty axes,
  labeled), lets a reader place a curated set of items into a zone by
  click (not drag — see design.md D3 for why), and reveals per-item
  reasoning immediately after placement, mirroring the
  correct/incorrect + "why" feedback shape of `AssumptionClassifier` and
  `OpportunitySorter`.
- Add a per-zone help/explain modal, `MatrixHelpModal.tsx`, mirroring
  `OstHelpModal.tsx`'s definition/example/gotchas/how-to-recognize-it
  structure for each of the four zones — the "explain" depth gap named
  above.
- Embed the component in all four `ls-decide` posts (curated item mode),
  replacing the current static vignette walkthrough with an interactive
  one; each post gets its own item set drawn from that post's existing
  example (Donut CRM backlog, SHORTEST flaky tests, accrual-engine leave
  balance, Course Guru certification feature) — no invented content.
- Add `/tools/agreement-certainty-matrix/` — a static Astro page hosting
  the same component in **"sort your own backlog"** mode: the reader types
  their own items (no fixed answer) and places each on the grid; the board
  persists to localStorage only, following the `createToolStore` contract
  in `src/utils/pipeline-store.ts` (`src/utils/matrix-store.ts`, new
  storage key, no backend).
- No new dependencies; no changes to `ost-store.ts` or the Donut CRM
  pipeline tool stores.

## Capabilities

### New Capabilities

- `agreement-certainty-matrix-tool`: the reusable 2×2 sort-and-reveal
  component (curated mode with reveal feedback, freeform "sort your own
  backlog" mode), its per-zone help modal, its embed in the four
  `ls-decide` posts, and the standalone `/tools/agreement-certainty-matrix/`
  page and localStorage store.

### Modified Capabilities

_None._ `pipeline-data-contract` is consumed as-is: `matrix-store.ts` is
built on `createToolStore` purely for engineering consistency (versioned
key, in-memory cache, silent-degrade persistence — the same reasons OST
uses it) but this tool has no cross-tool references, no quarter concept,
and no need for any shape the contract doesn't already provide, so no
delta is proposed. See design.md D6 for the explicit call.

## Impact

- **New code:** `src/components/tools/matrix/AgreementCertaintyMatrix.tsx`,
  `src/components/tools/matrix/MatrixHelpModal.tsx`,
  `src/utils/matrix-store.ts`, `src/pages/tools/agreement-certainty-matrix.astro`.
- **Modified content:** the four `ls-decide` posts
  (`2021-05-21-agreement-certainty-matrix-backlog-triage-recap-crm.md`,
  `2021-05-25-agreement-certainty-matrix-flaky-test-detection-shortest.md`,
  `2021-05-28-agreement-certainty-matrix-accrual-engine-leave-balance.md`,
  `2021-06-01-agreement-certainty-matrix-certification-feature-course-guru.md`)
  — converted from `.md` to `.mdx` (matching the existing MDX-embed
  precedent in `src/content/posts/2025-09-15-...mdx`) to import and render
  the component; prose is otherwise preserved, not rewritten.
- **Depends on:** `src/utils/pipeline-store.ts` (`createToolStore`, `uid`,
  `ToolRecordBase`, `resolveActiveProduct`) — already applied and in use by
  `ost-store.ts`; no sibling change needs to land first.
- **Constraints honored:** static Astro 6.3, localStorage only, React 19
  islands only, `tokens.css` tokens only, no new dependencies, locked post
  URLs unchanged (only the file extension changes, not the route).
- **Trackers:** no open bd issues reference this work today (`br list`
  turns up nothing for "agreement", "certainty", "matrix", or "stacey");
  tasks.md files close-out beads for any follow-ups.
