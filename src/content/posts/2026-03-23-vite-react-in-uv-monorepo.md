---
title: "A Vite + React SPA inside a uv monorepo: pnpm-workspace, dev proxy, shared types"
date: "2026-03-23T10:00:00+05:45"
excerpt: "Two workspace managers minding their own business — uv for Python, pnpm for JS, with a thin Taskfile on top so you never have to remember both."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [python, monorepo, uv, fastapi, react, vite, pnpm, typescript]
cover: "/images/blog/python-monorepo-2026/vite-react-in-uv-monorepo/cover.png"
thumb: "/images/blog/python-monorepo-2026/vite-react-in-uv-monorepo/thumb.png"
series: python-monorepo-2026
seriesOrder: 4
use_featured_image: true
last_modified_at: "2026-03-23T10:00:00+05:45"
---

> Builds on the [`uv-2026`](/technical-notes/why-uv-exists/) series — if you've never used `uv` workspaces, start there.

The previous post in this series ended at the seam: Pydantic models codegen'd to TypeScript, dropped into `packages/web/src/generated/`. That's the contract. This post is about the React app that consumes it — and how to wire it into the same repo without either side of the stack feeling like a tenant.

The trick isn't a clever monorepo tool. It's two workspace managers minding their own business: `uv` runs the Python side, `pnpm-workspace` runs the JS side, and a tiny `Taskfile.yml` on top means you never have to remember which is which.

## The two-workspace decision

`packages/web/` is a `pnpm` workspace member. That's non-negotiable — Vite, React, the codegen scripts, all of it lives in the JS ecosystem and needs `pnpm` to resolve.

`packages/web/` is *also* declared as a `uv` workspace member. That part is optional, and people split on it. I keep it in for one reason: when someone runs `uv tree` or `uv sync` at the repo root, the listing should reflect the whole repo, not just the Python half. An empty `pyproject.toml` for `web` is a one-time cost and saves a permanent "wait, is `web/` part of this repo or not?" question for every future contributor.

```toml title="packages/web/pyproject.toml"
[project]
name = "web"
version = "0.0.0"
description = "Frontend SPA — managed by pnpm, declared here for uv workspace visibility."
requires-python = ">=3.12"

[tool.uv]
package = false
```

`package = false` tells `uv` not to try to build it — it's a workspace member by name only.

The JS side is the one that does real work:

```yaml title="pnpm-workspace.yaml"
packages:
  - "packages/web"
```

Single-line `pnpm-workspace.yaml` is fine. If you grow a second JS package later (a shared UI kit, a Storybook host), add it then.

```json title="packages/web/package.json"
{
  "name": "@app/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "codegen": "json2ts ../shared-schema/schema.json src/generated/types.ts",
    "lint": "biome check ."
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.59.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "json-schema-to-typescript": "^15.0.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0"
  }
}
```

The `codegen` script is the load-bearing line. It reads the JSON Schema produced by `packages/shared-schema/scripts/emit_schema.py` (the [previous post](/technical-notes/pydantic-to-typescript-codegen/)) and writes `src/generated/types.ts`. Wire it into `postinstall` if you want it to run automatically on `pnpm install`; I leave it as an explicit `task codegen` because automatic codegen on install surprises people the first time they see an unrelated diff appear.

## Vite config — twelve lines, one trick

The whole config:

```ts title="packages/web/vite.config.ts"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});
```

`server.proxy` is the seam. In dev, the React app talks to `/api/...` and Vite forwards to the FastAPI server on `:8000`. No CORS, no environment-variable juggling between dev and prod — the same relative URLs work in both modes, because in prod they're served from the same origin (more on that below).

The `@` alias is convention from the broader Vite ecosystem. It means `import type { Guest } from "@/generated/types"` resolves to `packages/web/src/generated/types.ts` — which is exactly the file the codegen pipeline writes.

## Consuming the generated types

The point of the codegen pipeline is that this `import type` is a load-bearing line:

```tsx title="packages/web/src/features/guests/useGuests.ts"
import { useQuery } from "@tanstack/react-query";
import type { Guest } from "@/generated/types";

export function useGuests() {
  return useQuery<Guest[]>({
    queryKey: ["guests"],
    queryFn: async () => {
      const res = await fetch("/api/guests");
      if (!res.ok) throw new Error(`guests: ${res.status}`);
      return res.json();
    },
  });
}
```

The `<Guest[]>` annotation is the safety net. Rename `Guest.name` → `Guest.displayName` in the Pydantic model, regenerate, and every component that reads `guest.name` fails to compile. That's the whole reason you put up with the codegen pipeline.

A component built on top:

```tsx title="packages/web/src/features/guests/GuestList.tsx"
import { useGuests } from "./useGuests";

export function GuestList() {
  const { data, isPending, error } = useGuests();
  if (isPending) return <p>Loading…</p>;
  if (error) return <p>Failed to load guests.</p>;
  return (
    <ul>
      {data.map((g) => (
        <li key={g.id}>
          {g.displayName} — {g.episodeCount} episodes
        </li>
      ))}
    </ul>
  );
}
```

If `episodeCount` is renamed to `episodes_count` on the Python side and the TS file regenerated, `tsc -b` fails on this file. The whole point.

## Dev workflow: two terminals or one Taskfile

The honest version is two terminals:

```sh
# terminal 1 — FastAPI
uv run --package api uvicorn api.main:app --reload --port 8000

# terminal 2 — Vite
pnpm --filter @app/web dev
```

