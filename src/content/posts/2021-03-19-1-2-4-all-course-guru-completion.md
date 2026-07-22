---
title: "1-2-4-All: Getting Everyone's Real Read on Course Completion"
date: "2021-03-19T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "When 'why don't learners finish courses' gets asked in an open meeting, you get the three theories the loudest three people already believe. 1-2-4-All gets you the theories nobody had said out loud yet — including the one that turned out to be right."
tags: [liberating-structures, course-guru]
series: ls-ideation
seriesOrder: 2
use_featured_image: false
---

I've used [1-2-4-All to kick off a pipeline-feature redesign](/product-management/1-2-4-all-fast-group-ideation-for-a-new-pipeline-feature/) before, and the structure is the same no matter the product — one question, four rounds of doubling group size, five minutes a round. What changes each time is how badly the room needed it, and few kickoffs needed it more than the one I ran for a Shopify-embedded course app whose completion rate had been flat for two quarters despite three separate "improve engagement" initiatives that had each shipped something and moved the number by approximately nothing.

## What it is, briefly

1-2-4-All runs in four steps: **1** minute of silent individual writing in response to a single sharp question, **2** minutes in pairs synthesizing the two individual answers into one, **4** minutes as pairs merge into fours and converge again, then a whole-group share where each foursome reports only their strongest idea. The entire sequence takes twelve to fifteen minutes regardless of room size, because the group-of-four ceiling means added headcount just adds more parallel groups, not more time per round. Its purpose is generating a wide, honestly-distributed set of ideas before anyone's stated opinion can anchor the room — full mechanics are in [the earlier post](/product-management/1-2-4-all-fast-group-ideation-for-a-new-pipeline-feature/) if you haven't run it before.

## The room I actually ran it in

The course app's product, instructional design, and support functions had each run their own investigation into low completion rates, and each had arrived at a theory that happened to justify more work in their own domain: product believed the course player UI was clunky and needed a redesign; instructional design believed course content was too long and needed re-authoring; support believed learners were getting stuck on enrollment and never really starting. All three theories were plausible. All three had already had money spent chasing them. None had moved the completion number.

When I got the three leads in a room together for the first time, I didn't ask "what's wrong with completion rates" — that question, asked open, would have produced three restatements of the three existing theories, each defended by the person who'd already spent budget on it. Sunk cost does real work in a room like that; nobody volunteers "actually my theory might be wrong" out loud in front of the person who approved their last project.

Instead I ran 1-2-4-All with the prompt: *"Think of one specific learner, real or composite, who started a course and didn't finish. What's the exact moment they probably stopped?"* Concrete-and-narrative beats abstract-and-diagnostic almost every time in a room with entrenched positions, because it's much harder to defend an abstract theory when the question demands a specific moment.

The silent minute is where the theories cracked. Two people — neither of them the instructional designer — independently wrote about a moment that wasn't in any of the three existing theories: learners who completed the first two modules at a decent clip, then stalled for exactly as long as the course's inactivity window, then received a generic "come back!" nudge email that referenced the course by its internal title rather than what the learner would recognize, and never returned. That's not a UI problem, a content-length problem, or an enrollment problem — it's a **re-engagement message that didn't work**, sitting downstream of all three existing theories and invisible to all three investigations because none of them had looked at what happened between session two and the point of no return.

By the fours round, this observation had merged with a related one from a third participant: the nudge email was sent by a generic lifecycle system that had never been updated with course-specific context, because no one owned that system's content — it was "marketing's email" running on autopilot. The whole-group share surfaced this as the strongest idea from two of the four small groups, independently, which is the signal that told me it wasn't a fluke of one talkative person's framing — it had held up under two separate rounds of peer synthesis with no shared conversation between them until the final share.

## Why the concrete prompt mattered as much as the structure

1-2-4-All's structure prevents domination, but it doesn't automatically prevent people from writing abstractions in their silent minute — "learners lose motivation" is a perfectly valid-looking answer to a vague prompt, and it's useless because it doesn't point anywhere actionable. The narrative framing — *one specific learner, one specific moment* — forced concreteness into the very first round, before the structure had a chance to matter. That's a lesson that generalizes past this workshop: the prompt design and the structure design are two separate jobs, and a great structure run on a mediocre question still produces mediocre output, just with better attendance and less domination.

The fix that came out of that session — rewriting the inactivity-window nudge to reference the specific course and specific next module, and moving ownership of that email from generic lifecycle marketing to the course team — was small, cheap, and untried by any of the three existing initiatives, because none of them had been looking at that seam. It moved completion measurably within the following cohort, which is a better result than either of the two proposed redesigns had managed at ten times the cost.

## Failure modes and when to skip it

The structure fails when the room has genuine hierarchy anxiety strong enough that even silent writing gets self-censored — if people believe their handwriting will be identified and held against them later, the silent minute stops being honest and the whole exercise inherits that dishonesty. Anonymous index cards instead of visible notebooks fix this when it's a real risk.

It also isn't the right tool for a room that's past ideation and needs to choose between three already-scoped options — that's a convergence problem, and running a divergent structure on it just generates a fourth option nobody asked to prioritize. And skip it entirely if you already have hard data that answers the question — if analytics clearly show the drop-off point, don't spend fifteen minutes generating hypotheses about where the drop-off is; go straight to generating hypotheses about *why*, which is a different, narrower question and probably wants a smaller conversation, not a whole-room opener.
