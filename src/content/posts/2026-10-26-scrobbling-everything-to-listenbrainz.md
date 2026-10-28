---
title: "Scrobbling Everything to ListenBrainz: Navidrome, an iPod Running Rockbox, and Beyond"
date: "2026-10-26T12:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "A recommender is only as good as the history behind it. This is how every play in my homelab, from Navidrome on the server to an offline iPod running Rockbox, ends up as a clean ListenBrainz listen, and how that history comes back as playlists."
tags:
  - listenbrainz
  - scrobbling
  - navidrome
  - rockbox
  - ipod
  - music
  - homelab
cover: "/images/blog/audio/scrobbling-everything-to-listenbrainz.webp"
thumb: "/images/blog/audio/scrobbling-everything-to-listenbrainz.webp"
use_featured_image: true
comments: true
share: true
draft: false
series: homelab-music
seriesOrder: 3
---

The [field guide](/technical-notes/homelab-music-recommendations-field-guide/)
that opened this series argued that personal behaviour is one of the strongest
recommendation signals a homelab can have. The
[second part](/technical-notes/youtube-to-scrobble/) looked at why YouTube makes
that signal hard to capture. This part is the practical one: how every play I
care about ends up as a listen in [ListenBrainz](https://listenbrainz.org/),
including plays from a device that has no network connection at all.

There are two players in my daily rotation:

- **Navidrome** on the homelab server, which I reach from phones, laptops and
  the TV;
- **an iPod Video running Rockbox**, which is offline by design and only meets
  a computer when I plug it in to sync.

The first one is easy. The second one is the reason this post exists.

## Why ListenBrainz is the sink

ListenBrainz is the open, MusicBrainz-backed listening history service. It
accepts listens over a simple JSON API, lets you export everything, and
generates its own recommendations and playlists from what you send it. Because
it keys listens to MusicBrainz recording IDs when it has them, a history built
from well-tagged files is unusually precise: it records *which recording* you
played, not just a string that looks like an artist and a title.

That precision matters for the rest of this series. Every downstream
consumer, whether a daily playlist, a sonic-similarity model or an AI asked to
pick tonight's music, is reading this history. Garbage here is garbage
everywhere.

## Navidrome: already done

Navidrome ships a ListenBrainz agent. It is enabled by default
(`ListenBrainz.Enabled`), and scrobbling needs only per-user authorization:
each user links their own ListenBrainz token in their Navidrome profile. After
that, every play from any Subsonic client that talks to Navidrome is
submitted by the server, so the client app does not need to know ListenBrainz
exists.

There is nothing homelab-specific to say beyond that, which is exactly how it
should be. The interesting work is on the device that cannot phone home.

## The iPod problem

The iPod runs Rockbox 4.0. I keep its main menu deliberately small, playback
only, so the device behaves like a music player rather than a file manager.
That decision has a consequence for scrobbling.

Rockbox has two relevant pieces:

1. A **play log**. With `play log: on`, Rockbox appends one line per play to
   `/.rockbox/playback.log`, in the form
   `timestamp:elapsed_ms:length_ms:path`.
2. A **Last.fm Scrobbler plugin**, which is a one-shot converter: you run it
   from the Plugins menu and it turns the play log into a `.scrobbler.log` that
   desktop tools can upload.

The plugin is the documented route, but it lives in the Plugins menu, and the
Plugins menu is exactly what I hid. Bringing it back to press one button after
every listening session would undo the point of the clean menu. So the
settings file only turns logging on:

```ini
# Scrobbling: log every play to /.rockbox/playback.log. Plugins stay hidden;
# ipod/scrobble_listenbrainz.py converts and submits the log from the Mac.
play log: on
```

The conversion moves to the Mac, where I am already plugging the iPod in to
sync music. A single script reads the raw log, decides what counts as a listen,
enriches it from the files themselves, and submits straight to ListenBrainz.
There is no intermediate `.scrobbler.log` and no third-party uploader.

## What counts as a listen

A raw play log records every time a track started, including the ones I
skipped after three seconds. Submitting all of that would make the history
noisy and the recommendations worse.

The rule I use is the long-standing Last.fm one, which most scrobblers follow:
a track must be longer than 30 seconds, and it must have been played for at
least half its duration or for four minutes, whichever comes first. A
twelve-minute track counts after four minutes; a three-minute track counts
after ninety seconds.

There is one Rockbox-specific wrinkle. When playback resumes after the iPod
was switched off or the battery ran down, the log can record the same file
again. A replay of the same file within that file's own length is treated as
a resume and dropped. Two genuine back-to-back plays of a song are still kept,
because the second starts after the first could have finished.

Both rules fit in one small function:

```python
def listened(plays):
    out, last = [], {}
    for ts, elapsed, length, path in plays:
        if length < 30_000 or elapsed < min(length // 2, 240_000):
            continue
        prev = last.get(path)
        if prev is not None and ts < prev + length // 1000:
            continue
        last[path] = ts
        out.append((ts, elapsed, length, path))
    return out
```

## Rockbox time has no time zone

This is the bug that would have quietly corrupted the history if I had not
looked for it.

Rockbox keeps the iPod's clock as plain wall-clock time with no zone
attached, and writes it to the log as if it were UTC. My iPod is set to Nepal
time, so a song played at 9 p.m. in Kathmandu would be logged as 9 p.m. UTC,
five hours and forty-five minutes in the future. ListenBrainz expects
`listened_at` as a real Unix timestamp, so submitting the raw value would
shift every listen.

The fix is to read the logged value back as a naive wall-clock time and
re-attach the zone the iPod is actually set to, `Asia/Kathmandu` by default:

```python
def to_utc(ts, tz):
    wall = datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).replace(tzinfo=None)
    return int(wall.replace(tzinfo=zoneinfo.ZoneInfo(tz)).timestamp())
```

There is a second shift. Rockbox writes each entry when the track stops, not
when it starts, while ListenBrainz wants the start. The script subtracts the
time played from the converted value.

The script also refuses to submit anything timestamped before the iPod Video
existed. A play dated in 1970 or 2005 means the clock was never set, usually
after a full battery drain, and the right response is to stop and ask for the
clock to be fixed rather than flood the history with listens from decades ago.

## Reading identity from the files

The play log gives only a path. Everything else comes from the file on the
iPod, read with [mutagen](https://mutagen.readthedocs.io/): artist (falling
back to album artist), album, title, track number, and the MusicBrainz
recording ID if the file has one.

That last field is where the earlier work in the library pays off. Files that
went through MusicBrainz-aware tagging carry `musicbrainz_trackid`, and the
script passes it to ListenBrainz as `recording_mbid` in `additional_info`.
ListenBrainz then does not need to guess which recording a string refers to.
Files without an artist or title are skipped and counted, so a tagging gap
shows up in the summary rather than as an "Unknown Artist" listen.

Each listen also carries `media_player: Rockbox`, a `submission_client`
name and `duration_ms`, so the history records where a play came from. The
ListenBrainz docs ask for these names without version numbers, which is what
the script sends.

## Submitting

ListenBrainz has three listen types. `playing_now` is a transient "currently
playing" signal, `single` is one just-finished track, and `import` is for
previously saved listens and may carry many at once. A week of iPod listening
is the textbook case for `import`.

The run is deliberately boring:

1. Read the user token from the macOS Keychain, so it never sits in a file or
   shell history.
2. Call `GET /1/validate-token` and stop if the token is not valid.
3. `POST /1/submit-listens` with `listen_type: import`, in batches of 100.
   The API accepts up to 1,000 per request; smaller batches keep each request
   small and a failure cheap to reason about.
4. Copy the play log into a dated archive on the NAS, then delete it from the
   iPod so the next run starts clean.

Ordering is the safety property. The log is removed only after every batch
was accepted; an HTTP error stops the script with the log still on the iPod,
and the next run picks it up. The archive means the raw history is never lost
even if I later change the listen rule and want to replay it.

A dry run prints what would be submitted without touching the network:

```sh
ipod/scrobble_listenbrainz.py /Volumes/IPOD --dry-run
# 214 plays, 131 listens, 129 to submit (117 with MBID), 2 skipped for missing tags
```

The numbers above are illustrative of the shape of the summary, not a
particular run.

The script is a single-file `uv` script with `mutagen` as its only
dependency, and it has unit tests for the parts that are easy to get wrong:
malformed log lines, the half-or-four-minutes rule and resume dropping, the
wall-clock conversion, and the MBID and track number in the payload.

## Closing the loop: history back into playlists

Sending listens out is half the system. The other half is getting something
back.

Navidrome supports plugins, and the
[ListenBrainz Daily Playlist Importer](https://github.com/kgarner7/navidrome-listenbrainz-daily-playlist)
pulls the playlists ListenBrainz generates from my history (Daily Jams,
Weekly Jams, Weekly Exploration) and creates them as Navidrome playlists
matched against my own library. The plugin is pinned to a reviewed release
and installed through an Ansible playbook with an explicit confirmation gate;
its network access is restricted to the ListenBrainz API.

Generated playlists accumulate, so a small cleanup tool removes old ones. It
is conservative on purpose: it reads my recent ListenBrainz listens and reports
how many tracks in each candidate playlist I have actually played, matching on
recording MBIDs first. ListenBrainz records that I heard a track, not which
playlist I heard it from, so that overlap is a hint for review, not proof.

The result is a loop. Navidrome and the iPod both feed ListenBrainz;
ListenBrainz turns that history into playlists; the playlists land back in
Navidrome and, from there, on the iPod at the next sync.

## Beyond these two players

The same pattern covers any source:

- If the player can talk to ListenBrainz directly, let it.
- If it cannot, find where it keeps a local log, convert that log on a machine
  that can, and submit it as an `import`.
- Apply one listen rule everywhere, so a skip on the iPod and a skip in
  Navidrome mean the same thing.
- Prefer MusicBrainz recording IDs over strings whenever the file has them.

YouTube remains the awkward case, for the reasons covered in
[part 2](/technical-notes/youtube-to-scrobble/).

## What comes next

With a clean listening history in place, the next two parts use it.
**Part 4** covers AudioMuse-AI, which analyses the audio itself and finds
tracks that *sound* related regardless of who has listened to them.
**Part 5** puts the pieces together and uses AI to build recommendations from
my own history, library and sonic analysis.

If you are more interested in the iPod as a listening device, what Rockbox
does for its sound, the FLAC library behind it and the IEMs it drives, the
[Pocket Hi-Fi series](/series/pocket-hi-fi/) covers the audio side.

## Sources

- [ListenBrainz: JSON documentation (listen types, `additional_info`)](https://listenbrainz.readthedocs.io/en/latest/users/json.html)
- [ListenBrainz: Core API (`submit-listens`, `validate-token`)](https://listenbrainz.readthedocs.io/en/latest/users/api/core.html)
- [Last.fm API: Scrobbling (when a track should be scrobbled)](https://www.last.fm/api/scrobbling)
- [Navidrome: External services (ListenBrainz agent)](https://www.navidrome.org/docs/usage/integration/external-services/)
- [ListenBrainz Daily Playlist Importer for Navidrome](https://github.com/kgarner7/navidrome-listenbrainz-daily-playlist)
