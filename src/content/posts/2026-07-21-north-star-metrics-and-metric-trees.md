---
title: "North Star Metrics and Metric Trees: One Number Is Never Enough"
date: "2026-06-18T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A North Star metric without a tree underneath it is a scoreboard nobody can act on; a tree without guardrails is an invitation to win the number and lose the product. Here's how I actually build the metric layer — North Star criteria, input decomposition, counter-metrics, and where HEART and the pirate funnel still fit."
use_featured_image: false
---

I once sat in a quarterly review where a team presented, with real pride, that weekly active users were up eleven percent — and then spent the next forty minutes unable to answer the only question leadership asked: *why?* Nobody knew which of the quarter's six shipped features had driven it, whether it was a marketing campaign's echo, or whether it would still be true next month. The metric had gone up and the team had learned nothing. That's the moment I stopped thinking of a North Star metric as the finish line of measurement and started thinking of it as the *root of a tree* — because a single number, however well-chosen, only tells you the score. It's the decomposition underneath that tells you where to push.

In [the series this post extends](/product-management/the-strategy-cascade-frameworks-i-actually-reach-for/), the North Star sat in the objectives layer's table and never got developed. This is that development, because the metric layer is where I've seen the most well-intentioned damage done — teams that measure nothing, and teams that measure one thing so hard they break everything around it.

## What makes a North Star actually north

The North Star framework — popularized by Sean Ellis's growth community and codified in Amplitude's playbook — asks for one metric with three properties: it **captures the value customers receive** (not the value you extract — revenue is a result, not a North Star), it **leads revenue** rather than lagging it, and **teams can move it** through their daily work. Spotify's time listening, Airbnb's nights booked, Slack's messages sent within teams: each is a proxy for "the customer got the thing they came for," measured in a currency product teams can actually influence.

The classic mistakes hide in those three properties. Revenue fails the first test — a quarter of great revenue can coexist with customers quietly churning toward the exit. Signups fail the second — they measure promises, not value delivered, which is how you get the vanity-metric pathology Eric Ries named years ago: numbers that only go up, chart beautifully, and predict nothing ([Duolingo and the Rabbit R1 make a useful contrast pair here](/product-management/duolingo-rabbit-r1-north-star-vanity-metrics/)). And "market share" fails the third — no squad can see its work in the number, so the number governs nothing.

The case where choosing well mattered: a B2B product whose default metric was seats sold. Sales loved it; it grew for six straight quarters while actual weekly usage per seat declined for five of them. The churn, when it arrived, looked sudden and was anything but. Re-anchoring on weekly active workflows completed — a value metric, not an extraction metric — made the decline visible two quarters earlier than the renewal data would have, which is exactly what a leading indicator is for.

## The tree is where the metric becomes a strategy

A North Star you can't decompose is a scoreboard. The move that turns it into an operating tool is the metric tree: break the North Star into the input metrics that mathematically or causally compose it, then break those down again, until you hit numbers a single team can own and move.

For a marketplace-ish product it might go: *weekly transactions* decomposes into *active buyers × transactions per buyer*; active buyers decomposes into *new activations + retained + resurrected*; activation decomposes into *signups × onboarding completion × first-transaction rate*. Three levels down, every leaf is a number one squad can claim, and — this is the actual payoff — **the tree is a prioritization argument**. When two teams disagree about what matters most, the tree turns "my project versus your project" into "which input is the current bottleneck," which is a question evidence can answer. It's the same move the opportunity solution tree made for discovery: give every claim a place to live, so arguments happen about the structure instead of past each other.

The tree also disciplines OKRs, connecting straight back to [the measurement post](/product-management/org-design-and-measurement/): a team's Key Results should be recognizable as nodes of the tree, and a KR that can't find its parent node is usually activity dressed as outcome. The same discipline runs through the roadmap posts — [every roadmap item's outcome line names a node](/product-management/building-a-roadmap-you-can-defend/), [investor milestones are priced in nodes](/product-management/presenting-the-roadmap-to-investors/), and [marketing's numbers hang on a branch of the same tree](/product-management/marketing-the-roadmap/) — which is the point: one tree, every argument.

Two supporting frameworks slot in here rather than compete. The **AARRR pirate funnel** — acquisition, activation, retention, referral, revenue — is a generic starter tree for when you don't yet know your product's real structure; useful scaffolding, but generic by construction, and teams that never graduate from it end up optimizing a funnel shape their product doesn't actually have. And Google's **HEART framework** — happiness, engagement, adoption, retention, task success — is what I reach for at the *feature* level, where a North Star is too coarse: it forces you to pick, per feature, which dimension success even means, instead of defaulting to "usage went up."

## Guardrails, or: every metric is a target someone will hit

Goodhart's law — when a measure becomes a target, it ceases to be a good measure — isn't a risk of metric trees, it's a certainty, and the only defense I've found is naming **counter-metrics** at the same moment you name the target. Pushing activation? Pair it with early retention, so you notice when you've "activated" people into a product that doesn't hold them. Pushing engagement? Pair it with a quality signal, so you can't win by making the product harder to leave rather than better to use. Support deflection paired with resolution satisfaction; delivery speed paired with change failure rate — the DORA metrics from the series work exactly this way, four numbers chosen partly because they check each other.

The tell that guardrails are missing is a metric that improved while the product got worse, and everyone privately knows it. I watched a team drive onboarding completion from 60 to 85 percent by cutting the onboarding steps that actually taught people the product — completion up, week-four retention down, and the dashboard called it a win for two full quarters because nothing on the dashboard was positioned to disagree. That's the mild version; [Wells Fargo and Builder.ai](/product-management/wells-fargo-builder-ai-metric-becomes-target/) show how far the same mechanic goes when the incentives get serious.

The honest failure mode of the whole apparatus: metric trees rot, exactly like the RAID logs and Kano classifications this series kept catching in the same act. The tree encodes a causal model of your product — *this input drives that outcome* — and causal models go stale as the product and market move. A tree built during your growth phase will confidently misdirect you in maturity, when the bottleneck has moved from acquisition to retention and the tree still says otherwise. It needs a revisit cadence, and the revisit has to be allowed to say "the North Star itself is wrong now," which is organizationally the hardest sentence in this post.

## Put it to work

1. **Test your North Star against the three criteria.** Value received, not extracted; leads revenue; teams can move it. Write one sentence of evidence per criterion. If your metric is revenue, signups, or anything with "total cumulative" in front of it, at least one sentence won't survive being written down.
2. **Draw the tree to the team level.** Decompose your North Star until every leaf has exactly one team's name next to it. Orphan leaves — inputs nobody owns — are your unstaffed strategy; contested leaves are next quarter's coordination failure, visible early.
3. **Name a counter-metric for every current target.** For each metric a team is actively pushing this quarter, write down the number that would reveal the cheap way to win it. If you can't think of one, ask the team — someone on it has already found the cheap way and is politely not using it.

## Further reading

- Amplitude's [*North Star Playbook*](https://amplitude.com/north-star) (free) — the most complete treatment of choosing and decomposing a North Star.
- Eric Ries, [*The Lean Startup*](https://www.amazon.com/s?k=the+lean+startup+ries) — the vanity-metrics argument and actionable-metrics chapter have outlived most of the rest of the methodology's hype cycle.
- Kerry Rodden et al., "[Measuring the User Experience on a Large Scale](https://research.google/pubs/pub36299/)" — the original HEART paper, still the best feature-level measurement piece.
- John Doerr, [*Measure What Matters*](https://www.amazon.com/s?k=measure+what+matters+doerr) — for the OKR layer the tree should feed; covered at length in the series' measurement post.
