---
title: "Improv Prototyping: Acting Out the Worst Hour of a Theme Update"
date: "2021-06-20T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A theme update broke seven live storefronts on a Friday, and the postmortem produced a support runbook nobody believed in. So we put four people on their feet and made them play the merchant, the agent, and the update itself."
tags: [liberating-structures, polo-themes]
series: ls-design
seriesOrder: 4
use_featured_image: false
---

A minor version of one of Polo Themes' best-selling themes went out on a Friday afternoon and broke the product-grid layout on seven live storefronts. Seven isn't a catastrophe. The catastrophe was the ninety minutes that followed, in which one merchant emailed support, one opened a chat, one posted in a Facebook group, two rolled back on their own and left a one-star review about it, and the agent on shift sent three different explanations because the correct one hadn't been written yet.

The postmortem produced a runbook — detection, comms template, rollback instructions, escalation path — and I could tell within a day that nobody had internalised a word of it, because when I asked the agent who'd been on shift what she'd do differently, she described the old behaviour.

So the following week we did **Improv Prototyping**, which is the Liberating Structure that makes you act the thing out instead of documenting it.

## What it is and how it runs

Improv Prototyping is bodystorming with a time limit. Small groups get a challenge, take fifteen minutes to invent and rehearse a short skit that *enacts* their solution, then perform it in three to five minutes. The audience watches for what worked, and — the part people skip — a second round has groups incorporate what they saw in other skits.

The rules that matter: it has to be performed, not described. "And then the agent would send a status link" is a description; someone has to say the sentence to another human being's face and hear how it lands. Props should be terrible — a sticky note is an app screen, someone is the deploy pipeline. And skits enact a *solution*, not the problem; you're prototyping how it should go, not re-staging the disaster.

Two rounds fit in ninety minutes, and it works on anything whose design is really an interaction: support flows, onboarding, incident comms.

## Running it on the broken update

Three groups, one challenge: *the same bad update ships again. Act out the first hour, ending with a merchant who is still a customer.*

**Group one** cast the merchant as furious from the first line. Their agent tried to establish what had happened before saying anything reassuring — a standard support instinct — and you could watch the merchant's temperature climb through every clarifying question. From the outside the failure was obvious in a way it hadn't been in the postmortem: on a live storefront the merchant is losing money per minute, and diagnosis before stabilisation feels like being ignored. Their round-two fix was to lead with rollback: *I can put your store back to Friday's version right now, in about a minute — say the word and then we'll work out what happened.*

**Group two** played the merchant who had already rolled back herself and was writing the review — and their agent had nothing to say, because the runbook assumed a merchant asking for help rather than one who'd solved it and gone public. The silence made the point.

**Group three** changed the product rather than the process. Their first line wasn't a merchant contacting us at all — it was a merchant seeing a banner in the theme editor saying the update had been paused and her store was on the previous version. The whole skit was thirty seconds of someone reading a banner and going back to work. An audience member objected that we couldn't detect the breakage automatically; an engineer pointed out we could detect *the rollbacks* — three merchants rolling the same theme back inside an hour is a signal we already stored and had never looked at.

That became a real feature: an auto-pause on new installs of a theme version when rollbacks spike, plus the banner. The support changes shipped too — lead with rollback, one status page, a line for the merchant who's already fixed it herself — and this time the agent who'd been on shift didn't need a runbook, because she'd played the part twice.

## Why performing it beats documenting it

A written flow is evaluated by people reading it in a calm room, and a calm room can't feel timing. Skits expose timing constantly: the pause before an answer, the third clarifying question, the moment a merchant stops listening. You don't reason your way to "diagnosis before stabilisation reads as indifference" — you watch it happen to somebody's face. Performance also makes gaps physical: a person on stage with nothing to say is unmistakable evidence of a hole, where a document with a missing branch just looks finished.

And rehearsal is why the behaviour changes. The runbook asked people to recall a procedure under stress. The skits gave them a *practiced* first sentence, which is a different kind of memory.

## Where it goes wrong

The obvious failure is a room that won't play. If the first group is watched in silence by a senior person taking notes, the second and third will hedge. Go first yourself, badly, and keep feedback pointed at the *design* rather than the performance.

Skip it for problems with no human in them. A flaky deployment pipeline has no interaction to enact, and you'll get a skit where somebody plays a YAML file — funny once, and it teaches you nothing.

And treat skits as hypotheses, not evidence. Our two merchants were plausible because they came from a real incident; characters drawn from imagination will confirm whatever the room already believes about its users. If a skit turns up a claim about behaviour, check it against something real first — [Simple Ethnography](/product-management/simple-ethnography-first-time-theme-setup/) is the cheap way to do that.
