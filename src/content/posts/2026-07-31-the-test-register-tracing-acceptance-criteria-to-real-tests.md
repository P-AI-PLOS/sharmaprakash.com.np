---
title: "The Test Register: Tracing Acceptance Criteria to Real Tests"
date: "2026-07-31T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Every team claims its acceptance criteria are tested; almost none can show which test proves which criterion. The test register is the missing file — a per-feature traceability table in the context repo mapping each Given/When/Then to the automated test or manual check that verifies it, kept honest by an agent that reads the test suite and reports drift. This is how a product owner knows 'done' without taking anyone's word for it."
use_featured_image: false
series: pm-context-repo
seriesOrder: 11
---

The [tickets from part ten](/product-management/from-prd-to-tickets-acceptance-criteria-that-survive-the-sprint/) carry criteria precise enough to test. Here's the uncomfortable question that precision exposes: *which test, exactly, verifies criterion 3?* Most teams can't answer. There are criteria in the tracker and tests in the codebase, written by different people at different times, and the mapping between them exists nowhere. "It's covered" is a feeling. The demo showed the happy path; the criterion that mattered — the reconciling marker, the empty state — was never walked. Then a regression ships in precisely the behavior a criterion had specified, and the postmortem discovers the criterion was never connected to anything that would have caught it.

The fix is an artifact so unglamorous it's barely written about: a **test register** — a traceability table, one per feature, living in the context repo, mapping every acceptance criterion to the thing that verifies it. It's also, for a product owner, quietly a power move: **it converts "done" from a claim you're handed into a table you can read.**

## The format

`templates/test-register.md` from [part two's](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/) layout, instantiated per feature — here, summary views:

```markdown
---
feature: summary-views
epic: TRK-2201
updated: 2026-07-31
status: in-progress     # in-progress | verified | drifted
---

# Test register — Summary views (slice 1)

| ID | Criterion (from TRK-2202) | Verified by | Type | Status |
|----|---------------------------|-------------|------|--------|
| T1 | All three sections render with as-of timestamps | summary_view.spec: "renders three sections" | e2e | ✅ auto |
| T2 | Empty source report → explicit named empty state | summary_view.spec: "empty billing section" | e2e | ✅ auto |
| T3 | Reconciling data carries marker, not final totals | summary_state.test: "lag flag propagation" | unit | ✅ auto |
| T3b| Marker visible in rendered summary during lag | — | manual | 🟡 UAT script #2 |
| T4 | View permission without export permission renders | permissions.spec: "summary view rights" | integration | ✅ auto |

## Deliberate gaps
- No automated check that timestamps match source-report
  as-of times (T1 partial) — cost-benefit ruled manual;
  covered in UAT script #1.

## UAT scripts
1. Timestamp spot-check across the three sections (5 min)
2. Reconciliation-window walk: open summary during a
   reconciliation cycle; confirm marker appears and clears
```

The conventions carry the value. **Every criterion appears** — a criterion with `—` in the Verified-by column is a visible debt, not a silent one, and T3 splitting into an automated unit check plus a manual visual check (T3b) is the honest shape of most real coverage. **Type is named** (unit / integration / e2e / manual), because "tested" spans a range from millisecond-fast logic checks to a human walking a UAT script, and conflating them is how coverage theater happens. **Deliberate gaps get a section** — the [negative-space rule](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/) again: a gap you've named and reasoned about is a decision; a gap discovered in an incident is a failure.

## Who writes it — and how it stays true

Assembly is agent work, judgment is yours; by now that's the series' reflex. A `test-register` skill drafts the table: it reads the criteria from the tracker item and — because the context repo convention works just as well pointed at the *code* repo — reads the actual test files, matching test names and assertions to criteria, proposing the mapping with its confidence flagged. The engineers correct the mapping in review (they know that `summary_state.test` covers the flag logic but not the rendering — hence T3b). This takes fifteen minutes at slice completion, and it's the fifteen minutes that makes the sprint review's "done" claim inspectable.

Staleness is the real enemy — registers are trivially true the week they're written and quietly false by the next quarter, when someone renames a spec file or deletes a flaky test. So the register gets the same treatment as everything else in the system: **a scheduled drift check.** The weekly agent run ([part five's](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/) always-on machinery) re-resolves every Verified-by reference against the current test suite and flips the register's frontmatter to `drifted` — with a report of which rows broke — the week a referenced test disappears or starts failing to match. A drifted register is a PR-review conversation, not an archaeology project. This is the same trick as part three's signal pipeline: the artifact stays cheap because an agent maintains it and a human only rules on the diffs.

## What the product owner does with it

Three moments where the register changes your job:

**Sprint review.** "Slice one is done" now arrives with the register: four criteria auto-verified, one on a UAT script, one deliberate gap with reasoning. You read the table, run the two UAT scripts (ten minutes — and [part twelve](/product-management/closing-the-loop-verifying-releases-with-playwright-mcp/) will hand even those to an agent-driven browser you supervise), and *know*. Not trust — know. The difference compounds into how confidently you communicate ship dates upward.

**Regression triage.** When the reporting incident happens anyway, the register is the first read: was this behavior specified? Verified by what? If the row says `✅ auto` and it broke anyway, the test was wrong — a different and more useful conversation than "did anyone ever test this?"

**The audit conversation.** The quarter someone above you asks "how do we know our releases meet spec?" — a compliance question, a big-customer security review, a post-incident board mood — you have a directory of per-feature registers with timestamps and drift history. That question has ended careers of product owners who answered it with adjectives. You answer it with files.

There's a satisfying symmetry to where this lands. Arc two opened with evidence flowing *into* claims — no statement about customers without a signal card. The register is the same law pointed at the other end of the pipeline: **no claim of "done" without a named verification.** Citations in, citations out.

One column of the register still says *manual*, though, and manual has meant "a human finds twenty minutes" for as long as software has shipped. The finale closes that gap: [Playwright MCP — the product owner walking the release through a real browser the agent drives](/product-management/closing-the-loop-verifying-releases-with-playwright-mcp/), UAT scripts becoming sessions you supervise instead of chores you defer.
