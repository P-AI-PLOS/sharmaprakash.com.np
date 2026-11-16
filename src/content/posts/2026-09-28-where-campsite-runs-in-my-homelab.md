---
title: "Where Campsite Runs: VMs, Placement and Failure Domains in My Homelab"
date: "2026-09-28T18:00:00+05:45"
last_modified_at: "2026-11-16T21:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "XCP-ng", "Synology", "failure domains", "capacity planning"]
excerpt: "Campsite's runtime lives on one VM, its PostgreSQL cluster spans two hosts, and nothing is exposed to the internet. Here's what lives where and what breaks when a machine goes away."
series: campsite-for-agents
seriesOrder: 2
cover: "/images/blog/campsite-for-agents/where-campsite-runs-in-my-homelab/cover.png"
thumb: "/images/blog/campsite-for-agents/where-campsite-runs-in-my-homelab/thumb.png"
use_featured_image: false
draft: false
comments: true
share: true
---

[Part 1 covers why I run Campsite for my agents](/homelab/why-i-self-host-campsite-for-ai-agents/). This part covers the machines underneath it. For the hardware itself, see [Inside My Homelab](/homelab/my-homelab-hardware-and-network/) and [the multigig upgrade](/homelab/my-homelab-10g-minisforum-upgrade/).

## Hosts and VMs

Campsite runs on XCP-ng virtual machines across two hosts, **Talokan** and **Asgard**, with the Synology NAS providing S3-compatible object storage.

| VM | Host | What it runs |
|---|---|---|
| **Quill** | Talokan | API, web app, background workers, sync and helper services, and an etcd member |
| **Groot** | Talokan | PostgreSQL member `campsite-pg-a` (Patroni) |
| **pg-b** | Asgard | PostgreSQL member `campsite-pg-b` (Patroni) |

The application never writes uploads to Quill's disks. Files go to object storage on the NAS and are read back from it. That keeps the runtime VM disposable: rebuild it, redeploy, and nothing is lost.

[Part 4 covers the PostgreSQL cluster in detail](/homelab/campsite-mysql-to-postgresql-patroni/).

## Memory ceilings, not guesses

Every container has a memory limit. The limits are ceilings, not measurements, but they tell me the worst case when I'm deciding whether something new fits on a VM.

When a VM needs more room, I read each host's free memory from the hypervisor API before changing anything. Remembered numbers go stale: a host that "has plenty of RAM" in my head may have picked up two guests since. A read-only query takes seconds and gives me a number with a date next to it. The same readback decides placement, which is why the second database member sits on a different host from the first.

## Search gets its own disk

Elasticsearch 9.5 needs kernel seccomp support that the Synology kernel doesn't provide, so search can't run in a container on the NAS. It runs on a Debian VM with a dedicated data disk, with Docker's storage moved onto that disk too.

Everything in Campsite's search indices can be rebuilt from the database. So upgrades and rebuilds don't need Elastic's upgrade ladder: start a fresh node, reindex from the application, and compare document counts with what the application should have indexed.

A healthy single-node cluster reports yellow when indices ask for replicas it can't place. An index template that sets zero replicas makes it green.

## Private by default

Campsite has no public ingress.

- Caddy on Heimdall, the lab's DNS and reverse-proxy VM, terminates TLS for private `*.camp.home` names and forwards to Quill.
- Uploads and media use their own `camp.home` names to reach object storage.
- Elasticsearch accepts connections only from the application, with a credential.

Away from home, I reach it over Tailscale like anything else in the lab. Mail goes through an internal relay that only accepts an internal domain, which suits a deployment whose other users are mostly agents.

## What breaks when a machine goes away

| Failure | What happens |
|---|---|
| Talokan | The application is down: Quill and one database member live there |
| Asgard | One PostgreSQL member is lost; the other remains on Talokan |
| Search VM | Search is unavailable; the rest keeps working |
| Heimdall/Caddy | The private names stop resolving |
| NAS | Uploads and media fail |
| Internet | Campsite keeps working locally; outside integrations retry |
| Power | Everything; there's no UPS, so data stores get checked before writers restart |

Two points matter most.

**Database HA isn't application HA.** Patroni protects the data and shortens database recovery. It doesn't keep Campsite up if the host running the application goes away.

**The NAS is in the runtime path.** It serves files, not just backups. A backup on the same chassis as the data protects against mistakes, not against losing the chassis.

This is a small, single-site setup for a handful of people and their agents. It isn't built to survive everything, and the table above says exactly where it doesn't.

Next: [how Kamal deploys each runtime from an exact commit](/homelab/deploying-campsite-with-kamal/).

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/campsite-for-agents/where-campsite-runs-in-my-homelab/cover.png
and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. Three small
cabins on separate low islands in a calm dark lake at dusk, seen from a slight
isometric angle. Each cabin glows from within and has a distinct simple
silhouette: one busy with several lit windows (applications), one sturdy with a
heavy door (database), one with a tall lookout tower (search). Thin illuminated
rope bridges link the cabins to each other and to a larger stone storehouse on
the shore (storage). A faint dashed boundary encircles two of the islands to
suggest a shared failure domain. Cool slate, navy and deep-teal palette with a
single warm amber accent in the windows and bridges. Calm, geometric composition
with generous negative space. Matte finish, restrained palette, no neon. Aspect
ratios: 21:9 hero crop and 16:9 card crop of the same composition.
-->
