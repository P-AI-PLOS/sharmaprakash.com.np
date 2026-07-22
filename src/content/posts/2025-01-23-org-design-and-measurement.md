---
title: "Org Design & Measurement: Closing the Strategy Loop"
date: "2025-01-23T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The layer that decides whether a strategy has any teeth at all isn't the roadmap, it's who owns what and whether the numbers you're tracking mean anything. This is the last framework post in the series, and the one where the cascade stops being a diagram and starts being an org chart."
use_featured_image: false
series: leadership-frameworks
seriesOrder: 6
---

Every layer of the cascade so far has been about deciding what to do. This one is about deciding who's accountable for it and how you'd know if it worked — and it's the layer I resisted longest, because it's the one that turns strategy into something that can be graded. A strategy doc can survive being vague. A goal that's supposed to be measured cannot. Once you attach a number to an objective, you've made a promise you can be wrong about in public, and I've watched a lot of otherwise good leaders flinch away from that at the exact moment it matters most.

## OKRs

The idea is simple enough that it gets mangled constantly: an Objective is a qualitative statement of where you're trying to get to, and three to five Key Results are the measurable outcomes that would have to be true for you to say you got there. The nuance that took me the longest to actually internalize is that a Key Result has to be an outcome, not a task. "Ship the new onboarding flow" is not a Key Result, it's a to-do item wearing an OKR costume — it measures whether you did the work, not whether the work did anything. "Reduce time-to-first-value from 6 days to 2" is a Key Result, because it's still true even if you got there by deleting a step instead of shipping the flow you originally imagined.

The scenario where OKRs proved out for me was a quarter where two teams were both building onboarding improvements with zero coordination, each convinced their version was more urgent. Writing a shared Objective and Key Results forced both teams onto the same outcome, at which point it became obvious one of the two efforts was redundant and got folded into the other before a single sprint was wasted. The distinction between aspirational and committed OKRs mattered here too — the redundant effort had been treated as committed ("we will ship this") when it should have been aspirational ("we're exploring whether this moves the number"), and that mislabeling is what let two teams stay uncoordinated for a month. (Choosing the number itself — and decomposing it until each team owns a branch — outgrew this section and became [the metric-tree post](/product-management/north-star-metrics-and-metric-trees/).)

The failure that does the most damage: the moment OKRs get tied to performance review, everyone starts sandbagging their Key Results to guarantee a green quarter, and you've traded a stretch goal for a negotiation. The other quiet failure is forcing keep-the-lights-on work — security patching, tech debt paydown, on-call — into OKR language it doesn't fit, which either produces absurd Key Results ("zero P1 incidents") or teaches the team that OKRs are theater layered on top of the real work that actually happens.

## DORA metrics

Deployment frequency, lead time for changes, change failure rate, and time to restore service are the four numbers that answer a question leadership conversations kept dancing around without ever naming: is our delivery capability actually improving, or does it just feel faster because we shipped a big feature last week? I've come to treat citing DORA as close to a tell for engineering seniority in a conversation — not because the metrics themselves are exotic, but because reaching for them means someone has stopped arguing from vibes about velocity and started arguing from a system that's been externally validated across thousands of orgs.

Where this mattered most for me was a platform team that everyone privately believed had gotten slower after a reorg, but nobody could say by how much. Pulling actual lead-time-for-changes numbers showed the median hadn't moved at all — what had changed was variance. A handful of changes were taking three weeks instead of three days, dragging the conversation, while the typical change shipped exactly as fast as before. That reframed the fix entirely, from "speed up the team" to "find out what's different about the slow tail," which turned out to be a review bottleneck around one specific service.

The failure mode is treating the four metrics as a scoreboard to game rather than a system to understand. A team can inflate deployment frequency with meaningless micro-deploys, or crater change failure rate by shipping almost nothing risky, and either move looks great on a dashboard while quietly making the product worse. DORA tells you about delivery capability; it says nothing about whether you're building the right thing, which is exactly why it belongs at this layer of the cascade and not above it.

