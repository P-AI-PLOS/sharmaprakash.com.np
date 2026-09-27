---
title: "My Homelab Goes Multigig: 10G Networking and 160 GB Across Two Minisforum Hosts"
date: "2026-10-15T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "10GbE", "2.5GbE", "Minisforum", "XCP-ng", "Synology"]
excerpt: "A dedicated 10G server backbone, 2.5G compute links, and two Minisforum hosts: Talokan with 96 GB for XCP-ng and Shuri with 64 GB for Ubuntu, gaming and local AI."
series: building-my-homelab
seriesOrder: 2
cover: "/images/blog/building-my-homelab/upgrade.png"
thumb: "/images/blog/building-my-homelab/upgrade.png"
use_featured_image: true
draft: false
comments: true
share: true
---

<!-- Editorial context: commissioned in advance for October 15, 2026, written
from the requested completed-installation perspective. Installation, the NAS
10G adapter/interconnect and pool acceptance are not verified as of authoring.
This narrative is not an update to the homelab's as-built inventory. No measured
benchmarks or fabricated installation-test results are included. -->

In [the first part of this series](/homelab/my-homelab-hardware-and-network/), the most interesting line in the network diagram ran through Asgard. That small XCP-ng host was doing two jobs: running virtual machines and forwarding traffic for the NAS and Knowhere.

The new topology gives those connections a dedicated switch. The two Minisforum systems have 160 GB of RAM between them: 96 GB in Talokan for XCP-ng and 64 GB in Shuri for native Ubuntu, gaming and local AI. Each has a 2 TB SSD.

The result is a mixed-speed network: 10G where traffic converges, 2.5G to the newer compute hosts, and 1G where the existing hardware still calls for it.

## The new topology

[![Homelab upgrade: UDR7 and Vyas connect through TEG-S562 at 10G; standalone Shuri, Talokan in vibranium, and Asgard in marvel-cosmos connect at 2.5G, with Knowhere at 1G. Quinjet and Sanctuary sit above Titan on Trusted VLAN 20.](/images/blog/building-my-homelab/upgrade.svg)](/images/blog/building-my-homelab/upgrade.svg)

The TRENDnet TEG-S562 now provides the server connections. Its two SFP+ ports serve the UDR7 uplink and Vyas. The four copper ports serve Asgard, Knowhere, the UM760 Slim and the UM880 Plus.

The diagram follows the current network view: gateway and switches above, compute and storage below, and wireless equipment on the right. Its VLAN table separates the untagged Servers VLAN 10 connections through the TEG-S562 from the household trunks on the managed Enterprise/AP network. Quinjet uses Enterprise port 7 and Sanctuary uses port 4; Titan has no fixed AP association.

| Connection | Link rate | Job |
|---|---|---|
| UDR7 → TEG-S562 | 10 Gbps | Server-network uplink |
| TEG-S562 → Vyas | 10 Gbps | Shared storage and NAS traffic |
| TEG-S562 → talokan (UM760 Slim) | 2.5 Gbps | AMD XCP-ng host |
| TEG-S562 → shuri (UM880 Plus) | 2.5 Gbps | Ubuntu gaming / AI / Incus host |
| TEG-S562 → Asgard | 2.5 Gbps | Existing Intel compute host |
| TEG-S562 → Knowhere | 1 Gbps | Existing Intel compute host |
| UDR7 → Enterprise 8 PoE | 2.5 Gbps | Household, AP and PoE network |
| Enterprise 8 PoE → sanctuary (Ground Floor U6 LR) | 1 Gbps maximum | AP Ethernet uplink |
| Enterprise 8 PoE → quinjet (Prabin Floor AC Pro) | 1 Gbps maximum | AP Ethernet uplink |

