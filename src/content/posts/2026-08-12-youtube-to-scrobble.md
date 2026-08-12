---
title: "From YouTube to a Scrobble: The Case for Track-Aware Listening"
date: "2026-08-12T14:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "YouTube is a major source of music listening, but ordinary scrobblers treat an album upload or DJ mix as one video. This article maps the ecosystem, explains the splitting problem, and outlines what an ideal open-source solution could look like."
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
---

Most music history systems assume that one playable item equals one song. That
assumption works when listening happens in Spotify, Navidrome, Apple Music, or a
local player: the player already knows the recording, artist, album, and track
duration.

YouTube breaks that assumption. A listener may play:

- an official music video containing one song;
- an entire album uploaded as one video;
- a compilation with ten or thirty tracks;
- a DJ set with continuous transitions;
- a concert recording with several songs;
- a radio programme with music, speech, and adverts;
- a “mix” whose description contains the only available tracklist.

To YouTube, each of these is one video. To a music history system, they may
represent dozens of separate recordings.

That creates a gap between **where the listening happens** and **what the
listener wants recorded**. The ideal solution is not simply another scrobbler.
It is a track-aware listening layer that can observe a video, identify its
segments, preserve uncertainty, and submit only trustworthy individual listens.

## The short version

The ecosystem already contains most of the required building blocks:

