# Tasks — donut-crm-pipeline-data-contract

## 1. Shared module scaffolding

- [ ] 1.1 Create `src/utils/pipeline-store.ts` with the module doc comment
      (localStorage-only, contract-of-record pointer to this change's design.md)
      and the shared primitives: `uid(prefix)` (`<prefix>_<8 base36>`), private
      `readJson`/`writeJson` with silent try/catch (mirror
      `src/utils/ost-store.ts` lines 42–57)
- [ ] 1.2 Export the contract types exactly as specified in design.md D2:
      `ProductRecord`, `QuarterRef`, `ToolRecordBase`, `OstPickRef`, `SpecRef`,
      `StoryRef`, `OkrKeyResultRef`, `AcceptanceCriterionRef`, `ToolStore<T>`

## 2. Product store

- [ ] 2.1 Implement the product store under `pm-products-v1` with in-memory
      cache: `listProducts` (updatedAt desc), `getProduct`, `createProduct`,
      `renameProduct`, `deleteProduct` (no cascade, per design.md D7)
- [ ] 2.2 Implement the single global active pointer under
      `pm-active-product-v1`: `getActiveProductId`, `setActiveProductId`
- [ ] 2.3 Implement `resolveActiveProduct()`: returns the pointed product;
      recovers from a dangling pointer by falling back to the most recently
      updated product; seeds and activates a "Donut CRM" product when the
      store is empty

## 3. Quarter helpers

- [ ] 3.1 Implement `quarterKey` ("YYYY-QN"), `parseQuarterKey` (null on
      malformed input), `currentQuarter(now?)`, `nextQuarter` (Q4 rolls to
      next year Q1), `compareQuarters` (chronological sort order)

## 4. Tool store factory

- [ ] 4.1 Implement `createToolStore<T extends ToolRecordBase>({ storageKey,
      idPrefix })` persisting `Record<id, T>` under the versioned key with an
      in-memory cache: `list` (updatedAt desc), `listForProduct`, `get`,
      `create` (stamps uid + equal createdAt/updatedAt), `update` (bumps
      updatedAt, preserves id/createdAt), `remove`
- [ ] 4.2 Implement the per-product active pointer on `<storageKey>-active`
      (a `Record<productId, recordId>` map): `getActiveId(productId)`,
      `setActiveId(productId, id)`

## 5. Verification

- [ ] 5.1 Type-check the contract against real consumers: `pnpm check` passes,
      and a throwaway usage snippet (instantiate `createToolStore` with a
      sample record type carrying each reference shape, then delete the
      snippet) compiles with no `any` leaks
- [ ] 5.2 Confirm `src/utils/ost-store.ts` is untouched (`git diff` clean for
      that file) and no page/component files were added — this change ships
      the module only
- [ ] 5.3 Run `pnpm build` to confirm the static build is unaffected
- [ ] 5.4 Manual smoke in `pnpm dev` browser console: import path resolves,
      `resolveActiveProduct()` seeds "Donut CRM" on a cleared localStorage,
      quarter helpers round-trip "2026-Q3", and writes survive reload
      (no test framework in this repo — TypeScript + `pnpm check`/`pnpm build`
      are the gates per design.md Risks)
- [ ] 5.5 Close-out: no open beads exist for this work today; file follow-up
      beads for the eight tool proposals plus the deferred items named in
      design.md Open Questions (`pipeline-tools-chrome`, JSON export/import),
      each referencing this change's design.md as the contract of record
