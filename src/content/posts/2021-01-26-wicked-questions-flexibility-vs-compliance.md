---
title: "Wicked Questions: Flexibility vs. Compliance in Leave Policy"
date: "2021-01-26T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Every leave-policy feature request is secretly an argument about whether the product should bend to managers' judgment or hold a hard line for legal defensibility. Wicked Questions puts that argument on the table instead of relitigating it ticket by ticket."
tags: [liberating-structures, leave-balance]
series: ls-discovery
seriesOrder: 6
use_featured_image: false
---

We kept having variations of the same fight. A manager wants to approve a leave request that technically exceeds an employee's remaining balance because they know the employee will accrue enough by the time the leave starts. Should the product allow that override, or block it because allowing "trust me, it'll balance out" exceptions is exactly the kind of soft edge that turns into an unfair, inconsistent policy — and a compliance risk — the moment two managers apply it differently. We'd resolved four or five versions of this argument as one-off tickets, each time re-deriving the same reasoning from scratch, before it occurred to me that we weren't actually solving different problems. We were solving one problem, repeatedly, without ever writing the problem down. **Wicked Questions** is built for exactly that situation.

## What it is

Wicked Questions surfaces and names a genuine polarity — two things a team legitimately values that pull against each other — as a single sentence in the form "how do we do X while also doing Y." The point isn't to resolve the tension (a true polarity can't be permanently resolved, only managed) but to make it explicit enough that individual decisions can be made *as trades against a named spectrum* instead of as isolated first-principles arguments every time.

The process runs bottom-up: individuals draft a candidate wicked question alone, in silence, then pair up and merge into a sharper joint version, then pairs merge into fours and refine again, converging toward a small number of strong candidates the whole group recognizes as true. The test of a good one is discomfort, not agreement — if the sentence resolves cleanly to "just pick the obviously better side," the group hasn't found the real tension yet.

## Getting there

First-round individual drafts leaned one direction or the other, same as any first pass: "how do we give managers enough discretion to handle real human situations" (flexibility-leaning) versus "how do we make sure leave decisions are consistent enough to survive an audit" (compliance-leaning). Neither held real tension on its own.

The pair merge is where it sharpened: "How do we give managers real discretion to make humane, context-aware leave calls, while making sure the same policy applied by two different managers produces the same result for two employees in the same situation?" That's closer — it names both goods and states plainly that they can conflict (discretion, by definition, means two managers *can* make different calls for similar situations).

The full-group convergence landed on: **"How do we let managers exercise judgment on real, individual leave situations while keeping the policy consistent and legally defensible across the whole organization?"** Reading it aloud produced exactly the slightly uncomfortable silence that's the sign of a real wicked question — because everyone in the room, on reflection, agreed both halves mattered and that no clean rule satisfies both simultaneously.

## What it changed

The advance-approval override ticket — the one that had prompted the whole session — got resolved differently once there was a named tension to place it against. Instead of a binary "allow or block," the team designed a middle position that explicitly serves both poles: managers *can* approve a request that exceeds current balance, but the system requires an explicit, logged reason field, visible to HR and auditable later, rather than a silent override. That gives managers the discretion (flexibility pole) while giving the organization a consistent, reviewable record of every exception (compliance pole) — neither pole "wins," which is exactly what a true polarity should produce.

The bigger shift was in how the team scoped new leave features afterward. A proposed "manager can adjust anyone's balance directly" admin tool got flagged early as an almost pure bet on the flexibility pole with no compliance counterweight, and the team added an audit trail and an approval-required-above-threshold rule to the scope before it ever got built, rather than discovering the compliance gap after a customer's HR team complained. Conversely, a "hard block, no exceptions ever" proposal for negative-balance leave got softened once the group recognized it was an unhedged bet on the compliance pole that would produce real, frequent frustration for managers handling ordinary edge cases like a new hire's first year.

It also changed how the team talked to customers. Framing feature conversations explicitly around "where on the flexibility-compliance spectrum do you want your org to sit" gave account managers a vocabulary that mapped directly onto how actual HR leaders think about their own policies — some organizations genuinely want more manager discretion, others (heavily regulated ones especially) want the system to enforce hard rules with no exceptions at all. Naming the polarity turned a one-size-fits-all product debate into a configuration conversation, which is closer to what the underlying reality actually is.

## Why naming it beats picking a side

The instinct in every one of the earlier one-off tickets had been to resolve the tension as if it were a bug: pick flexibility, or pick compliance, ship it, move on. That approach guarantees the same fight resurfaces on the next adjacent ticket, because the underlying tension was never actually addressed — only postponed and displaced onto a new feature. A wicked question doesn't make the tension go away; it gives the team a durable, reusable frame for making the trade consciously, decision by decision, instead of re-deriving first principles (and re-litigating the same disagreement) every single time a new leave-policy edge case appears.

## Failure modes and when to skip it

The most common mistake is accepting a first-draft sentence that's actually one-sided dressed up in "while also" language — "how do we give managers full discretion while also making sure they don't abuse it" secretly already assumes discretion is the default and compliance is just a guardrail, which isn't a real polarity, it's a soft version of one side. Push the room to keep refining until the sentence genuinely produces discomfort when read aloud.

Skip Wicked Questions for anything with a factual, discoverable answer — this is not the tool for "what does labor law actually require in this jurisdiction," which is a research question, not a values tension. And once a wicked question is named, resist treating it as permanently settled: if the product moves into new regulatory jurisdictions with genuinely different compliance floors, the sentence itself may need re-drafting, not just re-application.