| Layer | Useful project or service | Responsibility |
| --- | --- | --- |
| Browser playback capture | [Web Scrobbler](https://github.com/web-scrobbler/web-scrobbler) | Observe web playback and submit listening history |
| YouTube metadata | [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Read titles, descriptions, chapters, and media metadata |
| Long-recording workflow | [MixSplitR](https://github.com/chefkjd/MixSplitR) | Split, identify, review, and tag long recordings |
| Audio fingerprinting | [Panako](https://github.com/JorenSix/Panako), [audfprint](https://github.com/dpwe/audfprint) | Match audio fragments to a reference collection |
| File identity | [Chromaprint](https://github.com/acoustid/chromaprint) and [AcoustID](https://acoustid.org/) | Identify near-identical recordings |
| Canonical metadata | [MusicBrainz](https://musicbrainz.org/) | Resolve recordings, releases, artists, and relationships |
| Listening history | [ListenBrainz](https://listenbrainz.org/) | Store individual listens and power recommendations |

No single project currently provides the complete flow for arbitrary YouTube
music videos. The most practical architecture is therefore a small local
companion service that works alongside a browser scrobbler.

```text
YouTube playback
    → chapters, description, title, and playback position
    → boundary detection
    → audio fingerprinting and metadata resolution
    → confidence and review
    → individual ListenBrainz listens
```

The important word is **individual**. A two-hour album upload should become a
sequence of recording listens, not one listen called “Full Album Mix”.

## What scrobbling normally assumes

A scrobbler usually receives an event shaped roughly like this:

```text
artist:      Some Artist
title:       Some Song
album:       Some Album
duration:    242 seconds
started_at:  2026-08-12T14:00:00+05:45
```

It can then apply a listening threshold. ListenBrainz documents the rule as at
least half the track or four minutes, whichever is shorter, before submitting a
listen. The player already knows when the track started and whether it is still
playing.

In a YouTube album upload, the browser instead sees:

```text
title:       Artist - Full Album
duration:    3,842 seconds
started_at:  2026-08-12T14:00:00+05:45
```

The player has no native event saying “track two began at 04:12”. That boundary
may exist in the description, in YouTube chapters, in a pinned comment, or only
in the audio itself.

The scrobbler is not necessarily broken. It is receiving an object that is too
coarse for the listener’s intended history.

## The existing ecosystem

### Web Scrobbler: the browser-side foundation

[Web Scrobbler](https://github.com/web-scrobbler/web-scrobbler) is an open-source
browser extension that scrobbles playback from websites to services including
Last.fm, Libre.fm, ListenBrainz, Maloja, and Pleroma. Its repository is MIT
licensed and includes connectors for multiple browsers and websites.

It is the natural starting point for browser integration because it already
solves several uninteresting but important problems:

- detecting playback changes in a single-page web application;
- tracking play, pause, seek, and navigation events;
- presenting a browser status and correction surface;
- authenticating with listening services;
- submitting now-playing and completed-listen events.

The limitation is the unit of observation. The YouTube connector generally sees
the video as the playable item. Improving that connector may help with chapters
and known tracklists, but robust audio splitting is a larger responsibility than
most browser connectors should own.

The best approach is to preserve Web Scrobbler’s submission model and add a
small local adapter, rather than immediately maintaining a large permanent
fork.

### ListenBrainz: the destination and identity contract

[ListenBrainz](https://listenbrainz.org/) is more than a place to display recent
listens. Its data feeds statistics, personal recommendations, and collaborative
discovery. A wrong YouTube scrobble therefore has a long tail: one incorrect
video-level listen can influence future recommendations as if it were a real
recording.

ListenBrainz accepts rich listen metadata, including artist, title, origin URL,
and MusicBrainz identifiers. The best submission is therefore not merely:

```text
title = "Full Album YouTube Upload"
```

It is:

```text
artist          = the resolved artist credit
title           = the resolved recording title
recording_mbid  = the canonical MusicBrainz recording
origin_url      = the YouTube video
source          = YouTube track-aware scrobbler
started_at      = the timestamp at which this segment began
```

ListenBrainz also provides an important safety boundary: do not submit a track
until the listener has consumed enough of it to count as a listen. The companion
service should apply that rule per identified segment, not once for the entire
video.

### yt-dlp: metadata before recognition

[yt-dlp](https://github.com/yt-dlp/yt-dlp) is a feature-rich open-source command
line tool and library for extracting media and metadata from YouTube and many
other websites. For this problem, its first value is not downloading audio. It
is exposing the page’s structure:

- video ID and canonical URL;
- title, uploader, and duration;
- description and timestamped tracklists;
- chapters when present;
- available formats and media metadata.

This gives us a deterministic first pass. Before running any expensive audio
recognition, the system should ask whether the creator already supplied enough
information to identify the tracks.

### MixSplitR: the closest workflow precedent

[MixSplitR](https://github.com/chefkjd/MixSplitR) is a desktop application for
turning long recordings, mixes, rips, and live sets into separate tagged tracks
or timestamped tracklists. Its documented workflow includes splitting,
identification, review, editing, and export. It supports MusicBrainz and AcoustID
as a free identification path, with optional additional services.

It is useful as a reference because it treats review as part of the product. A
track identifier can suggest an answer, but the user needs a way to correct a
boundary, select a different version, or reject a result before anything enters
the library or listening history.

MixSplitR is closer to the batch-processing side of the problem. Web Scrobbler
is closer to the live browser side. A future tool can borrow from both without
forcing either project to become something it was not designed to be.

### Fingerprinting: finding a recording inside a long video

Audio fingerprinting creates a compact representation of a recording and uses it
to match an audio fragment against a reference index.

[Chromaprint](https://github.com/acoustid/chromaprint) and the AcoustID service
are designed primarily for identifying near-identical audio. That makes them
useful for answering “which recording is this file?” and for recovering identity
from poor tags. They are not, by themselves, a complete long-mix segmentation
system.

[Panako](https://github.com/JorenSix/Panako) provides acoustic fingerprinting,
including a monitoring mode that queries overlapping fragments of an audio
stream. [audfprint](https://github.com/dpwe/audfprint) is another open-source
landmark-based fingerprinting project.

The core technique is to query overlapping windows instead of trying to identify
the entire video at once:

```text
video time     fingerprint result
00:00–00:30    Track A
00:20–00:50    Track A
00:40–01:10    Track A
01:00–01:30    Track B
01:20–01:50    Track B
```

The system can then infer that Track A ended around 01:08 and Track B began
there. Overlap matters because the first and last seconds of a song may contain
silence, speech, applause, or a crossfade that makes one window fail.

## Why splitting is harder than it sounds

### Chapters are not always songs

YouTube chapters may represent:

- songs;
- album sides;
- movements;
- introductions;
- sponsor segments;
- commentary;
- visual sections unrelated to music.

A chapter title is evidence of a boundary, not proof of a MusicBrainz recording.

### Descriptions are useful but inconsistent

Creators use many timestamp formats:

```text
00:00 Artist - Track
4:12 Artist – Track
08:47 Track title (feat. Someone)
1:02:11 Bonus track
```

The parser must handle hours, different separators, bracketed versions,
decorative emoji, and incomplete artist names. It should retain the original
line and produce a normalized candidate rather than destroying information.

### One video may contain several versions of a song

A live concert, remix compilation, and album upload may contain:

- studio recordings;
- live performances;
- radio edits;
- remixes;
- covers;
- medleys;
- instrumental versions;
- clean or explicit versions.

Matching only artist and title is not enough. The resolver needs recording-level
identity and should preserve alternate candidates when the version is unclear.

### Continuous mixes do not have clean boundaries

DJ sets may overlap tracks, change tempo, use effects, and introduce tracks before
the previous one has ended. A strict silence detector will fail. A fingerprint
monitor can identify both tracks during the overlap, but the boundary becomes an
interval rather than a single obvious point.

That is acceptable. The system can store:

```text
Track A: 00:00–01:08, boundary confidence 0.82
Track B: 01:04–02:42, boundary confidence 0.67
```

The result can be useful for a review queue without pretending to know the exact
mixdown boundary.

### Some recordings cannot be identified

No open-source approach can identify music that is absent from its reference
corpus with certainty. This includes unreleased tracks, obscure edits, local
performances, and heavily transformed material.

The correct answer is “unmatched” or “unavailable”, not a plausible but wrong
artist/title pair.

## The ideal solution

The ideal solution is a track-aware companion service with four responsibilities:

1. observe what the browser is playing;
2. infer the segments inside the video;
3. resolve each segment to a canonical recording;
4. submit only eligible, trustworthy listens.

```text
┌──────────────────────┐
│ Chrome / YouTube      │
│ URL, chapters, time   │
└──────────┬───────────┘
           │ local authenticated API
           ▼
┌──────────────────────┐
│ Session coordinator   │
│ play/pause/seek state │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Splitter              │
│ chapters, text, audio │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Resolver              │
│ fingerprint + MBID   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Confidence/review     │
│ approve, edit, reject │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ ListenBrainz submitter│
│ idempotent listens    │
└──────────────────────┘
```

### The browser adapter should stay small

The browser extension should capture:

- video ID and canonical URL;
- title, channel, and duration;
- chapters when available;
- current playback position;
- play, pause, seek, and navigation events;
- whether the user enabled music tracking for this video.

It should not send a ListenBrainz token into the YouTube page. It should not
silently scrobble every video a person watches. A music-only mode, visible
per-video enable/disable control, and a review notification are important
because YouTube is also a general video platform.

The extension can send events to a loopback service over a local authenticated
endpoint. That keeps the heavy work and long-lived session state outside the
browser content script.

### Use a staged splitter

The splitter should apply increasingly expensive methods:

```text
1. YouTube chapters
2. Description timestamps
3. Opt-in pinned-comment tracklist
4. Title/uploader parsing
5. Local overlapping fingerprint queries
6. Optional external recognition
7. Manual boundary and identity correction
```

This ordering is both faster and more explainable. If a result came from an
explicit description line plus a matching local fingerprint, the user can see
why it was trusted. If it came from one uncertain audio window, it should go to
review.

### Build a local reference index

For a personal homelab, the first reference corpus should be the music already
owned and indexed locally. Each recording should have:

- MusicBrainz recording ID;
- release group and release IDs where available;
- artist credit and title;
- duration;
- fingerprint data;
- local stable track ID;
- fingerprint and analysis version;
- review status.

This produces a valuable property: YouTube listening can be matched directly to
the same recording identity used by Navidrome and the local recommendation
system.

It also makes the system honest about discovery outside the library. A YouTube
track that cannot be matched locally can be recorded as an external candidate or
sent to a request workflow, but it should not be silently treated as a local
track.

### Preserve candidates, not just winners

Every segment should retain its evidence:

```json
{
  "start_ms": 0,
  "end_ms": 248000,
  "boundary_source": "description+fingerprint",
  "candidates": [
    {
      "recording_mbid": "...",
      "artist": "Artist",
      "title": "Track",
      "confidence": 0.94,
      "sources": ["description", "local_fingerprint", "musicbrainz"]
    },
    {
      "recording_mbid": "...",
      "artist": "Artist",
      "title": "Track - Live",
      "confidence": 0.51,
      "sources": ["musicbrainz"]
    }
  ],
  "requires_review": false
}
```

This is essential for debugging. A later improvement should be able to explain
why a result changed without pretending the earlier result never existed.

## Confidence and review

A single score is not enough. Confidence should account for:

- agreement between the chapter/description and audio match;
- fingerprint match duration and coverage;
- time alignment across overlapping windows;
- duration compatibility;
- MusicBrainz version and release evidence;
- whether the candidate exists in the local reference index;
- whether alternate candidates are close in score;
- whether the audio contains a crossfade, speech, or applause.

A practical starting policy might be:

| Result | Action |
| --- | --- |
| High confidence and enough playback | Submit automatically |
| Medium confidence or version ambiguity | Show in review queue |
| Low confidence or no canonical identity | Mark unmatched |
| Explicit user correction | Submit after confirmation |

The exact thresholds should be measured against a labelled fixture set. They are
not universal truths.

The review interface should show:

- video title and source URL;
- segment start and end time;
- proposed artist/title;
- alternate candidates;
- evidence sources and confidence;
- whether the ListenBrainz threshold has been reached;
- approve, edit, skip, and ignore-video actions;
- current submission state.

Reliability comes from making uncertainty cheap to resolve, not from hiding it.

## ListenBrainz submission and duplicate safety

The submitter should create a per-segment idempotency key from:

```text
user + YouTube video ID + recording MBID + segment start time
```

It should retain:

- the request payload without the secret token;
- submission status;
- response metadata;
- retry count;
- timestamp;
- the source segment and selected candidate.

If the network fails, the listen should remain pending. A failed API request is
not a successful zero-result submission. If the same event is retried, the
idempotency key should prevent duplicates.

The origin URL should remain the YouTube video URL. That preserves the source
context while the MusicBrainz recording ID preserves canonical music identity.

## Why not just scrobble the chapters in Web Scrobbler?

For simple chaptered albums, that may be enough. It is the lowest-cost path and
worth improving first.

But chapters alone do not solve the general problem:

- some uploads have no chapters;
- some chapter labels are not songs;
- description tracklists can be wrong or incomplete;
- a single video can contain live, remix, and studio versions;
- continuous mixes need audio evidence;
- a browser extension should not become a full audio-analysis worker;
- corrections and retry-safe submission need persistent local state.

The right design is therefore layered. Web Scrobbler remains the browser-facing
scrobble component. A local companion adds the missing segmentation, identity,
review, and persistence capabilities.

## Open-source versus external recognition

An open-source baseline can be built with:

- yt-dlp for metadata and user-authorized media extraction;
- local fingerprints using Panako or audfprint;
- Chromaprint/AcoustID for near-identical identity support;
- MusicBrainz for canonical recording resolution;
- ListenBrainz for submissions and history.

This is attractive for a homelab because the reference library, session history,
and corrections can stay local.

External recognizers may improve coverage for difficult videos, but introduce:

- API keys and rate limits;
- provider-specific licensing;
- external transmission of audio or fingerprints;
- less predictable reproducibility;
- another dependency that can disappear or change behaviour.

They should be optional, clearly labelled, and never the only path to a truthful
result. The system should work in an “open-source/local only” mode even if that
mode returns more unmatched segments.

## A staged implementation plan

### Stage 1: metadata-only prototype

Input one YouTube URL and produce a JSON document containing:

- video metadata;
- chapters;
- parsed description timestamps;
- normalized artist/title candidates;
- MusicBrainz search results;
- provenance for every candidate.

Do not download audio or submit listens yet. This stage establishes whether the
deterministic metadata path is good enough for common album uploads.

### Stage 2: local fingerprint matching

Add a reference index from the local music library. Process bounded overlapping
audio windows and merge stable matches into segments.

Measure this against examples containing:

- clean track boundaries;
- silence between songs;
- crossfades;
- applause;
- speech;
- duplicate and remastered recordings;
- tracks not present in the local index.

### Stage 3: local review service

Add a loopback API and a small review UI. A user should be able to replay a
session, change a boundary, select an alternate recording, and approve or reject
each segment.

The review decision should be stored separately from the shared MusicBrainz or
Navidrome metadata. It is a personal listening-history decision, not permission
to rewrite the library.

### Stage 4: browser integration

Add a Web Scrobbler-compatible browser adapter that sends playback state to the
local service and displays the current resolved segment.

The browser should support:

- music-only tracking;
- visible current-match status;
- pause/seek handling;
- per-video disable;
- a link to review uncertain segments.

### Stage 5: ListenBrainz submission

Once recognition and review are trustworthy:

- configure the user-held ListenBrainz token;
- enforce the per-segment listening threshold;
- submit accepted high-confidence listens;
- verify the listens in the correct ListenBrainz account;
- test retries and duplicate prevention;
- preserve authenticated acceptance evidence separately from local tests.

### Stage 6: difficult videos

Only after the basic path works, add:

- better crossfade boundary inference;
- manual boundary adjustment;
- alternate recognizer behind a feature flag;
- cover/remix/live disambiguation;
- background processing and caching;
- import of corrected segments into a labelled evaluation set.

Automatic acquisition of every newly discovered recommendation remains outside
this project. Discovery and acquisition should remain separate decisions.

## Measuring success

Measure by video type rather than one global accuracy number:

- boundary precision and recall;
- recording identification precision;
- percentage automatically accepted;
- review correction rate;
- unmatched rate;
- false-positive submissions;
- duplicate submission rate;
- processing latency;
- user correction time;
- ListenBrainz acceptance rate;
- later recommendation usefulness.

The most important failure metric is false-positive history. A missing listen is
usually recoverable. A wrong listen can contaminate personal recommendations and
household collaborative discovery for a long time.

## Privacy and authority boundaries

YouTube is a general-purpose platform, so music tracking must be deliberate.

The ideal tool should provide:

- separate per-user accounts;
- explicit opt-in for YouTube tracking;
- music-only mode;
- local token custody;
- no raw YouTube browsing history export by default;
- a retention and deletion policy for video sessions;
- no sharing of raw household listening history;
- clear “unmatched” and “unavailable” states;
- no automatic library writes or acquisition.

The system’s authorities should remain narrow:

| Component | Authority |
| --- | --- |
| Browser adapter | Observe opted-in playback |
| Splitter | Propose boundaries |
| Resolver | Propose recording identities |
| Review queue | Capture user decisions |
| ListenBrainz submitter | Submit accepted listening history |
| Navidrome | Remain the local playback and library interface |
| Lidarr/Aurral | Keep separate acquisition and approval authority |

## The larger recommendation-system connection

This project is not only about scrobbling. It improves the evidence entering a
personal recommendation system.

A YouTube video-level listen tells us very little. An individual recording listen
can contribute to:

- personal artist and recording affinity;
- sonic-cluster preferences;
- novelty tolerance;
- collaborative household discovery;
- rediscovery playlists;
- better explanations for future recommendations.

That is why identity quality matters. MusicBrainz describes the recording and its
relationships. AcoustID helps identify the audio. Sonic analysis describes how it
sounds. Listening behaviour describes the person. The scrobbler should connect
these layers without confusing their responsibilities.

For a broader treatment of those recommendation dimensions, see [The Homelab
Music Recommendation Field Guide](/technical-notes/homelab-music-recommendations-field-guide/).

## Conclusion

YouTube is already part of many people’s music ecosystem, but its object model
is video-first rather than track-first. A normal scrobbler can observe that a
video is playing; it cannot always know which recording is playing inside it.

The open-source ecosystem is close to the ideal solution but distributed across
several projects. Web Scrobbler provides browser capture and submission. yt-dlp
provides page structure. Panako and audfprint provide fingerprinting. Chromaprint
and AcoustID help with identity. MusicBrainz provides canonical recording
metadata. ListenBrainz provides the listening history and recommendation
destination.

The missing layer is orchestration: a local, reviewable service that combines
metadata, timestamps, overlapping fingerprints, confidence, and idempotent
submission.

The design principle is simple:

> When a video contains many songs, do not scrobble the container. Identify the
> recording segments, preserve uncertainty, and submit only the listens that the
> evidence can support.

That approach is slower than blindly recording the video title. It is also much
more useful: the resulting history can actually support personal discovery,
household correlation, and a better homelab music experience.