`uv run --package api` picks the right workspace member without `cd packages/api`. `pnpm --filter @app/web dev` does the same on the JS side. Both commands work from the repo root, which is the only place I ever want to be.

After about a week of remembering both, you write a Taskfile. Mine:

```yaml title="Taskfile.yml"
version: "3"

tasks:
  dev:
    desc: "Run FastAPI + Vite together with prefixed output."
    cmds:
      - |
        npx concurrently --kill-others --prefix-colors "auto" \
          --names "api,web" \
          "uv run --package api uvicorn api.main:app --reload --port 8000" \
          "pnpm --filter @app/web dev"

  codegen:
    desc: "Re-emit schema.json from Pydantic and regenerate TypeScript types."
    cmds:
      - uv run --package shared-schema python scripts/emit_schema.py
      - pnpm --filter @app/web codegen

  setup:
    desc: "Install everything a new contributor needs."
    cmds:
      - uv sync --all-packages
      - pnpm install
      - task: codegen
```

`task dev` is what I actually run. `concurrently` is npm and the JS side already has it via the workspace, so no extra system dep. If you'd rather not depend on `concurrently`, `task` itself can run cmds in parallel with `deps:` and `:parallel: true` — the syntax is uglier and the prefixed output is worse, so I default to `concurrently`. Pick whichever you'll actually look at every day.

`task codegen` is what gets run after touching `packages/shared-schema/`. CI runs the same task and then `git diff --exit-code` on `packages/web/src/generated/` — if you changed a Pydantic model without regenerating, the PR fails. That check belongs in the CI post (next in the series), but the local invocation is already this same one-liner.

## Build pipeline

`pnpm --filter @app/web build` runs `tsc -b` (type-checks the whole project graph, including the generated types) and then `vite build`, which writes `packages/web/dist/` — static HTML, hashed JS, hashed CSS. No surprises.

How you serve `dist/` is a per-project call. Two patterns:

**Option 1 — FastAPI mounts the static directory.** Good for the "teaching artifact" deployment where one container serves both the API and the SPA. The reference repo does this:

```python title="packages/api/src/api/main.py"
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# ... API routes registered here at /api/* ...

WEB_DIST = Path(__file__).resolve().parents[4] / "web" / "dist"
if WEB_DIST.exists():
    app.mount("/", StaticFiles(directory=WEB_DIST, html=True), name="web")
```

The `if WEB_DIST.exists()` guard means local dev (where you run Vite separately) doesn't break because `dist/` isn't built yet. `html=True` serves `index.html` for unknown paths, which is what an SPA wants.

**Option 2 — CDN / static host.** `dist/` goes to S3 + CloudFront, Vercel, Netlify, Cloudflare Pages, wherever. The API is a separate origin. You'll need CORS in FastAPI and an `apiBase` constant on the JS side instead of relying on relative paths. Worth it once the SPA has enough users that you want it cached at the edge; overkill before that.

I default to option 1 for the first six months of any project and graduate to option 2 only when traffic justifies it. You can swap between them without touching React code if your `fetch` calls are all relative.

## Anti-patterns

A short list of things that look reasonable and aren't.

- **Serving the React build through FastAPI's Jinja templating.** Once you do this, you've coupled your SPA to your server's templating engine for no benefit. The SPA wants `index.html` served raw. Use `StaticFiles`.
- **Hand-writing API types in the frontend.** You did all the work in post 3 to make this unnecessary. Resist. The first hand-written type is the one that drifts and bites.
- **Treating `packages/web/` as a separate repo accessed via `cd ../`.** If you find yourself doing this, you're not in a monorepo, you're in two repos that happen to share a parent directory. Either commit to the monorepo (one root, one Taskfile, both lockfiles at the top) or split the repos cleanly.
- **A second package manager for the JS side.** `pnpm-workspace` and `npm workspaces` and `yarn workspaces` all work; pick one and stop. The monorepo is already two ecosystems — don't make it three.
- **Letting Vite proxy production traffic.** `server.proxy` is a *dev* feature. If you're using it in production you've taken a wrong turn. Production goes through option 1 or option 2 above.

## What you have now

`packages/api/` runs on `:8000`. `packages/web/` runs on `:5173`, proxies `/api` to FastAPI, and imports its types from a file regenerated whenever the Pydantic models change. A new contributor runs `task setup` once and `task dev` thereafter. Two workspace managers, two lockfiles, one repo.

Next post closes the series: `Taskfile.yml` fully fleshed out, `ruff` and `mypy` shared across packages, GitHub Actions with selective testing based on which packages changed, and the schema-drift CI check that ties post 3 and post 4 together.

<!--
Full source: https://github.com/poudelprakash/clipdex — tags `series2-post4`
mark the state of the repo at this post.
-->

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/python-monorepo-2026/vite-react-in-uv-monorepo/cover.png
and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. Two parallel
architectural beams running side by side along the long axis of the composition
— one rendered in a cool slate-blue (Python side), one in a warmer amber-coral
(JavaScript side) — connected at regular intervals by slim perpendicular
crossbeams, suggesting a typed contract bridging two workspaces. Faint isometric
grid in the background. A single small node at one crossbeam glows brighter to
suggest a live dev proxy. Calm geometric composition, generous negative space,
matte finish, restrained palette, no neon. Aspect ratios: 21:9 hero crop and
16:9 card crop of the same composition.
-->
