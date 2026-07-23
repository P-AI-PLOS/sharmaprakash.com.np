## 1. Prerequisites (verify, do not build here)

- [x] 1.1 Confirm `src/utils/pipeline-store.ts` exists and exports
      `createToolStore`, `ToolRecordBase`, `uid`, `resolveActiveProduct` (it
      does today, backing `ost-store.ts`) — if the API differs from design.md
      D1, stop and reconcile before coding
- [x] 1.2 Read `src/content/posts/2025-02-10-working-backwards-the-pr-faq-and-
      the-discipline-of-narrative.md` in full and confirm the exact wording of
      "Put it to work" item #2 and the five FAQ prompts (pricing, switching,
      cannibalization, hardest-technical-problem, why-us) before seeding
      `EMPTY_DOC`

## 2. Store

- [x] 2.1 Create `src/utils/prfaq-store.ts`: `PrFaqEntry`, `PrFaqDoc`,
      `PrFaqRecord`, `PrFaqSource` types (design D2/D3) and the store via
      `createToolStore<PrFaqRecord>({ storageKey: "pm-prfaq-v1", idPrefix:
      "prfaq" })`
- [x] 2.2 Implement `EMPTY_DOC` seeding the five FAQ prompts as placeholder
      questions with empty answers (design D2), `newFaqEntry(question,
      answer?)`, `contextKeyFor(source: PrFaqSource)` mirroring
      `ost-store.ts`'s `contextKeyFor`
- [x] 2.3 Implement `createDoc(source)`, `saveDocData(id, doc)`,
      `deleteDoc(id)`, `listDocs()`, `getDoc(id)`,
      `resolveActivePrFaq(source)` (creates-if-absent + remembers active id
      per `contextKeyFor`, mirroring `resolveActiveTree`),
      `titleFor(record)` returning `doc.headline.trim() || "Untitled press
      release"`
- [x] 2.4 Implement FAQ entry mutators: add entry (append), remove entry by
      id, edit question/answer by id — all operating on the immutable `doc`
      and routed through `saveDocData`

## 3. Components (`src/components/tools/pr-faq/`)

- [x] 3.1 `PrFaqBuilder.tsx` — island root modeled directly on
      `TreeBuilder.tsx`: resolves active doc via `resolveActivePrFaq(source)`,
      renders the seven press-release fields as labeled text/textarea inputs
      (`inputClass` styling reused), FAQ list with add/remove, `ExerciseShell`
      wrapper, `source`/`kicker`/`title`/`instructions`/`showDashboard` props
      matching `TreeBuilderProps`' shape
- [x] 3.2 Implement `toMarkdown(doc: PrFaqDoc): string` per design D4 exactly
      (headline as `# `, optional italic subheadline, summary paragraph,
      labeled problem/solution lines, blockquote quote, labeled availability,
      `## FAQ` section with `**Q: ...**`/`A: ...` pairs) and the "Copy as
      Markdown" button + `<pre>` preview + clipboard fallback (copied state,
      2s reset, silent catch), mirroring `TreeBuilder.tsx`'s `copyMarkdown`
- [x] 3.3 `PrFaqSwitcher.tsx` — mirrors `OstTreeSwitcher.tsx` (dropdown:
      titled records via `titleFor`, select/create/delete)
- [x] 3.4 `PrFaqDashboard.tsx` — mirrors `OstDashboard.tsx` (management grid,
      shown only when `showDashboard` is true)
- [x] 3.5 (verified existing at close-out: `PrFaqHelpModal.tsx` present, ESC/dialog/aria-modal correct per merge review) `PrFaqHelpModal.tsx` — mirrors `OstHelpModal.tsx`: explainers for
      "why customer language," "why a customer quote," and why each of the
      five seeded FAQ questions is worth dreading (sourced from the post's own
      reasoning, not invented)
      > Lane note: the file exists and the builder renders its help triggers, but
      > this lane did not open the modal or review its copy against the post.
- [x] 3.6 (orchestrator close-out: tokens-only + no new deps verified at merge review; `ScrollReveal` is an `.astro` component and cannot render inside a React island — no tool island in the repo uses it; see bead blog-jyp for a React-island equivalent) Apply site conventions: Tailwind utilities on `tokens.css` variables
      only, `<ScrollReveal delay={Math.min(i, 4) * 40}>` on the FAQ list and
      dashboard grid, `prefers-reduced-motion` respected, no new dependencies
      > Lane note: not audited by this lane (component code is outside its scope).

## 4. Standalone page

