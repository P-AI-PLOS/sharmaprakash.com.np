# Fan-out brief: write the 4 remaining Liberating Structures series

Four series in `src/data/series.ts` currently show "0 PARTS" — the registry
entry and cover image exist but no posts have been written. Write all of them,
matching the exact style, structure, and conventions of the three completed
series (`ls-discovery`, `ls-ideation`, `ls-decide` — 44 posts already live in
`src/content/posts/`).

**This brief has 4 independent lanes — one per series. Each lane works only
on its own series and its own set of new post files. No lane edits
`src/data/series.ts`, `src/data/portfolios.ts`, or any file outside
`src/content/posts/`. No lane touches another lane's post files.**

## Required reading before writing (every lane)

1. Read 3 example posts in full for tone/structure/length:
   - `src/content/posts/2021-01-08-troika-consulting-flaky-test-triage.md`
   - `src/content/posts/2021-01-15-nine-whys-theme-customizer-redesign.md`
   - `src/content/posts/2021-05-21-agreement-certainty-matrix-backlog-triage-recap-crm.mdx`
2. Read `src/content.config.ts` for the frontmatter schema.
3. Read `AGENTS.md` (this repo's root instructions) and `docs/agents/recipes.md`
   for "how do I add a blog post" conventions.

## The fictional product universe (reuse these 5 — do not invent new ones)

| Product | What it is | tag slug |
|---|---|---|
| Recap CRM | relationship-first CRM for founders | `recap-crm` |
| Shortest | AI-native QA/testing tool | `shortest` |
| Leave Balance | HR leave-management tool | `leave-balance` |
| Polo Themes | Shopify storefront theme shop | `polo-themes` |
| Course Guru | Shopify-embedded LMS | `course-guru` |

Every post is a first-person anecdote about running one Liberating Structure
on a real (fictional) product-development situation at one of these 5
products. Vary which product each post uses — don't cluster all posts on one
product within a series. Invent a **specific, concrete scenario** per post
(a named feature, bug, decision, or rollout) — never generic ("the team had
a problem"). Check existing filenames across `src/content/posts/` before
picking a scenario name so you don't duplicate a topic already covered in
the other series.

## Frontmatter template (copy exactly, fill in blanks)

```yaml
---
title: "<Structure Name>: <Evocative Subtitle>"
date: "<YYYY-MM-DDT10:00:00+05:45>"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "<1-2 sentence hook, specific to the scenario, ~30-45 words>"
tags: [liberating-structures, <product-tag-slug>]
series: <series-slug>
seriesOrder: <n>
use_featured_image: false
---
```

Filename: `YYYY-MM-DD-<slug-derived-from-structure-and-scenario>.md` (or
`.mdx` if you want an inline chart/component — plain `.md` is fine and is
what most existing posts use).

Body: 600-900 words. Follow the shape of the example posts — open on a
concrete, specific moment (not a definition), explain what the structure is
and how it runs, narrate running it on your invented scenario with a real
outcome, explain why the structure's specific mechanic does the work, and
close with when to skip it / where it breaks. Heading wording can vary
post-to-post like the examples do — don't force identical headings across
every post in a lane.

`seriesOrder` starts at 1 and increments per post in that series, in the
order you write them (which should also be roughly chronological by the
`date` field within that series).

---

## Lane 1 — `ls-design`: Liberating Structures: Design & Prototyping

9 posts. 3 structures, 3 posts each: **Min Specs**, **Improv Prototyping**,
**Design Storyboards**. Use dates `2021-06-11` through `2021-07-01`, spaced
~3 days apart, one post every date, in that order.

## Lane 2 — `ls-alignment`: Liberating Structures: Alignment & Relating

12 posts. 6 structures, 2 posts each: **Impromptu Networking**,
**Conversation Cafe**, **Heard Seen Respected**, **Fishbowl**,
**What I Need From You**, **Mad Tea**. Use dates `2021-07-05` through
`2021-08-12`, spaced ~3-4 days apart.

## Lane 3 — `ls-retro`: Liberating Structures: Retrospectives & Improvement

6 posts. 2 structures, 3 posts each: **What/So What/Now What**,
**15% Solutions**. Use dates `2021-08-16` through `2021-08-30`, spaced
~3 days apart.

## Lane 4 — `ls-culture`: Liberating Structures: Culture, Change & Adoption

9 posts. 4 structures: **Purpose-to-Practice** (3 posts), **Shift & Share**
(2 posts), **Social Network Webbing** (2 posts), **Integrated~Autonomy**
(2 posts). Use dates `2021-09-03` through `2021-09-27`, spaced ~3 days apart.

---

## Verification (every lane, before merging)

- `pnpm check` passes (Astro/TS check — validates frontmatter schema).
- Every post file has a distinct filename and a distinct `excerpt`.
- `seriesOrder` is 1..N with no gaps or repeats within the lane's series.
- Titles are not near-duplicates of existing posts.

## Git

Each lane works on its own branch named after its series slug (`ls-design`,
`ls-alignment`, `ls-retro`, `ls-culture`), same pattern as the three
completed series. Commit when the lane's posts are done and `pnpm check`
passes. Do not push. Do not merge — the orchestrator merges all 4 lanes back
to `main` serially after they finish.
