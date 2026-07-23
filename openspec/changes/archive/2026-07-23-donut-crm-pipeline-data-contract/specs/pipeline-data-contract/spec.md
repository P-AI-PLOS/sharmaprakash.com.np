# pipeline-data-contract Specification

Shared localStorage data contract for the Donut CRM product-management
pipeline tools. Implemented by `src/utils/pipeline-store.ts`; consumed by the
eight pipeline tool capabilities.

## ADDED Requirements

### Requirement: Per-product umbrella record
The system SHALL persist product records (`{ id, name, createdAt, updatedAt }`)
in localStorage under the versioned key `pm-products-v1`, and every pipeline
tool record SHALL carry the owning product's id as `productId`. Product data
MUST never leave the browser.

#### Scenario: Product id joins tool records
- **WHEN** a tool creates a record via the shared store factory with
  `productId` set to an existing product's id
- **THEN** listing that tool's records for that product returns the record,
  and listing for any other product id does not

#### Scenario: Storage unavailable degrades silently
- **WHEN** localStorage writes throw (private mode or quota exceeded)
- **THEN** store operations complete without throwing and the in-memory state
  remains usable for the session

### Requirement: Active product pointer with Donut CRM seed
The system SHALL keep a single global active-product pointer under
`pm-active-product-v1`, and `resolveActiveProduct()` SHALL return the pointed
product, or on first visit create, activate, and return a product named
"Donut CRM".

#### Scenario: First visit seeds the running case
- **WHEN** `resolveActiveProduct()` runs with no products stored
- **THEN** a product named "Donut CRM" is created, set active, and returned

#### Scenario: Existing active product is reused
- **WHEN** `resolveActiveProduct()` runs and the pointer references an existing
  product
- **THEN** that product is returned and no new product is created

#### Scenario: Dangling pointer recovers
- **WHEN** the active pointer references a deleted product
- **THEN** `resolveActiveProduct()` falls back to another existing product or
  seeds a new one, and repoints the pointer

### Requirement: Shared quarter representation
The system SHALL represent quarters as `QuarterRef` (`{ year, quarter: 1|2|3|4 }`)
and SHALL provide `quarterKey`, `parseQuarterKey`, `currentQuarter`,
`nextQuarter`, and `compareQuarters`. Quarter-scoped tools (OKR Organizer,
Cadence & Reflection Kit, OKR Check-In) MUST use this shape and no other
quarter encoding.

#### Scenario: Round-trip through the key form
- **WHEN** `quarterKey({ year: 2026, quarter: 3 })` is parsed with
  `parseQuarterKey`
- **THEN** the result equals `{ year: 2026, quarter: 3 }` and the key form is
  `"2026-Q3"`

#### Scenario: Year rollover
- **WHEN** `nextQuarter({ year: 2026, quarter: 4 })` is called
- **THEN** it returns `{ year: 2027, quarter: 1 }`

#### Scenario: Quarter-over-quarter ordering
- **WHEN** records with quarters 2025-Q4, 2026-Q2, 2026-Q1 are sorted with
  `compareQuarters`
- **THEN** the order is 2025-Q4, 2026-Q1, 2026-Q2

### Requirement: Stable ids and naming conventions
The system SHALL generate entity ids as `uid(prefix)` producing
`<prefix>_<8 base36 chars>`, using the design.md prefix table, and tool stores
SHALL use the design.md storage-key table (`pm-<tool>-v1` plus
`pm-<tool>-v1-active`, except OST which keeps its pre-existing
`ost-trees-v1`/`ost-active-v1` keys). Any entity referenced by another tool
MUST carry a stable `uid()` id; array indexes MUST NOT be used as join keys —
including inside OST trees, whose opportunities and solutions carry `uid("opp")`/
`uid("sol")` ids after migration (D9).

#### Scenario: Ids survive edits and reorders
- **WHEN** a key result inside an OKR entry is reworded and its list reordered
- **THEN** its `kr`-prefixed id is unchanged and existing `OkrKeyResultRef`s
  still resolve to it

### Requirement: Cross-tool reference shapes
The system SHALL export the reference types `OstPickRef` (ostRecordId,
opportunityId, solutionId, and mandatory text snapshots), `SpecRef`,
`StoryRef` (storyId + specId), `OkrKeyResultRef` (okrId + keyResultId), and
`AcceptanceCriterionRef` (specId + criterionId), and pipeline tools SHALL use
these types — not ad-hoc shapes — for every cross-tool link.

#### Scenario: Spec Builder picks a starred OST solution
- **WHEN** a spec is created from an OST record's starred opportunity and
  solution
- **THEN** the spec stores an `OstPickRef` containing the OstRecord id, the
  opportunity and solution ids, and the opportunity and solution text as picked

### Requirement: Stale references degrade with snapshots, never cascade
Consumers of cross-tool references SHALL re-resolve ids against the source
store on load, SHALL render the stored snapshot with a visible
"source changed/removed" indicator when the target is missing or its text no
longer matches the snapshot, and deletions SHALL NOT cascade across tool
stores.

#### Scenario: Referenced spec deleted
- **WHEN** a Vertical Slicer story's `specId` no longer resolves
- **THEN** the story still renders using its stored snapshot text, flagged as
  source-removed, and the story record is not deleted

#### Scenario: OST solution reworded after pick
- **WHEN** the live text at an `OstPickRef`'s referenced opportunity/solution
  id differs from its stored snapshot
- **THEN** the consumer shows the snapshot flagged as source-changed rather
  than silently substituting the new text

### Requirement: Tool store factory
The system SHALL provide `createToolStore<T extends ToolRecordBase>({ storageKey, idPrefix })`
returning list/listForProduct/get/create/update/remove plus scope-keyed
active-record pointer accessors, persisting a `Record<id, T>` under the
versioned storage key with an in-memory cache and silent try/catch JSON I/O,
matching the ost-store pattern. `src/utils/ost-store.ts` SHALL be re-implemented
on this factory, keeping its existing storage keys and public API.

#### Scenario: Create stamps contract fields
- **WHEN** `create()` is called with tool-specific data and a `productId`
- **THEN** the stored record has a fresh prefix-correct id and equal
  `createdAt`/`updatedAt` timestamps

#### Scenario: Update bumps updatedAt only
- **WHEN** `update(id, patch)` is applied to an existing record
- **THEN** `updatedAt` increases, `id` and `createdAt` are unchanged, and
  `list()` returns records sorted by `updatedAt` descending

#### Scenario: Active record is scoped per product
- **WHEN** `setActiveId(productA, r1)` and `setActiveId(productB, r2)` are set
- **THEN** `getActiveId(productA)` returns r1 and `getActiveId(productB)`
  returns r2

#### Scenario: OST active record is scoped by context, not product
- **WHEN** `ost-store.ts` calls `setActiveId(contextKeyFor(source), treeId)`
  for a course-embed context and a standalone context
- **THEN** each context resolves its own active tree independently, matching
  today's `ost-active-v1` behavior

#### Scenario: OST migration is additive, not destructive
- **WHEN** an existing `ost-trees-v1` record with no node ids or `productId`
  is loaded after the migration ships
- **THEN** its `outcome`, `opportunities` text/order, and `target` flags are
  unchanged, and each opportunity/solution gains a stable id plus the record
  gains a `productId` on that load
