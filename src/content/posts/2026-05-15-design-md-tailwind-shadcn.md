---
title: "design.md for a Tailwind + shadcn/ui Codebase"
date: "2026-05-15T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Utility-first codebases need a design.md more, not less. Without one, agents reach for every utility class in the bundle. Here is the full file."
cover: "/images/blog/ai/design-md-tailwind.png"
thumb: "/images/blog/ai/design-md-tailwind.png"
last_modified_at: "2026-05-15T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 9
---

The reflex on a utility-first codebase is to skip `design.md` entirely. The argument goes: *the utilities **are** the system — Tailwind already picked the colours, the spacing, the radii, the shadows. What is there left to document?*

This is exactly backwards. With a component-variant library (MUI, Chakra), the constraint surface is the curated variant list — `variant="contained"`, `colorPalette="brand"`, a dozen options. With Tailwind, the constraint surface is **the entire utility bundle**: every colour at every step, every spacing value through the scale, every shadow tier, every arbitrary `[14px]` escape hatch. An agent without a `design.md` will reach for any of them. And it will reach for a different one each time.

Utility-first codebases need a `design.md` **more**, not less. The job of the file is to take the infinite-surface bundle and carve out the ~40 utilities that are actually sanctioned in this codebase, plus the ~12 component recipes built on top.

This post is the complete `design.md` for a Tailwind v4 + shadcn/ui codebase. Stack: Tailwind CSS v4 (CSS-config), shadcn/ui primitives in `src/components/ui/`, Radix Primitives underneath, CVA for variants, `clsx` + `tailwind-merge` via a `cn()` helper, TanStack Query, Zustand, react-hook-form + Zod. Module names below — Customers, Invoices, Reports — are placeholders for your real domain.

---

## Frontmatter — top of the file

