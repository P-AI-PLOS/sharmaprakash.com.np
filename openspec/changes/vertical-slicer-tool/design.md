# Design — Vertical Slicer Tool

> **Contract of record:** this tool is built against
> `openspec/changes/donut-crm-pipeline-data-contract/design.md`. All exported
> names, storage keys, id prefixes, and the stale-reference rule cited below
> come from that document (D2, D4, D5, D8) and are not re-decided here.

## Context

The site is static Astro 6.3; interactive tools are React 19 islands that
persist to localStorage only. The shipped reference implementation is the OST
tool: `src/pages/tools/opportunity-solution-tree.astro` (SiteShell + hero +
one `client:load` island) with components in `src/components/tools/ost/`
(builder, switcher dropdown, dashboard grid, help modal, diagram) and a
versioned localStorage store in `src/utils/ost-store.ts`. This change adds the
third Definition-stage pipeline tool with the same page/component/store shape.

Pipeline position (contract design.md, pipeline table): Vertical Slicer reads
from Spec Builder (via `SpecRef`) and is read by Backlog Prioritizer and Test
Register (via `StoryRef`). Spec Builder is a sibling change being proposed in
parallel — its internal record shape is not code yet, but the contract fixes
what this tool needs: specs have `uid("spec")` ids, a title, and live in
`pm-spec-v1`; `SpecRef = { specId }`.

Teaching goal (this is a content-site teaching tool, not a planning suite):
make the vertical-slice vs horizontal-layer distinction *visible and
checkable*. The pedagogy is from the "elephant carpaccio" / SPIDR tradition:
slice by workflow step, business rule, or data variation, and test every slice
against "could we ship just this and a user gets value?"

## Goals / Non-Goals

**Goals:**
- A `/tools/vertical-slicer/` page where a visitor turns one big feature
  description into named story slices via one of three slicing patterns.
- A visible, per-story shippability checklist; failing stories are flagged as
  horizontal layers, never silently accepted.
- Stories persisted with stable `uid("story")` ids + the `SpecRef` they came
  from, so Backlog Prioritizer and Test Register can join on `StoryRef`.
- Store built on `createToolStore` (key `pm-slice-v1`, per contract D4).
- Markdown export, matching the OST tool's export affordance.

