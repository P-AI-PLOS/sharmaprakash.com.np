# Agent guide — podcast

The authoritative runbook is [`podcast/README.md`](../../podcast/README.md). Read
it before touching anything under `podcast/`, `scripts/podcast/`, or the podcast
UI components. This page is the agent-facing summary plus gotchas the runbook
doesn't spell out.

## Three production paths

| Path | When | Voice gen | Script |
| --- | --- | --- | --- |
| **NotebookLM** | Long deep-dive on an existing essay | NotebookLM Audio Overview (manual upload) | `scripts/podcast/bundle.mjs` builds the source bundle |
| **ElevenLabs dialogue** | Scripted two-host (trailers, workshop intros) | ElevenLabs Text-to-Dialogue | `scripts/podcast/dialogue.mjs` |
| **ElevenLabs monologue** | Solo narrated essay episode | ElevenLabs Text-to-Speech (single voice) | `scripts/podcast/monologue.mjs` |

All three converge on the same `finalize.sh` → `publish.sh` → `src/data/podcast.ts` tail.

## Where things live

- **Scripts:** `scripts/podcast/{bundle,dialogue,monologue}.mjs`, `scripts/podcast/{finalize,publish,transcribe}.sh`.
- **pnpm tasks:** `podcast:bundle | podcast:dialogue | podcast:monologue | podcast:finalize | podcast:publish`.
- **Per-series content:** `podcast/<series-slug>/ep-NN-*.{md,json,mp3}`. Layout in the README.
- **Shared show assets:** `podcast/_assets/{intro,outro,stinger,bed-*}.mp3` (committed; auto-layered by `finalize.sh`).
- **Episode registry:** `src/data/podcast.ts` — must be updated by hand after `publish.sh` prints the release URL.
- **UI:**
  - `src/components/blog/PodcastPlayer.astro` — inline player on post pages.
  - `src/components/chrome/PodcastDock.astro` — persistent mini-player wired into `SiteShell` via `transition:persist`; takes ownership of inline `<audio class="podcast-audio">` on first play.

## Authoring rules

- **Monologue / dialogue source frontmatter is load-bearing.** `voice.id`, `voice_settings`, and `model` drive the API body that gets snapshotted to `ep-NN-{monologue,dialogue}.json` (committed). The `.md` and `.json` belong in git; the `-raw.mp3` and final `.mp3` are gitignored — Releases is the storage.
- **ElevenLabs v3 inline tags** (`[excited]`, `[laughs]`, `[short pause]`) work in monologue body prose; paragraph breaks drive pacing.
- **Always dry-run first** (`--dry-run`) before spending credits. Use `--test` on dialogue for a turbo-model render. Convention: `ep-00-*` is the credit-cheap test.
- **`ELEVENLABS_API_KEY`** must be exported (or set in `.env`) for `dialogue` / `monologue`. The scripts exit non-zero without hitting the network if it's missing.
- **`gh release create` auth gotcha:** if the repo's read-only `GITHUB_TOKEN` is exported, `unset GITHUB_TOKEN` before `podcast:publish` so `gh` falls back to the keyring OAuth token. See README §"Auth gotcha".

## Registering an episode

After `publish.sh` prints the asset URL, add a `PodcastEpisode` entry to
`src/data/podcast.ts` with matching `series` + `order`. The homepage, series
index, and post detail pages light up automatically when a post's `series` +
`seriesOrder` frontmatter matches. No episode entry → no player on the page.

## Things to NOT do

- Don't commit `-raw.*` or final `.mp3` files — they live in GitHub Releases (see README §"Why Releases, not LFS").
- Don't hand-edit the generated `-monologue.json` / `-dialogue.json`; re-run the script.
- Don't break `podcast/<series>/ep-NN-*` naming — `finalize.sh` and `publish.sh` glob on it.
- Don't duplicate the `PodcastDock` into a page; it's mounted once in `SiteShell` and survives View Transitions via `transition:persist`.
