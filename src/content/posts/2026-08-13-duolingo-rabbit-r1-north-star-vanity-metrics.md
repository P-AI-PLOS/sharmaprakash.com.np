---
title: "40 Million Daily Users vs 5,000: What a North Star Is Actually For"
date: "2026-08-13T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "In 2024, Duolingo filed a 40.5-million daily-active-user number with the SEC, up 51% in a year, with more than ten million people holding streaks over a year long. The same year, Rabbit sold roughly 100,000 R1 devices and its founder admitted about 5,000 people used one daily. Both companies had a big number to point at. Only one of the numbers measured value received — and the distance between those two kinds of number is the entire argument for choosing a North Star carefully."
use_featured_image: false
---

In September 2024, the founder of Rabbit did something founders almost never do: he said the real number out loud. The R1 — the little orange AI gadget that had been one of the loudest launches of the year, roughly 100,000 units sold at $199 each — had, by Jesse Lyu's own admission, about 5,000 daily active users. Five thousand. Out of a hundred thousand. Around five percent of the people who had paid for the thing were using it on any given day, and the founder confirmed it himself, which is why I trust the figure enough to build a post on it.

That same year, Duolingo's Q4 shareholder materials reported 40.5 million daily active users, up 51% year over year, against 116.7 million monthly actives — a DAU/MAU ratio of 34.7%, filed with the SEC where lying gets expensive. More than ten million of those users, per the shareholder letter, held streaks of a year or longer. Ten million people who had opened a language app every single day for at least 365 consecutive days.

Two companies, two headline numbers, one year. Rabbit's number — units sold — went up every time someone made a promise to themselves. Duolingo's number went up only when someone actually received value, today, again. I've written before about [what makes a North Star metric structurally sound](/product-management/north-star-metrics-and-metric-trees/), in framework terms: value received not extracted, leads revenue, teams can move it. This is the story version, because I've never found a cleaner pair of cases for the difference between a metric that measures your product and a metric that merely measures your marketing.

## Duolingo: the streak is the bottom of a tree, not a gimmick

The thing people get wrong about Duolingo's streak is treating it as a growth hack — a clever bit of gamification bolted onto a language app. It's better understood as the visible leaf of a metric tree that the company built deliberately, and we know this because Jorge Mazal, Duolingo's former Chief Product Officer, walked through the whole apparatus in a 2023 piece for Lenny's Newsletter that remains the best practitioner account of a North Star system I've read.

The number at the top of that tree is CURR: current-user retention rate — roughly, of the people who were active recently, how many came back this week. Not downloads. Not signups. Not even DAU directly. Retention of already-engaged users, because Duolingo's team had modeled their growth and found that this input, though it looked small and unglamorous next to acquisition numbers, compounded harder than anything else they could push. A percentage-point of CURR improvement ripples forward through every future cohort; a percentage-point of extra downloads is spent the day it arrives.

Everything under CURR decomposes the way a good tree does — into inputs individual teams could own and move. The streak is one of those inputs: a mechanic whose entire purpose is to convert "I use this sometimes" into "I use this daily," because daily use is what the tree said mattered. Then the streak itself got decomposed and iterated on — streak freezes, streak repair, notification timing — each experiment aimed at a node, not at a vibe.

The result is the part that's SEC-filed rather than blog-claimed: 40.5 million DAU at the end of 2024, up 51% in a year, with over a third of monthly users showing up daily. For a language-learning app — a category historically defined by January resolutions and February abandonment — a 34.7% DAU/MAU ratio is a genuinely strange number. It's a social-network-shaped engagement ratio attached to homework. That's what a metric tree run seriously for years actually buys you: not a dashboard, a compounding machine.

And the ten-million-plus year-long streaks are my favorite figure in the whole story, because a year-long streak is un-fakeable in a way almost no other engagement stat is. You cannot bot it, bundle it, or count it generously. Someone showed up 365 days in a row, and the only way that happens is if the product delivered enough value, enough times, to be worth coming back to. It is the purest "value received" number I know of at that scale.

## Rabbit: units sold is a promise, not a product

Now hold the R1 next to that. A hundred thousand units sold is, on its face, a spectacular number for a hardware startup — real people paying real money, no subscription required, on the strength of a demo and a keynote. If your metric is units sold, the R1's launch was a triumph and the chart proves it.

But look at what the number actually measures. A unit sold records the moment a customer believed the promise. It says nothing — literally nothing — about what happened after the box was opened. Units sold is a vanity metric in the precise Eric Ries sense: it only goes up. It cannot decline. Every disappointed customer, every drawer the device ended up in, every returned unit leaves the cumulative sales chart exactly as beautiful as before. A metric that is structurally incapable of delivering bad news is not a measure of your product; it's a measure of your pitch.

DAU can decline. That's the whole point of it. And when Rabbit's founder gave the daily-active figure — about 5,000, roughly five percent of buyers — the gap between the two numbers became the most honest chart in consumer AI hardware. Ninety-five percent of the people who believed the promise were not, on a given day, receiving the value. The pitch had a 100,000-person audience; the product had a 5,000-person one.

I want to be careful about the lesson here, because it's not "Rabbit lied" — the opposite, actually; the admission was unusually candid, and candor about a bad number is worth more than silence around a good one. The lesson is about which number a team internalizes as the score. A company that navigates by units sold will keep optimizing the promise: the keynote, the pre-order funnel, the unboxing. A company that navigates by DAU is forced — daily, mechanically — to confront whether the thing is worth using. Same company, same product, entirely different gravitational pull. This is the same argument I made about measurement shaping organizations in [the org design and measurement post](/product-management/org-design-and-measurement/): the metric you rank yourself by quietly becomes the org chart's real boss.

