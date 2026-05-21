---
title: "The React side: guest pages, search UI, and codegen'd types"
date: "2026-05-16T10:00:00+05:45"
excerpt: "A Vite + React SPA with three real pages — popular guests, guest detail, search — wired to FastAPI through codegen'd TypeScript types from a shared Pydantic schema. No UI framework, five components, type-safe end to end."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, react, typescript, vite, fastapi, podcast, monorepo, tanstack-query]
cover: "/images/blog/ai-podcast-index/react-frontend-for-podcast-index/cover.png"
thumb: "/images/blog/ai-podcast-index/react-frontend-for-podcast-index/thumb.png"
series: ai-podcast-index
seriesOrder: 7
use_featured_image: true
last_modified_at: "2026-05-16T10:00:00+05:45"
---

> Assumes you've read the [`uv-2026`](/technical-notes/why-uv-exists/) series for the toolchain and [`python-monorepo-2026`](/technical-notes/python-monorepo-with-uv-workspaces/) for the layout — though this post stands alone if you skim those concepts.

The previous post, [*Search without embeddings*](/technical-notes/search-without-embeddings/), gave us a working `/api/search` endpoint, a guests table with appearance counts, and a question-generator we haven't called from a UI yet. This post is the UI.

The whole frontend is deliberately small. Three pages, five components, one router, one data layer. No design system, no headless UI library, no SSR. This is a teaching artifact — every line is there to demonstrate the *seam* between the Python backend and the TypeScript frontend, not to be a portfolio piece.

The interesting bit isn't React. The interesting bit is that the moment you rename `guest_id` to `canonical_guest_id` in the Pydantic model on the backend, `pnpm tsc` fails in the browser package. That's the monorepo argument from [series 2 post 3](/technical-notes/sharing-types-pydantic-typescript/), now actually paying rent.

## The three pages

```
/                     popular guests landing (top 12 by appearance + recency)
/guests/:slug         guest detail (appearances, topics, quotes, "ask me anything")
/search               query input + clip results
```

That's it. No login, no settings page, no `/about`, no admin. If the answer to "should we add page X" isn't *"because the demo from post 1 said we would,"* the answer is no.

## Where the package lives

In our `uv` workspace monorepo, the frontend is a sibling of the Python packages:

```
ai-podcast-index/
├── packages/
│   ├── api/                # FastAPI
│   ├── enrich/             # extraction worker
│   ├── ingest/             # YouTube ingest
│   ├── llm-client/
│   ├── shared-schema/      # Pydantic models + generated TS
│   └── web/                # ← this post
└── pyproject.toml
```

`packages/web/` is a plain Vite project. It doesn't use `uv` for anything — it has its own `package.json` and is built with `pnpm`. The only thing tying it to the Python side is the generated `schema.ts` it imports from `packages/shared-schema/generated/schema.ts`, which (per series 2 post 3) is produced by running `task schema:codegen` whenever a Pydantic model changes.

```sh title="packages/web/package.json (excerpt)"
{
  "name": "@ai-podcast-index/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.59.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^6.0.5"
  }
}
```

Three runtime deps — React, the router, TanStack Query. That's the whole stack on the browser side.

## The Vite proxy

The single most useful 12 lines in the frontend project:

```ts title="packages/web/vite.config.ts"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: false,
      },
    },
  },
});
```

`task dev` starts FastAPI on `:8000` and Vite on `:5173`. The browser only ever talks to `:5173`. Any request to `/api/*` gets transparently forwarded to FastAPI. No CORS headers to wire up, no environment-specific base URLs, no auth proxy. In production this whole concern disappears because the app is local-only — the sequel-series can worry about deploy.

## The shared types boundary

`packages/shared-schema/` exports two artifacts: Pydantic models (consumed by FastAPI) and a generated `schema.ts` (consumed by the frontend). The pipeline is one Task command:

```sh
task schema:codegen
# 1. dumps Pydantic JSON Schema from packages/shared-schema/src/...
# 2. runs json-schema-to-typescript on the dump
# 3. writes packages/shared-schema/generated/schema.ts
```

What the frontend sees:

```ts title="packages/web/src/api/types.ts"
// Re-export the generated types under names that read well in components.
// The generated file is one big union; this module names the shapes we use.
export type {
  GuestSummary,
  GuestDetail,
  SearchResult,
  SearchResponse,
  QuestionSet,
  Question,
} from "@ai-podcast-index/shared-schema/generated/schema";
```

The pnpm workspace makes `@ai-podcast-index/shared-schema` resolvable from `packages/web/` without publishing anything. The path mapping lives in `tsconfig.json`:

```json title="packages/web/tsconfig.json (excerpt)"
{
  "compilerOptions": {
    "paths": {
      "@ai-podcast-index/shared-schema/*": ["../shared-schema/*"]
    }
  }
}
```

If a backend developer renames a Pydantic field, regenerates the schema, and pushes — the CI step that runs `pnpm -F web lint` (which is `tsc --noEmit`) fails until the frontend is updated. That is the failure mode you actually want. Drift gets caught at compile time, not at runtime when a card renders `undefined`.

## The data layer

Every endpoint gets exactly one hook. The hook is responsible for the fetch, the JSON parse, the type assertion, and nothing else. TanStack Query handles the caching, the retry, and the staleness.

```ts title="packages/web/src/api/hooks.ts"
import { useQuery, useMutation } from "@tanstack/react-query";
import type {
  GuestSummary,
  GuestDetail,
  SearchResponse,
  QuestionSet,
} from "./types";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function useGuests() {
  return useQuery({
    queryKey: ["guests"],
    queryFn: () => getJSON<GuestSummary[]>("/api/guests"),
    staleTime: 5 * 60_000,
  });
}

export function useGuest(slug: string) {
  return useQuery({
    queryKey: ["guest", slug],
    queryFn: () => getJSON<GuestDetail>(`/api/guests/${slug}`),
    staleTime: 5 * 60_000,
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () =>
      getJSON<SearchResponse>(
        `/api/search?q=${encodeURIComponent(query)}`,
      ),
    enabled: query.trim().length > 2,
    staleTime: 60_000,
  });
}

export function useGenerateQuestions(guestId: string) {
  return useMutation({
    mutationKey: ["generate-questions", guestId],
    mutationFn: () =>
      fetch(`/api/guests/${guestId}/questions`, { method: "POST" }).then(
        (r) => r.json() as Promise<QuestionSet>,
      ),
  });
}
```

`useSearch` is a `useQuery` with `enabled` gated on the query length — under three characters, no request fires. Above three, TanStack debounces effectively for free because every keystroke produces a new query key, but the in-flight ones get deduped. Good enough for a local app; if you wanted real input debouncing you'd add it in the search page with a `useDeferredValue`.

`useGenerateQuestions` is a `useMutation` because it isn't idempotent — the same guest can get a fresh set of questions each time you click. The button shows a loading state while the mutation is in flight.

## The router

`App.tsx` is the whole route tree. Five lines of routing, two providers wrapping it.

```tsx title="packages/web/src/App.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { GuestPage } from "./pages/GuestPage";
import { SearchPage } from "./pages/SearchPage";
import { SiteShell } from "./components/SiteShell";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SiteShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/guests/:slug" element={<GuestPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </SiteShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

`SiteShell` is just a header + main + footer wrapper. No nav-state, no theming, no auth context. Under 30 lines.

## The home page

```tsx title="packages/web/src/pages/HomePage.tsx"
import { Link } from "react-router-dom";
import { useGuests } from "../api/hooks";
import { GuestCard } from "../components/GuestCard";

export function HomePage() {
  const { data, isLoading, error } = useGuests();

  if (isLoading) return <p className="p-8">Loading guests…</p>;
  if (error) return <p className="p-8 text-red-600">{String(error)}</p>;
  if (!data) return null;

  return (
    <section className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-semibold mb-2">Recent guests</h1>
      <p className="text-slate-600 mb-8">
        The voices we've indexed across the channel, ranked by appearances
        and recency.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.slice(0, 12).map((g) => (
          <Link key={g.id} to={`/guests/${g.slug}`}>
            <GuestCard guest={g} />
          </Link>
        ))}
      </div>
    </section>
  );
}
```

The ranking happens server-side (the SQL from [post 8](/technical-notes/question-generator-and-shipping-locally/) — well, the one we're going to ship in post 8). The frontend trusts the order it gets.

## The guest detail page

This is where the demo from post 1 actually shows up: appearances list, topics, quotes, and the "generate questions" button.

```tsx title="packages/web/src/pages/GuestPage.tsx"
import { useParams } from "react-router-dom";
import { useGuest, useGenerateQuestions } from "../api/hooks";
import { QuestionList } from "../components/QuestionList";

