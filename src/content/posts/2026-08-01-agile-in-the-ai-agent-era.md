---
title: "Agile in the AI Agent Era: The Ceremonies Die, the Principles Don't"
date: "2026-07-27T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Every agile ceremony was derived for a world where writing code was the bottleneck. AI coding agents are ending that world — implementation collapses toward cheap, and review becomes the constraint. Sprints, estimation, and standups start running on fumes; the four values come through fine, because they were never about typing speed. They were about uncertainty and feedback, and those don't move."
use_featured_image: false
series: agile-first-principles
seriesOrder: 9
---

Last Friday afternoon I had six git worktrees open, each with its own agent session, each working a different change against a spec I'd reviewed that morning. By four o'clock, five of them were done — tests green, diffs sitting there, waiting. And I sat looking at the queue and realized something that would have sounded absurd in any sprint planning I've ever run: implementation was finished for the week, and I was the bottleneck. Not the team. Not the code. Me, and my capacity to read five diffs carefully enough to stake my name on them.

That afternoon is the whole argument of this post, and the right place to close this series. **Every agile ceremony was derived for a world where writing code was the scarce resource — and as coding agents make implementation nearly free, the ceremonies mostly don't survive the transplant, but the principles do, because they were never about typing speed. They were about uncertainty and feedback, and those didn't go anywhere.**

## The bottleneck moved, and the ceremonies are pointed at the old one

Look at the classic ceremonies through the lens this series has used all along — [each one is a derived practice, somebody's answer to a constraint](/product-management/the-agile-manifesto-four-values-twelve-principles/) — and notice which constraint they all share. The sprint allocates two weeks of scarce developer-hours. Estimation exists to decide which items deserve those scarce hours. The standup synchronizes the humans doing the scarce work so they don't collide. Velocity measures how much scarce implementation the team converts per unit time. Every one of these assumes the same underlying fact: writing code is expensive, so it must be carefully rationed, sequenced, and tracked.

That fact is dissolving under my hands as I work. When an agent implements a well-specified change in an hour, sizing a two-week sprint of implementation work is estimating the wrong scarcity — like carefully rationing water in a flood. The question "how long will this take to build?" stops being the planning question, because the honest answer is usually "less time than this planning meeting." The question that replaces it is "how long will this take to *verify*?" — and almost no ceremony in the standard playbook is pointed at that.

Because the constraint didn't disappear; it moved. Judgment is the new scarcity: reading the diff, checking the spec was right, deciding whether the thing the agent built is the thing the user needed. The ceremonies aimed at the old bottleneck don't fail loudly when the bottleneck moves — that's the trap. They keep convening. They just start running on fumes, the way [any derived practice hollows out once it's severed from its constraint](/product-management/agile-without-scrum-or-kanban/).

## WIP limits invert: the queue moved to review

Here's the inversion I feel most viscerally. For twenty years, WIP discipline meant limiting what developers *start* — because a half-built feature taxes the person building it, and context-switching between three of them wrecks all three. Agents delete that cost. Parallel worktrees, parallel sessions: having ten things "in flight" is now trivial, because no human is holding ten contexts. I do it routinely.

But Little's Law didn't get repealed — the queue just moved. The new inventory is unreviewed agent output: diffs that are done-but-not-judged, sitting in branches, aging. And it rots exactly the way undeployed code always has. The spec it was built against drifts. The main branch moves under it. My memory of why I asked for it fades, which makes the eventual review slower and shallower. Five finished diffs I haven't read are not five units of progress; they're five units of risk earning interest.

So WIP discipline survives, but it flips its object: stop limiting what the developers start, and start limiting what the humans must review at once. My working rule now is that agent sessions don't outnumber what I can review *same-day* with real attention. When the review queue backs up, the right move isn't to spin up another worktree — it's to stop generating and start judging. That is a WIP limit. It's just measured in units of human attention instead of developer keyboards.

## The spec is load-bearing again — and that's not a regression

Now the value everyone thinks agents break: "working software over comprehensive documentation." With agents, a written spec is suddenly what makes the work *verifiable* — the [contract you write before the code](/ai/openspec-contract-before-code/) is the only thing that lets you review a diff against intent rather than against vibes. Freeform prompts produce freeform code; I learned that expensively. So has the manifesto's most famous value quietly expired? Are we back to big-upfront-documentation with better tooling?

No — and the difference is exactly the word the manifesto chose. The target in 2001 was *comprehensive* documentation: the FBI's Sentinel program famously ran on requirements documentation reported at around 800 pages, [wrong before the ink dried, maintained by nobody](/product-management/fbi-sentinel-working-software/). The spec I write for an agent is the opposite artifact in every dimension that matters. It's small — one change, not one system. It's cheap to revise — minutes, not change-control boards. And it's executable-adjacent: it names the files that will change and the behaviors that must hold, which makes it closer to a test than to a requirements tome. When the implementation teaches me the spec was wrong, I change the spec and rerun. Try that with 800 pages.

What this era actually reveals is that the value's right-hand side — "while there is value in the items on the right, we value the items on the left more" — was doing more work than people noticed. Documentation was never the enemy; *unfalsifiable, unrevisable* documentation was. Agents didn't overturn the value. They rehabilitated its right side.

## The loop compresses until "frequently" means daily