**Non-Goals:**
- No full slicing taxonomy (no SPIDR interfaces/paths beyond the three
  patterns, no CRUD-splitting wizards, no estimation, no ordering — ordering
  is Backlog Prioritizer's job).
- No true drag-and-drop library; "assign to a pattern" is click/keyboard
  driven (see D3). No new dependencies.
- No editing of Spec Builder records; the spec link is read-only via `SpecRef`.
- No cross-tab sync, undo, import; same minimum as the other pipeline tools.
- No shared "pipeline chrome" nav — still deferred to the
  `pipeline-tools-chrome` follow-up named in the contract.

## Decisions

### D1. Record shape: one SliceSession per spec-being-sliced, stories nested

`src/utils/slicer-store.ts`:

```ts
import {
  createToolStore, uid, type ToolRecordBase, type SpecRef,
} from "~/utils/pipeline-store";

export type SlicingPattern = "workflow-steps" | "business-rules" | "data-variations";

/** The fixed shippability checklist — order and ids are stable, text is copy. */
export const SHIPPABILITY_CHECKS = [
  { id: "value", label: "Delivers end-to-end value on its own" },
  { id: "demoable", label: "A user could see/demo it working" },
  { id: "independent", label: "Doesn't need a later slice to function" },
] as const;
export type ShippabilityCheckId = (typeof SHIPPABILITY_CHECKS)[number]["id"];

export interface StorySlice {
  id: string;                    // uid("story") — the contract join key
  title: string;                 // "Order one plain donut, pay by card"
  note: string;                  // optional detail, may be ""
  checks: Record<ShippabilityCheckId, boolean>;
}

export interface SliceSession extends ToolRecordBase {
  // id: uid("slice"), productId, createdAt, updatedAt from ToolRecordBase
  featureText: string;           // the big feature being sliced
  specRef: SpecRef | null;       // null = manually described feature
  specTitleSnapshot: string;     // "" when specRef is null (contract D5)
  pattern: SlicingPattern | null;// null until the visitor picks one
  stories: StorySlice[];
}

export const slicerStore = createToolStore<SliceSession>({
  storageKey: "pm-slice-v1",
  idPrefix: "slice",
});

export const isShippable = (s: StorySlice): boolean =>
  SHIPPABILITY_CHECKS.every((c) => s.checks[c.id]);

/** StoryRef producer for downstream tools (Backlog Prioritizer, Test Register). */
export const storyRefsFor = (session: SliceSession) =>
  session.stories.map((s) => ({ storyId: s.id, specId: session.specRef?.specId ?? "" }));
```

Rationale: the contract's prefix table owns `story` for "sliced story" but the
persisted record needs its own prefix — `slice` for the session record keeps
`story` reserved for the entities other tools reference (mirrors OKR
Organizer's `okr` record containing `kr` children). Stories nest inside the
session (like `OstTree.opportunities`) rather than getting their own store:
they're only ever edited in the context of their session, and downstream tools
resolve a `StoryRef` by scanning sessions' stories — a `resolveStory(storyId)`
helper is exported for that. Alternative (flat `pm-slice-v1` store of
individual stories) rejected: it loses the "one feature → its slices" framing
that carries the lesson, and makes the pattern choice ambient instead of
per-feature.

Note on `StoryRef.specId` when slicing a manually-entered feature: there is no
spec, so downstream refs would carry `specId: ""`. That is acceptable under the
contract's badge rule (missing source → snapshot + badge); the Backlog
Prioritizer lane should treat empty `specId` as "no spec linked", and stories
still resolve by `storyId`. Recorded here so the downstream lanes see it.

### D2. Spec link is a picker over `pm-spec-v1`, resilient to Spec Builder not existing yet

The session starts with a "What are you slicing?" step: either pick a spec
(dropdown listing `pm-spec-v1` records for the active product — read directly
via the spec lane's store key through a thin `listSpecsForProduct()` helper
that reads the raw localStorage key, so we don't import Spec Builder's module)
or type a feature description manually. Per contract D5, picking snapshots the
spec title into `specTitleSnapshot`; on load the id is re-resolved and a
"source changed/removed" badge shows on drift.

Why read the raw key instead of importing `spec-store.ts`: that module is a
sibling lane's deliverable and may not exist when this lane builds. The
contract fixes the key (`pm-spec-v1`), the record base (`ToolRecordBase`) and
that specs carry a human-readable title-ish field; the helper defensively
reads `{ id, productId }` plus a best-effort title (`title ?? name ?? ""`) and
degrades to manual entry if the key is empty or unparsable. If Spec Builder
lands first with a firm export, a follow-up can swap the helper for a direct
import — zero behavior change.

### D3. "Assign to a pattern" is a choice-card step, not drag-and-drop

The core interaction reads as drag/assign but is implemented as three large
pattern cards (workflow steps / business rules / data variations), each with a
one-line definition and a Donut CRM example. Clicking a card assigns the
feature to that pattern and reveals the slice list seeded with a
pattern-specific placeholder prompt (e.g. workflow steps: "Slice 1 — the
happy path, end to end"). Rationale: a real drag-and-drop needs a library or
substantial pointer-event code, adds nothing pedagogically, and fails
keyboard/touch accessibility; the OST tool's precedent (`ChoiceButton` from
`~/components/course/exercises/exercise-ui`) already gives us this pattern.
Switching patterns after stories exist prompts a confirm (stories are kept,
only the pattern label and prompts change — ids must survive, per the
stable-id rule).

### D4. Shippability check is per-story, visible, and judgmental

Each story row renders the three `SHIPPABILITY_CHECKS` as toggles. All three
checked → a "vertical slice ✓" state (accent styling). Any unchecked → the row
carries a visible "looks like a horizontal layer" warning chip with a
one-liner explaining which check failed and why it matters. The export
includes the check state per story. Rationale: the whole point of the tool is
that the check is *seen*, not inferred; self-assessment toggles (vs. trying to
auto-detect layer-ness from text) keep it honest and implementable. The
warning never blocks saving or export — teaching tool, not a linter.

### D5. Page/component decomposition mirrors the OST tool

- `src/pages/tools/vertical-slicer.astro` — SiteShell, hero ("Free tool"
  eyebrow, display heading, course cross-link), one island `client:load`.
- `src/components/tools/vertical-slicer/Slicer.tsx` — main island: resolves
  `resolveActiveProduct()`, session lifecycle via `slicerStore`, steps
  (source → pattern → slices), export.
- `SlicerSessionSwitcher.tsx` — "My slicing sessions" dropdown (clone of
  `OstTreeSwitcher` shape: records, activeId, onSelect, onCreate).
- `SlicerDashboard.tsx` — saved-sessions grid below the tool (OstDashboard
  shape), showing per-session story count and shippable/flagged counts.
- `SlicerHelpModal.tsx` — "What's a vertical slice?" concepts modal
  (OstHelpModal shape): vertical vs horizontal, the three patterns, the
  checklist rationale, with the Donut CRM running example.

Styling: tokens only (`text-strong`, `text-muted`, `accent-*`, `ink-200`,
surface classes as used in the OST components); fade-ins via `<ScrollReveal>`
where lists render, stagger capped `Math.min(i, 4) * 40`. Icons from
lucide-react (already a dependency). No new namespace needed —
`components/tools/` already exists.

### D6. Markdown export

`toMarkdown(session)`: feature line (+ spec title snapshot when linked),
pattern name, then one bullet per story with ✅/⚠️ shippability marker and
failed-check notes. Copy-to-clipboard button, same affordance as TreeBuilder's
export block. No file download, no JSON (whole-pipeline export is the
contract's deferred follow-up).

## Risks / Trade-offs

- [Spec Builder lane ships a title field named differently] → D2's helper
  reads defensively (`title ?? name`) and manual entry always works; worst
  case the picker shows "Untitled spec" until a one-line follow-up. The
  contract owner should nudge Spec Builder to expose a `title` field.
- [Empty `specId` in StoryRefs from manual sessions] → documented in D1;
  downstream lanes badge it per contract D5 instead of crashing on lookup.
- [Self-assessed checklist lets visitors lie to themselves] → accepted; the
  help modal explains each check with a Donut CRM counter-example, which is
  the teachable moment. Auto-detection is out of scope by design.
- [No test framework in repo] → per the contract's decision, enforcement is
  `pnpm check` (TypeScript) + `pnpm build`; the store and `isShippable`/
  `storyRefsFor` helpers are typed against `pipeline-store.ts` exports so
  contract drift is a compile error. Manual QA script lives in tasks.md.
- [Sibling lanes touching `src/components/tools/`] → this change only adds
  `vertical-slicer/` under it and one new page file; no shared-file edits
  except none — merge-conflict surface is zero by construction.

## Migration Plan

Greenfield: new page + new component dir + new store key. Nothing existing
changes; rollback = delete the three paths. Depends on
`donut-crm-pipeline-data-contract` merging first (imports from
`~/utils/pipeline-store`). Future story-shape changes bump to `pm-slice-v2`
with a read-old/write-new migration per the contract's migration rule.

## Open Questions

- Should the standalone page also embed in the course (like TreeBuilder's
  `source` prop for chapter embeds)? Deferred — no course chapter currently
  teaches slicing; the store's session records don't carry a source context,
  and adding one later is additive.
- Whether the "Donut CRM" seed product should come with a pre-filled sample
  slicing session (contract open question, per-tool call). Leaning no for v1:
  the pattern cards' inline Donut CRM examples carry the running case without
  seeding data.
