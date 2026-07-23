## Context

Static Astro 6.3 site; interactive tools are React 19 islands persisting to
localStorage only. Reference implementation for this exact shape (root →
branches → leaves, click-to-add, canvas rendering, Markdown export):
`src/pages/tools/opportunity-solution-tree.astro` +
`src/components/tools/ost/{TreeBuilder,TreeDiagram,OstHelpModal,OstDashboard,OstTreeSwitcher}.tsx`
+ `src/utils/ost-store.ts`, itself now built on the shared factory in
`src/utils/pipeline-store.ts` (capability `pipeline-data-contract`,
`openspec/specs/pipeline-data-contract/spec.md`).

The gap this fills: `2025-02-03-north-star-metrics-and-metric-trees.md`
("The tree is where the metric becomes a strategy" and action item #2, "Draw
the tree to the team level") describes a metric-decomposition tree in prose
only, with no rendered example and no way for a reader to build their own.
OST's shape is structurally identical at a glance but fixed at exactly two
levels below the root (outcome → opportunity → solution) with different node
semantics per level (opportunity vs. solution have different fields and
icons). A metric tree has no such fixed depth or per-level semantics — every
node is "a metric," and any node can have children or be a leaf, at any
depth.

Sibling context: no other in-flight OpenSpec change touches
`src/components/tools/ost/` or `pipeline-store.ts`; this lane only reads the
existing contract, so it can land independently of the Donut CRM pipeline
lanes (`okr-organizer-tool`, `okr-check-in-tool`, etc.), which this tool is
unrelated to in content.

## Goals / Non-Goals

**Goals:**
- Let a reader build a real North Star metric tree of arbitrary depth: root
  (the North Star), any number of input-metric levels, leaves that are
  actionable/team-ownable metrics.
- Let a reader flag any leaf as **orphan** (nobody owns it) or **contested**
  (more than one team claims it), with an optional note — the one piece of
  domain semantics this post adds that OST's tree doesn't have.
- Reuse OST's proven rendering approach (react-d3-tree, direction toggle,
  fullscreen, drag/zoom) with no new dependency.
- Ship both a standalone tool page and a direct embed inside the source post,
  seeded with the post's own worked example, so "draw the tree" becomes
  literal instead of aspirational.
- Comply with the `pipeline-data-contract` capability exactly as OST does
  (`createToolStore`, `resolveActiveProduct`, stable `uid()` ids) — no parallel
  storage mechanism invented.

**Non-Goals:**
- Extracting a shared generic N-level tree primitive for OST + this tool
  right now (D1).
- Live metric values, dashboards, historical tracking, or any join into the
  Donut CRM pipeline stores (OKR Organizer, etc.) — node text is free-form,
  exactly like OST's opportunity/solution text.
