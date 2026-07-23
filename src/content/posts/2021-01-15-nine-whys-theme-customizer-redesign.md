---
title: "Nine Whys: Checking a Redesign's Purpose Before You Draw a Single Screen"
date: "2021-01-15T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A theme-customizer redesign kickoff usually starts with wireframes. It should start with a blunt, repeated question — why does this matter — asked until the room either finds real conviction or discovers it was solving the wrong problem."
tags: [liberating-structures, polo-themes]
series: ls-discovery
seriesOrder: 3
use_featured_image: false
---

We had a kickoff deck ready to go for a theme-customizer redesign — new panel layout, live-preview improvements, a cleaner color-and-font picker — and everyone in the room could recite the plan. What nobody could do, when I asked cold, was finish the sentence "we're doing this because—" without trailing into something generic like "merchants have been asking for it." Merchants ask for a lot of things. That's not a purpose, it's a ticket count. So before a single screen got drawn, we spent forty minutes on **Nine Whys**, and the redesign that came out the other side wasn't the one in the deck.

## What it is and how it runs

Nine Whys comes from Liberating Structures and is deceptively simple: take a proposed action or project, and ask "why is this important?" — then take the answer and ask "why is *that* important?" — repeating up to nine times, or until the group hits genuine bedrock (a purpose nobody can further reduce, or a contradiction that reveals the original plan doesn't actually serve the purpose it claims to).

The canonical structure: pairs, not a plenary discussion. One person states the proposed initiative, the partner asks "why is that important?" three times running, writing down each answer. Then they **switch roles** and do the same in reverse — often surfacing a genuinely different chain, because the second person's honest answer isn't primed by having just heard the first person's. After both directions, pairs share back to the full group, and the facilitator looks for two things: convergence (several pairs bottoming out at the same root purpose, which is a strong signal it's real) and divergence (pairs bottoming out at *different* purposes, which usually means the room hasn't actually agreed on why the project exists — a far more useful thing to discover before development than after).

The "why" has to be answered honestly in the moment, not rehearsed from a strategy doc. Qua and Lipmanowicz's own guidance is blunt: if someone reaches for a canned corporate answer, push back — ask them to say it in their own words, as if to a curious child. That's usually where the real chain starts.

## Running it on the customizer redesign

I ran it with the PM, the designer, and two engineers, in pairs, using "we're redesigning the theme customizer" as the seed.

One pair's chain: *Why redesign it? → Because merchants abandon the customizer mid-session. → Why does that matter? → Because unfinished customization correlates with lower activation of paid themes. → Why does that matter? → Because activation is the leading signal for whether a merchant renews their theme subscription at all.* Three whys, and the "purpose" had quietly moved from "make the UI nicer" to "reduce customizer abandonment specifically at the step where merchants give up" — a much narrower, much more testable target.

The other pair's chain went somewhere genuinely different: *Why redesign it? → Because the color-and-font picker looks dated next to competitor themes. → Why does that matter? → Because it undermines trust that this is a modern, well-maintained platform. → Why does that matter? → Because merchants judge the whole theme's quality by the admin experience, not just the storefront.* Also a real purpose — but a *visual credibility* purpose, not an *abandonment* purpose, and it points at completely different fixes (visual polish vs. flow simplification).

That divergence was the actual finding. We'd walked into the kickoff assuming one shared "why," and Nine Whys proved in under an hour that we had two, pulling toward different redesigns. The wireframes in the original deck — a new panel layout and a cleaner picker — happened to serve the *visual credibility* chain reasonably well and did almost nothing for the *abandonment* chain, because nobody had gone and looked at *where* in the flow merchants actually dropped off. We tabled the deck, pulled the actual abandonment funnel data, and found the real drop-off wasn't in the color picker at all — it was at the live-preview load step, which took long enough on a slow connection that merchants assumed the tool had frozen. That's a performance and feedback-state fix, not a layout redesign, and it would not have surfaced from wireframing a prettier panel.

## Why the repetition matters more than the answer

The value of Nine Whys isn't the specific "why" chain any one pair produces — it's that repeated, unfakeable questioning is one of the few things that reliably breaks a team out of solving the *stated* problem instead of the *real* one. A single "why does this matter" gets a plausible-sounding answer almost every time. The second and third repetitions are where people run out of rehearsed answers and start improvising something true, which is either a genuine purpose or a visible dead end ("...I'm actually not sure why that matters, now that you ask").

For a product redesign specifically, this catches a failure mode that's extremely common and extremely expensive: a whole team agreeing a project is worth doing while quietly holding different, unstated theories of *why*, and discovering the mismatch only when the shipped feature doesn't move the metric anyone actually cared about.

## Failure modes and when to skip it

Nine Whys can turn into an interrogation if the facilitator lets one partner grill the other adversarially rather than genuinely curiously — the tone should be closer to a child's relentless "but why" than a cross-examination, and it's worth saying that out loud before starting. It also doesn't work well run solo or as a plenary discussion from the start; the pair structure and the switch-roles step are what surface divergent purposes, and a single big-group conversation just produces whatever answer the most senior voice gives first, with everyone else nodding along.

Skip it entirely when the purpose is already genuinely settled and documented — re-litigating a well-understood "why" on every project is its own kind of waste. And it's the wrong tool if the actual disagreement in the room is about *how* (implementation approach), not *why* (purpose) — Nine Whys will just confirm everyone agrees on the goal and tell you nothing about the technical disagreement still sitting underneath it.
