---
title: "Skills, Hooks, and the Always-On Agent: Automating the Context Repo"
date: "2026-07-28T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A prompt you retype is a workflow you can't improve, and a rule an agent is asked to follow is a rule it will eventually forget. This post packages the repo's workflows as skills, turns the non-negotiable rules into hooks that reject violations mechanically, adds a verifier agent between draft and human, and hands the schedule to a self-hosted always-on agent — so the pipeline runs whether or not you remembered."
use_featured_image: false
series: pm-context-repo
seriesOrder: 5
---

Everything so far — [structure](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/), [signals](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/), [connections](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/) — assumed a human in the driver's seat, typing the right prompt at the right time. This post removes that assumption in three layers, in the order engineers learned to remove it for coding agents: **skills** make the workflows repeatable, **hooks** make the rules unbreakable, and a **scheduled, always-on agent** makes the pipeline run on the calendar instead of on your memory. All three live in the repo, versioned like everything else.

## Skills: workflows as files

A skill is a folder — an instruction file plus whatever templates and scripts the workflow needs — that an AI assistant loads when the task matches. The format (a `SKILL.md` with frontmatter, now a vendor-neutral open standard) is supported across the major assistants, which matters more than any single feature: **a skill you write once runs in your CLI agent, your chat assistant, and the self-hosted daemon at the end of this post.** One library, every surface.

Why files instead of a prompt you've gotten good at? Three properties you can't get any other way. **Consistency:** every story your team drafts loads the same context and emits the same format — the intern and the founder invoke identical discipline, and because skills trigger on task description, the intern doesn't even need to know the skill's name. **Improvability:** when output disappoints, you diff and fix the skill, and the fix compounds for everyone; a retyped prompt improves nothing. **Reviewability:** the skill *is* your process, written down — arguing about how stories should be written becomes a pull request instead of a meeting.

The repo's `skills/` directory starts with three:

```
skills/
├── story-writing/
│   ├── SKILL.md              # the workflow below
│   └── templates/user-story.md
├── prd-drafting/
│   ├── SKILL.md
│   └── templates/prd.md
└── signal-extraction/
    ├── SKILL.md              # part three's extraction passes
    └── templates/signal-card.md
```

`story-writing/SKILL.md`, the one you'll invoke most, in full:

```markdown
---
name: story-writing
description: Draft a user story for <product>, grounded in the
  context repo. Use whenever asked to write, draft, or refine
  a user story or backlog item.
---

## 1. Load context (before anything else)
- AGENTS.md and glossary.md
- The product/areas/ file for the affected area
- The last 4 weekly digests in signals/, plus signal cards
  tagged with this area from the last 90 days
- decisions/ records touching this area
- Tracker: open items in this area, to flag duplicates

## 2. Interrogate the request
If any of these can't be answered from the request plus the
loaded context, ASK — do not guess:
- Who is the user? (a persona from personas/, or say the
  personas don't cover them)
- What are they unable to do today, and what evidence says
  so? (signal IDs)
- Why now — what makes this worth doing this quarter?
- What is explicitly OUT of scope?

## 3. Output: templates/user-story.md, which requires
- Evidence: signal card IDs, one verbatim quoted. Claims
  without a card are labeled ASSUMPTION.
- Acceptance criteria: 3–6, Given/When/Then, each
  independently testable, none restating the title.
- Out of scope: at least one real thing this story does NOT
  do, chosen because someone might assume it does.
- Sharp edges touched: constraints from the area file this
  story brushes against, or "none found."

## 4. Guardrails
- Never contradict a decisions/ record or a "What we will
  NOT do" section — surface the conflict and STOP.
- No invented metrics, quotes, or product behavior.
- Tracker writes: ai-drafted label, triage state, always.
```

Two design choices do the heavy lifting. **Step 2 makes the skill interrogative, not generative** — the most common failure of AI drafting is a fluent answer to an underspecified request, and forcing questions-before-drafting is the fix. It also quietly teaches: the skill asks juniors the same questions a senior product owner would. **The Evidence and Sharp-edges sections make review fast** — a reviewer checks cited cards and flagged constraints in two minutes instead of fact-checking free prose. The `prd-drafting` skill follows the same skeleton with a wider load and four extra rules; you'll see it run end-to-end in [part seven](/product-management/walkthrough-a-prd-from-signal-to-sign-off/).

