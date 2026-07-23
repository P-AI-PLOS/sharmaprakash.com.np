## Context

Static Astro 6.3 site; interactive tools are React 19 islands persisting to
localStorage only. Reference implementation:
`src/pages/tools/opportunity-solution-tree.astro` +
`src/components/tools/ost/{TreeBuilder,OstDashboard,OstHelpModal,OstTreeSwitcher}.tsx`
+ `src/utils/ost-store.ts`, built on the shared factory in
`src/utils/pipeline-store.ts` (`createToolStore`, `uid`, `ToolRecordBase`,
`resolveActiveProduct`).

Unlike the six-and-growing Donut CRM pipeline tools (OKR Organizer, Spec
Builder, Vertical Slicer, Backlog Prioritizer, Cadence Kit, OKR Check-In,
Test Register, Stakeholder Update Composer — see the `pipeline-data-contract`
capability and its D4 naming tables), PR/FAQ Builder has no upstream or
downstream tool to join with. Its precedent is OST specifically *because* OST
is also a self-contained authoring artifact with export, not because it
belongs to the pipeline — OST simply happens to also be joinable to Spec
Builder via `OstPickRef`. This tool intentionally stays out of that join
graph: it borrows `createToolStore` for the proven persistence mechanics
only, the same way it would borrow any other utility module.

Source content: `2025-02-10-working-backwards-the-pr-faq-and-the-discipline-
of-narrative.md` describes the artifact precisely — one page of press release
(headline, customer problem, solution, a customer quote) written in customer
language, followed by an FAQ where "the five hardest questions you hope
nobody asks" get answered in writing: pricing, switching, cannibalization,
hardest technical problem, and "why us." "Put it to work" item #2 asks the
reader to draft exactly those five FAQ entries for their current biggest bet.
That is the artifact this tool captures — full PR/FAQ structure (so the tool
is useful beyond this one post), pre-seeded with those five prompts as
placeholder FAQ entries so the post's exercise maps onto the tool with zero
extra explanation.

## Goals / Non-Goals

**Goals:**
- A fill-in template — not a scorer, not a classifier — for the two-part
  PR/FAQ artifact: press-release fields plus a repeatable FAQ list.
