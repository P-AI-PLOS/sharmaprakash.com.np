# story-map-builder Specification

## Purpose
TBD - created by archiving change story-map-builder-tool. Update Purpose after archive.
## Requirements
### Requirement: Story map records persist backbone, slices, and cards
The system SHALL persist story map records via
`createToolStore({ storageKey: "storymap-v1", idPrefix: "map" })`, each record
carrying `productId`, a `title`, an ordered list of backbone steps (`id`,
`text`, `order`), an ordered list of release slices (`id`, `name`, `order`),
and a list of cards (`id`, `stepId`, `sliceId` nullable, `text`, `order`).
Data MUST never leave the browser.

#### Scenario: Creating a map seeds an empty backbone
- **WHEN** the visitor creates a new story map
- **THEN** a record is persisted with an empty `title`, no steps, no slices,
  and no cards, and it survives a page reload

#### Scenario: Adding a step, slice, and card persists immediately
- **WHEN** the visitor adds a backbone step "Sign up", a release slice "MVP",
  and a card "Sign up with email" under that step
- **THEN** the record's `steps`, `slices`, and `cards` arrays reflect all three
  after the next read, without an explicit save action

### Requirement: Cards are placed by click-to-assign, not drag-and-drop
The system SHALL let the visitor assign a card to exactly one backbone step
and to at most one release slice (or none, meaning the unsliced backlog)
through explicit selection controls (e.g. dropdowns), and SHALL let the
visitor reorder cards within a step+slice grouping and reorder backbone steps
or release slices through explicit ordering controls (e.g. up/down or
left/right actions). The system SHALL NOT require pointer drag-and-drop for
any of these actions.

#### Scenario: Moving a card to a different slice
- **WHEN** the visitor selects a different release slice for a card currently
  in the unsliced backlog
- **THEN** the card's `sliceId` updates to the chosen slice and the card
  renders under that slice's band in the same backbone column

#### Scenario: Moving a card to a different backbone step
- **WHEN** the visitor selects a different backbone step for a card
- **THEN** the card's `stepId` updates and the card renders under the new
  column, retaining its slice assignment

#### Scenario: Reordering cards within one step and slice
- **WHEN** the visitor moves a card up within its (step, slice) grouping
- **THEN** the card's `order` decreases relative to its neighbors in that same
  grouping only, and the ordering of cards in other groupings is unaffected

### Requirement: Deleting a step or slice never deletes cards
The system SHALL preserve every card when its referenced backbone step or
release slice is deleted, rendering the orphaned card under a visible
"Unassigned step" or "Backlog (unsliced)" placeholder rather than removing it
or its text.

#### Scenario: Deleting a step orphans its cards instead of losing them
- **WHEN** the visitor deletes a backbone step that has two cards under it
- **THEN** the step is removed from the backbone, and both cards remain in the
  record with their text intact, rendered under an "Unassigned step" grouping

#### Scenario: Deleting a slice orphans its cards into the backlog
- **WHEN** the visitor deletes a release slice that has cards assigned to it
- **THEN** the slice is removed, and its cards' `sliceId` become unset,
  rendering them in the "Backlog (unsliced)" band

### Requirement: Grid renders backbone, slice bands, and backlog band
The system SHALL render the story map as a grid with one column per backbone
step (in step order) and one row per release slice (in slice order), followed
by a trailing row for cards with no assigned slice, and SHALL provide a
read-only rendering mode that omits all editing controls while preserving the
same layout and labels.

#### Scenario: A card with no slice shows in the trailing backlog row
- **WHEN** a card has `sliceId: null`
- **THEN** it renders in the trailing "Backlog (unsliced)" row under its
  backbone step's column

#### Scenario: Read-only mode renders without editing controls
- **WHEN** the grid is rendered with the read-only mode enabled
- **THEN** no step/slice assignment controls, reorder controls, add, or
  delete actions are rendered, and the backbone, slice bands, and cards still
  render with their text

### Requirement: Markdown export of the story map
The system SHALL provide a Markdown export of a story map that states the
backbone as a single left-to-right line, followed by one section per release
slice in slice order listing that slice's cards grouped under their backbone
step's label, followed by a trailing "Backlog (unsliced)" section for cards
with no assigned slice.

#### Scenario: Export reflects backbone order and slice order
- **WHEN** the visitor exports a map with backbone steps A, B, C and slices
  "MVP" then "Release 2"
- **THEN** the exported Markdown lists the backbone as "A → B → C" and
  contains an "MVP" section before a "Release 2" section, each listing only
  cards assigned to that slice under their step's label

#### Scenario: Unsliced cards appear in a trailing backlog section
- **WHEN** the map has cards with no assigned slice
- **THEN** the export includes a trailing "Backlog (unsliced)" section listing
  those cards

### Requirement: Standalone tool page with map switching
The system SHALL serve the tool at `/tools/story-map/` as a static Astro page
hosting a React island that resolves the active product via
`resolveActiveProduct()`, lets the visitor create, switch between, and delete
multiple story maps, and states that data stays in the browser.

#### Scenario: First visit creates a usable empty map
- **WHEN** the page loads with empty localStorage
- **THEN** a story map record is created and shown as the active map, ready
  for the visitor to add steps and cards

#### Scenario: Switching between maps preserves each map's contents
- **WHEN** the visitor has two story maps and switches from one to the other
- **THEN** the previously active map's steps, slices, and cards are unchanged
  and the newly active map's own contents are shown

### Requirement: Read-only worked-example embed
The system SHALL provide a component that renders a fixed, non-persisted,
non-editable story map matching the user story mapping post's own onboarding
vignette (backbone: Sign up, Set up project, Invite team, Do core work, Share
result; slices: MVP, Release 2), alongside a link to the standalone tool, and
this component SHALL NOT read from or write to the story map store.

#### Scenario: Post embed renders the vignette without persisting it
- **WHEN** the story mapping post's "backbone and slices" section renders the
  worked-example embed
- **THEN** the fixed vignette grid is shown with no editing controls, no
  story-map-store record is created or modified, and a link to
  `/tools/story-map/` is present

#### Scenario: Reader edits on the standalone tool never alter the post embed
- **WHEN** a visitor builds and edits their own map at `/tools/story-map/`
- **THEN** the post's worked-example embed continues to show the fixed
  vignette on the next page load, unaffected by the visitor's own map data

