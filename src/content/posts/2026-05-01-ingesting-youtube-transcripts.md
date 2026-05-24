---
title: "Ingesting YouTube transcripts: yt-dlp for subs, Whisper when subs don't exist"
date: "2026-05-01T10:00:00+05:45"
excerpt: "YouTube's Data API gives you channel discovery but not third-party caption text — that endpoint is OAuth-only in practice. The honest pipeline is yt-dlp in subs-only mode for captions, and local Whisper as a deeper fallback when no captions exist at all."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, podcast, youtube, whisper, yt-dlp, postgres, fastapi]
cover: "/images/blog/clipdex/ingesting-youtube-transcripts/cover.png"
thumb: "/images/blog/clipdex/ingesting-youtube-transcripts/thumb.png"
series: clipdex
seriesOrder: 2
use_featured_image: true
last_modified_at: "2026-05-01T10:00:00+05:45"
---

> Assumes you've read [`uv-2026`](/technical-notes/why-uv-exists/) (for the toolchain) and [`python-monorepo-2026`](/technical-notes/python-monorepo-why-now/) (for the layout) — though this post stands alone if you skim those concepts.

Last week in [*Building an AI Podcast Index: the project, the stack, and what you'll have at the end*](/technical-notes/clipdex-project-overview/) I walked through the demo and the stack. The pipeline starts in one place: getting transcripts onto disk, with timestamps, without violating anyone's terms of service.

That's a more interesting problem than it sounds. I started this post with a plan that turned out to be wrong: use YouTube's official Data API for channel metadata *and* captions, fall back to `yt-dlp` only when captions are missing. The first half is fine — the Data API is the right tool for channel discovery and listing uploads. The second half doesn't work in practice: the Data API's `captions.download` endpoint requires OAuth and is restricted to videos *you own*. For any third-party channel — i.e. the actual use case — it returns 401. I learned that the way you usually learn these things: by running the code.

So the real pipeline ended up looking like this:

1. **YouTube Data API** — channel discovery (`@handle` → `UC…` channel id), uploads playlist, per-video metadata. Free, quota-bounded, no auth ceremony.
2. **`yt-dlp` in subs-only mode** — primary path for caption text. `--write-auto-subs --skip-download` fetches the WebVTT file for the channel's auto-generated captions without downloading any media.
3. **Whisper fallback** — local transcription when even auto-captions are missing. This is where `yt-dlp` does download audio; that file is deleted after transcription.

## The compliance call, said out loud

`yt-dlp` talks to the same internal YouTube endpoints the browser uses to render the video player and the transcript panel. In subs-only mode (`--skip-download` set) no media is downloaded — only the timed-text file that YouTube serves to render the in-browser transcript view. That's a much weaker TOS concern than downloading the media itself, and it's how every "podcast transcript indexer" I'm aware of actually works, including the ones with funded engineering teams. The Whisper fallback path is the one that touches audio, and only when there's literally no other way to get text — and the audio file is deleted after transcription. If you publish a derivative of this project, do the same math yourself — or write to the channel owner and get explicit permission.

The third option I tried and rejected was [`youtube-transcript-api`](https://github.com/jdepoix/youtube-transcript-api). It scrapes the public watch page to find the same timedtext URL, but YouTube IP-blocks anonymous scrapers aggressively. `yt-dlp` works around that with rotating client identifiers and — when needed — your signed-in browser cookies. It's the more honest path *because* it actually works.

That's the tradeoff. Now the code.

## API setup

Create a project in [Google Cloud Console](https://console.cloud.google.com/), enable the **YouTube Data API v3**, and generate an API key. The free tier gives you 10,000 quota units per day, which is more than enough for one channel's worth of polling — a `channels.list` call costs 1 unit, `playlistItems.list` costs 1 unit per page of 50 items. We never call `captions.download`, so the only quota cost is metadata, and it stays under ~20 units per day for a single channel.

Store it in `.env` at the repo root:

```bash title=".env"
YOUTUBE_API_KEY=AIza...
YOUTUBE_CHANNEL_HANDLE=@TheDoersglobal
DATABASE_URL=postgresql+psycopg://localhost:5432/clipdex

# yt-dlp pulls cookies from your signed-in browser to bypass YouTube's
# bot check. Set to chrome / safari / firefox / brave, or empty to disable.
YTDLP_COOKIES_FROM_BROWSER=brave

# Bound first runs (a 1000-episode channel takes a while). 0 = unbounded.
MAX_VIDEOS_PER_RUN=2
```

The handle (`@TheDoersglobal`) is the form you'd type into the YouTube search bar. We resolve it to a channel id (`UC…`) and uploads playlist (`UU…`) via one API call. Here's the curl version of the same lookup, for sanity:

```bash
# Handle -> channel id + uploads playlist id
curl -s "https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forHandle=TheDoersglobal&key=${YOUTUBE_API_KEY}" \
  | jq '.items[0] | {title: .snippet.title, id: .id, uploads: .contentDetails.relatedPlaylists.uploads}'
# -> { "title": "The Doers", "id": "UCZbKwSM00cPCNCdJ-ClfqFQ", "uploads": "UUZbKwSM00cPCNCdJ-ClfqFQ" }
```

Every channel has a paired `UU...` uploads playlist that mirrors the `UC...` channel ID. That's the only playlist we'll poll.

## The ingest package

The ingest worker lives at `packages/ingest/` in the monorepo. It owns three responsibilities: poll the uploads playlist, fetch captions, and write transcript segments to Postgres. Anything fancier (entity extraction, topics, search) is a downstream concern.

```text title="packages/ingest/"
ingest/
├── pyproject.toml
└── src/
    └── clipdex_ingest/
        ├── __init__.py
        ├── __main__.py       # python -m clipdex_ingest
        ├── client.py         # YouTube Data API wrapper + QuotaExceeded
        ├── captions.py       # track picker + WebVTT parser
        ├── fallback.py       # yt-dlp + Whisper (optional extra)
        ├── store.py          # Postgres writes
        ├── run.py            # entrypoint behind `task ingest`
        └── settings.py       # Pydantic Settings
```

The dependency list is short. `httpx` for the API (the official `google-api-python-client` works but pulls in a lot of baggage I don't want for one endpoint), `webvtt-py` for caption parsing, `psycopg[binary]` and `sqlalchemy` for storage. `yt-dlp` and `openai-whisper` are optional dependencies on the `fallback` extra, so a user who doesn't want Whisper installed never has to download a 1.5 GB model.

```toml title="packages/ingest/pyproject.toml"
[project]
name = "clipdex-ingest"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "httpx>=0.27",
    "webvtt-py>=0.5",
    "psycopg[binary]>=3.2",
    "sqlalchemy>=2.0",
    "pydantic-settings>=2.5",
    "clipdex-schema",     # workspace dependency
]

[project.optional-dependencies]
fallback = [
    "yt-dlp>=2024.10",
    "openai-whisper>=20240930",
]
```

Workspace resolution lives in the root `pyproject.toml` (`[tool.uv.sources]` lists every member with `{ workspace = true }`) so individual packages just name the dep and uv finds it.

## Step 1 — poll the uploads playlist

The poll is a single API call with pagination. The result is a list of `(video_id, published_at, title)` tuples. We skip videos we've already processed.

```python title="packages/ingest/src/clipdex_ingest/client.py"
import httpx
from datetime import datetime
from clipdex_ingest.settings import settings

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

## Step 2 — fetch captions via yt-dlp subs-only mode

This is the section where I learned the most by running the code. The plan-on-paper was to use the Data API's `captions.list` + `captions.download` endpoints, parse the returned WebVTT, and store segments. That plan dies at the first call: `captions.download` returns 401 for any video you don't own, regardless of the API key. The endpoint is OAuth-gated and the OAuth scope only grants access to your *own* videos. For third-party content it's structurally unavailable.

The path that actually works is `yt-dlp` in subs-only mode. `--write-auto-subs --skip-download` asks YouTube for the auto-generated WebVTT track and writes it to disk without touching the media stream. The WebVTT file we get back is the same one the YouTube player loads to render the in-browser transcript panel.

```python title="packages/ingest/src/clipdex_ingest/captions.py"
import asyncio
from pathlib import Path

import webvtt

from clipdex_ingest.settings import settings
from clipdex_schema import TranscriptSegment


def _cache_dir() -> Path:
    return Path(settings.cache_dir) / "captions"


def _fetch_vtt_sync(video_id: str) -> Path | None:
    """Download the auto-generated English subs as WebVTT. No media downloaded."""
    import yt_dlp

    out_dir = _cache_dir()
    out_dir.mkdir(parents=True, exist_ok=True)
    template = str(out_dir / f"{video_id}.%(ext)s")

    ydl_opts: dict = {
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "subtitleslangs": ["en", "en-US", "en-GB"],
        "subtitlesformat": "vtt",
        "outtmpl": template,
        "quiet": True,
        "no_warnings": True,
        # Subs-only: shorts, premieres, and bot-flagged videos sometimes
        # have no resolvable media formats. We don't care — we're not
        # downloading media — so swallow that specific error.
        "ignore_no_formats_error": True,
    }
    if settings.ytdlp_cookies_from_browser:
        ydl_opts["cookiesfrombrowser"] = (settings.ytdlp_cookies_from_browser,)

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])

    for lang in ("en", "en-US", "en-GB"):
        candidate = out_dir / f"{video_id}.{lang}.vtt"
        if candidate.exists():
            return candidate
    return None


async def fetch_captions(video_id: str) -> list[TranscriptSegment] | None:
    """Return parsed segments, or None if no caption track is available."""
    out_dir = _cache_dir()
    for lang in ("en", "en-US", "en-GB"):
        candidate = out_dir / f"{video_id}.{lang}.vtt"
        if candidate.exists():
            return list(_parse_vtt(candidate, video_id)) or None
    cached = await asyncio.to_thread(_fetch_vtt_sync, video_id)
    if cached is None:
        return None
    return list(_parse_vtt(cached, video_id)) or None
```

Three knobs are worth a closer look.

- **`cookiesfrombrowser`**: YouTube tightened bot detection during 2024–2025, and unauthenticated yt-dlp requests started hitting `Sign in to confirm you're not a bot` reliably. The workaround is to pull cookies from your local signed-in browser. yt-dlp ships an extractor that reads Chrome / Brave / Safari / Firefox cookies straight from disk. For a single-user local tool this is fine; for a multi-tenant service you'd want a dedicated YouTube account whose cookies you ship via a file. The env var `YTDLP_COOKIES_FROM_BROWSER` selects the browser.
- **`ignore_no_formats_error`**: I have no interest in media formats — I'm asking for subs only. But yt-dlp still runs its format-selection logic on every extract, and for shorts / premieres / live videos the n-challenge sometimes fails and the extractor reports "no formats available". Setting this option tells yt-dlp to keep going with the subs path when format resolution fails.
- **Caching by language file**: yt-dlp names its output file as `<id>.<lang>.vtt`. We cache by checking for any of `en`, `en-US`, `en-GB` before hitting the network. That makes re-runs free and keeps the API stateless: a developer can `rm -rf .cache/captions/` to force a refresh.

### Collapsing the rolling-cue format

The second thing the running code taught me: YouTube auto-captions use a *rolling-cue* WebVTT format that you have to know about to parse correctly. Every line appears twice — once as a 10ms "transition" cue (e.g. `00:00:05.110 --> 00:00:05.120`), and once as a "real" cue (`00:00:05.120 --> 00:00:06.310`) that overlaps with the next line being added on top. If you naively dump every cue you'd see in the file, you get four copies of each line and 4,773 "segments" for a 30-minute video.

The fix is small but specific:

```python title="packages/ingest/src/clipdex_ingest/captions.py (continued)"
from collections.abc import Iterator


def _parse_vtt(path: Path, video_id: str) -> Iterator[TranscriptSegment]:
    """Parse YouTube auto-caption WebVTT, collapsing the rolling-cue format."""
    seq = 0
    prev_text: str | None = None
    for cue in webvtt.read(str(path)):
        start_ms = int(cue.start_in_seconds * 1000)
        end_ms = int(cue.end_in_seconds * 1000)
        # Skip the 10ms rolling transition cues.
        if end_ms - start_ms < 200:
            continue
        lines = [line.strip() for line in cue.text.splitlines() if line.strip()]
        if not lines:
            continue
        # Multi-line cues are "prev line + new line" — keep only the new one.
        text = lines[-1]
        if text == prev_text:
            continue
        prev_text = text
        yield TranscriptSegment(
            video_id=video_id,
            seq=seq,
            start_ms=start_ms,
            end_ms=end_ms,
            text=text,
            source="youtube-captions",
        )
        seq += 1
```

On a real 30-minute episode this took the segment count from 4,773 to 2,387 — roughly halved, and every remaining segment is one actual line of dialogue with a usable timestamp. That's the shape post 6's search needs.

`TranscriptSegment` is a Pydantic model in `packages/shared-schema/` (per [`python-monorepo-2026` post 3](/technical-notes/pydantic-to-typescript-shared-schema/)). Defining it once and sharing across ingest, API, and frontend is the whole reason the monorepo exists.

```python title="packages/shared-schema/src/clipdex_schema/transcripts.py"
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

When `fetch_captions()` returns `None` — meaning yt-dlp couldn't find any English caption track for the video — we drop into the Whisper fallback. This is the *only* path that touches audio, and it's gated behind an explicit opt-in (`CLIPDEX_ENABLE_FALLBACK=1`) so the cheap, common case never accidentally downloads a media file. The `openai-whisper` package is also an optional dependency on the `fallback` extra — a user who never enables the fallback never has to download a 1.5 GB model.

```python title="packages/ingest/src/clipdex_ingest/fallback.py"
from pathlib import Path

from clipdex_ingest.settings import settings
from clipdex_schema import TranscriptSegment


def transcribe_with_whisper(video_id: str) -> list[TranscriptSegment]:
    """Download audio with yt-dlp, transcribe with local Whisper, delete the media.

    The `fallback` extra must be installed:
        uv sync --package clipdex-ingest --extra fallback
    """
    try:
        import whisper
        import yt_dlp
    except ImportError as e:
        raise RuntimeError(
            "Whisper fallback requested but the `fallback` extra is not installed.\n"
            "Run: uv sync --package clipdex-ingest --extra fallback"
        ) from e

    audio_dir = Path(settings.cache_dir) / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    audio_path = audio_dir / f"{video_id}.m4a"

    ydl_opts: dict = {
        "format": "bestaudio[ext=m4a]/bestaudio",
        "outtmpl": str(audio_path.with_suffix(".%(ext)s")),
        "quiet": True,
        "no_warnings": True,
    }
    if settings.ytdlp_cookies_from_browser:
        ydl_opts["cookiesfrombrowser"] = (settings.ytdlp_cookies_from_browser,)

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])

    model = whisper.load_model(settings.whisper_model)  # "base" by default
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

