---
title: "Panarchy: Roadmap Resilience for course guru"
date: "2021-05-11T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "course guru doesn't have two cycles to worry about, it has three — and the slowest one belongs to Shopify, not to us. Here's how Panarchy surfaced that third scale, and what it changed about how we plan."
tags: [liberating-structures, course-guru]
series: ls-decide
seriesOrder: 6
use_featured_image: false
---

Halfway through the workshop, someone on the course guru team drew a third loop above the two we'd asked for, labeled it "Shopify," and said "this one isn't ours and it eats the other two whenever it wants." That sentence is the entire reason to run Panarchy on a platform-embedded product. Standalone tools get to pretend they control their own fate. Apps that live inside someone else's platform don't get that luxury, and most roadmap exercises never make the difference visible. Panarchy does.

## What Panarchy is

Panarchy comes out of C.S. Holling's ecological theory and extends [Ecocycle Planning](/product-management/ecocycle-planning-course-lifecycle-course-guru/) — the Liberating Structure that maps a single loop of birth, maturity, creative destruction, and renewal. Ecocycle asks "where is this one thing in its life cycle." Panarchy asks the harder question: what happens when several of those loops are running at different speeds, nested inside each other, and one of them starts leaking into the others.

The exercise names two specific cross-scale dynamics, and they're worth learning by name because they show up constantly once you're looking for them. **Revolt** is when a crisis in a fast, small cycle cascades upward and destabilizes the slower cycle above it — a small fire that jumps to the canopy. **Remember** is the opposite direction: the slower cycle's accumulated structure and memory shape how the fast cycle is allowed to renew after a collapse — the old root system determining what can regrow. Every system with nested cycles lives inside this pair of forces, whether anyone's named them or not. Panarchy just makes the naming deliberate.

This is [the same structure I ran a few days earlier for recap_crm](/product-management/panarchy-roadmap-resilience-recap-crm/) — same two dynamics, completely different nested-scale problem. That one was about a standalone product's internal cycles. This one has an extra layer, because course guru doesn't own the platform it lives on.

## How it runs

Split into groups of four to six. Each group draws two or three ecocycle loops, stacked, at genuinely different speeds and scales — not three versions of the same thing, but scales that actually nest into each other (a feature, a team, a company; a sprint, a quarter, a market). Label what's actually happening right now at each loop: which phase of birth/maturity/creative-destruction/renewal is each one in.

Then the group stops drawing and starts talking, guided by two explicit questions: where is a revolt from the fast cycle threatening to destabilize the slow one above it, and where is the slow cycle's remember function — rightly or wrongly — constraining what the fast cycle is allowed to renew into. Groups report back the single cross-scale risk they found most convincing, not an exhaustive list. Sixty to ninety minutes total, and the report-out is deliberately narrow — one risk per group keeps the plenary from turning into a catalog nobody retains.

## Running it on course guru

We set up three loops instead of the usual two, because that third loop is the whole point of doing this for an embedded app.

**Fast cycle: this sprint's authoring and delivery work.** Course builders adding lesson types, tweaking the certificate template, adjusting how progress gets tracked for a learner mid-course. Weeks-scale, high churn, mostly within the team's own control.

**Middle cycle: course guru's own annual roadmap.** Pricing tiers, the instructor-vs-student experience split, which access models we support, what "creative destruction" looks like when we retire an old enrollment flow. Months-to-a-year scale, planned deliberately, the layer most roadmap exercises stop at — which is exactly what [the Ecocycle Planning post already mapped](/product-management/ecocycle-planning-course-lifecycle-course-guru/) for this product.

**Slow cycle: Shopify's own platform roadmap.** API surface changes, App Store review policy, checkout and theme architecture shifts, deprecation timelines for whatever integration points we depend on. This loop moves on a schedule we don't set and mostly don't see coming, and it's slower than ours by design — platforms move deliberately because they're carrying every app built on top of them, not just us.

The revolt conversation is where the room got quiet. A policy change at the Shopify layer — say, a tightening of what apps are allowed to do at checkout, or a deprecation of an API our enrollment flow depends on — isn't a feature request we get to schedule. It's an involuntary revolt event that lands in our fast cycle immediately: authoring and delivery work gets shelved, and the sprint becomes a forced-renewal sprint whether we planned one or not. The team's instinct going in was to treat platform changes as "external noise" that occasionally interrupts the real roadmap. Panarchy reframed that: the interruption *is* the real roadmap, on a cycle we don't control the timing of but can absolutely control our readiness for.

The remember conversation cut the other way, and it's the part standalone-product teams don't get to have at all. Shopify's slow cycle constrains what course guru is allowed to renew into — we can't just redesign the merchant embedding experience however we like, because the platform's own conventions and review requirements are the "remembered" structure the fast cycle has to renew inside of. Some of the team read that as pure constraint. But the more useful framing that came out of the report-out was that the same slow cycle also protects us: merchants trust course guru partly *because* it behaves like a well-behaved Shopify app, and that trust is inherited from the platform's slow, conservative cycle, not earned fresh by us every sprint. The remember function was simultaneously the thing limiting our fast-cycle freedom and the thing lending our fast-cycle work its credibility. Naming both halves in the same conversation is what the two-question structure is for — a team that only asks "how is the platform constraining us" walks out resentful; a team that also asks "how is the platform protecting us" walks out with a roadmap that budgets for both.

What changed afterward was concrete: we started keeping a standing slot in planning for "platform revolt absorption" instead of treating every Shopify change as an ad hoc emergency, and we stopped scheduling deep authoring-experience redesigns without first checking whether they'd survive the platform's remembered constraints.

## When to skip it

Don't run this if the team only has one real cycle to reason about — a genuinely standalone tool with no meaningful external platform dependency gets nothing from a third loop that doesn't exist; use plain Ecocycle Planning instead. Don't run it with a group that can't yet name what phase their own fast cycle is in, because Panarchy assumes Ecocycle fluency and collapses into an abstract systems-theory lecture without it. And don't run it as a one-off: the value is in re-running it as the platform layer actually shifts, because a Panarchy map from a year ago tells you nothing about a revolt that hasn't happened yet. If the room can't point to a specific, plausible platform-level change to discuss, you're mapping hypotheticals, and the discussion turns speculative and forgettable — better to wait until there's a real signal from the platform to react to.
