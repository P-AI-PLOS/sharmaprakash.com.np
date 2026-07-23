---
title: "Before You Write an OKR — OKRs vs. Rocks vs. a Bare North Star"
date: "2026-07-23T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Three goal-setting systems, each claiming to be the best — and all three are right, for different organizations at different stages, which is why the real skill isn't writing OKRs but knowing which framework your team actually needs."
use_featured_image: false
series: operating-rhythm
seriesOrder: 1
---

A forty-person SaaS company adopted OKRs because Google uses them. The CEO read *Measure What Matters*, bought the workbook, ran a two-day workshop, and every team left with four objectives and three key results each. Two quarters later, the OKR review was a graveyard of abandoned metrics. Nobody tracked the key results weekly. The objectives were too vague to constrain behavior. The teams said "OKRs don't work for us" and went back to their roadmaps. The problem wasn't OKRs — it was that the company needed Rocks (focused priorities with accountability) and a North Star (a single compass heading), not OKRs (measurable outcomes with quarterly commitment). They'd chosen the framework based on what Google uses instead of what their team needs.

A different company — a twenty-person startup — adopted Rocks from EOS (Entrepreneurial Operating System) because their advisor recommended it. Every quarter, each team chose three to seven "rocks" — the priorities that everything else deferred to. The system worked beautifully for focus: the team stopped chasing every opportunity and started finishing things. But after four quarters, the rocks were all output-oriented (ship feature X, redesign onboarding, hire three engineers) and nobody could articulate whether the company was actually *winning*. They had discipline without direction. A North Star metric — one number that captured whether the company was succeeding — would have anchored the rocks in outcomes instead of just activity.

A third company — a ten-person team — tracked only a North Star metric: weekly active users. Every decision was evaluated against "does this move WAU?" It worked as a compass: the team always knew what mattered. But it failed as a commitment: nobody owned a specific quarterly target, nobody could say "we will move WAU from X to Y by March," and the team drifted from quarter to quarter making incremental improvements without a forcing function to make harder trade-offs. They had direction without accountability.

Three frameworks, three failure modes, three different lessons. The skill isn't writing any of them well — it's knowing which one your team needs.

## OKRs: measurable outcomes with quarterly commitment

OKRs — Objectives and Key Results — are the framework for teams that need measurable outcomes with a time-bound commitment. The objective is the "what" (a qualitative goal), and the key results are the "how will we know" (specific, measurable metrics with targets and deadlines).

OKRs work best when:

- **The team is autonomous enough to choose their own key results.** If the CEO writes every team's KRs, OKRs become a top-down number decomposition (which is the failure mode [the cascading post](/product-management/cascading-okrs-to-department-and-product/) covers). OKRs require that each team can answer "given the company's objective, what can *we* own?"

- **The team can measure their key results weekly.** If a KR can only be evaluated at quarter-end, it's too lagging to drive behavior. The best KRs are leading indicators that the team can check every Monday and adjust course on Wednesday.

- **The team is willing to commit to specific numbers.** OKRs are commitments, not aspirations (despite what some guides say). A KR that says "improve activation by 20%" is a commitment; a KR that says "work on activation" is a wish. The number forces trade-offs: if you're committed to 20% improvement, you stop doing things that don't contribute to it.

