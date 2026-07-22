---
title: "Watch What They Do: Segment, Superhuman, and Discovery That Worked"
date: "2025-07-07T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Segment's founders built a classroom tool that professors loved — until Peter Reinhardt watched students open Facebook the moment lectures got boring, and offered all eight investors their money back. Superhuman's Rahul Vohra took the opposite route: he turned the fuzzy question 'do people want this?' into a single segmentable number and moved it from 22% to 58% in a year. Two very different shapes of discovery, one shared principle: behavior, not opinion, is the input to strategy."
use_featured_image: false
series: product-stories
seriesOrder: 8
---

The most valuable customer interview in Segment's history wasn't an interview. It was Peter Reinhardt sitting in the back of a university lecture hall, watching what students did with the product he'd built for them.

The product was ClassMetric — a tool that let students signal confusion in real time so lecturers could adjust on the fly. And the stated-opinion signal was excellent: professors said yes, they wanted it, they'd use it. The team had validation in the sense that most teams mean the word — enthusiastic people telling them the idea was good. Then Reinhardt watched a live classroom, and by his own recollection, the moment the lecture got dull, the students didn't open ClassMetric. They opened Facebook. The tool built to capture wandering attention lost, in its very first real test, to the thing attention actually wanders to.

Most founders would have logged that as an adoption problem and scheduled more professor meetings. What Reinhardt's team did instead is the whole reason this post exists: they believed the behavior over the opinion, at full price, immediately. That reflex — and a very different, more engineered version of it at Superhuman — is what discovery looks like when it actually works.

## The yes that meant nothing, and the founder who noticed

Everything about ClassMetric's validation was real except the part that mattered. The professors weren't lying. They genuinely thought a confusion-meter for lectures sounded useful — the same way everyone in [a badly run customer interview](/product-management/practicing-the-mom-test-the-same-interview-twice/) genuinely thinks your idea sounds useful. But professors weren't the users whose behavior had to change. Students were, and students had already voted with the only ballot that counts: what they did when nobody was pitching them.

What I find remarkable isn't that the signal existed — negative signals exist on almost every doomed product, usually in plain sight. It's what the team did with it. Reinhardt went to all eight of Segment's investors and offered their money back. Two of them took it. Sit with that for a second, because it's the least imitated move in this entire story. Returning capital is the founder-behavior equivalent of the students opening Facebook: an action, not a statement, that reveals what someone truly believes. Reinhardt was saying, with money, that the validation had been worthless and he knew it. Most of us, faced with the same evidence, write a deck about pivoting to enterprise.

There's a hierarchy hiding in this episode that I keep coming back to. Stated opinion from the wrong people (professors) sits at the bottom. Stated opinion from the right people is better but still cheap. Observed behavior from the right people — students, in a real lecture, with real boredom — is the only tier that predicted anything. The [discovery frameworks I use](/product-management/discovery-and-customer-understanding/) are mostly machinery for climbing that hierarchy on purpose. Segment's founders climbed it by accident, in one afternoon, and had the honesty not to climb back down.

## The hail mary that was secretly a perfect experiment

By late 2012 the team was nearly out of money and out of ideas. What they had left was a small internal library — analytics.js, a piece of plumbing that let a website send its data to multiple analytics tools through one integration. The founders were split on whether it was even a product; it was a utility they'd built for themselves. In December 2012, as close to a last resort as it gets, they open-sourced it.

The market's response answered the question the team couldn't answer from inside the building. Developers didn't politely say the library sounded useful. They adopted it, shared it, and started asking for more — behavior again, arriving unsolicited, from strangers with no reason to be kind. Reinhardt has told this story consistently over the years, on the YC blog and elsewhere, and the shape of it is what matters: the demand was *pulled out of them* rather than pushed by them. Nobody had to be convinced. The company that became Segment was essentially the commercial wrapper around a thing the market had already grabbed with both hands. Twilio acquired it in late 2020 for $3.2 billion.

I want to be careful with the lesson here, because "open-source something as a hail mary" is not it. The lesson is that the open-sourcing functioned as a behavioral test with zero politeness in the loop. A landing page can be inflated by curiosity. An interview can be inflated by manners. But a developer integrating your library into their production site is paying a real cost for a real benefit, and costs paid are the one signal that can't be faked by niceness. Segment's discovery worked *both* times — once when behavior killed a product, once when behavior revealed one. The team's contribution was refusing, both times, to argue with what they saw.

## Turning "do people want this?" into a number you can move

Superhuman's story is the same principle wearing the opposite outfit. Where Segment's discovery was raw observation and brutal honesty, Rahul Vohra's was engineered — a measurement system built deliberately, from a principle, because the fuzzy version of the question was useless to him.

The fuzzy version is the one every founder asks: do people want this? Vohra's move was to operationalize it using Sean Ellis's benchmark question — *how would you feel if you could no longer use the product?* — and Ellis's threshold: products where at least 40% of users answer "very disappointed" tend to have found real product/market fit. When Superhuman first ran the survey, they scored 22%. Not a vibe, not a board-meeting adjective. A number, below a bar, with a gap you could measure.

