---
title: "Where Campsite Runs: VMs, Placement and Failure Domains in My Homelab"
date: "2026-09-28T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "XCP-ng", "Synology", "failure domains", "capacity planning"]
excerpt: "Campsite runs across three virtual machines on two XCP-ng pools, with storage on a Synology NAS and nothing exposed to the internet. Here's what lives where, why, and what breaks when each machine goes away."
series: campsite-for-agents
seriesOrder: 2
cover: "/images/blog/campsite-for-agents/where-campsite-runs-in-my-homelab/cover.png"
thumb: "/images/blog/campsite-for-agents/where-campsite-runs-in-my-homelab/thumb.png"
use_featured_image: false
draft: false
comments: true
share: true
---

I use Campsite as a shared workspace where my agents and I can read and write updates. This article focuses on the machines underneath that setup; [the background on why I chose a self-hosted team workspace for agent conversations is here](/homelab/why-i-self-host-campsite-for-ai-agents/).

The short version: three purpose-built virtual machines, spread over two hypervisor pools, with the NAS holding files and git. It's small, it's private, and it is not highly available. Knowing exactly where it isn't is most of the point of this post.

If you haven't read about the hardware itself, [Inside My Homelab](/homelab/my-homelab-hardware-and-network/) covers the Intel hosts, the NAS and the network, and [the multigig upgrade](/homelab/my-homelab-10g-minisforum-upgrade/) covers the newer AMD hardware.

## The hosts underneath

Campsite touches four physical machines:

- **talokan**, an AMD host that forms an XCP-ng pool on its own;
- **asgard** and **knowhere**, the two small Intel hosts that form a second XCP-ng pool;
- **vyas**, the Synology NAS, which provides storage, backup space, the Forgejo git server and S3-compatible object storage through Garage.

A separate builder VM does image builds and runs the private container registry. [The deployment walkthrough explains how Kamal builds and releases each runtime](/homelab/deploying-campsite-with-kamal/).

## Three VMs, three jobs

I split Campsite into three guests, named in the same Marvel theme as the rest of the lab:

| VM | Host | What it runs |
|---|---|---|
| **Quill** | knowhere | Every application runtime: API, background worker, web app, sync server, styled-text service, HTML-to-image |
| **Groot** | talokan | MySQL 8.4 and Redis |
| **Mantis** | talokan | Elasticsearch 9.5 |

Object storage stays on vyas. The web app and the API never write files to Quill's disks. Uploads go to Garage, and media is read back from it.

```text
                 private *.camp.home names (Caddy on Heimdall)
                                   │
          ┌────────────────────────┼─────────────────────────┐
          │                        │                         │
  ┌───────▼────────┐      ┌────────▼────────┐       ┌────────▼────────┐
  │ Quill          │      │ Groot           │       │ vyas (NAS)      │
  │ on knowhere    │─────▶│ on talokan      │       │ Garage (S3)     │
  │ api · worker   │      │ MySQL · Redis   │       │ Forgejo         │
  │ web · sync     │      └─────────────────┘       │ backups         │
  │ styled-text    │      ┌─────────────────┐       └─────────────────┘
  │ html-to-image  │─────▶│ Mantis          │                ▲
  └───────┬────────┘      │ on talokan      │                │
          │               │ Elasticsearch   │                │
          │               └─────────────────┘                │
          └──────────────── uploads and media ───────────────┘
```

Each application runtime has a memory ceiling. On Quill: 768 MiB for the API, 512 MiB each for the web app, worker and HTML-to-image, and 256 MiB each for sync and styled-text. That adds up to 4.6 GiB before Kamal's proxy and the operating system. On Groot, MySQL is capped at 1 GiB and Redis at 384 MiB. Elasticsearch on Mantis gets 2 GiB with a 1 GiB heap.

These are ceilings, not measurements. They tell me what the worst case looks like when I'm deciding whether something new fits.

## Why the database and search moved off the NAS

The first version of this deployment leaned on the NAS more heavily. Elasticsearch ran in a container on vyas. That stopped working at version 9.5: Elasticsearch now requires kernel seccomp support that the Synology kernel doesn't provide. The container would not start.

Rather than fight the NAS kernel, I gave Elasticsearch its own VM. Mantis runs a current Debian with an 80 GiB data disk just for search. I also moved Docker's storage onto that disk, because the small boot disk couldn't even hold the pinned Elasticsearch image.

The upgrade itself was simpler than it sounds. Elastic doesn't support jumping from 8.8 straight to 9.x; the documented route goes through 8.19. But everything in Campsite's search indices can be rebuilt from the database. So I skipped the upgrade ladder entirely: booted a fresh 9.5 node on an empty disk, reindexed from the application, and compared document counts with what the application should index. Posts came back 768 of 768 and notes 68 of 68.