The failure mode: OKRs become a reporting exercise. The team writes KRs, presents them at the quarterly review, and then ignores them until next quarter. The metric is tracked in a spreadsheet nobody opens between reviews. The objective is too vague to constrain daily decisions ("improve user experience" doesn't help anyone choose between two features). When OKRs fail, it's almost always because the team chose the framework for its reputation instead of its mechanics.

## Rocks: focused priorities with accountability

Rocks — from Gino Wickman's EOS (Entrepreneurial Operating System) — are the framework for teams that need focus and accountability above all else. Each quarter, every team chooses three to seven "rocks" — the specific priorities that everything else defers to. If a rock conflicts with a non-rock, the rock wins.

Rocks work best when:

- **The team is drowning in competing priorities.** If every initiative is "P1," nothing is. Rocks force the team to name the three to seven things that actually matter this quarter, and to say no to everything else. The constraint is the value.

- **The team needs accountability, not just measurement.** Each rock has an owner, a due date, and a clear definition of done. The weekly level-10 meeting (EOS's accountability ritual) checks progress on every rock. If a rock is off track, the owner explains why and the team decides whether to recommit or deprioritize.

- **The organization struggles with follow-through.** If the team is good at starting things and bad at finishing them, Rocks create a completion bias: you finish this quarter's rocks before starting next quarter's. The system rewards finishing over starting.

The failure mode: Rocks are output-oriented, not outcome-oriented. "Ship the new onboarding flow" is a rock; "reduce time-to-first-value from 12 minutes to 5 minutes" is a key result. The rock tells you what to build; the KR tells you whether building it mattered. A team that only tracks rocks builds things and ships them and never discovers whether they worked. The fix is to pair rocks with a North Star or a single KR that captures the outcome the rocks are supposed to produce.

## North Star: a single compass heading

A North Star metric is the framework for teams that need a long-term anchor without the overhead of quarterly cycles. It's one number that captures whether the company is winning — not a target to hit this quarter, but a direction to move toward over years.

North Stars work best when:

- **The team needs a unifying direction more than quarterly targets.** Early-stage startups, teams in探索 mode, and companies pivoting need a compass more than a roadmap. "Increase weekly active users" tells every team what matters without constraining them to specific quarterly commitments.

- **The team is mature enough to self-organize around a direction.** A North Star works when the team can look at the number and independently decide what to work on. It fails when the team needs someone to tell them what to do — in that case, OKRs or Rocks provide more structure.

- **The metric is a genuine leading indicator of business health.** Not every metric works as a North Star. "Revenue" is too lagging. "Number of features shipped" is output, not outcome. The best North Stars are behavioral metrics that predict revenue: weekly active users, daily transactions, projects created. The metric should be something a user *does*, not something the company *earns*.

The failure mode: the North Star becomes a vanity metric. "Daily active users" sounds like a North Star, but if users are activating by opening the app and immediately closing it, the number is moving while the business isn't. The North Star needs to be validated: "does movement in this metric actually predict the business outcome we care about?" If not, it's a number, not a star.

## The combination that actually works

The three frameworks aren't competitors — they're layers. The most effective teams I've worked with use all three at different horizons:

**North Star at the annual level.** One metric that captures the long-term direction. Reviewed quarterly, updated rarely. This is the "are we winning?" number.

**OKRs at the quarterly level.** Three to five measurable outcomes that contribute to the North Star direction. Each team owns specific KRs. Reviewed weekly, committed quarterly. This is the "what are we doing this quarter to move the needle?" commitment.

**Rocks at the sprint level (optional).** Three to seven priorities that keep the team focused on the OKRs. If a sprint's work doesn't connect to a rock or a KR, it shouldn't be in the sprint. This is the "what are we doing this two-week cycle?" filter.

The mistake is adopting all three simultaneously without understanding which layer each serves. The company that adopted OKRs because Google uses them was trying to use OKRs as a North Star, a quarterly commitment, and a sprint filter all at once. The company that adopted Rocks needed the sprint filter but lacked the quarterly commitment. The company with only a North Star had the direction but not the accountability.

## The decision framework

Before choosing a framework, answer three questions:

1. **Does the team need direction or accountability more?** Direction → North Star. Accountability → Rocks. Both → OKRs.
2. **Can the team measure outcomes weekly?** Yes → OKRs work. No → Rocks (which measure output) or North Star (which measures trend) are better until measurement improves.
3. **Is the organization good at saying no?** Yes → OKRs (which require trade-offs). No → Rocks (which force prioritization by constraint). A team that can't say no needs the hard constraint of "these seven rocks and nothing else" before it can handle the softer constraint of "these KRs and the trade-offs they imply."

The framework you choose matters less than the discipline you bring to it. OKRs without weekly tracking are a spreadsheet. Rocks without an outcome anchor are a to-do list. A North Star without quarterly commitments is a hope. The system works when the team treats it as a decision-making tool — using it to choose what to do and what to stop doing — instead of a reporting tool that documents what already happened.
