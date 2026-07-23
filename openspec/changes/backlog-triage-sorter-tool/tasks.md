## 1. Prerequisites (verify, do not build here)

- [x] 1.1 Confirm `src/utils/pipeline-store.ts` exports `createToolStore`,
      `ToolRecordBase`, `uid`, `resolveActiveProduct` (already in use by
      `src/utils/ost-store.ts`) — no contract changes needed for this tool
- [x] 1.2 Re-read
      `src/content/posts/2025-04-10-backlog-cleanup-how-to-actually-do-it.md`
      "Step two" once more immediately before writing `TriageHelpModal.tsx`
      copy, to keep the bucket criteria wording faithful to the post

## 2. Store

- [x] 2.1 Create `src/utils/backlog-triage-store.ts`: `TriageBucket`,
      `TriageItem` (with `bucket: TriageBucket | null`, `neverReason`),
      `TriageBoardRecord`, `TriageSource` types (design D3) and the store via
      `createToolStore<TriageBoardRecord>({ storageKey: "pm-backlog-triage-v1", idPrefix: "triage" })`
- [x] 2.2 Implement `contextKeyFor(source)` (`"standalone"` | `"post"`) and
      `resolveActiveBoard(source)` — remembered active board per context,
      creating an empty one if none exists (design D6)
- [x] 2.3 Implement item mutators: `addItem(boardId, text)` (unbucketed by
      default), `addItemsBulk(boardId, rawText)` (split on newlines, skip
      blanks, one unbucketed item per line), `moveItem(boardId, itemId,
      bucket)`, `setNeverReason(boardId, itemId, reason)`,
      `removeItem(boardId, itemId)`
- [x] 2.4 Implement `toMarkdown(board)` — Now/Next/Never headed lists in
      board order, unbucketed items excluded, Never items appending
      `(reason)` when set (design D8)
- [x] 2.5 Implement the render-time-only helpers `nextSizeNudge(items)`
      (design D5 threshold) and `hasUnreasonedNever(items)` — neither is
      persisted

## 3. Components (`src/components/tools/backlog-triage/`)

- [ ] 3.1 `TriageBoard.tsx` — island root: resolves the active board for its
      `source` prop, single-line add form, bulk-paste textarea, renders the
      three `TriageColumn`s plus an "unbucketed" staging area, export action
      (clipboard + visible textarea fallback, mirroring `TreeBuilder`'s copy
      pattern), optional `TriageDashboard` via a `showDashboard` prop
      > Lane note: BLOCKED — `TriageBoard.tsx`'s unbucketed staging area renders each
      > item as text + a delete button only: no bucket buttons, no `draggable` handle.
      > A newly added item therefore cannot be moved into Now/Next/Never by any means
      > (verified in `pnpm dev`: zero `[draggable="true"]` and zero
      > `button[aria-pressed]` elements on the page with four unbucketed items).
      > `TriageItemCard`'s toggles and drag handle only render for already-bucketed
      > items, which nothing can reach. Component logic is outside this lane's edit
      > scope, so this is reported, not fixed. Blocks 3.2, 3.3, 6.1, 6.2, 6.3.
- [ ] 3.2 `TriageColumn.tsx` — one bucket: header with label + one-line
      criteria copy from the post + the Next-size nudge / Never-reason
      reminder when applicable, native `onDragOver`/`onDrop` target, renders
      its items via `<ScrollReveal delay={Math.min(i, 4) * 40}>`
      > Lane note: not verified — blocked by the 3.1 staging-area gap (no item can
      > reach a column, so column rendering could not be exercised).
- [ ] 3.3 `TriageItemCard.tsx` — item text, three bucket toggle buttons
      (`aria-pressed`, `ChoiceButton`-style), `draggable="true"` handle,
      inline reason input shown only when `bucket === "never"`, delete
      action
      > Lane note: not verified — blocked by the 3.1 staging-area gap.
- [x] 3.4 `TriageDashboard.tsx` — "Your boards" list for the standalone
      context only (title, item count, updated date, open/delete), trimmed
      `OstDashboard` mirror without the course-link column
- [x] 3.5 `TriageHelpModal.tsx` — mirrors `OstHelpModal`: explains Now
      (committed, named owner), Next (size-limited, within a quarter), Never
      (closed, with a reason) in the post's own terms, links to the post