export function GuestPage() {
  const { slug = "" } = useParams();
  const { data: guest, isLoading } = useGuest(slug);
  const questions = useGenerateQuestions(guest?.id ?? "");

  if (isLoading || !guest) return <p className="p-8">Loading…</p>;

  return (
    <article className="mx-auto max-w-3xl p-8 space-y-10">
      <header>
        <h1 className="text-3xl font-semibold">{guest.canonical_name}</h1>
        <p className="text-slate-600">
          {guest.role}
          {guest.company && ` · ${guest.company}`}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {guest.appearance_count} appearance
          {guest.appearance_count === 1 ? "" : "s"} ·
          last seen {new Date(guest.last_seen_at).toLocaleDateString()}
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-3">Appearances</h2>
        <ul className="space-y-2">
          {guest.appearances.map((a) => (
            <li key={a.video_id}>
              <a
                href={`https://youtu.be/${a.video_id}?t=${a.start_seconds}`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 hover:underline"
              >
                {a.episode_title}
              </a>{" "}
              <span className="text-slate-500 text-sm">
                · {new Date(a.published_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Topics covered</h2>
        <ul className="flex flex-wrap gap-2">
          {guest.topics.map((t) => (
            <li
              key={t.name}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm"
            >
              {t.name}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Notable quotes</h2>
        <ul className="space-y-3">
          {guest.quotes.slice(0, 5).map((q) => (
            <li
              key={q.id}
              className="border-l-4 border-slate-200 pl-4 italic text-slate-700"
            >
              "{q.text}"
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Questions for a return episode
        </h2>
        <button
          onClick={() => questions.mutate()}
          disabled={questions.isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {questions.isPending ? "Generating…" : "Generate 10 questions"}
        </button>
        {questions.data && (
          <QuestionList questions={questions.data.questions} />
        )}
      </section>
    </article>
  );
}
```

A few things worth pointing out:

- The `youtu.be` deep link with `?t=` is the same one [post 6](/technical-notes/search-without-embeddings/) generates server-side for search results. The frontend does not re-derive timestamps; the API hands them over already-computed.
- The "generate questions" button is a `useMutation`, not a `useQuery`, because clicking it twice should return *different* questions. The endpoint isn't cached. The mutation's `data` lives until the user navigates away.
- `QuestionList` (covered below) is the one component that renders the grounded-question tooltip from [post 8](/technical-notes/question-generator-and-shipping-locally/).

## The search page

```tsx title="packages/web/src/pages/SearchPage.tsx"
import { useState } from "react";
import { useSearch } from "../api/hooks";
import { ClipCard } from "../components/ClipCard";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const { data, isFetching } = useSearch(query);

  return (
    <section className="mx-auto max-w-3xl p-8">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Search clips
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='try "fundraising in Nepal"'
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          autoFocus
        />
      </label>

      {isFetching && (
        <p className="mt-4 text-sm text-slate-500">Searching…</p>
      )}

      <ul className="mt-8 space-y-4">
        {data?.results.map((r) => (
          <li key={r.clip_id}>
            <ClipCard result={r} />
          </li>
        ))}
      </ul>

      {data && data.results.length === 0 && query.length > 2 && (
        <p className="mt-8 text-slate-500">No clips matched. Try fewer words.</p>
      )}
    </section>
  );
}
```

State is the trivial controlled-input pattern. The hook's `enabled` gate means the input renders before any request fires, which keeps the page snappy on first paint. The `staleTime: 60_000` on `useSearch` means re-typing a previous query is free.

## The five components

That's the page list. The components are:

```
src/components/
├── SiteShell.tsx       header + main + footer
├── GuestCard.tsx       avatar-less card with name, role, appearance count
├── ClipCard.tsx        title, guest, snippet, "open at timestamp" button
├── QuestionList.tsx    numbered list with hover-tooltip showing the grounded quote
└── LoadingDots.tsx     three-dot pulse
```

`ClipCard` is the most interesting one because it's where the search result type lands in JSX. Worth showing in full:

```tsx title="packages/web/src/components/ClipCard.tsx"
import type { SearchResult } from "../api/types";

export function ClipCard({ result }: { result: SearchResult }) {
  const { episode_title, guest_name, snippet, video_id, start_seconds } =
    result;

  return (
    <article className="rounded-lg border border-slate-200 p-4 hover:border-slate-400">
      <header className="flex items-baseline justify-between gap-4 mb-2">
        <h3 className="font-medium">{episode_title}</h3>
        <span className="text-sm text-slate-500">{guest_name}</span>
      </header>
      <p className="text-slate-700 mb-3">"{snippet}"</p>
      <a
        href={`https://youtu.be/${video_id}?t=${start_seconds}`}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-sm font-medium text-sky-700 hover:underline"
      >
        Open at {formatTimestamp(start_seconds)} →
      </a>
    </article>
  );
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
```

`SearchResult` is imported from the generated schema. Its shape is whatever `packages/shared-schema/src/search.py` says it is — no manual duplication, no `interface` declaration on the TypeScript side, no praying that the field names match.

## Watching the type seam catch a rename

Here's the moment the monorepo earns its keep. Suppose the backend renames `snippet` to `snippet_text` (more descriptive, ostensibly clearer). The Pydantic model changes:

```diff
 class SearchResult(BaseModel):
     clip_id: str
     episode_title: str
     guest_name: str
-    snippet: str
+    snippet_text: str
     video_id: str
     start_seconds: int
```

A backend dev runs `task schema:codegen` to regenerate `schema.ts`, commits both files, and pushes. CI runs `pnpm -F web lint`, which is `tsc --noEmit`. It fails:

```
src/components/ClipCard.tsx:6:5 - error TS2339:
  Property 'snippet' does not exist on type 'SearchResult'.
  Did you mean 'snippet_text'?

6     const { episode_title, guest_name, snippet, video_id, start_seconds } =
                                          ~~~~~~~
```

The PR is blocked until ClipCard is updated. Compare with a typical Python/TS setup where the two sides talk over JSON and only meet at runtime: a rename like this lands silently, ships to production, and shows up as "card body is empty" in a bug report three weeks later. Worse, the front-end developer who eventually hits it has no idea the contract changed — they just see `undefined`.

This is *the* reason to put the frontend in the monorepo. Not bundle size, not deploy ergonomics — the fact that a Python rename can fail a TypeScript build.

## Dev workflow

```sh title="Taskfile.yml (excerpt)"
dev:
  desc: Run API + web with hot reload on both sides.
  cmds:
    - task: dev:api
    - task: dev:web
  deps: [schema:codegen]

dev:api:
  cmd: uv run --package api fastapi dev packages/api/src/api/main.py
  silent: true

dev:web:
  dir: packages/web
  cmd: pnpm dev
  silent: true
```

`task dev` is the everyday command. FastAPI watches `packages/api/`, Vite watches `packages/web/`. When you edit a Pydantic model in `packages/shared-schema/`, you'd want to add a `schema:codegen --watch` task — or just rerun `task schema:codegen` when you remember. For a local-first project, manual is fine.

## What's deliberately not here

- **No global state library.** TanStack Query *is* the state layer for server data. URL is the state layer for filters. `useState` covers the rest. Redux/Zustand would be 100% overhead.
- **No CSS-in-JS.** Tailwind classes, period.
- **No code splitting.** The whole SPA is one bundle. With three pages and zero npm bloat, the bundle is small enough that a single chunk is the right call. Code splitting before you can measure it costing you is premature.
- **No tests.** The frontend is thin enough that the TypeScript compiler is most of the testing budget. The high-value tests live on the Python side, where the search ranking and the extraction prompts actually decide what users see.
- **No streaming for the question generator.** A real streaming UI is a separate piece of UX work — a `ReadableStream`, a parser for SSE or chunked JSON, a renderer that grows the list incrementally. For v1, a 6-second loading state with `LoadingDots` is honest and ships.

## Series checkpoint

Where we are after seven posts:

- Episodes ingested with timed captions (post 2).
- Guests, topics, and quotes extracted and validated (post 3).
- Guests deduped across spellings (post 4).
- LLM calls routed through one swappable adapter (post 5).
- Clip search returning ranked, timestamped results (post 6).
- A UI that shows all of it to a human, with types that can't drift (this post).

The last piece is the capstone — the question generator that grounds each suggested question in something the guest actually said, plus the cron that keeps the whole thing fresh. That's [the next post](/technical-notes/question-generator-and-shipping-locally/).

*Previous in series: [Search without embeddings: Postgres tsvector, LLM rerank, and 30-second clips](/technical-notes/search-without-embeddings/).*

*Full source: https://github.com/poudelprakash/ai-podcast-index (tag `series3-post7`). This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/ai-podcast-index/react-frontend-for-podcast-index/cover.png
and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. An abstract
browser window framed minimally on the left, opening onto a translucent
horizontal seam that runs across the composition — the visual metaphor for a
typed contract between two systems. On the right side of the seam, a hint of
Python-shaped geometric forms (rounded, structural); on the left side, a hint
of React-shaped angular shards (sharper, faceted). The seam itself glows softly
with a single warm accent (amber or coral) where the two halves meet. Cool
slate and indigo backdrop with generous negative space. Geometric, slightly
isometric, calm composition. Matte finish, restrained palette, no neon, no UI
mockups, no code. Aspect ratios: 21:9 hero crop and 16:9 card crop of the same
composition.
-->
