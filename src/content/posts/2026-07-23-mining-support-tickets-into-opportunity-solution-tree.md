---
title: "Mining Support Tickets into the Opportunity Solution Tree, Not Just a Bug Queue"
date: "2026-07-23T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A support team closing 200 tickets a week while the product team builds features nobody asked for is not a resource problem — it's a signal-routing problem, and the fix is a two-hour extraction pass that turns the support inbox into the richest discovery input your team has."
use_featured_image: false
---

On a Tuesday morning in March, I sat in the product team's weekly roadmap meeting while the support lead presented a spreadsheet. Two hundred and twelve tickets closed last week. Mean time to resolution: under four hours. Customer satisfaction on the resolution: 4.2 out of 5. The numbers were good — the support team was genuinely excellent — and the product team nodded politely and moved on to the feature discussion.

I asked, after the update, whether anyone had read the tickets. Not the metrics. The tickets. The actual text customers wrote when they explained what was broken, what confused them, what they were trying to do that the product couldn't do. The support lead said she read every one. I asked whether the product team had read any. Nobody had. I asked whether the support team had surfaced any patterns — recurring themes, workarounds customers described, needs that no ticket category covered. The support lead said she had a mental list but hadn't written it down. Two hundred and twelve customer-voiced struggles, compressed into a satisfaction number, and then forgotten.

That gap — between the support team's pattern recognition and the product team's discovery input — is the most expensive signal-routing failure I've found in product organizations. It isn't that the signals don't exist. They exist in abundance: every support ticket is a customer describing a moment where the product failed them, and in that description is the raw material for discovery. It isn't that the support team doesn't care. They care so much they close the tickets in under four hours. It's that the signals get trapped in the support workflow, optimized for resolution speed rather than product learning, and the product team never sees them as anything other than a queue to clear.

The fix isn't a new tool. It's a practice: **a weekly extraction pass that pulls opportunity-level insights out of the support inbox and feeds them into an [opportunity solution tree](/product-management/opportunity-solution-trees-the-shape-of-good-discovery/).** The practice costs about two hours a week, and it turns the support team from a cost center into the product team's most reliable source of discovery signal.

## Why support tickets are discovery gold

Teresa Torres makes the case that continuous discovery requires a weekly cadence of customer contact. Most teams interpret "customer contact" as "customer interviews," which is correct but incomplete. The support inbox is a form of customer contact that's already happening, already scaled, and already captured in writing. Every ticket is a customer describing a struggling moment — a moment where the product failed to do what they needed — in their own words. That's the exact raw material the [opportunity space](/product-management/finding-opportunities-interviews-jtbd-and-the-opportunity-space/) is built from.

The difference between a support ticket and an interview is that the ticket is compressed. The customer doesn't walk you through the full context the way [a story-based interview](/product-management/finding-opportunities-interviews-jtbd-and-the-opportunity-space/) does. They describe the symptom, not the struggle. They propose a fix, not a need. "The export button doesn't work" is a bug report. Underneath it is an opportunity — "I need to get this data out of your product so I can do my job in the tool my company actually uses" — and the opportunity is the thing the product team should be learning from, not the bug.

The extraction pass is the discipline of getting from the bug report to the opportunity. It's not automatic, and it isn't something you can hand to an intern and expect quality. It requires the product team to read tickets with a specific lens: not "is this a bug or a feature request?" but "what was the customer trying to do, and what stopped them?" That lens is the JTBD reframing — the [Mom Test discipline](/product-management/practicing-the-mom-test-the-same-interview-twice/) applied to written complaints instead of spoken conversations.

## The three-level extraction

Here's the pass as I run it, and I want to be concrete because the difference between "read tickets" and "extract signal from tickets" is the difference between a vague aspiration and a repeatable practice.

**Level one: cluster by theme.** Pull the week's tickets — most help desks export CSV or have an API — and group them by the problem underneath, not by the symptom on the surface. "Export button broken" and "CSV download is empty" and "can't get data out for my report" are three tickets that are the same opportunity. Clustering by theme rather than by ticket count is the first filter that makes volume manageable. A hundred tickets might collapse into fifteen to twenty distinct themes, and those themes are the raw material for the next level.

**Level two: extract the verbatim opportunity.** For each theme, write the opportunity in the customer's own words. Not "users need better export functionality" — that's already a solution smuggled into the evidence. The customer's words: "I need to get this data into the spreadsheet I share with my manager, because that's how she reviews my work." That sentence is the opportunity. It lives in the customer's world, it would exist if your product didn't, and it's the input to [the opportunity layer of the tree](/product-management/opportunity-solution-trees-the-shape-of-good-discovery/).

The discipline here is the same one the [continuous discovery series](/product-management/finding-opportunities-interviews-jtbd-and-the-opportunity-space/) drills for interviews: opportunities go in customer language, solutions go in product language, and you must not confuse the two. A support ticket's natural language is already solution-tinged — customers describe what they wanted the product to do, not what they needed — so the extraction pass includes a decompression step. "The export button is broken" decompresses to "I need to move data from your product into a tool my company already uses," which is an opportunity your product can address in ways far more interesting than fixing a button.

