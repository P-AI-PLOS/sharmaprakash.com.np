---
title: "Conversation Cafe: Sitting With Bad News Before Trying to Fix It"
date: "2021-07-12T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "We shipped a test generator that wrote four hundred wrong assertions into customer repos. The instinct was an action plan by lunch. What the team needed first was a talking piece and four rounds of nobody being allowed to interrupt."
tags: [liberating-structures, shortest]
series: ls-alignment
seriesOrder: 3
use_featured_image: false
---

The Shortest generator release went out on a Tuesday and by Thursday we knew: for repositories using a particular async test helper, the model had been writing assertions against a promise object rather than its resolved value. The tests passed. They passed because they asserted almost nothing. Roughly four hundred generated tests across thirty-one customer repositories, sitting in main branches, green, and worthless.

My calendar invite said "incident review" and I nearly ran it that way — timeline, root cause, action items, done by lunch. What stopped me was noticing that underneath the technical thread, four people had said some version of "I don't know if I trust the generator anymore," and nobody had responded to any of them. Root-cause analysis bulldozes over that and leaves you with a fixed bug and a team that quietly stops recommending its own product.

So the first half of that session was **Conversation Cafe**.

## What it is and how it runs

Conversation Cafe is Liberating Structures' format for making sense of something unsettling — a shock, a bad quarter, an incident — *before* jumping to what to do about it. Its premise is that groups facing disruption skip the sense-making step and pay for it later.

Groups of five to seven sit at a table with a **talking object**. Four rounds: the object goes around the circle and each person speaks once, uninterrupted; it goes around again, now responding to what they've heard; then it sits in the middle for open conversation, available to anyone wanting uninterrupted space; then a final circuit of takeaways.

Roughly 45 to 90 minutes. The facilitator states the agreements and then largely shuts up: suspend judgment, listen to understand, speak from your own experience, let the object govern the floor.

## Running it after the assertion incident

Twelve of us, two tables of six, each mixing engineering with the support people who'd been fielding customer messages since Wednesday. Invitation prompt: **"What does this incident mean for how we think about the generator?"** Deliberately not "what went wrong," and deliberately not "what should we do."

Round one was technical and slightly defensive — the failure mode was subtle, the helper is unusual, our eval suite didn't cover it. Predictable.

Round two turned it. Our newest engineer, holding the mug, said she'd been uneasy for two months about the fact that we measure generated tests by whether they pass — and that a passing test is the one signal a broken generator will always produce. She said it slowly and completely, and because the mug was in her hand the two senior engineers who'd normally have finished her sentence had to sit with it for ninety seconds. When she stopped, one of them said his first honest thing of the day: he'd raised something similar in a March design review, been talked out of it, and hadn't pushed.

The open round produced the sentence the session existed to produce, from one of the support people: "Customers aren't angry that the tests were wrong. They're angry that we told them they didn't have to read them." That's a positioning problem, not an incident, and no timeline reconstruction would have surfaced it.

We ran the incident review the next morning and it was better for having waited. Mutation testing on generated output went onto the roadmap as a real project. The copy leaning on "generated tests you can trust" got rewritten. The eval-suite gap got fixed too — the one thing the original agenda would have caught.

## Why the talking object earns its keep

Passing an object around a table looks like theatre until you watch what it prevents. In a room processing bad news, three dynamics fire automatically: the most senior person frames the situation first and everyone calibrates to that frame; anyone expressing doubt gets immediately reassured, which is socially kind and epistemically fatal; and the fastest talkers convert reaction speed into apparent consensus.

The object breaks all three. It enforces a full circuit before anyone gets a second turn, so the junior voice speaks *before* the senior frame hardens. It makes reassurance structurally impossible during the first two rounds. And it converts airtime from a competition into a rotation.

Round two is the mechanic I'd defend hardest. Most structured discussions do one pass and move to open discussion, which means every contribution is a pre-formed opinion. The second pass is where people respond to having listened — and where the March confession came from.

## When not to use it

Don't use it when you need a decision by end of day. Conversation Cafe deliberately does not converge: no vote, no ranking, no output beyond shared understanding. Run it before a decision structure, not instead of one. Don't use it for routine work either — the weight is calibrated to disruption, and on a normal sprint review it reads as self-important.

And don't run it on a topic where the outcome is already decided and unannounced. If leadership has made the call and the session exists to help people accept it, a talking object doesn't make that honest — it makes the dishonesty last ninety minutes instead of ten. People notice, and next time you set a mug on a table they'll know exactly what it's for.
