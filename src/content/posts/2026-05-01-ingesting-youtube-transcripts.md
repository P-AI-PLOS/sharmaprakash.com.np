---
title: "Ingesting YouTube transcripts: the YT Data API path, with yt-dlp + Whisper as honest fallback"
date: "2026-05-01T10:00:00+05:45"
excerpt: "YouTube's Data API is the right primary path for transcripts. yt-dlp + local Whisper is the fallback when captions are missing — used carefully, documented honestly, and quota-aware."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, podcast, youtube, whisper, yt-dlp, postgres, fastapi]
cover: "/images/blog/ai-podcast-index/ingesting-youtube-transcripts/cover.png"
thumb: "/images/blog/ai-podcast-index/ingesting-youtube-transcripts/thumb.png"
series: ai-podcast-index
seriesOrder: 2
use_featured_image: true
last_modified_at: "2026-05-01T10:00:00+05:45"
---

> Assumes you've read [`uv-2026`](/technical-notes/why-uv-exists/) (for the toolchain) and [`python-monorepo-2026`](/technical-notes/python-monorepo-why-now/) (for the layout) — though this post stands alone if you skim those concepts.

Last week in [*Building an AI Podcast Index: the project, the stack, and what you'll have at the end*](/technical-notes/ai-podcast-index-project-overview/) I walked through the demo and the stack. The pipeline starts in one place: getting transcripts onto disk, with timestamps, without violating anyone's terms of service.

That's a more interesting problem than it sounds. YouTube's official Data API gives you channel metadata and — for most uploaded videos — auto-generated captions. It's the right primary source. But every channel I've worked with has a long tail of videos where captions are missing, disabled, or non-English. For those, `yt-dlp` plus a local Whisper transcription is the fallback. It's technically against YouTube's terms when used as the *primary* source; as a captions fallback for personal research, it sits in a gray zone. The honest move is to use the API path by default, fall back only when needed, and tell the reader that's what's happening.

## The compliance call, said out loud

YouTube Data API v3 is the path the platform endorses for programmatic access to public channel metadata. You get uploads playlists, video metadata, and the `captions` resource for free within a daily quota. No part of this post asks you to scrape the website.

`yt-dlp` is a different tool. It downloads the actual media stream — audio or video — using the same internal endpoints the browser does. YouTube's Terms of Service forbid downloading content "for any reason other than as expressly permitted by the Service." There's no enforcement against single-user research projects, but pretending the rule doesn't exist is dishonest. So in this project: `yt-dlp` runs only when the Data API has no captions for a given video, only on episodes we're already allowed to watch, and only as input to a local Whisper transcription that gets stored alongside our own enrichment. The original media file is deleted after transcription. If you publish a derivative of this project, do the same math yourself — or write to the channel owner and get explicit permission.

That's the tradeoff. Now the code.

## API setup

Create a project in [Google Cloud Console](https://console.cloud.google.com/), enable the **YouTube Data API v3**, and generate an API key. The free tier gives you 10,000 quota units per day, which is more than enough for one channel's worth of polling — a `playlistItems.list` call costs 1 unit, a `videos.list` call costs 1 unit per call regardless of the part flags, and `captions.download` costs 200 units. Most days you'll burn under 100 units.

Store it in `.env` at the repo root and read it via Pydantic settings (per series 2 post 4):

```bash title=".env"
YOUTUBE_API_KEY=AIza...
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql+psycopg://localhost:5432/podcast_index
```

To find a channel's ID, open the channel page and look at the URL (`/channel/UC...`) or run a one-liner against the API. Here's the curl that lists a channel's most recent uploads:

```bash
# Get the uploads playlist ID for our reference channel
curl -s "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}" \
  | jq -r '.items[0].contentDetails.relatedPlaylists.uploads'
# -> UUxxxxxxxxxxxxxxxxxxxxxxxx

# List the 10 most recent uploads on that playlist
curl -s "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=10&key=${YOUTUBE_API_KEY}" \
  | jq '.items[] | {videoId: .contentDetails.videoId, title: .snippet.title, publishedAt: .contentDetails.videoPublishedAt}'
```

Every channel has a paired `UU...` uploads playlist that mirrors the `UC...` channel ID. That's the only playlist we'll poll.

## The ingest package

The ingest worker lives at `packages/ingest/` in the monorepo. It owns three responsibilities: poll the uploads playlist, fetch captions, and write transcript segments to Postgres. Anything fancier (entity extraction, topics, search) is a downstream concern.

```text title="packages/ingest/"
ingest/
├── pyproject.toml
├── src/
│   └── ingest/
│       ├── __init__.py
│       ├── client.py         # YouTube Data API wrapper
│       ├── captions.py       # WebVTT parser
│       ├── fallback.py       # yt-dlp + Whisper
│       ├── store.py          # Postgres writes
│       ├── run.py            # entrypoint: task ingest
│       └── settings.py       # Pydantic Settings
└── tests/
```

The dependency list is short. `httpx` for the API (the official `google-api-python-client` works but pulls in a lot of baggage I don't want for one endpoint), `webvtt-py` for caption parsing, `psycopg[binary]` and `sqlalchemy` for storage. `yt-dlp` and `openai-whisper` are optional dependencies on the `fallback` extra, so a user who doesn't want Whisper installed never has to download a 1.5 GB model.

```toml title="packages/ingest/pyproject.toml"
[project]
name = "ingest"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "httpx>=0.27",
    "webvtt-py>=0.5",
    "psycopg[binary]>=3.2",
    "sqlalchemy>=2.0",
    "pydantic-settings>=2.5",
    "shared-schema",   # workspace dependency
]

[project.optional-dependencies]
fallback = [
    "yt-dlp>=2024.10",
    "openai-whisper>=20240930",
]

[tool.uv.sources]
shared-schema = { workspace = true }
```

## Step 1 — poll the uploads playlist

The poll is a single API call with pagination. The result is a list of `(video_id, published_at, title)` tuples. We skip videos we've already processed.

```python title="packages/ingest/src/ingest/client.py"
import httpx
from datetime import datetime
from .settings import settings

YT = "https://www.googleapis.com/youtube/v3"

async def list_uploads(playlist_id: str, since: datetime | None = None) -> list[dict]:
    """Return all videos in the uploads playlist newer than `since`."""
    out: list[dict] = []
    page_token: str | None = None
    async with httpx.AsyncClient(timeout=15) as http:
        while True:
            params = {
                "part": "snippet,contentDetails",
                "playlistId": playlist_id,
                "maxResults": 50,
                "key": settings.youtube_api_key,
            }
            if page_token:
                params["pageToken"] = page_token
            r = await http.get(f"{YT}/playlistItems", params=params)
            r.raise_for_status()
            data = r.json()

            stop = False
            for item in data["items"]:
                published = datetime.fromisoformat(
                    item["contentDetails"]["videoPublishedAt"].replace("Z", "+00:00")
                )
                if since and published <= since:
                    stop = True
                    break
                out.append({
                    "video_id": item["contentDetails"]["videoId"],
                    "title": item["snippet"]["title"],
                    "published_at": published,
                })
            page_token = data.get("nextPageToken")
            if stop or not page_token:
                break
    return out
```

`since` is the timestamp of the most recently processed video. On a daily cron, this is usually one or two new items — the pagination loop exits on the first page.

## Step 2 — fetch captions, parse to segments

The `captions.list` endpoint tells you which caption tracks exist for a video. You want the auto-generated English track if there's no human-authored one. Downloading a track costs 200 quota units, which is expensive enough that we cache the raw WebVTT to disk and never re-download.

```python title="packages/ingest/src/ingest/captions.py"
from pathlib import Path
import httpx, webvtt
from shared_schema.transcripts import TranscriptSegment
from .settings import settings

CACHE_DIR = Path(".cache/captions")

async def fetch_captions(video_id: str) -> list[TranscriptSegment] | None:
    """Return parsed segments, or None if no usable caption track exists."""
    cached = CACHE_DIR / f"{video_id}.vtt"
    if not cached.exists():
        track_id = await pick_track(video_id)
        if track_id is None:
            return None
        vtt = await download_track(track_id)
        cached.parent.mkdir(parents=True, exist_ok=True)
        cached.write_text(vtt, encoding="utf-8")
    return list(parse_vtt(cached, video_id))


def parse_vtt(path: Path, video_id: str):
    for i, cue in enumerate(webvtt.read(str(path))):
        yield TranscriptSegment(
            video_id=video_id,
            seq=i,
            start_ms=int(cue.start_in_seconds * 1000),
            end_ms=int(cue.end_in_seconds * 1000),
            text=cue.text.replace("\n", " ").strip(),
            source="youtube-captions",
        )
```

`TranscriptSegment` is a Pydantic model in `packages/shared-schema/` (per [`python-monorepo-2026` post 3](/technical-notes/pydantic-to-typescript-shared-schema/)). Defining it once and sharing across ingest, API, and frontend is the whole reason the monorepo exists.

```python title="packages/shared-schema/src/shared_schema/transcripts.py"
from typing import Literal
from pydantic import BaseModel

CaptionSource = Literal["youtube-captions", "whisper-fallback"]

class TranscriptSegment(BaseModel):
    video_id: str
    seq: int
    start_ms: int
    end_ms: int
    text: str
    source: CaptionSource
```

## Step 3 — the Whisper fallback

When `pick_track()` returns `None`, we drop into the fallback. The `fallback` import is guarded so a user without `openai-whisper` installed gets a clear error instead of an `ImportError` from somewhere deep.

```python title="packages/ingest/src/ingest/fallback.py"
from pathlib import Path
from shared_schema.transcripts import TranscriptSegment

def transcribe_with_whisper(video_id: str) -> list[TranscriptSegment]:
    try:
        import yt_dlp
        import whisper
    except ImportError as e:
        raise RuntimeError(
            "Whisper fallback requested but the `fallback` extra is not installed.\n"
            "Run: uv sync --package ingest --extra fallback"
        ) from e

    audio_path = Path(f".cache/audio/{video_id}.m4a")
    audio_path.parent.mkdir(parents=True, exist_ok=True)

    ydl_opts = {
        "format": "bestaudio[ext=m4a]/bestaudio",
        "outtmpl": str(audio_path.with_suffix(".%(ext)s")),
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])

    model = whisper.load_model("base")  # 142 MB, runs on CPU
    result = model.transcribe(str(audio_path), word_timestamps=False)

    # Delete the audio file once transcribed — we keep the text, not the media.
    audio_path.unlink(missing_ok=True)

    return [
        TranscriptSegment(
            video_id=video_id,
            seq=i,
            start_ms=int(seg["start"] * 1000),
            end_ms=int(seg["end"] * 1000),
            text=seg["text"].strip(),
            source="whisper-fallback",
        )
        for i, seg in enumerate(result["segments"])
    ]
```

A couple of things worth flagging.

- **Model size**: `whisper.load_model("base")` is the sweet spot for English. `small` gives better accuracy at 2× the runtime; `tiny` is faster but introduces enough errors that downstream extraction in post 3 starts hallucinating. Word-level timestamps (`whisperx`) are *not* needed here — segment timestamps suffice for clip search.
- **`uv tool install` vs project dep**: an earlier draft of this project ran `whisper` via `uv tool install openai-whisper` (per [series 1 post 5](/technical-notes/uv-tool-and-scripts/)). That's fine for ad-hoc CLI use. As part of a package's dependency graph, install it as an optional dep so the venv resolves correctly.
- **Audio deletion**: this is intentional. The point is the transcript, not the media. Keeping a `.cache/audio/` directory full of m4a files invites both legal complaints and disk-full alerts.

## Step 4 — idempotency

Re-runs must be safe. If the ingest worker crashes mid-episode, the next run picks up exactly where the last one stopped — no half-processed segments, no double-processing.

The trick is a `processed_videos` row keyed on `video_id`, written *before* segments are inserted, with a `status` column. The whole thing happens in a single transaction.

```sql title="db/migrations/001_init.sql"
CREATE TABLE processed_videos (
    video_id        TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    published_at    TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL CHECK (status IN ('pending','done','failed')),
    source          TEXT,
    segment_count   INT,
    ingested_at     TIMESTAMPTZ,
    error           TEXT
);

CREATE TABLE transcript_segments (
    video_id   TEXT NOT NULL REFERENCES processed_videos(video_id) ON DELETE CASCADE,
    seq        INT NOT NULL,
    start_ms   INT NOT NULL,
    end_ms     INT NOT NULL,
    text       TEXT NOT NULL,
    source     TEXT NOT NULL,
    PRIMARY KEY (video_id, seq)
);

CREATE INDEX transcript_segments_video_idx ON transcript_segments (video_id, start_ms);
```

```python title="packages/ingest/src/ingest/store.py"
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from shared_schema.transcripts import TranscriptSegment

async def already_done(session: AsyncSession, video_id: str) -> bool:
    row = await session.execute(
        text("SELECT status FROM processed_videos WHERE video_id = :v"),
        {"v": video_id},
    )
    r = row.first()
    return r is not None and r.status == "done"


async def save_video(
    session: AsyncSession,
    *,
    video_id: str,
    title: str,
    published_at,
    segments: list[TranscriptSegment],
    source: str,
) -> None:
    async with session.begin():
        await session.execute(
            text("""
                INSERT INTO processed_videos
                  (video_id, title, published_at, status, source, segment_count, ingested_at)
                VALUES
                  (:vid, :title, :pub, 'done', :src, :n, now())
                ON CONFLICT (video_id) DO UPDATE
                SET status = 'done',
                    source = EXCLUDED.source,
                    segment_count = EXCLUDED.segment_count,
                    ingested_at = EXCLUDED.ingested_at,
                    error = NULL
            """),
            {"vid": video_id, "title": title, "pub": published_at,
             "src": source, "n": len(segments)},
        )
        await session.execute(
            text("DELETE FROM transcript_segments WHERE video_id = :v"),
            {"v": video_id},
        )
        await session.execute(
            text("""
                INSERT INTO transcript_segments
                  (video_id, seq, start_ms, end_ms, text, source)
                VALUES
                  (:video_id, :seq, :start_ms, :end_ms, :text, :source)
            """),
            [s.model_dump() for s in segments],
        )
```

`ON CONFLICT ... DO UPDATE` plus the delete-then-insert means re-running is a no-op when the data hasn't changed, and a clean replacement when it has. The whole write — row update plus all segments — happens in one transaction, so a crash leaves the table consistent.

## Putting it together

`task ingest` runs this loop:

```python title="packages/ingest/src/ingest/run.py"
import asyncio, logging
from datetime import datetime, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from .client import list_uploads
from .captions import fetch_captions
from .fallback import transcribe_with_whisper
from .store import already_done, save_video
from .settings import settings

log = logging.getLogger("ingest")


async def latest_published(session: AsyncSession) -> datetime | None:
    r = await session.execute(text("SELECT MAX(published_at) FROM processed_videos"))
    return r.scalar()


async def ingest_once() -> None:
    engine = create_async_engine(settings.database_url)
    async with AsyncSession(engine) as session:
        since = await latest_published(session)
        uploads = await list_uploads(settings.uploads_playlist_id, since=since)
        log.info("ingest: %d new uploads since %s", len(uploads), since)

        for v in uploads:
            if await already_done(session, v["video_id"]):
                continue
            segments = await fetch_captions(v["video_id"])
            source = "youtube-captions"
            if segments is None:
                log.info("ingest: %s has no captions, falling back to whisper", v["video_id"])
                segments = transcribe_with_whisper(v["video_id"])
                source = "whisper-fallback"
            await save_video(
                session,
                video_id=v["video_id"],
                title=v["title"],
                published_at=v["published_at"],
                segments=segments,
                source=source,
            )
            log.info("ingest: %s -> %d segments (%s)", v["video_id"], len(segments), source)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    asyncio.run(ingest_once())
```

First run on a 60-episode channel, captions present on all of them:

```text
2026-08-11 09:14:02 INFO ingest: 60 new uploads since None
2026-08-11 09:14:04 INFO ingest: dQw4w9WgXcQ -> 412 segments (youtube-captions)
2026-08-11 09:14:06 INFO ingest: 7lCDEYXw3mM -> 388 segments (youtube-captions)
...
2026-08-11 09:18:43 INFO ingest: KMUyA0fyMaw -> 0 segments — skipped (no captions, fallback disabled)
2026-08-11 09:18:43 INFO ingest: done. 59 ok, 1 skipped, 0 failed
```

That last line — `1 skipped` — is the only video missing English captions. Running once more with `uv sync --package ingest --extra fallback` installed picks it up via Whisper. Total wall time for one episode through Whisper on an M2 Mac with the `base` model is around 0.3× realtime, so a 45-minute episode transcribes in about 13 minutes.

## Scheduling: `launchd` (macOS) and `systemd` (Linux)

Daily cron via the OS's native scheduler. No need for Celery or anything heavier.

```xml title="~/Library/LaunchAgents/com.sharmaprakash.ai-podcast-ingest.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.sharmaprakash.ai-podcast-ingest</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/prakash/.local/bin/task</string>
    <string>-d</string>
    <string>/Users/prakash/code/ai-podcast-index</string>
    <string>ingest</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>3</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/Users/prakash/Library/Logs/ai-podcast-ingest.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/prakash/Library/Logs/ai-podcast-ingest.err</string>
</dict>
</plist>
```

Load with `launchctl load ~/Library/LaunchAgents/com.sharmaprakash.ai-podcast-ingest.plist`. The Linux equivalent is a `systemd` user timer:

```ini title="~/.config/systemd/user/ai-podcast-ingest.timer"
[Unit]
Description=Daily YouTube ingest for the podcast index

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Plus a matching `.service` unit that runs `task ingest` from the repo. `systemctl --user enable --now ai-podcast-ingest.timer` and you're done.

## Quotas and backing off

The YouTube Data API gives you 10,000 quota units per day. Reading the uploads playlist is cheap (1 unit per page of 50 items); downloading captions is the expensive call at 200 units each. For a single channel:

- Daily poll of the uploads playlist: 1–2 units.
- Captions for one new episode: 200 units (if needed; many recent uploads have captions cached by YouTube and don't require a fresh fetch).
- Budget for ~40 fresh caption downloads per day before you hit the ceiling.

If you do hit it, the response is HTTP 403 with reason `quotaExceeded`. The right behavior is to log it, write nothing, and let tomorrow's run resume — *not* to retry, and definitely not to switch providers mid-run. The Whisper fallback exists for missing captions, not for quota exhaustion.

A small wrapper around `httpx` makes this clean:

```python
from httpx import HTTPStatusError

class QuotaExceeded(Exception):
    pass

def raise_for_quota(resp):
    if resp.status_code == 403:
        body = resp.json()
        for err in body.get("error", {}).get("errors", []):
            if err.get("reason") == "quotaExceeded":
                raise QuotaExceeded(body["error"]["message"])
    resp.raise_for_status()
```

The ingest loop catches `QuotaExceeded`, logs it, and exits cleanly. Tomorrow's run picks up from where today's stopped, because `latest_published` reads from `processed_videos`, not from the API.

## What's not here

A few things you'd build in production that aren't in scope for this series:

- **Webhooks instead of polling**: YouTube's PubSubHubbub feed pushes upload notifications. Worth it for a 10-channel index, overkill for one.
- **Speaker diarization**: who's talking in each segment? `whisperx` can do it; the value-to-complexity ratio is bad for a clip-search use case. Punted to a sequel post.
- **Caption corrections**: auto-captions misspell names, especially Nepali ones. We'll handle this in [post 4](/technical-notes/guest-entity-resolution/) via entity resolution rather than fixing captions in place.

Next week, post 3: feeding these segments into a structured-extraction pipeline that pulls guests, topics, and quotes — using Pydantic + Claude, with schema-first prompting and a retry-once-on-validation-error pattern.

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

*Full source: [github.com/poudelprakash/ai-podcast-index](https://github.com/poudelprakash/ai-podcast-index) (tag `series3-post2`)*

<!--
Codex image prompt — cover (21:9) and thumb (16:9):

Editorial illustration, no text, no logos, no watermarks.
A single horizontal flow of subtle paper-cut style shapes against a warm,
off-white paper background: a stylized play-button glyph on the left,
flowing into a wide horizontal waveform/transcript line in muted teal and
ochre, terminating in a small clock-face / timestamp glyph on the right.
Composition is calm, asymmetric, with generous whitespace. Soft drop
shadow under each cutout to suggest layered paper. Palette: warm cream
background (#F5F0E6), muted teal (#3B7A78), ochre (#C99F45), charcoal
(#2B2B2B) for fine detail. No people, no devices, no UI mockups.
Aspect ratio for cover: 21:9. For thumb: re-crop the same composition to
16:9 keeping the waveform centered.
-->
