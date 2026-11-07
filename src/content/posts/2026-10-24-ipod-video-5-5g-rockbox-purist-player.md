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
last_modified_at: "2026-11-06T13:00:00+05:45"
---

An offline music player has one job: play the files you own, anywhere,
without a signal or a subscription. It has no Wi-Fi, no recommendations and
no app that wants your attention. Mine is an old iPod Video running Rockbox,
fed from the same library that powers [my music setup](/audio/my-music-after-spotify/).
Taking that music somewhere without an internet connection is half the
point of owning it. I am still testing its replacement battery,
so I cannot yet say how long it plays between charges.

Why an old iPod rather than a phone or a new player? It is inexpensive to
find, easy to fit with flash storage and a bigger battery, and Rockbox turns
it into a capable lossless player. Its Wolfson DAC also has a reputation for
a warm, relaxed sound. To my ears that suits everyday consumer earphones and
IEMs: they sound full rather than thin, and I do not need a high-end IEM to
enjoy a walk with it. Wired headphones work too; my Sony WH-1000XM4 plugs into
the headphone jack, with noise cancellation when powered on (the iPod has no
Bluetooth).

Sound is personal, so treat that as a preference, not a measurement. If you
have expensive IEMs and want the most neutral, detailed source with more
power, a modern hi-fi digital audio player is the better match.
[DACs, Music Players and Output Impedance](/technical-notes/dac-dongles-daps-and-output-impedance/)
and [iPod or Sony Walkman](/technical-notes/pairing-iems-ipod-vs-sony-walkman/)
cover that choice.

This post covers which iPod to look for, what to change inside it, and the settings I use. If terms like output impedance or sound signature are new, the [headphones and digital audio notes](/series/pocket-hi-fi/) explain them.

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

The reason people still hunt for this model is the **Wolfson** audio codec. Later iPod Classics moved to a different codec, and the 5G/5.5G Wolfson generation is the one listeners tend to describe as fuller and more natural. That reputation is subjective, and I would not claim one is measurably better; what matters to me is that the 5.5G drives ordinary IEMs well and has no hiss I can hear with mine. [iPod or Sony Walkman](/technical-notes/pairing-iems-ipod-vs-sony-walkman/) covers IEM pairing in detail.

The 5.5G also added a brighter screen and gapless playback over the 5G.

## The mod: flash storage and a bigger battery

A 20-year-old hard drive is the weak point of any vintage iPod. Mine was replaced:

| Part | Stock | Fitted |
|---|---|---|
| Storage | 1.8 in hard drive | 64 GB SD card on a 40-pin ZIF flash adapter; 256 GB upgrade in progress |
| Battery | About 600 mAh | Labelled 2000 mAh; performance still under test |

The flash adapter plugs into the same connector the hard drive used, so the iPod sees an ordinary disk. There are no moving parts left, it is silent, and it survives being dropped far better.

I am still testing the replacement battery. In my latest test, it seemed to perform more like a 1000 mAh cell than a 2000 mAh one, so I do not yet have a reliable playback-runtime figure. If further tests confirm the shortfall, I will replace it; I am also considering importing a 2800 mAh cell from the US. Its stated capacity will need to prove itself in use too.

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

### The crossfeed trade-off

I leave crossfeed on by preference.

Recordings are mixed for speakers. With speakers, each ear hears both speakers, slightly delayed and filtered by your head. With IEMs, the left channel goes only to the left ear. Hard-panned mixes, especially older stereo recordings with drums on one side and vocals on the other, can sound unnatural and tiring that way.

Crossfeed mixes a small, delayed, filtered amount of each channel into the other to imitate what speakers do. Rockbox offers a Meier mode, named after the crossfeed design by Jan Meier, and a custom mode.

The cost: crossfeed changes the signal, narrows the stereo image a little, and on modern mixes made with headphones in mind it can make things sound slightly closed in. I leave it on because much of what I listen to is older and hard-panned, and long sessions are less tiring with it. If you try it, A/B a well-recorded album with it on and off and keep whichever you forget about.

## A player for playback only

Rockbox can record, play games, run demos and show a file manager. I removed all of it. The main menu shows three things:

```ini
root menu order: wps, playlists, database
```

