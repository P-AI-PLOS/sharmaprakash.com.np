---
title: "Min Specs in Reverse: Writing the Must-Not-Dos for a Test-Writing Agent"
date: "2021-06-17T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Shortest's agent could generate a passing test suite for any repo it was pointed at. The hard question wasn't what it should do — it was which four rules it could never break without destroying the trust the whole product runs on."
tags: [liberating-structures, shortest]
series: ls-design
seriesOrder: 3
use_featured_image: false
---

The demo was genuinely good. Point Shortest's agent at a repository, and forty minutes later there were ninety-one new tests, all green, covering routes that had never had a single assertion against them. The room applauded. Then one of our own engineers asked whether any of those tests would fail if you broke the code they covered, and the applause stopped, because nobody had checked.

That's the whole problem with a generative feature. The capability question — can it produce output — gets answered early and loudly. The question that decides whether anyone keeps using it is a set of constraints nobody has written down. So we ran **Min Specs** with the must-not-do half doing almost all the work.

## The structure

Max Specs first: every rule the group currently believes the thing must obey, positive and negative, listed without filtering. Then the elimination test on each one — *if we violated this rule, could we still achieve our purpose?* Yes eliminates it. What survives is the minimum rulebook.

Most write-ups lean on must-dos, because most workshops are scoping a feature. For anything generative — an agent, a recommender, an automated migration — flip the weight. The must-dos are few and obvious; the must-not-dos are where the product actually lives, and they never make it into a spec doc, so they get violated by accident in week three.

## Running it on the agent

The purpose took the room twenty minutes and two rewrites. We landed on: *an engineer merges the generated tests without reading all of them, and is not later embarrassed by that decision.* Deliberately uncomfortable. "High-quality generated tests" would have been unfalsifiable.

Max Specs produced twenty-six items across three walls. The elimination went like this.

**Must reach 80% line coverage.** Break it — ship a suite at 55%. Can an engineer still merge unread and not be embarrassed? Yes, easily; a small suite of tests that genuinely assert something is far less embarrassing than a large one that doesn't. Off the wall, and its removal took a lot of tension out of the room, because coverage had been quietly driving every other decision.

**Must support the four most common test runners.** Off — a market-reach rule, not a trust rule. **Must generate tests in the repo's existing style.** This one nearly survived on aesthetics. Broken: tests that look foreign but assert correctly. Embarrassing? Mildly. Purpose intact? Yes. Off, with a note.

**Must not produce a test that passes when the behaviour it covers is broken.** Break this and the purpose is annihilated in a single incident. Survived, and became the spec everything else got built around — it's the one that forced mutation-style verification into the pipeline before launch, where the agent perturbs the code under test and discards any generated test that doesn't notice.

**Must not assert on values it read from the current implementation without a stated reason.** This is the subtle sibling of the first one. A test that snapshots whatever the code currently returns is a test that will pass forever and catch nothing, and it's the single easiest thing for a generator to produce. Survived.

**Must not write a test that touches a network or a real datastore without labelling it.** Broken: the suite is green locally and flaky in CI, and the engineer who merged unread is now the person debugging it at 6pm. Survived.

**Must not silently skip what it couldn't figure out.** If the agent quietly declines to cover the three hardest routes in a service, the engineer's mental model — "this area is tested now" — is wrong in exactly the place it's most dangerous to be wrong. Survived, and became the output artifact I'm proudest of: a "did not attempt, and why" list at the end of every run.

Four min specs. One of them positive, three negative, and the coverage number that had dominated three months of planning didn't make it.

## Why the negative form is doing something different

A must-do tells you what to build. A must-not-do tells you what to *check*, which means it converts directly into an automated gate. Every one of our four turned into something in the pipeline: mutation verification, an assertion-provenance check, a network-access sandbox, an unattempted-work report. A spec doc full of must-dos produces a backlog. A short list of must-not-dos produces a test harness for your own feature.

The test also handles a specific failure mode of AI features: enthusiasm attaches to the impressive capability, and constraints feel like pessimism. Run them through a neutral procedure and nobody has to play the sceptic — the rule survives or it doesn't, and the group finds out together.

## When not to reach for it

Min Specs won't help if you haven't seen the thing behave yet. We could write "must not pass when the code is broken" because we'd watched it do exactly that in a demo. Before a first prototype exists, a max-specs wall is just a list of anxieties, and the elimination test has nothing real to bite on. Build the ugly version, watch it fail once, then run this.

And it doesn't rank the survivors. Three of our four were cheap; mutation verification was most of a quarter. Min Specs told us it was non-negotiable and had nothing to say about how to afford it — that argument still had to happen the ordinary way.
