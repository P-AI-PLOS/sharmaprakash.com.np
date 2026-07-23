## Context

Static Astro 6.3 site; the only sanctioned interactivity is React 19 islands
(icon islands + course exercises + tool builds). Two existing patterns this
change combines for the first time:

1. **Click-and-reveal classifiers** — `src/components/course/exercises/
   AssumptionClassifier.tsx` and `OpportunitySorter.tsx`. Both hardcode a
   fixed item list, render `ChoiceButton`s per item, and reveal a `Feedback`
   (`correct`/`why`) the instant an item is classified. Both are **linear**
   classifiers: one axis, N buckets, rendered as a flat button row. Neither
   has a "why does this bucket mean X" explainer beyond the per-item `why`
   string.
2. **Standalone + embeddable tool with a per-concept help modal** —
   `src/pages/tools/opportunity-solution-tree.astro` +
   `src/components/tools/ost/{TreeBuilder,OstHelpModal,OstTreeSwitcher,
   OstDashboard,TreeDiagram}.tsx` + `src/utils/ost-store.ts`. `TreeBuilder`
   takes a `source: OstSource` prop (`{ type: "standalone" }` or
   `{ type: "course"; ... }`) so the same component works embedded in a
   course chapter and on its own page. `OstHelpModal` is a per-concept
   (`outcome`/`opportunity`/`solution`/`target`) modal with definition,
   example, gotchas, and a numbered how-to, opened from next to wherever
   that concept is authored.

Neither classifier is a real **2×2** — Stacey's Agreement-Certainty Matrix
has two independent axes (agreement, certainty) crossing into four zones,
and the four `ls-decide` posts currently render that crossing only as prose
(read `2021-05-21-agreement-certainty-matrix-backlog-triage-recap-crm.md`
and the sibling three posts for the exact zone definitions and the specific
items each post already places — CRM backlog, SHORTEST flaky tests, leave-
balance accrual engine, Course Guru certificates). This change is the first
tool-shaped 2×2 on the site and the first sorter with OST's help-modal depth.

## Goals / Non-Goals

**Goals:**
- One reusable component that renders the four Stacey zones as a real 2×2
  (both axes labeled, not a flat button row), usable both embedded in an
  MDX post (curated items, scored reveal) and standalone (freeform items,
  no scoring).
- A per-zone help modal with the same definition/example/gotchas/how-to-
  recognize-it depth as `OstHelpModal`, for all four zones.
- Replace the static vignette in all four `ls-decide` posts with the
  interactive component, using only items and zone placements each post's
  own prose already states — no invented examples.
- A standalone `/tools/agreement-certainty-matrix/` page where a visitor
  builds their own board ("sort your own backlog"), persisted to
  localStorage only.

**Non-Goals:**
- No drag-and-drop. See D3.
- No multi-board switcher / dashboard grid (contrast with OST, which
  supports many trees). The standalone tool keeps one active board per
  product; a switcher is a named follow-up if demand shows up (Open
  Questions).
- No scoring/leaderboard, no export, no cross-tool references. This is a
  leaf tool: nothing downstream reads a matrix board's placements.
- No changes to `ost-store.ts`, the Donut CRM pipeline tool stores, or any
  `pipeline-data-contract` requirement (see D6).
- No rewriting of the four posts' prose. Only the vignette section (the
  "running it on X" walkthrough) changes shape from static to interactive;
  the "what it is" / "how it runs" / "where it breaks" sections are
  untouched.

## Decisions

### D1. One component, two modes: `curated` (scored) and `freeform` (unscored)

`AgreementCertaintyMatrix` takes a discriminated `mode` prop:

```ts
type MatrixItem = {
  id: string;
  text: string;
  /** Present only in curated mode. */
  zone?: MatrixZone;
  why?: string;
  /** True for the handful of items each post explicitly calls contested
   *  (e.g. the accrual-engine post's balance-summary redesign, which three
   *  groups placed in three different zones). Unscored even in curated mode. */
  contested?: boolean;
};

type MatrixProps =
  | { mode: "curated"; items: MatrixItem[]; kicker?: string; title: string; instructions: string }
  | { mode: "freeform"; boardId: string }; // freeform reads/writes matrix-store directly
```

