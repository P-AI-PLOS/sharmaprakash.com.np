---
title: "Appreciative Interviews: Rooting New Course-Platform Ideas in What Already Works"
date: "2021-02-05T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Before scoping a new instructor-facing feature, we interviewed the instructors whose courses were already thriving — not about their problems, but about the specific moments things went right. The features that came out of it looked nothing like a typical feature-request backlog."
tags: [liberating-structures, course-guru]
series: ls-discovery
seriesOrder: 9
use_featured_image: false
---

We were about to run our usual instructor-feedback cycle ahead of a planning quarter — the standard format, where you ask instructors what's frustrating them and turn the loudest complaints into tickets. I'd run that cycle enough times to know its ceiling: it reliably produces a backlog of irritations (slow upload times, a confusing curriculum reorder UI, a pricing screen nobody likes) and almost never produces an idea for something genuinely new, because complaints describe the boundary of what's broken, not the shape of what's working well enough to build more of. So instead, for the "what's next" half of the cycle, we ran **Appreciative Interviews** — a structure built specifically to surface future direction from past success rather than from present frustration.

## What it is

Appreciative Interviews comes out of the Appreciative Inquiry tradition (David Cooperrider) and Liberating Structures packages it as a simple paired format: participants interview each other, in turn, about a specific positive experience related to the topic at hand — not a general "what do you like," but a concrete story with detail. The canonical prompt shape is: *tell me about a specific time when [the thing you're exploring] worked really well for you. What happened? Who was involved? What made it possible? What did it feel like?*

After the paired interviews, the group reconvenes and each pair shares — not a summary, but the actual story, in enough detail that patterns across stories become visible to the room. The facilitator (or the group together) then names the recurring themes: the conditions, behaviors, or design choices that show up across multiple independent stories of success. Those themes become the seed for what to build or do more of, rooted in evidence that they already work rather than in a hypothesis about what might.

The discipline that makes it work is insisting on a *specific* story, not a general opinion. "I think students engage well when courses have video" is an opinion and produces nothing actionable. "Let me tell you about the week I recorded a two-minute video responding to a specific student's confused comment on lesson four, and enrollment in that lesson's follow-on module tripled" is a story, and stories carry the detail that generalizations discard.

## Running it with instructors

We paired eight instructors whose courses had strong completion and repeat-enrollment numbers, and asked each to tell their partner about a specific time something in their course really worked — a moment students responded to unusually well.

The stories, once shared back to the group, clustered around a theme nobody on the product team had named before: nearly every story involved the instructor doing something *unscripted and responsive* mid-course — replying personally to a stuck student's comment with a short video, adjusting an upcoming lesson because several students asked the same question in a discussion thread, posting an update acknowledging something the course material had gotten wrong. None of the standout stories were about the polished, pre-recorded curriculum itself. They were about a live, visible responsiveness layered on top of it.

One instructor's story was specific enough to build from directly: a student had left a long, frustrated comment on a mid-course quiz, convinced the material hadn't prepared her for it. Instead of a generic reply, the instructor recorded a three-minute video walking through exactly that quiz's logic, posted it as a reply, and — because the comment thread was visible to the whole cohort — every other student who'd had the same silent confusion saw the fix too. Completion for that cohort, on that specific module, was measurably higher than prior cohorts. The instructor hadn't planned this as a retention strategy; she'd just responded to one visibly frustrated student and the response happened to help everyone quietly struggling with the same thing.

That pattern — instructor responsiveness, made visible to the whole cohort rather than resolved privately — became the seed for a feature nobody had scoped before the session: a lightweight, threaded Q&A surface attached to each lesson, with instructor replies (text or quick video) visible to every enrolled student by default, rather than the private-message system we'd been quietly planning to expand instead. The private-message plan had come out of the standard complaint-driven cycle (students wanted faster instructor responses); the Appreciative Interviews cycle revealed that the *visibility* of the response, not just its speed, was what made the successful stories work — a distinction a complaints-based process would never have surfaced, because nobody complains "my problem got solved, but privately."

## Why starting from success changes what gets proposed

A complaint-driven process is anchored on absence — it tells you what's missing or broken, and the natural fix is to patch the gap. An appreciative process is anchored on presence — it tells you what's already generating value, in enough concrete detail to see *why*, and the natural next step is to design more opportunities for that specific thing to happen, deliberately, rather than by accident. The Q&A-visibility feature is a good example of the difference: it wasn't a fix for a stated problem, it was an attempt to manufacture, systematically, the conditions under which an accidental success (one instructor's improvised video reply) had occurred.

It also produces a very different emotional tone in the room. Instructors telling stories about their own best moments are proud and generous with detail; instructors listing frustrations are guarded and terse. The former format simply extracts more usable specificity per minute of conversation.

## Failure modes and when to skip it

Appreciative Interviews fails if the facilitator lets stories stay abstract — "students really engage with my course" is not a story, and the interviewer's job is to keep asking "tell me about one specific time" until concrete detail appears. It also depends on genuinely having positive experiences to draw from; running it with instructors whose courses are all struggling produces thin, strained stories and probably signals you need a different discovery method (or a more basic fix) first.

It's the wrong tool when the actual need is diagnostic — if you need to understand why something is failing, appreciative framing will systematically steer the conversation away from the failure. And don't treat the resulting themes as validated product decisions on their own; they're strong hypotheses rooted in real evidence, generated from a handful of stories, and still need the usual scoping and testing before becoming a committed roadmap item.
