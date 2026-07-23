## 1. Prerequisites (verify, do not build here)

- [x] 1.1 Confirm `pipeline-data-contract` is applied and unchanged:
      `src/utils/pipeline-store.ts` exports `createToolStore`,
      `ToolRecordBase`, `uid`, `resolveActiveProduct`; confirm
      `src/utils/ost-store.ts` and `src/components/tools/ost/*` are not
      modified by this change (diff check at the end, task 6.4)
- [x] 1.2 Confirm `react-d3-tree` is already a dependency (via OST) — no
      `pnpm add` needed for this change

## 2. Store (`src/utils/metric-tree-store.ts`)

- [x] 2.1 Define types per design D2/D3: `MetricAnnotationStatus`,
      `MetricAnnotation`, `MetricNode` (recursive: `id`, `text`, `children`,
      `annotation`), `MetricTree` (`{ root: MetricNode }`), `MetricTreeSource`
      (`{ type: "standalone" }` | `{ type: "post"; postSlug; postTitle; href }`),
      `MetricTreeRecord extends ToolRecordBase`
- [x] 2.2 Build the store via
      `createToolStore<MetricTreeRecord>({ storageKey: "pm-metric-tree-v1", idPrefix: "mt", activeKey: "metric-tree-active-v1" })`
      (design D8); implement `contextKeyFor(source)` mirroring
      `ost-store.ts`'s pattern (`"standalone"` / `"post:<postSlug>"`)
- [x] 2.3 Implement node helpers: `newNode(text)` (uid("mtn")), `addChild(tree, parentId, text)`,
      `removeNode(tree, nodeId)` (no-op on root), `renameNode(tree, nodeId, text)`,
      `setAnnotation(tree, nodeId, annotation | null)` — all pure functions
      operating on an immutable `MetricTree`, no direct mutation
- [x] 2.4 Implement the annotation-clear-on-decompose rule (design D5):
      `addChild` clears `annotation` on the parent it attaches to
- [x] 2.5 Implement `resolveActiveTree(source)` mirroring `ost-store.ts`'s
      `resolveActiveTree`, with the seeding rule from design D7: a
      newly-created `type: "post"` record is seeded with the worked example
      (weekly transactions → active buyers × transactions per buyer; active
      buyers → new activations + retained + resurrected; activation →
      signups × onboarding completion × first-transaction rate); a
      newly-created `type: "standalone"` record starts empty (root text
      empty, no children), matching `EMPTY_TREE` in `ost-store.ts`
- [x] 2.6 Implement `toMarkdown(tree)` per design D6 (root/branch/leaf icons,
      depth-indented bullets, orphan/contested inline markers)
- [x] 2.7 Implement `listTrees`, `getTree`, `createTree`, `saveTreeData`,
      `deleteTree`, `getActiveId`, `setActiveId`, `titleFor` — same public
      surface shape as `ost-store.ts`'s exports, adapted to `MetricTree`

## 3. Components (`src/components/tools/metric-tree/`)

- [x] 3.1 `MetricTreeDiagram.tsx` — adapt `TreeDiagram.tsx`'s react-d3-tree
      setup (orientation toggle, `scaleX(-1)` right-to-left mirror,
      `ResizeObserver` sizing, `foreignObject` custom node, `pathFunc="step"`,
      zoomable/draggable) to recursively convert `MetricNode` → `RawNodeDatum`
      (design D4); two style tiers (root vs. leaf-or-branch via
      `children.length === 0`), orphan/contested badges distinct from each
      other and from the unannotated state
- [x] 3.2 `MetricTreeBuilder.tsx` — the island root, adapted from
      `TreeBuilder.tsx`: recursive node editor (rename inline, add child,
      remove, annotate-if-leaf with note field), direction toggle, fullscreen
      mode (URL param mirrors OST's `?<param>=full` pattern with a distinct
      param name), Markdown export block with copy/clear, tree
      switcher/dashboard wiring via the store from step 2
