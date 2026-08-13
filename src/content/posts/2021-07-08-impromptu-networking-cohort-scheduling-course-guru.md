---
title: "Impromptu Networking Over Video: Connecting Two Teams Who'd Never Met"
date: "2021-07-08T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "An in-house LMS team and four contract integration engineers were about to build cohort scheduling together, having never spoken. Three rounds of two-person breakout rooms did in twelve minutes what a month of standups wouldn't have."
tags: [liberating-structures, course-guru]
series: ls-alignment
seriesOrder: 2
use_featured_image: false
---

Course Guru's cohort-scheduling work needed two groups in one room: the four in-house engineers who'd built the LMS, and four contract integration engineers brought on because they knew the Shopify checkout and subscription APIs better than anyone we had. The contract team had been onboarded via a Notion doc and a repo invite. Eight people on one video call, and the only thing anyone knew about anyone else was a Slack avatar.

The default opening is a round of introductions — name, role, tenure — which produces a list of job titles and zero working relationships. We spent twelve minutes on **Impromptu Networking** in breakout rooms instead, and the difference showed up two weeks later in who asked whom for help.

## The structure, and what it looks like remote

Impromptu Networking is a single invitation question answered in rotating pairs. Three rounds, two to three minutes per person per round, new partner each time. In a physical room it's loud and chaotic and people mill about finding partners. On video the mechanics differ but the structure survives: automatic breakout rooms of two, set the timer, close, reshuffle, reopen. Most tools randomize pairs for you, which is better than a room does it — no self-selecting toward the person you already have lunch with.

Two remote-specific rules worth stating before round one. First, **both people answer** — the timer is for the pair, not the person, and half of remote pairs will otherwise let the chattier one eat the slot. Second, **cameras optional, voices mandatory**. With contractors who've never met the in-house team, insisting on cameras adds a self-consciousness tax nobody needs in round one.

The invitation question does its usual job: personal, concrete, answerable only by that specific person. Not "what's your role on this project."

## Running it on the cohort-scheduling kickoff

The question: **"What's something about how you work that this group will figure out eventually — and you'd rather they knew now?"**

It's more personal than the canonical hopes-and-contributions version, and with half the room on contracts, personal can read as intrusive. It worked because it aims at working style rather than feelings, and because the answers turn out to be immediately useful rather than merely warm.

One contract engineer said in round one that he'd been on four Shopify integration projects that all shipped late for the same reason — the client team assuming app-proxy authentication is simpler than it is — and that he tends to sound alarmist in week one specifically so he doesn't have to sound apologetic in week eight. Naming that in advance meant that when he did raise it three days later, nobody read it as a contractor padding an estimate.

One of our LMS engineers told two different partners that she works asynchronously and badly on calls, and that if the team ran all its design discussion live she'd contribute a third of what she's capable of. We moved design discussion to written proposals with a live review — a change I wouldn't have made on my own for another month.

And the most valuable one: our backend lead and a contract engineer discovered in round two that each had assumed the *other* team owned the scheduling data model. A two-week collision, resolved in a hundred and eighty seconds, before a single table existed.

By round three the tone on the main call had changed audibly. People used each other's names. In the scoping that followed, the contract engineers asked questions instead of nodding — which is the entire difference between a contractor who ships what you specified and one who tells you the spec is wrong.

## Why pairs, and why three of them

The mechanic is airtime and safety, both of which scale badly with group size and catastrophically with group *asymmetry*. On an eight-person call where four people are new, external, and on contract, the newcomers systematically defer — not from timidity but from a correct read of the social situation. A pair removes the audience, and with the audience goes the deference.

Three rounds means each contractor spoke one-on-one with three of the four in-house people and vice versa: twelve cross-team relationships in twelve minutes, which no amount of standup attendance produces. The reshuffle buys the coverage; a single long pairing gets depth with one person and nothing else. Round one is the rehearsed answer; round three, having heard two people be candid, is where the contractors stop giving the client-facing version.

## Where it breaks

It breaks if the invitation question can be answered from a job description. "Tell your partner what you'll be working on" produces twelve minutes of reading the project plan aloud.

It breaks on odd headcounts if you don't plan for the leftover person — form one trio and give them sixty seconds each; don't leave someone alone in a breakout room wondering whether the tool crashed.

And it's the wrong tool when the group has real, active conflict. Impromptu Networking builds connection between people who don't know each other; it doesn't repair connection between people who do and have been hurting each other. For that, use [Heard Seen Respected](/product-management/heard-seen-respected-theme-update-fallout-polo-themes/) or a Fishbowl where the conflict can actually be aired — not rotating pairs where both parties politely avoid the subject three times running.
