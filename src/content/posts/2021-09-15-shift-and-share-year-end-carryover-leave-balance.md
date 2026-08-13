---
title: "Shift & Share: Spreading the Workarounds Before They Become Policy"
date: "2021-09-15T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Four Leave Balance support pods each had their own private ritual for surviving the year-end carryover run. Shift & Share put those rituals on four tables at once — and turned three undocumented workarounds into two product bugs and one feature."
tags: [liberating-structures, leave-balance]
series: ls-culture
seriesOrder: 5
use_featured_image: false
---

Every December, Leave Balance runs carryover: unused leave rolls into the next year, capped by policy, prorated for mid-year joiners, and wrong often enough that four support pods had each built a private survival ritual around it. One pod had a spreadsheet that pre-flagged accounts likely to break. One had a Slack macro with a customer-facing apology template. One had a genuinely alarming habit of manually editing balances before the run so the run wouldn't produce a number they'd have to explain. The fourth pod, newest, had nothing and dreaded December.

None of this was in any runbook. It surfaced because we ran **Shift & Share** in October, six weeks before carryover, with one station per pod.

## The format

Shift & Share is Liberating Structures' answer to the sequential presentation meeting. Instead of four pods presenting one after another to a passive room, you set up four stations — one per pod — and split the audience into four groups. Each group spends about ten minutes at a station: a short, concrete "here's what we actually do" walkthrough from the pod, then questions. Then everyone rotates. Presenters stay and repeat.

Ninety minutes total for four stations, including the shuffle. The facilitator does almost nothing except keep time and refuse to let a group linger.

For this session I did one thing differently from the standard setup: I asked each pod to demo their *workaround*, not their process. "Show us the thing you do that isn't written down anywhere." That framing is the reason it worked.

## What came out of the four stations

**The pre-flag spreadsheet** was the crowd favourite and, on inspection, an indictment. The pod had built a query that identified accounts where an employee's accrual policy had changed mid-year — the exact case our proration logic got wrong. They'd been running it every December for two years and manually correcting the output afterwards. Two years of a known defect, invisible to engineering, because the pod had successfully absorbed it. In a plenary status meeting this would have been reported as "carryover went fine." At a table with six people, one of whom was a backend engineer, it took four minutes to become a reproducible bug report.

**The manual balance edits** were harder to hear. That pod's lead demoed it honestly — here's the admin screen, here's what we change, here's why — and the room's first reaction was visible discomfort. But the reason was legitimate: for one enterprise customer with a negative-balance policy, the run produced a number that was technically correct and impossible to explain to an employee. They were editing to protect the customer relationship, not to hide anything. That turned into a product decision about how negative carryover displays, not a compliance incident. It only landed that way because the demo happened in a small group rather than in front of a director on a projector.

**The apology macro** became a template we shipped in-product.

**The newest pod's station** had nothing to demo, so they used it to ask each rotating group the same question: what do you wish someone had told you before your first December? By rotation four they had a page of notes that became the actual runbook — better than one written by any single pod, because it aggregated four.

## Why the rotation matters more than the content

Two mechanics do the work. The first is repetition: each pod gave their walkthrough four times, and the fourth was tight, honest, and pre-emptively answered the questions the first three groups had asked. Nobody prepared slides; the format edited the presentation for them.

The second is the size of the audience. What made this session valuable was three pods admitting to workarounds, and admission scales inversely with audience size. Six people around a laptop is a conversation. Forty people facing a screen is a performance review with extra steps, and in that setting every pod reports that carryover went fine.

There's also a quieter effect: putting the newest pod at a station as a *station*, not an audience, gave them standing they hadn't earned yet by tenure. They contributed the thing the org most needed — a naive person asking what everyone else had stopped noticing.

## Where it breaks

The framing carries real risk. Asking teams to demo undocumented workarounds only works if there is genuine safety in doing so; if anyone in the room has, historically, punished this kind of honesty, you'll get four sanitized process walkthroughs and learn nothing. I said explicitly at the start that nothing from this session would be attributed in any report, and I meant it. Don't run this version of it in an org where you can't make that promise.

Shift & Share also doesn't converge. We left that session with a pile of findings and no decisions, deliberately — the bug went to engineering's normal triage, the display question went to a product review, the runbook went to a shared doc. Trying to resolve all of it in the last ten minutes would have wrecked the tone and produced worse decisions than a week of follow-up did.

And it needs at least three stations with genuine content. Two pods with something to show is a conversation, not a rotation; just have the conversation.
