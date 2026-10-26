---
title: "Using AI to Build My Own Music Recommendations from ListenBrainz Listens"
date: "2026-10-26T12:20:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Combining my ListenBrainz history (iPod plays included), AudioMuse-AI sonic similarity and a local LLM into playlists that explain themselves. What already runs in my homelab, what is only a design, and how to tell whether any of it works."
tags:
  - homelab
  - music
  - recommendations
  - listenbrainz
  - audiomuse-ai
  - llm
  - privacy
  - navidrome
use_featured_image: false
comments: true
share: true
series: homelab-music
seriesOrder: 5
draft: false
---

The earlier parts of this series built the inputs. The
[field guide](/technical-notes/homelab-music-recommendations-field-guide/)
listed the signals. The [YouTube post](/technical-notes/youtube-to-scrobble/)
and the [ListenBrainz post](/technical-notes/scrobbling-everything-to-listenbrainz/)
got my listening into one history. The
[AudioMuse-AI post](/technical-notes/audiomuse-ai-sonic-recommendations/)
added a sound-based similarity engine over the files I own.

This post asks what I can build on top of those inputs: playlists that use my
history, the sound of my library and a local LLM, and that say why each track
is there.

I'll be strict about status in this post. Some of it runs today. Most of the
combining layer is a **proposal**, and every proposed part is labelled.

## What already exists

| Piece | Status | What it gives me |
| --- | --- | --- |
| ListenBrainz as my listening history | Built | One timeline of recordings, mostly with MusicBrainz IDs |
| iPod plays to ListenBrainz | Built, on a working branch | A script that reads the Rockbox play log, keeps plays that count as a listen (at least 30 seconds and half the track or four minutes), reads tags and recording MBIDs from the files, and submits them as imports |
| ListenBrainz playlists in Navidrome | Built | A Navidrome plugin imports Daily Jams, Weekly Jams and Weekly Exploration, matching by MBID |
| AudioMuse-AI sonic analysis | Built, partial coverage | Similar Song, Song Path, clustering and Instant Mix in Navidrome. Only a small verified sample of the library is analysed so far |
| Local LLM | Built | Gemma 4 26B on Ollama on my GPU host. AudioMuse uses it to name playlists |
| Playlist cleanup with a listen check | Built | A script that reports, for each old generated playlist, how many of its tracks show up in my recent ListenBrainz listens |

AudioMuse already has a feature close to what I want. **Sonic Fingerprint**
takes your most-played tracks, weights them by recency, averages their
embeddings and returns neighbours. Its play counts come from the media server,
though, so iPod listening and anything played outside Navidrome is invisible
to it. ListenBrainz sees all of that.

So the gap is not another model. Nothing yet joins **ListenBrainz history**
to **AudioMuse similarity**, and nothing writes down the reasoning.

## The proposed design

> **Proposed.** None of this section is built. It is the design I intend to
> build. It uses only the pieces in the table above.

A small batch job runs locally on a schedule and produces one or two Navidrome
playlists a week.

### 1. Read history (proposed)

Pull recent listens from the ListenBrainz API. The per-user listens endpoint
returns up to 1,000 listens per request, newest first. The cleanup script
already pages through it. Group the listens by recording MBID and compute
counts per recording and artist for, for example, the last 30 days and the
last year.

That gives a few useful sets:

- **current rotation:** heavy plays in the last few weeks;
- **old favourites:** heavy plays a year ago, few recently;
- **skipped neighbours:** tracks I own by artists I play a lot that I have
  never played myself.

### 2. Expand by sound (proposed)

For seeds picked from those sets, ask AudioMuse for similar tracks (Similar
Song) or a path between two seeds (Song Path). This keeps every candidate
inside my library and lets obscure and local releases in, which ListenBrainz's
collaborative data cannot do.

### 3. Rank with plain rules (proposed)

Before any LLM is involved, score candidates with transparent rules:

- reward sonic closeness to the seed;
- reward tracks not played in the last N days;
- cap tracks per artist and per album;
- penalise tracks that appeared in a generated playlist I ignored.

This step should still work if the LLM is switched off. The ranking needs to
be something I can debug.

