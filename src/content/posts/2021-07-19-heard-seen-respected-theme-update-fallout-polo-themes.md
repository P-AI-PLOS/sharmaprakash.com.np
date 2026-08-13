---
title: "Heard Seen Respected: The Retro That Had to Happen Before the Retro"
date: "2021-07-19T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A theme update wiped custom CSS for two hundred merchants, and support had warned us it would. Before anyone could talk process, the two teams needed a structure where the only permitted response to a story was silence."
tags: [liberating-structures, polo-themes]
series: ls-alignment
seriesOrder: 5
use_featured_image: false
---

The 3.0 update to our Meridian theme shipped with a restructured settings schema, and for merchants who'd added custom CSS through the theme editor — about two hundred of them — the update dropped it. We'd shipped a migration path. It handled the documented customization surface, not the undocumented one, which is where merchants actually live.

What made the following week ugly wasn't the bug. It was that a support lead had raised precisely this risk in April, been told the migration covered it, and let it go. When the tickets came in she didn't say "I told you so." She said nothing at all, which was worse, and the engineering team knew exactly why.

I had a retro scheduled, and I knew what would happen at it: careful process language, a Jira ticket about the customization audit, and two teams who would go on not talking for another quarter. So I put twenty-five minutes of **Heard Seen Respected** in front of it.

## What it is

Heard Seen Respected has an embarrassingly small footprint and an unusual instruction: for most of it, you are forbidden from being helpful.

People pair up. Each tells a story about **a time they were not heard, not seen, or not respected** — a real one, from their own experience. The listener's job is to listen. Not to sympathize aloud, not to relate a similar experience, not to ask probing questions, and above all not to fix, explain, or reframe. Listen. Then switch.

Five to seven minutes each way, twenty-five minutes total. Afterward, pairs share patterns — not the stories, which belong to their tellers, but what they noticed about how it feels to not be heard. The point isn't catharsis; it's practice in attentive listening without the reflex to respond.

## Running it before the Meridian retro

Eight people: four engineers, three support, the designer. I facilitated without participating, which gave four pairs — three crossing the support-engineering line, and a fourth pairing two engineers together. With an uneven split you either accept one same-function pair or run a trio, and a trio compresses everyone's time. Say which before people move.

I set one boundary at the top, and I'd call it mandatory: **the story does not have to be about this incident, or about anyone in this room.** That sounds like it dilutes the exercise. It's the opposite — it removes the trap where the structure becomes a licensed grievance session about a colleague sitting three feet away.

What I heard from the edge of the room: an engineer telling a support rep about being the only junior in a code review where his objection was talked past three times. A support rep telling a different engineer about a previous job where a manager introduced her to a client as "one of the girls on the phones."

Nobody told the Meridian story. Nobody needed to. The pattern share afterward was three sentences long and one was from the support lead: "The hardest part was not explaining. I kept wanting to tell him the thing wasn't his fault." Which is precisely the reflex that made April's warning easy to wave off — the assumption that acknowledging a concern requires resolving it, so if you can't resolve it you skip acknowledging it.

The retro that followed was the most direct that team had ever had. An engineer opened by saying he'd reread the April message that morning and it was clearer than he'd remembered. The two teams agreed a convention that outlives the incident: any support flag on a release gets a written response naming what's covered and what isn't, even if the answer is "we're accepting this risk."

## Why the ban on responding is the whole mechanism

Every other structure I use gives listeners something to do. This one takes it away, and the removal is the design.

The reflex to respond — reassure, relate, fix — feels like engagement and functions as interruption. It moves the conversation from the teller's experience to the listener's competence at handling it. In a support-versus-engineering standoff that reflex has a specific shape: every concern support raises gets met with a technical explanation of why it's covered, the explanation is usually correct, and the person raising it still ends up feeling processed rather than heard. Then they stop raising things. That's the failure the April message represents.

And you cannot easily hold "support doesn't understand engineering constraints" as an abstraction after listening to one specific support person tell you about being introduced as one of the girls on the phones.

## Where it goes wrong

It goes badly if you don't make the story boundary explicit — left open in a room with live conflict, someone will tell a story about someone present, and the structure has no repair mechanism for that. It goes badly, too, with people who haven't agreed to be there. Say a small story is fine and that passing is fine.

And it's not a substitute for the work. It doesn't fix a release process or resolve a disagreement — it changes the conditions under which the next conversation happens. Run it and then hold the same defensive retro you'd have held anyway, and you've spent twenty-five minutes of people's personal history on nothing. Run it *before* something, never as the thing itself.