## SPACE

SPACE was built as a corrective to exactly the instinct DORA can slide into if you're not careful — measuring developer productivity by lines of code, commits, or tickets closed, all of which are trivially gameable and only weakly related to anything anyone cares about. SPACE spreads the question across five dimensions instead: Satisfaction and well-being, Performance (outcomes, not output), Activity, Communication and collaboration, and Efficiency and flow. No single number; a profile.

I've reached for this most directly in the AI-coding-tool debates that have been running through every engineering org for the last couple of years. The naive argument on both sides is a productivity number — "commits are up 30%" or "PRs are up but review time is up too" — and neither side is actually asking the SPACE question, which is whether engineers report better flow and lower cognitive load (Satisfaction, Efficiency) alongside whatever the activity metrics say. On one team, activity metrics looked flat after adopting an AI coding assistant, but a SPACE-shaped survey showed a real drop in context-switching friction and time lost to boilerplate — the win was real, it just wasn't visible in the metric everyone reflexively reached for.

The failure mode is that SPACE resists being reduced to a dashboard, which is also its whole point — it needs a survey instrument and genuine qualitative read, and any team that tries to turn it into five new KPIs has rebuilt the naive productivity metric problem with extra steps and a fancier name.

## RACI, DACI, RAPID

These are decision-rights frameworks, not project plans, and confusing the two is the single most common misuse I've seen. RACI names who's Responsible, Accountable, Consulted, and Informed. DACI names a Driver, Approver, Contributors, and Informed — a subtly better fit for one-time decisions rather than ongoing work. RAPID (Recommend, Agree, Perform, Input, Decide) goes further and explicitly separates who has to agree from who merely gets consulted, which matters enormously once you've been burned by a "consulted" stakeholder who behaved like an approver after the fact.

The scenario that made this concrete for me was a launch that kept stalling between product, legal, and design, with every meeting ending in "let's take this offline" and nothing resolving. The actual fix wasn't more meetings, more alignment sessions, or a stronger facilitator — it was writing down, in one sentence per group, who was the Decider and who was only Input. It turned out legal believed they were an Approver and everyone else believed they were Consulted, and that single mismatch explained three weeks of friction better than any amount of "let's get everyone in a room." I've said some version of "the fix was clarifying decision rights, not more meetings" often enough since that it's become close to a reflex diagnostic whenever cross-functional friction shows up.

The honest failure mode is that a RACI chart drawn once and filed away calcifies fast — org structure shifts, someone changes teams, and now the chart is actively lying about who decides what, which is worse than having no chart because people trust it.

## Team Topologies

