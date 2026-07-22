---
title: "1-2-4-All: Fast Group Ideation for a New Pipeline Feature"
date: "2021-03-16T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The default workshop opener — silent thinking, then pairs, then fours, then the room — surfaces more usable ideas in twelve minutes than an hour of open discussion. Here's how it runs, and how I used it to kick off a pipeline-feature redesign without one voice dominating the room."
tags: [liberating-structures, recap-crm]
series: ls-ideation
seriesOrder: 1
use_featured_image: false
---

Every workshop I run starts the same way now, regardless of the topic: someone poses a question, and instead of asking for hands up, I ask for silence. Thirty seconds later, pens are moving and nobody has said a word. That's **1-2-4-All**, the Liberating Structure I reach for more than any other of the thirty-three, and it's the one I used to open a redesign session for a new pipeline feature on a CRM team that had, by their own admission, stopped running good kickoffs entirely.

## What it is

1-2-4-All is a deceptively small structure: one question, four rounds of escalating group size, five minutes each. It was developed as the workhorse opener in the Liberating Structures repertoire precisely because it solves the most common failure mode of group ideation — a handful of confident voices set the frame in the first ninety seconds, and everyone else spends the rest of the meeting reacting to that frame instead of contributing their own. 1-2-4-All structurally prevents that by making individual thought mandatory and public speech optional until the idea has already survived two rounds of peer testing.

## How it runs

The facilitation is simple enough that I write it on a whiteboard and never touch notes again:

1. **1 — Silent self-reflection (1 minute).** Pose a sharp, open question. Everyone writes their own answer alone. No talking. This is the step teams want to skip, and it's the step that matters most — it guarantees the quiet thinkers and the people who process by writing aren't drowned out before they've even formed a view.
2. **2 — Pairs (2 minutes).** Turn to a neighbor, compare notes, and generate one shared idea or refined pair of ideas from your two individual answers. This is where the first synthesis happens — not compromise, but genuine combination.
3. **4 — Fours (4 minutes).** Two pairs merge into a group of four, and repeat: compare, identify what's strongest across both pairs' output, converge on the best 1–2 ideas the four of you can stand behind.
4. **All — Whole group share (5+ minutes).** Each group of four reports just their best idea — not everything they discussed — to the room. The facilitator collects these on a shared board. With six or eight groups, you get six or eight strong ideas in the time a normal brainstorm would still be waiting for the second person to speak.

Twelve to fifteen minutes total for a room of any size — I've run it with six people and with sixty, and the timing barely changes because the group-of-four ceiling caps how long any one round takes regardless of headcount.

## Applying it: kicking off a pipeline-feature redesign

The team building a new pipeline view for a CRM product had a familiar problem: the last three kickoff meetings for this feature had been dominated by the sales lead, who had strong (and not unreasonable) opinions about stage-transition logic, while the two engineers and the support rep in the room had said almost nothing. By the third meeting, "what should the pipeline view do" had quietly narrowed to "what does the sales lead want the pipeline view to do."

I opened the redesign kickoff with 1-2-4-All and a single question: *"What's the one thing about how deals move through stages today that makes your job harder than it should be?"* Deliberately not "what feature should we build" — that question invites solutioning too early and lets the loudest domain expert anchor the room. The reframe to *pain* instead of *feature* also meant the support rep and the engineers had just as much standing to answer as the sales lead did; everyone experiences stage friction, from different angles.

The silent minute produced answers that never would have surfaced in open discussion: an engineer wrote about the number of silent, unlogged manual stage overrides happening because the automatic transition rules were wrong for a specific deal type; the support rep wrote about the volume of "why did this deal jump stages" tickets that traced back to those same overrides. Neither of them would have said that out loud first, competing against a sales lead ready to talk immediately about a bulk-move UI. By the pairs round, those two observations had already merged into a sharper shared idea: the real problem wasn't the *view*, it was that the *transition rules* didn't match reality closely enough to trust automatically, so people were hand-editing state without an audit trail.

By "All," three of the four groups had independently converged on some version of that same root cause — visible only because the structure forced individual thought before anyone had heard the sales lead's framing. The feature that got scoped afterward was not a prettier pipeline view; it was configurable stage-transition rules with a visible override log. That's a materially different, more valuable feature than what the previous three meetings had been circling, and it took twelve minutes to find, followed by an hour of the room actually discussing something everyone had helped surface.

## Why the structure does the work the facilitator can't

The instinct when a meeting is dominated by one voice is to manage it socially — call on quieter people, ask the dominant voice to hold back, run a round-robin. All of that puts the facilitator in the position of policing contribution in real time, which is exhausting and rarely works cleanly; the dominant voice usually just resumes once the round-robin ends. 1-2-4-All doesn't manage the dynamic, it removes the conditions that produce it. Silent writing means the first idea in the room isn't spoken, it's fifteen simultaneous private ones. Pairs mean the first *spoken* synthesis happens at 1:1 odds, not one-against-a-room. By the time the whole group hears anything, it's already been vetted by two rounds of peers who had no reason to defer to hierarchy — they were just two people at a table.

## Failure modes and when to skip it

The structure fails on a **weak or leading question**. If the prompt is vague ("thoughts on the pipeline?") the silent minute produces mush, and mush multiplied through pairs and fours is still mush — just slower. If the prompt is loaded ("don't you think we need a bulk-edit button?") you've smuggled the answer into the question and the four rounds just launder a foregone conclusion into apparent consensus. Spend real time on the single sentence you're going to ask; it's the only lever you have.

It's also the wrong tool when the room already has a validated hypothesis and needs to make a *decision*, not generate *options* — 1-2-4-All is divergent by design, and running it when what you actually need is convergence just delays the decision by fifteen minutes while producing ideas nobody asked for. And it needs a genuinely open question with more than one reasonable answer; if there's an obviously correct response, the whole room converges on it in the silent minute and the pairs/fours rounds become a formality, which isn't a failure so much as a sign you didn't need the exercise at all.
