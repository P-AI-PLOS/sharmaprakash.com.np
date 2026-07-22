---
title: "Designing the Context Repo: a Structure Agents and Humans Can Navigate"
date: "2026-07-25T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The difference between a context repo that compounds and one that rots is decided in the first week, by structure: small files that answer one question each, frontmatter that makes them queryable, decision records with dates, and an AGENTS.md that teaches AI tools how to read the whole thing. The complete layout, with copy-paste starter files."
use_featured_image: false
series: pm-context-repo
seriesOrder: 2
---

[Part one](/product-management/the-product-context-repo-why-your-product-knowledge-belongs-in-git/) made the argument: your product's knowledge belongs in a plain-text git repo that both humans and AI tools can read. This post is the build. By the end you'll have the full folder structure, the file conventions that keep it useful at file three hundred, and the one file that matters more than any other — the `AGENTS.md` that teaches AI tools how to navigate what you've built.

The design principle behind every choice here: **structure the repo for retrieval, not for writing.** You will write each file once and it will be read — by you, by teammates, by AI tools — hundreds of times. Every convention below trades a little writing friction for a lot of reading precision.

## The layout

```
product-context/
├── AGENTS.md                     # entry point for AI tools — read this first
├── README.md                     # entry point for humans
├── product/
│   ├── overview.md               # one page: what it is, for whom, why it wins
│   ├── areas/
│   │   ├── billing.md            # one file per product area
│   │   ├── reporting.md
│   │   └── permissions.md
│   └── constraints.md            # the "load-bearing walls" — see below
├── personas/
│   ├── ops-manager.md            # one file per persona
│   └── finance-admin.md
├── glossary.md
├── decisions/
│   ├── 2026-03-14-single-currency-per-account.md
│   └── 2026-06-02-killed-custom-report-builder.md
├── signals/
│   ├── 2026-W28-digest.md        # weekly digests (part three)
│   └── cards/                    # individual signal cards
├── competitors/
│   └── positioning.md
├── templates/
│   ├── user-story.md
│   ├── prd.md
│   ├── signal-card.md
│   └── test-register.md          # arc two, part eleven
└── skills/                       # workflow definitions (part five)
    ├── story-writing/
    ├── prd-drafting/
    └── signal-extraction/
```

Every convention in that tree exists to answer one question fast. Walking through the load-bearing ones:

## Small files, one question each

The worst version of this repo is five heroic documents. Models retrieve and humans skim at the *file* level, so the file is your unit of retrieval — one file should answer one question. `product/areas/billing.md` answers "how does billing work and what are its sharp edges?" It should not also contain the billing roadmap, the billing pricing history, and that one incident writeup.

A product-area file, in the shape I've settled on:

```markdown
---
area: billing
owner: prakash
updated: 2026-07-10
---

# Billing

**In one sentence:** Subscription billing per workspace, invoiced
monthly, with usage-based add-ons reconciled at period end.

## How it works
Three paragraphs, maximum. Current behavior, not history.

## Sharp edges
- Downgrades apply at next period, never mid-cycle — contractual
  for enterprise accounts.
- Usage counters are eventually consistent; totals can lag ~1h.

## What we will NOT do
- Per-seat proration mid-cycle (see decisions/2026-03-14-...)

## Open questions
- EU invoicing requirements for the mid-market push — unresolved.
```

Two sections there do disproportionate work. **Sharp edges** is where you record the facts that make naive feature ideas wrong — exactly the facts an AI draft would otherwise violate. **What we will NOT do** is the section that stops the same bad idea from being proposed fresh every quarter, by humans and models alike. If you write only two sections per area, write those two.

## The glossary is a contract, not a dictionary

Every product develops private language: words that mean something narrower, or legally sharper, or just *different* here than in English. Those words are where miscommunication — human and AI — concentrates. The glossary pins them:

```markdown
## export
A scheduled, auditable data extraction with a retention log.
NOT the same as "download" (ad-hoc, no audit trail). Enterprise
contracts reference "export" specifically — changing export
behavior is a contract-review conversation, not a UX decision.
```