Team Topologies gave me vocabulary I now use constantly: stream-aligned teams (organized around a flow of work to a customer), platform teams (reducing cognitive load for stream-aligned teams by providing self-service capability), enabling teams (temporarily boosting a team's capability in a specific area, then leaving), and complicated-subsystem teams (owning something that genuinely needs deep specialist knowledge). Alongside the four team types, the interaction modes — collaboration, X-as-a-Service, facilitating — describe how two teams should relate at a given moment, and naming the mode explicitly turns a lot of ambiguous cross-team tension into a solvable design question.

Conway's Law is the idea underneath all of it: your system architecture will mirror your communication structure whether you plan for it or not. The useful move is the reverse Conway maneuver — deliberately shaping team boundaries to produce the architecture you actually want, instead of discovering after the fact that your microservices map exactly onto old departmental turf wars. I've used this most directly when a monolith kept fragmenting along org lines nobody had chosen on purpose — three teams, three modules, and every module boundary matched a manager's headcount rather than a real seam in the domain. Redrawing team ownership around the domain seams, and accepting the short-term pain of a team losing a piece of "their" code, is what let the architecture start converging on something coherent again.

The failure mode is treating the four team types as a permanent org chart rather than a set of temporary shapes. Enabling teams especially get treated as permanent fixtures because disbanding a team is organizationally awkward, and a platform team that never rotates its people back into stream-aligned work quietly becomes an ivory tower that builds capability nobody downstream actually asked for.

## Liberating Structures

Most facilitation advice is too abstract to actually change what happens in a room, which is why I only trust the handful of Liberating Structures I've used enough times to have scar tissue on. 1-2-4-All is the one I reach for constantly — silent individual thinking, then pairs, then fours, then whole group — because it's the single most reliable fix I've found for the problem of the same three voices dominating every meeting while everyone else nods along. Troika Consulting is the other workhorse: one person presents a real problem, two others act as consultants while the presenter turns their chair away and just listens, no rebuttal allowed. Turning the chair away is the whole mechanism — it removes the presenter's ability to defend or explain, which is usually the thing killing the advice before it lands. For retros specifically, What/So What/Now What has replaced almost everything else I used to run, because it forces the group past venting ("what happened") into actual meaning ("so what does that tell us") before anyone's allowed to jump to action items.

The failure mode across all of them is the same: run once as a novelty, they feel like a fun departure from the usual meeting; run without adaptation to a group that's already exhausted or already deeply trusts each other, they feel like process theater imposed from outside. Liberating Structures work when they solve a specific, named participation problem, not when they're deployed as a general vibe upgrade for meetings.

## Closing the loop

I said at [the start of this series](/product-management/the-strategy-cascade-frameworks-i-actually-reach-for/) that if a team argues about priorities every sprint, the missing layer usually isn't the backlog. Having gone all the way down through strategy formation, discovery, prioritization, risk, and now org design and measurement, the thing I didn't expect to learn is that the missing layer is almost never a framework either. Every framework in this series is a shape for a conversation that has to happen regardless — the frameworks just make the conversation legible enough that two people can disagree about the same thing instead of past each other.

The layer this post covers is the one that decides whether any of the layers above it are real. A strategy with no Objectives underneath it is a story nobody's accountable to. Objectives with no clear decision rights around them get relitigated every time someone doesn't like the number. And a team structure that doesn't match the flow of work it's supposed to deliver will eventually bend the strategy to fit the org chart instead of the other way around, no matter how good the strategy doc reads. If the cascade has a bottom, it's here — not because the work stops, but because this is the layer that either closes the loop back up to strategy or quietly breaks it.

## Put it to work

1. **Audit your Key Results for to-do items in costume.** For each current KR, ask: could this still be true if we shipped nothing we currently plan to ship? If the answer is no — if the KR *is* the shipping — it's a task, not an outcome. Rewrite it as the change in the world the task was supposed to cause.
2. **Write the one-sentence decision map for your most-stalled initiative.** One line per involved group: decider, input, or informed. Then check it with each group before publishing. If two groups both believe they hold the pen, you've found the stall — and no additional alignment meeting was ever going to.
3. **Draw your team boundaries next to your architecture.** Sketch the system's real seams on one page and the team ownership lines on another, and overlay them. Everywhere they disagree, Conway's Law is already deciding your architecture for you; the only question is whether you redraw the teams on purpose or keep discovering it in incident retros.

## Further reading

- John Doerr, [*Measure What Matters*](https://www.amazon.com/s?k=measure+what+matters+doerr) — OKRs at their source; read it alongside a skeptic's take, because the failure modes live outside the book.
- Nicole Forsgren, Jez Humble & Gene Kim, [*Accelerate*](https://www.amazon.com/s?k=accelerate+forsgren+humble+kim) — the research behind DORA, and why the four metrics were chosen over everything else.
- "[The SPACE of Developer Productivity](https://queue.acm.org/detail.cfm?id=3454124)" (ACM Queue, 2021) — the original paper, shorter and sharper than most summaries of it.
- Matthew Skelton & Manuel Pais, [*Team Topologies*](https://www.amazon.com/s?k=team+topologies+skelton+pais) — the four team types, three interaction modes, and the reverse Conway maneuver.
- [liberatingstructures.com](https://www.liberatingstructures.com/) — all 33 structures, free, with facilitation notes.
