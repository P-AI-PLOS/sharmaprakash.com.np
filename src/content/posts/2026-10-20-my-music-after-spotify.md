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
last_modified_at: "2026-11-06T13:00:00+05:45"
series: "homelab-music"
seriesOrder: 1
---

I wanted to leave Spotify, but I didn't want to stop finding music. I liked opening an app without a song in mind and hearing something I wanted to play again. A folder of albums could hold my favourites, but I worried I would keep choosing the same ones.

What I wanted was to choose music from files I own, while still leaving room for something new. I could keep a recording I loved, decide where to play it, and take it with me. [Building that library](/technical-notes/beyond-spotify-building-a-flac-library/) took some work. Then I needed a way to enjoy it without spending every evening sorting files.

[Navidrome](https://www.navidrome.org/) is where I play that music at home. It turns the files on my storage drive into a library I can browse by song or album. Most days, I just want to pick something and listen.

Sometimes I know the first song I want, but not the next one. I tried starting with “Aama” by Sushant KC and choosing Instant Mix. Behind that mix is [AudioMuse](https://github.com/NeptuneHub/AudioMuse-AI), which finds similar sounding songs among the files I already have. Sonic analysis means comparing how songs sound, including their rhythm, energy and tone. It gives me a way to wander through my own collection without choosing every track myself. I've written more about [how it works with Navidrome](/technical-notes/audiomuse-ai-sonic-recommendations/) and [analysing the whole library](/technical-notes/scaling-audiomuse-album-analysis/) in the technical notes.

That helps me find music I've already kept. For suggestions based on listening habits, I use [ListenBrainz](https://listenbrainz.org/). It looks at what I play and what other people listen to, then suggests music I might like. Some of those suggestions match files in my library and become playlists I can play. Others give me something new to look for. The [listening history and playlist setup](/technical-notes/scrobbling-everything-to-listenbrainz/) has its own notes, too.

When I want to explore music I don't own, [Aurral](https://aurral.org/) helps me discover it and request additions to my library. I still choose what to add. Finding a title is only part of it; sometimes I want one particular recording of a song.

That happened with “Je Chhau Timi.” I already had the 2023 studio recording, but I wanted the distinct 2025 live performance with Swoopna Suman and Sushant KC. I checked the recording, added the audio manually, and made sure it appeared as a separate track. This wasn't an Aurral import. I kept the source audio as M4A rather than changing it to FLAC, which wouldn't improve it. It was a small addition, but it meant I could play the performance I had gone looking for.

Playlists are a big part of how I listen offline. I've built them around my listening habits: Bollywood Top, Nepali, Hindi Indie, Forever Classics. My [Rockbox iPod Video 5.5G](/technical-notes/ipod-video-5-5g-rockbox-purist-player/) is getting a 256 GB storage upgrade so I can keep my whole music library on it. When I listen offline, I choose a curated playlist to suit my mood and leave my phone alone while it plays.

I enjoy the iPod's Wolfson sound with ordinary wired headphones. That's my preference, not a claim that it sounds better for everyone. My Sony WH-1000XM4 works for this too, connected with a headphone cable. I like sitting down with it and listening without much else to do.

I take selected music and playlists from the same library into my car, too. I pick a playlist and let the songs play through. If I don't like a song in a playlist, I usually give it one star. Those ratings help me fine-tune the playlists later, so the next time I choose one, it has more of what I want to hear.

The practical follow-up is [how I use the library, discovery tools and offline playlists](/technical-notes/ai-music-recommendations-from-listenbrainz/).
