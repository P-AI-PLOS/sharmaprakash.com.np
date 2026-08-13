---
title: "Integrated~Autonomy: One Accrual Engine, Eleven Countries, No Winner"
date: "2021-09-27T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Every country Leave Balance expanded into added exceptions to a core accrual engine that was supposed to be universal. The fix wasn't a bigger engine or eleven forks — it was ninety minutes spent refusing to choose between them."
tags: [liberating-structures, leave-balance]
series: ls-culture
seriesOrder: 9
use_featured_image: false
---

By our eleventh country, Leave Balance's accrual engine had thirty-one conditional branches keyed on country code, and the last three had been added by an engineer who no longer worked here. Portugal's mandatory carryover deadline, India's earned-leave encashment rules, the UK's part-year holiday calculation after a mid-2021 tribunal case — each arrived as an exception bolted to a function originally written on the premise that leave accrual is basically the same everywhere.

The two proposals were the two you'd expect. Build a rules engine general enough to express any country's policy. Or fork the accrual service per region and let each team own theirs. Both had a champion, both had a cost estimate, and the meeting to choose between them had been rescheduled twice because everyone could feel that both answers were somehow wrong.

We ran **Integrated~Autonomy** instead of holding it a third time.

## The structure

Integrated~Autonomy treats a recurring centralize-or-localize argument as a paradox to be worked rather than a decision to be made. You write the tension as a pair joined by a tilde — *integrated ~ autonomous* — and then, using 1-2-4-All at each step, build two concrete benefit lists (what integration genuinely buys us; what autonomy genuinely buys us), and only then generate actions that would increase *both*. You close by committing to a few of those and naming the signal that will tell you the balance has drifted. Ninety minutes, one wall, no slides.

The order is load-bearing. Both lists get built before anyone proposes anything, which means the room spends the first hour describing value rather than defending positions.

## The two lists, and the thing between them

Integration bought us: one place to fix a rounding bug, one audit trail format our SOC 2 evidence depended on, one set of tests, and — the item that mattered most — a customer operating in four countries seeing one balance number per employee rather than four.

Autonomy bought us: speed of response to regulatory change (Portugal's deadline shift took five weeks through the central engine; a regional team could have done it in four days), the ability for a regional expert to read and verify the rules that applied to them, and freedom to onboard country twelve without a core-engine release.

Written side by side, the shape of the answer was almost visible. The integration benefits were nearly all about *the ledger* — how balances are recorded, audited, and displayed. The autonomy benefits were nearly all about *the rules* — what accrues, when, under what conditions. Two different things that had been living in one function since the day the product had exactly one country in it.

The both/and commitments followed. The ledger stayed absolutely central: one balance model, one immutable transaction log, one audit format, no country codes anywhere in it. The rules moved out into per-country policy modules with a declared interface, owned by whoever knows that jurisdiction, releasable independently, each with a conformance suite that runs against the shared ledger. A new country becomes a new module, not a pull request against thirty-one branches.

We also named the drift signal, because this structure insists on one: if a country module ever needs a change to the ledger schema to express its rules, that's the alarm — either the ledger model is wrong or someone is smuggling policy into it.

Country twelve took nine days.

## Why the paradox framing produced a decomposition

Framed as a decision, this was "general engine or forks," and both answers are about the same undifferentiated object. The moment you're required to list what each pole genuinely gives you — concretely, with examples — you stop describing the object as one thing. Our two lists were describing different subsystems and nobody had noticed, because in the code they were the same file.

That's the recurring payoff of Integrated~Autonomy in my experience: the both/and answer is almost never a compromise on a slider. It's a seam. The structure's real function is to find where the seam should be, and it does that by refusing to let the room collapse into a single axis with two ends.

The 1-2-4-All wrapping matters too. Both champions were in the room, and in an open debate the benefit lists would have been argued rather than compiled. Solo writing first meant the fork advocate contributed several of the strongest integration benefits — including the one about multi-country customers seeing a single number, which none of the centralizers wrote down.

## When not to reach for it

Don't use it as a way to avoid a decision that's genuinely binary. Some things really are one-or-the-other, and a room that badly wants to avoid conflict will happily generate mushy both/and language to postpone a real choice. If, after building both lists, nobody can point at a plausible seam, stop and make the call.

Don't run it with only one pole represented. Ours worked because the fork advocate and the general-engine advocate were both present and both wrote. With only one camp in the room you get a well-facilitated confirmation of what that camp already believed.

And be honest about the cost of the seam. Splitting ledger from rules bought us independence and added an interface to maintain, a conformance suite to keep honest, and a new category of bug — a module that's individually correct and collectively inconsistent. Both/and isn't free; it's a different bill.