**Level three: attach to the tree.** Each extracted opportunity gets placed on the existing opportunity solution tree, either under an existing branch or as a new branch if the theme is genuinely new. This is where the support signal meets the [discovery signal from interviews](/product-management/running-discovery-sessions-recruiting-outreach-and-no-shows/) — the tree doesn't care whether an opportunity came from a weekly interview or a support ticket, it only cares that the opportunity has evidence behind it. Support tickets carry a different kind of evidence than interviews: they carry frequency (how many people hit this) and they carry frustration intensity (the language people use when things break for them), which are both valuable for opportunity sizing.

The output of the three-level pass is a set of signal cards — one per distinct theme — with the customer's verbatim words, the decompressed opportunity, the count of tickets behind it, and a pointer to where it sits on the tree. These cards are the support team's contribution to discovery, and they're the artifact that makes the two-hour weekly investment visible and valuable.

## The support team as discovery partner

The extraction pass doesn't work if the product team does it alone. Two hours of the PM reading tickets is two hours of the PM applying their own lens to compressed customer language, and the PM's lens is shaped by the product they already know — which means they'll read the tickets through the product's vocabulary rather than the customer's. The result is opportunities that sound like feature requests with better grammar.

The fix is to make the support team a partner in the extraction, not a data source. In practice this means one thing: **a weekly thirty-minute session where the support lead walks the product team through the week's patterns, and the product team asks decompression questions.** Not a formal meeting — the support lead already has the mental list of patterns. The product team's job is to ask "what were these people actually trying to do?" and to capture the answers in customer words.

This session does two things the spreadsheet update never did. First, it transfers the support team's pattern recognition — the support lead's intuition that "I keep seeing the same three frustrations" — into an artifact the product team can use. Second, it gives the support team the experience of seeing their observations turn into tree branches, which is the feedback loop that makes them pay attention to opportunities instead of just closing tickets. I've watched support leads go from "I just answer tickets" to "I'm tracking four recurring themes that I think map to two opportunities on the tree" within a month of these sessions. The shift is small and real, and it turns the support function from a cost center into a discovery input.

The mechanics matter. The support lead brings three things to the session: the week's ticket themes (already clustered, because support teams naturally cluster), the single best verbatim per theme (the quote that captures the frustration most precisely), and their sense of which themes are growing versus stable. The product team brings the current tree and the decompression questions. The session produces signal cards and a quick re-rank of the opportunity space if the week's patterns moved anything.

One failure mode to name: **the support team starts filtering what they bring.** If the support lead learns that certain themes lead to "we're already working on it" responses, they stop surfacing those themes — not out of malice, but because nobody likes presenting problems that are already solved. The fix is to explicitly ask for everything, including the themes the product team has already addressed. The reason: a theme the product team thinks it addressed that keeps appearing in tickets is either a bug in the fix or a misread of the original opportunity, and both are worth knowing. The session must be safe for the support team to bring bad news — including "that thing you shipped isn't working" — or the signal degrades to the same polite yes the [Mom Test](/product-management/practicing-the-mom-test-the-same-interview-twice/) was built to prevent.

## The decompression technique: from ticket to opportunity

The hardest part of the extraction pass isn't the clustering or the session. It's the decompression — turning the customer's proposed solution into the need underneath. Here's the technique I use, shown on real support tickets from a B2B SaaS I worked with, anonymized and generalized.

**Ticket 1: "Can you add a dark mode?"**

Decompression: what would dark mode let you do? The customer works late — after 9pm, the bright interface hurts their eyes. The opportunity isn't "dark mode." The opportunity is: "I use this product for hours at night and the interface makes it physically uncomfortable." Dark mode is one solution. Another is a "night hours" toggle that only adjusts the contrast after 8pm. Another is an API-first workflow that lets the customer build a script and never open the UI at night at all. The opportunity is broader than the request, and the broader opportunity opens more solution space.

**Ticket 2: "Your API returns 500 errors when I send more than 1,000 records."**

Decompression: the customer is building a data pipeline that pushes records from their system into yours. They're hitting a limit at 1,000 records. The opportunity isn't "fix the 500 error." The opportunity is: "I need to sync large volumes of data between your product and my system without manual work." That opportunity has three possible solutions: fix the API limit, build a bulk import feature, or offer a webhook that lets the customer push records in real time rather than in batches. The ticket proposed a fix. The opportunity suggests a design space.

**Ticket 3: "I exported my contacts but the CSV doesn't include the 'last contact date' column."**

