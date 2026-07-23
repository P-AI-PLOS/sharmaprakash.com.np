# backlog-triage-sorter Specification

## Purpose
TBD - created by archiving change backlog-triage-sorter-tool. Update Purpose after archive.
## Requirements
### Requirement: Boards persist reader-authored items in three buckets plus an unbucketed staging state
The system SHALL persist triage boards via
`createToolStore({ storageKey: "pm-backlog-triage-v1", idPrefix: "triage" })`,
each board record carrying a title and a list of items, each item holding
free-text `text`, a `bucket` that is one of `now`, `next`, `never`, or
unbucketed, and an optional `neverReason`. New items SHALL start unbucketed —
never defaulted into `now` — and data MUST never leave the browser.

#### Scenario: A newly added item starts unbucketed
- **WHEN** the visitor adds a new item by typing text and submitting it
- **THEN** the item appears on the board with no bucket assigned and is not
  shown inside the Now, Next, or Never columns until explicitly moved

#### Scenario: Bulk paste creates one item per line
- **WHEN** the visitor pastes a multi-line block of text into the bulk-add
  textarea and submits it
- **THEN** one unbucketed item is created per non-empty line, in the order
  the lines appeared, and blank lines are skipped

#### Scenario: Board data persists across reloads
- **WHEN** the visitor has moved items into Now, Next, and Never and reloads
  the page
- **THEN** every item reappears in the bucket it was last moved to, with its
  text and any never-reason intact

### Requirement: Items move between buckets by button or native pointer drag
The system SHALL let the visitor move an item into `now`, `next`, or `never`
by clicking a labeled bucket control on the item, and SHALL additionally
support moving an item by native pointer drag-and-drop onto a bucket column,
without depending on any drag-and-drop library. The button path MUST remain
fully operable by keyboard and screen reader regardless of drag support.

#### Scenario: Clicking a bucket button moves the item
- **WHEN** the visitor clicks the "Next" control on an unbucketed item
- **THEN** the item moves into the Next column and its bucket control state
  reflects the new selection

#### Scenario: Dragging an item onto a column moves it
- **WHEN** the visitor drags an item card and drops it onto the Never column
- **THEN** the item's bucket updates to `never` exactly as if the Never
  button had been clicked

#### Scenario: Re-clicking the current bucket is a no-op
- **WHEN** the visitor clicks the bucket button that already matches an
  item's current bucket
- **THEN** the item's bucket and position are unchanged

### Requirement: Never items carry an optional, non-blocking reason
The system SHALL show an inline reason field on any item in the `never`
bucket and SHALL persist whatever the visitor enters there, but MUST NOT
block moving an item to `never` or leaving the reason empty. Boards with one
or more empty-reason `never` items SHALL show a non-blocking reminder that
closing an item with a stated reason is the point of the bucket.

#### Scenario: Never item without a reason is still saved
- **WHEN** the visitor moves an item to Never and enters no reason
- **THEN** the item persists in the Never column and no error or blocked
  state occurs, and the column shows the stated-reason reminder

#### Scenario: Reason text persists once entered
- **WHEN** the visitor types a reason for a Never item
- **THEN** the reason persists across reloads and appears in the Markdown
  export in parentheses after the item's text

### Requirement: Next column shows a non-blocking size nudge
The system SHALL display a one-line nudge on the Next column's header once
its item count exceeds a small fixed threshold, without disabling further
moves into Next. The nudge MUST be computed from the current item list at
render time and MUST NOT be persisted.

#### Scenario: Nudge appears past the threshold
- **WHEN** the Next column holds more items than the fixed threshold
- **THEN** the column header displays the size nudge

#### Scenario: Nudge is absent below the threshold
- **WHEN** the Next column holds fewer items than the fixed threshold
- **THEN** no nudge is displayed

### Requirement: Board exports to Markdown grouped by bucket
The system SHALL provide an export action that produces Markdown text with a
heading and list per bucket (Now, Next, Never; unbucketed items are excluded
from the export), Never items appending their reason in parentheses when
set, and SHALL copy this text to the clipboard when the platform supports it.

#### Scenario: Export groups items under their bucket heading
- **WHEN** the visitor triggers the export action with items in all three
  buckets
- **THEN** the produced Markdown contains a Now heading, a Next heading, and
  a Never heading, each followed by that bucket's items in board order

#### Scenario: Never item with a reason exports with the reason
- **WHEN** a Never item has the reason "serves a segment we've deprioritized"
- **THEN** its exported line includes that reason in parentheses after the
  item's text

### Requirement: Two embed contexts each resolve their own active board
The system SHALL support exactly two embed contexts — `standalone` (the
`/tools/backlog-triage/` page) and `post` (the embed in the backlog-cleanup
post) — each resolving its own remembered active board on load, creating one
if none exists for that context. The system SHALL let the standalone context
list, create, switch between, and delete multiple boards; the post context
SHALL show only its single active board without a board-management list.

#### Scenario: Standalone and post embeds keep independent active boards
- **WHEN** the visitor has triaged items on the standalone page and
  separately on the post embed
- **THEN** each context reopens its own board on reload, independent of the
  other

#### Scenario: Standalone page lists multiple boards
- **WHEN** the visitor creates a second board from the standalone page
- **THEN** both boards are listed with title, item count, and last-updated
  time, and either can be reopened or deleted

#### Scenario: Post embed shows no board list
- **WHEN** the board is rendered inside the backlog-cleanup post
- **THEN** no "your boards" management list is shown, only the single active
  board for that context

### Requirement: Standalone tool page states its browser-only persistence
The system SHALL serve the tool at `/tools/backlog-triage/` as a static Astro
page hosting a React island that states data stays in the browser and links
back to the source post explaining the Now/Next/Never framework.

#### Scenario: First visit shows an empty, ready-to-use board
- **WHEN** the standalone page loads with empty localStorage
- **THEN** an empty board is created and shown, with the add-item and
  bulk-paste controls immediately usable

