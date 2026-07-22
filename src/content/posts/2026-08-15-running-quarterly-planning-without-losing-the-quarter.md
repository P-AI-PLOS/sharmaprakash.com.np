---
title: "Running Quarterly Planning Without Losing the Quarter"
date: "2026-08-15T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The worst quarterly planning I ever ran took three weeks, produced a beautiful deck, and changed nothing. The best took two, ended before the quarter started, and the plan survived to week twelve. Here's the runbook: the four input docs, the three sessions, the 70/30 commitment split, and the in-quarter cadence that keeps the plan alive without re-litigating it every sprint."
use_featured_image: false
series: operating-rhythm
seriesOrder: 3
---

The worst quarterly planning I ever ran lasted three weeks and produced my proudest artifact of that year: a forty-slide deck with a theme per pillar, an icon per theme, and a rating from leadership that I can only describe as warm. Then I watched what the teams actually built that quarter. By week four the deck and the sprint boards had diverged so completely that when a stakeholder asked me how "the Q2 priorities" were going, I had to check which document she meant — the one we'd presented, or the one we were living. We had planned for three weeks and it had bought us roughly four of alignment. The planning wasn't a rhythm; it was a ceremony, and the org had learned to nod through it.

The fix wasn't a better deck. It was treating planning as a production process with inputs, sessions, and outputs — timeboxed, ending before the quarter starts, and cheap enough to repeat honestly four times a year. The principle underneath all of it: **a quarterly plan is a set of commitments the org can rely on plus a set of bets allowed to fail, produced in two weeks, defended for thirteen.** This is the third post in the operating-rhythm series — [part one](/product-management/handling-customer-requests-an-intake-you-can-defend/) built the request intake that feeds this process its evidence, [part two](/product-management/the-planning-stack-vision-to-quarter-without-repeating-yourself/) built the stack of horizons above the quarter. This one is the runbook for the quarter itself.

## Why the window is two weeks, ending before day one

The timeline is fixed: week minus-three is async input preparation, week minus-two is the sessions, and the plan is signed before the quarter's first Monday. The hard edge matters more than the exact dates. Planning that bleeds into week one poisons the quarter in a specific, observable way: the teams spend the quarter's freshest, highest-energy weeks in meetings *about* the work instead of doing it, and — worse — they start the quarter's actual work without a plan, which means the first sprint gets filled with whatever was already in flight. By the time the plan lands in week two, it's competing with work that has momentum, and the plan loses. I've watched a "we'll finalize priorities next week" quarter where next week became week five, at which point finalizing was a formality performed on whatever had already happened.

The other reason for the hard edge is honesty about cost. Two weeks, with only three synchronous sessions inside them, is a budget the org can pay four times a year without resenting it. Three weeks of workshops is a budget the org pays by checking out — attending with laptops open, agreeing to anything that ends the meeting. **If planning is expensive enough to dread, the org will optimize for ending it rather than getting it right.**

Where do the candidate bets come from? Not from the planning window itself. Generating strategy inside a planning meeting is how you get a quarter of whatever was loudest that week. The candidates flow down from [the strategy sequence](/product-management/the-strategy-cascade-turning-strategy-into-a-shippable-sequence/) and the yearly themes [one horizon up](/product-management/the-planning-stack-vision-to-quarter-without-repeating-yourself/); planning's job is to select and sequence, not to invent.

## Week minus-three: the four documents, written before anyone meets

The async week produces exactly four documents, and it exists because of one rule I now refuse to plan without: **no meeting reads a document for the first time.** A room encountering information live doesn't deliberate — it reacts. The person who processes fastest wins the discussion, the person with the real objection formulates it in the shower two days later, and you've spent your scarcest resource (senior people, synchronized) on comprehension instead of judgment. Documents circulate by end of week minus-three; comments happen async; the sessions start from shared context.

### 1. Last quarter's scorecard

Every item from the outgoing plan, with three columns: hit, miss, or partial — and *why*, in one honest sentence each. Not "deprioritized" (that's a euphemism, name what displaced it). Not "90% done" (that's a miss with better morale). The scorecard is the single highest-leverage document of the four, because it's where the org learns whether plans mean anything. Writing "we committed to X, we shipped a third of X, because the migration we sized as M was actually XL" in plain text, quarter after quarter, is what makes the *next* plan's sizes believable. A planning cycle that starts without settling the last one is teaching everyone that commitments expire silently.

### 2. The evidence brief

Everything learned since last planning that bears on what to build: discovery findings, the customer-ask log (the same one [the sales-room post](/product-management/the-roadmap-in-the-sales-room/) has reps feeding), support-ticket themes, churn interviews, competitive movement. Organized by claim, not by source — "three enterprise accounts independently described the same export failure" is a planning input; a folder of interview notes is homework nobody will do. This is the up-flowing evidence that's allowed to challenge the down-flowing strategy, and the brief is where it gets its formal hearing.

### 3. The capacity reality memo

