---
title: "Beyond Spotify: Building a FLAC Library You Own"
date: "2026-10-26T11:00:00+05:45"
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
series: pocket-hi-fi
seriesOrder: 8
draft: false
comments: true
share: true
---

Leaving Spotify for an iPod raises one question first: where does the music come from? A streaming subscription gives you access, not files. To play lossless music on a dedicated player you need a library you own.

This post covers building one legally, then making it clean enough that a 2006 iPod running Rockbox handles it well.

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

Both Picard (with its ReplayGain plugin) and beets can write ReplayGain tags. On my iPod, Rockbox uses track gain in shuffle and leaves albums alone, with clipping prevention on. Part 7 lists the full settings.

## Album art for the iPod

Rockbox is picky about images:

- **Use baseline JPEG, not progressive.** The Rockbox manual says it does not support progressive or multi-scan JPEG files.
- **For FLAC, use a cover file in the album folder.** Rockbox reads embedded art only from JPEGs in ID3v2 (MP3) and MP4 tags. For FLAC it looks for files such as `cover.jpg` or `folder.jpg` beside the tracks.
- **Keep it small.** The screen is 320 × 240. A huge scan wastes space and decoding time. Rockbox's manual gives no official maximum; resizing to a few hundred pixels square is a common choice among iPod users.

Keep the full-size art in your master library and generate small baseline copies for the iPod.

## Hi-res and the iPod

The iPod's codec runs at 16-bit/44.1 kHz. Rockbox plays 24-bit/96 kHz and 192 kHz FLAC, but the PP5021C chip resamples it in software, which costs battery and can stutter at the highest rates. Dithering keeps the reduction to 16-bit clean. [Part 1](/technical-notes/what-you-can-actually-hear/) explains why you lose nothing audible: buy at CD quality, and keep hi-res only when it is a better master.

## From library to iPod

My library lives on a NAS and is served by [Navidrome](https://www.navidrome.org/), a self-hosted music server with a web player and Subsonic-compatible apps. Playlists are built there, from the whole library, and exported as `.m3u` files. The iPod playlist is one of them, a little over 850 tracks.

The iPod runs Rockbox only for music. Finder syncs nothing to it, so there is no Apple database to work around:

1. **Songs are copied as files.** The iPod's `Music/` folder mirrors the library's `Artist/Album` layout, so a song has the same path on the NAS and on the iPod. Copies are made in Apple disk mode.
2. **Playlists come from Music.app.** I curate playlists in Music.app, which references the files on the NAS in place. A script reads each playlist, copies any song the iPod is missing, and writes one `.m3u8` per playlist into `/Playlists`.
3. **FLAC is added from fixed lists.** Music.app cannot import FLAC, so FLAC entries are appended from the matching Navidrome playlist. A `FLAC.m3u8` lists only the FLACs my playlists use, not every album on the card.

On Rockbox I open playlists from the Playlists menu, and the playlist viewer shows songs by their title and album tags rather than file names. The largest playlist is about 900 tracks, well inside Rockbox's default limit of 10,000.

## What it costs

Owning a library costs money and time that streaming does not: buying albums, ripping, checking tags. In return you get files that cannot be removed from a catalogue, play anywhere, and sound the same in twenty years. For me, the playlist-rebuilding step was also the moment I found out which of my "favourites" I actually wanted to keep.

Part 9 closes the series: pairing IEMs with the 5.5G, and how it compares with a modern Sony Walkman.

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
