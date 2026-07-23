---
title: "Drawing Together: What the Theme-Customization Journey Actually Looks Like"
date: "2021-04-02T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Ask a room to describe a merchant's customization journey in words and everyone nods along to a vague consensus. Ask them to draw it, silently and simultaneously, and you discover that half the room pictures a completely different shape of journey than the other half."
tags: [liberating-structures, polo-themes]
series: ls-ideation
seriesOrder: 6
use_featured_image: false
---

Nobody in the room objected when I asked them to describe, in words, how a merchant customizes a storefront theme. Everyone nodded along to a reasonably coherent-sounding summary. Then I handed out paper and asked them to draw it instead, alone, without talking, and within ninety seconds it was obvious the verbal consensus had been an illusion — four people drew four visibly different journeys, and none of the differences had come up once in the verbal discussion that preceded it.

That gap between what a room says and what a room draws is exactly what **Drawing Together** exists to expose.

## What it is

Drawing Together is a Liberating Structures technique built on a simple observation: words are a lossy, sequential medium that lets ambiguity hide, while pictures force spatial and relational commitments that words can dodge. When you say "the merchant customizes the theme and then goes live," you haven't specified whether that's one linear pass or six iterative loops, whether "the theme" is one screen or fifteen, or whether "goes live" is a single button or a multi-step review gate — and in speech, nobody notices the gap because everyone silently fills it with their own mental picture. Ask people to actually draw that mental picture, and the gaps become visible to everyone at once, including the person who'd been talking fluently about a process they'd never actually had to render concretely.

## How it runs

1. **Pose the journey or system to be drawn**, stated as neutrally and concretely as possible — here, "draw a merchant's experience customizing a theme, from opening the customizer for the first time to their storefront going live."
2. **Individual silent drawing (5–7 minutes).** No talking, no peeking at neighbors' paper yet. Simple shapes, arrows, stick figures — nobody needs artistic skill, and saying so up front matters, because "I can't draw" is the single most common objection and it's irrelevant to the exercise's actual purpose.
3. **Small-group sharing (10–15 minutes).** Groups of three or four show their drawings to each other and narrate them, one person at a time, while the others simply listen and look — no interrupting, no "well actually." The goal here is surfacing difference, not resolving it yet.
4. **Identify points of convergence and divergence.** As a group, mark where the drawings agree (these are the shared, load-bearing beliefs about the journey) and where they genuinely differ (these are the places the team has been talking past each other without knowing it).
5. **Optional: draw a shared version.** Once divergence points are named, the small group can attempt one collaborative drawing that either reconciles the difference or explicitly marks it as an open question for later.

Forty-five minutes for a room of eight to twelve people, and the value is almost entirely front-loaded into step 3 — the moment four individual drawings hit the table side by side and the room realizes it never actually agreed on the shape of the thing it's been discussing for months.

## Applying it: the polo themes customization journey

The team here builds storefront themes for Shopify merchants, and the workshop context was a redesign of the theme customizer — the tool merchants use to configure colors, layout, sections, and content before their storefront goes live. Everyone on the team had opinions about what needed fixing, and every planning meeting for the past two sprints had circled the same unresolved arguments about scope without anyone quite understanding why consensus kept dissolving.

The silent drawing round made the disagreement's shape visible in a way the meetings hadn't. The designer drew a journey that was almost entirely linear and front-loaded: a merchant opens the customizer once, works through a guided sequence of major decisions — layout, then color palette, then typography, then section content — in that order, and publishes at the end. A single pass, start to finish, like assembling furniture from an instruction booklet.

The engineer who'd been building the section-reordering feature drew something completely different: a messy, looping journey with the merchant returning to the customizer repeatedly over several days, making one small change, previewing it live on the actual storefront, leaving to check something else — inventory, a marketing email, a competitor's site — and coming back to adjust again. No clear beginning-to-end sequence at all, just repeated short visits.

The support lead drew a third shape entirely: a journey that branched hard partway through, where a meaningful fraction of merchants got stuck at one specific decision — choosing between two visually similar layout templates — and either abandoned there or filed a support ticket asking which one to pick, with the rest of the journey never happening until that branch resolved.

None of these three drawings contradicted the others factually — they were each true of some real merchants. But the redesign conversations up to that point had each implicitly assumed *one* of these three shapes as "the journey," without anyone stating which, which explained the recurring, never-quite-resolved arguments: the designer's guided-linear-flow proposal made complete sense if you believed the linear picture and looked baffling if you were holding the looping picture in your head, and vice versa for the engineer's flexible, resumable-session proposal.

## What the shared drawing produced

Once the divergence was named explicitly — "we've been assuming three different shapes of this journey and never said so" — the small group's collaborative redraw didn't try to force one shape to win. It drew all three as real, coexisting patterns: a **first-time linear pass** for merchants doing initial setup, a **returning, looping pattern** for merchants doing ongoing refinement after launch, and a **branch-and-stall pattern** at the layout-template decision specifically. That reframed the redesign brief from "which journey shape should the customizer support" — a false binary the team had been unknowingly arguing — to "the customizer needs to serve a first-time linear flow well, support low-friction re-entry for the looping pattern, and specifically fix the layout-template decision point before anything else, since it's where the branch-and-stall pattern was costing real conversions." All three perspectives ended up in the plan, correctly weighted, instead of one winning an argument nobody had realized was actually about three different, equally true things.

## Why drawing surfaced this and discussion hadn't

Verbal descriptions of a process default to whatever level of abstraction is convenient for the speaker in the moment, and abstraction is exactly where disagreement hides — "the merchant customizes the theme" is compatible with all three of the drawn journeys, so saying it out loud never forces anyone to specify which one they mean. A drawing has no equivalent escape hatch: you cannot draw "the merchant customizes the theme" without committing to whether that's one pass or many, whether it's continuous or interrupted, where the arrows loop back. The medium forces the specificity that speech lets everyone avoid, and it does so without confrontation — nobody has to say "I think you're wrong about the journey," they just quietly notice their own drawing looks nothing like their neighbor's.

## Failure modes and when to skip it

Drawing Together fails if the facilitator lets the room narrate verbally *while* drawing instead of enforcing silence first — talking during the drawing phase recreates the exact verbal-consensus-hides-difference problem the exercise exists to avoid, because people start unconsciously adjusting their drawing to match what they're hearing a neighbor describe.

It's the wrong tool for journeys that are genuinely simple and already agreed on — running it on a process everyone already draws identically just burns forty-five minutes confirming what a two-minute conversation would have. And it struggles in fully remote settings without a shared, simultaneously-editable canvas; if half the room is sketching on paper and half is trying to verbally describe their sketch over a call, the asymmetry re-introduces exactly the ambiguity the exercise is meant to eliminate. Use a shared virtual whiteboard with individual, visually separated drawing areas if the workshop can't be in person.
