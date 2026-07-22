---
title: "Building a Roadmap You Can Defend with Now/Next/Later"
date: "2026-07-24T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Most roadmaps are delivery contracts wearing a strategy costume — a Gantt chart of guesses that becomes a stick to beat the team with by Q3. Here's the hands-on version: what actually feeds a roadmap, how to write an item that survives contact with reality, and why one roadmap has to serve three very different rooms."
use_featured_image: false
---

The most useful thing I ever learned about roadmaps came from watching one die. It was a beautiful artifact — eighteen months of swimlanes, every feature with a quarter attached, color-coded by team. By month four it was fiction; by month six the monthly roadmap review had become a date-renegotiation ceremony where nobody discussed whether the *work* was right, only whether the *dates* could hold. The roadmap had stopped being a plan and become a debt. And the team's real decisions — what to build next, what to drop — were happening in Slack threads the roadmap never saw.

The failure wasn't estimation. It was a category error about what a roadmap is. **A roadmap is a prioritized argument — the visible middle of the cascade, connecting the strategy above it to the delivery sequence below it — and the moment it's read as a delivery contract, it stops doing either job.** Everything hands-on about building one follows from getting that category right, so this post is the build manual: what feeds it, what format survives, how to write a single item, and how to keep it alive. The next three posts take this same roadmap into the three rooms where it gets presented — [investors](/product-management/presenting-the-roadmap-to-investors/), [sales meetings](/product-management/the-roadmap-in-the-sales-room/), and [marketing](/product-management/marketing-the-roadmap/) — because the deepest practical truth about roadmaps is that you maintain one and present it three ways, never the reverse.

## What feeds a roadmap (if nothing feeds it, it's a wishlist)

A roadmap you can defend is downstream of three inputs, all covered earlier in this series:

1. **A strategy kernel.** The where-to-play/how-to-win choices from [the strategy post](/product-management/strategy-formation-how-to-tell-a-real-strategy-from-a-wish/). If you can't say what the roadmap is *for* in one sentence — which position it's taking, which customer it's winning — every prioritization argument becomes a popularity contest, because there's no shared test for what belongs.
2. **A metric tree.** The [North Star and its input metrics](/product-management/north-star-metrics-and-metric-trees/) tell you which lever each roadmap theme is supposed to move. A theme that can't name its metric is a theme that can't be evaluated, which means it can't be killed, which means it will live forever.
3. **A risk map.** [Discovery](/product-management/discovery-and-customer-understanding/) tells you which bets are validated and which are still assumptions wearing confidence. This is what confidence levels on roadmap items are actually for — they're not decoration, they're the discovery status surfaced.

Run the test on your current roadmap: pick three items at random and ask which strategic choice each serves, which metric it moves, and what evidence says it'll work. Items that fail all three aren't roadmap items. They're accumulated promises.

## The format decision: Now/Next/Later, and when to break the rule

My default is Janna Bastow's **Now/Next/Later**, and the reason is mechanical, not aesthetic: it's the only common format whose *structure* encodes honest uncertainty. Three columns, decreasing in detail and commitment:

- **Now** — what's actually in flight. Small items, named owners, real capacity math. This is the only column that's allowed to look like a plan, because it's the only one that is.
- **Next** — what you expect to pull in when Now finishes. Problem-level, not feature-level. Sequenced, but undated.
- **Later** — directions, not commitments. Theme-level. This column exists mostly so stakeholders can see their concern *acknowledged* without you pretending to schedule it.

The timeline roadmap — features on a calendar — isn't always wrong; it's wrong as a *default*. It's the right tool exactly when dates are real constraints: a compliance deadline, a contractual commitment, a marketing moment you've already paid for. The failure is letting date-shaped exceptions colonize the whole roadmap, because a date on a slide reads as a promise no matter how many "subject to change" footers you attach. My working rule: the roadmap is Now/Next/Later; dated items live on it only when an external party can sue you or a market moment expires.

## How to write one item

This is the most hands-on part, and the part most roadmaps skip. A roadmap item is not a feature name. "Reporting v2" tells nobody anything and commits you to a solution before the problem is agreed. The format I hold teams to — four lines per item:

