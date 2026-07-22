---
title: "Sales Sold It: The Recovery Playbook for Unplanned Commitments"
date: "2025-07-21T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The contract is signed, the feature is due in eight weeks, and nobody on the product side has ever scoped it. The two obvious reflexes — bend the quarter or refuse on principle — both make the next one worse. Here's the recovery playbook: establish what was actually promised, get in front of the customer fast, price the promise for the people who own the tradeoff, and turn the whole incident into roadmap signal instead of roadmap debt."
use_featured_image: false
series: operating-rhythm
seriesOrder: 5
---

The message arrived on a Thursday afternoon, in a Slack channel I wasn't even in — someone screenshotted it to me. An account executive, congratulating the team on closing the biggest deal of the year, with one line buried in the celebration: "They're counting on the multi-entity consolidation module by end of Q3, it's in the order form." I read that sentence four times. We did not have a multi-entity consolidation module. We did not have a design for one, a scoping doc for one, or a single line in any backlog mentioning one. What we had was a signed contract with a delivery date eight weeks out, for a thing that existed only in a sales call I'd never heard about.

I've written elsewhere about [how to keep this from happening](/product-management/the-roadmap-in-the-sales-room/) — the three-tier answer, the roadmap as evidence rather than menu, the ask log. That post is the prevention manual, and I stand by it. But prevention posts have a quiet dishonesty to them if they stop there, because no prevention system holds forever. Comp plans change, AEs rotate, a founder gets excited on a call. Sooner or later you will be the person reading the screenshot. This post is about the eight weeks after — and about the uncomfortable question underneath it, which is whether your operating rhythm is actually agile or just tidy.

## The two reflexes, and why both fail

Every product person I know defaults to one of two responses, usually according to temperament rather than analysis.

The first is **heroic capitulation**. Clear the decks, bend the quarter, pull the two best engineers off the committed work, ship the thing. It feels responsible — the company signed, revenue is revenue, we're all one team. And it works, once, in the sense that the feature ships. What it also does is complete a training loop. Sales promised something impossible, and the impossible got delivered, so the promise was — empirically — not impossible. You have just taught the sales org, with the strongest evidence available, that the roadmap bends under sufficient deal pressure. The next promise arrives within two quarters, and it's bigger, because why wouldn't it be. Meanwhile the displaced committed work slips silently, and the customers *those* commitments were made to don't get a war-room; they just get a delay.

The second is **righteous stonewalling**. Not on the roadmap, not our commitment, sales created this problem and sales can own it. This one feels principled, and the principle is even correct — which is exactly what makes it dangerous. Because the practical output of the stonewall is a torched customer relationship, an AE who now believes product is the department of no, and an executive team that watched product choose process over the year's biggest deal. The org learns that product is a blocker to route around, and the next promise doesn't come to you at all — you find out at renewal, when the customer asks where their module is. Stonewalling doesn't stop the promises. It drives them underground.

The thing both reflexes share is that they treat the promise as the whole problem. It isn't. **The promise is an incident; how you respond to it is policy.** Your response is the precedent every future deal negotiates against, which is why the recovery has to be slower and more deliberate than either reflex allows. In my experience it has four steps, and the order matters.

## Step one: establish what was actually promised

Before any meeting, any escalation, any Slack thread with opinions in it: get the exact words. Not the AE's summary of the words, not the customer success manager's recollection — the artifact. Was it said on a call? Written in an email? In the MSA or the order form? In a side letter nobody looped legal on? Pull the actual language and read it.

I do this first because roughly half of "sales sold it" incidents dissolve at this step. The pattern is almost always the same: the customer heard a direction, the AE heard a commitment, and the paper says neither. "We're moving toward consolidated reporting across entities" becomes, three retellings later, "the module ships in Q3." When the contract turns out to say nothing, you don't have a delivery crisis — you have an expectations gap, which is a much cheaper problem, fixable with one honest conversation instead of eight weeks of engineering. In the consolidation case above, the order form actually referenced "reporting capabilities as described in vendor documentation." The specific module lived only in a call transcript and the customer's hopes. That's still a real problem. It is not the same problem as a contractual obligation, and treating them identically wastes your strongest move.

And if it *is* in the contract — precise language, dated, signed — then be honest with yourself about what changed: **a contractual promise is a business obligation, not a backlog item, and the decision about it belongs to the business.** You are no longer prioritizing a feature request. The company has a legal commitment with breach consequences, and whether to honor it, renegotiate it, or eat the cost of unwinding it is a call for whoever owns the commercial relationship — informed by you, not made by you. Product owners get this wrong in both directions: some quietly absorb a legal obligation into the backlog as if it were a big ticket, and some argue against it as if they held a veto. Neither is your job. Your job starts at step three.

## Step two: get in front of the customer, fast

