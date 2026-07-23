---
title: "Ecocycle Planning: A Lifecycle Review for a CRM's Feature Portfolio"
date: "2021-04-23T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A backlog only tells you what's next. Ecocycle Planning tells you what's dying, what's calcified, and what's ready to be born — by making a team physically place every feature on a lifecycle map and argue about where it really sits."
tags: [liberating-structures, recap-crm]
series: ls-decide
seriesOrder: 1
use_featured_image: false
---

Nobody ever schedules a meeting to kill a feature. Roadmap reviews are built to talk about what's next, quarterly planning is built to talk about what's now, and nothing in most planning calendars is built to ask what's *still alive only because nobody's turned it off*. Ecocycle Planning is the Liberating Structure I reach for when a product's feature portfolio needs that conversation — a room full of people sticking notes on a figure-eight diagram until it becomes obvious, without anyone having to say it first, which features are thriving, which are fossils, and which good idea has been stuck in limbo for two years because it never got resourced.

## What it is

Ecocycle Planning comes from Deborah Frieze and Brenda Zimmerman's ecocycle model — the observation that healthy systems, including forests and organizations, move through a repeating loop rather than a straight line. The diagram is an infinity loop with two halves. The **front loop** runs birth → maturity → growth and alignment, the phase where something that works gets more efficient, more standardized, more relied-upon — right up until it hits the **rigidity trap**, the far-right point where the thing has become so entrenched that it can no longer adapt even when it should. The **back loop** runs creative destruction → release → exploration/uncertainty → renewal → back to birth, and it has its own trap: the **poverty trap**, where an idea is stuck exploring possibilities with no resources ever committed to actually launching it.

The insight the diagram forces on a room is that both traps are failure modes, and they're opposite ones. A feature portfolio doesn't fail by having too many bad ideas. It fails by having too many *good former ideas* stuck rigid at one end and too many *promising unfunded ideas* stuck poor at the other, while the team's attention stays fixed on whatever's currently in growth.

## How it runs

I print the ecocycle diagram large — a full flipchart sheet or a floor-sized version if the room allows it — and run this with groups of 12 to 20 people split into trios or quads, 60 to 75 minutes total.

**Step one: individual inventory, 5 minutes, silent.** Everyone writes one practice, project, feature, or initiative per sticky note — whatever unit of "thing our group does" fits the session's scope. No discussion yet. Silence matters here; if people start comparing notes early, the inventory converges on whatever the loudest person thinks matters, and you lose the long tail of things individuals know about that nobody else has been tracking.

**Step two: place the stickies, 10-15 minutes, in groups of 4-5.** Each small group takes their combined pile and physically places every sticky on the diagram based on where it genuinely sits in its lifecycle right now — not where anyone wishes it sat. This step does the real work. Two people will grab the same sticky and try to put it in different places, and that argument is the point: it surfaces disagreement about a feature's actual state that would otherwise stay implicit and unspoken. Someone thinks it's cruising through maturity; someone else thinks it's already rigid. Neither of them was wrong to think that in isolation — they just hadn't said it out loud until the diagram made them.

**Step three: name the traps, remaining time.** Once the diagram is populated, each group works two questions against their own map: *what should we creatively destroy* (candidates clustered at the rigidity trap) and *what's ready to be born* (candidates clustered at or trying to escape the poverty trap). This is where the session stops being descriptive and starts being decisive — groups aren't just observing the shape of their portfolio, they're proposing what to do about the two ends of it.

**Close: harvest to the whole room.** Each small group reports back — usually just the standout items in each trap and the group's proposed action — and the facilitator or a scribe captures it. I don't try to force full-room consensus on every sticky; the value is in the visibility, and follow-up conversations can resolve the genuinely contested ones.

## Running it on recap_crm's feature portfolio

I've used this most productively as an annual or twice-yearly review, not a sprint-level exercise — the unit of analysis is "should this exist," which is a slower-moving question than "what do we build next."

For a CRM like recap_crm, the inventory step alone is usually revealing, because the surface area spans several eras of the product: pipeline and deal-stage views from the early build, contact and company records barely touched since launch, meeting prep and recap tooling that's newer and still finding its shape, follow-up sequence automation that's had three redesigns, and the sales-to-marketing handoff surfaces bolted on when the company added a marketing team. Everyone in the room — sales engineering, support, account management — writes their own stickies, and the pile before grouping is always bigger and stranger than expected.

Placement is where it gets interesting. A basic pipeline kanban view, built years ago and barely touched since, tends to land right at the rigidity trap: everyone relies on it, nobody's allowed to break it, and it hasn't absorbed a genuinely new idea in a long time — a strong candidate for either a deliberate modernization or an honest "we leave this alone and stop pretending it's still evolving." Some early attempt at automated meeting-note generation that shipped, got lukewarm adoption, and has been quietly maintained ever since without anyone owning its future is a classic rigidity-trap resident too — alive, costing upkeep, not earning attention.

The poverty trap side tends to fill with things like a sales-to-marketing handoff view that three different people have prototyped over two years and none has ever been resourced past a demo, or a follow-up sequence personalization feature that keeps getting explored in discovery calls and keeps losing the prioritization fight before it ships. These are the ones the session is most useful for, because a poverty-trap item doesn't need another round of validation — it's already been explored past the point of diminishing returns. It needs either a real commitment or a clean kill, and Ecocycle Planning is one of the few structures that puts "kill it" and "fund it" on the table as equally legitimate outcomes of the same conversation.

The creative-destruction question is the one teams flinch from, worth naming before small-group discussion starts: destroying a feature in a CRM doesn't always mean removing code. It can mean retiring a workflow, consolidating overlapping automation triggers into one, or stopping active development on a meeting-recap variant so attention concentrates on the version that's actually working. The diagram doesn't force any particular action — it forces the conversation about which action is overdue.

## Failure modes and when to skip it

**Skip it if there's no appetite to actually sunset anything.** Ecocycle Planning produces a harvest full of "creatively destroy this" recommendations, and if the org has no mechanism — or no will — to act on them, you've just run an expensive exercise in naming problems everyone already half-knew about. The session needs a sponsor who will take the rigidity-trap list and do something with it, not file it.

**Watch for the diagram becoming an org chart in disguise.** Groups sometimes place features by which team currently owns them rather than by actual lifecycle stage — a feature gets called "mature and thriving" because the owning team is politically strong, not because usage data supports it. Grounding placement in real signals (usage, support tickets, time since last meaningful change) rather than vibes keeps this honest.

**Don't run it as a substitute for a roadmap review.** It answers "what exists and what state is it in," not "what should we build next quarter" — those are different questions, and conflating them produces a session that's too broad to finish and too vague to act on. I run Ecocycle Planning as input *to* roadmap planning, held a few weeks before, so the portfolio picture is fresh when prioritization conversations start.

**And don't run it too often.** A portfolio's shape doesn't move fast enough to justify a monthly ecocycle review — the stickies won't have moved, and the group will notice they're re-litigating the same placements. Once or twice a year, tied to a real planning cycle, is enough to keep the front loop from calcifying and the back loop from starving.

This is the first post in a series putting Liberating Structures to work in feature-development workshops — the full field guide of all 33 structures is [here](/product-management/liberating-structures-for-product-teams-the-33-structure-field-guide/) if you want the wider map before going deeper on any one of them.
