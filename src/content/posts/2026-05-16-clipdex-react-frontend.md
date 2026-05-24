---
title: "The React side: guest pages, search UI, and codegen'd types"
date: "2026-05-16T10:00:00+05:45"
excerpt: "A Vite + React SPA with three real pages — popular guests, guest detail, search — wired to FastAPI through codegen'd TypeScript types from a shared Pydantic schema. No UI framework, three pages, type-safe end to end."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, react, typescript, vite, fastapi, podcast, monorepo, tanstack-query]
cover: "/images/blog/clipdex/clipdex-react-frontend/cover.png"
thumb: "/images/blog/clipdex/clipdex-react-frontend/thumb.png"
series: clipdex
seriesOrder: 7
use_featured_image: true
last_modified_at: "2026-05-16T10:00:00+05:45"
---

> Assumes you've read the [`uv-2026`](/technical-notes/why-uv-exists/) series for the toolchain and [`python-monorepo-2026`](/technical-notes/python-monorepo-with-uv-workspaces/) for the layout — though this post stands alone if you skim those concepts.

[The previous post](/technical-notes/search-without-embeddings/) gave us a working `/api/search` endpoint. This post is the UI that consumes it, plus the codegen pipeline that keeps the TypeScript types honest.

The brief is small on purpose: three routes (`/`, `/guests/:guestId`, `/search`), three TanStack Query hooks (`useGuests`, `useGuest`, `useSearch`) plus a fourth that teases [post 8](/technical-notes/question-generator-and-shipping-locally/) (`useGenerateQuestions`), no UI framework. We just want the API surface visible in a browser.

## Where the types come from

The whole frontend is keyed off the same Pydantic models the API serves. Adding a field to `GuestSummary` on the Python side and forgetting to update the TypeScript side is the entire failure mode we want to eliminate.

```python title="packages/shared-schema/src/clipdex_schema/api.py"
class GuestSummary(BaseModel):
    """Card on the home page."""
    id: str = Field(description="canonical guest UUID")
    canonical_name: str
    appearance_count: int = Field(ge=0)
    popularity: float = Field(default=0.0, description="appearance + recency score (post 8)")
```

`task codegen` walks every model we surface to the API, builds a single combined JSON Schema, and runs `json2ts` to produce `web/src/generated/schema.ts`:

```python title="packages/codegen/src/clipdex_codegen/__main__.py"
MODELS: list[type[BaseModel]] = [
    GuestSummary, Appearance, TopicMention, GuestQuote, GuestDetail,
    QuoteRef, Question, QuestionSet, ClipHit, SearchResponse,
]

def build_combined_schema() -> dict:
    definitions: dict[str, dict] = {}
    properties: dict[str, dict] = {}
    for cls in MODELS:
        schema = cls.model_json_schema(ref_template="#/definitions/{model}")
        for name, defn in (schema.pop("$defs", {}) or {}).items():
            definitions.setdefault(name, defn)
        definitions[cls.__name__] = schema
        properties[cls.__name__] = {"$ref": f"#/definitions/{cls.__name__}"}
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "ClipdexApi",
        "type": "object",
        "properties": properties,
        "additionalProperties": False,
        "definitions": definitions,
    }


def main() -> None:
    # ... write web/src/generated/schema.json
    cmd = [
        pnpm, "--dir", str(root / "web"), "exec", "json2ts",
        "-i", str(schema_path), "-o", str(ts_path),
        "--no-additionalProperties",
    ]
    subprocess.run(cmd, check=True, cwd=root)
```

About eighty lines. The TS emitter (`json-schema-to-typescript`) is a normal `pnpm` devDep in `web/`. There is no Pydantic-to-TypeScript library in the loop — JSON Schema is the contract, and it's a contract Pydantic already speaks fluently.

```yaml title="Taskfile.yml"
codegen:
  desc: Emit TS types from shared-schema for the web app.
  cmd: uv run --package clipdex-codegen python -m clipdex_codegen
```

`task codegen` outputs:

```
INFO wrote web/src/generated/schema.json (10 definitions)
INFO running: pnpm --dir /…/web exec json2ts -i schema.json -o schema.ts --no-additionalProperties
INFO wrote web/src/generated/schema.ts
```

The resulting `schema.ts` exports a named interface for every model:

```ts title="web/src/generated/schema.ts"
export interface GuestSummary { /* ... */ }
export interface Appearance   { /* ... */ }
export interface TopicMention { /* ... */ }
export interface GuestQuote   { /* ... */ }
export interface GuestDetail  { /* ... */ }
export interface QuoteRef     { /* ... */ }
export interface Question     { /* ... */ }
export interface QuestionSet  { /* ... */ }
export interface ClipHit      { /* ... */ }
export interface SearchResponse { /* ... */ }
```

That's the boundary. Frontend code never types an API response by hand — only by importing one of these.

## Hooks: one per endpoint

The data layer is a single file. TanStack Query keys, fetcher, and return types all live next to each other:

```ts title="web/src/hooks/api.ts"
import { useQuery, useMutation } from "@tanstack/react-query";
import type {
  GuestDetail, GuestSummary, QuestionSet, SearchResponse,
} from "../generated/schema";

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return (await r.json()) as T;
}

export function useGuests(limit = 12) {
  return useQuery<GuestSummary[]>({
    queryKey: ["guests", limit],
    queryFn: () => fetchJson<GuestSummary[]>(`/api/guests?limit=${limit}`),
  });
}

export function useGuest(guestId: string | undefined) {
  return useQuery<GuestDetail>({
    enabled: !!guestId,
    queryKey: ["guest", guestId],
    queryFn: () => fetchJson<GuestDetail>(`/api/guests/${guestId}`),
  });
}

export function useSearch(query: string) {
  return useQuery<SearchResponse>({
    enabled: query.trim().length > 0,
    queryKey: ["search", query],
    queryFn: () =>
      fetchJson<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}&n=10`),
  });
}

export function useGenerateQuestions(guestId: string | undefined) {
  return useMutation<QuestionSet, Error, void>({
    mutationFn: async () => {
      if (!guestId) throw new Error("guestId required");
      const r = await fetch(`/api/guests/${guestId}/questions`, { method: "POST" });
      if (!r.ok) throw new Error(`questions -> ${r.status}`);
      return (await r.json()) as QuestionSet;
    },
  });
}
```

`useGenerateQuestions` points at an endpoint that lands in [post 8](/technical-notes/question-generator-and-shipping-locally/); the hook is here so the UI shape can be settled now and the implementation slots in later. That's the kind of refactor that *requires* a typed contract — when the backend lands, the frontend either compiles or doesn't.

## Routes

```tsx title="web/src/App.tsx"
import { Route, Routes } from "react-router-dom";
import { GuestPage } from "./pages/GuestPage";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/guests/:guestId" element={<GuestPage />} />
      <Route path="/search" element={<Search />} />
    </Routes>
  );
}
```

`main.tsx` wraps everything in `BrowserRouter` and a `QueryClientProvider` and is otherwise the most boring Vite scaffolding you've ever read.

## The three pages

**Home** is a list of cards. `useGuests()` returns `GuestSummary[]` typed off the codegen output; rendering is a flex of `<Link>`s into the detail route:

```tsx title="web/src/pages/Home.tsx"
const { data } = useGuests(12);
// ...
<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
  {(data ?? []).map((g) => (
    <li key={g.id} className="rounded-md border border-zinc-200 p-3 hover:bg-zinc-50">
      <Link to={`/guests/${g.id}`} className="block">
        <div className="font-medium text-zinc-900">{g.canonical_name}</div>
        <div className="mt-1 text-xs text-zinc-500">
          {g.appearance_count} appearance{g.appearance_count === 1 ? "" : "s"}
        </div>
      </Link>
    </li>
  ))}
