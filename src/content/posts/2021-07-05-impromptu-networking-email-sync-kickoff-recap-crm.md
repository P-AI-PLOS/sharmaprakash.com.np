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

The two-way email sync project at Recap CRM had a kickoff scheduled for ninety minutes and twenty invitees: four backend engineers, two mobile, a designer, three support reps, the sales engineer who'd been fielding "does it work with Outlook" for a year, two people from the data team, and assorted leads. I'd run this shape of meeting before and I knew exactly how it goes. The two most senior people talk for fifty minutes, four other people ask questions, and fourteen people write notes they never use. Everyone leaves technically informed and personally uncommitted.

So we didn't open with the deck. We opened with fifteen minutes of **Impromptu Networking**, and by the time I put the first slide up, the room already knew more about the project's real risks than the slide did.

## What it is and how it runs

Impromptu Networking is the simplest structure in the Liberating Structures set and one of the hardest to resist skipping. You give the group a single **invitation question**, people stand up, find a partner they don't normally work with, and each partner gets two to three minutes to answer it. Then you ring a bell, everyone finds a *new* partner, and answers the same question again. Three rounds, roughly fifteen minutes total, no plenary, no flip chart, no facilitator commentary in between.

The question is the whole design surface. It should be personal and concrete — something only that individual can answer, phrased so the answer requires a stake rather than an opinion. "What do you hope to get out of this project, and what can you contribute to it?" is the canonical pairing, and the two halves matter equally: the hope makes it personal, the contribution makes it accountable.

The repetition is not padding. Round one, people say the polite version they'd already prepared. Round two, having heard someone else's answer, they revise. Round three is usually where the real answer arrives, sharpened by two rehearsals and by the quiet social evidence that other people are being honest too.

## Running it before the email sync kickoff

My invitation question was: **"What's the one thing about email sync you're worried we'll get wrong, and what can you personally do about it?"**

Round one produced what you'd expect — reasonable, slightly generic worries about scope and timelines. Round two started shifting. By round three I was standing near the window listening to a support rep tell a backend engineer that her actual fear was that sync would surface every historical email onto contact records, including the ones reps had sent to prospects who later became customers' competitors, and that she had three ticket threads from the last CRM migration to prove people care about that a lot more than product teams expect.

That was not on my slide. My slide said "risks: provider rate limits, OAuth token refresh, threading."

Two other things surfaced in those fifteen minutes. The sales engineer, paired with a mobile developer, said out loud for the first time that half his enterprise conversations died on "can we exclude a mailbox from sync," which reframed a feature we'd scheduled as a fast-follow into a launch blocker. And one of the data engineers admitted her worry was that nobody had told her sync would triple the write volume on the activity table, which she'd found out that morning from a Jira ticket.

When we moved into the actual kickoff, three people who would have sat silent for ninety minutes had already said their piece to two colleagues each. They spoke up in the plenary discussion afterward — not because I called on them, but because they'd already said the words once and found the room didn't fall over.

We restructured the milestone plan that afternoon. Mailbox-level exclusion moved into phase one. A privacy review, which nobody had scoped, got added because the support rep's worry was a real legal question wearing a support-ticket costume. Fifteen minutes of pairs, and the plan we left with was materially different from the plan I walked in holding.

## Why the rounds do the work

The mechanic here is that Impromptu Networking converts a broadcast into a set of conversations, and conversations have a property broadcasts don't: everyone talks. In a twenty-person room, airtime is a zero-sum resource distributed by status and confidence. In a pair, it's distributed fifty-fifty by force of arithmetic. Three rounds means every person spoke for six to nine minutes and listened for the same — more speaking time than any of them would have gotten in the entire ninety-minute session.

The partner-switching matters as much as the pairing. New partner, same question, means each person hears three genuinely different answers, and the room's understanding of the project diffuses horizontally instead of vertically. By round three the support rep's worry had reached six people without me ever repeating it, because the pairs kept referencing what they'd just heard.

It also warms a room in a way icebreakers don't, because it isn't an icebreaker — the content is the actual work. Nobody has to name a favorite animal to earn permission to speak.

## When to skip it

Skip it when the group is small enough that everyone will speak anyway. Six people around a table don't need pairs; they need a decent question and someone who stops the loudest person from taking two turns.

Skip it when you can't write a question that requires a personal stake. If your invitation question is answerable by reading the project brief aloud, the rounds will produce fifteen minutes of polite paraphrase.

And be honest about what it isn't. Impromptu Networking surfaces stakes and worries; it doesn't resolve them, prioritize them, or decide anything. If you run it and then don't visibly change the plan in response to what came out, you've taught twenty people that the pairing was theater — and the next time you ask a room to stand up, you'll get the polite round-one answer three times in a row.
