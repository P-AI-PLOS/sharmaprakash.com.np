---
title: "design.md for a Chakra UI v3 Codebase: Recipes, Tokens, Rules"
date: "2026-05-14T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Chakra v3 changed the game with recipes and semantic tokens. Here is the complete design.md that takes advantage of both — copy, swap your brand, ship."
cover: "/images/blog/ai/design-md-chakra.png"
thumb: "/images/blog/ai/design-md-chakra.png"
last_modified_at: "2026-05-14T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 8
---

Part 4 of this series was a META-TEMPLATE — it described the *shape* of a good `design.md` using a generic component-library API as the running example. This post fills the template in concretely for **Chakra UI v3**.

Chakra v3 is structurally different enough that a literal port of Part 4 would mislead an agent. Three pieces of the design language are different in kind, not just in syntax:

- **Recipes replace variant props.** A `<Button variant="solid">` resolves through a recipe defined in `theme/recipes/button.ts`, not through component-level conditionals. The `design.md` documents recipes, not props.
- **Semantic tokens sit between brand tokens and components.** You name *what something means* (`bg.canvas`, `fg.muted`) separately from *what colour it is* (`brand.500`). The `design.md` is mostly a tour of the semantic layer.
- **Theme is exposed as CSS variables at runtime.** `var(--chakra-colors-brand-500)` is real on every element. That changes which escape hatches are acceptable and which are not.

What follows is the complete `design.md` for a Chakra v3 codebase. Copy it verbatim, swap the brand bits (palette hexes, product name, three or four words in the Brand section), and you have a working document the day you commit it.

---

## Frontmatter

