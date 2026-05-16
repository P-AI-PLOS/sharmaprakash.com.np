# Podcast runbook

One podcast per essay series. Audio lives in GitHub Releases (free, unlimited
for public repos). Transcripts and metadata live in git. NotebookLM does the
voice generation — the rest is scripted.

## Per-episode flow

```sh
# 1. Build the NotebookLM source from a post in the series
pnpm podcast:bundle ai-coding-setup 1
# → writes podcast/ai-coding-setup/ep-01-source.md

# 2. Manual: upload that single .md to https://notebooklm.google.com as the
#    only source. Generate Audio Overview → Customize → paste:
#
#      Two-host technical podcast for working developers. 10–14 minutes.
#      Cover the source in order. Close with one "try this tomorrow" takeaway.
#
#    Download the .wav (or .m4a). Save it as:
#      podcast/ai-coding-setup/ep-01-raw.wav
#    (Gitignored — never committed.)

# 3. (later) Normalize + transcode + transcribe
#    scripts/podcast/finalize.sh ai-coding-setup 01

# 4. (later) Publish as a GitHub Release asset
#    scripts/podcast/publish.sh ai-coding-setup 01
```

## Layout

```
podcast/
└── <series-slug>/
    ├── ep-NN-source.md       # committed — NotebookLM input
    ├── ep-NN-raw.wav         # gitignored — NotebookLM output
    ├── ep-NN.mp3             # gitignored — final, uploaded to Releases
    ├── ep-NN.transcript.md   # committed — Whisper output
    └── ep-NN.json            # committed — metadata + sha256
```

## Why Releases, not LFS

GitHub Releases give unlimited storage + bandwidth on public repos with a
2 GB-per-file cap. Git LFS, by contrast, is metered (1 GB free / month) even on
public repos. A 12-minute episode is ~10 MB MP3 — Releases are the obvious fit.

## Series with podcasts

| Series | Episodes | Status |
| --- | --- | --- |
| `ai-coding-setup` | 5 | planned (pilot) |