Curated mode mirrors `AssumptionClassifier`: each item renders once, the
visitor picks a zone, immediate `Feedback` (correct/incorrect + `why`) for
scored items, or a neutral "here's the debate this item caused" reveal for
`contested` items — never marked right or wrong, because the post itself
presents no single right placement for those. A `ScoreBar`-style summary
counts only scored items.

Freeform mode drops scoring and the fixed item list entirely: the visitor
types their own item text, places it, and can re-place or delete it any
time; reveal text is the zone's operating instruction (design D5's zone
copy), not a correctness judgment, because there is no answer key for a
reader's own backlog.

**Alternative considered:** two separate components (`MatrixClassifier`,
`MatrixBoard`). Rejected — the 2×2 grid rendering, zone styling, and help
modal wiring are identical in both modes; only the item source and the
reveal semantics differ, which a mode prop expresses more cheaply than
duplicating the grid.

### D2. Grid rendering: a real 2×2, not four buttons in a row

The grid renders as a 2-column × 2-row CSS grid with axis labels (agreement
on one edge, certainty on the other, matching every post's own description
of the axes), each cell a `zone` button styled like `ChoiceButton` but
sized to fill its cell. This is the concrete gap the two existing
classifiers don't cover: `AssumptionClassifier`'s five categories and
`OpportunitySorter`'s three kinds are one flat axis: this is two axes
crossed, and the layout has to show that crossing (a reader should be able
to see "Complicated" sits directly above "Simple" because they share the
certainty axis) or the exercise teaches nothing about why the zones are
named what they are.

### D3. Click-to-place, not drag-and-drop

Placement is: tap an item card to select it, then tap a zone cell (or, on
the item card itself, four small zone buttons) — the same interaction
model `AssumptionClassifier`/`OpportunitySorter` already use, just aimed at
4 grid cells instead of N row buttons. No drag library, no pointer-event
custom logic, works identically on touch and keyboard
(`aria-pressed`/`tabIndex` reuse `ChoiceButton`'s existing accessibility
behavior). **Alternative considered:** real drag-and-drop for a more
literal "sticky note on a whiteboard" feel — rejected: no drag primitive
exists anywhere else in the codebase (no new dependency wanted for one
tool), and it complicates mobile and keyboard use for no comprehension
gain over click-to-place, which is also the reveal-timing model every
other classifier on the site already teaches readers.

### D4. Per-post curated item sets, drawn verbatim from that post

One data module per post,
`src/components/tools/matrix/curated/{crm-backlog,flaky-tests,
accrual-engine,certification-feature}.ts`, each exporting a `MatrixItem[]`
built only from that post's own "running it on X" section:

- `crm-backlog.ts` (4 items, one per zone): pipeline last-activity-date
  tweak → Simple; email SPF/DKIM deliverability fix → Complicated;
  sales/marketing handoff redesign → Complex; contact-merge data-integrity
  incident → Chaotic.
