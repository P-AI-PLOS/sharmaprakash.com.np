---
title: "MIGRATIONS.md Recipes: Six Concrete Stack-Pair Migrations"
date: "2026-05-16T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Part 2 said write a MIGRATIONS.md. This post is six concrete recipes — one per common stack pair — that any agent can execute end-to-end."
cover: "/images/blog/ai/migrations-md-recipes.png"
thumb: "/images/blog/ai/migrations-md-recipes.png"
last_modified_at: "2026-05-16T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 10
---

Part 2 of this series introduced `MIGRATIONS.md` — a one-page document with three rows per concept: ✅ Current, ❄️ Frozen, 🎯 Target. That document tells the agent *what state things are in*.

This post is what to write when you actually want to **do** the migration — six recipes, one per stack pair I've seen most often across audits. Each recipe is a complete, agent-ready document. Drop it in `docs/prompts/migrate-<X>-to-<Y>.md`, hand it to Claude Code or Cursor along with a scope ("migrate the Books slice"), and it should run end-to-end.

The six pairs:

1. Redux Toolkit → Zustand
2. Sass / SCSS Modules → Tailwind v4
3. MUI v5 → MUI v6
4. Formik → react-hook-form + Zod
5. `useEffect`-fetch → TanStack Query
6. Class components → Function components + hooks

Each recipe follows the same five-section shape: **Scope**, **Reference implementation**, **Step-by-step migration**, **Gotchas**, **Verification checklist**. That's the same skeleton from Part 5 ("task prompts that work first try") — these are task prompts. The migration is the task.

One framing note before the recipes: a `MIGRATIONS.md` entry says "Frozen: Redux Toolkit under `src/legacy-store/`." A recipe says "*here is how to move one slice off it.*" The doc is the map. The recipe is the move. You need both.

---

## Recipe 1: Redux Toolkit → Zustand

### Scope

Migrate one Redux Toolkit slice to one Zustand store. **One slice at a time.** Do not migrate the `Provider`, do not migrate sibling slices, do not delete the legacy store directory.

Files in scope:

- `src/legacy-store/slices/<feature>Slice.ts` — read, then delete after migration.
- All call sites: `useSelector((s) => s.<feature>.X)` and `useDispatch()` for `<feature>` actions.

Files **not** in scope:

- `src/legacy-store/store.ts` (the `configureStore` call) — leave it.
- `<App>` root with `<Provider store={store}>` — leave it.
- Other slices — they continue working through the Provider.

### Reference implementation

- `src/stores/bookStore.ts` — canonical Zustand store with selectors, devtools, and `persist`.
- `src/stores/__tests__/bookStore.test.ts` — the testing pattern (store reset between tests).

Read both before writing code.

### Step-by-step migration

**Step 1.** Create `src/stores/<feature>Store.ts`. Copy the shape of the reference.

**Step 2.** Translate the slice's `initialState` to the Zustand state interface.

❌ Before — `slices/bookSlice.ts`:

```ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BookState {
  items: Book[];
  selectedId: string | null;
  filter: string;
}

const initialState: BookState = {
  items: [],
  selectedId: null,
  filter: "",
};

const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<Book[]>) {
      state.items = action.payload;
    },
    selectBook(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    setFilter(state, action: PayloadAction<string>) {
      state.filter = action.payload;
    },
  },
});

export const { setItems, selectBook, setFilter } = bookSlice.actions;
export default bookSlice.reducer;
```

✅ After — `stores/bookStore.ts`:

```ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface BookState {
  items: Book[];
  selectedId: string | null;
  filter: string;
  setItems: (items: Book[]) => void;
  selectBook: (id: string) => void;
  setFilter: (filter: string) => void;
}

export const useBookStore = create<BookState>()(
  devtools(
    (set) => ({
      items: [],
      selectedId: null,
      filter: "",
      setItems: (items) => set({ items }),
      selectBook: (selectedId) => set({ selectedId }),
      setFilter: (filter) => set({ filter }),
    }),
    { name: "book" },
  ),
);
```

**Step 3.** Translate every `useSelector` call site to a Zustand selector hook.

❌ Before:

```tsx
const items = useSelector((s: RootState) => s.book.items);
const filter = useSelector((s: RootState) => s.book.filter);
const dispatch = useDispatch();
dispatch(setFilter("acme"));
```

✅ After:

```tsx
const items = useBookStore((s) => s.items);
const filter = useBookStore((s) => s.filter);
const setFilter = useBookStore((s) => s.setFilter);
setFilter("acme");
```

**One selector per piece of state.** Never `useBookStore((s) => ({ items: s.items, filter: s.filter }))` without `shallow` — that re-renders on every store change.

**Step 4.** Translate derived selectors. `createSelector` from Reselect becomes derived state computed inside the selector hook, or a separate `useMemo` at the call site.