The most falsified number in planning is capacity, and it's falsified by a formula: headcount × 13 weeks. The memo computes what's actually available. Start from headcount-weeks, then subtract: on-call rotations, the support/interrupt load (measure last quarter's actual, don't estimate), holidays and known leave, and — the big one — carryover, the work from last quarter that is in flight and will complete regardless of what this plan says. I've seen the honest number land under 60% of the naive one, and every time, the room's first reaction is to argue with the memo rather than shrink the plan. Hold the line. **A quarter planned against fictional capacity isn't ambitious — it's pre-failed, with the failure scheduled for week nine.**

### 4. The constraint memo

One page from leadership, before the sessions, stating the frame: which yearly theme this quarter serves, any true non-negotiables (a compliance date, a contractual commitment, a launch already announced), and anything explicitly off the table. This document exists to prevent the worst planning failure I know: the team ranks carefully for two weeks, presents the result, and an executive reorders it in an afternoon because a constraint that lived in their head was never written down. Constraints stated up front are inputs; constraints revealed at the end are vetoes, and a planning process that ends in vetoes trains everyone that the ranking sessions were theater.

## Week minus-two: three sessions, in order

### Session one — the pitches

Every candidate bet gets pitched in a fixed one-page format: the **outcome** it targets (a metric movement or a falsifiable state of the world, not a feature name), the **evidence** for it (drawn from the brief — a pitch that cites no evidence is announcing itself as a hunch, which is allowed, but labeled), its **effort class**, and — the field that changes the meeting — **what it kills**: the thing we won't do, or will stop doing, if this bet is funded. The fixed format is doing quiet work here. It makes a junior PM's well-evidenced pitch stand next to a VP's hunch on equal footing, and it makes charisma a smaller variable than it wants to be. Pitches are read before the session (the rule again); the session itself is clarifying questions and challenge, not presentation.

### Session two — the cut line

Rank the pitches, draw the capacity line from the reality memo, and then do the part most planning processes skip: read everything below the line out loud, and say "this is out for the quarter" about each one, with the owner of that item in the room. It's uncomfortable on purpose. A plan is defined by its exclusions — the same [tradeoff-ledger logic as the roadmap](/product-management/building-a-roadmap-you-can-defend/), run at quarter granularity — and an unspoken exclusion isn't an exclusion, it's a deferred argument. The item nobody explicitly cut is the item that reappears in week five as "we always said we'd get to this." Spoken cuts also have a humane property that silent ones don't: the owner hears *why*, gets to register the disagreement once, in the room, and the decision gets to be disagreed-with-and-committed-to instead of relitigated by attrition.

### Session three — the commitment review

The shortest session and the one that catches the most problems. Each item above the line has a single named owner, and each owner restates, in their own words, what they're committing to and what the *first two weeks* of it look like. Not the whole quarter — the first two weeks. If the owner can't say what happens in week one, the item isn't ready; it's a theme wearing a commitment's badge, and it will spend the first month being defined instead of built. This is also where slicing problems surface — "the first two weeks are building the whole data layer" is usually a sign the bet needs [a walking skeleton cut through it](/product-management/user-story-mapping-fixing-the-flat-backlog/) before it's plannable. Better to find that out in session three than in the week-six status meeting.

## Commitments and bets: the two-bucket quarter

Everything above the line lands in one of two buckets, and the labeling is not cosmetic. **Commitments** — roughly 70% of allocated capacity — are the items the org is allowed to build on: sales can reference them (as tier-two "committed direction," never dates, per [the sales-room vocabulary](/product-management/the-roadmap-in-the-sales-room/)), marketing can prepare for them, dependent teams can sequence behind them. A missed commitment is a real event that gets a real explanation in next quarter's scorecard. **Bets** — the other 30% — are explicitly allowed to fail. They're funded to buy information, and a bet that dies in week five because the evidence killed it is a *success* of the system, recorded as such.

The two labels change conversations all quarter long, which is the point. When a stakeholder asks "is the new billing flow happening?", the answer differs by bucket, and everyone knows which bucket it's in because the plan says so. Without the labels, every item is implicitly a commitment to whoever wants it and implicitly optional to whoever must build it — the worst of both. And the 30% is what keeps planning honest about uncertainty: a plan that's 100% commitments is claiming the team will learn nothing for thirteen weeks, which is either false or very bad news.

## Sizing without lying

Estimates in planning are effort *classes*, not week counts: S (days), M (a couple of weeks), L (most of a person-month or more), XL (which is not a size — it's an instruction to split before it's plannable). The false precision of "4.5 weeks" at quarter granularity isn't just useless, it's harmful: it produces schedules people hold you to, built on numbers nobody believed. Classes are checkable against reality — the retro can ask "of last quarter's Ms, how many behaved like Ms?" — and that feedback loop actually improves them, where week-estimates just accumulate excuses.

Two taxes come off the top before anything new is planned. The **carryover tax**: in-flight work completes on its own schedule, not the new plan's, and pretending the quarter starts clean is the fastest route to capacity fiction. And the **slack allocation**: 15–20% of real capacity stays unallocated. Not padding — unallocated, on purpose, with a name. The quarter *will* produce surprises: the incident, the deal-critical fix, the discovery finding that demands a fast follow. If there's no slack, every surprise is funded by silently robbing a commitment, and by week eight the plan is fiction with extra steps. That slack is also, not coincidentally, what makes mid-quarter re-planning possible at all — the subject of part five of this series. **A quarter planned to 100% of capacity is planned to fail; the only question is which commitment absorbs the failure.**

