---
title: "Appreciative Interviews: What High-Converting Merchants Do That the Theme Doesn't Ask For"
date: "2021-02-12T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Instead of studying why some storefronts convert poorly, we interviewed the merchants whose stores were already converting well — and found a set of small, unprompted customizations the theme should have been suggesting all along."
tags: [liberating-structures, polo-themes]
series: ls-discovery
seriesOrder: 11
use_featured_image: false
---

Storefront conversion-rate research at a theme company tends to be reactive: pull the merchants with the worst numbers, figure out what's broken, ship a fix. That's necessary work, but it treats good conversion as the absence of a problem rather than a thing with its own causes worth understanding. We flipped the study for once, using **Appreciative Interviews**, and asked our highest-converting merchants — well above the median for their store category — to tell us, in detail, about specific choices they'd made setting up their storefronts. Not "what do you like about the theme." Specific stories.

## The method

Appreciative Interviews pairs participants to interview each other about a genuine positive experience, insisting on concrete detail rather than general sentiment. In a merchant context, the prompt was something like: *tell me about a specific change you made to your storefront that you noticed actually mattered — something you changed and then saw a real difference.* The interviewer keeps pushing past vague answers ("I just made it look nicer") toward the specific: what exactly did you change, when, what did you notice afterward, what made you think to try it in the first place.

Stories get shared back to the full group afterward, and the facilitator listens for what repeats across merchants who've never spoken to each other, run completely different categories of store, and arrived at similar choices independently. That independent convergence is the signal worth building around.

## What the merchant stories converged on

We interviewed nine merchants across different product categories — apparel, home goods, a specialty food store, a couple of accessory brands. None of them had talked to each other before the session. The stories, once shared, converged on something none of our own theme documentation had ever emphasized: nearly every merchant described, independently, having replaced generic size/fit or "what's included" copy in the product description template with something specific and slightly idiosyncratic — a size-comparison note phrased in their own voice, an offhand line about how a product had actually been used by the merchant's own family, an honest caveat about a product's limitation.

One merchant's story was detailed enough to anchor the pattern: she ran a home-goods store and had rewritten the default "materials and care" section of her product template to include a single unscripted line — "we washed this rug fifteen times before we'd sell it, here's what actually happens to the color" — after noticing customers kept asking the same question in DMs. She hadn't touched a single layout setting in the theme customizer to do it; it was a copy change inside a template block the theme treated as boilerplate. Conversion on that specific product page, by her own before/after tracking, rose noticeably in the weeks after the change, and she said she'd since done the same thing across her top ten products.

A second merchant, running an apparel store, described something structurally similar but through a different mechanism: he'd added a short "how I'd style this" note, in his own words, to product pages for anything he personally liked, rather than relying on generic styling suggestions. A third, in accessories, had done almost the identical thing with a "why we picked this supplier" aside.

Across all nine stories, the pattern was the same shape: high-converting merchants weren't primarily differentiating through theme customization settings — color, layout, font choices, the things our customizer UI was built around exposing — they were differentiating through small, honest, first-person copy insertions in places the theme treated as fixed boilerplate. The theme's editable regions existed; nothing pointed a new merchant toward the idea that this specific kind of content, in this specific tone, was worth writing.

## What it changed in the product

Our customizer's roadmap, going into the session, was almost entirely about visual controls — more color options, more layout templates, a better live preview. The appreciative interviews didn't argue against any of that, but they surfaced a gap those improvements wouldn't touch: merchants who hadn't yet discovered the "write something honest and specific here" move had no signal from the product that it existed as an option, let alone that it correlated with conversion.

The concrete change that came out of the session was a set of contextual prompts inside the product-description editor — not AI-generated copy, but short, specific nudges drawn directly from the interview stories ("what would you tell a friend who asked if this actually works?" "is there anything about this product people usually ask you directly?") appearing as placeholder-style hints the first time a merchant opened that editor block. It was a much smaller build than anything on the visual-customization roadmap, and it was rooted in evidence — nine independent merchants had already found version of this valuable — rather than in a guess about what might help.

## Why appreciative framing found something conversion-audit tooling had missed

Standard conversion analytics (funnel drop-off, heatmaps, A/B test results) are excellent at telling you *where* a store loses visitors and *whether* a specific change moved a specific number. They're much weaker at telling you *what merchants are already doing right that isn't visible in aggregate data* — a copy change on one merchant's rug page doesn't show up as a platform-wide trend in an analytics dashboard; it only becomes visible when you sit that merchant down and ask her to tell you the story of a change she noticed mattered. Appreciative Interviews is, in effect, a way to mine tacit knowledge that quantitative tooling structurally can't see, because it lives in individual merchants' heads, not in the aggregate event stream.

## Failure modes and when to skip it

The technique only works if the interviewer keeps redirecting toward specificity — "I just made it look nicer" or "I optimized my copy" are the kind of vague answers that feel like stories but carry none of the detail (the fifteen-washes line, the "how I'd style this" note) that actually made the pattern visible. Push, gently, for the exact words and the exact moment.

It's also worth remembering that nine merchant stories are suggestive, not conclusive — before betting a roadmap quarter on "prompt merchants toward honest first-person copy," it's worth validating the pattern against broader conversion data across many more stores, which is a different, quantitative follow-up this technique doesn't replace. And it's the wrong tool if the real question is diagnostic (why is this specific merchant's store converting badly) — appreciative framing is built to find and generalize from success, not to root-cause a failure.
