---
title: "Backlog Cleanup: How to Actually Do It"
date: "2026-07-07T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A 900-item backlog feels like diligence and functions as denial. Here's the working playbook for rescuing a rotten one: the deletion pass, the now/next/never triage, the hard cap, and the standing hygiene rules that stop it from growing back — plus why the fear of losing important ideas is the least justified fear in product work."
use_featured_image: false
series: agile-first-principles
seriesOrder: 3
---

The backlog had 1,147 items when I opened it. A fintech client had asked me to help their team "get back on top of prioritization," and the first thing I did was sort their tracker by creation date. The oldest ticket was four and a half years old — older than every current member of the team. It requested a CSV export for a report that no longer existed, filed by a customer who had churned in the interim, referencing a pricing tier that had been retired twice over. It had been groomed. Someone, at some point, had given it a story-point estimate. Nobody could tell me why it was still open, and everybody could tell me why it couldn't be closed: *what if it's important?*

That question — asked reflexively, about an item nobody had touched in four years — is the whole disease. **A big backlog feels like diligence and functions as denial: it's the place where a team stores every decision it's unwilling to make, filed under the pretense that filing is a plan.**

## Why backlogs rot

Nobody sets out to build a 1,147-item backlog. It accretes, and it accretes for reasons that are individually reasonable and collectively fatal.

The first is that "I'll add it to the backlog" is the most polite sentence in product management. It's how you say no to a stakeholder without saying no — the request gets a ticket, the requester gets the feeling of being heard, the meeting ends pleasantly, and everyone leaves knowing (but not saying) that the ticket will never ship. Do this for every sales escalation, every executive drive-by, every customer call, every retro action item, and the backlog stops being a plan and becomes a diplomatic archive: a record of every conflict the team resolved by deferring it. I've started calling these graveyards political, because that's what they are — each ancient ticket is a small treaty, and closing it feels like breaking one.

The second reason is compounding. Ticket age doesn't just accumulate; it compounds, because old tickets make the backlog harder to prioritize, which makes grooming sessions more miserable, which makes people skip them, which lets more tickets age. Past a few hundred items, no human can rank the list — so nobody ranks it, and the team quietly switches to prioritizing whatever's loudest this week while the backlog sits underneath as ballast. The tell is a team that has a prioritization framework and a backlog nobody has read end to end in a year. The framework is being applied to the top twenty items; the other thousand exist to make everyone feel thorough.

And the third reason keeps the first two in place: a full backlog *looks* responsible. "We've captured 1,100 opportunities" sounds like rigor; "we deleted 900 tickets" sounds like negligence. So the incentive gradient points permanently toward accumulation — which is why cleanup never happens by drift, only by decision. It's the same trap from [the previous post on running agile without a brand-name framework](/product-management/agile-without-scrum-or-kanban/): the artifact outlives the purpose, and maintaining the artifact starts to feel like doing the work.

## Step one: the deletion pass

Every real cleanup I've run starts the same way, and it's the step teams resist hardest: delete, in bulk, everything that's old.

The mechanical version: auto-close every item untouched in six months or more, with a standard note — *closed for age; if this still matters, it will come back.* No individual review, no committee, no last-chance grooming session where each ticket gets a hearing. The hearing is the trap; at ten minutes per ticket, reviewing 900 of them is a quarter of a person-year spent adjudicating things nobody has cared about since last winter. Close them all, keep the search index, move on.

The objection arrives instantly and it's always the same: *we'll lose important ideas.* Here's the finding from every team I've watched do this, and I mean every one — **almost nothing comes back.** At the fintech client we closed a little over 900 items; in the following six months, eleven came back, and every one of the eleven came back because a customer or a metric re-raised it, not because someone missed the ticket. That's not the process failing to protect important ideas. That's the process *measuring* which ideas were important, at a cost of zero, and the measurement said: about one percent. The silence after a mass closure isn't luck. It's the answer.

The deeper point is worth saying plainly: the backlog is not your memory. Your customers are your memory — a genuinely important problem gets re-reported, because it keeps hurting people. Your metrics are your memory — a real gap shows up in churn and support volume whether or not a ticket exists for it. An idea that lives *only* in a four-year-old ticket, sustained by no customer voice and no data, isn't a preserved insight. It's a dead one, embalmed.

For a team that can't stomach the auto-close, there's the honest extreme: **backlog bankruptcy.** Close everything, keep the current sprint and the next few weeks of committed work, rebuild from live signals. I've seen it done twice. Both teams described the following month the same way — like taking off a backpack they'd forgotten they were wearing.

## Step two: triage the survivors into now, next, never

What survives the deletion pass — the recent, the touched, the still-warm — gets exactly three buckets.

**Now** is committed work: this cycle, named owners, no ambiguity. **Next** is the short queue behind it — things you genuinely expect to start within a quarter, which means the bucket has a size limit by definition. And **never** is the bucket that does the real work, because *never gets said out loud*. Not "backlog," not "icebox," not "future considerations" — closed, with a reason, communicated to whoever asked. "We looked at this and we're not going to do it, because it serves a segment we've deprioritized" costs one uncomfortable minute and repays it forever: the requester stops waiting, stops asking for status, and — this part surprised me the first time — usually respects the answer. The polite deferral was never fooling them anyway. Every stakeholder with a year of tenure knows exactly what "it's in the backlog" means.

