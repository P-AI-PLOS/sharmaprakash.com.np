---
title: "Design Storyboards: The Fourteen Days Between a New Hire and Their First Leave Request"
date: "2021-06-27T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Leave Balance had an onboarding flow, an import tool, and a welcome email — three teams' worth of work, and no one who could describe what a new employee actually experiences. Design Storyboards put the whole fortnight on one wall."
tags: [liberating-structures, leave-balance]
series: ls-design
seriesOrder: 7
use_featured_image: false
---

A support ticket landed that I couldn't classify. An employee at a three-hundred-person customer asked why the system said she had zero days of leave, three weeks after joining. Everything had worked: her record imported correctly, accrual started on her join date, her manager was assigned. The zero was accurate — that company's policy began accrual after a thirty-day probationary window, and she'd read the balance on day nineteen.

Nothing was broken and the experience was still terrible, which is the kind of problem no team owns. The import belonged to one squad, the balance view to another, the policy engine to a third, and each could show you a correct screen. Nobody could describe what the fourteen days after a start date actually *feel* like, in order. That's what **Design Storyboards** is for.

## What it is and how it runs

Design Storyboards is the Liberating Structure for making a plan or an experience visible as a sequence, in two passes.

The **big-picture pass** comes first: small groups draw four to eight panels covering the major chapters, end to end, with a rough time marker on each. Drawing, not writing. Fifteen minutes, deliberately tight, because the constraint forces a group to decide what counts as a chapter.

The **detailed pass** expands each panel: who does what, when, with what, and — the question that earns the exercise — *what does the person know at this moment?* Groups then walk each other's walls while the facilitator collects gaps.

Unlike a journey map, a mixed group builds it in an hour, and the panels carry real time markers — which makes waiting visible. Waiting is where most bad software experiences live, and it never appears on a screen flow.

## Running it on the first fortnight

Three groups: two engineers and a support lead, the designer and a customer success manager, and a mixed one. Same brief: *Sara joins on the 1st. Draw the fourteen days.*

The big-picture panels came out roughly consistent — imported, emailed, logs in, checks her balance, requests a day, manager approves — with one difference. The support lead's group drew a panel nobody else had: *day 9, Sara asks the person next to her how leave works here.* They drew it because that's the story they hear on every call, and by the end of the session it was the most important panel on any wall.

The detailed pass is where it fell apart productively. Panel by panel, we asked what Sara knows.

**Day 1, import.** Nothing; she isn't in the product yet, and her manager doesn't know she exists in it either. Our welcome email fired on import, which for this customer was eleven days before her start date — received, filed, forgotten.

**Day 4, first login.** She sees a balance of 0.0 days, a leave-year progress bar, and a working "Request leave" button. Nothing mentions probation. Every group independently wrote a variation of "she assumes the system is wrong or the company is stingy," and the CS manager confirmed both calls come in weekly.

**Day 9, asking a colleague.** What she learns depends on who's next to her, and is frequently wrong, because that colleague joined under a previous policy version.

**Day 19, ticket.** She writes to us rather than HR, because we're the name on the screen.

Laid out on a wall, the fix was embarrassingly small. Not an onboarding redesign — a sentence. The balance view needed to say *accrual starts 30 May, after your probation period; you'll have 1.75 days on 1 June*, and the welcome email needed to send on start date, not import date. A day and a half of work, sitting in the gap between three teams' features.

The day-9 panel got a real answer too: a plain-language "how leave works here" page generated from the company's own policy, linked from the balance view. It's now one of the most-visited pages in the product, and it exists because a support lead drew a stick figure turning to the desk next to her.

## Why the two passes matter

Doing the detailed pass first produces a screen inventory: every state of every view, no sense of the shape. The big-picture pass makes the group agree what the chapters *are* before anyone argues about a field, and one group's chapter boundary turns out to be another group's invisible gap.

The "what does she know at this moment" question is the part I'd keep if I could keep only one. Teams instinctively storyboard what the *system* does. Tracking the user's knowledge instead turns a correct sequence into a comprehensible one, and almost every gap we found was a moment where the system knew something the person didn't. Time markers do the rest: a storyboard with "day 4" and "day 9" on it makes a five-day silence physically visible, and someone always asks what happens in the gap.

## When to skip it

Storyboards need a protagonist with a continuous experience over time. An admin screen used twice a year has no fortnight to draw, and the exercise degenerates into an annotated flowchart.

Don't run it as a substitute for research. Our advantage was that the support lead genuinely knew the day-9 story; a room of people guessing produces a confident, fictional fortnight and then designs against it.

And don't let it become a deliverable. The value is in the argument and the gaps; a tidied-up version pasted into a document three weeks later is a diagram nobody reads and that's wrong by the next release. Photograph it, write the gaps down as work, and let the paper go.