That is the Now Playing screen, Playlists and the database browser. Rockbox 4.0 always appends Settings, which keeps themes reachable. The game and demo plugins and their data are deleted from the iPod, except PictureFlow for browsing covers. The theme, which I call gutheme, is Themify 2's layout in the colours of the classic iPod: white background, black text, a blue gradient on the selected row, and a glossy blue progress bar. Now Playing also shows a small badge such as `FLAC 44.1 kHz`; Rockbox's skin language can show the format and sample rate, but not the bit depth.

Two power settings matter with a big battery:

- **Idle power-off after 10 minutes**, and **backlight off after 10 seconds**. The screen is the biggest battery drain.
- **Battery capacity set to 2000 mAh** to match the cell's label. The pack's actual performance is still under test.

There is also an escape hatch: booting with the hold switch on resets every setting to its default. If an experiment goes wrong, I do not need a computer to recover.

## Settings as code

All of the above lives in a git repository, not only on the iPod. A short Python script, `sync_rockbox.py`, runs when the iPod is connected in disk mode:

1. It backs up the iPod's whole `.rockbox` folder to my NAS with a timestamp.
2. It merges the managed settings file into the iPod's config. Settings I have not listed keep whatever value was set on the device.
3. It copies the settings file onto the iPod as a `.cfg` that can be re-applied from the file browser.
4. It removes the pruned games and demos.
5. It installs the themes listed in a small table, checking each download's SHA-256.

Rockbox stores settings as plain `key: value` lines, which makes this easy. One trap: setting names change between Rockbox versions, and Rockbox silently ignores names it does not know. I check every name against the source code at the installed release tag before adding it.

The saved settings and theme files give me a starting point for rebuilding the device; replacement hardware still needs testing.

## Check the device before a full sync

**Prerequisites:** a compatible Rockbox installation, a backup of the player, and a mounted iPod in disk mode. The [Rockbox installation manual](https://www.rockbox.org/manual.shtml) owns the bootloader procedure; the snippets here do not install firmware.

1. Copy one album and a small playlist using your chosen file-sync method.
2. Eject the device, open the playlist in Rockbox and play a track. Check title, album and artwork.
3. Enable play logging with [rockbox-playlog.example.cfg](/downloads/audio-stack/rockbox-playlog.example.cfg), loading it through Rockbox's configuration-file browser.
4. After listening, reconnect and confirm `/.rockbox/playback.log` exists before attempting an import.

My local scripts are separate tools: `sync_rockbox.py` manages settings and themes; `scrobble_listenbrainz.py` imports the saved plays. These are local project scripts, not commands installed by Rockbox. Both accept `--dry-run`. For example, from my homelab checkout, with the actual mount substituted:

```sh
ipod/sync_rockbox.py /Volumes/ipod --dry-run
ipod/scrobble_listenbrainz.py /Volumes/ipod --tz Asia/Kathmandu --dry-run
```

**Check it works:** inspect the proposed changes and converted timestamps before running the connected sync workflow. The [import guide](/technical-notes/scrobbling-everything-to-listenbrainz/) explains credentials, accepted submissions and log archiving. Logging alone does not upload anything.

## Library and playlist sync

The files come from my [tagged music library](/technical-notes/beyond-spotify-building-a-flac-library/). My sync scripts copy music and write playlists for Rockbox. The earlier setup used selected files; the pending 256 GB upgrade is intended to hold the whole library.

My playlists include Bollywood Top, Nepali, Hindi Indie and Forever Classics. I choose one offline and let it play. One-star ratings help me review songs I don't want in those lists later; this is not an automatic recommendation-training loop.

When I connect the iPod and sync, the scripts also import its recorded plays into ListenBrainz. I have used this workflow. The [play-log import guide](/technical-notes/scrobbling-everything-to-listenbrainz/#the-ipod-sync-path) explains timestamps and submission handling.

For the rest of the listening routine, see [how I use the stack](/technical-notes/ai-music-recommendations-from-listenbrainz/).

## Sources

- [Rockbox (Wikipedia)](https://en.wikipedia.org/wiki/Rockbox): release history, including 4.0 on 1 April 2025
- [LWN: Rockbox 4.0 released](https://lwn.net/Articles/1016207/)
- [Rockbox manual](https://www.rockbox.org/manual.shtml): sound settings, crossfeed, ReplayGain, dithering
- [iPodWiki: Rockbox](https://ipodwiki.com/wiki/Rockbox)
- [Head-Fi: Rockbox and crossfeed](https://www.head-fi.org/threads/rockbox-and-crossfeed.214882/)
- [Apple: iPod (5th generation) technical specifications](https://support.apple.com/kb/SP26)
