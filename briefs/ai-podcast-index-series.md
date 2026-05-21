# Brief: `ai-podcast-index` blog series

An eight-part build-along: a locally-running tool that ingests a YouTube podcast channel's transcripts, extracts guests/topics with LLMs, lets you clip-search, and generates questions for future episodes. For `sharmaprakash.com.np`. Each post is fan-out-ready.

## Series-wide constraints

- **Slug**: `ai-podcast-index` (registered in `src/data/series.ts`).
- **Category**: `technical-notes` for every post.
- **Filename pattern**: `src/content/posts/YYYY-MM-DD-<slug>.md`. Consecutive weekly Tuesdays starting from the first unclaimed Tuesday after the latest 2026 post.
- **Required frontmatter**: `title`, `date`, `excerpt`, `category: technical-notes`, `directory: technical-notes` (**required — without it the post routes to `/<slug>/` instead of `/technical-notes/<slug>/` and breaks under the expected URL**), `tags: [ai, python, claude, fastapi, react, podcast, ...]`, `cover`, `thumb`, `series: ai-podcast-index`, `seriesOrder: N` (1–8), `use_featured_image: true`.
- **Images**: `public/images/blog/ai-podcast-index/<post-slug>/cover.png` and `thumb.png`. Codex prompt as HTML comment at bottom of each post.
- **Voice**: build-along, narrative, code-led. Show real terminal output where it earns its keep. Match existing post conventions.
- **Prerequisites callout** at the top of each post: "Assumes you've read `uv-2026` (for the toolchain) and `python-monorepo-2026` (for the layout) — though each post stands alone if you skim those concepts." Link to the first post of each prerequisite series.
- **Reference channel**: the YouTube channel @TheDoersglobal. Refer to it as "our reference channel" in prose so the series is dataset-agnostic; link to it once in post 1.
- **Reference repo**: `github.com/poudelprakash/ai-podcast-index` (URL placeholder — confirm before publishing). Each post should reference a git tag (`series3-post1`, `series3-post2`, ...) representing the repo's state at that post. If the repo doesn't exist yet, write code as illustrative and add an explicit footer: *"This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth."*
- **Scope discipline**: this is a *teaching artifact* — local-first, no deploy, no auth. Anything beyond local execution is a sequel-series hook, not in scope.
- **Cross-links**: each post links to the previous post by title. Final post teases the sequel (productizing, hosting, multi-user) without committing to writing it.

## Post 1 — The project: what we're building and the stack

**Working title**: *"Building an AI Podcast Index: the project, the stack, and what you'll have at the end"*

**Slug**: `ai-podcast-index-project-overview`

**Thesis**: Open with the demo. Then unpack the stack: `uv` workspaces, FastAPI, Vite + React, Postgres, a provider-switchable LLM client. Each piece justified in one paragraph against the alternative.

**Outline**:
- The "what you'll build" demo, written as a scene: open the local web app → search "fundraising in Nepal" → 8 clips returned with timestamps, click one → YouTube opens at the right second. Click a guest's name → their dedicated page with appearance count and prior topics. Click "generate questions for return episode" → 10 questions grounded in what they've already said.
- Architecture diagram (Mermaid in the post): `cron → ingest → transcripts table → enrich → guests/topics/quotes tables → api ← web`.
- The stack, one paragraph per choice and why-not-X:
  - `uv` workspaces (vs Poetry/raw venv)
  - FastAPI (vs Flask/Django)
  - Postgres + tsvector (vs SQLite/Elastic/embedding DB)
  - Vite + React SPA (vs Next.js — no SSR needed, simpler)
  - Anthropic SDK + provider-switchable wrapper (vs LangChain — see post 5)
  - `yt-dlp` + Whisper as fallback to YouTube Data API (TOS discussion — see post 2)
- What's *out of scope*: auth, hosting, multi-tenant, real-time updates, mobile.
- The repo: clone, `task setup`, `task dev` — first run in under 5 minutes if you have Postgres locally. Show the output.

## Post 2 — Ingesting YouTube transcripts honestly

**Working title**: *"Ingesting YouTube transcripts: the YT Data API path, with `yt-dlp` + Whisper as honest fallback"*

**Slug**: `ingesting-youtube-transcripts`

