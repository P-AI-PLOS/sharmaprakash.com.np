## Context

Static Astro 6.3 site; interactive tools are React 19 islands persisting to
localStorage only. Two reference implementations converge on this tool:

- **Page/store/component shape:** `src/pages/tools/opportunity-solution-tree.astro`
  + `src/components/tools/ost/{TreeBuilder,OstDashboard,OstTreeSwitcher,OstHelpModal}.tsx`
  + `src/utils/ost-store.ts`, itself built on the shared factory in
  `src/utils/pipeline-store.ts` (`createToolStore`, `ToolRecordBase`,
  `resolveActiveProduct`). OST proves the pattern of a tool that uses the
  pipeline data contract's storage factory without being one of the eight
  named Donut CRM pipeline stages — `resolveActiveProduct()` is called purely
  to satisfy `ToolRecordBase.productId`, not because this tool has any Donut
  CRM concept of "products."
- **Interaction shape:** `src/components/course/exercises/OpportunitySorter.tsx`
  and `AssumptionClassifier.tsx` — classify N items into a small fixed set of
  labeled buckets with a button per bucket, instant feedback per item. Both
  are graded exercises over fixed, invented data (Donut CRM discovery notes).
  This tool borrows the *button-per-bucket* interaction but drops grading
  entirely — there is no "correct" bucket for a reader's own backlog item, so
  the feedback is a bucket-appropriate one-liner reflecting the post's
  criteria, not a right/wrong verdict.

Source post: `src/content/posts/2025-04-10-backlog-cleanup-how-to-actually-do-it.md`,
"Step two: triage the survivors into now, next, never" — **Now** (committed,
this cycle, named owner), **Next** (short queue, size-limited by definition,
within a quarter), **Never** (said out loud, closed with a reason).

Sibling lanes in flight, noted for the orchestrator, no file overlap:
`agreement-certainty-matrix-tool` (2x2 quadrant, adapts the same two exercise
components for a different 2021 post) and `backlog-prioritizer-tool` (Donut
CRM pipeline stage 04 — product/quarter-scoped Agreement/Certainty matrix over
Vertical Slicer stories, a different data model entirely). This proposal is
self-contained: new store key, new component directory, one content-file
rename, nothing shared.

## Goals / Non-Goals

**Goals:**
- A reader can type or bulk-paste their own backlog items and sort each one
  into Now / Next / Never, with a persistent, revisitable board.
- Both a keyboard/click move action and native pointer drag work for moving
  an item between buckets — no drag-and-drop library dependency.
- Reflect the post's specific criteria for each bucket (committed-this-cycle;
  size-limited short queue; said-out-loud-with-a-reason) in the tool's help
  copy and per-bucket prompts, not a generic 3-column kanban.
- Same page/store shape as the OST tool; contract compliance via
  `createToolStore`, used unmodified.
- Embeddable in the source post (post embed) and standalone at
  `/tools/backlog-triage/`.

**Non-Goals:**
- No real backlog/ticket-tracker integration (Jira, Linear, etc.) — items are
  free text, nothing more.
- No collaboration/sharing/multi-user anything — one browser's localStorage.
- No enforcement of the Never-reason field, no hard block on Next-column
  size — the post's discipline is a practice, not a validation rule; the tool
  nudges (see D5), it does not gate.
- No drag-and-drop library — see D4.
- No changes to `pipeline-data-contract`, `ost-store.ts`, or any other tool's
  files.

## Decisions

### D1. Linear 3-bucket board, not a 2x2 grid

The post's framework is one axis (commitment horizon: now / next / never),
not two independent axes. `agreement-certainty-matrix-tool` (sibling, in
flight) is explicitly a 2x2 quadrant for a different post (Stacey's
Agreement/Certainty matrix) — that shape doesn't fit here and mixing the two
would blur both tools' teaching point. This tool is a single-row (or
single-column, responsive) board of three labeled drop targets, closer to
`OpportunitySorter`'s flat list-plus-buttons layout than to any grid.

### D2. Store: `createToolStore`, contract used as-is

`src/utils/backlog-triage-store.ts` wraps
`createToolStore<TriageBoardRecord>({ storageKey: "pm-backlog-triage-v1", idPrefix: "triage" })`.
No delta against `pipeline-data-contract` is needed — this tool needs nothing
the contract doesn't already provide, exactly like `ost-store.ts`. Each record
gets `productId: resolveActiveProduct().id` purely to satisfy
`ToolRecordBase`; the tool's own UI never shows or asks about "products" —
that field is inert plumbing here, not a feature.