- Markdown export in the OST `toMarkdown` spirit: one pure function, `# `
  headline, structured sections, `**Q:**`/`**A:**` pairs — good enough to
  paste into a doc and keep iterating (the post's own advice: "iterate the
  document, not the product").
- Multi-document persistence + switcher, same shape as OST, since a visitor
  plausibly wants a PR/FAQ per bet, not one global scratchpad.
- Standalone page at `/tools/pr-faq-builder/` and an embed that replaces the
  prose instruction in the source post's "Put it to work" item #2.
- Same visual chrome (`ExerciseShell`), same token discipline, same
  `client:load`-only island rule as every existing tool.

**Non-Goals:**
- No hostile-FAQ-quality scoring, AI critique, or "is this a good press
  release" judgment — per the post's own point, the mechanism is a human
  hostile review, not an automated one.
- No six-pager or SCQA tooling — those are "put it to work" items #1 and #3
  in the same post and stay prose-only; this change tools only the one
  structured artifact (item #2), matching how OST tools only the tree, not
  the whole Continuous Discovery Habits practice.
- No join into the Donut CRM pipeline's cross-tool reference types
  (`OstPickRef`, `SpecRef`, etc.) — this tool is not one of the eight
  pipeline stages and does not extend `pipeline-data-contract`.
- No PDF/print export, no sharing/export-import, no cross-tab sync.

## Decisions

### D1. Store: `createToolStore` with an unreserved, `pm-`-prefixed key — not a pipeline stage

`src/utils/prfaq-store.ts` wraps
`createToolStore<PrFaqRecord>({ storageKey: "pm-prfaq-v1", idPrefix: "prfaq" })`
from `src/utils/pipeline-store.ts`. `pm-prfaq-v1` follows the contract's
naming convention (`pm-<tool>-v1` / `pm-<tool>-v1-active`) for consistency,
but is not one of the eight names in the contract's D4 table — no delta
against `pipeline-data-contract` is needed because this tool adds no new
contract-level type, cross-tool reference, or requirement; it is simply
another consumer of an already-shipped factory, exactly as any future
non-pipeline tool could be.

Every `PrFaqRecord` still carries `productId` via `resolveActiveProduct()`
(required by `ToolRecordBase`/the factory), but nothing reads it across tools
— it exists only so `listForProduct` behaves like every other store, kept for
consistency rather than because a join is planned.

Alternative considered: a hand-rolled localStorage module (pre-contract OST
style). Rejected — the factory is already proven, and duplicating its
try/catch/cache/migrate scaffolding for a fresh tool would be the exact
anti-pattern the contract was written to stop.

### D2. Record shape: press-release fields flat, FAQ entries as an ordered list with stable ids

```ts
export interface PrFaqEntry {
  id: string;        // uid("faq") — stable across reorders/edits
  question: string;
  answer: string;
}

export interface PrFaqDoc {
  headline: string;
  subheadline: string;
  summary: string;      // one-paragraph "the news" — dateline-style lede
  problem: string;       // the customer problem, in customer language
  solution: string;      // how the product solves it
  quote: string;          // hypothetical customer quote
  availability: string;   // availability / call-to-action line
  faqs: PrFaqEntry[];
}

export interface PrFaqRecord extends ToolRecordBase {
  doc: PrFaqDoc;
}
```

Rationale: press-release fields are flat and fixed-shape (there are exactly
seven, per the post's description of the one-page format) — no benefit to
modeling them as a list. FAQ entries are the repeatable, open-ended part
(the post asks for five, but a real PR/FAQ often grows past five in later
drafts), so they get `uid("faq")` ids and array-order display, mirroring
OST's opportunities/solutions pattern (array index is display order only,
`id` is the only valid reference — though nothing outside this tool
references a `PrFaqEntry`, so the id exists for React key stability and
future-proofing, not because another tool joins to it).

`EMPTY_DOC` seeds `faqs` with the five prompts from the post as
placeholder-text entries (empty `answer`, `question` pre-filled: "What does
it cost and what will customers pay?", "Why will people switch from what
they do today?", "Which existing product does this cannibalize?", "What's
the hardest technical problem, and what if it doesn't yield?", "Why us?") —
visitors overwrite or delete them; nothing is locked. Standalone-tool visits
get the same seed (the tool is useful without ever having read the post).

Alternative considered: separate `pressRelease` and `faq` records so a
visitor could have many FAQs per press release. Rejected — the post treats
PR/FAQ as one document with two parts; splitting them adds a join for no
real use case and complicates the switcher (which document is "current"?).

### D3. Multi-document persistence + switcher, mirroring OST exactly

`resolveActiveTree`-equivalent `resolveActivePrFaq(source)`: a visitor can
hold several PR/FAQ drafts (one per bet, or one per embed context) and switch
between them. `contextKeyFor(source)` reuses OST's `OstSource`-shaped union:

```ts
export type PrFaqSource =
  | { type: "standalone" }
  | { type: "post"; postSlug: string };
```

`{ type: "post", postSlug: "working-backwards-the-pr-faq-and-the-discipline-
of-narrative" }` is the one embed context this change ships; the union stays
open (mirroring OST's `course` variant) for a future post to embed the same
tool without a contract change. `PrFaqSwitcher.tsx` mirrors
`OstTreeSwitcher.tsx` verbatim in structure (dropdown of titled records +
create + delete), titled by `titleFor(record) = record.doc.headline.trim() ||
"Untitled press release"`.

### D4. Markdown export: one pure function, OST `toMarkdown` shape

```ts
const toMarkdown = (doc: PrFaqDoc): string => {
  const lines = [
    `# ${doc.headline || "(headline not set)"}`,
    ...(doc.subheadline ? [``, `_${doc.subheadline}_`] : []),
    ``,
    doc.summary || "(summary not set)",
    ``,
    `**The problem:** ${doc.problem || "(not set)"}`,
    ``,
    `**The solution:** ${doc.solution || "(not set)"}`,
    ``,
    doc.quote ? `> "${doc.quote}"` : `> (customer quote not set)`,
    ``,
    `**Availability:** ${doc.availability || "(not set)"}`,
    ``,
    `## FAQ`,
    ``,
  ];
  doc.faqs.forEach((f) => {
    lines.push(`**Q: ${f.question || "(question not set)"}**`);
    lines.push(`A: ${f.answer || "(answer not set)"}`);
    lines.push(``);
  });
  return lines.join("\n");
};
```

Same "Copy as Markdown" button + `<pre>` preview + clipboard fallback pattern
as `TreeBuilder.tsx` (`copyMarkdown`/`copied` state, 2s reset, silent catch
when Clipboard API is unavailable). No new dependency.

### D5. Page and components mirror the OST tool's split

- `src/pages/tools/pr-faq-builder.astro` — `SiteShell`, eyebrow "Free tool"
  hero explaining the PR/FAQ mechanism in one paragraph (borrowing the post's
  own framing — "a cheap simulation of the launch"), `client:load`
  `PrFaqBuilder` island, `source={{ type: "standalone" }}`, `showDashboard`.
- `src/components/tools/pr-faq/`:
  - `PrFaqBuilder.tsx` — the island: resolves the active doc via
    `resolveActivePrFaq(source)`, renders press-release fields as
    plain-text/textarea inputs (`inputClass` reused from the OST pattern),
    an FAQ list with add/remove/reorder-by-drag-free (append-only + remove,
    matching OST's opportunity list — no drag-and-drop dependency), export
    block, optional `PrFaqDashboard` grid.
  - `PrFaqSwitcher.tsx` — mirrors `OstTreeSwitcher.tsx`.
  - `PrFaqDashboard.tsx` — mirrors `OstDashboard.tsx` (the "your drafts"
    management grid shown only on the standalone page via `showDashboard`).
  - `PrFaqHelpModal.tsx` — mirrors `OstHelpModal.tsx`: short explainers for
    "why customer language," "why a quote," and each of the five seeded FAQ
    questions (why pricing/switching/cannibalization/hardest-problem/why-us
    are the ones worth dreading), sourced from the post's own reasoning.
- No `TreeDiagram`-equivalent visualization — a PR/FAQ is a document, not a
  tree; the export preview (`<pre>`) is the only secondary view, same as
  OST's export block, minus OST's diagram pane.
- React already sanctioned for tool islands; Tailwind utilities on
  `tokens.css` variables only; `<ScrollReveal delay={Math.min(i, 4) * 40}>`
  on the FAQ list and dashboard grid per site convention.

### D6. Post embed: convert `.md` → `.mdx`, replace item #2 only

The source post is currently `.md`; MDX-embedded course chapters already
prove the mechanism (`import X from "~/components/.../X.tsx"` + JSX usage
inside prose), but no standalone essay has done this yet. Renaming
`2025-02-10-working-backwards-the-pr-faq-and-the-discipline-of-narrative.md`
to `.mdx` is safe for the locked URL: `stripDatePrefix` in
`src/content.config.ts` strips both `.md` and `.mdx` before deriving the
slug, and `directory: product-management` is unchanged, so the route
(`/product-management/working-backwards-the-pr-faq-and-the-discipline-of-
narrative/`) is byte-identical.

"Put it to work" item #2's prose ("For your current biggest bet, write the
FAQ entries for the pricing question...") is replaced with the
`<PrFaqBuilder source={{ type: "post", postSlug: "..." }} />` embed, keeping
items #1 and #3 as unchanged prose (non-goal: those don't get tools in this
change). A one-sentence lead-in stays above the embed so the numbered list
still reads as three items in sequence.

### D7. Footer link

`SiteFooter.astro`'s existing "Tools" list (currently one entry: Opportunity
Solution Tree Builder) gets a second `<li>` for PR/FAQ Builder, same markup
shape (`link-underline` + `chip-count` "(free)"), added alongside rather than
restructuring the list.

## Risks / Trade-offs

- [Visitor's placeholder FAQ questions get "answered" with throwaway text and
  exported as if real] → the seeded questions are the actual post prompts,
  not filler; the help modal explains why each is worth dreading, nudging
  toward real answers, but the tool cannot force quality — same trust model
  as every other free-text tool on the site (OST doesn't validate opportunity
  quality either).
- [Standalone-tool visitors never having read the post get less context for
  the five seeded FAQ questions] → the help modal (D5) and the standalone
  page's hero paragraph carry enough of the "why these five" reasoning to
  stand alone, with a link back to the post for the full argument.
- [`.md` → `.mdx` rename regressing the post] → mitigated by D6's slug-safety
  argument; verified in tasks.md by diffing the rendered route before/after
  and confirming `pnpm build` output path is unchanged.
- [localStorage quota/private mode] → inherited silent-degrade behavior from
  `createToolStore`; tool remains usable in-session.
- [No test framework in repo] → gates are `pnpm check` and `pnpm build` plus
  a scripted manual smoke walkthrough in tasks.md, matching every prior tool
  change's ruling.

## Migration Plan

Greenfield for the tool: new page, new component directory, new store key
(`pm-prfaq-v1`). One existing file is renamed (`.md` → `.mdx`) with a
localized content edit (item #2 only); one existing file gets a one-`<li>`
addition (`SiteFooter.astro`). Rollback = revert the post rename/edit and the
footer addition, delete the three new additions; the only externally visible
artifact is `pm-prfaq-v1` localStorage data, which is inert once the page is
gone. Future shape changes bump to `pm-prfaq-v2` with a read-old/write-new
migration, mirroring `migrateLegacy` in `ost-store.ts`.

## Open Questions

- Should the FAQ list support reordering (drag or up/down buttons) beyond
  append/remove? Shipping append/remove only for v1, matching OST's
  opportunity list — revisit if visitors want to resequence questions after
  drafting.
- Should the standalone page's hero also seed the five FAQ prompts even for
  a visitor who never opens the source post, or should it offer a "start
  blank" toggle? Shipping seeded-by-default (matches the post's exercise and
  is still easy to delete) — revisit if feedback says the seed feels
  presumptuous for a from-scratch PR/FAQ on an unrelated bet.