- Per-level typed semantics (e.g. distinguishing "ratio metric" vs. "count
  metric") — a node is just text; the post's own prose supplies that
  vocabulary, the tool supplies structure.
- Reorder-by-drag, multi-parent/DAG structures, or metric-tree templates
  (AARRR/HEART starter shapes) — plain add/remove/annotate covers the post's
  "put it to work" exercise; templates are a plausible follow-up, not this
  change.

## Decisions

### D1. No shared generic tree primitive — new namespace instead, revisit at the third instance

Considered: extract a generic `Tree<T>`/`RecursiveTreeDiagram` primitive that
both `ost/` and the new tool build on, since both are "root → branches →
leaves, click to add, react-d3-tree, Markdown export."

Rejected for now. The two trees differ in exactly the ways that matter for a
shared abstraction:
- **Depth:** OST is fixed at two levels with different *types* per level
  (`OstOpportunity` has `target`/`solutions`; `OstSolution` is a leaf record
  with no further shape). A metric tree is homogeneous and unbounded —every
  node is the same shape, recursively, to any depth.
- **Leaf semantics:** OST's "target" flag lives on opportunities (branches);
  this tool's orphan/contested annotation lives on leaves. Generalizing both
  into one node-annotation model now would mean guessing which future tool's
  needs the abstraction should also cover, with only two data points.
- **Migration risk for zero benefit today:** OST's store already carries a
  documented migration history (`migrateLegacy`, `backfillIds`, `pipeline-data-contract`
  D9). Refactoring `ost-store.ts`/`TreeDiagram.tsx` onto a new shared
  primitive to serve a single new caller risks that stable code for no
  reader-facing gain — the post doesn't need OST to change at all.

Decision: build `src/components/tools/metric-tree/` and
`src/utils/metric-tree-store.ts` as their own thing, following OST's
*pattern* (file shapes, store conventions, rendering approach) closely enough
that a future extraction is a mechanical refactor, but without coupling the
two tools' code today. If a **third** N-level or annotated-node tree tool is
proposed later, that proposal should extract the shared primitive from
whichever two of the three are most alike by then — noted as a follow-up in
Open Questions, not built speculatively here.

### D2. Node shape: homogeneous, recursive, leaf-detected structurally

```ts
export type MetricAnnotationStatus = "orphan" | "contested";

export interface MetricAnnotation {
  status: MetricAnnotationStatus;
  note: string; // free text — "no team has claimed this" / "Growth vs. Lifecycle both think this is theirs"
}

export interface MetricNode {
  id: string;               // uid("mtn") — stable across edits/reorders
  text: string;              // the metric name, e.g. "activation rate"
  children: MetricNode[];
  /** Only meaningful when children.length === 0; UI only offers it on leaves. */
  annotation: MetricAnnotation | null;
}

export interface MetricTree {
  root: MetricNode; // root.text is the North Star metric itself
}
```

There is no separate `outcome` field the way OST has `tree.outcome` — the
root **is** just the topmost `MetricNode`, whose text is the North Star
metric. This keeps the shape genuinely homogeneous (one node type recurses
all the way down) rather than a root type plus a branch type plus a leaf
type. "Leaf" and "branch" are never stored as a kind — they're derived from
`children.length === 0` at render/edit time, so a node that gains a child
loses its leaf-only annotation controls automatically without a migration
(the UI clears `annotation` when a child is added to a previously-annotated
node, since orphan/contested no longer applies once the metric has been
decomposed further).

Alternative considered: a discriminated `kind: "root" | "branch" | "leaf"`
field, mirroring OST's `attributes.kind`. Rejected — it would need to be kept
in sync with the actual tree shape by hand (add a child to a "leaf" node,
forget to flip its `kind`) where deriving it structurally can't drift.

### D3. Store: `createToolStore`, context-scoped active pointer like OST — not product-scoped

```ts
export type MetricTreeSource =
  | { type: "standalone" }
  | { type: "post"; postSlug: string; postTitle: string; href: string };

export interface MetricTreeRecord extends ToolRecordBase {
  tree: MetricTree;
  source: MetricTreeSource;
}
```

`src/utils/metric-tree-store.ts` wraps
`createToolStore<MetricTreeRecord>({ storageKey: "pm-metric-tree-v1", idPrefix: "mt", activeKey: "metric-tree-active-v1" })`,
overriding `activeKey` exactly as OST does, because the active record is
scoped by **embed context** (`contextKeyFor(source)`: `"standalone"` or
`"post:<postSlug>"`), not by product — a visitor reading the metric-tree post
and the standalone tool page are two different "which tree is open here"
questions, same as OST's course-chapter vs. standalone split. `productId` is
still stamped via `resolveActiveProduct()` on every record purely for
contract compliance (`ToolRecordBase` requires it) and so the tool
participates in the same "Donut CRM" running-case seed as every other
pipeline-adjacent tool — it is not otherwise used for scoping or joins here.

`MetricTreeSource` uses `type: "post"` rather than reusing OST's
`type: "course"` shape, because this tool embeds in a blog post, not a course
chapter — a post has a slug/title/href, not a course/chapter pair. This is a
new type in a new module; it does not touch `OstSource`.

### D4. Diagram: a new `MetricTreeDiagram`, not a generalized `TreeDiagram`

`src/components/tools/metric-tree/MetricTreeDiagram.tsx` reuses OST's
`TreeDiagram.tsx` techniques verbatim (react-d3-tree `Tree`, the
`scaleX(-1)` right-to-left trick, `ResizeObserver`-driven dimensions,
`foreignObject` custom node rendering, `pathFunc="step"`, `zoomable`/
`draggable`) but converts `MetricNode` to `RawNodeDatum` **recursively**:

```ts
const toRawData = (node: MetricNode): RawNodeDatum => ({
  name: node.text,
  attributes: {
    isLeaf: node.children.length === 0,
    annotationStatus: node.annotation?.status ?? "",
  },
  children: node.children.map(toRawData),
});
```

Node styling uses two tiers instead of OST's three: **root** (boldest,
`accent-600`/`accent-50`, same tokens OST uses for outcome), and everything
else styled by leaf-vs-branch (`isLeaf` attribute) rather than by hard-coded
depth, since depth is unbounded. An orphan or contested leaf gets a small
badge in the same visual language as OST's "Target" pill (`Target` icon
reused for contested — two claimants — and a new `Ghost`-style/`UserX`
lucide icon for orphan), styled with existing `--accent-*`/`--ink-*` tokens,
no new colors.