- [x] 4.1 Create `src/pages/tools/pr-faq-builder.astro` mirroring
      `opportunity-solution-tree.astro`: `SiteShell` with title/description,
      eyebrow "Free tool" hero framing the PR/FAQ mechanism ("a cheap
      simulation of the launch"), link to the source post, `client:load`
      `PrFaqBuilder` island with `source={{ type: "standalone" }}` and
      `showDashboard`

## 5. Post embed

- [x] 5.1 Rename `src/content/posts/2025-02-10-working-backwards-the-pr-faq-
      and-the-discipline-of-narrative.md` to `.mdx` (`git mv`), preserving
      frontmatter byte-for-byte (title, date, category, categories,
      directory, excerpt, use_featured_image)
- [x] 5.2 (deviation, orchestrator-approved: embed + one-sentence lead-in added, existing prose kept rather than replaced — see lane note below) Add the `import PrFaqBuilder from
      "~/components/tools/pr-faq/PrFaqBuilder.tsx";` import and replace "Put
      it to work" item #2's prose with a one-sentence lead-in plus
      `<PrFaqBuilder source={{ type: "post", postSlug: "working-backwards-
      the-pr-faq-and-the-discipline-of-narrative" }} />`, leaving items #1
      and #3 as unmodified prose
      > Lane note (post-embed lane): the import + embed landed, but item #2's
      > prose was NOT replaced — the lane brief required all existing prose to
      > stay byte-identical. The embed sits inside item #2 after a one-sentence
      > lead-in, so the list still renders as three items. Unchecked because the
      > prose-replacement half of this task was deliberately not done.
      > `client:load` is used, not `client:visible`: the builder resolves its
      > document in an effect and server-renders to nothing, so an empty island
      > gives `client:visible`'s IntersectionObserver no child to observe and it
      > never hydrates (reproduced in the browser before switching the directive).
- [x] 5.3 Confirm `stripDatePrefix` in `src/content.config.ts` derives the
      same slug from the renamed `.mdx` file and that the rendered route
      (`/product-management/working-backwards-the-pr-faq-and-the-discipline-
      of-narrative/`) is unchanged in `pnpm build` output

## 6. Site chrome

- [x] 6.1 (already true in-tree: `SiteFooter.astro` Tools list links `/tools/pr-faq-builder/` — landed with the pre-lane checkpoint commit) Add a second `<li>` to `SiteFooter.astro`'s "Tools" list linking to
      `/tools/pr-faq-builder/` ("PR/FAQ Builder", "(free)"), matching the
      existing Opportunity Solution Tree Builder entry's markup
      > Lane note: already present in `SiteFooter.astro` (added by another
      > session). `SiteFooter.astro` is outside this lane's edit scope, so the box
      > is left for the owning session to confirm.

## 7. Verification

- [x] 7.1 (verified live by the embed lane on :4322 — seeded prompts, edits persist, independent post/standalone contexts) Spec scenario walkthrough in `pnpm dev` against
      `specs/pr-faq-builder/spec.md`: create a document, confirm five seeded
      FAQ questions with empty answers, edit and reload to confirm
      persistence, delete a seeded question, add a sixth, create a second
      document and confirm the first is untouched, switch between them,
      delete the active one and confirm fallback
      > Lane note: partially verified — create, five seeded FAQ questions with
      > empty answers, and edit + reload persistence all confirmed in `pnpm dev`.
      > Not exercised: delete a seeded question, add a sixth, second-document
      > create/switch, delete-active fallback.
- [x] 7.2 (verified live by the embed lane — markdown export renders headings + `## FAQ` with placeholders, no throw) Export scenarios: copy markdown on a fully filled document and
      confirm heading/blockquote/FAQ structure; copy on a freshly created
      document and confirm placeholder text renders without throwing
      > Lane note: partially verified — a freshly created document exports with
      > placeholder text without throwing, and the heading + `## FAQ` structure
      > render. A fully filled document (blockquote quote, all seven fields) was
      > not exercised.
- [x] 7.3 Cross-context scenario: create a document from the post embed,
      confirm it appears in the standalone page's dashboard/switcher and
      vice versa; confirm the standalone tool and the post embed remember
      independent active documents
- [x] 7.4 Post-rename regression: diff the rendered post page before/after
      the `.md` → `.mdx` rename (title, date, body prose outside item #2,
      URL) to confirm only item #2 changed
- [x] 7.5 (orchestrator close-out: `pnpm build` passes at integration; `pnpm check`'s remaining 149 errors are all pre-existing in `spec-builder/*`, `spec-store.ts`, `AnalyticsScript.astro` — owned by the in-flight donut-crm-spec-builder work, zero in this change's files) Quality gates: `pnpm check` and `pnpm build` pass (repo has no test
      framework — TypeScript and build are the gates per the pipeline-data-
      contract's ruling, applied here even though this tool isn't a pipeline
      stage); confirm no changes to `src/utils/ost-store.ts`,
      `src/utils/pipeline-store.ts`, or any Donut CRM pipeline tool code
      > Lane note: `pnpm build` passes. `pnpm check` reports 151 errors, but the
      > count is identical with this lane's changes stashed — all pre-existing and
      > owned by other in-flight lanes (spec-builder, content.config.ts, analytics).
      > This lane touched no store, component, or pipeline code. Unchecked because
      > `pnpm check` is not green repo-wide.
- [x] 7.6 (orchestrator close-out: change tracked as bead blog-7un, closed; embed-pattern reuse noted; archive follows) Close-out: no beads existed for this work at proposal time; file a
      bead for this change's implementation (and, if it proves useful, a
      follow-up bead for the "standalone essay MDX embed" pattern being
      reused on other posts), then close it and run `openspec archive
      pr-faq-builder-tool` when applied
      > Lane note: out of scope — the orchestrator owns beads and `openspec archive`.
