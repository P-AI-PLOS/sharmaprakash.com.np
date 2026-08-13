---
title: "What, So What, Now What: A Carryover Cutoff Debrief With Support in the Room"
date: "2021-08-19T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The year-end carryover cutoff generated wrong balances for 1,900 employees, and engineering and support walked out of the incident with two different stories. Running the debrief as three separated rounds was the only way to find out which facts each side had been missing."
tags: [liberating-structures, leave-balance]
series: ls-retro
seriesOrder: 2
use_featured_image: false
---

The engineering write-up on the carryover cutoff ran to four pages and concluded that the incident lasted eleven hours. The support team's version, which nobody had asked for, would have told you it lasted nine days — five before the bug was acknowledged and three after the fix, while people whose balances had been silently corrected wrote in asking why they'd lost two days of leave. Both accounts were accurate. They were about different things, and neither team had read the other's.

Leave Balance runs a year-end job that rolls unused days into the new year up to each policy's carryover cap. That January it applied the *new* year's cap to the *old* year's accrual for any employee whose policy had changed mid-year — about 1,900 people across four customers, all of them told they had fewer days than they did. I ran the debrief as **What, So What, Now What**, with support, engineering, and the PM in one room, which is the only version of that meeting worth holding.

## The structure, briefly

Three rounds, strictly separated, each opened with silent writing and then run up through pairs and small groups before anything reaches the full room:

- **What?** Observable facts. What happened, what did you see, what did you do. A camera's view.
- **So what?** What those facts mean — patterns, implications, the hypotheses they support or destroy.
- **Now what?** What we do about it, owned and dated.

The facilitator enforces one rule and mostly nothing else: nothing from a later round is allowed in an earlier one. In a mixed-function room that rule stops doing what it does in an engineering-only retro (preventing premature solutions) and starts doing something better — it prevents the two functions from arguing about whose story is right before either has heard the other's facts.

## What the two accounts actually contained

**What.** I asked everyone to write the timeline they personally observed. Engineering's facts: the job ran at 02:00 on 1 January; the policy-change join pulled the currently-effective cap rather than the cap in force during the accrual period; a customer admin reported it at 11:40; a patch and a corrective re-run landed by 13:00.

Support's facts arrived from a completely different calendar. The first ticket wasn't the customer admin at 11:40 — it was an employee on 27 December asking why their projected carryover in the preview widget looked low. The preview ran the same broken join five days before the actual job did, and that ticket had been closed as "expected, policy changed." Support also had the number nobody in engineering knew: 140-odd tickets, most arriving *after* the fix, from people who'd screenshotted the wrong number and now believed the correction was the error.

Round one took nineteen minutes and neither side interrupted the other, because there was nothing to argue with. Facts don't have a position.

**So what.** The meaning round didn't converge, and that turned out to be the finding. Engineering's quartet read the facts as a data-modelling failure — effective-dated policy, temporal join, the usual. Support's read them as a communication failure: no customer had been told a correction was coming, so the fix generated more contacts than the bug. Both true. Held together, they said something neither said alone: our incident definition began when engineering noticed and ended when engineering deployed, and both of those boundaries were wrong by days.

**Now what.** Effective-dated caps in the accrual query, with a test that changes a policy mid-year. The preview widget wired to the same code path as the job, so a wrong preview is a wrong job and gets triaged as one. Support ticket tags feeding a weekly signal review, so a 27 December question about a January number reaches somebody. And a rule that any corrective re-run touching employee-visible balances ships with a notification, drafted by support before the re-run, not after.

## Why the separation earns its keep across functions

Put engineering and support in an unstructured post-incident meeting and you get a status contest — one side has a root cause and a fix time, the other has anecdotes, and root causes beat anecdotes in every room I've been in. The facts round flattens that, because support's ticket timestamps are exactly as factual as a deploy log, and writing them down before anyone interprets them means they're on the wall when interpretation starts.

The other thing worth noticing: the structure is fine with the So What round diverging. A single-narrative retro treats disagreement as something to resolve before moving on. Here, both readings survived into Now What and produced different actions, which is what you want when an incident genuinely had two halves and each function could only see one of them.

## Where it isn't the right tool

Don't run it during the incident. Rounds one through three assume the thing is over; mid-fire, you want an incident commander, not a ladder.

It also doesn't fix a room where one function has been told, repeatedly, that its observations don't count. The structure gives support a slot to speak in; it can't make engineering value what gets said there. That's a standing problem, and one workshop won't shift it — I'd fix the weekly signal review first and run the debrief second.
