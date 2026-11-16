---
title: "Four Hermes Instances, One Model"
date: "2026-11-18T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Hermes", "AI agents", "harness engineering", "XCP-ng"]
excerpt: "Engineering, product, growth and a personal assistant run as four separate Hermes instances on the same model. Each has its own VM, profiles, skills and boards, and a narrow way to reach the others."
series: hermes-agent-factory
seriesOrder: 2
cover: "/images/blog/hermes-factory/potts-dashboard-sessions.webp"
thumb: "/images/blog/hermes-factory/potts-dashboard-sessions.webp"
use_featured_image: true
draft: false
comments: true
share: true
---

[Part 1](/homelab/agents-are-not-cron-jobs/) argued that the harness, not the schedule, is what makes an agent. This part shows the harnesses: four Hermes instances that share a model and almost nothing else.

## Why separate instances

One Hermes gateway can host many profiles. I could have put every agent on one VM. I didn't, for three reasons.

**Blast radius.** A profile on the same gateway shares the same OS account, files and credential pool. On my setup, Hermes profiles that share an OS account are not a credential boundary. A separate VM is.

**Focus.** An agent with fifty skills picks the wrong one more often than an agent with ten. Each instance carries only what its job needs.

**Ownership.** Each instance has a lead profile that owns its work: an engineering manager, a Head of Product, a Head of Growth and a personal assistant. When something lands in the wrong place, the owner knows to pass it on.

## Where they run

All four are Debian VMs on Talokan, the Minisforum host in my [homelab](/homelab/my-homelab-hardware-and-network/). Product, growth and the assistant each have 4 vCPUs, 4–8 GiB of ballooning memory and an 80 GiB disk. Engineering is the busiest of the four and also carries the estate maintenance board.

| Instance | VM | Lead | What it holds |
|---|---|---|---|
| Engineering | `factory` | `@em` | 52 pinned engineering roles, the `homelab` board, PR feedback, error intake, NAS operations |
| Product | `factory-product` | `@hop` | 11 research and discovery profiles, its own intake board |
| Growth | `factory-growth` | `@hog` | Growth profiles, an approval-gated sender with a kill switch, its own intake board |
| Assistant Hub | `assistant-hub` | `@potts` | The Potts assistant, Calendar, Finance, Contacts, Research and Jobs specialists, mail ingest |

Each runs its own Hermes gateway, its own dashboard and its own Kanban boards. The product and assistant instances run Hermes as an unprivileged user with a bubblewrap terminal sandbox on every profile.

![The Potts dashboard on Assistant Hub, showing recent chat and Kanban sessions, including the Google Photos migration work.](/images/blog/hermes-factory/potts-dashboard-sessions.webp)

## Same model, different behaviour

The lead profiles can all use Claude through my subscription, and Potts runs on Claude Opus. Yet ask each the same question and you get different work.

Ask Potts to install a package on the NAS and it won't try. Its profile and skills say NAS work goes to engineering. Ask EM the same and it creates a Kanban card for the infrastructure engineer, because EM coordinates and doesn't implement. Ask the Head of Growth for a launch email and it drafts one, but its sender won't deliver without approval.

None of that comes from the model. It comes from four things each instance defines for itself:

1. **SOUL and profile.** Who the agent is, what it owns and what it refuses.
2. **Skills.** Potts has `potts-triage`, `potts-digest`, `potts-inbox-cleanup` and `potts-photo-migration`. Engineering has none of them.
3. **Toolsets.** The scheduled mail worker on Potts gets only its mail tools. EM gets Kanban tools. A room turn on engineering can't run engineering commands without an admitted Kanban claim.
4. **Boards.** Work lives on the owning instance's board: `homelab` for engineering, `factory-product`, `factory-growth`, `potts-ops` for the assistant, and `nas-ops` for NAS jobs.

## How they reach each other

Separation is only useful if the instances can still collaborate. There are two narrow paths.

**The room.** Engineering's gateway owns a room called Factory HQ. Product, growth and Potts join it as remote members. Engineering reaches each one through a dedicated route on my reverse proxy that accepts only the engineering VM as a source. Each membership is pinned to a room, member, profile and installation, the grant renews every six hours, and remote room turns carry text only. API keys stay on each member's own VM.

**Task transports.** For work that needs credentials, an instance submits a durable task instead of a chat message. Potts uses a `potts_nas_task` tool that submits to engineering's `nas-ops` board. The SSH key behind it can only run that one transport command, only from the assistant VM, with no shell. The tool runs outside the terminal sandbox, so the model never sees the key.

That split matters. A room message is a request. A task on a board is a record with an assignee, retries and a receipt. My engineering instance treats them differently: a room message doesn't prove a card was admitted, implemented or reviewed.

## What stays outside the four

Two things run alongside these instances and aren't part of them.

The **estate maintenance board** runs on the engineering VM as a separate Hermes user. It has 29 profiles: a butler, 21 host stewards and seven specialists. They work inside a Saturday 00:25–06:00 window, and a root-owned broker holds the host keys and checks each request against a live task before running anything.

**Campsite** is where long-form agent output lives: docs, reports and posts, read through its MCP server. I covered that in the [Campsite series](/homelab/why-i-self-host-campsite-for-ai-agents/). For conversation with agents, I use Hermes.

## What I'd do again

Start with one lead profile per instance, and give it the authority to say "not mine, passing to X." The rest — skills, boards, transports — follows from knowing who owns what.

Next: [steering all four from one place](/homelab/steering-hermes-agents-from-rooms/).
