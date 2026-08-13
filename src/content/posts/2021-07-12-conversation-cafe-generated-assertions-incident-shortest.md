---
title: "Conversation Cafe: Sitting With Bad News Before Trying to Fix It"
date: "2021-07-12T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "We shipped a test generator that wrote four hundred wrong assertions into customer repos. The instinct was an action plan by lunch. What the team actually needed first was a talking piece and four rounds of nobody being allowed to interrupt."
tags: [liberating-structures, shortest]
series: ls-alignment
seriesOrder: 3
use_featured_image: false
---

The Shortest generator release went out on a Tuesday and by Thursday we knew: for repositories using a particular async test helper, the model had been confidently writing assertions against a promise object rather than its resolved value. The tests passed. They passed because they asserted almost nothing. Roughly four hundred generated tests across thirty-one customer repositories, sitting in main branches, green, and worthless.

The engineering channel had been going since 7am and the tone was somewhere between forensic and funereal. My calendar invite for that afternoon said "incident review" and I nearly ran it that way — timeline, root cause, action items, done by lunch. What stopped me was rereading the thread and noticing that under the technical discussion, four different people had said some version of "I don't know if I trust the generator anymore," and nobody had responded to any of them. That's not a root-cause question. Root-cause analysis will happily bulldoze right over it and leave you with a fixed bug and a team that quietly stops recommending its own product.

So the first half of that session was **Conversation Cafe**.

## What it is and how it runs

Conversation Cafe is Liberating Structures' format for making sense of something unsettling — a shock, a bad quarter, a strategic reversal, an incident — *before* jumping to what to do about it. It's designed by Vicki Robin and Habib Rose and adapted into the LS set, and its whole premise is that groups facing disruption skip the sense-making step and pay for it later.

Groups of five to seven sit at a "table." Each table has a **talking object** — a marker, a mug, anything passable. Four rounds:

1. **First round of talk**: the talking object goes around the circle. Whoever holds it speaks, uninterrupted; everyone else listens. One pass, everyone speaks once, no cross-talk.
2. **Second round**: the object goes around again — now people say what they're thinking *after having heard everyone*. Still no interruption.
3. **Open conversation**: the object goes to the middle of the table and the group talks freely, but anyone may pick it up to claim uninterrupted space.
4. **Final round**: the object goes around one last time. Each person says, briefly, what they're taking away.

Roughly 45 to 90 minutes for the full sequence. The facilitator states the agreements at the top and then largely shuts up: suspend judgment, listen to understand, speak from your own experience, go for depth over breadth, let the object govern the floor.

## Running it after the assertion incident

Twelve of us, two tables of six, each mixing engineering with the two support people who'd been fielding customer messages since Wednesday. Invitation prompt: **"What does this incident mean for how we think about the generator?"** Deliberately not "what went wrong" and deliberately not "what should we do."

Round one, on my table, was mostly technical and slightly defensive — the failure mode was subtle, the helper is unusual, our eval suite genuinely didn't cover it. Fine. Predictable.

Round two is where it turned. Our newest engineer, holding the mug, said she'd been uneasy for two months about the fact that we measure generated tests by whether they pass, and that a passing test is the one signal a broken generator will always produce. She said it slowly, badly, and completely — and because the mug was in her hand, the two senior engineers who would normally have finished her sentence for her had to sit with it for ninety seconds. When she'd finished, one of them said his first honest thing of the day, which was that he'd raised something similar in a design review in March, been talked out of it, and hadn't pushed.

The open round produced the sentence the whole session existed to produce, from one of the support people: "Customers aren't angry that the tests were wrong. They're angry that we told them they didn't have to read them." That is a product-positioning problem, not an incident. No timeline reconstruction would have surfaced it.

We ran the actual incident review the next morning, and it was better for having waited. Mutation testing on generated output went onto the roadmap as a real project rather than an action item. The product copy that had leaned on "generated tests you can trust" got rewritten. And the eval-suite gap got fixed, which is the only thing the original agenda would have caught.

## Why the talking object earns its keep

Passing an object around a table looks like theatre until you watch what it prevents. In a room processing bad news, three dynamics fire automatically: the most senior person frames the situation first and everyone else calibrates to that frame; anyone expressing doubt gets immediately reassured, which is socially kind and epistemically fatal; and the fastest talkers convert their reaction speed into apparent consensus.

The object breaks all three. It enforces a full circuit before anyone gets a second turn, so the junior voice speaks *before* the senior frame hardens. It makes reassurance structurally impossible during rounds one and two — you can't rush to comfort someone when you can't speak. And it converts airtime from a competition into a rotation.

Round two is the specific mechanic I'd defend hardest. Most structured discussions do one pass and move to open discussion, which means everyone's contribution is their pre-formed opinion. The second pass is where people respond to having listened, and it's where the March design review confession came from.

## When not to use it

Don't use it when you actually need a decision by end of day. Conversation Cafe deliberately does not converge — there's no vote, no ranking, no output artifact beyond shared understanding. Run it before a decision structure, not instead of one.

Don't use it for good news or routine work. The format's weight is calibrated to disruption; run it on a normal sprint review and it feels self-important.

And don't run it on a topic where the outcome is already decided and unannounced. If leadership has made the call and this session is meant to help people accept it, a talking object doesn't make that honest — it makes the dishonesty last ninety minutes instead of ten. People notice, and the next time you set a mug on a table they'll know exactly what it's for.
