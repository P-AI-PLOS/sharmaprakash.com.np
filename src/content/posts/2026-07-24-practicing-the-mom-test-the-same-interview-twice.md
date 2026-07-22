---
title: "Practicing the Mom Test: The Same Interview, Twice"
date: "2026-07-04T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Reading The Mom Test takes two hours. Actually asking good questions under pressure takes practice nobody schedules. So here's the practice: one customer interview run twice — first the version that produced nothing but polite encouragement, then the rerun that killed the feature in twenty minutes — annotated line by line, with the drills I now use to train the reflex."
use_featured_image: false
---

I've recommended *The Mom Test* to more people than any other product book, and I've noticed a pattern in what happens next: they read it in a weekend, agree with every word, and then walk into their next customer call and ask "so, would this be useful to you?" within four minutes. Not because they didn't understand the book — because understanding a rule and having it available *under pressure, mid-conversation, while your idea is on the line* are different skills. The first comes from reading. The second only comes from practice, and nobody schedules practice for interviewing.

This post is the practice. I covered where the Mom Test sits in the discovery stack in [the discovery post](/product-management/discovery-and-customer-understanding/); here I want to do the thing the book can't do for you — walk through one real interview twice. The first version is reconstructed from my actual notes, from years ago, back when I thought I was validating. The second is how I'd run the same conversation today. The product context: we'd convinced ourselves that ops managers needed a tool that auto-generated weekly status reports from their project data, and I was "validating" it before we committed a quarter to building it.

## The rules, stated once

Fitzpatrick's whole book compresses to three rules, and you need them in your head before the transcripts make sense:

1. **Talk about their life, not your idea.** The moment they know what you're hoping to hear, the data is contaminated.
2. **Ask about specifics in the past, not opinions about the future.** "Would you" invites imagination; "when did you last" retrieves memory. Only one of those is evidence.
3. **Talk less, listen more.** Every sentence you speak about your idea is a sentence they'll spend being polite about.

Simple. Now watch me break all three in one call.

## Round one: the interview that validated everything and told me nothing

*Me:* "Thanks for making time! So — we're building a tool that automatically generates your weekly status report from your project data. You just review and hit send. Would something like that be useful to you?"

Broke rule one in the opening sentence. I've pitched, which means every answer from here on is a review of my idea, not a report on her life. And notice the question shape: *would it be useful* — a future hypothetical she can only answer with imagination and manners.

*Her:* "Oh — yeah, that sounds great actually. Reporting is such a pain."

This is a **compliment**, and compliments are the fool's gold of customer interviews. "Sounds great" costs her nothing and commits her to nothing. I wrote it down as a positive signal. It was the sound of a polite person being polite.

*Me:* "Right? And how much time do you think you'd save with something like this?"

A leading question about a hypothetical, aimed at generating a number for my slide deck. I wasn't even researching anymore; I was collecting ammunition.

*Her:* "Probably… a few hours a week? Reporting definitely eats a lot of time."

**Fluff** — a generic claim about her life in general. "A few hours," "definitely," "a lot." No specific week, no specific report, nothing checkable. Generic claims about the future and past feel like data, and they're closer to horoscope.

*Me:* "Amazing. And would you pay for something like this — say, per-seat pricing?"

*Her:* "I mean, if it worked well, sure. You should also add Slack integration — we live in Slack."

Two classic deflections in one breath: a hypothetical yes wrapped in the biggest escape hatch in English ("if it worked well"), and an **idea** — the feature request. I wrote "Slack integration — validated!" in my notes. What I should have written was: *she has now steered the conversation to a place where she doesn't have to talk about whether she'd actually use the core product.*

I did thirty minutes of this, with five different people, and every call "went great." We built the reporting tool. The pilot users generated a report in week one, tweaked it, sent it — and by week four almost nobody was using it. The truth had been available in every one of those interviews. I'd just never asked a question that could surface it. The same failure [sank Quibi, Juicero, and the Humane Pin](/product-management/quibi-juicero-humane-false-validation/); mine just cost a quarter instead of a few billion dollars.

## Round two: the same interview, rerun

Here's how I'd run that call now. Notice that the product doesn't get mentioned until the end — and barely then.

*Me:* "I'm trying to understand how status reporting actually works for ops teams — not pitching anything, just learning. Can you walk me through the last report you actually sent? Like, the literal most recent one."

Rule two, weaponized: *the last one*, not reporting in general. Specifics-in-the-past is a different retrieval mode — she's now describing an event that happened, not an attitude she holds.

*Her:* "Last Friday's, sure. Honestly it took me about twenty minutes? I have a doc template, I copy the numbers from the dashboard, add three bullets about risks, send it."

Twenty minutes. Round one's "a few hours a week" just met an actual data point and lost. This single answer is the feature's obituary, three minutes in — you cannot sell hours of savings to someone whose real cost is twenty minutes — but only if I don't flinch past it.

*Me:* "Twenty minutes — quicker than I expected. What's the annoying part, if any?"

*Her:* "The numbers part is easy. The annoying part is the risks section, because that means chasing two leads on Slack who never answer before Thursday night."

And there's the actual job. The pain isn't *writing* the report — it's *extracting status from humans*. My tool automated the part she finds easy and did nothing for the part she hates. In round one, "add Slack integration" was a feature request I transcribed; now I can see it was this exact pain, garbled through the lens of my pitch.

*Me:* "When that chasing gets really bad — what happens? Tell me about the worst one."

