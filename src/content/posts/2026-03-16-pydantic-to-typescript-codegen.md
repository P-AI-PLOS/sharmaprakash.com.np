---
title: "The killer monorepo argument: Pydantic models, codegen'd to TypeScript, consumed by React"
date: "2026-03-16T10:00:00+05:45"
excerpt: "A 20-line codegen pipeline turns Pydantic into JSON Schema into TypeScript. Rename a field on the backend and the frontend stops compiling. That's the whole point of a polyglot monorepo."
category: technical-notes
categories:
  - technical-notes
directory: technical-notes
tags:
  - python
  - monorepo
  - uv
  - pydantic
  - typescript
  - react
  - fastapi
cover: "/images/blog/python-monorepo-2026/pydantic-to-typescript-codegen/cover.png"
thumb: "/images/blog/python-monorepo-2026/pydantic-to-typescript-codegen/thumb.png"
use_featured_image: true
series: python-monorepo-2026
seriesOrder: 3
last_modified_at: "2026-03-16T10:00:00+05:45"
---

> Builds on the [`uv-2026`](/technical-notes/why-uv-exists/) series — if you've never used `uv` workspaces, start there. This post also assumes the package layout from [post 2](/technical-notes/uv-workspace-package-layout/): a `shared-schema` package that owns the domain models, and a `web` package that consumes them.

Every Python+React project has the same boundary, and most teams give up on it: the line where a `BaseModel` turns into JSON, crosses the wire, and is read by code that has no idea what shape the data was supposed to have. The frontend writes `interface Guest { ... }` by hand. Someone renames `display_name` to `name` on the backend. Nothing fails until a user clicks something.

The point of putting Python and React in the same repo is not to share a `.gitignore`. It's that **a schema change should break both sides at compile time**. Twenty lines of plumbing make that real.

## The pipeline, end to end

```
shared-schema (Pydantic)
    │
    │  model.model_json_schema()
    ▼
schema.json (JSON Schema, draft 2020-12)
    │
    │  json-schema-to-typescript
    ▼
types.ts (real TS types, exported)
    │
    │  import type { Guest } from "@/generated/types"
    ▼
React (typed useQuery, typed forms, typed everything)
```

Three stages, two of them you write once and forget. The Pydantic side runs in a `uv run` script; the TS side runs in a `pnpm` script. Neither side needs to know the other exists beyond the file on disk.

## Stage 1 — export the models

`shared-schema` exports its models from `__init__.py` so there's a single place to enumerate "what crosses the wire":

```python title="packages/shared-schema/src/shared_schema/__init__.py"
from shared_schema.guest import Guest, GuestRole
from shared_schema.episode import Episode, EpisodeStatus
from shared_schema.clip import Clip, ClipKind

__all__ = ["Guest", "GuestRole", "Episode", "EpisodeStatus", "Clip", "ClipKind"]
```

Then a tiny emitter that walks `__all__`, asks each model for its JSON Schema, and writes one combined file:

```python title="packages/shared-schema/scripts/emit_schema.py"
import json
from pathlib import Path
from pydantic import BaseModel
from pydantic.json_schema import models_json_schema

import shared_schema

OUT = Path(__file__).resolve().parents[3] / "web" / "src" / "generated" / "schema.json"

def main() -> None:
    models = [
        getattr(shared_schema, name)
        for name in shared_schema.__all__
        if isinstance(getattr(shared_schema, name), type)
        and issubclass(getattr(shared_schema, name), BaseModel)
    ]
    _, top = models_json_schema(
        [(m, "validation") for m in models],
        title="SharedSchema",
        ref_template="#/$defs/{model}",
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(top, indent=2, sort_keys=True) + "\n")

if __name__ == "__main__":
    main()
```

`models_json_schema` (not `model_json_schema` — note the plural) is the function you want when emitting more than one model. It de-duplicates shared `$defs`, which matters the moment two models reference the same nested type.

Run it directly through `uv` — no activation, no installs, no PATH games:

```sh
uv run --package shared-schema python scripts/emit_schema.py
```

The `--package shared-schema` flag tells `uv` to run inside that workspace member's environment. Drop it and `uv` falls back to the root, which usually still works but couples your script to the root's deps.

## Stage 2 — generate the TypeScript

