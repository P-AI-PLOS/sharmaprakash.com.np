---
title: "The Signal Pipeline: Tickets, Calls, and CRM into One Weekly Digest"
date: "2026-07-26T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Customer evidence is the most valuable input a product team has and the worst-managed: tickets in the help desk, transcripts in the call recorder, lost reasons in the CRM, all unread past week one. This post builds the pipeline — a signal card format, per-source extraction that an agent runs and you review as a pull request, and a weekly digest that costs you twenty minutes."
use_featured_image: false
series: pm-context-repo
seriesOrder: 3
---

The structure from [part two](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/) gave the repo a `signals/` directory. This post fills it — and it's the post that determines whether the whole system earns its keep, because **signals are the only part of the repo that customers write.** Everything else is your team's understanding of the product; signals are the evidence that understanding is tested against. A story that cites a signal card is grounded. A story that cites nothing is an opinion with formatting.

The raw material already exists, in depressing abundance. Support tickets pile up in the help desk (Zendesk, Intercom, Freshdesk, Help Scout — whichever your team runs). Customer and sales calls sit as transcripts in a call recorder (Gong, Chorus, Fireflies, Grain, tl;dv, or the recorder built into your meeting tool). Deal notes, objections, and lost reasons accumulate in the CRM (Salesforce, HubSpot, Pipedrive, Close). Chat threads, NPS verbatims, community posts. The problem was never collection. The problem is that each system is a silo optimized for its own workflow, nothing is cross-readable, and volume long ago outran any human's ability to keep up by reading.

The pipeline is three parts: a **format** (the signal card), an **extraction pass** per source (which an agent runs on schedule), and a **review ritual** (the weekly digest PR) that keeps a human accountable for every card that merges.

## The signal card

One card = one observation from one source, small enough to quote whole:

```markdown
---
id: SIG-2026-0142
date: 2026-07-14
source: support-ticket        # support-ticket | call | sales-call
                              # | crm-note | survey | community | chat
segment: mid-market
area: reporting               # matches product/areas/ filenames
type: pain                    # pain | request | confusion
                              # | workaround | praise | churn-risk
severity: 3                   # 1 blocking → 4 minor
---

**Verbatim:** "Every Monday I export three reports and rebuild
the same summary in a spreadsheet before the leadership call."

**Context:** Ops manager, ~200-seat account, 14 months on the
product. Third ticket from this account touching reporting.

**Interpretation:** The scheduled-reports feature covers the
export but not the cross-report summary step. The manual work
is the summary, not the export.
```

Three deliberate choices in that format. **The verbatim is mandatory and sacred** — customers' own words, never paraphrased, because the verbatim is what survives arguments ("customers are frustrated with reporting" invites debate; the Monday-morning quote ends it). **Interpretation is separated from observation** — the verbatim is a fact; your reading of it is fallible and revisable, and keeping them apart is what lets you re-read old evidence with new eyes. **The frontmatter makes cards queryable** — "all `churn-risk` cards in `enterprise` from the last quarter" needs to be a filter, not an afternoon.

One rule that is not optional: **cards are anonymized at creation.** Account names, people's names, and emails stay in the source systems, which have access controls built for them; the repo gets segment and role. This is basic data hygiene — and it's also what makes the repo safe to feed to AI tools and safe to open up to your whole team.

## The extraction pass, source by source

The division of labor is the same everywhere: **an agent reads everything and drafts cards; you approve, reject, and edit.** Volume is the model's job; judgment is yours. In practice this runs as a scheduled job — a cron-triggered agent session that pulls the week's exports, drafts cards, and opens a pull request against the repo ([part five](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/) wires the schedule; the extraction instructions themselves live as a skill in `skills/signal-extraction/`). Until that's set up, running the same pass by hand in an interactive session works fine — the prompt is identical, only the trigger differs. Either way, never skip the review: **an unreviewed card corrupts the very ground truth the rest of the system cites.**