**Thesis**: Use YouTube's official Data API for channel metadata + auto-captions. Fall back to `yt-dlp` + local Whisper only when captions are missing. Document the TOS tradeoff up front.

**Outline**:
- The compliance call: YouTube Data API v3 is the right primary path. `yt-dlp` for audio extraction technically violates YT TOS — used here as a captions fallback, not a primary source. Note this honestly; don't pretend it doesn't matter.
- API setup: create a project in Google Cloud Console, enable YouTube Data API v3, get an API key, set `YOUTUBE_API_KEY` in `.env`. Show the curl that lists a channel's recent uploads.
- The ingest worker (`packages/ingest/`):
  1. Poll channel uploads playlist on a schedule.
  2. For each new video, fetch captions via the API. If present, parse the WebVTT into timed segments.
  3. If captions are missing, fall back to `yt-dlp` + `openai-whisper` (or `whisperx` for word-level timestamps) — covered with a code example using `uv tool install openai-whisper` (per series 1 post 5).
  4. Normalize segments into a `transcript_segments` table with `(episode_id, start_ms, end_ms, text)`.
- **Idempotency**: a `processed_videos` table with `(video_id, status, ingested_at)` so re-runs skip work. Crash mid-run = pick up where it stopped.
- **Storage**: Postgres for now (Postgres FTS in post 6); the schema as a Pydantic model in `packages/shared-schema/` per series 2 post 3.
- **Scheduling**: macOS `launchd` plist or Linux systemd timer running `task ingest`. Show one example.
- **Rate limits + quotas**: YT Data API has a daily quota. Track usage; back off; don't refresh the whole channel every hour.

## Post 3 — Structured extraction with Pydantic + Claude

**Working title**: *"Structured extraction with Pydantic + Claude: guests, topics, and quotes from raw transcripts"*

**Slug**: `structured-extraction-with-claude`

**Thesis**: Schema-first prompting + Pydantic validation = reliable JSON output. Use the cheap model for high-volume classification, the smart model for synthesis. Retry once with the validation error in the prompt.

**Outline**:
- The extraction targets (Pydantic models in `packages/shared-schema/`):
  - `GuestMention(name, role, company, confidence)`
  - `Topic(name, segment_ids, confidence)`
  - `Quote(text, segment_id, speaker, quotability_score)`
- The prompt pattern: system prompt with the JSON schema (`model.model_json_schema()`), user prompt with the transcript (or chunked transcript for long episodes), enforce JSON output via Anthropic's structured outputs or `tool_use`.
- **`instructor` vs hand-rolled**: brief comparison. Recommend hand-rolled for transparency in a teaching series, mention `instructor` for production.
- **Chunking long transcripts**: 60-min episode = ~10k tokens. Chunk by 5-minute windows with 30-second overlap, extract per chunk, merge.
- **Tiered routing**: Haiku for "is this a guest introduction segment?" binary classification (high volume, cheap), Sonnet for the actual extraction (lower volume, smarter). This is where post 5's LLM client earns its keep.
- **Retry on validation error**: catch `pydantic.ValidationError`, append the error to the prompt, retry once. Don't retry forever — log and move on after the second failure.
- **Prompt caching**: cache the system prompt (schema + instructions). Per Anthropic SDK, set `cache_control` on the system block. Huge savings at ingest scale.

## Post 4 — Entity resolution: who is this guest?

**Working title**: *"Entity resolution for guests: fuzzy matching first, LLM disambiguation second"*

**Slug**: `guest-entity-resolution`

**Thesis**: "Is this 'Bibhusan Bista' the same person as 'Bibhusan B.' from episode 12?" Don't ask the LLM first — try cheap deterministic matching, then escalate to the LLM only for ambiguous cases.

**Outline**:
- The dedup problem: same person, multiple spellings (initials, middle names, transliteration, typos). Without resolution, a guest who's been on 4 times shows up as 4 different people in the UI.
- **Stage 1 — deterministic match**: normalize (lowercase, strip whitespace, fold accents), exact match on normalized name + company. Catches ~70%.
- **Stage 2 — fuzzy match**: `rapidfuzz` token-set ratio on normalized name. Threshold 90+ = auto-merge. Threshold 70–89 = candidate for stage 3.
- **Stage 3 — LLM disambiguation**: send the candidate pair + their episode contexts to Claude with a yes/no/uncertain question. Cache the decision in a `guest_aliases` table so we don't ask twice.
- **Canonical IDs**: each guest gets a stable UUID; alias rows point to it. New mentions create new aliases, not new guests, when matched.
- **Manual override**: a `task guests:review` command that lists low-confidence merges in a tiny CLI for human approval. Cheap to build, huge for quality.
- **Schema**: `guests(id, canonical_name, normalized_name)`, `guest_aliases(id, guest_id, alias_name, source_video_id, confidence)`.
- **The split case**: what if you over-merged? An `unmerge` command that splits a guest based on a flagged alias.

