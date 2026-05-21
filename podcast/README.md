# Podcast runbook

One podcast per essay series. Audio lives in GitHub Releases (free, unlimited
for public repos). Transcripts and metadata live in git. NotebookLM does the
voice generation — the rest is scripted.

## Per-episode flow

```sh
# 1. Build the NotebookLM source from a post in the series
pnpm podcast:bundle ai-coding-setup 1
# → writes podcast/ai-coding-setup/ep-01-source.md

# 2. Manual: upload ep-01-source.md to https://notebooklm.google.com as the
#    only source. Generate Audio Overview → Customize → Deep Dive, Long.
#    Paste the contents of ep-01-focus.txt into the "What should the AI
#    hosts focus on" box (it's generated per-episode from the post excerpt).
#    Download the .m4a, save as podcast/ai-coding-setup/ep-01-raw.m4a.

# 3. Normalize loudness, transcode to MP3, write metadata json
pnpm podcast:finalize ai-coding-setup 01

# 4. Upload MP3 as a GitHub Release asset and print the public URL
pnpm podcast:publish ai-coding-setup 01

# 5. Manual: copy the asset URL + duration into src/data/podcast.ts as a new
#    PodcastEpisode entry. The homepage / series index / post detail pages
#    light up automatically when series + seriesOrder match a registered post.
```

## Layout

```
podcast/
└── <series-slug>/
    ├── ep-NN-source.md       # committed — NotebookLM source upload
    ├── ep-NN-focus.txt       # committed — NotebookLM focus prompt
    ├── ep-NN-raw.m4a         # gitignored — NotebookLM output
    ├── ep-NN.mp3             # gitignored — final, uploaded to Releases
    ├── ep-NN.transcript.md   # committed — Whisper output (optional)
    └── ep-NN.json            # committed — metadata + sha256
```

## Auth gotcha for `publish`

`gh release create` needs a token with `contents: write`. This repo's shell
exports a fine-grained `GITHUB_TOKEN` env var (read-only) that `gh` prefers
over its keyring credential. If publish fails with `HTTP 403: Resource not
accessible by personal access token`, unset it for that call:

```sh
unset GITHUB_TOKEN
pnpm podcast:publish ai-coding-setup 01
```

`gh auth status` should then show `Token: gho_…` (the keyring OAuth token,
which has full `repo` scope).

## Why Releases, not LFS

GitHub Releases give unlimited storage + bandwidth on public repos with a
2 GB-per-file cap. Git LFS, by contrast, is metered (1 GB free / month) even on
public repos. A 46-minute NotebookLM episode is ~31 MB MP3 — Releases are the
obvious fit.

## Series with podcasts

| Series | Episodes | Status |
| --- | --- | --- |
| `ai-coding-setup` | 5 / 5 | complete |
