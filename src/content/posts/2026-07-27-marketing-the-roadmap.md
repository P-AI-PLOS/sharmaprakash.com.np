---
title: "Marketing the Roadmap: Launch Tiers and Messaging"
date: "2026-07-27T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Most teams treat marketing as the thing that happens after shipping — a tweet, a changelog entry, silence. But marketing runs on the same roadmap engineering does, and the hands-on machinery is small: a positioning-to-messaging pipeline, three launch tiers, and a calendar derived from the Now column. Here's the whole system."
use_featured_image: false
---

A team I worked with once shipped the most important feature in their product's history on a Tuesday, announced it in a tweet and a changelog entry, and moved on. Four months later their biggest competitor shipped a worse version of the same capability with a launch week, a category argument, and a customer-story campaign — and for the next year, prospects asked us whether we planned to build the thing we'd shipped first. We had won the engineering race and lost the *noticing* race, and the noticing race was the one with revenue attached. The post-mortem finding was uncomfortable: marketing hadn't dropped the ball. Marketing had found out the feature existed the same Tuesday everyone else did.

The structural fix is the point of this post: **marketing runs on the roadmap, or it runs on scraps.** The same artifact that sequences engineering — [built in the first post](/product-management/building-a-roadmap-you-can-defend/), then presented to [investors](/product-management/presenting-the-roadmap-to-investors/) and [buyers](/product-management/the-roadmap-in-the-sales-room/) — is marketing's supply chain: it tells them what's coming, how much it matters, and when to start building the story. This is the last room in the run, and the machinery is genuinely small — a messaging pipeline, a tier system, and a calendar — which is why it's so consistently skipped.

## The pipeline: positioning → messaging → everything else

