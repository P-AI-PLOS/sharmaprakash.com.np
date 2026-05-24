---
title: "Building a provider-switching LLM client: one interface, three providers, task-tier routing"
date: "2026-05-14T10:00:00+05:45"
excerpt: "A small adapter package lets you swap Anthropic, OpenAI, and local Ollama via an env var, route cheap classification to Haiku and synthesis to Opus, and add prompt caching without touching call sites."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, claude, anthropic, openai, ollama, llm, podcast]
cover: "/images/blog/clipdex/provider-switching-llm-client/cover.png"
thumb: "/images/blog/clipdex/provider-switching-llm-client/thumb.png"
series: clipdex
seriesOrder: 5
use_featured_image: true
last_modified_at: "2026-05-14T10:00:00+05:45"
---

> **Prerequisites.** This series assumes you've read [uv: why it exists](/technical-notes/why-uv-exists/) (for the toolchain) and [Python Monorepos in 2026](/technical-notes/python-monorepo-2026-overview/) (for the workspace layout). Each post stands alone if you're comfortable skimming those concepts.

[The previous post](/technical-notes/guest-entity-resolution/) ended with a Claude call hidden behind one function. This post is about that function — and the package it lives in.

By the end of post 4 we had three places in the codebase calling an LLM: structured extraction in `enrich`, a chunk-level "is this worth extracting from?" triage, and the entity-resolution disambiguator. Three call sites, three different prompts, three different token budgets — but all of them want the same shape of thing: *"send this prompt, get back either text or a typed object, ideally cheaply."*

That shape is the whole interface. The rest of this post is the adapter package that makes it real, and the four concrete adapters behind it.

## What we are not building

I want to be specific about what this package isn't, because LLM client libraries tend to accrete features until you need a wiki to find the prompt:

- **No token counting.** Every SDK returns usage on the response. Read it there.
- **No streaming.** Ingest and enrichment are batch jobs. We don't need partial tokens.
- **No multi-modal.** Transcripts are text. If we ever need images, that's a different interface.
- **No retry-with-exponential-backoff middleware.** The SDKs already retry transient errors. The Anthropic adapter does a single retry on `pydantic.ValidationError` (the schema may have been violated); that's it.
- **No LangChain.** A few hundred lines across four adapters. You read every line. There is no abstraction tax.

What we *are* building is a single async function with a tier dial and an optional schema. Four adapters implement it. One env var picks which adapter the rest of the codebase sees.

## The interface

Everything users see lives in one tiny module:

```python title="packages/llm-client/src/llm_client/__init__.py"
from llm_client._interface import Message, Tier, complete, get_adapter, set_provider

__all__ = ["Message", "Tier", "complete", "get_adapter", "set_provider"]
```

`Message` is a `TypedDict` (no Pydantic model just for `{role, content}`), and `complete()` is the only function callers ever touch:

```python title="packages/llm-client/src/llm_client/_interface.py"
class Message(TypedDict):
    role: Literal["user", "assistant"]
    content: str


async def complete(
    *,
    system: str,
    messages: list[Message],
    schema: type[BaseModel] | None = None,
    tier: Tier = "smart",
    cache_system: bool = False,
    max_tokens: int = 1024,
) -> BaseModel | str:
    adapter = get_adapter()
    return await adapter.complete(
        system=system,
        messages=messages,
        schema=schema,
        tier=tier,
        cache_system=cache_system,
        max_tokens=max_tokens,
    )
```

That is the entire public API. `complete()` either returns a string or — if you passed `schema=SomeModel` — an instance of `SomeModel`. No `AIMessage` wrapper, no `HumanMessagePromptTemplate`, no `RunnableSequence`. The call site looks like the prompt.

System prompts are kept separate from `messages` on purpose. Anthropic puts the system prompt in its own block. OpenAI puts it as the first message with `role="system"`. Ollama follows OpenAI's shape. Each adapter knows how to place it; the caller doesn't.

Adapter selection runs once, lazily, off the env var:

```python title="packages/llm-client/src/llm_client/_interface.py"
def get_adapter() -> Adapter:
    global _current, _current_name
    desired = _current_name or os.getenv("LLM_PROVIDER", "anthropic").lower()
    if _current is None or (_current_name is None and _current.name != desired):
        _current = _build(desired)
        _current_name = None
    return _current


def _build(name: str) -> Adapter:
    if name == "anthropic":
        from llm_client.anthropic_adapter import AnthropicAdapter
        return AnthropicAdapter()
    if name == "openai":
        from llm_client.openai_adapter import OpenAIAdapter
        return OpenAIAdapter()
    if name == "ollama":
        from llm_client.ollama_adapter import OllamaAdapter
        return OllamaAdapter()
    if name == "fake":
        from llm_client.fake_adapter import FakeAdapter
        return FakeAdapter()
    raise ValueError(f"unknown LLM_PROVIDER={name!r}")
```

