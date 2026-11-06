---
title: "How I Use AudioMuse with Navidrome"
date: "2026-11-01T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "How sonic analysis gives my Navidrome library a playable Instant Mix, and what it took to analyse the whole collection."
tags:
  - homelab
  - music
  - recommendations
  - audiomuse-ai
  - navidrome
  - listenbrainz
  - ollama
  - audio-analysis
cover: "/images/blog/audio/audiomuse-ai-sonic-recommendations.webp"
thumb: "/images/blog/audio/audiomuse-ai-sonic-recommendations.webp"
use_featured_image: true
comments: true
share: true
series: "homelab-music"
seriesOrder: 5
draft: false
last_modified_at: "2026-11-06T13:00:00+05:45"
---

When I want more music like the song playing, I use Instant Mix in Navidrome. [AudioMuse-AI](https://github.com/NeptuneHub/AudioMuse-AI) supplies the sound-based matches from files I already own. [My Music After Spotify](/audio/my-music-after-spotify/) explains why I wanted this; this guide covers the setup and the work needed to analyse my library.

## What I use AudioMuse for

AudioMuse turns recordings into numerical descriptions of their sound and searches for similar tracks. Its Similar Song page lets me explore those matches directly. The Navidrome plugin makes them available inside the player as Instant Mix.

My first listening test covered five albums and 76 tracks. Starting small let me check the results before committing to a full-library pass. Similarity is useful, but it does not guarantee that two songs share a language, cultural context or mood that fits the moment.

Audio analysis and language models have different jobs here. My Ollama configuration uses Gemma 4 26B for features such as playlist naming and chat. Finding sound-based neighbours for Instant Mix does not require an LLM call for each song. My configuration has `CLAP_ENABLED=false`; I do not use its CLAP-based text search or trait scores.

## How it connects to Navidrome

In the deployment described here, AudioMuse runs in Incus containers on Shuri. A Flask app provides the UI and API, workers process album jobs, and PostgreSQL 15 holds the catalogue and queue. Navidrome remains the separate music source, accessed through a dedicated non-admin account.

My measured full-library run used 40 workers. That is a description of this run, not a starting requirement. Library analysis is scheduled separately from the daily discovery-playlist refresh.

The UI and API are restricted to trusted networks. I disabled AudioMuse's own login in that arrangement; this is not a configuration to copy onto an internet-facing service. The plugin needs network access to the API from the Navidrome server.

I installed plugin v9 with a checksum-pinned Ansible playbook that checks compatibility, backs up Navidrome's database, stages the plugin and restarts the service. That release's manifest requests HTTP access to any host. I review its permissions on upgrades rather than assuming the configured API URL is itself a permission restriction.

## Setup sequence and playback check

**Prerequisites:** a [working Navidrome library](/technical-notes/beyond-spotify-building-a-flac-library/#minimal-navidrome-setup), an AudioMuse instance that can reach it, and compatible releases of Navidrome, AudioMuse and the plugin. For a new installation, check the [upstream installation and compatibility notes](https://github.com/NeptuneHub/AudioMuse-AI-NV-plugin#how-to-install); my v9 pin is not a recommendation to install an older release.

1. Connect AudioMuse to Navidrome with a dedicated library account and analyse a few familiar albums.
2. Enable Navidrome plugins and place `audiomuseai.ndp` in its configured plugin folder. Back up the data directory before changing an existing installation.
3. Enable the plugin in the admin UI. Set the AudioMuse API URL reachable from the server and supply an API token if that instance requires one.
4. Put `audiomuseai` before other sonic-similarity agents in Navidrome's agent order.

**Check it works:** run Similar Song in AudioMuse, then Instant Mix on the same seed in Navidrome. Confirm that the returned songs play. If only Similar Song works, check the plugin URL, authentication and server logs before changing analysis settings.

In my Nepali playlist, I started Instant Mix from “Aama” by Sushant KC. The test produced a queue of 101 songs. That shows the playback path worked; it is not a quality score for all 101 matches. I can save a mix when I want to return to it.

![Instant Mix in the menu of a song in my Navidrome Nepali playlist.](/images/blog/editorial/audiomuse-parallel-analysis/navidrome-instant-mix-menu.png)

![Navidrome's Instant Mix queue starting from Aama.](/images/blog/editorial/audiomuse-parallel-analysis/navidrome-instant-mix-queue.png)

## Analysing the whole library

After the small test, I asked AudioMuse to process 1,728 albums. The original host, Heimdall, had hit a memory limit. Moving to the larger Shuri host gave the job room, but did not by itself make it faster: the queue still had to supply work and PostgreSQL had to admit the workers.

One coordinator hands album jobs to workers through PostgreSQL. The queue uses `FOR UPDATE SKIP LOCKED` when claiming jobs. During the run, I checked that the 40 active album jobs had distinct identifiers.

![One coordinator feeds album jobs to workers through PostgreSQL.](/images/blog/editorial/audiomuse-parallel-analysis/queue-flow.png)

### The limits I hit

- **Database connections:** workers reported “too many clients” when the original 100-connection allowance filled up, and the web app became unavailable. I raised the limit in stages to 400 and adjusted database memory alongside it. Each connection-limit change required a database restart. The observed increase of about seven connections per extra worker was specific to the sampled stretch, not a fixed sizing rule.
- **Job dispatch:** AudioMuse kept at most 25 album jobs outstanding. Adding workers could not overcome that cap. A database-stored setting overrode my environment change; after updating the effective value to 40, I saw 24 jobs running and 16 waiting.
- **Worker health:** a running container did not always mean its queue processes were working. After a database restart, I had to check the queue itself.
- **Memory signals:** a temporary guard reacted to occupied swap even while more than 30 GiB of memory remained available. I removed that guard and watched available memory, swap activity, connections and queue progress together.

![AudioMuse's queue with 40 album workers active.](/images/blog/editorial/audiomuse-parallel-analysis/forty-workers-dashboard.png)

![Shuri's CPU, memory and AudioMuse workers during the run.](/images/blog/editorial/audiomuse-parallel-analysis/shuri-htop-forty-workers.png)

### The measured run

To measure a fresh pass, I backed up the database, cleared computed song analysis and indexes, and started the job from the web UI. Music-server settings and saved playlists stayed in place. Clearing analysis was part of this benchmark, not a normal setup step.

Shuri had eight physical cores and 16 logical CPUs. I added an extra 8 GiB swap file about 14 minutes into the run; the elapsed time includes that change. Host and task measurements were sampled every 30 seconds.

| Measurement | Result |
| --- | --- |
| Workers | 40 |
| Selected album jobs | 1,728 completed; zero failed |
| Elapsed time, including final indexing | 2 h 17 min 36 s |
| Resulting catalogue | 6,321 unique songs across 1,702 distinct albums |
| Tracks marked unanalyzable | 7 |
| Peak sampled PostgreSQL connections | 331 of 400 |
| Average sampled host CPU use | About 52% across 16 logical CPUs |
| Lowest sampled available memory | 26.6 GiB |

The queue moved in bursts. These are the nearest samples to each ten-minute
mark; CPU is total host use, not AudioMuse alone.

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

Completed album-job counts and distinct albums in the resulting catalogue are different counters. A successful album job also does not mean every track was analysable. These results establish coverage and throughput, not recommendation quality.

![Completed analysis: 6,321 songs, 1,702 albums and seven unanalyzable tracks.](/images/blog/editorial/audiomuse-parallel-analysis/audiomuse-full-library-result.png)

An earlier single worker stored 307 tracks in 20 minutes. Extending that rate to 6,321 tracks gives roughly 6 h 52 min, about three times the measured 40-worker run. That is an extrapolation, not a controlled full-library comparison. Album sizes varied, final indexing was serial, and 40 workers shared the same CPU cores. I would not promise the same speedup elsewhere.

## Troubleshooting a slow or empty mix

| Symptom | Check first |
| --- | --- |
| Similar Song works, Instant Mix fails | Plugin API URL, authentication, compatibility and agent order |
| Extra workers sit idle | Effective album-dispatch limit and actual queue processes |
| “Too many clients” errors | PostgreSQL connection usage and worker count |
| A changed environment setting has no effect | The setting saved in AudioMuse's database |
| A track has no useful matches | Analysis status, available library coverage and the seed itself |

Start with the smallest failing step. Changing worker counts will not fix a plugin authentication problem, and a completed analysis does not prove that a mix suits my taste.

## Keeping generated playlists manageable

AudioMuse clustering and the separate [ListenBrainz importer](/technical-notes/scrobbling-everything-to-listenbrainz/#closing-the-loop-history-back-into-playlists) can leave old generated playlists behind. My cleanup script inventories them, reports candidates and deletes only the playlist IDs I explicitly approve. It excludes smart and file-backed playlists and rechecks candidates before deleting.

The report compares tracks with recent ListenBrainz history. That overlap is only a hint: hearing a song does not prove I played it from a particular playlist. Removing a generated playlist does not delete the music or its analysis.

My [daily listening workflow](/technical-notes/ai-music-recommendations-from-listenbrainz/) explains what I keep, how ratings help me review playlists, and how I take them offline. The [signals reference](/technical-notes/homelab-music-recommendations-field-guide/) explains where sound-based mixes differ from listening-history suggestions.


## Sources

- [AudioMuse-AI repository](https://github.com/NeptuneHub/AudioMuse-AI)
- [AudioMuse algorithm notes](https://github.com/NeptuneHub/AudioMuse-AI/blob/main/docs/ALGORITHM.md)
- [Navidrome plugin installation and checks](https://github.com/NeptuneHub/AudioMuse-AI-NV-plugin)
- [PostgreSQL connection settings](https://www.postgresql.org/docs/15/runtime-config-connection.html)
- [PostgreSQL SELECT and SKIP LOCKED](https://www.postgresql.org/docs/15/sql-select.html)
