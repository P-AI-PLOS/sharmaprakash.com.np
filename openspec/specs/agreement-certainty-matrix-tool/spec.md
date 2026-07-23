# agreement-certainty-matrix-tool Specification

## Purpose
TBD - created by archiving change agreement-certainty-matrix-tool. Update Purpose after archive.
## Requirements
### Requirement: 2×2 grid renders both axes, not a flat list
The system SHALL render the Agreement-Certainty Matrix as a 2×2 grid with
both axes (agreement, certainty) visibly labeled, mapping the four zones —
Simple, Complicated, Complex, Chaotic — to their correct grid position (each
zone's position determined by high/low agreement crossed with high/low
certainty), in both curated and freeform mode.

#### Scenario: Zones occupy the correct quadrant
- **WHEN** the matrix component renders
- **THEN** Simple and Complicated share the high-certainty row, Complex and
  Chaotic share the low-certainty row, and Simple/Complex share the
  high/low-agreement column consistent with Complicated/Chaotic on the
  other column

> **Implementation note (lane-matrix, gen 2).** This scenario's wording is
> internally inconsistent with the zone definitions it depends on. Per the
> help modal's content table (the same table the four source posts use),
> Simple = high agreement / high certainty, Complicated = high agreement /
> low certainty, Complex = low agreement / low certainty, Chaotic = low
> agreement / low certainty (urgent). So Complex is low on *both* axes: it
> cannot share a "high-agreement column" with Simple, and no strict 2×2
> column claim can be true for the bottom row, because Complex and Chaotic
> are both low-certainty.
>
> The implementation therefore follows the posts + help modal rather than
> this scenario's column wording: **rows are the agreement axis** (high on
> top), certainty is labeled as splitting the **top row only**, and every
> zone cell prints its own reading via `zoneAxes()` — sourced from the same
> `CONTENT` table the modal renders — so grid, legend, and modal cannot
> drift. A follow-up should reword this scenario to match.
>
> Related: the flaky-tests post's on-screen prose ("Simple, bottom-right" /
> "Complicated, upper-left") describes that workshop's physical whiteboard
> and is diagonal — it cannot be reconciled with the modal's badges by any
> 4-cell orientation. The per-cell badges are the mitigation; the post prose
> is deliberately left untouched.

### Requirement: Curated mode scores placements with immediate reveal
In `curated` mode, the system SHALL accept a fixed list of items, each
carrying a `text`, an optional correct `zone`, and either a `why` (for scored
items) or a `contested: true` flag (for items the source content explicitly
describes as having no single agreed placement). Selecting a zone for a
scored item SHALL immediately reveal whether the placement matches the
item's `zone` plus its `why` text. Selecting a zone for a `contested` item
SHALL reveal debate/context text without marking the placement right or
wrong.

#### Scenario: Correct placement reveals the reasoning
- **WHEN** the visitor places a scored item in its designated zone
- **THEN** the reveal marks it correct and shows the item's `why` text

#### Scenario: Incorrect placement still reveals the reasoning
- **WHEN** the visitor places a scored item in a zone other than its
  designated zone
- **THEN** the reveal marks it incorrect, names the correct zone, and shows
  the item's `why` text

#### Scenario: Contested item never marked right or wrong
- **WHEN** the visitor places an item flagged `contested: true` in any zone
- **THEN** the reveal shows the item's debate/context text and does not mark
  the placement correct or incorrect, and the item is excluded from any
  scored-item tally

### Requirement: Freeform mode persists a visitor's own board with no answer key
In `freeform` mode, the system SHALL let the visitor add items with free
text, place each item into one of the four zones, re-place or delete any
item at any time, and SHALL persist the board to localStorage only, with no
correctness judgment — the reveal after placement SHALL show that zone's
operating instruction (e.g. Simple → "delegate and execute"), never a
right/wrong verdict.

#### Scenario: Added item persists after placement
- **WHEN** the visitor adds an item and places it in the Complex zone
- **THEN** the item and its zone persist across a page reload

#### Scenario: Re-placing an item overwrites its zone
- **WHEN** the visitor moves an already-placed item to a different zone
- **THEN** the item's stored zone updates to the new zone and no duplicate
  item is created

#### Scenario: Freeform placement shows an operating instruction, not a verdict
- **WHEN** the visitor places any item in freeform mode
- **THEN** the reveal shows that zone's operating instruction and never
  labels the placement correct or incorrect

### Requirement: Per-zone help modal with definition, example, gotchas, and how-to
The system SHALL provide a help modal reachable from each zone label that
shows, for that zone: a definition, a worked example, a list of gotchas, and
a numbered how-to-recognize-it list, matching the depth of the existing
per-concept OST help modal.

#### Scenario: Opening a zone's help modal
- **WHEN** the visitor opens the help modal for the Complicated zone
- **THEN** the modal shows Complicated's definition, example, gotchas, and
  how-to-recognize-it content, and closes on Escape or backdrop click

### Requirement: Standalone tool page with active-board resolution
The system SHALL serve the tool at `/tools/agreement-certainty-matrix/` as a
static Astro page hosting a React island in `freeform` mode that resolves
the active product via `resolveActiveProduct()` and the active board via one
board per product, seeding an empty board on first visit, and stating that
data stays in the browser.

#### Scenario: First visit boots into an empty board
- **WHEN** the page loads with empty localStorage
- **THEN** the "Donut CRM" sample product is seeded, an empty board is
  created and activated for it, and the grid renders with no items placed

#### Scenario: Returning visit reopens the same board
- **WHEN** the page loads and the active product already has a board with
  placed items
- **THEN** that board's items and their zones render exactly as last saved

### Requirement: Curated embeds source items and zones from the originating post only
Each of the four `ls-decide` post embeds SHALL use an item set whose text,
zone assignments, and contested flags are drawn only from that specific
post's own worked example; the system MUST NOT display an item or zone
placement that does not trace to that post's text, and item sets MAY vary in
size and MAY omit a zone with no corresponding example in that post.

#### Scenario: A post with no Chaotic example shows no Chaotic-scored item
- **WHEN** a post's item set contains no item whose source text places it in
  Chaotic
- **THEN** the embed for that post renders only the zones its item set
  actually covers, with no fabricated Chaotic item

