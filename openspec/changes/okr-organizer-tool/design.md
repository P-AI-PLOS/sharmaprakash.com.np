# Design — OKR Organizer (Stage 01: Vision & OKRs)

> **Contract of record:**
> `openspec/changes/donut-crm-pipeline-data-contract/design.md`. Every type,
> storage key, id prefix, and reference shape used here comes from that file
> (D2, D4, D6, D8). This design adds nothing to the contract; it fills in the
> tool-internal parts the contract deliberately leaves to each tool.

## Context

Static Astro 6.3 site; interactive tools are React 19 islands persisting to
localStorage only. The shipped reference is the OST builder:
`src/pages/tools/opportunity-solution-tree.astro` (SiteShell + hero + one
`client:load` island) with components in `src/components/tools/ost/` and a
hand-rolled store in `src/utils/ost-store.ts`. The pipeline data contract
change (`donut-crm-pipeline-data-contract`, not yet implemented) generalizes
that store pattern into `createToolStore<T>()` in `src/utils/pipeline-store.ts`.
This tool is the contract's first consumer and the pipeline's first stage;
`openspec/specs/` currently has no applied capabilities (the contract change
is the only sibling in flight).

Pedagogically the tool encodes Jeff Gothelf's customer-centric OKR form: an
objective is aspirational and qualitative; each key result names **who**
(a customer/user segment or accountable population), **does what** (an
observable behavior change, not an output shipped), and **by how much** (a
measured amount with a baseline→target framing). The tool's structure forces
that decomposition instead of offering a free-text "key result" box.

## Goals / Non-Goals

**Goals:**
- Minimum viable OKR organizer: create/edit/delete OKR entries (one objective
  + 1–5 key results) tagged to a department or product, one quarter at a time.
- Structured KR entry (who / does what / by how much as separate fields) so
  the discipline is enforced by the form, not by prose guidance.
- Quarter-over-quarter history view driven purely by
  `listForProduct` + `compareQuarters` (contract D6: no extra history model).
- Stable `uid("kr")` ids on every key result from creation — the tool's
  contract-level output (`OkrKeyResultRef` joins for four downstream tools).
- A light "why an OKR, not a Rock or a bare North Star metric?" framing step
  before first entry — a real UI moment, dismissible, never a gate.

