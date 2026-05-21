---
title: "design.md for an MUI Codebase: A Concrete Template"
date: "2026-05-13T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Part 4 was the meta-template. This is the full design.md for an MUI v6+ codebase — every token, variant, and rule, ready to copy."
cover: "/images/blog/ai/design-md-mui.png"
thumb: "/images/blog/ai/design-md-mui.png"
last_modified_at: "2026-05-13T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 7
---

Part 4 gave you the meta-template — the *shape* of a `design.md`, with MUI as the running example and translation callouts for Chakra and Tailwind. This post is what it looks like when you actually fill in the MUI version: every section populated, every token a real hex value, every variant a real MUI variant.

Steal the file. Swap the brand-specific bits — wordmark, audience, the two brand hexes — for yours. Keep everything else as-is until you have a reason to change it.

The stack assumed throughout:

- **MUI v6+** with the Pigment-CSS-or-Emotion `styled` API.
- **Emotion** for the `styled()` factory and the `sx` prop.
- **TanStack Query** for server state, **Zustand** for local UI state (only relevant in the forms and tables sections).
- **react-hook-form + Zod** for forms (only relevant in the form-patterns section).

One up-front note: the colour values below are a starter palette — a deep blue primary (`#1E40AF`) with a warm complementary accent. If you're filling this in for a real product, replace the two brand columns and leave the rest. Everything from Section 3 onwards is stack-bound, not brand-bound.

---

## Frontmatter

The block your `design.md` opens with — paths to the source-of-truth files, scope, last-updated date.

