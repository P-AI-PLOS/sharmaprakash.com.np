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

The tell was that our two designers had stopped attaching notes to Figma handoffs. For most of the year, each screen came with a short doc — interaction states, what to do at odd widths, which spacing was intentional and which was placeholder. By June the docs were gone and the handoffs were just frames.

I asked one of them about it in a one-on-one and got a shrug and "it wasn't really getting read, so." Which was, I found out later, the polite version of a quarter in which the mobile deal-detail screen had shipped with a different information hierarchy than designed, the empty states had been silently swapped for a generic component, and both changes had been made in the pull request with no conversation, because the engineers involved genuinely believed they were making small pragmatic calls rather than design decisions. They weren't being dismissive. They just didn't know where the line was, and nobody had told them, because the person who'd have told them had stopped writing the docs.

That is a process problem with a relational problem underneath it, and you cannot fix the top layer while the bottom one is intact. So before the working session on handoff conventions, six of us — two designers, three engineers, me — spent twenty minutes on **Heard Seen Respected**.

## The structure, briefly

Pairs. Each person tells a story about a time they were not heard, not seen, or not respected. The partner listens, and the instruction is unusually strict: no sympathizing aloud, no "that happened to me too," no questions, no advice, no reframing. Listen for five to seven minutes. Then swap.

Afterward the group shares patterns — not the stories, which stay with their tellers, but observations about the experience: what it's like to not be heard, and what it was like to have to just listen.

Twenty to twenty-five minutes for a small group. No materials, no output document.

## How it ran

Three pairs, each mixing design with engineering. Same boundary I always set: **your story does not have to be about work, this team, or anyone here.** In a room where the live grievance is specific and recent, that boundary is what keeps the structure from becoming a courtroom.

One of the designers told a story from a previous agency about presenting a concept to a client's marketing director who read email throughout and then asked her to "walk through it again quickly." One of the engineers told a story about a school music teacher. The third pair, I found out afterward, spent most of one turn on a story about a hospital appointment.

The pattern share was five minutes and it was the useful part. Someone said that in every story, the person who wasn't listening had a completely reasonable reason not to. Someone else said the moment of not-being-heard was almost never dramatic — it was a small, deniable, in-passing thing, which is exactly what makes it hard to raise. And one of the engineers said, unprompted and to nobody in particular, "I think I do the reasonable-reason thing constantly."

We went into the conventions session immediately after. It took forty minutes and it was completely different from the version I'd have gotten cold. The designer who'd shrugged at me in a one-on-one said out loud, in front of the engineers, that she'd stopped writing handoff notes because writing them and watching them go unread felt worse than not writing them. One of the engineers said he'd changed the empty states because a generic component seemed like the maintainable choice and it hadn't occurred to him that it was a decision anyone would want a say in.

Both of those are ordinary sentences. Neither of them had been said in six months. What came out of the session — a rule that any deviation from a handoff gets a comment on the Figma frame rather than a silent change in the PR, and a fifteen-minute walkthrough call for anything bigger than a screen — is unremarkable as process. It works because the two people who have to honor it had, that morning, listened to each other for six uninterrupted minutes.

## Why silence, specifically

The instinct when someone tells you about being dismissed is to respond, and every available response makes it worse. Sympathy moves attention to your feelings about their story. A parallel story replaces theirs with yours. A question steers it. An explanation — even a generous one — turns their experience into a problem you're solving.

Removing all of those leaves only attention, and attention is the thing that was missing in the story they just told you. The structure makes people *feel* the difference between being attended to and being handled, in both directions, in twenty minutes.

The design-engineering handoff has this failure baked in at an unusually fine grain. Design decisions arrive as artifacts, get reinterpreted by people with different constraints, and the reinterpretation happens in a pull request — asynchronously, in a medium optimized for terse technical comment, where "changed this to use the standard component" reads as a note and lands as a verdict. Nobody is being rude. The medium removes the acknowledgment step entirely, and after enough rounds of it the designer stops sending the notes.

## When to skip it

Skip it when the disagreement is genuinely about substance and both sides feel perfectly well heard. Two engineers arguing hard about a data model don't need paired listening; they need a decision structure. Using Heard Seen Respected on healthy conflict reads as condescending.

Skip it when participation isn't voluntary. Asking for a personal story from someone who's been ordered into a room is a real imposition. Say that a small story is enough and that passing is fine, and mean it.

And don't schedule it standalone. It changes the temperature of the next conversation; it doesn't produce anything on its own. Put a real working session immediately after it — the handoff conventions, the retro, the design review — or you've held an emotionally loaded twenty minutes that resolves into people going back to their desks and writing exactly the same Figma comment they'd have written anyway.
