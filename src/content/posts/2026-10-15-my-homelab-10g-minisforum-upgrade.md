---
title: "Planning a Multigig Homelab: 10G Networking and 160 GB Across Two Minisforum Hosts"
date: "2026-10-15T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "10GbE", "2.5GbE", "Minisforum", "XCP-ng", "Synology"]
excerpt: "The multigig upgrade I'm planning for my homelab: a dedicated 10G server backbone, 2.5G compute links, and clearer roles for two Minisforum hosts."
series: building-my-homelab
seriesOrder: 2
cover: "/images/blog/building-my-homelab/upgrade.png"
thumb: "/images/blog/building-my-homelab/upgrade.png"
use_featured_image: true
draft: false
comments: true
share: true
---

In [the first part of this series](/homelab/my-homelab-hardware-and-network/), the most interesting line in the network diagram ran through Asgard. That small XCP-ng host does two jobs: runs virtual machines and forwards traffic for the NAS and Knowhere. I want to take the forwarding job away from a machine that I also need to maintain as a hypervisor.

The upgrade I'm planning gives those connections a dedicated switch. Talokan and Shuri are the natural endpoints for faster compute links: Talokan runs my XCP-ng guests, while Shuri stays on Ubuntu for gaming and local AI. Each already has a 2 TB SSD.

As of September 30, 2026, the switch cutover, Vyas's 10G adapter and interconnect, and acceptance of the new host links are not verified as complete. The rates below describe the intended layout, not measured throughput.

I don't need every device to run at 10G. The goal is a mixed-speed network: 10G where traffic converges, 2.5G to the newer compute hosts, and 1G where the existing hardware still calls for it.

## The topology I want to build

[![Homelab upgrade: UDR7 and Vyas connect through TEG-S562 at 10G; standalone Shuri, Talokan in vibranium, and Asgard in marvel-cosmos connect at 2.5G, with Knowhere at 1G. Quinjet and Sanctuary sit above Titan on Trusted VLAN 20.](/images/blog/building-my-homelab/upgrade.svg)](/images/blog/building-my-homelab/upgrade.svg)

I plan to use the TRENDnet TEG-S562 for the server connections. Its two SFP+ ports would serve the UDR7 uplink and Vyas, while its four copper ports would connect Asgard, Knowhere, the UM760 Slim and the UM880 Plus.

In the diagram, I separate the planned server links from the managed household network. The TEG-S562 would carry untagged Servers VLAN 10 traffic; the Enterprise switch would continue to handle household trunks and access points. Quinjet and Sanctuary stay on Enterprise ports 7 and 4, and Titan remains on Wi-Fi without a fixed AP association.

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

Knowhere will remain a gigabit machine; plugging its gigabit NIC into a multigig switch won't make it a 2.5G NIC. The Minisforum hosts are intended to connect at 2.5G. “10G homelab” would describe the backbone and storage link, not every device.

I have the OM3 cable and matched SFP+ modules for the planned UDR7-to-switch fibre link. Vyas still needs a compatible 10G adapter and interconnect; its built-in ports are 1GbE. Both optical ports would be occupied in this layout.

## Two small hosts, 160 GB of installed RAM

The machines have different jobs, and both memory channels are populated:

| Host hardware | Installed memory | Installed SSD | Network |
|---|---|---|---|
| talokan / Minisforum UM760 Slim | 96 GB DDR5-5600 (2 × 48 GB) | 2 TB | 2.5GbE |
| shuri / Minisforum UM880 Plus | 64 GB DDR5-5600 (2 × 32 GB) | 2 TB | 2.5GbE |

Together, they provide 160 GB of installed memory and 4 TB of nominal local SSD capacity. Talokan is the single-host `vibranium` XCP-ng pool; Shuri runs Ubuntu directly, with the Radeon 780M available to games and local inference, plus Incus guests. Each workload still has to fit its own host and resource limits.

I chose the 96 GB / 64 GB split because the older 12 GB and 16 GB hosts leave little room once persistent services are running. The added capacity gives me room to separate build jobs, applications and experiments into workloads with clear budgets. Installed memory isn't automatically available to every VM, and Shuri's workloads still share one host, so I won't move a service until its dependencies and limits make sense there.

## An AMD pool and a standalone Ubuntu host

Talokan is the sole member of the AMD `vibranium` XCP-ng pool. Asgard and Knowhere belong to the Intel `marvel-cosmos` pool. Shuri sits outside both pools and runs Ubuntu on bare metal.