`set_provider("fake")` overrides the env var for the lifetime of the process — that's the test escape hatch.

## Task-tier routing

Each adapter maps `tier="cheap"` and `tier="smart"` to a concrete model. Defaults are sensible; override via env when you need to pin a specific build (`LLM_ANTHROPIC_SMART=claude-opus-4-7`, `LLM_OPENAI_CHEAP=gpt-4o-mini`, etc.).

```python title="packages/llm-client/src/llm_client/anthropic_adapter.py"
class AnthropicAdapter:
    name = "anthropic"

    def __init__(self, *, cheap=None, smart=None, api_key=None) -> None:
        from anthropic import AsyncAnthropic
        self._cheap = cheap or os.getenv("LLM_ANTHROPIC_CHEAP", "claude-haiku-4-5")
        self._smart = smart or os.getenv("LLM_ANTHROPIC_SMART", "claude-opus-4-7")
        self._client = AsyncAnthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))

    def _model_for(self, tier: "Tier") -> str:
        return self._cheap if tier == "cheap" else self._smart
```

The OpenAI adapter has the same shape, mapping the tier to `gpt-4o-mini` / `gpt-4o`. The Ollama adapter targets `llama3.2:3b` / `llama3.2:70b` (override to whatever you actually have pulled locally) and talks to the daemon over plain HTTP via `httpx`, so it doesn't drag in an SDK.

The benefit of the tier dial is that the call site says *what kind of thing* the work is, not *which model*. The chunk-level triage in `enrich` looks like this:

```python title="packages/enrich/src/clipdex_enrich/router.py"
from llm_client import complete

async def is_substantive(chunk_text: str) -> bool:
    text = await complete(
        system=(
            "Reply with exactly 'yes' or 'no'. "
            "Default to 'yes' unless the chunk is clearly worthless. ..."
        ),
        messages=[{"role": "user", "content": chunk_text}],
        tier="cheap",
        max_tokens=8,
    )
    if not isinstance(text, str):
        text = str(text)
    return text.strip().lower().startswith("y")
```

`tier="cheap"` plus an 8-token ceiling is the difference between a cheap classification pass and an expensive one. Compare against the synthesis call from post 3:

```python title="packages/enrich/src/clipdex_enrich/extract.py"
async def extract_chunk(chunk_text: str) -> Extraction:
    result = await complete(
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": chunk_text}],
        schema=Extraction,
        tier="smart",
        cache_system=True,
        max_tokens=4096,
    )
    assert isinstance(result, Extraction)
    return result
```

Same function. Same package. Different tier. The decision is local to the call site — the adapter does not get to override it.

## Prompt caching, and why it lives in the adapter

Anthropic's prompt caching needs `cache_control: {"type": "ephemeral"}` on the system block. OpenAI and Ollama don't have a per-call caching primitive in the same shape — OpenAI's prefix cache is automatic for organizational traffic, Ollama caches locally by default.

