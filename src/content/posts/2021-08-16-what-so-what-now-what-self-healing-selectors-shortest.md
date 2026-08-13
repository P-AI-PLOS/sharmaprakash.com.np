---
title: "What, So What, Now What: Debriefing a Rollout That Went Green and Broke Anyway"
date: "2021-08-16T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Our self-healing selectors shipped to beta, and for nine days a customer's checkout suite passed while the checkout was broken. The retro opened with a theory instead of a fact — so we threw the agenda out and climbed the ladder one rung at a time."
tags: [liberating-structures, shortest]
series: ls-retro
seriesOrder: 1
use_featured_image: false
---

Nine days. That's how long the self-healing selector feature sat in beta, quietly repairing broken selectors in a customer's checkout suite, while the checkout itself was broken. The healer had lost the `#place-order` button after a DOM refactor on the customer's side, gone looking for the nearest plausible match, and latched onto a "Continue" button in an address-confirmation modal. Every run went green. The customer found out from their own users.

The retro invite went out with a subject line that already contained the conclusion: "shipping too fast — beta process retro." Someone had decided what the lesson was before anyone had agreed what happened. So I threw the agenda away and ran **What, So What, Now What** instead, which is the Liberating Structure that exists specifically to stop a room from jumping to the third question before it has honestly answered the first.

## Three rungs, in order, and you can't skip one

The structure is a debrief ladder with three rounds, each run as 1-2-4-All — individual reflection, then pairs, then quartets, then a whole-group harvest:

1. **What?** Facts only. What did you observe, hear, read, or do? No interpretation, no "because," no blame. Just what a camera would have caught.
2. **So what?** Meaning. What do those facts imply? What patterns are showing? What hypotheses do they support — and which ones do they kill?
3. **Now what?** Action. Given the meaning we just built, what do we do next, who does it, and by when?

Roughly fifteen minutes a rung. The facilitator has one real job, and it's unpopular: policing the boundary between rounds. Every "we shipped too fast" in round one gets gently bounced — that's a So What, park it. Every "we should add a canary" in round two gets bounced too. The discipline feels pedantic for about four minutes and then starts paying.

## Running it on the nine silent days

**What.** The facts round produced things nobody had put in one place. The healer logged every repair it made — 341 across the beta cohort in nine days — into a service we had no dashboard for. There was no alerting on green-run-rate changes, because green runs aren't an alert condition. The customer's DOM refactor shipped on day one of the nine. One of our engineers had noticed the repair count climbing on day four, said so in a channel, and gotten no reply because everyone read it as a feature working. And the beta's acceptance criteria said "healed selectors resolve to a visually equivalent element" — a phrase written by three people who each meant something different by "equivalent."

None of that was in the invite's theory.

**So what.** With those facts on the wall, the meaning round went somewhere the pre-baked conclusion never would have. The failure wasn't speed. It was that we had built a feature whose entire job is to make failures disappear, and shipped it with no mechanism for noticing when it disappeared the wrong ones. A self-healing tool inverts the normal signal: a rising repair count is the only place the trouble shows, and that number was going to a log nobody watched. Two quartets independently landed on the same sentence — "green stopped meaning anything and we didn't build a way to know" — which is the convergence you hope for and rarely get.

**Now what.** Four commitments, all small enough to be real: a repair-rate panel with a threshold alert; healed selectors surfaced in the run summary rather than only in logs; a hard rule that the healer refuses to cross a container boundary when hunting for a match; and a rewrite of that "visually equivalent" criterion into something testable. Owners and dates on each. Nothing about shipping slower — by then nobody believed that was the problem.

## Why the wall between rungs does the work

Retros collapse in a predictable way: someone offers an interpretation in the first two minutes, the group starts arguing about that interpretation, and the facts that would have settled it never get said out loud because the conversation has already moved to solutions. What, So What, Now What blocks that path structurally rather than through facilitator charisma. You cannot argue about meaning during a round where meaning is out of bounds.

The 1-2-4-All engine underneath matters just as much. The engineer who'd noticed the repair count on day four was never going to volunteer that in a plenary post-incident meeting — it sounds like a confession. Writing it alone, saying it to one person, then having that pair carry it into a quartet launders it into a shared fact by the time it reaches the room.

## When I don't reach for it

It needs facts worth gathering. Debriefing a two-day spike where everyone was in the same three conversations produces a What round that's just people repeating each other. It also assumes enough safety to say observable things about your own work in front of the group — run it with a manager present who's already told the room the answer, and you'll get a facts round that's a careful selection of facts.

And it's a debrief, not a decision structure. If the real question is "which of these two architectures do we pick," this will walk you politely through history and hand you back the argument unresolved.
