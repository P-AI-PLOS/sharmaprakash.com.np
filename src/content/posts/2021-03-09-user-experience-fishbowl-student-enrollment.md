---
title: "User Experience Fishbowl: Watching a Student Enroll, Together, Live"
date: "2021-03-09T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The engineering team had never seen a real student enroll in a course before. Putting that first enrollment in front of them, live and unedited, surfaced a checkout-flow assumption nobody had ever actually tested."
tags: [liberating-structures, course-guru]
series: ls-discovery
seriesOrder: 18
use_featured_image: false
---

Most of our engineering team had built the enrollment and lesson-start flow without ever watching a real student go through it — they'd tested their own accounts, on staging, with test data, which tells you whether the code path works but nothing about whether a genuinely new student, encountering the flow cold, experiences it the way the team assumes. We'd talked for a quarter about running "more research," which had quietly become a euphemism for a PM occasionally sharing a summary in a planning doc. What actually moved things was a **User Experience Fishbowl**: one real student's first enrollment, live, with the engineering team watching directly rather than reading about it later.

## The structure

A Fishbowl seats the live activity — here, one student, guided by a facilitator, doing a real first-time enrollment and starting the first lesson — in an inner circle, and seats everyone else, silent, in an outer ring, watching the whole thing unfold in real time with no editing or summarizing in between. The debrief that follows is structured to start from concrete, specific observations before opening into interpretation, which keeps the discussion anchored to what actually happened rather than drifting immediately into abstract debate.

The reason this format specifically suits an engineering team unfamiliar with live user research is that it requires nothing from the observers except attention and silence — no research training, no note-taking discipline beyond "what did you notice" — which makes it accessible to a room that's never done a formal usability session before, while still producing a debrief with real, specific, shared material to work from.

## What happened in the fishbowl

We recruited a genuine first-time student — someone who'd purchased a beginner photography course through a merchant's storefront but hadn't started it yet — and ran her actual enrollment and first-lesson-start live, screen-shared, with eight engineers and two PMs in the outer circle.

The checkout-to-first-lesson flow had been built on an assumption, never explicitly stated but clearly embedded in the code: that a student who'd just paid would move directly and eagerly into lesson one. What the room watched instead: after checkout confirmation, she sat for a moment, then typed into the browser's address bar rather than clicking the "Start Course" button on the confirmation screen — she was looking, she said aloud, for her order receipt, wanting to check that the charge matched what she expected before doing anything else. The confirmation screen, as built, had buried the receipt/order-summary link below the large, prominent "Start Course" call-to-action, on the assumption nobody would want it first. She scrolled down, found it, read it for close to thirty seconds, then scrolled back up and finally clicked "Start Course."

That thirty-second detour, watched live by the whole engineering team rather than described in a report, produced an immediate and unusually candid reaction in the debrief: one of the engineers who'd built that exact confirmation screen said, plainly, "I genuinely didn't think anyone would care about the receipt before starting — I'd have deprioritized that link forever if you'd just told me in a doc." Watching it happen, live, in front of the whole team, changed that engineer's mind in real time in a way no research summary had managed on three prior occasions when the same underlying pattern had been reported.

The debrief also surfaced a second, smaller thing several outer-circle observers named independently: once she did reach lesson one, she paused again, this time to check whether the lesson would auto-save her progress if she left partway through — a concern she voiced aloud, unprompted, before actually starting to watch. Nothing in the UI told her one way or the other. That's a confidence signal, not a friction point exactly, but a gap several people in the room flagged as worth closing regardless.

## What changed

The confirmation screen got restructured — order summary and receipt link promoted to equal visual weight with "Start Course," rather than a secondary link beneath it — directly addressing the exact behavior the room had watched happen live. A small, persistent "progress saved automatically" indicator was added to the lesson player, addressing the second, independently-noticed concern about auto-save confidence.

Neither change was large. What was large was how fast they moved from "watched happen" to "shipped" — both landed within the same sprint, championed by engineers who'd been in the room for the live moment rather than assigned the fix from a backlog ticket written by someone else. That's the specific dividend of the format: the person who has to actually agree a fix matters enough to prioritize was in the room for the exact thirty seconds that made the case, rather than being asked to trust someone else's account of it.

## Why live-with-engineers beats research-summary-to-engineers

The gap Fishbowl closes here isn't really about what information gets conveyed — a good written report could have described the receipt-checking pause reasonably accurately. The gap is about *belief and ownership*. An engineer reading "27% of users check their receipt before starting" in a report can reasonably discount it, wonder about methodology, or simply not internalize it emotionally enough to reprioritize their own backlog around it. An engineer who watched, live, an actual real student pause specifically because the thing they'd built made her worry whether her payment went through — that's a much harder thing to argue away, because it happened in front of them, unedited, in real time, and the discomfort of watching someone hesitate because of your own design choice is a genuinely different experience than reading a percentage.

## Failure modes and when to skip it

The engineering team's inexperience with live research cuts both ways — it makes the shared experience land powerfully (as it did here), but it also means the facilitator needs to brief the silence rule extra clearly beforehand, since engineers unfamiliar with usability observation norms are more likely to instinctively want to jump in and explain or fix something in the moment. Set the ground rules explicitly, and consider a very short "what not to do" briefing before the session starts.

It's also worth being honest that a single live session, however vivid, is still one student's behavior — the receipt-checking pause and the auto-save concern are strong, well-evidenced hypotheses now, not proven patterns across the whole student base, and it's worth validating that other students show the same behavior before treating either fix as fully settled rather than a good first bet. And Fishbowl is a heavier-weight tool than routine testing needs — save it for moments where a team has genuinely failed to internalize research through lighter channels, not as the default format for every incremental usability check.
