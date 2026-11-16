---
title: "One Skill Registry for Every Harness"
date: "2026-11-20T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Hermes", "AI agents", "agent skills", "Claude Code", "Codex"]
excerpt: "Claude Code, Codex, Hermes and Pi get their agents and skills from one registry. Upstream skill packs are pinned to exact commits and never patched; changes are forks with provenance."
series: hermes-agent-factory
seriesOrder: 4
cover: "/images/blog/hermes-factory/potts-skills.webp"
thumb: "/images/blog/hermes-factory/potts-skills.webp"
use_featured_image: true
draft: false
comments: true
share: true
---

[Part 3](/homelab/steering-hermes-agents-from-rooms/) showed four Hermes instances working together. They aren't the only agents I run. Claude Code and Codex do most of my coding on the Mac, and Pi runs alongside them. All four harnesses need the same engineering roles and many of the same skills.

Copying skill folders between harnesses works for about a week. Then one copy gets a fix, the others don't, and nobody knows which is current. So everything comes from one registry.

## One source, generated per harness

The registry is a directory in my company monorepo. Each agent, skill, tool or hook is a folder with an `ASSET.md` file. Its frontmatter says what the asset is, which practice it belongs to and which harnesses it supports.

A build step generates native artifacts for each harness from those sources:

- **Claude Code** gets agents and skills as a plugin.
- **Codex** and **Pi** get their own formats from the same role and skill sources.
- **Hermes** gets native roles and skills, plus an exporter that produces an immutable, revision-pinned skill bundle for any instance that wants one.

The generated files carry metadata saying they were generated. I don't edit them. A change goes into the registry source, through review, and is exported again. The installer has `install`, `doctor` and `rollback` commands, so a bad export can be backed out.

## Upstream skills, pinned and untouched

A lot of good skills already exist. I use several public collections:

| Source | What I take from it |
|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | Anthropic's official skills, including document handling |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Engineering workflow skills |
| [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | Product management skills |
| [trailofbits/skills](https://github.com/trailofbits/skills) | Security review skills |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | React and web interface guidelines |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | A reference source I fork from, not install |
| [oraios/serena](https://github.com/oraios/serena) | Code navigation for agents |

Each has a `MANIFEST.yaml` in the registry. It records the upstream repository, an exact 40-character commit SHA, the date it was pinned, the licence and one rule: `local_patch_policy: none`. The validator rejects branch names, and it rejects any manifest that allows local patches.

The vendor content itself isn't copied into the repo. The manifest pins the exact commit each installed copy is at, so the pin is real without duplicating anyone's tree. Claude plugin marketplaces are handled the same way.

Updating a vendor means pulling upstream, reading the changelog since the pinned commit, checking licences on anything that changed, then bumping the SHA and date.

## Changes are forks with provenance

Sometimes an upstream skill is close but wrong for my setup. I never patch it in place. I fork it into the registry and record where it came from.

My `slo-design` skill started as `slo-architect` from the claude-skills collection. Its `ASSET.md` carries a provenance block with the source repository, commit, path and adoption date. From then on it's mine to maintain, and anyone reading it can diff it against the original.

The same pattern works outside the registry. On the homelab side, a small script generates Hermes skills from a pinned checkout of the simcraft toolkit. It keeps the upstream body and only rewrites paths to point at a read-only copy on each host. A `--check` mode fails if the committed output no longer matches what the script would generate.

![Potts's skills page filtered to "potts": six assistant-only skills for digest, Google connection, inbox cleanup, NAS operations, photo migration and triage.](/images/blog/hermes-factory/potts-skills.webp)

Not every skill goes through the registry. Assistant skills like the ones above are built for Potts alone and live with the Potts plugin. Part 5 covers why.

## skill-doctor: is a skill actually working?

A registry makes it easy to add skills. It doesn't tell you whether any of them help. For that I use `skill-doctor`, itself a fork from claude-skills with provenance.

It reads real Claude Code and Codex session history, works out which skills fired, scores sessions for efficiency and code quality, and proposes edits. The useful part is its filing bar, kept from upstream: **a speculative change is worse than none.** It only proposes an edit when a missing or wrong instruction caused a real failure, and when a competent agent with the current instructions would still fail the same way. Edits stay small, and replacing guidance is preferred over appending another paragraph.

My fork changed three things. The Codex session parser now reads the current session format, which raised the sessions it could analyse on a 30-day sample from 104 to 540. Its governance notes point at the registry's promotion and vendor rules. And its workflow knows which session sources this machine has.

When skill-doctor flags a problem in a vendor skill, the fix is never to edit the vendor copy. It's a fork, or a note to upstream.

## Why this matters for the factory

The four Hermes instances run the same engineering roles that my coding agents use on the Mac. When the infrastructure engineer on Hermes picks up a NAS card, it follows the same role contract as the infrastructure engineer Claude Code would use for the same job. A fix to that role reaches every harness on the next export.

That consistency is what lets the instances differ where they should. The shared roles stay identical everywhere; the profile, scoped skills and permissions around them are what change.

Next: [assistant-only work on Potts](/homelab/assistant-only-work-calendar-and-inbox/).
