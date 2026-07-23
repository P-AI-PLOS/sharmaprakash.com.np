---
title: "Ecocycle Planning: Auditing course guru's Feature Lifecycle"
date: "2021-05-04T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "course guru's roadmap had a legacy export nobody dared touch and a certificate feature that had been 'almost done' for two quarters. Ecocycle Planning is the workshop that puts both on the same map and forces the room to say out loud which one is the actual problem."
tags: [liberating-structures, course-guru]
series: ls-decide
seriesOrder: 4
use_featured_image: false
---

course guru's roadmap review always ran the same way: a list of open tickets, sorted by whoever shouted last, with no way to see that half the list was rigid legacy nobody wanted to touch and the other half was half-built exploration nobody wanted to fund. **Ecocycle Planning** is the Liberating Structure that fixes that — not by prioritizing the list, but by making the team physically place every feature on a lifecycle diagram and see, all at once, what's calcifying and what's stranded.

## What it is

Ecocycle Planning comes from Deborah Frieze and Brenda Zimmerman, by way of Liberating Structures. The diagram is a figure eight — an infinity loop with two arcs. The **front loop** runs birth → maturity → growth and alignment, and it's a story of increasing efficiency: things get more structured, more optimized, more depended-upon. At the far right of the front loop sits the **rigidity trap**, where a feature has succeeded so completely that it's now too load-bearing, too entangled, or too politically sacred to change — success has calcified into inertia. The **back loop** runs creative destruction → release → uncertainty and exploration → renewal, and it's a story of possibility with no structure yet. Its trap, the **poverty trap**, sits in the exploration zone: ideas that stay perpetually promising, absorbing attention and hope, with no resources ever committed to actually launching them.

The insight the shape is built to deliver: a portfolio needs work in every phase, and the two traps are where portfolios quietly die — one from being unable to let go, the other from never being able to start.

## How it runs

I run this with a printed or projected ecocycle diagram big enough for a room of 12–20 people split into trios or quads, total time 60–75 minutes.

**Individual brainstorm, 5 minutes, silent.** Each person writes their group's practices, projects, or in this case features — one per sticky note. No discussion yet; the point is unfiltered inventory before groupthink sets in.

**Small-group placement, 10–15 minutes.** Groups of 4–5 take their combined stickies and physically place each one on the diagram — birth, maturity, growth/alignment, rigidity trap, creative destruction, release, exploration, renewal. This step alone does most of the work: two people on the same team routinely disagree about whether a feature is "mature and stable" or "trapped and untouchable," and the argument that disagreement forces is the real deliverable.

**Two questions, 10–15 minutes per group.** Once everything's placed, the group works two prompts explicitly: **"what here should we creatively destroy?"** (candidates in or near the rigidity trap) and **"what's ready to be born?"** (candidates in or near the poverty trap that deserve real investment, versus ones that should just be killed).

**Harvest, remaining time.** Each small group reports its two or three highest-conviction calls to the whole room. The facilitator's job here is narrow: capture the calls, don't relitigate the placement debates in plenary — those already happened in the small groups where they belonged.

## Running it on course guru's feature set

I split the room by the three surfaces course guru actually spans — authoring, delivery, and reporting — and asked people to place stickies from whichever surface they knew best, then mix groups so no single group was all-authoring or all-reporting. That cross-pollination mattered: reporting people had opinions about authoring features and vice versa, and those outside opinions surfaced blind spots the surface owners had stopped seeing.

A few placements that stuck with me, because they were exactly the kind of thing a flat backlog can't show:

**Rigidity trap: the legacy CSV export.** A reporting feature built early, before there was time for anything better, that had become the one thing every merchant depended on for their own downstream accounting. Nobody wanted to touch it — not because it was good, but because three different internal tools now quietly parsed its exact column order. It was mature in the sense of "load-bearing" and dead in the sense of "nobody's improved it in eighteen months." The group's call: creatively destroy it — build the replacement in parallel and set a real sunset date for the old format, rather than letting "too risky to change" stay the permanent answer.

**Poverty trap: the certificate feature.** An authoring-side idea — issuing completion certificates learners could download or that merchants could brand — that had been "in exploration" for two quarters running. It kept reappearing in roadmap conversations, kept getting a few days of design spike, and kept losing the actual engineering slot to something more urgent. Classic poverty trap: real interest, zero committed resources, indefinitely promising. The group's call wasn't "build it now" — it was "decide this quarter," because the feature's real cost wasn't engineering time, it was the recurring conversational tax of re-litigating it every planning cycle.

**Growth/alignment: enrollment and access sync with the merchant's Shopify customer accounts.** Placed here because it had recently stabilized after a rocky launch and was now the thing new delivery features got built on top of — the healthy version of maturity, not yet rigid, actively being leaned on. The group flagged it as a feature to protect from scope creep rather than a candidate for either loop's traps.

**Birth: instructor-side bulk content import.** A raw idea, barely scoped, that had shown up in three separate support tickets in the past month. Not enough shape yet to be in exploration — just noted as something to watch, which is its own useful output: not every sticky needs a verdict, some just need to be visible.

Seeing the CSV export and the certificate feature on the same diagram, in the same room, in the same hour, was the actual value. On a backlog, they'd never have been compared — one lives in "tech debt," the other in "new feature ideas," and those lists never talk to each other. On the ecocycle, they're both just stuck, for opposite reasons, and the room could see it in one glance.

I'd used this same structure earlier in the series for [recap crm's feature portfolio](/product-management/ecocycle-planning-feature-portfolio-recap-crm/), [shortest's test suite](/product-management/ecocycle-planning-test-suite-lifecycle-shortest/), and [polo themes' theme catalog](/product-management/ecocycle-planning-theme-catalog-polo-themes/) — and course guru's run confirmed the pattern holds across very different portfolios: the traps are never where the team's official priority list says the problems are.

## When it goes sideways, and when to skip it

**It becomes a complaining session if the two questions get skipped.** Placement alone feels cathartic — "look how much legacy we're carrying" — but without forcing the explicit "what do we creatively destroy" and "what's ready to be born" prompts, the room leaves with a diagnosis and no decision. Always protect the time for those two questions; they're the actual point, not the sticky-placing.

**It needs decision authority in the room.** The certificate-feature call — decide this quarter — only sticks if someone in that room can actually greenlight engineering time. Run this with only individual contributors and the harvest becomes a wish list that dies the moment it hits a roadmap review with different people in it.

**Skip it for a portfolio too small or too young to have a back loop.** If course guru had shipped four features total, everything would cluster in birth and growth, and the exercise wastes an hour proving there's no rigidity trap yet because nothing's old enough to calcify. Ecocycle Planning earns its time once a product has enough history to have accumulated both kinds of trap — usually a year or more of shipped surface area.

This closes out the Ecocycle Planning arc of this series — four different portfolios, the same figure-eight, four different traps found each time. The posts ahead pivot to a related but distinct Liberating Structure, **Panarchy**, which asks not where a single portfolio's items sit on their own lifecycle, but how the lifecycles of different systems — a feature, a team, a platform — speed up and slow down each other.