- **Problem:** who is stuck, and on what. In customer language, one sentence, sourced from discovery — if the sentence contains your internal component names, it's not a problem statement.
- **Outcome:** what changes if this works, stated as a metric from the tree. "Weekly active teams who share a report externally: 8% → 20%."
- **Confidence:** validated / probable / assumption. This is the discovery status, and it should visibly govern the item's position — an *assumption* sitting in Now is a flag that you're building before testing, which [the risk post](/product-management/risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure/) says is the expensive order.
- **Appetite:** how much this bet is worth — Shape Up's framing from [the delivery post](/product-management/the-strategy-cascade-turning-strategy-into-a-shippable-sequence/), pointing at time rather than estimating from scope. Appetite on the roadmap is what stops a six-week idea from quietly becoming a six-month project without anyone re-deciding.

Notice what's absent: no dates, no solution sketches, no effort estimates in the Next and Later columns. Solutions get shaped when an item approaches Now — via a [story map](/product-management/user-story-mapping-fixing-the-flat-backlog/) if it's flow-shaped, a pitch if it's bet-shaped. The roadmap holds problems; holding solutions is how roadmaps go stale, because solutions rot faster than problems do.

## Keeping it alive: the review that isn't a date renegotiation

A roadmap is maintained, not published. Monthly, one hour, three questions in order — and the order is the discipline:

1. **What did we learn?** Discovery results, launch metrics, sales signal. Learning goes first because it's the only legitimate reason for the roadmap to change; a roadmap that changes without narrated learning is thrash, and one that never changes is an archive.
2. **What does that change?** Items promoted, demoted, killed. Killing items in this meeting, out loud, with the reasoning stated, is the single highest-leverage habit — it's what teaches stakeholders that Later means "acknowledged," not "queued."
3. **What's the delta since last month?** Kept visibly, as a changelog. The changelog is what makes the roadmap trustworthy to the three rooms in the next three posts: an investor or a sales lead who can see *why* things moved will forgive movement; one who discovers movement by surprise will start demanding dates, and then you're back to the Gantt chart.

## The failure modes

**The feature-list roadmap** — a backlog with columns. No problems, no outcomes, no confidence; just nouns. It generates the worst possible stakeholder behavior, because the only way to engage with a list of nouns is to add your noun or fight for its position.

**Date theater** — dates attached to make executives comfortable, hedged with footnotes nobody reads. The dates get screenshotted into a board deck within a month and become commitments retroactively. If a date isn't a real external constraint, it doesn't go on the artifact. Osborne, Star Citizen, and the Cybertruck are [what happens when the promise itself becomes the product](/product-management/osborne-star-citizen-cybertruck-roadmap-promises/).

**The everything-Next** — a Now column with five items and a Next column with forty. Next is a sequencing claim; forty items is a refusal to sequence, which means the real prioritization is still happening somewhere else, invisibly.

**The single-audience roadmap** — building the roadmap *as* the investor slide or *as* the sales deck. Now the artifact's incentives are presentation incentives, and it drifts toward whatever that room wants to hear. One internal source of truth, three derived views — which is exactly where the [next](/product-management/presenting-the-roadmap-to-investors/) [three](/product-management/the-roadmap-in-the-sales-room/) [posts](/product-management/marketing-the-roadmap/) go.

## Put it to work

1. **Audit three random items** on your current roadmap against the three feeds: which strategic choice, which metric, what evidence. Write the answers down. The blanks are your real roadmap backlog — the work of turning promises back into arguments.
2. **Rewrite your top five items in the four-line format** — problem, outcome, confidence, appetite. Expect the confidence line to hurt: most teams discover their Now column is majority *assumption*, which is the finding.
3. **Run one monthly review with the three questions in order,** and keep the changelog. If the meeting collapses into date negotiation anyway, that's diagnostic — it means your stakeholders are reading the roadmap as a contract, and the fix is the format, not the meeting.

## Further reading

- Bruce McCarthy et al., [*Product Roadmaps Relaunched*](https://www.amazon.com/s?k=product+roadmaps+relaunched+mccarthy) — the most complete treatment of roadmap-as-communication-artifact, including theme-based formats and stakeholder views.
- Melissa Perri, [*Escaping the Build Trap*](https://www.amazon.com/s?k=escaping+the+build+trap+perri) — the book-length case against the feature-list roadmap and for outcome orientation.
- [Janna Bastow's ProdPad writing on Now/Next/Later](https://www.prodpad.com/blog/the-birth-of-the-now-next-later-roadmap/) — from the person who popularized the format, including the argument for killing timeline roadmaps.
- Ryan Singer, [*Shape Up*](https://basecamp.com/shapeup) — appetite and betting, the mechanism that keeps roadmap items from silently doubling in size.
