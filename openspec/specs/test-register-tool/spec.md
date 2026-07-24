# test-register-tool Specification

## Purpose
TBD - created by archiving change donut-crm-test-register. Update Purpose after archive.
## Requirements
### Requirement: Scenario records anchored to stories and acceptance criteria
The system SHALL persist test scenario records via the pipeline data
contract's store factory (storage key `pm-testreg-v1`, id prefix `test`,
records extending `ToolRecordBase`), each carrying a description, an
automation status (`not-automated`, `ai-drafted`, or `human-reviewed`), an
optional Playwright spec-file path, and at least one link — a `StoryRef`
and/or an `AcceptanceCriterionRef` — where every link stores a text snapshot
of the referenced story or criterion taken at link time. The system MUST NOT
allow saving a scenario with zero links, and scenario data MUST never leave
the browser.

#### Scenario: Create a scenario against an acceptance criterion
- **WHEN** a visitor creates a scenario linked to a Spec Builder acceptance
  criterion and enters a spec path
- **THEN** the stored record has a `test`-prefixed id, the active product's
  `productId`, the `AcceptanceCriterionRef`, a snapshot of the criterion's
  current text, and survives a page reload

#### Scenario: Link-less save is rejected
- **WHEN** a visitor attempts to save a scenario with no story link and no
  criterion link
- **THEN** the editor blocks the save and explains that a scenario must
  verify at least one story or acceptance criterion

#### Scenario: Sibling tools have no data yet
- **WHEN** the register opens and the Spec Builder and Vertical Slicer stores
  hold no records for the active product
- **THEN** the scenario editor shows a guided empty state linking to those
  tools instead of empty pickers, and the register remains usable for
  browsing existing scenarios

### Requirement: Staleness derived from snapshot drift, never persisted as fresh
The system SHALL re-resolve every scenario link against the source stores on
load and derive a stale state when any linked story or criterion no longer
exists or its current text differs (whitespace-trimmed) from the stored
snapshot. A stale scenario SHALL display as "stale — spec may need AI
regeneration", overriding its stored automation status everywhere the status
appears. The stale state MUST be computed, not stored, and the system MUST
NOT silently substitute current source text for the snapshot.

#### Scenario: Referenced criterion reworded after linking
- **WHEN** a Spec Builder acceptance criterion is edited after a
  `human-reviewed` scenario linked to it
- **THEN** on next load the scenario shows the stale status in the register
  list, with the snapshot and the current criterion text both visible

#### Scenario: Referenced story deleted
- **WHEN** a Vertical Slicer story linked by a scenario no longer resolves
- **THEN** the scenario shows the stale status, renders the stored story
  snapshot with a source-removed indicator, and the scenario record is not
  deleted

#### Scenario: Untouched sources stay current
- **WHEN** all of a scenario's linked stories and criteria still resolve with
  text matching their snapshots
- **THEN** the scenario displays its stored automation status with no stale
  indicator

### Requirement: Regeneration lifecycle resets human review
The system SHALL provide a "mark regenerated" action on stale scenarios that
re-snapshots every changed link to the source's current text and sets the
automation status to `ai-drafted`, regardless of the previous status. Links
whose source was removed SHALL NOT be re-baselined by this action; the system
SHALL instead offer to unlink them, and removing the last link SHALL require
the visitor to add another link or delete the scenario. The system SHALL also
provide a "mark reviewed" action promoting an `ai-drafted`, non-stale
scenario to `human-reviewed`.

#### Scenario: Regenerating demotes a reviewed scenario
- **WHEN** "mark regenerated" is applied to a stale scenario that was
  `human-reviewed`
- **THEN** its changed links' snapshots equal the current source text, the
  stale indicator clears, and its status is `ai-drafted`

#### Scenario: Removed source cannot be re-baselined
- **WHEN** "mark regenerated" is applied to a scenario whose only drift is a
  deleted story
- **THEN** that link is not re-snapshotted; the visitor is offered unlink,
  and if it is the scenario's last link the unlink completes only alongside
  adding another link or deleting the scenario

#### Scenario: Human review gate
- **WHEN** "mark reviewed" is applied to a non-stale `ai-drafted` scenario
- **THEN** its status becomes `human-reviewed`; the action is unavailable on
  stale scenarios

### Requirement: Coverage rollup as a gap list per spec
The system SHALL provide a coverage view grouped by spec that lists, for each
spec's acceptance criteria and for each spec's sliced stories: items with no
linked scenarios ("uncovered"), items whose only linked scenarios are stale
("covered by stale tests"), and the fraction of items having at least one
non-stale scenario. A scenario SHALL count toward coverage only when it is
itself non-stale. The gap lists SHALL be the primary presentation; fractions
are secondary captions.

#### Scenario: Uncovered criterion surfaces in the gap list
- **WHEN** a spec has three acceptance criteria and only two have any linked
  scenario
- **THEN** the third appears under "uncovered" for that spec and the criteria
  fraction reflects at most 2/3

#### Scenario: Stale-only coverage is called out, not counted
- **WHEN** a story's only linked scenario is stale
- **THEN** the story appears under "covered by stale tests", distinct from
  "uncovered", and does not count in the non-stale fraction

#### Scenario: Orphaned scenarios grouped after spec removal
- **WHEN** a spec referenced by scenarios has been deleted
- **THEN** those scenarios appear in a trailing "source removed" group using
  their stored spec-title snapshots, and no error is raised

### Requirement: Standalone tool page in the site's tool pattern
The system SHALL serve the register at `/tools/test-register/` as a static
page using `SiteShell` with one `client:load` React island under
`src/components/tools/test-register/`, scoped to the contract's active
product via `resolveActiveProduct()`. The page SHALL carry substantive
teaching content on running a test register when AI drafts and regenerates
test code — including the status lifecycle, the regeneration-resets-review
rule, and Playwright spec-path conventions — and SHALL use existing design
tokens and motion primitives with `prefers-reduced-motion` respected. The
tool SHALL only read Spec Builder and Vertical Slicer stores and MUST NOT
mutate their records.

#### Scenario: Page boots into the running case
- **WHEN** a first-time visitor opens `/tools/test-register/`
- **THEN** the island resolves (seeding if needed) the active "Donut CRM"
  product, shows an empty register with guidance, and the static build of the
  page contains the teaching content

#### Scenario: Read-only toward sibling stores
- **WHEN** any register interaction completes (create, edit, regenerate,
  unlink, delete)
- **THEN** the localStorage entries for `pm-spec-v1` and `pm-slice-v1` are
  byte-identical to their values before the interaction