The instinct is to go internal first — align product, engineering, and leadership on a position, then present it to the customer. Resist it. Every day you spend aligning internally, the customer's version of the promise is hardening into their rollout plan, and the AE is managing the relationship alone with the only tool they have: reassurance. Get product and the AE in front of the customer inside the first week, together. Together matters — going around the AE tells the customer their salesperson can't be trusted, and tells the AE you're the adversary. You want the opposite of both.

The meeting is discovery under time pressure, and the discipline is the same one from [the discovery post](/product-management/discovery-and-customer-understanding/): the customer's problem in the customer's words, past behavior over hypotheticals, no leading the witness. What are they doing today, without the promised feature? What breaks at what point in their process? What happens on their side if this arrives in six months instead of two?

Here is the finding that has repeated across nearly every one of these recoveries I've run or watched: **the customer's actual need is almost always narrower than the promised feature.** The promise was scoped in a sales call, which means it was scoped generously, in the abstract, by two people incentivized to agree. The need, when you sit with the people who'll use the thing, is specific. The "multi-entity consolidation module" turned out to be one finance manager who needed three entities' monthly numbers in one export — which a scheduled report and a spreadsheet template solved in a fortnight, with the customer visibly relieved that someone had finally asked what they were trying to do. I've seen the promised feature collapse into a workaround, an integration with a tool the customer already owned, and a services engagement. Not every time — sometimes the need really is the feature. But you don't know until you've asked, and the recoveries that skip this step routinely build the full generous version of something a fifth of it would have satisfied.

## Step three: price the promise and hand the decision up

Now the internal work — and the shape of it matters more than the effort. Your output is not an argument. It's a one-page decision memo that makes the cost of the promise undeniable, with three options and a recommendation.

Pricing the promise honestly means naming things, not gesturing at them:

- **What it displaces.** Not "roadmap impact" — the specific committed items, by name, that slip if this gets built, and which customers or outcomes each slip touches. "Honoring this delays the migration-tooling commitment to our top-ten accounts by roughly six weeks" is a cost an executive can weigh. "The team will be stretched" is not.
- **What outcome moves.** Which quarterly or yearly outcome this puts at risk, and by how much, best estimate stated as an estimate.
- **The precedent.** What this teaches the sales org if honored without consequence, priced in expected future promises. This is the cost that never appears in any deal review, and the one that compounds.

Then the three options, plainly: **honor** it (as promised, or as the narrower version step two surfaced), **renegotiate** it (a revised scope or timeline the customer accepts, often traded for something — a discount, an extension, early access to something real), or **unwind** it (concessions, credits, in the worst case letting the deal go). Attach your recommendation and give the memo to the executive who owns the commercial tradeoff — CRO, CEO, whoever holds both the revenue number and the roadmap consequences. Then get the decision in writing.

I want to be precise about the product owner's role here, because it's the part I got wrong for years. **Your leverage is not veto power; it's making the cost undeniable.** If the exec reads the true price and decides the deal is worth it, that's a legitimate business decision, and your job becomes executing it well. What you must not allow is the decision being made without the price — the cheerful "we'll figure it out" yes where the displaced commitments slip unattributed and the precedent gets set for free. Written decision, named owner, visible cost. That's the whole game.

## If you build it, build it like you mean it

Say the decision is build. There's one more fork, and it's where most recoveries quietly fail two years later.

The failure mode is the unowned custom hack: a feature-shaped object built in a hurry for one customer, wired around the product rather than into it, with no product owner, no roadmap entry, and no sunset. It ships, the deal is saved, everyone moves on — and the thing haunts the codebase for years. Every refactor routes around it. Every new engineer asks what it is and gets a shrug. The customer it was built for treats it as core product and screams when it breaks, which it does, because nothing owns it. I have personally archaeologized code like this and found the original deal's AE had left the company four years earlier.

The fork has two honest branches. Either **generalize it** — take the narrow version from step two and build it as a real product feature: designed for the segment, on the roadmap, owned by a team, this specific customer simply the first user of something you'd defend building anyway. Or **fence it** — consciously classify it as custom work, price it as a services engagement (the [contract test](/product-management/the-roadmap-in-the-sales-room/) from the prevention post, applied late), give it a named owner and an explicit sunset or migration path, and keep it out of the product surface everyone else sees. Both branches are fine. The unmarked middle — product-shaped, services-funded, owned by nobody — is the one that costs you for a decade.

## Where the agility actually comes from

Here's the part that isn't about this incident at all. Walk back through the playbook and ask what it assumes: that when the decision comes back "build the narrow version," there is somewhere for that work to *go*. A team planned to 100% of capacity has no such place. Its only available moves are the two failing reflexes — break a commitment or refuse — because every hour of the quarter is already spoken for. The playbook above is only executable by an organization that planned for the possibility of surprise.

