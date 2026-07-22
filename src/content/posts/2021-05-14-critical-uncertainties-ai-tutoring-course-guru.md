---
title: "Critical Uncertainties: Betting on AI Tutoring Without Pretending You Know the Future"
date: "2021-05-14T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "course guru's leadership wanted a roadmap slot for AI tutoring. What they actually needed was a scenario map — because the two things that decide whether it works aren't things you can just go find out by asking someone."
tags: [liberating-structures, course-guru]
series: ls-decide
seriesOrder: 7
use_featured_image: false
---

Six months into arguing about whether course guru should build an AI tutoring feature, I finally admitted the argument itself was the problem. Every planning meeting produced the same two camps: one insisting merchants would pay a premium for an AI assistant that answered learner questions inline, the other insisting it was a distraction from certificate and cohort features people were already asking for. Both camps had opinions. Neither had evidence, because the thing we were arguing about hadn't happened yet — it depended on how a market none of us controlled was going to move. That's the moment to stop debating and run **Critical Uncertainties**, a scenario-planning Liberating Structure that doesn't ask a group to predict the future, it asks them to plan for several futures at once and find what's smart no matter which one shows up.

Worth flagging up front: this is a different kind of tool than the last several posts in this series. Ecocycle Planning and Panarchy map what already exists — where your portfolio sits on a lifecycle, how resilience trades off against efficiency in a system you're already running. Critical Uncertainties doesn't map anything that exists. It's for a bet with a genuinely open outcome, where the two variables that matter most are ones nobody in the room can just go check.

## What it is and how it runs

Critical Uncertainties is a 2x2 scenario-planning method adapted into the Liberating Structures set from classic corporate scenario-planning practice — the Shell/GBN school of "we can't predict this, so let's get specific about several versions of it." It runs in small groups of four to five, takes roughly forty-five to seventy-five minutes end to end, and produces something a straight prediction never gives you: a short list of moves that hold up regardless of which future actually lands.

**Step 1 (5–7 minutes) — brainstorm broadly.** Each small group lists every trend, force, and open question that could plausibly affect the decision. No filtering yet — market shifts, competitor moves, platform changes, regulatory questions, behavior changes, cost curves, anything.

**Step 2 (5 minutes) — pick the two that matter.** The group narrows the list to the two uncertainties that are simultaneously **highest-impact** and **most genuinely uncertain**. The second filter does the real work: plenty of items on the brainstorm list are important but *knowable* — you could resolve them by asking a customer or reading a document, and if you could, they don't belong on the axes. What survives both filters is usually a short, uncomfortable list, because most teams brainstorm a dozen "uncertainties" and find nine are really just unfinished homework.

**Step 3 — cross them into a 2x2.** The two survivors become the axes of a grid, producing four quadrants. The group names each one something short and evocative — not "high adoption, low platform shift" but a phrase memorable enough to argue about six weeks later.

**Step 4 (15–20 minutes) — the wish-we-had question.** For each quadrant, the group asks: *if this scenario happened, what would we wish we had already done?* Not what would we do next — what groundwork or decision would we regret not having made already. This is where the structure earns its keep; it forces concrete action inside a hypothetical instead of vague hedging.

**Step 5 — harvest for robustness.** Compare the four quadrant answers against each other. Actions that show up as smart moves in three or four quadrants are **robust strategies** — do them regardless of how things unfold. Actions that only make sense in one quadrant are **quadrant-specific bets** — options to hold, not commitments to make now. With enough time, run multiple small groups each picking a different axis pair, then compare grids; disagreement about which two uncertainties matter most is itself useful data.

## Running it on course guru's AI tutoring bet

We ran two groups in parallel, each generating their own long list before converging. The list was long and familiar: will Shopify's own AI direction absorb this use case, will merchants actually value it enough to pay, will instructors trust an AI answering on their behalf, will the underlying model costs stay viable at course-guru's price points, will learners actually use it versus ignore it like most in-app help widgets. After the impact-and-uncertainty filter, two survived, and they weren't the ones half the room walked in expecting.

The first axis: **how fast do merchants and learners actually adopt AI tutoring**, ranging from "learners route around it, merchants see it as a checkbox feature" to "it becomes the reason merchants pick course guru over a plain video-hosting app." The second: **how much does Shopify's own App Store and AI direction shift under us**, ranging from "Shopify stays a neutral platform, third-party AI features are welcome and undifferentiated" to "Shopify ships adjacent AI capability at the platform level that makes a third-party version redundant or a compliance headache."

The four quadrants, as the room named them:

- **Table stakes** (high adoption, stable platform) — merchants and learners genuinely want it, and the platform stays out of the way. The obvious "good news" quadrant, but the group's insight was that here, being *fast* matters more than being *sophisticated* — whoever's assistant merchants adopt first tends to stay adopted.
- **Built on sand** (high adoption, shifting platform) — learners love it, but Shopify's own AI roadmap encroaches on the same surface area, and course guru risks building something the platform later makes redundant.
- **Quiet feature** (low adoption, stable platform) — nobody's clamoring for it, and the platform isn't threatening it either. The instinct is to keep building; the group's instinct was the opposite — this is where the feature quietly becomes a maintenance tax nobody notices until a re-platforming forces the question.
- **Wrong bet, wrong time** (low adoption, shifting platform) — worst case: low uptake and the ground moving under any AI investment at the platform level. This is the quadrant where you'd wish you'd spent the engineering time on certificate customization or cohort scheduling instead.

The wish-we-had-done answers, harvested across all four, converged on a shorter list than anyone expected. Building the tutoring assistant as a thin layer on top of existing course content — rather than a parallel content system — showed up as smart in every quadrant, because it's cheap to retire in the bad quadrants and cheap to extend in the good ones. Instrumenting actual usage from day one, not satisfaction surveys but real query logs, showed up everywhere too, since it's the fastest way to tell which quadrant you're actually in before the full-year plan commits to one. What didn't survive the harvest was the thing half the room wanted to greenlight before the workshop: a dedicated instructor-facing AI authoring tool. That only paid off in **Table stakes**, and building it first would have meant betting the whole roadmap slot on the one quadrant we had the least ability to guarantee.

## When to skip it

Critical Uncertainties is wasted on decisions that aren't actually uncertain. If your two candidate axes are things you could resolve by pulling a support ticket count or asking three merchants directly, you don't need scenario planning, you need to go ask them — running a 2x2 on a knowable question just dresses up laziness as strategy. It's also the wrong tool for a decision with a hard deadline and no room for a hedge: if the bet has to be made this sprint regardless of what the quadrants say, spend the time on the decision instead of the map.

The other failure mode is falling in love with the grid. A crisp 2x2 with clever quadrant names feels like an answer, and it isn't one — it's four possible futures plus a short list of moves that survive all of them. Teams that treat the labels as a forecast rather than a planning tool end up re-litigating "which quadrant are we in" every quarter instead of watching the instrumentation they were supposed to build in step 5. And if nobody can name a real signal that would tell you which quadrant is unfolding — no metric, no observable event — the axes were probably picked for drama rather than genuine uncertainty, and it's worth going back to step 2 before building a roadmap on top of them.

For more on where this fits against the rest of the set, the [field guide to all 33 structures](/product-management/liberating-structures-for-product-teams-the-33-structure-field-guide/) has the full map; and if you want the lifecycle-level view of the same product this post used, the [Panarchy post on course guru's roadmap resilience](/product-management/panarchy-roadmap-resilience-course-guru/) covers the adjacent question of how much of the portfolio to put at risk on a bet like this one in the first place.
