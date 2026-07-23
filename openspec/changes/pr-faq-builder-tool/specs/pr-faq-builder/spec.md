## ADDED Requirements

### Requirement: PR/FAQ documents persist locally, one document per record
The system SHALL persist PR/FAQ records via
`createToolStore({ storageKey: "pm-prfaq-v1", idPrefix: "prfaq" })`, each
record carrying a `productId`, seven press-release fields (headline,
subheadline, summary, problem, solution, quote, availability), and an ordered
list of FAQ entries, each with a stable `uid("faq")` id, a question, and an
answer. Data MUST never leave the browser, and edits MUST persist
immediately without an explicit save action.

#### Scenario: Editing a field persists across reload
- **WHEN** the visitor types a headline, a problem statement, and one FAQ
  answer, then reloads the page
- **THEN** the headline, problem statement, and FAQ answer are all present
  exactly as typed

#### Scenario: Storage unavailable degrades silently
- **WHEN** localStorage writes throw (private mode or quota exceeded)
- **THEN** the tool remains usable for the session and no error is shown to
  the visitor

### Requirement: New documents seed the five dreaded FAQ questions
The system SHALL seed every newly created PR/FAQ document's FAQ list with
five placeholder entries whose questions are pre-filled with the pricing,
switching, cannibalization, hardest-technical-problem, and "why us" prompts
and whose answers are empty, and SHALL allow the visitor to edit or delete
any seeded entry.

#### Scenario: A fresh document has five seeded questions
- **WHEN** the visitor creates a new PR/FAQ document
- **THEN** the FAQ list contains five entries pre-filled with the pricing,
  switching, cannibalization, hardest-technical-problem, and why-us questions
  and each entry's answer is empty

#### Scenario: A seeded question can be deleted
- **WHEN** the visitor removes one of the five seeded FAQ entries
- **THEN** the FAQ list has four entries and the deletion persists across
  reload

### Requirement: FAQ entries are freely addable and removable
The system SHALL let the visitor append new FAQ question/answer entries
beyond the seeded five, and remove any entry, preserving the order and
content of the remaining entries.

#### Scenario: Adding a sixth FAQ entry
- **WHEN** the visitor adds a new FAQ entry with a question and answer
- **THEN** the FAQ list grows to six entries with the new entry in the
  position it was added

#### Scenario: Removing a middle entry preserves the rest
- **WHEN** the visitor removes the third of five FAQ entries
- **THEN** the remaining four entries keep their original content and
  relative order

### Requirement: Multiple documents persist per visitor with a switcher
The system SHALL let a visitor hold more than one PR/FAQ document
simultaneously, create additional documents, delete a document, and switch
the active document, with the active document remembered per embed context
(standalone tool vs. a specific post embed).

#### Scenario: Creating a second document does not affect the first
- **WHEN** the visitor has one PR/FAQ document with content and creates a
  second, blank one
- **THEN** the first document's content is unchanged and both documents
  appear in the switcher

#### Scenario: Switching documents shows the selected content
- **WHEN** the visitor switches from document A to document B in the
  switcher
- **THEN** the editor displays document B's fields and FAQ entries, and
  switching back to A restores A's content exactly

#### Scenario: Deleting the active document falls back to another
- **WHEN** the visitor deletes the currently active document and at least
  one other document exists
- **THEN** the switcher's remaining document becomes active and is displayed

#### Scenario: Standalone tool and post embed remember separate active documents
- **WHEN** a visitor has an active document on the standalone
  `/tools/pr-faq-builder/` page and a different active document on the
  working-backwards post embed
- **THEN** each context reopens its own remembered document on return, not
  the other context's

### Requirement: Markdown export mirrors the document structure
The system SHALL provide a "Copy as Markdown" action that renders the active
document as markdown with the headline as an H1, the subheadline (if set) as
italic text beneath it, the summary as a paragraph, labeled problem and
solution lines, the quote as a blockquote, a labeled availability line, and
an "## FAQ" section listing every FAQ entry as a bolded question line
followed by an answer line, and SHALL display the same markdown in a visible
preview.

#### Scenario: Copying a fully filled document
- **WHEN** the visitor fills every press-release field and three FAQ
  entries, then clicks "Copy as Markdown"
- **THEN** the clipboard contains markdown with the headline as `# `, the
  problem and solution as labeled lines, the quote as a `> ` blockquote, and
  three `**Q: ...**` / `A: ...` pairs under an `## FAQ` heading

#### Scenario: Copying an empty document does not throw
- **WHEN** the visitor clicks "Copy as Markdown" on a freshly created,
  unedited document
- **THEN** the export completes without an error, rendering placeholder text
  for every unset field

#### Scenario: Clipboard API unavailable degrades silently
- **WHEN** the Clipboard API throws or is unavailable
- **THEN** the markdown preview still renders correctly and no error is
  shown to the visitor

### Requirement: Standalone page and post embed share one component
The system SHALL expose the tool at a standalone page (`/tools/pr-faq-
builder/`) with a document-management dashboard, and SHALL expose the same
component embedded within the working-backwards post, replacing that post's
"Put it to work" item #2 prose instruction, using the same store and
markdown export in both contexts.

#### Scenario: Standalone page shows the dashboard
- **WHEN** a visitor with two saved PR/FAQ documents opens
  `/tools/pr-faq-builder/`
- **THEN** both documents are visible in a management dashboard in addition
  to the switcher

#### Scenario: Post embed replaces the prose instruction
- **WHEN** a visitor reads the working-backwards post's "Put it to work"
  section
- **THEN** item #2 renders the PR/FAQ Builder tool instead of only prose
  instructions, while items #1 and #3 remain unchanged prose

#### Scenario: Post embed context is independent of the standalone tool
- **WHEN** a visitor creates a PR/FAQ document from within the post embed
- **THEN** that document is also listed and editable from the standalone
  `/tools/pr-faq-builder/` page, since both read the same store
