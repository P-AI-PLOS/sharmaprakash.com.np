---
title: "Impromptu Networking: Fifteen Minutes That Fixed a Twenty-Person Kickoff"
date: "2021-07-05T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A two-way email sync kickoff had twenty people in the room and about six of them talking. Three rounds of five-minute pairs on one repeated question got every voice into the project before the first slide."
tags: [liberating-structures, recap-crm]
series: ls-alignment
seriesOrder: 1
use_featured_image: false
---

The two-way email sync project at Recap CRM had a kickoff scheduled for ninety minutes and twenty invitees: engineers, a designer, three support reps, the sales engineer who'd been fielding "does it work with Outlook" for a year, and two people from the data team. I knew exactly how that meeting goes. The two most senior people talk for fifty minutes, four others ask questions, and fourteen people write notes they never use. Everyone leaves technically informed and personally uncommitted.

So we didn't open with the deck. We opened with fifteen minutes of **Impromptu Networking**, and by the time I put the first slide up, the room already knew more about the project's real risks than the slide did.

## What it is and how it runs

Impromptu Networking is the simplest structure in the Liberating Structures set and the one people are most tempted to skip. You give the group a single **invitation question**, everyone stands, finds a partner they don't normally work with, and each partner gets two to three minutes to answer it. Then you ring a bell, everyone finds a *new* partner, and answers the same question again. Three rounds, roughly fifteen minutes, no plenary and no flip chart.

The question is the whole design surface. It should be answerable only by that individual, phrased so the answer requires a stake rather than an opinion. "What do you hope to get out of this project, and what can you contribute to it?" is the canonical pairing: the hope makes it personal, the contribution makes it accountable.

The repetition isn't padding. Round one, people give the polite version they'd already prepared. Round two, having heard someone else's answer, they revise. Round three is where the real answer arrives — sharpened by two rehearsals and by the quiet evidence that other people are being honest too.

## Running it before the email sync kickoff

My invitation question: **"What's the one thing about email sync you're worried we'll get wrong, and what can you personally do about it?"**

Round one produced reasonable, generic worries about scope and timelines. Round two started shifting. By round three I was standing near the window listening to a support rep tell a backend engineer that her actual fear was that sync would surface every historical email onto contact records — including ones reps had sent to prospects who later became customers' competitors — and that she had three ticket threads from the last CRM migration proving people care about that far more than product teams expect.

That was not on my slide. My slide said "risks: provider rate limits, OAuth token refresh, threading."

Two other things surfaced. The sales engineer, paired with a mobile developer, said out loud for the first time that half his enterprise conversations died on "can we exclude a mailbox from sync" — which turned a scheduled fast-follow into a launch blocker. And a data engineer admitted her worry was that nobody had told her sync would triple the write volume on the activity table, which she'd learned that morning from a Jira ticket.

When we moved into the kickoff proper, three people who would have sat silent for ninety minutes had already said their piece to two colleagues each. They spoke up in the plenary — not because I called on them, but because they'd said the words once and found the room didn't fall over.

We restructured the milestone plan that afternoon. Mailbox-level exclusion moved into phase one. A privacy review, unscoped until then, got added, because the support rep's worry was a legal question wearing a support-ticket costume.

## Why the rounds do the work

The mechanic is that Impromptu Networking converts a broadcast into a set of conversations, and conversations have a property broadcasts don't: everyone talks. In a twenty-person room, airtime is zero-sum and distributed by status and confidence. In a pair, it's fifty-fifty by arithmetic. Three rounds means every person spoke for six to nine minutes — more than any of them would have gotten in the entire ninety-minute session.

The partner-switching matters as much as the pairing. New partner, same question, means each person hears three genuinely different answers, and understanding of the project diffuses horizontally instead of vertically. By round three the support rep's worry had reached six people without me repeating it once.

It also warms a room in a way icebreakers don't, because it isn't one — the content is the actual work. Nobody has to name a favorite animal to earn permission to speak.

## When to skip it

Skip it when the group is small enough that everyone will speak anyway. Six people around a table need a decent question and someone to stop the loudest person taking two turns, not pairs. Skip it, too, when you can't write a question that requires a personal stake — if the invitation is answerable by reading the project brief aloud, the rounds produce fifteen minutes of polite paraphrase.

And be honest about what it isn't. Impromptu Networking surfaces stakes and worries; it doesn't resolve, prioritize, or decide anything. If you run it and then don't visibly change the plan in response, you've taught twenty people the pairing was theatre — and next time you ask a room to stand up, you'll get the round-one answer three times running.