The test for whether a term belongs: has anyone ever built, specced, or sold the wrong thing because two people meant different things by this word? Then it goes in, with the *distinction* spelled out, not just a definition.

## Decision records: the rot-proof part of the repo

Decisions are the highest-value, lowest-maintenance files in the repo, because a decision with a date **never goes stale — it's an event, not a status.** Even if it's later reversed, the record of what was decided and why remains true and remains useful. Borrow the engineering ADR format, lightened:

```markdown
---
date: 2026-06-02
status: decided        # decided | superseded (link the successor)
---

# Killed the custom report builder

## Decision
We stopped building the in-product custom report builder and
committed to templated reports + scheduled export instead.

## Context
Two quarters in, usage testing showed <name the evidence — link
signal cards>. Maintenance cost was crowding out the reporting
work customers actually asked for.

## Consequences
- "Can I build my own report?" gets a positioning answer, not a
  roadmap answer. See competitors/positioning.md.
- Any proposal that reintroduces ad-hoc report building must
  address this record first.
```

That last line is the point. A decision record is a tripwire: it converts "we tried that once, ask around" into a file an agent will actually surface when someone — or something — proposes the idea again.

## AGENTS.md: the file that makes it work

Humans can wander a repo and infer. AI tools do dramatically better with an explicit map. `AGENTS.md` sits at the root and tells any AI tool how to use everything else:

```markdown
# How to use this repo

You are working with the product context repo for <product>.
It is the source of truth for product context — NOT for work
status (the tracker owns that) or drafts (docs own that).

## Reading order for common tasks
- Drafting a user story: glossary.md → the relevant
  product/areas/ file → recent signals/ digests → templates/user-story.md
- Drafting a PRD: product/overview.md → area file →
  personas/ → decisions/ touching this area → templates/prd.md
- "What do customers say about X": signals/cards/ filtered by
  tag, newest first. Quote verbatims with their card IDs.

## Rules
1. Claims about customers MUST cite signal card IDs. If no
   signal supports a claim, label it ASSUMPTION.
2. Respect every "What we will NOT do" section and every
   decisions/ record unless the human explicitly overrides.
3. Use glossary terms exactly as defined. Do not use "export"
   and "download" interchangeably.
4. If a needed file doesn't exist, say so — do not invent
   product behavior.
```

Notice what this file is doing: it's not prompt engineering, it's **onboarding**. It's the same document you'd want a contractor PM to read on day one, written tersely enough that a model keeps it in working memory. The rules are advisory here — a model *asked* to obey — which is why [part five](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/) backs the critical ones with hooks that *enforce* them, and [part six](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/) builds the editorial layer on top.

## Conventions that keep it alive

**Frontmatter on everything.** `owner`, `updated`, and tags make staleness visible (`grep` for files not touched in six months) and let workflows filter — "signals tagged `billing` from the last eight weeks" is a one-liner when the metadata exists, and archaeology when it doesn't.

**Merge via pull request, even solo.** Not for ceremony — for the diff. A PR that changes `constraints.md` is a product conversation made visible, and the PR gate is what will later let automated workflows write to the repo safely: an agent's output arrives as a reviewable diff or it doesn't arrive at all.

**Start embarrassingly small.** Day one is: `AGENTS.md`, `glossary.md` with five terms, two area files, two personas, three decision records you can write from memory. That's an afternoon. A repo that's 20% complete but accurate is useful; a repo that aims for complete and ships nothing is the wiki failure all over again, with extra steps.

**Write for the reader who has no context.** Every file gets read by someone — or something — that wasn't in the room. Expand acronyms once, link the related decision, name the segment instead of saying "big customers."

With the structure standing, the repo has walls but no bloodstream. The next post wires the input: [a weekly pipeline that turns support tickets, call transcripts, sales calls, and CRM notes into the signal cards](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/) everything above cites.
