---
title: "The iPod as an Offline Music Player: Rockbox, Flash Storage and Playlist Sync"
date: "2026-10-24T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Turning an old iPod Video into an offline music player: which model to look for, a flash and battery mod, Rockbox settings that keep the signal clean, and playlist sync from your own library. Plus when a modern hi-fi player is the better choice."
tags:
  - audio
  - ipod
  - rockbox
  - flac
series: "homelab-music"
seriesOrder: 3
cover: "/images/blog/audio/ipod-video-5-5g-rockbox-purist-player.webp"
thumb: "/images/blog/audio/ipod-video-5-5g-rockbox-purist-player.webp"
use_featured_image: true
draft: false
comments: true
share: true
last_modified_at: "2026-11-16T18:00:00+05:45"
---

An offline music player has one job: play the files you own, anywhere, without a signal or a subscription. Mine is an old iPod Video running Rockbox, fed from the same library that powers [my music setup](/audio/my-music-after-spotify/).

Why an old iPod? It is cheap to find, easy to fit with flash storage and a bigger battery, and Rockbox turns it into a capable lossless player. I listen with the [7Hz x Crinacle Zero 2](/technical-notes/pairing-iems-ipod-vs-sony-walkman/), a single-driver IEM that suits its output. Its tuning is clean rather than bass-heavy, which lets vocals and instruments come through clearly. If you want the most neutral, powerful source for expensive IEMs, a modern player is the better match; [DACs, Music Players and Output Impedance](/technical-notes/dac-dongles-daps-and-output-impedance/) covers that choice.

## Which iPod: the 5.5G

Apple sold the fifth-generation iPod, the "iPod Video", from 2005. The **5.5G** ("Enhanced") revision came out on 12 September 2006 and was discontinued a year later. Mine is model A1136 with the thin back.

| Component | Specification |
|---|---|
| SoC | PortalPlayer PP5021C, two ARM7TDMI cores at 80 MHz |
| RAM | 32 MB (64 MB on the 80 GB model) |
| Audio codec | Wolfson WM8758 |
| Display | 2.5 in colour LCD, 320 × 240 |
| Stock storage | 1.8 in hard drive |
| Stock battery | About 600 mAh, rated about 14 h of audio |
| Outputs | 3.5 mm headphone jack, 30-pin dock connector |

The reason people still hunt for this model is the **Wolfson** codec, and the 5.5G added a brighter screen and gapless playback over the 5G.

## The mod: flash storage and a bigger battery

A 20-year-old hard drive is the weak point of any vintage iPod. Mine was replaced:

| Part | Stock | Fitted |
|---|---|---|
| Storage | 1.8 in hard drive | 256 GB microSD card on a dual-card 40-pin ZIF adapter |
| Battery | About 600 mAh | Labelled 2000 mAh |

The flash adapter plugs into the same connector the hard drive used, so the iPod sees an ordinary disk. There are no moving parts left, it is silent, and it survives being dropped far better.

The new battery gives about 28 hours of continuous playback, against roughly 4 hours from the worn original.

Two warnings from living with it:

- **Copy music to the iPod in Apple disk mode, not Rockbox USB mode.** Rockbox's USB handling is slow on this hardware and can corrupt the file system on long transfers. Reboot with Menu + Select, then hold Select + Play at the Apple logo.
- **Bulk reads from the iPod to a Mac can stall.** Copying the whole card back off the iPod through its dock connector stalls on macOS. If you ever need a full copy, take the card out and use a fast card reader.

## Why Rockbox

Apple's firmware still works, and I kept version 1.3 installed alongside Rockbox so that disk mode works. But for listening, Rockbox wins:

- **It plays FLAC.** Apple's firmware does not. It plays ALAC, AAC and MP3; FLAC needs Rockbox.
- **It does not choke on large libraries.** With 32 MB of RAM, Apple's firmware becomes slow and unstable somewhere above roughly 20,000 songs, and is unreliable on storage above about 128 GB. Rockbox is far less sensitive to both.
- **It reads plain folders.** No iTunes database is required. Copy files, browse them.
- **It exposes the audio path.** Equaliser, crossfeed, ReplayGain and dithering are all settings you can see and switch off.

I run **Rockbox 4.0**, released on 1 April 2025 as the project's first release since 2019. Installing it means adding the Rockbox bootloader and the matching release build to the iPod; the release zip is kept with my backups so the exact build can be reinstalled. Rockbox needs a FAT32 iPod, and this one already was.

