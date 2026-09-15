---
title: "Inside My Homelab: The Hardware, Network, and What Runs Where"
date: "2026-09-15T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "XCP-ng", "Synology", "UniFi", "networking", "Tailscale"]
excerpt: "How two small PCs, a Synology NAS, and UniFi networking run my applications, builds, and media at home—and what happens when one of them goes down."
series: building-my-homelab
seriesOrder: 1
cover: "/images/blog/building-my-homelab/network.png"
thumb: "/images/blog/building-my-homelab/network.png"
use_featured_image: true
draft: false
comments: true
share: true
---

My homelab runs the applications I deploy, the builds I need for work, and the media I watch at home. Most of that fits on two small Intel PCs and a Synology NAS, connected through UniFi networking.

The interesting part is how much these machines rely on each other. An application can run on one box while its virtual disk lives on another. The machine answering DNS requests is itself a virtual machine. And one of the PCs currently doubles as the network connection for the other PC and the NAS. That arrangement works, but it makes a simple reboot worth thinking through.

This is the first article in a series about building and operating my home infrastructure. I'll start with the hardware and topology as they stand in September 2026. The next article covers the move to a dedicated server switch, 10G and 2.5G links, and two Minisforum hosts.

## How everything connects at home

[![My homelab topology: UniFi networking, Quinjet above ground-floor Sanctuary, Asgard, Knowhere, Vyas and the standalone Titan MacBook Pro on Trusted Wi-Fi.](/images/blog/building-my-homelab/network.svg)](/images/blog/building-my-homelab/network.svg)

You can click either diagram in this article to enlarge it, then press Escape to carry on reading. Dashed connections are the ones where I still need to double-check the cabling or port state.

Internet access comes through a WorldLink CPE into a UniFi Dream Router 7. The UDR7 handles routing between the home networks and also provides Wi-Fi on 2.4, 5 and 6 GHz. Its wired connection to the USW Enterprise 8 PoE runs at 2.5 Gbps.

The Enterprise switch serves the household side, including two separate access points: the Ground Floor U6 LR, named `sanctuary`, and the Prabin Floor AC Pro, named `quinjet`. These are their live UniFi names, with gigabit uplinks on ports 4 and 7 respectively. Both provide 2.4 and 5 GHz coverage, while the guest Wi-Fi is available only through the ground-floor AP. The Prabin Floor AP uses the model code `U7PG2`; despite the code, it is a Wi-Fi 5 device.

## The small machines doing the work

The existing XCP-ng pool is called `marvel`. Its two members are modest Intel systems:

| Host | Hardware | Memory | Local storage | Role |
|---|---|---|---|---|
| `knowhere` | Intel N150, four cores | 12 GB | Approximately 459 GB local SR | XCP-ng pool master |
| `asgard` | Intel Celeron J4125, four cores | 16 GB | Approximately 459 GB local SR | XCP-ng pool member and current forwarding path |
| `vyas` | Synology RS1221+ | 32 GB ECC | Six occupied drive bays | NAS, shared storage, selected services and VMM guests |
| `titan` | 2018 Intel MacBook Pro, six cores / twelve threads | 16 GB | Approximately 250 GB SSD | Standalone macOS utility host on Trusted Wi-Fi |

An SR is XCP-ng's storage repository: the place it keeps virtual disks. The two hypervisors retain local storage, and both can access the shared NFS repository on Vyas.

Knowhere runs Cosmo, where I deploy applications and run a LiteLLM gateway. Asgard runs Heimdall, which looks after DNS, the reverse proxy and monitoring, alongside Forge, a runner host. This is where those VMs live today; I can move them as the lab changes.

The names make daily operations easier to follow. “Heimdall's DNS is unavailable” tells me considerably more than “one of the Debian VMs is having a problem.” But a name is only useful when I also know its host, address, storage and dependencies.

## Vyas keeps the data—and runs a few services too

Vyas is a Synology RS1221+, a rackmount NAS with eight bays and four built-in 1GbE ports. Six bays are occupied: four 4 TB disks form a RAID5 storage pool, and two 1 TB disks form a separate RAID1 pool used for VM backups.

The NAS provides shared files, media storage and the `vyas-xcpng` NFS repository. Cosmo and Forge use that shared repository for their disks. That makes the NAS part of their runtime path, not merely somewhere they write backups at night.

