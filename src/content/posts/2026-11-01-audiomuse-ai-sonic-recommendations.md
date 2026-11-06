---
title: "AudioMuse-AI: Sonic-Analysis Recommendations on My Own Library"
date: "2026-11-01T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "How AudioMuse-AI analyses audio, how it runs in my homelab beside Navidrome with a local LLM on a separate GPU host, what its playlists are good and bad at compared with ListenBrainz, and how I clean up the playlists it generates."
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

When I choose a song in Navidrome, I want the next track to be something in my
own library that I might have forgotten. That is the job I give
[AudioMuse-AI](https://github.com/NeptuneHub/AudioMuse-AI): analyse the sound
of my files and make a **sounds-like-this** mix available in my player. For
the whole listening journey, start with [my music after Spotify](/audio/my-music-after-spotify/).

This post began with a five-album experiment. AudioMuse now runs on Shuri,
and a fresh full-library pass has finished: 1,728 albums in 2 hours 17 minutes
with 40 workers. [The scaling story and measurements are in a separate post](/technical-notes/scaling-audiomuse-album-analysis/).

The [signals reference](/technical-notes/homelab-music-recommendations-field-guide/) explains how sound similarity differs from recording identity and listening history.

This post is about the sound signal. AudioMuse-AI listens to the files I own
and builds recommendations from what they sound like, not from who else played
them. Below is what it analyses, how it runs in my homelab, where it helps, where
it does not, and how I keep its output from piling up.

## What AudioMuse-AI analyses

AudioMuse-AI describes itself as using "sonic analysis to rediscover forgotten
songs" without relying on metadata or external services. Its algorithm document
is more specific. On the current main branch it:

- decodes audio with librosa (PyAV as fallback) and computes basic features:
  **tempo, energy and key/scale**;
- runs models through ONNX Runtime. **MusiCNN** produces a 200-dimension track
  embedding plus top mood labels. **DCLAP** produces a 512-dimension
  audio embedding that can be compared with text;
- scores six extra traits (danceable, aggressive, happy, party, relaxed, sad)
  by comparing the audio with CLAP text embeddings;
- optionally transcribes and embeds lyrics with Whisper-small and a multilingual
  text model;
- keeps a Chromaprint fingerprint for duplicate checks.

Those vectors go into similarity indexes stored in PostgreSQL. Features are
built on top of them:

| Feature | What it does | Uses an LLM? |
| --- | --- | --- |
| Clustering | Groups sonically similar tracks into playlists. An evolutionary search tries K-Means, DBSCAN, GMM and Spectral configurations and scores them on cluster quality and mood diversity | Only for naming playlists |
| Similar Song | Nearest neighbours of one track | No |
| Song Path | A sequence of tracks that moves from one song to another | No |
| Sonic Fingerprint | Averages embeddings of your most-played tracks, weighted by recency with a 30-day half-life, then finds neighbours | No |
| Instant Playlist | A chat request becomes tool calls that query the library | Yes |

Two caveats. I am quoting the upstream documents, and the version I run may
differ in detail. My live AudioMuse configuration has `CLAP_ENABLED=false`,
so the CLAP-based text search and trait scores are not active here.

## How it runs in my homelab

AudioMuse-AI now runs in Incus containers on `shuri`. Navidrome is its
separate music source:

- **Web app, workers and database.** A Flask container serves the UI and API,
  40 worker containers take queue jobs, and a PostgreSQL 15 container stores
  the catalogue and queue. The database is on the private Incus network.
  There is no Redis in this setup.
- **A dedicated, non-admin Navidrome account.** AudioMuse reads the library
  through Navidrome's API as its own service account, not as me.
- **Analysis from the UI and on a schedule.** I started the measured
  full-library run from AudioMuse's web app and watched its progress there.
  A weekly library analysis is scheduled for Sunday at 02:00 Kathmandu time;
  the daily personal discovery playlists are refreshed separately by a
  Navidrome plugin at 03:00.
- **Only on the LAN.** I turned off AudioMuse's own login. Its UI and API
  are reachable only from trusted networks: the reverse proxy limits its
  hostname to trusted clients and nothing routes it to the internet. This is a
  deliberate trade-off. Anyone on my LAN can start a job.

### The LLM handles words, not album analysis

AudioMuse is configured for Ollama on `shuri`, using **Gemma 4 26B** for
features such as playlist naming and chat. The audio feature extraction in
the full-library run is separate from those LLM calls. Moving the app to
Shuri did not make the album work fast by itself; adding queue workers and
giving them database and dispatch capacity did.

One trap: AudioMuse keeps settings in PostgreSQL, and those stored values can
override container environment variables. I ran into that when the
album-dispatch limit stayed at 25 despite changing worker configuration.
Checking the effective setting in the app mattered more than checking the
container definition.

### The Navidrome plugin

AudioMuse-AI ships a Navidrome plugin. It adds **Instant Mix** (song
similarity), **Radio** (artist similarity) and related-artist information,
backed by AudioMuse's engine. I install release v9, pinned by checksum, with an
Ansible playbook that:

1. checks that the running Navidrome version is compatible;
2. stops Navidrome and backs up its database;
3. stages the plugin file and restarts;
4. configures and enables the plugin and reorders Navidrome's agents.

The order matters. Navidrome uses the first agent that supports sonic
similarity, so `audiomuseai` comes first, ahead of the Last.fm and Deezer
agents. Instant Mix from a client passed my acceptance test.

I accepted one permission I'm not happy about. The plugin manifest asks for
HTTP access to any host (`"*"`), which is broader than the ListenBrainz plugin's
single host. I accepted it because the plugin calls only the AudioMuse URL I
configure and Navidrome runs plugins in a WebAssembly sandbox. I review it
again on every upgrade.

### How much of the library it has seen

My first listening test covered five albums and 76 tracks. The later full-library run produced 6,321 unique songs, with seven tracks marked unanalyzable. The [run measurements](/technical-notes/scaling-audiomuse-album-analysis/) describe coverage and throughput; they do not establish recommendation quality across the library.

## Setup sequence and playback check

**Prerequisites:** a working Navidrome library, an AudioMuse instance that can reach it, and compatible releases of Navidrome, AudioMuse and the plugin. My deployment pins plugin v9; a new installation should check the [upstream compatibility notes](https://github.com/NeptuneHub/AudioMuse-AI-NV-plugin#how-to-install) rather than copy that pin blindly.

1. Connect AudioMuse to Navidrome with a dedicated library account and analyse a small set of familiar albums.
2. In Navidrome, enable plugins and install `audiomuseai.ndp` in its configured plugin folder. Back up the data directory before changing an existing installation.
3. Enable the plugin in the admin UI and set the AudioMuse API URL reachable from the server. Supply an API token if your AudioMuse instance requires one.
4. Put `audiomuseai` before other sonic-similarity agents in the agent order.

**Check it works:** run Similar Song in AudioMuse, then Instant Mix on the same seed in Navidrome. Confirm that the returned songs play. If only the first works, inspect the plugin's URL, authentication and server logs before changing the analysis settings. Once that small test works, expand coverage; the [scaling case study](/technical-notes/scaling-audiomuse-album-analysis/) is a measurement of my deployment, not a required worker count.

## Choosing a mix

Instant Mix starts with a song I know and finds neighbours in the analysed library. A similar sound is not a guarantee that the language, mood or style will suit the moment. I listen and keep the mixes I enjoy.

For recommendations based on listening habits, I use the separate [ListenBrainz playlist importer](/technical-notes/scrobbling-everything-to-listenbrainz/#closing-the-loop-history-back-into-playlists). Requests for music outside my library belong to [my discovery workflow](/technical-notes/ai-music-recommendations-from-listenbrainz/#follow-a-suggestion-beyond-the-library).

## Cleaning up generated playlists

Both sources keep producing playlists. AudioMuse clustering adds `_automatic`
playlists and the ListenBrainz plugin adds a new set every day and week.
Within a few months the playlist list is mostly generated output.

`scripts/navidrome_playlist_cleanup.py` handles this in review-first steps:

1. **Inventory** lists playlists through the OpenSubsonic API.
2. **Plan** selects only playlists that are old (by last-changed time) and are
   either AudioMuse output (the `_automatic` suffix) or one of the known
   ListenBrainz importer names. Smart playlists, file-backed playlists and
   anything else are excluded. The plan also fetches my recent ListenBrainz
   listens and reports how many tracks in each playlist I actually played.
   It matches by recording MBID, falling back to an exact artist and title.
3. **Apply** deletes only playlist IDs I pass explicitly. It needs a
   confirmation string and checks each playlist's name, owner, age and
   tracks again before deleting. It refuses to run if my recent
   listening history is empty, because then the played-track overlap is
   meaningless.

The overlap number is a weak signal and the tool says so. ListenBrainz records
that a track was played, not which playlist it was played from. A track I
played from an album will look like playlist use, and missing scrobbles
make a playlist look unused. That is why the tool reports and I decide.

Deleting a playlist removes only the playlist record. Songs, tags and
AudioMuse's analysis are untouched, and the plugins will create new
playlists on their next run anyway.

## What I would tell someone starting

- **Analyse a few albums first.** Check Similar Song on music you know well
  before spending hours on a full-library pass.
- **Remember the stored settings.** Check the effective app value after
  changing a model or analysis limit; a saved value can override the
  container environment.
- **Put the LLM wherever you already run one.** Here it only names
  playlists and handles chat requests. Similarity and fingerprinting do not
  use it.
- **Plan for cleanup from the start.** Generated playlists keep accumulating,
  and you need a rule for deleting them.

## Sources

- [AudioMuse-AI repository](https://github.com/NeptuneHub/AudioMuse-AI)
- [AudioMuse-AI algorithm description](https://github.com/NeptuneHub/AudioMuse-AI/blob/main/docs/ALGORITHM.md)
- [AudioMuse-AI Navidrome plugin](https://github.com/NeptuneHub/AudioMuse-AI-NV-plugin)
- [Aurral](https://aurral.org/)
- [ListenBrainz daily playlist plugin for Navidrome](https://github.com/kgarner7/navidrome-listenbrainz-daily-playlist)
- [ListenBrainz data update intervals](https://listenbrainz.readthedocs.io/en/latest/general/data-update-intervals.html)
