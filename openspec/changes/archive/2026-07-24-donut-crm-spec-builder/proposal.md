# Donut CRM Pipeline — Spec Builder Tool

## Why

The Donut CRM pipeline (see `openspec/changes/archive/2026-07-23-donut-crm-pipeline-data-contract/`)
has a Discovery stage tool (the shipped OST builder at
`/tools/opportunity-solution-tree/`) but nothing in the 03 Definition stage
that turns a starred opportunity + solution into a spec artifact. Downstream
tools (Vertical Slicer via `SpecRef`, Test Register via
`AcceptanceCriterionRef`) are contracted to read specs that don't exist yet —
Spec Builder is the pipeline's second tool and the producer both of them
depend on.

## What Changes

- Add `/tools/spec-builder/` — a static Astro page hosting a React island
  (mirroring `src/pages/tools/opportunity-solution-tree.astro` +
  `src/components/tools/ost/`) that scaffolds a spec from a picked OST
  opportunity + solution.
- **OST pick step**: the visitor selects an existing OST record (from
  `src/utils/ost-store.ts`, read-only), then the target (🎯) opportunity and
  one of its solutions; the pick is stored as an `OstPickRef` per the data
  contract (ids + indexes + mandatory text snapshots). Manual entry fallback
  when no trees exist.
- **Framing moment before the format picker**: a short "what's the job here?"
  prompt — align a room (pitch), hand off unambiguous scope (PRD), or
  sequence a release (story map). Light guidance, skippable, never a gate.
- **Explicit format choice** (stored, visible, switchable — never hardcoded):
  - `prd` — lightweight PRD: problem, outcome, non-goals, success metric
  - `shape-up-pitch` — problem, appetite, solution, rabbit holes, no-gos
    (the site already teaches Shape Up context in the CDH post series)
  - `story-map` — story-map outline: backbone activities with steps beneath
- **Acceptance criteria in every format**: each spec carries
  `acceptanceCriteria: Array<{ id: uid("ac"), text }>` regardless of format —
  this is the surface Test Register joins on (`AcceptanceCriterionRef`) and
  the spec id is what Vertical Slicer joins on (`SpecRef`).
- **Persistence** via a new `src/utils/spec-store.ts` built on
  `createToolStore` from `src/utils/pipeline-store.ts` (key `pm-spec-v1`,
  prefix `spec`, records carry `productId`). localStorage only, no backend.
- Markdown export of the finished spec, same pattern as the OST builder's
  export.
- No changes to `src/utils/ost-store.ts` (read-only dependency) and no
  changes to `src/utils/pipeline-store.ts` (contract consumed as-is).

## Capabilities

### New Capabilities

- `spec-builder`: the Definition-stage tool that resolves an `OstPickRef`
  into a spec record with a visitor-chosen format (PRD / Shape Up pitch /
  story map), stable `spec`/`ac` ids for downstream reference, and
  localStorage persistence per the pipeline data contract.

### Modified Capabilities

_None. `pipeline-data-contract` already defines `OstPickRef`, `SpecRef`,
`AcceptanceCriterionRef`, the `pm-spec-v1` key and the `spec`/`ac` prefixes —
this change consumes that contract without altering it._

## Impact

- **New code:** `src/pages/tools/spec-builder.astro`,
  `src/components/tools/spec-builder/*.tsx` (React islands),
  `src/utils/spec-store.ts`.
- **Read-only dependencies:** `src/utils/ost-store.ts` (`listTrees`,
  `getTree`, `OstRecord`) and `src/utils/pipeline-store.ts`
  (`createToolStore`, `uid`, `resolveActiveProduct`, ref types).
- **Hard dependency:** the `donut-crm-pipeline-data-contract` change must be
  implemented first (this tool imports `pipeline-store.ts`).
- **Downstream:** Vertical Slicer and Test Register proposals will reference
  `spec` and `ac` ids produced here; their lanes stay unblocked because the
  join shapes come from the contract, not from this change.
- **Constraints honored:** static Astro 6.3, localStorage only, React 19
  islands, Tailwind tokens, no new dependencies, no post-URL changes.

## Non-goals

- Not a full authoring/collaboration tool: no rich text, comments, versions,
  sharing, or multi-format sync of one spec's content.
- No modification of `ost-store.ts` (no ids added to OST nodes; snapshot rule
  covers drift) and no writes to any other tool's store.
- No pipeline-wide chrome (stage nav / product switcher) — deferred to the
  `pipeline-tools-chrome` follow-up named in the contract's Open Questions.
