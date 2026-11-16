---
title: "Building My AI Shed: A 10G Server Backbone and 160 GB Across Two Minisforum Hosts"
date: "2026-10-05T09:30:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "10GbE", "2.5GbE", "Minisforum", "XCP-ng", "Synology", "AI agents", "Tailscale"]
excerpt: "Why I moved my homelab to a 10G server backbone: an always-on AI shed on my tailnet, where agents, builders and local models share fast storage. Includes measured throughput."
series: building-my-homelab
seriesOrder: 2
cover: "/images/blog/building-my-homelab/ai-shed-10g.png"
thumb: "/images/blog/building-my-homelab/ai-shed-10g.png"
use_featured_image: true
draft: false
comments: true
share: true
last_modified_at: "2026-11-16T20:00:00+05:45"
---

DHH put the idea in one line:

> Every developer needs an AI shed: An always-on machine running on their tailscale network where the majority of their herdr agents are running.
>
> — [DHH (@dhh)](https://x.com/dhh/status/2106755814421565495)

That is the reason for this upgrade. My coding and assistant agents should not live on the laptop I close at night. They should run on machines that stay on, reach shared storage quickly, and are available from anywhere on my Tailscale network.

[Part 1](/homelab/my-homelab-hardware-and-network/) covers the machines. This part covers the network that joins them, because an AI shed is a place where agents, builders and CI runners all hit storage at once.

The shed is built: a dedicated server switch, a 10G link into the NAS, and two Minisforum hosts with 160 GB of memory between them.

## What runs in the shed

The agents are spread across several always-on hosts instead of one large machine:

| Host | Agent-facing work |
|---|---|
| talokan (UM760 Slim, 96 GB) | The Hermes agent factory (engineering, product, growth and the Potts assistant), the estate maintenance agents, an OpenShell sandbox, the image builder and CI runners |
| shuri (UM880 Plus, 64 GB) | Local inference on the Radeon 780M through llama.cpp, plus K3s workers in Incus |
| vyas (Synology RS1221+) | Shared storage, the Tailscale subnet router, and the Cosmo and Friday VMs |

Vyas advertises the server network to my tailnet, so each of these machines is reachable from my phone or laptop without opening a port to the internet. That covers the "on their tailscale network" half of DHH's definition. The "always-on" half is why the agent guests are set to start with their hosts.

## The network as built

[![Homelab as built: Enterprise switch port 10 connects to the TEG-S562 at 10G optical; Vyas connects at 10G SFP+; Shuri, Talokan and Asgard connect at 2.5G and Knowhere at 1G. UDR7 to Enterprise is a 2.5G trunk.](/images/blog/building-my-homelab/ai-shed-10g.svg)](/images/blog/building-my-homelab/ai-shed-10g.svg)

The TRENDnet TEG-S562 is the shed's switch. It is unmanaged and carries only the Servers network (VLAN 10), untagged. One SFP+ port takes a 10G optical uplink from the managed UniFi Enterprise switch; the other connects Vyas's 10GbE card. The four copper ports connect the compute hosts.

| Connection | Link rate | Job |
|---|---|---|
| Enterprise port 10 → TEG-S562 | 10 Gbps optical | Server-network uplink |
| TEG-S562 → Vyas | 10 Gbps SFP+ | Shared storage and backups |
| TEG-S562 → talokan | 2.5 Gbps | AMD XCP-ng host for agent VMs |
| TEG-S562 → shuri | 2.5 Gbps | Ubuntu host for local inference and CI |
| TEG-S562 → asgard | 2.5 Gbps | Intel XCP-ng host |
| TEG-S562 → knowhere | 1 Gbps | Intel XCP-ng host (gigabit NIC) |
| UDR7 → Enterprise 8 PoE | 2.5 Gbps | Router trunk for every VLAN |
| Enterprise → both access points | 1 Gbps maximum | AP uplinks |

“10G” describes the backbone and the storage link, not every device. Knowhere's gigabit NIC stays a gigabit NIC on a multigig switch. The UDR7-to-Enterprise trunk is 2.5G, so anything that leaves the server network, including internet traffic and routing to other VLANs, is still limited to 2.5G. Traffic between servers stays inside the TRENDnet and never touches that trunk.

## Measured throughput

I tested the shed with iperf3 against Vyas, using four parallel streams per host. These are network numbers, memory to memory, with no disks involved.

| Test (Gb/s) | shuri | talokan | asgard | knowhere | Total |
|---|---:|---:|---:|---:|---:|
| One host at a time, either direction | 2.35 | 2.35 | 2.35 | 0.94 | — |
| All four at once, writing to Vyas | 2.35 | 2.35 | 2.35 | 0.94 | 7.99 |
| All four at once, reading from Vyas | 1.54 | 1.37 | 2.08 | 0.81 | 5.80 |

Every host reaches its own line rate. When writing to the NAS, Vyas took the full 8 Gb/s that these four hosts can send, with its CPU around 79% busy handling the traffic. I can't saturate 10G yet, because the senders add up to 8.5 Gb/s.

Reading from the NAS is slower, and the reason is not packet loss. When a 2.5G or 1G port backs up, the switch sends flow-control pause frames to Vyas, and a pause stops everything Vyas sends, not only the traffic to the slow port. The slowest reader sets the pace for all of them. Two 2.5G hosts reading together reach 4.6 Gb/s; add the 1G host and the others slow down. Across those runs, retransmits stayed near zero while Vyas received hundreds of thousands of pause frames.

In practice the disks matter more than the network. Vyas's four 5,900-rpm IronWolf drives in RAID5 read 2.0–3.3 Gb/s locally. Over NFS, one stream gets about 1–1.4 Gb/s, and two at once get about the same in total, because parallel readers turn into disk seeks. Raising NFS read-ahead made no consistent difference. The 10G link is not what limits NAS reads; the drives are.

## Two small hosts, 160 GB of installed RAM

| Host hardware | Installed memory | Installed SSD | Network |
|---|---|---|---|
| talokan / Minisforum UM760 Slim | 96 GB DDR5-5600 (2 × 48 GB) | 2 TB | 2.5GbE |
| shuri / Minisforum UM880 Plus | 64 GB DDR5-5600 (2 × 32 GB) | 2 TB | 2.5GbE |

Agents are memory-hungry in a boring way: each one is a VM or container with a runtime, a checkout, language servers and a test suite. The older 12 GB and 16 GB Intel hosts filled up quickly with persistent services. Talokan's 96 GB lets each agent factory, builder and sandbox have its own VM with a clear budget. Shuri's 64 GB is shared between the integrated GPU and local models.

Installed memory isn't automatically available to every VM. Talokan deliberately overcommits CPU and memory for bursty guests, and each workload still has to fit its host.

## An AMD pool and a standalone Ubuntu host

Talokan is the sole member of the AMD `vibranium` XCP-ng pool. Asgard and Knowhere form the Intel `marvel-cosmos` pool. XCP-ng does not support mixing Intel and AMD hosts in one pool, so the split is a hardware boundary, not a preference. Matching hypervisors alone is not enough; hosts must also meet the [pool requirements](https://docs.xcp-ng.org/management/hosts-pools/).

Shuri sits outside both pools and runs Ubuntu on bare metal, which keeps the Radeon 780M directly available to games and local inference. Its Incus guests have their own management and lifecycle.

## Keeping the unmanaged switch on one network

The TEG-S562 has no management interface, so its role stays simple. Enterprise port 10 sends Servers VLAN 10 as its native network and blocks tagged VLANs, which makes the TRENDnet a Servers-only access switch. Asgard and Knowhere send untagged Servers traffic straight through their bridges.

The managed Enterprise switch still handles the household side, where multiple VLANs and PoE matter. The Trusted, Family, IoT, Cameras and Guest networks never touch the server switch.

## Titan stays on the macOS side

The clamshell 2018 MacBook Pro, `titan`, stays on Trusted Wi-Fi (VLAN 20). It is not a member of either XCP-ng pool and does not use a port on the TEG-S562. Its Colima environment is limited to two virtual CPUs, 4 GiB of RAM and a 60 GiB disk. It does light macOS utility work; agent workloads run on Talokan, and GPU workloads run on Shuri.

## What the shed does not solve

Vyas is still my storage anchor and Tailscale subnet router, and Heimdall still supplies `.home` DNS and the reverse proxy. A faster network doesn't remove those dependencies. If Vyas goes down, the shed loses its storage and its remote access at the same time.

The NAS is also a shared failure domain: a backup inside the same chassis is still inside the same chassis. An off-NAS copy is the gap I still need to close.

## Why this shape

An AI shed doesn't need to be one big machine. Mine is a few small, always-on hosts that share fast storage behind one Tailscale entry point. The 10G link goes where traffic converges, on the NAS. The 2.5G links go to the hosts doing the work, and the slower machines keep their roles.

I want to be able to say where each agent runs, how its data moves, and what happens when one piece is unavailable. The diagram and the measurements above are how I check that.

## Coming next

A Minisforum DEG1 dock is in hand, and an Intel Arc B70 graphics card is on its way, to give local LLMs a discrete GPU next to Shuri's Radeon 780M. The agents that run in this shed have their own series: how four Hermes instances split engineering, product, growth and personal-assistant work, and how they talk to each other.
