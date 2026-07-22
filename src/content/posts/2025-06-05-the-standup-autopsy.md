---
title: "The Standup Autopsy"
date: "2025-06-05T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The daily standup has the cleanest derivation in all of agile — peers synchronizing and surfacing blockers in under fifteen minutes — and it's still the most reliably dead ceremony on most calendars. Here's the full autopsy: where it came from, the five ways it dies, three questions to diagnose your own, and the replacements each mapped to the constraint it actually serves."
use_featured_image: false
series: agile-first-principles
seriesOrder: 8
---

I once watched a standup where a developer said "no blockers" while sharing his screen, and the screen showed a Slack thread — three days old — in which he was very obviously blocked. Nobody laughed, because nobody was looking. Eleven people stood in a loose semicircle facing the engineering manager, each rehearsing their three lines while the person before them delivered theirs. It ran twenty-two minutes. When it ended, everyone went back to their desks and started the actual coordination of the day: DMs, hallway questions, a huddle that formed organically around a whiteboard at 10:40. The standup hadn't synchronized anyone. The standup was the thing you got through so that synchronizing could begin.

I keep coming back to that room because nothing about it was unusual, and that's the indictment. **The daily standup has the cleanest one-sentence derivation of any ceremony in agile — and it is still the most reliably dead ritual on most team calendars, which makes it the perfect corpse for a full autopsy.** Earlier in this series I argued that [every ceremony should be rederivable from a principle in one sentence](/product-management/agile-without-scrum-or-kanban/), or it's ritual. This post is that test run end-to-end on a single ceremony: the derivation, the ways it dies, how to diagnose your own, and what to run instead.

## The derivation: what the standup was actually for

Start with the pedigree, because it's short and it matters. XP had the stand-up meeting; Scrum formalized the daily scrum. Both were answers to the same question: how does a team of peers stay coordinated day to day without a manager routing every decision? The design is all mechanism. Peers — not reports — synchronize on shared work and surface blockers. Under fifteen minutes, and you stand precisely so it stays under fifteen minutes; discomfort is the timebox's enforcement arm. The Scrum Guide is explicit that the daily scrum is *for the developers*, a planning conversation among the people doing the work — not a status channel to anyone above them.

