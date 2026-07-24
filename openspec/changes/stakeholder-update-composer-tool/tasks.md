# Tasks — Stakeholder Update Composer

> Prerequisite: `donut-crm-pipeline-data-contract` implemented
> (`src/utils/pipeline-store.ts` exists and `pnpm check` passes with it).
> Sibling tool lanes are soft dependencies only (design.md D1).

## 1. Store and source readers

- [x] 1.1 Create `src/utils/update-store.ts`: `UpdateSourceRefs` and
      `UpdateRecord` (design.md D3) and the store via
      `createToolStore<UpdateRecord>({ storageKey: "pm-update-v1", idPrefix: "upd" })`
- [x] 1.2 Add the read-only source readers (same file or
      `src/utils/update-sources.ts`): contract-level structural types
      `OkrSourceRecord` / `CheckinSourceRecord` / `CadenceSourceRecord` and a
      `readStore<T>` helper over `pm-okr-v1`, `pm-checkin-v1`, `pm-cadence-v1`
      filtered by `productId` + `quarterKey` — exposing no write path (D1).
      Reconcile field names against any sibling store code merged by now
      (`src/utils/{okr,checkin,cadence}-store.ts` if present)
      — Done in `update-sources.ts`. `okr-store.ts` is on main; its
      `OkrRecord`/`OkrKeyResult` fields match `OkrSourceRecord` exactly.
      `checkin-store.ts`/`cadence-store.ts` are absent (parallel lanes) → read
      defensively; field names track the proposals (see HANDOFF reconciliation note).
- [x] 1.3 Add the OST source resolver: default tree from
      `getActiveId("standalone")` → most recent `listTrees()` → none; extract
      discovery highlights (outcome, `target: true` opportunities, solution
      counts) from `OstTree`; snapshot + drift check per design.md D2
- [x] 1.4 Implement `composeBody(product, quarter, sources): string` as a pure
      function: fixed section order, missing sources omitted, KR confidence
      joined via `OkrKeyResultRef.keyResultId`, always-present asks/next-steps
      prompt
- [x] 1.5 `pnpm check` passes with the new utils

## 2. Island components

- [x] 2.1 Create `src/components/tools/stakeholder-update-composer/UpdateComposer.tsx`:
      `resolveActiveProduct()`, quarter select (default `currentQuarter()`),
      draft list + create/switch/delete via the factory store and per-product
      active pointer (draft list surfaced via `UpdateSwitcher.tsx` dropdown)
- [x] 2.2 Create `CoverageChecklist.tsx`: four source rows with found/missing
      state, missing rows naming the source tool, D5 changed/removed badge for
      OST drift; never blocks composing
- [x] 2.3 Create `DraftEditor.tsx`: title input, markdown textarea bound to
      `body`, copy-to-clipboard with manual-selection fallback, confirmed
      "Recompose from sources" with edited-since-compose warning
      (`updatedAt` > `composedAt`)
- [x] 2.4 Styling per repo law: Tailwind utilities on `tokens.css` variables
      only (no hardcoded colors/px), lucide-react icons, `prefers-reduced-motion`
      respected. NOTE: no in-island `<ScrollReveal>` — it is `.astro`-only (bd
      memory `tool-island-gotcha-scrollreveal`), and this island has no long
      fade-in list (drafts live in a dropdown); the hero uses `<ScrollReveal>`
      on the page. Stagger convention N/A here.

## 3. Page

- [x] 3.1 Create `src/pages/tools/stakeholder-update-composer.astro`:
      `SiteShell` + hero (eyebrow, display heading, "composes only — nothing
      is sent anywhere" copy) + `<UpdateComposer client:load />`, mirroring
      `src/pages/tools/opportunity-solution-tree.astro`
- [~] 3.2 Cross-link: add the tool to wherever the OST tool is surfaced
      (tools index/nav if one exists by then; otherwise page-level links
      between the pipeline tool pages)
      — PARTIAL / BLOCKED by lane scope. My page links OUTWARD to OKR Organizer
      and OST via the coverage rows. The inbound surface is
      `src/components/chrome/SiteFooter.astro` (Tools list) — OUTSIDE this
      lane's allowed scope (scope-guard blocks it). Exact snippet for the
      orchestrator is in HANDOFF.md; add after the North Star Metric Tree `<li>`.

## 4. Spec scenario verification (manual, in browser)

- [ ] 4.1 Full-pipeline compose: seed OKR/check-in/cadence records (via
      sibling tools if merged, else hand-written localStorage fixtures
      matching D8) + an OST tree; verify all sections and per-KR confidence
- [ ] 4.2 Partial pipeline: only OKR + OST → only those sections plus asks
      prompt; nothing at all → headline + asks prompt, coverage all-missing
- [ ] 4.3 Persistence: edit body, reload, draft restored; two products →
      drafts correctly scoped per product
- [ ] 4.4 Recompose confirmation overwrites only after confirm; edited-since-
      compose warning shows
- [ ] 4.5 Copy action puts full body on clipboard; simulate clipboard denial
      → manual-copy fallback, no page error
- [ ] 4.6 Read-only guarantee: snapshot sibling keys before/after a full
      compose-edit-copy session and confirm byte-identical
- [ ] 4.7 OST drift: delete the referenced tree, reopen draft → badge shown,
      body unchanged

## 5. Verification and close-out

- [ ] 5.1 Quality gates: `pnpm check` and `pnpm build` pass; no new
      dependencies added to `package.json`
- [ ] 5.2 Confirm no locked URL changed; new route is exactly
      `/tools/stakeholder-update-composer/`
- [ ] 5.3 File follow-up beads: `stakeholder-update-sources-v2` (Backlog
      Prioritizer / Test Register sections) and note the still-open
      `pipeline-tools-chrome` question; file + close a bead for this change's
      implementation (none pre-exists)
- [ ] 5.4 `openspec archive stakeholder-update-composer-tool` after deploy
      verification