Vyas also runs Jellyfin and Xen Orchestra, along with several Synology VMM guests: Builder, Friday, Elasticsearch and Edith. Builder is my primary amd64 build machine; Friday handles a project-specific agent runtime; Elasticsearch has its own search workload.

Separating the backup disks from the main storage pool is useful, but both pools still live in the same NAS. It is a local recovery tier, not protection against losing the entire NAS. More drive bays and RAID do not remove that distinction.

## Titan: a MacBook Pro with a smaller job

There is also a 2018 Intel MacBook Pro running in clamshell mode, named `titan`. It has six cores, twelve threads, 16 GB of RAM and an approximately 250 GB SSD. It sits on Trusted Wi-Fi, VLAN 20, at `192.168.20.10`, outside the XCP-ng pool. The diagram shows its wireless network membership without tying it to a particular access point.

Titan runs a small Colima environment limited to two virtual CPUs, 4 GiB of memory and a 60 GiB disk. Inside are three lightweight test services: `titan-status`, `titan-homepage` and `titan-dozzle`. They listen only on the Mac's loopback interface, so these are local utility checks rather than replacement public dashboards for the lab. A native Beszel agent reports host and container metrics.

SSH and Screen Sharing provide remote administration. AirPlay is available while a graphical session is logged in; it is not something I can depend on at the login window after a reboot.

The Mac has a useful role, but it is deliberately a light one. Sustained load causes thermal throttling, and the battery reports that service is recommended. I use it for macOS utilities and small experiments rather than making it the only machine responsible for an essential service.

## Why rebooting Asgard affects more than its own VMs

The server network is VLAN 10, using `192.168.10.0/27`. Asgard has a direct 2.5 Gbps uplink to the UDR7. Its native Open vSwitch bridge also connects Vyas and Knowhere:

- Asgard `eth0` connects to Vyas LAN 1 at 1 Gbps, carrying tagged VLAN 10.
- Asgard `eth3` connects to Knowhere `eth1` at 1 Gbps, also carrying tagged VLAN 10.
- Asgard `eth2` is an unused access port.

This arrangement gives the lab connectivity with the equipment already in place. It also means Asgard's forwarding configuration matters to machines outside Asgard itself. Rebooting that host is not just a question of what happens to its own VMs.

I previously had an OpenWrt VM called Bifrost in this setup, but it is now shut down. Forwarding happens through Open vSwitch on Asgard itself. I still need to verify that the manual forwarding configuration survives a reboot, so I cannot yet count on it coming back unattended. I also keep a USW-24-G2 powered off as a fallback switch.

Before doing maintenance on Asgard, I therefore have to think about Vyas and Knowhere too. Having spare compute capacity would not help much if those machines lost their network connection.

## Reaching my services when I'm away from home

[![Tailscale remote access through Vyas, with Heimdall providing home DNS and reverse proxy services.](/images/blog/building-my-homelab/services.svg)](/images/blog/building-my-homelab/services.svg)

When I'm away, I connect through Tailscale, which runs directly on Vyas as a DSM package. Vyas acts as a subnet router: it gives my authenticated remote devices a route into the home networks they are allowed to reach. Once connected, Heimdall resolves my `.home` names, and Caddy sends web requests to the right service.

If a service will not open, those are the pieces I need to check. I might be connected to Tailscale but unable to resolve a `.home` name, or DNS might work while the application itself is down. Getting onto the home network is only the first step.

There are still several ways for that access to break: Vyas, the internet connection, Asgard's forwarding path, or the service I am trying to use. Monitoring helps me spot a failure, but this is not yet a setup that can keep everything available when a machine goes down.

## What comes next

I have purchased a Minisforum UM760 Slim and a UM880 Plus, with 48 GB of DDR5-5600 memory and a 2 TB SSD for each. They are the next compute expansion, not part of this September installed topology. The owned TRENDnet TEG-S562 is also awaiting installation.

What I want from the upgrade is more room for VMs and a dedicated switch connecting the servers. Faster links will help, but I also want to reboot a compute host without wondering whether I am disconnecting the NAS along with it.

In the next part, I'll walk through the 10G backbone, the 2.5G host connections and the separate AMD XCP-ng pool. For now, these little Intel boxes and Vyas do the work. The next step is giving them more capacity and making maintenance less tangled.