Everything marketing says is downstream of [positioning](/product-management/positioning-the-choice-you-make-before-the-market-makes-it-for-you/), and the hands-on move is making that dependency an actual artifact instead of a vibe. The **messaging house** is the standard form, one page: the positioning statement on top (segment, category, differentiated value — Dunford's five components, compressed); under it, three pillars — the three claims you want the market to associate with you; under each pillar, the proof (features, numbers, customer quotes). Every launch post, landing page, and campaign should trace to a pillar, and the discipline is auditable: copy that traces to no pillar is noise, and a pillar with no proof under it is an aspiration you're publishing.

If you run [Working Backwards](/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/), notice the compounding trick: **the launch press release already exists.** The PR/FAQ you wrote to decide whether to build the thing is the launch messaging's first draft — customer problem, plain-language value, the quote describing life after. Teams that run PR/FAQ and still start launch messaging from a blank page are paying for the discipline twice and collecting once. The document that survived hostile review is precisely the story worth telling in public; the drafts where the press release had no news in it are precisely the features that deserve a changelog entry and nothing more — which is the tier decision, made for you, months early.

The other input marketing chronically lacks is language, and [discovery](/product-management/discovery-and-customer-understanding/) already collects it. The words customers use for their problem — in interviews, in sales-call ask logs, in support tickets — are the words that convert, because they're the words being searched and said in buying committees. A monthly habit of pulling verbatim customer phrasing from discovery notes into the messaging house keeps the copy in the customer's language instead of drifting back toward your org chart.

## Launch tiers: the decision that prevents both silence and fatigue

The Tuesday-tweet failure and its opposite — the team that runs a "launch" for every minor release until the audience stops attending — are the same missing decision: how big is this? The standard fix is three tiers, decided when an item enters the roadmap's Next column, not in the week before ship:

- **Tier 1** — moves the positioning itself: a new pillar, a new segment, a category argument. A campaign, not a day: pre-briefed customers, sales enablement, content series, maybe an event. One to three per year, and scarcity is the point — a team with six Tier 1 launches a year has five Tier 2 launches and an honesty problem.
- **Tier 2** — meaningfully strengthens an existing pillar. A launch day: post, email, demo video, sales notes. Monthly-ish.
- **Tier 3** — everything else. Changelog, in-app note. Continuous, and genuinely valuable in aggregate — a visibly active changelog is trajectory evidence, the same evidence [the sales post](/product-management/the-roadmap-in-the-sales-room/) leans on.

The tier lives *on the roadmap item*, next to problem, outcome, confidence, and appetite from [the build post](/product-management/building-a-roadmap-you-can-defend/). That one line is the whole coordination mechanism: marketing reads the Now and Next columns and knows what's coming and how much story to build; the monthly roadmap review's changelog tells them when things move. The launch calendar stops being a negotiation and becomes a *derivation* — which also means marketing belongs in the roadmap review, not on its distribution list. When a Tier 1 item slips, marketing re-plans a campaign; when they learn about the slip from the release notes, they burn a campaign, and after two of those they stop building campaigns at all — which is how companies end up with the Tuesday tweet as their permanent launch motion.

## Measuring it: the marketing branch of the metric tree

Marketing measurement fails in two symmetrical ways: vanity metrics (impressions, likes, traffic with no path to revenue) and attribution theater (elaborate models proving whatever the model's author needed proved). The escape is the same move as [the North Star post](/product-management/north-star-metrics-and-metric-trees/) — marketing metrics are a *branch of the same tree*, not a separate dashboard. Qualified pipeline from the target segment; activation rate of launch-driven signups; the messaging test hiding inside win/loss notes — did the buyer repeat a pillar back, or did they describe you as something you're not? That last one is the cheapest positioning instrument you own: when prospects consistently file you on the wrong shelf, the messaging pipeline has a defect, and no amount of volume fixes a wrong message.

The failure modes, compressed: **the launch-as-strategy** (a big bang covering for a weak ongoing motion — the campaign spikes, the baseline doesn't move, and next quarter demands a bigger bang); **jargon leakage** (announcements written in internal component names — the tell is a launch post whose nouns don't appear in any customer interview); **the decoupled calendar** (marketing planning against a roadmap snapshot from two quarters ago); and **the missing feedback loop** — marketing is a discovery instrument, not just a broadcast channel, and message tests, campaign response, and win/loss language are evidence that should flow back into [the roadmap review](/product-management/building-a-roadmap-you-can-defend/) with everything else. And the oldest failure of all — marketing the roadmap itself instead of shipped product — has its own body count, from [Osborne through Star Citizen to the Cybertruck](/product-management/osborne-star-citizen-cybertruck-roadmap-promises/).

## Put it to work

1. **Build the messaging house this week** — one page, positioning statement, three pillars, proof under each. Then audit your five most recent launch posts against it. Copy that traces to no pillar, and pillars with no proof, are the two defect lists; both are fixable in a sprint.
2. **Tier your current Next column.** One line per item, decided now, months before ship. Then count the Tier 1s across the next twelve months — more than three means the tiers are aspirational, zero means either the roadmap has no positioning-moving bets or you've stopped telling anyone about them. Both findings go to the roadmap review.
3. **Put marketing in the monthly roadmap review,** and add one metric from the marketing branch — qualified pipeline from the target segment is the usual right first pick — to the tree everyone already looks at. The calendar coordination and the vanity-metric problem mostly dissolve as side effects.

## Further reading

- April Dunford, *Obviously Awesome* — positioning as the upstream artifact; the messaging house is this book operationalized.
- Colin Bryar & Bill Carr, *Working Backwards* — the PR/FAQ-to-launch reuse; the press release you argued over is the launch story you ship.
- Geoffrey Moore, *Crossing the Chasm* — dated in its examples, durable in its core claim: segment-specific whole-product messaging beats broadcast, especially at Tier 1 moments.
- Emily Kramer's MKT1 newsletter — the most concrete practitioner writing on launch tiers, marketing-as-function-of-product, and early-stage marketing sequencing.
