# okr-check-in Specification

Stage 06 (Feedback & Adoption) of the Donut CRM pipeline: the quarter-close
check-in tool at `/tools/okr-check-in/`. localStorage only; built on the
`pipeline-data-contract` capability (`createToolStore`, `QuarterRef`,
`OkrKeyResultRef`). This is the loop-closing stage: its output is a draft OKR
entry for the next quarter, written back into OKR Organizer's store.

## ADDED Requirements

### Requirement: Check-in records persist per product, quarter, and OKR entry
The system SHALL persist check-in records via
`createToolStore({ storageKey: "pm-checkin-v1", idPrefix: "chk" })`, each
record carrying `productId`, a `quarter: QuarterRef`, the `okrId` of the OKR
Organizer entry being closed, an objective text snapshot, and one entry per
key result holding an `OkrKeyResultRef` plus a text snapshot of the key
result. The system SHALL maintain at most one check-in record per
(okrId, quarter) pair, and data MUST never leave the browser.

#### Scenario: Picking an OKR seeds one entry per key result
- **WHEN** the visitor selects an OKR entry with three key results to check in
- **THEN** a check-in record is created for that OKR's quarter with three
  entries, each storing the key result's `OkrKeyResultRef` and its
  who/doesWhat/byHowMuch text snapshot

#### Scenario: Re-picking an already-closed OKR reopens the existing record
- **WHEN** the visitor selects an OKR entry that already has a check-in record
  for the same quarter
- **THEN** the existing record is opened and no duplicate record is created

#### Scenario: Prior quarters remain listable
- **WHEN** check-in records exist for 2026-Q1 and 2026-Q2 for the active
  product
- **THEN** the switcher lists both in chronological quarter order and either
  can be reopened

### Requirement: Quarter-close logging per key result
The system SHALL let the visitor record, per key result entry, an actual
outcome number (nullable until logged), a confidence flag with exactly the
values `solid`, `noisy`, or `contested`, and a free-text reflection, and SHALL
persist edits to these fields immediately.

#### Scenario: Logging an outcome with low confidence
- **WHEN** the visitor enters an actual of 38, flags the entry `contested`,
  and writes a reflection
- **THEN** all three values persist, survive a page reload, and the entry
  displays the confidence flag alongside the actual

#### Scenario: Close-out works without prior snapshots
- **WHEN** an entry has no mid-quarter snapshots logged
- **THEN** the actual, confidence, and reflection fields still accept and
  persist input

### Requirement: Mid-quarter metric snapshots with trend readout
The system SHALL let the visitor log multiple timestamped metric snapshots
(value, timestamp, optional note) per key result entry at any point in the
quarter, and SHALL render the snapshot series with a trend readout that
distinguishes at minimum: not enough points (fewer than two), a trend that is
holding at close, and an early spike that faded. The trend verdict MUST be
computed at render time, not persisted.

#### Scenario: Launch-week spike that faded is flagged
- **WHEN** an entry has snapshots of 10 (early), 60 (launch week), and 22
  (close)
- **THEN** the trend readout marks the entry as a spike that faded rather than
  sustained movement

#### Scenario: Sustained movement reads as holding
- **WHEN** an entry has snapshots of 10, 25, and 41 in chronological order
- **THEN** the trend readout marks the trend as holding

#### Scenario: Single snapshot yields no verdict
- **WHEN** an entry has exactly one snapshot
- **THEN** the readout states there are not enough points and renders no
  spike/holding verdict

### Requirement: Next-quarter draft handoff into OKR Organizer's store
The system SHALL provide a draft action that creates a new OKR record through
OKR Organizer's store (`pm-okr-v1`) with `quarter` equal to
`nextQuarter(checkIn.quarter)`, the same `productId` and tag, the objective
carried over, and one key result per included entry — each with a freshly
generated `kr` id, who/doesWhat carried over, and byHowMuch pre-filled from
the logged actual as the new baseline. The created record SHALL carry
`draft: true` and `draftedFrom` provenance per the pipeline-data-contract, and
its id SHALL be stored on the check-in record as `draftedOkrId`. Entries
flagged `solid` with a logged actual SHALL be included by default; the visitor
SHALL be able to include or exclude any entry before drafting. The system MUST
NOT modify the source quarter's OKR record.

#### Scenario: Drafting from a Q3 check-in creates a Q4 draft
- **WHEN** the visitor drafts from a 2026-Q3 check-in with two included
  entries
- **THEN** a new OKR record exists in OKR Organizer's store for 2026-Q4 with
  `draft: true`, two key results with new `kr` ids, and the check-in stores
  its id as `draftedOkrId` — and the 2026-Q3 OKR record is byte-identical to
  before

#### Scenario: Re-drafting updates the existing draft instead of duplicating
- **WHEN** the visitor triggers the draft action again while `draftedOkrId`
  resolves to a record still marked `draft: true`
- **THEN** that record's key results are rewritten in place and no second
  next-quarter record is created

#### Scenario: Accepted or deleted drafts are not overwritten
- **WHEN** the previously drafted record no longer resolves, or resolves with
  `draft` cleared
- **THEN** the draft action creates a new draft record and never modifies the
  accepted entry

### Requirement: Stale OKR references degrade with snapshots
The system SHALL re-resolve each entry's `OkrKeyResultRef` against OKR
Organizer's store on load, rendering live text when found and the stored
snapshot with a visible source-changed/removed indicator when the key result
or OKR entry is missing or its text no longer matches. Logged check-in data
MUST be preserved regardless, and deletions MUST NOT cascade. The system SHALL
offer an explicit sync action that appends entries for key results added to
the OKR after check-in creation, and that action MUST NOT remove existing
entries.

#### Scenario: Key result deleted after check-in created
- **WHEN** a key result referenced by an entry is deleted from the OKR entry
- **THEN** the entry renders its stored snapshot text with a source-removed
  badge and its logged actual, confidence, reflection, and snapshots remain
  intact

#### Scenario: Key result added after check-in created
- **WHEN** the visitor runs the sync action after a fourth key result was
  added to the OKR
- **THEN** a fourth entry is appended and the three existing entries are
  unchanged

### Requirement: Standalone tool page with active-product resolution
The system SHALL serve the tool at `/tools/okr-check-in/` as a static Astro
page hosting a React island that resolves the active product via
`resolveActiveProduct()`, states that data stays in the browser, and when the
active product has no OKR entries SHALL show an empty state linking to the
OKR Organizer tool instead of an unusable form.

#### Scenario: No OKR entries yet
- **WHEN** the page loads for a product with no records in OKR Organizer's
  store
- **THEN** the island explains that a check-in closes an OKR and links to
  `/tools/okr-organizer/`, and no key-result form is rendered

#### Scenario: First visit boots into the running case
- **WHEN** the page loads with empty localStorage
- **THEN** the "Donut CRM" sample product is seeded and shown as the active
  product
