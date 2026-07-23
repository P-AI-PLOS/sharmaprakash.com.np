# Design — Donut CRM Pipeline Shared Data Contract

> **This document is the contract of record.** The eight tool proposals
> (okr-organizer, spec-builder, vertical-slicer, backlog-prioritizer,
> cadence-reflection-kit, okr-check-in, test-register,
> stakeholder-update-composer) MUST build their stores against the interfaces
> and conventions defined here, and cite this file in their own design docs.
> If a tool needs a shape this file doesn't provide, extend THIS change (or
> propose a delta against the `pipeline-data-contract` capability) — do not
> invent a parallel shape.

## Context

The site is static Astro 6.3; interactive tools are React 19 islands persisting
to localStorage only (no backend, no CMS, nothing leaves the browser). The
reference implementation is `src/utils/ost-store.ts`: versioned store key,
`Record<id, record>` shape, in-memory cache, try/catch JSON read/write, and a
separate active-record pointer keyed by context. That pattern is proven and is
carried forward here.

Eight tools form a pipeline around one fictional running case, "Donut CRM"
(but generic — a visitor models their own product the same way):

| # | Tool | Stage | Reads from | Read by |
|---|------|-------|-----------|---------|
| 1 | OKR Organizer | Vision & OKRs | — | Backlog Prioritizer, Cadence Kit, OKR Check-In, Stakeholder Update |
| 2 | Spec Builder | Definition | OST (starred opportunity+solution) | Vertical Slicer, Test Register |
| 3 | Vertical Slicer | Definition | Spec Builder | Backlog Prioritizer, Test Register |
| 4 | Backlog Prioritizer | Backlog | Vertical Slicer, OKR Organizer | Stakeholder Update |
| 5 | Cadence & Reflection Kit | Delivery Cadence | OKR Organizer | Stakeholder Update |
| 6 | OKR Check-In | Feedback & Adoption | OKR Organizer | OKR Organizer (drafts next quarter), Stakeholder Update |
| 7 | Test Register | QA ring | Vertical Slicer, Spec Builder | Stakeholder Update |
| 8 | Stakeholder Update Composer | Founder ring | any of the above | — |

Each tool ships as its own OpenSpec change in its own lane. This change ships
only the shared module they all import: `src/utils/pipeline-store.ts`.

## Goals / Non-Goals

**Goals:**
- One per-product umbrella record whose id is the join key across all eight tool stores.
- One quarter representation shared by the three quarter-scoped tools.
- Explicit, typed cross-tool reference shapes so agents building tools in
  isolation cannot invent incompatible joins.
- Naming conventions (storage keys, id prefixes) and a stale-reference rule.
- A tiny store factory so eight tools reuse the ost-store persistence pattern
  instead of hand-rolling eight copies.

**Non-Goals:**
- Migrating `ost-store.ts` onto the factory or adding ids to OST nodes
  (OST stays as-is; the contract joins to it via snapshot refs).
- Cross-tab sync (`storage` events), export/import, undo, schema validation
  libraries, or any general-purpose framework. Minimum viable contract only.
