---
title: "My Everyday Music Workflow, Without a Subscription"
date: "2026-11-06T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "My everyday workflow: finding songs, choosing recordings, curating playlists and bringing offline iPod listens back to ListenBrainz."
tags:
  - homelab
  - music
  - recommendations
  - listenbrainz
  - audiomuse-ai
  - llm
  - privacy
  - navidrome
cover: "/images/blog/audio/ai-music-recommendations-from-listenbrainz.webp"
thumb: "/images/blog/audio/ai-music-recommendations-from-listenbrainz.webp"
use_featured_image: true
comments: true
share: true
series: "homelab-music"
seriesOrder: 7
draft: false
last_modified_at: "2026-11-06T13:00:00+05:45"
---

[The series overview](/audio/my-music-after-spotify/) explains why I wanted this setup. This is how I use it. I start with files I own, use a few different ways to find my next song, and keep playlists that suit how I actually listen.

## Start with the music I have

Navidrome is my player at home. I browse the library, choose an album or open a playlist. Keeping [recordings and tags in order](/technical-notes/beyond-spotify-building-a-flac-library/) makes it easier to find the right version and lets other tools match songs reliably.

When I want more music like the song playing, I choose Instant Mix. The [AudioMuse guide](/technical-notes/audiomuse-ai-sonic-recommendations/) explains how similar sounding tracks reach my Navidrome queue and what it took to analyse the full library. I can listen to the queue and save a mix I want to revisit.

## Follow a suggestion beyond the library

[ListenBrainz](/technical-notes/scrobbling-everything-to-listenbrainz/) offers another starting point: recommendations based on listening habits. Its playlist importer brings matching recordings into Navidrome. A suggestion for something I don't own is still useful, but it is not yet a playable file in my collection.

Aurral is where I browse discoveries and request music I want to add. It connects to Lidarr for artist and album management. I review what I want; a recommendation does not mean I should accept any recording with the same title. For an unusual live performance, I may add the recording manually after checking it.

These are different ways to choose music. I don't run a combined job that ranks ListenBrainz history against AudioMuse matches or asks an LLM to explain every choice. AudioMuse's language features are separate from the sound analysis behind Instant Mix.

## Keep playlists I want to hear

My regular playlists include Bollywood Top, Nepali, Hindi Indie and Forever Classics. They reflect different parts of my listening habits, rather than one long queue of every recommendation I have saved.

When a song doesn't work for me in a playlist, I usually rate it one star. Those ratings help me fine-tune the playlists later. I make that judgement while listening; I am not claiming that a rating automatically retrains a model or rewrites every playlist.

Generated playlists need attention too. My cleanup tool reports old generated lists and compares their tracks with recent ListenBrainz listens. It only deletes the playlist IDs I explicitly approve. A track appearing in my history doesn't prove I heard it from that playlist, so I treat the report as a review aid.

## A look inside Forever Classics

When I checked the library for this note, Forever Classics included Queen's “Somebody to Love,” “Don't Stop Me Now” and “We Will Rock You.” Those are actual playlist entries, not example song names added for this article.

I choose the playlist and let it run. If a song doesn't work for me, I give it one star and use that rating when I next review the list. A rating is a cue to reconsider the playlist, not an instruction to delete the recording from my library.

## Take the playlists offline

My [offline iPod running Rockbox](/technical-notes/ipod-video-5-5g-rockbox-purist-player/) is getting a 256 GB upgrade so the whole library can stay on it. The way I choose music remains simple: open a curated playlist and let it play. In the car, I also choose a playlist and listen through it.

On my iPhone I use [Amperfy](https://github.com/BLeeEZ/amperfy), an app that connects to Navidrome as a Subsonic-compatible server. It lets me download music for offline listening, so my library comes with me even when I leave the iPod at home.

When I connect the iPod and sync, the existing scripts import its saved play log into ListenBrainz. I have run this workflow before. The iPod records listens while offline; those listens reach the service later, during sync. The [import notes](/technical-notes/scrobbling-everything-to-listenbrainz/#the-ipod-sync-path) cover recording IDs, timestamps and submission handling.

That history gives me another view of what I return to. Alongside the ratings and the playlists themselves, it helps me decide what to keep listening to next.
