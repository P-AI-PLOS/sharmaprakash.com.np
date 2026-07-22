---
title: "Estimation When Agents Do the Typing"
date: "2026-07-29T16:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Story points assumed the constraint was implementation effort. When agents write most of the code, the constraint moves — to review capacity, integration risk, and the irreducible unknowns — and a product owner who still sizes work by typing volume will plan a quarter that's fiction by week three. What estimation is still for, how to size work honestly in mixed human-agent delivery, and the reference-class trick your tracker history makes free."
use_featured_image: false
series: pm-context-repo
seriesOrder: 8
---

The [PRD from part seven](/product-management/walkthrough-a-prd-from-signal-to-sign-off/) is signed. The next question in every planning conversation is *how big is this?* — and it's the question whose ground truth has shifted most since agents entered delivery. A senior product owner needs a working answer, because the old proxies quietly broke.

Story points, whatever we claimed, were mostly a proxy for implementation effort — how much building is in this build. When agents do a large share of the typing, that proxy decouples from calendar time. A change that's *mechanically large but conceptually settled* (a well-specified CRUD surface, a migration with a known pattern) collapses in cost: an agent produces it in hours. A change that's *mechanically small but conceptually risky* (touching billing proration, anything with the words "permissions model") barely moves, because its cost was never the typing — it's the thinking, reviewing, and verifying, which stayed human. **Estimation didn't get easier; the axis rotated.** Size by keystrokes and you'll wildly over-budget the settled work and — far worse — under-budget the risky work, because "the agent can knock this out" *feels* true right up until review reveals it built the wrong thing confidently.

## What still costs, and what doesn't

The honest cost model for mixed human-agent delivery has three components, and only one of them shrank:

**Specification cost** — deciding what should happen, precisely enough to build. This is the acceptance-criteria work from [part six](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/) and the slicing decisions ahead in [part ten](/product-management/from-prd-to-tickets-acceptance-criteria-that-survive-the-sprint/). Unchanged by agents — arguably grown, since an underspecified task now gets built *fast and wrong* instead of slowly surfacing its own gaps.

**Implementation cost** — the typing. Collapsed for settled patterns, merely reduced for novel ones. The one everyone can see, and the one that matters least.

**Verification cost** — review, integration risk, and the testing that proves behavior. This is the new bottleneck, and it scales with *consequence*, not code volume: fifty agent-written files touching reporting views review faster than five touching billing math. Teams that don't re-plan around this ship faster into a review queue and call the pileup velocity.

So the sizing conversation changes shape. The refinement question is no longer "how long to build?" but three sharper ones: *How settled is the pattern? What's the blast radius if it's subtly wrong? Who can verify it, and what does verification cost?* Note those are exactly the questions the context repo is structured to answer — the area file's sharp edges are a blast-radius map, and the "settled vs. novel" call is usually legible from `decisions/`.

## A sizing scheme that survives contact

What I hold work to now — two dimensions, stated separately, never collapsed into one number:

- **Uncertainty class**, from the spec side: *settled* (pattern exists, criteria crisp), *bounded* (criteria crisp, pattern new — the risk is contained but real), or *open* (we don't fully know what right looks like — this work is discovery wearing delivery clothes and should be planned as a spike, not a story).
- **Verification weight**, from the consequence side: *light* (wrong is visible and cheap — UI polish, copy), *standard* (needs real review and tests), or *heavy* (wrong is invisible or expensive — money math, permissions, data migration; demands the [test-register treatment](/product-management/the-test-register-tracing-acceptance-criteria-to-real-tests/) and senior review time, which is the scarcest resource in the building).

Part seven's summary-views feature comes out *bounded / standard* for the composite-view core — new surface, but read-only over existing data, and the sharp edges (eventual consistency) are named — with one slice flagged *heavy*: the scheduled-delivery piece touches the contractual meaning of "export." That flag alone justifies the whole scheme, because it's the slice a keystroke-based estimate would have called trivial.

Capacity planning then follows the real constraint: a sprint is bounded by its **verification budget** — roughly, how much *heavy* and *standard* review the team's seniors can actually perform — not by how much building agents can start. Work-in-progress limits move from the build column to the review column. A sprint of one *heavy* plus a handful of *settled/light* items ships; a sprint of three *heavy* items stalls in review regardless of how fast the code appeared.

## Reference-class estimation, finally free

The classic fix for estimation bias — compare to actuals of similar past work, not to your optimism — was always sound and never done, because assembling the reference class took an afternoon in tracker archaeology. With [part four's](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/) tracker connection, it's a refinement-time query: *find completed items in this area over four quarters; report estimate vs. actual cycle time, and where the time actually went.* The pattern it surfaces is reliably the same shape — items touching the settled areas land near estimate; items touching the two gnarly areas take twice their guess, and the overrun lives in review-and-rework, not build. That's your empirical uncertainty-class map, and it beats any planning-poker intuition in the room. Run it against the *current* proposal and the assistant will also name which past item this most resembles — anchoring the conversation on evidence, which is this series' whole move, applied to estimates.

Two guardrails, same spirit as always. **The model proposes reference classes; humans rule on membership** — "this resembles the W14 export work" is checkable, and sometimes wrong in ways only someone who lived it knows. And **no invented precision**: if the honest statement is "bounded uncertainty, standard verification, resembles items that ran 1–3 weeks," then that range — not a synthetic midpoint — is what goes to the [roadmap conversation](/product-management/walkthrough-assembling-the-quarterly-roadmap-from-signals/). A range with a named driver ("the width is the eventual-consistency question") is a plan; a point estimate is a wish wearing a decimal.

## What the product owner actually signs

Estimation's real product was never the number — it's the *shared understanding of where the risk lives*, and that's why it stays a conversation with engineers rather than becoming an agent's output. What changes is what you bring to it: uncertainty class and verification weight proposed per slice, the reference-class query already run, sharp edges already on the table. The argument happens over the interesting disagreements ("you called this settled; the area file says otherwise") instead of over blank guesses.

That shared understanding feeds the next artifact up the stack. A quarter's roadmap is a portfolio of these classified bets — and assembling one from the signal base, with confidence levels that mean something, is [part nine](/product-management/walkthrough-assembling-the-quarterly-roadmap-from-signals/).
