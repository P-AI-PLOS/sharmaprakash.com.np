---
title: "Avoiding AI Slop: Writing User Stories a Team Will Actually Build"
date: "2025-08-28T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "AI slop in a backlog is worse than an empty backlog, because it's plausible enough to survive triage and hollow enough to fail in sprint. The series finale: how to recognize slop in product artifacts, the grounding rules that starve it, and the user-story craft — INVEST, vertical slices, testable criteria — that matters more now that drafting is free and judgment is the bottleneck."
use_featured_image: false
series: pm-context-repo
seriesOrder: 6
---

Five posts of infrastructure — [repo](/product-management/the-product-context-repo-why-your-product-knowledge-belongs-in-git/), [structure](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/), [signals](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/), [connections](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/), [commands](/product-management/commands-that-write-user-stories-and-prds-with-real-context/) — and one honest risk left standing: all of it makes producing product artifacts dramatically cheaper, and **when production gets cheap, the bottleneck moves to judgment.** A team with this tooling can fill a backlog faster than any team can groom one. If what fills it is slop, you've automated the manufacture of technical debt's product-shaped cousin.

So the finale is about the two disciplines the tooling cannot supply: recognizing hollow artifacts, and the story-writing craft that decides whether a sprint built the right thing.

## What slop actually is

Slop is not "AI-written text." Machine-drafted work grounded in real evidence and reviewed by someone accountable is just *work*. Slop is specifically **fluency without grounding — output whose form says "someone thought about this" while nothing did the thinking.** In product artifacts it has recognizable tells:

- **Acceptance criteria that restate the title.** Story: "Allow users to filter reports by date." Criterion: "User can filter reports by date." Zero information added — the criterion exists because the format demanded one.
- **Symmetric everything.** Three bullets per section, every section filled to the same depth, no section left honestly empty. Real understanding is lumpy; slop is upholstered.
- **Confident invented numbers.** "This will reduce support tickets by 30%." From what baseline? Nobody knows. The number exists because PRDs are supposed to have numbers.
- **The vibes-based user.** "As a user, I want a dashboard so that I can see my data." Which user? A persona file exists — was it consulted? Slop stories are about a species called "user" who wants features for reasons shaped like reasons: "so that I can be more productive."
- **Hedged non-decisions.** "We may want to consider potentially exploring…" — prose that can't be wrong because it doesn't commit to anything.

Why it's worse than nothing: an empty backlog announces itself, while slop **passes triage.** It's formatted, spelled, INVEST-adjacent. It gets estimated in refinement, enters a sprint, and then — mid-sprint, at the most expensive possible moment — an engineer asks "wait, what should happen when the date range spans a billing period?" and discovers nobody ever thought about this story at all. The cost of slop isn't reading it; it's that hollowness surfaces at build time. And the failure mode that follows is trust: after the second such story, engineers discount everything the tooling touches — including the grounded work.

## Starving it: rules, not vigilance

You cannot review your way out — generation is faster than inspection, permanently. The defenses that work are structural, and if you've built the series' system you own most of them already. Stated as the laws they need to be:

**1. No claim without a card.** Every statement about customers cites signal IDs or wears the label `ASSUMPTION`. This single rule kills most slop, because slop *cannot cite* — invented pain has no card. It converts review from "does this sound right?" to "do the citations hold?", which is minutes, not judgment-hours. (And it only works because [part three's pipeline](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/) made citing real evidence *easier* than inventing it.)

**2. Force falsifiable sentences.** Slop lives in unfalsifiable prose. Your templates should demand statements that could be wrong: not "improves the reporting experience" but "an ops manager can produce the Monday summary without leaving the product." Add banned phrases to the command guardrails — *seamless, intuitive, robust, delight, "as a user," "be more productive"* — not because the words are evil but because each is a socket where a specific claim should be.

**3. Require the negative space.** Out-of-scope sections, non-goals, "sharp edges touched," open questions. Models default to affirmation; slop contains no boundaries. An artifact that names what it does *not* do and what remains unresolved has been thought about — that's what thinking leaves behind.

**4. One accountable name per artifact.** Whoever's name is on it answers for it in refinement, without reference to how it was drafted. "The AI wrote that part" must be an unsayable sentence — not by policy, but because everyone knows the name on the story vouched for every line.

**5. Delete without ceremony.** A draft that fails review dies. The unit of respect is the team's attention, not the artifact. Teams that feel obligated to salvage every generated draft have inverted the economics: generation is free, and grooming is the scarce resource being protected.

## The craft that's left — and it's most of the job

Strip away drafting and what remains is exactly what was always hard. Three pieces of story craft matter *more* now, because they're the pieces the tooling can't do and will actively paper over if you let it.

**Slicing.** The genuinely hard part of story writing is cutting a capability into pieces that are each shippable, testable, and *vertical* — a thin slice through UI, logic, and data that a user could touch, not a "backend story" and a "frontend story" that are secretly one story with a seam. Slicing requires knowing what's riskiest, what's learnable early, and what your architecture makes cheap versus dear. A model can propose slices; only someone who holds the strategy and the codebase's realities can choose them. INVEST — independent, negotiable, valuable, estimable, small, testable — survives as the checklist precisely because it's a *judgment* checklist; every letter is a question about your context.

**Acceptance criteria as decisions, not documentation.** A good criterion is a decision made early instead of mid-sprint: *Given a date range spanning a billing period, the report splits totals per period.* Someone chose that behavior — the alternative (blended totals) was live until the criterion killed it. Slop criteria document the feature; real criteria settle its arguments in advance. The test for each one: could a reasonable engineer have built it the other way? If no, the criterion is decoration. This is exactly why the `/story` command asks its interrogation questions — the answers *are* the criteria.

**The conversation.** A story was never a spec; it's a placeholder for a conversation with engineers, and no artifact quality substitutes for it. The system's real gift is what it does to that conversation: when the archaeology (what do we know? what did we decide? who asked for this?) is already done and cited, the ten minutes go to the interesting part — is this the right slice, is that criterion the right call, what's the risk nobody's named. Tooling that produces artifacts *instead of* conversations is failing, however good the artifacts. Tooling that makes the conversations denser is the whole point.

## The system, complete

Six posts, one loop: a **repo** that holds what your product knows, structured so anything can read it; a **pipeline** that turns tickets, calls, and CRM exhaust into evidence with IDs; **connections** that let one session read context and file drafts where work lives, writes gated by humans; **commands** that make the workflows repeatable, improvable, and shared; and an **editorial spine** — citations, falsifiability, negative space, a name on everything — that keeps velocity from becoming slop.

None of it requires a platform, a budget, or permission. Start with the afternoon version from part two: an `AGENTS.md`, five glossary terms, two area files, three decision records. Add one weekly digest. The compounding starts there — and six months in, the asset you'll value isn't any artifact the system drafted. It's that your team's understanding of its own product finally lives somewhere better than the six inboxes it used to die in.
