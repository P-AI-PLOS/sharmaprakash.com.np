---
title: "What I Need From You: A Submission Deadline and Nowhere Left to Hide"
date: "2021-08-05T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Nine days from a theme-store submission cutoff, four functions were each waiting on the other three. Banning every answer except yes, no, I'll try, and it's unclear got us to a real plan in thirty-five minutes."
tags: [liberating-structures, polo-themes]
series: ls-alignment
seriesOrder: 10
use_featured_image: false
---

Our Marin theme had a submission window that closed on a Friday nine days out, and missing it meant waiting a full review cycle — roughly another two months before merchants could buy it. Everyone knew the date. Everyone had been in the same three status meetings. And in the third one I finally noticed the pattern: each function was reporting itself as on track *conditional on* something another function was doing, and nobody was stating the condition out loud.

Design was on track assuming no more content changes to the demo store. Development was on track assuming the accessibility audit findings arrived by Monday, which was the day after the meeting. QA — one person, wearing the support hat too — was assuming the demo store content would be frozen so she could write documentation against it. Marketing was assuming they'd have final screenshots by Wednesday, which required the demo store to be *un*frozen long enough to look finished.

Four conditions, all of them mutually incompatible, all of them unspoken because status meetings ask "are you on track" and the honest answer to that question is always "yes, if."

I cancelled the fourth status meeting and ran **What I Need From You** instead. Thirty-five minutes.

## The script

WINFY runs in functional groups and it does two things: it forces requests into an explicit, first-person form, and it restricts every reply to one of four options.

Each group takes five to ten minutes alone to agree its **top two needs from each other group**. Then, in plenary, one group at a time states its needs aloud — "What I need from you is…" — to each other group in turn. Nobody answers yet. You complete the full circuit of asks first.

Then the replies, one per request, choosing from:

- **Yes**
- **No**
- **I'll try**
- **Whatever it is you're asking for, it's unclear to me**

That's the entire permitted vocabulary. No conditions, no explanations, no counter-proposals inside the structure. If something needs negotiating, it gets negotiated after, by the two groups involved, with the ask already on the record.

Four groups, two asks each direction, is twenty-four requests — which sounds like a lot and takes about twelve minutes, because nobody is allowed to elaborate.

## Running it nine days out

Groups: design (two), development (three), QA-and-support (one person, which is allowed and slightly awkward), marketing (two).

**QA to design and marketing, jointly**: *"What I need from you is the demo store content frozen from Tuesday, because every documentation screenshot I take before then gets invalidated."* Design: **Yes.** Marketing: **No.**

That flat no, from marketing, was the most useful thirty seconds of the week. They needed the store live and editable through Wednesday to shoot the launch imagery, and they'd never said so because in a status meeting the sentence "we need the store unfrozen" sounds like an obstruction rather than a requirement. In WINFY it's just a no, and a no is a fact you can schedule around.

We resolved it in the ten minutes after the session: marketing shot Wednesday morning against a snapshot branch, QA got her freeze on Tuesday against main. Neither team had thought of the branch because neither team had known the conflict existed.

**Development to design**: *"What I need from you is the accessibility audit findings by Monday end of day, because remediation is the only thing left on the critical path."* Answer: **I'll try.** Not a yes. The designer running the audit had a personal commitment that weekend she hadn't mentioned, and she wasn't willing to promise. That "I'll try" moved two developers onto other pre-submission work for Monday rather than sitting idle waiting, which is a small thing that bought back most of a day.

**Marketing to development**: *"What I need from you is the theme preview URL working on mobile Safari by Tuesday."* **Whatever it is you're asking for, it's unclear to me.** Development genuinely didn't know there was a mobile Safari problem — marketing had been hitting a caching issue on their own devices for a week and assumed it was known. Ten minutes after the session it turned out to be a stale service worker on two laptops, not a theme bug at all.

**Design to QA**: *"What I need from you is the settings-schema review done before Thursday."* **Yes.** Uneventful, which most of them were, and that's fine. The structure's value is concentrated in four or five answers; the rest is confirmation, and confirmation is worth something too.

We submitted on the Thursday, a day early.

## Why the restricted answers do the work

Every organization I've worked in has a dialect for avoiding refusal — "should be fine," "let's sync," "I'll see what I can do." It exists for good social reasons and it makes cross-functional plans unfalsifiable. Two people leave a conversation with different beliefs about what was agreed and neither of them is lying.

WINFY's four answers are chosen to make that impossible. There is no soft yes available. If you're not sure, you must say "I'll try," which is honest and which is *visibly* not a yes to everyone in the room, including the person who was about to plan on it.

The all-asks-before-any-answers ordering is the other essential piece. Answer as you go and the first two responses set the room's temperature; by the sixth request everyone's saying yes because saying no has become socially expensive. Hear all twenty-four first and each group answers knowing its total load, which is when the no from marketing becomes sayable.

The "what I need from you" phrasing carries the asker's stake. Nine days from a deadline, "could you maybe freeze the demo store" is a request you can decline without consequence. "What I need from you is the demo store frozen from Tuesday, because every screenshot before then gets invalidated" is a dependency, and declining it obliges you to say what happens instead.

## When to skip it

Skip it when there's only one real function in the room. WINFY needs distinct groups with genuine interdependence; run it across four sub-teams of one squad and you get twenty-four polite yeses.

Skip it if you can't hold the no-elaboration rule. One tolerated "yes, but—" and the session reverts to a status meeting with unusual seating.

Skip it under a week from a deadline when the answers can't change anything. The value is in the rescheduling that follows, and if there's no slack left to reschedule into, all you've done is document the crash in advance.

And follow through on the "I'll try" and "it's unclear" answers the same day. Those two categories exist to surface risk early; if they don't get an owner before people leave the room, everyone learns that the honest answers cost more than the easy one, and next time you'll get twenty-four yeses.
