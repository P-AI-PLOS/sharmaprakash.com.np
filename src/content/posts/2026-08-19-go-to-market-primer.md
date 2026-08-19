---
title: "Go-To-Market: A Primer for the Night Before"
date: "2026-08-19T10:00:00+05:45"
category: ["Product", "Primer"]
categories: ["product-management"]
directory: product-management
excerpt: "ICP, positioning, motions, pricing, channels, funnel metrics and growth loops — the whole go-to-market surface compressed into one page you can read in twenty minutes before an interview, with the ten things worth recalling under pressure at the bottom."
use_featured_image: false
tags:
  - primer
  - go-to-market
  - interview-prep
  - product-management
---

Most go-to-market writing is either a 300-page book or a LinkedIn post that says "know your ICP." Neither is useful the night before an interview, or the morning before a strategy session where you need the vocabulary loaded and the trade-offs at hand.

This is the middle thing: the whole GTM surface on one page. Read it top to bottom once. After that, use the headers as recall prompts — if you can reconstruct the section from the header alone, you know it; if you can't, that's the section to reread.

It is deliberately product-agnostic. Where I've written about a piece of this in depth elsewhere, I've linked it.

## What GTM actually is

GTM is the **repeatable system by which a specific value proposition reaches a specific buyer through a specific channel at a specific price.** Four variables — *who, what, how, how much*.

Every GTM failure traces to one of them being wrong or, far more often, to them being **incoherent with each other**. Enterprise ICP plus a $10 self-serve price plus a content-marketing channel: none of those three can carry the other two.

Strategy is not GTM. Strategy picks the market. GTM is the machine that enters it.

**The coherence test:** can your CAC be paid back by your price inside the sales cycle your channel produces? If not, one of the four variables has to change — and you should be able to say which one and why.

## ICP and segmentation

**ICP (Ideal Customer Profile)** is the *account* archetype. **Persona** is the *human* inside it. **Buying committee** is everyone who can say no.

Define the ICP by attributes that you can filter a list on *and* that predict value:

- **Firmographic** — industry, headcount, geography, revenue.
- **Technographic** — what they already run, as a proxy for readiness.
- **Behavioural / trigger** — hiring spike, funding round, new regulation, a competitor's price change.
- **Pain intensity** — is this a top-three problem or a nice-to-have?

**Beachhead strategy** (Moore, *Crossing the Chasm*): don't enter "SMBs." Enter one segment narrow enough that word of mouth circulates inside it and you can plausibly be the obvious number one. Win it, then move to an adjacent segment. Adjacency is by *shared buyer or shared channel* — not by shared feature. I've walked through picking one in [beachheads and the list](/product-management/marketing-strategy-for-innovation-beachheads-and-the-list/).

Heuristics worth carrying:

- Segment by **job to be done** when the product is horizontal.
- Segment by **buying process** when the product is vertical — who signs, what compliance blocks it.
- Kill segments that need a different *motion*. A segment requiring a different motion is a different company, not a different campaign.

**Anti-patterns:** the ICP written after the fact to justify the customers you already have; TAM slides standing in for a beachhead; "our ICP is anyone with X," which is a category, not a profile.

## Positioning

Positioning is **context-setting**. What you are compared against determines what your features mean.

April Dunford's frame, worked bottom-up rather than from a tagline:

1. **Competitive alternatives** — what they would do if you didn't exist. Usually "a spreadsheet" or "nothing."
2. **Unique attributes** — what you have that those alternatives don't.
3. **Value** — what those attributes let the customer actually do.
4. **Who cares a lot** — the customers for whom that value is urgent. This step reshapes your ICP.
5. **Market category** — the frame of reference you place yourself in.