## The folklore pair: seven friends and nights booked

Every conversation about activation and North Star metrics eventually reaches for the same two stories, and both deserve to be told with their hedges attached, because the hedged versions teach more than the clean ones.

The first is Facebook's "seven friends in ten days" — the claim that Facebook's growth team discovered users who reached seven friends within ten days were dramatically more likely to retain, and rebuilt onboarding around getting people there. Here's the folklore flag: the number varies by who's telling it. Chamath Palihapitiya said seven friends in ten days in 2013. Alex Schultz, in his 2014 Stanford startup lecture, said ten friends in fourteen days — and, crucially, said out loud that they could never prove the relationship was causal. Correlated users retained; whether manufacturing the correlation would manufacture the retention was unproven. No primary Facebook document states either number. Zuckerberg's team shipped against it anyway.

Most retellings sand off that last part, and it's the actual lesson. The famous activation metric was a correlational bet, made knowingly, by people who understood the difference and decided the bet was worth taking. That's a far more useful precedent than the myth — the myth says "find your magic number," which sends teams on causation snipe hunts; the real story says "a well-chosen correlate, acted on decisively, beats a perfect causal proof you never finish."

The second story is Airbnb's "nights booked." Here the metric is as real as metrics get: "Nights and Experiences Booked" is a formally reported KPI in Airbnb's November 2020 S-1, on the order of 327 million nights in 2019, a number filed with the SEC. What's lore is the tidy origin story — the retold version where the early team weighed candidate metrics, nobly rejected the extraction-shaped ones, and chose nights booked in a moment of clarity. Maybe it happened that way; Brian Chesky has discussed the company's metric thinking on Lenny's Podcast, and his telling is the closest thing to a primary source. But the crisp founding-decision scene is reconstructed, the way origin stories usually are.

What I actually take from Airbnb isn't the origin scene — it's the structural fit. A night booked pays both sides of the marketplace at once: a guest got housed, a host got paid. It's the rare single number that captures value received by two different customers whose interests could otherwise be traded off against each other. Bookings, by contrast, would count the promise (a reservation made) rather than the value (a stay that happened). Nights booked sits on the Duolingo side of the line, and the line is always the same one: does the number move when value is delivered, or when value is merely promised?

## The distance between the two kinds of number

So here's the compressed version of what 40.5 million versus 5,000 teaches. Units sold, signups, downloads, cumulative anything — these are promise metrics. They record belief, they cannot go down, and they will keep applauding while your product dies. DAU, retention, streaks, nights booked — these are delivery metrics. They record value received, they can collapse, and their capacity for bad news is exactly what makes them worth steering by.

The uncomfortable corollary: choosing a delivery metric is an act of courage, not analytics. Rabbit's five percent was always true; the choice was whether to have a number that said so. Duolingo's CURR tree was a commitment to be measured by the hardest thing — did people come back today — rather than the easiest. And Facebook's team shows the mature version of the discipline: rigorous enough to know their metric was only correlational, decisive enough to ship anyway. A North Star isn't the number that makes the board deck look best. It's the number you'd still want to be true if nobody was watching.

## Put it to work

1. **Sort every metric on your dashboard into promises and deliveries.** For each number ask: does this move when a customer receives value, or when a customer expresses belief? Units, signups, pipeline, and anything cumulative go in the promises column. If your primary metric is in that column, you've built a Rabbit chart — beautiful, monotonic, and silent about whether anyone uses the product.
2. **Find your five-percent ratio and say it out loud.** Divide your daily (or weekly) actives by your total buyers, seats, or accounts. Rabbit's was ~5%; Duolingo's DAU/MAU was 34.7%. Whatever yours is, putting it in front of the team does what the founder's admission did — it replaces the flattering number with the true one, and the true one is the only one you can improve.
3. **When you pick an activation metric, write down that it's correlational — then ship anyway.** The honest reading of Facebook's seven-friends story is that the number varied by teller and causation was never proven, and they acted on it regardless. Do the same deliberately: name the correlate, note the uncertainty in the doc, set a check-in date to see if moving it moved retention, and move. The alternative is waiting for causal proof that never arrives.

## Further reading

- Jorge Mazal, "[How Duolingo reignited user growth](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)" (Lenny's Newsletter, 2023) — the primary practitioner account of the CURR metric tree and the experiments underneath it; the rare growth story told by the person who ran it.
- [Duolingo Q4 2024 shareholder letter and 8-K](https://www.sec.gov/Archives/edgar/data/1562088/000156208825000039/q4fy24duolingo12-31x24shar.htm) (SEC EDGAR) — the tier-1 source for the 40.5M DAU, 116.7M MAU, and ten-million-streaks figures.
- 9to5Google, "[Rabbit says 5,000 people use the R1 daily](https://9to5google.com/2024/09/26/rabbit-5000-people-use-the-r1-daily/)" (September 2024) — the founder's first-party admission, and the cleanest vanity-vs-value chart in recent hardware.
- Mode, "[Facebook's aha moment is simpler than you think](https://mode.com/blog/facebook-aha-moment-simpler-than-you-think/)" — a sober walk through the seven-friends folklore, including why the number varies by teller and what the growth team actually claimed.
- [Airbnb S-1](https://www.sec.gov/Archives/edgar/data/1559720/000119312520294801/d81668ds1.htm) (SEC, November 2020) — "Nights and Experiences Booked" as a formally reported KPI; for the narrative version, Brian Chesky's 2023 appearance on Lenny's Podcast.
