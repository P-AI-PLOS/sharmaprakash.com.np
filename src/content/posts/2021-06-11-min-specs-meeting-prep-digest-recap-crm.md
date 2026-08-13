---
title: "Min Specs: Cutting a Meeting-Prep Digest Down to Its Two Real Rules"
date: "2021-06-11T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The spec for Recap CRM's pre-meeting Prep Card had seventeen requirements and a six-week estimate. Min Specs asks one brutal question of each line — can we still hit the purpose if we break this rule? — and left us with three."
tags: [liberating-structures, recap-crm]
series: ls-design
seriesOrder: 1
use_featured_image: false
---

The spec for the Prep Card — the little brief Recap CRM was going to surface before every calendar meeting — ran to seventeen bullet points and a six-week estimate. Company news pulled from an enrichment API. Last five emails. Open deals with stage and value. Mutual connections. A relationship-health score. Notes from the previous meeting. Attendee job-title changes since last contact. Every one of those bullets had a name attached to it, and every name could defend their bullet for two minutes. That's how a card becomes a dashboard.

I didn't want to argue seventeen bullets on their merits. I wanted to find out how few of them the feature could survive on. That's **Min Specs**, and it took forty minutes.

## What it is and how it runs

Min Specs is the Liberating Structure for finding the smallest set of rules that still gets you the outcome. It runs in two movements.

First, **Max Specs**: the group lists everything it currently believes it must do — and must not do — to succeed. Don't filter. The point is to get the whole implicit rulebook onto the wall, including the rules nobody has said out loud but everyone is obeying.

Then the **elimination test**, applied to every single item in turn: *if we violated this rule, could we still achieve our purpose?* If the honest answer is yes, the rule comes off the wall. Not "is this nice to have" — that question gets you nowhere, because everything is nice to have. The question is whether the purpose survives its absence. Anything that survives elimination is a min spec: genuinely load-bearing.

Two things make or break the session. The purpose has to be written down and agreed first, in one sentence, because the entire test is relative to it. And the facilitator has to hold the line on the wording, because groups drift within a minute to "but it would be worse without it." Worse isn't the test. Failed is the test.

## Running it on the Prep Card

We wrote the purpose first, and that took longer than I expected: *a founder walks into a call already knowing the last thing that happened with this person and the one thing they promised to do.* Not "be well prepared." Not "have context." That specific.

Max Specs took eight minutes and produced twenty-three items — more than the spec doc had, because the unwritten rules came out too: "must load before the meeting starts," "must not require the founder to open a second tab." Then we ran the test down the list.

**Company news from the enrichment API.** Could we hit the purpose without it? Yes, obviously — a funding announcement isn't the last thing that happened between these two people. Off the wall. It had been in the spec because a competitor's card had it.

**Relationship-health score.** Yes, and worse — someone pointed out mid-elimination that a score is a summary of the exact facts the card already shows. A compression of the payload, not a part of it. Off. **Mutual connections, attendee title changes, open-deal values**: all off, in about ninety seconds each.

**Last interaction, verbatim, with its date.** Break this rule and the founder does not know the last thing that happened. Stays.

**Open commitments — anything the founder said they'd do, unresolved.** Break it and the second half of the purpose is gone. Stays.

Then the one that surprised the room: **must not show anything the founder would have to verify before trusting it.** A card that might be stale is a card you check against the real record — which means you've opened the second tab, which means the card did nothing. Kept as a must-not.

Three specs. Two must-dos, one must-not-do. Everything else became a maybe-later list that, a quarter on, we'd built exactly none of.

## Why the elimination test does the work

Prioritisation asks people to rank things they all want, and ranking is a social negotiation — the strongest advocate wins, and the card grows. Min Specs asks a question with a factual answer relative to a purpose everyone signed, so the elimination isn't a defeat for whoever proposed the item. Nobody lost the enrichment-API argument, because there was no argument; the rule simply didn't survive a test we'd all agreed to run.

The must-not-do half is the underrated part. Most specs are lists of things to build, and the constraints that actually determine whether a feature works — don't make them verify it, don't make them leave the call view — never get written down, so they get violated quietly during implementation.

## When to skip it

Min Specs needs a purpose sharp enough to falsify a rule. If the best the room can do is "improve the meeting experience," every spec survives elimination and you've spent an hour confirming the original document. Do the purpose work first — [Nine Whys](/product-management/nine-whys-theme-customizer-redesign/) is a decent front-end for exactly that.

It's also the wrong tool where the specs aren't yours to negotiate. Compliance requirements, contractual commitments, and accessibility floors don't get eliminated because a group decided the purpose survives without them, and running the exercise over them teaches the team a habit you'll regret. Fence those off before you start, name them as fixed constraints, and run Min Specs on the genuinely discretionary rules that are left.
