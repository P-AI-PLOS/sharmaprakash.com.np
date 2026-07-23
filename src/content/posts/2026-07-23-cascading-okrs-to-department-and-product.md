---
title: "Cascading OKRs to Department and Product Without a Status Report"
date: "2026-07-23T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Most OKR cascades are arithmetic disguised as alignment — the company KR divided by headcount becomes every team's KR, and nobody notices that no actual thinking happened between the layers."
use_featured_image: false
series: operating-rhythm
seriesOrder: 3
---

The quarterly OKR review at a forty-person SaaS company went like this: the CEO presented the company's three objectives and eight key results. Each department head then presented their department's OKRs, which were the company's KRs with the department name attached — "Increase activation rate from 32% to 45%" became "Marketing: increase activation rate from 32% to 45%" and "Product: increase activation rate from 32% to 45%." Every team was responsible for the same number. Nobody could tell me what their specific contribution to that number was, or what they'd stop doing if the number required trade-offs. The OKR review was a status report: here's what we shipped, here's the number, we're green. After three quarters of this, the activation rate hadn't moved, and the leadership team concluded that OKRs "don't work for us." They'd never actually tried OKRs — they'd tried top-down number decomposition, which is the most common way organizations avoid the hard work of cascading.

The failure wasn't in the framework. It was in what "cascade" meant to them. They'd interpreted cascading as number propagation: take the company KR, divide it by the number of teams that touch it, assign each team a fraction of the same metric. That's not cascading. That's arithmetic. Cascading means propagating the *problem* — the outcome the company needs — and letting each department or product team decide *which key result* they can own that contributes to it. The difference is between "everyone owns the same number" (and therefore nobody owns it) and "everyone owns a different piece of the puzzle that adds up to the same picture."

## Why number propagation fails

The intuitive move is to take the company's KR and assign pieces of it to each team. "Increase activation rate from 32% to 45%" gets sliced: Marketing owns the top of funnel (get more signups to complete onboarding), Product owns the middle (improve the onboarding flow itself), and Customer Success owns the bottom (re-engage users who dropped off). Each team gets a sub-metric that contributes to the whole.

The problem is that the sub-metrics are coupled in ways the split doesn't capture. Marketing's "more signups to complete onboarding" and Product's "improve the onboarding flow" interact: if Marketing changes the signup source, the activation baseline shifts and Product's target becomes easier or harder without any action on their part. Customer Success's "re-engage dropped users" depends on Product's onboarding changes — if the flow improves, fewer users drop off, and CS's re-engagement target becomes irrelevant.

When the sub-metrics are coupled, nobody can move their number independently. The result is either nobody owns the number (because everyone's waiting for someone else to go first) or everyone claims credit when the number moves (because it's "shared"). The quarterly review becomes a blame-and-credit exercise instead of a learning conversation.

## The alternative: cascade the problem, not the number

The fix is to separate the company-level outcome from the department-level key results. The company defines the outcome: "increase activation rate from 32% to 45%." That's the objective-level commitment. Then each department asks a different question: "given that the company needs activation to improve, what specific result can *our team* own that contributes to it?"

Marketing might choose: "Increase the percentage of signups that reach the activation threshold within 7 days." That's a different metric from the company's KR — it's a leading indicator that Marketing can control independently. Product might choose: "Reduce the median time-to-first-value from 12 minutes to 5 minutes." That's a product metric that directly affects activation but is measurable and controllable by the product team. Customer Success might choose: "Increase the reactivation rate of users who dropped off in their first week from 8% to 15%." Again, different from the company's number, but directly contributing.

Now each team owns a metric they can move independently. The coupling still exists — Marketing's leading indicator affects Product's time-to-value — but each team can explain their specific contribution without waiting for another team to go first. The quarterly review shifts from "we're all green on the same number" to "Marketing moved their indicator, Product is making progress on time-to-value, CS is seeing early reactivation wins — the company number should follow."

## The three-layer cascade

The cascade works in three layers, each with a distinct question.

**Layer 1: Company level.** "What outcome do we need this quarter?" This is the objective and the company-level KR. Written by the CEO and exec team, approved by the board. Example: "Objective: crack the activation problem. KR: increase activation rate from 32% to 45%."

**Layer 2: Department level.** "Given the company's outcome, what can our department own?" Each department chooses one or two key results that they can measure, influence, and move independently. The department head writes these with their team. Example: Marketing's KR: "Increase onboarding completion rate from 60% to 75%." Product's KR: "Reduce median time-to-first-value from 12 minutes to 5 minutes."

**Layer 3: Team level (optional, for larger orgs).** "Given the department's KR, what can our squad own?" This layer exists only when a department has multiple squads. Each squad chooses a metric that contributes to the department's KR. Example: The onboarding squad's KR: "Reduce the drop-off rate on step 3 of the onboarding flow from 40% to 20%."

The critical discipline is that each layer answers a different question. If the department's KR is just the company's KR restated, no thinking happened at the department layer. The smell test: "Could a competitor's department present our department's KR without changing a word?" If yes, it's not specific enough — it's a generic metric, not a department-specific commitment.

## The status report trap

The quarterly review becomes a status report when the conversation shifts from learning to reporting. The tell is a slide deck with green/yellow/red indicators and a bullet list of shipped features. That's a project status report wearing OKR clothes. The OKR review should be a conversation about three questions:

1. **What did we learn?** Not "what did we ship" but "what did we discover about the customer, the market, or our own assumptions?" If the quarter's key result was "reduce time-to-first-value from 12 to 5 minutes" and the team shipped a new onboarding flow, the review should discuss what the flow revealed about user behavior, not just that it shipped.

2. **What changed?** If a KR is no longer the right metric — because the team learned that time-to-first-value isn't the activation bottleneck, it's the first-use experience after onboarding — the review should discuss whether to pivot the KR, not just report its status. OKRs are hypotheses; the review is where hypotheses get updated.

3. **What do we stop doing?** The hardest question. If the company's activation KR requires the product team to focus on onboarding, what roadmap items get deprioritized? If nobody can name anything, the OKR isn't driving trade-offs, which means it isn't driving focus, which means it's a reporting exercise.

## The check: is this cascading or arithmetic?

After the first quarter of cascading, run this test on every team's OKRs:

1. **Can each team explain their specific contribution to the company outcome?** If the answer is "we're all working on the same number," cascading didn't happen.
2. **Could each team's KR exist independently of the others?** If Marketing's KR is coupled to Product's KR so tightly that neither can move without the other, the split was wrong.
3. **Did any team make a trade-off during the quarter because of their KR?** If no team stopped doing something or started doing something different, the KR wasn't constraining behavior, which means it wasn't a real commitment.
4. **At the quarterly review, did the conversation focus on learning or reporting?** If more than half the time was spent presenting status, the review format is broken.

The goal of cascading isn't alignment — alignment is a side effect. The goal is distributed ownership of a shared outcome, where each team can explain their piece, measure their piece, and make trade-offs on their piece. When that works, the quarterly review is a conversation about what the company learned about its most important problem, told through the lens of each team's contribution. When it doesn't work, it's a status report where everyone presents green on the same number and nobody can explain why the number hasn't moved.
