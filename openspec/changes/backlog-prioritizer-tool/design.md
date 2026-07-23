# Design — Backlog Prioritizer (Agreement/Certainty Matrix)

> Contract of record:
> `openspec/changes/donut-crm-pipeline-data-contract/design.md`. Every type,
> key, and convention below conforms to that document (D2 interfaces, D4
> naming tables, D5 stale-reference rule, D8 owned-entity expectations).

## Context

Stage 04 of the Donut CRM pipeline. Upstream: Vertical Slicer (stories, joined
via `StoryRef`) and OKR Organizer (key results, joined via `OkrKeyResultRef`).
Downstream: Stakeholder Update Composer reads this tool's records via
`listForProduct` — it never joins on item ids.

The method is not invented for this tool: the site's 2021 series covers the
Agreement-Certainty Matrix in four posts, and the canonical one for this use
case is
`src/content/posts/2021-05-21-agreement-certainty-matrix-backlog-triage-recap-crm.md`.
Its framework (Liberating Structures' adaptation of Ralph Stacey's Agreement &
Certainty Matrix) is normative for this tool:

- **Axes.** *Agreement* — how much stakeholders agree on the goal and approach.
  *Certainty* — how confident we are about cause and effect (will doing X
  reliably produce Y — the story's value/effort confidence).
- **Zones and response modes** (terminology must match the post):
  - **Simple** (high agreement, high certainty) → best practice exists;
    execute, no workshop needed.
  - **Complicated** (one axis high, the other lagging) → the answer is
    knowable but needs expertise the room lacks; bring in the expert.
  - **Complex** (low agreement, low certainty) → no best practice exists;
    probe–sense–respond, or kill it. Never spec a full solution from here.
  - **Chaotic** (the extreme low/low corner) → a fire, not a backlog item;
    stabilize first, analyze after.
- **The placement debate is the point.** The post's core warning is that flat
  ranking hides disagreement; items must never be silently sorted — the
  Complex/Chaotic ones must be forced into an explicit conversation.

Reference implementation for page/component/store shape:
`src/pages/tools/opportunity-solution-tree.astro`,
`src/components/tools/ost/*`, `src/utils/ost-store.ts`. Static Astro 6.3,
React 19 islands, Tailwind v4 tokens, localStorage only, nothing leaves the
browser.

## Goals / Non-Goals

**Goals:**
- Plot Vertical Slicer stories on the Agreement/Certainty 2x2 for the active
  product and a chosen quarter.
- Derive the Stacey zone from placement and show the matching response mode.
- Force explicit disposition (probe / kill / defer) of Complex and Chaotic
  items via a decision queue — the tool's headline behavior.
- Link items to the active quarter's key results (`OkrKeyResultRef`), filter
  by key result, and badge off-strategy items (zero KR links).
- Emit an ordered priority list per quarter with Markdown export (same export
  affordance pattern as the OST builder).

**Non-Goals:**
- Not a backlog-management suite: no estimates, no sprint assignment, no WIP
  tracking, no capacity math, no multi-board dashboards.
- No manual rank override / drag-to-reorder of the output list (ordering is
  computed; revisit if real usage demands it).
- No facilitation/multiplayer features (the post's workshop mechanics —
  sticky notes, small groups — stay in the post; this is a single-browser tool).
- No ad-hoc story entry: items enter only as `StoryRef`s from Vertical Slicer.
  If a visitor has no stories, the empty state routes them upstream.
- No changes to `pipeline-store.ts`, `ost-store.ts`, or any sibling tool's code.

## Decisions

### D1. Record shape: one board per (product, quarter)

```ts
// src/utils/backlog-store.ts
import type { OkrKeyResultRef, QuarterRef, StoryRef, ToolRecordBase } from "~/utils/pipeline-store";

export type MatrixZone = "simple" | "complicated" | "complex" | "chaotic";
export type Disposition = "probe" | "kill" | "defer";

export interface BacklogItem {
  id: string;               // uid("item") — tool-internal, never a cross-tool join key
  story: StoryRef;          // contract join into Vertical Slicer output
  storyTitle: string;       // snapshot at pick time (contract D5)
  agreement: number;        // 0–100, plot position on the agreement axis
  certainty: number;        // 0–100, plot position on the certainty axis
  krRefs: OkrKeyResultRef[];      // links into OKR Organizer key results
  krSnapshots: Record<string, string>; // keyResultId -> display text at link time (D5)
  disposition?: Disposition;      // only meaningful for complex/chaotic items
  note?: string;                  // optional rationale, esp. for kill/probe calls
}

export interface BacklogRecord extends ToolRecordBase {
  quarter: QuarterRef;
  items: BacklogItem[];
}

export const backlogStore = createToolStore<BacklogRecord>({
  storageKey: "pm-backlog-v1",   // contract D4 table
  idPrefix: "bklg",              // see Open Questions — proposed D4 addition
});
```

One record per (product, quarter): the brief's output is "an ordered story
list per quarter", and a single items array keeps plotting, queueing, and
ordering one read away. Alternative — one record per plotted story — rejected:
it forces every render to reassemble the board from N records and gives
Stakeholder Update N fragments instead of one board per quarter.
`resolveBoard(productId, quarter)` mirrors ost-store's `resolveActiveTree`:
return the existing board for that product+quarter or create an empty one.
The contract's per-product active pointer tracks the most recently opened
board; a quarter switcher (built on `currentQuarter`/`quarterKey`) moves
between boards.

Note: the contract's D6 lists only OKR Organizer, Cadence Kit, and Check-In as
quarter-scoped, but nothing forbids other tools carrying `quarter: QuarterRef`
— and reusing the shared shape is exactly what D6 exists for.

### D2. Zone derivation: thresholds over freeform labeling

Placement is continuous (0–100 per axis, click-or-drag a dot on the matrix);
the zone is derived, never hand-assigned:

- both axes ≤ 15 → **chaotic** (the post's "extreme corner")
- both axes < 50 (and not chaotic) → **complex**
- both axes ≥ 50 → **simple**
- otherwise (one high, one low) → **complicated**

Rationale: the post treats Chaotic as the far corner of Complex, not a full
quadrant, so a plain 4-quadrant split would misclassify it. Deriving the zone
keeps the visitor honest — you argue about *placement* (the post's "the debate
is the point"), and the zone falls out. Alternative — letting users tag zones
directly — rejected: it recreates the priority-label theater the matrix exists
to break. Thresholds are module constants, trivially tunable.

### D3. The decision queue: Complex/Chaotic never silently rank

The ordered output includes **only** Simple and Complicated items. Complex and
Chaotic items land in a visually loud "Needs a conversation" queue and stay
out of the ranked list until the visitor records a disposition:

- **probe** → item stays visible at the bottom of the output under a
  "Probing — not committed" section (matching the post: a Complex item earns a
  roadmap slot only after the probe reports back);
- **kill** → item moves to a collapsed "Killed" section (kept, with note, as
  the record of the conversation — not deleted, so the export shows what was
  explicitly cut);
- **defer** → item stays plotted but sits in a collapsed "Deferred" section.

Chaotic items get the post's treatment verbatim: the queue card says
"stabilize first, analyze after" and offers no probe option — only an
acknowledgement that it left the backlog (kill/defer), because a fire is not a
backlog item. This is the brief's key behavior: the tool surfaces what to
kill, it does not bury low-consensus work at rank #47.

### D4. Ordering rule for the priority list

Within the rankable set (Simple, then Complicated):
1. zone (Simple before Complicated — execute-now before find-the-expert),
2. KR linkage count desc (strategy-aligned work floats),
3. `agreement + certainty` desc,
4. stable tiebreak on item creation order.

Items with zero `krRefs` rank last within their zone and carry an
"off-strategy" badge — visible, not hidden, so the conversation happens.
Alternative (weighted scoring formula with tunable coefficients) rejected as
prioritization-suite scope creep; the zone is the message, the ordering is
just a readable serialization of it.

### D5. Reading sibling tools: contract types only, degrade when absent

- **Stories.** The picker lists stories for the active product from the
  Vertical Slicer's store module (`src/utils/slicer-store.ts`, key
  `pm-slice-v1`). Per contract D8 we may rely only on: stories carry
  `uid("story")` ids and the `SpecRef` they were sliced from. The picker
  therefore consumes a narrow adapter,
  `listSlicerStories(productId): Array<{ storyId, specId, title }>`, isolated
  in one file (`src/components/tools/backlog-prioritizer/slicer-source.ts`) so
  that whatever listing surface the slicer lane actually ships, only the
  adapter changes. Persisted data stores `StoryRef` + `storyTitle` snapshot —
  never slicer internals.
- **Key results.** OKR Organizer's record shape *is* contract-fixed (D8:
  `{ quarter, objective, keyResults: [{ id, who, doesWhat, byHowMuch }], tag }`),
  so the KR picker reads the OKR store for the active product, filters to the
  board's quarter, and links via `OkrKeyResultRef` with a
  `who — doesWhat by byHowMuch` snapshot string.
- **Absence/drift.** If either sibling store is empty or its change hasn't
  merged, the tool still loads: story picker empty state links to
  `/tools/vertical-slicer/`, KR panel empty state links to
  `/tools/okr-organizer/` (linking by planned route, harmless 404 until those
  lanes land). Deleted/reworded sources follow contract D5: render the
  snapshot with a "source changed/removed" badge; never block, never cascade.

### D6. Page and component layout (mirrors the OST tool)

- `src/pages/tools/backlog-prioritizer.astro`: `SiteShell`, eyebrow "Free
  tool", intro copy citing the Agreement-Certainty method, link to the 2021
  backlog-triage post, then `<BacklogPrioritizer client:load />`.
- Island layout top-to-bottom: quarter switcher + KR filter → `MatrixBoard`
  (the 2x2, axis labels "Agreement →" / "Certainty →", zone regions tinted
  with `--accent-*`/`--ink-*` tokens) → `DecisionQueue` → `PriorityList` with
  a copy-as-Markdown export (same pattern as OST's `toMarkdown`).
- `MatrixHelpModal` reuses the OST help-modal pattern; content = the four
  zones with the post's response modes, linking all three 2021 case posts.
- Interactions: pointer events only (click matrix to place the selected
  story's dot; drag to move). No new dependencies; `<ScrollReveal>` for
  section fade-ins per repo motion conventions; respects
  `prefers-reduced-motion` (no dot-placement animation when set).

### D7. Should anything reference this tool's output by id?

Today, no listed tool needs it — Stakeholder Update reads whole boards via
`listForProduct`. Two plausible futures worth flagging to the contract lane:

- **Test Register** could prioritize scenario-writing by backlog rank ("test
  the Simple items first"); it already holds `StoryRef`s, so it can join
  through `storyId` against board items without any new ref type. No action
  needed.
- If a future tool ever needs to cite a specific prioritization decision
  (e.g. "story X was killed in 2026-Q3"), the contract should gain
  `BacklogItemRef { backlogId, itemId }` and the `item` prefix would become
  contract-level. Deliberately **not** proposed now — YAGNI until a consumer
  exists.

## Risks / Trade-offs

- [Slicer lane ships a story-listing surface the adapter didn't guess] → the
  adapter file is the only touch point; persisted `StoryRef`s are
  contract-stable either way. Worst case is a one-file fix at merge time.
- [Merge order: this lane lands before pipeline-store/okr/slicer modules
  exist] → hard dependency is only `pipeline-store.ts` (types + factory);
  tasks sequence this change after the contract change merges. Sibling stores
  are soft dependencies behind empty states.
- [Threshold-derived zones feel wrong for edge placements (49 vs 51)] → zone
  tint is visible *while dragging*, so placement and zone are argued together;
  thresholds are constants, adjustable without migration since raw 0–100
  coordinates are what's persisted.
- [Killed items accumulating forever in the record] → they're collapsed in the
  UI and bounded by quarter scoping; an explicit "remove from board" remains
  available. Not worth auto-pruning logic.
- [No test framework in repo] → per the contract's stated gate policy:
  TypeScript (`pnpm check`) + `pnpm build` + scripted manual smoke checklist
  in tasks.md. Zone-derivation and ordering are pure functions kept in the
  store module so `pnpm check` enforces their contracts and a future vitest
  adoption can cover them first.

## Migration Plan

Greenfield: new route, new namespace, new versioned key (`pm-backlog-v1`).
Nothing existing is touched; rollback = delete the page, component dir, and
store module. Future shape changes bump to `pm-backlog-v2` with a
read-old/write-new migration, per the contract's migration convention.

## Open Questions

- **Contract D4 prefix rows.** The contract's id-prefix table has no row for
  this tool's record prefix. This design uses `bklg` (board record) and keeps
  `item` tool-internal. The contract lane should add `bklg` to the D4 table
  (one-line delta to `donut-crm-pipeline-data-contract` while it is still
  unapplied); filed as a task-level follow-up rather than a delta here to
  avoid two unapplied changes modifying one spec.
- **Story-listing surface.** Exact export name/shape from
  `src/utils/slicer-store.ts` is unknown until the Vertical Slicer lane lands
  — absorbed by the D5 adapter; coordinate at merge.
- **Pipeline chrome.** The contract defers a shared stage-nav/product-switcher
  to `pipeline-tools-chrome`. This tool ships without it (active product
  resolved silently via `resolveActiveProduct()`), and should adopt the chrome
  when that change lands.
