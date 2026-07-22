---
title: "Drawing Together: The Deal Handoff Sales and Support Each Thought Was Simple"
date: "2021-04-06T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Sales called the handoff to the account team 'basically automatic.' Support called it 'basically manual.' Both were describing the same feature. Drawing it out, silently and separately, was the only way to see that they weren't disagreeing about facts — they were describing two different halves of one broken process."
tags: [liberating-structures, recap-crm]
series: ls-ideation
seriesOrder: 7
use_featured_image: false
---

I first used [Drawing Together to untangle a theme-customization journey](/product-management/drawing-together-what-the-theme-customization-journey-actually-looks-like/) where three team members had three different mental pictures of the same merchant flow. This time the setting was a CRM product's handoff process — the moment a deal moves from sales having closed it to the account or support team taking over delivery — and what the drawings revealed wasn't three competing shapes of one journey. It was two teams each drawing an accurate picture of *their own half* of the process, with a gap between the two drawings that neither team had ever seen because neither had ever looked at the other's picture before.

## The structure, briefly

Drawing Together asks participants to render a process or journey as a picture instead of describing it in words, individually and in silence first, because speech lets ambiguity hide in a way drawing doesn't — you can say "then it gets handed off" without specifying what that means, but you can't draw it without committing to an actual mechanism. After individual silent drawing, small groups share their pictures one at a time without interruption, then explicitly name where the drawings agree and where they diverge. The [earlier post in this series](/product-management/drawing-together-what-the-theme-customization-journey-actually-looks-like/) covers full mechanics; this post is about what the technique reveals when the divergence isn't inside one team's head but *across an organizational seam*.

## Why a cross-functional handoff is a special case

The theme-customization exercise had three people from arguably the same functional world — product, engineering, support — all reasoning about the same merchant-facing flow, just from different vantage points. A sales-to-support handoff is structurally different: the two halves of the drawing are quite literally owned by different teams with different incentives, different tools, and — critically — no shared moment where either team watches the *other* team's part of the process happen. A salesperson closes a deal and moves to the next one; they never see what happens to it next. A support or account person receives a deal already closed; they never see what happened to produce the state it arrives in. Each side has an accurate picture of their own half and a guess, often wrong, about the other's.

## The two drawings

I ran the exercise with four sales reps and four account-team members in the room, split so that the small groups mixed both functions rather than clustering by team. The prompt: "Draw what happens to a deal from the moment it's marked closed-won to the moment the customer is fully set up and working with the account team."

The sales reps' drawings were short and clean: mark the deal closed-won, the CRM auto-generates a handoff record, done. From the sales side, that genuinely is the whole process — the system does produce an automatic handoff record the instant a deal closes, and salespeople have no visibility into anything that happens after that record is created, so from their vantage point "handoff" really is a one-step, automatic, essentially instantaneous event. Their drawings weren't wrong; they were a complete and accurate rendering of everything visible from where they stand.

The account-team members' drawings were long, looping, and full of manual steps: receive the auto-generated handoff record, which is frequently missing fields the account team actually needs — technical requirements, specific promises made during the sales cycle, the names of additional stakeholders mentioned in calls but never logged as contacts. Go back to Slack or email to ask the sales rep directly for the missing context, often waiting a day or more for a reply because the rep has already moved on to new deals. Reconstruct a real onboarding plan by hand from that scattered context. Only then actually start onboarding the customer. From the account team's vantage point, "handoff" is a multi-day, largely manual reconstruction process, and their drawings were an equally complete and accurate rendering of everything visible from where *they* stand.

## What became visible only once both drawings were on the table

Neither team was describing a different journey out of confusion — each was describing a different, correct half of one journey, and the exercise's value was purely in making both halves visible to both teams simultaneously, which had literally never happened before in that organization. The sales reps, seeing the account team's looping, multi-day drawing for the first time, were visibly startled — several said they'd genuinely believed the automatic handoff record contained everything the account team needed, because nothing in their own tooling ever told them otherwise. The account team, seeing the sales reps' one-step drawing, understood for the first time why the handoff record was so consistently thin: it wasn't laziness or corner-cutting, it was that the CRM's automatic record only ever captured whatever had been entered into structured fields during the sales process, and salespeople had no prompt, no incentive, and often no idea that specific verbal promises or stakeholder names needed to be captured anywhere beyond their own memory of the call.

The gap between the two drawings *was* the feature to build: a structured handoff-context capture step, prompted at the moment a deal is marked closed-won, that asks the closing rep for exactly the handful of things the account team's drawing showed them reconstructing by hand every time — technical requirements, promises made, additional stakeholders. Not a new tool for either team to learn from scratch, just a short, mandatory step inserted at the exact seam the two drawings had shown was invisible to one side and painful to the other.

## Why this needed drawing instead of a joint retro

A joint retro with both teams describing the handoff verbally would very likely have produced the same defensive dynamic that had presumably already happened informally between these two teams before — account team saying "handoffs are always incomplete," sales hearing that as a complaint about their diligence, sales responding "the system generates the handoff automatically, that's not on us," and the conversation stalling into blame rather than diagnosis. Drawing sidesteps this because nobody is being asked to defend their process verbally in the moment — they're just rendering what they individually experience, and the account team's drawing wasn't received as an accusation because it was presented as a picture of *their own* experience, not a critique of the sales team's effort. The blame-free framing made it possible for the sales reps to react with genuine surprise rather than defensiveness, which is the emotional state that actually produces a fix instead of a truce.

## Failure modes and when to skip it

This exercise depends on genuinely mixed small groups — if sales reps and account-team members cluster separately during the small-group sharing step, each side just reinforces its own drawing's assumptions rather than encountering the other's, and the whole point of the exercise is lost. Assign groups deliberately rather than letting people self-select by team.

It's also weaker when one side of the handoff genuinely has no visibility into the other's half at all, rather than partial or assumed visibility — if the account team literally cannot describe what happens on the sales side because they've never been told anything about it, their drawing will just be blank or a guess, and the exercise produces less useful signal than a short cross-team shadowing session would first. In that case, have a few people spend half a day actually observing the other team's half of the process before running Drawing Together — it gives both sides enough real material to draw from.
