---
title: "Sonos Shipped the Date, Not the App"
date: "2026-08-19T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "In May 2024, Sonos replaced its app with a ground-up rewrite that shipped without alarms, sleep timers, and accessibility features, reportedly to hit the launch window for its first headphones. The invoice arrived on a schedule: a public CEO apology in July, around 100 layoffs and a $20–30 million remediation estimate in August, a 16% revenue drop in the SEC-filed fourth quarter, and the CEO's exit on January 13, 2025. The freshest, best-documented case of an organization shipping the deadline instead of the product."
use_featured_image: false
---

In May 2024, Sonos pushed an update that turned its own customers into beta testers of a product they had already paid for. The new app was a ground-up rewrite of the software that controls every Sonos speaker in the world, and it shipped missing things nobody would call edge cases: alarms, sleep timers, local music library playback, and accessibility features that blind users depended on to operate hardware sitting in their own homes. Systems that had worked for years stopped working overnight. There was no opt-out and no rollback. If you owned Sonos speakers, you got the rewrite, ready or not, and the rewrite was not ready.

What makes this story worth telling is not that a company shipped buggy software. Everyone ships buggy software. It's that the timeline afterward is so clean, so well documented, that you can watch the cost of a single scheduling decision propagate through an entire company in public: apology, layoffs, remediation budget, SEC-filed revenue decline, and finally the CEO's job. Most "shipped too early" stories are folklore by the time we tell them. This one comes with an earnings press release.

## Why would anyone ship an app missing alarms?

Start with the question every Sonos customer asked that month, because the answer is the whole post. Nobody at Sonos believed alarms were unimportant. Nobody looked at the accessibility features and decided blind users didn't matter. The rewrite itself was a defensible engineering call: the old app carried years of accumulated architecture, and at some point you rebuild the foundation or it rebuilds you.

The problem was the date. Sonos was preparing to launch the Ace, its first headphones, a new category for the company, and the new app was reportedly required infrastructure for that launch. I say reportedly with intent. Sonos never stood up and said "we shipped early to hit the Ace window." That motive comes from press reporting and from the timeline speaking for itself, not from an admission, and honest storytelling keeps that distinction visible. But whatever the internal reasoning, the observable decision is not in dispute: faced with a rewrite that wasn't feature-complete and a launch window that wasn't moving, Sonos shipped the window.

This is the exact fork in the road I wrote about in [the Cyberpunk 2077 post](/product-management/the-deadline-that-moved-three-times/), approached from the other branch. CD Projekt Red moved its date three times and refused to move anything else, and the post asked what defending a plan costs. Sonos didn't move the date at all. It held the date and moved the definition of done instead. Two organizations, same triangle of scope, quality, and time, and between them they demonstrate both of the bad resolutions: pay in crunch and broken promises to protect the date, or pay in shipped brokenness to protect it. The variable that never gets touched, in either story, is the date itself once something commercial is bolted to it. A headphone launch is a marketing campaign, retail commitments, and a revenue line in guidance. An app that can't set an alarm is just a bug list. Guess which one bends.

## What did holding the date actually cost?

Here the record gets unusually good, because the costs arrived on a schedule you can put in a table.

**July 2024:** CEO Patrick Spence published a public apology. Read that again in context: the chief executive of a hardware company apologizing, in writing, for a software update. Companies do not do this for ordinary bugs. They do it when the support queue, the press coverage, and the community anger have crossed a line where silence is more expensive than the admission.

**August 2024:** roughly 100 layoffs, delayed product launches, and a public commitment to fixing the app, with remediation guidance in the range of $20 to 30 million. A note on that number, because a larger one circulates. You will find "$100 million disaster" attached to this story in aggregator posts and conference slides. I can't trace that figure to anything Sonos filed or stated; the company's own remediation guidance was $20 to 30 million, and that's the number I'll stand behind. Twenty to thirty million dollars to fix a launch is damning enough without inflation. When a story is this good, the temptation to round up is exactly the tell that you're reading a meme instead of a source.

**Fiscal Q4 2024:** revenue down 16% year over year, in an earnings press release filed with the SEC. This is the number that elevates the story from anecdote to evidence. Customer-trust damage is usually invisible; it hides in churn curves and NPS decks nobody outside the company sees. Here it surfaced in a regulatory filing. People who would have bought another speaker didn't. People mid-purchase read the reviews and stopped. The install base, the thing two decades of good products had built, had become the distribution channel for the company's worst release, and the filing priced it.

**January 13, 2025:** Patrick Spence was out as CEO. Eight months, start to finish, from the update to the top of the org chart.

