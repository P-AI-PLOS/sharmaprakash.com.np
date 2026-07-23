# decision-door-classifier Specification

A reusable one-way/two-way decision-classification component: a curated,
judge-then-reveal mode embedded in the risk-vocabulary post, and a freeform
"classify your own decision" mode on a standalone page at
`/tools/decision-door-classifier/`, with a per-decision-type help modal
shared by both modes. Freeform entries persist to localStorage only, via
`createToolStore` (`src/utils/pipeline-store.ts`), with no cross-tool
references.

## ADDED Requirements

### Requirement: Curated scenario classify-and-reveal
The system SHALL render a fixed, ordered set of decision scenarios, one at a
time or in a list, each offering exactly two judgment controls
("One-way door" and "Two-way door"). Once the visitor picks one, the system
SHALL disable further picks for that scenario and immediately display
whether the pick matches the scenario's classification along with its
written reasoning. The curated set MUST NOT persist to storage.

#### Scenario: Picking the scenario's classification
- **WHEN** the visitor reads a two-way-door scenario (e.g. the button-color
  A/B test) and picks "Two-way door"
- **THEN** the pick is marked correct and the scenario's reasoning text is
  shown immediately

#### Scenario: Picking the other classification
- **WHEN** the visitor picks "One-way door" on a scenario classified as a
  two-way door
- **THEN** the pick is marked not-quite, the correct classification is
  stated, and the scenario's reasoning text is shown

#### Scenario: Score tracking across the set
- **WHEN** the visitor has classified 3 of 5 scenarios with 2 matching the
  scenario's classification
- **THEN** the visible score reads 3 of 5 answered, 2 correct

#### Scenario: Restarting the curated set
- **WHEN** the visitor triggers "Start over" after classifying some
  scenarios
- **THEN** all picks are cleared and every scenario becomes selectable again

### Requirement: Per-decision-type explain modal
The system SHALL provide a help modal with exactly two entries, "one-way
door" and "two-way door," each containing a definition, one example, a list
of gotchas, and a list of how-to-recognize-it guidance, reachable from an
explain trigger next to each door option in both curated and freeform modes,
closable via an explicit close control and the Escape key.

#### Scenario: Opening the one-way-door explanation
- **WHEN** the visitor activates the "Explain this door" trigger next to the
  "One-way door" option
- **THEN** a modal opens showing the one-way-door definition, example,
  gotchas, and how-to-recognize-it guidance

#### Scenario: Closing via Escape
- **WHEN** the modal is open and the visitor presses Escape
- **THEN** the modal closes

### Requirement: Freeform "classify your own decision" logging
The system SHALL let a visitor on the standalone tool page enter free text
describing a decision they are facing, classify it as "one-way door" or
"two-way door," and add an optional note, persisting each entry via
`createToolStore({ storageKey: "pm-decisiondoor-v1", idPrefix: "door" })`.
Entries MUST NOT require or reference any product, quarter, or other
pipeline-tool identifier, and MUST persist across a page reload. The system
MUST NOT present a correct/incorrect verdict for a freeform entry, since no
external classification exists to check it against.

#### Scenario: Logging a freeform decision
- **WHEN** the visitor types "Which of two vendor contracts to sign,"
  classifies it "one-way door," and adds a note, then submits
- **THEN** a new entry appears in the visitor's log with that text,
  classification, and note, and reloading the page still shows it

#### Scenario: No verdict shown for freeform entries
- **WHEN** a freeform entry is classified and saved
- **THEN** the entry never displays a correct/incorrect indicator

#### Scenario: Explain-modal cross-check while logging
- **WHEN** the visitor activates the explain trigger for "two-way door"
  while classifying a freeform entry
- **THEN** the same help modal used in curated mode opens, showing that
  door's gotchas and how-to-recognize-it guidance

### Requirement: Curated-mode embed in the risk-vocabulary post
The system SHALL render the curated-mode component inside the "One-way doors
and two-way doors" section of the risk-vocabulary post
(`risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure`),
using only scenarios drawn from that section's own existing examples. The
post's locked URL MUST remain unchanged.

#### Scenario: Post renders the interactive classifier
- **WHEN** a visitor loads the risk-vocabulary post
- **THEN** the "One-way doors and two-way doors" section renders the curated
  classify-and-reveal component in addition to the section's framing prose

#### Scenario: Post URL is unaffected
- **WHEN** the post's source file is converted from `.md` to `.mdx`
- **THEN** the post is still reachable at its existing locked URL

### Requirement: Standalone tool page with both modes
The system SHALL serve the tool at `/tools/decision-door-classifier/` as a
static Astro page hosting a React island that offers both the curated mode
and the freeform mode via an explicit switch, defaulting to curated mode on
load, and stating that freeform entries save in the visitor's browser only.

#### Scenario: Default landing mode
- **WHEN** the standalone page loads
- **THEN** the curated scenario set is shown first, with a visible control
  to switch to "classify your own decision"

#### Scenario: Empty freeform log on first visit
- **WHEN** the visitor switches to freeform mode with no prior entries in
  localStorage
- **THEN** an empty-state prompt is shown inviting them to describe a
  decision, with no error and no entry list rendered