### 4. Let the LLM explain and sequence (proposed)

Then hand the shortlist to the local model with the evidence: play counts,
dates, which seed each candidate came from, the similarity score, and tempo,
energy and key from AudioMuse. Ask it to:

- choose an order (for example, ease from low to high energy);
- write one line per track saying why it is there, using only the evidence it
  was given;
- name the playlist.

Gemma does not decide what I like. The listening data and the similarity
index decide that. The LLM turns numbers into a sentence like "you played this
artist 40 times in March and nothing since; this track sits close to the seed
you have on repeat this week". If it makes up a fact that isn't in the
evidence, that is a bug, and the job can check every claim against the
evidence before saving the playlist.

Navidrome playlists have a comment field. The explanations could go there, or
into a small local report next to the playlist.

## Why keep it local

Listening history is personal data. It shows moods, routines, when I am
awake and what I listen to when things are bad. ListenBrainz already holds my
listens publicly, and I accept that. Sending that history, together with the
contents of my library, to a hosted LLM API is a different decision, and
I don't have to make it:

- the audio analysis runs on my own hardware against my own files;
- the LLM runs on my own GPU host;
- the only external call in the design is reading my own listens from
  ListenBrainz.

There is a cost. A 26B model on an integrated GPU is slow, which is fine for a
weekly batch job and no good for a chat interface. It also writes worse prose
than a frontier model. For one-line explanations grounded in the evidence it
is given, I expect that to be enough. That is an expectation, not something I
have measured.

## Evaluation: did I actually listen?

This is the part I care about most and the part most recommendation write-ups
skip. A playlist that sounds clever and that I never play has failed.

Measurement already exists in a crude form. The cleanup script compares
each generated playlist's tracks with my recent ListenBrainz listens and
reports the overlap. It is honest about its limits. ListenBrainz records that
I played a track, not where I played it from. Album listening inflates the
number and gaps in scrobbling deflate it.

The proposed job can do better because it creates the playlists itself.

> **Proposed evaluation.** For each generated playlist, record the
> track list and the creation time. After two weeks, count:
>
> - **play-through rate:** the share of tracks that appear in ListenBrainz
>   after the creation time;
> - **new-to-me rate:** the share of played tracks I had never played before;
> - **repeat rate:** tracks played again in a later week, the closest signal I
>   have to "I liked this".
>
> Compare the same numbers for the ListenBrainz-imported playlists and the
> AudioMuse `_automatic` playlists over the same period.

That comparison is the reason to build any of this. If my playlists don't beat
ListenBrainz's Weekly Exploration on play-through and repeat rate, I should
delete the job and keep using the existing plugins.

There are two biases I already know about. Generated tracks are by definition
in my library, so they are easier to play than ListenBrainz suggestions that
the import might not match. And the iPod gets heavy use away from the network,
so its scrobbles arrive in batches. A two-week window covers that delay.

## What has to happen first

Roughly in order, and none of it is done yet:

1. **Analyse the full library in AudioMuse.** Recommendations from a small
   sample prove nothing.
2. **Merge and use the iPod scrobbler routinely** so ListenBrainz includes
   listening outside the network.
3. **Build the history read and rule-based ranking** with no LLM, and compare
   it against the existing playlists.
4. **Add the LLM explanations** only if the rule-based version is played
   enough to be worth explaining.

Each step is useful by itself, and each one can stop the project if the numbers
say so.

## Sources

- [ListenBrainz core API (user listens)](https://listenbrainz.readthedocs.io/en/latest/users/api/core.html)
- [ListenBrainz data update intervals](https://listenbrainz.readthedocs.io/en/latest/general/data-update-intervals.html)
- [AudioMuse-AI algorithm description (Sonic Fingerprint, LLM use)](https://github.com/NeptuneHub/AudioMuse-AI/blob/main/docs/ALGORITHM.md)
- [AudioMuse-AI Navidrome plugin](https://github.com/NeptuneHub/AudioMuse-AI-NV-plugin)
- [ListenBrainz daily playlist plugin for Navidrome](https://github.com/kgarner7/navidrome-listenbrainz-daily-playlist)