### D3. Record shape

```ts
export type TriageBucket = "now" | "next" | "never";

export interface TriageItem {
  id: string;              // uid("titem")
  text: string;
  bucket: TriageBucket;     // default "now" is wrong for an untriaged item —
                            // new items land in an explicit fourth, unbucketed
                            // staging state instead (see below)
  neverReason: string;      // "" until set; only meaningful when bucket === "never"
  createdAt: number;
  updatedAt: number;
}
```

New items are NOT defaulted into "now" — an untriaged item defaults to a
zero-width staging lane (`bucket: null` at the type level, modeled as
`TriageItem["bucket"]` being `TriageBucket | null`) so the board never lies
about work being committed before the reader has actually decided. This
mirrors the post's own claim that the deletion pass/triage is a *decision*,
not a default.

```ts
export interface TriageBoardRecord extends ToolRecordBase {
  title: string;                 // e.g. "My Q3 backlog" — default "Untitled board"
  items: TriageItem[];
  source: TriageSource;
}

export type TriageSource =
  | { type: "standalone" }
  | { type: "post" };             // the one embed context — see D6
```

`TriageSource` is deliberately smaller than OST's (no per-chapter variants):
this tool has exactly one embed site (the backlog-cleanup post itself) plus
the standalone page, so a two-case union is the honest model — inventing a
generic `course`-shaped slot for a single embed would be speculative.

### D4. Move interaction: buttons + native pointer drag, no library

Every item card shows the three bucket labels as toggle-style buttons
(`aria-pressed`, same visual language as `ChoiceButton` in
`exercise-ui.tsx`) — clicking the bucket that isn't currently selected moves
the item; this is the primary, fully keyboard- and screen-reader-operable
path and works with zero new dependencies. Item cards additionally set
`draggable="true"` and each column is a plain `onDragOver`/`onDrop` target
using the native HTML5 Drag and Drop API (no `react-dnd`/`@dnd-kit`) — a
progressive enhancement for pointer users who prefer dragging. Native HTML5
DnD is invisible to touch without extra polyfill work, which is acceptable
here because the button path already fully covers touch and keyboard.

Alternative considered: a drag-only board (matches the "physical index card"
metaphor more closely) — rejected because native HTML5 drag has no
accessible fallback and this site ships no DnD library; alternative
considered: adding `@dnd-kit` for full touch+keyboard drag parity — rejected
as a new dependency for a feature the button interaction already delivers.

### D5. Never-reason field and the Next-size nudge are advisory, not enforced