```markdown
# acme — design.md

> Canonical design memory for the acme web app. Every AI session and human
> contributor reads this **before** writing UI. If a value isn't here,
> propose it as an addition before using it inline.

**Last updated**: 2026-05-14
**Scope**: `apps/web/src/`
**Stack**: Chakra UI v3 + Panda CSS, React 19, TanStack Query, Zustand,
react-hook-form + Zod.
**Source of truth for values**:
- Raw tokens — `src/theme/tokens.ts`
- Semantic tokens — `src/theme/semantic-tokens.ts`
- Recipes — `src/theme/recipes/*.ts`
- Slot recipes — `src/theme/slot-recipes/*.ts`
- Text styles — `src/theme/text-styles.ts`
- System config — `src/theme/system.ts` (via `createSystem(defaultConfig, …)`)

This file documents how to **use** those values. Never duplicate a hex
or a recipe variant name here without it existing in the source files.
```

The `Stack` line earns its keep on the first agent run. An agent that knows it is in Chakra v3 (and not v2) will not reach for `extendTheme`, `theme.colors.brand[500]`, or `useStyleConfig` — all of which were correct in v2 and are wrong now.

---

## 1. Brand

```markdown
## 1. Brand

| Surface | Value |
|---|---|
| Product | acme — operational dashboard for mid-market service businesses |
| Audience | operations managers, finance leads, finance admins |
| Wordmark | "acme" — lowercase, Inter, weight 600 |
| Voice | direct, calm, numerate, jargon-free; never cute, never marketing |
| References we draw from | Linear, Stripe Dashboard, Notion |
| References we **avoid** | Material Design demos, generic SaaS gradients, Bootstrap chrome |
```

The "avoid" row tells the agent which design priors to suppress when it reaches into training data. Without it, you get rounded gradient buttons on a data UI by week two.

---

## 2. Tokens and semantic tokens

This is the longest section. Chakra v3's whole personality lives here.

### 2a. The principle

```markdown
Two layers:

1. **Raw tokens** — the palette. Defined in `src/theme/tokens.ts`. Numeric
   colour scales (`brand.50` … `brand.900`), spacing, radii, shadows.
   Never reference raw tokens from a component file.

2. **Semantic tokens** — meaning. Defined in `src/theme/semantic-tokens.ts`.
   `bg.canvas`, `fg.muted`, `border.subtle`, `accent.solid`. Components
   reference these and **only** these.

If you find yourself writing `color="brand.500"` in a component, you are
working at the wrong layer. Add a semantic token first, then use it.
```

The two-layer rule is the rule. Every other rule in this document is a consequence of it.

### 2b. Raw tokens — the brand palette

```ts
// src/theme/tokens.ts (excerpt)
export const tokens = defineTokens({
  colors: {
    brand: {
      50:  { value: "#EFF6FF" },
      100: { value: "#DBEAFE" },
      200: { value: "#BFDBFE" },
      300: { value: "#93C5FD" },
      400: { value: "#60A5FA" },
      500: { value: "#1E40AF" }, // <- brand anchor
      600: { value: "#1E3A8A" },
      700: { value: "#1B3173" },
      800: { value: "#172A60" },
      900: { value: "#13234E" },
    },
    accent: {
      50:  { value: "#FFF7ED" },
      100: { value: "#FFEDD5" },
      200: { value: "#FED7AA" },
      300: { value: "#FDBA74" },
      400: { value: "#FB923C" },
      500: { value: "#F97316" }, // <- accent anchor (the CTA colour)
      600: { value: "#EA580C" },
      700: { value: "#C2410C" },
      800: { value: "#9A3412" },
      900: { value: "#7C2D12" },
    },
    // success, warning, danger, info follow the same 50–900 shape.
  },
});
```

Two anchors per scale: the `500` for solid fills, the `600` for hover and pressed states. The other steps exist; the rules below say when each is allowed.

### 2c. Semantic tokens — the layer components actually touch

```ts
// src/theme/semantic-tokens.ts (excerpt)
export const semanticTokens = defineSemanticTokens({
  colors: {
    // Surfaces
    bg: {
      canvas:  { value: "{colors.gray.50}" },      // page background
      surface: { value: "{colors.white}" },         // cards, drawers, table bg
      muted:   { value: "{colors.gray.100}" },      // hover rows, chips
      subtle:  { value: "{colors.gray.50}" },       // table header bg
      inverse: { value: "{colors.gray.900}" },      // tooltip, dark callout
    },
    // Foreground (text)
    fg: {
      default: { value: "{colors.gray.900}" },      // body
      muted:   { value: "{colors.gray.600}" },      // captions, helper text
      subtle:  { value: "{colors.gray.500}" },      // metadata
      inverse: { value: "{colors.white}" },         // text on inverse bg
    },
    // Borders
    border: {
      default: { value: "{colors.gray.200}" },      // table, card outer
      subtle:  { value: "{colors.gray.100}" },      // intra-card dividers
      strong:  { value: "{colors.gray.300}" },      // focused inputs
    },
    // Actions — note the inversion, documented in 2d
    cta: {
      solid:   { value: "{colors.accent.500}" },    // primary CTA fill
      hover:   { value: "{colors.accent.600}" },
      contrast:{ value: "{colors.white}" },
    },
    secondary: {
      solid:   { value: "{colors.brand.500}" },     // secondary CTA fill
      hover:   { value: "{colors.brand.600}" },
      contrast:{ value: "{colors.white}" },
    },
    // Status
    success: { solid: { value: "{colors.success.500}" }, subtle: { value: "{colors.success.50}" } },
    danger:  { solid: { value: "{colors.danger.500}"  }, subtle: { value: "{colors.danger.50}"  } },
    warning: { solid: { value: "{colors.warning.500}" }, subtle: { value: "{colors.warning.50}" } },
    info:    { solid: { value: "{colors.info.500}"    }, subtle: { value: "{colors.info.50}"    } },
  },
});
```

Each semantic token is documented by the row that defines it. The **name is the documentation**. `border.subtle` is never "a slightly grey-ish border"; it is the divider you put between rows inside a card.

### 2d. Inverted convention — call it out

```markdown
> ⚠ **Critical convention**: the **CTA semantic group maps to the `accent`
> palette, not the `brand` palette.** The most committal action in the
> product is the warm orange `accent.500`, not the cool blue `brand.500`.
>
> Concretely: `<Button variant="solid" colorPalette="cta">` produces an
> orange button; `colorPalette="secondary"` produces a blue button.
> The brand colour is the **second** priority action on a surface.
>
> A model trained on the average React codebase will reach for
> `colorPalette="brand"` as the primary CTA. It is wrong every time. If
> you see `colorPalette="brand"` on a Save / Submit / Apply button, change
> it to `colorPalette="cta"`.
```

Every Chakra codebase I have audited has had at least one inversion of this shape. The callout costs ten lines and saves an afternoon of "why is the Save button blue when the design says orange."

### 2e. `colorPalette` — quick rules

```markdown
- **Primary CTA on any surface**: `colorPalette="cta"`. Exactly one per surface.
- **Secondary CTA**: `colorPalette="secondary"`.
- **Destructive action**: `colorPalette="danger"` (Delete, Disconnect, Revoke).
- **Status communication** (chips, alerts, banners): `success` | `warning` | `danger` | `info`.
- **Body text and links**: never set `colorPalette`. Use `color="fg.default"` or
  `color="cta.solid"` for inline links.
- **Tables, filters, page chrome**: never set `colorPalette`. They use neutral
  `gray` via the semantic `bg.*` and `border.*` tokens.
- **Gradients**: marketing and onboarding only. Never on data UI.

Choose `colorPalette` **once per surface**, at the top of the page module.
Do not pass `colorPalette` as a prop from a parent — if a child component
needs to override the palette, that is a design discussion, not a render-time
decision.
```

The "once per surface" rule is the rule that keeps the page coherent. Without it, agents will pass `colorPalette` down as a prop because that is what their training data does with `color` and `theme` props in legacy codebases.

---

## 3. Typography

```markdown
**Font family**: Inter, loaded via `@fontsource-variable/inter`.
Fallback: `ui-sans-serif, system-ui, sans-serif`.

**Scale** — defined as text-style recipes in `src/theme/text-styles.ts`.
Consume via the `textStyle` prop on `<Text>`, `<Heading>`, or `<Box>`.
Never set `fontSize`, `fontWeight`, or `lineHeight` inline.
```

```ts
// src/theme/text-styles.ts (excerpt)
export const textStyles = defineTextStyles({
  "display": {
    description: "page H1 — list page title, detail name",
    value: { fontSize: "1.5rem",  lineHeight: "2rem",    fontWeight: 600 },
  },
  "heading": {
    description: "section H2",
    value: { fontSize: "1.25rem", lineHeight: "1.75rem", fontWeight: 600 },
  },
  "title": {
    description: "card / drawer titles",
    value: { fontSize: "1rem",    lineHeight: "1.5rem",  fontWeight: 500 },
  },
  "title-sm": {
    description: "dense card titles, table-section headers",
    value: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 500 },
  },
  "body": {
    description: "DEFAULT body — table rows, form fields, paragraph copy",
    value: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 400 },
  },
  "caption": {
    description: "metadata, timestamps, helper text",
    value: { fontSize: "0.75rem",  lineHeight: "1rem",    fontWeight: 400 },
  },
  "overline": {
    description: "uppercase section labels",
    value: { fontSize: "0.75rem", lineHeight: "1rem", fontWeight: 500,
             letterSpacing: "0.08em", textTransform: "uppercase" },
  },
  "mono": {
    description: "IDs, hashes, money, quantities (tabular numbers)",
    value: { fontFamily: "mono", fontSize: "0.875rem",
             fontVariantNumeric: "tabular-nums" },
  },
});
```

```markdown
| `textStyle` | Use |
|---|---|
| `display`   | page H1 |
| `heading`   | section H2 |
| `title`     | card / drawer title |
| `title-sm`  | dense card title, table-section header |
| `body`      | **default body** — tables, fields, paragraph |
| `caption`   | helper, metadata, timestamps |
| `overline`  | uppercase section labels |
| `mono`      | money columns, IDs |

**Weights**: 400, 500, 600. **No 700.** If a piece of text needs more
emphasis than 600, change the colour to `fg.default`, do not increase weight.

**Tabular numbers** in any column with money, quantity, or count:
`textStyle="mono"` on the cell. Non-negotiable.
```

The "default body" row and the "no 700" rule are the two highest-leverage lines in this section.

---

## 4. Spacing

```markdown
Chakra's spacing scale is `4px * n`. So `p={4}` = 16px.

**Sanctioned set** — use exactly these values:

| Token | Px | Use |
|---|---|---|
| `0.5` | 2  | chip internal padding, dense table cell |
| `1`   | 4  | tightest gap (icon + label) |
| `2`   | 8  | small button padding, dense table padding |
| `3`   | 12 | table cell padding |
| `4`   | 16 | card sections, form rows, default gap |
| `6`   | 24 | page header padding, dialog padding |
| `8`   | 32 | large section gaps |

**Banned**: `1.5`, `2.5`, `3.5`, `5`, `7`, `9`, `10+`, arbitrary px (`p="13px"`),
arbitrary calc (`p="calc(4px + 2px)"`).

**Standard gaps**:
- Between cards or form sections: `gap={6}` (24px)
- Between fields inside a form: `gap={4}` (16px)
- Inline elements (icon + label): `gap={2}` (8px)
- Inside a chip / pill: `px={2} py={0.5}`
```

The ban list is doing the work. Agents will reach for `mb="13px"` to "make it look right" if you do not explicitly say "no arbitrary px."

---

## 5. Borders and radius

```markdown
**Borders** — colour comes from semantic tokens, never `gray.*` directly:

| Use                                            | Token                |
|---|---|
| Card outer, table outer                        | `border="1px solid"` + `borderColor="border.default"` |
| Intra-card divider, row separator              | `borderColor="border.subtle"` |
| Focused input ring                             | `outline="2px solid"` + `outlineColor="border.strong"` |
| Destructive confirmation outline               | `borderColor="danger.solid"` |

**Radii** — defined in `tokens.ts`:

| Token | Px | Use |
|---|---|---|
| `radii.xs`   | 2px  | tags, status dots (when not full circle) |
| `radii.sm`   | 4px  | inputs, buttons (Chakra default), chips |
| `radii.md`   | 8px  | table containers, small cards |
| `radii.lg`   | 12px | drawer content cards, form wrapper cards |
| `radii.full` | 9999px | avatars, status dots, pill chips |

Use the token name (`borderRadius="md"`), not the raw value.
```

---

## 6. Shadows

```markdown
Chakra ships a deep shadow scale (`xs` … `2xl`). The product is **flat by default**.

**Allowed**:

| Token       | Use |
|---|---|
| `shadow="xs"` | primary CTAs at rest, cards on tinted bg |
| `shadow="sm"` | dropdowns, autocomplete popovers, hover state on cards |
| `shadow="md"` | dialogs, drawers (Chakra default for these) |

**Banned**:

- ❌ `shadow="lg"`, `shadow="xl"`, `shadow="2xl"`
- ❌ Coloured shadows (`shadow="0 0 12px var(--colors-cta-solid)"`) anywhere on data UI
- ❌ Inset shadows
- ❌ Glow effects
```

Listing the bans is half the work. Agents will reach for `shadow="lg"` if you have not actively told them you cap at `md`.

---

## 7. Components — recipe by recipe

All consumer-facing components live under `src/components/ui/`. These are thin wrappers around Chakra primitives, set up by the `@chakra-ui/cli snippet add` step at project init. **Page modules never import from `@chakra-ui/react` directly.**

### Button (`src/components/ui/button.tsx`)

```tsx
import { Button } from "@/components/ui/button";

<Button variant="solid" colorPalette="cta" size="md">Save</Button>
```

Recipe defined in `src/theme/recipes/button.ts`:

```ts
export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: 500,
    borderRadius: "sm",
    transition: "background 120ms ease",
    _focusVisible: { outline: "2px solid", outlineColor: "border.strong", outlineOffset: 2 },
  },
  variants: {
    variant: {
      solid:    { bg: "colorPalette.solid", color: "colorPalette.contrast",
                  _hover: { bg: "colorPalette.hover" } },
      outline:  { borderWidth: "1px", borderColor: "colorPalette.solid",
                  color: "colorPalette.solid", bg: "transparent",
                  _hover: { bg: "colorPalette.subtle" } },
      ghost:    { color: "colorPalette.solid", bg: "transparent",
                  _hover: { bg: "colorPalette.subtle" } },
      link:     { color: "colorPalette.solid", textDecoration: "underline",
                  bg: "transparent", px: 0, h: "auto" },
    },
    size: {
      sm: { h: 8,  px: 3, fontSize: "0.8125rem" },
      md: { h: 10, px: 4, fontSize: "0.875rem"  },
      lg: { h: 12, px: 5, fontSize: "1rem"      },
    },
  },
  defaultVariants: { variant: "solid", size: "md" },
});
```

**Decoder**:

| variant | colorPalette | When |
|---|---|---|
| `solid`   | `cta`       | the single most committal action on a surface |
| `solid`   | `secondary` | second-priority action |
| `solid`   | `danger`    | destructive (Delete, Disconnect, Revoke) |
| `outline` | `cta`       | non-committal alternative to the CTA |
| `outline` | `secondary` | de-emphasised alt to secondary |
| `ghost`   | `secondary` | inline tertiary actions (Reset, Clear) |
| `link`    | `cta`       | navigational inline action inside a row |

**One `solid` + `cta` button per surface.** If you have two, you do not have a hierarchy.

### Field (`src/components/ui/field.tsx`)

The Chakra snippet wrapper around `Field.Root` / `Field.Label` / `Field.HelperText` / `Field.ErrorText`. Every form field on every surface uses this wrapper, never the raw `Field.*` parts.

```tsx
import { Field } from "@/components/ui/field";
import { Input } from "@chakra-ui/react";

<Field label="Email" helperText="We never share this." required>
  <Input {...register("email")} />
</Field>
```

**Decision table — which input belongs in the slot**:

| Scenario              | Inner component                       | Path |
|---|---|---|
| Single-line text      | `Input`                               | `@chakra-ui/react` (raw is fine inside `Field`) |
| Multi-line text       | `Textarea`                            | `@chakra-ui/react` |
| Number / currency     | `NumberInput` (project wrapper)       | `@/components/ui/number-input` |
| Single select         | `Select` (project wrapper)            | `@/components/ui/select` |
| Multi select          | `Select` (`multiple` prop)            | `@/components/ui/select` |
| Combobox / async      | `Combobox` (project wrapper)          | `@/components/ui/combobox` |
| Checkbox              | `Checkbox`                            | `@/components/ui/checkbox` |
| Switch (boolean)      | `Switch`                              | `@/components/ui/switch` |
| Radio group           | `RadioGroup`                          | `@/components/ui/radio-group` |
| Date                  | `DatePicker`                          | `@/components/ui/date-picker` |
| Date range            | `DateRangePicker`                     | `@/components/ui/date-range-picker` |
| File upload           | `FileUpload`                          | `@/components/ui/file-upload` |

One row per scenario. If a scenario has two valid components, that is a duplicate to resolve, not a choice to make.

### Card (`src/components/ui/card.tsx`) — slot recipe

```tsx
import { Card } from "@/components/ui/card";

<Card.Root>
  <Card.Header>
    <Card.Title>Books</Card.Title>
    <Card.Description>Active in the last 30 days</Card.Description>
  </Card.Header>
  <Card.Body>{children}</Card.Body>
  <Card.Footer>{actions}</Card.Footer>
</Card.Root>
```

Slot recipe in `src/theme/slot-recipes/card.ts`:

```ts
export const cardSlotRecipe = defineSlotRecipe({
  slots: ["root", "header", "body", "footer", "title", "description"],
  base: {
    root:        { bg: "bg.surface", borderRadius: "lg",
                   border: "1px solid", borderColor: "border.default" },
    header:      { p: 6, borderBottom: "1px solid", borderColor: "border.subtle" },
    body:        { p: 6 },
    footer:      { p: 6, borderTop: "1px solid", borderColor: "border.subtle",
                   display: "flex", justifyContent: "flex-end", gap: 3 },
    title:       { textStyle: "title" },
    description: { textStyle: "caption", color: "fg.muted" },
  },
  variants: {
    density: {
      comfortable: { body: { p: 6 } },
      compact:     { header: { p: 4 }, body: { p: 4 }, footer: { p: 4 } },
    },
  },
  defaultVariants: { density: "comfortable" },
});
```

**Never bypass the slot recipe** — no `<Box>` rolled by hand to simulate a card. If a card needs a variant that does not exist, add it to the recipe.

### Avatar (`src/components/ui/avatar.tsx`)

```tsx
<Avatar name="Maya Tan" src={user.avatarUrl} size="sm" />
```

| size | Diameter | Use |
|---|---|---|
| `xs` | 20px | table rows (dense) |
| `sm` | 28px | table rows (default), comment threads |
| `md` | 36px | header / nav, drawer header |
| `lg` | 48px | profile / detail page hero |

No `xl`. No `2xl`. If you need a 64px avatar, you are designing a profile page hero, and that gets its own discussion.

### Table — TanStack Table + Chakra `Table` primitives

Chakra v3 does **not** ship a `DataTable`. Tables are TanStack Table v8 wired into Chakra's `Table.Root` / `Table.Header` / `Table.Body` / `Table.Row` / `Table.Cell` primitives, via the project wrapper at `src/components/ui/data-table.tsx`.

```tsx
import { DataTable } from "@/components/ui/data-table";

<DataTable
  columns={bookColumns}
  data={books}
  getRowId={(row) => row.id}
  state={{ sorting, columnFilters }}
  onSortingChange={setSorting}
  onColumnFiltersChange={setColumnFilters}
/>
```

| Variant       | Use |
|---|---|
| `density="comfortable"` (default) | standard list pages |
| `density="compact"`               | dense data (reports, audit logs) |
| `selectable={true}`               | bulk-action lists (Orders, Books) |
| `expandable={true}`               | rows with detail panels (Reports) |

Money and quantity columns use `textStyle="mono"` on the cell. Status columns use a `Badge` with the matching `colorPalette`. No `Tooltip` on row cells unless the cell is truncated.

### Drawer (`src/components/ui/drawer.tsx`) — snippet wrapper

```tsx
import { Drawer } from "@/components/ui/drawer";

<Drawer.Root open={open} onOpenChange={setOpen} size="md">
  <Drawer.Backdrop />
  <Drawer.Positioner>
    <Drawer.Content>
      <Drawer.Header>
        <Drawer.Title>New book</Drawer.Title>
        <Drawer.CloseTrigger />
      </Drawer.Header>
      <Drawer.Body>{form}</Drawer.Body>
      <Drawer.Footer>{actions}</Drawer.Footer>
    </Drawer.Content>
  </Drawer.Positioner>
</Drawer.Root>
```

| size | Width | Use |
|---|---|---|
| `sm` | 360px | quick edits (rename, archive confirm with extra field) |
| `md` | 480px | default — create / edit forms, single-section settings |
| `lg` | 640px | multi-section forms, side-by-side comparison |
| `xl` | 100% – 240px | full-bleed editors only |

Open animation is the Chakra default (slide-in from right). No custom transitions.

### Dialog (`src/components/ui/dialog.tsx`)

Same slot shape as Drawer; use Dialog for **confirmations and single-question alerts**, not for forms. See Section 15 for the dialog-vs-drawer rule.

### Popover (`src/components/ui/popover.tsx`)

```tsx
<Popover.Root>
  <Popover.Trigger asChild><Button variant="ghost">Filters</Button></Popover.Trigger>
  <Popover.Positioner>
    <Popover.Content>…</Popover.Content>
  </Popover.Positioner>
</Popover.Root>
```

Popovers are for **transient panels** — filter pickers, column choosers, quick info. Never for forms longer than three fields (use a Drawer). Never for confirmations (use a Dialog).

### EmptyState (`src/components/ui/empty-state.tsx`)

```tsx
<EmptyState
  icon={<UsersIcon />}
  title="No books yet"
  description="Add your first book to get started."
  action={<Button variant="solid" colorPalette="cta">Add book</Button>}
/>
```

Every list page that can be empty ships an `EmptyState`. No "Nothing here" plain text. No spinner-as-empty-state. See Section 12.

### Skeleton (`@chakra-ui/react`'s `Skeleton`)

Used for **first-paint loading** only. Match the layout it replaces. See Section 10.

---

## 8. Layout patterns

Three canonical layouts. ASCII first, then the contract.

### List page

```
┌────────────────────────────────────────────────────┐
│ Module name                            [+ Create]  │ page header
├────────────────────────────────────────────────────┤
│ [search]    [Filter ▾] [Sort ▾]   [Export]         │ toolbar
├────────────────────────────────────────────────────┤
│ ☐  Col1   Col2   Col3   ...   Col6           ⋮     │ table header
├────────────────────────────────────────────────────┤
│ ... rows ...                                       │
├────────────────────────────────────────────────────┤
│ N of total                          [pagination]   │ footer
└────────────────────────────────────────────────────┘
```

- **Module name + Create button** in a `Card.Header`-like row at the top. Create button is `<Button variant="solid" colorPalette="cta">`.
- **Toolbar** sits inside the same `Card.Root` as the table, separated by `border.subtle`.
- **Table** uses `DataTable` (Section 7).
- **Footer** uses `<Pagination>` from `@/components/ui/pagination`.
- Reference implementation: `src/pages/books/BookList.tsx`.

### Drawer form

```
                              ┌───────────────────────────┐
                              │ New book         ✕   │ Drawer.Header
                              ├───────────────────────────┤
                              │ Field 1                   │
                              │ Field 2                   │
                              │ Field 3 (section break)   │
                              │ ─────────────────         │
                              │ Field 4                   │
                              │ Field 5                   │
                              ├───────────────────────────┤
                              │           [Cancel] [Save] │ Drawer.Footer
                              └───────────────────────────┘
```

- **Section breaks** are a `Divider` plus an `overline`-styled `Text` for the section title.
- **Cancel + Save** in `Drawer.Footer`, justified to the right, gap `3`.
- **Save** is `variant="solid" colorPalette="cta"`. **Cancel** is `variant="ghost" colorPalette="secondary"`.
- Reference: `src/pages/books/BookForm.tsx`.

### Detail page

```
┌────────────────────────────────────────────────────┐
│ ← Back   Book name                  [⋮ Actions]│
├────────────────────────────────────────────────────┤
│  Summary card  │  Tabs                             │
│  Avatar        │  • Overview                       │
│  Key facts     │  • Orders                       │
│                │  • Activity                       │
│                │  ─────────────────                │
│                │  ... tab body ...                 │
└────────────────────────────────────────────────────┘
```

- **Left rail** is a `Card.Root` with `density="compact"`, fixed width 280px.
- **Right pane** is a `Tabs.Root` with the tab strip in `Tabs.List` and each tab body in `Tabs.Content`.
- Reference: `src/pages/books/BookDetail.tsx`.

---

## 9. Loading and transitions

```markdown
### Rules

1. **Skeleton-match-layout.** Skeletons render at the exact dimensions and
   positions of the content they replace. Per-row, per-card, per-field.
2. **No centred full-page spinners** on list, form, or detail pages.
3. **TanStack Query's `placeholderData` / `keepPreviousData`** on paginated
   lists — never blank the table during pagination.
4. **Optimistic mutations** when the API contract permits a deterministic
   patch.
5. **Toast** for async results the user cannot see in the UI; **no toast**
   when the action's result is already visible (row removed, drawer closed).
6. **Prefetch on link hover** for primary nav and table-row links.

### Banned

- ❌ Centred `<Spinner />` as the only loading state.
- ❌ `"Loading..."` text alone.
- ❌ Custom slide-in / slide-out route transitions.
- ❌ Animated success checkmarks that block the user.
- ❌ `setTimeout` to delay any UI state for "smoothness."
```

---

## 10. Anti-patterns (banned)

```markdown
- ❌ **Direct `@chakra-ui/react` imports in page modules.** Pages import from
  `@/components/ui/*`. Only the wrappers themselves import from
  `@chakra-ui/react`.
- ❌ **Inline `css={{…}}` overrides.** If a component needs a variant that
  does not exist, add the variant to the recipe. Do not patch at the call
  site.
- ❌ **Raw tokens in component files.** `color="brand.500"` → use a semantic
  token. If none fits, add one.
- ❌ **`colorPalette` chosen at render time without a reason.** Pick once per
  surface; do not pass it as a prop from a parent.
- ❌ **Bypassing slot recipes** for Card, Dialog, Drawer, Menu, Tabs. No
  hand-rolled `<Box>` cards.
- ❌ **Hardcoded hex values** anywhere outside `src/theme/tokens.ts`.
- ❌ **Hardcoded px values** (`p="13px"`) outside the sanctioned spacing scale.
- ❌ **`fontSize`, `fontWeight`, `lineHeight` inline.** Use `textStyle="…"`.
- ❌ **Default exports** in component files. Named exports only.
- ❌ **Cross-module imports.** Never import from `pages/<OtherModule>/`.
- ❌ **Icon barrel imports.** `import { ChevronDown } from "lucide-react"`
  pulls the entire icon set into the route chunk. Use
  `lucide-react/dist/esm/icons/chevron-down` or the project's
  `<Icon name="chevron-down" />` wrapper.
- ❌ **`useStyleConfig` / `useMultiStyleConfig`.** Those are Chakra v2 APIs.
  Use `useRecipe` / `useSlotRecipe` in v3.
- ❌ **`extendTheme`.** v2 API. Use `createSystem(defaultConfig, …)` in
  `src/theme/system.ts`.
```

Twelve to fifteen entries is the sweet spot. The v2-leftover bans matter on day one of any v3 codebase — agents trained on v2 examples will produce v2 code by default if you do not name the APIs and ban them.

---

## 11. Empty states

```markdown
Every list view that can be empty ships an `EmptyState` with:

- **Icon** — Lucide, single colour, `color="fg.muted"`, 24px.
- **Title** — `textStyle="title"`, `color="fg.default"`, one short line.
- **Description** — `textStyle="body"`, `color="fg.muted"`, one or two lines.
- **Action** — exactly one button, `variant="solid" colorPalette="cta"`, the
  primary "next step" for that surface.

A filtered list with no results uses a **distinct** empty state:
`title="No results"`, action is `variant="ghost"` "Clear filters", **not**
the create-action.
```

---

## 12. Form patterns (RHF + Zod + Chakra Field)

```markdown
- **Schema** — Zod schema in `src/features/<module>/schema.ts`. Exported with
  inferred type: `export type BookInput = z.infer<typeof bookSchema>`.
- **Required strings** — `z.string().min(1, "Required")`. Never `.nonempty()`.
- **Nullable selects** — `z.string().nullable().refine(v => v !== null, "Required")`.
- **Resolver** — `zodResolver(schema)` from `@hookform/resolvers/zod`.
- **RHF mode** — `mode: "onBlur"`, `reValidateMode: "onChange"`.
- **Field wrapper** — every field uses `@/components/ui/field`. The `<Field>`
  wrapper passes `invalid` and the error text into Chakra's `Field.Root`.
- **Required indicator** — red asterisk (`color="danger.solid"`) inside the
  label. No "(required)" text.
- **Labels** — above the field, `textStyle="caption"`, `color="fg.muted"`.
- **Submit** — `variant="solid" colorPalette="cta"`, bottom-right of the form
  or `Drawer.Footer`.
- **Cancel** — `variant="ghost" colorPalette="secondary"`, left of Submit.
- **Disable Submit** while `formState.isSubmitting`. Never use a separate
  `useState` boolean.
- **Error summary** — at the top of the form, only when there are >3 invalid
  fields. Otherwise inline `Field.ErrorText` is enough.
```

---

## 13. Tables — Chakra + TanStack specifics

```markdown
- **Column definitions** live in `src/features/<module>/columns.ts`, exported
  as `ColumnDef<RowType>[]`.
- **Cell formatters** are pure functions in `src/features/<module>/format.ts` —
  never inline in the column def.
- **Row selection** uses TanStack's `getRowSelectionRow` + the project's
  `selectionColumn` helper. Never roll your own checkbox column.
- **Server-side pagination** is the default. `pageIndex` and `pageSize` live
  in URL search params, parsed via `nuqs`.
- **Filters** live in the toolbar's `Popover` (one popover per filter
  group), never in the column header.
- **Sort indicators** use Chakra's `Icon` with Lucide's `ArrowUp` /
  `ArrowDown` / `ArrowUpDown`, `boxSize={4}`, `color="fg.muted"`.
- **Sticky headers** are on by default; bottom pagination bar is sticky too.
- **Row click** navigates to the detail page. The whole row is the link
  (wrap in `<Link>`), not a "View" button at the end.
- **Bulk action bar** appears only when `selection.size > 0`; mounts in the
  toolbar slot, replacing it.
```

---

## 14. Toasts

```markdown
Use the project's `toaster` instance created in `src/lib/toaster.ts` via
Chakra's `createToaster`:

```ts
import { createToaster } from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "bottom-end",
  duration: 4000,
});
```

- **Success** — 2500ms, no action button.
- **Error** — 6000ms, may include a single action ("Retry", "Undo"), sticky
  if the action is required.
- **Info** — 3000ms. Used sparingly.
- One line. No headlines. No HTML inside the description.
- **Do not toast** on user actions that already produce a visible UI change
  (row removed, drawer closed, status badge flipped).
- **Do toast** on background results the user cannot see (export ready,
  webhook saved, sync finished).
```

---

## 15. Modals and drawers

```markdown
| Use a **Drawer** for                       | Use a **Dialog** for                      |
|---|---|
| Create / edit forms with >2 fields         | Confirmation of destructive actions       |
| Multi-section settings                     | Single-question confirmations             |
| Slide-over detail / preview panels         | "Are you sure?" before risky actions      |
| Anything that scrolls                      | Anything that fits in ≤ 3 short lines     |
```

The temptation in Chakra (and in React generally) is to reach for Dialog reflexively. The product is mostly forms; the product is mostly drawers. If you find yourself in a Dialog with more than two fields, switch to a Drawer.

---

## 16. Permission-aware rendering

```markdown
- **Use the project's `<Can>` wrapper**, not inline `if (user.role === …)`.

```tsx
import { Can } from "@/auth/Can";

<Can do="book.create">
  <Button variant="solid" colorPalette="cta">Add book</Button>
</Can>
```

- **`<Can>` returns `null` for unauthorised** — do not render a disabled
  button as a permission signal. Disabled means "valid action, not now."
  Hidden means "not for you."
- For row-level actions, pass the row as `subject`: `<Can do="order.void" subject={row}>`.
- Permission checks are pure on the client; the server is the source of truth
  and re-checks every mutation.
```

---

## 17. Accessibility

```markdown
- **Focus ring** — never disabled. The `_focusVisible` outline in the button
  recipe (Section 7) is the standard; every interactive recipe matches it.
- **Form errors** — `Field.ErrorText` is wired by the snippet to
  `aria-describedby` automatically. Do not roll your own error text.
- **Dialog and Drawer** — Chakra v3's `Dialog` and `Drawer` ship correct
  focus trap, `aria-modal`, and ESC handling. Do not override.
- **Colour-only signals are banned.** Status uses a `Badge` with both colour
  and label. Validation uses red + error text + icon.
- **Icon-only buttons** must have `aria-label`. The `<IconButton>` wrapper
  enforces this via a required prop.
- **Skip link** at the top of `RootLayout`, focusable, jumps to main content.
- **Reduced motion** — every animation in this codebase honours
  `prefers-reduced-motion`. Chakra's defaults do; custom animations must
  branch.
```

---

## 18. How AI agents use this file

```markdown
1. **Before writing any UI code**, read this file end-to-end.
2. For a **value** (colour, size, spacing, radius, shadow): look in
   Sections 2–6 first. If no token fits, propose a new semantic token before
   using a raw token inline.
3. For a **component**: look in Section 7. Use the wrapper at `@/components/ui/*`.
   If the recipe variant you need does not exist, propose it as a recipe
   change, not as an `css={{…}}` override.
4. For a **layout**: look in Section 8. Each pattern names its reference
   implementation; read that file before writing a new one of the same
   shape.
5. After writing, scan the diff against Section 10 (Anti-patterns). Any hit there
   is a blocking issue, not a nit.

Cross-reference:
- `architecture/folder-structure.md` — where files go.
- `architecture/state.md` — TanStack Query vs Zustand, plus the URL-state rules.
- `prompts/list-page.md` — list-page recipe (new module).
- `prompts/form-drawer.md` — form-drawer recipe (new entity).

This file is referenced from `CLAUDE.md` so future sessions auto-load it.
```

---

## Closing thought

Chakra v3 gives you three knobs that, taken together, make `design.md` short and load-bearing: **raw tokens, semantic tokens, recipes.** If your `design.md` documents each layer once — what the brand tokens are, what each semantic token means, and what each recipe variant is for — the agent has almost no remaining decisions to make.

The "almost" is the inverted conventions (Section 2d), the bans (Section 10), and the rules that span layers (Section 15's drawer-vs-dialog). Those are the parts an agent cannot infer from the code. Spend your words there.

Copy the document above. Replace the brand hexes, the product paragraph in Section 1, and the reference implementation paths in Section 8. Commit it next to `CLAUDE.md`. Your next agent run will be the first one in which the Save button is the right colour.

---

**A real working example.** This site's own [`design.md`][repo-design-md] is in active use (Tailwind v4 with a small custom design system, not Chakra — but the structural decisions translate directly). Part 12 of this series walks through it section by section with the rationale behind each choice.

[repo-design-md]: https://github.com/poudelprakash/personal_blog_2026/blob/main/design.md
