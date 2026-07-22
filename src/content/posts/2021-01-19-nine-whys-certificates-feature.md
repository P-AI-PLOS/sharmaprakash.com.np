---
title: "Nine Whys on a Certificates Feature: When 'Instructors Asked For It' Isn't a Reason"
date: "2021-01-19T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Course completion certificates sound obviously good — until Nine Whys forces you to say, out loud and three times running, who they're actually for. The answer changes what you build."
tags: [liberating-structures, course-guru]
series: ls-discovery
seriesOrder: 4
use_featured_image: false
---

Certificates was one of those roadmap items that had survived four prioritization cycles without anyone seriously questioning it. Instructors wanted it, it sounded cheap to build (a PDF, a template, a completion trigger), and "add certificates" had been sitting near the top of the backlog long enough that it had acquired a kind of institutional inevitability. Nobody had asked, in three whys' worth of depth, what a certificate is actually *for* on a Shopify-embedded course platform where the merchant, not us, owns the relationship with the learner. I ran **Nine Whys** with the team the week before we were supposed to scope it, expecting a formality. It wasn't.

## The structure

Nine Whys pairs people up and has them interrogate a single proposed action with the question "why is that important?" — up to nine times, or until the chain bottoms out at bedrock or contradiction. Critically, it's run in **both directions**: the initiator states the project, the partner asks why three times and records the answers, then the two switch roles and run it again with the partner now the one asking themselves. That reversal matters because the second pass, run by a different person's honest instinct rather than an echo of the first pass, is where hidden disagreement tends to surface.

After both directions, the group reconvenes and pairs read back their chains. The facilitator's job is to listen for whether independent pairs bottom out at the *same* root purpose (a strong signal the initiative is real and well-understood) or at *visibly different* purposes (a strong signal the team is about to build one feature to serve two different, unreconciled goals).

## Running it on certificates

Two pairs, seeded with "we're adding course completion certificates."

**Pair one's chain:** *Why certificates? → Because instructors have asked for a way to formally mark course completion. → Why does that matter to them? → Because a certificate gives learners a tangible reason to finish, not just start. → Why does that matter? → Because completion rate is the number instructors point to when justifying the course's price to their own customers.* Three whys deep, and the purpose had moved from "instructors want it" (not really a reason) to "certificates are a completion-rate lever that instructors can point to as proof of value" — a specific, testable claim about learner motivation and instructor sales enablement, not a generic feature request.

**Pair two's chain went somewhere the first pair hadn't touched at all:** *Why certificates? → Because some course categories (safety training, compliance-adjacent content) need a completion record that a learner can actually show someone else — an employer, a licensing body. → Why does that matter? → Because for those learners, the certificate isn't a nice-to-have nudge, it's the entire point of taking the course. → Why does that matter? → Because if the certificate isn't credible-looking and verifiable, the course has no real value to that learner regardless of how good the content is.*

That's a fundamentally different feature. Pair one's purpose implies a lightweight, motivational artifact — nice design, maybe a shareable image for social proof, low stakes if it's slightly generic. Pair two's purpose implies something that needs a verification mechanism (a unique ID, maybe a lookup page), because a certificate nobody can validate is worthless to exactly the learners who need it most. The original scoping doc had assumed pair one's version — a shareable PDF, done in a sprint — and would have shipped something actively useless to the compliance-training merchants, who are a smaller but higher-value segment of Course Guru's customer base.

## What changed after the session

We didn't abandon the lightweight version — pair one's purpose was real too, and most course categories genuinely are motivational, not compliance-driven. But Nine Whys turned a single undifferentiated "certificates" backlog item into two: a default motivational certificate (shareable, branded, cheap) available to every course, and an opt-in verifiable certificate (unique ID, public lookup page, more rigorous data capture on completion) for merchants running the kind of course where a learner needs to prove something to a third party. That second version was a genuinely bigger build, and it would have been silently underbuilt — shipped looking like a real credential while working like a party favor — if the two purposes had never been forced apart.

The other thing the session surfaced, almost as a side effect: nobody in either chain landed on "because it increases course *sales*," which is the reason the feature had been implicitly pitched to leadership as revenue-positive. That gap between the internal justification and what the people actually building it believed the feature was for is worth catching before, not after, the feature ships and doesn't move the number it was sold against.

## Why forcing the answer three times, not once, matters

A single "why" question gets you the pitch-deck answer — the one everyone's already agreed to say. The value of Nine Whys is specifically in the *third* repetition, when the rehearsed answer runs out and people have to improvise something they actually believe. "Instructors asked for it" survives one why. It rarely survives three, because the honest continuation — *why does giving instructors what they asked for matter* — forces someone to name a mechanism (completion rate, credibility, retention) rather than just cite demand. Demand tells you a feature might be worth building; a mechanism tells you what "done" looks like and how you'd know if it worked.

## Failure modes and when to skip it

The most common way Nine Whys goes wrong on a feature like this is letting the "why" chain drift from purpose into implementation — "why certificates → because we need a PDF generator" is not a why, it's a how, and the facilitator has to redirect firmly or the exercise collapses into solutioning before the purpose is even settled.

It's also not useful when a feature genuinely has no ambiguity left in it — running Nine Whys on something the team has already deeply internalized just burns a meeting confirming what everyone already knew, and people notice when a "discovery" exercise is theater. And be honest about scope: Nine Whys surfaces *why*, not *whether* — it won't tell you if certificates are worth building at all relative to everything else on the roadmap, only what "certificates," once you build them, actually needs to be for each purpose it's serving. Pair it with real prioritization, not instead of it.
