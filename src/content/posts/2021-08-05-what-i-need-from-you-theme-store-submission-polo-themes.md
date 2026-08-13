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

Our Marin theme had a submission window closing on a Friday nine days out, and missing it meant waiting a full review cycle — roughly two months before merchants could buy it. Everyone knew the date. Everyone had been in the same three status meetings. In the third one I noticed the pattern: each function was reporting itself on track *conditional on* something another function was doing, and nobody was stating the condition out loud.

Design was on track assuming no more content changes to the demo store. Development was on track assuming the accessibility audit findings arrived by Monday. QA, one person also wearing the support hat, assumed the demo store would be frozen so she could write documentation against it. Marketing assumed they'd have final screenshots by Wednesday, which required the store to be *un*frozen long enough to look finished.

Four conditions, mutually incompatible, all unspoken — because status meetings ask "are you on track," and the honest answer to that is always "yes, if."

I cancelled the fourth status meeting and ran **What I Need From You** instead.

## The script

WINFY runs in functional groups and does two things: it forces requests into an explicit, first-person form, and it restricts every reply to one of four options.

Each group takes five to ten minutes alone to agree its **top two needs from each other group**. Then, in plenary, one group at a time states its needs aloud — "What I need from you is…" — to each other group in turn. Nobody answers yet; you complete the full circuit of asks first.

Then the replies, chosen from: **Yes**, **No**, **I'll try**, or **Whatever it is you're asking for, it's unclear to me**. That's the entire permitted vocabulary. Anything needing negotiation gets negotiated after, with the ask already on the record. Four groups, two asks each direction, is twenty-four requests — about twelve minutes, because nobody may elaborate.

## Running it nine days out

Groups: design (two), development (three), QA-and-support (one person, allowed and slightly awkward), marketing (two).

**QA to design and marketing**: *"What I need from you is the demo store content frozen from Tuesday, because every documentation screenshot I take before then gets invalidated."* Design: **Yes.** Marketing: **No.**

That flat no was the most useful thirty seconds of the week. Marketing needed the store live and editable through Wednesday to shoot launch imagery, and had never said so, because in a status meeting "we need the store unfrozen" sounds like obstruction rather than a requirement. In WINFY it's just a no, and a no is a fact you can schedule around. Afterward marketing shot Wednesday morning against a snapshot branch and QA got her freeze on Tuesday against main — neither team had thought of the branch, because neither knew the conflict existed.

**Development to design**: *"What I need from you is the accessibility audit findings by Monday end of day, because remediation is the only thing left on the critical path."* Answer: **I'll try.** Not a yes — the designer running the audit had a weekend commitment she hadn't mentioned and wouldn't promise around. That moved two developers onto other pre-submission work for Monday rather than sitting idle, buying back most of a day.

**Marketing to development**: *"What I need from you is the theme preview URL working on mobile Safari by Tuesday."* **Whatever it is you're asking for, it's unclear to me.** Development didn't know there was a mobile Safari problem — marketing had been hitting a caching issue on their own devices for a week and assumed it was known. It turned out to be a stale service worker, not a theme bug.

Most of the other twenty-one asks were uneventful yeses. We submitted on the Thursday, a day early.

## Why the restricted answers do the work

Every organization has a dialect for avoiding refusal — "should be fine," "let's sync," "I'll see what I can do." It exists for good social reasons and it makes cross-functional plans unfalsifiable. Two people leave a conversation with different beliefs about what was agreed, and neither is lying.

WINFY's four answers make that impossible. There is no soft yes available. If you're unsure you must say "I'll try," which is *visibly* not a yes to everyone in the room.

The all-asks-before-any-answers ordering is the other essential piece. Answer as you go and the first two responses set the room's temperature; by the sixth request everyone's saying yes because saying no has become socially expensive. Hear all twenty-four first and each group answers knowing its total load — which is when marketing's no becomes sayable.

## When to skip it

Skip it when there's only one real function in the room; four sub-teams of one squad produce twenty-four polite yeses. Skip it if you can't hold the no-elaboration rule — one tolerated "yes, but—" and the session reverts to a status meeting with unusual seating. Skip it, too, so close to a deadline that the answers can't change anything: the value is in the rescheduling that follows, and with no slack left you've only documented the crash in advance.

And follow through on the "I'll try" and "it's unclear" answers the same day. If they don't get an owner before people leave, everyone learns the honest answers cost more than the easy one — and next time you'll get twenty-four yeses.
