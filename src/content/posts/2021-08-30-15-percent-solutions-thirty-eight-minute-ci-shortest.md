---
title: "15% Solutions as a Retro's Last Twenty Minutes"
date: "2021-08-30T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Our own CI took thirty-eight minutes and every retro ended with the same conclusion: we need a build-infrastructure hire. Bolting 15% Solutions onto the end of the next one turned a hiring request into nine things people owned by Friday."
tags: [liberating-structures, shortest]
series: ls-retro
seriesOrder: 6
use_featured_image: false
---

Fourth retro of the quarter, and the CI dashboard on the wall behind me read 38m 12s — median pipeline time, same as the previous three retros give or take twenty seconds. Someone opened the notes doc, scrolled up, and read out the last retro's action item: *hire a build-infrastructure engineer.* Then the one before it: *build infra hire — raise with leadership.* Same sentence three times, at a company that sells a testing tool.

It's not a wrong answer. It's an answer that belongs to a hiring pipeline and a budget cycle — which is to say it belongs to nobody in the room, and nothing is different on Monday. That's a retro failure mode worth naming, because it doesn't look like a failure: the analysis was good and the root cause correct. The action item was simply larger than anyone present, so it went into the notes and the notes went into a folder. What that fourth retro needed wasn't a better diagnosis. It was a different final twenty minutes. So I ran the debrief normally and then bolted **15% Solutions** onto the end of it.

## The chain, and why this order

The debrief was What, So What, Now What: facts, then meaning, then action, each round starting alone and climbing through pairs and quartets. It produced the same root cause as before — one serial job running the full browser suite on a single runner, behind a Docker build that rebuilt node_modules every time.

Then, instead of harvesting a team action plan, I switched prompts. Five minutes, silent, alone: *what can you do about CI time this week, with no new hire, no new budget, and nobody's approval?* Then trios — one person presents for two or three minutes, the others spend four or five asking questions and offering help, rotate until everyone's presented.

The order matters. Run 15% Solutions cold, without the So What round, and you get guesses about a system nobody has looked at properly. Run the debrief without it and you get a correct diagnosis with no owner. The debrief builds the shared picture; the fifteen-percent round makes each person find their own foothold in it.

## Nine footholds

The lists were unglamorous, which is the point.

One engineer: cache node_modules properly — the Dockerfile copied the whole source before installing, so every source change busted the dependency layer. A two-line reorder she'd known about for months without it ever being anyone's job.

Another: split the browser suite across four runners. Our CI provider supported matrix jobs; nobody had turned it on. Half a day of YAML.

A third: the suite ran a full production asset build to test API endpoints that never touched the frontend. He could gate that behind a path filter.

The QA lead: delete the fourteen tests skipped for over six months, which still counted toward setup time and toward everyone's sense that the suite was enormous.

Someone from support, in the room because he runs the demo environment: stop his nightly job sharing the runner pool with CI. He'd set it up eighteen months earlier and nobody had connected it to the morning slowdown — because nobody had ever asked him what he could change.

Nine items. The trios did the connecting work — the matrix-split engineer learned from the path-filter engineer that half the matrix needn't run on backend-only pull requests, turning two improvements into a better combined one.

The hire is still, correctly, on the list — just no longer the only thing on it, and whoever we hire will inherit a system somebody has already been maintaining.

## Why the last twenty minutes decide whether a retro was real

A retro's output is not its analysis. It's what's different on Wednesday. The reliable way a retro produces nothing is by generating action items sized for an organisation rather than a person — hire someone, get headcount, change the roadmap. Those are usually true and always unstartable, and a team that generates three in a row learns that retros are where good observations go to be filed.

15% Solutions is the antidote because of its constraint, not its scope. Requiring that every item sit inside the writer's own discretion means it leaves the room with an owner attached by construction — not assigned, claimed. The consult round catches the item that's smaller than its owner thought, and the two that are better merged.

## Where the chain breaks

Don't run 15% Solutions when the debrief has just concluded that the problem is a decision above the room's pay grade and the room knows it. Asking for personal actions right after "this is leadership's call" reads as deflection and earns the cynicism it gets. Take the finding upward, say you're doing it, and run the fifteen-percent round on something the team controls.

And don't chain the two if you're out of time. A rushed 15% Solutions — silent writing cut to two minutes, no consult round — degrades into a round-robin of volunteering, which is just the old broken retro with extra steps. If the debrief has eaten the hour, book the twenty minutes separately. The two halves work; the half-done version doesn't.

The dashboard behind me at the next retro read 11m 04s, and nobody read the previous action item aloud, because it had already been done by the person who wrote it.