## Post 5 — A provider-switching LLM client

**Working title**: *"Building a provider-switching LLM client: one interface, three providers, task-tier routing"*

**Slug**: `provider-switching-llm-client`

**Thesis**: A thin adapter package (`packages/llm-client/`) lets you swap Anthropic ↔ OpenAI ↔ local Ollama via env var, route classification tasks to cheap models and synthesis to smart ones, and add prompt caching without touching call sites.

**Outline**:
- The interface (`packages/llm-client/src/llm_client/__init__.py`):
  ```python
  async def complete(
      *, system: str, messages: list[Message],
      schema: type[BaseModel] | None = None,
      tier: Literal["cheap", "smart"] = "smart",
  ) -> BaseModel | str
  ```
- Why an interface, not LangChain: 60 lines of code, you understand every line, no abstraction tax.
- **Adapters**: `anthropic_adapter.py`, `openai_adapter.py`, `ollama_adapter.py`. Each implements the same `complete()`. Selected by `LLM_PROVIDER` env var.
- **Task-tier routing**: each adapter maps `tier="cheap"` and `tier="smart"` to a concrete model — `claude-haiku-4-5` vs `claude-opus-4-7` for Anthropic, `gpt-4o-mini` vs `gpt-4o` for OpenAI, `llama3.2:3b` vs `llama3.2:70b` for Ollama. Override per-call when needed.
- **Prompt caching** (Anthropic only): adapter wraps the system block with `cache_control: {"type": "ephemeral"}` when the caller passes `cache_system=True`. Show before/after token costs from the response metadata.
- **Structured output**: when `schema` is passed, the adapter converts it to the provider's preferred format — Anthropic `tool_use`, OpenAI `response_format: json_schema`, Ollama JSON mode.
- **Testing**: a `fake_adapter.py` for unit tests that returns pre-canned responses. The whole `enrich` package gets tested without a network call.
- **What we deliberately don't build**: token counting (use SDK metadata), streaming (not needed for batch ingest), multi-modal (out of scope).

## Post 6 — Search that doesn't need embeddings

**Working title**: *"Search without embeddings: Postgres `tsvector`, LLM rerank, and 30-second clips"*

**Slug**: `search-without-embeddings`

**Thesis**: For a corpus this size (hundreds of episodes, not millions of documents), Postgres full-text search with LLM rerank beats embedding-based RAG on both quality and operational simplicity. No vector DB, no embedding pipeline, no dimensionality hand-wringing.

**Outline**:
- The pitch: FTS gives you 95% recall cheaply. LLM rerank gives you precision. You don't need embeddings to ship a great search UX.
- **The FTS layer**: a `transcript_segments_search` materialized view with a `tsvector` column. Show the SQL: `to_tsvector('english', text)`, a GIN index, and a `websearch_to_tsquery` query for natural-language input.
- **The rerank pass**: top-50 from FTS → send to Claude with the user query + segment texts → return ranked top-10 with one-line justifications. Show the prompt.
- **Clip extraction**: each result is a single 1–10 second segment, but a *clip* is the surrounding 30–60 seconds of context. Build the clip by grabbing N segments before and after, capped at 60s total, snapped to sentence boundaries when possible.
- **YouTube deep links**: `https://youtu.be/<video_id>?t=<start_seconds>` — the timestamp lets the user jump straight to the clip.
- **Caching**: cache the rerank result by (query_hash, top_50_ids_hash) → reranked_ids in a `search_cache` table with a 7-day TTL. Repeat queries are instant.
- **Why not embeddings for v1**: cost (embedding every transcript at ingest), operational complexity (a vector DB or pgvector), and the honest reason — at this corpus size, FTS recall is great. Embeddings become worth it past tens of thousands of documents.
- **When to add embeddings**: a sequel-post hook. If the channel grows, layer pgvector on top — same Postgres, no new infra.

