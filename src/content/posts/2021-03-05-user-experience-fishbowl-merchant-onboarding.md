---
title: "User Experience Fishbowl: The Whole Team Watches a Merchant Onboard, Live"
date: "2021-03-05T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "One usability tester and a highlight reel afterward wasn't landing. Putting a real merchant's onboarding session in a fishbowl, with the whole team silently watching live, made the friction impossible to argue away."
tags: [liberating-structures, polo-themes]
series: ls-discovery
seriesOrder: 17
use_featured_image: false
---

We'd been sending out usability-test highlight reels for months — a research lead's carefully edited video of a merchant struggling through onboarding, three minutes, key moments flagged. And every time, the reaction in the room was some version of "sure, but that one merchant probably just wasn't very technical" or "did you see her hesitate there, that's more about her computer than our UI." A recorded highlight reel is easy to argue with after the fact, because it's mediated — someone chose what to include, and everyone watching knows it. **User Experience Fishbowl** solves that specific problem by removing the mediation: the whole team watches a real session live, unedited, in real time, sitting in a literal or figurative fishbowl arrangement where the watching itself is part of the structure.

## What it is and how it runs

A Fishbowl arranges a room in two concentric circles. The inner circle holds the actual participants in a live activity — in our case, one merchant going through onboarding, guided by a single facilitator, with maybe an empty chair for anyone in the outer circle who wants to rotate in briefly. The outer circle holds observers, silent by strict rule, who watch the entire thing unfold live and take their own notes without any editing, curation, or narration standing between them and what actually happened.

Liberating Structures' User Experience Fishbowl variant applies this directly to user research: a real user does a real task inside the fishbowl, live, while the whole team watches from the outer ring, and — critically — a structured debrief immediately follows where observers share what they personally saw, not what a report told them to conclude. The debrief typically starts by having several outer-circle observers each name one specific, concrete moment they noticed, before opening into broader discussion — which mirrors the observation/interpretation discipline of Simple Ethnography, but does it as a shared, simultaneous team experience rather than one researcher's solo fieldwork.

## Running it on merchant onboarding

We recruited a real prospective merchant, new to the platform, and ran her actual onboarding session live, with the whole product and design team — twelve people — arranged in an outer circle, headphones on, strictly silent, watching her screen share and hearing her think aloud in real time. No highlight reel, no pre-selected clips. Whatever happened, happened in front of everyone at once.

The moment that changed the room happened about six minutes in. She reached the step where the platform recommends a theme based on her stated product category (accessories) and paused, visibly uncertain, then said out loud — unprompted, because she'd been asked to think aloud — "I don't actually know if 'minimalist' or 'bold' matches what I'm picturing, these words don't mean anything to me yet." She sat with that uncertainty for nearly ninety seconds, scrolling between two theme previews, before picking one somewhat arbitrarily. Because twelve people watched that exact ninety seconds live, in real time, with no editing, nobody in the debrief could dismiss it as an outlier or blame her technical skill — the whole room had felt the same suspended, uncertain ninety seconds she had, simultaneously.

That shared, synchronous discomfort is not something a highlight reel produces, even an honest one. A clip of "she paused for 90 seconds" read from a report is an abstract fact; watching the actual ninety seconds unfold live, in real time, with no fast-forward available, put the whole team through the same waiting the merchant experienced, and several people in the debrief specifically named that discomfort — "I wanted to jump in and help her, and I physically couldn't" — as the thing that made the finding land differently than any prior research summary had.

## What the debrief surfaced

Going around the outer circle, several people had independently noticed the same six-minute mark, which is itself a strong signal — a moment several trained observers converge on unprompted is more trustworthy than one researcher's single interpretation. But the debrief also surfaced complementary details different observers had caught: one designer noticed she'd hovered over a small "not sure, show me examples" link near the theme labels without clicking it, suggesting the affordance existed but wasn't compelling enough to actually use in the moment of uncertainty. An engineer noticed she'd opened a second tab afterward — a competitor's storefront — seemingly to check what "bold" looked like in a live example, exactly the pattern we'd separately observed in [the Simple Ethnography session on first-time theme setup](/product-management/simple-ethnography-first-time-theme-setup/), now confirmed independently by a completely different merchant and a completely different observation method.

The concrete change: theme-style labels ("minimalist," "bold," "playful") got paired with a live, real thumbnail preview of an actual store using that style, replacing the abstract adjective-only choice, and the existing "not sure, show me examples" link got redesigned as a default-visible comparison view rather than an easy-to-miss secondary link — directly targeting the affordance the engineer had noticed being hovered over and not used.

## Why watching together beats watching a summary

The core mechanism Fishbowl exploits is that shared, synchronous, unmediated experience produces a kind of consensus a report can't — everyone in the room lived through the same ninety seconds of uncertainty at the same time, which forecloses the "maybe that one user was just atypical" objection that killed momentum on every prior highlight-reel presentation. It also produces richer debriefs, because twelve simultaneous observers each catch different specific details (the hover, the second tab, the pause) that no single researcher, however good, would catch alone and include in an edited three-minute reel.

## Failure modes and when to skip it

The silence rule in the outer circle is not optional and is the hardest part to enforce — someone in the outer ring wanting to jump in and help, or whispering a reaction to a neighbor, breaks the format's core value, because it either changes the participant's behavior (if audible) or dilutes the shared, undivided attention that makes the debrief so effective. Brief the outer circle explicitly and firmly beforehand.

It's also a heavier ask on people's time than a recorded session — twelve people watching one live merchant session in real time is twelve people's simultaneous attention, which is expensive and shouldn't be the default research method for every routine test. Reserve it for moments where a team has genuinely failed to internalize a finding through normal channels, or where a decision is contentious enough that shared, undeniable, lived evidence is worth the cost of the room. And it still depends on a single real participant's session being reasonably representative — treat what the fishbowl surfaces as a strong, vividly-evidenced hypothesis, not proof, and validate patterns that seem important across more than one live session before treating them as settled.
