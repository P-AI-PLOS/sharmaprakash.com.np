---
title: "Fishbowl: When Engineering Needs to Hear Sales Calls Without Being in Them"
date: "2021-07-29T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Every enterprise deal was stalling on self-hosted test runners, and engineering thought sales was inventing the requirement. Putting three account executives in a circle to talk to each other, with the engineering team listening, settled it in half an hour."
tags: [liberating-structures, shortest]
series: ls-alignment
seriesOrder: 8
use_featured_image: false
---

For three months, every Shortest deal above a certain size had stalled at the same point: the prospect's security team asked where the test runners execute, heard "our cloud," and asked for a self-hosted option. Sales relayed this. Engineering's position — stated with increasing tiredness in roadmap reviews — was that self-hosted runners meant supporting arbitrary customer infrastructure forever, that the two customers who'd actually asked had gone quiet afterward anyway, and that sales was pattern-matching one objection into a requirement.

Both sides had the same data and completely different readings of it. The usual response to that is for someone to write a doc. I've watched that doc get written twice and change nobody's mind, because the disagreement wasn't about the facts in the doc — it was about what a security-review objection *means*, and that's tacit knowledge, held by people who sit on those calls.

So we ran a **Fishbowl** with the sales side in the circle and engineering around them.

## The shape

Fishbowl puts a small group in an inner circle to have a real conversation while a larger group sits around them in silence and listens. Inner circle four to seven; outer circle as large as the room allows. Twenty to thirty minutes of inner conversation, then a debrief where the outer circle speaks.

The two rules that make it work are that the outer circle does not interject, and the inner circle talks **to each other**, not to the audience. The second one is easy to state and hard to hold — people naturally start presenting. I say it explicitly at the top and I'll interrupt once, early, if I hear someone start narrating to the room. After one correction it usually holds.

There's an optional empty chair in the inner circle that outer-circle members can step into. I left it out here on purpose. With engineering listening to a sales conversation about a requirement engineering doesn't believe in, an open chair is an invitation to litigate, and litigation was exactly what three months of roadmap review had already produced.

## Running it on self-hosted runners

Inner circle: two account executives, the solutions engineer who runs technical evaluations, and our head of sales. Outer circle: the eight-person engineering team, our designer, and me.

The prompt I gave them: **"Talk to each other about the last five deals where this came up. What actually happened on those calls, in order?"** Not "make the case for self-hosted runners." Deliberately. A prompt that asks for a case produces a pitch; a prompt that asks for a chronology produces the texture, and the texture is what engineering needed.

The chronology was not what anyone expected. In four of the five deals, the objection did not come from the security team at all — it came from the prospect's platform engineering group, and the concern wasn't data residency in the abstract. It was that Shortest needed a token with repository read access to check out code before running tests, and platform teams at those companies had a blanket policy against granting external services repository-scoped tokens. Two of them said so in nearly identical language, which one AE noticed out loud for the first time while describing the calls back to back.

That is a substantially different problem than "let us run your product in our VPC." It might be solved by an ephemeral, single-repo, short-lived token model, or by a thin agent that pushes rather than pulls, neither of which requires supporting arbitrary customer infrastructure forever.

The other thing the circle produced: the head of sales said plainly that he'd been calling it "self-hosted" because that's the phrase prospects used, and that he had no attachment to the architecture, only to unblocking the deals. One of the engineers told me afterward that this single sentence dissolved most of his objection. He'd assumed sales was specifying a solution. Sales was reporting a symptom in the customer's vocabulary.

The debrief question was **"What did you hear that you didn't know?"** and the engineering circle went for twenty-five minutes. Two engineers had never known we needed a repo-scoped token for checkout at all — that's an artifact of an early architectural choice nobody had revisited. Our staff engineer sketched the ephemeral-token approach on a whiteboard before the room emptied.

We shipped a scoped-token model that quarter. Self-hosted runners never went on the roadmap, and the deals unblocked anyway.

## Why listening beats arguing here

The core mechanic is that Fishbowl lets a group absorb knowledge that only exists as narrative. What sales knows about enterprise objections isn't a list of requirements — it's a hundred hours of calls, and it compresses badly. Written down it becomes "customers want self-hosted," which is both true and useless. Spoken between two people who were both there, with a third asking "wait, was that the one where they mentioned the token thing?", it stays specific enough to be actionable.

The silence rule buys the specificity. If engineering could interject, the first "well, they only said that because—" would have converted the chronology back into the same argument, and the identical-language observation would never have been made, because the AE would have been defending rather than remembering.

And an audience of skeptics improves the inner circle's honesty in a way an audience of allies doesn't. The head of sales saying "I have no attachment to the architecture" was worth more said in front of eight engineers than it would have been in a leadership meeting, because everyone who needed to hear it heard it directly rather than as a paraphrase from me.

## When it fails

It fails when the inner circle can't speak freely — a steep power gradient, or a topic where saying the honest thing has consequences. A performed fishbowl is worse than no fishbowl, because the room now believes it witnessed candor.

It fails when there's nothing tacit to transfer. If the disagreement is genuinely about a documented tradeoff both sides understand, put them in a decision structure instead; watching people restate known positions in a circle is theatre with chairs.

It fails if you skip the debrief or ask the wrong debrief question. "What do you think?" invites the outer circle to relitigate, which undoes the whole session. Ask what they heard that they didn't know — the answers are the reason you ran it.

And be careful about which group you put in the middle. Whichever group sits inside gets the airtime and the narrative frame; whichever sits outside gets the listening discipline. Choose based on where the tacit knowledge is, not on who's currently louder.
