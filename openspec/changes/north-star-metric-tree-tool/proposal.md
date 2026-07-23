## Why

`src/content/posts/2025-02-03-north-star-metrics-and-metric-trees.md` spends
its central section ("The tree is where the metric becomes a strategy") and
its second action item ("Draw the tree to the team level") telling readers to
decompose a North Star metric into a tree of input metrics down to leaves one
team can own — but the post is prose-only. It never renders a worked example
and gives the reader no way to actually draw their own tree, unlike the
[opportunity solution tree post](/product-management/opportunity-solution-trees-the-shape-of-good-discovery/),
whose matching module ships a live builder
(`src/components/tools/ost/`, `/tools/opportunity-solution-tree/`). The site
already has the exact structural precedent for this — root → branches →
leaves, click-to-add, canvas rendering via react-d3-tree, Markdown export — it
just needs to grow from OST's fixed two-level (outcome → opportunity →
solution) shape into an arbitrary N-level metric tree, plus the one concept
this post adds that OST doesn't have: flagging a leaf metric as orphaned
(nobody owns it) or contested (two teams claim it).

## What Changes

- Add a new recursive N-level metric-tree builder + diagram, modeled on
  `TreeBuilder.tsx`/`TreeDiagram.tsx` but generalized: the North Star metric
  is the root, any number of input-metric levels can be nested underneath,
  and any node with no children (a leaf) can be marked **orphan** or
  **contested** with an optional note — the annotation the post explicitly
  calls for ("orphan leaves are your unstaffed strategy; contested leaves are
  next quarter's coordination failure").
- Add `src/utils/metric-tree-store.ts`, built on `createToolStore` from the
  shared `pipeline-data-contract` capability (`src/utils/pipeline-store.ts`),
  following the exact pattern `ost-store.ts` already uses: versioned
  localStorage key, `productId` stamped via `resolveActiveProduct()`, and a
  context-scoped active-record pointer (`contextKeyFor`) so the standalone
  tool and a post embed can each remember their own tree — no backend, no data
  ever leaves the browser.
- Add new components under `src/components/tools/metric-tree/`
  (`MetricTreeBuilder.tsx`, `MetricTreeDiagram.tsx`,
  `MetricTreeHelpModal.tsx`, `MetricTreeDashboard.tsx`,
  `MetricTreeSwitcher.tsx`) — a new namespace, not a modification of `ost/`,
  because the node shape (recursive, N-level, leaf-annotated) is genuinely
  different from OST's fixed two-level shape (see design.md D1 for why this
  isn't extracted into a shared generic-tree primitive instead).
- Add `/tools/north-star-metric-tree/` — a static Astro page hosting the
  builder as a `client:load` React island, mirroring
  `src/pages/tools/opportunity-solution-tree.astro`.
- Embed the same builder island directly inside
  `2025-02-03-north-star-metrics-and-metric-trees.md` (converted to `.mdx`,
  matching how `TreeBuilder` is already embedded in
  `2025-09-11-from-opportunities-to-solutions-ideating-alone-and-together.mdx`),
  replacing the prose-only "draw your own tree" instruction with a live
  builder seeded with the post's own marketplace worked example
  (weekly transactions → active buyers × transactions per buyer → …).

## Capabilities

### New Capabilities

- `north-star-metric-tree`: a recursive N-level metric-tree builder — North
  Star metric at the root, arbitrary input-metric levels beneath it, leaf
  metrics markable as orphan/contested with a note, react-d3-tree diagram
  rendering (direction toggle, fullscreen), Markdown export, and
  localStorage persistence via the shared pipeline data contract, available
  standalone at `/tools/north-star-metric-tree/` and embedded in the metric
  trees blog post.

### Modified Capabilities

- None. This change is a pure consumer of the existing
  `pipeline-data-contract` capability (`createToolStore`, `ToolRecordBase`,
  `resolveActiveProduct`) — it needs no new contract-level shape and proposes
  no delta against it.

## Impact

- **New code:** `src/pages/tools/north-star-metric-tree.astro`,
  `src/components/tools/metric-tree/*.tsx` (five components), and
  `src/utils/metric-tree-store.ts`.
- **Modified content:** `src/content/posts/2025-02-03-north-star-metrics-and-metric-trees.md`
  renamed to `.mdx` and given an embedded builder + a seeded worked example;
  no change to its frontmatter `directory`/date/slug, so its URL is
  unaffected.
- **Depends on (already applied):** `pipeline-data-contract`
  (`src/utils/pipeline-store.ts` — `createToolStore`, `ToolRecordBase`,
  `resolveActiveProduct`, `uid`). No dependency on any in-flight Donut CRM
  pipeline change (OKR Organizer, Check-In, etc.) — this tool is a content
  companion tool like OST, not a pipeline stage.
- **Constraints honored:** static Astro 6.3, localStorage only, React 19
  islands only, `react-d3-tree` (already a dependency via OST — no new
  package), tokens from `tokens.css`, no new external dependency.
- **Trackers:** no open beads exist for this work today; a close-out task
  files the follow-up beads (chrome/nav link, any generic-tree-primitive
  revisit if a third N-level tree tool appears).

## Non-goals

- No generic "N-level tree" primitive extracted for reuse across OST and this
  tool now (design.md D1) — only one N-level use case exists; a shared
  primitive is deferred until a second one shows up.
- No metric-value tracking, dashboards, or real data wiring — this is a
  structure-and-ownership authoring tool, not an analytics product. Numbers
  typed into node text are free-form strings, exactly like OST's opportunity
  text.
- No cross-tool references into the Donut CRM pipeline stores (no
  `OkrKeyResultRef` join) — the post's tree is a standalone artifact, not a
  pipeline stage input.
- No site-nav/chrome changes beyond the one post embed and the standalone
  page link already implied by precedent (footer/topics surfacing is out of
  scope here, matching how OST shipped).
