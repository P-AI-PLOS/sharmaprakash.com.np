---
title: "Seeing My Listening: Spindle Stats and a Yearly Recap for Navidrome"
date: "2026-11-07T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Top artists, a listening clock and a yearly Wrapped-style recap, built from my own Navidrome plays. How Spindle collects them, what it took to deploy, and what its numbers can and cannot tell me."
tags:
  - homelab
  - music
  - navidrome
  - spindle
  - listenbrainz
  - self-hosting
cover: "/images/blog/audio/spindle/spindle-tops.webp"
thumb: "/images/blog/audio/spindle/spindle-wrapped-poster.webp"
use_featured_image: true
comments: true
share: true
series: "homelab-music"
seriesOrder: 6
draft: false
---

One of the fun parts of a streaming app is the end-of-year recap: who you
played most, your biggest day, the hour you always reach for music. Owning my
library should not mean giving that up. [Spindle](https://github.com/xmorose/spindle),
an open-source project on GitHub, gives me those stats from my own [Navidrome](https://www.navidrome.org/) plays,
on my own server.

<video controls muted playsinline preload="none" poster="/images/blog/audio/spindle/spindle-wrapped-poster.webp" width="1280" height="810" aria-label="Screen recording scrolling through Spindle's Wrapped recap">
  <source src="/images/blog/audio/spindle/spindle-wrapped.mp4" type="video/mp4" />
</video>

## What it shows me

Spindle is a small dashboard: a backend that stores play events and a web
interface that turns them into views. The ones I actually open:

- **Home** — totals for the selected range and the top artist. Over the last
  30 days that was 293 songs, about 24 hours of listening, 165 artists and
  211 albums.
- **Tops** — ranked artists, albums and tracks, by plays or by time.
- **Pulse** — a listening clock and a weekday chart. For the last 30 days my
  peak hour is 16:00, Thursday is my heaviest day, and 15% of my plays fall
  on the weekend.
- **Flow** — how the artists I play shift from week to week.
- **Sessions** — runs of continuous listening, with the track that started
  each one.
- **Wrapped** — the yearly recap, built from the same events.

<img src="/images/blog/audio/spindle/spindle-pulse.webp" alt="Spindle Pulse view: a listening clock peaking at 16:00 and a weekday bar chart with Thursday highest" loading="lazy" width="1200" height="744" />

Wrapped is the part that makes it feel like a streaming service. Mine says the
year peaked on 11 September: 69 plays in a single day, including a 3-hour
17-minute session of 49 tracks. On an average day that I listened at all, I
played 13.9 songs.

<img src="/images/blog/audio/spindle/spindle-wrapped-record.webp" alt="Spindle Wrapped 'For the record' slide: biggest day 11 September with 69 plays, longest session 3h 17m, 13.9 songs on an average listening day" loading="lazy" width="1264" height="800" />

## How plays reach it

Spindle has two halves. A collector plugin runs inside Navidrome and posts
each scrobble to the Spindle backend. The backend keeps its own SQLite event
store and reads Navidrome's database for album, artist and cover-art details.
The dashboard reads only from Spindle.

```text
Navidrome play ──► collector plugin ──► Spindle backend (SQLite events)
                                              │
              navidrome.db (metadata, art) ───┘──► dashboard
```

That makes Spindle a sibling of the [ListenBrainz scrobbling](/technical-notes/scrobbling-everything-to-listenbrainz/)
I already had, not a replacement. ListenBrainz holds my long-term history and
feeds recommendations; Spindle is the local, visual view of what I played.

## Deploying it

I run Spindle 0.4.3 as a Docker Compose service on the same host as
Navidrome, behind its own Compose profile so a routine update of the media
stack does not start it by accident. Caddy serves it at a local hostname
that only trusted networks can reach, and the container exposes no host
port. Deployment is an Ansible playbook that runs read-only checks first and
stops unless I confirm.

Four things were less obvious than I expected:

1. **The collector has no ready-made download.** The collector is part of
   the Spindle project on GitHub: a small plugin that runs inside Navidrome
   and sends each play to Spindle. Its releases include only the source code,
   so a coding agent compiled the unchanged v0.4.3 source to WebAssembly
   (`wasm32-wasip1`) for Navidrome, and my deploy playbook pins the result by
   checksum.
2. **Plugin permissions use user IDs, not usernames.** Navidrome accepted a
   username in the plugin's user list without complaint, and the collector
   then silently failed its permission check. Selecting users in the web UI
   avoids that.
3. **The Navidrome data folder is mounted read-write.** Spindle opens the
   database read-only, but SQLite still manages its
   [write-ahead log](https://www.sqlite.org/wal.html) files next to it, and a
   read-only mount can fail to open the database or return stale data.
4. **One password guards everyone's history.** The dashboard has a single
   shared passphrase, not per-user accounts. That is fine on a home network
   for one listener; it is not something I would expose to the internet.

The collector's manifest also requests HTTP access to any host, the same broad
scope I accepted for the AudioMuse plugin. Navidrome runs plugins in a
WebAssembly sandbox and the target is the backend URL I configure, but I
review that permission again on every plugin upgrade.

## Bringing in older plays

A dashboard that starts on install day is empty for months. Spindle can
import history from ListenBrainz and Last.fm, so I imported mine. The importer
keeps only plays whose artist and title match a track in my library exactly,
and removes duplicates by track and timestamp.

Some imported counts arrive as totals with no dates. Spindle keeps those in
the all-time numbers but cannot place them on a timeline, so the time charts
and Wrapped only start where dated plays begin. In my recap, January to July
are empty and the year effectively starts on 11 August: 737 plays across 84
days, with October as the loudest month.

<img src="/images/blog/audio/spindle/spindle-wrapped-months.webp" alt="Spindle Wrapped month-by-month grid: January to July empty, August to November filled with album art, October the loudest month" loading="lazy" width="1264" height="800" />

Plays on my [offline iPod](/technical-notes/ipod-video-5-5g-rockbox-purist-player/)
never pass through Navidrome, so the collector does not see them. They reach
ListenBrainz through the importer described in the scrobbling guide. Spindle
would only pick them up through another import from ListenBrainz.

## What the numbers are good for

Spindle tells me what I played, not what I liked. A song can top the chart
because it sat in a long playlist, and an album I love can barely register if
I mostly play it offline. Imported history without dates widens the gap
between the all-time totals and the charts.

Read with that in mind, it does what I wanted: a quick, honest look at my own
listening, and a yearly recap that comes from my library rather than a
subscription. Keeping that kind of fun was the point of [running my own music
stack](/series/homelab-music/) in the first place.

## Sources

- [Spindle repository and releases](https://github.com/xmorose/spindle)
- [Navidrome plugins documentation](https://www.navidrome.org/docs/usage/plugins/)
- [SQLite write-ahead logging](https://www.sqlite.org/wal.html)
- [ListenBrainz](https://listenbrainz.org/)