<figure>
<img src="/images/blog/audio/pocket-hi-fi/ipod-playback-path.svg" alt="A 24-bit, 96 kHz FLAC file is resampled by Rockbox to 44.1 kHz, then passes through the iPod's 16-bit Wolfson codec to its 3.5 mm output." loading="lazy" width="960" height="310" />
<figcaption>Rockbox can play hi-res FLAC, but this iPod sends audio to its headphone jack at 44.1 kHz.</figcaption>
</figure>

## My playback settings

These are my listening preferences. Crossfeed, crossfade and ReplayGain deliberately change playback; they are not a claim of an untouched signal. This is the sound section of my settings file, exactly as it is on the iPod:

```ini
eq enabled: off
crossfeed: meier
crossfade: shuffle
dithering enabled: on
replaygain type: track shuffle
replaygain noclip: on
pause on headphone unplug: pause
```

What each one does:

| Setting | Value | Why |
|---|---|---|
| Equaliser | Off | The IEM's tuning is the tuning. If I want a different signature, I change IEMs. |
| Crossfeed | Meier | Bleeds a little of each channel into the other. Discussed below. |
| Crossfade | Shuffle only | Albums play gapless; only shuffled tracks blend into each other. |
| Dithering | On | When a 24-bit file is reduced to the 16-bit codec, dither turns truncation distortion into low-level noise. It does nothing to 16-bit files. |
| ReplayGain | Track gain in shuffle | Shuffled tracks come out at a similar loudness; album playback keeps the album's own dynamics. |
| ReplayGain no-clip | On | Prevents ReplayGain from boosting a track past clipping. |
| Headphone unplug | Pause | Pulling the cable stops the music instead of losing my place. |

### Crossfeed

Recordings are mixed for speakers; with IEMs, each channel reaches only one ear, and hard-panned older mixes can sound tiring. Crossfeed blends a little of each channel into the other. It narrows the image slightly, but I leave it on because much of what I play is older and hard-panned.

## A player for playback only

Rockbox can record, play games, run demos and show a file manager. I removed all of it. The main menu shows three things:

```ini
root menu order: wps, playlists, database
```

That is the Now Playing screen, Playlists and the database browser. Rockbox 4.0 always appends Settings, which keeps themes reachable. The game and demo plugins and their data are deleted from the iPod, except PictureFlow for browsing covers. The theme, which I call gutheme, is Themify 2's layout in the colours of the classic iPod: white background, black text, a blue gradient on the selected row, and a glossy blue progress bar. Now Playing also shows a small badge such as `FLAC 44.1 kHz`; Rockbox's skin language can show the format and sample rate, but not the bit depth.

Two power settings matter with a big battery:

- **Idle power-off after 10 minutes**, and **backlight off after 10 seconds**. The screen is the biggest battery drain.
- **Battery capacity set to 2000 mAh** to match the cell's label.

There is also an escape hatch: booting with the hold switch on resets every setting to its default. If an experiment goes wrong, I do not need a computer to recover.

## Settings as code

All of this lives in git. When the iPod is connected in disk mode, `sync_rockbox.py` backs up `.rockbox` to my NAS, merges the managed settings, removes the pruned plugins and installs checksummed themes. One trap: Rockbox silently ignores setting names it does not know, and names change between versions, so I check each one against the source at the installed release tag.

## Library and playlist sync

The files come from my [tagged music library](/technical-notes/beyond-spotify-building-a-flac-library/), and the sync scripts copy music and write Rockbox playlists. On each sync, a second script imports the iPod's play log into ListenBrainz; the [play-log import guide](/technical-notes/scrobbling-everything-to-listenbrainz/#the-ipod-sync-path) covers timestamps and submission.

## Sources

- [Rockbox (Wikipedia)](https://en.wikipedia.org/wiki/Rockbox): release history, including 4.0 on 1 April 2025
- [LWN: Rockbox 4.0 released](https://lwn.net/Articles/1016207/)
- [Rockbox manual](https://www.rockbox.org/manual.shtml): sound settings, crossfeed, ReplayGain, dithering
- [iPodWiki: Rockbox](https://ipodwiki.com/wiki/Rockbox)
- [Head-Fi: Rockbox and crossfeed](https://www.head-fi.org/threads/rockbox-and-crossfeed.214882/)
- [Apple: iPod (5th generation) technical specifications](https://support.apple.com/kb/SP26)