- `flaky-tests.ts` (4 items): timing-race + shared-fixture flakiness →
  Simple; CI container/driver-version drift → Complicated; cause-unclear
  generated-test brittleness dispute → Complex; the post's own named
  hypothetical (a flaky-failure spike right before a customer's release
  freeze) → Chaotic, worded as the post words it ("worth noting... would
  belong there").
- `accrual-engine.ts` (2 scored + 1 contested, no Simple/Chaotic item exists
  in this post): accrual-rate/proration/carryover-cap work → Complicated;
  manager approval-screen redesign → Complex; the employee balance-summary
  redesign, which three groups placed in three different zones →
  `contested: true`.
- `certification-feature.ts` (2 scored, no Complicated/Chaotic item exists
  in this post): instructor-dashboard UI tweak and enrollment CSV export →
  Simple; the certification feature itself (three named fault lines:
  branding, verification overhead, pricing/access) → Complex.

Item counts and zone coverage are **not** normalized to 4-per-post — a post
that names no Chaotic example does not get one invented for symmetry. This
is a right-sizing call: forcing every post into the same 2×2×N template
would mean writing content the source posts don't contain.

### D5. Zone copy is one shared source, not duplicated per file

The four zones' definition/example/gotchas/how-to-recognize content lives
once, in `MatrixHelpModal.tsx`, structured exactly like `OstHelpModal`'s
`CONTENT: Record<OstConcept, ConceptContent>` map (`icon`, `label`,
`definition`, `example`, `gotchas`, `howTo`) but keyed by
`MatrixZone = "simple" | "complicated" | "complex" | "chaotic"`, sourced
from the shared "What it is" language repeated (with small variation)
across all four posts, plus each zone's "match approach to zone" line as
the reveal-time operating instruction reused by freeform mode (D1). One
modal, opened from a `?` affordance next to the grid's zone labels —
mirrors `OstHelpModal`'s trigger placement (next to where the concept is
authored, not buried in the diagram).

### D6. Store: `createToolStore`, consumed as-is — no `pipeline-data-contract` delta

`src/utils/matrix-store.ts` wraps
`createToolStore<MatrixRecord>({ storageKey: "pm-matrix-v1", idPrefix:
"matrix" })` purely for the engineering properties every other tool store
gets for free (versioned key, in-memory cache, silent try/catch I/O,
`ToolRecordBase` timestamps) — the same reason `ost-store.ts` sits on this
factory even though OST isn't one of the eight Donut CRM pipeline-stage
tools either. This tool needs none of the contract's cross-tool shapes
(`OstPickRef`, `SpecRef`, `StoryRef`, `OkrKeyResultRef`,
`AcceptanceCriterionRef`) or its quarter representation — a matrix board is
a flat list of `{ text, zone }` pairs with no downstream reader. Record
shape:

```ts
export type MatrixZone = "simple" | "complicated" | "complex" | "chaotic";

export interface MatrixBoardItem {
  id: string;       // uid("mitem")
  text: string;
  zone: MatrixZone | null; // null until placed
}

export interface MatrixRecord extends ToolRecordBase {
  items: MatrixBoardItem[];
}
```

