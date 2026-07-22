---
title: "Risk Reduction: The Vocabulary I Use Under Pressure"
date: "2026-07-17T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Most teams don't lack judgment, they lack a shared vocabulary for talking about risk before it becomes an incident. These are the six tools I actually reach for when a decision needs to be fast, reversible where it can be, and scrutinized where it can't."
use_featured_image: false
series: leadership-frameworks
seriesOrder: 5
---

Somewhere around my third or fourth production migration, I noticed a pattern in how they went wrong. It was never the migration script. It was the rollback plan nobody had actually written down, discovered at 2am to be a paragraph of wishful thinking rather than a runbook. The frameworks in this post aren't about eliminating that kind of surprise — you can't. They're about making sure the surprise shows up in a meeting on a Tuesday afternoon instead of a pager alert at 2am on a Saturday.

This is the layer of [the cascade](/product-management/the-strategy-cascade-frameworks-i-actually-reach-for/) I find teams skip most often, because it doesn't feel like "real work." Writing a risk log doesn't ship a feature. But every incident retro I've sat through eventually traces back to a decision that got made too fast, or scrutinized too little, or both — and usually in the wrong direction.

## The pre-mortem, done properly

The pre-mortem is almost embarrassingly cheap: before you start, gather the team and ask everyone to imagine the project has already failed, badly, and write down why. Not "what could go wrong" — that's a brainstorm, and brainstorms are polite. "This already failed, explain it" gives people permission to say the thing they were quietly worried about but didn't want to be the one to raise.

I ran one before a database migration that, on paper, was routine — same schema, just a different provider. In the pre-mortem, our most senior engineer wrote: "we failed because the rollback plan assumed the old database would still exist and be writable, and it won't be, because the migration script deletes the source once it verifies parity." Nobody had said that out loud in three weeks of planning. It became the first thing we fixed, and it's the reason that migration is boring to talk about now instead of being the subject of an incident review.

The honest failure mode: a pre-mortem only surfaces what people are willing to write down, and if your team doesn't trust that raising a concern won't be held against them later, you get a page of polite hedges instead of the one thing that actually worries the senior engineer. It's a psychological-safety instrument disguised as a planning exercise, and it only works as well as the safety does.

## One-way doors and two-way doors

This is the single most useful piece of decision vocabulary I've adopted, mostly because it's short enough to actually get used in a Slack thread. A two-way door is a decision you can walk back — reversible, cheap to undo, low blast radius. Ship it, learn, adjust. A one-way door is the opposite — once you're through, you're not getting back to where you started, at least not without real cost.

The failure mode I see constantly is teams treating every decision like a one-way door, because that's the safe-feeling posture — more meetings, more sign-off, more caution always looks responsible. But that caution has a cost too, it's just invisible: it's the six weeks a two-way-door decision, like which button color converts better or which of two similar libraries to prototype with, spent in a steering committee. I've watched teams spend more calendar time deciding on a reversible A/B test than they later spent running it. The vocabulary is only useful if someone in the room is willing to say "this is a two-way door, let's just decide and move" — and that requires actually doing the classification work up front, not assuming.

The other failure mode is the mirror image: treating a genuinely one-way door — a data-model choice that will be baked into every downstream integration, a vendor contract with a multi-year lock-in, a public API contract — with two-way-door speed because the team's default mode is "bias toward action." I've seen a schema decision made in a fifteen-minute stand-up because "we can always migrate later," and eighteen months later that migration was still on the roadmap, un-started, because by then three other systems depended on the shape they'd chosen quickly. The framework doesn't make the classification for you. It just gives you the ten seconds of pause to ask which kind of door you're standing in front of, and that pause is the entire value.

## The RAID log, and why it goes stale

RAID — Risks, Assumptions, Issues, Dependencies — is the least glamorous framework in this post, and it's the one I've seen most consistently abandoned. The idea is straightforward: keep an explicit, living document of what could hurt you (risks), what you're taking on faith (assumptions), what's already hurting you (issues), and what you're waiting on from someone else (dependencies). It's the closest thing program management has to a black box recorder.

I inherited a program once where the RAID log genuinely earned its keep — a cross-team integration with four dependent squads, where "we're blocked on the payments team's API" wasn't a surprise in week six because it had been sitting in the dependencies column, dated, since week one, with an owner's name next to it. When the blocker actually landed, the response was "yes, we've been tracking this, here's the mitigation we already lined up" rather than a scramble.

The honest critique: a RAID log is only as good as the review cadence around it, and most of the ones I've seen become a graveyard — a document somebody updates diligently for three weeks and then never opens again, because nobody made "review the RAID log" an actual agenda item with an owner. A stale RAID log is worse than no RAID log, because it creates the illusion that risk is being tracked when it's actually just been logged once and forgotten. The tool isn't the document, it's the standing fifteen minutes in a weekly sync where someone is accountable for walking through it out loud.

## ADRs and the discipline of writing decisions down

An Architecture Decision Record is a short, dated, append-only document: here's the decision, here's the context, here's what we considered and rejected, here's why. RFCs are the same idea scaled up to a proposal-and-review process before the decision is final. What I actually value about both isn't the artifact, it's what it forces: you cannot write "we chose Postgres over DynamoDB because it was familiar" in an ADR without feeling slightly ashamed, because the format demands you name the alternatives and the trade-off, not just the outcome.

