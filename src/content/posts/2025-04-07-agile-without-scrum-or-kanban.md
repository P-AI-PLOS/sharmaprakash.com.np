---
title: "Running Fully Agile Without Scrum or Kanban"
date: "2025-04-07T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Scrum and Kanban aren't agile — they're vendors of defaults. Defaults are great when they match your constraints and cargo cult when they don't. Here's how to derive the minimum process your team actually needs from the principles directly, five minimal shapes real teams run, and the honest cases where the frameworks are still the right answer."
use_featured_image: false
series: agile-first-principles
seriesOrder: 2
---

The most agile team I've ever worked with had no standup, no sprints, no board, and no retro on the calendar. I found this out because I was the one sent to fix them. Their process, as reported upward, was "nothing" — a word that in most organizations means chaos. What I found instead was a four-person team shipping working software to real users every week, demoing it Friday afternoon to whoever showed up, then spending twenty minutes deciding what next week's version should be. When something hurt, they talked about it that Friday too. After three weeks of sitting in, I had to write up the awkward conclusion: their process was illegible to us, not failing them. They had one ceremony, and it was doing the work of six of ours.

That team wasn't running Scrum badly or Kanban minimally. They were running the principles directly — and it took me embarrassingly long to see that this is a legitimate, even superior, place to end up. **A framework is a vendor of defaults: Scrum and Kanban are somebody else's answers to the constraints the agile principles encode, and defaults are excellent when they match your constraints and cargo cult when they don't.** The interesting question is what it looks like to skip the vendor and derive your own answers.

## Start from the constraints, not the ceremonies

In [the previous post](/product-management/the-agile-manifesto-four-values-twelve-principles/) I argued that the manifesto's principles are the durable part and everything downstream is implementation. Read as an engineer would, the principles are responses to a small set of constraints that every software team faces:

**Uncertainty about what's valuable.** You don't know, in advance, which of your ideas users actually want. "Welcome changing requirements" says *design your process assuming your plan is partly wrong.*

**Feedback latency.** The longer the gap between building something and learning whether it worked, the more waste accumulates invisibly. "Deliver working software frequently" is a latency-reduction instruction, not a cadence preference.

**Batch size.** Big batches hide risk and make integration a cliff. Small batches surface problems while they're cheap.

**Work in progress.** Every open item taxes attention and rots while it waits. Limiting WIP is how you buy focus and flow.

**Trust.** "Build projects around motivated individuals" — because a process that routes every decision through a coordinator has already lost most of what it was trying to gain.

**Sustainable pace.** A process that only works at sprint-end heroics is borrowing from next quarter.

Now look at Scrum through that lens. The sprint is a batch-size and feedback-latency default: two weeks. The standup is a coordination default: daily, fifteen minutes, whole team. The retro is an adaptation default: once per sprint. None of these are wrong. All of them are *somebody's* answers — reasonable, median answers, tuned for the teams the framework's authors kept meeting. Whether they're *your* answers depends on your constraints, and your constraints are facts about your team, not properties of the framework.

The Friday-demo team had near-zero coordination cost — four people, one room, one product. A daily standup would have been fifteen minutes of telling each other things they already knew. Their feedback latency was one week because their users could absorb weekly change; a two-week sprint would have made them *slower*. Deriving from the constraints gave them a smaller, sharper process than any framework would have sold them.

## The rederivation test

Here's the diagnostic I now run on any team's process, my own included, and it's the same move as [asking why a framework says what it says](/product-management/principle-first-when-to-put-the-frameworks-down/): for every ceremony you run, can you rederive it from a principle in one sentence?

"We do a standup because the three of us are split across two workstreams that keep colliding, and fifteen minutes of collision-detection is cheaper than the rework." That's a derivation. The ceremony is load-bearing, and the sentence tells you exactly when to kill it — when the workstreams stop colliding.

"We do a standup because that's when we do the standup." That's a ritual. So is "because we're agile," which is the same sentence wearing a lanyard.

The test has teeth because of what you do with a failure: **delete the ceremony and see what breaks.** Not forever — for a month. If nothing breaks, the ceremony was decorative and you've recovered the time. If something breaks, you've discovered the real constraint it was serving, and now you can write the derivation — or design something smaller that serves the same constraint. Either outcome beats running the ceremony indefinitely on faith. In my experience, teams that run this honestly lose a third of their calendar and notice nothing except the extra afternoons.

## Five minimal shapes real teams run

None of these are recommendations. They're existence proofs — patterns I've seen work, each with the principle it serves, the thing it deliberately gives up, and the way it fails. The point isn't to adopt one; it's to notice how little process a team can run when the process is derived instead of purchased.

**1. The weekly demo and one conversation.** Working software demoed every week to anyone affected, then one discussion: what should next week's version be? Nothing else — no board, no grooming, no standup. It serves feedback latency and "working software is the primary measure of progress" about as purely as anything can. It gives up legibility and long-range planning: nobody outside the room can see status, and nothing further out than next week has a home. The failure mode is drift — fifty good weeks that don't add up to a direction, because no ceremony ever asks where this is all going.

