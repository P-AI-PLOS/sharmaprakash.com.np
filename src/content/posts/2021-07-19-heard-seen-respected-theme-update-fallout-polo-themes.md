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

The 3.0 update to our Meridian theme shipped with a restructured settings schema, and for merchants who'd added custom CSS through the theme editor — about two hundred of them — the update dropped it. We'd shipped a migration path. It handled the documented customization surface. It did not handle the undocumented one, which is where merchants actually live.

What made the following week ugly wasn't the bug. It was that a support lead had raised precisely this risk in a channel in April, been told the migration covered it, and let it go. When the tickets came in, she didn't say "I told you so." She said nothing at all, which was worse, and the engineering team knew exactly why.

I had a retro scheduled. I knew what would happen at that retro: careful process language, a Jira ticket about improving the customization audit, and two teams who would go on not talking to each other for another quarter. So I put twenty-five minutes of **Heard Seen Respected** in front of it.

## What it is

Heard Seen Respected is a Liberating Structure with an almost embarrassingly small footprint and an unusual instruction: for most of it, you are forbidden from being helpful.

People pair up. Each person tells a story about **a time they were not heard, not seen, or not respected** — a real one, from their own experience. The listener's job is to listen. Not to sympathize out loud, not to relate a similar experience, not to ask probing questions, and above all not to fix, explain, contextualize, or reframe. Listen. Then switch: the listener becomes the teller.

Five to seven minutes each way. Afterward, pairs are invited to share patterns — not the stories themselves, which belong to the teller, but what they noticed about how it feels to not be heard, and about how hard it was to just listen. Twenty to twenty-five minutes total.

Lipmanowicz and McCandless are explicit that the point isn't catharsis. It's practice in a specific skill — attentive listening without the reflex to respond — and a shared, felt reminder that everyone in the room has been on the receiving end of not being heard.

## Running it before the Meridian retro

Nine people: four engineers, three support, a designer, me. I paired deliberately across the line — every pair had one engineer or designer and one support person.

I set one boundary at the top, and I'd say it's mandatory: **the story does not have to be about this incident, or about anyone in this room.** That sounds like it dilutes the exercise. It's the opposite. It removes the trap where the structure becomes a licensed grievance session about a colleague sitting three feet away, which would have been catastrophic in that particular room. People are free to tell a story from a previous job, from school, from a family situation. Most of them did.

What I heard, standing at the edge of the room not participating: an engineer telling a support rep about being the only junior in a code review where his objection was talked past three times in one meeting. A support rep telling a different engineer about a previous job where a manager introduced her to a client as "one of the girls on the phones." The designer told a story about a portfolio review, ten years old, that he clearly hadn't told at work before.

Nobody told the Meridian story. Nobody needed to. The pattern share afterward was three sentences long and one of them was from the support lead: "The hardest part was not explaining. I kept wanting to tell him the thing wasn't his fault." Which is, precisely, the reflex that had made April's warning easy to wave off — the assumption that acknowledging a concern requires resolving it, so if you can't resolve it you can skip acknowledging it.

The retro that followed was the most direct one that team had ever had. An engineer opened it by saying he'd read the April message again that morning and it was clearer than he'd remembered. Support and engineering agreed a pre-release convention that outlives the incident: any support flag on a release gets a written response naming what's covered and what isn't, even if the answer is "we're accepting this risk." That's a real artifact and it came out of a room that had spent twenty-five minutes practicing not being defensive.

## Why the ban on responding is the whole mechanism

Every other structure I use gives listeners something to do. This one takes it away, and that removal is the design.

The reflex to respond — to reassure, to relate, to fix — feels like engagement and functions as interruption. It moves the conversation from the teller's experience to the listener's competence at handling it. In a support-versus-engineering standoff, that reflex has a specific shape: every concern support raises gets met with a technical explanation of why it's covered, and the explanation is usually correct, and the person raising it still ends up feeling processed rather than heard. Then they stop raising things. That's the actual failure the April message represents.

Making people sit in silence through someone else's story for five minutes is uncomfortable in a way that teaches faster than any amount of "we should listen better." Half the room reported that the hard part was staying quiet. Once you've noticed the reflex in yourself in a low-stakes context, you can catch it in a high-stakes one.

Pairing across the divide matters too. You cannot easily hold "support doesn't understand engineering constraints" as an abstraction after listening to one specific support person tell you about being introduced as one of the girls on the phones.

## Where it goes wrong

It goes badly if you don't make the story boundary explicit. Left open in a room with live conflict, someone will tell a story about someone present, and the structure has no repair mechanism for that.

It goes badly with people who haven't agreed to be there. This asks for a real story from your own life, and coercing that is a genuine harm, not a facilitation hiccup. Say clearly that a small story is fine, and that passing is fine.

It's also not a substitute for the actual work. Heard Seen Respected does not fix a release process, assign an owner, or resolve a disagreement — it changes the conditions under which the next conversation happens. If you run it and then hold the same defensive retro you'd have held anyway, you've spent twenty-five minutes of people's personal history on nothing. Run it *before* something, never as the thing itself.
