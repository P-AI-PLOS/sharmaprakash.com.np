---
title: "TRIZ: Engineering a Course No One Would Ever Finish"
date: "2021-03-30T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The instructional designers already knew what made learners quit — they just weren't allowed to say it as long as the question was framed as 'how do we improve the course experience.' Flipping the question to 'how do we guarantee nobody finishes' let them stop being polite about their own curriculum."
tags: [liberating-structures, course-guru]
series: ls-ideation
seriesOrder: 5
use_featured_image: false
---

I'd already run [TRIZ once, with a theme-customization team](/product-management/triz-designing-the-perfect-way-to-make-merchants-abandon-setup/) diagnosing why merchants abandoned setup, and the pattern held again here almost exactly, in a completely different domain: a Shopify-embedded course app where completion rates hadn't moved despite real investment, and this time the anti-patterns weren't hiding in the product's interaction design — they were baked into the *curriculum itself*, authored by well-meaning instructional designers who had never been asked to admit their own courses might be the problem.

## The structure, briefly

TRIZ inverts the usual improvement question. Instead of "how do we make this better," you ask "how do we guarantee the worst possible outcome" — here, "how do we guarantee learners never finish a course." The room brainstorms, individually then in small groups, every method that would reliably produce that failure, with no idea too extreme to write down. Then, crucially, the list gets sorted: which of these are we *already doing*. The confirmed yeses become the priority list, and each gets a reversal — the smallest concrete change that removes it. The [earlier post in this series](/product-management/triz-designing-the-perfect-way-to-make-merchants-abandon-setup/) covers the full four-step mechanics and why the inversion frame gets honesty that direct critique doesn't; here I want to focus on what changed when the anti-patterns being surfaced were about *content*, not interface.

## Why this room needed the inversion more than most

Course app teams have a structural bias problem that theme-customization teams and CRM teams don't share to the same degree: the people who build the product's core value — the courses — are often the same people, or close collaborators of the same people, who authored the specific curriculum being discussed. Ask "what's wrong with this course's structure" directly, and you're asking an instructional designer to critique their own syllabus in front of the room. That's a much higher-stakes ask than asking an engineer to critique a UI flow someone else coded, and the diplomatic hedging that results is correspondingly stronger.

TRIZ's inversion sidesteps this precisely because "how would you guarantee a learner quits" isn't experienced as "criticize your syllabus" — it's experienced as a game, even when the honest answers that come out of it map exactly onto real curriculum decisions the same person made six months earlier.

## The list

Working in small groups after a silent brainstorming minute, the room generated its sabotage list fast, and it read like an accidental confession: front-load the driest, most foundational material in modules one and two and save anything genuinely interesting or applicable for module seven, so learners quit before reaching the part that would have hooked them. Give every module roughly the same length regardless of actual content density, so some modules feel like padding and others feel rushed, and neither signal to the learner how much effort remains. Never show a learner how far through the *whole course* they are, only how far through the *current module* — so a learner who's 80% done overall but 10% into a new module experiences the discouraging feeling of having barely started. Make the certificate, if there is one, generic and un-shareable, so there's no social reward waiting at the finish line worth actually finishing for. Write assessment questions that test memorization of exact terminology from the video rather than whether the learner understood the underlying concept, so learners who genuinely grasped the material still fail quizzes and lose confidence.

The sort-into-yeses was quiet in a different way than the polo-themes session had been loud — instructional designers recognized their own decisions in at least three of these five, and the room's energy shifted from gleeful invention to a more sober "oh." The front-loaded-dry-material pattern was confirmed as true of several of the platform's most-abandoned courses. The no-overall-progress-indicator pattern was confirmed as a platform-wide gap, not a per-course choice — a genuine product feature missing, not just an authoring habit. And the memorization-not-comprehension assessment pattern was confirmed as the default template every instructor used, because it was the easiest quiz format the authoring tool offered, not because anyone had decided it was pedagogically right.

## The reversals

Each confirmed anti-pattern got a specific, scoped fix rather than a redesign mandate. For front-loaded dry material: a lightweight curriculum-review guideline recommending at least one genuinely applicable, learner-motivating segment within the first two modules, not saved for the end — a content change, not a product change, and cheap to apply retroactively to the highest-abandonment courses first. For module-length padding: no product change at all, just a shared rule of thumb for instructors — module length should track content density, and a short module is fine. For missing overall progress: a real product feature — a persistent whole-course progress indicator, distinct from the per-module one already shown, which the platform genuinely lacked and which several instructors had been asking for under a completely different framing ("can we show total progress") that had never been prioritized until it appeared on this list as a confirmed sabotage mechanism. For generic certificates: a small design update making the certificate personalized and easily shareable to a professional network, giving the finish line a reason to be worth reaching. For memorization-based assessment: a change to the authoring tool's default quiz template, nudging instructors toward application-based questions rather than making the harder pedagogical case in the abstract.

Two of these five fixes were product features that had genuinely never been prioritized under any prior framing; the other three were content and authoring conventions that cost nothing to implement and had simply never been named as load-bearing until the sabotage exercise made naming them safe.

## The lesson particular to content-driven products

The theme-customization team's TRIZ list surfaced interaction-design anti-patterns; this team's surfaced authoring anti-patterns, and the difference matters for anyone running this exercise on a content or curriculum product: the reversals aren't all engineering tickets. Several of them are editorial guidelines — norms for how instructors write, not features engineers ship — and those are just as legitimate an outcome as a product roadmap item. Don't force every TRIZ reversal into a backlog ticket if the honest fix is "here's a one-page guideline for course authors"; that's often the faster, cheaper, and more durable version of the fix.

## Failure modes and when to skip it

This exercise is genuinely harder to run well when the anti-patterns implicate individual authorship rather than a shared product decision — an instructional designer recognizing their own course in the sabotage list needs a facilitator who keeps the tone collaborative-diagnostic rather than let the room's energy tip into pointed jokes at a specific person's syllabus. Consider anonymizing which course inspired which sabotage item during the sort step, so the confirmed-yes discussion stays about the pattern, not the author.

Skip it if the completion problem is already well-understood and externally caused — a course with a genuinely broken video player has a bug, not an anti-pattern, and TRIZ will waste a room's time generating curriculum theories for what analytics or a support ticket already explained in one line.