`json-schema-to-typescript` is a 10-year-old npm package that does exactly one thing well. Install it as a dev dep of `web`, point it at the JSON file, and write a `.ts` file next to it:

```json title="packages/web/package.json"
{
  "name": "web",
  "private": true,
  "scripts": {
    "codegen": "json2ts -i src/generated/schema.json -o src/generated/types.ts --unreachableDefinitions",
    "predev": "pnpm codegen",
    "prebuild": "pnpm codegen"
  },
  "devDependencies": {
    "json-schema-to-typescript": "^15.0.0"
  }
}
```

Two things worth noting:

- `--unreachableDefinitions` tells `json2ts` to emit every `$def`, not just the ones reachable from the root. Without it, models you export but don't reference from another model silently disappear.
- `predev`/`prebuild` are pnpm lifecycle hooks. Anyone who runs `pnpm dev` or `pnpm build` regenerates types automatically; no one has to remember a separate command. The schema-drift check in CI (covered in post 5) catches the case where someone forgets to commit the regenerated file.

## Stage 3 — consume it

```tsx title="packages/web/src/routes/Guests.tsx"
import { useQuery } from "@tanstack/react-query";
import type { Guest } from "@/generated/types";

export function Guests() {
  const { data, isLoading } = useQuery<Guest[]>({
    queryKey: ["guests"],
    queryFn: () => fetch("/api/guests").then((r) => r.json()),
  });

  if (isLoading) return <p>Loading…</p>;
  return (
    <ul>
      {data?.map((g) => (
        <li key={g.id}>{g.display_name}</li>
      ))}
    </ul>
  );
}
```

The `<Guest[]>` annotation is what makes the rest of the file safe. Rename `display_name` to `name` in `shared_schema/guest.py`, rerun `uv run --package shared-schema python scripts/emit_schema.py`, and the next `pnpm dev` regenerates `types.ts` — at which point `g.display_name` is a TypeScript error, not a 4 AM Sentry alert.

That's the break-together property. It's the entire reason the monorepo is worth the inconvenience.

## The break-together property, demonstrated

Concretely, here's what happens when you rename `display_name → name`:

```diff title="packages/shared-schema/src/shared_schema/guest.py"
 class Guest(BaseModel):
     id: UUID
-    display_name: str
+    name: str
     role: GuestRole
```

```diff title="packages/web/src/generated/types.ts (regenerated)"
 export interface Guest {
   id: string;
-  display_name: string;
+  name: string;
   role: GuestRole;
 }
```

```text title="pnpm --filter web typecheck"
src/routes/Guests.tsx:14:33 - error TS2339: Property 'display_name' does not exist on type 'Guest'.
```

No browser. No refresh. No "I'll grep for it later." The compiler tells you which files to look at.

## Alternatives, one paragraph each

**`pydantic-to-typescript`** is a single-tool replacement for the whole pipeline. It works and the install is one line. The trade-off: less control over which models get exported, no JSON Schema intermediate to validate against at runtime, and you inherit whatever its author thinks is a sensible TS shape. Fine for small apps; I outgrew it the first time I wanted a `$defs`-deduplicated schema for runtime validation.

**OpenAPI codegen via `openapi-typescript`** is the right answer if you already publish an OpenAPI spec from FastAPI for other consumers (a public SDK, an external partner, a Swagger UI you actually use). FastAPI emits the spec for free at `/openapi.json` and `openapi-typescript` turns it into types. The downside is you've tied your type story to your HTTP layer — internal Pydantic models that aren't part of any route don't get types. For a purely-internal monorepo, the JSON-Schema-from-Pydantic path is more direct.

**Hand-written types.** Don't. The whole point of this post is that the cost of "I'll just keep them in sync" compounds across every contributor who joins the project.

## Discriminated unions translate cleanly

Tagged unions are the place most codegen pipelines fall apart, because the TS side needs a literal `kind` field that narrows the type. Pydantic's discriminator support produces JSON Schema with a `discriminator` keyword, and `json-schema-to-typescript` understands it:

