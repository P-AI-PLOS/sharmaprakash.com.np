---
title: "Avoiding AI Slop: Writing User Stories a Team Will Actually Build"
date: "2026-07-28T16:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "AI slop in a backlog is worse than an empty backlog, because it's plausible enough to survive triage and hollow enough to fail in sprint. How to recognize slop in product artifacts, the grounding rules that starve it, and why the story-writing craft — slicing, testable criteria, the conversation — matters more now that drafting is free and judgment is the bottleneck."
use_featured_image: false
series: pm-context-repo
seriesOrder: 6
---

Five posts of infrastructure — [repo](/product-management/the-product-context-repo-why-your-product-knowledge-belongs-in-git/), [structure](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/), [signals](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/), [connections](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/), [skills and hooks](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/) — and one honest risk left standing: all of it makes producing product artifacts dramatically cheaper, and **when production gets cheap, the bottleneck moves to judgment.** A team with this tooling can fill a backlog faster than any team can groom one. If what fills it is slop, you've automated the manufacture of technical debt's product-shaped cousin.

So arc one closes with the two disciplines the tooling cannot supply: recognizing hollow artifacts, and understanding why the craft that remains is most of the job.

## What slop actually is

Slop is not "AI-written text." Machine-drafted work grounded in real evidence and reviewed by someone accountable is just *work*. Slop is specifically **fluency without grounding — output whose form says "someone thought about this" while nothing did the thinking.** In product artifacts it has recognizable tells:

- **Acceptance criteria that restate the title.** Story: "Allow users to filter reports by date." Criterion: "User can filter reports by date." Zero information added — the criterion exists because the format demanded one.
- **Symmetric everything.** Three bullets per section, every section filled to the same depth, no section left honestly empty. Real understanding is lumpy; slop is upholstered.
- **Confident invented numbers.** "This will reduce support tickets by 30%." From what baseline? Nobody knows. The number exists because PRDs are supposed to have numbers.
- **The vibes-based user.** "As a user, I want a dashboard so that I can see my data." Which user? A persona file exists — was it consulted? Slop stories are about a species called "user" who wants features for reasons shaped like reasons: "so that I can be more productive."
- **Hedged non-decisions.** "We may want to consider potentially exploring…" — prose that can't be wrong because it doesn't commit to anything.

Why it's worse than nothing: an empty backlog announces itself, while slop **passes triage.** It's formatted, spelled, INVEST-adjacent. It gets estimated in refinement, enters a sprint, and then — mid-sprint, at the most expensive possible moment — an engineer asks "wait, what should happen when the date range spans a billing period?" and discovers nobody ever thought about this story at all. The cost of slop isn't reading it; it's that hollowness surfaces at build time. And the failure mode that follows is trust: after the second such story, engineers discount everything the tooling touches — including the grounded work.

## Starving it: structure first, editors second

You cannot review your way out — generation is faster than inspection, permanently. The defenses are layered, and if you've built arc one you own most of them already. The mechanical layer is [part five's hooks](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/): citation checks, frontmatter validation, and the verifier pass catch the *checkable* failures before a human ever reads the draft. What's left for humans are the laws that need judgment to apply:

**1. No claim without a card.** Every statement about customers cites signal IDs or wears the label `ASSUMPTION`. The hook enforces the letter of this; you enforce the spirit — a real card ID attached to a claim the card doesn't actually support is the failure the machine can't catch, and the spot-check habit from part three is what does. The rule works because slop *cannot cite*: invented pain has no card. It converts review from "does this sound right?" to "do the citations hold?", which is minutes, not judgment-hours.

**2. Force falsifiable sentences.** Slop lives in unfalsifiable prose. Your templates should demand statements that could be wrong: not "improves the reporting experience" but "an ops manager can produce the Monday summary without leaving the product." Add banned phrases to the skill guardrails — *seamless, intuitive, robust, delight, "as a user," "be more productive"* — not because the words are evil but because each is a socket where a specific claim should be.

**3. Require the negative space.** Out-of-scope sections, non-goals, "sharp edges touched," open questions. Models default to affirmation; slop contains no boundaries. An artifact that names what it does *not* do and what remains unresolved has been thought about — that's what thinking leaves behind.

**4. One accountable name per artifact.** Whoever's name is on it answers for it in refinement, without reference to how it was drafted. "The AI wrote that part" must be an unsayable sentence — not by policy, but because everyone knows the name on the story vouched for every line.

**5. Delete without ceremony.** A draft that fails review dies. The unit of respect is the team's attention, not the artifact. Teams that feel obligated to salvage every generated draft have inverted the economics: generation is free, and grooming is the scarce resource being protected.

## The craft that's left — and it's most of the job

Strip away drafting and what remains is exactly what was always hard. Three pieces of story craft matter *more* now, because they're the pieces the tooling can't do and will actively paper over if you let it.

**Slicing.** The genuinely hard part of story writing is cutting a capability into pieces that are each shippable, testable, and *vertical* — a thin slice through UI, logic, and data that a user could touch, not a "backend story" and a "frontend story" that are secretly one story with a seam. Slicing requires knowing what's riskiest, what's learnable early, and what your architecture makes cheap versus dear. A model can propose slices; only someone who holds the strategy and the codebase's realities can choose them. INVEST — independent, negotiable, valuable, estimable, small, testable — survives as the checklist precisely because it's a *judgment* checklist; every letter is a question about your context.

**Acceptance criteria as decisions, not documentation.** A good criterion is a decision made early instead of mid-sprint: *Given a date range spanning a billing period, the report splits totals per period.* Someone chose that behavior — the alternative (blended totals) was live until the criterion killed it. Slop criteria document the feature; real criteria settle its arguments in advance. The test for each one: could a reasonable engineer have built it the other way? If no, the criterion is decoration.

**The conversation.** A story was never a spec; it's a placeholder for a conversation with engineers, and no artifact quality substitutes for it. The system's real gift is what it does to that conversation: when the archaeology (what do we know? what did we decide? who asked for this?) is already done and cited, the ten minutes go to the interesting part — is this the right slice, is that criterion the right call, what's the risk nobody's named. Tooling that produces artifacts *instead of* conversations is failing, however good the artifacts. Tooling that makes the conversations denser is the whole point.

## Arc one, closed — now use it

The system is built: a **repo** that holds what your product knows, a **pipeline** that turns tickets, calls, and CRM exhaust into evidence with IDs, **connections** that reach every tool in one session, **skills and hooks** that make the workflows repeatable and the rules mechanical, and this post's **editorial spine** — citations, falsifiability, negative space, a name on everything.

Arc two is the same system in a senior product owner's hands, artifact by artifact: [a PRD from signal to sign-off](/product-management/walkthrough-a-prd-from-signal-to-sign-off/), [estimation when agents do the typing](/product-management/estimation-when-agents-do-the-typing/), [a quarterly roadmap assembled from signals](/product-management/walkthrough-assembling-the-quarterly-roadmap-from-signals/), [tickets and acceptance criteria that survive the sprint](/product-management/from-prd-to-tickets-acceptance-criteria-that-survive-the-sprint/), [a test register that traces every criterion to a real test](/product-management/the-test-register-tracing-acceptance-criteria-to-real-tests/), and [a release verified in a browser the agent drives](/product-management/closing-the-loop-verifying-releases-with-playwright-mcp/). None of it requires a platform, a budget, or permission — start with the afternoon version from part two, and the compounding starts there.
