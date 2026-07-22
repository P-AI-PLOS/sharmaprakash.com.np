---
title: "Ecocycle Planning: Retiring Brittle Test Suites Without a Fight"
date: "2021-04-27T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Nobody wants to be the person who deletes the test suite someone spent three sprints writing, even when it's been red-and-ignored for months. Ecocycle Planning gives a room permission to say so out loud — and to fund what's actually working."
tags: [liberating-structures, shortest]
series: ls-decide
seriesOrder: 2
use_featured_image: false
---

I ran a coverage review at shortest that opened with a slide nobody could defend: forty-one test suites, eleven of them red on more than half of the last thirty CI runs, and not one person in the room willing to say "delete it" out loud. Everyone agreed the flaky ones were dead weight; nobody would nominate one by name. That's not a discipline problem — it's a structural one. A list-format review makes killing something feel like an accusation aimed at whoever wrote it. **Ecocycle Planning** routes around that, because it never asks "whose suite is this" — it asks "where does this sit in its life," and life stages don't have an author.

## What it is

Ecocycle Planning comes out of Liberating Structures via Deborah Frieze and Brenda Zimmerman, and it borrows its shape from ecology: a figure-eight infinity loop instead of a straight timeline. The **front loop** runs birth → maturity → growth and alignment, where things get more efficient, more optimized, more rigid — until they hit the **rigidity trap**, the far right of the front loop, where past success has calcified into an inability to adapt. The **back loop** is the return journey: creative destruction → release → exploration and uncertainty → renewal → back to birth. Its own dead zone is the **poverty trap**, on the back loop, where something is stuck exploring with no resources ever landing behind it to make it real.

The value of the figure-eight over a straight line is that it names two *different* failure modes instead of one vague "not working." Something stuck in the rigidity trap isn't failing — it's succeeding too hard at something that no longer matters, crowding out resources that should go elsewhere. Something stuck in the poverty trap isn't failing either — it's promising and underfunded, about to die of neglect rather than of being wrong. Conflating those two on a flat backlog is how good ideas starve next to zombie systems nobody has the nerve to retire.

## How it runs

Ecocycle Planning is a physical, silent-first exercise, and skipping the silence is the most common way facilitators break it.

1. **Individual generation (5 minutes, silent).** Each person writes their group's practices, projects, or artifacts on sticky notes — one per note. No discussion yet. Silence matters: a spoken-first version lets the loudest person's framing anchor the room before anyone else has thought for themselves.
2. **Small-group placement (10–15 minutes).** Trios or quads gather around a large printed ecocycle diagram and physically place each sticky where it actually sits in the loop — not where the author wishes it sat. This step alone surfaces disagreement, because two people who wrote stickies for the same thing often place it in different spots.
3. **The two questions.** Once the diagram is populated, each group works two prompts directly against it: *what should we creatively destroy*, and *what's ready to be born*. The rigidity trap is the hunting ground for the first; the poverty trap for the second.
4. **Harvest (10–15 minutes).** Small groups report their creative-destruction and birth candidates to the whole room, and patterns across groups get named — if three separate trios independently placed the same suite in the rigidity trap, that's a far stronger signal than one person's opinion.

Total runtime is 45–90 minutes for a room of 12–20. It scales down fine to a single team of 6–8 running one shared diagram instead of several.

I applied this same structure to a CRM's feature portfolio in an [earlier post in this series](/product-management/ecocycle-planning-feature-portfolio-recap-crm/) — same loop, same two traps, different objects on the stickies. That's the tell that a structure is genuinely reusable: the diagram doesn't care whether you're plotting features or test suites, only that the group is honest about where things sit.

## Plotting a test suite's life instead of a feature's

At shortest, the natural unit for the stickies isn't a feature — it's a **test suite, a coverage area, or a triage pattern**, because a QA tool's core inventory is exactly that: the tests you maintain and the tooling you use to write and heal them. I ran the workshop with the QA lead, two engineers who owned the flakiest suites, and the person building the natural-language test authoring feature, because the birth-loop question needed someone who could actually speak to what's coming next.

**Birth**, unsurprisingly, was the easiest quadrant to fill: a brand-new suite generated from natural-language prompts for a feature area shipped three weeks earlier, still being hand-checked against real runs before anyone trusts it unattended.

**Growth and maturity** held the suites doing their job quietly — stable regression coverage for core flows, integrated into CI, rarely touched because they rarely need to be. Nobody argued about these; they were the least interesting part of the diagram, which is itself a useful signal. A healthy portfolio's calm middle should be boring.

**The rigidity trap** was where the room got honest. Two suites landed there without much debate: an end-to-end suite for a checkout flow that had been rewritten twice since the tests were last touched, now maintained by selectively skipping the assertions that failed instead of fixing them, and a suite of brittle selector-based UI tests that broke on every unrelated CSS change and had trained the team to treat any red run as noise. Both were expensive to keep, expensive to ignore, and nobody wanted to be the one who deleted three sprints of someone else's work — the exact paralysis this structure exists to dissolve, because the diagram made the call about the *suite's life stage*, not about the person who wrote it.

**The poverty trap** held the more uncomfortable finding: an AI-assisted flaky-test triage prototype that had been "exploring" for two quarters, generating genuinely useful root-cause suggestions in a spike branch, and never once getting engineering time to become a real feature. It had outlived its exploration budget without being funded to leave exploration. Next to it sat a coverage-confidence scoring model — an attempt to tell a team how much of a feature's real behavior its tests actually exercise — that three different people had independently prototyped and abandoned, each unaware the others had tried.

**Creative destruction** answered itself once the trap was visible: retire the selector-based UI suite entirely and replace its coverage with natural-language-authored tests against the same flows, and stop patch-skipping the checkout suite — either rewrite it against the current flow or delete it and accept the coverage gap openly instead of hiding it behind false-green skips. **What's ready to be born** was just as clear: fund the flaky-test triage prototype as a real roadmap item with an owner, and consolidate the three abandoned coverage-confidence attempts into one funded effort instead of a fourth solo spike.

The harvest was blunter than the CI dashboard alone had ever been. A red-and-skipped suite looks, on a dashboard, exactly like a suite quietly doing its job — both are just rows in a list. On the ecocycle diagram, one sits calmly in maturity and the other sits visibly, physically, in the rigidity trap next to a hand-written label explaining why. That visual difference is the entire value of the exercise.

## When it misfires

It fails first when the room **skips the physical placement and jumps to discussion.** Talking about where a suite "probably" belongs produces the same polite consensus a flat retro produces — everyone defers to whoever's loudest or most senior. The silent sticky-writing and the physical act of placing a note on a diagram are what force undefended judgment onto the table before groupthink can smooth it over.

It fails second when **ownership gets attached to the stickies.** If a sticky says "Priya's checkout suite" instead of "checkout E2E suite," the rigidity-trap conversation instantly becomes a conversation about Priya rather than the suite's life stage, and the whole point of a lifecycle diagram — that objects have a life stage independent of who tends them — collapses back into the interpersonal minefield the exercise was built to avoid.

And it's the wrong tool when the group is **too small or too aligned to disagree.** If one person owns the whole test suite and already knows exactly what's brittle and what's promising, running a 90-minute workshop to reach a conclusion they could have written on a sticky note alone is theater, not facilitation. Ecocycle Planning earns its runtime when there's real disagreement to surface or real organizational nerve required to say "we should kill this" out loud — not as a default ritual for every portfolio review, the same caution that applies to [any structure pulled off the field guide](/product-management/liberating-structures-for-product-teams-the-33-structure-field-guide/) without checking whether the room actually needs it.