Re-runs must be safe. If the ingest worker crashes mid-episode, the next run picks up exactly where the last one stopped — no half-processed segments, no double-processing. Two pieces of mechanism make this work: a `processed_videos` table keyed on `video_id` with a `status` column, and a watermark that only counts `status = 'done'` rows when deciding which uploads are "new".

```sql title="migrations/001_init.sql"
CREATE TABLE processed_videos (
    video_id        TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    published_at    TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL CHECK (status IN ('pending', 'done', 'failed')),
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

```python title="packages/ingest/src/clipdex_ingest/store.py"
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from clipdex_schema import TranscriptSegment


async def latest_published(session: AsyncSession) -> datetime | None:
    """Watermark: ignore failed rows so a failure's now() timestamp doesn't
    mask real new uploads on the next run."""
    r = await session.execute(
        text("SELECT MAX(published_at) FROM processed_videos WHERE status = 'done'")
    )
    return r.scalar()


async def already_done(session: AsyncSession, video_id: str) -> bool:
    r = await session.execute(
        text("SELECT status FROM processed_videos WHERE video_id = :v"),
        {"v": video_id},
    )
    row = r.first()
    return row is not None and row.status == "done"


async def save_video(
    session: AsyncSession,
    *,
    video_id: str,
    title: str,
    published_at: datetime,
    segments: list[TranscriptSegment],
    source: str,
) -> None:
    """Replace any prior data for `video_id` and mark it done."""
    try:
        await session.execute(
            text(
                """
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
                """
            ),
            {"vid": video_id, "title": title, "pub": published_at,
             "src": source, "n": len(segments)},
        )
        await session.execute(
            text("DELETE FROM transcript_segments WHERE video_id = :v"),
            {"v": video_id},
        )
        if segments:
            await session.execute(
                text(
                    """
                    INSERT INTO transcript_segments
                      (video_id, seq, start_ms, end_ms, text, source)
                    VALUES
                      (:video_id, :seq, :start_ms, :end_ms, :text, :source)
                    """
                ),
                [s.model_dump() for s in segments],
            )
        await session.commit()
    except Exception:
        await session.rollback()
        raise


