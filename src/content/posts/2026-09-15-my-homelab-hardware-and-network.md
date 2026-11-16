---
title: "Inside My Homelab: The Hardware, Network, and What Runs Where"
date: "2026-09-15T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "XCP-ng", "Synology", "UniFi", "networking", "Tailscale"]
excerpt: "Two Minisforum hosts, two Intel hosts, a Synology NAS and a 10G server switch run my apps, builds, agents, local AI and media. What runs where, and how it connects."
series: building-my-homelab
seriesOrder: 1
cover: "/images/blog/building-my-homelab/network.png"
thumb: "/images/blog/building-my-homelab/network.png"
use_featured_image: true
draft: false
comments: true
share: true
last_modified_at: "2026-11-16T20:00:00+05:45"
---

My homelab runs the applications I deploy, my builds and CI, a small fleet of AI agents, local inference, games and the media I watch at home. Two Minisforum PCs, two small Intel PCs and a Synology NAS share that work.

The machines depend on each other. The DNS server is itself a VM, the agents that maintain the estate run on the host they help maintain, and the NAS is both storage and a VM host. Knowing which machine supplies each dependency is what makes a reboot safe.

This is the first part of the series. It covers the hardware and what runs where; [part 2](/homelab/my-homelab-10g-minisforum-upgrade/) covers the 10G server network.

## How everything connects

[![My homelab topology: UniFi routing and Wi-Fi, a TEG-S562 10G server switch, Talokan, Shuri, Asgard, Knowhere, Vyas and Titan.](/images/blog/building-my-homelab/network.svg)](/images/blog/building-my-homelab/network.svg)

Click a diagram to zoom. Cable colours show link speed: amber 1 Gbps, teal 2.5 Gbps, blue 10 Gbps.

Internet comes through a WorldLink CPE into a UniFi Dream Router 7, which routes between the home networks and provides Wi-Fi. A USW Enterprise 8 PoE switch serves the household side and two access points. Servers sit on their own switch, a TRENDnet TEG-S562, linked to the Enterprise switch at 10 Gbps.

## The machines

| Host | Hardware | Memory | Runs |
|---|---|---|---|
| `talokan` | Minisforum UM760 Slim, Ryzen 5 7640HS | 96 GB | XCP-ng (`vibranium` pool): the agent factory, Campsite, builder and CI runners, GaugeHire, monitoring |
| `shuri` | Minisforum UM880 Plus, Ryzen 7 8845HS / Radeon 780M | 64 GB | Ubuntu: gaming, local inference with llama.cpp, Incus VMs for K3s and Aegis |
| `asgard` | Intel Celeron J4125 | 16 GB | XCP-ng (`marvel-cosmos` pool master): Heimdall, K3s control plane, a Campsite database member |
| `knowhere` | Intel N150 | 12 GB | XCP-ng (`marvel-cosmos` member): spare capacity and rollback VMs |
| `vyas` | Synology RS1221+ | 32 GB ECC | NAS (9.49 TiB, RAID5), Jellyfin, Xen Orchestra, Tailscale, and VMM guests Cosmo and Friday |
| `titan` | 2018 Intel MacBook Pro | 16 GB | Light macOS utilities on Trusted Wi-Fi |

Talokan carries most of the VMs because it has the memory. Shuri keeps its GPU for games and inference, and runs everything else in Incus VMs alongside. The two Intel hosts are small; Asgard holds the infrastructure that has to stay up, and Knowhere absorbs whatever needs room.

The names help in daily operations. “Heimdall's DNS is down” says far more than “one of the Debian VMs has a problem.”

## What runs where

| Workload | Where |
|---|---|
| DNS (AdGuard), Caddy reverse proxy, Vaultwarden, monitoring hubs | `heimdall` on Asgard, with a DNS standby (`nakia`) on Talokan |
| Applications and the LiteLLM gateway | `cosmo` on Vyas, deployed with Kamal |
| Hermes agent factory: engineering, product, growth and the Potts assistant | Four VMs on Talokan |
| Campsite (team chat and docs for agents) | `quill` on Talokan, PostgreSQL with Patroni on `groot` and `pg-b` |
| Image builds and CI runners | `builder` and `mbaku` on Talokan, a K3s CI worker on Shuri |
| K3s clusters | Control on Asgard; workers across Talokan and Shuri |
| Prometheus and Grafana | `namora` on Talokan |
| Local AI | llama.cpp on Shuri's Radeon 780M |

Each VM has explicit CPU and memory limits, so a build cannot eat all of Talokan and inference cannot starve Shuri's games.

## Vyas keeps the data

Vyas is a Synology RS1221+ with a four-disk RAID5 array: 9.49 TiB usable on `/volume1`. It holds shared files and media, and hosts the Cosmo and Friday VMs, so it sits in their runtime path, not just their backup path. It connects to the server switch at 10 Gbps.

VM disks live on each hypervisor's local storage. Backups on Vyas share the NAS's failure domain; an off-NAS copy is the gap I still need to close.

## Titan: a MacBook with a small job

Titan is a 2018 Intel MacBook Pro in clamshell mode on Trusted Wi-Fi. It runs a few macOS utilities in Colima with tight limits, plus Beszel for host and container stats. It throttles under sustained load, so nothing essential depends on it.

## Networks

Servers live on VLAN 10 (`192.168.10.0/26`). Trusted, Family, IoT and Cameras use VLANs 20, 30, 40 and 45, and the UDR7 applies the rules between them. Every server connects to the TEG-S562, so storage traffic never passes through a compute host.

## Reaching services from outside

[![Tailscale remote access through Vyas, with Heimdall providing home DNS and the reverse proxy.](/images/blog/building-my-homelab/services.svg)](/images/blog/building-my-homelab/services.svg)

Away from home I connect through Tailscale, which runs on Vyas as a subnet router. Once connected, Heimdall resolves my `.home` names and Caddy routes each request to its service. When something will not open, I check in that order: Tailscale, DNS, Caddy, then the service itself.

Next: [the 10G server network and what it actually delivers](/homelab/my-homelab-10g-minisforum-upgrade/).
