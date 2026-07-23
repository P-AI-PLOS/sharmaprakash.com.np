---
title: "Liberating Structures for Product Teams: The 33-Structure Field Guide"
date: "2021-01-05T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Most feature workshops run on three formats — open discussion, status report, managed presentation — and all three systematically hand the room to the loudest three people. Liberating Structures is a set of 33 alternatives with names like Troika Consulting and 1-2-4-All, and once you see what each one actually does differently, you can't run a workshop the old way again."
tags: [liberating-structures]
use_featured_image: false
---

Sit in on enough feature-development workshops and you start to notice they all run on the same three formats, dressed up differently. There's **open discussion** — someone poses a question, whoever's fastest and most senior answers first, and the group either agrees with them or goes quiet. There's the **status report** — a person or two talks for most of the hour while everyone else listens, or pretends to. And there's the **managed presentation** — slides, a facilitator with an agenda, a Q&A slot at the end that three people use. All three share a structural defect: they concentrate participation in a small number of people and let everyone else opt out, and none of them make that defect visible, because a quiet room looks exactly like an aligned one.

Henri Lipmanowicz and Keith McCandless spent years cataloging the alternative. Their book, *The Surprising Power of Liberating Structures*, documents 33 microstructures — small, precise changes to how a group interacts, each defined by five elements they call the "TAPS+P": how much **time**, what **arrangement of space**, what **participation pattern**, what **sequence of steps**, and what **prompt** starts it off. Change those five levers and you change who talks, in what order, and to whom — which turns out to be most of what determines whether a workshop produces real signal or just confirms whatever the loudest person in the room already believed.

The name is a claim, not a slogan: these structures **liberate** the structure that's already governing your meetings, whether you designed it or not. Every meeting has a TAPS+P — "twelve people, one screen, whoever unmutes first, an hour, 'thoughts?'" is a structure, just a bad one. Liberating Structures doesn't add facilitation overhead to a structure-free meeting; it swaps a default structure that concentrates power for one engineered to distribute it.

## Why this maps onto feature-development work specifically

Feature workshops have a particular failure mode that generic meeting advice doesn't address: the person who understands the problem best is rarely the person most comfortable talking first. The support lead who's fielded forty tickets about a broken flow, the engineer who knows exactly why the "simple" fix isn't, the newest PM who hasn't yet learned which opinions are safe to voice — in an open-discussion format, all three lose to the person with the most confidence and the least new information. The workshop produces consensus, but it's consensus among people who already agreed, reached faster because the room didn't waste time hearing anyone else.

Liberating Structures fixes this with a mechanism, not an exhortation. **1-2-4-All** doesn't ask people to speak up — it makes silence structurally impossible for the first minute (everyone thinks alone), then structurally low-stakes for the next two (you only have to convince one other person), and only exposes an idea to the full group once it's already been pressure-tested twice. **Troika Consulting** doesn't ask a stuck person to be vulnerable in front of twelve people — it puts them in a triad of three, where the format itself removes advice-giving as an option until the seeker has finished explaining. The structures work because they change what's mechanically possible in the room, which is a stronger lever than asking people to behave differently inside an unchanged room.

This series takes all 33 structures and applies each one, concretely, to a feature-development problem on one of five products: a CRM, an AI-native QA and testing tool, an HR leave and PTO tool, a Shopify and Next.js e-commerce storefront theme, and a Shopify-embedded LMS. Not "here's the structure, imagine a use" — an actual workshop moment, an actual problem on an actual roadmap, run through an actual structure, canonically facilitated. The 81 posts are organized into seven families, each answering a different question a feature team asks.

## The seven families

**[Discovery & Root Cause](/series/ls-discovery/)** answers "what's actually going on, and why." This is the largest family — nineteen structures — because most feature work goes wrong at this stage: teams build the fix for the symptom a stakeholder described instead of the cause a five-minute conversation would have surfaced. **Troika Consulting** turns a stuck problem-owner into the center of a fast, structured peer-consulting triad. **Nine Whys** forces a purpose statement through nine rounds of "why does that matter" until you hit something that isn't circular. **Discovery & Action Dialogue** and **Simple Ethnography** get you out of the conference room and into where the work or the friction actually happens — a taste of this: watching a support team actually process a CRM lead by hand, before anyone writes a spec for automating it, surfaces steps nobody would have listed from memory.

**[Ideation & Possibility](/series/ls-ideation/)** answers "what could we build," once the problem is real. **1-2-4-All** is the workhorse here — silent thinking, pair, quad, full group — and it alone replaces most brainstorm-by-shouting sessions. **TRIZ** inverts the question ("how would we guarantee this feature fails?") to surface the assumptions everyone's too polite to name directly. Applied to a Shopify theme's checkout redesign, a TRIZ round about "how do we guarantee cart abandonment" reliably produces a sharper list of real risks than a straight "what should checkout look like" session ever does.

**[Prioritization & Decisions](/series/ls-decide/)** answers "what do we do first, and how sure are we." **Agreement-Certainty Matrix** sorts problems into simple, complicated, complex, and chaotic before anyone picks a solution approach — a leave-balance tool's "how do we handle overlapping team PTO requests" question lands somewhere very different on that matrix than a first read suggests. **Ecocycle Planning** and **Panarchy** map which features are in their creative-destruction phase and should be sunset, not iterated on.

**[Design & Prototyping](/series/ls-design/)** answers "how do we shape a solution cheaply, before we build it for real." **Min Specs** separates the few rules a feature must follow from everything that's actually negotiable — for an LMS's course-completion certificate feature, that split alone kills a week of premature debate about certificate design. **Improv Prototyping** gets a team physically acting out a workflow with props before a line of code exists.

**[Alignment & Relating](/series/ls-alignment/)** answers "how does this group actually trust and understand each other," which most roadmaps assume rather than build. **Impromptu Networking** and **Heard, Seen, Respected** create the interpersonal groundwork that makes the harder structures — the ones that ask people to disagree in public — actually safe to run.

**[Retrospectives & Improvement](/series/ls-retro/)** answers "what do we do differently next time." **What, So What, Now What?** is a three-question arc that turns a shipped feature into an actual lesson instead of a vague "went fine" in a retro doc. **15% Solutions** keeps the output realistic by asking only what's within someone's discretion and resources right now.

**[Culture, Change & Adoption](/series/ls-culture/)** answers "how does a new practice spread past the room it started in." **Purpose-to-Practice** and **Shift & Share** are how a workshop technique — or a QA tool's new testing pattern — moves from "the thing one team tried" to "how we work."

## How to actually use this series

Each post in each series stands alone: the structure, exactly how it runs (group sizes, timing, roles, the steps as canonically facilitated), a concrete application to that series' product, and the failure modes that tell you when to skip it. You don't need to read a family in order, and you don't need all 33 structures to get value — most teams get most of the benefit from a working fluency in six or seven, used deliberately instead of defaulting to open discussion every time. Start wherever your current workshop pain is loudest. If your last three feature reviews were dominated by the same two voices, start with 1-2-4-All. If your last retro produced nothing anyone acted on, start with What, So What, Now What?. The structures don't require buy-in from the whole org to try — most of them work run by one facilitator with one team, in one hour, and the difference shows up in that first hour.

## Further reading

- [Liberating Structures](https://www.liberatingstructures.com/) — the official menu of all 33 structures, with step-by-step instructions for each.
- Henri Lipmanowicz and Keith McCandless, [*The Surprising Power of Liberating Structures*](https://www.amazon.com/s?k=surprising+power+of+liberating+structures+lipmanowicz+mccandless) — the source book.
