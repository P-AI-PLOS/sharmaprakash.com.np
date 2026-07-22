---
title: "Agreement-Certainty Matrix: Sorting a CRM Backlog by How Well It's Actually Understood"
date: "2021-05-21T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Not every backlog item deserves the same process. The Agreement-Certainty Matrix sorts a quarter's worth of CRM work into simple, complicated, complex, and chaotic — and each zone gets a different kind of team, not just a different priority."
tags: [liberating-structures, recap-crm]
series: ls-decide
seriesOrder: 9
use_featured_image: false
---

Half the backlog grooming sessions I've sat through spend forty-five minutes debating whether a feature is a P1 or a P2, when the real disagreement underneath is that nobody agrees on what the feature even *is* yet. The Agreement-Certainty Matrix stops that conversation from hiding and puts it on a wall: instead of ranking items by priority, you sort them by how well understood they are, and only then decide who should work on them and how.

The tool is Liberating Structures' adaptation of Ralph Stacey's Agreement & Certainty Matrix, and it asks two questions instead of one. How much do stakeholders **agree** on the goal and the approach? And how **certain** are we about cause and effect — will doing X reliably produce Y? Cross those axes and you get four zones, each calling for a genuinely different way of working, not just a different spot in the sprint. That's a different question than the earlier posts in this series answered — lifecycle position (Ecocycle) and scenario resilience (Panarchy, Critical Uncertainties) — this one is about whether a given backlog item deserves a plan at all, or a probe.

## The four zones, and why the debate is the point

**Simple** sits at high agreement and high certainty — everyone agrees what to do, and we've done things like it before. This is best-practice territory: pick it up and execute, no workshop required.

**Complicated** is high certainty but lower agreement (or the reverse) — the cause-and-effect chain is knowable, but stakeholders haven't converged on it yet, usually because it requires expertise most of the room doesn't have. The fix is to bring in the expert, not to keep debating in a room that lacks the knowledge to resolve it.

**Complex** is the zone with low agreement and low certainty — nobody knows what will work, and nobody agrees on the goal either. No best practice exists because the situation genuinely hasn't been solved before, by this team or by anyone with the same constraints. The move here isn't to plan harder; it's to run a small experiment, gather signal, and adjust — probe, sense, respond.

**Chaotic** is the extreme corner: things are on fire, agreement and certainty have both collapsed, and there's no time to convene a workshop about it. The only correct move is immediate, decisive action to stabilize, then retreat to one of the other three zones once the bleeding stops.

Facilitated as a Liberating Structure, this runs in 45–60 minutes. Individuals first write backlog items or open decisions on sticky notes, one per note — quarter-scale, not sprint-scale, so it covers real range. Small groups of four or five then take a stack of notes and physically place each one on a large drawn matrix, arguing out loud about where it belongs. That argument is the actual deliverable. A note slapped down instantly in Simple and left alone is genuinely simple. A note that migrates across the board three times while people push back is the one worth watching — the debate has surfaced a disagreement a written priority ranking would have quietly buried. Groups then read the zone off each cluster and name the work-mode it needs before anyone touches a sprint plan.

## Running it on recap_crm's quarter backlog

I ran this with a CRM team staring down a backlog that ranged from a five-line pipeline-view tweak to an open fight between sales and marketing about who owns a shared queue. Flat prioritization had been treating all of it as "just rank by value," which is how the fight kept resurfacing every planning cycle without resolving.

**Simple: a pipeline-view adjustment.** Someone wants deal cards on the pipeline board to show last-activity date instead of created date, because reps keep opening deals to check something the list view could tell them at a glance. Everyone in the room agreed on the change within a minute, and the team has shipped a dozen similar list/card tweaks before. This landed in Simple almost instantly — no debate, no workshop, just put it in next sprint and build it. The only mistake a team makes here is holding a discussion at all; Simple work punished by process is a real cost.

**Complicated: an email-deliverability fix.** Sequence emails from the CRM were landing in spam for a meaningful slice of one email provider's inboxes, and the team agreed unanimously it needed fixing — nobody was disputing the goal. But almost nobody in the room understood SPF, DKIM, and sender-reputation mechanics well enough to say confidently what would fix it. High agreement, low certainty: textbook Complicated. The right move wasn't more debate, it was pulling in someone who actually knows email infrastructure and letting them design the fix while the team stayed aligned on the outcome. Complicated items dressed up as team decisions just waste the room's time re-deriving what an expert already knows.

**Complex: the sales-to-marketing handoff redesign.** This was the note that moved around the board three times. Marketing wanted every form submission and meeting request routed through a lead-scoring queue before a rep ever saw it; sales wanted direct access to anything that looked like a hot lead, scoring be damned. Nobody agreed on the goal — "protect lead quality" versus "protect response speed" were in real tension — and nobody was certain which handoff design would even produce better outcomes, because the team had never instrumented the handoff well enough to know. Low agreement and low certainty at once: Complex. The group resisted the urge to spec a full redesign and instead scoped a two-week pilot — score-and-route for one lead segment only, with both teams watching the same dashboard — as a probe before committing either camp's design. That's the point of landing here: you don't skip straight to a roadmap item, you earn one after the probe tells you something.

**Chaotic: a data-integrity incident.** Mid-triage, someone mentioned that a recent import job had silently merged several thousand contact records incorrectly, and companies were now missing linked deals. That's not a backlog item, it's a fire. The group didn't debate zone placement for this one — it went straight to "stop the sync job, restore from backup, then talk," because Chaotic doesn't get a facilitated conversation, it gets an incident response. The matrix earns its keep here by making the team notice a chaotic item hiding among quarter-planning notes before it got triaged as merely urgent-but-normal work.

What the matrix bought this team wasn't a ranked list — it was four different operating instructions for one backlog, and a visible reason the handoff redesign had eaten three planning cycles without progress: it had never actually been Complex work, it had been mis-run as Simple work with a due date.

If you want the roadmap-level companion to this — how the same product's terrain holds up against different futures rather than different certainty levels — that's [the Panarchy post on recap_crm's roadmap resilience](/product-management/panarchy-roadmap-resilience-recap-crm/).

## Where it breaks

**Using it as a one-time filing exercise.** Zones aren't permanent addresses. The email-deliverability fix moves from Complicated to Simple once the fix pattern is documented and repeatable; the handoff redesign moves from Complex to Complicated once the pilot produces a clear signal. A team that sorts once and never re-sorts ends up running Simple process on work that's since become genuinely complex, or vice versa.

**Skipping straight to solutions for Complex items.** The most common failure I've watched is a team correctly identifying something as Complex, feeling the pressure of a quarterly deadline, and speccing a full solution anyway because "we don't have time for a pilot." That's not compressing the timeline, it's guessing with a roadmap slot attached, and it tends to cost more than the pilot would have.

**Confusing Complicated for Complex.** If the room lacks certainty only because it lacks expertise — not because the problem is genuinely novel — this is Complicated, and the fix is one phone call, not a workshop series. Teams that treat every unfamiliar problem as Complex end up running expensive probe-and-sense cycles on things a specialist could have answered directly.

**Running it on too small a backlog.** The tool needs range — some obviously Simple items, some genuinely Complex ones — to earn the placement debate. Five items of roughly the same difficulty produce no friction, no useful disagreement, and an hour spent confirming what everyone already believed.

If your quarter backlog is a stack of one-line tickets nobody's actually arguing about, skip this one and just prioritize. The matrix earns its hour specifically when the backlog contains disagreement a ranked list is currently hiding.