❌ Before — `selectors/bookSelectors.ts`:

```ts
import { createSelector } from "@reduxjs/toolkit";

export const selectFilteredBooks = createSelector(
  [(s: RootState) => s.book.items, (s: RootState) => s.book.filter],
  (items, filter) =>
    items.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase())),
);
```

✅ After — colocated with the call site:

```ts
const filtered = useBookStore((s) =>
  s.items.filter((c) => c.name.toLowerCase().includes(s.filter.toLowerCase())),
);
```

If the derivation is expensive, use a custom hook with `useMemo` and a `shallow`-compared selector. Don't reach for `zustand/middleware/shallow` until you've measured.

**Step 5.** Delete the slice file and its imports from the root reducer. Run typecheck — every stale reference fails loudly.

**Step 6.** Update `MIGRATIONS.md`. The `<feature>` row moves from a Frozen footnote to migrated history.

### Gotchas

⚠ **The agent will migrate the `Provider`.** It will not. The Provider stays as long as one slice still lives under it. Tell the agent explicitly: "Do not edit `<App>` root, do not touch `src/legacy-store/store.ts`."

⚠ **Derived selectors silently lose memoization.** `createSelector` caches by reference equality. A plain Zustand selector recomputes every render. For lists where filtering is cheap this is fine. For expensive derivations, wrap in `useMemo` with dependencies, or build a selector with `zustand/middleware/shallow`.

⚠ **Middleware APIs differ.** Redux Toolkit's `redux-persist` config doesn't translate one-to-one. Zustand's `persist` middleware takes `{ name, storage, partialize }`. The agent will paste the persist config; review it by hand — `partialize` is where you whitelist what gets persisted, and the default behaviour persists everything.

⚠ **Action payloads aren't free-form.** Redux actions can take arbitrary payloads; Zustand setters are typed functions on the state interface. If a reducer did multiple state writes, port them into a single setter that takes a structured argument — not three separate setters called in sequence.

⚠ **Thunks have no Zustand equivalent.** If a slice has `createAsyncThunk`, that's almost always server state. Move it to TanStack Query (Recipe 5), not to Zustand. Zustand stores should hold client state only.

From the audits I've done, the most common mistake is migrating the whole `legacy-store/` directory in one PR. Don't. One slice per PR. The Provider stays. The typecheck catches every stale `useSelector`.

### Verification checklist

- [ ] `src/stores/<feature>Store.ts` exists and exports `use<Feature>Store`.
- [ ] No `useSelector`/`useDispatch` for `<feature>` remains. (`grep -rE "s\.<feature>\." src` returns zero.)
- [ ] `src/legacy-store/slices/<feature>Slice.ts` deleted.
- [ ] Root reducer no longer imports the deleted slice.
- [ ] Devtools shows the store under the configured `name`.
- [ ] `pnpm typecheck` passes with zero errors.
- [ ] `pnpm test` passes; per-test store reset is in place if any test mutates the store.
- [ ] `MIGRATIONS.md` updated.

---

## Recipe 2: Sass / SCSS Modules → Tailwind v4

### Scope

Migrate one component (and its colocated `.module.scss`) at a time. Strategy is **rewrite, not auto-translate**: convert the JSX with Tailwind utilities, then delete the `.module.scss` file. Do not run a codemod that maps SCSS rules to `@apply` directives — you will end up with a Tailwind config that is just SCSS with extra steps.

Files in scope:

- One `.tsx` component and its sibling `.module.scss`.

Not in scope:

- `src/styles/_legacy/*.scss` global partials — those move only after every consumer is migrated.
- Mixins exported across files — leave the mixin file alive until the last consumer is gone.

### Reference implementation

- `src/components/marketing/HeroBanner.tsx` — a component recently migrated from a `.module.scss`. Look at the JSX, the variant prop, and the `cva` recipe.
- `src/styles/tokens.css` — the source of truth for every colour and spacing token.

### Step-by-step migration

**Step 1.** Open the `.module.scss`. Inventory: how many top-level selectors, how many state variants (`:hover`, `&.active`), how many media queries, how many SCSS variables.

**Step 2.** For each SCSS variable, find or add the matching CSS custom property in `tokens.css` under `@theme`.

❌ Before — `Banner.module.scss`:

```scss
$banner-bg: #0b3d91;
$banner-fg: #ffffff;
$banner-radius: 12px;

.banner {
  background: $banner-bg;
  color: $banner-fg;
  border-radius: $banner-radius;
  padding: 24px 32px;
}
```

✅ After — `tokens.css`:

```css
@theme {
  --color-banner-bg: oklch(35% 0.15 260);
  --color-banner-fg: oklch(100% 0 0);
  --radius-banner: 0.75rem;
}
```

And `Banner.tsx`:

```tsx
<div className="rounded-[--radius-banner] bg-[--color-banner-bg] text-[--color-banner-fg] px-8 py-6">
  {children}
</div>
```

**Step 3.** Translate state variants to Tailwind state utilities.

❌ Before:

```scss
.button {
  background: var(--accent-500);
  &:hover { background: var(--accent-600); }
  &.active { background: var(--accent-700); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
```

✅ After:

```tsx
<button
  data-active={isActive || undefined}
  className="
    bg-accent-500
    hover:bg-accent-600
    data-[active]:bg-accent-700
    disabled:opacity-50 disabled:cursor-not-allowed
  "
/>
```

The `data-active` attribute pattern is how you bind a runtime boolean to a CSS state selector without resorting to conditional class strings.

**Step 4.** Translate SCSS mixins. There are two cases.

*Local mixin used once or twice* — inline it as utilities. The mixin disappears.

*Cross-file mixin used many times* — convert to a `cva` recipe in the component or a `@utility` in Tailwind v4. Acknowledged: `@apply` exists and works. It is also a smell. Reach for it only when (a) the rule is genuinely cross-component and (b) `cva` would mean prop-drilling a variant through six layers.

```ts
// component-level recipe via cva
import { cva } from "class-variance-authority";

export const card = cva(
  "rounded-lg border border-line bg-surface shadow-sm",
  {
    variants: {
      tone: {
        neutral: "bg-surface",
        accent: "bg-accent-50",
        danger: "bg-danger-50 border-danger-200",
      },
      size: { sm: "p-3", md: "p-5", lg: "p-8" },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);
```

**Step 5.** Translate `:global` selectors. SCSS Modules use `:global(.foo)` to escape the local hash; Tailwind has no equivalent because there's no hashing in the first place. Two replacements:

- If the global was a one-off override, move it into `globals.css` wrapped in `:where()` so it stays low-specificity.
- If the global was a hack to style a child component, fix the child component instead. The hack disappears.

**Step 6.** Delete the `.module.scss` file. Remove the `import styles from "./X.module.scss"` line. Remove the `className={styles.x}` references — they should already be gone, but a final pass catches stragglers.

### Gotchas

⚠ **Don't translate SCSS rule-by-rule.** The agent's instinct is to map one SCSS block to one Tailwind class string. That preserves SCSS organisation in Tailwind, which is the worst of both worlds. Tell the agent: "Rewrite the JSX layout-first; ignore the SCSS structure."

⚠ **Variable name collisions.** SCSS lets you have `$primary` in two files meaning different things. Tokens are global. Pick a namespaced name (`--color-banner-bg`) or risk colliding with an existing token.

⚠ **Mixins that take parameters.** SCSS mixins with arguments (`@mixin elevation($level)`) translate to either a `cva` variant or a small React component. They do **not** translate to `@apply`.

⚠ **`:global` migrations are easy to over-do.** When in doubt, ask whether the global selector is fixing a styling issue or a structure issue. Most are structure issues in disguise.

⚠ **Don't migrate a component that's about to be redesigned.** Wasted work. If the design system roadmap has this page slated for a v2 in the next quarter, defer.

From the audits I've done, the most common mistake is keeping the `.module.scss` file "for safety" after migrating the JSX. It now silently bloats the bundle and confuses the next agent that opens the directory. Delete the file in the same commit.

### Verification checklist

- [ ] `.module.scss` deleted.
- [ ] No `import styles from "./*.module.scss"` remains in the component file.
- [ ] Component renders identically — visual diff (Playwright screenshot or Chromatic) shows zero pixel changes.
- [ ] All new tokens added to `tokens.css` under `@theme`, not inlined as hex.
- [ ] No `@apply` used outside `globals.css` and the documented recipes file.
- [ ] `pnpm build` produces a smaller CSS bundle (`stat dist/_astro/*.css`).
- [ ] No new `:global` selectors introduced.
- [ ] `MIGRATIONS.md` row for this component flipped from Frozen to Current.

---

## Recipe 3: MUI v5 → MUI v6

### Scope

Bump `@mui/material` from v5 to v6, then fix the breaking changes one component family at a time. **One PR per family** — Grid, Theme, Palette, `sx` — not one PR for the whole upgrade.

In scope:

- `package.json` version bump.
- All `<Grid>` and `<Grid2>` usages.
- Theme file (`src/theme/index.ts`).
- Components that use deprecated palette tokens.

Not in scope on the first pass:

- Pigment CSS adoption. v6 supports it as an opt-in zero-runtime CSS engine; treat it as a separate migration that comes after the v6 baseline is green.

### Reference implementation

- The official MUI v5 → v6 codemod output for one already-migrated file — `src/components/billing/OrderTable.tsx`.
- `src/theme/index.ts` — the v6 theme shape with the new `colorSchemes` API.

### Step-by-step migration