async def mark_failed(session: AsyncSession, video_id: str, error: str) -> None:
    """Record a failed video so we know not to retry it on every run."""
    try:
        await session.execute(
            text(
                """
                INSERT INTO processed_videos
                  (video_id, title, published_at, status, error, ingested_at)
                VALUES (:vid, :vid, now(), 'failed', :err, now())
                ON CONFLICT (video_id) DO UPDATE
                SET status = 'failed', error = EXCLUDED.error, ingested_at = now()
                """
            ),
            {"vid": video_id, "err": error[:1000]},
        )
        await session.commit()
    except Exception:
        await session.rollback()
        raise
```

Three subtle things in here that I only discovered by running the worker against a real 1,000-episode channel:

- **Watermark ignores `failed`**: an earlier draft used `SELECT MAX(published_at) FROM processed_videos` with no filter. That broke the very first time a video failed: `mark_failed` writes `published_at = now()`, which silently became the watermark and made every real new upload look older. The `WHERE status = 'done'` clause is small and load-bearing.
- **`session.commit()` instead of `async with session.begin()`**: SQLAlchemy's `AsyncSession` autobegins a transaction on first execute. Wrapping in `async with session.begin()` then errors with "A transaction is already begun on this Session" — and worse, if the wrapped block raises, the caller's session is left mid-transaction, so the next call (e.g. `mark_failed`) explodes too. Explicit `commit` / `rollback` is uglier on paper and meaningfully more robust in practice.
- **`if segments:`**: empty-list inserts into Postgres via `executemany` raise on some psycopg versions. Cheap to guard.

## Putting it together

`task ingest` runs this loop. The whole worker is one async function — no celery, no Redis queue, no agent framework. For a single-user local tool with a ~daily cadence, anything heavier is theatre.

```python title="packages/ingest/src/clipdex_ingest/run.py"
import asyncio
import logging
import os

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from clipdex_ingest.captions import fetch_captions
from clipdex_ingest.client import QuotaExceeded, list_uploads, resolve_uploads_playlist
from clipdex_ingest.settings import settings
from clipdex_ingest.store import already_done, latest_published, mark_failed, save_video

