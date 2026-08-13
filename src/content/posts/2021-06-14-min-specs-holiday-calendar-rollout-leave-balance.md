---
title: "Min Specs for a Rollout: The Four Rules a Holiday Calendar Launch Couldn't Break"
date: "2021-06-14T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Leave Balance was shipping multi-country public-holiday calendars to 400 companies at once, and the rollout checklist had grown to thirty-one items. Min Specs found the four that would actually have caused a failure — and one nobody had written down."
tags: [liberating-structures, leave-balance]
series: ls-design
seriesOrder: 2
use_featured_image: false
---

Two weeks before Leave Balance shipped multi-country public-holiday calendars, the rollout checklist had thirty-one items on it and was still growing by about two a day. Staged rollout percentages, a comms email, an in-app tour, a backfill script, a rollback plan, a support macro, a webinar for HR admins, a changelog post, a preview sandbox. Nobody had added anything unreasonable. Collectively it was two unbudgeted weeks of work, defended by the fact that every single item was, in isolation, a good idea.

Min Specs is built for exactly this: not for cutting a feature, but for finding out which of the rules a team has quietly imposed on itself are load-bearing.

## The structure, briefly

You write the purpose down first. Then the group lists **max specs** — every must-do and must-not-do it currently believes in — and then tests each one with a single question: *if we broke this rule, could we still achieve the purpose?* Yes means it comes off the list. What survives is the min spec set, and it's usually a fraction of what you started with.

The mechanics I use: individuals write max specs silently for four minutes, groups of three consolidate onto a wall for ten, then the whole room runs the elimination test together, item by item. The elimination has to be plenary — in small groups people trade, *I'll grant you yours if you grant me mine*, and you end up with a merged list rather than a tested one.

## Running it on the holiday-calendar launch

The purpose we agreed on: *nobody's approved leave changes underneath them, and no HR admin discovers a wrong holiday from an employee.* Written in failure terms, deliberately, because a rollout's purpose is nearly always about what must not happen.

Thirty-one items, roughly forty minutes of testing. Most of it went fast.

**The webinar for HR admins.** Break it — don't run one. Does anyone's approved leave change? Does an admin find out from an employee? No, and no. Off the list — it was there because a previous launch's webinar had gone well.

**The in-app tour.** Same answer. Off. Someone argued adoption would suffer, which is probably true and is not the purpose we wrote down; it became a follow-up rather than a launch gate. **Changelog post, comms email, support macro** went the same way — the macro moved to "before we get the first ticket," a different deadline than "before we ship."

**Staged rollout by percentage.** This one felt untouchable and didn't survive. Percentage staging spreads a bad calendar across a random 5% of companies. It doesn't prevent the failure, it just makes it smaller and harder to notice. What survived instead was a rewritten spec: *must roll out country by country, starting with the two calendars we can verify by hand.* Same instinct, different rule, and a genuinely better one.

**Must not silently alter an already-approved leave request.** Survived instantly. Break it and the purpose is dead in one sentence.

**Must show which calendar a day came from on the request itself.** Survived. Without it an admin can't tell a wrong holiday from a wrong policy, so they find out when the employee complains.

**Must have a one-command rollback to the prior calendar assignment.** Survived — not because rollbacks are virtuous, but because without one, discovering a wrong calendar and fixing it are days apart.

And then the item that wasn't on the list. Testing the rollback spec, someone asked what happens to leave requests submitted *during* a wrong calendar's window. Nobody knew. That produced the fourth min spec — *must not apply a calendar change retroactively to requests already submitted* — the most important thing to come out of the session, invisible in a thirty-one-item checklist because checklists collect ideas, not risks.

Four specs. We shipped nine days earlier than the checklist implied, country by country, and the one bad calendar we did ship — a regional holiday in one state that shouldn't have applied nationally — was caught by an admin looking at the source label on a request, which is exactly what min spec three was for.

## Why it works on rollouts specifically

Launch checklists accrete. Each item is a scar from a previous launch, and nobody removes anything, because removing it feels like inviting the failure it was added for. Min Specs gives the group a legitimate procedure for removal: the item didn't lose a vote, it failed a test against a purpose everyone endorsed. That's socially survivable in a way "we're cutting the webinar" is not.

The second effect: testing a rule properly sometimes reveals it was a *proxy* for what you actually needed. Percentage staging was a proxy for verification, and the replacement was cheaper and worked better.

## Where it breaks

If the purpose is written aspirationally — "a smooth, delightful launch" — nothing gets eliminated, because anything can be argued to serve delight. Write rollout purposes as the failures you refuse to accept.

Don't run it on regulatory or contractual obligations. A team that gets used to eliminating specs will eventually test one it had no authority to test. Name those as fixed before the wall goes up.

And Min Specs tells you what's essential, not what's sufficient. Four min specs is a floor, not a plan — you still need someone to work out how to verify two calendars by hand, and that work doesn't appear on a min spec wall.