- [ ] 3.6 Apply site conventions: Tailwind utilities on `tokens.css`
      variables only (no new color tokens — buckets differ by label/icon,
      not a red/green palette), `prefers-reduced-motion` respected
      > Lane note: not audited by this lane (component code is outside its scope).

## 4. Page

- [x] 4.1 Create `src/pages/tools/backlog-triage.astro` mirroring
      `opportunity-solution-tree.astro`: `SiteShell` with title/description,
      eyebrow "Free tool" hero paraphrasing Now/Next/Never, link back to the
      source post, `client:load` `TriageBoard` island with
      `source={{ type: "standalone" }}` and `showDashboard`,
      "everything saves in your browser" copy

## 5. Post embed

- [x] 5.1 Rename
      `src/content/posts/2025-04-10-backlog-cleanup-how-to-actually-do-it.md`
      to `.mdx` (`git mv`), keeping every frontmatter field and all prose
      byte-identical
- [x] 5.2 Add `import TriageBoard from
      "~/components/tools/backlog-triage/TriageBoard.tsx";` to the
      frontmatter block and insert `<TriageBoard client:load
      source={{ type: "post" }} .../>` immediately after the existing "Step
      two: triage the survivors into now, next, never" prose — prose is not
      shortened or removed
      > Lane note: done, with one placement judgment — the embed sits after the
      > Now/Next/Never bucket-definition paragraph rather than after the section's
      > final sentence, because that final sentence ("Which leads to the step most
      > cleanups skip.") hands off into Step three, and an embed between it and the
      > `## Step three` heading would break the transition. No prose was shortened
      > or removed.
- [x] 5.3 Confirm `pnpm dev` renders the post at its existing URL
      (`/product-management/backlog-cleanup-how-to-actually-do-it/` per
      `directory: product-management` in frontmatter) unchanged apart from
      the new embed, and that the embed is interactive without a page reload

## 6. Verification

- [ ] 6.1 Spec scenario walkthrough in `pnpm dev` against
      `specs/backlog-triage-sorter/spec.md`: add single items and a bulk
      paste, confirm all start unbucketed, move items via buttons and via
      drag, confirm Never-reason is optional but nudges when empty, confirm
      the Next nudge appears/disappears at the threshold, reload and confirm
      persistence
      > Lane note: partially verified — single add and bulk paste both work, blank
      > lines are skipped, and all items start unbucketed. Bucket moves, the Never
      > reason nudge, and the Next threshold nudge could not be exercised: blocked by
      > the 3.1 staging-area gap.
- [ ] 6.2 Markdown export scenario: items in all three buckets plus one
      unbucketed item, confirm export includes only bucketed items with the
      right headings and a Never reason rendered in parentheses
      > Lane note: not verified — blocked by the 3.1 staging-area gap (nothing can be
      > bucketed, so the export renders only the board title).
- [ ] 6.3 Two-context scenario: triage items on `/tools/backlog-triage/` and
      separately inside the post embed, reload both, confirm each keeps its
      own active board; on the standalone page, create a second board and
      confirm both are listed and switchable
      > Lane note: partially verified — the post embed renders the reduced post-context
      > UI per spec (no "New board" button, no boards list) and the two contexts
      > resolve separate boards. Multi-board create/switch on the standalone page was
      > not exercised.
- [x] 6.4 Confirm the `.mdx` rename didn't change the post's route (compare
      the rendered URL before/after) and that no other post content changed
      besides the import + embed block (`git diff` review)
- [ ] 6.5 Quality gates: `pnpm check` and `pnpm build` pass (repo has no test
      framework — TypeScript and build are the gates per the pipeline
      contract's ruling); confirm no changes to `src/utils/ost-store.ts`,
      `pipeline-store.ts`, or any `agreement-certainty-matrix-tool` /
      `backlog-prioritizer-tool` files
      > Lane note: `pnpm build` passes. `pnpm check`'s 151 errors are pre-existing —
      > identical count with this lane's changes stashed. This lane touched no store
      > or component code.
- [ ] 6.6 Close-out: no beads existed for this work at proposal time — file
      beads for any follow-ups surfaced during implementation (e.g. a
      site-nav link to `/tools/backlog-triage/`, deferred out of this
      change), then close this change's bead(s) and run
      `openspec archive backlog-triage-sorter-tool` when applied
      > Lane note: out of scope — the orchestrator owns beads and `openspec archive`.