log = logging.getLogger("clipdex.ingest")


async def ingest_once(enable_fallback: bool | None = None) -> dict[str, int]:
    if enable_fallback is None:
        enable_fallback = os.getenv("CLIPDEX_ENABLE_FALLBACK", "").lower() in ("1", "true", "yes")

    if not settings.youtube_api_key:
        raise RuntimeError("YOUTUBE_API_KEY is not set; copy .env.example to .env and fill it in.")

    playlist_id = settings.uploads_playlist_id or await resolve_uploads_playlist(
        channel_id=settings.youtube_channel_id,
        handle=settings.youtube_channel_handle,
    )

    db_url = settings.database_url
    if db_url.startswith("postgresql://"):
        # SQLAlchemy maps the bare scheme to psycopg2; we ship psycopg3.
        db_url = "postgresql+psycopg://" + db_url[len("postgresql://"):]

    engine = create_async_engine(db_url)
    stats = {"ok": 0, "skipped": 0, "failed": 0}

    async with AsyncSession(engine) as session:
        since = await latest_published(session)
        uploads = await list_uploads(playlist_id, since=since)
        if settings.max_videos_per_run > 0:
            uploads = uploads[: settings.max_videos_per_run]
        log.info("ingest: %d uploads to process (since %s)", len(uploads), since)

        for v in uploads:
            vid = v["video_id"]
            if await already_done(session, vid):
                continue
            try:
                segments = await fetch_captions(vid)
                source: str = "youtube-captions"
                if segments is None:
                    if not enable_fallback:
                        log.info("ingest: %s no captions, fallback disabled — skipped", vid)
                        stats["skipped"] += 1
                        continue
                    log.info("ingest: %s no captions, falling back to whisper", vid)
                    from clipdex_ingest.fallback import transcribe_with_whisper

                    segments = transcribe_with_whisper(vid)
                    source = "whisper-fallback"

                await save_video(
                    session,
                    video_id=vid,
                    title=v["title"],
                    published_at=v["published_at"],
                    segments=segments,
                    source=source,
                )
                log.info("ingest: %s -> %d segments (%s)", vid, len(segments), source)
                stats["ok"] += 1
            except QuotaExceeded as e:
                log.warning("ingest: quota exceeded, stopping cleanly: %s", e)
                break
            except Exception as e:  # noqa: BLE001 — we want per-video isolation
                log.exception("ingest: %s failed", vid)
                await session.rollback()
                await mark_failed(session, vid, str(e))
                stats["failed"] += 1

    await engine.dispose()
    log.info("ingest: done. %d ok, %d skipped, %d failed",
             stats["ok"], stats["skipped"], stats["failed"])
    return stats
