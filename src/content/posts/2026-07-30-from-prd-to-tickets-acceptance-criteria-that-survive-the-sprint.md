---
title: "From PRD to Tickets: Acceptance Criteria That Survive the Sprint"
date: "2026-07-30T16:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The PRD says what and why; the sprint needs vertical slices with criteria that settle arguments in advance. This walkthrough runs the slicing conversation, drafts the tickets with the story-writing skill, files them into the tracker through the staging gate, and shows the refinement session where Given/When/Then lines get argued into decisions — including the criterion that saved the sprint from the billing-period bug nobody had thought about."
use_featured_image: false
series: pm-context-repo
seriesOrder: 10
---

The [roadmap](/product-management/walkthrough-assembling-the-quarterly-roadmap-from-signals/) committed the cross-report summaries item; the [PRD](/product-management/walkthrough-a-prd-from-signal-to-sign-off/) says what it is and why. Between that and a sprint sits the translation layer where product work most often goes quietly wrong: slicing the feature into tickets, and writing acceptance criteria precise enough that the sprint builds what the PRD meant. This walkthrough runs that translation on the system, end to end, into the tracker.

The senior-PO framing up front: **this is the highest-judgment step in the whole delivery chain, and the tooling's job here is to propose and to remember — never to decide.** [Part six](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/) argued slicing is unautomatable craft; this post is what that looks like in practice.

## The slicing conversation

I open a session with the PRD and ask for *three alternative slicings* — not one. The instruction mirrors the alternatives rule from the PRD skill: for each slicing, name the slices, what each proves, and what each defers. It proposes: (A) horizontal — data layer, then composition engine, then UI (rejected on sight: no slice is independently shippable, nothing is learnable until the end — but its *presence in the list* makes the rejection explicit and teachable, which is half of why I ask for three); (B) vertical by capability — create a summary view from two fixed reports end-to-end, then N-report flexibility, then scheduled delivery; (C) vertical by persona-moment — the Monday-morning path first: a canned summary over the three most-exported report types, then customization.

I take (C)'s first slice with (B)'s sequencing after it, for a reason only the evidence could give: the workaround card (SIG-0151) shows exactly which three reports the real ritual combines, so a canned composite over those three delivers the persona's actual Monday in slice one — and the *estimation classes* say the flexible-composition engine is the *bounded* risk worth learning about second, while scheduled delivery (the *heavy* slice — it touches the contractual meaning of "export") goes last, when the surface it schedules is stable. Three slices, each a thin vertical a user could touch, each teaching something, riskiest-first within reason. The reasoning goes in the epic description — future refinements will want it.

## Drafting the tickets

Now the [story-writing skill](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/) runs once per slice, and everything arc one built shows up in the output: context loaded from the area file and cards, the interrogation stage (for slice one it demands a ruling on empty-state behavior — what does the composite show when one source report has no data this week? — which I'd have discovered mid-sprint otherwise), and the template's required sections. Slice one's ticket, abridged:

```markdown
Title: Canned Monday summary over top three report types

Story: As an ops manager (personas/ops-manager.md), I want a
single summary view combining exports, usage, and billing
reports, so that the Monday leadership summary exists without
my spreadsheet ritual.

Evidence: SIG-0142 ("Every Monday I export three reports and
rebuild the same summary"), SIG-0151 (workaround, screen-share).

Acceptance criteria:
1. Given a workspace with all three report types populated,
   when the user opens Reports → Summary, then one view renders
   all three sections with each section's as-of timestamp.
2. Given one source report has no data in the period, when the
   summary renders, then that section shows an explicit empty
   state naming the report — the section is not silently omitted.
3. Given report data is still reconciling (totals lag ≤1h,
   product/areas/reporting.md sharp edge), when the summary
   renders, then affected sections carry a "reconciling" marker
   rather than presenting lagging totals as final.
4. Given a user with report-view permission but not export
   permission, when they open the summary, then it renders —
   viewing is not gated on export rights (glossary: export ≠ view).

Out of scope: choosing which reports compose the summary
(slice 2); any scheduling or delivery (slice 3).
Sharp edges touched: eventual consistency; export/view
permission boundary.
```

Criterion 3 is the one to study. It exists because the area file's sharp edge got loaded, and it settles — *before the sprint* — the exact argument that otherwise happens in a code review comment thread on day eight ("should we show lagging totals? probably fine?"). Criterion 4 exists because the glossary distinction got loaded. Neither is something the model *knew*; both are the repo paying out. And every criterion passes part six's test: a reasonable engineer could have built it the other way, so the line earns its place — the empty-state criterion kills silent omission, the reconciling criterion kills false finality. Criteria that couldn't be built two ways get deleted in my edit pass; decoration criteria are how tickets bloat into unread specs.

Filing goes through [part four's](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/) gate: the three tickets land in the tracker under the epic, `ai-drafted` label, triage column, unassigned — the hook enforces it. Nothing I just did can reach a sprint without the team.

## Refinement: where criteria become decisions

The tickets hit refinement with the archaeology pre-done — evidence linked, constraints surfaced, and the [estimation](/product-management/estimation-when-agents-do-the-typing/) pre-classified per slice (slice 1 *settled/standard*, slice 2 *bounded/standard*, slice 3 *bounded/heavy*). So the half hour goes where it should, and it goes hard at exactly the right lines. An engineer challenges criterion 3: the reconciling marker requires knowing lag state per source, which the current reporting API doesn't expose — that's either a scope add or the criterion softens to a blanket as-of timestamp. This is a genuine product decision, mid-refinement, mine to make: I hold the criterion and we split an enabling task, because presenting lagging billing totals as final is precisely the kind of trust damage the PRD's evidence documents. The ticket gets the amended criterion and — because this ruling generalizes — the reconciling-display principle goes back into the area file, where every future draft will load it. The loop that makes month twelve of this system better than month one, closed in real time.

Definition of ready, in this world, compresses to one sentence: **evidence linked, criteria testable and argued, uncertainty class agreed, verification weight named.** The team pulls the label off, moves slice one into the sprint, and drafting is officially the cheapest thing that happened this week.

One more artifact wants building before the sprint ends, though — because criteria this precise are wasted if verifying them stays a vibes-based demo. Every Given/When/Then above is one row away from being a test. [Part eleven builds the test register](/product-management/the-test-register-tracing-acceptance-criteria-to-real-tests/) — the traceability file that connects each criterion to the test that proves it, and the product owner to the truth of "done."