**Step 1.** Bump the version, run the codemod:

```sh
pnpm dlx @mui/codemod@latest v6.0.0/preset-safe src
```

The codemod handles ~80% of the mechanical changes. Review the diff before committing — it occasionally rewrites comments. Commit the codemod output as its own commit so the next steps are reviewable separately.

**Step 2.** Migrate `Grid2` → `Grid`. In v6, the legacy `Grid` is removed and the v5-era `Grid2` (`@mui/material/Unstable_Grid2`) becomes the new `Grid`.

❌ Before:

```tsx
import Grid2 from "@mui/material/Unstable_Grid2";

<Grid2 container spacing={2}>
  <Grid2 xs={12} md={6}>...</Grid2>
</Grid2>
```

✅ After:

```tsx
import Grid from "@mui/material/Grid";

<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>...</Grid>
</Grid>
```

Note the API shift: `xs={12} md={6}` becomes `size={{ xs: 12, md: 6 }}`. The codemod handles this for `Grid2`. It does *not* handle it for the legacy `Grid` — the agent has to rewrite those by hand.

**Step 3.** Update the theme. v6 introduces `colorSchemes` for native light/dark support.

❌ Before — v5:

```ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0b3d91" },
    secondary: { main: "#f59e0b" },
  },
});
```

✅ After — v6:

```ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0b3d91" },
        secondary: { main: "#f59e0b" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#7aa9ff" },
        secondary: { main: "#fcd34d" },
      },
    },
  },
});
```

**Step 4.** Fix deprecated palette tokens. v6 removed several v5-era aliases (`palette.primary.lightChannel`, `palette.text.primaryChannel`, and friends). Run typecheck — every removed token is now a TS error.

**Step 5.** Audit `sx` usage. v6 changed the type narrowing for `sx` so that array-of-callbacks expressions that compiled silently in v5 now produce TS errors. Convert array callbacks:

❌ Before:

```tsx
<Box sx={[{ p: 2 }, (theme) => ({ color: theme.palette.text.primary })]} />
```

✅ After:

```tsx
<Box
  sx={(theme) => ({
    p: 2,
    color: theme.palette.text.primary,
  })}
/>
```

**Step 6.** Pigment CSS is *not* in scope. If `MIGRATIONS.md` lists Pigment as a target, add a separate `migrate-mui-to-pigment.md` recipe. Do not mix the two.

### Gotchas

⚠ **The codemod is partial.** It handles `Grid2 → Grid` imports and a few palette token renames. It does not handle the `Grid` `size` prop shift or the `colorSchemes` theme restructure. Plan for manual work.

⚠ **`useTheme()` return type narrowed.** Any code that did `theme.palette.foo as string` may now type-check correctly and reveal a latent bug. Take the type errors seriously — they are usually pointing at real problems.

⚠ **`StyledEngineProvider` semantics changed slightly.** If your app uses both Emotion (default) and `@emotion/styled` consumers, double-check the cache injection order after the upgrade. The visible symptom is "MUI styles override our custom styles in production but not in dev."

⚠ **Date pickers track a separate version.** `@mui/x-date-pickers` v7 is the matching peer for MUI v6. Bump them together or the date picker imports break.

⚠ **Storybook decorators.** If your Storybook uses the v5 `ThemeProvider`, update the decorator to the v6 shape. Otherwise stories render with the default theme and you'll think your migration broke colours.

From the audits I've done, the most common mistake is migrating Grid in one PR and theme in another *separate week*, leaving the codebase half-migrated for days. Do them in the same week, behind the same feature branch off `main`, even if they're separate PRs.

### Verification checklist

- [ ] `@mui/material` and `@mui/x-date-pickers` versions are aligned to v6 / v7.
- [ ] No imports from `@mui/material/Unstable_Grid2`.
- [ ] No `<Grid xs={N}>` — all use `size={{ xs: N }}`.
- [ ] Theme uses `colorSchemes` (light + dark) — even if dark mode is "off" today.
- [ ] `pnpm typecheck` passes; no `@ts-ignore` added.
- [ ] Visual regression: storybook builds, every story renders, no missing palette tokens.
- [ ] `MIGRATIONS.md` row updated; Pigment migration listed separately as 🎯 Target.

---

## Recipe 4: Formik → react-hook-form + Zod

### Scope

Migrate one Formik form at a time. A "form" means one top-level `<Formik>` and its tree.

In scope:

- The form component, its Yup schema, and its submit handler.
- Custom field components used only by this form.

Not in scope:

- Field components shared across many forms (`molecules/FormTextField`, etc.) — those should already exist in their react-hook-form shape from Part 2's Week 2. If they don't, write them first.

### Reference implementation

- `src/forms/BookForm.tsx` — canonical RHF form with `useForm`, `Controller`, and `zodResolver`.
- `src/forms/schemas/book.ts` — the matching Zod schema.

