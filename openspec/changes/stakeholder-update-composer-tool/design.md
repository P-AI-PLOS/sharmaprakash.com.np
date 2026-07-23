# Design — Stakeholder Update Composer (Founder ring)

> Contract of record: `openspec/changes/donut-crm-pipeline-data-contract/design.md`.
> Every store shape, key, prefix, and reference in this document conforms to
> that contract (D2, D4, D5, D8 for the Stakeholder Update Composer row).

## Context

The site is static Astro 6.3; tools are React 19 islands persisting to
localStorage only. The reference implementation is the OST builder
(`src/pages/tools/opportunity-solution-tree.astro` +
`src/components/tools/ost/*` + `src/utils/ost-store.ts`): SiteShell page with
hero copy and one `client:load` island, versioned localStorage store.

The composer is the pipeline's **Founder ring**: not stage 07, not a step in
the 01–06 sequence, but a cross-cutting persona ring. The PO authors in it;
the founder/exec is the audience. Contract table row 8 defines its data
position: "reads any of the above, read by nobody." Its whole job is
degrading gracefully: whatever subset of pipeline data exists for the active
product and selected quarter becomes a draft; nothing is required.

Sibling lanes in flight (`openspec/changes/`): `okr-organizer-tool`,
`donut-crm-spec-builder`, `vertical-slicer-tool`, `backlog-prioritizer-tool`;
Cadence & Reflection Kit and OKR Check-In are being proposed in parallel.
None are implemented yet. This proposal must therefore not create build-time
dependencies on sibling modules that may not exist when its lane merges.

## Goals / Non-Goals

**Goals:**
- One page + island that assembles a structured, editable, copyable
  plain-text/markdown update from the four v1 sources: OKR (+ KR confidence),
  OST discovery highlights, cadence status, adoption signal.
- Honest partial coverage: draft from whatever exists, show what doesn't.
- Persist drafts as `upd` records per the contract; read sibling data without
  ever mutating it and without build-order coupling to sibling lanes.

**Non-Goals:**
- Sending anything anywhere (no email/Slack/API — copy out only).
- AI prose generation, scheduling, reminders, history diffing.
- Backlog Prioritizer / Test Register sections (follow-up
  `stakeholder-update-sources-v2` once those record shapes ship).
- Shared pipeline chrome (deferred, `pipeline-tools-chrome`).

## Decisions

### D1. Read sibling stores through contract-level structural types, not module imports

The composer needs OKR, Check-In, and Cadence records, but those lanes are
parallel and may land in any order. Importing `src/utils/okr-store.ts` (etc.)
would make this lane's build fail until every sibling merges.

Instead, `update-store.ts` (or a small `update-sources.ts` helper beside it)
declares **local read-only interfaces containing only the contract-level
fields D8 guarantees**, and reads the published keys directly with the same
try/catch JSON pattern:

```ts
// Contract-level (D8) fields only — never depend on tool-internal fields.
interface OkrSourceRecord extends ToolRecordBase {
  quarter: QuarterRef;
  objective: string;
  keyResults: Array<{ id: string; who: string; doesWhat: string; byHowMuch: string }>;
}
interface CheckinSourceRecord extends ToolRecordBase {
  quarter: QuarterRef;
  entries: Array<{ ref: OkrKeyResultRef; actual: string; confidence: number }>;
}
interface CadenceSourceRecord extends ToolRecordBase {
  quarter: QuarterRef;
  // everything else is Cadence-Kit-internal; render a status line from what
  // is present, tolerate absence of any non-contract field.
}

const readStore = <T extends ToolRecordBase>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    const map = raw ? (JSON.parse(raw) as Record<string, T>) : {};
    return Object.values(map);
  } catch { return []; }
};
```

Reads are filtered by `productId` and (where the record is quarter-scoped)
`quarterKey(record.quarter) === quarterKey(selected)`. Writes to those keys
are forbidden (contract D8: "MUST NOT mutate other tools' records") — the
helper exposes no write path.

Alternatives considered: (a) import sibling store modules — rejected, build
coupling across unmerged lanes; (b) instantiate `createToolStore` against
sibling keys — rejected, it exposes create/update/remove on stores this tool
must never write, and its in-memory cache could go stale against the owning
tool's island on the same page in the future. If a sibling exports its record
type later, swapping the local interface for an `import type` is a
zero-runtime follow-up.

