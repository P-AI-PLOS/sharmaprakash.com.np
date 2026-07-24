# vertical-slicer-tool Specification

The /tools/vertical-slicer/ page and React island that slice a spec (or a
manually described feature) into independently-shippable stories using
recognized slicing patterns, persisted to localStorage per the
pipeline-data-contract. Consumed downstream by Backlog Prioritizer and Test
Register via `StoryRef`.

## ADDED Requirements

### Requirement: Standalone slicer page
The system SHALL serve a static page at `/tools/vertical-slicer/` rendering a
single React island via `client:load`, using the site's SiteShell layout and
existing design tokens, with all data persisted to localStorage only — nothing
sent to any server.

#### Scenario: Page loads with the running case product
- **WHEN** a visitor opens /tools/vertical-slicer/ for the first time
- **THEN** the island resolves the active product via the shared
  `resolveActiveProduct()` (seeding "Donut CRM" if none exists) and shows an
  empty slicing session scoped to that product

#### Scenario: Storage unavailable degrades silently
- **WHEN** localStorage writes throw (private mode or quota exceeded)
- **THEN** the tool remains fully usable for the session and no error is
  surfaced beyond persistence quietly not happening

### Requirement: Slicing session source — spec link or manual feature
The system SHALL let a session's "big feature" come from either a Spec Builder
spec — stored as a `SpecRef` plus a spec-title text snapshot — or a manually
typed feature description with no `SpecRef`. Spec picking SHALL list specs for
the active product from the `pm-spec-v1` store, and SHALL degrade to
manual-entry-only when no specs exist or the key is unreadable.

#### Scenario: Slicing a spec snapshots its title
- **WHEN** the visitor picks a spec from the picker
- **THEN** the session stores `specRef.specId` and the spec's title as a
  snapshot, and the linked spec title is displayed in the session header

#### Scenario: No Spec Builder data present
- **WHEN** the `pm-spec-v1` key is absent, empty, or unparsable
- **THEN** the spec picker is hidden or disabled with an explanatory hint and
  manual feature entry works normally

#### Scenario: Linked spec deleted or retitled after picking
- **WHEN** a session's `specRef.specId` no longer resolves, or resolves to a
  record whose title differs from the stored snapshot
- **THEN** the session renders the snapshot title with a visible
  "source changed/removed" badge, and the session and its stories are not
  deleted or blocked

### Requirement: Slicing pattern assignment
The system SHALL offer exactly three slicing patterns — workflow steps,
business rules, and data variations — each presented with a one-line
definition and a Donut CRM example, and the visitor SHALL assign the feature
to one pattern before adding stories. The assignment interaction MUST be
operable by mouse, keyboard, and touch.

#### Scenario: Picking a pattern reveals the slice list
- **WHEN** the visitor selects the "workflow steps" pattern card
- **THEN** the session stores the pattern and the story list appears with a
  pattern-specific prompt (happy path first, then edge steps)

#### Scenario: Changing pattern keeps existing stories and ids
- **WHEN** a session already containing stories is switched to a different
  pattern and the visitor confirms
- **THEN** all existing stories and their `story` ids are preserved unchanged;
  only the pattern label and prompts update

### Requirement: Stories with stable ids and contract references
The system SHALL persist sessions in localStorage under `pm-slice-v1` (active
pointer `pm-slice-v1-active`) via the shared `createToolStore` factory, with
session ids generated as `uid("slice")` and every story carrying an id
generated as `uid("story")`. Story ids MUST survive edits, reorders, and
pattern changes; array indexes MUST NOT be used as story join keys. The system
SHALL expose each session's stories as `StoryRef`s (`{ storyId, specId }`) and
a story-by-id resolver for downstream tools.

#### Scenario: Story id survives rename and reorder
- **WHEN** a story is retitled and moved to a different position in the list
- **THEN** its `story`-prefixed id is unchanged and resolving that id still
  returns the story

#### Scenario: StoryRefs join stories to their spec
- **WHEN** downstream code requests the refs for a session sliced from a spec
- **THEN** each ref carries the story's id and the session's `specRef.specId`

#### Scenario: Manual session yields refs without a spec
- **WHEN** refs are requested for a session with no `SpecRef`
- **THEN** each ref carries the story id and an empty `specId`, and consumers
  can still resolve the story by id

### Requirement: Visible independently-shippable check per story
The system SHALL render, on every story, a fixed three-item shippability
checklist — delivers end-to-end value on its own; a user could see it working;
does not depend on a later slice to function — as visitor-toggleable checks
whose state persists with the story. A story with all checks passed SHALL be
visibly marked as a vertical slice; a story with any check unpassed SHALL be
visibly flagged as a likely horizontal layer, naming the failed check. The
flag MUST NOT block saving, editing, or export.

#### Scenario: Fully checked story reads as a vertical slice
- **WHEN** all three checks on a story are toggled on
- **THEN** the story shows a passing "vertical slice" indicator and no warning

#### Scenario: Failing story is flagged, not rejected
- **WHEN** a story has "delivers end-to-end value" unchecked
- **THEN** the story displays a visible horizontal-layer warning naming that
  check, and the story is still saved and included in export

### Requirement: Session management and Markdown export
The system SHALL support multiple slicing sessions per product — create,
switch (persisted per-product active pointer), and delete — with a saved
sessions dashboard on the standalone page, and SHALL export the active session
as Markdown to the clipboard including the feature, linked spec title (when
any), pattern, and each story with its shippability state.

#### Scenario: Switching sessions is remembered
- **WHEN** the visitor switches to another session and later reloads the page
- **THEN** the last-active session for the active product is reopened

#### Scenario: Export reflects shippability state
- **WHEN** the visitor exports a session containing one passing and one
  flagged story
- **THEN** the copied Markdown lists both stories with distinct pass/warning
  markers and the flagged story's failed checks

#### Scenario: Deleting a session does not cascade
- **WHEN** a session whose stories are referenced by downstream tools is
  deleted
- **THEN** only the `pm-slice-v1` record is removed; no other tool's store is
  touched, and downstream consumers surface the missing stories via their own
  snapshot badges
