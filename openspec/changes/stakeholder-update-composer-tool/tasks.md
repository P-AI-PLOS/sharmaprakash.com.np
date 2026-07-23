# Tasks — Stakeholder Update Composer

> Prerequisite: `donut-crm-pipeline-data-contract` implemented
> (`src/utils/pipeline-store.ts` exists and `pnpm check` passes with it).
> Sibling tool lanes are soft dependencies only (design.md D1).

## 1. Store and source readers

- [ ] 1.1 Create `src/utils/update-store.ts`: `UpdateSourceRefs` and
      `UpdateRecord` (design.md D3) and the store via
      `createToolStore<UpdateRecord>({ storageKey: "pm-update-v1", idPrefix: "upd" })`
- [ ] 1.2 Add the read-only source readers (same file or
      `src/utils/update-sources.ts`): contract-level structural types
      `OkrSourceRecord` / `CheckinSourceRecord` / `CadenceSourceRecord` and a
      `readStore<T>` helper over `pm-okr-v1`, `pm-checkin-v1`, `pm-cadence-v1`
      filtered by `productId` + `quarterKey` — exposing no write path (D1).
      Reconcile field names against any sibling store code merged by now
      (`src/utils/{okr,checkin,cadence}-store.ts` if present)
- [ ] 1.3 Add the OST source resolver: default tree from
      `getActiveId("standalone")` → most recent `listTrees()` → none; extract
      discovery highlights (outcome, `target: true` opportunities, solution
      counts) from `OstTree`; snapshot + drift check per design.md D2
- [ ] 1.4 Implement `composeBody(product, quarter, sources): string` as a pure
      function: fixed section order, missing sources omitted, KR confidence
      joined via `OkrKeyResultRef.keyResultId`, always-present asks/next-steps
      prompt
- [ ] 1.5 `pnpm check` passes with the new utils

## 2. Island components

- [ ] 2.1 Create `src/components/tools/stakeholder-update-composer/UpdateComposer.tsx`:
      `resolveActiveProduct()`, quarter select (default `currentQuarter()`),
      draft list + create/switch/delete via the factory store and per-product
      active pointer
- [ ] 2.2 Create `CoverageChecklist.tsx`: four source rows with found/missing
      state, missing rows naming the source tool, D5 changed/removed badge for
      OST drift; never blocks composing
- [ ] 2.3 Create `DraftEditor.tsx`: title input, markdown textarea bound to
      `body`, copy-to-clipboard with manual-selection fallback, confirmed
      "Recompose from sources" with edited-since-compose warning
      (`updatedAt` > `composedAt`)
- [ ] 2.4 Styling per repo law: Tailwind utilities on `tokens.css` variables
      only (no hardcoded colors/px), lucide-react icons, `<ScrollReveal>` with
      stagger capped at `Math.min(i, 4) * 40`, `prefers-reduced-motion`
      respected; check `design.md` (repo root) before inventing any visual

## 3. Page

- [ ] 3.1 Create `src/pages/tools/stakeholder-update-composer.astro`:
      `SiteShell` + hero (eyebrow, display heading, "composes only — nothing
      is sent anywhere" copy) + `<UpdateComposer client:load />`, mirroring
      `src/pages/tools/opportunity-solution-tree.astro`
- [ ] 3.2 Cross-link: add the tool to wherever the OST tool is surfaced
      (tools index/nav if one exists by then; otherwise page-level links
      between the pipeline tool pages)

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
