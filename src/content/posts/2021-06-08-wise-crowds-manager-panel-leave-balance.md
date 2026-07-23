---
title: "Wise Crowds: A Manager Panel on the Leave-Approval Redesign"
date: "2021-06-08T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The managers approving leave requests every week have opinions they'll never put in a survey. Wise Crowds gets one of them into the client chair, turns their back to the room, and lets the honest version of the complaint come out."
tags: [liberating-structures, leave-balance]
series: ls-decide
seriesOrder: 14
use_featured_image: false
---

The most useful sentence in a leave-approval redesign workshop came from a manager who wasn't talking to anyone. Chair turned around, back to a group of five, listening to three peers and a product manager debate what was wrong with the approval flow she'd been quietly working around for a year. She hadn't said a word in ninety seconds. Then someone in the group said "I bet she's just approving in bulk on Friday afternoons without reading half of them," and I watched her shoulders tighten — because that was exactly what she did, and she'd never once said it out loud to anyone building the tool. That's the moment **Wise Crowds** is built to produce.

## What it is

Wise Crowds is a structured peer-consultation format: put someone with a real challenge in front of a small group, and run the group through a sequence that forces advice-giving instead of small talk, and forces the person with the problem to listen instead of defend. It's one of the Liberating Structures, and it does one job extremely well — surfacing candid, specific input from people who know a problem from the inside, in a format that a normal meeting or a written survey can't replicate.

## How it runs

Groups of four or five: one person is the **client**, the rest are **consultants**. The round has four steps and takes roughly ten minutes.

**Step 1 (1–2 min).** The client states their challenge and, critically, a specific question — not "what do you think of our approval flow" but something narrower they actually want answered.

**Step 2 (2–3 min).** Consultants ask only clarifying questions. No advice, no "have you tried." Just enough to understand the shape of the problem.

**Step 3 (4–5 min).** The client turns their chair around, back to the group, and says nothing. The consultants talk about the challenge and generate advice out loud to each other, as if the client weren't there. This is the whole mechanism of the structure: turning the chair removes the client's instinct to justify, explain, or defend a choice they made under pressure six months ago, and it frees the consultants to be more candid than they'd be face to face, because they're talking to each other, not at someone.

**Step 4 (1–2 min).** The client turns back and shares what landed — what surprised them, what they'll act on.

Then the client role rotates and a new round starts. A room of twenty to thirty people can run several rounds inside an hour, which means several real problems get worked, not just one.

## Applying it: the manager panel on approvals

We were redesigning the leave-approval flow — the screen a manager sees when a request lands, the information it shows, the actions it offers, what happens on escalation and edge cases like a request that crosses an accrual reset or overlaps a blackout period. I've written before about using an [Agreement-Certainty Matrix](/product-management/agreement-certainty-matrix-accrual-engine-leave-balance/) to sort out which parts of the accrual engine were genuinely contested versus just unclear; approvals were the other kind of problem — not a design disagreement, a lived-experience gap. The people who knew how the current flow actually failed weren't in the room deciding its replacement.

So we put one there, in the client chair, for a round. Real manager, someone who approves requests every week for a team of a dozen or more. Her question going into step one: "why do I dread the Monday queue, and what would make me not dread it?" The consultants were a mix — two other managers from different departments, one from HR operations, one from the product team building the redesign.

Step two's clarifying questions did some of the work a discovery interview usually does — what does her queue actually look like, does she approve in a batch or as requests come in, does she check anything before approving. But step three is where the real material showed up. With her chair turned, the group started reconstructing her actual workflow out loud: the way she skims requests without checking remaining balance because the balance isn't shown inline, the way she approves a cluster of similar-looking requests without opening each one because the tool makes opening slow, the way overlapping-team-member requests never get flagged so she finds out about a coverage gap after the fact. None of that was said *to* her. It was said *about* her, in front of her, while she sat with her back to the room absorbing it without the reflex to explain why she does it that way.

That's the specific value of the silent-listening step, and it's worth being precise about why it works when a normal interview doesn't. Ask a manager directly "do you read every request before approving," and most will describe the diligent version of themselves — the one they aspire to be, or the one they think you want to hear. Turn their back and let peers speculate about their workaround out loud, and the group tends to guess *correctly*, because they've built the same workaround themselves under the same pressure. The client isn't performing for an interviewer; she's overhearing people who understand the job describe the job. What surfaces is the actual behavior, not the reported one — and in step four, when she turned back, she confirmed the batch-approval habit outright and added the detail the group hadn't guessed: she'd stopped trusting the balance number after it had been wrong twice, which was why she'd stopped looking at it at all.

The product team harvested that round the same way we harvested the others: notes taken during step three by someone outside the pair (never by the client, who's meant to be listening, not writing), then pooled across all the rounds that ran that afternoon. The approval redesign that came out of it added an inline balance confidence indicator, batch-approve with a visible summary instead of blind bulk-approve, and an overlap flag for concurrent team absences — three fixes that trace directly to things nobody had put in a ticket, because nobody had been asked in a format where the honest answer was easier to say than the polished one.

## When it doesn't work

Wise Crowds needs a client who's willing to sit with silence and hear unflattering things said about their own workaround. Some people can't do it — they interrupt, they turn back around early, they answer the clarifying questions in step two so defensively that the group never gets past politeness. If you know the person you'd want in that chair is going to protect their pride in the room, don't force it publicly; that's a conversation for a one-on-one, not a workshop exercise.

It also assumes the room has genuine expertise to offer, not just curiosity. A group of consultants who've never approved a leave request themselves will speculate less usefully than a group who live the process — which is why the manager mix mattered more than the headcount. And it's the wrong tool for a decision that's already been made; Wise Crowds surfaces problems and generates advice, it doesn't resolve disagreement about which advice to take. If the redesign's direction was still contested, this needed to follow an [agreement-certainty](/product-management/agreement-certainty-matrix-accrual-engine-leave-balance/) sort, not precede it. And like the [merchant advisory panel](/product-management/wise-crowds-merchant-advisory-panel-polo-themes/) I ran the same week for a different product, the format doesn't replace ongoing access to the people who live the problem — it's one very good hour, not a substitute for keeping them in the loop as the redesign actually ships. For the fuller set of structures this series draws from, the [field guide](/product-management/liberating-structures-for-product-teams-the-33-structure-field-guide/) has the rest.