**Non-Goals:**
- Progress/actuals/confidence tracking (OKR Check-In's job, stage 06).
- Cascading/aligned OKR trees, org charts, owners-as-users, notifications,
  export, cross-tab sync.
- Pipeline chrome (stage nav, product switcher island) — deferred follow-up
  `pipeline-tools-chrome` per the contract's open question. This page shows
  the active product's name (read-only) via `resolveActiveProduct()` and
  leaves switching to that future change.
- Course-embed variant. Standalone `/tools/okr-organizer/` page only.

## Decisions

### D1. Record shape: exactly the contract's D8 reservation

```ts
// src/utils/okr-store.ts
import {
  createToolStore, uid, type QuarterRef, type ToolRecordBase,
} from "~/utils/pipeline-store";

export interface OkrKeyResult {
  id: string;          // uid("kr") — stable, survives edits/reorders (contract stable-id rule)
  who: string;         // "Trial bakery owners"
  doesWhat: string;    // "complete their first order pipeline"
  byHowMuch: string;   // "from 12% to 40% within the quarter"
}

export type OkrTag = { kind: "department" | "product"; label: string };

export interface OkrRecord extends ToolRecordBase {
  quarter: QuarterRef;
  objective: string;
  keyResults: OkrKeyResult[];
  tag: OkrTag;
}

export const okrStore = createToolStore<OkrRecord>({
  storageKey: "pm-okr-v1",   // contract D4 key table
  idPrefix: "okr",           // contract D4 prefix table
});
```

`byHowMuch` is a single free-text string, not `{ baseline, target, unit }`
numerics. Alternative (structured metric fields) rejected: real KRs mix
percentages, counts, NPS, and time-to-X; three numeric boxes would fight the
user on half of them, and no downstream tool computes on the value — OKR
Check-In records its own actuals per `OkrKeyResultRef`. The form's placeholder
copy ("from 12% to 40%") teaches the baseline→target habit instead.

KR ids are minted with `uid("kr")` the moment a KR row is added, before save —
so a KR referenced mid-edit can never exist without an id. Deleting a KR row
deletes the id forever (no reuse); downstream refs surface via the contract's
D5 badge rule, which is those tools' concern, not this one's.

### D2. One entry = one objective + its KRs, for one quarter

An `OkrRecord` is a single objective with its key results, not a container of
many objectives. Multiple objectives per quarter = multiple records sharing
the same `quarter` value. Rationale: `OkrKeyResultRef` is `{ okrId, keyResultId }`,
so the natural addressable unit is the objective; and list/group-by-quarter
UI falls out of `listForProduct` for free. Alternative (a per-quarter
"OKR set" wrapper record) rejected — an extra layer with no consumer.

### D3. Page and component shape mirrors the OST tool

- `src/pages/tools/okr-organizer.astro`: SiteShell, hero (eyebrow "Free tool",
  H1, description crediting Gothelf's *Lean vs Agile vs Design Thinking* /
  customer-centric OKR framing, link to the blog's OKR-adjacent content if a
  natural one exists), then one island. Tailwind token utilities only
  (`design.md` law); no new tokens expected.
- `src/components/tools/okr/` (new namespace directory, mirroring `tools/ost/`):
  - **`OkrOrganizer.tsx`** — top-level `client:load` island. On mount:
    `resolveActiveProduct()`, then loads entries via
    `okrStore.listForProduct(product.id)`. Owns the selected quarter state
    (defaults to `currentQuarter()`) and renders: FormatChooser (if not
    dismissed) → quarter selector → entries for the selected quarter with an
    "Add objective" affordance → QuarterHistory. SSR-safe: localStorage reads
    happen in `useEffect`/lazy state init, same as TreeBuilder.
  - **`OkrEntryForm.tsx`** — controlled editor for one `OkrRecord`: objective
    textarea; tag control (department/product kind toggle + label input); KR
    rows each with three labeled inputs (Who / Does what / By how much) and a
    remove button; "Add key result" capped at 5 rows (teaching constraint:
    more than ~5 KRs means the objective isn't focused). Inline helper copy
    under each field header shows a Donut CRM example. Saves via
    `okrStore.create`/`update`; delete uses `window.confirm` like OstDashboard.
  - **`FormatChooser.tsx`** — see D4.
  - **`QuarterHistory.tsx`** — groups all of the product's records by
    `quarterKey(record.quarter)`, orders quarters with `compareQuarters`
    (descending, current first), renders each quarter's objectives compactly
    (objective + KR count + tag chip); clicking a past entry opens it
    read-only-by-default in the editor (editing past quarters is allowed —
    this is a sandbox tool, not an audit system).
- Icons from `lucide-react` (already a dependency of the OST components).
  React stays island-only per repo rules.

Alternative considered: reuse/extend `OstTreeSwitcher`-style record switching.
Rejected — OKR entries are quarter-grouped lists, not one-active-document, so
the switcher metaphor doesn't fit; `QuarterHistory` is the switcher.

### D4. The "why an OKR?" framing moment

`FormatChooser.tsx` renders above the editor on first run: a card titled
roughly "Do you actually want an OKR here?" with three compact side-by-side
options — **OKR** (behavior change you can measure quarterly, owned by a
team), **Rock** (a must-finish project/deliverable; if you can "complete" it,
it's a Rock, not a KR), **North Star metric** (one always-on number; use it
alone when you're pre-strategy and just need a compass). Each has a
one-sentence "choose this when…" line. Two actions: "Write an OKR" (dismisses
and focuses the form) and "Not now — just let me look around" (dismisses
only). Dismissal persists in localStorage under `pm-okr-v1-intro-dismissed`
(a plain boolean flag; a "What's the difference?" ghost button in the page
header re-opens it any time). It never blocks the form — the form renders
below it from the start.

Alternatives rejected: a modal gate (violates "not a gate" and hides the tool
behind a click), and burying it in help-modal copy (fails the "real UI
moment" requirement — the OST tool's `OstHelpModal` pattern is reference
material here, but the framing must be seen unprompted on first run).

The flag key is tool-internal UI state, not a record store, so it does not
need a `pm-*` table entry in the contract; it still follows the `pm-okr-v1-*`
namespace to stay greppable and versioned alongside the store.

### D5. Quarter selection UX

A compact selector: prev/next chevrons around the `quarterKey` label, seeded
from `currentQuarter()`, implemented with `nextQuarter` (and a local
`prevQuarter` inverse — trivial arithmetic; if the contract lane adds one,
use theirs). No free-form date input. Creating an entry stamps the currently
selected quarter. This is what makes "one quarter at a time" true in the UI
while history stays browsable below.

### D6. Sequencing against the contract change

This change **depends on** `donut-crm-pipeline-data-contract` being
implemented (it imports `pipeline-store.ts`). Tasks are ordered so the store
module and types compile only after the contract lands; if both lanes run in
parallel, this lane must rebase on the contract's merged module before its
verification tasks. No fallback shim will be written — a temporary local copy
of the contract is exactly the drift the contract exists to prevent.

## Risks / Trade-offs

- [Contract change slips or its API shifts during review] → this design cites
  only D2/D4/D6/D8 exports; any contract rename is a mechanical find/replace
  here. Blocked-on note lives in tasks.md task 1.1.
- [Free-text `byHowMuch` lets users write unmeasurable KRs] → accepted; the
  three-field split plus example placeholders is the teaching lever. A
  validator would be scope creep for a content-site tool.
- [Visitors edit past quarters, making "history" revisionist] → accepted and
  intentional (sandbox, single user, their own data). OKR Check-In, not this
  tool, is where actuals get recorded.
- [localStorage unavailable] → inherited silent-degrade from the contract
  factory; the island stays usable in-memory for the session.
- [No test framework in repo] → per the contract's decision, gates are
  TypeScript (`pnpm check`), `pnpm build`, and a scripted manual smoke pass
  (tasks.md verification group). No vitest introduced for one tool.

## Migration Plan

Greenfield: new page, new component dir, new store key. Nothing existing is
touched; rollback = delete the three paths. Future record-shape changes bump
`pm-okr-v1` → `pm-okr-v2` with a read-old/write-new migration, mirroring
`migrateLegacy` in ost-store (contract migration convention).

## Open Questions

- Should the Donut CRM sample product ship with one pre-filled example OKR
  (per the contract's open question about per-tool sample data)? Leaning yes
  — a single seeded example is the fastest way to teach the who/what/how-much
  form — but it's a copywriting decision; task 4.4 stubs it behind a small
  `SAMPLE_OKR` constant that's trivial to drop.
- Exact hero/FormatChooser copy (Rock vs OKR vs North Star wording) needs a
  human pass; the structure is fixed by this design, the sentences aren't.
- Whether `prevQuarter` should be added to the shared contract module rather
  than kept local — raise with the contract lane at implementation time.
