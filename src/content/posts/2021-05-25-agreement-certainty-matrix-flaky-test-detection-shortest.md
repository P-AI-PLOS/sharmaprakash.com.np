---
title: "Agreement-Certainty Matrix: Triaging Flaky Tests Before Choosing a Fix"
date: "2021-05-25T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "\"Flaky test detection\" sounds like one engineering problem. It's usually three, tangled together, each demanding a different response. Here's how the Agreement-Certainty Matrix pulls them apart before a team burns a quarter on the wrong fix."
tags: [liberating-structures, shortest]
series: ls-decide
seriesOrder: 10
use_featured_image: false
---

The flaky-test roadmap review that taught me this lesson opened with a single line item: "reduce flaky test rate." Underneath it, seven engineers had seven different mental models of what "flaky" even meant — a timing race in one suite, an environment that behaved differently under CI load, and, for a growing slice of the AI-generated tests, a live argument about whether the assertions had ever been correct in the first place. We'd been treating all of it as one backlog item with one owner and one fix: add retries. Retries made the dashboard green and told us nothing. The problem wasn't that we lacked a solution — it's that we'd never established which parts of the problem *had* a knowable solution at all. That's the job of the **Agreement-Certainty Matrix**.

## What it is

The Agreement-Certainty Matrix is a Liberating Structure built on Ralph Stacey's Agreement & Certainty framework. It's a 2x2: one axis is **certainty about cause and effect** — do we actually know what produces this outcome — and the other is **agreement among stakeholders** — do the people involved even see the problem the same way. The four resulting zones each demand a different mode of response, and confusing them is the single most common way teams waste effort:

- **Simple** (high certainty, close agreement): the cause is known and everyone accepts it — apply the known fix and move on. No workshop needed, just execution.
- **Complicated** (certainty is high but agreement is thinner, or the reverse): the answer exists, but it takes expertise most of the room doesn't have — bring in the specialist.
- **Complex** (low agreement and low certainty): no best practice exists because the problem itself isn't fully understood yet — this zone needs a small experiment or another Liberating Structure to probe before anyone commits to a fix.
- **Chaotic** (crisis): things are actively breaking and there's no time to deliberate — stabilize first, analyze after.

The matrix's value isn't the taxonomy. It's the placement debate — forcing a room to argue out loud about which zone a given item belongs in surfaces exactly the disagreement that a status-report bullet point hides.

## How it runs

Give the group 5 minutes to write candidate items on sticky notes individually and silently — one item per note, phrased as a specific problem, not a category. Silence first matters: it stops the loudest voice in the room from pre-seeding everyone else's answer.

Break into small groups of 4-5 and hand each group a large matrix drawn on a whiteboard or butcher paper, axes labeled certainty (low to high) and agreement (low to high). Groups spend 20-25 minutes physically placing every sticky note, and the rule is that placement requires the group to actually agree on where it goes — which means a note frequently gets picked up, argued over, and moved twice before it settles. That friction is the exercise; don't rush past it by letting one person place notes unilaterally.

Once the matrix has stabilized, spend the last 10-15 minutes matching response mode to zone, zone by zone: Simple items get delegated for immediate execution, Complicated items get an owner tasked with finding or being the expert, Complex items get assigned a small time-boxed probe (often another Liberating Structure, like Critical Uncertainties), and anything Chaotic gets flagged for whoever can stabilize it fastest, full stop, no further discussion until it's stable. Whole exercise: 45-60 minutes.

## Applying it to shortest's flaky tests

We ran this with the engineers closest to CI, QA leads, and one person from the AI test-generation team, all writing candidate flakiness sources independently first. What landed on the matrix broke roughly into three clusters — and the clustering itself was the finding, because the roadmap had been treating them as one.

**Simple, bottom-right.** A handful of items went here almost unanimously and fast: a specific class of timing race where a generated test asserted on an element before an async render finished, a known issue with a shared test-data fixture that mutated across parallel runs. Everyone in the room had seen these exact failure signatures before, everyone agreed on the fix (explicit wait conditions, fixture isolation), and the only real decision was who picked up the ticket that week. These items had been sitting in the backlog for months getting the same triage attention as everything else — which was the first waste the matrix exposed.

**Complicated, upper-left.** CI infrastructure behavior — containers under memory pressure producing different timing than local runs, browser driver version drift between environments — clustered here. The room agreed these were real, but nobody present actually knew the fix; it needed someone who understood the CI runner configuration deeply. That's a different kind of ticket than "add a wait" — it needs an infra specialist brought in, not another engineer guessing at retry counts.

**Complex, and this is where the roadmap had been lying to itself.** A cluster of items had no agreement on placement at all, and the debate about them ran twice as long as everything else combined: was a given flaky test flaky because of a genuinely nondeterministic UI, because the natural-language test generation had produced an assertion that was too brittle or too vague to begin with, or because the underlying feature itself had inconsistent behavior the test was correctly catching? Nobody could say with confidence, and worse, different people were confident in different, contradictory explanations. This is exactly Stacey's complex quadrant: no best practice exists yet because the group doesn't even agree what's causing the symptom. The right move here wasn't a fix — it was a probe. We scoped a two-week experiment to tag a sample of flaky failures by suspected cause and see which explanation the data actually supported, deliberately deferring any permanent fix until the probe reported back.

Nothing landed in Chaotic that day, though it's worth noting for shortest specifically: a sudden spike in flaky failures right before a customer's release freeze would belong there — stabilize the pipeline first, understand causes later. The matrix works because it makes that distinction visible before someone tries to run a root-cause investigation during a fire.

The blanket "add retries" policy we'd been running made a kind of sense for the Simple cluster and was actively harmful for the Complex one — it masked signal we needed the probe to find. One approach applied uniformly across three different problem shapes was worse than three separate, smaller decisions. If this structure sounds familiar, it's the same one I used for [triaging a CRM backlog](/product-management/agreement-certainty-matrix-backlog-triage-recap-crm/) a few days earlier — the matrix travels well because most backlogs are secretly three problems wearing one label.

## When to skip it

Don't run this if the team already broadly agrees on both cause and fix — you'll spend an hour ceremonially confirming what a five-minute conversation would have settled. It also fails when the room lacks anyone with real expertise on the Complicated items; the matrix will correctly identify that a specialist is needed, but if no specialist is reachable, that quadrant just becomes a parking lot of things nobody can move. And watch for a facilitation trap specific to engineering rooms: technical people default to certainty-signaling even when they're guessing, which can drag genuinely Complex items toward Complicated placement by sheer confidence of tone. If someone's certainty seems to outpace their evidence, ask directly what data backs the placement — that single question does more to keep the matrix honest than any amount of facilitator authority.