The right place for this is the adapter, not the call site. Callers should say *"this system prompt is reused"*, not *"add cache_control to the system block"*. The Anthropic adapter has the only real implementation; the others accept the flag and ignore it (with a `_ = cache_system` line, just so the linter and the reader both know it's deliberate):

```python title="packages/llm-client/src/llm_client/anthropic_adapter.py"
system_block: list[dict] = [{"type": "text", "text": system}]
if cache_system:
    system_block[0]["cache_control"] = {"type": "ephemeral"}
```

You can see the savings in the response metadata. For the structured-extraction prompt from post 3, the system block runs about 1,800 tokens of schema + instructions. First call:

```
usage: cache_creation_input_tokens=1813, cache_read_input_tokens=0,
       input_tokens=412, output_tokens=287
```

Every subsequent call within the cache window:

```
usage: cache_creation_input_tokens=0, cache_read_input_tokens=1813,
       input_tokens=412, output_tokens=295
```

Cached input is priced at about a tenth of fresh input. Across a 4,000-segment enrichment run, that's the difference between $0.40 and $4.00 just on the system prompt.

## Structured output, three ways

Each provider has its own preferred way to nudge a model into returning structured JSON. The adapter hides the difference, but it's worth seeing what `schema=Extraction` actually becomes in each one.

**Anthropic** converts the Pydantic schema into a single tool definition and forces the model to call it:

```python title="packages/llm-client/src/llm_client/anthropic_adapter.py"
tool = {
    "name": _TOOL_NAME,
    "description": "Record the structured response.",
    "input_schema": schema.model_json_schema(),
}
response = await self._client.messages.create(
    model=self._model_for(tier),
    max_tokens=max_tokens,
    system=system_block,
    tools=[tool],
    tool_choice={"type": "tool", "name": _TOOL_NAME},
    messages=messages,
)
```

If Pydantic validation fails on the first call, the adapter does one retry with the validation error appended to the user message. After that it raises — letting callers decide whether to fall back or surface the failure.

**OpenAI** uses native structured outputs via `response_format`:

```python title="packages/llm-client/src/llm_client/openai_adapter.py"
kwargs["response_format"] = {
    "type": "json_schema",
    "json_schema": {
        "name": schema.__name__,
        "schema": schema.model_json_schema(),
        "strict": False,
    },
}
```

**Ollama** flips on `format="json"` so the daemon emits well-formed JSON, and appends the schema to the system prompt because Ollama doesn't strictly enforce it server-side — Pydantic does the actual validation on the way out:

```python title="packages/llm-client/src/llm_client/ollama_adapter.py"
if schema is not None:
    payload["format"] = "json"
    payload["messages"][0]["content"] += (
        "\n\nReturn a single JSON object matching this schema:\n"
        + json.dumps(schema.model_json_schema())
    )
```

## Testing without the network

Every test that touches an LLM call site runs against a fake adapter. No HTTP mocks, no recorded fixtures, no monkeypatching of SDK internals. Just one more adapter that returns whatever you've queued up.

```python title="packages/llm-client/src/llm_client/fake_adapter.py"
Canned = str | dict | BaseModel | Callable[[dict], Any]
_responses: list[Canned] = []
_calls: list[dict] = []


def set_responses(responses: list[Canned]) -> None:
    """Replace the queue. Use at the start of each test."""
    _responses.clear()
    _responses.extend(responses)
    _calls.clear()


def calls() -> list[dict]:
    """Return the recorded call requests, oldest first."""
    return list(_calls)


class FakeAdapter:
    name = "fake"

    async def complete(self, *, system, messages, schema, tier,
                       cache_system, max_tokens) -> BaseModel | str:
        _calls.append({
            "system": system, "messages": list(messages),
            "schema": schema.__name__ if schema else None,
            "tier": tier, "cache_system": cache_system,
            "max_tokens": max_tokens,
        })
        raw = _responses.pop(0)
        if callable(raw) and not isinstance(raw, BaseModel):
            raw = raw(_calls[-1])
        # ... validates against schema if provided, else returns str
```

Tests then look like this:

```python title="packages/enrich/tests/test_extract_fake.py"
import pytest
import llm_client
from clipdex_enrich.extract import extract_chunk
from clipdex_schema import Extraction
from llm_client.fake_adapter import set_responses


@pytest.fixture(autouse=True)
def _use_fake():
    llm_client.set_provider("fake")


@pytest.mark.asyncio
async def test_extract_chunk_returns_validated_model():
    set_responses([{
        "guests": [{"name": "Bibhusan Bista", "role": "Co-founder",
                    "company": "Young Innovations", "confidence": 0.92}],
        "topics": [{"name": "fundraising in Nepal",
                    "segment_ids": [1, 2], "confidence": 0.8}],
        "quotes": [],
    }])
    out = await extract_chunk("[1] hello\n[2] world")
    assert isinstance(out, Extraction)
    assert out.guests[0].name == "Bibhusan Bista"
```

Two things to notice. First: the test calls the *real* `extract_chunk` — no monkeypatching inside `enrich`. Second: the test runs in under 5 ms and needs no API keys. The CI matrix for this package looks like one line.

## What this earns

We started this post with three call sites that all wanted the same thing. We end it with one function, one env var, four adapters, and a fake for tests. That gives us:

- **Provider freedom.** Set `LLM_PROVIDER=ollama` and run the enrichment pipeline offline on a laptop. Set it back to `anthropic` to get production-quality extraction. The rest of the codebase doesn't notice.
- **A tier dial at every call site.** Cheap for binary classification, smart for synthesis. The decision sits next to the prompt, where the person writing the prompt can reason about it.
- **One place to add prompt caching.** When the search-rerank prompt (next post) turns out to be cacheable too, we flip one flag at one call site.
- **Tests that don't need API keys.** Fourteen tests across `llm-client` and `enrich` run in under 250 ms.

Four adapters and a tiny interface module. No framework.

Next post: *"Search without embeddings: Postgres `tsvector`, LLM rerank, and 30-second clips"* — where the rerank call is one more `complete()` invocation with `tier="smart"` and `cache_system=True`, and the cost graph from this post is exactly why.

---

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

*Full source: <https://github.com/poudelprakash/clipdex> (tag `series3-post5`)*

<!--
Codex image prompt (21:9 cover + 16:9 thumb):

Editorial header image, no embedded text, no logos, no watermarks. Abstract
visual metaphor for a thin, unified adapter routing between three different
backends. Suggested composition: three distinct geometric "engines" — a warm
amber prism, a cool teal sphere, and a deep indigo cube — arranged in a row,
each connected to a single glowing horizontal channel running across the
foreground. Soft volumetric light, paper-grain texture, slightly desaturated
palette accented with a single warm amber highlight. Calm, technical, modern
editorial style. Avoid any literal depictions of code, chips, or robots.
-->
