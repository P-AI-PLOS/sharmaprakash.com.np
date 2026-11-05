---
title: "How I Got AudioMuse Moving Through My Music Library"
date: "2026-11-05T21:15:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "My music library was taking too long to analyse, even after I moved AudioMuse to a bigger machine. The answer was more workers, a wider queue, and enough PostgreSQL connections to keep them busy."
tags:
  - homelab
  - music
  - audiomuse-ai
  - navidrome
  - postgresql
  - incus
  - parallel-processing
cover: "/images/blog/editorial/audiomuse-parallel-analysis/cover.png"
thumb: "/images/blog/editorial/audiomuse-parallel-analysis/thumb.png"
use_featured_image: true
comments: true
share: true
draft: false
---

My [first AudioMuse experiment](/technical-notes/audiomuse-ai-sonic-recommendations/)
used a small slice of my Navidrome library. The recommendations were promising,
so I asked it to analyse everything: **1,728 albums**. That turned a fun music
project into an afternoon of watching progress counters.

AudioMuse had originally lived on `heimdall`, where the analysis ran into a
memory limit. I moved it to `shuri`, a much larger machine, expecting the job
to pick up speed. It was still slow. I opened `htop` and found plenty of memory
and CPU capacity sitting idle. The machine was ready to do more work; AudioMuse
wasn't asking it to.

The useful discovery was the queue. One task coordinates the full-library run
and hands individual albums to worker processes. Once I understood that, I
could add workers and watch several different albums move at once. I checked
the identifiers of running album jobs as the count grew; each job in those
snapshots belonged to a different album. The queue also uses PostgreSQL's
`FOR UPDATE SKIP LOCKED` when claiming work, so workers can avoid rows another
worker has already claimed.

![One coordinator feeds album jobs to workers through PostgreSQL.](/images/blog/editorial/audiomuse-parallel-analysis/queue-flow.png)

I added workers gradually. At first I used a temporary memory guard because
I didn't want a burst of new containers to bring down the host. The memorable
limit, though, arrived in PostgreSQL. Its original 100-connection allowance
filled up, workers reported “too many clients,” and the web app became
unavailable. That was happening while the host still had free memory. In the
snapshots I took while scaling from 13 to 20 workers, database usage grew from
113 to 163 connections: about **seven extra connections per worker** in that
stretch. It was an observation, not a fixed per-worker contract.

I raised PostgreSQL's connection limit in stages, eventually to 400, and
adjusted the database container's memory allowance with it. The database
needed a restart for each connection-limit change. That fixed the admission
problem, but more workers alone still did not fill the machine.

AudioMuse was keeping at most 25 album jobs outstanding. I raised the limit to
40, then checked the setting AudioMuse actually loaded. My environment change
had been overridden by a value saved in its database, so the first check still
said 25. After changing that stored value, I saw 24 albums running and 16
waiting: the full 40-job window. That was the moment the worker count and the
queue finally matched.

There was one more false signal along the way. The temporary guard stopped
workers when swap *occupancy* rose, although the host still showed more than
30 GiB of available memory. Incus container copies had increased swap usage;
the number alone did not tell me that the host was under present memory
pressure. I removed that guard and watched available memory, swap activity,
CPU, database connections, and queue progress together. I also learned to
check AudioMuse's queue page: once, Incus showed a worker container running
while its queue processes had stopped after a database restart.

I ended up with **36 worker containers**. The full analysis completed with
**1,728 of 1,728 albums visited and zero failed albums**. AudioMuse then showed
6,441 songs and 1,704 distinct albums in its database; those counts measure
different things. The last part of the task rebuilt indexes after the album
jobs finished, so a full album counter was not quite the end of the run.

## What did the extra workers buy me?

I wanted a number I could put next to the story, so I ran a separate test on
**36 albums** against an isolated copy of AudioMuse's database. All 36 album
jobs were claimed by different workers, none failed, and the complete task,
including its final indexing work, took **8 minutes 12 seconds**. That is a
measured result for this batch, not a full-library 36-worker benchmark.

The earlier attempt had reached roughly 336 albums when I cancelled it after
88 minutes. Extending that observed rate over 1,728 albums gives a rough
**7½-hour** finish time. The later task reported completion in about
**17 minutes**, but it could skip work already saved by earlier attempts.
Workers had also been added during the 88-minute stretch. Those two times
show why the change felt dramatic; dividing them would not measure a clean
36-versus-one-worker speedup. The isolated 36-album result is the repeatable
number I can actually attach to a defined batch.

The main lesson for my next long-running job is to inspect the whole path.
Free CPU does not help if the app dispatches too few jobs. More workers do not
help if PostgreSQL refuses their connections. And a running container is not
proof that its worker process is taking jobs. Once I could see each of those
limits, the big machine finally had work to do.

## References

- [AudioMuse-AI source](https://github.com/NeptuneHub/AudioMuse-AI)
- [PostgreSQL connection settings](https://www.postgresql.org/docs/15/runtime-config-connection.html)
- [PostgreSQL `SELECT` and `SKIP LOCKED`](https://www.postgresql.org/docs/15/sql-select.html)
