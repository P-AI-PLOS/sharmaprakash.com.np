# backlog-prioritizer Specification

## Purpose
TBD - created by archiving change backlog-prioritizer-tool. Update Purpose after archive.
## Requirements
### Requirement: Plot slicer stories on the Agreement/Certainty matrix
The tool SHALL let the visitor add stories from the Vertical Slicer store for
the active product as `StoryRef`s with a `storyTitle` snapshot, and place each
one on a 2x2 matrix whose axes are stakeholder agreement (low to high) and
cause-and-effect certainty (low to high), storing continuous 0–100 positions
per axis. Stories SHALL be repositionable after placement. Data MUST never
leave the browser.

#### Scenario: Adding a story from the picker
- **WHEN** the visitor selects an unplotted Vertical Slicer story and places
  it on the matrix
- **THEN** the board persists an item carrying `StoryRef { storyId, specId }`,
  the story title snapshot, and the chosen agreement/certainty positions

#### Scenario: No stories exist upstream
- **WHEN** the Vertical Slicer store has no stories for the active product
  (or its module has not shipped)
- **THEN** the tool still loads, and the story picker shows an empty state
  linking to the Vertical Slicer tool instead of erroring

#### Scenario: Source story deleted or reworded
- **WHEN** a plotted item's `storyId` no longer resolves in the slicer store,
  or the resolved title differs from the snapshot
- **THEN** the item stays on the board rendering its snapshot title with a
  visible "source changed/removed" badge, and is never auto-deleted

### Requirement: Stacey zone derivation with matching response modes
The tool SHALL derive each item's zone from its axis positions using the 2021
post's framework — Simple (high agreement, high certainty: execute),
Complicated (one axis high, one low: bring in the expert), Complex (both low:
probe or kill), Chaotic (the extreme low/low corner: stabilize first) — and
SHALL display the zone and its response mode on the item. Zones MUST be
derived, never directly assigned by the visitor.

#### Scenario: High/high placement reads as Simple
- **WHEN** an item is placed with both agreement and certainty in the high
  half of their axes
- **THEN** it is classified Simple and labeled with the execute response mode

#### Scenario: Extreme corner reads as Chaotic, not Complex
- **WHEN** an item is placed with both axes at the extreme low corner (at or
  below the chaotic threshold)
- **THEN** it is classified Chaotic with the "stabilize first, analyze after"
  response mode, not merely Complex

#### Scenario: Moving a dot re-derives the zone
- **WHEN** the visitor drags an item from the low/low region into the
  high/high region
- **THEN** its zone updates from Complex to Simple with no separate
  re-labeling step

### Requirement: Complex and Chaotic items require explicit disposition
The tool SHALL exclude Complex and Chaotic items from the ranked priority list
and place them in a prominent decision queue until the visitor records an
explicit disposition — probe, kill, or defer (Chaotic items SHALL NOT offer
probe). Killed and deferred items SHALL be retained on the record in collapsed
sections, not deleted. Low-agreement/low-certainty stories MUST never be
silently sorted to the bottom of the ranked list.

#### Scenario: Complex item lands in the queue, not the list
- **WHEN** an item is classified Complex and has no disposition
- **THEN** it appears in the decision queue and is absent from the ranked
  priority list

#### Scenario: Recording a kill
- **WHEN** the visitor marks a queued item as killed, optionally with a note
- **THEN** the item leaves the queue, appears in a collapsed "Killed" section
  with its note, remains in the persisted record, and stays out of the ranked
  order

#### Scenario: Recording a probe
- **WHEN** the visitor marks a Complex item as probe
- **THEN** it appears in a distinct "Probing — not committed" section of the
  output rather than being interleaved with ranked Simple/Complicated items

### Requirement: OKR key-result linkage and filtering
The tool SHALL let the visitor link each item to key results of the active
quarter's OKR entries via `OkrKeyResultRef` (with display-text snapshots),
SHALL support filtering the board by a selected key result, and SHALL badge
items with zero key-result links as off-strategy. When no OKR data exists for
the product and quarter, linkage UI SHALL degrade to an empty state pointing
to the OKR Organizer.

#### Scenario: Linking an item to a key result
- **WHEN** the visitor links a plotted item to a key result from the board's
  quarter
- **THEN** the item persists `OkrKeyResultRef { okrId, keyResultId }` plus a
  text snapshot, and displays the linked key result

#### Scenario: Filtering by key result
- **WHEN** the visitor selects a key result in the filter
- **THEN** only items linked to that key result remain highlighted/visible on
  the matrix and in the list views

#### Scenario: Off-strategy badge
- **WHEN** an item has no `OkrKeyResultRef` links
- **THEN** it carries a visible off-strategy badge in both the matrix and the
  priority list

### Requirement: Ordered priority list per quarter with export
The tool SHALL maintain one board per (product, quarter) — a `BacklogRecord`
carrying `quarter: QuarterRef` — with a quarter switcher that opens or creates
the board for the chosen quarter, and SHALL render a computed ranked list of
Simple and Complicated items ordered by zone (Simple first), then key-result
linkage count, then combined agreement+certainty. The list, including probing
and killed sections, SHALL be exportable as Markdown.

#### Scenario: Ranked order composition
- **WHEN** a board holds a Simple item with one KR link, a Complicated item
  with two KR links, and a dispositionless Complex item
- **THEN** the ranked list shows the Simple item first, the Complicated item
  second, and the Complex item only in the decision queue

#### Scenario: Switching quarters
- **WHEN** the visitor switches from the current quarter to the next one for
  the first time
- **THEN** a new empty board is created for that product and quarter, and
  switching back restores the prior board unchanged

#### Scenario: Markdown export
- **WHEN** the visitor exports the board
- **THEN** the Markdown contains the quarter key (e.g. "2026-Q3"), the ranked
  list with zones and off-strategy badges, and the probing/killed/deferred
  sections with their notes

### Requirement: Persistence per the pipeline data contract
The tool SHALL persist via `createToolStore<BacklogRecord>` under storage key
`pm-backlog-v1` with active pointer `pm-backlog-v1-active`, records extending
`ToolRecordBase` with `productId` from `resolveActiveProduct()`, and SHALL
degrade silently when localStorage is unavailable (session-only, no errors
surfaced). Deleting upstream products, specs, stories, or OKRs SHALL NOT
cascade into backlog records.

#### Scenario: Records scoped to the active product
- **WHEN** boards exist for two products and the active product changes
- **THEN** the tool shows only the active product's boards, and the other
  product's boards are untouched

#### Scenario: Private mode
- **WHEN** localStorage writes throw
- **THEN** plotting, queueing, and export keep working in-memory for the
  session without visible errors

### Requirement: Standalone tool page
The tool SHALL ship at route `/tools/backlog-prioritizer/` as a static Astro
page rendering one `client:load` React island inside `SiteShell`, styled
exclusively with the site's token system, introducing the Agreement-Certainty
method and linking the 2021 backlog-triage post. Existing routes MUST NOT
change.

#### Scenario: Page loads without upstream data
- **WHEN** a first-time visitor with empty localStorage opens
  `/tools/backlog-prioritizer/`
- **THEN** the page renders with the seeded "Donut CRM" active product, an
  empty matrix, empty-state links to the upstream tools, and a link to the
  2021 Agreement-Certainty backlog-triage post

