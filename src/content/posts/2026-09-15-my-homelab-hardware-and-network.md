---
title: "Inside My Homelab: The Hardware, Network, and What Runs Where"
date: "2026-09-15T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "XCP-ng", "Synology", "UniFi", "networking", "Tailscale"]
excerpt: "How Talokan's 96 GB, Shuri's 64 GB, two Intel hosts, a Synology NAS and UniFi networking run my applications, builds, local AI and media at home."
series: building-my-homelab
seriesOrder: 1
cover: "/images/blog/building-my-homelab/network.png"
thumb: "/images/blog/building-my-homelab/network.png"
use_featured_image: true
draft: false
comments: true
share: true
---

My homelab runs the applications I deploy, the builds I need for work, local AI, games and the media I watch at home. Two Intel PCs, two Minisforum systems and a Synology NAS share that work, connected through UniFi networking.

The interesting part is how much these machines rely on each other. An application can run on one box while its virtual disk lives on another. The machine answering DNS requests is itself a virtual machine. Knowing which machine supplies each dependency makes a simple reboot worth thinking through.

This is the first article in a series about building and operating my home infrastructure. I'll start with the hardware and where the workloads run. The next article focuses on the dedicated 10G server backbone and 2.5G compute links.

## How everything connects at home

[![My homelab topology: Talokan with 96 GB and Shuri with 64 GB of dual-channel memory, alongside UniFi networking, Asgard, Knowhere, Vyas and Titan.](/images/blog/building-my-homelab/network.svg)](/images/blog/building-my-homelab/network.svg)

You can click either diagram in this article to enlarge it, then press Escape to carry on reading. Amber cables are 1 Gbps, teal cables are 2.5 Gbps and blue cables are 10 Gbps. Asgard and Knowhere share the `marvel-cosmos` box, with Talokan's `vibranium` pool beside them. The right-hand column separates Wi-Fi access points from Trusted clients: Titan connects through a Trusted SSID, and its AP may vary. The table below separates VLAN membership from physical cabling.

Internet access comes through a WorldLink CPE into a UniFi Dream Router 7. The UDR7 handles routing between the home networks and also provides Wi-Fi on 2.4, 5 and 6 GHz. Its SFP+ connection to the USW Enterprise 8 PoE runs at 10 Gbps.

The Enterprise switch serves the household side, including two separate access points: the Ground Floor U6 LR, named `sanctuary`, and the Prabin Floor AC Pro, named `quinjet`. These are their live UniFi names, with gigabit uplinks on ports 4 and 7 respectively. Both provide 2.4 and 5 GHz coverage. The guest SSID is assigned to the ground-floor AP but is currently disabled. The Prabin Floor AP uses the model code `U7PG2`; despite the code, it is a Wi-Fi 5 device.

## The small machines doing the work

The Intel XCP-ng pool is called `marvel-cosmos`. Talokan forms the separate AMD `vibranium` pool, while Shuri runs Ubuntu directly:

| Host | Hardware | Memory | Local storage | Role |
|---|---|---|---|---|
| `knowhere` | Intel N150, four cores | 12 GB | Approximately 459 GB local SR | XCP-ng pool master |
| `asgard` | Intel Celeron J4125, four cores | 16 GB | Approximately 459 GB local SR | XCP-ng pool member |
| `talokan` | Minisforum UM760 Slim, Ryzen 5 7640HS | 96 GB (2 × 48 GB) | 2 TB NVMe | Single-host `vibranium` XCP-ng pool |
| `shuri` | Minisforum UM880 Plus, Ryzen 7 8845HS / Radeon 780M | 64 GB (2 × 32 GB) | 2 TB Crucial T700 | Ubuntu, gaming, local AI and Incus |
| `vyas` | Synology RS1221+ | 32 GB ECC | Six occupied drive bays | NAS, shared storage, selected services and VMM guests |
| `titan` | 2018 Intel MacBook Pro, six cores / twelve threads | 16 GB | Approximately 250 GB SSD | Standalone macOS utility host on Trusted Wi-Fi |

An SR is XCP-ng's storage repository: the place it keeps virtual disks. The two hypervisors retain local storage, and both can access the shared NFS repository on Vyas.

Knowhere runs Quill and Factory. Asgard runs Heimdall, which looks after DNS, the reverse proxy and monitoring. Cosmo runs on Vyas VMM and hosts applications and LiteLLM. Talokan carries the primary build VM, runners and several infrastructure guests; Shuri runs GPU workloads directly alongside its Incus guests.

Both Minisforum machines have channels A and B populated, and firmware reports 5600 MT/s on all four DIMMs. Together they provide 160 GB of installed RAM. Xen sees about 93.8 GiB on Talokan and Linux sees about 59.6 GiB on Shuri after reserved memory. Talokan's SSH command `free -m` shows only the small management domain; `xl info` reports the whole host. Existing guest limits remain separate from installed capacity.

