---
draft: false
title: "OpenSpec: Write the Contract Before the Code"
date: "2026-04-15T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Freeform prompts to an agent produce freeform code. Three commands and a human review step change that. Misunderstandings surface at proposal review, not after an hour of wrong code."
cover: "/images/blog/ai/openspec-contract-before-code.png"
thumb: "/images/blog/ai/openspec-contract-before-code.png"
last_modified_at: "2026-04-15T10:00:00+05:45"
use_featured_image: true
series: parallel-developer
seriesOrder: 3
---

You gave an agent a vague task: "add email change confirmation to the profile page." It worked for an hour. What came back was technically correct — emails did get sent — but architecturally wrong. The logic was in the controller when it should have been a service object. The cancel flow was missing entirely. The specs covered the happy path and nothing else. The diff was 400 lines across 12 files.

You didn't catch any of this at the prompt stage. You caught it at review. Now you're rewriting while the context is cold.

The agent isn't the problem. The spec is the problem. "Add email change confirmation" is not a spec.

---

## The thesis

Freeform prompts produce freeform code. An agent given room to interpret will interpret — based on the nearest example in the codebase, its training priors, and whatever it can infer from the file structure. Sometimes that inference is right. When it's wrong, you find out after the implementation.

OpenSpec is a three-command workflow that moves the ambiguity-resolution step to *before* any code is written. Three files get written. A human reviews them. The agent implements. Misunderstandings surface at minute five, not minute sixty.

---

## Three commands

```
/opsx:explore    →  thinking partner, no files written
/opsx:propose    →  writes three spec files
/opsx:apply      →  implements from the spec
```

These are Claude Code slash commands from the [OpenSpec](https://openspec.dev) workflow. The pattern is what matters — the tooling surfaces it.

---

## Step 1: Explore

Most AI workflows skip this. Explore is a *thinking partner* session — no files written, no code changed, no spec produced yet. You use it to sharpen the problem before anyone touches the codebase.

A good explore session answers:

- What's the actual problem we're solving? (Often different from the ticket description)
- What does the framework already do for free that we'd be duplicating?
- What's explicitly in scope? What's explicitly out?
- Where are the edge cases? (Cancel flow. Concurrent requests. Already-pending confirmation.)
- Which files are likely to change?

For "email change confirmation," an explore session might surface: "Devise already handles the token lifecycle — we're only adding the UI surface and the controller glue, not a mailer from scratch." That's thirty minutes of wrong code avoided before a single command is run.

Explore is a conversation. Push back on the scope. Add constraints. Clarify what "done" means.

---

## Step 2: Propose

Once the problem is clear, `/opsx:propose` writes three files under `openspec/changes/<feature-name>/`:

```
openspec/changes/email-change-confirmation-ui/
  proposal.md    ← why + what changes + impact
  design.md      ← how + decisions made + alternatives considered
  tasks.md       ← concrete checklist, one checkbox = one commit
```

### proposal.md

The "why" and "what." A well-formed proposal looks like this:

```markdown
## Problem
Users who change their email address have no confirmation step.
The change applies immediately, with no verification that the new
address is valid or belongs to them.

## Proposed Change
Add a confirmation flow: user submits new email → confirmation token
sent to new address → user clicks link → email updates atomically.

## Files That Will Change
- app/controllers/users/email_changes_controller.rb (new)
- app/services/email_change_confirmation_service.rb (new)
- app/mailers/user_mailer.rb (add confirm_email_change method)
- app/views/users/profile/_email_section.html.erb (add pending state)
- config/routes.rb (add confirmation routes)

## Out of Scope
- Resend confirmation link (follow-up issue #58)
- Admin override flow
```

Every file that will change is named before a line of code is written.

### design.md

The "how." Architectural decisions made explicit. Alternatives considered and rejected. This is where you capture things like: "We're using a service object rather than putting this in the controller because…" and "We considered using Devise's `reconfirmable` flag but rejected it because the UX required a custom cancel flow."

When an agent reads `design.md` during `/opsx:apply`, it is not making those architectural decisions anymore. They've already been made.

### tasks.md

The implementation checklist. Each checkbox is concrete enough to be a single commit:

```markdown
- [ ] Add `email_change_token` and `unconfirmed_email` columns to users table
- [ ] Create EmailChangeConfirmationService with `initiate` and `confirm` methods
- [ ] Add UsersEmailChangesController with create and confirm actions
- [ ] Add `confirm_email_change` mailer method + view template
- [ ] Update profile page to show pending email state with cancel option
- [ ] Add confirmation routes to config/routes.rb
- [ ] Write request specs for initiate, confirm, cancel, and expired token flows
```

Seven checkboxes. Seven commits. Zero ambiguity about what "done" means.

---

## The human review gate

After `/opsx:propose`, you read all three files. This is the most important step in the workflow. No code has been written yet.

What you're looking for:

- **Scope creep** — did the agent include things that don't belong in this task?
- **Missing scope** — did the cancel flow make it into tasks.md?
- **Architectural drift** — does the proposed structure match your conventions?
- **Wrong files** — are the right files listed in the impact section?

You edit what's wrong. You add what's missing. When the spec is right, you proceed to apply.

The cost of fixing a spec is minutes. The cost of fixing code that implements the wrong spec is hours. The review gate is where that savings is captured.

---

## Step 3: Apply

`/opsx:apply` reads the approved spec and implements it. Each task in `tasks.md` becomes a bead (covered in [Part 4](/ai/2026-04-16-beads-local-first-task-graph/)) and each bead becomes a commit.

The agent now has:
- The problem statement (from `proposal.md`)
- The architectural decisions (from `design.md`)
- The exact implementation sequence (from `tasks.md`)

It is not interpreting. It is executing. The output is predictable because the input is structured.

---

## Why this works for teams

The spec files are committed to git. When a teammate (or a future agent in a new session) picks up this feature, the context is not in someone's head or in a Slack thread. It's in `openspec/changes/email-change-confirmation-ui/`.

"The AI misunderstood what I asked for" becomes structurally impossible when the misunderstanding has to surface at proposal review. The spec is the contract between human intent and agent execution. Disputes about what was supposed to happen have a written record.

The explore → propose → review → apply loop typically adds about 20–30 minutes to a feature's start. Features that skip it often cost two to three hours in rework. The payoff is asymmetric and it compounds: every spec you write improves your intuition for how to write the next one.

---

## Getting OpenSpec

OpenSpec is available at [openspec.dev](https://openspec.dev). The `/opsx:` commands are Claude Code slash commands that wire into your project's `.claude/` configuration.

---

## Coming next

[Part 4: Beads — A Local-First Task Graph for Developers and AI Agents](/ai/2026-04-16-beads-local-first-task-graph/) covers the tool that turns the `tasks.md` checklist into a queryable, dependency-aware task graph. `bd ready` returns exactly what's unblocked right now — for you and for the agent.
