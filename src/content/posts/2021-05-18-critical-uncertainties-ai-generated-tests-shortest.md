---
title: "Critical Uncertainties: How Far Into AI-Generated Tests Should shortest Go?"
date: "2021-05-18T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "shortest could let a plain-English prompt author the whole test, not just the steps. Whether that's the right bet depends on two things nobody in the room actually knows yet — which is exactly the shape Critical Uncertainties was built to handle."
tags: [liberating-structures, shortest]
series: ls-decide
seriesOrder: 8
use_featured_image: false
---

The roadmap argument at shortest wasn't "should we use AI in the testing tool" — that was already decided, it was in the product name's implied promise. The argument was how much AI: keep the model as a co-pilot that drafts steps a human edits and approves, or go all the way to fully AI-generated test authoring, where a one-line English description produces a runnable, maintained E2E test with no human in the assertion-writing loop. Nobody could answer that with data, because the two facts that would settle it — will developers actually trust an assertion they didn't write, and how fast does the underlying model get cheap and reliable enough to regenerate tests on every UI change — were both still open. That's a Critical Uncertainties problem, not a roadmap-prioritization problem, and treating it like the latter is how teams end up debating conviction instead of scenarios.

## What Critical Uncertainties is

Critical Uncertainties is a scenario-planning Liberating Structure, adapted from classic strategic-foresight practice, for making a bet under conditions where you genuinely don't know which future you're building for. It doesn't produce a forecast. It produces a set of scenarios deliberately far enough apart that no single roadmap survives all of them unchanged — and then it asks what you'd do in each one, so you can find the moves that hold up regardless of which future shows up.

The structure earns its keep specifically when a team's uncertainty is being smuggled into the discussion disguised as confidence — when someone says "AI-generated tests are obviously where this is headed" and someone else says "no one will ever trust an AI to write their assertions," and both are stating opinions as facts because nobody's built the scaffolding to say what would have to be true for each to be right.

## How it runs

**Step 1 (5–7 min).** In small groups of four to five, brainstorm a long list of trends and uncertainties that could bear on the decision — model cost curves, developer culture, compliance pressure, competitor moves. No filtering yet; the point is volume.

**Step 2 (5 min).** The group narrows that list to the two uncertainties that are simultaneously highest-impact on the decision *and* genuinely uncertain — not things you're fairly sure about, and not things that wouldn't change your strategy either way. Most groups want to cheat here by picking one uncertain axis and one thing they already believe; a facilitator's job is to keep pushing "how sure are we, really?"

**Step 3.** Cross the two chosen uncertainties as the axes of a 2x2. The four resulting quadrants are scenarios — plausible futures, not predictions — and the group gives each a short, memorable name. A scenario called "quadrant three" gets forgotten in a week; a scenario with a name gets referenced in meetings for a year.

**Step 4 (15–20 min).** For each quadrant in turn, the group asks: if this future actually happened, what would we wish we'd already done? This is the generative part — it forces concrete action thinking inside each hypothetical, rather than abstract hedging across all of them at once.

**Step 5.** Harvest. Lay the four action lists side by side and look for moves that show up in three or four quadrants — those are robust strategies, worth committing to now regardless of which future arrives. Moves that appear in only one quadrant are bets: worth naming, maybe worth a small option, not worth full investment until that scenario looks more likely. Groups of 4–5, roughly 45–75 minutes total — a natural follow-on to a session like the one I ran on [course guru's tutoring-quality bet](/product-management/critical-uncertainties-ai-tutoring-course-guru/), same structure, a different flavor of AI trust question.

## Running it on shortest's fully-AI-generated-tests bet

The room settled on two axes fast, which is itself a sign the topic was ripe for this structure — everyone already sensed these were the two variables driving the whole disagreement.

**Axis one: developer trust in AI-authored assertions**, low to high. Low trust means engineers treat AI-written tests as a draft to be rewritten before merge — useful for scaffolding, not for shipping. High trust means engineers merge AI-authored assertions with a skim, the way most of us already treat AI-suggested code completions.

**Axis two: underlying model reliability and cost**, slow-improving to fast-improving. Slow means the cost and hallucination rate of regenerating a test on every UI change stays roughly where it is today — expensive enough that AI-authoring only pays off for the highest-value flows. Fast means both drop enough that regenerating the entire suite on every merge becomes cheap and accurate enough to be routine.

Four quadrants came out of the cross:

- **High trust, fast-improving models** — "Autopilot." Developers stop hand-writing E2E tests almost entirely; shortest becomes the system that watches the app, regenerates coverage continuously, and only surfaces the tests a human needs to review because they touch something ambiguous.
- **High trust, slow-improving models** — "Trusted but Manual." Developers are willing to accept AI-authored tests, but the model isn't yet reliable enough to regenerate cheaply at scale, so AI authoring stays targeted at high-value, high-change surfaces rather than the whole suite.
- **Low trust, fast-improving models** — "Capable but Ignored." The technology gets good fast, but a trust gap — maybe from one bad incident, maybe from a cultural resistance to unreviewed test logic — keeps adoption stuck at the co-pilot level regardless of how good the underlying generation gets.
- **Low trust, slow-improving models** — "Co-pilot Forever." Neither variable moves much. AI stays a drafting aid: it proposes steps and locators, a human writes and owns the assertions, and that division of labor is durable rather than transitional.

Running Step 4 against "Capable but Ignored" was the most useful twenty minutes of the session, because it's the quadrant a team optimizing purely for model capability would never plan for. What would we wish we'd already done if the tech got great but nobody trusted it? The answer that came out of that group: we'd wish we'd built visible, auditable reasoning into every AI-authored test from day one — not just the assertion, but a plain-English trace of why the model wrote it that way — because trust in "Capable but Ignored" isn't a capability problem, it's a legibility problem, and you can't retrofit legibility onto a black box after the fact.

The harvest step is where the actual decision got made, and it wasn't "go all-in" or "stay co-pilot" — it was a short list of moves that showed up in three of the four quadrants. **Flaky-test triage tooling** was the clearest one: every quadrant except "Co-pilot Forever" assumes a much larger volume of AI-generated or AI-touched tests flowing through CI, and every one of those futures needs a fast, trustworthy way to tell "this failed because the app broke" from "this failed because the test is flaky" — that's true whether trust is high or low, whether models are fast-improving or not. **An auditable-reasoning layer** on every generated assertion was the second robust move, because it's the thing that both builds trust in the low-trust quadrants and stays cheap to maintain in the high-trust ones. What *didn't* survive the harvest was a full-send investment in fully autonomous test regeneration — that only pays off in one quadrant out of four, which reframed it from "the roadmap" to "an option we keep cheap to exercise if Autopilot starts looking likely," which is a very different sizing conversation than the one the team walked in with.

## When to skip it

Critical Uncertainties is expensive relative to what it returns if the team is actually just avoiding a decision it already has the data to make. If you have real telemetry on developer edit-rates for AI-suggested test steps, or real cost curves from your own model usage, use that — scenario planning is for genuine unknowns, not a way to dress up analysis-avoidance as a workshop. It also fails if the group can't resist collapsing the two axes into one — "AI gets better" and "developers trust AI" tracking as the same variable in people's heads, flattening the 2x2 into a line and throwing away the point of the exercise; a facilitator has to keep asking for a scenario where the axes diverge to prove they're actually independent. And it's the wrong tool once you've already picked a direction and just want buy-in — running it on a decision that's already closed reads as theater, and rooms notice.

For a fuller map of which structure fits which decision, see [the field guide](/product-management/liberating-structures-for-product-teams-the-33-structure-field-guide/).
