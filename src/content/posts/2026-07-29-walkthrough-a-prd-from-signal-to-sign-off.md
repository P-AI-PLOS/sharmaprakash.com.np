---
title: "Walkthrough: a PRD from Signal to Sign-Off"
date: "2026-07-29T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Arc two opens with the flagship artifact: a real PRD, built end to end on the system from arc one. Three weeks of signals become a problem statement with citations, the prd-drafting skill interrogates before it writes, alternatives get argued instead of assumed, metrics come from the tree or say TBD — and the document that reaches sign-off is one the product owner can defend line by line, because every line traces to something."
use_featured_image: false
series: pm-context-repo
seriesOrder: 7
---

Arc one built the system; arc two uses it. And it starts with the artifact that shows the whole machine working at once: a PRD, taken from raw evidence to signed-off document. I'll run it on the series' standing example — the reporting gap that's been threading through the [signal digests](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/) since part three — so you can see what each stage adds. The product is a generic B2B SaaS; the shape of the work is universal.

The headline shift a senior product owner should expect: **drafting stops being the work.** The work becomes deciding what's true, choosing between real alternatives, and putting your name on the result. The PRD takes a morning instead of a week — but it's a morning of decisions, not typing.

## Stage one: does the evidence carry a problem?

It starts in the digest review, not in a feature idea. Three consecutive weekly digests have flagged the same theme: mid-market ops managers export multiple reports and manually rebuild a cross-report summary every week (SIG-0142, SIG-0147, SIG-0151, plus two older cards a query for `area: reporting` surfaces). One card is a workaround demo — a customer sharing their screen to show the Monday spreadsheet ritual. That's the strongest kind of evidence the pipeline produces: a behavior, not an opinion.

Before any drafting, I run the question that kills most PRDs early and cheaply — *can the evidence state a problem without mentioning a solution?* The `prd-drafting` skill from [part five](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/) has this as its first mandatory stage: assemble the problem section from signal verbatims and card IDs only; if the evidence can't carry it, say so and stop. Here it can:

> Mid-market ops managers producing a weekly leadership summary must export 2–4 reports and manually recombine them (SIG-0142: "Every Monday I export three reports and rebuild the same summary in a spreadsheet"). Observed as a workaround in one account (SIG-0151, screen-share), reported as pain in four others across 14 weeks. No signal from SMB; one adjacent enterprise signal (SIG-0148) is an audit-log request, not this.

Notice what's *not* in that paragraph: a feature. Also notice the last sentence — the skill requires stating where the evidence is thin, which is the negative space rule from [part six](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/) doing its job. When a PRD dies at this stage — and some should — it dies in ten minutes, before anyone's attachment or a quarter's plan is riding on it. That's the system working, not failing.

## Stage two: the interrogation

The skill loads its context — overview, `product/areas/reporting.md`, the ops-manager persona, decision records touching reporting, a full quarter of signals — and then asks *me* questions before drafting, the same four a senior PM would ask a junior one:

- **Who exactly is this for?** The persona file covers the ops manager; the skill flags that two signal cards are from a role the personas *don't* cover (a finance admin doing month-end). Decision needed: in scope or out? I rule: out, noted as a fast-follow question.
- **Why now?** I have to articulate it — reporting pain is the top theme three weeks running, and the [roadmap's](/product-management/walkthrough-assembling-the-quarterly-roadmap-from-signals/) current Next column has a reporting theme whose confidence this evidence upgrades.
- **What's out of scope?** The killed custom-report-builder decision record surfaces automatically here — the skill won't let this PRD quietly become that project reborn. Ad-hoc report *building* is out; *summarizing existing reports* is in. That sentence goes in the PRD, citing the decision record.
- **What would make this fail?** Sharp edges from the area file: report data is eventually consistent (totals can lag), and enterprise contracts pin the meaning of "export." Both become constraints the design section must address.

This stage is why the walkthrough feels different from "AI writes my PRD." The model isn't guessing my answers; it's refusing to proceed without them. Twenty minutes, mostly thinking.

## Stage three: alternatives, argued

The skill requires two solution approaches minimum with a stated recommendation — models elaborate the first idea presented, and mandatory alternatives structurally interrupt that. It drafts three: (A) a summary layer over existing reports — a new composite view; (B) scheduled digest emails that combine report excerpts; (C) an export-side template that pre-combines data for the spreadsheet step. For each: what the evidence supports, which sharp edges it touches, rough delivery shape.

My job is the ruling, and this is unautomatable: (C) optimizes the workaround instead of removing it; (B) creates a new artifact to maintain and misses the "before the leadership call" freshness need in the verbatims; (A) is the recommendation, scoped to composite views over *existing* report types only — which keeps it clearly on the right side of the killed-builder decision. The PRD records all three and the reasoning, because the alternatives section is where the next PM (or the next agent) will learn why the shape is what it is.

## Stage four: metrics without fiction

The metrics section has one rule with no exceptions: **numbers come from the [metric tree](/product-management/north-star-metrics-and-metric-trees/) or they say TBD.** The draft proposes: input metric *weekly active teams using scheduled reports* (currently tracked, baseline known), plus a new metric *summary views created per account* labeled `TBD-needs-baseline`. What it cannot do — because the guardrail forbids it and the verifier pass would flag it — is write "reduces manual reporting effort by 40%." An AI-drafted PRD with confident invented percentages is the single most embarrassing artifact this system can produce, and it's the one failure mode I've made structurally impossible.

Success criteria instead get the falsifiability treatment: *an ops manager can produce the Monday summary without leaving the product* — checkable, ownable, and it becomes an acceptance test in [part eleven's test register](/product-management/the-test-register-tracing-acceptance-criteria-to-real-tests/).

## Stage five: verify, then sign

The verifier agent runs before any human review: every SIG reference resolves, no number lacks a source or a TBD, no glossary term is misused, no decision record contradicted. It flags one real issue — a draft sentence had generalized "customers" where the evidence is mid-market only. Fixed. Then the human loop: the draft goes to the docs tool as a new document for engineering and design comments, disagreements about *substance* get worked there, and anything that changes shared understanding — in this case, the scoping ruling against the finance-admin use case — gets distilled back as a decision record, per [part four's](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/) distill-up rule.

Sign-off means my name on a document where every claim is cited, every number is real or honestly TBD, every alternative was argued, and every known sharp edge is addressed. Total elapsed: one morning, because three months of pipeline discipline meant the evidence was already structured, and the skill meant none of that morning was spent formatting.

What sign-off does *not* produce yet: a plan. The PRD says what and why. Next post: [what estimation even means when agents do the typing](/product-management/estimation-when-agents-do-the-typing/) — because "how big is this?" changed shape when implementation got cheap, and the honest answer involves reviewing capacity, not typing speed.