### D5. Annotation UI: only ever offered on leaves, cleared automatically when a leaf gains a child

The editor renders a node row with "Add child metric," "Mark orphan," "Mark
contested," and "Remove" actions. "Mark orphan/contested" only appears when
`children.length === 0`; the moment a child is added to a node that had an
annotation, the annotation is cleared (D2) — the UI surfaces this as a small
inline note ("Adding a child metric clears this leaf's orphan/contested
flag") rather than silently dropping data, since it's a rare, deliberate
action (decomposing further undoes "this is as far down as it goes").

### D6. Markdown export mirrors OST's icon language, indented by depth

```ts
const ICON = { root: "🌟", branch: "📊", leaf: "🎯" } as const;

const lineFor = (node: MetricNode, depth: number): string[] => {
  const isLeaf = node.children.length === 0;
  const icon = depth === 0 ? ICON.root : isLeaf ? ICON.leaf : ICON.branch;
  const badge =
    node.annotation?.status === "orphan" ? " — 🕳️ orphan" :
    node.annotation?.status === "contested" ? " — ⚔️ contested" : "";
  const line = `${"  ".repeat(depth)}- ${icon} ${node.text}${badge}`;
  return [line, ...node.children.flatMap((c) => lineFor(c, depth + 1))];
};
```

Output is a flat, indented Markdown bullet list under a `# North Star metric
tree` heading — copy-pasteable into a doc the way OST's export already is.
Annotation notes (the free-text reason) are omitted from the compact export
line but shown in the on-page editor; adding them to export is a trivial
follow-up if requested, not required by the post's exercise.

### D7. Standalone page + post embed, seeded worked example

- `src/pages/tools/north-star-metric-tree.astro` mirrors
  `opportunity-solution-tree.astro`: `SiteShell`, eyebrow/H1/intro hero, one
  `client:load` `MetricTreeBuilder` island, `source={{ type: "standalone" }}`,
  "everything saves in your browser" copy, `showDashboard` for the "your
  trees" grid (mirrors `OstDashboard`).
- The post is renamed `.md` → `.mdx` (frontmatter, date, slug, and
  `directory: product-management` unchanged — URL is locked and unaffected)
  and imports `MetricTreeBuilder` the same way
  `2025-09-11-from-opportunities-to-solutions-ideating-alone-and-together.mdx`
  imports `TreeBuilder`, placed right after "The tree is where the metric
  becomes a strategy" (replacing the implicit "picture this in your head"
  ask) with `source={{ type: "post", postSlug: "north-star-metrics-and-metric-trees", postTitle: "North Star Metrics and Metric Trees", href: "/product-management/north-star-metrics-and-metric-trees/" }}`.