### Step-by-step migration

**Step 1.** Translate the Yup schema to Zod. Most translations are one-for-one.

| Yup | Zod |
| --- | --- |
| `yup.string().required()` | `z.string().min(1, "Required")` |
| `yup.string().email()` | `z.string().email()` |
| `yup.number().positive()` | `z.number().positive()` |
| `yup.array().of(...).min(1)` | `z.array(...).min(1)` |
| `yup.object().shape({ ... })` | `z.object({ ... })` |
| `yup.string().nullable()` | `z.string().nullable()` |
| `.when("field", ...)` | `.refine()` or `.superRefine()` |

❌ Before — `schemas/orderYup.ts`:

```ts
import * as yup from "yup";

export const orderSchema = yup.object({
  bookId: yup.string().required("Book required"),
  amount: yup.number().positive().required(),
  notes: yup.string().nullable(),
});
```

✅ After — `schemas/order.ts`:

```ts
import { z } from "zod";

export const orderSchema = z.object({
  bookId: z.string().min(1, "Book required"),
  amount: z.number().positive(),
  notes: z.string().nullable(),
});

export type OrderInput = z.infer<typeof orderSchema>;
```

**Step 2.** Replace the Formik root with `useForm`.

❌ Before:

```tsx
<Formik
  initialValues={defaults}
  validationSchema={orderSchema}
  onSubmit={handleSubmit}
>
  {(formik) => (
    <Form>
      <Field name="bookId" />
      {formik.errors.bookId && <span>{formik.errors.bookId}</span>}
    </Form>
  )}
</Formik>
```

✅ After:

```tsx
const form = useForm<OrderInput>({
  defaultValues: defaults,
  resolver: zodResolver(orderSchema),
});

return (
  <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <input {...form.register("bookId")} />
      {form.formState.errors.bookId && (
        <span>{form.formState.errors.bookId.message}</span>
      )}
    </form>
  </FormProvider>
);
```

**Step 3.** Translate `<Field>` calls.

For native inputs, use `register`:

```tsx
<input {...form.register("amount", { valueAsNumber: true })} />
```

