---
title: "Handling Customer Requests: An Intake You Can Defend"
date: "2026-08-13T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The backlog where customer requests go to die isn't a filing problem — it's a decision problem wearing a filing costume. Here's the intake pipeline I actually run: one ledger, five interrogation questions, clustering by problem instead of by feature, and the exact wording of a no that builds more trust than a silent maybe."
use_featured_image: false
series: operating-rhythm
seriesOrder: 1
---

We once shipped a bulk-export feature because it was the most-requested item in our tracker. Thirty-one requests, neatly tagged, undeniable. It launched, adoption was a rounding error, and I spent an uncomfortable retro trying to explain how the most-asked-for thing we'd ever built could also be the least used. The answer took a week of call-backs to find: of the thirty-one requesters, eleven wanted the data in their BI tool and would never touch a manual export, nine wanted a scheduled email of one specific report, six were working around a broken permissions model that made them export data just to share it, and only five wanted anything like what we built. Thirty-one people had told us about four different problems. We'd counted them as one solution.

That's the trap in one sentence: **a customer request is evidence of a problem, not a specification of a solution.** The moment you treat requests as pre-written backlog items, you've outsourced solution design to people who've seen only your product's surface and their own workflow — and you've done it while feeling rigorously data-driven, because look, you counted. This post is the intake pipeline I've settled on for turning raw requests into decisions I can defend in front of the customer, the sales team, and the exec who's sure their favorite ask has "come up a lot." It's also the first post in a new run on the product operating rhythm — the recurring machinery around the [strategy cascade](/product-management/the-strategy-cascade-frameworks-i-actually-reach-for/) rather than the cascade itself.

## Why "just log it in the backlog" fails

The default motion at most companies is to file requests straight into the backlog, and it fails for a structural reason, not a discipline one: the backlog and the request ledger have opposite jobs. The backlog is a commitment queue — things you've decided to build, sequenced. A request ledger is an evidence store — things customers have said, preserved. When you merge them, every request arrives pre-decided. It sits in the backlog wearing the costume of work, accumulating age and guilt, until a [backlog cleanup](/product-management/backlog-cleanup-how-to-actually-do-it/) either deletes it (and the evidence with it) or ships it (and the interrogation never happened). Either way, the one thing the request was actually good for — telling you about a problem — is lost.

So the first move is boring and load-bearing: **keep the request ledger and the backlog as separate artifacts, connected only by explicit decisions.** Requests flow into the ledger. Backlog items are created from ledger *clusters*, by a person, on purpose, with a reason attached. Nothing teleports from one to the other. Every failure mode in this post traces back to violating that separation somewhere.

## One funnel, one ledger

Requests arrive through every door you have — support tickets, sales calls, success check-ins, community threads, the CEO's inbox — and the second structural mistake is letting each channel keep its own pile. Support tags things in the helpdesk, sales keeps a spreadsheet, success remembers things in QBR decks, and nobody can answer "who has asked for this and why" without an archaeology project. The fix is a single funnel: whatever the source, the request lands in the same ledger, in the same shape.

The shape matters more than the tool. Four fields are non-negotiable:

- **Requester and account** — a person you can call back, not "several customers."
- **Segment** — which slice of your market this account belongs to, in your [positioning](/product-management/positioning-the-choice-you-make-before-the-market-makes-it-for-you/)'s terms. This field does most of the work later.
- **Revenue weight** — ARR, expansion potential, renewal risk. Recorded, not yet acted on; we'll get to why.
- **The verbatim problem statement** — what the customer actually said, in their words, before anyone translated it into your product's vocabulary. "I asked for an export because I can't share this report with my subcontractor" is worth ten instances of a `bulk-export` tag.

The verbatim field is the one teams skip and the one I'd defend hardest. Translation is where evidence dies. A support agent who summarizes "customer frustrated about sharing, wants export" as "+1 bulk export" has quietly performed solution design and destroyed the input. Whoever captures the request writes down what was said; whoever interrogates it does the interpreting, visibly.

On tooling: this is a table, and any tool that can hold a table works — a spreadsheet, Linear with a dedicated project, Productboard if you already pay for it. The states are `new → interrogated → clustered → decided → closed-loop`, the fields are the four above plus a decision and a decision-reason, and the only hard requirements are that it's *one* table, that anyone customer-facing can add to it in under two minutes, and that a request can never silently skip a state. I've seen a spreadsheet with those properties beat an expensive dedicated tool without them, repeatedly. Friction at capture is the killer: if logging a request takes longer than a Slack message, the Slack message wins and your funnel leaks.

## The five questions

A raw request is an opening position, not information. Before it counts as evidence, someone — a PM, or a support/success person you've trained — asks the requester five questions. Not a discovery interview; five minutes, often async, sometimes right inside the support thread:

1. **What were you trying to do when you hit this?** Recovers the task the request is embedded in. The answer is almost never the feature's name.
2. **What do you do today instead?** The workaround is the single highest-signal fact you can collect. An elaborate, painful workaround means the problem is real and valued. No workaround at all usually means the problem is hypothetical — they're describing a feature they imagined, not a wall they hit.
3. **How often does this come up?** Daily friction and annual friction wear the same words in a request. They are not the same problem.
4. **What happens if we never build this?** The calibration question. "We'd churn" and "honestly, nothing" arrive with identical urgency in the original ticket. This is where they separate.
5. **What would you stop paying for if this existed?** My favorite, and the least asked. If the feature would replace a tool, a contractor, or three hours of someone's week, you've found real economic value and often the actual buyer. If the answer is a shrug, you've found a nice-to-have wearing urgent clothing.

These questions are the Mom Test's discipline in miniature — past behavior over hypotheticals, cost over enthusiasm — and I won't re-teach that here; [the discovery post](/product-management/discovery-and-customer-understanding/) covers the full craft and [the worked interview](/product-management/practicing-the-mom-test-the-same-interview-twice/) shows it live. The intake-specific point is *when* they get asked: at capture time, while the requester still remembers the moment of pain. Three months later, in a research sprint, you'll get a reconstructed opinion instead of a memory. And note what the questions never include: "would you use this?" and "how important is this to you, one to ten?" Both produce answers optimized to be agreeable, and both are how request ledgers fill up with confident noise.

## Cluster by problem, not by feature

Here's where my bulk-export story went wrong, and where most request processes go wrong: aggregation. The natural move is to tag requests by requested feature and sort by count. It feels empirical. It is actually the *decision to build the wrong thing*, made early and laundered through arithmetic — **counting mentions of a feature is how you build the wrong thing confidently.** Thirty-one export requests weren't thirty-one votes for export; they were four problems wearing the same costume, because "export" was the only word my product gave those customers for their pain.

So the clustering pass works on the interrogated problem statements, not the request titles. Monthly, in my rhythm: read the verbatims and the five-question answers, group by *underlying problem* — "can't get data to people outside the account," "needs recurring delivery of one report," "permissions model forces data out of the product" — and let one request feed multiple clusters when it genuinely spans them. The clusters are what get sized, weighed, and decided on. Individual requests are members of a cluster, never decision units themselves.

This inverts the usual demo too. "Bulk export: 31 requests" tells a roadmap meeting nothing actionable. "Nineteen accounts in our core segment can't share reports externally; here are three verbatims and the workarounds" is a decision waiting to be made. The second framing also survives contact with an engineer's "why?" — the first collapses immediately.

## Weighting: the loud logo and the quiet forty

Every intake process eventually faces the same collision: one enterprise logo asking loudly versus forty small customers asking quietly. The revenue-weight field tempts you to settle it with multiplication — weight each request by ARR and sort. Resist that, because pure revenue-weighting has a failure mode baked in: **revenue-weight everything and you'll build for the customers you already have, not the market you're trying to win.** Your current revenue distribution is a snapshot of past sales success. If the strategy says you're moving upmarket, or expanding into a new segment, the accounts that embody that future are precisely the ones with the least revenue today. A ledger sorted by ARR is a strategy document written by your billing system.

My working rule is that weight is a conversation between three fields, in order. *Segment first:* a cluster concentrated in the target segment from your [strategy](/product-management/strategy-formation-how-to-tell-a-real-strategy-from-a-wish/) outranks a bigger cluster scattered across segments you're not playing for — the forty quiet customers win if they're the segment you've chosen, and lose if they're not, and the same is true of the loud logo. *Churn-risk second, with suspicion:* requests from at-risk accounts deserve a flag and a fast follow-up call, but "build it or we leave" is a negotiation, not evidence — interrogate whether the request is the actual churn driver or just the most articulable grievance, because saving an account by building its wishlist teaches your biggest customers that threats are a roadmap input. *Revenue last,* as a tiebreaker between clusters the strategy already likes. That ordering is the whole trick. Reverse it and you have a feature factory with a finance department.

One more weighting note: the loud logo asking *before* they've signed is a different animal entirely — that's a sales-room roadmap negotiation, and it has [its own post](/product-management/the-roadmap-in-the-sales-room/). This pipeline is for people already paying you.

## Every request gets one of three answers

A cluster that's been interrogated and weighed gets exactly one of three decisions, each with a named owner and a written reason:

