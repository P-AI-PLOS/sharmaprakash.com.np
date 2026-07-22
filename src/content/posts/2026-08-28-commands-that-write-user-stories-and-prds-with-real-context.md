---
title: "Commands That Write User Stories and PRDs with Real Context"
date: "2026-08-14T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "A prompt you retype is a workflow you can't improve. This post turns the repo's two highest-frequency jobs — drafting user stories and drafting PRDs — into versioned command files: what context they load, what questions they must ask, what format they emit, and the guardrails that make their output reviewable instead of just plausible. Full command files included, copy-paste ready."
use_featured_image: false
series: pm-context-repo
seriesOrder: 5
---

Everything so far — [structure](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/), [signals](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/), [connections](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/) — has been infrastructure. This post is the payoff layer: **commands**. A command is a Markdown file, versioned in the repo, that encodes one repeatable workflow — which context to load, which questions to ask, which format to emit, which rules to obey. Modern AI assistants (CLI agents and chat apps alike) support these natively as slash commands or reusable instructions; the mechanics vary by tool, but the file is just Markdown, so it ports.

Why files instead of a prompt you've gotten good at? Three properties you can't get any other way. **Consistency:** every story your team drafts loads the same context and emits the same format — the intern and the founder invoke identical discipline. **Improvability:** when output disappoints, you diff and fix the command, and the fix compounds for everyone; a retyped prompt improves nothing. **Reviewability:** the command *is* your process, written down — arguing about how stories should be written becomes a pull request instead of a meeting.

The deeper shift: a good command moves quality control *upstream of generation*. You're not correcting a bad draft; you're constraining the process so bad drafts are harder to produce. That's the structural half of the anti-slop argument [part six](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/) completes.

## Anatomy of a command

Every command worth keeping has five parts — role, context-loading, interrogation, output contract, guardrails. Here is `/story`, complete:

```markdown
# /story — draft a user story

You are drafting a user story for <product>. Follow this
process exactly.

## 1. Load context (before anything else)
- AGENTS.md and glossary.md
- The product/areas/ file for the affected area
- The last 4 weekly digests in signals/, plus any signal
  cards tagged with this area from the last 90 days
- decisions/ records touching this area
- If the tracker is connected: open items in this area,
  to flag potential duplicates

## 2. Interrogate the request
If any of these can't be answered from the request plus the
loaded context, ASK — do not guess:
- Who is the user? (a persona from personas/, or say the
  personas don't cover them)
- What are they unable to do today, and what evidence says
  so? (signal IDs)
- Why now — what makes this worth doing this quarter?
- What is explicitly OUT of scope?

## 3. Output format
**Title:** verb-first, under 10 words
**Story:** As <persona>, I want <capability>, so that
<outcome the user would recognize as their own>.
**Evidence:** signal card IDs, with one verbatim quoted.
Claims without a card are labeled ASSUMPTION.
**Acceptance criteria:** 3–6, Given/When/Then, each one
independently testable. No criterion may restate the title.
**Out of scope:** at least one real thing this story does
NOT do, chosen because someone might assume it does.
**Sharp edges touched:** which constraints from the area
file this story brushes against, or "none found."
**Open questions:** anything a human must decide first.

## 4. Guardrails
- Glossary terms exactly as defined.
- Never contradict a decisions/ record or a "What we will
  NOT do" section; if the request requires it, STOP and
  surface the conflict instead of drafting around it.
- Do not invent metrics, customer quotes, or behavior.
- Output is a DRAFT for human review. If writing to the
  tracker, use the ai-drafted label and the triage state.
```

Two design choices there do the heavy lifting. **Step 2 makes the command interrogative, not generative** — the most common failure of AI drafting is a fluent answer to an underspecified request, and forcing questions-before-drafting is the fix. It also quietly teaches: the command asks juniors the same questions a senior PM would. **The Evidence and Sharp-edges sections make review fast** — a reviewer checks cited cards and flagged constraints in two minutes, instead of fact-checking free prose line by line. You're not reading the draft asking "is this good?"; you're asking "does the evidence hold and did it miss a wall?" — a much cheaper question.

## /prd — same skeleton, bigger surface

The PRD command loads wider (overview, personas, competitors, the area file, a full quarter of signals) and emits your `templates/prd.md`. Rather than reprint it, here's where it must differ from `/story`, because these are the places PRD drafts go wrong:

- **The problem section must be assembled from signals, not from the feature idea.** The command's instruction: *state the problem using only evidence — verbatims and card IDs — before mentioning any solution. If the evidence can't carry a problem statement, say so and stop.* A PRD that can't survive this step shouldn't exist, and discovering that in ten minutes is the command working, not failing.
- **Alternatives are mandatory.** Two solution approaches minimum, with a stated reason for the recommendation. Models tend to elaborate on the first idea presented; requiring alternatives structurally interrupts that.
- **Non-goals get a first-class section**, seeded from the area file's "What we will NOT do" and relevant decision records — the PRD restates the walls it was drafted inside.
- **Metrics must come from your metric tree** ([the North Star post](/product-management/north-star-metrics-and-metric-trees/) covers building one) — name the input metric this moves, current value if known, or `TBD-needs-baseline`. Never an invented percentage. An AI-drafted PRD with confident made-up numbers is the single most embarrassing artifact this whole system can produce; this rule is why it can't.

A PRD draft from this command is a *skeleton with evidence* — the thinking is still yours. What it eliminates is the blank page and the archaeology, which were most of the activation energy anyway.

## Smaller commands you'll write next

Once the pattern clicks, the pipeline itself becomes commands: `/extract-tickets` and `/extract-call` (the part-three extraction passes, as files instead of prompts you paste), `/digest` (assemble the weekly digest from the week's cards, including the contradicts-section check against area files), `/signal-check <topic>` (everything the evidence base says about a topic, cards cited, gaps named — the ten-minute pre-read before any planning meeting), `/groom` (given a tracker item, find its evidence, flag conflicts with decisions, propose sharper acceptance criteria as a comment).

Resist the urge to build all of these speculatively. The rule: **the third time you type a prompt, it becomes a file.** Commands you actually needed get maintained; commands you imagined needing rot exactly like wiki pages.

## Iterating: treat commands like product

Your first `/story` will produce mediocre drafts. This is expected and — this is the point of files — fixable. When a draft disappoints, diagnose which *section* failed: wrong terminology → glossary gap; violated a constraint → the area file's sharp edges are incomplete; vague criteria → tighten the output contract; confident nonsense → strengthen the guardrail *and check what context was missing*, because slop is usually a context gap wearing a fluency costume.

Then commit the fix with a message that says what output problem it solves. Six months of `git log` on your commands directory becomes something genuinely rare: an empirical record of what makes machine-drafted product artifacts good, specific to your product and your team.

The system is now complete — context, evidence, connections, workflows. What remains is the discipline that keeps its output honest, because a well-tooled team can produce polished emptiness faster than anyone can review it. That's the finale: [avoiding AI slop, and the story-writing craft that drafting tools make more necessary, not less](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/).
