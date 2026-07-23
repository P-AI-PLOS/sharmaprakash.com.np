# north-star-metric-tree Specification

A recursive N-level metric-decomposition tree builder — North Star metric at
the root, any number of input-metric levels beneath it, leaf metrics
markable as orphan or contested — at `/tools/north-star-metric-tree/` and
embedded in the source blog post. localStorage only; built on the
`pipeline-data-contract` capability (`createToolStore`, `resolveActiveProduct`).

## ADDED Requirements

### Requirement: Metric tree records persist with a homogeneous, recursive node shape
The system SHALL persist metric tree records via
`createToolStore({ storageKey: "pm-metric-tree-v1", idPrefix: "mt" })`, each
record carrying `productId` and a single recursive `root: MetricNode`, where
every `MetricNode` (root, branch, or leaf) has a stable `id`, `text`, a
`children` array of the same node shape, and a nullable `annotation`. Node
depth MUST NOT be capped by the storage or data model. Data MUST never leave
the browser.

#### Scenario: A three-level tree persists in full
- **WHEN** a visitor builds a root with one child, that child with two
  children, and one of those with a further child
- **THEN** reloading the page shows all four levels with their original text
  and structure intact

#### Scenario: Leaf and branch are derived, not stored
- **WHEN** a leaf node (no children) has a child added to it
- **THEN** the record's stored shape shows the node with one child and no
  separate "kind" field changes anywhere in the persisted data

### Requirement: Any node can gain a child, any node can be removed
The system SHALL let the visitor add a child metric node to any existing
node at any depth, and remove any node (and its entire subtree) other than
the root.

#### Scenario: Adding a child to a deep leaf
- **WHEN** the visitor adds a child metric to a leaf three levels below the
  root
- **THEN** a fourth level appears under that node and no other node in the
  tree is altered

#### Scenario: Removing a branch removes its subtree
- **WHEN** the visitor removes a node that has two children
- **THEN** that node and both children are gone from the tree, and sibling
  nodes at the same level are unaffected

### Requirement: Leaf metrics can be flagged orphan or contested with a note
The system SHALL let the visitor mark any node with zero children as
`orphan` or `contested`, with an optional free-text note, and SHALL only
offer this control on nodes with zero children. Adding a child to a
previously annotated node SHALL clear that node's annotation.

#### Scenario: Marking a leaf orphan
- **WHEN** the visitor marks a leaf metric "orphan" and writes the note "no
  team has claimed this"
- **THEN** the leaf displays an orphan badge and the note persists across a
  reload

#### Scenario: Marking a leaf contested
- **WHEN** the visitor marks a leaf metric "contested" with a note naming two
  teams
- **THEN** the leaf displays a contested badge distinct from the orphan
  badge, and the note persists

#### Scenario: Decomposing an annotated leaf clears its annotation
- **WHEN** the visitor adds a child to a leaf that is currently marked
  contested
- **THEN** the node's annotation is cleared and the annotation controls are
  no longer shown for that node (it now has a child)

#### Scenario: Annotation controls are hidden on branches
- **WHEN** a node has one or more children
- **THEN** the editor does not offer orphan/contested controls for that node

### Requirement: Tree diagram renders the full recursive structure
The system SHALL render the tree as a connected node diagram via
`react-d3-tree`, with a switchable layout direction (top-down, left-right,
right-left) and a fullscreen mode, following the same interaction model as
the opportunity solution tree diagram (drag to pan, scroll to zoom). The
root SHALL be visually distinguished from all other nodes, and any node
carrying an orphan or contested annotation SHALL show a visible badge
distinct from an unannotated node.

#### Scenario: Direction toggle re-renders the same tree
- **WHEN** the visitor switches from top-down to left-right layout
- **THEN** the same nodes and connections render in the new orientation
  with no data change

#### Scenario: Contested leaf is visually distinct
- **WHEN** a leaf is marked contested and its sibling leaf is unannotated
- **THEN** only the contested leaf renders with the contested badge

#### Scenario: Fullscreen mode preserves the live tree
- **WHEN** the visitor expands the diagram to fullscreen
- **THEN** the editor and diagram both remain interactive and any edit made
  in fullscreen persists identically to editing outside fullscreen

### Requirement: Markdown export of the full tree
The system SHALL provide a "Copy as Markdown" export that renders the entire
tree as an indented bullet list, root first, with a distinct icon for root,
branch, and leaf nodes, and an inline marker on any orphan or contested leaf.

#### Scenario: Export reflects current structure and annotations
- **WHEN** the visitor copies the Markdown export of a tree with one orphan
  leaf and one contested leaf
- **THEN** the copied text lists every node at its correct indentation depth
  and marks the orphan and contested leaves distinctly from unannotated
  leaves

### Requirement: Context-scoped active tree, standalone and post embed
The system SHALL scope the active tree pointer by embed context — a
standalone-tool context and a per-post context — the same way OST scopes by
course chapter versus standalone, so each embed context remembers its own
tree independently.

#### Scenario: Standalone and post embed track separate active trees
- **WHEN** a visitor edits the standalone tool's tree and separately edits
  the tree embedded in the blog post
- **THEN** each context reopens its own tree on a later visit, unaffected by
  edits made in the other context

#### Scenario: Multiple trees can be created and switched standalone
- **WHEN** the visitor creates a second tree on the standalone tool page
- **THEN** both trees are listed and selectable, and switching between them
  does not lose either tree's data

### Requirement: Post embed seeds a worked example on first visit only
The system SHALL seed a new (never-before-created) metric tree record for
the blog-post embed context with the post's own marketplace worked example
(weekly transactions decomposed through active buyers and activation), and
SHALL NOT re-seed or overwrite a tree that already exists for that context.
The standalone tool's default context SHALL start empty, matching the
opportunity solution tree's convention.

#### Scenario: First visit to the post embed shows the worked example
- **WHEN** a visitor with no prior localStorage data loads the post embed
- **THEN** the tree renders pre-populated with the worked example's root and
  child metrics, fully editable and clearable

#### Scenario: Returning visitor sees their own edits, not the reseeded example
- **WHEN** a visitor who previously edited the post-embed tree reloads the
  page
- **THEN** their edited tree is shown, not the original worked example

### Requirement: Standalone tool page with active-product resolution
The system SHALL serve the tool at `/tools/north-star-metric-tree/` as a
static Astro page hosting a React island that resolves the active product
via `resolveActiveProduct()`, states that data stays in the browser, and
lists the visitor's saved trees with open/delete actions.

#### Scenario: First visit boots into the running case
- **WHEN** the page loads with empty localStorage
- **THEN** the "Donut CRM" sample product is seeded and the tool is usable
  immediately with an empty tree

#### Scenario: Saved trees are listed and deletable
- **WHEN** the visitor has created two trees on the standalone page
- **THEN** both appear in the "your trees" list with the option to open or
  delete each independently
