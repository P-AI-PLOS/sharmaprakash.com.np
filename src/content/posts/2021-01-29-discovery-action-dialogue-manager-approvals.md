---
title: "Discovery & Action Dialogue: What Managers Who Approve Leave Well Already Know"
date: "2021-01-29T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Instead of designing a better approval flow from a whiteboard, we asked the managers who already handle tricky leave requests smoothly what they actually do — and found workarounds worth building into the product, not around."
tags: [liberating-structures, leave-balance]
series: ls-discovery
seriesOrder: 7
use_featured_image: false
---

Our approval-flow redesign was heading toward the usual place: a PM and a designer, in a room, sketching what a "good" leave-approval experience should look like, informed mostly by support tickets about what goes wrong. That's a reasonable input, but it's a deficit-based one — it tells you what breaks, not what already works. The alternative, and the one we actually ran, is **Discovery & Action Dialogue** (DAD): instead of designing a solution and testing it on users, you go find the people already handling the problem well, ask them what they actually do, and let solutions emerge from their own practice rather than from your whiteboard.

## What it is and how it runs

DAD comes out of the positive-deviance tradition — the observation, well documented in public health work before Liberating Structures adapted it, that in almost any population struggling with a problem, a small number of people are already solving it, using resources everyone else has access to, without anyone teaching them how. The structure is a sequence of questions asked of that group, in their own words, without an outside expert prescribing anything:

1. **"Do you believe this is a problem in your organization?"** — establishes that the group agrees the problem is real, not imposed from outside.
2. **"Do you know anyone who has faced the same problem but managed to find ways to successfully deal with it?"** — this is the hinge question. It names positive deviants without requiring anyone to volunteer themselves as exceptional, which lowers defensiveness.
3. **"Why do you think their strategies work?"** — probes mechanism, not just anecdote.
4. **"What would it take for you to do at least one of these activities, even on a trial basis?"** — moves straight from insight to a concrete, individually-owned next action, skipping the usual gap between "interesting finding" and "someone actually tries it."
5. **"Who else might have a good practice we can discover?"** — extends the search rather than treating the first session as complete.

Critically, DAD is run as a facilitated dialogue with the group itself, not as one-on-one interviews reported back by a researcher — the group hears each other's answers live, which is often where the real "oh, that's clever" recognition happens.

## Running it on leave approvals

We convened eight managers with mixed reputations for how smoothly their teams' leave requests went — some known for handling awkward requests (a last-minute request during a busy period, a part-timer's irregular schedule, someone requesting more than their balance covers) with little friction, others who regularly ended up escalating to HR.

The group agreed instantly that yes, this is a real problem — nearly everyone had a story about an approval that went sideways. The naming question surfaced two managers the rest of the group specifically pointed to as "somehow this never seems to be a mess for them." One of the two, when asked why her approach worked, described something nobody on the product side had ever heard framed this way: she reviewed her team's leave calendar informally every Monday, before any request came in, so she already had a rough mental model of who was likely to ask for what and when — meaning by the time a request landed, she was confirming a plan rather than evaluating a surprise. The second positive deviant did something structurally different but with the same effect: she'd built an informal habit of asking new team members, in their first week, to tell her their rough leave plans for the year up front, which meant her approvals almost never collided with team coverage gaps because she'd front-loaded the information gathering instead of reacting to it request by request.

Neither behavior was something the product enabled or even acknowledged existed — both managers had built these habits entirely outside the tool, using a personal calendar and a notebook. The "why does it work" question made the mechanism explicit: both were solving the *information timing* problem, not the *approval logic* problem our redesign had been focused on. We'd been trying to make the approval decision itself smarter (better balance visibility, clearer conflict warnings at the moment of request) when the actual lever, demonstrated by people already succeeding, was surfacing the relevant information *before* a request ever got submitted.

The trial-basis question turned that insight into something concrete fast: three of the less-successful managers in the room agreed, right there, to try a lightweight version of the "ask new hires about rough leave plans early" habit for one quarter — no product change required yet, just adopting a practice a peer had already proven out. That gave us a live, low-cost experiment running in parallel with any product work, and gave the eventual feature (a proactive "share your rough leave plans" prompt shown to managers when a new team member joins) real behavioral precedent instead of a hypothesis.

## Why asking "who already succeeds" beats asking "what's broken"

Support tickets and complaint-driven design tell you where the pain is, but they systematically miss what's already working, because nobody files a ticket to report that something went smoothly. DAD deliberately searches in the opposite direction, and the asymmetry matters: solutions discovered this way are, by construction, already proven to work with the exact constraints (the same tool, the same policies, the same organizational culture) everyone else in the room operates under. That's a much stronger starting point for a product feature than an idea invented from scratch, because you're not guessing whether it'll work in practice — you already have a working example.

It also changes the emotional register of the conversation. A manager who's just described her own working practice, and been recognized by peers as the reason to look at it, is a very different starting point than a manager being told by a product team what she's doing wrong.

## Failure modes and when to skip it

DAD depends entirely on positive deviants actually existing and being findable within the room you convene — if the problem is universally handled badly (nobody, anywhere, has found a workable approach), the technique has nothing to surface, and you're better off with a design or research method that doesn't assume existing good practice. It also requires real honesty from the group about who's succeeding, which can be awkward in a hierarchy-sensitive room; a junior manager may be reluctant to name a peer, let alone claim success for themselves, if seniority dynamics make that feel risky. Facilitate the naming question carefully, and consider running DAD within a peer group of similar seniority rather than mixing levels.

Skip it if you already know, with confidence, exactly what the working practice looks like and just need to build it — DAD is a discovery method, and running a full session to confirm something you're already sure of wastes the group's time and reads as false humility. And don't treat the first session's harvest as exhaustive; the "who else might have a good practice" question exists precisely because the first round rarely finds everyone, and a single DAD session is a beginning, not a complete inventory.
