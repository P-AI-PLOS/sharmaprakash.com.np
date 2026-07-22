---
title: "Strategy Formation: How to Tell a Real Strategy From a Wish"
date: "2025-01-09T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Most documents labeled 'strategy' are actually goals wearing a strategy's clothes. Here's the kernel test I run to catch that, plus the three other frameworks I reach for once diagnosis alone isn't enough — Playing to Win, Wardley Mapping, and 7 Powers."
use_featured_image: false
series: leadership-frameworks
seriesOrder: 2
---

The first time I asked a leadership team "what's our strategy," I got a slide with a bar chart trending up and to the right and a headline that said "become the market leader in our category." Everyone nodded. Nobody could tell me what we'd do differently on Monday morning because of that slide. That's the tell I now watch for: a real strategy changes what you'd say no to this week; a goal just changes what you'd feel proud of in three years.

The four frameworks below are the ones I actually reach for at [that layer of the cascade](/product-management/the-strategy-cascade-frameworks-i-actually-reach-for/) — deciding where to play and how to win, before objectives, before roadmap, before any of it. None is a substitute for judgment, but all four have saved me from shipping a wish and calling it a plan.

## Good Strategy / Bad Strategy — the kernel as a detector

Richard Rumelt's kernel is three pieces: a **diagnosis** of the actual problem, a **guiding policy** for dealing with it, and a set of **coherent actions** that carry it out. I use it less to write strategy than to test one someone else already wrote. The test I run in a room: "what would have to be true for this to be wrong?" A real diagnosis answers immediately, because it's a claim about the world, not a preference — "we're losing enterprise deals because our procurement cycle runs four weeks longer than competitors'" is falsifiable, go check the deals. "Be the AI-first leader in our category" isn't a diagnosis of anything; it's the goal restated as if saying it twice makes it strategic.

Where it earns its keep: a roadmap review where three initiatives all claimed to serve "platform modernization." The kernel test surfaced that only one had an actual diagnosis behind it — a specific scaling bottleneck we'd hit twice — the other two were things engineers wanted to do, dressed in the same language. We killed one, timeboxed the other, and the work that stayed got double the resourcing it had before, because it was the only initiative that could survive the question.

The honest failure mode: the kernel is a detector, not a generator. It's excellent at telling you a strategy is fake, much less useful for telling you what a real one should say instead. I've watched people treat "we found the diagnosis" as if the hard part were done, when the hard part — choosing a guiding policy and living with what it rules out — is what comes next. Blockbuster is the canonical case: [the fuller Blockbuster story](/product-management/blockbuster-didnt-laugh-at-netflix/) is a decade of correct diagnosis with no coherent action willing to eat the late-fee revenue it implied.

## Playing to Win — five choices, in a specific order

Lafley and Martin's cascade — winning aspiration, where to play, how to win, capabilities needed, management systems required — is the one I reach for when a team has a diagnosis but is stuck translating it into a decision. The order matters more than the content: "where to play" has to come before "how to win," because how-to-win only makes sense inside a chosen arena. The best positioning in the wrong market is still a loss, and most teams want to skip straight to how-to-win because it's the fun part.

I use this most in segment-selection conversations, where the instinct is to answer "which segment" and "how do we differentiate in it" at the same time, which muddles both. Forcing the sequence — close where-to-play before opening how-to-win — has more than once revealed the team was actually arguing tactics as a proxy for an unresolved market choice: a debate that looked like a pricing disagreement was really half the room wanting to defend the SMB base while the other half chased an exciting enterprise logo. No pricing framework was going to resolve that; the cascade did, by making the real disagreement visible.

The honest failure mode: the framework assumes you can genuinely choose to *not* play somewhere, and organizational gravity resists that constantly — [sales wants every deal](/product-management/the-roadmap-in-the-sales-room/), the roadmap wants every feature request satisfied, and "where to play" quietly turns into "everywhere, a little." It only works if someone with authority lets the "where NOT to play" choice stick when the pressure to chase the next logo shows up, which is most of the time.

## Wardley Mapping — same value chain, different maturity

Wardley Mapping is the framework I reach for when the question is build-vs-buy, or "which part of our stack is about to get commoditized out from under us." You map the value chain from user need down through the components serving it, then plot each on an evolution axis — genesis, custom-built, product, commodity — based on how ubiquitous it's become, not how important it feels.