```markdown
# product-name — design.md

> Canonical design memory. Every AI session and human contributor reads this
> **before** writing UI. If a value isn't here, propose it as an addition
> before using it inline.

**Last updated**: 2026-05-13
**Scope**: `src/` (the web app package).
**Source of truth for values**:
- `src/assets/colors/colors.ts` — hex tokens (primary, accent, status, grey scale).
- `src/theme/palette.ts` — MUI palette wiring.
- `src/theme/typography.ts` — variant scale.
- `src/theme/components/*.ts` — per-component variant overrides
  (`Button.ts`, `TextField.ts`, `Chip.ts`, …).
- `src/theme/index.ts` — `createTheme` composition.

This file documents how to *use* the tokens; it never duplicates a hex
value without a corresponding token in the source of truth.
```

The path list is non-negotiable. Agents need to know where to grep when this file is silent on a value.

---

## 1. Brand

```markdown
## 1. Brand

| Surface | Value |
|---|---|
| Product | <one-line product description> |
| Audience | <who this is for — be specific; not "everyone"> |
| Wordmark | <how the name appears: case, spacing, em-dash rules> |
| Voice | <3–5 traits, e.g. "direct, technical, no exclamation marks"> |
| References we draw from | <2–3 products we deliberately resemble> |
| References we **avoid** | Material Design demos, Bootstrap, Salesforce Lightning, generic SaaS gradient hero pages |
```

The "avoid" row tells the agent which design priors to suppress. Without it, MUI codebases drift toward Material Design demo defaults every time an agent fills in a blank surface.

---

## 2. Colour

### 2a. The principle

```markdown
All colours are hex tokens exported from `src/assets/colors/colors.ts` and
wired into the MUI palette via `src/theme/palette.ts`. **Never hardcode
hex values in component files.** Import the token namespace:

✅ `import { colors } from 'assets/colors';` then `colors.primary.main`.
✅ Inside `sx`: `sx={{ color: 'primary.main' }}` — resolves through the theme.
❌ `sx={{ color: '#1E40AF' }}`
❌ `style={{ backgroundColor: '#1E40AF' }}`
```

### 2b. The palettes

```markdown
**Primary — deep blue** (`colors.primary`). Used for navigation chrome,
headlines, the contained-secondary button background, link text.

| Token            | Hex      | Use |
|---|---|---|
| `primary.main`   | #1E40AF  | nav chrome, page headlines, contained-secondary bg, body links |
| `primary.dark`   | #1E3A8A  | hover-darker on chrome, contained-secondary border on hover |
| `primary.light`  | #3B82F6  | de-emphasised primary text, selected-row highlight |
| `primary.contrastText` | #FFFFFF | text on `primary.main` surfaces |

**Accent — warm amber-orange** (`colors.accent`). The most committal action
on any surface. Used **only** as a CTA colour — never on chrome, never on
body text, never on chart fills.

| Token            | Hex      | Use |
|---|---|---|
| `accent.main`    | #EA580C  | contained-primary bg, primary CTA in dialogs/drawers |
| `accent.dark`    | #C2410C  | hover/active for primary CTAs |
| `accent.light`   | #FB923C  | focus ring on contained-primary |
| `accent.contrastText` | #FFFFFF | text on `accent.main` |

**Status palettes** (`colors.error`, `colors.warning`, `colors.success`, `colors.info`):

| Palette  | main    | dark    | light   | Use |
|---|---|---|---|---|
| `error`  | #DC2626 | #991B1B | #FCA5A5 | destructive actions, required-field asterisk, validation errors |
| `warning`| #D97706 | #92400E | #FCD34D | non-blocking warnings, "needs attention" chips |
| `success`| #16A34A | #15803D | #86EFAC | success toasts, completed-state chips |
| `info`   | #0284C7 | #075985 | #7DD3FC | informational banners, neutral-status chips |

**Grey scale** (`colors.grey`). Eleven steps; we use seven.

| Token        | Hex      | Use |
|---|---|---|
| `grey.50`    | #F9FAFB  | page background |
| `grey.100`   | #F3F4F6  | table zebra, hovered row, disabled bg |
| `grey.200`   | #E5E7EB  | default border (`1px solid`) |
| `grey.300`   | #D1D5DB  | input border, divider on tinted bg |
| `grey.500`   | #6B7280  | secondary text, helper text, placeholders |
| `grey.700`   | #374151  | body text (`body2` default colour) |
| `grey.900`   | #111827  | headlines, emphasised body |

Banned greys: `grey.400`, `grey.600`, `grey.800` — we do not use them. If
you reach for one, you're picking a value that doesn't have a documented
role.
```

### 2c. Inverted convention — call it out

```markdown
> ⚠ **Critical convention**: in `src/theme/components/Button.ts`, the
> `containedPrimary` variant renders with the **accent** palette as the
> background and primary-on-white text — *inverted* from what MUI's
> default palette wiring suggests. This is intentional: the accent is the
> most committal action on any surface. `containedSecondary` is the
> plain-primary-blue button.
>
> This is the single most-violated rule by AI agents working in this
> codebase. The model's training-data prior says `containedPrimary` is the
> brand primary colour; in this codebase, it is the brand accent.
```

I've seen this exact inversion in three separate MUI codebases I audited. Every one of them produced wrong-coloured buttons from agents until the callout was added to `design.md`. After the callout, the error rate dropped to near zero in a week.

### 2d. Quick rules

```markdown
- **Primary CTA on any surface**: `<Button variant="contained" color="primary">` — renders accent-orange. Exactly **one per surface**.
- **Secondary CTA**: `<Button variant="contained" color="secondary">` — renders primary-blue.
- **Destructive**: `<Button variant="contained" color="error">`.
- **Status communication**: `success`, `warning`, `error`, `info` — never `grey` and never the brand pair for status.
- **Body copy links**: `primary.main`. Never accent.
- **Tables, filters, chrome**: `grey.*` tokens only.
- **Gradients**: onboarding / marketing surfaces only. Never on data UI.
```

---

## 3. Typography

```markdown
## 3. Typography

**Font family**: Inter. Fallback: `ui-sans-serif, system-ui, sans-serif`.
Loaded from `src/assets/fonts/inter/` and wired into `theme.typography.fontFamily`.

**Scale** — defined in `src/theme/typography.ts`. Use MUI's
`<Typography variant="…">` (or the project's `atoms/Typography` wrapper).
Never hand-roll `fontSize` inline.

| Variant     | Size      | Weight | Line-height | Use |
|---|---|---|---|---|
| `h1`        | 2.5rem    | 500    | 1.2  | reserved — marketing only |
| `h2`        | 2rem      | 500    | 1.25 | reserved — marketing only |
| `h3`        | 1.75rem   | 500    | 1.3  | reserved — marketing only |
| `h4`        | 1.5rem    | 500    | 1.33 | page H1 (list-page title, detail-page name) |
| `h5`        | 1.25rem   | 500    | 1.4  | section H2 (drawer title, dialog title) |
| `h6`        | 1.125rem  | 500    | 1.45 | card title, table-section header |
| `subtitle1` | 1rem      | 500    | 1.5  | dense card title, popover header |
| `subtitle2` | 0.875rem  | 500    | 1.55 | form-section label, drawer subsection |
| `body1`     | 1rem      | 400    | 1.5  | reserved — long-form content (rare in app shell) |
| `body2`     | 0.875rem  | 400    | 1.55 | **default body** — table rows, form fields, dialog body |
| `caption`   | 0.75rem   | 400    | 1.6  | metadata, timestamps, helper text under inputs |
| `overline`  | 0.75rem   | 500    | 1.6  | uppercase section labels (`letter-spacing: 0.08em`) |

**Weights**: 400, 500. **No 600, no 700** for body text — emphasis uses
weight 500 with `grey.900` colour, not heavier weight.

**Tabular numbers**: any money, quantity, count, or duration column must
use `font-variant-numeric: tabular-nums`. The `atoms/MoneyCell` and
`atoms/NumberCell` wrappers handle this; do not roll your own.
```

The "default body" annotation on `body2` and the "no 600/700" rule together kill 80% of the typography drift I see. Without them, agents reach into the full variant set on every label and produce a different size on every screen.

---

## 4. Spacing

```markdown
## 4. Spacing

MUI's spacing scale: `theme.spacing(n)` where `n * 8 = px`. Use the scale
via `sx`, `styled`, or `Box` shorthand — never magic px values.

| `theme.spacing` | Px | Use |
|---|---|---|
| `0.5` | 4   | tightest gap (chip internal padding, icon-text gap in dense cells) |
| `1`   | 8   | dense table cells, small button padding, inline icon+label |
| `2`   | 16  | card sections, form rows, default card padding |
| `3`   | 24  | page-header padding, dialog content padding, form-section gap |
| `4`   | 32  | large section gaps on detail pages |
| `6`   | 48  | empty-state vertical padding |
| `8`   | 64  | marketing surfaces only |

**Standard gaps**:
- Between cards / form sections: `gap: 3` (24px)
- Between fields inside a form: `gap: 2.5` (20px) — written as `gap: '20px'` is also acceptable; both compile to the same value
- Inline elements (icon + label): `gap: 1` (8px)
- Page-header padding: `pt: 2, px: 3, pb: 1`

Banned values: `theme.spacing(5)`, `theme.spacing(7)`, and any
ad-hoc `mt="13px"` style props. Pick from the table or propose an
addition.
```

---

## 5. Borders + radius

```markdown
## 5. Borders + radius

- **Default visible separator** (on white): `1px solid ${grey.200}`
- **Subtle inner divider** (between rows in a card): `1px solid ${grey.100}`
- **Component border** (inputs, outlined buttons): `1px solid ${grey.300}`
- **Hover border on outlined**: `1px solid ${primary.main}`
- **Focus border on inputs**: `2px solid ${primary.main}` (via MUI default outline behaviour)

**Radius scale** (`theme.shape.borderRadius` defaults to 4):

| Value | Use |
|---|---|
| `4px`  | inputs, buttons, chips (MUI default) |
| `8px`  | table containers, small cards, popovers |
| `12px` | drawer content cards, form wrapper cards, dialog surfaces |
| `9999px` | avatars, status dots, pill chips |

`16px` and above are banned outside marketing surfaces.
```

---

## 6. Shadows

```markdown
## 6. Shadows

MUI's `theme.shadows[0..24]` is largely **not used**. App surfaces are
flat on a `grey.50` field. Reserved usages:

- `theme.shadows[1]` — primary CTAs on tinted backgrounds, hovered cards.
- `theme.shadows[2]` — autocomplete popovers, menu, popover.
- `theme.shadows[4]` — dialogs, drawers (MUI default for both).

Banned: `theme.shadows[3]`, `theme.shadows[5..24]`. No coloured shadows.
No glow effects. No `box-shadow: inset` on data UI.
```

Banning the rest by name is doing the heaviest lifting in this section. Without the explicit ban, agents reach for `theme.shadows[8]` the moment they want "a bit more elevation."

---

## 7. Components — usage rules

The longest section. Each primitive has the same shape: import path, code example, variant table with a "When" column, then constraints.

### Button

```markdown
### Button (`components/atoms/Button`)

```tsx
import { Button } from 'components/atoms/Button';

<Button variant="contained" color="primary" size="medium">Save</Button>
```

**Variant + colour decoder** — palette is inverted (see Section 2c):

| Variant     | Color       | Visual                           | When |
|---|---|---|---|
| `contained` | `primary`   | **Accent-orange bg, white text** | the single most committal action on the surface |
| `contained` | `secondary` | **Primary-blue bg, white text**  | second-priority action (Save Draft, Apply Filter) |
| `contained` | `error`     | Red bg, white text               | destructive (Delete, Disconnect, Revoke) |
| `outlined`  | `primary`   | Accent border, accent text       | non-committal alternative to the primary CTA |
| `outlined`  | `secondary` | Primary-blue border + text       | de-emphasised secondary (Cancel in a drawer footer) |
| `text`      | `primary`   | Accent text, transparent bg      | tertiary inline (Clear, Reset, "Show more") |
| `text`      | `secondary` | Primary-blue text, transparent   | navigation-like inline actions |

**Sizes**: `small` (32px height), `medium` (40px, default), `large` (48px, dialogs only).

**Constraints**:
- ✅ Exactly **one** `contained color="primary"` per surface.
- ❌ Never two `contained` buttons sitting side-by-side with both as `primary`.
- ❌ Never use `@mui/material/Button` directly in a page module — go through `atoms/Button`.
- ❌ No `<Button>Click</Button>` — every button has a verb label.
```

### Typography

```markdown
### Typography (`components/atoms/Typography`)

```tsx
import { Typography } from 'components/atoms/Typography';

<Typography variant="body2" color="text.secondary">Last updated 2 hours ago</Typography>
```

Wraps MUI's `Typography` and forbids passing `fontSize` / `fontWeight`
inline (compile-time error). Forces a variant.

**Colour prop**: use the theme path strings — `text.primary`, `text.secondary`, `text.disabled`, `primary.main`, `error.main`. Never hex.
```

### Form fields

```markdown
### Form fields

Decision table. One row per scenario; one component per row.

| Scenario | Component | Path |
|---|---|---|
| Single-line text / textarea | `FormTextField` | `components/molecules/FormTextField` |
| Number / currency           | `FormDecimalField` | `components/molecules/FormDecimalField` |
| Single-select (≤ 10 options)| `FormSelect`    | `components/molecules/FormSelect` |
| Single-select (searchable)  | `FormAutocomplete` | `components/molecules/FormAutocomplete` |
| Multi-select                | `FormMultiAutocomplete` | `components/molecules/FormMultiAutocomplete` |
| Checkbox (single)           | `FormCheckbox`  | `components/molecules/FormCheckbox` |
| Radio group                 | `FormRadioGroup`| `components/molecules/FormRadioGroup` |
| On/off toggle               | `FormSwitch`    | `components/atoms/FormSwitch` |
| Date picker                 | `FormDatePicker`| `components/molecules/FormDatePicker` |
| Date range                  | `FormDateRange` | `components/molecules/FormDateRange` |
| File upload                 | `FormFileUpload`| `components/molecules/FormFileUpload` |

All wrappers are RHF-aware: they accept `name` + the form's `control` and
wire up validation, error display, and required-asterisk rendering. **Do
not** drop down to `<TextField>` / `<Autocomplete>` from `@mui/material`
inside a page module. If a scenario isn't in the table, add a row before
writing the component inline.
```

### Chip

```markdown
### Chip (`components/atoms/StatusChip`, `components/atoms/Chip`)

| Use case | Component | Props |
|---|---|---|
| Status communication | `StatusChip` | `status="success" \| "warning" \| "error" \| "info" \| "neutral"` |
| Filter / removable tag | `Chip` (MUI) via `atoms/Chip` wrapper | `onDelete` for removable |
| Read-only metadata pill | `atoms/Chip` | `variant="outlined"` |

**Never** colour a chip outside the five status values for status
communication. Custom-colour chips on data tables = visual noise.
```

### Avatar

```markdown
### Avatar (`components/atoms/Avatar`)

- Sizes: 24 (table-cell), 32 (default), 40 (drawer header), 64 (detail page).
- Fallback: user initials, `grey.200` bg, `grey.700` text.
- Image avatars: `loading="lazy"`. Never block render on avatar fetch.
- Never use `<img>` directly for user photos — always `atoms/Avatar`.
```

### Table

```markdown
### Table — TanStack Table v8 (`components/organisms/DataTable`)

We use **TanStack Table** for headless logic + MUI primitives for chrome.
No `@mui/x-data-grid`. Reference implementation: `pages/Customers/CustomersList/`.

```tsx
import { DataTable } from 'components/organisms/DataTable';

<DataTable
  columns={customerColumns}
  data={customers}
  pagination={{ pageSize: 50 }}
  onRowClick={openDetail}
  isLoading={query.isLoading}
/>
```

**Column definitions** live in a sibling `columns.ts`. Cell renderers
that need formatting use the `atoms/MoneyCell`, `atoms/DateCell`,
`atoms/NumberCell` wrappers (tabular-nums, locale-aware).

**Constraints**:
- ✅ Server-side pagination + sorting for any list ≥ 1k rows.
- ✅ Row click opens detail in a drawer (default) or navigates (when the row's domain has a full detail page).
- ❌ No nested tables. Use a detail drawer instead.
- ❌ No horizontal scroll on the primary data axis — collapse columns into an overflow menu.
```

### Drawer

```markdown
### Drawer (`components/molecules/Drawer`)

Anchored right. Widths: `sm` (480px), `md` (640px, default), `lg` (840px).

```tsx
<Drawer open={open} onClose={close} width="md" title="Edit customer">
  <DrawerBody>…fields…</DrawerBody>
  <DrawerFooter>
    <Button variant="text" color="secondary" onClick={close}>Cancel</Button>
    <Button variant="contained" color="primary" type="submit">Save</Button>
  </DrawerFooter>
</Drawer>
```

- Title at the top, sticky.
- Footer at the bottom, sticky, right-aligned, primary CTA right-most.
- Body scrolls. Header + footer never scroll.
```

### Dialog

```markdown
### Dialog (`components/molecules/Dialog`)

For confirmations and single-question prompts only. **Not for forms** —
those go in drawers.

```tsx
<Dialog open={open} onClose={close} title="Delete invoice?" severity="error">
  <DialogBody>This action cannot be undone.</DialogBody>
  <DialogFooter>
    <Button variant="text" color="secondary" onClick={close}>Cancel</Button>
    <Button variant="contained" color="error" onClick={confirm}>Delete</Button>
  </DialogFooter>
</Dialog>
```

Max width `sm` (440px). One question per dialog. No tabs in dialogs.
```

### Popover

```markdown
### Popover (`components/molecules/Popover`)

For lightweight contextual UIs: column-filter pickers, share-link
popovers, kebab-menu surfaces. Anchored to the trigger element.

- Max width: 360px.
- No forms with > 3 fields. Promote to a drawer.
- Closes on outside-click, Escape, or scroll of the underlying surface.
```

### EmptyState

```markdown
### EmptyState (`components/molecules/EmptyState`)

```tsx
<EmptyState
  illustration="no-customers"
  title="No customers yet"
  description="Add your first customer to start invoicing."
  action={<Button variant="contained" color="primary">Add customer</Button>}
/>
```

Illustrations live in `src/assets/illustrations/`. Use the named set;
never inline SVG in a page module.
```

### Skeleton

```markdown
### Skeleton (`components/atoms/Skeleton`)

Matches the **exact** dimensions of the content it replaces. Per-field,
per-row, per-card.

- `variant="text"` for inline text.
- `variant="rectangular"` for cards / blocks.
- `variant="circular"` for avatars / dots.

Never a centred `<CircularProgress />` on list pages, forms, or detail
pages.
```

---

## 8. Layout patterns

ASCII diagrams plus contracts. Three canonical patterns: list page, drawer form, detail page.

### List page

```markdown
### List page

```
┌──────────────────────────────────────────────┐
│ Module Name                                  │  app-shell top bar
├──────────────────────────────────────────────┤
│ [search]              [Filter ▾] [+ Create]  │  inside <Box id={HEADER_ID}>
│ Tab strip                                    │  inside same Box
├──────────────────────────────────────────────┤
│ ☐  Col1  Col2  Col3   ...               ⋮   │  TanStack Table header
├──────────────────────────────────────────────┤
│ ...rows...                                   │
├──────────────────────────────────────────────┤
│ N of total                      [pagination] │  TableFooter
└──────────────────────────────────────────────┘
```

- Filter bar + tabs **both inside** `<Box id={HEADER_ID}>` so the dynamic
  height measures them together.
- `tableHeight = calc(100vh - headerHeight - TABS_HEIGHT - TOP_BAR_HEIGHT - FOOTER_HEIGHT)`.
- Header padding: `pt: 2, px: 3, pb: 1`.
- Actions-column header bg: `grey.100`.
- Reference implementation: `pages/Customers/CustomersList/`.
```

### Drawer form

```markdown
### Drawer form

```
┌──────────────────────────────────┐
│ Edit customer            [×]     │  sticky header (h5, divider below)
├──────────────────────────────────┤
│ Section: Details                 │  subtitle2
│ [Name           ]                │
│ [Email          ]                │
│                                  │
│ Section: Billing                 │
│ [Address        ]                │
│ ...                              │
├──────────────────────────────────┤
│              [Cancel]   [ Save ] │  sticky footer
└──────────────────────────────────┘
```

- Header: `<Typography variant="h5">`, divider below.
- Sections: `<Typography variant="subtitle2">`, `mb: 2`.
- Field gap: `gap: 2.5`.
- Footer: `Cancel` (text + secondary), `Save` (contained + primary, accent).
- Reference: `pages/Customers/CustomerDrawerForm/`.
```

### Detail page

```markdown
### Detail page

```
┌──────────────────────────────────────────────┐
│ ← Back   Customer name           [⋮ actions] │  page header (h4)
├──────────────────────────────────────────────┤
│ ┌── Summary card ──┐  ┌── Stats card ──┐    │
│ │ key facts        │  │ counts / kpis  │    │
│ └──────────────────┘  └────────────────┘    │
├──────────────────────────────────────────────┤
│ Tabs: Overview | Invoices | Activity         │  MUI Tabs
├──────────────────────────────────────────────┤
│ ...tab body...                               │
└──────────────────────────────────────────────┘
```

- Two-column summary uses MUI `Box` with `display: 'grid'`,
  `gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }`, `gap: 3`.
- Never `Grid container` — we use CSS Grid via `Box` for predictability.
- Reference: `pages/Customers/CustomerDetail/`.
```

The "never `Grid container`" line is doing real work. MUI's `<Grid>` API is one of the most agent-confusing surfaces in v6+ — half the training data is v4 syntax. Standardising on `Box` with CSS Grid removes the choice.

---

## 9. Loading + transitions

```markdown
## 9. Loading + transitions

### Rules

1. **Skeleton-match-layout**: skeletons match the exact dimensions and
   positions of the content. Per-field, per-row, per-card.
2. **No centered full-page spinners** on list pages, forms, or detail pages.
3. **Optimistic mutations** via TanStack Query's `onMutate` where the API
   contract permits (idempotent endpoints, predictable response shape).
4. **Toast for async results**, not for user-initiated submits that
   already produce a UI change (row disappears, drawer closes, etc.).
5. **Prefetch on hover** for navigation links via TanStack Query's
   `prefetchQuery`.

### Banned

- ❌ Centered `<CircularProgress />` as the only loading state.
- ❌ "Loading..." text alone.
- ❌ Slide-in / slide-out route transitions (use MUI's default `Fade` or none).
- ❌ Animated success checkmarks that block the user.
- ❌ Backdrop spinners on mutation. Use button-level loading state instead.
```

---

## 10. Anti-patterns (banned)

The most useful section for agents. `❌` for every entry.

```markdown
## 10. Anti-patterns (banned)

- ❌ **Hex literals outside `src/assets/colors/colors.ts`.** Including in `sx`, `styled`, `style`, theme overrides, SVG inline `fill`.
- ❌ **Direct `@mui/material/X` imports in page modules.** Always go through `components/atoms/X` or `components/molecules/X`. The wrappers exist to encode this codebase's conventions; bypassing them re-introduces the drift.
- ❌ **Inline `sx={{ … }}` objects with more than 3 keys.** Move to a sibling `style.ts` exporting a typed `SxProps<Theme>` constant.
- ❌ **`MuiButton-root` / `.MuiOutlinedInput-root` class overrides** in component CSS. Use `theme.components.MuiButton.styleOverrides` in `src/theme/components/Button.ts` instead.
- ❌ **Barrel imports from `@mui/icons-material`.** `import { ChevronDown, Trash } from '@mui/icons-material'` pulls the entire icon bundle. Use the per-icon entry point: `import ChevronDown from '@mui/icons-material/ChevronDown'`.
- ❌ **TypeScript escape hatches.** No `any`, no `as any`, no `@ts-ignore`, no `@ts-nocheck`.
- ❌ **Default exports** in component files. Named exports only — they grep better and tooling renames them safely.
- ❌ **Cross-module imports.** Never `import` from `pages/AnotherModule/`. Shared logic goes to `components/` or `utils/`.
- ❌ **Two `containedPrimary` buttons on the same surface.** Pick one. The whole hierarchy collapses if there are two.
- ❌ **`enum` for new code.** Use `const` objects with `as const` and a derived union type.
- ❌ **`@mui/material/Grid` `container`/`item` syntax.** Use `Box` with `display: 'grid'` (see Section 8 detail page).
- ❌ **Inline `useState` for form fields.** Forms go through react-hook-form (Section 13).
- ❌ **Direct `fetch()` / `axios` in components.** All server state through TanStack Query hooks in `features/<domain>/queries.ts`.
- ❌ **`<img>` for user-uploaded media.** Use `atoms/Avatar` or `atoms/Image` (which handles lazy-load + fallback).
- ❌ **`zIndex` literals.** Use `theme.zIndex.appBar | drawer | modal | snackbar | tooltip` only.
```

15 entries. More and the agent loses track; fewer and you've under-specified.

---

## 11. Empty states

```markdown
## 11. Empty states

Every list, every tab, every table gets an empty state. None of:
"no data found", a sad-face icon, or a blank surface.

Structure:
- Illustration (from `assets/illustrations/`)
- Title (`subtitle1`, `grey.900`)
- Description (`body2`, `grey.500`, 1–2 sentences max)
- Primary action button (when relevant)

Use `components/molecules/EmptyState` — see Section 7 Components.

Two flavours:
- **First-time empty** (user has none of X yet): action present, copy invites creation.
- **Filter-empty** (search/filter returned no matches): action is "Clear filters", copy says no matches.
```

---

## 12. Form patterns (react-hook-form + Zod)

```markdown
## 12. Form patterns

- **Validation**: Zod schemas live in `features/<domain>/schemas.ts`,
  exported alongside the inferred type:
  ```ts
  export const customerSchema = z.object({ … });
  export type CustomerForm = z.infer<typeof customerSchema>;
  ```
- **RHF setup**: `useForm({ resolver: zodResolver(customerSchema), mode: 'all', defaultValues })`.
- **Required strings**: `z.string().min(1, 'Name is required')` — never `.nonempty()` (deprecated in Zod 4+).
- **Nullable selects**: `z.string().nullable().refine(v => v !== null, 'Required')`.
- **Numbers from text inputs**: `z.coerce.number().min(0)` — never parse manually.
- **Field components**: always the `Form*` wrappers from Section 7. They wire `name`, `control`, error display, and required-asterisk automatically.
- **Labels**: above the field, `caption` weight 500, `grey.700`.
- **Required indicator**: red asterisk after the label (`error.main`). No parenthesised "(required)".
- **Submit button**: bottom of drawer/form, `contained` `primary` (accent), label is a verb (`Save`, `Create customer`, never `Submit`).
- **Cancel button**: only when the form is in a drawer/dialog. Page-level forms have no cancel — they navigate away via the back link.
- **Server errors**: surface via `setError('root.serverError', …)` and render at the top of the form, above the first field.
```

---

## 13. Tables (specific)

```markdown
## 13. Tables — specific rules

- **Selection column**: leftmost, `width: 48px`, checkbox-only, no header label.
- **Actions column**: rightmost, `width: 56px`, kebab icon button, header bg `grey.100`.
- **Money columns**: right-aligned, `MoneyCell` wrapper (tabular-nums, currency-aware).
- **Date columns**: left-aligned, `DateCell` wrapper (relative ≤ 7 days, ISO date beyond).
- **Status columns**: `StatusChip`, no raw text.
- **Empty cell**: render `—` (em-dash, `grey.500`), never empty string or `null`.
- **Row hover**: `grey.50` bg, `cursor: pointer` only if the row is clickable.
- **Selected row**: `primary.light` bg at 20% alpha (`alpha(primary.light, 0.2)`).
- **Sticky header**: always. Sticky first column only when ≥ 6 columns visible.
- **Column resize**: enabled for text columns, disabled for fixed-width (selection, actions, status).
- **Pagination**: server-side for ≥ 1k rows; client-side acceptable below.
```

---

## 14. Toasts

```markdown
## 14. Toasts

Use the project's `useToast` hook (`features/toast/useToast.ts`).
Backed by `notistack` under the hood; do not call notistack directly.

- Position: bottom-right.
- Success: 3s. Info: 4s. Warning: 5s. Error: sticky until dismissed if actionable, 6s otherwise.
- One line. No headlines. No HTML, no links inside the message (use the `action` slot for an actionable button).
- **Don't toast on direct user actions** that already produce a UI change (row disappears, drawer closes, chip flips state).
- **Do toast on background results**: optimistic mutation reconciliation, server-pushed events, post-navigation outcomes.
```

---

## 15. Modals + drawers

```markdown
## 15. Modals + drawers

| Use a **drawer** for | Use a **dialog** for |
|---|---|
| Create / edit forms with > 2 fields | Confirmation of destructive actions |
| Multi-section settings | Single-question confirmations |
| Slide-over detail panels with their own scroll | Alerts before risky actions |
| Anything the user might want to keep open while comparing | Anything that must block until answered |

Default to drawer. Reach for dialog only when the action is **blocking
and binary**.
```

The drawer-vs-dialog table is one of the most-referenced sections of any `design.md` in practice. Agents default to dialogs because their training data is full of them. The table re-balances toward drawers.

---

## 16. Permission-aware rendering

```markdown
## 16. Permission-aware rendering

- Use `usePermissions()` from `features/auth/usePermissions.ts`.
- Hide actions the user cannot perform; do not render them disabled. (Exception: bulk-action toolbars in tables, where disabled communicates "select rows first" — not a permission state.)
- For routes: the route guard handles redirect; do not duplicate permission checks at the page level.
- For sections within a page that may be partially permitted: render the section with a `<PermissionGate permission="…">` wrapper. The gate renders nothing when denied; never an "Access denied" placeholder mid-page.
```

---

## 17. Accessibility

```markdown
## 17. Accessibility

- Every interactive element has a visible label or an `aria-label`. Icon-only buttons → `aria-label` required.
- Focus ring: MUI default. Never `outline: none` without a replacement.
- Forms: every input has a `<label>` (the `Form*` wrappers handle this).
- Dialogs / drawers: focus traps via MUI defaults — never disable. Initial focus on the first interactive element.
- Colour contrast: body text ≥ 4.5:1 against background. The grey scale in Section 2 is contrast-checked against `grey.50` and white.
- Motion: respect `prefers-reduced-motion`. The `useReducedMotion` hook returns the user's preference; gate non-essential transitions behind it.
- Keyboard: tab order follows visual order. Skip link at the top of every page jumps to `<main id="main">`.
```

---

## 18. How AI agents use this file

```markdown
## 18. How AI agents use this file

1. **Before writing any UI code**, read this file in full. It is short on
   purpose.
2. If you need a colour / size / spacing value, check Section 2–6 first. If the
   value isn't here, check the source-of-truth file listed in the
   frontmatter. If it isn't there either, **propose adding it** before
   writing inline.
3. If you need a component pattern, check Section 7. Use the existing primitive
   from `components/atoms` or `components/molecules`; do not reinvent.
4. For a list page, drawer form, or detail page, read the reference
   implementation linked in Section 8 before writing.
5. When you finish a UI change, scan the diff against Section 10 (anti-patterns).
   Every `❌` is a blocker.

Cross-references (other docs in this repo):

- `architecture/folder-structure.md` — where new files go.
- `architecture/styleguide.md` — *how* to author styles (`sx` vs `styled()`, file naming).
- `prompts/listPageMigration.md` — recipe for migrating an old list page.
- `prompts/formMigration.md` — recipe for migrating a form to RHF + Zod.

This file is referenced from `CLAUDE.md` so future sessions auto-load it.
```

---

## Closing thought

This is one MUI codebase's `design.md`. Yours will diverge — different brand hexes, different module names, maybe a different table library, maybe `@mui/x-data-grid` instead of TanStack Table. The structure should not diverge. The 18 sections above cover every surface an agent touches on a typical UI task; cut a section only if you've actively decided not to have that surface.

The two sections worth the most attention when you fill this in for your own product:

1. **Section 2c — the inverted convention callout.** Find the place where your codebase's colour wiring disagrees with MUI's default semantics, and name it loudly. This single callout removes more agent mistakes than any other line in the file.
2. **Section 10 — anti-patterns.** Write the bans bluntly. Agents pattern-match against `❌` lists better than against prose.

Once `design.md` is in this shape, the next time an agent opens your repo to add a button, it gets the right colour, the right variant, the right import path, and the right surrounding spacing on the first try. Not because it's smarter — because there's only one answer to find.

---

**A real working example.** This site's own [`design.md`][repo-design-md] is in active use (Tailwind v4, not MUI — but the *shape* matches the template above). Part 12 of this series walks through it section by section with the decisions behind each choice.

[repo-design-md]: https://github.com/poudelprakash/personal_blog_2026/blob/main/design.md
