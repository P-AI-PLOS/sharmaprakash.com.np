---
title: "Letting Coding Agents Build It: An Orchestrator, Parallel Lanes and Verification Over Trust"
date: "2026-10-01T18:00:00+05:45"
last_modified_at: "2026-11-16T21:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "AI agents", "Claude Code", "Codex", "cmux", "git worktrees"]
excerpt: "Much of the Campsite work in this series was implemented by coding agents in parallel worktrees, coordinated by another agent. What made it work was re-checking every result before it merged."
series: campsite-for-agents
seriesOrder: 5
cover: "/images/blog/campsite-for-agents/letting-coding-agents-build-campsite/cover.png"
thumb: "/images/blog/campsite-for-agents/letting-coding-agents-build-campsite/thumb.png"
use_featured_image: false
draft: false
comments: true
share: true
---

Much of the work in this series, from [the Kamal setup](/homelab/deploying-campsite-with-kamal/) to [the PostgreSQL migration](/homelab/campsite-mysql-to-postgresql-patroni/), was implemented by coding agents. Several ran at once, each in its own copy of the repository, coordinated by another agent, with me approving anything that touched live infrastructure.

## The shape of it

```text
                        me (approvals, live changes)
                                    │
                     ┌──────────────▼──────────────┐
                     │  orchestrator (Claude Code)  │
                     │  plans · briefs · verifies   │
                     └───┬───────────┬──────────┬───┘
            KICKOFF brief│           │          │
             ┌───────────▼┐   ┌──────▼─────┐  ┌─▼──────────┐
             │ lane: Codex │   │ lane: Codex│  │ lane: Codex│
             │ worktree A  │   │ worktree B │  │ worktree C │
             └──────┬──────┘   └──────┬─────┘  └──────┬─────┘
                    └──── completion signal ─────────┘
                                    │
                        independent re-verification
                                    │
                           Forgejo PR → merge
```

A Claude Code session acted as orchestrator. It split the plan into independent pieces, wrote a brief for each, launched it and checked the result.

Each piece ran as a **lane**: a Codex session in its own [git worktree](/ai/git-worktrees-branches-as-places/), opened in its own cmux workspace by a small launcher script. Two agents in one checkout trample each other. Two agents in two worktrees can't, and each lane's diff is exactly its own work.

## The brief is a contract

Every lane started from a `KICKOFF` brief with a strict format:

- **numbered outcomes**: what "done" means;
- **numbered exclusions**: what the lane must not touch;
- **the environment, pinned**: which database, Rails environment and config;
- **forbidden commands**: never print the environment, never push, never deploy;
- **a completion signal**: one command, run once as the lane's last action.

The completion signal matters more than it looks. An agent that finishes, writes a summary and goes quiet is indistinguishable from one that's stuck.

## Verification over trust

**A lane saying it's done is a claim, not a fact.** Every result was verified from outside before merge: the orchestrator reran the full test suite, reviewed the diff against the brief's outcomes and exclusions, and repeated PostgreSQL runs where the database was involved. It's the same idea as [exit 0 is not evidence](/ai/exit-0-is-not-evidence/), at a larger scale.

That caught real problems:

- **A search regression.** A plausible change returned fewer results when some matches were hidden from the searcher. The lane's own checks missed it.
- **Out-of-scope behaviour.** A diff changed behaviour the brief hadn't asked for. Checking it against the exclusions caught it.
- **Missing `pg_hba` rules.** A prepared PostgreSQL config would have blocked replication between members.

None of these was a bad agent. Each was a reasonable change nobody had checked from outside the lane.

## Live infrastructure stays gated

Lanes don't change live machines. For anything touching a VM, host, firewall or running service, a lane prepares a plan and a dry run. I review it, and the approved change runs separately. That costs some speed and buys a clear record of what was proposed, approved and run. A lane's mistake can only be a wrong plan, never a wrong change already applied.

## Lessons from what went wrong

**If a secret can reach an agent's output, eventually it will.** A lane once dumped its environment and a credential landed in a log. It was rotated. Briefs now forbid printing the environment, and [the deploy preflight checks secret names without values](/homelab/deploying-campsite-with-kamal/).

**A default you didn't write down is a coin toss.** One brief omitted `RAILS_ENV=test`, and a lane dropped a local development database. Every brief now pins the environment.

**The orchestrator needs the same guardrails.** Coordinator-side shell mistakes can leak or break things as easily as a lane's. Its commands are written out plainly so it's obvious what will run.

**Re-verify after the ground moves.** When a host restarts or a network path changes mid-rollout, check what's actually running before continuing.

The tooling improved the same way: per-lane reasoning effort, a launcher that confirms the agent process actually started instead of reading the screen, and an upfront warning about "trust this folder?" prompts that block unattended agents.

## The one practice I'd keep

Parallel lanes are useful, but they aren't what made this work. The briefs, exclusions, completion signals and above all independent verification did. **Verify every result from outside the agent that produced it.** The rest is making that cheap enough to do every time.

Back to the start: [why I self-host Campsite for my agents](/homelab/why-i-self-host-campsite-for-ai-agents/).

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/campsite-for-agents/letting-coding-agents-build-campsite/cover.png
and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. A wide
forest workshop clearing at dusk seen from slightly above. Several small,
friendly geometric robot figures work at separate parallel workbenches, each
bench inside its own softly glowing rectangular boundary on the ground,
suggesting isolated worktrees. At the head of the clearing, a taller robot
figure holds a lantern and inspects a finished object handed up from one bench,
while a single human silhouette stands beside a small gate leading to a cabin
with a server-rack glow in its window, suggesting approval before anything
reaches live infrastructure. Cool slate and deep-teal palette with a single
warm amber accent on the lantern and the bench boundaries. Calm, geometric,
slightly isometric composition with generous negative space. Matte finish,
restrained palette, no neon. Aspect ratios: 21:9 hero crop and 16:9 card crop
of the same composition.
-->
