---
title: "Purpose-to-Practice: When the Practices Step Kills the Purpose You Started With"
date: "2021-09-06T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Course Guru's cohort-courses initiative had a purpose everyone nodded at for ninety minutes. It survived until the group had to name what they'd actually do on Monday — and then it fell apart, which is exactly what Purpose-to-Practice is built to make happen early."
tags: [liberating-structures, course-guru]
series: ls-culture
seriesOrder: 2
use_featured_image: false
---

Ninety minutes into chartering Course Guru's cohort-courses initiative, the room had a purpose statement everyone genuinely liked: *help instructors turn a self-paced course into a live cohort so learners finish.* Nobody argued. It felt done. Then we got to the last element of **Purpose-to-Practice** — what will we actually do first — and the whole thing came apart in about twelve minutes, which saved us a quarter.

That collapse is a feature. Purpose-to-Practice is designed so the cheap conceptual agreement at the start has to survive the concrete commitments at the end, and when it doesn't, you loop back and fix the purpose rather than shipping against a slogan.

## The structure, briefly

P2P settles five elements for an initiative, in sequence, each worked through 1-2-4-All: **Purpose** (why this matters), **Principles** (the must-dos and must-not-dos that serve it), **Participants** (who must be in), **Structure** (how control is distributed), and **Practices** (what we do, starting Monday). It takes two to three hours for something real, and the sequence is explicitly iterative — later elements are allowed, and expected, to send you back to earlier ones.

I ran it with two engineers, a designer, the instructor-success lead, and one actual instructor who taught a 900-student photography course on the platform. Inviting a customer into a chartering session is unusual and it was the best decision of the day.

## Where it broke

**Purpose**, first pass: *help instructors run live cohorts so learners finish.* Fine.

**Principles** went smoothly too. Must-do: an instructor can run their first cohort without a synchronous call with our team. Must-not-do: never require learners to be online at a fixed time — the platform's biggest markets span eleven time zones.

**Participants** added the payments engineer, because cohort pricing meant scheduled enrollment windows and refund rules nobody had thought about.

**Structure**: the instructor-success lead could approve cohort features that only affected instructor tooling; anything touching learner-facing enrollment went through the core product review.

Then **Practices**. The question is deliberately blunt — what do we do first? The instructor in the room answered it honestly: "I wouldn't use any of this. My completion problem isn't that the course is self-paced. It's that people buy it in a burst of motivation in January and never open it. A cohort start date in March doesn't fix that; it just moves the abandonment."

That is a purpose problem wearing a practices costume. The stated purpose assumed liveness caused completion. The one person in the room who had watched 900 learners actually behave said the causal chain ran through *purchase-to-first-session latency* instead. We went back to Purpose — the loop that P2P explicitly allows — and rewrote it: *get a learner to their first meaningful session within 72 hours of purchase.* Cohorts became one candidate mechanism for that, not the goal itself.

The Practices list that came out was consequently cheap and testable: instrument time-from-purchase-to-first-lesson across the top 200 courses, run a two-week nudge experiment on three of them, and only then decide whether scheduled cohorts earn a quarter of engineering.

## Why the loop matters more than the elements

Any decent planning template will get you a purpose, principles, and a work plan. What P2P does that a template doesn't is refuse to let the purpose stay abstract. The Practices step forces the group to name something specific enough to start on Monday, and specificity is where wrong assumptions become visible. A purpose like "help instructors run cohorts so learners finish" contains a causal claim — liveness drives completion — that nobody can dispute while it stays at that altitude. Ask what you'd build first and the claim has to stand on its own.

The 1-2-4-All inside each element does the other half of the work. Our instructor would not have volunteered "I wouldn't use any of this" into an open discussion in a room of the platform's own staff. He wrote it down alone, said it to one person, and by the time it reached the full group it was a shared observation rather than a customer complaining. That's the whole point of the nested structure: it lets the most inconvenient input in the room arrive with company.

## When to skip it, and how it fails

P2P fails badly when the room can't actually change the purpose. If the cohort feature had already been sold to three enterprise accounts with contractual dates, the honest move would have been to skip P2P and run a design workshop on constraints instead — a chartering structure that discovers "we should build something else" is worse than useless when "something else" isn't available.

It also degrades if you rush the front half. Teams under time pressure tend to sprint through Purpose and Principles to get to Practices, which is the fun part, and end up with a work plan that looks decisive and rests on nothing. If you only have ninety minutes, do Purpose and Principles properly and schedule the rest; a half-finished P2P beats a complete one done at speed.

And don't run it with only the builders in the room. The value here came from someone who would live with the result and had no stake in the plan looking good.
