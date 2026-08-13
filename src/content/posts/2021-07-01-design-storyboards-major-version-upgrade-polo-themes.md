---
title: "Design Storyboards for a Migration: What a Merchant Does with a Major Version Nobody Wants"
date: "2021-07-01T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Polo Themes had a major version ready and merchants who had every reason to stay put. Storyboarding the upgrade — including the five weeks of not upgrading — turned a release plan into a migration the shop could actually survive."
tags: [liberating-structures, polo-themes]
series: ls-design
seriesOrder: 9
use_featured_image: false
---

Polo Themes' flagship theme had a 3.0 waiting: rebuilt section system, faster cart, a settings model that finally made sense. Better in every measurable way. It also required a merchant with a customised, live, revenue-generating storefront to press a button and hope, on a theme they were already happy with.

We had a release plan — announcement, changelog, migration guide, help for the top accounts. What we didn't have was any account of what a merchant *does* over the following weeks, given that the correct answer, for most of them, was nothing at all. **Design Storyboards** turned that release plan into a migration plan.

## How it runs

Big picture first: small groups draw four to eight panels covering the chapters end to end, with time markers, in fifteen minutes. Sketches only. Then the detailed pass — who does what, when, with what, and what the person knows — then a gallery walk where the facilitator harvests gaps.

For a migration, the framing instruction is the whole game: **the storyboard starts at the announcement and does not skip the waiting.** Teams draw an upgrade as click → migrate → done, which is a three-panel story about a decision the merchant hasn't made yet. Most of the elapsed time is a merchant not upgrading, and if you don't draw that, you'll design nothing for it.

## Running it on 3.0

Four groups — two engineers, a designer, two support agents, and the person who writes our theme documentation. Brief: *Ana runs a homeware store on 2.6 with about forty hours of customisation in it. 3.0 is announced on a Tuesday. Draw the next eight weeks.*

**Panel 1, the announcement.** Every group drew Ana reading an email; two drew her closing it. Nobody drew her upgrading, which is a useful thing to notice about your release plan in the first ten minutes.

**Panel 2, weeks 1 to 5, nothing.** Three groups drew an empty panel and were slightly embarrassed until the support agents pointed out it was the most accurate panel on the wall. What does Ana know during those five weeks? That a new version exists. Not whether her customisations survive it, how long it takes, or what happens to her live store meanwhile — and she has no way to find out that doesn't involve risking the store. So the rational choice is to defer indefinitely.

**Panel 3, the trigger.** Every group drew a different one, and the differences were the finding. A support answer — "that's fixed in 3.0." A competitor's storefront. Black Friday approaching and Ana wanting the faster cart. Her theme breaking and 3.0 being the fix, which is what happened to seven merchants in [the update incident we'd worked through a fortnight earlier](/product-management/improv-prototyping-broken-theme-update-escalation-polo-themes/). Four plausible triggers, and our release plan spoke to none of them, because it was written for a merchant who upgrades because a new version exists.

**Panel 4, the attempt.** The groups agreed here and it was ugly. Duplicate the theme, migrate the copy, then compare two storefronts by eye — every product template, every section, desktop and mobile — with no list of what to check and no record of what she'd customised. The documentation writer said, quietly, that the migration guide she'd written assumed the merchant remembered their own customisations, and that no merchant does.

**Panel 5, the fork.** Publish, or abandon the duplicate and stay on 2.6 with a worse feeling about us.

The gaps became the actual work, none of it in the release plan. A **migration preview** that runs against a duplicate and reports back — these twenty-two settings mapped automatically, these four custom sections need a look, this snippet has no equivalent — giving Ana in ten minutes what panel 2 said she couldn't learn in five weeks. A **checklist generated from her own theme**, so panel 4's comparison has a scope. And trigger-shaped comms instead of one announcement: a line in the support macro, a note on the performance page, a pre-Black-Friday nudge.

The storyboard also talked us into another year of security and compatibility fixes for 2.6. That branch was going to be the majority outcome for a while whatever we shipped, and the wall made it impossible to keep pretending otherwise.

## Why drawing the waiting matters

An upgrade path is usually designed as a mechanism — importer, mapper, guide — and the mechanism is fine. The failure is upstream, in the weeks where the merchant lacks the information to justify the risk, and that period is invisible in every artifact a team normally produces: no screens, no events. On a storyboard it's an empty panel somebody has to draw and label, and once it's on the wall the question "what could she learn during this?" asks itself.

The trigger panel earns its keep too: watching four groups draw four different triggers is a cheap way to learn that your single announcement is aimed at an imaginary merchant.

## When to skip it

If the migration is invisible — a server-side change with no merchant decision — there's no protagonist and nothing to draw. Storyboards need somebody choosing.

If nobody has heard a real merchant's reason for staying put, you'll draw eight weeks of fiction. Ours was honest because two support agents were in the room, one of whom had spent a month answering "is it safe."

And the wall doesn't sequence the work. Four interventions and a support commitment came out of it; the argument about what to build before the release took another session. Storyboards find what you've failed to design for — deciding what to do about it is a different afternoon.
