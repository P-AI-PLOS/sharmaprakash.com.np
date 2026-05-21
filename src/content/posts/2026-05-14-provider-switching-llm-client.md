---
title: "Building a provider-switching LLM client: one interface, three providers, task-tier routing"
date: "2026-05-14T10:00:00+05:45"
excerpt: "A 60-line adapter package lets you swap Anthropic, OpenAI, and local Ollama via an env var, route cheap classification to Haiku and synthesis to Opus, and add prompt caching without touching call sites."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, claude, anthropic, openai, ollama, llm, podcast]
cover: "/images/blog/ai-podcast-index/provider-switching-llm-client/cover.png"
thumb: "/images/blog/ai-podcast-index/provider-switching-llm-client/thumb.png"
series: ai-podcast-index
seriesOrder: 5
use_featured_image: true
last_modified_at: "2026-05-14T10:00:00+05:45"
---

> **Prerequisites.** This series assumes you've read [uv: why it exists](/technical-notes/why-uv-exists/) (for the toolchain) and [Python Monorepos in 2026](/technical-notes/python-monorepo-2026-overview/) (for the workspace layout). Each post stands alone if you're comfortable skimming those concepts.

The previous post, *"Entity resolution for guests: fuzzy matching first, LLM disambiguation second"*, ended with a Claude call hidden behind one function. This post is about that function — and the package it lives in.

By the end of post 4 we had three different places in the codebase calling an LLM: structured extraction in `enrich`, binary classification on intro segments, and guest disambiguation. Three call sites, three different prompts, three different token budgets — but all of them want the same shape of thing: *"send this prompt, get back either text or a typed object, ideally cheaply."*

That shape is the whole interface. The rest of this post is the adapter package that makes it real, and the three concrete adapters behind it.

## What we are not building

I want to be specific about what this package isn't, because LLM client libraries tend to accrete features until you need a wiki to find the prompt:

- **No token counting.** Every SDK returns usage on the response. Read it there.
- **No streaming.** Ingest and enrichment are batch jobs. We don't need partial tokens.
- **No multi-modal.** Transcripts are text. If we ever need images, that's a different interface.
- **No retry-with-exponential-backoff middleware.** The SDKs already retry transient errors. We retry on `pydantic.ValidationError` (see post 3) and that's it.
- **No LangChain.** This is sixty lines of code. You will read every line. There is no abstraction tax.

What we *are* building is a single async function with a tier dial and an optional schema. Three adapters implement it. One env var picks which adapter the rest of the codebase sees.

## The interface

The whole package surface is one function and one enum. Everything else is an implementation detail.

```python title="packages/llm-client/src/llm_client/__init__.py"
from __future__ import annotations

import os
from typing import Literal, TypeVar

from pydantic import BaseModel

from .types import Message
from .adapters.anthropic import AnthropicAdapter
from .adapters.openai import OpenAIAdapter
from .adapters.ollama import OllamaAdapter
from .adapters.fake import FakeAdapter

Tier = Literal["cheap", "smart"]
T = TypeVar("T", bound=BaseModel)

_ADAPTERS = {
    "anthropic": AnthropicAdapter,
    "openai": OpenAIAdapter,
    "ollama": OllamaAdapter,
    "fake": FakeAdapter,
}


def _resolve_adapter():
    name = os.environ.get("LLM_PROVIDER", "anthropic")
    if name not in _ADAPTERS:
        raise ValueError(
            f"Unknown LLM_PROVIDER={name!r}. Expected one of {list(_ADAPTERS)}."
        )
    return _ADAPTERS[name]()


_adapter = _resolve_adapter()


async def complete(
    *,
    system: str,
    messages: list[Message],
    schema: type[T] | None = None,
    tier: Tier = "smart",
    cache_system: bool = False,
    model: str | None = None,
) -> T | str:
    """Send a prompt; get back text, or an instance of ``schema`` if provided."""
    return await _adapter.complete(
        system=system,
        messages=messages,
        schema=schema,
        tier=tier,
        cache_system=cache_system,
        model=model,
    )
```

That is the entire public API. `complete()` either returns a string or — if you passed `schema=SomeModel` — an instance of `SomeModel`. No `AIMessage` wrapper, no `HumanMessagePromptTemplate`, no `RunnableSequence`. The call site looks like the prompt.

