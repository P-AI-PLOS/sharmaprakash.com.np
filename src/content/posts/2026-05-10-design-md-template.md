---
title: "What to Put in design.md: A Complete Template"
date: "2026-05-10T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "A good design.md is a decision document, not a style guide. If a senior designer left tomorrow, would the next person make the same calls?"
cover: "/images/blog/ai/design-md-template.png"
thumb: "/images/blog/ai/design-md-template.png"
last_modified_at: "2026-05-10T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 4
---

If you've read Part 2 of the series, you know `design.md` is one of the four canonical docs an agent-ready codebase needs. It's also the one most teams get wrong.

The common mistakes:

- They write a **style guide** (how to author CSS) instead of a **design system memory** (what the system is).
- They write a **showcase** (here are all the buttons we have) instead of a **decision document** (here's when to use which button).
- They write **values without semantics** (`primary.main = #1E40AF`) without ever explaining when to reach for `primary` over `secondary`.
- They make it **encyclopedic** instead of **opinionated** — listing every component without ever saying which is canonical.

A good `design.md` is the answer to: *"If a senior designer left tomorrow and the only thing the next person had was this file, would they make the same calls?"*

This post is a complete annotated template. Steal everything.

The examples below are composites — drawn from `design.md` files I've reviewed across several codebases on different stacks (MUI, Chakra UI, Mantine, a couple of homegrown design systems on top of Tailwind). The main code blocks use **MUI's API surface** (`theme.spacing(n)`, `<Typography variant>`, `theme.shadows[N]`) because it was the most common stack across the audits — but every section ends with a **Chakra v3** and **Tailwind** translation in a callout block, so you see the same rule expressed three ways. If your stack is Mantine or something more bespoke, the translation is usually obvious once you've seen the other three.

---

## Frontmatter — what to put at the top

```markdown
# project-name — design.md

> Canonical design memory. Every AI session and human contributor reads this
> **before** writing UI. If a value isn't here, propose it as an addition
> before using it inline.

**Last updated**: YYYY-MM-DD
**Scope**: `src/` (or the specific app/package).
**Source of truth for values**: list the files that contain the actual tokens
(`src/assets/colors/colors.ts`, `src/theme/*`). This file documents how to
*use* them; never duplicate a hex value here without a corresponding token
in the source of truth.
```

That last sentence matters. If your `design.md` lists hex values that aren't in your `colors.ts`, it will drift the moment someone changes a token. Always reference the source file by path; let the file be the truth.

---

## Section 1: Brand

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

The "avoid" row is doing more work than the "draw from" row. It tells the agent which design priors to *suppress* — Material Design demo defaults, Bootstrap, Salesforce Lightning, generic SaaS gradient backgrounds. Without this, the agent reaches for whatever's most common in its training data.

---

## Section 2: Colour

This is the section your agent will reference most often. Spend the most words here.

### 2a. The principle (one paragraph)

```markdown
All colours are tokens exported from `src/assets/colors/colors.ts` and
wired into the theme via `src/theme/palette.ts`. **Never hardcode hex
values.** Import the token namespace and reference the field.
```

Then a `✅ / ❌` code block showing the correct pattern. Two lines each.

### 2b. The brand palette (with semantics, not just hex)

Don't just dump the colour table. For each colour, tell the agent **when to use it**:

```markdown
**Primary — deep blue** (`assets/colors.primary`).
Used for navigation chrome, headlines, the contained-secondary button.

| Token            | Hex      | Use |
|---|---|---|
| `primary.main`   | #1E40AF  | nav chrome, headlines, contained-secondary bg |
| `primary.dark`   | #1E3A8A  | borders on contained-secondary, hover-darker chrome |
| `primary.light`  | #60A5FA  | de-emphasised primary text |
```

The "Use" column is the whole point. Without it, the agent guesses based on token name — which means it picks based on training-data priors about what "primary.main" usually means in the average React codebase. That's wrong in your codebase ~30% of the time.

### 2c. Inverted conventions — call them out explicitly

Every codebase has one of these. The places where your convention is the opposite of the framework default. Examples I've encountered across audits:

- A codebase where the "primary" CTA was a warm accent colour, *not* the primary palette token — because the brand's most committal action was visually warm, not the cool brand blue.
- A `colors.ts` where the `dark` variant was lighter than `main` and `light` was darker than `main`. Once shipped, never fixed.
- A "secondary" namespace that contained a blue accent colour the team added years later — the namespace name no longer described the contents.

**Call these out in a callout block.** Not buried in the table. Not in a sub-bullet. A standalone "⚠ Convention" block:

```markdown
> ⚠ **Critical convention**: in the button theme (`src/theme/button.ts`),
> the `containedPrimary` variant renders with the **accent** palette as the
> background and the **primary** palette as the text — inverted from what
> the token names suggest. This is intentional: the accent colour is the
> most committal action on any surface. `containedSecondary` is the
> plain-primary button.
```

A model trained on the average React codebase will get this wrong every time. The callout costs nothing and saves hours of "the agent made the wrong button colour."

### 2d. Quick-rules list

After the tables, summarise the rules an agent will apply hundreds of times:

```markdown
### Colour use — quick rules

- **Primary CTA on any surface**: accent-coloured `containedPrimary`. Exactly one per surface.
- **Secondary CTA**: primary-coloured `containedSecondary`.
- **Status communication**: use `success`, `warning`, `error`, `info` — never grey or the brand pair.
- **Body copy links**: `primary.main`. Never accent colours for links.
- **Tables, filters, page chrome**: neutral `grey.*` tokens.
- **Gradients**: onboarding / marketing only — never on data UI.
```

These rules are what an agent will reach for during 90% of tasks. Put them in a compact list, not in prose.

> **Chakra v3 translation.** Replace `containedPrimary` / `containedSecondary` with Chakra's button recipe variants — e.g., `<Button variant="solid" colorPalette="accent">` for the primary CTA, `<Button variant="solid" colorPalette="brand">` for secondary. Document the colour-palette inversion (if you have one) in the same `⚠ Convention` callout — Chakra has no notion of the inversion either, so the warning earns its keep just as much.
>
> **Tailwind translation.** No `variant` system to lean on — you encode the rules into a small set of component classes. Define `btn-primary` (your accent), `btn-secondary` (your primary), `btn-danger`, `btn-ghost` in a sibling `Button.tsx` component or via CVA / `tailwind-variants`. The rule "one accent CTA per surface" then becomes a lint grep: `grep -rE "btn-primary" src/pages/<Module>/` should return ≤ 1 hit per page.

---

## Section 3: Typography

Keep this short. Most projects need ~80 words plus a table.

```markdown
## 3. Typography

**Font family**: Inter. Fallback: `ui-sans-serif, system-ui, sans-serif`.

**Scale** — defined in `src/theme/typography.ts`. Use the MUI
`<Typography variant="…">` wrapper (or the atoms `Typography` wrapper if your
codebase has one); never hand-roll font sizes inline.

| Variant     | Size      | Weight | Use |
|---|---|---|---|
| `h5`        | 1.5rem    | 400 | page H1 (list page title, detail name) |
| `h6`        | 1.25rem   | 500 | section H2 |
| `subtitle1` | 1rem      | 500 | card / drawer titles |
| `subtitle2` | 0.875rem  | 500 | dense card titles, table-section headers |
| `body2`     | 0.875rem  | 400 | **default body** — table rows, form fields |
| `caption`   | 0.75rem   | 400 | metadata, timestamps, helper text |
| `overline`  | 0.75rem   | 400 | uppercase section labels |

**Weights**: 400, 500. **No 600, no 700** for body — bold uses weight 500
with darker colour, not heavier weight.

**Tabular numbers**: money, quantity, and count columns must use
`font-variant-numeric: tabular-nums`. Non-negotiable for any table with
amounts.
```

The "default body" annotation and the "no 600" rule are the highest-leverage lines. Without them, agents pick from the full variant set seemingly at random.

> **Chakra v3 translation.** Replace the `Typography variant` column with Chakra's `textStyle` recipes (`textStyle="md"` for body, `textStyle="sm"` for caption) and document each recipe in `theme/recipes/text.ts`. The "no 600 weight for body" rule becomes "no `fontWeight={600}` on `textStyle="md"` — promote to a new recipe instead."
>
> **Tailwind translation.** Drop the variant table; list the sanctioned utility combinations directly:
> - `text-2xl font-normal` — page H1
> - `text-xl font-medium` — section H2
> - `text-base font-medium` — card / drawer title
> - `text-sm font-normal text-slate-700` — **default body** (table rows, form fields)
> - `text-xs text-slate-500` — caption
>
> The rule "no `font-bold` on body" is still the one that matters. The point — *one canonical shorthand per role* — is the same; only the form changes.

---

## Section 4: Spacing

```markdown
## 4. Spacing

Use MUI's spacing scale via `sx` / `styled` — `theme.spacing(n)` where
`n * 8 = px`. Prefer the scale to magic px values.

| `theme.spacing` | Px | Use |
|---|---|---|
| `0.5` | 4  | tightest gap (chip internal padding) |
| `1`   | 8  | dense table cells, small button padding |
| `2`   | 16 | card sections, form rows |
| `3`   | 24 | page header padding, dialog padding |
| `4`   | 32 | large section gaps |

**Standard gaps**:
- Between cards / form sections: `gap: 3` (24px)
- Between fields inside a form: `gap: '20px'`
- Inline elements (icon + label): `gap: 1` (8px)
```

If your spacing scale has 30+ values, your design system is too forgiving. Pick 6–8 and ban the rest.

> **Chakra v3 translation.** Chakra ships its own 4px-based scale (`m={4}` = 16px). Document the same six values you actually use — `0.5`, `1`, `2`, `3`, `4`, `6` — and ban arbitrary spacing tokens (`<Box mb="13px">` is the same crime as inline px in MUI).
>
> **Tailwind translation.** Replace the table above with the sanctioned utility set — `gap-1`, `gap-2`, `gap-3`, `gap-6`, `gap-8` — and explicitly ban the rest (no `gap-5`, no arbitrary `gap-[19px]`). Same rule, different surface.

---

## Section 5: Borders, radius, shadows

Three short sections.

```markdown
## 5. Borders + radius

- **Default border**: `1px solid ${grey.g200}` (visible separators on white)
- **Subtle inner divider**: `1px solid ${grey.g100}`
- **Component border** (inputs, outlined buttons): `1px solid ${other.border}`

**Radius scale**:
| Value | Use |
|---|---|
| `4px`  | inputs, buttons (MUI default), chips |
| `8px`  | table containers, small cards |
| `12px` | drawer content cards, form wrapper cards |
| `9999px` / `50%` | avatars, status dots, pill chips |

## 6. Shadows

MUI's default elevation scale (`theme.shadows[0..24]`) is largely **not used**. Surfaces are flat
on a light grey field. Reserved usages:

- `theme.shadows[1]` — primary CTAs, cards on tinted bg
- `theme.shadows[2]` — dropdowns, autocomplete popovers
- `theme.shadows[4]` — dialogs, drawers (MUI default)

**No glow shadows. No coloured shadows on data UI.**
```

Notice: "what we *don't* use" is part of the documentation. Agents will reach for `theme.shadows[8]` if you don't actively tell them you've capped at 4.

> **Chakra v3 translation.** Chakra uses named shadow tokens (`shadow="xs"`, `shadow="sm"`, `shadow="md"`, `shadow="lg"`). Pick three and ban the rest: e.g., `xs` for CTAs and tinted-bg cards, `sm` for popovers, `md` for dialogs. Document the **banned** tokens (`lg`, `xl`, `2xl`) explicitly — the agent won't infer "we don't go that high" from absence.
>
> **Tailwind translation.** Same shape: allow `shadow-sm`, `shadow`, `shadow-md`. Ban `shadow-lg`, `shadow-xl`, `shadow-2xl`, and any `shadow-[colour]` variants on data UI. Document the bans in `design.md` and add a `lint:rules` grep for `shadow-(lg|xl|2xl)\b` in `src/`.

---

## Section 6: Components — usage rules

This is the longest section. Structured per primitive, with the same shape each time:

```markdown
### Button (`components/atoms/Button`)

```tsx
import Button from 'components/atoms/Button';

<Button variant="contained" color="primary" size="small">Save</Button>
```

**Variant + colour decoder** (because the colour naming is inverted in this codebase — see the convention callout in Section 2c):

| Variant | Color | Visual | When |
|---|---|---|---|
| `contained` | `primary`   | **Accent bg, primary text** | single most committal action |
| `contained` | `secondary` | **Primary bg, white text**  | second-priority action |
| `contained` | `error`     | Red bg, white text          | destructive (Delete, Disconnect) |
| `outlined`  | `primary`   | Accent border, accent text  | non-committal alt to accent |
| `outlined`  | `secondary` | Primary border, primary text | de-emphasised alt to primary |
| `text`      | `primary`   | Accent text, transparent    | tertiary inline (Clear, Reset) |

**One accent-contained button per surface.** Multiple accent CTAs dilute the hierarchy.
```

Three things to notice:

1. **Import path is shown.** No agent has to guess.
2. **The variant table has a "When" column.** This is where the design memory lives.
3. **The constraint at the bottom** ("one per surface") is the rule that makes the system coherent.

Repeat this shape for every primitive: `Typography`, form fields, `Chip`, `Avatar`, `Table`, `Drawer`, `Dialog`, `Popover`, `EmptyState`, `Skeleton`. ~10–15 sections total.

For form fields specifically, include a **decision table**:

```markdown
| Scenario | Component | Path |
|---|---|---|
| Text / textarea | `FormTextField` | `components/molecules/FormTextField` |
| Single select   | `MuiAutocomplete` | `components/molecules/MuiAutocomplete` |
| Checkbox        | `FormCheckbox`    | `components/molecules/FormCheckbox` |
| Toggle          | `FormSwitchInput` | `components/atoms/FormSwitchInput` |
| Number / currency | `FormDecimalControlledField` | `components/atoms/FormDecimalControlledField` |
| Date picker     | `FormDatePicker`  | `components/molecules/FormDatePicker` |
```

Every "scenario" gets exactly one row. If you have two valid components for "single select", you don't have a design system yet — you have a duplicate to resolve.

---

## Section 7: Layout patterns

ASCII diagrams plus contracts. Three patterns minimum: **list page**, **drawer form**, **detail page**.

```markdown
### List page

```
┌──────────────────────────────────────────┐
│ Module Name                              │ Portal → top-bar
├──────────────────────────────────────────┤
│ [search]              [Filter] [+ Create]│ filter bar inside Box id=HEADER_ID
│ Tab strip                                │ tabs inside same Box
├──────────────────────────────────────────┤
│ ☐  Col1  Col2  Col3   ...           ⋮    │ table header
├──────────────────────────────────────────┤
│ ...rows...                               │
├──────────────────────────────────────────┤
│ N of total                  [pagination] │ TableFooter
└──────────────────────────────────────────┘
```

- Filter bar + tabs **both inside** `<Box id={HEADER_ID}>` so dynamic height measures them together.
- `tableHeight = calc(100vh - headerHeight - TABS_HEIGHT - TOP_TOOLBAR_HEIGHT - FOOTER_HEIGHT)`
- Header padding (typical): `pt: 2, px: 3, pb: 1`
- Actions column header background: `${grey.custom1} !important`
```

The ASCII diagram is doing a *lot* of work. It's not for show — the agent uses it to figure out which element goes where. Don't skip it.

Each pattern needs a **canonical reference path**: "The reference implementation is `pages/Reports/MonthlySummary/`." The agent will read it before writing.

---

## Section 8: Loading + transitions

A short, opinionated section. Most teams overthink this.

```markdown
## 9. Loading + transitions

### Rules

1. **Skeleton-match-layout**: skeletons match the exact dimensions and
   positions of the content. Per-field, per-row, per-card.
2. **No centered full-page spinners** on list pages, forms, or detail pages.
3. **Optimistic mutations** where the API contract permits.
4. **Toast for async results**, not for user-initiated submits that already
   produce a UI change (e.g., row disappears from list).
5. **Pre-fetch on hover** for navigation links.

### Banned

- ❌ Centered `<CircularProgress />` as the only loading state.
- ❌ "Loading..." text alone.
- ❌ Slide-in / slide-out route transitions.
- ❌ Animated success checkmarks that block the user.
```

The "banned" list is the half that matters. Agents will produce any of those four by default unless you ban them explicitly.

---

## Section 9: Anti-patterns (banned)

Don't bury this. Put it near the end as its own section, with a `❌` for every entry. Agents are good at recognising patterns to *avoid* when they're listed bluntly.

```markdown
## 10. Anti-patterns (banned)

- ❌ **Hardcoded hex values.** Import from `assets/colors`.
- ❌ **Barrel imports.** `from 'components/atoms/Button'` — never `'atoms'`.
- ❌ **TypeScript escape hatches.** No `any`, `as any`, `@ts-ignore`.
- ❌ **Inline style objects** in component files (`sx={{…}}`, large `style={{…}}` blocks, ad-hoc `className` template literals). Move to sibling `style.ts` or `Component.module.css`.
- ❌ **Two `containedPrimary` buttons** on the same surface. Pick one.
- ❌ **Raw MUI components** (`@mui/material/Button`, `@mui/material/Select`) in page modules. Use the `atoms/Button`, `molecules/FormAutocomplete` wrappers. (Chakra equivalent: no direct `@chakra-ui/react` imports in pages — go through the project's recipe-based wrappers. Tailwind equivalent: no inline `<button className="px-4 py-2 …">` — use the `<Button variant="…">` component.)
- ❌ **`enum` for new code.** Use `const` objects with `as const`.
- ❌ **Default exports** in component files. Named exports only.
- ❌ **Cross-module imports.** Never import from `pages/AnotherModule/`.
- ❌ **Icon barrel imports.** `import { ChevronDown, Trash } from '@mui/icons-material'` (or `lucide-react`, `react-icons/fa`, etc.) pulls the entire icon bundle into the route chunk. Use the per-icon entry point: `import ChevronDown from '@mui/icons-material/ChevronDown'` for MUI, `import { ChevronDown } from 'lucide-react/dist/esm/icons/chevron-down'` for Lucide, or the project's `<Icon name="chevron-down" />` wrapper.
```

12–15 entries is the right number. More and the agent loses track; fewer and you've under-specified.

---

## Section 10: Forms, toasts, modals — the "narrow rules" sections

Each of these gets ~10 lines. They cover the patterns that show up in every project:

```markdown
## 12. Form patterns

- **Validation**: Zod schema in `utils/validation.ts`, exported with inferred type.
- **Required strings**: `z.string().min(1, '...')` — never `.nonempty()`.
- **Nullable selects**: `.nullable().refine(val => val !== null, …)`.
- **react-hook-form mode**: `'all'` (validate on blur + change).
- **Labels**: above the field, `caption` weight 500, `text.secondary`.
- **Required indicator**: red asterisk, `error.main`. No parenthesised "(required)".
- **Submit button**: bottom of form, accent `containedPrimary`.
- **Cancel button**: only when context demands.

## 14. Toasts

- Use the project's `useToast` hook. Position: bottom-right.
- Success: 2–3s. Error: 5s, may be sticky for actionable errors.
- One line. No headlines. No HTML.
- **Don't toast on direct user actions** that already produce a UI change.

## 15. Modals + drawers

| Use a **drawer** for | Use a **dialog** for |
|---|---|
| Create / edit forms with > 2 fields | Confirmation of destructive actions |
| Multi-section settings | Single-question confirmations |
| Slide-over detail panels | Alerts before risky actions |
```

The drawer-vs-dialog table is one of the most-referenced sections of any `design.md` I've seen in practice. Agents reach for modals reflexively because their training data is full of them. The table re-balances them toward drawers, which is usually the right call for product UIs.

---

## Section 11: How AI agents use this file

End the document with explicit instructions to the agent:

```markdown
## How AI agents use this file

1. **Before writing any UI code**, read this file in full.
2. If you need a colour/size/spacing value, check sections 2–6 first.
3. If you need a component pattern, check section 7. Use the primitive;
   don't reinvent.
4. If a value you need isn't documented here, **propose adding it** before
   writing inline classes or hex codes.
5. When you finish a UI change, scan the diff for anti-patterns (section 10).

Cross-reference:
- `architecture/folder-structure.md` for where files go.
- `styleguide.md` for *how* to author styles (sx vs `styled()`).
- `prompts/tableMigration.md` for list-page migration.
- `prompts/formMigration.md` for form migration.

This file is referenced from `CLAUDE.md` so future sessions auto-load it.
```

This section is doing two things:

1. Telling the agent **the order of operations** ("read first, propose additions").
2. Pointing at other docs so the agent doesn't try to put everything in `design.md`.

---

## What *not* to put in design.md

A `design.md` is a memory document, not a reference manual. Some things belong elsewhere:

- **How to author styles** (sx vs styled, TypeScript types for styles, file naming) → `architecture/styleguide.md`.
- **Folder structure rules** → `architecture/folder-structure.md`.
- **Task-specific recipes** (how to migrate a list page) → `docs/prompts/*.md`.
- **Component prop documentation** → the component source file's JSDoc or a Storybook entry.
- **Code samples longer than ~10 lines** → the reference implementation in `src/`, linked.

The test: if it'd be obvious to a human reader from looking at `src/`, it doesn't belong in `design.md`. If it requires intent that can't be inferred from the code, it does.

---

## Length and rhythm

Target: 400–500 lines total. Anything shorter is probably missing the "when to use" semantics. Anything longer is probably encyclopedic.

Structure I use, in order:

1. Frontmatter (~10 lines)
2. Brand (~15)
3. Colour (~120 — the longest section)
4. Typography (~30)
5. Spacing (~25)
6. Borders + radius (~20)
7. Shadows (~15)
8. Components — usage rules (~150 — second longest)
9. Layout patterns (~80)
10. Loading + transitions (~30)
11. Anti-patterns (~25)
12. Empty states (~10)
13. Form patterns (~15)
14. Tables (specific) (~25)
15. Toasts (~10)
16. Modals + drawers (~15)
17. Permission-aware rendering (~10)
18. Accessibility (~15)
19. How AI agents use this file (~15)

The numbers won't match yours exactly. The ratio will. Spend most of your words on Colour and Components — those are the two surfaces an agent touches on every task.

---

## Closing thought

The reason `design.md` is so high-leverage is the same reason `MIGRATIONS.md` is: **it's the document the agent reads when there's no obvious answer in the code.** Most other docs in a repo are about the code; `design.md` is about the *intent* behind the code.

You will write this once and update it 4–6 times a year. Each update will save your team and your agents tens of hours of "is this the right way?" guessing.

Start with the template above. Cut what you don't need. Add the inverted conventions and the bans. Reference the source-of-truth files. Publish.

The next person to write a button in your codebase — human or model — will get it right on the first try.

---

**A real working example.** This site's own [`design.md`][repo-design-md] follows the template above (430 lines, in active use). Part 12 of this series is a section-by-section tour of it with the decisions behind each choice.

[repo-design-md]: https://github.com/poudelprakash/personal_blog_2026/blob/main/design.md
