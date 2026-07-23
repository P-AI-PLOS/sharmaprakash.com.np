---
title: "TRIZ: Designing the Perfect Way to Make Merchants Abandon Setup"
date: "2021-03-26T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Asking a team to improve onboarding gets you polite, incremental ideas. Asking them to deliberately guarantee merchants quit during setup gets you an unflinching list of every real anti-pattern already in the product — and a reverse of that list is your actual roadmap."
tags: [liberating-structures, polo-themes]
series: ls-ideation
seriesOrder: 4
use_featured_image: false
---

The workshop question that produced the most useful list I've ever gotten out of a product team was not "how do we improve merchant onboarding." It was: "if our explicit goal were to make every merchant abandon setup before finishing, what would we do?" Nobody in the room hesitated. Within four minutes there were nineteen items on the board, half of which described things the product was already doing.

That inversion is **TRIZ**, and it's the sharpest tool in the Liberating Structures set for a team that already knows, somewhere below the surface, exactly what's wrong with their product but has never been asked the question in a way that gives them permission to say it.

## What it is

TRIZ takes its name from a Russian systematic-inventiveness method (Genrich Altshuller's *Teoriya Resheniya Izobretatelskikh Zadatch*), and the Liberating Structures adaptation strips it down to a three-step inversion exercise built on one psychological insight: people are far more fluent, specific, and honest when asked to design a *disaster* than when asked to design a *solution*. Praising your own product's future is performance. Describing how to sabotage it is diagnosis, and diagnosis doesn't require you to have the answer — just the willingness to name the failure.

## How it runs

1. **Name the unwanted result explicitly.** In this case: "merchants abandon theme setup before going live." Write it on the board, stated as a goal, not a fear — that framing matters, because a goal invites confident, specific proposals in a way a vague worry doesn't.
2. **Brainstorm, individually then in small groups, every way to guarantee that result.** "What would we have to do to make absolutely certain of this outcome?" Silence first — a minute or two of individual writing, same discipline as [1-2-4-All](/product-management/1-2-4-all-recap-crm-pipeline-feature/) — then small groups of three or four compiling the fullest possible list. No idea is too extreme; the more absurd and specific, the better, because absurd-and-specific surfaces real anti-patterns faster than earnest-and-vague.
3. **Sort the list: which of these are we already doing?** This is the step that turns a comedy exercise into a working session. Every item gets an honest yes or no. The yeses become the priority list — not because the team invented new problems, but because stating them as a deliberate goal made them nameable in a way "let's improve onboarding" never had.
4. **For each confirmed yes, ask what it would take to stop.** The reversal step — not a full redesign, just "what's the smallest change that removes this specific sabotage."

The whole exercise runs thirty to forty-five minutes for a team of eight to twelve, and it's one of the few structures where the energy in the room visibly rises the darker the list gets — people enjoy being asked to be creatively destructive in a way they never enjoy being asked to critique diplomatically.

## Applying it: killing the theme-setup abandonment anti-patterns

The team here builds a Shopify theme product, and the workshop's context was blunt: setup-completion analytics showed a meaningful share of merchants who installed a theme never finished configuring it well enough to go live, and three prior retros on "improve onboarding" had produced only cosmetic copy changes to the setup wizard.

The TRIZ list, once the room got moving, was uncomfortable in the way only true things are. Among the nineteen "ways to guarantee abandonment": require the merchant to configure every section of the theme before previewing any of it, so they can't see progress or payoff until the very end. Use generic, unstyled placeholder text in every preview so nothing looks finished enough to feel worth continuing. Bury the "publish" action three menus deep behind settings most merchants don't need to touch. Silently fail to save a section's configuration if the merchant navigates away before an explicit save click, so returning users find their prior work gone. Show a wall of eleven configuration options on a single screen with no indication of which three actually matter for a basic launch.

The sort-into-yeses step was where the exercise stopped being funny. Four of those five were, verifiably, exactly how the current setup flow worked. The team had built, unintentionally and one incremental decision at a time, a genuinely well-optimized abandonment machine — full configuration required before preview, generic placeholders in every preview pane, publish buried under "advanced settings," and a save behavior that had shipped as an edge-case bug fix eighteen months earlier and never been revisited because nobody had framed "does this cause abandonment" as the test to run it against.

The reversal for each was individually modest: let merchants preview with realistic sample content from the first screen instead of gating preview behind full completion; move publish to a persistent, always-visible action rather than a buried menu item; auto-save every section change immediately rather than only on explicit save; and — the one that took actual design work — identify the three or four settings that constitute a "good enough to launch" configuration and default everything else, surfacing the rest as optional refinement *after* the merchant has gone live once. None of these four fixes had come up in three previous "improve onboarding" retros, because none of those retros had asked anyone to admit, even hypothetically, that the product was working as a sabotage machine — they'd asked people to suggest improvements to a thing nobody had been willing to first describe honestly as broken.

## Why the inversion works when direct critique doesn't

Ask a team "what's wrong with our onboarding" and you get hedged, diplomatic answers, because naming a flaw directly implicates whoever built it, and most rooms have at least one person who built the thing being discussed. Ask the same room "how would you sabotage it" and the same observation comes out freely, because the frame isn't "you did this wrong," it's "here's a clever way one could do this wrong" — even when everyone in the room knows it's the same fact. TRIZ isn't a trick for extracting information people were hiding maliciously; it's a permission structure for saying true, unflattering things about a product without anyone having to personally own the unflattering part first. The sort-into-yeses step is where ownership re-enters, but by then the list already exists and the room has already agreed the anti-pattern is real — arguing about whose fault it was becomes much less interesting than fixing it.

## Failure modes and when to skip it

TRIZ can curdle into a genuine blame session if the team is small enough, or new enough, that everyone in the room knows exactly who built each anti-pattern and the "we're just brainstorming sabotage" frame doesn't actually diffuse the tension — in a tense or recently-reorganized team, run this only with a facilitator experienced enough to redirect toward the pattern rather than the person the moment it turns personal.

It's also poorly suited to genuinely novel problem spaces where the team has no existing product to reverse-engineer anti-patterns from — TRIZ works because it's diagnosing *what already exists*, badly; on a blank page, "how would we guarantee failure" just produces generic startup-failure tropes with nothing concrete to sort into yeses. And skip it if leadership isn't actually prepared to hear the yeses — a team that names four true anti-patterns and then watches none of them get prioritized learns, correctly, that the exercise was theater, and won't be honest in the room a second time.