What makes this different from a generic architecture diagram is that the axis is about *evolution*, not importance: a component can be mission-critical and still commodity (nobody should be hand-rolling object storage in 2026), and something novel-feeling can be genesis and still not matter much. I've used this most on AI tooling decisions, mapping which parts of an internal platform were genuine differentiation versus which were sliding fast from "custom" to "product" as the ecosystem matured. The map made an uncomfortable call obvious: a retrieval layer the team had spent two quarters hand-building was, by the time we mapped it, sitting on top of three product-grade alternatives doing the same job for less. It didn't argue the conclusion, it just made the position visible.

The honest failure mode: the map is only as good as the evolution judgment calls behind it, and those are opinions dressed as a diagram — two people mapping the same chain place the same component in different columns depending on how threatened they feel by admitting it's commodity. It also goes stale the moment nobody keeps it updated, and the layer that matters most — things sliding toward commodity — is exactly the layer that stales fastest.

## 7 Powers — the "why does this last" check

Hamilton Helmer's 7 Powers — scale economies, network effects, counter-positioning, switching costs, branding, cornered resource, process power — is the framework I reach for last, once where-to-play and how-to-win are chosen, to ask what those choices tend to skip: why will this advantage still be true in three years, once competitors notice it worked?

I don't try to hit all seven in a given strategy — I've never seen a real business honestly claim more than two or three. The useful move is naming the one you're actually betting on and being blunt about what it excludes: switching costs erode once a competitor makes migration cheap, a cornered resource evaporates once the underlying constraint gets solved, and those are very different bets to make. I ran this on a product whose pitch was "we're building a moat with proprietary data." Pushed through 7 Powers, the "moat" turned out to be a head start — nothing about the collection was structurally hard to replicate, so it wasn't a cornered resource, it was a lead measured in months. That reframing changed the roadmap: instead of protecting the head start with more of the same data, we invested in what actually compounds in our case — switching costs built into workflow integration.

The honest failure mode: it's retrospective by construction, built by studying which advantages persisted after the fact — excellent at explaining why the winners won, weak at predicting in advance which of your current bets turns into one of the seven. It's easy to talk yourself into "we have counter-positioning" as a post-hoc justification for a strategy you already liked, rather than a falsifiable test.

## What ties these together

None of these four tell you what to choose. Rumelt's kernel tells you whether you've chosen anything at all. Playing to Win forces the order of the choices. Wardley Mapping tells you how long a technical choice keeps paying off. 7 Powers tells you whether the advantage is structural or just a lead. I've stopped expecting any single one to do all four jobs — that was the early mistake, reaching for 7 Powers when the actual gap was that nobody had a diagnosis yet, or mapping a value chain before the team had agreed where to play. The sequencing between them matters almost as much as the sequencing inside each one. And the choices these four produce don't stay in the strategy doc: where-to-play is what [positioning](/product-management/positioning-the-choice-you-make-before-the-market-makes-it-for-you/) eventually declares in public, and the whole kernel is what [the roadmap](/product-management/building-a-roadmap-you-can-defend/) has to be able to trace every item back to.

I'll occasionally reach for Porter's Five Forces or a Business Model Canvas as supporting tools, but the four above are the ones that have actually changed a decision in the room, not just decorated the slide after it was made.

## Put it to work

Three exercises, in increasing order of discomfort:

1. **Run the kernel test on your current strategy doc.** Find the sentence that claims to be the diagnosis and ask "what would have to be true for this to be wrong?" If you can't answer in thirty seconds with something checkable, you've found a goal wearing a strategy's clothes — and you've found this quarter's most useful conversation.
2. **Write the "where we don't play" list.** One page: three segments, channels, or product areas your strategy implies you're *not* pursuing, each with the sentence "we will decline X even when it's attractive because Y." If you can't fill the page, no where-to-play choice has actually been made yet.
3. **Name your one power.** Of Helmer's seven, pick the single one your current advantage honestly rests on, and write down what would erode it within eighteen months. If the honest answer is "we just have a head start," say that out loud in your next strategy review — it changes what the roadmap should protect.

## Further reading

- Richard Rumelt, [*Good Strategy / Bad Strategy*](https://www.amazon.com/s?k=good+strategy+bad+strategy+rumelt) — the kernel, and the best catalogue of fake strategy ever written.
- A.G. Lafley & Roger Martin, [*Playing to Win*](https://www.amazon.com/s?k=playing+to+win+lafley+martin) — the five-choice cascade, with the P&G cases that shaped it.
- Simon Wardley's original mapping series (free online, and Ben Mosior's [learnwardleymapping.com](https://learnwardleymapping.com/) is the gentler on-ramp).
- Hamilton Helmer, [*7 Powers*](https://www.amazon.com/s?k=7+powers+helmer) — dense, occasionally academic, worth it for the persistence question alone.
