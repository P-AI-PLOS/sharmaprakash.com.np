---
title: "Integrated~Autonomy: Ending the Standardize-Then-Fragment Pendulum"
date: "2021-09-24T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Shortest had swung between one mandated test runner and squad-by-squad freedom twice in three years. Integrated~Autonomy refused to run the vote a third time and asked a different question: what would let us be more standardized and more autonomous at once?"
tags: [liberating-structures, shortest]
series: ls-culture
seriesOrder: 8
use_featured_image: false
---

Shortest had this argument every eighteen months, and the argument always had the same shape. Someone would demonstrate that four squads maintaining four test-runner configurations was costing us a week a quarter in duplicated CI debugging, so we'd standardize on one. Within a year, two squads would have legitimate needs the standard didn't serve — the mobile squad's device matrix, the data squad's long-running fixtures — and they'd fork, quietly at first. Then someone would demonstrate that we had four configurations again.

Two full cycles of that. The third time it came up, I ran **Integrated~Autonomy** instead of the decision meeting.

## What the structure does

Integrated~Autonomy is built for exactly this: a tension that keeps being treated as a choice when it's actually a permanent pair. The move is to stop asking "should we centralize or decentralize?" and start asking what each side genuinely gives us, then generate actions that increase both at once.

It runs in about ninety minutes:

1. **Name the tension as a pair**, with a tilde, not a slash — *integrated ~ autonomous*. The tilde matters typographically and conceptually: it's not "versus," it's "and, in tension."
2. **1-2-4-All on the first pole:** what do we get, concretely, when this is more integrated? What breaks when it isn't?
3. **1-2-4-All on the second pole:** same two questions for autonomy.
4. **Generate both/and moves** — actions that would raise both at the same time — again through 1-2-4-All.
5. **Sort and commit** to a small number of them, and name what you'll watch to notice the pendulum starting to swing again.

Step four is the one that feels impossible for the first ten minutes and then produces most of the value.

## Running it on the test runner

The integration list was unsurprising and quantified: one CI configuration to debug, one upgrade path when the runner ships a breaking change, engineers moving between squads without relearning tooling, one flake dashboard that actually aggregates. The mobile squad's own lead wrote most of the strongest items on it, which was itself informative — nobody was arguing for chaos.

The autonomy list was better than I expected. Not "we like our own thing," but specifics: the data squad needed fixtures that live for forty minutes and the standard runner's timeout model couldn't express that; the mobile squad needed to shard by device rather than by file; and one squad's genuinely better snapshot-testing approach had emerged precisely because they weren't constrained. That last item is the argument standardization advocates always forget — the standard you'd mandate today was somebody's local deviation two years ago.

The both/and generation produced four candidates. The one we committed to: a thin shared runner *contract* rather than a shared runner *config*. Squads own their configuration file, but it must satisfy a contract — emit results in one schema, expose the same three CLI verbs, publish flake data to the shared dashboard. Anything above the contract is squad business. Anything below it is platform business, upgraded centrally.

The second commitment mattered as much: a documented path for a squad deviation to be *promoted* to the contract. The snapshot approach went through it four months later. That path is what makes the arrangement stable instead of just being a nicer-sounding standard — deviation stops being defection and becomes the mechanism by which the standard improves.

We also named the pendulum tripwire: if more than two squads are out of contract compliance for a full quarter, that's not a discipline problem, it's a signal the contract is wrong.

## Why the "and" framing changes the output

Framed as a decision, this question has two answers and one of them loses, which guarantees the losers spend the next year working around the outcome — that's the pendulum's engine. Framed as a paradox, it has no losing side, and the room's energy goes into designing a mechanism rather than winning a vote.

The specific thing that gets unlocked is layering. Almost every both/and answer to a centralize-versus-decentralize question turns out to be "find the layer where integration genuinely pays and leave the layers above it free." You cannot find that layer while arguing about the whole stack as one object. Forcing the two benefit lists to be written separately and concretely is what exposes where the value actually sits — it was never in a shared config file, it was in a shared results schema.

## Where it fails

It fails when one pole is a fig leaf. If leadership has already decided to centralize and is running the workshop to make the decision feel participatory, the group will produce both/and ideas that get quietly discarded, and you'll have spent ninety minutes teaching people not to trust the next workshop. Only run this when both poles are actually live.

It also fails on tensions that genuinely are either/or. Some choices are exclusive — one billing system or two, one legal entity or two — and pretending otherwise produces mush. The test I use: can you name a layer or a boundary at which the two could coexist? If nobody in the room can, even vaguely, it's a decision, not a paradox, and it deserves a decision structure instead.

And don't skip the tripwire. A both/and design without a named signal for "this is drifting" just extends the pendulum's period from eighteen months to thirty.