Both access points have gigabit Ethernet limits, as specified in Ubiquiti's
[U6-LR](https://techspecs.ui.com/unifi/wifi/u6-lr) and
[AC Pro](https://techspecs.ui.com/unifi/wifi/uap-ac-pro) documentation.
The amber AP links in the diagram show those hardware limits, not a fresh
measurement of their negotiated speed. Their Wi-Fi radio rates are separate.

Knowhere remains a gigabit machine. Plugging its gigabit NIC into a multigig switch does not make it a 2.5G NIC. Likewise, the new Minisforum hosts have 2.5G connections; calling this a “10G homelab” describes the backbone and storage connection, not every device.

The UDR7-to-switch fibre connection uses the purchased OM3 cable and matched SFP+ modules. Vyas's faster path requires its own compatible 10G adapter and interconnect: the NAS's built-in ports are still 1GbE. The two optical ports are fully occupied in this layout.

## Two small hosts, 160 GB of installed RAM

The machines have different jobs, and both memory channels are populated:

| Host hardware | Installed memory | Installed SSD | Network |
|---|---|---|---|
| talokan / Minisforum UM760 Slim | 96 GB DDR5-5600 (2 × 48 GB) | 2 TB | 2.5GbE |
| shuri / Minisforum UM880 Plus | 64 GB DDR5-5600 (2 × 32 GB) | 2 TB | 2.5GbE |

Together, they provide 160 GB of installed memory and 4 TB of nominal local SSD capacity. Talokan runs the single-host `vibranium` XCP-ng pool. Shuri runs Ubuntu directly, with the Radeon 780M available to games and local inference, plus Incus guests. Each workload still has to fit its own host and resource limits.

Firmware reports 5600 MT/s as the configured speed of all four DIMMs, with channels A and B populated on both machines. Dual-channel operation is handled by the memory controller; there is no Linux switch to enable it. This confirms the configuration, while sustained memory bandwidth and application performance need their own measurements.

Xen sees about 93.8 GiB on Talokan, and Linux sees about 59.6 GiB on Shuri after reserved memory. Running `free -m` over SSH on Talokan shows only its management domain, dom0, which has a 3,376 MiB allocation. `xl info` shows the whole host. Existing VM, container and service limits remain explicit budgets; installing RAM does not enlarge them automatically.

My reason for this configuration is straightforward: the older 12 GB and 16 GB hosts leave relatively little room once persistent infrastructure is running. The new pair gives me more space to separate build jobs, application services and experiments into VMs with explicit resource budgets.

It does not mean every service should move immediately. DNS, storage, monitoring and build workloads have different dependencies. More available RAM makes placement easier; it does not make placement irrelevant.

## An AMD pool and a standalone Ubuntu host

Talokan is the sole member of the AMD `vibranium` XCP-ng pool. Asgard and Knowhere belong to the Intel `marvel-cosmos` pool. Shuri sits outside both pools and runs Ubuntu on bare metal.

That split gives Talokan room for builders, runners and application VMs, while Shuri keeps direct access to its integrated GPU. Shuri's 64 GB is shared by the OS, games, inference and Incus. The two populated memory channels also serve the Radeon 780M, whose performance depends on system memory bandwidth. I have not measured a before-and-after speedup for this RAM configuration.

That boundary matters. XCP-ng does not support mixing Intel and AMD hosts in one pool. Pool membership also depends on compatible host configuration and software versions; “both run XCP-ng” is not the whole admission test. The [official host and pool documentation](https://docs.xcp-ng.org/management/hosts-pools/) explains the constraints.

Xen Orchestra provides the management view across the XCP-ng pools. Moving a workload from the Intel machines to Talokan is a migration decision. Shuri's Incus guests have a separate management and lifecycle boundary.

The local SSDs also remain local storage. A pool does not automatically mirror those disks or combine them into shared storage. Shared VM disks and backups need their own deliberate configuration.

## Keeping the unmanaged switch on one network

The TEG-S562 is unmanaged, so the server side has a simple boundary: the UDR7 connection supplies the Servers network as the native network. This switch is dedicated to server traffic.

The managed Enterprise switch continues to handle the household and wireless side, where multiple VLANs and PoE are useful. The two standalone APs stay there. The server switch is not the distribution point for the Trusted, Family, IoT, Cameras and Guest networks.

This also changes the old host configuration. The previous arrangement carried tagged VLAN 10 over the direct Asgard links. The new native Servers access layout uses untagged traffic on these physical connections. A diagram that moves cables but leaves the old tagging assumptions untouched would miss a critical part of the migration.

## Titan stays on the macOS side

The clamshell MacBook Pro, `titan`, still has a place in the lab. It is a 2018 Intel machine with six cores, twelve threads, 16 GB of memory and an approximately 250 GB SSD. It stays on Trusted Wi-Fi, VLAN 20, at `192.168.20.10`; it is not a member of either XCP-ng pool and does not use a port on the TEG-S562.

Its Colima environment is limited to two virtual CPUs, 4 GiB of RAM and a 60 GiB disk. The local status, Homepage and Dozzle test services remain loopback-only, while native Beszel monitoring reports on the host and containers. SSH and Screen Sharing handle administration; AirPlay requires a logged-in graphical session.

The network upgrade does not turn Titan into a multigig wired server. Its role remains light macOS utility work, with heavier VM workloads on Talokan and GPU workloads on Shuri. That distinction is why the diagram puts it in its own Trusted Wi-Fi section rather than inside a compute-pool boundary.

The AP layout also follows the house: `quinjet` is above `sanctuary`, which serves the ground floor. That ordering is a location reminder, not a claim that one AP forwards traffic through the other. Each has its own Ethernet uplink to the Enterprise switch.

## What faster links actually buy

The arithmetic gives a useful ceiling. Before protocol overhead, 1 Gbps is 125 MB/s, 2.5 Gbps is 312.5 MB/s, and 10 Gbps is 1,250 MB/s. These are link-rate conversions, not benchmark results from my lab.

A single transfer from a Minisforum host is still constrained by that host's 2.5G connection. The faster NAS connection is useful when several clients are active, and when another endpoint can actually use the larger pipe. Disk layout, file sizes, CPU work and the storage protocol still affect the result.

The dedicated switch also changes maintenance. Vyas and Knowhere no longer need Asgard to forward their traffic. Taking Asgard down still affects VMs running there, but its forwarding bridge is no longer the middle of their physical network path.

That is a meaningful improvement even before quoting a file-copy speed.

## What this upgrade does not solve

Vyas remains the storage anchor and the Tailscale subnet router. Heimdall still supplies `.home` DNS and the reverse proxy. Their roles have not disappeared because the Ethernet links are faster.

The NAS also remains a shared failure domain for the services and disks it holds. A backup on a second pool inside the same chassis is still inside the same chassis. And two compute hosts are not evidence that application failover has been configured or tested.

I want the next measurements to answer specific questions: how fast one host can reach shared storage, what happens when both hosts are busy, and how recovery behaves when a dependency disappears. Link speed, useful throughput and recovery are three different things to record.

## A better foundation for the next experiment

The upgrade gives the lab a clearer shape: dedicated switching, a faster storage path, 96 GB for Talokan's XCP-ng guests and 64 GB for Shuri's Ubuntu workloads. The smaller Intel machines still have a place, and the household wireless network keeps its managed PoE switch.

That is the direction I want this series to follow. Every addition should make it easier to explain where a workload runs, how its data moves, and what happens when one piece is unavailable. The diagram is useful precisely because it forces those questions onto the same page.
