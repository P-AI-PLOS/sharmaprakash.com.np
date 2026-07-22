---
title: "Appreciative Interviews: What the Deals That Closed Smoothly Had in Common"
date: "2021-02-09T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "We usually study lost deals for lessons. This time we studied the ones that closed cleanly and fast — and found a pattern the CRM wasn't yet built to support, because nobody had ever gone looking for it."
tags: [liberating-structures, recap-crm]
series: ls-discovery
seriesOrder: 10
use_featured_image: false
---

Deal post-mortems, at every sales org I've worked with, are almost exclusively about losses. Losing a deal is visible, painful, and demands an explanation, so it gets a review. Winning cleanly, quickly, with no drama, gets a congratulatory Slack message and then silence — nobody asks *why* it went well, because it doesn't feel like it needs explaining. That asymmetry means most CRMs, including ours, are shaped almost entirely by loss analysis: friction removed from the parts of the funnel where deals die, and almost no deliberate design around what makes the smooth deals smooth. We ran **Appreciative Interviews** with our reps specifically to correct that imbalance, asking not "why do deals stall" but "tell me about one that just… worked."

## The method

Appreciative Interviews pairs people up to interview each other about a specific positive experience, in concrete story form rather than general opinion. The prompt is deliberately narrow: not "what's your approach to closing deals" but "tell me about one specific deal that closed unusually smoothly — walk me through what actually happened." The interviewer probes for detail: who was involved, what the rep did at each stage, what it felt like, what almost went wrong but didn't.

Pairs then share their stories back to the full group, and the group listens for what repeats across independently-told stories from different reps, different deal sizes, different customer segments. A theme that shows up in one story might be a fluke. A theme that shows up, unprompted, in four or five stories told by reps who've never compared notes is a real signal about what's actually driving good outcomes.

## What the stories converged on

We interviewed ten reps in pairs, each recounting one deal that had closed with unusual speed and ease. Several stories, independently, contained a moment that none of the reps had thought to flag as significant until they said it out loud: a point, usually mid-cycle, where the rep had shared something with the prospect that felt slightly premature by normal sales-process standards — an early, informal look at pricing before a formal proposal, or a direct introduction to a customer reference before the prospect had asked for one, or an unscripted answer to a hard question ("does this actually integrate with X") given honestly in the moment rather than deferred to "let me check and get back to you."

One rep's story was concrete enough to anchor the pattern: a mid-cycle deal where the prospect asked, almost in passing during a demo, whether the tool handled a specific edge case in their industry. Instead of parking the question, the rep pulled up a reference customer's account, live, on screen, and showed the actual configuration — a level of transparency well outside normal demo practice, done spontaneously because he happened to have that account open in another tab. The prospect's tone visibly changed in that meeting, and the deal closed nine days later with almost no further back-and-forth. He hadn't planned this as a technique; it was an improvisation that happened to remove the prospect's single biggest hesitation, live, with evidence rather than a promise.

Across the ten stories, the recurring shape was this: the deals that closed fastest weren't the ones where the rep followed the sequence most precisely — they were the ones where the rep broke from the sequence at exactly the moment the prospect showed a specific, real hesitation, and answered that hesitation directly and concretely rather than routing it into the next scheduled step. That's a genuinely different finding than anything a lost-deal post-mortem tends to produce, because lost-deal analysis focuses on what went wrong in the *process*, while this focused on what made the *process disposable* at the right moment.

## What it changed in the product

The CRM's sequence and pipeline-stage tooling, at the time, was built entirely around the assumption that following the defined stage sequence closely was the goal — stage-skip warnings, "you haven't sent the proposal template yet" nudges, deal-health scores that penalized non-standard pacing. The appreciative interviews surfaced that our own best closers were routinely, successfully, ignoring that structure at exactly the right moments, and the product had no way to support or even notice that behavior — it only had ways to flag it as a deviation.

The concrete change that came out of the session was a rep-facing "hesitation flag" — a lightweight way to tag a specific moment in a deal timeline (a call note, an email thread) as "prospect raised a real objection here," visible on the deal's activity feed, which several reps said out loud they'd have wanted in the reference-customer story: a fast way to see, later, exactly which objection got resolved and how, so the pattern could be studied and repeated rather than living only in one rep's memory of one lucky improvisation. It wasn't a workflow feature at all — it was closer to building a way for the CRM to *notice and capture* the moments its own top performers were already creating value in, so that value could compound across the team instead of evaporating the moment the call ended.

## Why studying wins finds different things than studying losses

Loss analysis and appreciative interviews aren't redundant checks on the same data — they answer different questions and surface genuinely different design implications. Loss analysis tells you where the funnel breaks and where to add guardrails. Appreciative Interviews told us where our best reps were already improvising past the guardrails productively, which is a signal to build *flexibility and visibility* into that moment, not more structure. Had we only ever run loss post-mortems, we'd likely have kept tightening sequence adherence — precisely the opposite of what the winning stories showed actually worked.

## Failure modes and when to skip it

The interview has to stay concrete. Reps, especially experienced ones, default easily into "here's my general philosophy on closing deals" — useful, but not what this technique is for. The interviewer needs to keep redirecting to "tell me about the specific one," because generalizations flatten exactly the surprising, unplanned detail (the rep pulling up a reference account live) that made the pattern visible in the first place.

It's also worth being honest that a handful of vivid stories is not a statistically representative sample — the "break sequence at the moment of real hesitation" pattern is a strong hypothesis worth building toward, not a proven mechanism, and it's worth validating with broader data (does hesitation-flag usage actually correlate with close rate across hundreds of deals, not ten stories) before betting heavily on it. And don't run this with a sales team that's mostly losing right now — a room with too few genuine recent wins to draw stories from will produce thin, generic material, and a different discovery method (or a hard look at what's broken first) is the better starting point.