Where this earned its keep for me was a team that had grown past the point where one person could hold every technical decision in their head. New engineers joining eight months in kept re-litigating choices that had already been argued through, because there was no record — just institutional memory in two people's heads, and those two people were tired of repeating themselves. Once we started writing ADRs, "why did we do it this way" became a link instead of a meeting.

The failure mode is almost the opposite of the RAID log's: ADRs get written and never revisited, so a decision that made sense given constraints eighteen months ago calcifies into unquestioned law, cited by people who don't remember it was provisional. An ADR needs a status field — proposed, accepted, superseded — and a team willing to actually mark one superseded when the context changes, or it becomes scripture instead of a decision.

## Assumption mapping and testing the riskiest one first

"We built an MVP" is not a plan, it's a description of an artifact — and the famous MVP origin stories that justify it are shakier than the retellings suggest, as [checking them against the record](/product-management/mvp-stories-checked-against-the-record/) shows. What I actually want before committing real engineering time is an assumption map: list everything the plan depends on being true, then plot each one on two axes — how important is it if we're wrong, and how uncertain are we that it's true. The upper-right quadrant, important and uncertain, is where you run a Riskiest Assumption Test — the smallest possible experiment that would falsify it.

I used this on a feature that assumed enterprise customers would self-serve a fairly involved configuration step. Everyone assumed yes, because our existing customers were technical. The riskiest assumption wasn't "will they use the feature," it was "will they complete configuration without a call with us" — high importance, genuinely uncertain. A two-day fake-door test, routing a subset of users to a configuration flow with a human quietly watching session recordings, told us no, they wouldn't, within 48 hours, for a fraction of the cost of building the full self-serve flow first and finding out in the support queue.

The critique here is that assumption mapping is easy to perform badly — teams list the assumptions that are comfortable to test (does the button work) and quietly avoid the ones that are uncomfortable (does anyone actually want this at this price), because the uncomfortable ones are also the ones most likely to kill the project. The framework only protects you from self-deception if you're willing to put the assumption you're most afraid of in the upper-right quadrant, not the one you're most confident about. (This is the same move [the PR/FAQ](/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/) runs in prose — the five questions you hope nobody asks — and it's also the honest answer to an investor's "why this milestone first": [riskiest assumption, cheapest strong test](/product-management/presenting-the-roadmap-to-investors/).)

## Spikes and walking skeletons

Last one, and it's specifically technical risk rather than product risk: a spike is a short, time-boxed piece of throwaway code whose only job is to answer "can this actually work," not to ship. A walking skeleton is the thin-vertical-slice version of the same idea at the architecture level — build the entire path end to end, database to UI to third-party integration, with the absolute minimum functionality at each layer, before you build any single layer out fully.

I reached for this on a project with a new payment processor's API that our sales team had already quietly committed to in a contract. Instead of building out the full checkout flow and discovering an authentication quirk in week five, we spent three days on a walking skeleton — one hardcoded product, one test card, one webhook, the whole path lit up end to end. It surfaced a webhook-ordering issue that would have been a nightmare to debug once real UI and real business logic were layered on top, and it surfaced it while the "app" was still ten lines of code we didn't mind throwing away.

The failure mode is almost sociological rather than technical: spikes have a way of quietly becoming production code, because "it already works, why would we rewrite it" is a hard sentiment to argue against once a deadline is close. A spike that isn't explicitly time-boxed and explicitly discarded — or explicitly rewritten with the corners no longer cut — is just unreviewed code with a more forgiving name.

None of these six tools reduce risk on their own. What they actually do is create a moment — a pre-mortem meeting, a "which door is this" question, a RAID review, an ADR's alternatives section, an assumption map's upper-right quadrant, a spike's time-box — where the risk has to be said out loud before it becomes a decision nobody remembers making. That moment is the whole mechanism. Skip it enough times and you get very good at incident reviews instead.

## Put it to work

1. **Run a fifteen-minute pre-mortem on whatever ships next.** "It's six months from now and this failed badly — write down why," silently, individually, before anyone speaks. Read the answers out loud. The one that makes the room go quiet is the one nobody was going to raise in a normal planning meeting.
2. **Classify this week's open decisions by door.** List every decision currently waiting on a meeting, and mark each one-way or two-way. Every two-way door on the list gets decided today by whoever's closest to it; every one-way door gets an explicit owner and a date. Most teams find their meeting calendar was mostly two-way doors travelling first class.
3. **Write one ADR retroactively.** Pick the technical decision your team most often re-litigates and write the record it never got: context, alternatives considered, why the choice won, status. Next time it comes up, answer with the link — and notice how much of the recurring argument was really just missing memory.

## Further reading

- Gary Klein's original pre-mortem piece, "[Performing a Project Premortem](https://hbr.org/2007/09/performing-a-project-premortem)" (HBR, 2007) — three pages, the whole method.
- [Jeff Bezos's 2015 shareholder letter](https://www.aboutamazon.com/news/company-news/2015-letter-to-shareholders) — the origin of Type 1/Type 2 (one-way/two-way door) decisions, expanded into "high-velocity decision making" in the 2016 letter.
- Michael Nygard, "[Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)" — the blog post that started the ADR convention.
- Annie Duke, [*Thinking in Bets*](https://www.amazon.com/s?k=thinking+in+bets+duke) — decisions as bets under uncertainty, and separating decision quality from outcome quality.
