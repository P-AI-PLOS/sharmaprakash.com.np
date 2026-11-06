---
title: "Beyond Spotify: Building a FLAC Library You Own"
date: "2026-10-22T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "How to build a lossless music library legally: rip your CDs accurately, buy lossless downloads, rebuild your Spotify playlists from owned files, then tag, normalise and size it for a Rockbox iPod."
tags:
  - audio
  - flac
  - music-library
  - musicbrainz
  - rockbox
series: "homelab-music"
seriesOrder: 2
cover: "/images/blog/audio/beyond-spotify-building-a-flac-library.webp"
thumb: "/images/blog/audio/beyond-spotify-building-a-flac-library.webp"
use_featured_image: true
draft: false
comments: true
share: true
last_modified_at: "2026-11-06T13:00:00+05:45"
---

My [music after Spotify](/audio/my-music-after-spotify/) still has the parts I
care about: discovery, a player I like, and songs I can take offline. The
foundation is a library of files I can keep. A streaming subscription gives
access to a catalogue; it does not give me those files. Building my own
collection means choosing the right *recording*, not merely finding a file
with a familiar title.

This technical guide covers building that library legally, then making it
clean enough that a 2006 iPod running Rockbox handles it well.

## Why FLAC

**FLAC** (Free Lossless Audio Codec) compresses audio without throwing anything away. Decode a FLAC file and you get back exactly the samples that went in. A CD-quality album is usually about half the size of the uncompressed WAV.

| Format | Lossless | Open | Plays on Rockbox | Plays on Apple iPod firmware |
|---|---|---|---|---|
| FLAC | Yes | Yes | Yes | No |
| ALAC | Yes | Yes (since 2011) | Yes | Yes |
| WAV/AIFF | Yes (uncompressed) | Yes | Yes | Yes |
| MP3, AAC | No | Varies | Yes | Yes |

FLAC is the default for archiving: open, widely supported, and with good tagging. If you run Rockbox, keep FLAC. If you stay on Apple's firmware, convert to ALAC for the player and keep FLAC as the master.

## Legal sources

### Rip the CDs you own

A CD you own is still one of the cheapest lossless sources, and second-hand CDs are often cheaper than a download.

