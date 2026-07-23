# Stakeholder Update Composer — Founder Ring of the Donut CRM Pipeline

## Why

The Donut CRM pipeline (see `openspec/changes/donut-crm-pipeline-data-contract/design.md`,
the contract of record) ends every stage with data trapped inside a tool: OKRs
in the Organizer, discovery in the OST builder, cadence health in the
Reflection Kit, adoption actuals in OKR Check-In. What a founder or exec
actually receives is none of these — it is a periodic narrative update the PO
assembles by hand, re-reading four tools and retyping what they already wrote.
The Stakeholder Update Composer closes that loop: given the active product and
quarter, it pulls together whatever pipeline data already exists into a
structured, editable plain-text draft the visitor can copy out. It sits in the
**Founder ring** — a deliberately thin persona ring, not one of the six
numbered pipeline stages: authored by the PO, addressed to the founder/exec
audience, and cross-cutting by design (it drafts from whichever stage is
currently "live", it is not a step in the sequence).

## What Changes

- Add `/tools/stakeholder-update-composer/` — a free, browser-only tool page
  (`src/pages/tools/stakeholder-update-composer.astro`), same page shape as
  the OST tool: `SiteShell`, hero copy, one `client:load` React island.
- Add `src/utils/update-store.ts` built on `createToolStore<UpdateRecord>()`
  from the shared contract (`pm-update-v1` / `pm-update-v1-active`, id prefix
  `upd`). Records hold `quarter: QuarterRef`, an editable markdown `body`, and
  snapshot source refs recording which sibling records fed the draft.
- Add read-only source assembly: the composer reads sibling stores for the
  active product + selected quarter and drafts one section per source that
  exists — objective & key results with current confidence (OKR Organizer
  `pm-okr-v1` joined with OKR Check-In `pm-checkin-v1`), discovery highlights
  (OST builder `ost-trees-v1`), delivery cadence status (Cadence & Reflection
  Kit `pm-cadence-v1`), and adoption signal (OKR Check-In actuals). **Partial
  pipelines are the normal case**: any missing source simply produces no
  section plus an honest coverage note — early in a quarter, an update drafted
  from only an OKR and an OST is a valid update. Per contract D8, the composer
  reads via the published keys/`listForProduct` shape and MUST NOT mutate any
  sibling store.
- Add React island components under
  `src/components/tools/stakeholder-update-composer/`:
  - `UpdateComposer.tsx` — top-level island: product via
    `resolveActiveProduct()`, quarter selection, source assembly, draft list.
  - `CoverageChecklist.tsx` — which of the four sources exist for this
    product + quarter and which are still empty ("nothing to report yet"), so
    gaps are visible without blocking composition.
  - `DraftEditor.tsx` — the editable plain-text/markdown draft with
    copy-to-clipboard, plus an explicit "recompose from sources" action
    (confirmed, since it replaces manual edits).
- The tool composes; it never transmits. Output leaves the tool only through
  copy-to-clipboard / select-and-copy of plain text.
- No backend, no CMS, nothing leaves the browser — identical constraints to
  the OST tool.

## Capabilities

### New Capabilities

- `stakeholder-update-composer`: assemble an editable, copyable plain-text
  stakeholder update for a product and quarter from whatever pipeline data
  already exists (OKR + KR confidence, discovery highlights, cadence status,
  adoption signal), degrading gracefully when sources are missing, persisting
  drafts in localStorage per the pipeline data contract, and never
  transmitting anything anywhere.

### Modified Capabilities

_None. `pipeline-data-contract` is consumed as-is — D4 already reserves
`pm-update-v1` / `upd` for this tool and D8 already states its read-many /
write-own contract, so no delta against that capability is needed._

## Impact

- **New code:** `src/pages/tools/stakeholder-update-composer.astro`,
  `src/components/tools/stakeholder-update-composer/{UpdateComposer,CoverageChecklist,DraftEditor}.tsx`,
  `src/utils/update-store.ts`.
- **Hard dependency:** `src/utils/pipeline-store.ts` from change
  `donut-crm-pipeline-data-contract` — **that change must be implemented
  first**. Sibling tool changes (`okr-organizer-tool`, and the in-flight
  Cadence & Reflection Kit / OKR Check-In proposals) are **soft dependencies
  only**: the composer reads their contract-level record fields (D8) through
  the published storage keys, so it builds and ships even if a sibling lane
  has not landed — that source just reads as empty, which is exactly the
  partial-pipeline case the tool must handle anyway.
- **Read-only dependency:** `src/utils/ost-store.ts` (`listTrees`,
  `getActiveId`) for the discovery-highlights source; never written.
- **No changes** to `ost-store.ts`, sibling stores, routes, or content
  collections. New URL `/tools/stakeholder-update-composer/` is additive;
  existing locked URLs untouched.
- **No new dependencies:** React 19 island + Tailwind tokens + lucide-react
  (already used by the OST components). Clipboard via
  `navigator.clipboard.writeText` with a select-the-textarea fallback.
- **Tracker:** no existing bd issues reference this tool; a bead will be filed
  when implementation starts (see tasks.md close-out).

## Non-goals

- **No email, no Slack, no webhooks, no external API of any kind.** The tool
  composes an update; the human sends it through whatever channel they use.
  Copy-to-clipboard / plain-text export only.
- No AI-generated prose: sections are deterministic assembly of the visitor's
  own pipeline data into a plain template; the human does the editorial work.
- No scheduling, reminders, or automation ("send every other Friday" is
  advice for the page copy, not a feature).
- No Backlog Prioritizer / Test Register sections in v1 — those proposals are
  parallel lanes; wiring their signals in is a named follow-up once their
  record shapes exist (`stakeholder-update-sources-v2`).
- No shared "pipeline chrome" (stage nav / product switcher island) — still
  deferred per the contract's open question (`pipeline-tools-chrome`).
- No update history diffing, versioning, or quarter-over-quarter comparison
  beyond listing past drafts.