**2. Pull-based flow with a single WIP rule.** One rule: nobody starts a second thing while their first is unfinished, and the team swarms whatever's closest to done. No columns, no cycle-time analytics, no classes of service — the kanban apparatus reduced to its one load-bearing constraint. It serves WIP and flow directly. It gives up the instrumentation: when flow degrades, no chart tells you where. The failure mode is invisible blockage — one stuck item everyone is "helping" with for three weeks, with no measurement to say when helping became hiding.

**3. Fixed appetite, variable scope.** The Shape Up-style bet: decide up front how much time a problem is *worth* — two weeks, six weeks — hand it to the team, and let scope flex to fit the box. No sprints, no standing backlog; unchosen pitches lapse. It serves batch size and sustainable pace by making time fixed and scope negotiable, the opposite of most deadlines. It gives up mid-cycle responsiveness — the box is closed while the bet runs. The failure mode is appetite theater: leadership says "ship whatever fits," then in week five quietly demands the original full scope anyway.

**4. Mob on one thing until it ships.** The whole team, one problem, one screen, rotating the keyboard. No standup, because a standup is a synchronization ceremony and the team is never unsynchronized — everyone was there for every decision. It serves trust, focus, and WIP (pinned at exactly one), and makes knowledge-hoarding structurally impossible. It gives up parallelism, and it gives up solitude — some excellent engineers do their best work alone, and a permanent mob selects against them. The failure mode is the disguised bottleneck: one strong voice steering every rotation, so what looks like a mob is one person programming through six sets of hands.

**5. No backlog.** Anything not started within ninety days is deleted. Not archived, not iceboxed — deleted, on the theory that genuinely important things come back on their own, carried by the people who feel their absence. It serves simplicity — "maximizing the amount of work not done" — and it's the most honest answer I know to the thousand-item backlog nobody believes in, a disease big enough that [it gets its own post later in this series](/product-management/backlog-cleanup-how-to-actually-do-it/). What it gives up is memory, and that's also the failure mode: a quiet, important thing — an accessibility gap, a compliance deadline — may have no advocate loud enough to bring it back. This pattern filters for *championed* work, and championed is not the same as important.

## When the defaults are the right answer

And now the honest part, because everything above can be read as a license to tear the process down, and it isn't one.

Deriving your own practice has a cost. It demands that the team can self-diagnose — notice its own feedback latency creeping up, its own WIP sprawling — and self-diagnosis is a skill, not a birthright. A brand-new team with no shared habits doesn't have it yet. Neither does a team burned into passivity, or one where nobody has seen healthy delivery up close. For those teams, Scrum is genuinely useful for the same reason training wheels are: the defaults are reasonable, the vocabulary is shared, the cadence creates reflection points the team can't yet create for itself. You learn what a retro is *for* by running some retros.

Organizations have constraints too. A company with thirty teams needs legible interfaces between them — some shared answer to "when will this land." Thirty artisanal processes make every cross-team dependency a translation exercise. Frameworks are, among other things, protocols, and protocols create value by being common, not by being optimal.

So the choice was never framework versus no framework. It's defaults versus derived — and defaults exist because deriving everything from scratch has a cost too, one a team without the judgment yet can't afford. The Friday-demo team had earned their one ceremony by understanding exactly what it was for. The mature position isn't "we deleted Scrum"; it's "we can rederive every piece of our process from a constraint we actually have — and some of those pieces happen to look like Scrum."

## Put it to work

1. **Run the rederivation test on your calendar.** List every recurring ceremony your team runs. Next to each, write the one-sentence derivation: the constraint it serves and why this ceremony is the cheapest way to serve it. Anything you can't derive goes on a kill list — pick the safest one and suspend it for a month.
2. **Name your constraints before your next process argument.** Before the next "should we change our sprint length / add a standup / adopt X" debate, spend ten minutes writing down where your team actually sits on feedback latency, batch size, WIP, coordination cost, and trust. Argue from that list. Most process arguments dissolve once the constraints are on the table, because the disagreement was about facts, not preferences.
3. **Steal one constraint from one pattern above — not the pattern.** Don't adopt "no backlog"; try expiring anything untouched in ninety days and watch what comes back. Don't adopt mobbing; try one week of the whole team on the single most important thing. You're testing whether the constraint helps *you*, which is the whole discipline.

## Further reading

- Ryan Singer, [*Shape Up*](https://basecamp.com/shapeup) (Basecamp) — the fullest worked example of a derived-from-scratch process, and refreshingly explicit about what it trades away.
- Donald Reinertsen, [*The Principles of Product Development Flow*](https://www.amazon.com/s?k=the+principles+of+product+development+flow+reinertsen) — the constraints themselves (batch size, WIP, queues) with the economics attached; the book that makes "derive it yourself" rigorous instead of vibes.
- Woody Zuill & Kevin Meadows, [*Mob Programming*](https://www.amazon.com/s?k=mob+programming+zuill+meadows) — pattern four from the people who stumbled into it, including the honest account of what stopped being necessary.
- Henrik Kniberg, [*Scrum and XP from the Trenches*](https://www.infoq.com/minibooks/scrum-xp-from-the-trenches/) (InfoQ, free ebook) — the best case *for* defaults: what a team gets from running the standard playbook well before deciding what to keep.
