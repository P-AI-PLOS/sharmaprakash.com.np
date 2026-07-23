---
title: "Simple Ethnography: What We Saw Watching One Merchant's First Theme Setup"
date: "2021-02-19T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Onboarding analytics told us where merchants dropped off. Sitting quietly and watching one new merchant set up a theme, without steering her at all, told us why — and it wasn't where the funnel chart said to look."
tags: [liberating-structures, polo-themes]
series: ls-discovery
seriesOrder: 13
use_featured_image: false
---

We had onboarding funnel data telling us, with reasonable precision, *where* new merchants dropped off during first-time theme setup — a clear cliff at the step right after choosing a color palette. What the funnel couldn't tell us was *why*, and every internal theory (too many color options, the palette picker is visually cluttered, merchants get distracted and don't come back) was a guess dressed up as an explanation. So instead of guessing further, we ran **Simple Ethnography**: sit with a real new merchant, in her actual setup session, and just watch — without steering, without a task list, without interrupting to ask "why did you do that."

## The method

Simple Ethnography is a deliberately minimal fieldwork practice: pick a real setting, observe quietly, and record what happens in two disciplined, separated columns — objective observation (what you literally saw and heard) and interpretation (what you think it means) — plus a third note for anything that surprised you. The separation is the whole point. It's easy, under time pressure, to write down your interpretation as if it were the observation ("she got confused by the palette picker"), and once that happens, the debrief just launders an assumption back to the team as if it were a finding. Forcing the columns apart means a debrief starts from what's actually verifiable.

Sessions are short and low-ceremony — no lab, no script, just permission to watch someone doing something they were going to do anyway, in their real environment, followed by an immediate structured debrief while the detail is fresh.

## What we watched

With her permission, we sat in (remotely, screen-shared, silent unless she addressed us directly) while a new merchant went through first-time theme setup for her jewelry storefront.

**Observed:** She moved through the initial steps briskly — store name, basic info, logo upload — without pausing. At the color-palette step, she opened the palette picker, then immediately minimized the browser and switched to a different tab, where she spent close to four minutes on Pinterest, searching "jewelry store branding colors." She came back, tried two different palette presets, switched tabs to Pinterest again briefly, then settled on a palette and continued. Total time on that one step: just under nine minutes, compared to under a minute for every step before it.

**Interpreted:** The step wasn't confusing in the sense our internal theory assumed — she wasn't stuck on the UI itself, she understood exactly how to use the picker. What she didn't have, walking in, was a color decision already made, and the tool offered no scaffolding for making that decision — no prompts tied to her stated store category (jewelry), no example palettes drawn from similar successful stores, nothing to anchor a choice she clearly hadn't arrived with. She solved that gap herself, by leaving the product entirely and doing her own visual research on Pinterest, then coming back to apply what she'd found there.

**Surprise:** The surprise wasn't that she left the tab — in hindsight that's an obvious thing for someone without a pre-formed answer to do. The surprise was how *little* the palette picker itself seemed to matter once she came back with an idea; she used it confidently and quickly at that point. The friction wasn't in the interface at all. It was entirely upstream of it, in a decision-support gap the interface had no way to address because it was purely a picker, not an advisor.

## Why the funnel data alone had pointed us wrong

The drop-off cliff in the analytics was real, but its most obvious internal explanation — "the palette picker is confusing, simplify it" — was wrong, or at least aimed at the wrong layer. A merchant who leaves the tab to do external research isn't necessarily abandoning the funnel (many, like this one, come back and finish); the funnel metric was conflating true abandonment with this kind of productive detour, and a redesign aimed at simplifying the picker itself would have polished a step that wasn't actually the bottleneck, while leaving the real gap — no category-specific color guidance inside the product — completely untouched.

That's the specific value of watching over analyzing aggregate metrics here: the funnel chart is excellent at telling you where in a sequence something happens, and completely blind to what a user does *outside* the product in response, because it can only see events inside it. A merchant tabbing away to Pinterest for four minutes is invisible to a funnel; it's immediately visible to anyone sitting quietly and watching the actual session.

## What changed

The concrete change: category-aware starting palettes. When a merchant selects "jewelry" (or any other store category) earlier in setup, the color-palette step now leads with a small set of palettes explicitly framed as common choices for that category, pulled from real theme usage data across similar stores, rather than a neutral, undifferentiated grid of every available color combination. It's a much smaller build than a full picker redesign would have been, and it targets the actual gap the ethnography surfaced — a missing starting point, not a confusing tool — rather than the gap our funnel-driven guess had assumed.

We also stopped treating time-on-step as a pure friction signal in isolation; a longer dwell time on a decision-heavy step like color choice isn't automatically a usability problem, and conflating "slow" with "broken" would have kept pointing us at the wrong fix indefinitely.

## Failure modes and when to skip it

The biggest risk is over-generalizing from one session — watching a single merchant is enough to generate a strong, specific hypothesis (as it did here), but it's one data point, and it's worth a second or third observation, or a quantitative check (does providing category-specific palettes actually reduce time-on-step and tab-switching across many merchants), before committing serious engineering time to the fix.

It also depends on genuine restraint from the observer — the instinct to jump in and ask "what are you looking for on Pinterest?" the moment it happens is strong, and giving in to it changes the merchant's behavior in that exact moment, contaminating the observation. Simple Ethnography only works if the observer can tolerate watching something puzzling happen without interrupting to resolve their own curiosity; save the questions for the debrief, or a separate follow-up conversation, not the live session. And it's the wrong tool when what you actually need is a comparison between two design alternatives under controlled conditions — that's a usability test's job, not an ethnographic observation's.
