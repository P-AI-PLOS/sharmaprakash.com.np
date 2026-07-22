---
title: "Working Backwards: The PR/FAQ and the Discipline of Narrative"
date: "2026-06-20T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Amazon's PR/FAQ gets described as 'write the press release first,' which makes it sound like a writing exercise. It isn't — it's a forcing function that makes you discover, before anyone builds anything, whether the finished thing would matter to anyone. Here's how it works, why the FAQ is the real document, and where the six-pager and SCQA fit around it."
use_featured_image: false
---

The best kill decision I've ever been part of took four pages and zero sprints. A platform team had been circling an internal developer portal for two quarters — everyone vaguely for it, nobody quite able to say what it was, headcount conversations already starting. Instead of a discovery phase, we wrote the press release: it's launch day, eighteen months from now, and here's the announcement. Customer quote, the problem it solved, why it mattered. The draft took a week of real arguing, and somewhere in draft three the thing became undeniable — the press release had no news in it. Every benefit we could honestly claim was something two existing tools already did, worded more excitedly. We killed the project in a document review, for the cost of a week of writing, instead of in a retro eighteen months later for the cost of a team.

That's Amazon's Working Backwards process doing exactly what it's for. It gets summarized as "write the press release first," which makes it sound like a copywriting exercise. The summary misses the mechanism: **it's a cheap simulation of the launch, run before the build, structured so that a product nobody would care about fails on paper** — where failure costs a rewrite — instead of failing in the market, where it costs the whole investment. [How that discipline has actually played out inside Amazon](/product-management/amazon-pr-faq-working-backwards-in-practice/), hits and misses both, gets its own post.

## The document: one page of PR, and the FAQ that does the real work

The format, as practiced at Amazon and documented by Bryar and Carr in *Working Backwards*: one page of press release — headline, the customer problem stated plainly, how the product solves it, a quote from a hypothetical customer describing their life after — followed by several pages of FAQ. The press release must be written in customer language; internal jargon, feature names, and architecture are contractually banned from page one, because the exercise only simulates a launch if it's written for the audience a launch would have.

Here's the part most adaptations get wrong: **the FAQ is the real document.** The press release is the bait; the FAQ is where the five hardest questions you're hoping nobody asks get asked in writing, by you, with your name on the answers. What does it cost and what will customers pay? What has to be true operationally? Why will people switch from what they do today? What's the hardest technical problem, and what if it doesn't yield? Which existing product does this cannibalize? A PR/FAQ whose FAQ is soft — all questions about naming and none about economics — is the tell that the team is running the format as theater. The internal-facing FAQ questions are, not coincidentally, the same four risks from [the discovery post](/product-management/discovery-and-customer-understanding/): value, usability, feasibility, viability — interrogated in prose before a line of code exists.

The other rule that carries more weight than it appears to: iterate the *document*, not the product. A PR/FAQ typically goes through five, ten drafts, each review sharpening the customer problem or killing a vague claim. That sounds slow until you price the alternative — every draft is a version of the product you didn't have to build to find out it was wrong.

## Why prose, specifically — the six-pager logic

The PR/FAQ inherits its power from a broader Amazon discipline: narrative memos instead of slide decks, read silently in the meeting's first twenty minutes. Bezos's argument for banning PowerPoint is the one I keep re-quoting, because it names something everyone has felt: bullet points let the author skip the connective tissue — the *because* and *therefore* between claims — and the audience fills the gaps with charitable assumptions. Full sentences don't allow the skip. A vague strategy survives beautifully as six bullets and dies visibly as six paragraphs, which is precisely [the fake-strategy detection problem from the strategy post](/product-management/strategy-formation-how-to-tell-a-real-strategy-from-a-wish/) solved with format instead of framework: prose is a kernel test you can't dodge.