**Category choice is a pricing decision.** Positioning against spreadsheets caps you near zero. Positioning inside "HR platform" invites comparison to $50/seat incumbents — good for your price, punishing on feature-parity expectations. The longer argument is in [positioning: the choice you make before the market makes it for you](/product-management/positioning-the-choice-you-make-before-the-market-makes-it-for-you/), and the case-study version in [we don't sell saddles here](/product-management/we-dont-sell-saddles-slack-jasper-positioning/).

**Messaging hierarchy:** positioning (internal, stable) → value props (per persona) → messaging (per channel) → tagline (last, and least important). Starting at the tagline is the most common way to waste a quarter.

**Differentiation types**, in descending order of durability: structural (data, network, distribution) > workflow and integration lock-in > brand > feature > price. Price differentiation is the least defensible and the fastest copied.

## GTM motions

A motion is who does the selling and how the buyer moves.

| Motion | Buyer journey | ACV that supports it | Core competency |
| --- | --- | --- | --- |
| **PLG / self-serve** | Signs up, tries, pays | under $5k | Onboarding and activation |
| **Product-led sales** | Self-serve → usage signal → sales expands | $5k–$50k | Signal detection, timely outreach |
| **Inbound sales** | Content → demo → close | $10k–$100k | Content engine, SDR/AE bench |
| **Outbound sales** | Cold list → meeting → close | $25k+ | List quality, sequencing |
| **Enterprise / field** | Multi-threaded, RFP, procurement | $100k+ | Champion-building, security review |
| **Channel / partner** | A partner sells or resells | varies | Partner economics, enablement |
| **Community / ecosystem** | Advocates pull the product in | varies | Genuine practitioner presence |

**The rule of thumb:** ACV determines the affordable motion. A human in the loop costs roughly $500–$2,000 per closed deal at the very floor, so under about $2k ACV you cannot afford one. Under about $500 ACV you can barely afford paid acquisition either — you need organic, viral, or a structurally cheap channel.

Motions compose, but they shouldn't blur. Bottom-up PLG alongside top-down enterprise on the same account is normal — that's land-and-expand. Running two motions with one team and one set of metrics is not.

## Pricing and packaging

**Packaging** — what's in a tier — matters more than **price**, the number. Packaging decides who self-selects into what.

**Value metric** is what you charge per unit of. A good one (a) grows with the customer's realised value, (b) is predictable to the buyer, and (c) is hard to game. Per-seat is the default but breaks when agents remove seats; usage-based aligns better but frightens finance; hybrid — platform fee plus usage — is where most B2B SaaS has landed.

Approaches, worst to best: cost-plus (never, for software) → competitor-anchored (safe, commoditising) → **value-based**, pricing as a fraction (typically 10–25%) of quantified value delivered.

**Tiering.** Three is the norm. Good/Better/Best with the middle designed to be chosen. Every tier boundary should sit on a **buying trigger**, not an arbitrary feature fence.

**Free.** A *free trial* is time-boxed and suits fast time-to-value with a complete product. *Freemium* is permanent and only works if free users cost little at the margin *and* either create distribution or convert reliably — 2–5% is the usual band.

**Discipline.** Discount on term or volume, never on value. Grandfathering is a retention tool and a pricing-experiment blocker at the same time, so decide deliberately whether grandfathered cohorts are forever or for N years. Raise prices annually, in small increments, announced early, paired with visible shipped value: customers churn on surprise, not on price. More on pricing a thing that has no comparables in [pricing strategy for new ventures](/product-management/pricing-strategy-for-new-ventures/).

## Channels

A channel is the mechanism of first contact. Only a handful ever matter per company; the rest are noise.

- **Organic search and content** — compounds, slow (6–12 months), fragile to algorithm and AI-answer shifts.
- **Paid search and social** — instant and measurable; its real value early is buying *learning* fast. Caps at your LTV.
- **Outbound** — controllable and traffic-independent; needs list, offer, and volume discipline.
- **Product virality** — invites, shared artifacts, watermarks. The best economics, if the product shape allows it.
- **Partnerships, integrations, marketplaces** — borrowed distribution. Slow to land, durable once landed.
- **Community, events, PR, influencers** — trust-heavy, hard to attribute, disproportionately effective for high-consideration purchases.

**The bullseye method** (Weinberg and Mares): list every channel, pick three to test cheaply, find the one that works, then focus everything there until it saturates. Companies rarely die from picking the wrong channel. They die running six half-funded ones.

**Channel–motion fit** is the constraint that binds. The channel has to deliver buyers at a cost your motion and price can absorb. Content feeds inbound sales; marketplaces feed PLG; events feed enterprise; cold email feeds mid-market outbound. Mismatches here are the most expensive common mistake in GTM.

## The funnel and its metrics

**Pirate metrics (AARRR):** Acquisition → Activation → Retention → Referral → Revenue. For a young product, read them in priority order — retention before acquisition, always. Pouring acquisition into a leaky product is the classic burn.

Definitions worth having exact:

- **Activation** — the moment a user first experiences core value. Define it as an observable event, not as signup.
- **CAC** — *fully loaded* acquisition spend, marketing plus sales salaries, divided by new customers. Per segment and per channel, or it tells you nothing.
- **LTV** — gross-margin adjusted: `ARPA × gross margin % ÷ monthly churn rate`.
- **LTV:CAC** — 3:1 is the healthy benchmark. Much higher usually means under-investing in growth, not excellence.
- **CAC payback** — months of gross profit to recover CAC. Under 12 months for SMB, under 18–24 for enterprise.
- **Churn** — logo churn and revenue churn are different numbers; track both. **NRR** (net revenue retention) is the single best health indicator: above 100% means growth without new customers, above 120% is elite.

**North Star metric:** one leading indicator of delivered customer value the whole company can move. Not revenue — revenue lags. The good ones measure usage of the core action per active account, and they need counter-metrics so they can't be gamed. I've written the long version, including how to decompose one into a metric tree, in [north star metrics and metric trees](/product-management/north-star-metrics-and-metric-trees/), and the failure modes in [vanity metrics](/product-management/duolingo-rabbit-r1-north-star-vanity-metrics/).

**Attribution:** first-touch overweights discovery, last-touch overweights closing, multi-touch is directionally useful and precisely wrong. Self-reported attribution — "how did you hear about us?" — is frequently more truthful than the pixel. Use it as the sanity check.

## Growth loops

A funnel is linear and needs constant refuelling. A **loop** takes an output and feeds it back as an input:

- **Viral loop** — a user brings a user.
- **Content loop** — usage generates content that ranks and acquires users.
- **Paid loop** — revenue funds ads that acquire users who fund ads. Bounded by LTV:CAC and by channel size.
- **Sales loop** — customers become references that shorten the next sales cycle.

For each loop, be able to name the **input, the action, the output, and the cycle time**. Loops compound; funnels leak. Most companies have exactly one real loop, and should know which one it is.

## Launch

A launch is a moment, not a strategy. It pays off only when there is an audience to launch *to*.

**Tiers.** Tier 1 is company-defining and gets a full campaign. Tier 2 is a notable feature — blog, email, social. Tier 3 is a changelog entry. Most launches should be Tier 3, and teams routinely over-invest in Tier 2.

**Anatomy.** Internal readiness (support, docs, pricing page, sales enablement) → beta or design partners → narrative and assets → a coordinated day, owned channels first and earned second → two to four weeks of follow-through, which is where most of the actual signups arrive.

**Readiness check.** Can support answer the top five questions? Does the pricing page reflect it? Can sales demo it? Is the activation path instrumented? If any answer is no, delay — a launch amplifies whatever state you're already in.

## Sales fundamentals, even for PLG companies

**Qualification.** BANT is dated; MEDDIC / MEDDPICC is the enterprise standard — Metrics, Economic buyer, Decision criteria, Decision process, Paper process, Identify pain, Champion, Competition.

**Champion versus economic buyer.** A champion sells internally when you aren't in the room. The economic buyer signs. Deals die from having one without the other.

**Battlecards.** Per competitor: their pitch, where they genuinely win, where they lose, the traps to set, the objection responses. Honest battlecards get used; dishonest ones get quietly ignored by the reps.

**The handoff.** MQL → SQL definitions have to be jointly agreed and enforced, or marketing and sales will argue about lead quality forever. Define the response-time SLA and the recycle path at the same time.

## Sequencing — the order that usually works

1. **Product–market fit signal.** The retention curve flattens; around 40% of users would be "very disappointed" without you (the Sean Ellis test). Do not scale GTM before this.
2. **Founder-led sales.** Twenty to fifty deals sold by a founder. Not for the revenue — for the transcript of objections, language, and buying process.
3. **Codify.** ICP, positioning, pricing, and a repeatable pitch, written down.
4. **One channel to repeatability.** Prove CAC and payback in a single channel.
5. **Hire to the proven motion**, not the aspirational one.
6. **Add a second channel or segment** — once the first is saturating, not once it's boring.

**GTM fit is not product–market fit.** You can have PMF and no GTM fit: people love it, and you cannot reach them profitably. That failure mode is common, and it is almost always misdiagnosed as a product problem.

## Failure modes worth recognising on sight

| Symptom | Usual root cause |
| --- | --- |
| High traffic, low conversion | Positioning or ICP mismatch — not copy |
| Good conversion, bad retention | Wrong ICP; you're selling to people the product doesn't serve |
| Long sales cycles at low ACV | Motion–price incoherence; go self-serve or raise the price |
| Every deal is bespoke | No beachhead; the segment isn't narrow enough |
| CAC rising in a working channel | Channel saturation — start the next one *before* this |
| The team argues about lead quality | No agreed MQL/SQL definition |
| Launches land quietly | No owned audience; you're launching *at* a market, not *to* one |

## The ten to recall under pressure

1. Who, what, how, how much — and they must cohere.
2. Beachhead over TAM.
3. Positioning is choosing the comparison set.
4. ACV determines the affordable motion.
5. The value metric matters more than the price.
6. Three channels tested, one funded.
7. Retention before acquisition.
8. LTV:CAC 3:1, payback under 12–18 months, NRR above 100%.
9. Loops compound; funnels leak.
10. Founder-led sales before any hire.

## If you want to go deeper

Dunford, *Obviously Awesome* (positioning) · Moore, *Crossing the Chasm* (beachhead) · Weinberg and Mares, *Traction* (channels) · David Skok's SaaS metrics essays (unit economics) · Ellis and Brown, *Hacking Growth* (experimentation) · Reforge's growth-loops material.

---

*This is the first in a set of primers — one-page revision sheets on the things that come up in product interviews and strategy conversations. Agile, Scrum, product roles, prioritization frameworks and continuous discovery are queued. They're all filed under the [Primer](/category/primer/1/) category.*
