---
title: "I Replaced Spotify with a 2006 iPod"
date: "2026-10-26T10:50:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "How an iPod Video 5.5G with a flash and battery mod, Rockbox 4.0 and a short settings file became my main music player: why this model, which settings keep the signal clean, and how the whole setup lives in version control."
tags:
  - audio
  - ipod
  - rockbox
  - flac
  - spotify
series: pocket-hi-fi
seriesOrder: 6
draft: true
comments: true
share: true
---

My main music player is an iPod Video from 2006. It has no Wi-Fi, no recommendations and no app that wants my attention. It plays FLAC files from my own library, lasts for days, and does exactly what I ask.

This post explains why this particular iPod, what was changed inside it, and the settings that make it a purist player. Parts 2 to 5 of this series covered the vocabulary; this is where it meets a real device.

## Why the 5.5G

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

The reason people still hunt for this model is the **Wolfson** audio codec. Later iPod Classics moved to a different codec, and the 5G/5.5G Wolfson generation is the one listeners tend to describe as fuller and more natural. That reputation is subjective, and I would not claim one is measurably better; what matters to me is that the 5.5G drives ordinary IEMs well and has no hiss I can hear with mine. Part 8 covers IEM pairing in detail.

The 5.5G also added a brighter screen and gapless playback over the 5G.

## The mod: flash storage and a bigger battery

A 20-year-old hard drive is the weak point of any vintage iPod. Mine was replaced:

| Part | Stock | Fitted |
|---|---|---|
| Storage | 1.8 in hard drive | 64 GB SD card on a 40-pin ZIF flash adapter (dual SD slot) |
| Battery | About 600 mAh | 2000 mAh |

The flash adapter plugs into the same connector the hard drive used, so the iPod sees an ordinary disk. There are no moving parts left, it is silent, and it survives being dropped far better.

I have not timed the battery yet. Scaling the stock rating by capacity, and allowing for flash drawing less than a spinning disk, gives an estimate of roughly 40–55 hours of 16-bit FLAC with the screen off. Treat that as an estimate until I run a proper playback test.

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

## The purist settings

A purist player should not change the music. Every Rockbox option below is either off or there to protect the signal. This is the sound section of my settings file, exactly as it is on the iPod:

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

### The crossfeed trade-off

Crossfeed is the one setting here that is not strictly "purist", and I have it on.

Recordings are mixed for speakers. With speakers, each ear hears both speakers, slightly delayed and filtered by your head. With IEMs, the left channel goes only to the left ear. Hard-panned mixes, especially older stereo recordings with drums on one side and vocals on the other, can sound unnatural and tiring that way.

Crossfeed mixes a small, delayed, filtered amount of each channel into the other to imitate what speakers do. Rockbox offers a Meier mode, named after the crossfeed design by Jan Meier, and a custom mode.

The cost: crossfeed changes the signal, narrows the stereo image a little, and on modern mixes made with headphones in mind it can make things sound slightly closed in. A strict purist turns it off. I leave it on because much of what I listen to is older and hard-panned, and long sessions are less tiring with it. If you try it, A/B a well-recorded album with it on and off and keep whichever you forget about.

## A player for playback only

Rockbox can record, play games, run demos and show a file manager. I removed all of it. The main menu shows three things:

```ini
root menu order: wps, playlists, database
```

That is the Now Playing screen, Playlists and the database browser. Rockbox 4.0 always appends Settings, which keeps themes reachable. The game and demo plugins and their data are deleted from the iPod, except PictureFlow for browsing covers. The theme is a variant of Themify 2 in iPod blue and grey.

Two power settings matter with a big battery:

- **Idle power-off after 10 minutes**, and **backlight off after 10 seconds**. The screen is the biggest battery drain.
- **Battery capacity set to 2000 mAh**, so the battery meter is accurate for the new cell.

There is also an escape hatch: booting with the hold switch on resets every setting to its default. If an experiment goes wrong, I do not need a computer to recover.

## Settings as code

All of the above lives in a git repository, not only on the iPod. A short Python script, `sync_rockbox.py`, runs when the iPod is connected in disk mode:

1. It backs up the iPod's whole `.rockbox` folder to my NAS with a timestamp.
2. It merges the managed settings file into the iPod's config. Settings I have not listed keep whatever value was set on the device.
3. It copies the settings file onto the iPod as a `.cfg` that can be re-applied from the file browser.
4. It removes the pruned games and demos.
5. It installs the themes listed in a small table, checking each download's SHA-256.

Rockbox stores settings as plain `key: value` lines, which makes this easy. One trap: setting names change between Rockbox versions, and Rockbox silently ignores names it does not know. I check every name against the source code at the installed release tag before adding it.

The result is that if the iPod dies, a replacement takes one install and one script run to behave identically.

## The Spotify part

Spotify is excellent at what it does: endless catalogue, good recommendations, one tap. What I gave up by leaving it is discovery. What I got back:

- **Lossless audio** from files I own, which do not disappear when a licence changes.
- **Days of battery** instead of a phone that drains while streaming.
- **No interruptions.** No notifications, no autoplay deciding what comes next.
- **Listening history I keep.** Rockbox logs every play to a file, and a script submits those plays to ListenBrainz when I connect the iPod. How that works, and the server behind the library, is covered in the separate Homelab Music series.

Getting the music onto it legally and well tagged is its own project. That is the next post.

## Sources

- [Rockbox (Wikipedia)](https://en.wikipedia.org/wiki/Rockbox): release history, including 4.0 on 1 April 2025
- [LWN: Rockbox 4.0 released](https://lwn.net/Articles/1016207/)
- [Rockbox manual](https://www.rockbox.org/manual.shtml): sound settings, crossfeed, ReplayGain, dithering
- [iPodWiki: Rockbox](https://ipodwiki.com/wiki/Rockbox)
- [Head-Fi: Rockbox and crossfeed](https://www.head-fi.org/threads/rockbox-and-crossfeed.214882/)
- [Apple: iPod (5th generation) technical specifications](https://support.apple.com/kb/SP26)
