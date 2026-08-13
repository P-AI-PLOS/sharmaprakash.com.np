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

Course Guru's cohort-scheduling work needed two groups in one room: the five in-house engineers who'd built the LMS, and four contract integration engineers brought on specifically because they knew the Shopify checkout and subscription APIs better than anyone we had. The contract team had been onboarded via a Notion doc and a repo invite. Nine people, one video call, and the only thing anyone knew about anyone else was a Slack avatar.

The default opening for that call is a round of introductions — name, role, how long you've been here — which produces a list of job titles and exactly zero working relationships. Instead we spent twelve minutes on **Impromptu Networking** in breakout rooms, and the difference showed up two weeks later in who asked whom for help.

## The structure, and what it looks like remote

Impromptu Networking is a single invitation question answered in rotating pairs. Three rounds, two to three minutes per person per round, new partner each time, then done. In a physical room it's chaotic and loud and people mill around finding partners. On video, the mechanics are different but the structure survives intact: use automatic breakout rooms of two, set the timer, close the rooms, reshuffle, reopen. Most video tools will randomize pairs for you, which is genuinely better than a room does it — no self-selecting toward the person you already have lunch with.

Two remote-specific rules I've learned to state before round one. First, **both people answer** — the timer is for the pair, not the person, and half of remote pairs will otherwise let the chattier one eat the whole slot. I say "ninety seconds each, one of you keep an eye on the clock." Second, **cameras optional but voices mandatory**. On a call with contractors who've never met the in-house team, insisting on cameras adds a self-consciousness tax nobody needs in round one.

The invitation question does the same job it always does: it has to be personal, concrete, and answerable only by that specific person. Not "what's your role on this project."

## Running it on the cohort-scheduling kickoff

The question I used: **"What's something about how you work that this group will figure out eventually — and you'd rather they knew now?"**

I'd been nervous about that phrasing. It's more personal than the canonical hopes-and-contributions version, and with a group where half the people are on contracts, personal can read as intrusive. It worked because it's aimed at working style, not at feelings, and because the answers turn out to be immediately useful rather than merely warm.

What came out of the three rounds, in the order I heard it:

One of the contract engineers said in round one that he'd been on four Shopify integration projects that all shipped late for the same reason — the client team assumed the app-proxy authentication was simpler than it is — and that he tends to sound alarmist about it in week one specifically so he doesn't have to sound apologetic in week eight. Naming that in advance meant that when he did raise it, three days later, nobody read it as a contractor padding the estimate.

One of our LMS engineers told two different partners that she works asynchronously and badly on calls, that her useful thinking happens in writing, and that if the team ran all its design discussion live she'd contribute about a third of what she's capable of. We moved design discussion to written proposals with a live review, which is a change I would not have made on my own for another month.

And the most immediately valuable one: our backend lead and a contract engineer discovered in round two that they'd both independently assumed the *other* team owned the scheduling data model. That's a two-week collision that got resolved in a hundred and eighty seconds, before a single table was created.

By round three the tone on the main call had changed audibly. People used each other's names. When we moved into the actual scoping, the contract engineers asked questions instead of nodding, which is the entire difference between a contractor who ships what you specified and one who tells you the spec is wrong.

## Why pairs, and why three of them

The mechanic is airtime and safety, both of which scale badly with group size and catastrophically with group *asymmetry*. In a nine-person call where four people are new, external, and on a contract, the newcomers will systematically defer — not out of timidity but out of a correct read of the social situation. A pair removes the audience, and with the audience goes the deference.

Three rounds means each of the four contractors spoke one-on-one with three of the five in-house people, and vice versa. That's twelve cross-team relationships established in twelve minutes, which no amount of standup attendance produces. The reshuffle is what buys the coverage; a single long pairing gets you depth with one person and nothing else.

The repeated question matters too. Round one is the rehearsed answer. Round three, having heard two other people be candid, is the true one — and on a mixed staff/contractor call, round three is where the contractors stop giving the client-facing version.

## Where it breaks

It breaks if the invitation question can be answered from a job description. "Tell your partner what you'll be working on" produces twelve minutes of reading the project plan aloud to each other.

It breaks in odd-numbered rounds if you don't plan for the leftover person — form one trio and tell them ninety seconds each, don't leave someone alone in a breakout room wondering if the tool crashed.

And it's the wrong tool when the group already has real, active conflict. Impromptu Networking builds connection between people who don't know each other; it doesn't repair connection between people who do and have been hurting each other. For that you want [Heard Seen Respected](/product-management/heard-seen-respected-theme-update-fallout-polo-themes/) or a Fishbowl where the conflict can actually be aired, not rotating pairs where both parties politely avoid the subject three times in a row.
