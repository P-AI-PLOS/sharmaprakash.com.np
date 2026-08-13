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

The new runner infrastructure at Shortest had been built over four months, dogfooded on our own repositories since May, and reviewed in three separate design sessions. Migrating every customer onto it was scheduled to start in two weeks. The plan document was in its fifth revision and had, at that point, been read carefully by eleven people.

Which is exactly the condition under which nobody says anything useful. A plan that has survived three reviews acquires a kind of institutional momentum, and the social cost of raising a fresh objection scales with how much scrutiny the plan has already had — "didn't you have four months to mention this?" is a real thing people fear, and it silences the late realizations, which are frequently the good ones.

I had thirty minutes at the top of the migration kickoff. I gave twelve of them to **Mad Tea**.

## The structure

Two concentric circles, inner facing outer, everyone paired with the person opposite. The facilitator reads a sentence stem. Both partners complete it in fifteen to thirty seconds — no discussion, no follow-ups, no debate. Circles rotate one or two positions. New partner, next stem. Nine or ten stems, twelve to fifteen minutes, done.

Nothing is written down. Nobody reports back. There's no synthesis step, no dot voting, no output. The entire deliverable is what people heard while standing in the circle, including the facilitator, who should be participating rather than observing.

The stems are the design work and they're worth an evening. Short, open, and permitting an uncomfortable answer. A stem that can be completed with the party line is a wasted stem.

## Running it before the migration kickoff

Eleven of us — engineering, the two support people who'd handle migration tickets, and the solutions engineer. My stems:

1. What I'm most confident about in this migration is…
2. The thing I'd bet money goes wrong is…
3. Something I noticed and didn't mention is…
4. The customer I'm most worried about is…
5. What I still don't understand is…
6. If this slips a month, the reason will be…
7. What I'd want to know on day one of the rollout is…
8. The part of the old system I'll actually miss is…
9. What I need from this group is…

Stem three is the one I write into every Mad Tea now. "Something I noticed and didn't mention" is a socially safe container for the observation someone has been sitting on — it presupposes that not mentioning things is normal, which it is, and removes the implied accusation from raising it late.

It produced the finding of the session. One engineer said — I heard it directly, being his partner for that rotation — that during dogfooding he'd noticed the new runner reports test durations differently, measuring from container start rather than from first test execution. Our own repos didn't care. But we expose duration in the customer-facing dashboard, and about forty customers have alerting rules built on it. Migrating them would fire every one of those alerts simultaneously with no explanation.

He hadn't mentioned it because it had seemed like a detail in May and had become progressively more awkward to raise as the plan hardened. That is a completely ordinary human sequence and it's the exact failure mode stem three exists for.

Stem four gave me the other one. Three people independently named the same customer — a large account running Shortest inside an air-gapped CI environment, whose setup nobody had actually verified against the new runner because the dogfooding environment couldn't reproduce it. The plan said "migrate in wave one, low risk." Three people in the room privately disagreed and none of them had put it in a review comment.

Stem eight, which I'd included mostly for tone, turned out to be diagnostic: two people said they'd miss being able to SSH into a stuck runner, which is a debugging capability the new architecture removes deliberately. Not a blocker, but it explained a low-grade reluctance I'd been sensing for weeks without being able to name.

We added a duration-metric compatibility shim, moved the air-gapped account from wave one to wave three with a manual verification step, and shipped a log-streaming endpoint to partly replace the SSH workflow. All three came out of twelve minutes that produced no notes.

## Why it beats asking for comments on a doc

A document review invites a considered response, and a considered response is filtered through how it will look. Late objections look like inattention. Small observations look like nitpicking. Uncertainty looks like not having read carefully. All three filters are strongest exactly when a plan has been reviewed a lot — which is when the remaining problems are subtlest.

Mad Tea removes every one of those filters by removing the record. You're saying a sentence to one colleague, for thirty seconds, and then rotating away from it. There's no comment thread, nothing attributed, nothing to defend. The duration-metric observation cost that engineer nothing to say in that format and would have cost him something real to write in a review comment on revision five.

The pace enforces it. Thirty seconds is enough to say a true thing and not enough to soften it into uselessness.

And the repetition is the analysis. I wasn't taking notes; I was listening for the same thing twice. The air-gapped account came up three times in one rotation. That's a stronger signal than any single comment on a plan doc, and it arrived in ninety seconds.

## Where it doesn't fit

It doesn't fit when you need a decision, an owner, or a written record — nothing survives the session except what people remember, and that's deliberate.

It doesn't fit for heavy material. The tempo makes serious distress feel skated over. Use a talking-object structure when the topic is a loss or a shock.

It doesn't fit if you're not going to act. Naming what you heard, immediately and out loud, is the obligation you take on by running it. Say "I heard the duration metric three times and the air-gapped account three times, let's start there" — or don't run it, because a room that says the true thing and watches it evaporate will not say it again.

And it doesn't fit remote unless your tooling reshuffles pairs in seconds. I've run it on video with automatic breakout rooms and it works; I've also run it on a tool where each rotation took a minute and a half, and by stem four we'd lost the tempo that makes the whole thing honest.