- **Seeded default, not an empty tree:** unlike OST (which starts empty),
  `resolveActiveTree` for a **new** `type: "post"` record only (never
  overwriting an existing saved tree) seeds the post's own marketplace
  example from "The tree is where the metric becomes a strategy" — *weekly
  transactions* → *active buyers* × *transactions per buyer*; *active buyers*
  → *new activations* + *retained* + *resurrected*; *activation* → *signups*
  × *onboarding completion* × *first-transaction rate* — so a first-time
  reader sees a worked tree immediately and edits it into their own, rather
  than facing a blank root field. The standalone page's `type: "standalone"`
  source keeps OST's convention of starting empty, since it has no single
  worked example to seed from.

### D8. Storage key / id prefix

Following the `pipeline-data-contract` D4 table convention
(`pm-<tool>-v1` / prefix): `storageKey: "pm-metric-tree-v1"`,
`idPrefix: "mt"` for tree records, node ids as `uid("mtn")`. New keys, no
migration needed (greenfield).

## Risks / Trade-offs

- [Depth explosion — a visitor nests 15 levels deep and the diagram becomes
  unreadable] → `nodeSize`/`separation` inherited from OST's tuned values;
  no hard depth cap is enforced (the post's own example only needs 3 levels
  and artificial limits would fight a legitimately deep tree), but the help
  modal's guidance explicitly recommends stopping once a leaf is
  team-ownable, per the post's own advice.
- [Two near-identical tree tools now exist in the codebase, inviting drift]
  → mitigated by D1's explicit revisit trigger (third instance) and by
  deliberately mirroring OST's file/store *conventions* even though the code
  isn't shared, so a future extraction is mechanical rather than a rewrite.
- [Seeded example on first post-embed visit could be missed as "someone
  already answered this for me"] → the seeded tree is fully editable/clearable
  immediately, and the hero copy ("Edit this into your own product's tree")
  makes clear it's a starting point, not the post's answer key.
- [localStorage quota / private mode] → inherited silent-degrade behavior
  from `createToolStore`, identical to every other pipeline-adjacent tool.
- [No test framework in repo] → gates are `pnpm check` (TypeScript) and
  `pnpm build`, plus a scripted manual smoke walkthrough in tasks.md,
  matching the ruling already established for OST and the Donut CRM tools.

## Migration Plan

Greenfield: new page, new component directory, new store key
(`pm-metric-tree-v1`), one existing content file renamed `.md` → `.mdx` with
an added import + embed (no frontmatter/URL change). Nothing in
`src/components/tools/ost/`, `src/utils/ost-store.ts`, or
`src/utils/pipeline-store.ts` is modified. Rollback = delete the new
page/components/store file and revert the post to `.md` without the embed;
the only artifact touching shared state is `pm-metric-tree-v1` localStorage
records, which are inert if the code is removed.

## Open Questions

- **Generic tree primitive revisit trigger (for future orchestrators):** if a
  third click-to-add/react-d3-tree tool is proposed, that change should
  evaluate extracting a shared `RecursiveTreeDiagram`/node-store primitive
  from whichever two of the three tools are structurally closest at that
  point, per D1. Not blocking this change.
- Should the orphan/contested annotation's free-text `note` also appear in
  the Markdown export (currently editor-only, D6)? Shipping without it —
  revisit if readers ask for the reason to travel with the export.
- Exact icon for "orphan" (proposed: a ghost/unclaimed-style lucide icon,
  final pick left to implementation to match what's available in the
  already-installed `lucide-react` version) — not a product decision, just an
  icon-availability check during implementation.