## Keeping the plan alive: the in-quarter cadence

A plan that's only consulted at the next planning cycle wasn't a plan, it was a press release. The in-quarter rhythm is deliberately tiny:

**The monthly plan-check.** Thirty minutes, same attendees as session two, three questions, no status theater: *What shipped against the plan?* (Demos or links, not percentages.) *Has anything become impossible or newly wrong?* (A dependency slipped, a size was off by a class, an assumed integration doesn't exist.) *Have we learned anything that falsifies a bet?* (If yes — kill it now, publicly, and reclaim the capacity. Bets that are allowed to fail but never killed are just under-resourced commitments.) Thirty minutes is enough precisely because the plan exists; the meeting checks reality against a document rather than negotiating one from scratch.

**The re-plan trigger.** Between plan-checks, the plan is *stable by default* — that stability is its whole value to everyone downstream. It reopens only on trigger conditions, agreed at planning time: a commitment's owner declares it unreachable, capacity shifts by more than the slack can absorb (a departure, an acquisition-related fire), or evidence invalidates the outcome a commitment was targeting — not just its solution. Anything short of a trigger waits for the monthly check. This is the discipline that kills the most corrosive failure mode I know: re-litigating the plan every sprint, where each planning meeting quietly reruns quarterly planning in miniature and the plan means whatever the last meeting said.

## The retro on the plan, not the team

At quarter's end, before the next cycle's scorecard gets written, run a short retro whose subject is the *planning process itself* — separate from any team retrospective, because "did we work well" and "did we plan well" have different answers and the second question never gets asked otherwise. Three measurements, tracked across cycles:

- **Estimate accuracy by class.** What fraction of Ms behaved like Ms? If Ls routinely behave like XLs, the class boundaries need moving — or the pitches are systematically underselling effort to get above the line, which is a different and more interesting problem.
- **Cut-line regret.** Of the items we said "out" to, which do we now wish we'd funded — and which funded items should have been cut? One or two regrets is a healthy hit rate; zero regrets means the line was drawn too conservatively to matter.
- **Interrupt volume.** How much of the slack got consumed, and by what? If interrupts ate the slack *and* bled into commitments two quarters running, the next capacity memo needs a bigger tax — that's a measurement correcting a model, which is the whole system working.

The retro's output feeds directly into the next cycle's four documents. That closed loop is what separates a planning *rhythm* from a planning *event*.

## The failure modes, named

- **Planning theater.** The deck exists, the behavior doesn't change — my forty slides. The test is cheap: pick any engineer in week six and ask what the quarter's commitments are and where their current task sits against them. If the answer requires opening the deck, the plan is decoration.
- **The everything-is-P0 quarter.** Ten commitments, no bets, no cut line anyone remembers. This is a prioritization refusal wearing a plan's clothes, and it converts back into loudest-voice-wins by about week three — usually because session two was skipped or softened, and nothing was ever said out loud to be *out*.
- **Capacity fiction.** The naive headcount math survived contact with the reality memo, or the memo was never written. The tell is a quarter that's "on track" through week eight and catastrophically behind in week eleven — the fiction doesn't fail gradually, it fails when the borrowed slack runs out all at once.
- **The sprint-level re-litigation.** No trigger conditions, so every objection reopens everything, and stability — the plan's entire value proposition to sales, marketing, and dependent teams — never materializes. If people keep bringing cut items back, that's not a discipline problem with the people; it's a signal that the cut was never actually spoken in session two.

## Put it to work

1. **Write last quarter's scorecard this week**, even if — especially if — no formal plan existed. Reconstruct what was implicitly committed, mark hit/miss/why in a page. The discomfort of writing it is a preview of the alignment the real process buys, and it's the natural first document of your first real cycle.
2. **Compute the capacity reality number for next quarter** — headcount-weeks minus on-call, measured interrupt load, leave, and carryover. Put it next to the naive number in the same document. The gap between the two is the size of the fiction your current plans are built on.
3. **Run session two properly once**: rank, draw the line at the honest number minus 15% slack, and read the cuts aloud with owners present. It's the single session with the highest return, because everything downstream — stable commitments, defensible answers, mid-quarter agility — depends on the exclusions being real.

## Further reading

- Richard Rumelt, *Good Strategy Bad Strategy* — the kernel that should exist above any quarter; a plan selecting from strategy beats a plan inventing one, every time.
- Ryan Singer, *Shape It* — Basecamp's betting-table language; the cycle length differs, but the framing of funded work as bets with appetites maps almost directly onto the 30% bucket.
- Christina Wodtke, *Radical Focus* — the narrative case for fewer commitments and a real cadence of check-ins; the Friday/Monday rhythm is a finer-grained cousin of the monthly plan-check.
- Donald Reinertsen, *The Principles of Product Development Flow* — the queueing-theory argument for why capacity planned to 100% guarantees delay; the mathematical spine under the slack rule.