**Support tickets.** The pass pulls the period's tickets — every help desk exports CSV or has an API — and the skill's instructions are: *cluster by theme, draft one card per distinct pain (not per ticket), pull the single best verbatim per cluster, flag anything severity-1.* Your review is ten minutes on the PR diff. Resist carding everything; five sharp cards a week beat forty mechanical ones.

**Customer calls.** Transcripts are long, and the useful minute is buried around 40:00. The extraction instruction that earns its keep: *find every moment the customer describes a problem, a workaround, a competitor comparison, or a surprise — timestamped, verbatim.* Explicitly excluded: feature requests taken at face value. A request is a signal to record and a solution to distrust — card the workaround demo ("watch me do this in a spreadsheet"), which is worth ten "you should add X" moments.

**Sales calls.** Same mechanics, different lens, and the failure mode you must design against is **turning the roadmap into a weighted average of open deals.** Sales-call cards capture objections ("they asked twice about audit logs — second enterprise prospect this month"), competitor claims, and the exact vocabulary prospects use for problems — that phrasing is marketing gold. What they must carry is their frontmatter: `source: sales-call` means *prospect evidence*, weighted differently from customer evidence, and visible as such downstream. How the roadmap defends itself from deal pressure is [its own post](/product-management/sales-sold-it-the-recovery-playbook-for-unplanned-commitments/).

**CRM.** The highest-value, least-read field in your CRM is the closed-lost reason. Quarterly at minimum, the pass pulls the period's lost and churned records and cards the patterns — this is where "we lost four mid-market deals over the missing integration" becomes a fact with IDs instead of a sales-meeting vibe. While it's in there, it cards renewal-risk notes from account owners; they're churn signals sitting in a system PMs never open.

**Chat and community.** Lowest signal-to-noise; don't schedule it. When a thread in your chat tool or community forum produces a genuinely new observation, card it on the spot. The pipeline needs a habit here, not a process.

## The weekly digest

Cards are the atoms. The digest is the molecule — one file per week, `signals/2026-W30-digest.md`, assembled in the same scheduled run and the only part of the pipeline other humans will reliably read:

```markdown
# Signals — 2026 W30

**Volume:** 41 tickets, 6 calls, 3 sales calls, 1 lost-deal review
**Cards created:** 9 (2 churn-risk)

## Themes
1. Cross-report summarization is the real reporting gap —
   third consecutive week (SIG-0142, SIG-0147, SIG-0151).
2. Audit-log asks now span two segments, sales + support both
   (SIG-0148, SIG-0150). Watch, not act.

## Contradicts what we believe
- SIG-0149: an enterprise account praised the exact onboarding
  flow product/areas/onboarding.md calls a known weakness.

## New this week
- First signal of any kind about the mobile web experience.
```

The section that pays the rent is **Contradicts what we believe.** Anyone can summarize; the digest exists to hold your written context — those area files and personas from part two — against this week's evidence and report the collisions. The skill's instruction is explicit: *diff this week's cards against the relevant area files and report disagreements.* That's also the update trigger for the rest of the repo: three weeks of signals contradicting an area file means the file is wrong, and the fix arrives with citations attached.

With the agent doing extraction and assembly, your weekly cost is the review: twenty minutes on a pull request — check the verbatims against a spot-sample of sources, kill weak cards, sharpen an interpretation or two, merge. It compounds fast: within a quarter you have a queryable, quotable evidence base, and questions like "what do we actually know about mid-market reporting pain?" stop being research projects and start being `grep`.

Two failure modes will try to kill the pipeline. **Rubber-stamping** — when the PR review becomes a reflexive merge, the ground truth quietly fills with unexamined claims; the fix is the spot-sample habit, three verbatims traced to source per week, every week. **Card inflation** — if everything becomes a card, citations stop meaning anything; the severity field and the review pass are your quality gate, and a quarterly prune of stale `watch`-tier cards keeps the base honest.

The repo now has structure and a bloodstream. Next: [connecting the tracker, docs, and chat](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/), so the drafts this evidence powers can flow to where work actually happens — without building a sync monster.
