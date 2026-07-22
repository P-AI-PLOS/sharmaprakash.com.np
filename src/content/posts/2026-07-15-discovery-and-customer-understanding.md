---
title: "Discovery Frameworks That Actually Change What You Build"
date: "2026-07-15T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Objectives and roadmaps are only as good as the discovery underneath them — and most discovery I've watched happen is just feature requests wearing a lab coat. Here's the set of frameworks that actually separates a real customer problem from someone's opinion, the gate that decides whether a validated problem is worth building for, and where each one still fooled me before it earned its keep."
use_featured_image: false
series: leadership-frameworks
seriesOrder: 3
---

Somewhere in [the first post of this series](/product-management/the-strategy-cascade-frameworks-i-actually-reach-for/) I said the roadmap layer's job is to turn a strategy into an ordered set of bets. What I didn't say is where the bets come from. For years mine came from the loudest stakeholder, the last support ticket that made someone in leadership uncomfortable, or a competitor's changelog. All three produce roadmap items. None of them produce evidence. Discovery is the layer that sits between "we've chosen how we win" and "here's what we build" — and it's the layer I got wrong longest, because bad discovery still *feels* like discovery. You talked to a customer. You wrote it down. It has the shape of rigor without the substance of it. The frameworks below are what eventually replaced my instinct to just ask people what they wanted.

## Jobs to Be Done

The reframe that JTBD gave me, and that I still find myself explaining to new PMs, is this: customers don't buy products, they hire them to make progress in a specific situation. Once you're studying the job instead of the demographic, feature requests stop being requests and start being clues.

The clearest case I can point to is a request that came in as "let us export this report as a PDF." Taken literally, that's a two-day ticket. But when we asked why, the actual job was "make it easy to forward proof of a decision to someone who wasn't in the room." PDF was just the only mechanism the customer could imagine for that job. Once we understood the job, the actual fix was a shareable, permission-scoped link to a live view — it solved the job better than a PDF ever would, and generated its own usage data on top. Ship what was literally asked for, and you've shipped the wrong solution to the right problem and called it done.

The honest failure mode: JTBD gives you a beautifully reframed problem and then goes quiet on what to build next. It's a lens for understanding demand, not a method for ranking solutions, and teams that treat "we found the job" as the finish line end up with a gorgeous job statement and no clearer roadmap than before. You still need a way to go from job to opportunity to bet — which is the gap the next framework closes.

## Continuous Discovery Habits — Opportunity Solution Trees

Teresa Torres's contribution wasn't a new insight about customers, it was a cadence and a shape for holding everything discovery turns up. The habit is weekly customer touchpoints, not quarterly research sprints, and the artifact is a tree: a desired outcome at the top, the opportunities (unmet needs, pain points, desires) that ladder up to it, and the candidate solutions and assumption tests underneath those. It's become close to the default vocabulary in the product orgs I've worked in since — "opportunity" and "assumption test" show up in standups now without anyone citing the book.

Where it earned its keep for me was less about any single interview and more about what the tree does to a roadmap conversation. When a stakeholder pushes a pet feature, "show me where this sits in the opportunity tree" is a far less confrontational question than "why do you want this," and it routes the argument back to evidence instead of seniority. On one team, mapping three months of ad hoc feedback into a single tree revealed that eleven different "opportunities" people had been individually championing were really the same one described three different ways — which collapsed a fifteen-item roadmap debate into three.

Where it breaks down: the tree is only as good as the discipline of the weekly touchpoints feeding it, and those are the first thing that gets skipped when a sprint gets tight. I've seen trees built once, in a burst of enthusiasm, then never touched again — at which point it's not continuous discovery, it's a static diagram wearing continuous discovery's name, aging exactly as fast as any other artifact nobody's updating.

## The Mom Test

If JTBD tells you what to listen for and opportunity trees tell you where to put it, the Mom Test is what keeps the conversation itself from lying to you. Rob Fitzpatrick's rule is disarmingly simple: ask about specific past behavior, never about hypothetical future behavior, because people are enormously polite about your idea and enormously honest about their own lives. "Would you use this?" gets you a yes almost every time, because saying no feels like an insult. "Walk me through the last time you tried to solve this" gets you a real answer, because there's nothing to be polite about. Quibi, Juicero, and the Humane Pin are [what the polite yes costs at scale](/product-management/quibi-juicero-humane-false-validation/).

