---
title: "My Music After Spotify: Discovery, Ownership and an Offline iPod"
date: "2026-10-20T10:00:00+05:45"
category: ["Audio"]
categories: ["audio"]
directory: audio
excerpt: "I wanted to leave Spotify without giving up the pleasure of finding music. This is how my own library, Navidrome, ListenBrainz, AudioMuse and an offline iPod fit together."
tags:
  - music
  - spotify
  - navidrome
  - listenbrainz
  - audiomuse-ai
  - ipod
cover: "/images/blog/audio/my-music-after-spotify-cover.webp"
thumb: "/images/blog/audio/my-music-after-spotify-thumb.webp"
use_featured_image: true
draft: false
comments: true
share: true
last_modified_at: "2026-11-16T18:00:00+05:45"
series: "homelab-music"
seriesOrder: 1
---

I wanted to leave Spotify without losing the pleasure of finding music: opening an app with no song in mind and hearing something I want to play again. A folder of albums holds favourites, but I worried I would keep choosing the same ones.

So the goal became simple: play music from files I own, and still leave room for something new. This is how the pieces fit together and how I use them day to day.

## Play at home

[Navidrome](https://www.navidrome.org/) turns the files on my storage drive into a library I can browse by song, album or playlist. [Building that library](/technical-notes/beyond-spotify-building-a-flac-library/) took some work; keeping recordings and tags in order is what lets the other tools match songs reliably.

On my iPhone I use [Amperfy](https://github.com/BLeeEZ/amperfy), which connects to Navidrome and downloads music for offline listening.

## Find the next song

Three tools, three different starting points:

- **More like this song.** Instant Mix in Navidrome is backed by [AudioMuse](/technical-notes/audiomuse-ai-sonic-recommendations/), which compares how songs sound (rhythm, energy, tone) across files I already have. Starting from “Aama” by Sushant KC, it wanders through my own collection without me picking every track.
- **Based on my listening.** [ListenBrainz](/technical-notes/scrobbling-everything-to-listenbrainz/) suggests music from what I and similar listeners play. Matches in my library become playable Navidrome playlists.
- **Beyond the library.** [Aurral](https://aurral.org/) is where I browse discoveries and request additions through Lidarr. I still choose what to add, and sometimes I want one particular recording.

That happened with “Je Chhau Timi.” I had the 2023 studio version but wanted the 2025 live performance with Swoopna Suman and Sushant KC. I checked the recording, added it manually as a separate track, and kept the source M4A rather than converting it to FLAC, which would not improve it.

## Keep playlists I want to hear

My regular playlists are Bollywood Top, Nepali, Hindi Indie and Forever Classics. When a song doesn't work in one, I give it one star and use that when I next review the list. A rating is a cue to reconsider, not an instruction to delete the recording.

Generated ListenBrainz playlists pile up, so a small cleanup tool reports old ones and deletes only the playlists I approve.

## Take it offline

My [iPod running Rockbox](/technical-notes/ipod-video-5-5g-rockbox-purist-player/) holds my complete library, but I still listen through curated playlists. I pick one to suit my mood and leave the phone alone. I listen with wired IEMs, and in the car I do the same: choose a playlist and let it play.

When I sync the iPod, its offline play log goes to ListenBrainz, so those listens count too. That history, alongside the ratings, helps me decide what to keep listening to next.