One discipline: **the third time you type a prompt, it becomes a skill.** Skills you actually needed get maintained; skills you imagined needing rot exactly like wiki pages.

## Hooks: rules that don't rely on being remembered

`AGENTS.md` rules are advisory — a model asked to behave. For most rules that's fine. But the system has a handful of laws where "usually obeys" isn't good enough, and for those the agent harness gives you **hooks**: scripts that run automatically around agent actions and can *reject* them. A hook isn't guidance; it's a gate. The four worth writing, in rising order of importance:

- **Frontmatter validation.** A signal card missing `id`, `source`, `segment`, or `severity` fails the pre-write hook with a message saying what's missing. Malformed evidence never enters the ground truth.
- **Anonymization scan.** Card content is checked against simple patterns (email addresses, known account names from a private list held outside the repo) before write. The privacy rule from part three stops depending on the extraction prompt behaving.
- **Citation check.** A story or PRD draft containing customer claims but zero `SIG-` references — and no `ASSUMPTION` labels — is rejected before it's written. "No claim without a card" stops being editorial policy and becomes physics.
- **Write-destination guard.** Any tracker write missing the `ai-drafted` label, or any attempt to write repo files outside a branch, is blocked. The staging convention from part four can no longer be forgotten under deadline.

This is the same lesson engineering teams learned the hard way: a rule in a context file gets forgotten two prompts later; a hook can't be. Write the advisory version first, watch where it slips, then harden exactly those spots.

Between draft and human sits one more mechanism worth its cost: a **verifier pass** — a second agent, prompted only to check, never to fix. It resolves every citation to a real card, hunts invented numbers, and diffs the draft against decision records. Splitting drafter from verifier catches what a single context misses, and it turns your review into ruling on flagged items rather than re-deriving the whole draft.

## The always-on agent: owning the calendar

The weekly pipeline still needs a trigger, and "the PM remembers on Mondays" is the weakest joint in the system. Two ways to remove it, and they compose:

**Scheduled runs in your existing assistant.** Every major agent harness now does cron-style scheduled sessions: Monday 07:00, run `signal-extraction`, open the PR, post the digest summary. Zero new infrastructure; this is the right first step.

**A self-hosted always-on agent** — Hermes, OpenClaw, or similar — when you want the pipeline to have a *home* rather than a schedule. These run unattended on a cheap VPS, carry their own cron, speak MCP, are model-agnostic, and — because they follow the same skills standard — **run the exact skills from your repo.** What the daemon adds over scheduled runs is the chat surface: it lives in your messaging apps, so the Monday digest arrives as a message you approve by replying, and `what do we know about reporting pain in mid-market?` is answerable from your phone, hallway, before the meeting. The repo stops being a place you go and becomes a colleague you message.

Model-agnosticism is quietly the budget lever: volume work (clustering four hundred tickets) runs on a cheap model; judgment-adjacent drafting stays on a frontier one. Same skills, routed by job.

Three boundaries keep the daemon honest. **Its writes obey the same gates** — PRs to the repo, staging states in the tracker, nothing autonomous in chat beyond configured broadcasts. **Its memory is operational scratch** (which exports ran, who to ping), never a shadow context store — the repo stays the single ground truth, per part four's one-truth rule applied to the agent itself. **Its credentials are scoped like a contractor's,** not an admin's.

## What this actually changes

The division of labor lands cleanly: **interactive sessions for judgment work** — stories, PRDs, grooming conversations, everything in arc two — and **the scheduled agent for pipeline work**, both reading the same repo, both writing through the same gates. Your recurring cost drops to two reviews a week: the signal PR and whatever the verifier flagged.

Which surfaces the real question. When drafting is free, running on schedule, and mechanically rule-checked, what's left is the part no hook can enforce: whether the artifacts are *true*, and whether the judgment in them is yours. That's [part six — avoiding AI slop](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/), the last piece of the system before arc two puts it all to work.
