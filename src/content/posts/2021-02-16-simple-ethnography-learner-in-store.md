---
title: "Simple Ethnography: Watching a Learner Take a Course Inside Someone Else's Store"
date: "2021-02-16T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Our usability tests happened on our own staging environment, in isolation from the store the course actually lived in. Watching one real learner enroll inside a real merchant's storefront showed a context mismatch no isolated test ever would."
tags: [liberating-structures, course-guru]
series: ls-discovery
seriesOrder: 12
use_featured_image: false
---

Every usability session we'd run on the learner experience happened the same way: a test account, a demo course, our own staging environment, a learner recruited through a panel, task list in hand. It's a reasonable setup for catching UI bugs, and it had caught plenty. What it structurally couldn't catch was anything about the *actual context* a real learner experiences a course in — embedded inside someone else's branded storefront, reached by clicking a random product link, surrounded by that merchant's other products, promotions, and design choices, none of which our staging environment reproduced. **Simple Ethnography** is the Liberating Structure built for exactly that gap: instead of bringing the user to a test environment, you go watch them in the real one, doing what they'd do anyway.

## What it is and how it runs

Simple Ethnography, in the Liberating Structures formulation, strips ethnographic fieldwork down to a lightweight, repeatable practice any team can run without formal training: pick a real setting where the behavior you care about actually happens, go there, watch quietly, and record what you observe using a simple structure — separating **what you see and hear** (objective observation) from **what you interpret it to mean** (your inference), and explicitly noting what surprises you. The discipline of keeping observation and interpretation in separate columns is the whole method; conflating them is the single most common way informal "let's go watch some users" sessions produce weak, over-confident conclusions instead of real findings.

A session is typically short — twenty to sixty minutes of quiet observation, in the actual environment, followed immediately by a structured debrief where the observer(s) compare what they wrote in each column and specifically discuss the surprises, because a surprise is a strong signal that the team's existing mental model of the user is wrong somewhere.

## What we watched

We arranged, with a willing merchant's permission, to sit in on one real learner enrolling in and starting a beginner cooking course embedded in that merchant's storefront — a real customer, doing this because she'd actually decided to buy the course, not because we'd recruited her for a test.

**Observed:** She found the course through a "you might also like" carousel while browsing the merchant's cookware pages, not through any course-specific navigation. She clicked in, read the course description, then — before enrolling — scrolled back out to look at the merchant's product reviews page, cross-referencing whether the course creator's cookware reviews looked legitimate. She enrolled, and the confirmation screen took her to a lesson player that used our platform's default neutral styling — visually distinct enough from the merchant's storefront branding that she paused for three or four seconds, said "oh," and re-checked the browser tab to confirm she was still on the same site.

**Interpreted:** The "oh" pause and the tab-check were, in our read, a small but real trust hiccup — a jarring shift from a fully-branded storefront experience to a generic, platform-branded course player, at exactly the moment (immediately post-purchase) where reassurance matters most. Her earlier detour to the merchant's product reviews, before enrolling, suggested that for a course embedded in a storefront she wasn't already loyal to, she was evaluating the *merchant's* general credibility, not just the course description — a form of trust transfer our course-discovery flow had never been designed around, because it assumed a learner arriving at a course page already trusted the source.

**Surprise:** The single biggest surprise was how little the "course" framing mattered to her navigation at all. She never used a course category page or search; she found it exactly the way she'd find any other product, through a recommendation carousel, and evaluated it the way she'd evaluate any other product — via the merchant's own reputation signals, not course-specific ones like instructor bio or curriculum preview, both of which existed on the page but which she scrolled past without pausing.

## What changed because we watched instead of tested

None of this would have surfaced in a staging-environment usability test, because a staging test can't reproduce "a learner deciding whether to trust an unfamiliar merchant" or "a learner discovering a course via a product recommendation carousel embedded in that merchant's actual catalog" — both depend on the real storefront context existing around the course, which by definition a demo environment strips away.

Two concrete changes came out of the debrief. First, the lesson player got a lightweight theming hook — inheriting the merchant's primary brand color and logo in the header, rather than defaulting to fully neutral platform styling — specifically to close the "oh, wait, am I still on the same site" gap at the exact moment we'd watched it happen. Second, we deprioritized a planned instructor-bio redesign (more prominent credentials, more detailed curriculum preview) in favor of investigating whether merchant-level trust signals — store reviews, "verified merchant" badges — could be surfaced directly on the course card itself, since that's the trust signal we'd actually watched a real learner go looking for.

## Why watching beats testing here

A usability test answers "can a user complete this task in this interface." Simple Ethnography answers a different, often more important question: "what does the real surrounding context do to how a user approaches this at all" — and that second question is invisible in an isolated test by construction, because isolating the test *is* removing the surrounding context. For an embedded product like a Shopify course app, where the course is never encountered in isolation from a specific merchant's storefront and reputation, that context is not a minor variable — it may be the dominant one, and it took one real observation, not a battery of staging tests, to see it.

## Failure modes and when to skip it

The most common failure is letting observation and interpretation blur together in the moment — writing "she was confused" instead of "she paused, said 'oh,' and checked the browser tab" throws away the raw material a debrief needs and quietly substitutes the observer's assumption for what actually happened. Keep the columns separate, especially in the room, not just when writing up.

It also requires genuine, low-intrusiveness access to a real setting, which isn't always available — a merchant has to be comfortable with an observer present (even remotely, watching a session recording with consent), and a single observed learner is one data point, not a validated pattern; treat what you see as a strong hypothesis to test further, not a conclusion to build a roadmap on unchecked. And it's the wrong tool when you need to compare a specific interface change against an alternative under controlled conditions — that's what a usability test or an A/B test is for; Simple Ethnography tells you what's actually happening in context, not which of two options performs better.
