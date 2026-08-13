---
title: "Improv Prototyping Both Sides: The Nudge and the Person Who Receives It"
date: "2021-06-25T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Recap CRM was about to ship a feature that told founders which relationships were going cold. We acted out the nudge — and then, because someone insisted, we acted out the awkward coffee it produced three weeks later."
tags: [liberating-structures, recap-crm]
series: ls-design
seriesOrder: 6
use_featured_image: false
---

The feature was called Fading, which should have been the first warning. Recap CRM would notice a founder hadn't spoken to someone in a while — weighted by how close the relationship had been — and surface a weekly list: *these five people are going cold.* The demo was persuasive, the engineering mostly done, a beta flag a week away.

What stopped it was a forty-minute **Improv Prototyping** session where the third group refused to end their skit at the click.

## The structure

Groups of four to seven, one shared challenge, fifteen minutes to build and rehearse a skit that enacts a solution, three to five minutes to perform, feedback, then a second round incorporating what everyone saw. Crude props, no narration of intent, played rather than described.

The variation that mattered here is one I now use for anything that generates outbound behaviour: **make at least one group play the other end.** Notifications, nudges, automated emails — the team always enacts the sender, because the sender is the user. The person receiving it is the one who decides whether the feature was a good idea.

## Running it on Fading

Challenge: *it's Monday morning. Priya opens Recap and sees that a relationship she cares about has gone quiet. Show us the next thirty seconds.*

**Group one** played it straight and it was fine, which is its own kind of finding. Priya scans five names, recognises one, taps, sees the last conversation, sends a short message. The room's only note was that the other four names produced a flicker of guilt and no action — and someone asked what a list of five feels like on the twentieth consecutive Monday.

**Group two** took that on and prototyped one name instead of five, with a reason attached: *you told Dev you'd introduce him to a designer, eleven weeks ago.* Their Priya acted immediately, because the item wasn't a status report, it was an unfinished commitment. A list of decaying relationships produces guilt; a single unkept promise produces a reply.

**Group three** is why the feature didn't ship that week. They played the *recipient* — a former colleague, Anjali — getting a message from someone she hadn't heard from in fourteen months. Their first line was the message from group one's skit, read aloud: *"Hey! It's been ages — how have you been?"* Then Anjali turned to the audience and said, in character, "he wants something."

Then they kept going. Three weeks later, coffee, and Anjali asks how he thought to get in touch. Their Priya-equivalent hesitated. The skit ended with the line that got written on the wall and stayed there: *"my CRM told me you were fading."*

Nobody could defend that sentence. Not because the feature was dishonest — everyone knows a founder keeps notes — but because our framing made the software the author of the relationship, and produced a message the sender couldn't stand behind if asked. That's a concept problem, not a copy problem, and it was invisible from inside a design review where we only ever looked at the sender's screen.

We shipped it two months later, reframed. No decay scores, no list of five, no "fading." One item at a time, anchored to something the founder had actually said or promised, with their own note visible in the composer so the message came from a real memory rather than a timer. The honest answer to Anjali's question became "I keep notes and I owed you an introduction" — a sentence a person can say out loud at a coffee.

## Why enacting the receiving end works

Every product decision about outbound communication gets made by people looking at the sending interface, which is measurable, demo-able and pleasant. The recipient's experience is where the feature's reputation is actually made, and it's inaccessible to a design review, an analytics dashboard, or a usability test — all of which are built around the user in the room.

Improv is one of the few cheap ways to get at it, because a colleague playing the recipient will apply their own social instincts in real time and say the unflattering thing out loud. "He wants something" was not a research finding. It was a person hearing a sentence and reacting the way people react.

The second-order test is even more valuable and takes ten extra seconds of skit: play the moment where the recipient asks how you knew. If the honest answer embarrasses the sender, the design has a problem that no amount of copywriting will fix.

## Where it breaks

Casting your own team as the recipient imports your team's instincts. Ours skew sceptical of anything automated, which meant "he wants something" landed harder in the room than it might for a friendlier population. I treat these skits as a way to *find* the risk, not to size it — the fix here was defensible on its own terms, but if the finding had been marginal I'd have wanted real recipients before rebuilding a feature.

Don't run it on interactions with no social content. A batch job doesn't have a receiving end that can feel awkward, and staging one produces theatre without insight.

And a skit can kill a good feature with a memorable line. "My CRM told me you were fading" was funny, quotable, and repeated for weeks — it deserved to win, but I've watched rooms retire an idea because someone got a laugh. If the audience feedback is applause, ask what specifically about the design produced it before you let it decide anything.