Exact field names above track the parallel proposals; if a sibling lane's
final shape differs (e.g. Check-In's entry field names), the composer's
implementation task adjusts these local interfaces to match the merged
sibling code — the contract only fixes `quarter`, `OkrKeyResultRef`, and
actuals/confidence existing per entry.

### D2. OST source: user-picked tree with snapshot, defaulting to the standalone active tree

`OstRecord` predates the contract and has no `productId`, so "the product's
OST" is not derivable. The composer therefore:

1. Defaults to the tree behind `getActiveId("standalone")` when present,
   otherwise the most recently updated tree, otherwise no discovery section.
2. Lets the visitor switch trees via a small select fed by `listTrees()`
   (reusing `titleFor` for labels).
3. Snapshots into the draft record per contract D5: `ostRecordId` plus a text
   snapshot (`outcome`, target-opportunity texts) taken at compose time. On
   later loads the id is re-resolved; if the tree is gone or the outcome text
   drifted, the draft renders the snapshot with a "source changed/removed"
   badge in the coverage panel. The draft `body` itself is already plain text,
   so drift never corrupts a composed update.

Discovery highlights rendered: the outcome, opportunities marked
`target: true` (fallback: opportunity count), and solution counts under
targets — all fields that exist on `OstTree` today.

### D3. Record shape and composition model

```ts
export interface UpdateSourceRefs {
  okrId?: string;             // uid("okr")
  checkinId?: string;         // uid("chk")
  cadenceId?: string;         // uid("cad")
  ost?: { ostRecordId: string; outcomeSnapshot: string };
}

export interface UpdateRecord extends ToolRecordBase {
  quarter: QuarterRef;
  title: string;              // default: `${product.name} update — ${quarterKey(quarter)}`
  body: string;               // the editable markdown; single source of truth after compose
  sources: UpdateSourceRefs;  // what fed the last compose (for coverage + drift badges)
  composedAt: number;         // when body was last regenerated from sources
}
```

Store: `createToolStore<UpdateRecord>({ storageKey: "pm-update-v1", idPrefix: "upd" })`
per contract D4. Active pointer scoped per product via the factory's
`getActiveId(productId)`.

Composition is a pure function
`composeBody(product, quarter, sources) => string` producing markdown in a
fixed section order — headline, Objective & key results (KR line + confidence
when a check-in entry matches its `keyResultId`), Discovery, Delivery
cadence, Adoption signal, Asks/next steps (always emitted as an empty prompt
for the human) — skipping any section whose source is absent. After compose,
`body` is a free-text field the user owns; "Recompose from sources" is an
explicit, confirmed action that overwrites `body` (no merge/diff — non-goal).
Alternative (structured per-section records with per-section editing)
rejected: doubles the UI and store complexity for no reader benefit; the
deliverable is one text the human polishes anyway.

### D4. Page and components mirror the OST tool

- `src/pages/tools/stakeholder-update-composer.astro`: SiteShell, hero
  (eyebrow "Free tool", display heading, "saves in your browser — nothing is
  sent anywhere" copy), one island `client:load`. Same section/token classes
  as `opportunity-solution-tree.astro`.
- `UpdateComposer.tsx`: resolves `resolveActiveProduct()`, quarter select
  (default `currentQuarter()`, plus prev/next), draft list per product
  (factory `listForProduct` + active pointer), orchestrates compose.
- `CoverageChecklist.tsx`: four rows (OKR, Discovery, Cadence, Adoption) with
  found/missing state and D5 drift badges; missing rows say what tool to
  visit to fill the gap. Renders above the editor — visible, never blocking.
- `DraftEditor.tsx`: title input, markdown `<textarea>`, word count,
  copy-to-clipboard (`navigator.clipboard.writeText`, fallback: select
  textarea + `document.execCommand("copy")`-free manual-copy hint), and the
  confirmed Recompose action.

Styling: Tailwind utilities on `tokens.css` variables only; motion via
`<ScrollReveal>` where lists fade in (stagger capped `Math.min(i, 4) * 40`);
lucide-react icons. React island only — no new UI deps.

## Risks / Trade-offs

- [Sibling record shapes drift from D8 before merge] → composer depends only
  on contract-level fields; implementation task includes a reconciliation
  pass against whatever sibling code has merged by then; worst case a source
  reads as empty, which is already a supported state.
- [Raw-key reads bypass sibling in-memory caches] → composer re-reads
  localStorage on each compose/coverage refresh (no long-lived cache of
  sibling data), so it always sees the latest persisted state; same-page
  cross-tool liveness is out of scope (each tool is its own page).
- [Recompose destroys manual edits] → explicit confirm dialog; `composedAt`
  vs `updatedAt` lets the UI warn "you've edited since last compose".
- [Clipboard API unavailable (older Safari, permissions)] → fallback path
  selects the textarea content and instructs manual copy; the text is always
  visible and selectable regardless.
- [No test framework in repo] → per contract precedent: enforced by
  TypeScript (`pnpm check`) and `pnpm build`; `composeBody` is written as a
  pure function so vitest can cover it later if the suite grows.

## Migration Plan

Greenfield: new page, new component dir, new store key. Nothing existing is
touched; rollback = delete the three new paths. Future shape changes bump
`pm-update-v2` with a read-old/write-new migration, mirroring ost-store's
`migrateLegacy`.

## Open Questions

- Should the composed markdown include a one-line "generated from: OKR ✓,
  OST ✓, Cadence —" provenance footer in the copied text itself? Leaning no
  (the founder doesn't care); coverage stays UI-only unless feedback says
  otherwise.
- Whether the Donut CRM sample product should ship a pre-filled sample draft.
  Per-tool decision left open by the contract; leaning no — the composer's
  value is watching sections appear as the visitor fills sibling tools.
- Backlog/Test Register sections (`stakeholder-update-sources-v2`) — follow-up
  once those lanes merge and their D8 shapes are real code.