- **macOS:** [XLD](https://tmkk.undo.jp/xld/index_e.html) (X Lossless Decoder).
- **Windows:** [Exact Audio Copy](https://www.exactaudiocopy.de/) (EAC).

Both can check each track against **AccurateRip**, a database of checksums from other people's rips of the same disc. When your checksum matches, you know the rip is bit-perfect, not just "probably fine". Both tools also re-read sections when a scratch causes errors, and both write a log you can keep beside the album.

Set the output to FLAC, enable AccurateRip, and let the ripper fetch metadata. You will clean the tags up later anyway.

### Buy lossless downloads

Several stores sell DRM-free lossless files:

| Store | What it is good for |
|---|---|
| [Bandcamp](https://bandcamp.com/) | Independent artists; buy once, download in FLAC, ALAC and other formats. A large share goes to the artist. |
| [Qobuz](https://www.qobuz.com/) | Mainstream catalogue in CD quality and hi-res. |
| [7digital](https://www.7digital.com/) | Long-running download store with lossless options in some regions. |
| [HDtracks](https://www.hdtracks.com/) | Hi-res specialist. |

Store availability varies by country, so check before you plan around one. For an iPod, CD quality (16-bit/44.1 kHz) is enough; see the hi-res note below.

### Rebuild your Spotify playlists

Your playlists are the part of a streaming account worth keeping. Export them as lists of artist, title and album using a playlist export tool or Spotify's own personal data download. That list is your shopping list: tick off each track as you rip or buy the album it comes from. When you are done, the playlist exists again, pointing at files you own.

This is slow. It is also where the library becomes yours rather than a copy of an algorithm's picks.

## Tagging with MusicBrainz

A file is only as good as its tags. [MusicBrainz](https://musicbrainz.org/) is an open music encyclopedia that identifies every release, track and recording with a stable ID. Tagging against it gives consistent artist names, correct track numbers, compilation flags and the IDs other services understand.

Two tools do the work:

- **[MusicBrainz Picard](https://picard.musicbrainz.org/):** a desktop app. Drop in a folder, cluster, look up, check the match, save. It can also identify files by audio fingerprint (AcoustID) when the tags are useless.
- **[beets](https://beets.io/):** a command-line organiser that matches whole albums against MusicBrainz and moves files into a consistent folder layout.

My rules for the library:

- One album per folder.
- Embedded title, artist, album, album artist, track number, date, and disc number for multi-disc releases.
- "Various Artists" plus the compilation flag for compilations.
- Folder paths built from reviewed tags: `Album Artist/Album/disc-track Title.flac`.
- MusicBrainz IDs only when I have checked the match.

I run beets first in a plan-only mode that changes nothing, and open only the albums it cannot match confidently in Picard. The trap to avoid is trusting a fingerprint too much: an audio fingerprint identifies a *recording*, not which *edition* of an album you have. Check the track count and the release before saving.

MusicBrainz is community-edited. If a small or regional artist is missing, you can add the release yourself, and everyone who tags that album after you benefits.

## ReplayGain

Albums are mastered at very different loudness. Shuffle a quiet 1970s record next to a modern pop single and you will reach for the volume wheel. **ReplayGain** fixes that without changing the audio: a tagger scans each track and album and writes the gain needed to bring it to a reference loudness into the tags. The player applies it at playback.

- **Track gain** levels every song individually. Good for shuffle.
- **Album gain** levels whole albums but keeps the loud and quiet songs within an album in proportion. Good for album listening.

Both Picard (with its ReplayGain plugin) and beets can write ReplayGain tags. On my iPod, Rockbox uses track gain in shuffle and leaves albums alone, with clipping prevention on. The [Rockbox guide](/technical-notes/ipod-video-5-5g-rockbox-purist-player/#my-playback-settings) lists my settings.

## Album art for the iPod

Rockbox is picky about images:

- **Use baseline JPEG, not progressive.** The Rockbox manual says it does not support progressive or multi-scan JPEG files.
- **For FLAC, use a cover file in the album folder.** Rockbox reads embedded art only from JPEGs in ID3v2 (MP3) and MP4 tags. For FLAC it looks for files such as `cover.jpg` or `folder.jpg` beside the tracks.
- **Keep it small.** The screen is 320 × 240. A huge scan wastes space and decoding time. Rockbox's manual gives no official maximum; resizing to a few hundred pixels square is a common choice among iPod users.

Keep the full-size art in your master library and generate small baseline copies for the iPod.

## Hi-res and the iPod

The iPod's codec runs at 16-bit/44.1 kHz. Rockbox plays 24-bit/96 kHz and 192 kHz FLAC, but the PP5021C chip resamples it in software, which costs battery and can stutter at the highest rates. Dithering keeps the reduction to 16-bit clean. [Part 1](/technical-notes/what-you-can-actually-hear/) explains why you lose nothing audible: buy at CD quality, and keep hi-res only when it is a better master.

## Serving the files with Navidrome

The [official installation guide](https://www.navidrome.org/docs/installation/) covers supported installation methods. The essentials are a music directory the server can read, a persistent data directory for its database, and a user account for playback. Keep music backups separate from the application database backup.

After the first scan, check an album, a multi-disc release and a recording with several versions. Play a file before adding discovery plugins. In my setup the files live on the NAS; Navidrome is the player, not the source of new music.

Next, connect [ListenBrainz](/technical-notes/scrobbling-everything-to-listenbrainz/) and configure [AudioMuse](/technical-notes/audiomuse-ai-sonic-recommendations/) separately. That makes a failed match or mix easier to trace.

## Minimal Navidrome setup

**Prerequisites:** an installed Navidrome release, a tagged test album, a readable music directory and a writable data directory. This is a standalone example, not an export of my NAS deployment.

1. Download [navidrome.example.toml](/downloads/audio-stack/navidrome.example.toml), change the two paths, and save it as `navidrome.toml`.
2. Start the installed binary with `navidrome --configfile ./navidrome.toml`. The example listens only on the same machine at `http://127.0.0.1:4533`.
3. Create the initial account in the web interface and let the library scan complete.
4. Play the test album. Check its artist, track order and cover before adding plugins.

The [configuration reference](https://www.navidrome.org/docs/usage/configuration/options/) documents these settings and their environment-variable overrides. For a service, container or LAN deployment, use the [installation instructions](https://www.navidrome.org/docs/installation/) for that environment rather than assuming these example paths apply.

**Check it works:** a full track plays, the album has the expected track count, and the library remains available after restarting Navidrome with the same data directory. My own music lives on the NAS; the example does not move or copy it.

## From library to playback

Navidrome serves my library from the NAS. A well-tagged file is easier to find there and easier for the [ListenBrainz importer](/technical-notes/scrobbling-everything-to-listenbrainz/) to match. [AudioMuse](/technical-notes/audiomuse-ai-sonic-recommendations/) analyses the audio for sound-based mixes.

For offline listening, the [iPod setup guide](/technical-notes/ipod-video-5-5g-rockbox-purist-player/#library-and-playlist-sync) covers file and playlist copying. The 256 GB upgrade is intended to hold the whole library; curated playlists remain how I choose what to hear.

## Maintaining the library

The recurring work is checking recordings, correcting tags and keeping copies of files I want to retain. My [listening workflow](/technical-notes/ai-music-recommendations-from-listenbrainz/) explains how discoveries become additions and how ratings help me refine playlists.

## Sources

- [FLAC project](https://xiph.org/flac/)
- [Apple: ALAC open-sourced](https://macosforge.github.io/alac/)
- [XLD](https://tmkk.undo.jp/xld/index_e.html) and [Exact Audio Copy](https://www.exactaudiocopy.de/)
- [AccurateRip](http://www.accuraterip.com/)
- [MusicBrainz Picard documentation](https://picard-docs.musicbrainz.org/)
- [beets documentation](https://beets.readthedocs.io/)
- [ReplayGain specification (Hydrogenaudio)](https://wiki.hydrogenaud.io/index.php?title=ReplayGain)
- [Rockbox manual: album art appendix](https://git.lenord.me/len0rd/rockbox/src/branch/master/manual/appendix/album_art_info.tex)
- [Navidrome](https://www.navidrome.org/)