The manifesto asks teams to deliver working software "from a couple of weeks to a couple of months, with a preference to the shorter timescale." Reread that sentence in a week when a walking skeleton costs an afternoon. It's quaint — not wrong, just calibrated for a cost structure that's gone. When implementation was the expensive step, a two-week delivery cadence was genuinely ambitious. When an agent can stand up an end-to-end slice between lunch and the school run, "deliver working software frequently" stops being aspirational and starts being the default you'd have to work to avoid.

The principle underneath — shorten the loop between building and learning, because every unit of work between feedback points rests on an unverified assumption — scales right down without modification. That's the tell that it was a principle and not a practice. "Two weeks" was a parameter; "shorter timescale preferred" was the actual instruction. The honest cadence now, for most of what I build, is daily: spec in the morning, working software by evening, real reaction the next day. The teams still batch-releasing every two weeks in 2026 aren't being disciplined. They're paying feedback latency the era no longer charges.

## Sustainable pace becomes attention economics

The principle I've watched organizations violate most — "sponsors, developers, and users should be able to maintain a constant pace indefinitely" — was written against midnight typing. Nobody on my projects types at midnight anymore; the agents don't care what time it is. So did crunch die? No. It moved into the approval queue, and it changed shape.

The new unsustainable pace is review fatigue. Careful diff-reading is genuinely hard cognitive work, and it doesn't announce its own decay the way exhaustion at a keyboard does. The failure mode isn't a burned-out developer — it's a rubber stamp: the tenth diff of the day skimmed instead of read, the "looks good" that means "I stopped looking." I've caught myself doing it, and it scared me more than any deadline ever did, because judgment is now the entire value I add. A process that generates agent output faster than its humans can honestly judge it is running the exact debt scheme the sustainable-pace principle names — borrowing against future quality, just denominated in attention instead of hours. The principle survives untouched. Only the resource being burned has changed.

## Backlogs decay faster than ever

If implementation is cheap, what is a stored ticket? It used to be a claim on scarce future capacity — worth writing down, grooming, ranking, because build-slots were precious and you needed a queue for them. Now, most of the time, a ticket is a stale cache of thinking. By the time it comes up, the codebase has moved, the context has moved, and re-deriving the idea fresh — a conversation, a spec, an afternoon of agent time — is often *cheaper* than excavating what past-me meant, and produces a better answer besides.

Which means the pattern I called radical earlier in this series — [delete anything not started in ninety days](/product-management/backlog-cleanup-how-to-actually-do-it/) — stops being radical and starts being obvious. Storage was always the expensive option; it just used to look free. When building is fast, the backlog isn't your memory. It's your denial.

## What survives is exactly what should

So tally it up. The sprint, as a fixed batch of implementation capacity: doesn't survive. Estimation, as the rationing mechanism for developer-hours: doesn't survive. Velocity: measuring the thing that stopped being scarce. The standup: synchronizing humans who are no longer the ones colliding. Nearly every ceremony in the standard playbook was fit to a bottleneck, and the bottleneck moved.

And the four values? "Individuals and interactions over processes and tools" — the human judgment call is now the *entire* human contribution; believing the person over the process matters more, not less. "Working software over comprehensive documentation" — sharpened, as we saw, not weakened. "Customer collaboration over contract negotiation" — when building is cheap, the expensive mistake is building the wrong thing, which makes the ongoing conversation with the customer the highest-leverage activity left. "Responding to change over following a plan" — cheap implementation makes changing course cheaper than it has ever been; the last excuse for plan-worship just died.

That's the closing argument of this whole series, handed to us by the biggest cost-structure shift our field has seen. The frameworks were fit to a bottleneck; the principles were fit to uncertainty. Bottlenecks move. Uncertainty stays. The fact that the 2001 values come through a transition their authors never imagined — while every framework built on top of them buckles — is the strongest evidence we'll ever get that they were the right abstraction layer all along, and that principle-first beats tool-monkey in every era, including the one that's arriving.

## Put it to work

1. **Measure your team's review latency, not its velocity.** For your last ten changes, compute the gap between "implementation done" and "a human reviewed it with real attention." If that gap is growing while implementation time shrinks, your bottleneck has already moved — repoint your process at it before your ceremonies calcify around the old one.
2. **Set a human-attention WIP limit.** Cap concurrent agent work at what your team can review same-day — honestly, carefully, name-on-it reviewed. When the queue backs up, stop generating and judge. Unreviewed output is inventory; treat it with the suspicion you'd give a month-old unmerged branch.
3. **Run the rederivation test against the new bottleneck.** Take the ceremony list from earlier in this series and ask of each: does this allocate implementation capacity, or does it protect judgment and shorten feedback? Ceremonies in the first bucket are running on fumes — replace each with the smallest practice that serves its principle under the new cost structure, starting with whatever your sprint planning has become.

## Further reading

- [The Agile Manifesto and its twelve principles](https://agilemanifesto.org/) (2001) — reread it with agents in mind; notice how the values hold up and how many of the parameter choices ("a couple of weeks") quietly don't.
- Donald Reinertsen, [*The Principles of Product Development Flow*](https://www.amazon.com/s?k=the+principles+of+product+development+flow+reinertsen) — queues, batch size, and the cost of invisible inventory; the math in this book is exactly what survives the era change, and it predicts the review-queue problem decades early.
- [OpenSpec: Write the Contract Before the Code](/ai/openspec-contract-before-code/) — the spec-first workflow behind most of the claims in this post, from the practitioner side.
- [Beads: A Local-First Task Graph for Developers and AI Agents](/ai/beads-local-first-task-graph/) — what task tracking looks like once the tickets are contracts for agents rather than claims on developer-hours.