</ul>
```

**GuestPage** uses `useGuest(guestId)` for the body and `useGenerateQuestions(guestId)` for the button at the bottom. The mutation returns a `QuestionSet`, so the question list is type-checked against the same Pydantic shape the API will emit in post 8. Notable detail: each question's `grounded_in` is a list of `QuoteRef` — the UI renders each grounding quote as an inline link back to its source video.

**Search** is the simplest of the three. A draft input + submit form sets the query state; `useSearch(query)` issues the request when the user submits. Each result renders the FTS-and-reranked clip text plus a YouTube deep-link timestamp:

```tsx title="web/src/pages/Search.tsx"
<ul className="mt-6 space-y-4">
  {(data?.results ?? []).map((c) => (
    <li key={`${c.video_id}-${c.seq}`} className="rounded-md border border-zinc-200 p-4">
      <div className="text-xs text-zinc-500">
        {c.video_id} · {formatMs(c.start_ms)}–{formatMs(c.end_ms)}
      </div>
      <p className="mt-1 text-sm text-zinc-800">{c.text}</p>
      {c.rerank_rationale && (
        <p className="mt-2 text-xs italic text-zinc-500">{c.rerank_rationale}</p>
      )}
      <a className="mt-2 inline-block text-xs underline text-zinc-700"
         href={c.youtube_url} target="_blank" rel="noreferrer">
        open on YouTube at {Math.floor(c.start_ms / 1000)}s
      </a>
    </li>
  ))}
</ul>
```

Notice the absence of result-shape definitions — `c` is typed as `ClipHit` because `useSearch` returns `SearchResponse`. Nothing was retyped.

## Dev workflow

The Vite config proxies `/api/*` straight to FastAPI on `:8000`, so both servers run together under `task dev`:

```ts title="web/vite.config.ts"
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
});
```

```yaml title="Taskfile.yml"
dev:
  desc: Run API (:8000) and web (:5173) together.
  deps: [dev:api, dev:web]
```

Concretely:

```sh
$ task dev
# FastAPI on http://127.0.0.1:8000
# Vite on   http://127.0.0.1:5173
```

Hit `http://127.0.0.1:5173/` and you see the seven canonical guests we resolved from the in-flight backfill — Akit, Anup, Anupal Cha Chai, Dr. Sagar Aryal, Jason Adhikari, Nirajan Bamall, Pranab Lohani. Click one and you land at `/guests/<uuid>` with their appearances list, the topics extracted from their source video, and the top quotes. The "generate questions" button issues a `POST` to the endpoint we're about to build in the next post.

## What we deliberately didn't build

- **A UI framework.** Tailwind plus hand-rolled components beats wrestling a component library this early. Three pages, no design system. If the project survives, the design system follows the design — not the other way round.
- **Slug routing.** `/guests/<uuid>` is uglier than `/guests/akit`, but the canonical id never collides; slugs need a separate column and a slug-resolution route. Out of scope for v1.
- **A loading skeleton.** A plain `loading…` line is enough; TanStack Query's instant re-render on cache hits makes the perceived latency fine.
- **A guard against the `useGenerateQuestions` 404.** The button errors visibly until post 8 wires the endpoint. Better to ship the dead button and finish the loop than to gate it behind a feature flag.

## What's next

The frontend now visibly depends on one endpoint that doesn't exist yet: `POST /api/guests/:id/questions`. [Post 8](/technical-notes/question-generator-and-shipping-locally/) implements it as the grounded question generator, then closes the series with the cron, the backup task, and a closer paragraph.

---

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

*Full source: <https://github.com/poudelprakash/clipdex> (tag `series3-post7`)*

<!--
Codex image prompt (21:9 cover + 16:9 thumb):

Editorial header image, no embedded text, no logos. Visual metaphor for a
strongly-typed boundary: a thin, glowing horizontal channel — left half
warm-amber (Python / Pydantic), right half cool-teal (TypeScript / React) —
meeting at a precise vertical seam. Above the seam, a row of small abstract
"cards" representing guest entries floating across both halves; below, a
single "schema" ribbon stitching the two colors together. Calm, technical,
editorial. No characters, no UI mockup, no chips, no code.
-->
