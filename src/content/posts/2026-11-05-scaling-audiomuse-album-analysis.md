---
title: "How I Got AudioMuse Moving Through My Music Library"
date: "2026-11-05T21:15:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "I want music discovery built from files I own, not a Spotify feed. I ran AudioMuse across my Navidrome library on Shuri with 40 workers and measured the full pass."
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
last_modified_at: "2026-11-06T11:45:00+05:45"
---

## TL;DR

- **Purpose:** Build music recommendations from files I own in my homelab,
  instead of depending on Spotify to decide what I hear next.
- **Stack:** [Navidrome](https://www.navidrome.org/) serves my library;
  [AudioMuse-AI](https://github.com/NeptuneHub/AudioMuse-AI) analyses how it
  sounds; PostgreSQL holds its queue and catalogue; and 40
  [Incus](https://linuxcontainers.org/incus/) workers run
  on Shuri. [ListenBrainz](https://listenbrainz.org/) supplies listening
  history elsewhere in the stack.
- **Result:** I can now start an Instant Mix from a song in Navidrome and use
  AudioMuse's sound-based matches across the analysed library, rather than
  only my first five-album sample. The fresh pass covered **1,728 albums**
  with **zero failed album jobs** in **2 hours 17 minutes 36 seconds**. Its
  catalogue shows **6,321 unique songs** across **1,702 distinct albums**;
  seven tracks could not be analysed.

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

I kept adding workers until I had **40**. To measure what that setup could do,
I backed up the database, cleared its computed song analysis and indexes, and
started a fresh **1,728-album** pass from the production web UI. The
music-server settings and saved playlists stayed in place. I could watch this
run from its first album to its final index build.

Early in that run, AudioMuse showed **40 album jobs running**. I checked their
album identifiers in PostgreSQL: all 40 were different. The dashboard's song
and album totals had already started growing, although the completed-album
counter was still low. An album can add tracks for several minutes before its
job finally completes.

![AudioMuse's production dashboard showing 40 default-queue album jobs running during the full-library pass.](/images/blog/editorial/audiomuse-parallel-analysis/forty-workers-dashboard.png)

At roughly the same moment, Shuri's `htop` showed the workers sharing its
**eight physical cores (16 logical CPUs)**. Swap was heavily occupied, but
available memory was still plentiful. I later added a second 8 GiB swap file
as headroom; the change happened about 14 minutes into this run and is
included in the timing below.

![Shuri's htop view during the 40-worker run, showing CPU, memory, swap and AudioMuse worker processes.](/images/blog/editorial/audiomuse-parallel-analysis/shuri-htop-forty-workers.png)

## The full run, every ten minutes

I recorded the task status and host metrics every 30 seconds, then took the
nearest sample to each ten-minute mark. CPU is total host use across all 16
logical CPUs, not AudioMuse's use alone. PostgreSQL connections are spot
counts, not a fixed allocation per worker.

| Elapsed | Albums complete | Tracks stored | CPU busy | PostgreSQL connections |
| ---: | ---: | ---: | ---: | ---: |
| 10 min | 32 / 1,728 | 520 | 52% | 328 / 400 |
| 20 min | 74 / 1,728 | 1,050 | 53% | 324 / 400 |
| 30 min | 140 / 1,728 | 1,561 | 52% | 327 / 400 |
| 40 min | 189 / 1,728 | 2,152 | 52% | 326 / 400 |
| 50 min | 361 / 1,728 | 2,654 | 53% | 317 / 400 |
| 60 min | 631 / 1,728 | 3,112 | 53% | 310 / 400 |
| 70 min | 852 / 1,728 | 3,560 | 53% | 317 / 400 |
| 80 min | 1,075 / 1,728 | 3,960 | 53% | 326 / 400 |
| 90 min | 1,239 / 1,728 | 4,319 | 53% | 328 / 400 |
| 100 min | 1,363 / 1,728 | 4,771 | 52% | 327 / 400 |
| 110 min | 1,466 / 1,728 | 5,246 | 53% | 326 / 400 |
| 120 min | 1,656 / 1,728 | 5,612 | 53% | 314 / 400 |
| 130 min | 1,712 / 1,728 | 6,133 | 54% | 282 / 400 |
| Finished: 137 min 36 sec | 1,728 / 1,728 | 6,321 | — | 248 / 400 |

The task finished **SUCCESS with zero failed albums**. AudioMuse reported
**seven tracks it could not analyse**. Album progress came in bursts: 40 jobs
could be busy adding tracks while none had finished. Near the end, most workers
became idle while the last few large albums ran. AudioMuse then rebuilt its
indexes before marking the task complete.

![AudioMuse after the full-library run: 6,321 unique songs, 1,702 albums, seven unanalyzable tracks and empty worker queues.](/images/blog/editorial/audiomuse-parallel-analysis/audiomuse-full-library-result.png)

## From analysed tracks to something I can play

The completed job is a catalogue of sound features, not a playlist pushed
wholesale into Navidrome. AudioMuse decodes each track, uses audio models to
produce a numeric representation of its sound, and builds similarity indexes
over those representations. When I pick a seed song in AudioMuse's **Similar
Song** page, it can look up nearby tracks from my own library. I can turn
those results into a Navidrome playlist if I want to keep them.

There is also a shorter path inside the player. Navidrome has the AudioMuse
plugin installed and selected first for sonic similarity. In my **Nepali**
playlist, I opened a song's menu and chose **Instant Mix**. The plugin sent
that seed to AudioMuse for sound-based matches, and Navidrome put the returned
songs in its play queue. This is the part I wanted to reach: I can discover
other tracks I own without leaving my player.

![Instant Mix in the menu of a song in my Navidrome Nepali playlist.](/images/blog/editorial/audiomuse-parallel-analysis/navidrome-instant-mix-menu.png)

![The Instant Mix result in Navidrome's play queue, starting from Aama.](/images/blog/editorial/audiomuse-parallel-analysis/navidrome-instant-mix-queue.png)

That queue contained 101 songs in this test. AudioMuse's completed analysis
gives the mix a much wider pool of tracks to search than my first five-album
sample. It does not guarantee a useful match for every seed, especially the
seven tracks AudioMuse could not analyse. Artist radio uses the same
integration for artist similarity. I can save a mix as a playlist when I find
one I want to revisit.

The “AI” here is mostly the audio models that learn a representation of a
song's sound. Finding neighbours in that representation does **not** require
a large language model call for each recommendation. My separate Ollama
configuration is for language tasks such as naming playlists and chat, not
for extracting the sound features used by this run. ListenBrainz contributes
a different kind of discovery: listening-history playlists imported through
its own Navidrome plugin. AudioMuse does not feed its vectors into
ListenBrainz, and Navidrome does not acquire new music from these mixes.

Across the sampled run, host CPU averaged about **52% of 16 logical CPUs**.
The one-minute load average peaked at **141**, PostgreSQL connections peaked
at **331 of 400**, and available memory never fell below **26.6 GiB**. A large
worker count had moved the bottleneck away from the original connection limit,
but it did not create 40 dedicated CPU cores.

## Compared with one worker

I did not make a single worker repeat the entire library. In the earlier run,
before I created a second worker container, the only worker stored **307 tracks
between 12:05 and 12:25 UTC**: about **15.4 tracks per minute**. Applying that
rate to the 6,321 tracks in the fresh pass gives a rough **6 hours 52 minutes**
for one worker. The measured 40-worker task took **2 hours 17 minutes
36 seconds**, or about **3.0 times faster**.

That single-worker number is an extrapolation from a 20-minute window, not a
measured full run. Different albums take different amounts of work, and final
indexing does not scale like album analysis. I would not promise the same
speedup on another library. What the run did show is more useful to me:
PostgreSQL admitted the workers, the queue assigned distinct albums, and
Shuri stayed well clear of a memory limit. CPU contention, changing album
sizes and the serial tail all limited the gain from adding workers; these
measurements do not isolate one of them as the sole cause.

The engineering lesson was to check the whole path: how many jobs AudioMuse
dispatches, whether workers actually claim them, and how many PostgreSQL
connections they need. Seeing each limit separately made the extra hardware
useful, even if the speedup was more modest than the worker count suggested.

## What this adds to my audio stack

I started down this path because I want to move away from Spotify without
losing the pleasure of finding music. Navidrome lets me play the files I own.
ListenBrainz gives me a record of listening through my connected players.
AudioMuse now has a sonic catalogue covering almost the entire library, so
its similarity features and Navidrome Instant Mix can look beyond the handful
of albums in my first test. The Nepali playlist example is the payoff: I picked
one song, and Navidrome gave me a playable queue drawn from music I already
own. I can save worthwhile mixes as playlists.

That does not prove its playlists know my taste better than Spotify did.
It does mean the raw music, the listening signals and the sound-based
recommendation layer are pieces I can run and inspect myself. The result I
care about is an audio stack that can help me rediscover **my** library,
instead of waiting for someone else's catalogue to choose for me.

## References

- [AudioMuse-AI source](https://github.com/NeptuneHub/AudioMuse-AI)
- [AudioMuse-AI algorithm](https://github.com/NeptuneHub/AudioMuse-AI/blob/main/docs/ALGORITHM.md)
- [AudioMuse-AI Navidrome plugin](https://github.com/NeptuneHub/AudioMuse-AI-NV-plugin)
- [PostgreSQL connection settings](https://www.postgresql.org/docs/15/runtime-config-connection.html)
- [PostgreSQL `SELECT` and `SKIP LOCKED`](https://www.postgresql.org/docs/15/sql-select.html)
