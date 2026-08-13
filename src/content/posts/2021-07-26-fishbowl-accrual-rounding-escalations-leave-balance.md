---
title: "Fishbowl: Letting the Whole Team Overhear the Argument"
date: "2021-07-26T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Four people had been fighting about half-day accrual rounding in a private thread for months. Putting them in a circle with fifteen colleagues silently listening around them ended the argument in fifty minutes."
tags: [liberating-structures, leave-balance]
series: ls-alignment
seriesOrder: 7
use_featured_image: false
---

Leave Balance accrues paid time off in fractions of a day, and what happens at the boundary — whether 7.4 accrued days shows an employee 7.5, 7, or 7.4 — had been an argument since before I joined. Four people held it: our two most senior backend engineers, the customer success lead who'd handled every rounding escalation for two years, and the compliance consultant we retained for jurisdiction rules. It lived in a Slack thread and resurfaced whenever a customer complained, without ever resolving.

Everyone else had opinions about it and none of the context. Every proposal from outside the four got shot down for a reason the proposer didn't know existed, and every proposal from inside looked, from outside, arbitrary.

We ran a **Fishbowl**. Fifty minutes, nineteen people, four of them talking.

## What it is

Fishbowl is the structure where a small group has the real conversation in an inner circle while everyone else sits around them and listens — genuinely listens, without commenting. It solves a specific problem: knowledge concentrated in a few people that the rest of the group needs, where a presentation would flatten it into false certainty.

The mechanics are simple and the discipline is everything. Two concentric rings. The inner circle — four to seven people — has the conversation; the outer circle stays silent, no interjections, no side chat. Twenty to thirty minutes, then a debrief where the outer circle finally speaks. There are variations with an empty chair outsiders may occupy; I use that selectively, because on a contentious topic it becomes a queue of people wanting to weigh in.

## Running it on accrual rounding

Inner circle: the two backend engineers, the CS lead, and the compliance consultant. Outer circle: fifteen people — the rest of engineering, support, the designer, two from sales. I gave the four a prompt and then muted the world.

The prompt: **"Walk through what happens today when an employee sees a number they think is wrong, and where you each think the real problem is."**

Nine minutes in, something surfaced I'd never heard in two years of watching that thread. The compliance consultant explained that in two supported jurisdictions, rounding *down* isn't a display choice but a legal exposure — the accrued balance is a statutory entitlement, and showing an employee less than they've accrued creates a documented under-statement. The CS lead, who'd been arguing for half-day rounding for readability, said on camera: "I did not know that. That changes my position."

That sentence had been unavailable to her for two years because the thread never had enough sustained bandwidth for the consultant to say the whole thing. Slack gives you a paragraph; a fishbowl gives you nine uninterrupted minutes and a listening audience.

The second half was better. One engineer laid out why exact-fraction display had been rejected in 2020: not because it was hard, but because the payroll export format two of our largest customers consume accepts two decimal places, so exact display would show employees numbers their own payslips would contradict. That's a constraint living in one person's head that looks, from outside, like stubbornness.

By minute twenty-five the four had converged on something none had proposed before: display the exact accrued value, round only at the export boundary, and surface that rounding explicitly in the UI so the discrepancy is explained rather than discovered.

Then the debrief. I asked the outer circle one question — **"What did you hear that you didn't know before?"** — and got the most useful twenty minutes of the day, including a support rep pointing out that our help-center article has said "rounded to the nearest half day" since 2019.

## Why watching beats being briefed

If those four had gone away, decided, and presented the outcome, the room would have received a conclusion. Instead it received the *reasoning*, including the parts where people changed their minds — what a summary always removes, and what produces actual buy-in.

There's a second effect that matters more for a long-running standoff: an audience changes how the inner circle argues. Positions hardened by repetition in a private thread have to be restated for people who haven't heard them, which forces reasons rather than shorthand. The engineer who'd been saying "we tried that, it doesn't work" for a year had to say the actual sentence about payroll export formats — and once said out loud it turned out to be solvable rather than final.

The silence rule protects both effects: fifteen people with opinions and no context would have derailed that conversation in ninety seconds. The debrief question is the other half. Ask "what do you think?" and you get fifteen opinions from people who just learned the topic. Ask what they heard that they didn't know, and you get the gaps.

## When to skip it

Skip it if the inner circle can't actually disagree in public. If the four include someone's manager and the gradient is steep, you'll get a performance — worse than a private argument, because now everyone believes it was settled. Skip it, too, if the topic has no genuine expertise concentration: Fishbowl earns its shape when a few people know something the room needs, and where everyone's equally informed you want 1-2-4-All instead. And don't use the empty chair on a hot topic unless you can enforce its rules.
