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
├── _assets/                  # committed — shared show music, reused per episode
│   ├── intro.mp3             # ~10s, fades out last 2s
│   ├── outro.mp3             # ~8s, fades out at end
│   ├── stinger.mp3           # ~2s, chapter/segment transition
│   ├── bed-thoughtful.mp3    # ~20s, reflective segment underscore
│   ├── bed-energetic.mp3     # ~20s, energetic segment underscore
│   └── intro-alt-acoustic.mp3 # ~10s, acoustic alternative intro
└── <series-slug>/
    ├── ep-NN-source.md       # committed — NotebookLM source upload
    ├── ep-NN-focus.txt       # committed — NotebookLM focus prompt
    ├── ep-NN-dialogue.md     # committed — ElevenLabs two-host script (optional path)
    ├── ep-NN-dialogue.json   # committed — generated API-body snapshot
    ├── ep-NN-raw.{m4a,mp3}   # gitignored — voice-gen output (NotebookLM or ElevenLabs)
    ├── ep-NN.mp3             # gitignored — final mix, uploaded to Releases
    ├── ep-NN.transcript.md   # committed — Whisper output (optional)
    └── ep-NN.json            # committed — metadata + sha256 + mix label
```

`finalize.sh` automatically detects `podcast/_assets/intro.mp3` and `outro.mp3`
and layers them with 1-second crossfades on either side of the dialogue. If
either is missing, it falls back to dialogue-only finalize so the existing
`ai-coding-setup` series keeps working untouched.

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

## ElevenLabs path (scripted two-host)

Use this when you want full editorial control over a short, scripted dialogue
— e.g. a workshop trailer — instead of letting NotebookLM improvise from an
essay. The author writes the script in markdown; a Node script compiles it to
the ElevenLabs Text-to-Dialogue API body and writes the MP3 directly.

```sh
# 1. Author the script: podcast/<series>/ep-<NN>-dialogue.md
#    Frontmatter: voices map (Name → voice_id) + model.
#    Body: `**Name:** line of dialogue`.

# 2. Dry-run: parse + emit the JSON snapshot, no API call, no credits spent.
ELEVENLABS_API_KEY=... pnpm podcast:dialogue greenfield 00 --dry-run

# 3. Cheap test render with eleven_turbo_v2_5 (overrides frontmatter model).
pnpm podcast:dialogue greenfield 00 --test

# 4. Full render with the model in frontmatter (default eleven_v3).
pnpm podcast:dialogue greenfield 01

# 5. Same finalize/publish as NotebookLM episodes (finalize auto-detects
#    .mp3/.m4a/.wav raw extension).
pnpm podcast:finalize greenfield 01
pnpm podcast:publish greenfield 01
```

Convention: `ep-00-dialogue.md` is the credit-cheap test (4–6 lines, turbo
model). `ep-01-dialogue.md` is the real trailer. Both `.md` and the generated
`-dialogue.json` are committed; the `-raw.mp3` is gitignored along with the
finalized `.mp3`.

Auth: export `ELEVENLABS_API_KEY` (from the dashboard's API Keys page). The
script exits non-zero without hitting the network if it's missing.

## Series with podcasts

| Series | Episodes | Status |
| --- | --- | --- |
| `ai-coding-setup` | 5 / 5 | complete |
| `greenfield` — Engineering, AI, and the businesses we build from scratch. Co-hosted with Eisha, from Kathmandu. | ep-01 scripted | pending render |
