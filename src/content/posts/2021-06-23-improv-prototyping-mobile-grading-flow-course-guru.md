---
title: "Improv Prototyping with a Paper Phone: Designing Grading for the Back of a Taxi"
date: "2021-06-23T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Course Guru's instructors kept saying they'd grade assignments on their phone if they could. Instead of designing screens, we cut a phone out of card, made someone stand on a chair pretending to be a taxi, and acted it out."
tags: [liberating-structures, course-guru]
series: ls-design
seriesOrder: 5
use_featured_image: false
---

Every instructor interview we ran that spring turned up the same sentence in some form: *I'd grade in the gaps if I could do it on my phone.* Course Guru's grading lived in a desktop table view with a rubric panel, technically usable on a phone in the way a spreadsheet is technically usable on a phone. The design team had a Figma file with nine screens and an argument about whether the rubric should be a bottom sheet or a separate step.

That argument was unresolvable in Figma, because the disagreement wasn't about layout. It was about what a person can do in a four-minute gap while holding a bag. So we ran **Improv Prototyping** with a phone cut out of cereal-box card, and it settled in fifty minutes.

## How it runs

Small groups, a challenge, fifteen minutes to invent and rehearse a skit that enacts a solution, three to five minutes to perform it, feedback, then a second round where groups steal from what they watched. Props are deliberately crude: for an interface, a rectangle of card and a stack of sticky notes for screens, with someone playing the app and physically swapping notes as the user "taps."

Two constraints do most of the work. The person playing the app can only respond to what the user actually does — no narrating intent, no "and then they'd find the filter." And the scene has to include the real environment: not "an instructor grades an assignment," but *this* instructor, in this place, with this much attention available.

## Running it on mobile grading

Three groups. Challenge: *Meera has eleven ungraded submissions and is in a taxi for nine minutes. Show us what she gets done.* Two chairs for the taxi, one person per group playing the phone.

**Group one** built the obvious thing: a list of submissions, tap one, read it, open the rubric, score four criteria, save, back to the list. Performed, the skit died at "read it." The person playing Meera held the card phone up, scrolled a long essay with her thumb, and twelve seconds in said — in character, spontaneously — "I can't do this in a car." Everyone laughed and then went quiet, because the whole Figma file assumed she could.

**Group two** had gone for a swipe interaction — Tinder for assignments — which fell apart the moment their audience asked what happened when she swiped wrong. Their person-playing-the-phone had no answer, and the gap was worth more than a polished skit: a grade is a consequential, contested act, and speed with no visible undo makes it feel reckless. That went on the wall as a constraint rather than a screen.

**Group three** changed the scope of the task, and that's the one we built. Their Meera didn't grade in the taxi at all. She *triaged*: taps to mark which submissions looked complete, a flag on one that looked copied from another student, and a voice note saying "good structure, weak sources, expand in feedback." Nine minutes ended with nothing graded and eleven submissions sorted, annotated and queued — and the desktop session that evening starting from her own notes rather than cold.

The insight that split the room came from their second round. Somebody asked what the voice note was *for*, and the answer — "so tonight she isn't re-reading everything from scratch" — reframed the entire feature. We hadn't been asked for mobile grading. We'd been asked for a way to stop losing the thinking that happens when you first read something. Grading on a phone was the instructors' guess at a solution; the actual job was preserving a first impression until they had a keyboard.

We shipped triage, flags, and voice notes on mobile, and left full rubric grading on the desktop. The bottom-sheet-versus-step argument evaporated because the screen it was about didn't get built.

## Why the card phone matters

Enacting an interface forces sequencing and attention into the open. In a mockup, every screen is available at once to a reviewer with unlimited time. When one person physically hands another the next sticky note, every step that costs something becomes visible: the scroll, the wait, the moment the user looks up.

Improv also surfaces the environment, which static design almost never does. The taxi wasn't decoration. The instructor's real constraint isn't screen size — it's one hand, partial attention, and an unpredictable end to the session. Two chairs and a bag made that concrete in a way "mobile context" in a research summary had not. And the enacted version is falsifiable in front of everyone: "I can't do this in a car" ended a three-week disagreement in one improvised line, because the room watched it be true rather than debating whether it might be.

## When to skip it

Improv Prototyping is for interactions, not systems. If you're designing a data model, a pricing structure, or a permissions matrix, there's nothing to enact.

It's also unreliable when the room doesn't know the user. Our groups could play an instructor because we'd sat with several; a group improvising a persona they've only read about produces a character shaped like the team's assumptions, then treats the skit as validation.

And don't confuse a skit with a spec. That session produced a scope decision and three constraints, not a build-ready flow. Somebody still had to work out what a voice note means for storage, transcription, and the student's view of their own feedback — none of which a person holding a piece of card is going to tell you.
