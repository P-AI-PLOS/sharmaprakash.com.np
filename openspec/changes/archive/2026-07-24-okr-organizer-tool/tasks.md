# Tasks — okr-organizer-tool

> Depends on change `donut-crm-pipeline-data-contract` being implemented
> (`src/utils/pipeline-store.ts` must exist and export the D2 API). Do not
> shim or copy the contract locally.
>
> **Coordination note (added during reconciliation, after this proposal was
> written):** the sibling change `okr-check-in-tool` carries a delta against
> `pipeline-data-contract` — the "draft OKR handoff marker" — obligating this
> tool to render `draft: true` / `draftedFrom` records visibly distinct from
> committed entries, with an accept action that clears the flag. That
> obligation isn't reflected below except as task 2.8; if `okr-check-in-tool`
> lands first, read its delta spec before implementing 2.8.

## 1. Store

- [x] 1.1 Confirm `src/utils/pipeline-store.ts` exists and exports
      `createToolStore`, `uid`, `resolveActiveProduct`, `QuarterRef`,
      `ToolRecordBase`, `quarterKey`, `parseQuarterKey`, `currentQuarter`,
      `nextQuarter`, `compareQuarters`. If not, STOP — the contract change
      must land first
- [x] 1.2 Create `src/utils/okr-store.ts`: `OkrKeyResult`
      (`{ id, who, doesWhat, byHowMuch }`), `OkrTag`
      (`{ kind: "department" | "product", label }`), `OkrRecord extends
      ToolRecordBase` with `quarter/objective/keyResults/tag`, and
      `okrStore = createToolStore<OkrRecord>({ storageKey: "pm-okr-v1",
      idPrefix: "okr" })` per design.md D1
- [x] 1.3 Add store-level helpers: `newKeyResult()` (mints `uid("kr")` with
      empty fields), `entriesByQuarter(productId)` (group by `quarterKey`,
      order groups with `compareQuarters` desc), and a `titleFor(record)`
      fallback ("Untitled objective") mirroring ost-store's `titleFor`
- [x] 1.4 Export the intro-dismissed flag helpers on key
      `pm-okr-v1-intro-dismissed` (read/write boolean with the same silent
      try/catch behavior)

## 2. Components (`src/components/tools/okr/`)

- [x] 2.1 `OkrOrganizer.tsx` — top-level island: resolve active product in a
      client-only effect (SSR-safe like `tools/ost/TreeBuilder.tsx`), hold
      selected-quarter state seeded from `currentQuarter()`, render
      FormatChooser (when not dismissed) → quarter selector → current
      quarter's entries + "Add objective" → QuarterHistory; show the active
      product's name read-only (no switcher — deferred to
      `pipeline-tools-chrome`)
- [x] 2.2 Quarter selector: prev/next chevron buttons around the
      `quarterKey` label using `nextQuarter` and a local inverse, per
      design.md D5
