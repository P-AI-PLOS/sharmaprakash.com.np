# okr-organizer Specification

## Purpose
TBD - created by archiving change okr-organizer-tool. Update Purpose after archive.
## Requirements
### Requirement: OKR entries persist per the pipeline data contract
The system SHALL persist OKR entries in localStorage under `pm-okr-v1` (active
pointer `pm-okr-v1-active`) via the shared `createToolStore` factory, where
each record extends `ToolRecordBase` and carries `quarter: QuarterRef`,
`objective`, `keyResults`, and `tag: { kind: "department" | "product", label }`.
Records MUST carry the active product's id as `productId`, and no data SHALL
leave the browser.

#### Scenario: Entry saved for the active product
- **WHEN** a visitor saves an OKR entry
- **THEN** the record is stored under `pm-okr-v1` with `productId` equal to
  the id returned by `resolveActiveProduct()`, and it survives a page reload

#### Scenario: Storage unavailable degrades silently
- **WHEN** localStorage writes throw (private mode or quota exceeded)
- **THEN** the tool remains usable in-memory for the session without throwing

### Requirement: Key results use the who / does-what / by-how-much form
The system SHALL capture each key result as three separate fields — who
(the population whose behavior changes), does what (an observable behavior
change), and by how much (a measured amount) — rather than one free-text key
result field. An entry MUST have between one and five key results, and the
objective field MUST be non-empty to save.

#### Scenario: KR entered as three parts
- **WHEN** a visitor adds a key result
- **THEN** the form presents distinct "Who", "Does what", and "By how much"
  inputs, and the saved record stores them as separate `who`, `doesWhat`,
  and `byHowMuch` values

#### Scenario: KR count is bounded
- **WHEN** an entry already has five key results
- **THEN** the "Add key result" action is unavailable

#### Scenario: Empty objective cannot save
- **WHEN** a visitor attempts to save an entry with a blank objective
- **THEN** the save is rejected with inline guidance and nothing is persisted

### Requirement: Key results carry stable referenceable ids
The system SHALL assign every key result a `uid("kr")` id at the moment its
row is created, and each entry a `uid("okr")` id, such that the pair is
addressable by downstream tools as `OkrKeyResultRef` (`{ okrId, keyResultId }`).
Ids MUST survive edits and reorders and MUST never be array indexes.

#### Scenario: KR id survives editing
- **WHEN** a visitor rewords a key result's fields or reorders key results
  within an entry and saves
- **THEN** each key result retains the same `kr` id it was created with

#### Scenario: New KR gets a fresh id
- **WHEN** a visitor adds a new key result row
- **THEN** it is assigned a new `uid("kr")` id distinct from all existing ids
  in the entry

### Requirement: Entries are scoped to one quarter with browsable history
The system SHALL scope entry creation to a single selected quarter
(represented as `QuarterRef`, defaulting to `currentQuarter()`), and SHALL
present a quarter-over-quarter history that groups the active product's
entries by `quarterKey` ordered by `compareQuarters`, so a visitor can see how
OKRs evolved across quarters.

#### Scenario: New entry stamps the selected quarter
- **WHEN** a visitor selects a quarter and creates an entry
- **THEN** the saved record's `quarter` equals the selected `QuarterRef`

#### Scenario: History groups by quarter
- **WHEN** the active product has entries across multiple quarters
- **THEN** the history view shows one group per quarter, ordered most recent
  quarter first, each listing that quarter's objectives with their tag and
  key-result count

#### Scenario: Empty quarter is honest
- **WHEN** the selected quarter has no entries
- **THEN** the tool shows an empty state inviting the visitor to write the
  quarter's first objective, not a blank screen

### Requirement: Entries are tagged to a department or product
The system SHALL require each entry to carry a tag of kind `department` or
`product` with a visitor-supplied label, and SHALL display the tag wherever
the entry is listed.

#### Scenario: Tag captured on save
- **WHEN** a visitor saves an entry tagged "Growth" as a department
- **THEN** the record stores `tag: { kind: "department", label: "Growth" }`
  and the entry's list row shows the tag

### Requirement: Format-choice framing precedes first entry
The system SHALL surface, before the visitor's first OKR entry, a dismissible
framing step contrasting an OKR with a Rock (a must-finish deliverable) and a
bare North Star metric (a single always-on number), each with guidance on when
to choose it. The framing step MUST NOT block access to the entry form, its
dismissal SHALL persist across visits, and the visitor SHALL be able to reopen
it on demand.

#### Scenario: First run shows the framing
- **WHEN** a visitor opens the tool with no prior dismissal recorded
- **THEN** the OKR-vs-Rock-vs-North-Star framing is visible above the entry
  form, and the entry form is still reachable without interacting with it

#### Scenario: Dismissal persists
- **WHEN** a visitor dismisses the framing and reloads the page
- **THEN** the framing does not reappear, and a control to reopen it remains
  available

### Requirement: Standalone tool page
The system SHALL serve the tool at `/tools/okr-organizer/` as a static Astro
page using the site shell, with the organizer as a React island, following the
existing `/tools/opportunity-solution-tree/` page pattern. The page MUST state
that data stays in the visitor's browser.

#### Scenario: Page renders statically
- **WHEN** the site is built
- **THEN** `dist/` contains the `/tools/okr-organizer/` page and the build
  introduces no server-side runtime

#### Scenario: Privacy statement present
- **WHEN** a visitor views the page
- **THEN** copy states that OKRs are saved in the browser and sent nowhere