This split gives Talokan room for builders, runners and application VMs while Shuri keeps direct access to its integrated GPU. The Radeon 780M uses system memory, but I have not measured a before-and-after performance change from this configuration.

I keep Talokan separate from the Intel pool because XCP-ng does not support mixing Intel and AMD hosts in one pool. Matching hypervisors alone is not enough; host configuration and software versions must also meet the [pool requirements](https://docs.xcp-ng.org/management/hosts-pools/).

Xen Orchestra provides the management view across the XCP-ng pools. Moving a workload from the Intel machines to Talokan is a migration decision. Shuri's Incus guests have a separate management and lifecycle boundary.

The local SSDs also remain local storage. A pool does not automatically mirror those disks or combine them into shared storage. Shared VM disks and backups need their own deliberate configuration.

## Keeping the unmanaged switch on one network

Because the TEG-S562 is unmanaged, I plan to keep its role simple: the UDR7 connection would supply Servers VLAN 10 as the native network, and the switch would carry server traffic only.

The managed Enterprise switch continues to handle the household and wireless side, where multiple VLANs and PoE are useful. The two standalone APs stay there. The server switch is not the distribution point for the Trusted, Family, IoT, Cameras and Guest networks.

The cutover would also change the host configuration. The current arrangement carries tagged VLAN 10 over the direct Asgard links; the planned Servers access layout uses untagged traffic on those physical connections. I need to change the host-side assumptions along with the cables.

## Titan stays on the macOS side

The clamshell MacBook Pro, `titan`, still has a place in the lab. It is a 2018 Intel machine with six cores, twelve threads, 16 GB of memory and an approximately 250 GB SSD. It stays on Trusted Wi-Fi, VLAN 20, at `192.168.20.10`; it is not a member of either XCP-ng pool and does not use a port on the TEG-S562.

Its Colima environment is limited to two virtual CPUs, 4 GiB of RAM and a 60 GiB disk. The local status, Homepage and Dozzle test services remain loopback-only, while native Beszel monitoring reports on the host and containers. SSH and Screen Sharing handle administration; AirPlay requires a logged-in graphical session.

The network upgrade does not turn Titan into a multigig wired server. Its role remains light macOS utility work, with heavier VM workloads on Talokan and GPU workloads on Shuri. That distinction is why the diagram puts it in its own Trusted Wi-Fi section rather than inside a compute-pool boundary.

The AP layout also follows the house: `quinjet` is above `sanctuary`, which serves the ground floor. That ordering is a location reminder, not a claim that one AP forwards traffic through the other. Each has its own Ethernet uplink to the Enterprise switch.

## What faster links actually buy

The arithmetic gives a useful ceiling. Before protocol overhead, 1 Gbps is 125 MB/s, 2.5 Gbps is 312.5 MB/s, and 10 Gbps is 1,250 MB/s. These are link-rate conversions, not benchmark results from my lab.

A single transfer from a Minisforum host is still constrained by that host's 2.5G connection. The faster NAS connection is useful when several clients are active, and when another endpoint can actually use the larger pipe. Disk layout, file sizes, CPU work and the storage protocol still affect the result.

The dedicated switch should make maintenance simpler: Vyas and Knowhere would no longer need Asgard to forward their traffic. Taking Asgard down would still affect its VMs, but its forwarding bridge would no longer sit in the physical path between the NAS and the other host.

That separation is the improvement I care about, even before measuring a file-copy speed.

## What this upgrade does not solve

Even after the cutover, Vyas would remain my storage anchor and Tailscale subnet router. Heimdall would still supply `.home` DNS and the reverse proxy. Faster Ethernet doesn't remove those dependencies.

The NAS also remains a shared failure domain for the services and disks it holds. A backup on a second pool inside the same chassis is still inside the same chassis. And two compute hosts are not evidence that application failover has been configured or tested.

Once the links are in place, I want to measure how quickly one host reaches shared storage, what happens when both hosts are busy, and how recovery behaves when a dependency disappears. Link speed, useful throughput and recovery answer different questions.

## A better foundation for the next experiment

If the plan works as intended, the lab will have a clearer shape: dedicated switching, a faster storage path, 96 GB for Talokan's XCP-ng guests and 64 GB for Shuri's Ubuntu workloads. The smaller Intel machines still have a place, and the household wireless network keeps its managed PoE switch.

That is the standard I want for this upgrade. I want to be able to explain where a workload runs, how its data moves, and what happens when one piece is unavailable. The diagram helps me test whether the design makes those answers clear before I move the cables.
