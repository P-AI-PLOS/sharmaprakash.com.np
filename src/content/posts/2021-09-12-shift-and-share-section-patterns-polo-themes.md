---
title: "Shift & Share: Five Theme Squads, Five Stations, No Slide Deck"
date: "2021-09-12T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Polo Themes had five squads solving the same storefront section problem five different ways, and a quarterly demo meeting nobody learned anything from. Shift & Share replaced the plenary with rotating stations — and the best pattern in the company came from the squad that would never have volunteered to present."
tags: [liberating-structures, polo-themes]
series: ls-culture
seriesOrder: 4
use_featured_image: false
---

Polo Themes shipped five theme families, each built by its own squad, and every one of them had independently invented a way to let merchants reorder storefront sections without breaking the live preview. Five implementations, five sets of bugs, and a quarterly demo meeting where each squad got eight minutes on a projector to show what they'd built. What actually happened in those meetings: the first two demos got attention, the middle one got laptops open, and nobody ever asked a real question because asking a real question in front of forty people is a small act of courage.

So the next quarter we ran **Shift & Share** instead, and the section-reordering pattern that ended up in all five themes came from the squad that had never once volunteered to demo.

## How it runs

Shift & Share replaces sequential plenary presentations with parallel stations. You pick three to five people or pairs with something worth sharing, give each a station — a table, a laptop, a wall — and split the room into as many small groups as there are stations. Each group spends seven to ten minutes at a station: a short demo or story, then questions. Then everyone rotates. The presenter stays put and repeats their piece to each new group.

Two properties follow from that shape, and they're the whole reason to do it. First, presenters give the same talk three or four times, which means the fourth version is dramatically better than the first — they've discovered which parts confuse people and dropped what doesn't land. Second, an audience of six standing around a laptop asks completely different questions than an audience of forty facing a projector. Nobody is performing.

Total time for five stations is 60 to 75 minutes including movement, and you need a hard timer plus someone who will actually enforce the rotation. Groups always want to stay at the station they're enjoying.

## Running it on the section-reordering problem

I asked each of the five theme squads to staff one station with whoever had actually built their section-reordering behaviour — not the squad lead, the person with the code in their head. That instruction alone changed who was in the room.

Station three was the surprise. The squad maintaining our oldest theme family, the one everyone quietly considered legacy, had solved live-preview flicker with something none of the newer squads had tried: instead of re-rendering the preview iframe on every reorder, they diffed the section order and animated a DOM move in place, falling back to a full re-render only when a section's settings changed. It was two hundred lines and it had been in production for seven months. Nobody outside that squad knew, because that squad had never been given a demo slot — legacy themes don't get the projector.

By the fourth rotation the engineer explaining it had the pitch down to ninety seconds and a live toggle. Two other squads had adopted the approach within three weeks; the fourth found a genuine reason it wouldn't work for their theme's nested-block model, which was also useful and would never have surfaced from a slide.

The other stations weren't wasted either. One squad's station was mostly a confession — their reorder implementation was a known mess and they demoed it as such. In a plenary they'd have polished it into something defensible. Standing at a table with six colleagues, they asked for help instead, and got it.

## Why repetition and smallness do the work

The mechanic here is unglamorous: you present the same thing several times to small groups. But the two effects compound. Repetition is a free editing pass — presenters iterate their explanation live, without preparation time, based on real confusion rather than imagined confusion. And smallness lowers the cost of both asking and admitting. The question "wait, why doesn't that break on nested blocks?" is trivially askable to six people and socially expensive in front of forty.

There's a third effect I didn't expect: it distributes attention evenly. In sequential demos, presentation order is destiny — the last squad presents to an exhausted room. In Shift & Share every station gets every group, fresh-ish, and the legacy squad gets exactly as much audience as the flagship one. For spreading a practice across squads that don't have equal status, that's not a side benefit, it's the mechanism.

## When not to use it

Shift & Share needs things genuinely worth showing. If two of your five stations are padding, groups will notice by rotation two and the energy collapses for everyone. Three strong stations beat five uneven ones.

It's also wrong when the room needs to *decide* something. This structure spreads and cross-pollinates; it does not converge. We deliberately did not end that session with "so which pattern do we standardize on" — that was a separate conversation two weeks later, after squads had tried things. Ending a Shift & Share with a vote wastes what it just generated and pressures presenters into competing rather than teaching.

And it needs physical or virtual space that supports parallel small groups. Five stations in one echoing room is unpleasant; five breakout rooms with no one enforcing rotation is worse. Get the logistics right or run something else.
