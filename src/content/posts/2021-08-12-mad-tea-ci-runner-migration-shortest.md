---
title: "Mad Tea: Nine Sentence Stems Before a Migration Nobody Wanted to Question"
date: "2021-08-12T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Moving every customer onto the new test-runner infrastructure had been decided months earlier and reviewed to death. Twelve minutes of rotating pairs found the two things the review had missed."
tags: [liberating-structures, shortest]
series: ls-alignment
seriesOrder: 12
use_featured_image: false
---

The new runner infrastructure at Shortest had been built over four months, dogfooded on our own repositories since May, and reviewed in three design sessions. Migrating every customer onto it was scheduled to start in two weeks. The plan document was in its fifth revision and had been read carefully by eleven people.

Which is exactly the condition under which nobody says anything useful. A plan that has survived three reviews acquires momentum, and the social cost of raising a fresh objection scales with how much scrutiny it has already had. "Didn't you have four months to mention this?" is a real fear, and it silences the late realizations — frequently the good ones.

I had thirty minutes at the top of the migration kickoff. I gave twelve of them to **Mad Tea**.

## The structure

Two concentric circles, inner facing outer, everyone paired with the person opposite. The facilitator reads a sentence stem. Both partners complete it in fifteen to thirty seconds — no discussion, no follow-ups, no debate. Circles rotate a position or two. New partner, next stem. Nine or ten stems, twelve to fifteen minutes, done.

Nothing is written down and nobody reports back; the deliverable is what people heard while standing in the circle. The stems are the design work — short, open, and permitting an uncomfortable answer. A stem that can be completed with the party line is a wasted stem.

## Running it before the migration kickoff

Twelve of us — engineering, the two support people who'd handle migration tickets, and the solutions engineer. Twelve pairs cleanly into two circles of six, and I paired in rather than standing outside: a facilitator hovering with a notepad kills the format. Odd numbers are the case to plan for — form a trio, or read the stems and stay out of the rotation.

My stems:

1. What I'm most confident about in this migration is…
2. The thing I'd bet money goes wrong is…
3. Something I noticed and didn't mention is…
4. The customer I'm most worried about is…
5. What I still don't understand is…
6. If this slips a month, the reason will be…
7. What I'd want to know on day one of the rollout is…
8. The part of the old system I'll actually miss is…
9. What I need from this group is…

Stem three is the one I now write into every Mad Tea. "Something I noticed and didn't mention" is a safe container for the observation someone has been sitting on — it presupposes that not mentioning things is normal, which it is.

It produced the finding of the session. One engineer — my partner for that rotation — said that during dogfooding he'd noticed the new runner reports test durations from container start rather than first test execution. Our own repos didn't care. But we expose duration in the customer-facing dashboard, and about forty customers have alerting rules built on it. Migrating them would fire every one of those alerts at once. He hadn't mentioned it because it seemed like a detail in May and grew more awkward to raise as the plan hardened.

Stem four gave me the other one. Three people independently named the same customer — a large account running Shortest inside an air-gapped CI environment, whose setup nobody had verified because dogfooding couldn't reproduce it. The plan said "migrate in wave one, low risk." Three people privately disagreed and none had said so in a review comment.

We added a duration-metric compatibility shim and moved the air-gapped account to wave three with a manual verification step — both from twelve minutes that produced no notes.

## Why it beats asking for comments on a doc

A document review invites a considered response, and a considered response is filtered through how it will look. Late objections look like inattention. Small observations look like nitpicking. Uncertainty looks like not having read carefully. All three filters are strongest when a plan has been reviewed a lot — which is when the remaining problems are subtlest.

Mad Tea removes those filters by removing the record. You say a sentence to one colleague for thirty seconds, then rotate away from it. Nothing is attributed and nothing has to be defended. The duration-metric observation cost the engineer nothing to say in that format and would have cost him something real in a comment on revision five.

And the repetition is the analysis. I wasn't taking notes; I was listening for the same thing twice.

## Where it doesn't fit

It doesn't fit when you need a decision, an owner, or a written record — nothing survives except what people remember. It doesn't fit heavy material either; the tempo makes serious distress feel skated over, so use a talking-object structure when the topic is a loss or a shock.

It doesn't fit if you're not going to act. Naming what you heard, immediately and out loud, is the obligation you take on by running it — a room that says the true thing and watches it evaporate will not say it again.

And it doesn't fit remote unless your tooling reshuffles pairs in seconds. I've run it where each rotation took ninety seconds, and by stem four we'd lost the tempo that makes it honest.