Asking for the worst case is asking for a story, and stories carry the details that generic questions flatten out.

*Her:* "Two months ago a risk sat unreported for three weeks because the lead kept saying 'I'll update you Friday.' It blew up in a client call. My director found out in the meeting itself. That was a bad week."

*Me:* "What did you try, after that?"

**The money question.** What they've *already tried* is the single most predictive thing you can ask, because it measures the problem in the only honest currency: effort already spent. Someone who's tried three fixes has a burning problem. Someone who's tried nothing has a mild irritation and, when you demo your product, excellent manners.

*Her:* "I set up a Friday-morning form for the leads. It worked for about three weeks, then they stopped filling it."

She built her own workaround. It failed at *adoption by her leads*, not at report-writing. If a product lives anywhere in this story, it's in nudging status out of reluctant humans — and any solution faces exactly the failure mode her homemade form already met. That's not discouraging; that's the most concretely useful sentence anyone said across both interviews.

*Me:* "This is genuinely useful. We're exploring tools in this space — as we get a prototype together, could I show you something rough and watch you tear it apart? And would it be crazy to loop in one of those two leads for the same session?"

Ending on **commitment and advancement** — the book's second half that readers consistently skip. A meeting that ends in "sounds great, keep me posted" has failed regardless of how good the vibes were; a meeting that ends with them giving up something that costs them — time on a calendar, reputation via an intro, eventually money — has told the truth. Asking her to spend a colleague's time is a real cost. Watch whether she pays it.

Same person. Same thirty minutes. Round one produced five compliments and a fake roadmap; round two produced a killed feature, a real problem, a failed-workaround case study, and a named next step. The difference was not charisma. It was question shape.

## The drills

Here's the actual practice part — the drills I use, and give to PMs I'm coaching. None needs a customer; the last one needs a colleague.

**1. The rewrite drill (10 minutes, do it today).** Take your last real interview notes — or your planned script — and find every question aimed at the future or at opinion: *would you use, do you think, how much would you pay, wouldn't it be great if.* Rewrite each to point at a specific past event: *when did you last, walk me through, what did you try, what happened next.* The mapping is mechanical and doing it ten times builds the reflex. Keep the before/after list; it becomes your personal cheat sheet.

**2. The deflect-and-dig drill.** The three contaminants each have a standard counter, and you want them loaded before you need them: a **compliment** ("that sounds great") gets deflected back to their life — "thanks — but ignore us entirely: how do you deal with this today?" **Fluff** ("we always, I usually, that's such a pain") gets anchored to an instance — "when did that last actually happen?" An **idea** ("you should add X") gets mined for the motivation underneath — "what would having X let you do?" Write the three counters on a sticky note for your next call. Yes, literally.

**3. The symbol habit.** In your notes, tag what you hear as you hear it: ★ excited, ☹ pain, ⚡ obstacle, 💰 money or budget mentioned, ☐ they committed to something, → asked for a follow-up. The tagging isn't for the archive — it's a live honesty meter. A page of notes with zero pain marks and zero commitments is a polite conversation, not evidence, and the symbols make that impossible to un-see while you're still in the room and can course-correct.

**4. The mock interview with a tripwire (30 minutes, needs a colleague).** Colleague plays a customer with a secret brief: *be polite, agree with everything, offer feature ideas — and only reveal the real, different underlying problem if asked about specific past events.* Your job is to find the real problem. Their job is to let your bad questions succeed — every hypothetical gets an enthusiastic yes. Most people pitch within three minutes of their first mock and never find the buried problem. That failure, experienced once in a safe room, teaches more than the book's every chapter.

**5. Score the recording.** For a real call (recorded with permission), tally four numbers afterward: percentage of the time you were talking (over ~30% is a pitch, not an interview), count of future/hypothetical questions asked, count of specific past events surfaced, and whether the call ended in a real commitment or a compliment. Four numbers, thirty seconds. Trend them across five calls and you'll watch yourself get honest.

## Put it to work

1. **Run the rewrite drill on your very next scheduled call** — before it happens. Every planned question pointed at the future gets rewritten to the past. Bring the sticky note with the three deflection counters.
2. **Book one mock interview this week.** Give your colleague the tripwire brief above. Debrief with the scorecard. It's the highest ratio of learning to embarrassment available in product work — the embarrassment is real, and it's the point.
3. **Re-audit one "validated" idea.** Pick something on [your roadmap](/product-management/building-a-roadmap-you-can-defend/) that was validated by enthusiasm, and ask the two questions round one never asked: *when did this problem last actually happen to a specific person we talked to, and what had they already tried?* If nobody has answers, the validation was a stack of compliments — better to find out now, in a doc, than in week four of the usage data.

## Further reading

- Rob Fitzpatrick, [*The Mom Test*](https://www.amazon.com/s?k=the+mom+test+fitzpatrick) — read it *after* trying the drills once; the chapters on commitment and keeping it casual land differently once you've felt the failure modes.
- Teresa Torres, [*Continuous Discovery Habits*](https://www.amazon.com/s?k=continuous+discovery+habits+torres) — for making these interviews a weekly habit instead of a pre-build ritual, and for where the answers go (the opportunity tree) once you're asking good questions.
- Steve Portigal, [*Interviewing Users*](https://www.amazon.com/s?k=interviewing+users+portigal) — the professional-researcher's craft layer: rapport, silence, and follow-ups, once the Mom Test has fixed your question shapes.
