---
title: "My Music After Spotify: Discovery, Ownership and an Offline iPod"
date: "2026-11-06T12:15:00+05:45"
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
---

I didn't want to replace Spotify with a folder full of files and a worse way
to listen. The hard part of leaving was the ordinary pleasure of opening an
app and finding something good without knowing what to search for. I wanted
that feeling, with music that would still be there when a subscription, an
internet connection or a catalogue agreement wasn't.

So I built around a library I control. Navidrome is the player I open at home.
ListenBrainz and AudioMuse help me find things to play, in different ways.
Aurral is where I can explore music beyond my library and review requests.
And when I want to put my phone away, I take an iPod Video 5.5G loaded with
selected music.

This is a story about how those parts feel together. The setup, measurements
and caveats live in the linked technical notes.

## Four apps, four jobs

- **[Navidrome](https://www.navidrome.org/)** is my music player and catalogue.
  It indexes the files on my NAS, remembers plays and favourites, and shows
  playlists. I hear the result here, whether I found a song myself or another
  app suggested it.
- **[AudioMuse-AI](https://github.com/NeptuneHub/AudioMuse-AI)** analyses the
  sound of the tracks in that catalogue. From a song I choose, its **sonic
  analysis** can find nearby sounds among files I already have. Its Navidrome
  plugin makes those matches available as Instant Mix in the player.
- **[ListenBrainz](https://listenbrainz.org/)** collects listening history and
  makes recommendations from listening patterns. A Navidrome plugin brings
  its discovery playlists into my player, matching the suggested recordings
  to files I own. It can also suggest music absent from my library.
- **[Aurral](https://aurral.org/)** is a place to browse discoveries and review
  requests for music I want to add. It connects to Lidarr, which manages the
  permanent artist and album library. Its flows can make playlists visible in
  Navidrome; a recommendation is still a choice, not a command to import an
  arbitrary recording.

They meet at the listening experience, but each one answers a different
question: **what can I play, what sounds like this, what might I like, and
what do I want to add?**

Sonic analysis means turning a recording's audible characteristics into
numbers that can be compared: rhythm, energy, timbre and patterns learned by
an audio model. AudioMuse searches for tracks near the song I picked in that
sound map. That is especially useful for music with little listening data or
messy tags, because the comparison starts with the audio itself. It is not a
universal measure of taste. Two songs can sound alike while belonging to
different languages, scenes or moods I would not put together. ListenBrainz
adds the human listening-pattern view; I get more from having both than from
declaring either one the winner.

## What replaces what?

| What I liked about streaming | What I use now |
| --- | --- |
| Search and play anywhere at home | Navidrome serves the files on my NAS to its web player and compatible clients. |
| A mix from one song | **Instant Mix** in Navidrome, backed by AudioMuse's sonic analysis of the actual audio. |
| A fresh discovery playlist | ListenBrainz playlists and Aurral flows, shown in Navidrome where their tracks are available. |
| Taking music offline | My iPod Video 5.5G running Rockbox carries a chosen part of the same library as files and playlists. |
| Finding a song I don't own | Aurral helps me explore and request music; I check the exact recording before I add it to the permanent library. |

None of these pieces needs to imitate Spotify's catalogue. I choose what
belongs in mine. A recommendation can lead me outside it, but it cannot quietly
replace one recording with another just because the titles match.

## Start with a song I already love

I tried Instant Mix on **“Aama” by Sushant KC** in my Nepali playlist. I opened
the song's menu in Navidrome, chose **Instant Mix**, and got a playable queue of
101 songs. AudioMuse could do that because it had analysed almost all of my
library, including music that might be too local or obscure for a large
listening-data service to know well. It is a way to rediscover what I already
have, right where I listen.

![The Instant Mix result in my Navidrome play queue.](/images/blog/editorial/audiomuse-parallel-analysis/navidrome-instant-mix-queue.png)

ListenBrainz does a different job. It can use what I have played, and what
other people listen to, to suggest a direction I might not have searched for.
Its playlists arrive in Navidrome when the recordings can be matched to my
files. Aurral gives me another place to browse beyond my existing albums.
I can choose a familiar sounding path on one day and a surprising suggestion
on another.

## When the song isn't in my library

Discovery sometimes ends at a missing track. A recent example was a video of
Swoopna Suman singing **“Je Chhau Timi” live with Sushant KC**. I already had
the 2023 studio recording. I wanted the 2025 live performance from the video,
so I checked that it was a distinct recording, brought its audio into my music
folder, and verified that Navidrome showed a separate track. The source audio
is AAC, so I kept it as M4A instead of pretending it was FLAC.

That small distinction matters more to me than an automatic “get this song”
button. A music library should know *which* performance I meant. Aurral can
help me discover and request an artist or album through Lidarr. This specific
live video was a manual, recording-level addition after I checked its identity;
I did not use Aurral to import it. Either way, I want a source I can check and
the correct recording in the library at the end.

## The same music leaves the house

The server is one way to reach my library. My [iPod Video 5.5G](/technical-notes/ipod-video-5-5g-rockbox-purist-player/)
is another. It has flash storage and Rockbox, so I can copy over the music and
playlists I want, including FLAC. It keeps playing without Wi-Fi, a phone or a
service login. The iPod does not make recommendations while I'm out; I make a
selection before I leave, and that is sometimes exactly what I want.

I like the 5.5G's Wolfson-based sound. “Warm” is how I describe my experience,
not a measured promise that its DAC makes every headphone sound warmer. For
casual listening, I don't need a costly IEM to enjoy it. My Sony WH-1000XM4
works with the iPod **over a headphone cable**; I can use it powered off as
ordinary headphones or powered on for noise cancellation. The iPod itself
doesn't send Bluetooth audio to it. On other days I use IEMs. The choice is
about the listening situation, not winning an equipment contest.

The offline path has one honest loose end: I have an importer for Rockbox play
logs, but I have not established routine automatic scrobbling from the iPod.
Navidrome plays do reach ListenBrainz. So I treat listening history as useful
evidence, not a perfect record of every hour with music.

## A library I can keep listening to

Spotify made discovery effortless. I am willing to do a little more work for
the ability to keep the recordings, choose the player and know why a song is
there. I can start with a track I love, hear an Instant Mix from my own files,
follow a ListenBrainz or Aurral suggestion, add a missing recording with care,
and take a selection offline on my iPod. That feels like a complete listening life to
me, not just a server project.

If you want the setup behind it, start with [building the library](/technical-notes/beyond-spotify-building-a-flac-library/),
then read [how AudioMuse fits Navidrome](/technical-notes/audiomuse-ai-sonic-recommendations/),
[how ListenBrainz returns playlists](/technical-notes/scrobbling-everything-to-listenbrainz/),
and [what it took to analyse the whole library](/technical-notes/scaling-audiomuse-album-analysis/).

## Sources

- [Navidrome](https://www.navidrome.org/)
- [AudioMuse-AI](https://github.com/NeptuneHub/AudioMuse-AI)
- [ListenBrainz](https://listenbrainz.org/)
- [Aurral](https://aurral.org/)
- [Sony WH-1000XM4 wired-use guide](https://helpguide.sony.net/mdr/wh1000xm4/v1/en/contents/TP0002752734.html)
