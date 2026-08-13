---
title: "What, So What, Now What: Debriefing the Week Nothing Went Wrong"
date: "2021-08-22T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Black Friday week shipped four themes and a live-preview rebuild with zero incidents, and the team's explanation was 'we got lucky.' Twenty-two people, three rounds, and an hour later we had the actual mechanism written down — which is the only version you can repeat."
tags: [liberating-structures, polo-themes]
series: ls-retro
seriesOrder: 3
use_featured_image: false
---

Black Friday week at Polo Themes: four new storefront themes released, a rebuilt live preview behind them, the highest install volume the shop had ever done, and not one incident. In the Monday standup afterwards, the summary from the room was "honestly, we got lucky."

That sentence is how a team loses a capability it has just demonstrated. Nobody debriefs a good week — the calendar only clears for postmortems — so the practices that made it good stay invisible and quietly erode over the next two quarters. I booked the hour anyway and ran **What, So What, Now What** on the success, with twenty-two people from theme design, engineering, support, and the merchant-success side all in the same session.

## The shape of it at that size

Three rounds, strictly sequenced — facts, then meaning, then action — with each round starting in silence and climbing through pairs and quartets before anything gets said to the whole room. That 1-2-4-All engine is what lets the structure hold twenty-two people without turning into six loud voices and sixteen spectators. A plenary discussion at that size has a hard ceiling of maybe eight real contributors. Quartets have none.

Timing: five minutes to write, ten in pairs and fours, five for a whole-group harvest, per round. Just over an hour with the transitions. The facilitator polices exactly one boundary — no meaning in the What round, no actions in the So What round — and otherwise stays out of it.

For a success debrief I changed one word in the prompt and nothing else. Round one asked: *what did you observe during release week that you would not have observed during an ordinary release week?* Same factual discipline, aimed at difference rather than at damage.

## What luck looked like under the microscope

**What.** The facts came back concrete and slightly mundane, which is the good sign. The four themes were feature-frozen eleven days out, not the usual three. Two designers had, unprompted, started posting screenshots of each theme against the same three demo stores every morning, so visual regressions were caught by eye within a day. Support had pre-written answers to the six questions they'd expected and pinned them; a merchant-success rep had spent a day before the freeze walking five merchants through the new preview and had filed four issues from that, all fixed pre-launch. Engineering had shipped the preview rebuild behind a flag two weeks early and run it internally on real theme data the whole time. And nobody had taken a support shift longer than four hours, because someone had built a rota.

Not one of those was in a runbook. Every one of them was somebody's private good judgement.

**So what.** The meaning round found the through-line fast, and three separate quartets phrased it almost identically: every one of those practices moved a discovery earlier — the freeze, the daily screenshots, the merchant walkthroughs, the early flag. The week was calm because the surprises had been spent in the preceding fortnight. "Luck" was a set of individually small decisions to find things out sooner, made by people who had never described them to each other.

There was a second, less comfortable reading from one quartet: several of those practices existed because two specific people happened to be on the release. Which makes the capability real but not durable — it lives in individuals, and it leaves when they do.

**Now what.** Feature freeze at ten days for any multi-theme release, written into the release checklist. The daily screenshot diff automated rather than left to two conscientious designers. Merchant walkthroughs as a named pre-release step with a nominated owner. The support rota template saved where anybody can find it. Small, boring, and all of them conversions of a person's habit into a team's default.

## Why the facts round matters more when things went well

Failure produces evidence whether you want it or not — logs, tickets, an angry customer. Success produces almost none, which is why success debriefs collapse into mutual congratulation so reliably. Forcing a facts round on a good week is the whole trick: "we communicated well" is not admissible, "the themes were frozen eleven days out instead of three" is, and only the second one can be turned into a checklist item.

The So What round then does something a postmortem rarely gets to do — it separates the practices that caused the outcome from the ones that merely accompanied it. Plenty happened during release week that had nothing to do with the calm. Naming the mechanism is what makes the next release repeatable rather than hopeful.

## When to skip it

Don't run it on a week that went well because the work was easy. If the honest answer is "small release, nothing hard in it," you'll spend an hour manufacturing lessons out of an absence of difficulty, and the checklist items you generate will be cargo cult.

It's also the wrong structure if what you actually want is celebration. This is a working session, and running it as a thank-you produces neither good analysis nor good morale. Say thank you separately, mean it, and keep the debrief a debrief.