For custom or controlled components (MUI `Autocomplete`, date pickers, anything that doesn't accept `ref` natively), use `<Controller>`:

```tsx
<Controller
  control={form.control}
  name="bookId"
  render={({ field, fieldState }) => (
    <BookAutocomplete
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  )}
/>
```

**Step 4.** Translate `FieldArray` to `useFieldArray`.

❌ Before:

```tsx
<FieldArray name="lineItems">
  {({ push, remove }) => (
    values.lineItems.map((_, i) => (
      <div key={i}>
        <Field name={`lineItems.${i}.description`} />
        <button onClick={() => remove(i)}>Remove</button>
      </div>
    ))
  )}
</FieldArray>
```

✅ After:

```tsx
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "lineItems",
});

return fields.map((field, i) => (
  <div key={field.id}>
    <input {...form.register(`lineItems.${i}.description`)} />
    <button type="button" onClick={() => remove(i)}>Remove</button>
  </div>
));
```

Note `key={field.id}` — react-hook-form provides a stable id on each field; do not use the array index.

**Step 5.** Delete the Formik component file and any `formik-mui` bridge components.

### Gotchas

⚠ **Error display location differs.** Formik exposes `formik.errors.fieldName`; RHF exposes `formState.errors.fieldName.message`. The agent will write `errors.fieldName` (without `.message`) and silently render `[object Object]` in production.

⚠ **`touched` vs `dirty` semantics.** Formik's `touched` flag flips when a field is blurred. RHF's `touchedFields` flips on blur, `dirtyFields` flips on change. If your form previously only showed errors after blur, set `mode: "onTouched"` in `useForm`.

⚠ **Form-level errors.** Formik supports `setStatus({ formError })` for whole-form messages. In RHF, use `setError("root", { message })` and read `formState.errors.root?.message`.

⚠ **Initial values vs default values.** Formik re-initialises from `initialValues` when they change (with `enableReinitialize`). RHF does not re-render on `defaultValues` change — you have to call `form.reset(newDefaults)` in a `useEffect`.

⚠ **Async validation.** Yup's async validation maps to Zod via `.refine(async (val) => ...)` returning a promise. The Zod resolver supports this, but the agent will sometimes forget the `async` keyword in the refinement.

From the audits I've done, the most common mistake is keeping `formik-mui` field bridges (`<FormikTextField>`) around "until later." They block the migration of every field component. Replace them in the same PR as the form root.

### Verification checklist

- [ ] No `Formik`, `Field`, `Form`, `FieldArray`, or `useFormik` imports remain in the file.
- [ ] No `formik` or `formik-mui` or `yup` imports remain in the file.
- [ ] Zod schema exported with `z.infer` type alias.
- [ ] Form errors render `.message`, not the error object.
- [ ] Form `mode` chosen explicitly (`onSubmit`, `onBlur`, `onTouched`, `onChange`).
- [ ] If form had `enableReinitialize`, replacement `useEffect` + `reset` is in place.
- [ ] `pnpm typecheck` and `pnpm test` pass.
- [ ] `MIGRATIONS.md` row for forms updated.

---

## Recipe 5: useEffect-fetch → TanStack Query

### Scope

Migrate one screen at a time. A screen typically has 1–3 data-loading hooks. Migrate all of them together — partial migration leaves you with two loading-state shapes on the same page.

In scope:

- `useEffect(() => { fetch(...).then(setData) }, [...])` patterns.
- Sibling `useState` for `data`, `loading`, `error`.
- Mutations done with raw `fetch` + manual refetch.

Not in scope:

- WebSocket subscriptions — TanStack Query has `streamedQuery` but it's a separate recipe.
- File uploads — keep `useMutation` for the kickoff but the upload mechanism itself is unchanged.

### Reference implementation

- `src/screens/Orders/OrdersList.tsx` — canonical `useQuery` usage with pagination.
- `src/api/queries.ts` — query-key factory pattern (this is the convention; copy it).

### Step-by-step migration

**Step 1.** Replace the effect with `useQuery`.

❌ Before:

```tsx
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  setLoading(true);
  fetch("/api/orders")
    .then((r) => r.json())
    .then(setOrders)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

✅ After:

```tsx
const { data: orders = [], isLoading, error } = useQuery({
  queryKey: orderKeys.list(),
  queryFn: () => fetch("/api/orders").then((r) => r.json()),
});
```

Three `useState`s collapse into one hook. `isLoading` is true only on first load; subsequent refetches set `isFetching` instead — which is usually what you want (no full-page spinner when the data refreshes in the background).

**Step 2.** Establish the query-key factory.

```ts
// src/api/queries.ts
export const orderKeys = {
  all: ["orders"] as const,
  list: () => [...orderKeys.all, "list"] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
  byBook: (bookId: string) =>
    [...orderKeys.all, "byBook", bookId] as const,
};
```

**Every** query key in the file goes through the factory. No inline `["orders", id]` arrays — they bypass the type system and break invalidation.

**Step 3.** Replace mutations.

❌ Before:

```tsx
const handleDelete = async (id: string) => {
  await fetch(`/api/orders/${id}`, { method: "DELETE" });
  // re-run the loading useEffect somehow…
  setOrders((prev) => prev.filter((i) => i.id !== id));
};
```

✅ After:

```tsx
const queryClient = useQueryClient();

const deleteOrder = useMutation({
  mutationFn: (id: string) =>
    fetch(`/api/orders/${id}`, { method: "DELETE" }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: orderKeys.all });
  },
});

const handleDelete = (id: string) => deleteOrder.mutate(id);
```

`invalidateQueries({ queryKey: orderKeys.all })` matches the list, the detail, and every per-book view in one line. This is why the key factory exists.

**Step 4.** Audit the default behaviour. TanStack Query refetches on window focus, on reconnect, and at a stale interval by default. **Do not disable these by default.** The agent will see `refetchOnWindowFocus` and instinctively turn it off because "the old code didn't do that." The old code was buggy. Leave the defaults on.

If a query genuinely should not refetch — a one-shot config fetch at boot — set `staleTime: Infinity` explicitly and add a comment explaining why.

**Step 5.** Delete the `useState` triplet (`data`, `loading`, `error`) for this screen.

### Gotchas

⚠ **Query keys are not strings.** They're tuples. `["orders"]` and `"orders"` are different keys; the second one will not be invalidated by the first. Use the factory.

⚠ **`isLoading` vs `isFetching`.** `isLoading` is true only when there's no cached data. After the first load, refetches set `isFetching` instead. If you render a full-screen spinner on `isLoading`, the UX is correct. If you render it on `isFetching`, the UI flickers on every background refetch.

⚠ **Stale data on mount.** With `staleTime: 0` (the default), every mount re-fetches. For fast-changing data (notifications, prices) this is correct. For slow-changing data (user profile, app config) bump `staleTime` to minutes or hours. Don't set `cacheTime: Infinity` — that's a memory leak waiting to happen.

⚠ **Suspense mode is opt-in.** `useQuery` does not throw promises by default. If you migrate a `<Suspense>` boundary expecting it to "just work," it won't — use `useSuspenseQuery` explicitly.

⚠ **Mutations don't replace the query.** A common mistake: writing `setOrders(prev => [...prev, newOne])` inside `onSuccess`. That mutates local state, but the cache still holds the old list. Either use `setQueryData` to update the cache, or invalidate the query and let TanStack refetch.

From the audits I've done, the most common mistake is disabling `refetchOnWindowFocus` globally because "it's noisy in dev." It's the single feature that catches stale data in production. Leave it on. If it's noisy in dev, that's the bug.

### Verification checklist

- [ ] No `useEffect` + `setData` + `setLoading` triplets remain in the migrated file.
- [ ] All query keys constructed from the key factory.
- [ ] `QueryClientProvider` mounted once at app root, not per-screen.
- [ ] Devtools (`@tanstack/react-query-devtools`) wired in dev only.
- [ ] Mutations either call `invalidateQueries` or `setQueryData` — never both.
- [ ] `refetchOnWindowFocus`, `refetchOnReconnect`, and `retry` left at defaults unless there is a documented reason in a code comment.
- [ ] `pnpm typecheck` passes.
- [ ] `MIGRATIONS.md` row for server state updated.

---

## Recipe 6: Class components → Function components + hooks

### Scope

Migrate one class component at a time. Migrate leaves first (components with no child class components) so the call sites you touch are minimal.

In scope:

- Any `class X extends React.Component` or `extends PureComponent`.
- `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`.
- `this.state` and `this.setState`.
- `this.refs` and `React.createRef`.
- HOC composition (`compose(withRouter, withStyles, withTranslation)(C)`).

Explicitly **not** in scope:

- `class X extends React.Component<P, S>` where the class **is an error boundary** (uses `componentDidCatch` or `getDerivedStateFromError`). React still requires a class component for error boundaries. Leave them alone.

### Reference implementation

- `src/components/billing/OrderRow.tsx` — recently migrated from a class. The PR diff is a useful side-by-side.

### Step-by-step migration

**Step 1.** Translate lifecycle to effects.

❌ Before:

```tsx
class OrderRow extends React.Component<Props, State> {
  state = { hover: false };