I want to be careful with the last entry, the way I was careful with the motive. CEO departures are overdetermined; boards weigh many things. But when a chief executive leaves eight months after the most public product failure in company history, having personally signed the apology for it, the sequence tells you what the board concluded about where accountability for a shipping decision ultimately lives. Not with the engineers who flagged the gaps. With whoever had the authority to move the date and didn't.

## Hadn't we already run this experiment in public?

Eleven years earlier, almost beat for beat. On October 1, 2013, healthcare.gov launched on a date fixed by statute and politics, the hardest kind of immovable. The site was built to an assumed load that turned out to be a fifth of reality: it fell over at around 250,000 concurrent users, five times what had been planned for. On day one, six people completed enrollment. Six, nationally, and that number held up under PolitiFact's verification, which is more than most numbers from that news cycle can say.

Then the second half, which matters just as much: a small rescue team fixed roughly 400 defects in about six weeks, and by December the site had handled 975,000 users in a single day. The system wasn't impossible to build. It was impossible to build *by October 1 at the quality the launch implied*, and rather than surface that sentence to anyone empowered to act on it, the program treated the date as the deliverable and working software as a follow-up release. Which is precisely the Sonos arithmetic in public-sector form, and it rhymes with [the FBI's Sentinel program](/product-management/fbi-sentinel-working-software/) too: in all three cases the artifacts that got managed, status reports, launch events, announced windows, were documents about the software, and reality only got a vote when actual users touched the actual system. The six-week turnaround is the damning part, not the crash. It proves the gap was weeks wide. An organization that could have said "we need until December" instead said nothing, shipped October 1, and let the American public run the load test.

## What is a launch date, actually?

Here's the reframe I keep coming back to, and it's the reason this story closes the loop the Cyberpunk post opened. A launch date is a hypothesis: *we believe the product will meet its bar by this day.* Treated as a hypothesis, new information updates it, the way [the manifesto's fourth value](/product-management/the-agile-manifesto-four-values-twelve-principles/) asks, responding to change over following a plan. But the moment a date acquires commercial machinery, a headphone launch, an open-enrollment statute, an E3 trailer, it stops being a hypothesis inside the organization and becomes a fact that the product is expected to conform to. The engineers keep generating evidence that the hypothesis is failing. The organization keeps filing that evidence under "risks to the date" instead of "information about the truth."

And notice what Sonos actually shipped when it shipped the date: nothing. The date is not a deliverable. Customers cannot set an alarm with a launch window. The only thing that transferred any value on May 7, 2024 was the software, and the software wasn't done, so what customers received was the gap between the announcement and the product, delivered directly into their living rooms. Cyberpunk asked what it costs to defend the plan; Sonos answers what it costs to execute it anyway. Trust first, then revenue, then, eventually, the job of the person who chose the date over the product. The invoice always arrives. The only choice an organization gets is whether to pay it before launch, in the currency of an awkward delay announcement, or after, in the currency Sonos paid.

## Put it to work

1. **Write down what your next launch date is load-bearing for.** The Ace window bent the app because the date carried a product launch and the app carried only a bug list. Before your next fixed date, list what's commercially attached to it, and then list what will be asked to bend to protect it. If the second list contains "quality" or "scope the customer already depends on," you've found your Sonos risk while it's still cheap to name.
2. **Define a rollback before you define a launch.** Sonos shipped a forced, irreversible migration of its entire install base in one motion. Any release that replaces something customers rely on needs an answer to "how do they get the old thing back" before it needs a date. If the honest answer is "they can't," your quality bar just became your only safety net, and it should be priced accordingly.
3. **Ask the six-enrollments question in your launch review.** Healthcare.gov's planners knew a number, 50,000 concurrent users, that reality quintupled. For your launch, ask: what's the assumption that, if wrong by 5x, produces our day-one disaster, and who has actually tested it at that multiple? A launch review that only rehearses the success case isn't a review; it's a countdown.

## Further reading

- [Sonos, fiscal Q4 2024 earnings press release](https://www.sec.gov/Archives/edgar/data/1314727/000131472724000023/final4q24earningspressrele.htm) (SEC EDGAR) — the primary document for the 16% revenue decline; the rare product-management case study with a regulatory filing attached.
- Patrick Spence's July 2024 public apology letter — worth reading as an artifact: what a CEO admits, and doesn't, when the shipping decision has already been made and the bill is arriving.
- [PolitiFact's verification of healthcare.gov's day-one enrollment figures](https://www.politifact.com/factchecks/2013/nov/03/jan-crawford/cbss-crawford-says-6-people-signed-obamacares-firs/) — the sourcing behind "six enrollments," and a model for how to check a too-good-to-be-true number before repeating it.
- [The Agile Manifesto](https://agilemanifesto.org/) (2001) — reread the fourth value after this story; "responding to change over following a plan" is exactly the sentence both Sonos and healthcare.gov declined to act on.