- [ ] 3.3 (PARTIAL — modal exists, wired, ESC/dialog a11y correct, but keeps pre-existing name `MetricHelpModal.tsx` and lacks per-concept definition/example/gotchas/how-to sections; follow-up bead) `MetricTreeHelpModal.tsx` — mirrors `OstHelpModal.tsx`: concepts for
      "North Star metric," "input metric," "leaf metric," "orphan," and
      "contested," each with definition/example/gotchas/how-to and a link
      back to the source post
- [x] 3.4 `MetricTreeDashboard.tsx` — mirrors `OstDashboard.tsx`: "your
      trees" grid for the standalone page, showing source (standalone vs.
      which post), updated date, open/delete actions
- [x] 3.5 `MetricTreeSwitcher.tsx` — mirrors `OstTreeSwitcher.tsx`: create /
      switch / delete control for multiple trees within one context
- [x] 3.6 Apply site conventions: Tailwind utilities on `tokens.css`
      variables only, `<ScrollReveal delay={Math.min(i, 4) * 40}>` on any
      rendered lists, `prefers-reduced-motion` respected, no new colors

## 4. Standalone page

- [x] 4.1 Create `src/pages/tools/north-star-metric-tree.astro` mirroring
      `opportunity-solution-tree.astro`: `SiteShell` with title/description,
      eyebrow "Free tool" hero explaining the North Star → input metric →
      leaf metric decomposition and the orphan/contested annotation,
      `client:load` `MetricTreeBuilder` island with `source={{ type: "standalone" }}`
      and `showDashboard`, link back to the source post

## 5. Post embed

- [x] 5.1 Rename `src/content/posts/2025-02-03-north-star-metrics-and-metric-trees.md`
      to `.mdx` — verify frontmatter (`date`, `directory: product-management`,
      slug-affecting fields) is preserved byte-for-byte so the URL is
      unchanged
- [x] 5.2 Add `import MetricTreeBuilder from "~/components/tools/metric-tree/MetricTreeBuilder.tsx";`
      and embed it after "The tree is where the metric becomes a strategy"
      with `source={{ type: "post", postSlug: "north-star-metrics-and-metric-trees", postTitle: "North Star Metrics and Metric Trees", href: "/product-management/north-star-metrics-and-metric-trees/" }}`,
      matching the embed pattern in
      `2025-09-11-from-opportunities-to-solutions-ideating-alone-and-together.mdx`
- [x] 5.3 Lightly adjust the surrounding prose so the "Draw the tree to the
      team level" action item (Put it to work #2) explicitly points at the
      embedded builder instead of describing an unrendered exercise; do not
      alter the post's argument or add meta-preamble about the tool itself

## 6. Verification

- [x] 6.1 Spec scenario walkthrough in `pnpm dev` against
      `specs/north-star-metric-tree/spec.md`: build a 4-level tree, confirm
      persistence on reload; add a child to an annotated leaf and confirm
      the annotation clears; mark one leaf orphan and a sibling contested and
      confirm distinct badges in both the editor and the diagram
- [x] 6.2 Post-embed seeding scenarios: clear localStorage, load the post,
      confirm the worked example renders; edit it, reload, confirm the edit
      (not the original example) persists; separately confirm the standalone
      page's default context still starts empty
- [x] 6.3 Export scenario: copy Markdown from a tree with one orphan and one
      contested leaf; confirm indentation-by-depth and distinct markers
- [x] 6.4 Quality gates: `pnpm check` and `pnpm build` pass (no test
      framework in repo — TypeScript and build are the gates, per the
      contract's established ruling); confirm no diff in
      `src/components/tools/ost/`, `src/utils/ost-store.ts`, or
      `src/utils/pipeline-store.ts`
- [ ] 6.5 (orchestrator-owned: beads + `openspec archive` are handled centrally, not by the implementation lane) Close-out: file beads for follow-ups surfaced during
      implementation (nav/footer link to the new tool page if desired,
      generic-tree-primitive revisit per design D1 Open Questions if a third
      tree tool appears), close this change's bead(s), and run
      `openspec archive north-star-metric-tree-tool` when applied