One small surprise: a healthy single-node cluster reported yellow, not green. Every index asked for a replica, and there was no second node to hold it. An index template that sets zero replicas fixed it.

Groot got the same treatment for the database: a dedicated 40 GiB data disk for MySQL and Redis, separate from the boot disk.

## Capacity from readbacks, not memory

The PostgreSQL migration needs room for a second, isolated copy of the API and web app on Quill. [The migration write-up describes the dual-database tests, data-copy checks and Patroni layout](/homelab/campsite-mysql-to-postgresql-patroni/). Quill had 4 GiB and, inside the guest, 861 MB available. That wasn't going to be enough.

Before changing anything, I read the free memory of each host from the hypervisor API rather than from my notes:

| Host | Free memory (24 September 2026) |
|---|---:|
| asgard | 4.55 GiB |
| knowhere | 5.74 GiB |
| talokan | 1.38 GiB |

Knowhere had the headroom, so Quill went from 4 GiB to 6 GiB. The change needed a clean shutdown, a memory-limit change and a start: about a minute of downtime for everything on Quill. All eleven containers came back (Quill isn't dedicated to Campsite) and every Campsite health endpoint returned 200.

The same readback also decided where the new PostgreSQL standby would go. Talokan had 1.38 GiB free, which rules it out, and a standby on the same host as the primary wouldn't protect against much anyway. The standby went to a new VM pinned to asgard.

I've been caught by remembered numbers before. A host that "has plenty of RAM" in my head may have picked up two VMs since. A read-only query takes seconds and gives me a number I can write down with a date next to it.

## Private by default

Campsite has no public ingress. Everything is served on private `*.camp.home` names:

- Caddy on Heimdall, the lab's DNS and reverse-proxy VM, terminates TLS for the `camp.home` names and forwards application traffic to Quill.
- Uploads and media go through their own `camp.home` names to Garage on the NAS.
- Elasticsearch is reachable only by the application host that needs it, and it requires a credential.

The deployment used to sit behind a Cloudflare Tunnel. That route is gone. When I'm away from home, I reach Campsite the same way I reach anything else in the lab: over Tailscale, through the NAS acting as a subnet router.

Mail works the same way. Campsite sends through a mail server running on the NAS, reachable only inside the lab, and it only accepts mail for an internal domain. Signup confirmations therefore reach internal addresses and nothing else. That suits a deployment whose other users are mostly agents.

## What breaks when a machine goes away

Here's the part I care about most. For each failure, what happens and how I recover:

| Failure | What happens | Recovery |
|---|---|---|
| Quill or knowhere down | Campsite is down: every runtime lives there | Bring it back; check the data stores before starting the worker |
| talokan down | Campsite is down: no database, no Redis, no search | Bring it back; check MySQL and Redis before the apps |
| Mantis only | Search is unavailable; the rest keeps working where it can | Rebuild the VM or the index, then reindex |
| Heimdall/Caddy | The private names stop resolving | Restore Caddy and verify the routes |
| vyas | No uploads or media; backups fail | Restore the NAS path, then rerun missed backups |
| Internet | Campsite keeps working locally; outside integrations retry | Reconcile provider jobs afterwards |
| Power | Everything; I have no UPS, and ordered restart isn't verified | Check data stores first, then start writers |

Two things stand out in that table.

First, talokan is the heaviest single point of failure. It holds the database, Redis and search. The PostgreSQL cluster in part 4 puts a second database member on asgard, but Redis and Elasticsearch stay single-instance on talokan for now. Database high availability alone won't keep Campsite up if talokan dies. I'll come back to that.

Second, the NAS is part of the runtime path, not just somewhere backups go. It serves files, it hosts git, and it holds the backup copies. A backup on the same chassis as the thing it backs up protects against mistakes, not against losing the chassis.

## Things I'd call out honestly

This is a small, single-site topology for a handful of people and their agents. It isn't a cluster, and the documentation says so.

The recovery targets I've written down are a 24-hour recovery point and an 8-hour recovery time. They're planning baselines for this load, not measured results. The recurring backups that would make that recovery point real are designed but not yet running.

The homelab itself has been doing its own testing for me. During this work, one hypervisor host went down and came back, and a VLAN became unreachable from my laptop in the middle of a rollout. Each time, I stopped and re-verified what was running before carrying on.

For the release process, see [how the Kamal configuration separates API and worker deployments, pins images to commits and checks secrets before release](/homelab/deploying-campsite-with-kamal/).

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
