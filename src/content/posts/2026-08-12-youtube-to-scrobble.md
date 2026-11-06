---
title: "YouTube Listening: A Video Is Not Always One Song"
date: "2026-08-12T14:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Why album uploads and live sets are awkward listening-history records, and how I keep recording identity separate from a video title."
tags:
  - youtube
  - listenbrainz
  - scrobbling
  - music
  - open-source
  - homelab
use_featured_image: false
comments: true
share: true
last_modified_at: "2026-11-06T13:00:00+05:45"
---

A music file usually represents one track. A YouTube video might contain one song, a whole album or a live set. Recording the video title as a single listen can hide what actually played.

This is a note about that limitation, not a description of an automated YouTube import pipeline in my setup. For the working listening paths, see [Navidrome and iPod sync to ListenBrainz](/technical-notes/scrobbling-everything-to-listenbrainz/).

## What a title cannot tell me

An upload called “Full Album” doesn't identify each recording. A live performance may share a title with the studio version but still be a different recording. A chapter label can help locate a song without proving its identity or showing how much of it I heard.

Before treating part of a video as a track, I need the artist, song, performance and boundaries. Skipping around the video makes elapsed listening time another question. None of that follows from the total video duration.

## Where existing tools help

[Web Scrobbler](https://github.com/web-scrobbler/web-scrobbler) provides browser scrobbling; its supported sites and metadata handling are documented upstream. [MusicBrainz](https://musicbrainz.org/) supplies recording and release identities. Those are useful pieces, but I do not assume they turn every long upload into a correct list of individual listens.

For a single-song upload, check the track information before trusting the resulting listen. For an album or continuous set, keep uncertainty visible rather than assigning a guessed recording to every segment.

## How this fits my library

When I want a particular performance in my library, I check it against the recordings I already have. The live “Je Chhau Timi” example in [my listening essay](/audio/my-music-after-spotify/) is a manual addition, not evidence of an automated video-processing system.

Once a file is in the library, [tags and recording IDs](/technical-notes/beyond-spotify-building-a-flac-library/#tagging-with-musicbrainz) help the player and listening-history tools identify it. Changing an AAC file to FLAC would not recover missing information, so I retain the source format when appropriate.

My regular discovery and offline listening routine is described in [how I use the stack](/technical-notes/ai-music-recommendations-from-listenbrainz/). The broader [signals reference](/technical-notes/homelab-music-recommendations-field-guide/) separates recording identity from sound similarity and listening habits.
