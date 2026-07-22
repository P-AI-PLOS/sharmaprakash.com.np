---
title: "Wicked Questions: Naming the Tension Between Automation and Personalization"
date: "2021-01-22T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Every outreach feature debate at a CRM eventually turns into the same fight dressed in different clothes: scale versus feeling human. Wicked Questions gives that fight a name, which turns out to be most of the battle."
tags: [liberating-structures, recap-crm]
series: ls-discovery
seriesOrder: 5
use_featured_image: false
---

Every roadmap debate about sequences and outreach automation at our CRM eventually became the same argument wearing a different costume. Should the AI draft the follow-up email, or just remind the rep to write one? Should a sequence auto-advance a contact who hasn't replied, or wait for a human to look at the thread first? Each individual ticket got resolved on its own merits, and each resolution quietly re-fought the same underlying war, because nobody had ever named the war itself. We finally did, using **Wicked Questions**, and naming it turned out to change how fast everything downstream got decided.

## What it is

Wicked Questions, from Liberating Structures, is built for exactly this situation: a real, persistent tension between two things a team values that are *both true and in conflict* — not a problem with a right answer, but a polarity to be managed rather than solved. The technique borrows from Barry Johnson's polarity-mapping work: instead of arguing over which side is correct, the group names both poles honestly, in the form of a single sentence that holds the contradiction — "How do we do X while also doing Y, even though X and Y are, in some tension, at odds?"

The process: individuals first draft their own wicked question silently, on paper, aiming for a sentence that's genuinely double-edged (not a soft, easy-to-agree-with version where one side is obviously right). Then pairs share and refine into one combined sentence. Pairs merge into fours, refine again. The room converges toward a small number of candidate wicked questions — often just one that clearly resonates — and that final sentence becomes something the team can return to explicitly, rather than re-litigating from scratch every time a related decision comes up.

The discipline that keeps it from becoming a bland mission statement: a wicked question has to make people a little uncomfortable when they read it, because it says the honest thing — that the team is committed to two things that pull against each other, and every decision is going to be a *trade*, not a solved problem.

## Getting to our sentence

Individually, the drafts were mostly one-sided in the first pass — "how do we automate outreach without annoying prospects" (automation dressed up as the answer, personalization as an afterthought) or "how do we personalize every message without burning out reps" (the opposite lean). Neither held real tension; each had already picked a side and was asking how to minimize the downside of its pick.

Merging to pairs forced the collision. The pair that had one automation-leaning draft and one personalization-leaning draft produced something sharper: "How do we let automation carry the volume of outreach a rep couldn't sustain by hand, while making sure every message still reads like it came from someone who actually knows this specific deal?" That's a real wicked question — it doesn't resolve to "automate more" or "personalize more," it names that both are true goals in the same product and that they cost each other.

The full-group merge sharpened it once more, landing on: **"How do we scale outreach through automation while keeping every message feeling like it came from a rep who actually knows this account?"** Simple, but it named something the roadmap debates had been dancing around for two quarters: every sequence feature request was really a request to move the needle on one side of that sentence, usually at some cost to the other, and nobody had been saying so explicitly.

## What changed once it had a name

The very next sequence feature debate — whether AI-drafted follow-ups should auto-send after 48 hours of no reply, or always require rep approval — got resolved in twenty minutes instead of the usual multi-meeting stall, because the team could talk about it as a trade against the named tension instead of as a binary yes/no. Auto-send maximizes the automation pole; rep-approval maximizes the personalization pole. The actual decision (approval required, but with a one-click send that pre-fills a genuinely deal-specific draft) was a compromise that had been available the whole time — it just hadn't been visible as a *position on a named spectrum* until there was a spectrum to be a position on.

The other effect was more subtle: the wicked question became a filter for scoping new features, not just resolving disputes about existing ones. A proposed "bulk sequence enrollment" feature — add 500 contacts to a sequence in one click — got quietly reframed after someone pointed out it was a pure, unhedged bet on the automation pole with nothing pulling back toward personalization, which was itself useful information: not a reason to kill the feature, but a flag that it needed a personalization-preserving safeguard (a per-contact custom-field merge check, a warning if the batch includes contacts a rep has meetings scheduled with) bundled in rather than shipped as automation alone.

## Why naming beats resolving

The instinct when a tension like this surfaces is to try to *resolve* it — pick a policy, write it in a doc, move on. That's the wrong shape for a genuine polarity. Automation-versus-personalization in outreach isn't a problem with a correct answer sitting somewhere the team hasn't found yet; it's two real goods that trade off against each other permanently, and any fixed policy ("always require approval," "always auto-send after X hours") will be wrong in some large fraction of real cases. What Wicked Questions produces instead is a shared *frame* for making that trade consciously and consistently, decision by decision, rather than re-fighting first principles every single time a sequence feature comes up.

## Failure modes and when to skip it

The most common failure is stopping at a one-sided draft and mistaking it for a wicked question — if your sentence resolves cleanly to "just do more of the good thing," it hasn't found the real tension yet, and the facilitator needs to push the room back to the drawing board rather than accept an easy consensus. Watch for applause or easy nodding on the first draft; a genuine wicked question tends to produce a slightly uneasy silence, because it names a cost the team usually prefers not to say out loud.

It's also the wrong tool for problems that actually do have a correct, discoverable answer — a specific bug, a factual disagreement about what users do, a question with a testable resolution. Wicked Questions is for standing tensions between two legitimate values, not for anything you could settle by looking at data. And once you've named the sentence, don't let it calcify into an unquestioned slogan either — revisit it if the product or market shifts enough that the poles themselves have changed, which for a CRM roughly tracks how much AI drafting capability has changed what "automation" even means.
