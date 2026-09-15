---
title: "My Homelab Goes Multigig: 10G Networking and Two Minisforum XCP-ng Hosts"
date: "2026-10-15T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "10GbE", "2.5GbE", "Minisforum", "XCP-ng", "Synology"]
excerpt: "The next version of my homelab: a dedicated 10G server backbone, 2.5G compute links, and two Minisforum hosts with 48 GB RAM and a 2 TB SSD each."
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

The new topology gives those connections a dedicated switch. It also adds two Minisforum systems, each with 48 GB of DDR5-5600 memory and a 2 TB SSD, running together in an AMD XCP-ng pool.

The result is a mixed-speed network: 10G where traffic converges, 2.5G to the newer compute hosts, and 1G where the existing hardware still calls for it.

## The new topology

[![Upgraded homelab: 10G backbone and NAS, 2.5G compute hosts, 1G Knowhere and AP links, Quinjet above ground-floor Sanctuary, and Titan on Trusted Wi-Fi outside both pools.](/images/blog/building-my-homelab/upgrade.svg)](/images/blog/building-my-homelab/upgrade.svg)

The TRENDnet TEG-S562 now provides the server connections. Its two SFP+ ports serve the UDR7 uplink and Vyas. The four copper ports serve Asgard, Knowhere, the UM760 Slim and the UM880 Plus.

| Connection | Link rate | Job |
|---|---|---|
| UDR7 → TEG-S562 | 10 Gbps | Server-network uplink |
| TEG-S562 → Vyas | 10 Gbps | Shared storage and NAS traffic |
| TEG-S562 → shield (UM760 Slim) | 2.5 Gbps | AMD compute host |
| TEG-S562 → stark (UM880 Plus) | 2.5 Gbps | AMD compute / AI workload host |
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

## Two small hosts, 96 GB of installed RAM

Both Minisforum machines are now configured as XCP-ng hosts:

| Host hardware | Installed memory | Installed SSD | Network |
|---|---|---|---|
| shield / Minisforum UM760 Slim | 48 GB DDR5-5600 | 2 TB | 2.5GbE |
| stark / Minisforum UM880 Plus | 48 GB DDR5-5600 | 2 TB | 2.5GbE |

Together, they add 96 GB of installed memory and 4 TB of nominal local SSD capacity. Those totals are useful for planning, but they are not one enormous VM's resources. A VM still runs on an individual host, and some capacity belongs to the hypervisor and storage overhead.

DDR5-5600 is the memory's rated transfer speed—5600 MT/s, often written as “5600 MHz” in product listings. It is not a measurement of the operating speed selected by either machine's firmware. The component capacity and the effective runtime configuration are separate details.

My reason for this configuration is straightforward: the older 12 GB and 16 GB hosts leave relatively little room once persistent infrastructure is running. The new pair gives me more space to separate build jobs, application services and experiments into VMs with explicit resource budgets.

It does not mean every service should move immediately. DNS, storage, monitoring and build workloads have different dependencies. More available RAM makes placement easier; it does not make placement irrelevant.

## A separate AMD pool

The Minisforum pair forms the AMD `marvel-earth` XCP-ng pool: `shield` is the UM760 Slim, named after S.H.I.E.L.D., and `stark` is the UM880 Plus. Asgard and Knowhere belong to the Intel `marvel-cosmos` pool.

The names follow a simple hierarchy: cosmic places for the Intel hosts, Earth organizations for the AMD hosts, and characters or functional names for VMs. The UM880 Plus is `stark`, short for Stark Industries, with AI workloads as its particular role. Its 48 GB memory and 2 TB SSD provide capacity for that work; the name does not imply a particular GPU, inference runtime or measured model performance. VM names can follow the theme without tying a VM permanently to one host.

That boundary matters. XCP-ng does not support mixing Intel and AMD hosts in one pool. Pool membership also depends on compatible host configuration and software versions; “both run XCP-ng” is not the whole admission test. The [official host and pool documentation](https://docs.xcp-ng.org/management/hosts-pools/) explains the constraints.

Xen Orchestra provides the management view across the pools. Moving a workload from the Intel machines to the AMD pair is a migration decision, not something I describe as an ordinary live move between members of the same pool.

The local SSDs also remain local storage. A pool does not automatically mirror those disks or combine them into shared storage. Shared VM disks and backups need their own deliberate configuration.

## Keeping the unmanaged switch on one network

The TEG-S562 is unmanaged, so the server side has a simple boundary: the UDR7 connection supplies the Servers network as the native network. This switch is dedicated to server traffic.

The managed Enterprise switch continues to handle the household and wireless side, where multiple VLANs and PoE are useful. The two standalone APs stay there. The server switch is not the distribution point for the Trusted, Family, IoT, Cameras and Guest networks.

This also changes the old host configuration. The previous arrangement carried tagged VLAN 10 over the direct Asgard links. The new native Servers access layout uses untagged traffic on these physical connections. A diagram that moves cables but leaves the old tagging assumptions untouched would miss a critical part of the migration.

## Titan stays on the macOS side

The clamshell MacBook Pro, `titan`, still has a place in the lab. It is a 2018 Intel machine with six cores, twelve threads, 16 GB of memory and an approximately 250 GB SSD. It stays on Trusted Wi-Fi, VLAN 20, at `192.168.20.10`; it is not a member of either XCP-ng pool and does not use a port on the TEG-S562.

Its Colima environment is limited to two virtual CPUs, 4 GiB of RAM and a 60 GiB disk. The local status, Homepage and Dozzle test services remain loopback-only, while native Beszel monitoring reports on the host and containers. SSH and Screen Sharing handle administration; AirPlay requires a logged-in graphical session.

The network upgrade does not turn Titan into a multigig wired server. Its role remains light macOS utility work, with the heavier VM capacity on Shield and Stark. That distinction is why the diagram puts it in its own Trusted Wi-Fi section rather than inside a compute-pool boundary.

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

The upgrade gives the lab a clearer shape: dedicated switching, a faster storage path, and an AMD compute pool with enough memory to divide work sensibly. The smaller Intel machines still have a place, and the household wireless network keeps its managed PoE switch.

That is the direction I want this series to follow. Every addition should make it easier to explain where a workload runs, how its data moves, and what happens when one piece is unavailable. The diagram is useful precisely because it forces those questions onto the same page.