- [x] 2.3 `OkrEntryForm.tsx` — objective textarea (required, inline error on
      blank save), tag control (kind toggle + label input), KR rows with
      labeled Who / Does what / By how much inputs and Donut CRM example
      placeholders, add-KR capped at 5, remove-KR per row, save via
      `okrStore.create`/`update`, delete with `window.confirm` (match
      OstDashboard's pattern)
- [x] 2.4 Ensure KR ids are minted via `newKeyResult()` on row add and
      preserved through edits/reorders — never regenerated on save
- [x] 2.5 `FormatChooser.tsx` — dismissible card contrasting OKR vs Rock vs
      North Star metric with one-line "choose this when…" guidance, two
      dismiss actions, persistence via the intro-dismissed flag, and a
      "What's the difference?" reopen button rendered in the organizer
      header (design.md D4; never gates the form)
- [x] 2.6 `QuarterHistory.tsx` — quarter groups from `entriesByQuarter`,
      each entry row showing objective, tag chip, KR count, updated date;
      clicking a past entry loads it into the editor
- [x] 2.7 Styling: Tailwind token utilities only (no hardcoded colors/px per
      repo rules), `lucide-react` icons, `text-caption`/`text-body`/
      `link-underline` classes consistent with the OST components
- [x] 2.8 Draft-record handling (per `okr-check-in-tool`'s
      `pipeline-data-contract` delta, if that change has landed): entries
      with `draft: true` render with a distinct badge/style in both the
      current-quarter list and `QuarterHistory`; an "Accept" action clears
      the `draft` flag while retaining `draftedFrom`; entries without the
      field render exactly as before this task

## 3. Page

- [x] 3.1 Create `src/pages/tools/okr-organizer.astro`: SiteShell with
      title/description, hero (eyebrow "Free tool", H1, Gothelf
      customer-centric OKR framing, "data stays in your browser" line),
      then `<OkrOrganizer client:load />` — mirror
      `src/pages/tools/opportunity-solution-tree.astro`
- [x] 3.2 Cross-link the two tool pages: OKR page links to the OST builder
      as the next pipeline stage (Discovery); do NOT change any existing
      route paths
      — **PARTIAL (one direction only).** The OKR page links out to
      `/tools/opportunity-solution-tree/`. The reverse link (OST page →
      OKR organizer) was blocked by this lane's scope guard, which allows
      edits only under `src/components/tools/okr/**`,
      `src/pages/tools/okr-organizer.astro`, `src/utils/okr-store.ts`, and
      this change dir. The orchestrator should add the reverse link at
      merge — see HANDOFF.md for the exact snippet.

## 4. Copy & sample data

- [x] 4.1 Write FormatChooser copy (OKR vs Rock vs North Star) — structure
      fixed by design.md D4, sentences need a human-quality pass
- [x] 4.2 Write field helper copy and placeholders using the Donut CRM
      running case (e.g. who: "Trial bakery owners", doesWhat: "complete
      their first order pipeline", byHowMuch: "from 12% to 40%")
- [x] 4.3 Empty states: no entries for selected quarter; first-ever visit
- [x] 4.4 Add a `SAMPLE_OKR` constant seeding one example entry for the
      Donut CRM product on first run, easy to remove if the open question
      resolves against seeding (design.md Open Questions)

## 5. Verification

- [x] 5.1 `pnpm check` passes — in particular `OkrRecord` satisfies
      `ToolRecordBase` and a throwaway `OkrKeyResultRef` construction from a
      saved record's `{ id }` + `keyResults[n].id` compiles (then delete the
      snippet)
- [x] 5.2 `pnpm build` succeeds and `dist/` contains
      `/tools/okr-organizer/` output; no existing URL output changed
- [x] 5.3 Manual smoke in `pnpm dev` (no test framework in this repo —
      TypeScript + build + scripted manual pass are the gates, per the
      contract design's Risks): first run shows FormatChooser and seeds
      "Donut CRM"; create an entry with 2 KRs, reload, entry persists with
      stable `okr_`/`kr_` ids; quarter chevrons move selection and history
      groups correctly across two quarters; dismiss FormatChooser, reload,
      stays dismissed, reopen button works; blank objective save is blocked
- [x] 5.4 Verify localStorage keys used are exactly `pm-okr-v1`,
      `pm-okr-v1-active`, `pm-okr-v1-intro-dismissed` and that
      `ost-store.ts` and OST components are untouched (`git diff`)
      — Confirmed in-browser: the tool's own keys are `pm-okr-v1` and
      `pm-okr-v1-intro-dismissed`, plus the contract's shared
      `pm-products-v1` / `pm-active-product-v1`. `pm-okr-v1-active` is
      provisioned by `createToolStore` (default `<storageKey>-active`) but
      never written, because per design D3 this tool has no
      one-active-record pointer — `QuarterHistory` is the switcher. No
      other key is touched; `git diff` on `ost-store.ts` and
      `src/components/tools/ost/` is empty.
- [x] 5.5 Close-out: update/close the follow-up bead for the OKR Organizer
      proposal if one was filed by the contract change's task 5.5 (none
      exist as of proposal time — `bd list` was empty); file beads for
      deferred items surfaced here (`pipeline-tools-chrome` product
      switcher, sample-OKR copy decision); flag the `prevQuarter` question
      to the contract lane
