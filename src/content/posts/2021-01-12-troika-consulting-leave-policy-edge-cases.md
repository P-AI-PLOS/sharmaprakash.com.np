---
title: "Troika Consulting for the Policy Edge Case Nobody Wants to Own"
date: "2021-01-12T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Carry-over rules for part-time employees who changed hours mid-year aren't a bug — they're a genuinely hard judgment call, and one PM staring at them alone tends to just pick the easiest-to-code answer. Troika Consulting gets better judgment into the room fast."
tags: [liberating-structures, leave-balance]
series: ls-discovery
seriesOrder: 2
use_featured_image: false
---

The ticket had been sitting in "needs decision" for three weeks: how should accrued leave carry over for an employee who worked full-time for eight months, dropped to three days a week, and is now asking whether their carry-over cap should be prorated for the part of the year they were full-time. There's no single correct answer here — different leave policies (and different countries' labor law) genuinely disagree — which is exactly why it had been sitting untouched. Our PM had a strong instinct ("just prorate the whole year") but no confidence it was right, and every time she raised it in a standup, the conversation drifted to a different edge case entirely.

I'd used **Troika Consulting** the week before on an unrelated engineering problem (a flaky-test triage, covered in [the previous post in this series](/product-management/troika-consulting-flaky-test-triage/)) and it occurred to me the same structure — designed for exactly one stuck person with one real question — works just as well on policy judgment calls as it does on debugging.

## The structure, briefly

Troika Consulting runs in trios: one **client** with a real, specific question, two **consultants**. Five timed rounds — client states the problem (1-2 min), consultants ask clarifying questions only (2-3 min), consultants discuss the problem *to each other* while the client silently listens without turning to face them (4-5 min), client reports what they're taking (1-2 min), then rotate roles. A room can run many trios in parallel; the only global constraint is the clock.

The mechanic that makes it more than a meeting is step three: the client is deliberately excluded from responding while solutions are floated. That single rule stops consultants from pitching *at* the client (which triggers defensiveness) and stops the client from anchoring the conversation on their own pre-existing lean (which, in this case, was "just prorate the whole year" — reasonable, but untested against people who'd actually implement it or live under it).

## Applying it to the carry-over question

I pulled three people who each had a different, legitimate stake: the PM with the question, our support lead (who fields the "why is my balance wrong" tickets), and an engineer who'd built the accrual calculation and knew exactly where the prorating logic would get gnarly.

**Client statement:** "When someone's weekly hours change mid-year, how should their carry-over cap adjust — prorate the whole year retroactively, apply the new cap only going forward, or something else? I lean toward full retroactive proration but I'm not confident."

**Clarifying questions** surfaced a fact that reframed the whole thing: this wasn't a hypothetical, it was already true for six current employees, and the current system silently applied the *old* full-time cap to all of them — a quiet bug masquerading as an unresolved policy question. That single fact turned "what should the policy be" into "what should the policy be, and how do we retroactively fix six real people's balances without making anyone's number go down unfairly."

**Backs turned, consultants talking to each other** (not to the PM): the support lead raised that from the tickets she'd seen, employees care far more about a balance never *decreasing* unexpectedly than about theoretical fairness — a principle the PM hadn't weighted highly because she was solving it as a math problem, not a trust problem. The engineer, freed from having to convince the PM directly, floated a genuinely better technical answer than either "fully retroactive" or "forward-only": prorate going forward from the day hours changed, but let anyone whose recalculated cap would be *lower* keep their higher number until it naturally decays through use — a hybrid neither the PM nor a single conversation would likely have produced, because it requires holding both the fairness argument and the trust argument at once, which is easier for two people bouncing ideas off each other than one person under scrutiny.

**Client reports back:** the PM took the hybrid approach, plus the crucial finding that six real employees needed a fix now, not a future-only policy. That second part — surfaced only because clarifying questions are a mandatory step, not an optional one — was arguably the more important output of the whole session.

Two more rotations that morning handled a different open question (how sabbatical time should interact with the same cap) and a genuinely orthogonal one (whether managers should see direct reports' full accrual history or just current balance). Ninety minutes, three real decisions, none of which had moved in three weeks of async ticket comments.

## Why this beats "get more opinions in a doc"

The instinctive alternative — post the question in Slack, tag five people, let opinions accumulate — produces a comment thread where everyone anchors on whoever answered first, and the PM (or whoever owns the ticket) is left synthesizing five overlapping half-opinions alone at 6pm. Troika Consulting forces synthesis to happen live, between two people who have to actually reconcile their views with each other in front of (but not with) the person who'll act on it. The client leaves with a decision, not a thread to summarize.

It's also faster than it looks on paper. Five minutes per round times five rounds is twenty-five minutes for three rotations of a three-person trio — cheaper than the single one-hour meeting these questions usually get scheduled for, and it produces three resolved questions instead of one half-resolved one.

## Failure modes and when to skip it

Troika Consulting needs a genuinely undecided, specific question with a real owner. "What should our leave policy be" is too broad — that's a policy-design exercise, not a Troika question. "Should Priya's specific carry-over cap prorate retroactively" is exactly right-sized. If you can't state the question in one sentence with a clear "I" in it (I lean toward X, I'm unsure about Y), the format won't hold.

It also depends on picking consultants who genuinely disagree or hold different information — same-perspective trios just produce faster consensus on the client's original lean, which defeats the purpose. And don't use it to launder a decision that's actually already been made higher up; if legal or leadership has mandated an answer, Troika Consulting on a foregone conclusion reads as theater and burns the trust you'll need the next time a question is genuinely open.