## Post 7 — The React side: guest pages and search UI

**Working title**: *"The React side: guest pages, search UI, and codegen'd types"*

**Slug**: `react-frontend-for-podcast-index`

**Thesis**: A Vite + React SPA with three real pages: home (popular guests), guest detail, and search. Codegen'd types from `shared-schema` make the API boundary type-safe end-to-end. No UI framework — just hand-rolled components and Tailwind.

**Outline**:
- The pages:
  - `/` — popular guests landing. Top 12 guests by appearance count + recency, each a card linking to detail.
  - `/guests/:slug` — guest detail. Appearances list (linkable to YouTube), topics covered across episodes, notable quotes, "generate questions for return episode" button.
  - `/search` — query input + results list. Each result is a clip card with title, guest, 30-60s text snippet, "open at timestamp" button.
- **Routing**: `react-router-dom`. Show the `App.tsx`.
- **Data fetching**: TanStack Query (`@tanstack/react-query`). One hook per endpoint: `useGuests()`, `useGuest(slug)`, `useSearch(query)`, `useGenerateQuestions(guestId)`.
- **Types**: every hook is typed off the generated `schema.json`. Show how a backend rename breaks the frontend compile (the killer monorepo argument from series 2 post 3 in action).
- **Question generator UI**: button → loading state → markdown list of 10 questions. Streaming optional (out of scope for v1).
- **Styling**: Tailwind, no UI framework. Keep it minimal — this is a teaching artifact, not a design portfolio. Five components total.
- **Dev workflow recap**: `task dev` runs FastAPI on `:8000` and Vite on `:5173`. Vite proxy forwards `/api/*` to FastAPI. Hot reload on both sides.

## Post 8 — Question generator and shipping it locally

**Working title**: *"The question generator, the cron job, and shipping it locally"*

**Slug**: `question-generator-and-shipping-locally`

**Thesis**: The capstone feature — grounded question generation — is one prompt away. Then wrap the whole project with a local cron so it ingests new episodes daily without intervention.

**Outline**:
- **The grounded prompt**: takes a guest ID, fetches all their prior segments + topics + quotes, builds a context window, asks Claude for 10 follow-up questions for a return episode. *Grounded* = each question references something the guest has previously said, so it can't be a generic "what's your origin story?"
- The prompt structure: system block (cached, since it's the same across guests) + user block (per-guest context). Show response token cost with vs without prompt caching.
- **Output shape**: Pydantic `QuestionSet(guest_id, generated_at, questions: list[Question])` where `Question(text, grounded_in: list[QuoteRef], rationale)`. The frontend renders the question with a tooltip showing what prior statement it builds on.
- **Cron / scheduling**: macOS `launchd` plist running `task ingest && task enrich` daily at 03:00. Linux `systemd` timer equivalent. Show both files.
- **Backups**: a `task backup` that `pg_dump`s to a local file. One line, but worth a paragraph because losing your enriched dataset would suck.
- **The "popular guests" landing**: SQL query — guests ranked by `(appearance_count * 0.7 + recency_score * 0.3)`. Memoize for an hour. Show the query.
- **What's next, if you wanted to productize this** (the sequel hook, not the plan):
  - Multi-channel ingest (currently single channel)
  - Auth + multi-user (currently single-user local)
  - Hosting (currently local-only)
  - Embeddings layer when the corpus outgrows FTS
  - A "this guest said something contradictory to episode X" alerting feature
- **Closer**: this whole thing was built on top of `uv` + `python-monorepo-2026`. Link both prerequisite series. Wrap with one paragraph on what you learned about Python + AI + monorepos by building it.

## Drafting checklist (per fan-out session)

Same as the earlier briefs — verify slug uniqueness, pick a date one week after the latest 2026 post, write full frontmatter, embed a Codex image prompt at the bottom, point `cover`/`thumb` at the eventual paths, run `pnpm check`, commit with `Add ai-podcast-index series post N: <title>`.

For code blocks: if the `ai-podcast-index` repo isn't yet public, present code as *what the file looks like at this point in the series*. Add a one-line footer per post: *"Full source: https://github.com/poudelprakash/ai-podcast-index (tag `series3-postN`)"*. The repo build is happening in parallel — code in the posts is the spec; the repo is the implementation.