Decompression: the customer exported contacts to build a "who am I neglecting?" report — a manual version of the relationship-tracking the product is supposed to provide. The opportunity is: "I want to notice which relationships are going cold before they're gone." This is identical to an opportunity from the [Donut CRM case](/product-management/opportunity-solution-trees-the-shape-of-good-discovery/) — "let me export my contacts to CSV" decompressed into the same need. When a support ticket and an interview converge on the same opportunity, that's the strongest signal the tree can receive: the need is real, it's frequent, and it manifests across different customer contact channels.

The decompression question that does the most work is deceptively simple: **"What would that let you do?"** Asked once for each ticket theme, it pulls the customer out of their proposed solution and into their actual need. It's the same question Torres recommends for decompressing feature requests in [interviews](/product-management/finding-opportunities-interviews-jtbd-and-the-opportunity-space/), applied to written complaints instead of spoken ones. The discipline is the same: the customer knows their problem and your product's possibility space poorly, so their proposed solution is rarely the best one. Your job is to get from the answer to the question underneath.

## Feeding the tree without drowning it

The risk of a new signal source is signal flood. If the support team surfaces fifteen themes a week and the product team dutifully adds all fifteen to the tree, the opportunity space grows faster than the team can address it, and the tree becomes a graveyard of unactionable branches. The tree's value is its focus — [one target opportunity at a time](/product-management/opportunity-solution-trees-the-shape-of-good-discovery/) — and the extraction pass must preserve that focus.

The discipline I use: **support themes enter the tree as evidence on existing branches, not as new branches, unless the theme genuinely represents a need nobody has identified.** Most support themes map to opportunities the tree already knows about — the export need, the integration need, the trust-in-AI need. When a theme maps to an existing branch, it strengthens the evidence count on that branch and potentially moves it up in priority. It doesn't create new tree surface area. Only genuinely new themes — ones that don't decompress into any existing opportunity — become new branches, and even then they enter as thin branches marked for validation, not as prioritized targets.

The weekly digest format from [the signal pipeline](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/) works well here. Each week's extraction produces a short digest: number of tickets processed, themes identified, verbatims attached, and — critically — whether any theme contradicts what the team currently believes. The "contradicts" section is the highest-value part of the digest, because a support theme that challenges an existing assumption is the one most likely to change the roadmap. A theme that confirms what you already know is useful but not urgent. A theme that says "customers keep hitting this problem and we thought we'd solved it" is the one to act on.

One more discipline: **the support team's metrics should include a discovery metric, not just a resolution metric.** "Number of themes surfaced for the product team" is a metric the support lead can own, and it gives the support function a visible contribution to product direction beyond ticket closure. I've watched this single metric change the support team's relationship with the product team from adversarial ("you build it, we deal with the fallout") to collaborative ("we see patterns you don't, and here they are").

## The two-hour weekly investment

Here's the actual calendar commitment, week by week, once the practice is running:

**Monday, 30 minutes: support lead clusters the week's tickets.** Themes, not individual tickets. Verbatim per theme. Growing-or-stable flag. This is the support lead's existing work — they already do this mentally — turned into a document.

**Tuesday, 30 minutes: product team + support lead decompression session.** Walk the themes. Ask "what were they actually trying to do?" Capture opportunities in customer language. Place each on the tree or flag as new.

**Tuesday, 60 minutes: PM writes signal cards and updates the digest.** One card per theme, frontmatter included, verbatim sacred. Attach to tree branches. Write the week's digest with the "contradicts" section. File the cards in the [signal directory](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/).

Total: two hours. The return, within a quarter, is a discovery input that runs alongside interviews, costs nothing in customer recruiting, and produces evidence that's already in the building. The support team becomes the product team's eyes on the problems that customers are living with right now — not the problems they remember from an interview three weeks ago, but the problems they wrote about when they were actively frustrated, in the moment, with no reason to be polite.

That moment — the customer who is actively frustrated and has no reason to be polite — is the raw material the [Mom Test](/product-management/practicing-the-mom-test-the-same-interview-twice/) tries to manufacture in interviews. Support tickets already have it. The extraction pass is just the discipline of recognizing what's there.

## Further reading

- [Opportunity Solution Trees](/product-management/opportunity-solution-trees-the-shape-of-good-discovery/) — the tree that support signal feeds into; the decompression technique is the same one used for feature requests in interviews.
- [Finding Opportunities: Interviews, JTBD, and the Opportunity Space](/product-management/finding-opportunities-interviews-jtbd-and-the-opportunity-space/) — the opportunity-space discipline that keeps support themes from becoming feature requests with better formatting.
- [The Signal Pipeline](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/) — the signal-card format and weekly digest rhythm this extraction pass plugs into.
- [Making Discovery a Habit](/product-management/making-discovery-a-habit-cdh-alongside-shape-up-okrs-and-agile/) — where the support extraction session sits in the weekly discovery cadence alongside interviews and assumption tests.
- [Practicing the Mom Test: The Same Interview Twice](/product-management/practicing-the-mom-test-the-same-interview-twice/) — the decompression discipline, applied to spoken conversations; the ticket extraction pass is the same technique applied to written ones.
