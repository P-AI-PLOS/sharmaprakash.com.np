## Why

`2025-02-10-working-backwards-the-pr-faq-and-the-discipline-of-narrative.md`
teaches Amazon's Working Backwards technique — write the launch press release
first, then force yourself to answer the five hardest FAQ questions you hope
nobody asks — and its "Put it to work" item #2 ("Draft the five questions you
hope nobody asks") asks the reader to author a mini PR/FAQ, with nowhere on
the page to actually do it. Every other "put it to work" prompt on this site
that asks for a structured artifact (opportunity solution tree, spec sheet)
has grown a free tool; this is the one narrative-craft post that still leaves
the reader with a blank notebook page. The fix is the same shape already
proven by the OST builder: a fill-in template with a markdown export, not a
classifier or scorer — this is authorship, not sorting.

## What Changes

- Add a reusable `PrFaqBuilder` React island: a structured template with
  press-release fields (headline, subheadline, summary, problem, solution,
  customer quote, availability/CTA) and a repeatable list of FAQ
  question/answer pairs, seeded with the post's own five dreaded-question
  prompts (pricing, switching, cannibalization, hardest-technical-problem,
  "why us") as placeholder text the visitor overwrites.
- Add "Copy as Markdown" export mirroring the OST `toMarkdown` function in
  shape: one exported function, deterministic section order, headline as an
  `h1`, FAQ entries as `**Q:**`/`**A:**` pairs.
- Persist to localStorage only, multi-document (a visitor can hold more than
  one PR/FAQ draft and switch between them), following the `ost-store.ts` /
  `pipeline-store.ts` `createToolStore` pattern — own storage key and id
  prefix, not joined into the Donut CRM pipeline's cross-tool references
  (this tool has no upstream/downstream tool to join with, same as OST before
  it optionally feeds Spec Builder).
- Add a standalone page at `/tools/pr-faq-builder/` (mirrors
  `src/pages/tools/opportunity-solution-tree.astro`).
- Convert
  `src/content/posts/2025-02-10-working-backwards-the-pr-faq-and-the-discipline-of-narrative.md`
  to `.mdx` and embed the same component in place of "Put it to work" item #2,
  replacing the prose instruction with the live tool (first non-course essay
  post on the site to embed a `tools/` island — course chapters already do
  this; standalone essays have not yet).
- Add a footer "Tools" entry alongside the existing Opportunity Solution Tree
  Builder link.

## Capabilities

### New Capabilities

- `pr-faq-builder`: the PR/FAQ authoring tool — structured press-release
  fields, repeatable FAQ question/answer entries, multi-document persistence
  with a switcher, and markdown export.

### Modified Capabilities

(none — this tool owns its own storage key and does not extend
`pipeline-data-contract`; it borrows `createToolStore` from
`src/utils/pipeline-store.ts` as a consumer, the same way `ost-store.ts`
does, without adding or changing any contract requirement.)

## Impact

- **New code:** `src/pages/tools/pr-faq-builder.astro`,
  `src/components/tools/pr-faq/` (`PrFaqBuilder.tsx` + supporting
  switcher/help components mirroring the OST tool's file split),
  `src/utils/prfaq-store.ts`.
- **Modified files:**
  `src/content/posts/2025-02-10-working-backwards-the-pr-faq-and-the-discipline-of-narrative.md`
  → renamed to `.mdx` with an import + component embed replacing "Put it to
  work" item #2 (URL is unchanged — the route is derived from the stripped
  filename, not the extension); `src/components/chrome/SiteFooter.astro`
  (one new Tools list item).
- **Depends on:** `src/utils/pipeline-store.ts` (`createToolStore`, `uid`,
  `ToolRecordBase`) — already applied and in active use by `ost-store.ts`.
  No dependency on any Donut CRM pipeline tool or its in-flight proposals.
- **Constraints honored:** static Astro 6.3, localStorage only, React 19
  islands only, tokens from `tokens.css`, no new dependencies, locked post
  URL preserved across the `.md` → `.mdx` rename.
- **Trackers:** no open beads exist for this work today; a close-out task in
  `tasks.md` files the follow-up bead(s), including the standalone-essay MDX
  conversion pattern this change establishes.

## Non-goals

- No PR/FAQ scoring, grading, or "is this a good press release" AI critique
  — the tool is a blank-page killer, not a judge.
- No six-pager or SCQA tooling (post's "put it to work" items #1 and #3 stay
  prose-only; only item #2's structured artifact gets a tool, matching the
  OST precedent of tooling the artifact, not the whole framework).
- No cross-tool references into the Donut CRM pipeline stores — this is not
  pipeline stage code and does not add to or read from
  `pipeline-data-contract`'s cross-tool reference types.
- No export/import, cross-tab sync, PDF/print stylesheet, or multi-user
  sharing.