```

A few details worth their own paragraph.

- **Per-video isolation**: a broad `except Exception` around each iteration means one cursed video doesn't kill the whole run. The exception's message is stored on the `processed_videos` row so you can `psql` for patterns later (`SELECT error, count(*) FROM processed_videos WHERE status='failed' GROUP BY 1;`).
- **`session.rollback()` before `mark_failed`**: the failing `save_video` call may have left the session mid-transaction. Without the rollback, `mark_failed` would try to open a new transaction and SQLAlchemy would throw "transaction already begun". Easy to miss on paper; immediate to see on first failure.
- **Quota-exceeded `break`**: when the YouTube Data API returns 403 / `quotaExceeded`, the right thing is to stop cleanly and let tomorrow's run continue from the watermark. Retrying with backoff inside the same run just burns more quota when there isn't any to burn.
- **Lazy fallback import**: `from clipdex_ingest.fallback import transcribe_with_whisper` is inside the conditional so a user who never enables the fallback never pays the import cost (which transitively pulls in PyTorch and Whisper).
- **Driver coercion**: the bare `postgresql://` URL is the right thing to put in `.env.example` from a "looks normal" standpoint, but SQLAlchemy 2.x interprets it as `psycopg2`, which isn't installed. We rewrite to `postgresql+psycopg://` at runtime so the same URL works under both `psql` and the worker.