I've watched this distinction save a roadmap decision directly. We had a scheduling-assistant feature we were fairly convinced customers wanted, and early conversations asking "would this be useful to you?" got an enthusiastic yes from everyone. Before committing a quarter to it, we rewrote the script to ask what people had actually done the last time they needed to schedule something complex. Almost nobody had used a tool at all — they'd used a shared spreadsheet and a Slack thread, and were fine with that friction because learning a new tool for something twice a month wasn't worth it. The "yes" was polite imagination; "here's what I actually did" was the truth, and it kept us from building something nobody would open a second time.

The honest failure mode: the Mom Test is an interviewing discipline, not a sampling strategy, and it can't rescue you from talking to the wrong five people. Flawless, bias-free questions about the past behavior of a customer segment that doesn't represent your actual buyer still get you flawlessly honest answers about the wrong population — good questions asked of the wrong people are still bad discovery, just more confidently wrong. (Because the gap between agreeing with these rules and applying them mid-conversation is so wide, I later wrote up [the same interview run twice](/product-management/practicing-the-mom-test-the-same-interview-twice/) — once badly, once properly, annotated line by line, with the drills that train the reflex.)

## Kano Model

The Kano model is the one I reach for least often in interviews and most often in prioritization arguments, because its value is in the taxonomy, not the research method. It splits features into five categories, three of which do all the work in practice: basic (their absence causes real dissatisfaction, but presence doesn't generate delight — uptime, login working, data not disappearing), performance (more is linearly better — faster load times, more storage), and delighters (unexpected, disproportionately satisfying, not something customers thought to ask for).

Where this pays for itself is defending unglamorous work. Every roadmap review I've sat in eventually hits a moment where someone wants to cut "boring" reliability or migration work in favor of a shinier feature, and Kano gives you language for why that trade is usually wrong: basic-need work doesn't show up as a delight metric, but its absence tanks satisfaction disproportionately the moment it's missing. I've used the three-bucket split explicitly to get budget for an unglamorous permissions rework nobody was asking for by name, but that support tickets made clear was a basic expectation being silently violated. It's also stopped us from over-investing in a delighter — a slick onboarding animation — past the point where more polish bought any more satisfaction than the effort cost.

The honest failure mode: baskets migrate over time and Kano doesn't warn you when they do. Yesterday's delighter is tomorrow's basic expectation — real-time collaboration was a delighter a decade ago and it's table stakes now — and a classification done once, in a workshop, and never revisited quietly goes stale while everyone keeps citing it as current.

## The Desirability–Feasibility–Viability lens

Everything above tells you what's worth building. IDEO's DFV lens is the gate you run it through before you commit anyone's time: does a customer actually want this (desirability), can we build it with what we have (feasibility), and does building it sustain a business (viability)? An idea has to clear all three, and most of the ideas I've watched die weren't killed by one glaring flaw — they were quietly fine on two axes and just never viable, which is a much harder thing to say out loud in a roadmap review than "customers don't want it."

The place this earned its keep for me was narrating a kill decision, not making one. We'd spent real discovery effort validating a marketplace feature — customers clearly wanted it, and it wasn't hard to build. It died anyway, because at our transaction volume the take rate needed to fund the support and fraud-review overhead never worked out. Before I had the DFV framing, that conversation dragged on for weeks because "people want it" kept getting treated as the whole argument. After it, the sentence was one line: desirable, feasible, never viable. Nobody argued with the shape of that sentence, even when they disagreed about the numbers behind it.

The honest failure mode: DFV is a checklist, not a research method — it tells you which box an idea failed, but not how confident you should be in that verdict, and teams that run it as a five-minute vibe check in a meeting produce three confident-sounding words with no evidence underneath any of them. It's a lens for structuring a conclusion you've already earned through discovery, not a substitute for doing that discovery.

## Cagan's Four Big Risks

Marty Cagan's version of the same gate adds a fourth axis DFV doesn't name explicitly: usability. His four risks are value risk (will people actually choose to use this), usability risk (can they figure out how), feasibility risk (can we build it with the time and technology we have), and business viability risk (does it work for the business as a whole — legal, sales, finance, not just engineering and product). The sentence I've found does more work than any other in explaining what discovery is *for*: discovery exists to retire these four risks before you commit engineering to building the thing.

Where this changed how I ran a team wasn't the list itself, it was the ownership split underneath it. Value and business viability are the PM's risks to retire. Usability is design's. Feasibility is engineering's. Naming that out loud ended a recurring argument on one team where engineering felt discovery was something that happened *to* them — a spec arriving fully formed with the risky decisions already made and no room left to flag "we can't actually build this the way it's spec'd." Once feasibility was explicitly engineering's risk to own and retire, they were in the room during discovery instead of receiving its output, and a few builds got quietly re-scoped before a sprint was wasted on something infeasible as designed.

The honest failure mode: naming four risks doesn't retire any of them by itself, and it's easy to turn the framework into a checkbox exercise — "usability: yes, we did a usability test" — without the test having enough rigor to actually reduce the risk it claims to address. The framework tells you where to look. It doesn't do the looking for you.

## Where this leaves discovery

None of these six replace each other, and that's the part that took me too long to see — I spent a while treating them as competing philosophies instead of a pipeline. JTBD tells you what job is actually being hired for. The opportunity solution tree gives that job somewhere to live alongside every other job, and a cadence for keeping it current. The Mom Test keeps the conversations feeding that tree honest rather than politely useless. Kano is what you reach for once you're deciding what to actually build, so basic-need work doesn't lose every argument to whatever's newest and shiniest. And DFV and Cagan's four risks are the gate at the end — the explicit checklist for whether everything the first four turned up is actually worth committing engineering to. Design Thinking's double diamond and Lean Startup's build-measure-learn loop sit comfortably around all six as the wider process — diverge, converge, measure whether you were right — but the frameworks above are what make each diamond trustworthy rather than performative.

The thing I keep relearning is that discovery isn't a phase you finish before the roadmap gets written — it's evidence flowing continuously upward, the same direction I described in [the first post of this series](/product-management/the-strategy-cascade-frameworks-i-actually-reach-for/). And the flow has more tributaries than interviews: [prospect asks logged in sales meetings](/product-management/the-roadmap-in-the-sales-room/) are discovery signal too, arriving pre-weighted with money. The frameworks that survive on my teams are the ones that make that upward flow cheap enough to keep doing every week, not just the week before a planning offsite. And for what the whole pipeline looks like when it actually works, [Segment and Superhuman are the two stories I point people to](/product-management/segment-superhuman-discovery-done-right/).

## Put it to work

1. **Rewrite one feature request as a job.** Take the top item on your backlog that arrived as a solution ("add PDF export") and write the job statement behind it: *when [situation], I want to [motivation], so I can [outcome]*. If you can't fill in the situation from evidence you actually have, that's your next customer conversation, not your next ticket.
2. **Run the Mom Test on your own last interview.** Pull up your notes and highlight every question you asked about the future ("would you use…", "how much would you pay…"). Rewrite each as a question about a specific past event. The gap between the two lists is how much of your "validation" was politeness.
3. **Gate one live idea through the four risks.** Take something currently in design and write one sentence per risk — value, usability, feasibility, viability — naming the evidence that retires it and who owns it. Any risk whose evidence is "we all feel good about it" is the one to test first.

## Further reading

- Teresa Torres, [*Continuous Discovery Habits*](https://www.amazon.com/s?k=continuous+discovery+habits+torres) — the opportunity solution tree and the weekly-touchpoint cadence.
- Rob Fitzpatrick, [*The Mom Test*](https://www.amazon.com/s?k=the+mom+test+fitzpatrick) — a two-hour read that will permanently ruin bad interview questions for you.
- Clayton Christensen et al., [*Competing Against Luck*](https://www.amazon.com/s?k=competing+against+luck+christensen) — the JTBD theory, told through the milkshake story everyone quotes and the cases nobody does.
- Marty Cagan, [*Inspired*](https://www.amazon.com/s?k=inspired+marty+cagan) — the four risks, and the wider argument for empowered product teams they sit inside.