  componentDidMount() {
    this.props.subscribe(this.props.orderId);
  }

  componentDidUpdate(prev: Props) {
    if (prev.orderId !== this.props.orderId) {
      this.props.unsubscribe(prev.orderId);
      this.props.subscribe(this.props.orderId);
    }
  }

  componentWillUnmount() {
    this.props.unsubscribe(this.props.orderId);
  }

  render() { /* ... */ }
}
```

✅ After:

```tsx
export const OrderRow: FC<Props> = ({ orderId, subscribe, unsubscribe }) => {
  const [hover, setHover] = useState(false);

  useEffect(() => {
    subscribe(orderId);
    return () => unsubscribe(orderId);
  }, [orderId, subscribe, unsubscribe]);

  // ...
};
```

The mount + update + unmount triple collapses into one `useEffect` with the right dependency list and a cleanup function. The cleanup runs both when `orderId` changes and when the component unmounts — which is exactly the union of `componentDidUpdate` (after diffing) and `componentWillUnmount`.

**Step 2.** Translate `this.state`. For independent pieces of state, one `useState` per piece. For state that updates together as a unit (form state, wizard state, fetch state), use `useReducer`.

❌ Before:

```tsx
class Wizard extends React.Component<{}, WizardState> {
  state: WizardState = { step: 0, answers: {}, submitting: false };

  next = () => this.setState((s) => ({ step: s.step + 1 }));
  answer = (k: string, v: string) =>
    this.setState((s) => ({ answers: { ...s.answers, [k]: v } }));
}
```

✅ After:

```tsx
type WizardAction =
  | { type: "next" }
  | { type: "answer"; key: string; value: string }
  | { type: "submit-start" };

const reducer = (s: WizardState, a: WizardAction): WizardState => {
  switch (a.type) {
    case "next": return { ...s, step: s.step + 1 };
    case "answer":
      return { ...s, answers: { ...s.answers, [a.key]: a.value } };
    case "submit-start": return { ...s, submitting: true };
  }
};

export const Wizard: FC = () => {
  const [state, dispatch] = useReducer(reducer, {
    step: 0,
    answers: {},
    submitting: false,
  });
  // ...
};
```

The rule of thumb: if two `useState` hooks must update in the same render to stay consistent, they should be one `useReducer`.

**Step 3.** Translate refs.

❌ Before:

```tsx
class Modal extends React.Component {
  inputRef = React.createRef<HTMLInputElement>();
  componentDidMount() { this.inputRef.current?.focus(); }
}
```

✅ After:

```tsx
export const Modal: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  // ...
};
```

**Step 4.** Translate HOC composition to hook composition.

❌ Before:

```tsx
export default compose(
  withRouter,
  withStyles(styles),
  withTranslation("orders"),
)(OrderList);
```

✅ After:

```tsx
export const OrderList: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("orders");
  // styles are now Tailwind utilities; withStyles disappears.
};
```

If a HOC has no hook equivalent (rare in 2026 — most have shipped one), write a custom hook that wraps the HOC's behaviour. Don't keep one class component alive just to consume one HOC.

**Step 5.** Translate `this.setState(updater, callback)`. The callback form has no direct equivalent; `useEffect` runs after the state update.

❌ Before:

```tsx
this.setState({ open: true }, () => this.props.onOpen());
```

✅ After:

```tsx
const [open, setOpen] = useState(false);
useEffect(() => {
  if (open) onOpen();
}, [open, onOpen]);