- Defining each tool's full domain model. Each tool owns its own record shape;
  this file only fixes the parts other tools depend on (see "Owned entities
  and expectations" below).

## Decisions

### D1. One shared module, per-tool stores

`src/utils/pipeline-store.ts` holds the product store, quarter helpers,
reference types, and the store factory. Each tool then keeps its own module
(e.g. `src/utils/okr-store.ts`) with its own localStorage key, built via
`createToolStore`. Alternative considered: one giant `pm-pipeline-v1` blob
holding all tools' data — rejected because eight lanes writing one key invites
merge conflicts in code and clobbering at runtime; per-tool keys keep each
lane independent (exactly how ost-store already coexists).

### D2. The contract interfaces (normative)

The following is the shape of `src/utils/pipeline-store.ts`. Tool proposals
should treat every exported name below as stable API.

```ts
/**
 * src/utils/pipeline-store.ts
 * Shared data contract for the Donut CRM pipeline tools. localStorage only.
 */

// ---------------------------------------------------------------- products

/** The per-product umbrella record. Its id is the join key for every tool. */
export interface ProductRecord {
  id: string;          // uid("prod")
  name: string;        // e.g. "Donut CRM"
  createdAt: number;   // epoch ms
  updatedAt: number;
}

export const PRODUCTS_KEY = "pm-products-v1";
export const ACTIVE_PRODUCT_KEY = "pm-active-product-v1"; // stores a single id

export function listProducts(): ProductRecord[];              // updatedAt desc
export function getProduct(id: string): ProductRecord | undefined;
export function createProduct(name: string): ProductRecord;
export function renameProduct(id: string, name: string): void;
export function deleteProduct(id: string): void;              // does NOT cascade (see D7)
export function getActiveProductId(): string | null;
export function setActiveProductId(id: string): void;

/**
 * Returns the active product, creating and activating a "Donut CRM" sample
 * product on first visit so every tool boots into the running case.
 */
export function resolveActiveProduct(): ProductRecord;

// ---------------------------------------------------------------- quarters

/** The one quarter representation. Never re-model quarters as strings/dates. */
export interface QuarterRef {
  year: number;             // four-digit, e.g. 2026
  quarter: 1 | 2 | 3 | 4;
}

export function quarterKey(q: QuarterRef): string;         // "2026-Q3" — display + map keys
export function parseQuarterKey(key: string): QuarterRef | null;
export function currentQuarter(now?: Date): QuarterRef;
export function nextQuarter(q: QuarterRef): QuarterRef;    // OKR Check-In drafts into this
export function compareQuarters(a: QuarterRef, b: QuarterRef): number; // sort/history

// ---------------------------------------------------------------- ids & base

/** `${prefix}_${8 base36 chars}`, e.g. "spec_k3v9q2ax". See prefix table (D4). */
export function uid(prefix: string): string;

/** Every tool record persisted by createToolStore extends this. */
export interface ToolRecordBase {
  id: string;          // uid(<tool prefix>)
  productId: string;   // ProductRecord.id — REQUIRED on every tool record
  createdAt: number;
  updatedAt: number;
}

// ------------------------------------------------------- cross-tool references

/**
 * Spec Builder's input: a starred opportunity + solution from an OstRecord
 * (src/utils/ost-store.ts). OST nodes are index-addressed strings with no
 * stable ids, so refs carry text snapshots taken at pick time (see D5).
 */
export interface OstPickRef {
  ostRecordId: string;        // OstRecord.id
  opportunityIndex: number;   // index into tree.opportunities at pick time
  solutionIndex: number;      // index into opportunities[i].solutions at pick time
  opportunityText: string;    // snapshot — always renderable
  solutionText: string;       // snapshot
}

/** Vertical Slicer → a Spec Builder spec. */
export interface SpecRef {
  specId: string;             // uid("spec")
}

/** Backlog Prioritizer / Test Register → a Vertical Slicer story. */
export interface StoryRef {
  storyId: string;            // uid("story")
  specId: string;             // the spec the story was sliced from
}

/** Backlog Prioritizer / Cadence Kit / Check-In → a key result. */
export interface OkrKeyResultRef {
  okrId: string;              // uid("okr") — the OKR Organizer entry
  keyResultId: string;        // uid("kr") — stable per key result
}

/** Test Register → a Spec Builder acceptance criterion. */
export interface AcceptanceCriterionRef {
  specId: string;             // uid("spec")
  criterionId: string;        // uid("ac")
}

// ---------------------------------------------------------------- store factory

export interface ToolStore<T extends ToolRecordBase> {
  list(): T[];                              // all records, updatedAt desc
  listForProduct(productId: string): T[];
  get(id: string): T | undefined;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): T;
  update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>): void; // bumps updatedAt
  remove(id: string): void;
  /** Active pointer, scoped per product: "which record is open for this product". */
  getActiveId(productId: string): string | null;
  setActiveId(productId: string, id: string): void;
}

/**
 * Builds a tool's store on the ost-store pattern: versioned key, in-memory
 * cache, Record<id, T> shape, silent try/catch persistence, separate
 * "<storageKey>-active" pointer key.
 */
export function createToolStore<T extends ToolRecordBase>(opts: {
  storageKey: string;   // from the key table in D4, e.g. "pm-okr-v1"
  idPrefix: string;     // from the prefix table in D4, e.g. "okr"
}): ToolStore<T>;
```

### D3. Product record is thin on purpose

`ProductRecord` is just `{ id, name, timestamps }`. No department list, no OST
link, no settings bag. Rationale: every field added here becomes something all
eight lanes must agree on; anything tool-specific (e.g. OKR Organizer's
department/product tag) lives in that tool's own records, keyed by
`productId`. Alternative (rich product hub object aggregating per-tool state)
rejected as exactly the over-engineering this contract exists to avoid.

There is one global active product (not per-context like OST's active map):
the pipeline is a guided walkthrough of one product at a time, and a single
pointer means every tool page opens on the same product without coordination.

### D4. Naming conventions (normative tables)

**localStorage keys** — versioned, `pm-` prefixed (OST keeps its `ost-` keys):

| Tool | Store key | Active-pointer key |
|------|-----------|--------------------|
| (shared) products | `pm-products-v1` | `pm-active-product-v1` |
| OKR Organizer | `pm-okr-v1` | `pm-okr-v1-active` |
| Spec Builder | `pm-spec-v1` | `pm-spec-v1-active` |
| Vertical Slicer | `pm-slice-v1` | `pm-slice-v1-active` |
| Backlog Prioritizer | `pm-backlog-v1` | `pm-backlog-v1-active` |
| Cadence & Reflection Kit | `pm-cadence-v1` | `pm-cadence-v1-active` |
| OKR Check-In | `pm-checkin-v1` | `pm-checkin-v1-active` |
| Test Register | `pm-testreg-v1` | `pm-testreg-v1-active` |
| Stakeholder Update Composer | `pm-update-v1` | `pm-update-v1-active` |

**id prefixes** (via `uid(prefix)`):

| Prefix | Entity | Owner |
|--------|--------|-------|
| `prod` | ProductRecord | shared module |
| `okr` | OKR entry (one objective + KRs, one quarter) | OKR Organizer |
| `kr` | Key result within an OKR entry | OKR Organizer |
| `spec` | Spec (PRD / pitch / story map) | Spec Builder |
| `ac` | Acceptance criterion within a spec | Spec Builder |
| `story` | Sliced story | Vertical Slicer |
| `cad` | Cadence record | Cadence & Reflection Kit |
| `chk` | Check-in record | OKR Check-In |
| `test` | Test scenario | Test Register |
| `upd` | Stakeholder update draft | Stakeholder Update Composer |

**The stable-id rule:** any entity another tool references MUST carry a
`uid()`-generated id that survives edits and reorders. Array indexes are never
join keys. The single exception is OST (pre-contract, index-addressed), which
is why `OstPickRef` is snapshot-based.

### D5. Stale references: snapshot at pick, re-resolve on load, badge on drift

localStorage has no referential integrity: a visitor can delete a spec after
slicing it, or reword an OST solution after Spec Builder picked it. The rule
for every cross-tool ref:

1. **Snapshot** the human-readable text alongside the ids at pick time
   (mandatory for `OstPickRef`; recommended for tool records that display
   referenced titles, e.g. a story storing `specTitle` next to `specId`).
2. **Re-resolve on load**: look the id up in the source store; if found, show
   live data.
3. **Badge on drift**: if the id is missing (deleted) or, for `OstPickRef`,
   the text at the stored index no longer matches the snapshot, render the
   snapshot with a small "source changed/removed" badge. Never block the tool,
   never cascade-delete, never silently swap in wrong data.

Alternative considered: retrofitting stable ids into `OstTree` nodes plus a
migration — rejected; it churns a shipped tool and the snapshot rule handles
the same failure mode for zero migration cost.

### D6. Quarter shape

`{ year, quarter }` struct with `quarterKey()` producing `"2026-Q3"` for
display and map keys. Structs sort/compare/increment cleanly
(`compareQuarters`, `nextQuarter` — the latter is what OKR Check-In uses to
draft next quarter's entry). Alternative (bare `"2026-Q3"` strings everywhere)
rejected: three tools would each write their own parser. Strings appear only
at the edges via `quarterKey`/`parseQuarterKey`.

Quarter-scoped tool records (OKR Organizer, Cadence Kit, OKR Check-In) carry a
`quarter: QuarterRef` field; quarter-over-quarter history is "list records for
productId, sort by compareQuarters" — no extra history structure.

### D7. Deletion does not cascade

`deleteProduct` (and every tool's `remove`) deletes only its own record.
Orphaned downstream records keep their `productId`/refs and surface through the
D5 badge rule. Cascading deletes across eight independent stores would require
the shared module to know every tool's key — a dependency inversion this
contract deliberately avoids.

### D8. Owned entities and expectations for the eight tool proposals

Each tool defines its own record shape in its own proposal, but the following
fields are contract-level because another tool reads them:

- **OKR Organizer**: records `{ ...ToolRecordBase, quarter: QuarterRef, objective, keyResults: Array<{ id /* uid("kr") */, who, doesWhat, byHowMuch }>, tag: { kind: "department" | "product"; label: string } }`.
  Key results MUST carry `uid("kr")` ids — Backlog Prioritizer, Cadence Kit and
  Check-In join on `OkrKeyResultRef`.
- **Spec Builder**: records carry `sourcePick: OstPickRef`, a **visible, stored**
  `format: "prd" | "shape-up-pitch" | "story-map"` field (never hardcoded), and
  `acceptanceCriteria: Array<{ id /* uid("ac") */, text }>` regardless of format.
- **Vertical Slicer**: stories carry `id /* uid("story") */` and the `SpecRef`
  they were sliced from; slicing pattern (workflow steps / business rules /
  data variations) is tool-internal.
- **Backlog Prioritizer**: plots `StoryRef`s and links each plot to
  `OkrKeyResultRef`(s); agreement/certainty axis values are tool-internal.
- **Cadence & Reflection Kit**: records carry `quarter: QuarterRef` and
  optional `OkrKeyResultRef`s (demo-day checklist tied to the active OKR);
  flow-vs-sprint metrics are tool-internal.
- **OKR Check-In**: records carry `quarter: QuarterRef` and one entry per
  `OkrKeyResultRef` with actuals/confidence; the drafted next-quarter OKR is
  created through OKR Organizer's store (a new `okr` record with
  `quarter: nextQuarter(...)`), not a private copy.
- **Test Register**: scenarios reference a `StoryRef` and/or
  `AcceptanceCriterionRef`; Playwright-generation state is tool-internal.
- **Stakeholder Update Composer**: reads any store via `listForProduct(productId)`;
  writes only its own `upd` drafts. It MUST NOT mutate other tools' records.

## Risks / Trade-offs

- [Eight lanes drift from the contract anyway] → every tool proposal template
  must link this design.md; `pipeline-store.ts` exports are the only sanctioned
  shapes, so drift shows up as a type error at `pnpm check`, not at runtime.
- [OstPickRef index drift after tree edits] → D5 snapshot + badge rule; worst
  case the visitor re-picks, no data loss.
- [localStorage quota / private mode] → same silent-degrade behavior as
  ost-store (`writeJson` try/catch): tools stay usable, persistence quietly off.
- [Factory too rigid for an outlier tool] → factory is optional sugar; a tool
  may hand-roll persistence IF it keeps `ToolRecordBase`, the key/prefix tables
  and the ref shapes. Record the deviation in that tool's design.md.
- [No test framework in repo] → contract is enforced by TypeScript
  (`pnpm check`) and `pnpm build`; adding vitest for one util module is not
  justified on this site (revisit if the tool suite grows logic-heavy).

## Migration Plan

Greenfield module; nothing to migrate. `ost-store.ts` untouched. Rollback =
delete `pipeline-store.ts` (no consumers exist until the tool changes land).
Future shape changes bump the storage-key version (`pm-*-v2`) with a
read-old/write-new migration in the shared module, mirroring
`migrateLegacy` in ost-store.

## Open Questions

- Should the eight tool pages share a common "pipeline chrome" (stage nav,
  product switcher island)? Likely yes, but it is UI, not data — deferred to
  the first tool proposal that needs it (suggested follow-up change:
  `pipeline-tools-chrome`).
- Export/import of a whole product's pipeline data (JSON download) — useful for
  the running-case demo, deferred as a follow-up, not contract-blocking.
- Whether the "Donut CRM" sample product should ship pre-filled sample data in
  each tool (not just the empty named product). Per-tool decision; the contract
  only guarantees `resolveActiveProduct()` seeds the product record itself.
