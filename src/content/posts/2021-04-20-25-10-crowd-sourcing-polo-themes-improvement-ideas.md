---
title: "25/10 Crowd Sourcing: Merchants Ranked Their Own Theme Wishlist"
date: "2021-04-20T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Merchants submit theme-improvement requests constantly, and the ones that get built tend to be whichever ones a support ticket happened to escalate loudly. 25/10 Crowd Sourcing put merchants themselves in the room, generating and anonymously ranking their own wishlist — and the winner wasn't the request the team expected."
tags: [liberating-structures, polo-themes]
series: ls-ideation
seriesOrder: 11
use_featured_image: false
---

I'd already run [25/10 Crowd Sourcing once with course instructors](/product-management/25-10-crowd-sourcing-course-guru-instructor-ideas/) to fairly rank a backlog of feature requests without letting the loudest voices win by default. Running it again with a room of theme merchants — actual store owners using the platform's Shopify themes, not internal staff — surfaced a slightly different lesson: the structure works just as well when the "crowd" is external customers rather than internal stakeholders, and it's arguably even more valuable there, because a merchant's honest, anonymously-expressed priority is much harder to get any other way.

## The structure, briefly

25/10 Crowd Sourcing generates a large pool of ideas from silent individual writing, then puts those ideas into physical circulation: participants mill around the room, pair up, share whatever idea they're currently holding, rate the idea they hear on a 1-to-5 scale, then swap and repeat for several rounds. Because ideas travel away from their original authors and get rated anonymously by a rotating sequence of peers, the final ranking reflects genuine distributed judgment rather than the persuasiveness of whoever pitched an idea in the room. The [earlier post in this series](/product-management/25-10-crowd-sourcing-course-guru-instructor-ideas/) covers the full round-by-round mechanics; here the focus is on what changes when the crowd doing the ranking is your own customers rather than your own team or its adjacent instructors.

## Why merchants are a harder crowd to get honest signal from normally

Product teams already have several standard channels for hearing from merchants — support tickets, a feature-request form, occasional customer interviews, a Slack community if one exists. Every one of those channels has a bias baked in: support tickets over-represent the merchants angry enough, or blocked enough, to write in, which skews toward urgent pain over aspirational improvement. A feature-request form over-represents merchants who are comfortable writing unprompted and who check back to upvote things, which skews toward a specific, more technically engaged merchant profile. Customer interviews over-represent whoever the team happened to recruit, and interviews have their own dynamic where an interviewer's question shapes the answer more than people usually notice. None of these channels puts twenty merchants in a room together generating and ranking ideas as *equals*, with the specific anonymity-plus-repetition mechanism that cancels out both interviewer bias and the loudest-merchant-wins dynamic.

## Running it with an actual merchant panel

Twenty merchants — recruited via an incentivized invitation to a "help shape the roadmap" session, deliberately spanning different store sizes and time-on-platform rather than just the most vocal community members — went through the same four steps: silent writing on the prompt "what's one thing about customizing or maintaining your theme you wish worked better," several rounds of milling, pairing, sharing, and anonymously rating, then a final ranked list.

The team walked in expecting the top request to be something around visual customization flexibility — more granular control over fonts, spacing, section layouts — because that's what the loudest, most engaged merchants in the community forum had been requesting for months, visibly and repeatedly. It wasn't. The highest cumulative score went to a request nobody on the team had heard articulated clearly before: reliable warning *before* a theme update, about which of the merchant's specific customizations would be overwritten or broken by the update, rather than discovering it after applying the update and needing to manually redo lost changes. Several merchants who'd never posted in the community forum had independently written some version of this on their cards, and it circulated and scored consistently well across every round — a strong signal that this wasn't one anxious merchant's edge case, it was a widely shared, rarely-voiced fear that simply hadn't found its way into any of the usual, biased channels.

The visual-customization-flexibility requests the team had expected to dominate did appear on cards and did rank — respectably, in the upper third — but not at the very top, and notably split across several more specific variants (more font control, more spacing control, more layout control) that diluted their combined score relative to the single, more universally-felt update-safety concern that had no competing variants to split its votes.

## What the anonymity specifically bought here

With merchants specifically, anonymity does something it doesn't quite do with internal staff: it removes the incentive to perform gratitude or diplomacy toward the platform they depend on for their livelihood. A merchant asked directly, on camera, in an interview, "what should we build next" has a mild but real incentive to be polite, to praise what already works before critiquing what doesn't, to frame a request softly rather than bluntly — because they're aware they're speaking to the people who control a product their business runs on. An anonymous card, rated by strangers who'll never know who wrote it, carries none of that social cost. The update-safety request that ended up winning was written, on more than one card, in genuinely blunt language about how much manual rework a bad update had cost a merchant's store — language considerably sharper than anything that had ever appeared in a polite support ticket or a moderated community post from the same merchant base.

## The fix that came out of it

The winning request translated into a specific, scoped feature: a theme-update preview step that diffs the merchant's current customizations against the incoming update and flags exactly which customized sections would be reset or altered, before the merchant confirms the update — not a redesign of the update mechanism itself, just visibility into its consequences ahead of time. That's a meaningfully different, and by the crowd's own ranking more urgent, priority than the visual-customization-flexibility work the team had been about to greenlight based on forum volume alone. Forum volume, it turned out, had been measuring who posts most, not what merchants collectively care about most — exactly the gap 25/10's anonymous, repeated rating is built to close.

## Failure modes and when to skip it

Running this with external customers rather than internal staff raises the stakes on recruitment: if the twenty merchants in the room skew toward one segment — all large stores, or all merchants who happen to already be community-forum regulars — the "crowd" isn't actually representative, and an anonymously-ranked result from an unrepresentative crowd is just as biased as a support-ticket-driven priority list, only with better production values. Deliberately recruit across store size, platform tenure, and prior engagement level, the way this session did, or the exercise's core promise — genuine, unbiased crowd signal — doesn't hold.

It's also worth pairing this exercise with a basic incentive and time-cost consideration that doesn't apply to internal workshops: external merchants are giving up business hours to participate, and a fifteen-minute exercise embedded in a longer session justifies their time far better than a lone stripped-down 25/10 with nothing else attached. Build it into a session that also gives merchants something back — an early look at something in progress, direct access to the team, a genuine thank-you — rather than treating their time as free the way an internal workshop reasonably can.

And, as with the instructor version of this exercise, don't mistake the ranked output for a finished roadmap decision. A merchant crowd can tell you, with unusual honesty, what hurts most; it can't tell you what's technically feasible at what cost, and that judgment still belongs to the team, applied on top of — not instead of — what the crowd surfaced.