1. **Fits current strategy** → a backlog item is created, linked to the cluster, and enters normal [roadmap sequencing](/product-management/building-a-roadmap-you-can-defend/). Not a promise of a date — a promise that it's now real work competing on real terms.
2. **Feeds discovery** → the cluster is promising but under-evidenced; it becomes a discovery question with an owner, not a backlog item. This is the honest home for most interesting clusters, and having it as a formal state is what stops "maybe" from meaning "buried."
3. **Explicit no** → doesn't fit the strategy, or serves a segment you're not playing for, or the workaround is genuinely good enough. Written down, with the reason, so the same debate doesn't rerun next quarter with new participants.

Then the step almost everyone skips: **close the loop with the requester — especially on the no.** A customer who asked for something and heard nothing learns that asking is pointless, and your funnel quietly dries up; the absence of requests gets misread as satisfaction right up until the churn call. A customer who asked and got a clear, reasoned no learns that requests actually go somewhere, and — this surprised me the first time I watched it happen — asks *more* afterward, and better. **A closed-loop no builds more trust than a silent maybe**, because the maybe spends your credibility every month it stays silent.

Here's the no I actually send, lightly adapted per case:

> Hi Maya — you asked in March about single-request approval delegation, and I owe you a real answer: we're not going to build it, and I'd rather tell you that straight than leave it in "under consideration" forever. When we dug into it, the underlying need — covering approvals during leave — showed up for a handful of teams, but almost all of them at a company size we're honestly not building for right now; our focus for the next few quarters is [X], and I'd rather do that well than both things halfway. What I can offer today: the team-level delegation setting covers the leave case for most teams, and I've written up how at [link]. If your situation changes shape — or if this becomes the thing that decides whether we're the right tool for you — reply to this and I'll look again personally. Thank you for telling us about it. Requests like yours are how we found [Y], which did ship, so please keep them coming.

The load-bearing parts: a real reason (not "prioritization"), the strategy stated plainly, a workaround if one honestly exists, a genuine reopening condition, and proof that the channel works. What's absent matters as much — no "at this time," no "we'll keep it on our radar," none of the hedges that turn a no back into a silent maybe.

## Failure modes

Three I've watched from close range:

**The squeaky-wheel roadmap.** No ledger, so the roadmap is set by whoever escalated most recently and most loudly — usually through the AE with the best Slack access. The tell is a roadmap that reorders after every QBR season. The ledger is the fix precisely because it makes the quiet forty visible next to the loud one; without it, silence reads as absence.

**Promise-laundering.** A stakeholder's pet feature enters the ledger as "customer request" — sometimes with a real customer's name attached, who mentioned it once, mildly, in a call the stakeholder was on. The five questions are the immune response: a laundered request has no workaround, no frequency, no answer to "what happens if we never build this," because no interrogation ever happened. When intake asks them and the trail goes cold, you've found a pet feature wearing a customer costume — and it can still be argued for honestly, as a stakeholder bet, just not with borrowed evidence.

**Request-count theater.** The ledger metastasizes into a QBR slide: "we received 214 requests and shipped the top 12." It sounds accountable and it's the bulk-export mistake institutionalized — counting request titles as votes and reporting throughput as customer-centricity. The moment shipped-request-count becomes a team's success metric, the team is a feature factory with a dashboard. The defensible version of that slide reports *problems*: which clusters we found, what we decided about each, and how many requesters heard back. Decisions and closed loops, not tonnage.

## Put it to work

1. **Split the ledger from the backlog this week.** One table, four fields — requester, segment, revenue weight, verbatim problem — and tell every customer-facing team where it lives. Then go through your current backlog and move everything that's actually an undecided request into it. The backlog you're left with is the work you've genuinely chosen; expect it to be startlingly short.
2. **Put the five questions where capture happens** — a saved reply in the helpdesk, a snippet in the CRM. Interrogation only happens reliably if it costs the asker nothing to start.
3. **Run one clustering pass on your last ninety days of requests**, reading verbatims only, titles covered. In my experience the first pass finds at least one "most-requested feature" that dissolves into two or three different problems — and that dissolution will change what you build next quarter.
4. **Send three closed-loop nos this month** using the template above, to real requesters, on requests you've genuinely decided against. Watch what it does to the relationship. This is the cheapest trust-building move in the entire product operating rhythm.

## Further reading

- Rob Fitzpatrick, *The Mom Test* — the interrogation discipline behind the five questions; the intake pipeline is essentially the Mom Test applied at the funnel instead of the interview.
- Teresa Torres, *Continuous Discovery Habits* — the opportunity solution tree is the grown-up version of clustering by problem; her opportunity mapping is where a "feeds discovery" decision goes next.
- Melissa Perri, *Escaping the Build Trap* — the book-length case against the feature factory this whole pipeline exists to prevent; especially sharp on why shipped-request-count is a vanity metric.
