---
title: "The Product Context Repo: Why Your Product Knowledge Belongs in Git"
date: "2026-08-24T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Every AI tool you point at your backlog produces confident, generic garbage — not because the model is weak, but because it has never met your product. The fix isn't a better prompt. It's a repo: a plain-text, version-controlled home for everything your product knows about itself, structured so both humans and agents can read it. Part one of a six-part build-along."
use_featured_image: false
series: pm-context-repo
seriesOrder: 1
---

Ask an AI assistant to write a user story for your product and you'll get something that could be about anyone's product. Correctly formatted, INVEST-shaped, three acceptance criteria — and hollow. It doesn't know that your enterprise tier has a permissions model the story would break. It doesn't know that "export" in your product means something contractually specific to your largest segment. It doesn't know that the feature it's cheerfully proposing was tried in 2024 and killed for a reason someone wrote down once, in a doc nobody can find.

The instinct is to blame the model or perfect the prompt. Both are the wrong diagnosis. **The model isn't missing intelligence; it's missing context — and your context is currently smeared across six SaaS tools that neither you nor any agent can read end-to-end.** Support conversations live in your help desk. Call recordings live in whatever recorder sales bought. Deal notes and lost reasons live in the CRM. Decisions live in docs, chat threads, and the memories of whoever was in the room. None of it is in one place, none of it is versioned, and none of it is in a format an AI tool can be pointed at wholesale.

Engineers solved this exact problem for coding agents over the last two years: they wrote context files, put them in the repo, and watched agent output go from generic to grounded. This series is about doing the same thing for product work. The tutorial, end to end: build a **product context repo** — a plain git repository of Markdown files that holds what your product knows about itself — then wire a pipeline that feeds it customer signals weekly, connect it to your tracker and docs, and write reusable commands that draft user stories and PRDs *from* it. This first post is the why and the what; the artifacts start in [part two](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/).

## What a product context repo is

A git repository — hosted anywhere your company already hosts code — containing only text files. No app, no database, no vendor. A first cut looks like this:

```
product-context/
├── AGENTS.md            # how AI tools should read this repo
├── product/             # what the product is, area by area
├── personas/            # who uses it, in their own words
├── glossary.md          # what words mean HERE, specifically
├── decisions/           # what was decided, when, and why
├── signals/             # structured customer evidence, dated
├── competitors/         # what you're positioned against
└── templates/           # story, PRD, and brief formats
```

Three properties make this boring structure powerful, and all three come from git rather than from anything clever:

**It's readable by everything.** Plain Markdown is the one format every AI tool — chat assistants, coding agents, whatever ships next quarter — can ingest natively, today. You are not betting on a vendor's integration roadmap. Point any tool at the folder and it has your product's memory.

**It's versioned.** `git log` on your glossary is a history of how your product's language evolved. A decision file has a date and an author. When an agent (or a new PM) asks "why is it like this?", the answer is diffable. Wikis technically have history; nobody reads it. Diffs get read.

**It's owned like an artifact, not a garden.** Wikis rot because everyone can edit and no one must. A repo has pull requests, owners, and review. Small barrier, massive difference: the contents stay *deliberate*. The repo isn't where everything goes — it's where only the load-bearing things go.

## What it is not

Be precise about the boundary, because this is where the idea gets misread and abandoned:

- **It does not replace your wiki or docs tool.** Collaborative drafting, meeting notes, and long-form exploration stay where your team already does them. The repo holds the *distilled* output — the decision, not the forty comments that produced it.
- **It does not replace your tracker.** Jira, Linear, whatever you run — the tracker remains the source of truth for work state. The repo is the source of truth for *context about the product*. [Part four](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/) is about keeping that boundary crisp.
- **It is not a data warehouse.** Raw ticket exports and full call transcripts don't live here. Structured *summaries* of them do — that's the signal pipeline in [part three](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/).

The one-line test for what belongs: *would an AI tool drafting a story or PRD produce something wrong without this file?* If yes, it's context; it goes in. If no, it's content; it stays in the tool it was born in.

## Why now — the economics flipped

Five years ago this repo would have been a nice-to-have that decayed by June, because its only reader was a future colleague who might never show up. The maintenance cost was constant and the payoff was speculative.

AI assistants flipped both sides of that ledger. The payoff is now *immediate and per-use*: every story you draft, every PRD you outline, every "what do we know about churn in the mid-market segment?" question gets measurably better the day the relevant file exists. And the maintenance cost collapsed, because the same tools that read the repo can help write it — summarizing a call transcript into a signal card is a two-minute supervised task, not an evening of note-taking.

There's a sharper way to put it. **A prompt is context you retype every time; a repo is context you write once and version.** Teams that get durable value from AI in product work are not the ones with the best prompts — they're the ones whose context is structured enough that a mediocre prompt lands on rich ground. That's also the honest answer to AI slop, which gets a full post ([part six](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/)): slop is what a model produces when it has fluency and no facts. You can't review slop away faster than a model generates it. You can starve it of the conditions that produce it.

## The maturity ladder

You don't build this in a quarter, and you shouldn't try. The stages, each useful on its own:

1. **A folder of truth.** The repo exists with a glossary, five persona files, and ten decision records. Even with zero automation, this beats what most teams have. A week of honest effort.
2. **A signal habit.** Once a week, customer evidence — ticket themes, call takeaways, CRM lost reasons — gets distilled into dated, structured signal files. This is the pipeline post, and it's the highest-leverage stage of the ladder.
3. **Connected tools.** Your AI assistant can read the repo *and* query the tracker, docs, and chat in the same session — draft grounded in context, filed where work lives.
4. **Commands.** The repeated workflows — draft a story, draft a PRD, summarize the week's signals — become versioned command files in the repo itself, so the whole team invokes the same grounded workflow instead of freelancing prompts. That's [part five](/product-management/commands-that-write-user-stories-and-prds-with-real-context/).

Each stage pays for itself before the next one starts. If the series convinces you of only stage one, you'll still be ahead.

## Where this series goes

- **[Part 2 — Designing the structure](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/):** the folder layout, file formats, and the `AGENTS.md` that teaches AI tools to navigate it.
- **[Part 3 — The signal pipeline](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/):** turning support tickets, call transcripts, sales calls, and CRM data into structured, quotable evidence — weekly, in under an hour.
- **[Part 4 — Connecting the tools](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/):** wiring your tracker, docs, and chat to the repo without creating a sync monster.
- **[Part 5 — Commands](/product-management/commands-that-write-user-stories-and-prds-with-real-context/):** reusable, versioned commands that draft user stories and PRDs with the repo as ground truth.
- **[Part 6 — Avoiding AI slop](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/):** the editorial discipline — grounding rules, citation requirements, and the story-writing craft that AI drafting makes *more* necessary, not less.

One warning before part two, because it decides whether this works at all: the repo is a *product artifact with an owner*, not a team wiki with a hopeful README. You are the maintainer. You review what merges. The moment it becomes everyone's dumping ground it becomes no one's source of truth — and everything downstream in this series inherits the rot.