```python title="packages/shared-schema/src/shared_schema/clip.py"
from typing import Annotated, Literal, Union
from pydantic import BaseModel, Field

class QuoteClip(BaseModel):
    kind: Literal["quote"]
    text: str
    episode_id: str

class TopicClip(BaseModel):
    kind: Literal["topic"]
    topic: str
    episode_ids: list[str]

Clip = Annotated[Union[QuoteClip, TopicClip], Field(discriminator="kind")]
```

Round-trips to a real TS discriminated union:

```ts title="packages/web/src/generated/types.ts (excerpt)"
export type Clip = QuoteClip | TopicClip;

export interface QuoteClip {
  kind: "quote";
  text: string;
  episode_id: string;
}
export interface TopicClip {
  kind: "topic";
  topic: string;
  episode_ids: string[];
}
```

In the React code, `if (clip.kind === "quote")` narrows to `QuoteClip` with no casts. This is the bit you'd write five hundred lines of glue for, by hand, if you were doing types-by-feel.

## Gotchas worth knowing before you ship

**Dates serialize to strings.** `datetime` on the Python side becomes `string` on the TS side, because that's what JSON has. Plan for it: either parse to `Date` at the React Query boundary (a single `select` per query is enough), or leave them as strings and format with `date-fns`. Don't pretend the TS type is a `Date` when it isn't — the runtime will catch you.

**Prefer `Literal` to `Enum` for cross-language types.** `Literal["a", "b"]` codegens to `"a" | "b"` — a real string union in TS, narrowable by `===`. A Pydantic `StrEnum` codegens to a TS enum, which is a different ergonomic and a different bundle cost. Use `Enum` when you need behavior on the Python side; use `Literal` when you want a clean union on both sides.

**`Optional[X]` is not the same as `X | None` with a default.** In JSON Schema:

- `display_name: Optional[str]` (no default) emits a required field whose type is `string | null`.
- `display_name: Optional[str] = None` emits an optional field whose type is `string | null`.
- `display_name: str | None = None` is the same as the second.

`json-schema-to-typescript` faithfully respects the difference, which means your TS type will say `display_name: string | null` vs `display_name?: string | null` — and a code reviewer who doesn't know this will assume the first form is a mistake. Pick one convention per project and lint for it.

**Field aliasing.** `Field(alias="displayName")` will emit `displayName` in JSON Schema, which is what you want if the wire format is camelCase. Combine with `model_config = ConfigDict(populate_by_name=True)` so the Python side can still construct objects with `display_name=...`. Don't try to camelCase at the React Query boundary; codegen exists to remove exactly that kind of glue.

## What this unlocks

Once the pipeline exists, the things that were painful before become free:

- **Forms.** Generate a Zod schema from the same JSON Schema (`json-schema-to-zod`) and feed it to React Hook Form. The backend's validation rules are the frontend's validation rules.
- **Mock data.** `@faker-js/faker` with the generated types means your Storybook fixtures stop drifting from the API.
- **API client.** Wrap `fetch` in a tiny generic that takes `<TRequest, TResponse>` and you've written your client library in five lines.

None of this is novel — codegen-the-types is one of the oldest ideas in client-server work. What's new is that `uv` makes the Python side cheap enough (one workspace member, one script, no install ceremony) that the whole pipeline takes an afternoon to wire up, not a sprint. That's the leverage.

[Post 4](/technical-notes/vite-react-in-uv-monorepo/) puts the React side together: a Vite + pnpm-workspace setup that lives next to `shared-schema`, proxies `/api` to FastAPI in dev, and consumes everything you generated here without ceremony.

---

*Full source: [github.com/poudelprakash/ai-podcast-index](https://github.com/poudelprakash/ai-podcast-index) — tags `series2-post3` mark the state of the repo at this point. If the repo isn't public yet when you're reading this, treat the code blocks as illustrative — they're the layout once the decisions in posts 1 and 2 land.*

<!--
Codex image prompt (cover 21:9, thumb 16:9):

Editorial illustration of three nested rectangles representing a data
transformation pipeline. Left rectangle is warm amber with a stylized snake
silhouette (Pydantic); middle rectangle is neutral gray with abstract braces
and brackets (JSON Schema); right rectangle is cool blue with a TypeScript-
style angle bracket motif. Thin connecting arrows between them suggest
unidirectional flow. Composition is calm, geometric, slightly off-center.
No embedded text, no logos, no watermarks. Muted editorial palette.
-->
