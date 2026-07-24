# stakeholder-update-composer Specification

Founder-ring tool of the Donut CRM pipeline: assembles an editable, copyable
plain-text stakeholder update for the active product and a selected quarter
from whatever sibling-tool data already exists. Reads many stores, writes only
its own `pm-update-v1` drafts, transmits nothing. Conforms to
`pipeline-data-contract`.

## ADDED Requirements

### Requirement: Compose a draft from available pipeline sources
The system SHALL compose a structured markdown draft for the active product
(via `resolveActiveProduct()`) and a selected quarter, with one section per
available source in fixed order: objective & key results with per-KR
confidence, discovery highlights, delivery cadence status, adoption signal,
and an always-present asks/next-steps prompt. Sources are read for the
matching `productId` (and, for quarter-scoped records, the matching quarter):
OKR records from `pm-okr-v1`, check-in records from `pm-checkin-v1`, cadence
records from `pm-cadence-v1`, and an OST tree from `ost-trees-v1`. KR
confidence SHALL be joined by matching the check-in entry's
`OkrKeyResultRef.keyResultId` to the OKR record's key-result ids.

#### Scenario: Full pipeline composes all sections
- **WHEN** OKR, check-in, cadence, and OST records exist for the active
  product and selected quarter and the visitor composes a draft
- **THEN** the draft body contains the OKR section (each key result with its
  check-in confidence), a discovery section, a cadence section, an adoption
  section, and the asks/next-steps prompt, in that order

#### Scenario: KR without a matching check-in entry
- **WHEN** an OKR key result has no check-in entry whose
  `OkrKeyResultRef.keyResultId` matches it
- **THEN** that key-result line renders without a confidence value instead of
  showing wrong or placeholder data

### Requirement: Partial pipelines compose without error
The system SHALL treat missing sources as the normal case: any source with no
record for the product (and quarter, where applicable) SHALL be omitted from
the composed body — no empty sections, no placeholders in the copy-out text —
and composition SHALL succeed whenever at least the product exists.

#### Scenario: Early-quarter pipeline with only OKR and OST
- **WHEN** only an OKR record and an OST tree exist for the active product
  and quarter and the visitor composes a draft
- **THEN** the draft contains the OKR and discovery sections plus the
  asks/next-steps prompt, and contains no cadence or adoption section

#### Scenario: Nothing exists yet
- **WHEN** no sibling-tool records exist for the active product and the
  visitor composes a draft
- **THEN** a draft is still created with the headline and asks/next-steps
  prompt, and the coverage panel shows all four sources as missing

### Requirement: Source coverage is visible without blocking
The system SHALL display a coverage panel listing the four sources (OKR,
discovery, cadence, adoption) with found/missing state for the selected
product and quarter, and each missing source SHALL name the tool that
produces it. The panel SHALL never prevent composing, editing, or copying.

#### Scenario: Missing source points to its tool
- **WHEN** no cadence record exists for the selected product and quarter
- **THEN** the coverage panel marks cadence as missing and references the
  Cadence & Reflection Kit as the tool that fills it, while composing remains
  available

### Requirement: Drafts persist per the pipeline data contract
The system SHALL persist drafts as `upd`-prefixed records extending
`ToolRecordBase` with `quarter: QuarterRef`, `title`, `body`, `sources`, and
`composedAt`, via `createToolStore` under `pm-update-v1` with the per-product
active pointer under `pm-update-v1-active`. The visitor SHALL be able to
create, switch between, edit, and delete drafts for the active product, and
all data SHALL remain in localStorage.

#### Scenario: Draft survives reload
- **WHEN** a visitor composes a draft, edits its body, and reloads the page
- **THEN** the same draft is restored as the active draft for that product
  with the edited body intact

#### Scenario: Drafts are scoped to their product
- **WHEN** drafts exist for two different products and the visitor switches
  the active product
- **THEN** only the drafts whose `productId` matches the active product are
  listed

### Requirement: The body is a human-owned editable text
The system SHALL present the composed body as freely editable plain
text/markdown, and recomposing from sources SHALL be an explicit action that
requires confirmation before overwriting the body. The system SHALL warn when
the body has been edited since the last compose (`updatedAt` newer than
`composedAt`).

#### Scenario: Recompose asks before overwriting edits
- **WHEN** a visitor has edited the draft body and triggers "recompose from
  sources"
- **THEN** the system asks for confirmation, and only replaces the body after
  the visitor confirms

### Requirement: Output leaves only via copy
The system SHALL offer copy-to-clipboard of the draft body as plain text,
with a manual-selection fallback when the Clipboard API is unavailable, and
SHALL NOT integrate with email, Slack, webhooks, or any external API — no
network request SHALL carry draft or source data.

#### Scenario: Copy to clipboard
- **WHEN** the visitor activates the copy action in a browser with clipboard
  permission
- **THEN** the full draft body is placed on the clipboard as plain text and
  the UI confirms the copy

#### Scenario: Clipboard API unavailable
- **WHEN** `navigator.clipboard` is unavailable or the write is rejected
- **THEN** the draft text is selected/selectable with an instruction to copy
  manually, and no error breaks the page

### Requirement: Sibling stores are read-only to this tool
The system SHALL read sibling-tool data using only contract-level record
fields (per data-contract D8) and SHALL NOT write to any storage key other
than `pm-update-v1`, `pm-update-v1-active`, and the shared product keys via
the contract module's own functions.

#### Scenario: Composing mutates no sibling store
- **WHEN** a visitor composes, edits, and copies a draft
- **THEN** the stored contents of `pm-okr-v1`, `pm-checkin-v1`,
  `pm-cadence-v1`, and `ost-trees-v1` are byte-identical to their state
  before the actions

### Requirement: OST source is picked with a drift-safe snapshot
The system SHALL default the discovery source to the OST builder's standalone
active tree (else the most recently updated tree, else none), SHALL let the
visitor choose a different tree, and SHALL store `ostRecordId` plus a text
snapshot in the draft's `sources` at compose time. On load, the system SHALL
re-resolve the id and show a "source changed/removed" indicator when the tree
is deleted or its outcome no longer matches the snapshot, without altering
the draft body.

#### Scenario: Referenced tree deleted after compose
- **WHEN** the OST tree referenced by a draft's `sources` is deleted and the
  draft is reopened
- **THEN** the coverage panel shows the discovery source with a
  changed/removed indicator, the snapshot text remains available, and the
  draft body is unchanged
