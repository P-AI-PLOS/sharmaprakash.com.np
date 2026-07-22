---
title: "The Product Context Repo: Why Your Product Knowledge Belongs in Git"
date: "2026-07-24T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Every AI tool you point at your backlog produces confident, generic garbage — not because the model is weak, but because it has never met your product. The fix isn't a better prompt. It's a repo: a plain-text, version-controlled home for everything your product knows about itself, structured so both humans and agents can read it. Part one of a twelve-part build-along."
use_featured_image: false
series: pm-context-repo
seriesOrder: 1
---

Ask an AI assistant to write a user story for your product and you'll get something that could be about anyone's product. Correctly formatted, INVEST-shaped, three acceptance criteria — and hollow. It doesn't know that your enterprise tier has a permissions model the story would break. It doesn't know that "export" in your product means something contractually specific to your largest segment. It doesn't know that the feature it's cheerfully proposing was tried in 2024 and killed for a reason someone wrote down once, in a doc nobody can find.

The instinct is to blame the model or perfect the prompt. Both are the wrong diagnosis. **The model isn't missing intelligence; it's missing context — and your context is currently smeared across six SaaS tools that neither you nor any agent can read end-to-end.** Support conversations live in your help desk. Call recordings live in whatever recorder sales bought. Deal notes and lost reasons live in the CRM. Decisions live in docs, chat threads, and the memories of whoever was in the room. None of it is in one place, none of it is versioned, and none of it is in a format an AI tool can be pointed at wholesale.

Engineers solved this exact problem for coding agents: they wrote context files, put them in the repo, added skills for the repeatable workflows and hooks for the rules that must never be broken — and watched agent output go from generic to grounded. Product work deserves the same treatment, and by mid-2026 every piece of that stack works just as well for PRDs and user stories as it does for code. This series is the build-along: a **product context repo** — a plain git repository of Markdown files holding what your product knows about itself — plus the pipeline, connections, and automation that make it the ground truth every AI-drafted artifact stands on.

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
├── templates/           # story, PRD, and brief formats
└── skills/              # the repeatable workflows, as files
```

Three properties make this boring structure powerful, and all three come from git rather than from anything clever:

**It's readable by everything.** Plain Markdown is the one format every AI tool — chat assistants, CLI agents, self-hosted daemons, whatever ships next quarter — ingests natively. You are not betting on a vendor's integration roadmap. Point any tool at the folder and it has your product's memory.

**It's versioned.** `git log` on your glossary is a history of how your product's language evolved. A decision file has a date and an author. When an agent (or a new PM) asks "why is it like this?", the answer is diffable. Wikis technically have history; nobody reads it. Diffs get read.

**It's owned like an artifact, not a garden.** Wikis rot because everyone can edit and no one must. A repo has pull requests, owners, and review. Small barrier, massive difference: the contents stay *deliberate*. And pull requests turn out to be the perfect gate for machine-drafted content too — every automated workflow in this series writes to the repo through a PR a human approves, never directly.

## What it is not

Be precise about the boundary, because this is where the idea gets misread and abandoned:

- **It does not replace your wiki or docs tool.** Collaborative drafting, meeting notes, and long-form exploration stay where your team already does them. The repo holds the *distilled* output — the decision, not the forty comments that produced it.
- **It does not replace your tracker.** Jira, Linear, whatever you run — the tracker remains the source of truth for work state. The repo is the source of truth for *context about the product*. [Part four](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/) keeps that boundary crisp.
- **It is not a data warehouse.** Raw ticket exports and full call transcripts don't live here. Structured *summaries* of them do — that's the signal pipeline in [part three](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/).

The one-line test for what belongs: *would an AI tool drafting a story or PRD produce something wrong without this file?* If yes, it's context; it goes in. If no, it's content; it stays in the tool it was born in.

## Why now — the economics flipped

A few years ago this repo would have been a nice-to-have that decayed by June, because its only reader was a future colleague who might never show up. The maintenance cost was constant and the payoff was speculative.

The current agent stack flipped both sides of that ledger. The payoff is *immediate and per-use*: every story you draft, every PRD you outline, every "what do we know about churn in the mid-market segment?" question gets measurably better the day the relevant file exists. And the maintenance cost collapsed, because the repo now largely maintains itself under supervision: a scheduled agent drafts the weekly signal cards as a pull request, hooks reject malformed files before they merge, and your role shrinks to reviewing diffs. [Part five](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/) wires all of that.

There's a sharper way to put it. **A prompt is context you retype every time; a repo is context you write once and version.** Teams that get durable value from AI in product work are not the ones with the best prompts — they're the ones whose context is structured enough that a mediocre prompt lands on rich ground. That's also the honest answer to AI slop, which gets a full post ([part six](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/)): slop is what a model produces when it has fluency and no facts. You can't review slop away faster than a model generates it. You can starve it of the conditions that produce it.

## Where this series goes

**Arc one builds the system:**

- **[Part 2 — Designing the structure](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/):** the folder layout, file formats, and the `AGENTS.md` that teaches AI tools to navigate it.
- **[Part 3 — The signal pipeline](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/):** turning support tickets, call transcripts, sales calls, and CRM data into structured, quotable evidence — with an agent doing the volume work and you reviewing diffs.
- **[Part 4 — Connecting the tools](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/):** MCP connections to your tracker, docs, and chat without creating a sync monster.
- **[Part 5 — Skills, hooks, and the always-on agent](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/):** packaging the workflows as skills, enforcing the rules with hooks, and handing the schedule to a self-hosted agent.
- **[Part 6 — Avoiding AI slop](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/):** the editorial discipline — grounding rules, citation requirements, and why judgment becomes the bottleneck.

**Arc two is a senior product owner using it, end to end:**

- **[Part 7 — A PRD from signal to sign-off](/product-management/walkthrough-a-prd-from-signal-to-sign-off/):** the full walkthrough, evidence to approved document.
- **[Part 8 — Estimation when agents do the typing](/product-management/estimation-when-agents-do-the-typing/):** what sizing means when implementation is cheap and review is scarce.
- **[Part 9 — Assembling the quarterly roadmap from signals](/product-management/walkthrough-assembling-the-quarterly-roadmap-from-signals/):** themes to Now/Next/Later, with citations.
- **[Part 10 — From PRD to tickets](/product-management/from-prd-to-tickets-acceptance-criteria-that-survive-the-sprint/):** slicing, filing, and acceptance criteria that settle arguments in advance.
- **[Part 11 — The test register](/product-management/the-test-register-tracing-acceptance-criteria-to-real-tests/):** tracing every criterion to a real test, in a file the whole team can read.
- **[Part 12 — Verifying with Playwright MCP](/product-management/closing-the-loop-verifying-releases-with-playwright-mcp/):** the product owner who walks the release herself, with a browser the agent drives.

One warning before part two, because it decides whether this works at all: the repo is a *product artifact with an owner*, not a team wiki with a hopeful README. You are the maintainer. You review what merges. The moment it becomes everyone's dumping ground it becomes no one's source of truth — and everything downstream in this series inherits the rot.