The names make daily operations easier to follow. “Heimdall's DNS is unavailable” tells me considerably more than “one of the Debian VMs is having a problem.” But a name is only useful when I also know its host, address, storage and dependencies.

## Vyas keeps the data—and runs a few services too

Vyas is a Synology RS1221+, a rackmount NAS with eight bays and four built-in 1GbE ports. Six bays are occupied: four 4 TB disks form a RAID5 storage pool, and two 1 TB disks form a separate RAID1 pool used for VM backups.

The NAS provides shared files, media storage and the `vyas-xcpng` NFS repository. It also hosts VMM guests, which makes it part of their runtime path, not merely somewhere they write backups at night.

Vyas runs Jellyfin and Xen Orchestra, along with the Cosmo, Friday and Edith VMM guests. Cosmo hosts applications and LiteLLM; Friday and Edith handle agent workloads. The primary amd64 build machine runs on Talokan, as does Mantis for Elasticsearch.

Separating the backup disks from the main storage pool is useful, but both pools still live in the same NAS. It is a local recovery tier, not protection against losing the entire NAS. More drive bays and RAID do not remove that distinction.

## Titan: a MacBook Pro with a smaller job

There is also a 2018 Intel MacBook Pro running in clamshell mode, named `titan`. It has six cores, twelve threads, 16 GB of RAM and an approximately 250 GB SSD. It sits on Trusted Wi-Fi, VLAN 20, at `192.168.20.10`, outside the XCP-ng pool. The diagram shows its wireless network membership without tying it to a particular access point.

Titan runs a small Colima environment limited to two virtual CPUs, 4 GiB of memory and a 60 GiB disk. Inside are three lightweight test services: `titan-status`, `titan-homepage` and `titan-dozzle`. They listen only on the Mac's loopback interface, so these are local utility checks rather than replacement public dashboards for the lab. A native Beszel agent reports host and container metrics.

SSH and Screen Sharing provide remote administration. AirPlay is available while a graphical session is logged in; it is not something I can depend on at the login window after a reboot.

The Mac has a useful role, but it is deliberately a light one. Sustained load causes thermal throttling, and the battery reports that service is recommended. I use it for macOS utilities and small experiments rather than making it the only machine responsible for an essential service.

## Keeping the NAS network independent of compute

The server network is VLAN 10, using `192.168.10.0/26`. Vyas connects to port 2 of the USW-24-G2, Knowhere to port 4 and Asgard to port 23. Port 24 uplinks to Enterprise port 5. These are gigabit paths with VLAN 10 tagged. The USW-24-G2 is online and pending retirement when its replacement connections are accepted.

The NAS network path is independent of Asgard's Open vSwitch forwarding. Shuri is wired to UDR7 port 2 and Talokan to port 3, both at 2.5 Gbps. UniFi's live client MAC mappings establish these connections.

A trunk carries several VLANs over one cable, with a tag identifying each network. Vyas and the Intel hosts use tagged VLAN 10. On the two UDR7 server ports, untagged traffic joins VLAN 10 directly. Wi-Fi clients select a network through their SSID: Trusted is VLAN 20, Family 30, IoT 40 and Cameras 45. The UDR7 firewall decides which traffic can cross between those networks.

Before maintenance, I check which guests and services depend on the host. More RAM gives me room for workloads, while switches, DNS and shared storage still determine whether those workloads can reach each other.

## Reaching my services when I'm away from home

[![Tailscale remote access through Vyas, with Heimdall providing home DNS and reverse proxy services.](/images/blog/building-my-homelab/services.svg)](/images/blog/building-my-homelab/services.svg)

When I'm away, I connect through Tailscale, which runs directly on Vyas as a DSM package. Vyas acts as a subnet router: it gives my authenticated remote devices a route into the home networks they are allowed to reach. Once connected, Heimdall resolves my `.home` names, and Caddy sends web requests to the right service.

If a service will not open, those are the pieces I need to check. I might be connected to Tailscale but unable to resolve a `.home` name, or DNS might work while the application itself is down. Getting onto the home network is only the first step.

There are still several ways for that access to break: Vyas, the internet connection, the switch uplink, Heimdall or the service I am trying to use. Monitoring helps me spot a failure, but this is not yet a setup that can keep everything available when a machine goes down.

## Dividing the work

Talokan's 96 GB gives the XCP-ng guests room to grow. Shuri's 64 GB serves Ubuntu, the Radeon 780M, gaming, inference and Incus. Dual-channel memory is already configured by the hardware; allocating more RAM to a VM or service is a separate workload decision.

The useful part is having explicit roles and budgets. A build can consume its VM allocation while the inference service keeps its own limit, and neither needs every byte of installed memory assigned in advance.

In the next part, I'll walk through the 10G backbone, the 2.5G host connections and how the two Minisforum hosts fit that network. Capacity, connectivity and recovery each need their own checks.
