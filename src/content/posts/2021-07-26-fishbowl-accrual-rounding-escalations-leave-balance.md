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

Leave Balance accrues paid time off in fractions of a day, and what happens at the boundary — whether 7.4 accrued days shows an employee 7.5, 7, or 7.4 — had been an argument since before I joined. Four people held it: our two most senior backend engineers, the customer success lead who'd handled every rounding escalation for two years, and the compliance consultant we retained for jurisdiction rules. It lived in a Slack thread, resurfaced every time a customer complained, and consumed maybe six hours a month of very expensive attention without ever resolving.

Everyone else at the company had opinions about it and none of the context. Which meant every proposal from outside the four got shot down for a reason the proposer didn't know existed, and every proposal from inside the four got treated by everyone else as arbitrary.

We ran a **Fishbowl**. Fifty minutes, nineteen people in the room, four of them talking.

## What it is

Fishbowl is the structure where a small group has the real conversation in an inner circle while everyone else sits in an outer circle and listens — genuinely listens, without commenting. It's ancient as a form and part of the Liberating Structures set because of what it does to a specific problem: knowledge concentrated in a few people that the rest of the group needs, in a situation where a presentation would flatten it into false certainty.

The mechanics are simple and the discipline is everything. Chairs in two concentric rings. The inner circle — usually four to seven people — has the conversation. The outer circle stays silent, no interjections, no side chat. There are variations with an empty chair in the inner circle that anyone from outside may temporarily occupy, and I use that one selectively; on a contentious topic it can turn into a queue of people wanting to weigh in, which is not what the structure is for.

Twenty to thirty minutes of inner-circle conversation, then a debrief where the outer circle finally gets to speak — but the debrief question matters enormously, and I'll come back to that.

## Running it on accrual rounding

Inner circle: the two backend engineers, the CS lead, the compliance consultant, on a video call with cameras on. Outer circle: fifteen people — the rest of engineering, support, the designer, two people from sales. I gave the inner four a prompt and then muted the world.

The prompt: **"Walk through what happens today when an employee sees a number they think is wrong, and where you each think the real problem is."**

It took nine minutes for something to come out that I had never heard in two years of watching that thread. The compliance consultant explained that in two of our supported jurisdictions, rounding *down* is not a display choice but a legal exposure — the accrued balance is a statutory entitlement, and showing an employee less than they've accrued creates a documented under-statement. The CS lead, who had been arguing for rounding to half-days for readability, said on camera, "I did not know that. That changes my position."

That sentence had been unavailable to her for two years because the thread had never had enough sustained bandwidth for the consultant to say the whole thing. Slack gives you a paragraph. A fishbowl gives you nine uninterrupted minutes and a listening audience, which is a completely different medium.

The second half was better still. One of the engineers laid out, in front of everyone, why exact-fraction display had been rejected in 2020 — not because it was hard, but because the payroll export format two of our largest customers consume accepts two decimal places, so exact display would show employees numbers their own payslips would contradict. That's a constraint that lives in one person's head and looks, from outside, like stubbornness.

By minute twenty-five the inner four had converged on something none of them had proposed before: display the exact accrued value, round only at the export boundary, and surface the export rounding explicitly in the UI so the discrepancy is explained rather than discovered. The two engineers and the CS lead agreed in the room.

Then the debrief. I asked the outer circle one question — **"What did you hear that you didn't know before?"** — and got twenty minutes of the most useful material of the day, including a support rep pointing out that our help-center article on accrual has said "rounded to the nearest half day" since 2019 and would need to change, and a salesperson noting that two enterprise prospects had asked about accrual precision during security review and he'd been guessing at the answer.

## Why watching beats being briefed

If those four had gone away, decided, and presented the outcome, the room would have received a conclusion. Instead the room received the *reasoning*, including the parts where people changed their minds, which is the part a summary always removes and the part that produces actual buy-in.

There's a second effect that matters more for a long-running standoff: an audience changes how the inner circle argues. Positions that have hardened through repetition in a private thread get restated for people who haven't heard them, and restating for a fresh audience forces you to give the reasons rather than the shorthand. The engineer who'd been saying "we tried that, it doesn't work" in Slack for a year had to say the actual sentence about payroll export formats — and once it was said out loud it turned out to be solvable rather than final.

The silence rule is what protects both effects. Fifteen people with opinions and no context would have derailed that conversation in ninety seconds. Keeping them silent isn't disrespect; it's the thing that makes it safe for the four to have a real argument in front of them.

The debrief question is the other half. Ask "what do you think?" and you get fifteen opinions about accrual rounding from people who just learned the topic. Ask "what did you hear that you didn't know?" and you get the gaps — the help-center article, the security-review answers — which is exactly what the outer circle is uniquely positioned to notice.

## When to skip it

Skip it if the inner circle can't actually disagree in public. If the four include someone's manager and the power gradient is steep, you'll get a performance, and a watched performance is worse than a private argument because now everyone believes it was settled.

Skip it if the topic has no genuine expertise concentration. Fishbowl earns its shape when a few people know something the room needs; on a topic where everyone's equally informed, use 1-2-4-All and get everybody talking instead.

And don't use the empty chair on a hot topic unless you have the standing to enforce its rules. It's a lovely variation for exploratory conversations and a reliable way to turn a contested one into an open-mic session.