// to open:
setOpen(true);
```

This pattern is verbose but correct. The agent will try to inline `onOpen()` next to `setOpen(true)`. That works *by coincidence* in most cases — until a re-render interleaves and the callback fires against stale state. Use the effect.

### Gotchas

⚠ **Error boundaries stay classes.** React has no hook-based error boundary API as of 2026. If the codebase has `class ErrorBoundary extends React.Component`, leave it alone. Document the exception in `MIGRATIONS.md`.

⚠ **`getDerivedStateFromProps` is rare and almost always wrong.** If you see it in the class, the function-component equivalent is *not* `useEffect(setX, [propX])` — that introduces a render cycle. Compute the derived value directly in render: `const derived = computeFrom(propX);`.

⚠ **`shouldComponentUpdate` → `React.memo`.** Wrap the function component in `React.memo`. If the original `shouldComponentUpdate` did deep comparison, pass a custom comparator to `memo` — but consider whether the comparison is actually worth the cost; usually it isn't.

⚠ **Stale closures in event handlers.** Class methods bound with arrow functions always see the current `this`. Function-component handlers close over the render in which they were created. If a handler reads state, that read is from the render's snapshot. Use a `useRef` or include the value in the dependency array.

⚠ **`forwardRef` is no longer needed in React 19.** Function components accept `ref` as a regular prop. Don't reintroduce `forwardRef` during this migration — the agent will instinctively wrap because it learned the pattern from older codebases.

From the audits I've done, the most common mistake is migrating a class component that is referenced by `ref` from a parent, without checking how the parent uses the ref. If the parent calls `this.refs.child.someMethod()`, you need `useImperativeHandle` in the new function component — and that almost always means the design should change, not be papered over.

### Verification checklist

- [ ] No `class <Name> extends React.Component` remains, except documented error boundaries.
- [ ] No `componentDidMount` / `componentDidUpdate` / `componentWillUnmount`.
- [ ] No `this.setState`, no `this.state`, no `this.props`.
- [ ] No `compose(...)` HOC chains in the migrated file.
- [ ] No `forwardRef` reintroduced (React 19 codebase).
- [ ] Dependency arrays on every `useEffect`; ESLint `react-hooks/exhaustive-deps` passes.
- [ ] `pnpm typecheck` and `pnpm test` pass.
- [ ] `MIGRATIONS.md` updated; if an error boundary remains, that's noted as a documented exception, not a Frozen entry.

---

## Picking the order

If your `MIGRATIONS.md` has rows in three or four of these pairs at once, which do you start with?

| Recipe | Time per unit | Risk | Sequence advice |
| --- | --- | --- | --- |
| 1. Redux → Zustand | ~half day per slice | Low | Anytime. Slices are independent. |
| 2. SCSS → Tailwind | ~hour per component | Low | After tokens are in place. |
| 3. MUI v5 → v6 | One sprint | Medium | Do whole-app; don't half-migrate. |
| 4. Formik → RHF + Zod | ~half day per form | Medium | Field components first, then forms. |
| 5. useEffect → TanStack | ~hour per screen | Low | Anytime; one screen at a time. |
| 6. Class → Function | ~hour per leaf | Low | Leaves first, then containers. |

Recipes 1, 5, and 6 can run in parallel because they touch disjoint files. Recipe 3 should be a single dedicated effort. Recipes 2 and 4 depend on shared primitives (tokens; field components) being in place — Week 2 of the three-week plan from Part 2 sets those up.

The unifying principle across all six: **one unit at a time, on `main`, behind a passing typecheck.** A long-lived "migration branch" turns into a long-dead branch. Small PRs into `main`, every one of them green, every one of them flipping one row of `MIGRATIONS.md` from ❄️ Frozen to ✅ Current.

---

## What to do with these recipes

1. Copy the recipe(s) you need into `docs/prompts/migrate-<x>-to-<y>.md`.
2. Replace the reference implementation paths with paths real for your repo.
3. Tighten or loosen the scope and gotchas to match what you've actually seen in your audit.
4. Hand the recipe plus a scope ("migrate the Books slice") to an agent.
5. When the agent gets something wrong, fix the recipe — not just the output.

After three or four runs the recipe stabilises. After a quarter, you have a small library that turns the most expensive kind of work in a legacy codebase — incremental migration — into deterministic mechanical work.

`MIGRATIONS.md` is the map. These six recipes are the moves. The agent does the walking.
