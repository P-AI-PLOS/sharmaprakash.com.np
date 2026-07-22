---
title: "The Strategy Cascade: Frameworks I Actually Reach For"
date: "2026-07-13T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Every team I've been on has argued about priorities every single sprint. Eventually I noticed the argument was never about the backlog — it was about a missing layer above it. Here's the strategy cascade I use to find that layer, and where the rest of this series goes to work through each one."
use_featured_image: false
series: leadership-frameworks
seriesOrder: 1
---

I went through my notes recently and counted how many prioritization frameworks I've introduced to a team over the years. RICE, ICE, MoSCoW, opportunity scoring — at some point I'd tried nearly all of them. Every time, the team used it dutifully for a sprint or two, and then the arguments came back. Not about the framework. About the thing above it.

That's the pattern I want to write down here, because it took me longer than it should have to see it: **if a team argues about priorities every sprint, the backlog isn't broken — the layer above it is.** A prioritization framework can only rank things that are already comparable. If nobody agrees on what "winning" looks like, no amount of RICE scoring will produce agreement, it'll just produce a number everyone privately disagrees with.

## The cascade

Once I started looking for the missing layer instead of a better scoring formula, I started seeing the same six-layer cascade everywhere, whether the team called it that or not:

| Layer | Question it answers | Typical artifact | Cadence |
|---|---|---|---|
| Mission | Why do we exist? | Mission statement | Rarely changes |
| Vision | What does the world look like if we win? | Vision doc / narrative | 3–5 yrs |
| Strategy | Where do we play, how do we win, what do we deliberately *not* do? | Strategy doc | Annual, revisited quarterly |
| Objectives | What outcomes prove the strategy is working? | OKRs / North Star metric tree | Quarterly |
| Roadmap | What bets, in what order? | [Now / Next / Later](/product-management/building-a-roadmap-you-can-defend/) | Monthly review |
| Backlog & delivery | What ships this cycle? | Epics, stories, sprints | Weekly / bi-weekly |

Each layer answers a different question, and each one's job is to make the layer below it *cheap to decide*. A roadmap with no strategy above it isn't a roadmap, it's a queue — items get added because someone asked, not because they serve a chosen "how we win." A backlog with no roadmap above it is just whatever's loudest this week.

The direction of causality matters too, and it isn't only downward. Strategy flows down, but evidence flows up — a discovery interview that contradicts your diagnosis, or a quarter of OKR misses, should be able to reopen the strategy doc, not just get filed away. The teams that never revisit strategy usually aren't disciplined, they're just not listening to the layers underneath it.

## Where this series goes

None of this is about collecting frameworks. Every framework below is one I stopped forcing on a team once I understood which layer of the cascade it actually served — the RICE spreadsheet I retired wasn't a bad tool, it was solving a problem one layer too low. So instead of one long post cataloguing everything, I'm working through this layer by layer, with the failure mode of each framework named out loud alongside the case where it earned its keep:

- **[Strategy formation](/product-management/strategy-formation-how-to-tell-a-real-strategy-from-a-wish/)** — Rumelt's kernel, Playing to Win, Wardley Mapping, 7 Powers: how to tell a real diagnosis from a wish.
- **[Discovery](/product-management/discovery-and-customer-understanding/)** — Jobs to Be Done, opportunity solution trees, the Mom Test, Kano: studying the job, not the person.
- **[Prioritization & delivery](/product-management/the-strategy-cascade-turning-strategy-into-a-shippable-sequence/)** — RICE, Cost of Delay, Scrum vs. Kanban vs. Shape Up: turning a strategy into a shippable sequence.
- **[Risk & decisions](/product-management/risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure/)** — pre-mortems, one-way vs. two-way doors, ADRs, RAID logs: the vocabulary that actually gets used under pressure.
- **[Org design & measurement](/product-management/org-design-and-measurement/)** — OKRs, DORA, SPACE, Team Topologies, RACI/DACI: the layer that decides who owns what, and whether the numbers you're tracking mean anything.
- **[Principle-first thinking](/product-management/principle-first-when-to-put-the-frameworks-down/)** — the closing argument: why the goal is to need fewer of these frameworks over time, not more, and what to keep when you put them down.

The series didn't stop at seven posts, because the cascade's layers kept generating questions too big for a section. The strategy layer grew deep dives on [positioning](/product-management/positioning-the-choice-you-make-before-the-market-makes-it-for-you/) and [North Star metric trees](/product-management/north-star-metrics-and-metric-trees/); the delivery layer grew [user story mapping](/product-management/user-story-mapping-fixing-the-flat-backlog/) and [the PR/FAQ](/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/); discovery grew [a worked Mom Test interview](/product-management/practicing-the-mom-test-the-same-interview-twice/). The roadmap layer got a full hands-on run — [building the roadmap](/product-management/building-a-roadmap-you-can-defend/), then presenting the same artifact to [investors](/product-management/presenting-the-roadmap-to-investors/), in [sales meetings](/product-management/the-roadmap-in-the-sales-room/), and through [marketing](/product-management/marketing-the-roadmap/). And the principle-first argument became [its own series on agile](/product-management/the-agile-manifesto-four-values-twelve-principles/), rerun against process frameworks instead of product ones. If you're here for one layer, jump straight in; they're written to stand alone.

If your team is refighting the same priority argument every sprint, the fastest diagnostic question I know is: which layer of the cascade doesn't exist yet? Usually it isn't the backlog. The rest of this series is what I've learned trying to build each of those missing layers back.

## Try this before the next post

Run the cascade audit on your own team — it takes twenty minutes and it's the exercise everything else in this series builds on. For each of the six layers, write down two things: the artifact that currently holds it (a real document you can link to, not "it's understood"), and the date it was last meaningfully revised. Any layer with no artifact, or an artifact nobody has touched in over a year, is a candidate for the missing layer. Then take your last three heated priority arguments and ask which layer each one was *actually* about. In my experience the arguments cluster one or two layers above wherever the team thinks the problem is.
