# cadence-reflection-kit Specification

Stage 05 (Delivery Cadence) tool of the Donut CRM pipeline: method-agnostic
cadence tracking, a one-action retro log, and an OKR-linked demo-day checklist.
Served at `/tools/cadence-reflection-kit/`, persisted per product and quarter
in localStorage per the `pipeline-data-contract` capability.

## ADDED Requirements

### Requirement: Quarter-scoped cadence record on the shared contract
The system SHALL persist one cadence record per product per quarter via the
shared tool-store factory, using storage key `pm-cadence-v1` (active pointer
`pm-cadence-v1-active`) and id prefix `cad`. Records SHALL extend
`ToolRecordBase` and carry `quarter: QuarterRef`; the tool SHALL resolve the
active product's current-quarter record on load, creating an empty one if
none exists. Data MUST never leave the browser.

#### Scenario: First visit creates the current quarter's record
- **WHEN** the tool loads for the active product and no cadence record exists
  for `currentQuarter()`
- **THEN** a record with `productId`, the current `QuarterRef`, `mode: null`,
  and empty periods/retros/demos is created and shown

#### Scenario: Past quarters are readable history
- **WHEN** cadence records exist for earlier quarters of the same product
- **THEN** the visitor can browse them in `compareQuarters` order as read-only
  history while only the current quarter's record is editable

### Requirement: Cadence mode must be chosen before any tracking UI
The system SHALL require the visitor to choose a cadence mode — `sprint`,
`flow`, or `scrumban` — before rendering any metric, retro, or demo tracking
UI. The mode picker SHALL first name the job (turn a backlog into shipped
work, on a rhythm, with a reflection loop) and SHALL present the three modes
as peer choices with none pre-selected; Sprint MUST NOT be presented as a
default.

#### Scenario: Unset mode shows only the picker
- **WHEN** the current quarter's record has `mode: null`
- **THEN** the page renders the job statement and the three mode cards, and no
  metrics panel, retro log, or demo checklist is rendered

#### Scenario: Choosing a mode unlocks the kit
- **WHEN** the visitor selects one of the three modes
- **THEN** the record's `mode` is persisted and the metrics panel, retro log,
  and demo checklist render for that mode

### Requirement: Mode-specific metric tracking
The system SHALL track hand-entered metrics per period, and the set of metric
inputs and summaries SHALL differ by mode: `sprint` records committed vs
completed per iteration with a rolling-velocity summary; `flow` records a WIP
limit, observed WIP, and cycle times per period with a cycle-time summary and
a visible WIP-limit-breach indicator; `scrumban` records the flow metrics plus
a per-period planning-cadence-held check. The system MUST NOT render a single
generic dashboard showing all modes' metrics at once.

#### Scenario: Sprint mode shows velocity, not flow metrics
- **WHEN** the mode is `sprint`
- **THEN** the metrics panel offers committed/completed inputs per iteration
  and a velocity summary, and shows no WIP or cycle-time inputs

#### Scenario: Flow mode flags a WIP breach
- **WHEN** the mode is `flow` and a period's observed WIP exceeds its WIP limit
- **THEN** that period is visibly flagged as over its WIP limit

#### Scenario: Scrumban adds the planning heartbeat to flow tracking
- **WHEN** the mode is `scrumban`
- **THEN** the metrics panel shows the flow inputs plus a "planning session
  held?" check per period, and shows no committed/completed point inputs

#### Scenario: Switching mode preserves entered data
- **WHEN** the visitor switches the current quarter's mode after periods have
  been entered
- **THEN** previously entered period data is retained (not deleted), the panel
  re-renders for the new mode, and a note indicates earlier periods were
  tracked under a different mode

### Requirement: One-action retro log
The system SHALL keep a running log of retro entries for the quarter, each
holding what went well, what didn't, and exactly one committed action with a
status of `open`, `done`, or `carried-over`. The entry form SHALL accept only
a single action, and when the most recent entry's action is still `open`, the
new-entry flow SHALL surface it and offer marking it done or carrying it over
into the new entry.

#### Scenario: A retro entry commits to one action
- **WHEN** the visitor saves a retro entry
- **THEN** the entry is stored with a single action string and status `open`,
  and the form offers no way to attach additional actions

#### Scenario: Open action surfaces at the next retro
- **WHEN** a new retro entry is started while the previous entry's action is
  `open`
- **THEN** the previous action is shown with "mark done" and "carry over"
  options, and carrying over sets the old entry to `carried-over` and prefills
  the new entry's action

### Requirement: Demo-day checklist tied to key results
The system SHALL let the visitor log demo items where the first question is
which key result the demo moves, stored as an `OkrKeyResultRef` plus a text
snapshot taken at link time, alongside a description and a done flag. Key
result options SHALL come from the OKR Organizer's store for the active
product; if no OKR data exists the item MAY store a null reference but MUST
render a visible "not tied to a key result" marker and point the visitor to
the OKR Organizer tool.

#### Scenario: Demo item links a key result
- **WHEN** the visitor adds a demo item and picks a key result
- **THEN** the item stores the `OkrKeyResultRef` and the key result's text
  snapshot, and renders the key result alongside the demo description

#### Scenario: No OKR data exists yet
- **WHEN** the active product has no OKR records
- **THEN** the demo form still works, stores the item with a null key-result
  reference, marks it visibly as not tied to a key result, and links to the
  OKR Organizer tool

### Requirement: Stale key-result references degrade per the contract rule
The system SHALL re-resolve each demo item's `OkrKeyResultRef` against the OKR
Organizer store on load and, when the key result is missing or its text no
longer matches the stored snapshot, SHALL render the snapshot with a visible
"source changed/removed" badge. Deleting OKR data MUST NOT delete or block
demo items.

#### Scenario: Linked key result deleted
- **WHEN** a demo item's referenced key result no longer resolves
- **THEN** the item renders its stored snapshot text with a source-removed
  badge and remains editable and completable

### Requirement: Cadence mode is readable by sibling tools
The system SHALL expose the active cadence mode through the public store
module (`src/utils/cadence-store.ts` exporting `CadenceMode` and
`CadenceRecord`), such that another tool can determine the current quarter's
mode for a product via `listForProduct` without importing any UI component.

#### Scenario: Sibling tool reads the current mode
- **WHEN** another module lists cadence records for a product and matches the
  current quarter
- **THEN** it obtains the record's `mode` using only exports of the store
  module and the shared contract helpers