Because no requirement in `pipeline-data-contract` needs to change (no new
reference type, no new id-prefix table entry beyond what `createToolStore`
already parameterizes, no quarter concept), **no delta is proposed against
that capability** — matching the precedent set by `vertical-slicer-tool`'s
proposal.md ("`pipeline-data-contract` is consumed as-is... no requirement
in it changes"). This was the one open question flagged in the task brief;
resolving it this way keeps the change to one new leaf capability.

### D7. One active board per product, no switcher (yet)

`resolveActiveBoard()` mirrors OST's `resolveActiveTree`: on load, resolve
the active product (`resolveActiveProduct()`), look up that product's
active board via `store.getActiveId(productId)`, and create-and-activate an
empty board if none exists. Unlike OST, this change does not ship a
switcher UI for multiple boards per product — one board is enough for
"sort your own backlog" and keeps the standalone page to a single focused
island. `createToolStore` already supports multiple records per product if
a switcher becomes a follow-up (Open Questions); nothing here forecloses
it.

### D8. Page and components

- `src/pages/tools/agreement-certainty-matrix.astro` — `SiteShell`,
  eyebrow "Free tool" hero explaining the matrix in one paragraph and
  linking to the first `ls-decide` post for the full method, one
  `client:load` island, "everything saves in your browser" copy — same
  shape as `opportunity-solution-tree.astro`.
- `src/components/tools/matrix/`:
  - `AgreementCertaintyMatrix.tsx` — the shared 2×2 grid + item cards +
    reveal, per D1–D3.
  - `MatrixHelpModal.tsx` — per D5.
  - `MatrixTool.tsx` — the standalone island: resolves the active board via
    `resolveActiveBoard()`, renders an "add item" input and the grid in
    `freeform` mode, wires store mutations.
  - `curated/*.ts` — the four per-post item data modules, per D4.
- Embeds: each of the four posts' MDX imports
  `AgreementCertaintyMatrix` directly with `mode="curated"` and its own
  `curated/*.ts` item set — no astro page change needed for the embeds,
  matching how `AssumptionClassifier client:visible` is used directly
  inside `2025-09-15-...mdx`.
- Tailwind utilities on `tokens.css` variables only; `<ScrollReveal
  delay={Math.min(i, 4) * 40}>` on the item list; `prefers-reduced-motion`
  respected; no new dependencies (reuses `lucide-react`, already a
  dependency via OST).

### D9. Posts convert from `.md` to `.mdx`

The four posts currently end in `.md` and cannot import a component. They
convert to `.mdx`, matching the precedent already in the repo
(`2025-09-01-opportunity-solution-trees-the-shape-of-good-discovery.mdx`,
`2025-09-15-assumption-mapping-experiments-that-test-the-riskiest-thing-
first.mdx`). The route is unaffected — `src/pages/[...slug].astro` and the
`posts` collection glob both resolve `.md`/`.mdx` the same way, and
frontmatter (`directory`, `series`, `seriesOrder`, etc.) is carried over
unchanged, so URLs stay locked per the repo's convention. Only the
"running it on X" vignette section is replaced with the component embed;
every other section's prose is preserved verbatim.

## Risks / Trade-offs

- [Forcing prose examples into a scored right/wrong shape misrepresents
  posts that describe genuine debate] → D4's `contested` flag and D1's
  unscored reveal for those items keep the accrual-engine post's balance-
  summary item (three groups, three placements) honest instead of
  fabricating a single correct answer.
- [2×2 click-to-place doesn't convey the physical "argue over a sticky
  note" texture the posts describe] → out of scope for a first version;
  the reveal text explicitly names the real debate ("half the room put it
  near Simple, the other half wouldn't move it off Complex" etc.) so the
  debate is preserved as content even without live multiplayer placement.
- [`.md` → `.mdx` conversion for four published posts risks a frontmatter
  or build regression] → mitigated by copying frontmatter byte-for-byte
  and validating with `pnpm build` + Pagefind index unaffected (tasks.md
  verification step); no directory/slug field changes, so URLs cannot
  shift.
- [Standalone tool with no switcher feels thin next to OST] → acceptable
  for a first release; `createToolStore` already supports more boards per
  product without a data migration if a switcher is requested later.
- [localStorage quota/private mode] → inherited silent-degrade behavior
  from `createToolStore`; tool remains usable in-session.
- [No test framework in repo] → per the pipeline-data-contract change's
  ruling (reused here), gates are `pnpm check` and `pnpm build` plus a
  scripted manual smoke walkthrough in tasks.md.

## Migration Plan

Greenfield for code: new component directory, new store key
(`pm-matrix-v1`), new page. The only "migration" is the four posts'
extension change (`.md` → `.mdx`) and the vignette-section replacement
inside them — both reversible by reverting those four files. Rollback of
the tool code = delete the new directory/page/store; no other file
depends on `matrix-store.ts`.

## Open Questions

- **Multi-board switcher for the standalone tool** — deferred per D7; worth
  building only if usage data (once the tool ships) shows people wanting
  more than one saved backlog board.
- **Should the curated embeds show the "sort your own board" affordance
  inline**, letting a post reader add their own item right there instead
  of only on the standalone page? Shipping curated-only in posts for v1 —
  keeps the embed lightweight and reveal-focused; the standalone page's
  link is the on-ramp for the freeform case. Revisit if readers ask for it
  in comments/feedback.
- **Exact per-item wording** for the four `curated/*.ts` data modules is
  implementation detail, not re-litigated here; tasks.md instructs pulling
  the phrasing straight from each post's own text (D4 lists which specific
  passages) rather than paraphrasing.
