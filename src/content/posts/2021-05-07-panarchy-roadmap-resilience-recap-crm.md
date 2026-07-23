---
title: "Panarchy: Roadmap Resilience Across Timeframes"
date: "2021-05-07T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Ecocycle Planning maps one cycle. Panarchy maps three nested ones at once — this sprint, this year, the market underneath both — and forces a team to name where a fast crisis could take down a slow bet, or where a slow bet is quietly strangling a fast fix."
tags: [liberating-structures, recap-crm]
series: ls-decide
seriesOrder: 5
use_featured_image: false
---

Two weeks after we ran [Ecocycle Planning on recap_crm's feature portfolio](/product-management/ecocycle-planning-feature-portfolio-recap-crm/), a sales rep pinged the team about a broken email-sequence trigger the same afternoon our VP of Sales was presenting the annual roadmap to the board. Nobody in the room connected the two. That's the gap Panarchy exists to close: Ecocycle Planning tells you where one thing sits in its life cycle; Panarchy asks what happens when three different cycles, moving at three different speeds, are all under stress in the same room at once.

## What Panarchy is

Panarchy comes from C.S. Holling's ecological theory — the idea that ecosystems aren't one cycle but several nested ones, a fast one inside a slower one inside a slower one still, and that the interesting failures happen at the seams between them. As a Liberating Structure it's the natural extension of Ecocycle Planning: same birth-maturity-destruction-renewal loop, but instead of drawing it once for a portfolio, groups draw it two or three times at different scales, stack the loops, and go looking for trouble crossing between them.

The structure names exactly two failure modes worth hunting for. **Revolt** is when a crisis in a fast, small cycle cascades upward and destabilizes the slower cycle above it — a sprint-level fire that ends up derailing the annual plan. **Remember** is the opposite direction: the slower cycle's accumulated memory — its legacy decisions, its constraints, its scar tissue — shapes, sometimes wrongly, what the fast cycle is allowed to renew into. Every roadmap that "can't touch that because of how it was built three years ago" is remember in action. Every annual plan that got rewritten because of a single bad sprint is revolt in action.

## How it runs

Groups of 4-6, each with 2-3 stacked ecocycle loops drawn or printed on a wall-sized sheet — I use butcher paper because people need room to argue with a marker in hand. Plan for 60-90 minutes.

1. **Define the scales together, as one group, before splitting** (10 minutes). This is the step people skip and regret. Everyone needs to agree what "fast," "slower," and "slowest" mean for this specific roadmap before small groups scatter and invent three different definitions. For recap_crm we settled on: this sprint's feature cycle, the annual roadmap cycle, and the sales-tooling market/platform layer underneath both.
2. **Small groups label each loop for what's happening right now** (20 minutes). Each scale gets its own honest ecocycle placement — what's in birth, what's mature, what's creatively destructing, what's stuck in the poverty trap, at that scale.
3. **Hunt for revolt** (15-20 minutes). Where is something in the fast loop, right now, big enough that if it goes wrong it takes the slower loop down with it?
4. **Hunt for remember** (15-20 minutes). Where is the slow loop's memory — its architecture, its prior positioning bets, its "we tried that and it burned us" folklore — quietly vetoing something the fast loop needs to renew?
5. **Report the single cross-scale risk each group found** (10-15 minutes), not a list of five — the discipline is picking the one that would embarrass the room most if it happened this quarter.

The facilitator's real job is step 1. Skip it and every group draws different-sized loops and the reports don't compose into anything.

## Running it on recap_crm

The three loops we drew:

**Fast — this sprint's feature cycle.** Whatever's in flight this iteration: a pipeline-view tweak, a fix to follow-up automation timing, a meeting-recap formatting change. High turnover, two-week half-life.

**Slower — the annual roadmap cycle.** The bets that take a quarter or more to land: rebuilding the sales-vs-marketing handoff, a real activity-timeline redesign, whatever got promised to the board. Mature by the time the fast loop has forgotten it exists.

**Slowest — the sales-tooling market/platform layer.** What the category as a whole believes a CRM should do: expectations set by competitors, by the last five years of "AI-assisted everything," by whatever the buyer's other tools already do. This loop moves in years, and recap_crm doesn't control it — it can only adapt to it or fall behind it.

**Revolt, the one we actually found:** a fast-cycle bug in follow-up automation — sequences firing on the wrong trigger and emailing contacts who'd already replied — was small enough to look like a one-sprint fix. But it hit during the exact week the annual roadmap's marquee bet, a rebuilt sales-vs-marketing handoff, was being pitched to sales leadership as "the automation you can finally trust." One bad sprint's crisis was about to poison a year's positioning bet, not because the bug was architecturally connected to the handoff work, but because the story sales tells itself about reliability doesn't distinguish between them. That's a real revolt: the fast loop's failure borrows the slow loop's credibility and spends it.

**Remember, the one that stung more:** the annual roadmap kept deferring a genuinely obvious fast-cycle fix — letting reps reorder pipeline stages per-deal instead of per-account — because the pipeline data model had been built two years earlier around a rigid stage sequence, a decision made when the product only served one sales motion. Nobody currently in the room had made that call, and nobody could name a live reason to keep it, but every fast-cycle attempt to renew that corner of the product got vetoed by "that's not how pipeline stages work here." The slow loop's memory was constraining the fast loop's renewal on inertia alone, not on any current judgment.

Neither of those was visible in the Ecocycle Planning session two weeks earlier, because that session only drew one loop. It took stacking three to see the fast bug threatening the slow story, and the slow architecture strangling the fast fix.

## When to skip it

**Skip it if the team hasn't run Ecocycle Planning first**, or something equivalent. Panarchy assumes people already trust the vocabulary — birth, maturity, creative destruction, poverty trap — and can place things on a single loop fluently. Introducing the loop and the cross-scale hunt in the same session produces confusion, not insight; I've watched groups burn 40 minutes just arguing about where one feature sits before they ever get to the revolt-and-remember questions.

**Skip it if the org genuinely operates on one timescale.** A very early-stage product where "this sprint" and "the roadmap" and "the market" are functionally the same eight-week horizon doesn't have real seams between cycles yet — you'll be inventing distinctions that don't exist and the exercise will feel like theater.

**Watch for groups that only ever find remember, never revolt.** It's the more comfortable failure to name — "leadership's old decisions are holding us back" plays better in a room than "our own sprint work almost torched the annual story." If every group's report blames the slow loop, push back explicitly and ask them to find one fast-cycle risk before they report out. The exercise is only doing its job if both directions get named.