Notice what that transformation buys you. "Do people want this?" invites exactly the polite, unfalsifiable answers that sank ClassMetric's professors' credibility. "What percentage of users would be very disappointed to lose us?" is a leading indicator you can segment, track quarterly, and hold a roadmap accountable to. It's the difference between asking the market for its opinion and instrumenting the market's attachment. The answer to the survey is still *stated*, technically — but it's stated by people describing their own dependence on a product they already use, which is about as close as a question can get to behavior. It's cousin to the Mom Test's core rule: anchor everything in the respondent's actual life, not your idea's imagined future.

## Splitting the roadmap between the lovers and the persuadables

The survey alone would have been trivia. What made it an engine was what Vohra did next: he segmented the responses and let the segments write the roadmap.

The users who answered "very disappointed" — the lovers — were analyzed for what they loved, so the product could double down on it. The "somewhat disappointed" group was split further: those who could be won over if a specific gap were closed — the persuadables — versus those who were never going to be the right customer and could be politely ignored. Then the roadmap was allocated roughly 50/50: half the effort deepening what the lovers already valued, half closing the gaps holding the persuadables back. Ignore the detractors entirely.

That allocation is the quietly radical part. Most teams under pressure spend nearly everything chasing the skeptics — the loudest complaints, the churned accounts, the prospect who wants one more feature. Vohra's split encodes a discipline: your strongest signal comes from the people already getting value, and your best growth comes from the near-misses, not the never-wases. Over roughly a year of running this loop — survey, segment, build, re-survey — Superhuman's score moved from 22% to 33% to 47% to 56% to 58%. Those numbers are self-reported, and the fair reading keeps that in mind; but Vohra published the full methodology in First Round Review, which is more than most growth stories ever offer, and the company went on to roughly $35 million in ARR (per The Information) before Grammarly acquired it in July 2025.

## Two shapes, one principle

Set these two next to the failures in [Quibi, Juicero, and Humane](/product-management/quibi-juicero-humane-false-validation/) and the contrast is almost embarrassingly clean. Quibi had projections, focus-group enthusiasm, and $1.75 billion of stated confidence; what it never had was evidence of the behavior it needed — people choosing to pay for short premium video on phones. Juicero's value proposition could be falsified by a thirty-second squeeze test that nobody inside the company ran, or wanted to run. Both companies treated opinion — their own and their supporters' — as the input to strategy, and treated behavior as a launch-day surprise.

Segment and Superhuman inverted that. Segment let observed behavior kill one product and select another, and honored the negative signal at maximum cost — money returned, egos overruled. Superhuman refused to trust opinion in its raw form and built a machine that converted attachment into a segmentable, moveable number. Different shapes entirely: one is a founder trusting his eyes in a lecture hall, the other is a founder distrusting everyone's mouth and instrumenting around it. Same principle underneath: **user behavior, not stated opinion, is the input to strategy.**

That underneath-ness is the real takeaway, and it's why I'd point you at [the case for putting frameworks down](/product-management/principle-first-when-to-put-the-frameworks-down/) as this post's companion. Vohra didn't adopt the Sean Ellis test because it was trending; he reached for it because he'd already internalized the principle and needed an instrument for it. The framework was *earned from* the principle. Run the same survey as a ritual — score it once, screenshot the number, never segment, never re-survey — and you'll get Quibi's outcome with Superhuman's spreadsheet. Reinhardt, meanwhile, used no framework at all and did better discovery in one lecture hall than most research programs manage in a quarter, because he had the principle and the nerve to obey it. Frameworks are how you scale a principle you already hold. They are not a substitute for holding it.

## Put it to work

1. **Find your Facebook-in-the-lecture-hall moment.** For your riskiest current bet, name the behavior — not the opinion — that would prove demand, then go watch for it where it would naturally occur: session recordings, trial usage in week two, what users do when your product is optional. If all your evidence is people telling you things, you have ClassMetric's professors, not validation.
2. **Run the 40% test on your existing product, then actually segment it.** Ask active users how disappointed they'd be to lose you. The score matters less than the split: list what the "very disappointed" group loves and what would convert the persuadable half of the "somewhat" group — and check what fraction of your current roadmap serves either. If most of it serves neither, your roadmap is answering to opinions.
3. **Decide your money-back threshold in advance.** Write down, before the next quarter starts, what observed behavior would make you kill or fundamentally redirect the initiative — and what honoring that signal would cost. Reinhardt's offer worked because the trigger was the evidence, not his mood. A kill criterion you define after seeing the data isn't a criterion; it's a negotiation with yourself you'll always win.

## Further reading

- [Peter Reinhardt on finding product/market fit at Segment](https://blog.ycombinator.com/peter-reinhardt-on-finding-product-market-fit-at-segment/) (Y Combinator blog) — the ClassMetric story, the money-back offer, and the analytics.js hail mary, told firsthand.
- Rahul Vohra, "[How Superhuman Built an Engine to Find Product/Market Fit](https://review.firstround.com/how-superhuman-built-an-engine-to-find-product-market-fit/)" (First Round Review) — the full published methodology behind the 22%→58% arc, worth reading before you run the survey yourself.
- Rob Fitzpatrick, [*The Mom Test*](https://www.amazon.com/s?k=the+mom+test+fitzpatrick) — the interviewing discipline for climbing from stated opinion toward evidence when you can't directly observe behavior.
- Teresa Torres, [*Continuous Discovery Habits*](https://www.amazon.com/s?k=continuous+discovery+habits+torres) — the cadence that makes behavioral evidence a weekly input instead of a one-time hail mary.