The `Message` type is the only data class:

```python title="packages/llm-client/src/llm_client/types.py"
from typing import Literal

from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str
```

System prompts are kept separate from `messages` on purpose. Anthropic puts the system prompt in its own block. OpenAI puts it as the first message with `role="system"`. Ollama follows OpenAI's shape. Each adapter knows how to place it; the caller doesn't.

## Task-tier routing

Each adapter maps `tier="cheap"` and `tier="smart"` to a concrete model. Override per-call with the `model=` argument when you need a specific build.

```python title="packages/llm-client/src/llm_client/adapters/anthropic.py" {18-21}
from anthropic import AsyncAnthropic
from pydantic import BaseModel

from ..types import Message
from .base import AdapterBase, schema_to_anthropic_tool


class AnthropicAdapter(AdapterBase):
    def __init__(self) -> None:
        self._client = AsyncAnthropic()

    async def complete(
        self,
        *,
        system: str,
        messages: list[Message],
        schema: type[BaseModel] | None,
        tier: str,
        cache_system: bool,
        model: str | None,
    ) -> BaseModel | str:
        chosen = model or {"cheap": "claude-haiku-4-5", "smart": "claude-opus-4-7"}[tier]

        system_blocks: list[dict] = [{"type": "text", "text": system}]
        if cache_system:
            system_blocks[0]["cache_control"] = {"type": "ephemeral"}

        kwargs: dict = {
            "model": chosen,
            "max_tokens": 4096,
            "system": system_blocks,
            "messages": [m.model_dump() for m in messages],
        }
        if schema is not None:
            tool = schema_to_anthropic_tool(schema)
            kwargs["tools"] = [tool]
            kwargs["tool_choice"] = {"type": "tool", "name": tool["name"]}

        resp = await self._client.messages.create(**kwargs)

        if schema is None:
            return "".join(b.text for b in resp.content if b.type == "text")

        for block in resp.content:
            if block.type == "tool_use":
                return schema.model_validate(block.input)
        raise RuntimeError("model did not return a tool_use block for the schema")
```

The OpenAI adapter is similar in shape — it maps the tier to `gpt-4o-mini` / `gpt-4o`, places the system prompt as the first message with `role="system"`, and passes `response_format={"type": "json_schema", "json_schema": {...}}` when a schema is provided. The Ollama adapter maps to `llama3.2:3b` / `llama3.2:70b` (override these to whatever you actually have pulled locally), uses the same OpenAI-style chat endpoint, and sets `format="json"` for schema requests.

The benefit of the tier dial is that the call site says *what kind of thing* the work is, not *which model*. Calls in `enrich` look like this:

```python title="packages/enrich/src/enrich/intro_classifier.py" {7}
async def is_guest_intro(segment_text: str) -> bool:
    result = await complete(
        system=INTRO_CLASSIFIER_SYSTEM,
        messages=[Message(role="user", content=segment_text)],
        schema=IntroClassification,
        tier="cheap",
        cache_system=True,
    )
    return result.is_intro
```

The classifier is a binary decision over tens of thousands of segments at ingest. `tier="cheap"` plus a cached system prompt is the difference between a five-dollar enrichment run and a fifty-dollar one. Compare against the synthesis call from post 3:

```python title="packages/enrich/src/enrich/extract.py" {7}
async def extract_guests(transcript_window: str) -> list[GuestMention]:
    result = await complete(
        system=EXTRACTION_SYSTEM,
        messages=[Message(role="user", content=transcript_window)],
        schema=GuestExtraction,
        tier="smart",
        cache_system=True,
    )
    return result.guests
```

Same function. Same package. Different tier. The decision is local to the call site — the adapter does not get to override it.

## Prompt caching, and why it lives in the adapter

Anthropic's prompt caching needs `cache_control: {"type": "ephemeral"}` on the system block. OpenAI and Ollama don't have a per-call caching primitive in the same shape — OpenAI does automatic prefix caching for organizational traffic, Ollama caches locally by default.

The right place for this is the adapter, not the call site. Callers should say *"this system prompt is reused"*, not *"add cache_control to the system block"*. The Anthropic adapter has the only real implementation; the others accept the flag and ignore it.

You can see the savings in the response metadata. For the structured-extraction prompt from post 3, the system block is ~1,800 tokens of schema + instructions. First call:

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