The triage is also where the buried decisions surface. Most of what makes a backlog unrankable is that its items aren't comparable — half are tasks, half are wishes, and a wish can't be prioritized against a task. Which leads to the step most cleanups skip.

## Step three: cap it, and convert wishes into options

After triage, put a hard cap on the backlog — and make it brutally small. My working number is a few dozen items: small enough that one person can hold the whole thing in their head, read it end to end in ten minutes, and notice when something on it has gone stale. Past that size it isn't a plan anymore, it's a wish list with a workflow tool, and wish lists don't need grooming — they need honesty about being wish lists.

The cap forces the question the uncapped backlog let everyone dodge: when a new item arrives and the list is full, *what comes off?* That's a real prioritization decision, made at intake, while the context is fresh — instead of deferred to a grooming session eighteen months later when nobody remembers the context at all.

And for the genuinely promising ideas that aren't ready to be work — the "we should probably do something about mobile someday" category — stop writing tickets. Write them down as **options with a decision date** instead: one line, one owner, one calendar entry. *Revisit the mobile question on October 1st, when we'll have two quarters of usage data.* On the date, decide: it becomes real work, gets a new date with a reason, or dies. An option with a decision date is a promise to *decide*; a ticket is a promise to *do*, made by someone who knows it's false. Teams feel the difference within a month — the ideas list stops radiating low-grade guilt, because nothing on it is pretending to be scheduled.

## Step four: hygiene rules, so it never regrows

A cleaned backlog regrows in about two quarters unless the conditions that grew it change. Three standing rules have held everywhere I've installed them:

**Age-based auto-close, permanently on.** The six-month rule from the deletion pass becomes a standing policy, ideally automated. It converts cleanup from a heroic annual event into a non-event — tickets simply expire, like they always should have.

**WIP limits on intake, not just on execution.** Everyone limits work in progress; almost nobody limits *promises* in progress. If the next-quarter bucket is full, new requests get a real answer — not now, or never — instead of a ticket. The limit does the saying-no for you, the same way a full calendar does.

**One named owner with deletion rights.** Shared ownership of a backlog means nobody can close anything, because every ticket is somebody's treaty. One person — a PM, a lead, whoever — holds the explicit authority to delete without a committee, and the explicit expectation that they'll use it weekly. The role matters more than the rules; rules without an enforcer are just more backlog.

One more thing about what survives. A capped, triaged backlog is still a flat list, and a flat list still hides the thing that matters most — whether the items compose into a journey a user can actually walk. The cleanup gets you a list worth structuring; [the story-mapping post](/product-management/user-story-mapping-fixing-the-flat-backlog/) covers how to give it that structure. Cleanup first, though. Mapping 1,100 items is how you get a very large map of the same denial.

To know whether any of this is working, three measurements beat gut feel: the **age distribution** of open items (healthy backlogs are young; a fat old tail means the guilt archive is reforming), **intake rate versus close rate** (if intake exceeds closes for two months running, you're regrowing, whatever it feels like), and my favorite — **what fraction of shipped work ever sat in the backlog longer than a quarter.** On every team I've measured, that number is startlingly low. Which is the quiet vindication of the whole playbook: the backlog was never where shipped work came from. It was where unshipped work went to be stored — and [the manifesto this series started from](/product-management/the-agile-manifesto-four-values-twelve-principles/) already told us what to value instead: responding to change over following a plan, especially a plan that's really a pile.

## Put it to work

1. **Run the age report today.** Sort your backlog by last-touched date and count the items untouched in six months or more. That number, as a percentage of the total, is your denial ratio — and it's the case for the deletion pass, made with your own data in five minutes.
2. **Close the bottom half this week.** Bulk-close everything past the age line with the standard note: *if it still matters, it will come back.* Then log what actually comes back over the next quarter. Show the team the number. Nothing dissolves the "we'll lose important ideas" fear faster than watching one percent return.
3. **Install the three hygiene rules in one meeting.** Standing auto-close at six months, a hard cap of a few dozen items, one named owner with deletion rights. Write them where intake happens — the tracker's description field, the request form — so the rules confront every new ticket at the door.

## Further reading

- Ryan Singer, [*Shape Up*](https://basecamp.com/shapeup) (Basecamp) — the "no backlogs" chapter is the purest version of the argument: important ideas come back, so stop paying to store them.
- Donald Reinertsen, [*The Principles of Product Development Flow*](https://www.amazon.com/s?k=the+principles+of+product+development+flow+reinertsen) — the economics of queues; why a long backlog isn't free storage but a cost you pay in delay and decision fatigue.
- Jeff Patton, [*User Story Mapping*](https://www.amazon.com/s?k=user+story+mapping+jeff+patton) — for what to do with the survivors once the list is small enough to structure.
- Annie Duke, [*Quit*](https://www.amazon.com/s?k=quit+annie+duke) — a book about stopping things well; the psychology of why closing a ticket feels like a loss when it's actually a decision.