Moving an item to "never" reveals an inline, optional one-line reason input
(placeholder text drawn from the post's own example — "closed for age" /
"serves a segment we've deprioritized"). Nothing blocks leaving it empty; the
Never column instead shows a small persistent caption ("closed, with a
reason — the post's whole point") when any never-item lacks a reason, as a
nudge rather than a validation error.

Similarly, when the Next column holds more than a small constant (8 items,
tuned in code, not configurable), the column header shows a one-line nudge
("Next has a size limit by definition — the post's words") without disabling
further moves. Both are pure UI state, computed at render time from
`items`, never persisted — consistent with contract guidance that derived
readouts (cf. OKR Check-In's trend tag) don't belong in storage.

### D6. Two embed contexts, one active board each, no dashboard-required complexity

Unlike OST (course chapters × standalone, many trees), this tool has exactly
two contexts: `{ type: "standalone" }` and `{ type: "post" }`. Each context
resolves (creates-if-missing) its own active board via the store's
scope-keyed active pointer (`contextKeyFor` returns `"standalone"` or
`"post"` — a two-value function, simpler than OST's chapter-keyed version).
The standalone page additionally shows a lightweight "Your boards" list
(title, item count, last-updated, open/delete — a trimmed `OstDashboard`,
no course-link column since only two contexts exist) so a reader who wants
more than one board (e.g., one per team) can create and switch between them;
the post embed does not show this list, matching how `TreeBuilder` only
shows `OstDashboard` when `showDashboard` is set.

### D7. Page and components

- `src/pages/tools/backlog-triage.astro` — SiteShell, eyebrow/H1/intro hero
  paraphrasing the post's Now/Next/Never framing, one `client:load` island,
  "everything saves in your browser" copy, a link back to the source post.
- `src/components/tools/backlog-triage/`:
  - `TriageBoard.tsx` — island root: resolves the active board for its
    `source`, item-add form (single-line input + a "paste multiple lines"
    textarea that splits on newlines), renders the three `TriageColumn`s,
    Markdown export, optional `TriageDashboard`.
  - `TriageColumn.tsx` — one bucket: header (label + criteria one-liner +
    nudge when applicable), native drop target, renders its items.
  - `TriageItemCard.tsx` — text, three bucket buttons, drag handle, the
    inline never-reason input when `bucket === "never"`, delete action.
  - `TriageDashboard.tsx` — "Your boards" list (mirrors `OstDashboard`,
    minus the course-link column), shown only via a `showDashboard` prop.
  - `TriageHelpModal.tsx` — mirrors `OstHelpModal`: explains each bucket in
    the post's own terms (committed/named-owner; size-limited/quarter;
    said-out-loud/with-a-reason) and links to the post.

React islands, Tailwind on `tokens.css` variables only (no new color
tokens — the three buckets are distinguished by label, icon, and copy, not a
red/green palette the token set doesn't have), `<ScrollReveal delay={Math.min(i, 4) * 40}>`
on item lists, `prefers-reduced-motion` respected.

### D8. Markdown export

A "Copy as Markdown" action (mirrors OST's `toMarkdown`/clipboard pattern)
produces three headed lists (`## Now`, `## Next`, `## Never`), Never items
appending their reason in parentheses when set, for pasting into a real
tracker or doc.

### D9. Post embed: `.md` → `.mdx`, prose kept, board added under Step two

The source post is currently `.md` (no component imports possible). Renaming
it to `.mdx` and adding `import TriageBoard from
"~/components/tools/backlog-triage/TriageBoard.tsx";` plus a `<TriageBoard
client:load source={{ type: "post" }} .../>` block placed immediately after
the existing "Step two" prose (prose is not deleted or shortened — the board
supplements it) mirrors the exact mechanism already proven for
`2025-09-11-from-opportunities-to-solutions-ideating-alone-and-together.mdx`.
`client:load` (not `client:visible`) matches `TreeBuilder`'s embed, so the
board is interactive without waiting on a scroll-into-view trigger,
consistent with the rest of the post being read top to bottom.

The rename is confirmed safe for the locked URL: `src/content.config.ts`
derives each post's collection `id` by stripping the date prefix **and the
`.md`/`.mdx` extension** from the filename
(`filename.replace(/\.(md|mdx)$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "")`),
and `postUrl()` builds the route from `post.id` + `post.data.directory`
(`src/utils/posts.ts`) — neither depends on the extension. Frontmatter
(`directory: product-management`, `series`, `seriesOrder`, `date`, etc.)
carries over unchanged into the `.mdx` frontmatter block.

## Risks / Trade-offs

- [Native HTML5 drag has inconsistent touch support] → the button-based move
  is the fully-supported primary path (D4); drag is a bonus for desktop
  pointer users, not the only way to move an item.
- [`.md` → `.mdx` rename could be mistaken for a content change by tooling
  that diffs by filename] → git records it as a rename with a content diff
  for the added import/embed block only; prose is otherwise byte-identical.
  Verified against `content.config.ts`'s id derivation (D9) before proposing.
- [Reader loses their board (private browsing, storage full, cache clear)] →
  inherited silent-degrade behavior from `createToolStore`; Markdown export
  (D8) is the reader's own backup path, called out in the help copy.
  Duplicate boards across the two contexts if a reader crafts localStorage by
  hand] → out of scope; not a realistic path through the UI.
- [No test framework in repo] → gates are TypeScript (`pnpm check`) and
  `pnpm build`, plus a scripted manual smoke in tasks.md — same ruling as
  every other tool in this pipeline family.

## Migration Plan

Mostly greenfield: new page, new component directory, new store key
(`pm-backlog-triage-v1`). The only modification to an existing file is the
post rename + embed insertion, which is additive (no prose removed). Rollback
= delete the three new code paths and revert the post to `.md` with the
embed block removed; nothing else references the new store key.

## Open Questions

- Should the standalone page seed a starter board with a few example items
  (à la the post's own fintech anecdote) so first-time visitors see the
  interaction before typing their own items, or open fully empty? Shipping
  fully empty with a clear "paste your list" prompt — an empty board matches
  every other pipeline tool's first-visit behavior (OST starts blank), and
  the post's own worked example lives in the prose right above the embed.
- Exact Next-column nudge threshold (8) is a judgment call reflecting "a few
  dozen" from step three of the post, scaled down for a 3-column reader tool
  rather than a whole-team backlog; revisit if it proves too chatty or too
  quiet once real readers use it.