Each provider has its own preferred way to nudge a model into returning structured JSON. The adapter hides the difference, but it's worth seeing what `schema=GuestExtraction` actually becomes in each one.

**Anthropic** converts the Pydantic schema into a tool definition and forces the model to call it:

```python title="packages/llm-client/src/llm_client/adapters/base.py" {3-9}
def schema_to_anthropic_tool(schema: type[BaseModel]) -> dict:
    return {
        "name": schema.__name__.lower(),
        "description": schema.__doc__ or f"Structured output for {schema.__name__}.",
        "input_schema": schema.model_json_schema(),
    }
```

**OpenAI** uses native structured outputs via `response_format`:

```python
kwargs["response_format"] = {
    "type": "json_schema",
    "json_schema": {
        "name": schema.__name__,
        "schema": schema.model_json_schema(),
        "strict": True,
    },
}
```

**Ollama** turns on JSON mode and includes the schema inline in the system prompt — Ollama's `format=json` enforces well-formed JSON but does not enforce the schema, so we validate with Pydantic after and retry once on `ValidationError`. The retry logic itself lives in `enrich`, not in the adapter, because the *recovery* (append the validation error to the prompt) is a prompt-engineering decision, not a transport decision.

## Testing without the network

Every test in `enrich/` runs against a fake adapter. No mocks, no recorded HTTP fixtures, no `aiohttp` patching. Just one more adapter that returns whatever you've queued up.

```python title="packages/llm-client/src/llm_client/adapters/fake.py"
from collections import deque
from pydantic import BaseModel

from ..types import Message


class FakeAdapter:
    def __init__(self) -> None:
        self._responses: deque[BaseModel | str] = deque()
        self.calls: list[dict] = []

    def queue(self, response: BaseModel | str) -> None:
        self._responses.append(response)

    async def complete(
        self,
        *,
        system: str,
        messages: list[Message],
        schema: type[BaseModel] | None,
        tier: str,
        cache_system: bool,
        model: str | None,
    ) -> BaseModel | str:
        self.calls.append(
            {"system": system, "messages": messages, "schema": schema, "tier": tier}
        )
        if not self._responses:
            raise RuntimeError("FakeAdapter has no queued responses")
        return self._responses.popleft()
```

Tests look like this:

```python title="packages/enrich/tests/test_intro_classifier.py"
import pytest
from llm_client.adapters.fake import FakeAdapter
from llm_client import _adapter as live_adapter
from enrich.intro_classifier import is_guest_intro
from enrich.schemas import IntroClassification


@pytest.fixture
def fake(monkeypatch):
    fake = FakeAdapter()
    monkeypatch.setattr("llm_client._adapter", fake)
    yield fake


async def test_returns_true_when_model_says_intro(fake):
    fake.queue(IntroClassification(is_intro=True, confidence=0.92))
    assert await is_guest_intro("Today I'm joined by ...") is True
    assert fake.calls[0]["tier"] == "cheap"
```

Three things to notice. First: the test asserts on `tier="cheap"` — that's a real correctness property, not an implementation detail, because routing the classifier to a smart model would cost ten times as much. Second: there is no network. Third: the test runs in under 5ms.

## What this earns

We started this post with three call sites that all wanted the same thing. We end it with one function, one env var, three adapters, and a fake for tests. That gives us:

- **Provider freedom.** Set `LLM_PROVIDER=ollama` and run the enrichment pipeline offline on a laptop. Set it back to `anthropic` to get production-quality extraction. The rest of the codebase doesn't notice.
- **A tier dial at every call site.** Cheap for binary classification, smart for synthesis. The decision sits next to the prompt, where the person writing the prompt can reason about it.
- **One place to add prompt caching.** When we discover later that the search-rerank prompt (next post) is also cacheable, we flip one flag at one call site.
- **Tests that don't need API keys.** CI runs in seconds.

Sixty lines plus three adapters. No framework.

Next post: *"Search without embeddings: Postgres `tsvector`, LLM rerank, and 30-second clips"* — where the rerank call is one more `complete()` invocation with `tier="smart"` and `cache_system=True`, and the cost graph from this post is exactly why.

---

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

*Full source: https://github.com/poudelprakash/ai-podcast-index (tag `series3-post5`)*

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
