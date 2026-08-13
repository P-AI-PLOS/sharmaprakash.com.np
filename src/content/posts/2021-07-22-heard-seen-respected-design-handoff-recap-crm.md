---
title: "Heard Seen Respected: Repairing a Handoff Nobody Wanted to Talk About"
date: "2021-07-22T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Two designers had spent a quarter watching their work get reinterpreted in code with no conversation, and had gone quiet about it. Twenty minutes of paired listening — where the only allowed response is silence — got the conversation started."
tags: [liberating-structures, recap-crm]
series: ls-alignment
seriesOrder: 6
use_featured_image: false
---

The tell was that our two designers had stopped attaching notes to Figma handoffs. For most of the year each screen came with a short doc — interaction states, what to do at odd widths, which spacing was intentional. By June the docs were gone and the handoffs were just frames.

I asked one of them about it and got a shrug and "it wasn't really getting read, so." That was the polite version of a quarter in which the mobile deal-detail screen shipped with a different information hierarchy than designed, and the empty states were silently swapped for a generic component — both changed in the pull request with no conversation, because the engineers believed they were making small pragmatic calls rather than design decisions. Nobody had told them where the line was, because the person who'd have told them had stopped writing the docs.

That's a process problem with a relational problem underneath it, and you can't fix the top layer while the bottom one is intact. So before the working session on handoff conventions, we spent twenty minutes on **Heard Seen Respected**.

## The structure, briefly

Pairs. Each person tells a story about a time they were not heard, not seen, or not respected. The partner listens, and the instruction is unusually strict: no sympathizing aloud, no "that happened to me too," no questions, no advice, no reframing. Listen for five to seven minutes. Then swap.

Afterward the group shares patterns — not the stories, which stay with their tellers, but observations about the experience itself. Twenty-five minutes for a small group, no materials, no output document.

## How it ran

Six of us: two designers, three engineers, and me. I paired in rather than facilitating from the side, giving three pairs — each designer with an engineer, and me with the third engineer. Two of the three crossed the design-engineering line, which is what the session needed; I'd rather each designer got an engineer's full attention than run a trio. Decide that before people move.

Same boundary I always set: **your story does not have to be about work, this team, or anyone here.** Where the live grievance is specific and recent, that keeps the structure from becoming a courtroom.

One designer told a story from a previous agency about presenting a concept to a client's marketing director who read email throughout and then asked her to "walk through it again quickly." One engineer told a story about a school music teacher.

The pattern share was five minutes and it was the useful part. Someone said that in every story, the person who wasn't listening had a completely reasonable reason not to. Someone else said the moment of not-being-heard was almost never dramatic — it was small, deniable, in passing, which is what makes it hard to raise.

We went into the conventions session immediately after, and it was completely different from the version I'd have gotten cold. The designer who'd shrugged at me in a one-on-one said out loud, in front of the engineers, that she'd stopped writing handoff notes because writing them and watching them go unread felt worse than not writing them. One engineer said he'd changed the empty states because a generic component seemed like the maintainable choice, and it hadn't occurred to him it was a decision anyone would want a say in.

Both are ordinary sentences. Neither had been said in six months. What came out — any deviation from a handoff gets a comment on the Figma frame rather than a silent change in the PR — is unremarkable as process. It works because the people who have to honor it had, that morning, listened to each other for six uninterrupted minutes.

## Why silence, specifically

The instinct when someone tells you about being dismissed is to respond, and every available response makes it worse. Sympathy moves attention to your feelings about their story. A parallel story replaces theirs with yours. An explanation — even a generous one — turns their experience into a problem you're solving.

Removing all of those leaves only attention, which is the thing that was missing in the story they just told you. The structure makes people *feel* the difference between being attended to and being handled, in both directions, in twenty minutes.

The design-engineering handoff has this failure baked in. Design decisions arrive as artifacts, get reinterpreted by people with different constraints, and the reinterpretation happens in a pull request — a medium optimized for terse technical comment, where "changed this to use the standard component" reads as a note and lands as a verdict. Nobody is being rude. The medium removes the acknowledgment step, and after enough rounds the designer stops sending the notes.

## When to skip it

Skip it when the disagreement is genuinely about substance and both sides feel well heard. Two engineers arguing about a data model need a decision structure, not paired listening. Skip it when participation isn't voluntary, too — asking for a personal story from someone ordered into a room is a real imposition.

And don't schedule it standalone. It changes the temperature of the next conversation; it doesn't produce anything on its own. Put a real working session immediately after, or you've held an emotionally loaded twenty minutes that resolves into everyone writing exactly the same Figma comment they'd have written anyway.