A first run against `@TheDoersglobal` with `MAX_VIDEOS_PER_RUN=2` to keep the smoke test short:

```text
INFO clipdex.ingest: resolved uploads playlist: UUZbKwSM00cPCNCdJ-ClfqFQ
INFO clipdex.ingest: 2 uploads to process (since None)
INFO clipdex.ingest: kjKyj1ZEaf4 -> 6 segments (youtube-captions)
INFO clipdex.ingest: Agjt03cV7ac -> 2387 segments (youtube-captions)
INFO clipdex.ingest: done. 2 ok, 0 skipped, 0 failed
```

The 6-segment video turned out to be a YouTube Short that's mostly the host saying "Mhm." — the rolling-cue collapse correctly produced six distinct utterances. The 2,387-segment video is a 30-minute interview, which works out to a segment roughly every 0.75 seconds. That's the right granularity for clip search in post 6.

Total wall time on an M2 Mac for one episode through the captions path is around 8–12 seconds, dominated by yt-dlp's player-API handshake. The Whisper fallback path is much heavier — on the same hardware with the `base` model, it runs at about 0.3× realtime, so a 45-minute episode transcribes in roughly 13 minutes. That cost is the entire reason the fallback is gated behind `CLIPDEX_ENABLE_FALLBACK=1`: you do not want it firing for hundreds of videos by accident.

## Scheduling: `launchd` (macOS) and `systemd` (Linux)

Daily cron via the OS's native scheduler. No need for Celery or anything heavier.

```xml title="~/Library/LaunchAgents/com.poudelprakash.clipdex.ingest.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.poudelprakash.clipdex.ingest</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/prakash/.local/bin/task</string>
    <string>-d</string>
    <string>/Users/prakash/workspaces/2023/personal/clipdex</string>
    <string>ingest</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>3</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/Users/prakash/Library/Logs/clipdex-ingest.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/prakash/Library/Logs/clipdex-ingest.err</string>
</dict>
</plist>
```

Load with `launchctl load ~/Library/LaunchAgents/com.poudelprakash.clipdex.ingest.plist`. The Linux equivalent is a `systemd` user timer:

```ini title="~/.config/systemd/user/clipdex-ingest.timer"
[Unit]
Description=Daily YouTube ingest for the podcast index

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Plus a matching `.service` unit that runs `task ingest` from the repo. `systemctl --user enable --now clipdex-ingest.timer` and you're done.

## Quotas and backing off

Because the captions text comes from yt-dlp, not the Data API, our quota usage is dramatically lower than the original plan. The Data API gets called only for:

- `channels.list` to resolve a handle to a channel id and uploads playlist — 1 unit, once per run (cached after the first run if you store the playlist id in `.env`).
- `playlistItems.list` to page the uploads playlist — 1 unit per page of 50 items.

For a single channel with one new upload per day, daily quota usage is about 2 units. The 10,000-unit daily ceiling is effectively irrelevant. The expensive call from my original sketch (`captions.download` at 200 units) doesn't get made because it doesn't work for third-party content anyway.

The one place we still need to handle quota exhaustion is the initial backfill of a long-lived channel — paging through a thousand-episode uploads playlist costs ~20 units, which is fine, but if you're running ingest across several channels concurrently you might still hit 403. The right behavior is the same as before: log it, stop the run cleanly, let tomorrow's resume from the watermark. **Do not** retry inside the same run.

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

*Full source: [github.com/poudelprakash/clipdex](https://github.com/poudelprakash/clipdex) (tag `series3-post2`)*

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