```markdown
# product-name — design.md

> Canonical design memory for a Tailwind v4 + shadcn/ui codebase.
> Every AI session and human contributor reads this **before** writing UI.
> If a token, utility, or variant you need isn't here, propose adding it
> before reaching for an arbitrary value.

**Last updated**: YYYY-MM-DD
**Scope**: `src/`
**Source of truth for values**:
- CSS variables — `src/styles/globals.css` (`@theme` block)
- Primitives — `src/components/ui/*.tsx` (shadcn-generated)
- Variant recipes — colocated `*.variants.ts` next to each primitive
- Utility composition helper — `src/lib/utils.ts` (`cn()`)

This file documents how to **use** those values. Never duplicate a hex,
a px value, or a `cva()` block here. Reference the file.
```

The "source of truth" block matters more here than in any other stack. In Tailwind v4 the theme lives in CSS — `@theme { --color-brand-500: oklch(...) }` — not in `tailwind.config.js`. If `design.md` lists a hex that isn't in `globals.css`, it drifts the first time someone re-tunes the palette.

---

## 1. Brand

```markdown
## 1. Brand

| Surface | Value |
|---|---|
| Product | one-line product description |
| Audience | who this is for |
| Wordmark | how the name appears |
| Voice | how the product talks (3–5 traits, with bans) |
| References we draw from | 2–3 products we deliberately resemble |
| References we **avoid**  | 2–3 we deliberately don't resemble |
```

The "avoid" row tells the agent which priors to suppress. With shadcn, the prior to suppress is **"the shadcn demo site."** The starter feel — neutral slate, generic radii, identical spacing everywhere — is the agent's default. If your product looks nothing like the shadcn demo, that has to be written down explicitly.

---

## 2. Tokens

This is the largest section. Spend the most words here.

### 2a. Raw colour scales — CSS variables in `globals.css`

```markdown
All colours are defined as CSS variables inside the `@theme` block in
`src/styles/globals.css`. Tailwind v4 reads them at build time and emits
the matching utilities (`bg-brand-500`, `text-brand-700`, etc.).

**Never hardcode hex values, OKLCH literals, or arbitrary colour utilities
(`bg-[#1234ab]`, `text-[oklch(...)]`).**

✅ `<div className="bg-brand-500 text-fg-on-brand">`
❌ `<div className="bg-[#1E40AF] text-[#fff]">`
❌ `<div style={{ background: '#1E40AF' }}>`
```

Then the palette table. Eleven steps per palette, mirroring the Tailwind convention:

```markdown
**Brand — deep blue** (`--color-brand-50` through `--color-brand-950`).
Source: `globals.css`. Used for navigation chrome, headlines, the
secondary CTA button. Not the primary CTA — see Section 2c.

| Token              | OKLCH               | Use |
|---|---|---|
| `--color-brand-50`  | oklch(0.97 0.02 250) | tinted backgrounds, info bg |
| `--color-brand-500` | oklch(0.55 0.18 250) | nav chrome, headlines, secondary-CTA bg |
| `--color-brand-700` | oklch(0.42 0.18 250) | hover-darker chrome, focused borders |
| `--color-brand-900` | oklch(0.25 0.10 250) | high-contrast text on tinted bg |
```

Repeat for `accent`, `success`, `warning`, `danger`, `neutral`. Eleven-step scale for each, but **only document the steps you actually use**. If `brand-100`, `brand-300`, `brand-400`, `brand-600`, `brand-800` never appear in `src/`, they don't go in the table. They go in a footer line: *"Other steps exist in `globals.css` but are not sanctioned for product surfaces — propose addition before using."*

### 2b. Semantic CSS variables — the shadcn layer

shadcn ships a second layer of variables that map roles onto the raw scales: `--background`, `--foreground`, `--primary`, `--muted`, `--accent`, `--border`, `--ring`, `--destructive`. The primitives in `src/components/ui/*` reference these, not the raw scales.

```markdown
**Semantic tokens** — defined in `globals.css`, consumed by shadcn primitives.

| CSS var              | Tailwind utility            | Meaning |
|---|---|---|
| `--background`       | `bg-background`             | page surface (default white / dark) |
| `--foreground`       | `text-foreground`           | default body text |
| `--card`             | `bg-card`                   | elevated surface (cards, tables, sheets) |
| `--card-foreground`  | `text-card-foreground`      | text on card surfaces |
| `--popover`          | `bg-popover`                | popovers, dropdowns, menus |
| `--primary`          | `bg-primary text-primary-foreground` | **primary CTA** — see inversion below |
| `--secondary`        | `bg-secondary text-secondary-foreground` | secondary CTA |
| `--muted`            | `bg-muted text-muted-foreground` | de-emphasised surfaces, helper text |
| `--accent`           | `bg-accent text-accent-foreground` | hover surfaces, selected rows |
| `--destructive`      | `bg-destructive text-destructive-foreground` | delete, disconnect, irreversible |
| `--border`           | `border-border`             | every component border |
| `--input`            | `border-input`              | form field borders |
| `--ring`             | `ring-ring`                 | focus ring colour |
| `--radius`           | `rounded-md` / `rounded-lg` | base radius scalar |
```

The "Meaning" column is the whole point. Without it, an agent will pattern-match `--primary` to the brand colour because that is what the variable name suggests on the average shadcn app. In this codebase it may or may not.

### 2c. Inverted-convention callout

Every shadcn codebase customised past the starter has at least one inverted convention. Call it out:

```markdown
> ⚠ **Critical convention**: in `globals.css`, `--primary` maps to the
> **accent** OKLCH scale, **not the brand scale**. The brand is wired to
> `--secondary`. This is intentional: the most committal action on any
> surface should be visually warm; the brand blue is reserved for chrome.
>
> Practical consequence: the shadcn `<Button>` with no props
> (`<Button>Save</Button>`) renders **warm-orange**, not brand-blue.
> An agent that pattern-matched `--primary === brand` will get every
> primary CTA wrong.
```

A model trained on the shadcn demo will infer `--primary === brand` ~100% of the time. The callout costs ten lines and saves hours of fixed-up CTAs.

### 2d. Utility quick-rules

```markdown
### Colour use — quick rules

- **Primary CTA on any surface**: `<Button>` (no `variant` prop). Exactly one per surface.
- **Secondary CTA**: `<Button variant="secondary">`.
- **Destructive action**: `<Button variant="destructive">`.
- **De-emphasised inline action**: `<Button variant="ghost">` or `variant="link"`.
- **Status communication**: `bg-success-50`, `bg-warning-50`, `bg-danger-50` for tinted-bg alerts.
  Never use brand or accent for status.
- **Hover row in a table**: `hover:bg-accent`. Never a custom grey.
- **Tinted info banner**: `bg-brand-50 text-brand-900 border border-brand-200`.
- **Gradients**: marketing + onboarding only. Never on data UI.
```

These six lines are what an agent reaches for hundreds of times. Keep them in a compact list, not in prose.

---

## 3. Typography

```markdown
## 3. Typography

**Font family**: Inter, loaded via `next/font` (or the project's equivalent)
into `--font-sans`. Fallback: `ui-sans-serif, system-ui, sans-serif`.

**The scale is encoded as a CVA recipe**, not raw utilities, in
`src/components/ui/text.tsx`. Use `<Text variant="…">`; do not reach for
`text-* font-*` combinations inline.

| Variant     | Utility composition           | Use |
|---|---|---|
| `h1`        | `text-2xl font-normal tracking-tight` | page H1 (list page title, detail name) |
| `h2`        | `text-xl font-medium tracking-tight`  | section H2 |
| `cardTitle` | `text-base font-medium`               | card / sheet titles |
| `denseTitle`| `text-sm font-medium`                 | dense card titles, table-section headers |
| `body`      | `text-sm font-normal text-foreground` | **default body** — table rows, form fields |
| `caption`   | `text-xs font-normal text-muted-foreground` | metadata, timestamps, helper text |
| `overline`  | `text-xs font-medium uppercase tracking-wide text-muted-foreground` | section labels |

**Weights**: 400, 500. **No 600, no 700** for body — emphasis uses
weight 500 with a darker token, not heavier weight.

**Tabular numbers**: any column rendering money, quantity, or counts must
use `tabular-nums` (utility) or `font-variant-numeric: tabular-nums` on
the cell. Non-negotiable in tables.
```

The CVA wrapper is the leverage point. Without it, an agent picks `text-sm` and `text-base` interchangeably and adds `font-semibold` because the surrounding code did. With the wrapper, the choice collapses to a 7-entry variant enum.

---

## 4. Spacing

Tailwind ships a 0.25rem scale with 60+ steps. You will use eight.

```markdown
## 4. Spacing

Sanctioned spacing utilities — every gap, margin, and padding in `src/`
must use one of these. The same eight values cover `gap-*`, `p-*`, `m-*`,
`space-y-*`, `space-x-*`.

| Utility | Px | Use |
|---|---|---|
| `gap-1`  | 4   | tightest gap (icon + label, chip internal) |
| `gap-2`  | 8   | dense table cells, small button padding |
| `gap-3`  | 12  | form field internal stacking |
| `gap-4`  | 16  | card sections, form rows |
| `gap-6`  | 24  | page header padding, between cards |
| `gap-8`  | 32  | between large sections |
| `gap-12` | 48  | top-of-page section break |
| `gap-16` | 64  | empty-state vertical centring |

**Standard combinations**:
- Between cards / form sections: `gap-6`
- Between fields inside a form: `gap-4`
- Inline (icon + label): `gap-2`
- Page outer padding: `px-6 py-4` on desktop, `px-4 py-3` on mobile

❌ **Banned**: arbitrary values (`gap-[19px]`), half-step utilities
(`gap-3.5`, `p-2.5`), odd-step utilities (`gap-5`, `gap-7`, `gap-9`,
`gap-11`).
```

If a half-step shows up in a diff, that is the highest-yield grep an agent can run: `grep -rE '(gap|p|m|space-[xy])-[0-9]+\.5' src/`.

---

## 5. Borders + radius

```markdown
## 5. Borders + radius

**Default border**: `border border-border` — every separator, card edge,
input outline.
**Subtle inner divider**: `border border-border/50` (50% opacity on
the same token).
**Focused border**: `focus-visible:ring-2 ring-ring ring-offset-2`.

**Radius** is driven by the `--radius` scalar in `globals.css`
(`0.5rem` by default). Tailwind derives `rounded-sm`, `rounded-md`,
`rounded-lg` from it.

| Utility       | Use |
|---|---|
| `rounded-sm`  | inputs, chips, small buttons |
| `rounded-md`  | buttons (default), cards, popovers |
| `rounded-lg`  | sheets, dialogs, page-wrapper cards |
| `rounded-full`| avatars, status dots, pill chips |

❌ **Banned**: arbitrary radii (`rounded-[7px]`), `rounded-xl` /
`rounded-2xl` / `rounded-3xl` on data UI.
```

---

## 6. Shadows

```markdown
## 6. Shadows

Tailwind's shadow scale (`shadow-sm` → `shadow-2xl`) is largely **not
used**. Surfaces are flat against `bg-muted/30` page fields.

| Utility    | Use |
|---|---|
| `shadow-sm`| primary buttons, cards on tinted bg |
| `shadow`   | popovers, dropdown menus, autocomplete |
| `shadow-md`| dialogs, sheets |

❌ **Banned on data UI**: `shadow-lg`, `shadow-xl`, `shadow-2xl`, any
coloured shadow (`shadow-brand-500/40`), any glow.

**Lint grep** (CI): `grep -rE 'shadow-(lg|xl|2xl)\b' src/` must return
zero hits outside `src/pages/(marketing|onboarding)/`.
```

The grep is doing work the rules can't. An agent will write `shadow-xl` on a card the moment the rule scrolls out of context.

---

## 7. Components — usage rules

This is the second-longest section. Per-primitive, same shape every time:
import path → example → CVA variant table with "When" column → constraints.

### 7a. Button — `src/components/ui/button.tsx`

```markdown
### Button

```tsx
import { Button } from '@/components/ui/button';

<Button>Save</Button>                       // primary CTA
<Button variant="secondary">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="sm">Reset</Button>
```

**CVA variants** (defined in `button.variants.ts`):

| `variant`     | Visual                                  | When |
|---|---|---|
| `default`     | accent bg, accent-foreground text       | single most committal action |
| `secondary`   | brand bg, white text                    | second-priority action |
| `destructive` | red bg, white text                      | delete, disconnect, irreversible |
| `outline`     | border-input, foreground text           | non-committal alt to default |
| `ghost`       | transparent, hover:bg-accent            | tertiary inline (Reset, Clear) |
| `link`        | underlined accent text, no bg           | inline navigation |

| `size`     | Padding / height               | When |
|---|---|---|
| `sm`       | `h-8 px-3`                     | inside tables, toolbars, sheets |
| `default`  | `h-9 px-4`                     | forms, page headers |
| `lg`       | `h-10 px-6`                    | empty-state CTAs only |
| `icon`     | `h-9 w-9`                      | icon-only buttons (always include `aria-label`) |

**Constraints**:
- One `variant="default"` per surface. Multiple primary CTAs dilute the hierarchy.
- Never compose Button manually — no inline `<button className="bg-primary ...">`.
- Loading state is `<Button disabled><Loader2 className="animate-spin" /> …</Button>`.
```

Three things to notice in this shape:

1. **Import path is explicit.** No alias guessing.
2. **The variant tables have "When" columns.** That is where the design memory lives.
3. **The bottom constraint** ("one primary per surface") is the rule that makes the system coherent.

### 7b. Form fields — `src/components/ui/*`

```markdown
### Form fields — decision table

| Scenario              | Primitive            | Path                                |
|---|---|---|
| Text / textarea       | `Input` / `Textarea` | `@/components/ui/input` `/textarea` |
| Single select         | `Select`             | `@/components/ui/select`            |
| Multi-select / combobox| `Combobox` (custom)  | `@/components/ui/combobox`          |
| Checkbox              | `Checkbox`           | `@/components/ui/checkbox`          |
| Toggle                | `Switch`             | `@/components/ui/switch`            |
| Radio group           | `RadioGroup`         | `@/components/ui/radio-group`       |
| Number / currency     | `NumberInput`        | `@/components/ui/number-input`      |
| Date picker           | `DatePicker`         | `@/components/ui/date-picker`       |

Every field is wrapped in shadcn `<Form>` + `<FormField>` + `<FormItem>` +
`<FormLabel>` + `<FormControl>` + `<FormMessage>`. See Section 13.
```

One row per scenario. If two valid primitives exist for "single select" — say `Select` and a homegrown `Dropdown` — you don't have a design system yet. Resolve the duplicate.

### 7c. Card — `src/components/ui/card.tsx`

```markdown
### Card

```tsx
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Customer summary</CardTitle>
    <CardDescription>Updated 2 minutes ago</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter className="justify-end gap-2">
    <Button variant="ghost">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

- Always use the sub-parts. No `<div className="rounded-lg border bg-card p-6">`.
- Footer alignment: `justify-end gap-2` for action rows, `justify-between` for "metadata + action."
```

### 7d. Avatar, Table, Sheet, Dialog, Popover, EmptyState, Skeleton

```markdown
### Avatar — `@/components/ui/avatar`
Use `<Avatar><AvatarImage src=… /><AvatarFallback>{initials}</AvatarFallback></Avatar>`.
Fallback initials are required. Size: `h-8 w-8` (table rows), `h-10 w-10` (header).

### Table — `@/components/ui/table` + TanStack Table
The shadcn `Table` primitive renders the markup; TanStack provides the
state. See Section 15. Never use a bare `<table>` in `src/pages/`.

### Sheet — `@/components/ui/sheet`
Side drawer. Default `side="right"`. Use for forms with > 2 fields. See Section 17.

### Dialog — `@/components/ui/dialog`
Centered modal. Use only for confirmations of destructive actions, or
single-question prompts. See Section 17.

### Popover — `@/components/ui/popover`
Anchored floating panel. Use for filter menus, column pickers,
small inline editors. Width: `w-64` default, `w-80` for filter menus.

### EmptyState — `@/components/empty-state`
Custom (not shadcn). Centered icon (24px, `text-muted-foreground`),
H2 (`<Text variant="h2">`), one-line caption, optional `<Button size="lg">`.

### Skeleton — `@/components/ui/skeleton`
`<Skeleton className="h-N w-N" />` matching the dimensions of the
content it replaces. Per-row, per-field, per-card. Never a single
full-width skeleton on a list page.
```

---

## 8. Layout patterns

Three canonical layouts. ASCII first, contract second.

### 8a. List page

```markdown
### List page

```
┌──────────────────────────────────────────┐
│ Module Name                       [+ New]│ page header (h-14, px-6)
├──────────────────────────────────────────┤
│ [search]              [filter] [columns] │ toolbar (h-12, px-6, gap-2)
├──────────────────────────────────────────┤
│ ☐  Col1  Col2  Col3   ...           ⋮    │ TanStack Table header
├──────────────────────────────────────────┤
│ ...rows (h-12 each, px-6)...             │
├──────────────────────────────────────────┤
│ N of total                  [pagination] │ footer (h-12, px-6)
└──────────────────────────────────────────┘
```

- Outer shell: `flex flex-col h-full`.
- Header, toolbar, footer: `shrink-0`. Body: `flex-1 overflow-auto`.
- Reference: `src/pages/customers/list.tsx`.
```

### 8b. Sheet form

```markdown
### Sheet form (create / edit)

```
┌──── slide-in from right, w-[480px] ─────┐
│ Title                               [✕] │ SheetHeader
├──────────────────────────────────────────┤
│ Field 1                                  │
│ Field 2                                  │ SheetContent
│ ...                                      │ scroll inside SheetContent
├──────────────────────────────────────────┤
│                [Cancel]  [Save]          │ SheetFooter, gap-2
└──────────────────────────────────────────┘
```

- Width: `w-[480px] sm:max-w-[480px]`. Wider only with a documented reason.
- Body: `flex-1 overflow-y-auto px-6 py-4 space-y-4`.
- Footer: `border-t px-6 py-3 justify-end gap-2`.
- Reference: `src/pages/customers/customer-sheet.tsx`.
```

### 8c. Detail page

```markdown
### Detail page

```
┌──────────────────────────────────────────┐
│ ← Back   Entity name              [Edit] │ header
├──────────────────────────────────────────┤
│  ┌─Card──────┐  ┌─Card──────┐            │
│  │ Summary   │  │ Activity  │            │ 2-col grid: lg:grid-cols-2 gap-6
│  └───────────┘  └───────────┘            │
│  ┌─Tabs──────────────────────────┐       │
│  │ Overview | Invoices | Notes   │       │
│  └───────────────────────────────┘       │
└──────────────────────────────────────────┘
```

- Container: `mx-auto max-w-6xl px-6 py-6`.
- Cards: `Card` primitive (Section 7c), never raw divs.
- Reference: `src/pages/customers/[id]/detail.tsx`.
```

---

## 9. Loading + transitions

```markdown
## 9. Loading + transitions

### Rules

1. **Skeleton-match-layout**: skeletons match the exact dimensions of the
   content they replace. Per-row, per-card.
2. **No centered spinners** on list pages, forms, or detail pages.
3. **Optimistic mutations** with TanStack Query's `onMutate` where the
   API contract permits.
4. **Toast on async result**, not on user-initiated submits that already
   produce a UI change (e.g., row disappears).
5. **Pre-fetch on hover** for table-row → detail navigation via
   TanStack Query's `queryClient.prefetchQuery`.

### Banned

- ❌ Centered `<Loader2 className="animate-spin" />` as the only loading state.
- ❌ "Loading..." text alone.
- ❌ Slide / fade route transitions implemented in CSS keyframes.
- ❌ Full-page blocking spinners. Replace with optimistic UI or skeletons.
```

---

## 10. Anti-patterns (banned)

The most-referenced section in a utility-first `design.md`. Be blunt.

```markdown
## 10. Anti-patterns (banned)

- ❌ **Arbitrary value escape hatches.** `text-[14px]`, `mt-[19px]`,
  `bg-[#1234ab]`, `gap-[15px]`. Use the token or propose a new one.
- ❌ **`@apply` directives** in CSS files. `@apply` re-introduces the
  cascade and defeats the linter. The one exception is `src/components/ui/*`
  base-layer resets — nowhere else.
- ❌ **Inline `className` strings longer than ~80 chars.** Extract to a
  CVA recipe (`*.variants.ts`) or to a component.
- ❌ **Bypassing `cn()`.** Never concatenate class names with `+` or
  template literals. Always pipe through `cn(...)` so `tailwind-merge`
  resolves conflicts.
- ❌ **Two `variant="default"` Buttons on the same surface.** Pick one.
- ❌ **Direct imports from `@radix-ui/*`** in `src/pages/` or `src/features/`.
  Always go through `src/components/ui/*`. The shadcn wrapper exists so
  styling, focus rings, and ARIA defaults stay consistent.
- ❌ **`!important` utilities** (`!bg-red-500`, `!mt-4`). Refactor the
  underlying class or selector. An `!` in a diff is an architectural smell.
- ❌ **Hex literals** anywhere in `className` or `style`. Including
  `text-[#666]`, `style={{ color: '#666' }}`.
- ❌ **`any` / `as any` / `@ts-ignore`.**
- ❌ **Default exports** in `src/components/`. Named exports only.
  shadcn-generated primitives already follow this; keep it consistent.
- ❌ **Cross-module imports.** `src/features/customers/*` cannot import
  from `src/features/invoices/*`. Lift to `src/components/` or `src/lib/`.
- ❌ **Icon barrel imports.** `import { ChevronDown, Trash } from 'lucide-react'`
  pulls the whole icon bundle into the chunk. Use the per-icon entry:
  `import { ChevronDown } from 'lucide-react/dist/esm/icons/chevron-down'`
  or a project `<Icon name="chevron-down" />` wrapper.

**Lint greps** (run in CI):

- Arbitrary values: `grep -rE '\b(text|p|m|gap|w|h|bg|border)-\[' src/`
- `@apply` outside ui base: `grep -rn '@apply' src/ | grep -v 'src/components/ui/'`
- Hex literals in className: `grep -rnE '#([0-9a-fA-F]{3}){1,2}' src/ | grep -v '\.svg'`
- `!important` utilities: `grep -rnE '\b!(bg|text|p|m)-' src/`

Each of these should be a non-zero finding the first time it runs and
zero on every commit after.
```

12–15 entries is the right number. More and the agent loses track. Fewer and you have under-specified.

---

## 11. Empty states

```markdown
## 11. Empty states

Every list and every detail-page-tab needs an empty state. Use the
`EmptyState` component (Section 7d).

Slots: icon (`lucide-react`, 24px, `text-muted-foreground`), title
(`<Text variant="h2">`), description (one line, `text-muted-foreground`),
optional CTA (`<Button size="lg">`).

❌ No "No data" text alone. ❌ No illustrations on the data-UI surface.
```

---

## 12. Form patterns

```markdown
## 12. Form patterns

- **Schema**: Zod in `src/features/<module>/schema.ts`, with inferred type
  (`type CustomerInput = z.infer<typeof customerSchema>`).
- **Required strings**: `z.string().min(1, '...')` — never `.nonempty()`
  (deprecated).
- **Nullable selects**: `.nullable().refine(v => v !== null, '...')`.
- **react-hook-form mode**: `'all'` (validate on blur and change).
- **Resolver**: `zodResolver(schema)` from `@hookform/resolvers/zod`.
- **Markup**: shadcn `<Form>` + `<FormField>` + `<FormItem>` + `<FormLabel>`
  + `<FormControl>` + `<FormMessage>`. Always all six.
- **Required indicator**: red asterisk inside `<FormLabel>`,
  `text-destructive`. Never parenthesised "(required)".
- **Submit button**: bottom-right of `SheetFooter` / `CardFooter`,
  `<Button type="submit">`.
- **Cancel**: only when context demands. `<Button variant="ghost">`.
- **Async submit**: `disabled={form.formState.isSubmitting}` with the
  loader pattern from Section 7a.
```

---

## 13. Tables (TanStack Table + shadcn)

```markdown
## 13. Tables

- **Markup**: shadcn `Table` primitive from `@/components/ui/table`.
- **State**: TanStack Table `useReactTable` in the page module.
- **Column defs**: colocated in `src/features/<module>/columns.tsx`.
- **Row height**: `h-12` (48px).
- **Cell padding**: `px-4 py-2`. The `Table` primitive already encodes this.
- **Header**: `bg-muted/50 text-muted-foreground font-medium text-xs uppercase`.
- **Row hover**: `hover:bg-accent`.
- **Selected row**: `data-[state=selected]:bg-accent/60`.
- **Sticky header**: wrap `<TableHeader>` in a `sticky top-0 z-10` div
  inside the scroll container.
- **Numeric columns**: `text-right tabular-nums`.
- **Action column**: last column, `w-12`, icon-only `<Button variant="ghost" size="icon">`.
- **Empty state**: see Section 11. Render via the `EmptyState` component, not
  a custom `<tr>`.

**Reference**: `src/pages/invoices/list.tsx` is the canonical implementation.
```

---

## 14. Toasts (`sonner`)

```markdown
## 14. Toasts

- Library: `sonner`, mounted once in `src/app/layout.tsx` via `<Toaster />`.
- Position: `bottom-right`.
- Duration: success 3s, error 5s, info 4s. Sticky only for actionable errors.
- One line, plain text. No headlines. No HTML. No rich content.
- **Don't toast** on direct user actions that already produce a UI change
  (row disappears, sheet closes). Toast only on async results the user
  cannot see otherwise (background sync, webhook, scheduled export).
```

---

## 15. Modals vs drawers

```markdown
## 15. Modals + drawers — decision table

| Use a **Sheet** (drawer) for       | Use a **Dialog** (modal) for         |
|---|---|
| Create / edit forms with > 2 fields | Confirmation of destructive actions |
| Multi-section settings             | Single-question confirmations        |
| Slide-over detail panels           | Alerts before risky operations       |
| Anything with > ~6 vertical fields | Anything ≤ ~4 vertical fields        |

Both come from `@/components/ui/sheet` and `@/components/ui/dialog`.
Never use both for the same action.
```

This is the table an agent reaches for reflexively because its training data is *full of modals*. The table re-balances toward Sheets, which is usually the right call for product UIs.

---

## 16. Permission-aware rendering

```markdown
## 16. Permissions

- Permissions hook: `usePermission('customers.write')` from
  `@/features/auth/use-permission`.
- Pattern:
  ```tsx
  const canWrite = usePermission('customers.write');
  return canWrite ? <Button>Edit</Button> : null;
  ```
- For read-only mirror: wrap in `<fieldset disabled={!canWrite}>` to
  cascade `disabled` through every form control.
- Never `display: none` based on permission — always conditionally render
  or `disabled`. Hidden controls confuse screen readers and QA.
```

---

## 17. Accessibility

```markdown
## 17. Accessibility

Radix Primitives (under shadcn) provide most of this for free:
focus trapping in dialogs, escape-to-close, ARIA roles, keyboard nav for
menus and tabs. The codebase's responsibility is the rest.

- **Labels**: every form control has an associated `<FormLabel>`. Icon-only
  buttons require `aria-label`.
- **Focus ring**: never `outline-none` without a `focus-visible:ring-*`
  replacement. The default focus utility on shadcn Buttons is correct;
  do not override.
- **Colour contrast**: text-on-bg pairs in the semantic-token table (Section 2b)
  are pre-tested for AA. Do not invent new pairs without re-testing.
- **Hit targets**: minimum `h-9` (36px) for interactive elements. `h-8`
  (32px) is the floor inside dense tables, never on top-level CTAs.
- **Motion**: `prefers-reduced-motion` is respected by Tailwind's
  `motion-safe:` / `motion-reduce:` variants. Wrap any non-essential
  animation in `motion-safe:`.
```

---

## 18. How AI agents use this file

```markdown
## How AI agents use this file

1. **Before writing any UI code**, read this file in full.
2. If you need a colour, spacing, or radius value, check Sections 2–6 first.
3. If you need a component, check Section 7. Use the shadcn primitive in
   `src/components/ui/`; do not reinvent.
4. If a token, utility, or variant you need isn't documented here,
   **propose adding it** before reaching for an arbitrary value.
5. When you finish a UI change, run the lint greps in Section 10 against your diff.
6. Reference the canonical pages cited at the bottom of Section 8 before writing
   a list, sheet, or detail page from scratch.

Cross-reference:
- `architecture/folder-structure.md` — where files go.
- `architecture/styleguide.md` — how to author Tailwind (CVA vs inline,
  when `@apply` is allowed, `cn()` semantics).
- `prompts/list-page.md` — list-page recipe.
- `prompts/sheet-form.md` — sheet-form recipe.

This file is referenced from `CLAUDE.md` so future sessions auto-load it.
```

---

## What *not* to put in design.md

- **How to author Tailwind** (CVA file naming, `cn()` rules, when to extract a component) → `architecture/styleguide.md`.
- **Folder structure rules** → `architecture/folder-structure.md`.
- **Task recipes** (how to migrate a list page) → `docs/prompts/*.md`.
- **Component props** → JSDoc on the primitive itself.
- **Code samples longer than ~10 lines** → the canonical reference in `src/`, linked.

The test: if a human reader would infer it from `src/`, leave it out. If it requires intent that can't be read off the code — *"primary maps to accent, not brand"*, *"one default Button per surface"*, *"Sheet over Dialog for forms"* — it goes in `design.md`.

---

## Length and rhythm

Target: 500–700 lines. The Tokens section (Section 2) and the Components section (Section 7) carry the weight; everything else is short and opinionated.

Section ratios I keep:

1. Frontmatter (~15)
2. Brand (~15)
3. Tokens (~150 — the longest)
4. Typography (~30)
5. Spacing (~30)
6. Borders + radius (~25)
7. Shadows (~20)
8. Components (~150 — second-longest)
9. Layout patterns (~80)
10. Loading + transitions (~30)
11. Anti-patterns (~50)
12. Empty states (~10)
13. Form patterns (~25)
14. Tables (~30)
15. Toasts (~15)
16. Modals + drawers (~15)
17. Permissions (~15)
18. Accessibility (~25)
19. How AI agents use this file (~20)

Tokens and Components carry the load because those are the two surfaces an agent touches on every single task in a Tailwind + shadcn codebase.

---

## Closing thought

The shadcn philosophy — *"copy the primitives into your repo, own them"* — gives the codebase total control. It also gives the agent total surface area. Every primitive is yours to modify; every utility class is a valid choice; every CVA variant can be reinvented inline.

`design.md` is the document that turns that surface area back into a system. It tells the agent which of the 11 brand steps to reach for, which of the 60 spacing utilities are sanctioned, which of the six Button variants is canonical for which job, when to use a Sheet over a Dialog, and which patterns are explicitly banned even though Tailwind would let you write them.

Write it once. Update it 4–6 times a year. Every primary CTA the agent writes after that — and every spacing value, and every radius, and every shadow — lands on the first try.

---

**A real working example.** This site is built on Tailwind v4; its [`design.md`][repo-design-md] is in active use and follows the same shape as the template above (without shadcn — the primitives are hand-rolled, but the rules and structure are identical). Part 12 of this series walks through it section by section with the decisions behind each choice.

[repo-design-md]: https://github.com/poudelprakash/personal_blog_2026/blob/main/design.md