Run it through [the manifesto's principles](/product-management/the-agile-manifesto-four-values-twelve-principles/) and the derivation writes itself: face-to-face conversation is the most efficient way to move information; the best work emerges from self-organizing teams; business people and developers must cooperate daily. Compress those and you get the one sentence: *peers with interdependent work pay fifteen standing minutes a day to detect collisions while they're cheap.* That's a real derivation — it names the constraint (interdependence), the mechanism (collision detection), and the price (fifteen minutes). It's so clean, so easy to say and to schedule, that it spread everywhere. Which is exactly how it got severed from its reason. The sentence traveled; the constraint didn't.

## The autopsy: five ways the standup dies

Every one of these failure modes is documented, recognized, and running somewhere near you at nine tomorrow morning. Each is a mini-diagnosis: what died, and what killed it.

**1. The status report.** The most common death, and the most instructive. A manager or lead starts attending, then — helpfully — starts facilitating, and the geometry of the room quietly rotates until everyone is talking to one person. The moment that happens, peers-synchronizing has converted into subordinates-reporting. The audience changed, so the content changes: people optimize their update for how it sounds upward, not for what teammates need. And because your update is now a small performance review, everyone rehearses silently instead of listening. The information peers needed stops flowing; it's been displaced by the information one person wanted. The ceremony's body is intact — same time, same circle, same timebox — but the organism it was designed to be is gone.

**2. The liturgy.** Yesterday, today, blockers. Person by person, around the circle, like a call and response. The format was only ever a prompt, but recited long enough it becomes the point — and person-by-person recitation has a structural flaw: most of what each person says concerns work nobody else touches. So the standup becomes fifteen minutes of information nobody acts on, delivered in a cadence nobody can interrupt without feeling rude. You can measure the death simply: count how often one person's update changes what another person does that day. In a live standup that number is the whole justification. In a liturgical one it's zero, week after week.

**3. The zombie standup.** A four-person team sits together all day, pairs half the time, eats lunch together — and still stands up at 9:15 to tell each other what they already know. This is the rederivation test failing in its purest form: the constraint the ceremony serves is desynchronization, and this team is never desynchronized. The standup survives anyway, because deleting a ceremony requires someone to notice it's dead, and dead ceremonies are painless. Fifteen minutes a day, five days a week, is over sixty hours a year per team, spent narrating the visible.

**4. The remote tax.** Take the same ritual and stretch it across timezones. Someone is now dialing in at 6:45 a.m. or 9:30 p.m. — every single day — for a synchronous ceremony whose payload is three sentences of information that could have been written down. Face-to-face conversation was a principle about bandwidth; a grid of muted rectangles taking turns is not high bandwidth, it's a conference call wearing the derivation's clothes. When a team pays real coordination cost — sleep, focus, a colleague's evening — for ceremony, the trade the standup was supposed to embody has inverted.

**5. Blocker theater.** The subtlest death. Blockers get raised daily and resolved never. The same dependency, the same waiting-on-another-team, the same flaky environment, surfacing every morning like driftwood. What happened is that *raising* a blocker became socially equivalent to *escalating* one — saying it out loud in the circle feels like action, so no further action follows. The standup has become a place where blockers go to be acknowledged instead of killed. Worse, it adds latency: a person blocked at 2 p.m. now waits until tomorrow's standup to say so, because the standup is "where blockers go." The ceremony built to surface blockers fast is now the queue they wait in.

## The diagnostic: three questions

You don't need a consultant to autopsy your own standup. Run three questions, honestly.

**Who is it for?** Watch where the eyes and the answers point. If updates are addressed to one person — a lead, a manager, a scrum master with a notebook — it's a status report. A living standup is peers talking to peers, and it's obvious within one round.

**What changed because of yesterday's standup?** Name one thing: a collision caught, a plan adjusted, two people who paired because of something said in the circle. If you can't name anything, and can't for last week either, you're running a broadcast — information transmitted, nothing received.

**What would break if you skipped it for two weeks?** This is the same delete-and-see move from [the rederivation test](/product-management/agile-without-scrum-or-kanban/), scoped to one ceremony. If the honest answer is "nothing," you have your answer, and you also have your next experiment. If something *would* break, congratulations — you've just located the real constraint, and now you can write the derivation down where the team can see it.

## The replacements, each mapped to its constraint

The point of the autopsy isn't "kill the standup." It's that once you know which constraint your team actually has, something smaller and sharper usually serves it better.

**Async written check-ins** serve distributed teams: synchronization without synchrony. Each person posts a short written update on their own morning; everyone reads on their own schedule. You lose the conversational spark, you gain a searchable record and everyone's sleep. If your standup died of the remote tax, this is the direct replacement.

**Walking the board** serves teams whose standup died of the liturgy. You stop going person by person and go item by item — oldest first, right to left across the board — and people speak only when their item comes up. The unit of discussion becomes the work, not the worker, which structurally deletes the recitation problem: an item nobody needs to discuss takes zero seconds.

**Just-in-time huddles** serve the blocker constraint honestly. Why wait until tomorrow 9:15 to say you're stuck? The working agreement becomes: the moment you're blocked, you say so — in the channel, with the people who can unblock you — and a five-minute huddle forms on demand. This is the cure for blocker theater, because it re-couples raising a blocker with acting on one.

**Mobbing** dissolves the constraint entirely. The whole team in one conversation has nothing to synchronize, because everyone was present for every decision. No standup, not as a deletion but as a consequence.

**And the honest option: no standup at all.** A team chat channel, a couple of working agreements about responsiveness, and nothing on the calendar. For a small co-located team with low interdependence, this is frequently the correct derivation, and the only thing stopping teams from reaching it is that it looks, from the outside, like not doing agile.

## When the standup is exactly right

Now the other half of the honesty, because the ceremony isn't the pathology — the severed derivation is. There are constraints for which a daily synchronous standup is the correct, load-bearing answer. A brand-new team with no shared habits needs a daily reflection point it can't yet create for itself. High-interdependence work — many hands in one integrated system — makes daily collision detection worth its price. And crisis mode makes it worth paying twice.

The [Healthcare.gov rescue](/product-management/healthcare-gov-the-rescue-that-invented-a-playbook/), from earlier in this series, ran standups twice a day — and they were exactly right, for exactly the reasons the derivation predicts. The work was one burning, deeply integrated system where everyone's changes collided with everyone else's; the feedback loops had to be hours, not days. And the war room's standing rule was the whole design in three words: *problems, not status.* Nobody recited yesterday. You spoke if something was broken or blocked, and the room acted on it before the next standup. That's not a different ceremony from the one dying in a thousand offices at 9:15 — it's the same ceremony with its derivation intact. Which is the whole argument of this series in miniature: the practices were never the problem. Losing the sentence that explains them was.

## Put it to work

1. **Run the three-question diagnostic on your next standup — silently, as an observer.** Watch where the answers point, write down one thing that changes because of it, and ask yourself what two weeks without it would break. Bring the notes, not a verdict, to the team; let them read the body.
2. **Switch one week to walking the board.** Items, oldest first; people speak only when their item comes up. If the meeting gets shorter and sharper, your standup had the liturgy disease and you've just cured it. If it collapses entirely, you may have had the zombie — nothing on the board needed discussing at all.
3. **Re-couple blockers to action.** New working agreement: blockers get raised the moment they occur, in the channel, with a named person asked to help — and any blocker mentioned at standup two days running triggers an escalation, automatically, no judgment call required. Watch how quickly blocker theater closes when raising one costs something.

## Further reading

- Jason Yip, [*It's Not Just Standing Up: Patterns for Daily Standup Meetings*](https://martinfowler.com/articles/itsNotJustStandingUp.html) (martinfowler.com) — the definitive catalog of standup failure modes and repairs, including walking the board; most of what teams painfully rediscover is already written down here.
- Ken Schwaber & Jeff Sutherland, [*The Scrum Guide*](https://scrumguides.org/) — read the daily scrum section in its actual wording: it's for the developers, it's a planning event, and there is no mandated yesterday/today/blockers script. Most of the liturgy isn't in the source text.
- Kent Beck, [*Extreme Programming Explained*](https://www.amazon.com/s?k=extreme+programming+explained+kent+beck) — the stand-up meeting in its original habitat, embedded in a system of practices (pairing, shared space, continuous integration) that quietly did most of the synchronizing.