This is what the quarter's unallocated slack and the commitments-versus-bets split — the machinery from [the quarterly planning runbook](/product-management/running-quarterly-planning-without-losing-the-quarter/) earlier in this series — were actually *for*. Not for padding estimates, not for "innovation time" that evaporates by week three. For this. A real market signal arrives mid-quarter; the slack absorbs the narrow version, or a bet gets consciously traded out for it while the commitments stand untouched. The plan flexes without dying. **Agility isn't the absence of a plan; it's a plan built with the capacity to absorb a real signal.** Teams that plan every hour and call themselves agile because they run sprints have it exactly backwards — they've built a system where responding to the market and honoring their word are mutually exclusive.

## The promise is data

One more reframe before the cleanup. An off-roadmap feature that clinched a real deal is not just an incident to manage — it's some of the highest-signal market data you'll get all year. A customer with budget and urgency just told you, with money, what your product was missing for them. That signal decodes to one of three things, and it's worth deciding which:

- **A positioning gap.** The prospect was sold something adjacent to what you actually are, which means [your positioning](/product-management/positioning-the-choice-you-make-before-the-market-makes-it-for-you/) is fuzzy enough that sales could stretch it — or had to.
- **A segment you shouldn't serve.** The promise was the cost of dragging an out-of-segment customer over the line. The lesson isn't "build faster," it's "qualify harder" — this deal will be expensive forever, and the promise was just the down payment.
- **A genuinely missed opportunity.** Discovery had a blind spot, sales found it first, and the roadmap should change — on its own merits, through the normal review, not because a contract forced it.

The way to tell them apart is accumulation. **One off-roadmap promise is an incident; three similar ones mean your roadmap is wrong somewhere.** Log each recovery the same way the prevention post logs asks — what was promised, to which segment, what need was underneath — and read the log quarterly. The single most useful roadmap correction I've ever made came not from research but from noticing that three "one-off" deal promises in eight months were the same missing capability wearing different customer logos.

## Fixing the system, briefly

The prevention machinery lives in [its own post](/product-management/the-roadmap-in-the-sales-room/), so I'll only add the pieces that belong to the aftermath. Run a **blameless deal review** — same posture as an incident postmortem, because the AE who promised did so inside a system of incentives and information you helped shape, and a review that hunts for the guilty produces exactly one outcome: the next promise happens where you can't see it. Add the **deal-desk rule** if you don't have one — any roadmap commitment above a threshold requires product sign-off before it reaches paper, which converts the recovery playbook's step three into a pre-signature step where it's ten times cheaper. And look honestly at **how sales is paid**. If the comp plan rewards closed bookings with no clawback and no scope accountability, promising futures is the rational move, and no process document survives contact with a rational person's mortgage. That conversation belongs to the CRO, but you're allowed to start it, with the recovery log as evidence.

Watch for the failure modes that eat these fixes. Punishing the AE publicly, even once, ends blameless forever. The **quiet quarterly tax** — not one big promise but a dozen small ones, each too minor to trigger any review, collectively a fifth of your capacity — never hits a radar unless you count it deliberately, so count it. And "strategic customer" as an incantation that bypasses the deal desk: if the phrase exempts a deal from the rules, define in writing what makes a customer strategic and who gets to say so, or the label will migrate to whichever deal is loudest this week.

## Put it to work

1. **Run one recovery through the four steps** — even retroactively, on the last off-roadmap promise your org honored. Find the actual contractual language, reconstruct what the customer really needed, and price what it displaced. The gap between the generous promise and the narrow need is usually the whole argument for the playbook.
2. **Check your quarter for absorption capacity.** If a real mid-quarter signal arrived tomorrow, what's the move that doesn't break a commitment? If the honest answer is "there isn't one," the problem predates any sales promise.
3. **Start the recovery log** next to the ask log: promise, segment, underlying need, resolution. Read it quarterly, looking for the third occurrence.

This closes the operating-rhythm series, and the arc was deliberate: an intake that turns raw requests into decisions you can defend, a planning stack from undated vision down to the quarter, the quarterly ritual that turns the stack into committed and uncommitted work, the stakeholder system that keeps the plan legible to everyone with a claim on it — and finally this post, the test all of it exists to pass. Because the operating rhythm isn't proven on the quarters where the plan holds. It's proven on the Thursday afternoon the screenshot arrives, when the system you built either gives you a real move or leaves you choosing between burning the team and burning the deal. Build the rhythm for that Thursday. It's coming either way.

## Further reading

- Chris Voss, [*Never Split the Difference*](https://www.amazon.com/s?k=never+split+the+difference+voss) — the renegotiation conversation in step three is a negotiation, and calibrated questions beat positions in it.
- April Dunford, [*Obviously Awesome*](https://www.amazon.com/s?k=obviously+awesome+dunford) — when the recovery log says "positioning gap," this is the repair manual.
- Kim Scott, [*Radical Candor*](https://www.amazon.com/s?k=radical+candor+kim+scott) — the blameless deal review is a feedback conversation at org scale; the care-personally/challenge-directly frame keeps it from becoming either a trial or a hug.