For structuring that prose, the tool worth stealing from the consulting world is Barbara Minto's **SCQA**: Situation (the context everyone agrees on), Complication (what changed or broke), Question (the question the complication forces), Answer (your proposal). It's the pyramid principle's opening move, and it fixes the specific failure of most product documents I review — twelve paragraphs of answer with no complication, leaving the reader to guess why any of this matters now. SCQA is also the fastest *editing* tool I know: when a doc feels off, label its paragraphs S, C, Q, or A, and the diagnosis writes itself — usually two situations, no complication, and four competing answers.

Worth placing the PR/FAQ against its neighbors, because they're cousins, not competitors. The Shape Up **pitch** from [the delivery post](/product-management/the-strategy-cascade-turning-strategy-into-a-shippable-sequence/) is also a written case for a bet, but scoped to an appetite — weeks, not a product line — and argued to an internal betting table, not a simulated customer. The humble **one-pager** is the correct tool below even that. The instinct to protect is matching the document's weight to the bet's weight: a PR/FAQ for a two-week feature is bureaucracy; a one-pager for a new product line is negligence. And a PR/FAQ that survives its hostile review keeps paying downstream — it becomes [the backbone of the investor narrative](/product-management/presenting-the-roadmap-to-investors/) and [the first draft of the launch messaging](/product-management/marketing-the-roadmap/), which is the cheapest compounding I know of in product work.

## The failure modes

The first is **fiction-quality confusion**: the team that writes the most compelling press release wins resourcing, which quietly selects for writing talent over opportunity quality. Amazon's partial defense is the FAQ's hostile questions and reviewers trained to attack the numbers, not admire the prose — adaptations that import the press release without importing the hostile review import the pageantry and skip the mechanism.

The second is **write-once syndrome**. The PR/FAQ is a living document that should be re-read at each milestone — is this still the product we're building? Is the customer quote still plausible? Teams that write it, get funded, and file it have converted a simulation into a pitch deck, and the doc's predictions go permanently untested. The same rot pattern as every artifact in the series, with a twist: a stale PR/FAQ keeps *justifying* the project it originally described, long after the project has drifted into something the document never argued for.

The third is cultural, and it's the honest reason working backwards fails in most companies that try it: **silent reading time and hostile written review have to be paid for by executives.** If leadership won't sit and read for twenty minutes — if docs get skimmed live while the author narrates, which is a slide deck with extra steps — the narrative discipline collapses in a quarter, and what remains is engineers resentfully writing documents nobody reads. The format is cheap; the attention it demands is not, and the attention is the mechanism.

## Put it to work

1. **Write the press release for the thing you're already building.** One page, customer language, a plausible customer quote. If the honest version has no news in it — if the quote reads as "it's somewhat more convenient now" — you've learned something a roadmap review wasn't going to tell you, and it cost an afternoon.
2. **Draft the five questions you hope nobody asks.** For your current biggest bet, write the FAQ entries for the pricing question, the switching question, the cannibalization question, the hardest-technical-problem question, and the "why us" question — with real answers. The one you can't answer is your riskiest assumption, and [the risk post](/product-management/risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure/) says test that one first.
3. **Run SCQA on your last strategy doc.** Label every paragraph S, C, Q, or A. No complication means the doc never establishes why anything must change; multiple answers with no shared question means it's several proposals in a trench coat. Ten minutes, and it finds the structural problem faster than three rounds of comments.

## Further reading

- Colin Bryar & Bill Carr, [*Working Backwards*](https://www.amazon.com/s?k=working+backwards+bryar+carr) — the PR/FAQ and six-pager from two people who ran the process for years; the appendices include real document structures.
- Barbara Minto, [*The Pyramid Principle*](https://www.amazon.com/s?k=the+pyramid+principle+minto) — SCQA and the argument-structuring discipline; dry, and worth it.
- Bezos's 2004 internal memo banning PowerPoint, and the [2017 "high standards" shareholder letter](https://www.aboutamazon.com/news/company-news/2017-letter-to-shareholders) — the narrative-memo rationale in its original voice.
- Ryan Singer, [*Shape Up*](https://basecamp.com/shapeup) — the pitch chapter, for calibrating how much document a bet actually deserves.
