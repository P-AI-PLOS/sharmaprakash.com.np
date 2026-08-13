---
title: "15% Solutions: What the Team Could Fix Without Asking Anyone"
date: "2021-08-25T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Recap CRM's activation problem had been waiting eight months for an onboarding redesign that kept missing the roadmap. Twenty-five minutes of 15% Solutions surfaced eleven things people could already do — and moved the number before the redesign ever got a slot."
tags: [liberating-structures, recap-crm]
series: ls-retro
seriesOrder: 4
use_featured_image: false
---

Third quarter running, the same slide: 41% of Recap CRM signups never connect a mailbox, and a mailbox connection is the difference between a CRM that fills itself and an empty spreadsheet with a login. Third quarter running, the same response: the onboarding redesign is the fix, the onboarding redesign needs six weeks, the onboarding redesign did not make the roadmap.

What that pattern does to a team is worse than the metric. Eight months of "we know what's wrong and we're not allowed to fix it" teaches everyone that the problem belongs to someone else's calendar. So instead of relitigating the roadmap, I ran **15% Solutions** on it, which asks a deliberately narrow question: forget the redesign — what can *you* do about this, starting now, with no new budget, no new headcount, and nobody's approval?

## How it runs

15% Solutions comes from Gareth Morgan's observation that people typically have about fifteen percent discretion over their own work — a slice that's genuinely theirs, no permission required. The Liberating Structure turns that into a twenty-five minute sequence:

1. **Five minutes, silent, alone.** Each person writes their own list. Two constraints, both non-negotiable: it must be within your own discretion, and it must be something you could start this week.
2. **Groups of two to four.** One person presents their list — two or three minutes, no more.
3. **Peers consult** for four or five minutes: clarifying questions first, then advice, suggestions, offers of help.
4. **Rotate** until everyone in the group has presented.

That's it. No plenary vote, no consolidated action plan, no prioritisation. The facilitator's job is protecting the constraint, because every group tries to break it the same way — "well, if we had two engineers for a sprint…" is not a 15% Solution, it's the redesign again wearing a hat.

## Eleven things, none of which needed a roadmap slot

Nine people: two engineers, a designer, the PM, two on support, two in sales, one in marketing. The lists came back specific in a way eight months of discussion had not.

A support engineer's: rewrite the mailbox-connection help article, which she'd been meaning to do for a year and which was, she noted flatly, currently wrong about Google Workspace admin consent. Nobody's permission needed. Two hours.

A backend engineer's: the OAuth callback swallowed the provider's actual error and rendered a generic "couldn't connect, try again." He could surface the real message in an afternoon. During his consult round, support said they saw roughly a dozen tickets a week that were plainly this — people whose admin had blocked third-party apps, being told to try again forever.

The designer's: she couldn't rebuild onboarding, but she could change the empty state of the contacts list from a decorative illustration into a single button that starts the mailbox connection. One component.

A salesperson's: stop demoing the CRM with a pre-seeded demo account and connect his own mailbox live on the call, so prospects saw the step before they hit it alone. That one cost nothing and changed his week.

Marketing's: move the mailbox-connection step into the welcome email, which she owned outright and could edit that day.

Eleven items total. What made the consult rounds worth the clock was the collision between them: the engineer surfacing OAuth errors didn't know support had a dozen tickets a week riding on it, and support didn't know it was an afternoon's work. Their lists had been written four feet apart in silence.

Six of the eleven were done within two weeks. Mailbox connection at day seven went from 59% to 68% over the following month. The redesign still hasn't shipped.

## Why the constraint is the whole structure

The instinctive read is that 15% Solutions is about small fixes. It isn't — it's about *location*. The question "what should we do about activation" points at the organisation, and its honest answer is always a thing the organisation isn't doing. The question "what can you do without asking" points at the individual, and nobody can answer it with a complaint. You can only answer it with something you control, which means every answer is by construction actionable.

The peer consult round is what stops it from being a private to-do list. Fifteen percent of one person's discretion is a small lever. Nine people's, cross-connected — with each person hearing where their small lever meets someone else's — is a different quantity entirely. And there's a quieter effect worth naming: after eight months of learned helplessness, a team producing eleven things it could just *do* changes what people believe about their own scope, which outlasts the specific fixes.

## Where it fails

It's the wrong tool when the constraint is genuinely structural. If the mailbox connection had required a vendor contract or a security review nobody in the room could authorise, 15% Solutions would produce a list of things that don't touch the real blocker, and running it would read as management asking people to work around a problem it won't fund. Check honestly first that there's real discretion in the room.

It also punishes vagueness. "Improve my documentation" isn't a 15% Solution; "rewrite the Google Workspace section of the mailbox article by Thursday" is. If the lists come back abstract, the consult rounds have nothing to grip, and you'll get a warm meeting that produces nothing by the following week.
