---
title: "The Identifier That Made My Podcast Sound Russian"
date: "2026-05-23T20:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "I spent an evening shrinking ElevenLabs chunk size from 2500 characters down to 1000, convinced the model was choking on density. It wasn't. One camelCase identifier — appearing three times in a single paragraph — was making my voice clone drift into a Russian accent. A field note on debugging non-deterministic systems."
cover: "/images/blog/ai/identifier-that-spoke-russian.png"
thumb: "/images/blog/ai/identifier-that-spoke-russian.png"
last_modified_at: "2026-05-23T20:00:00+05:45"
use_featured_image: true
---

I'm recording a podcast. Single voice. Mine, cloned via ElevenLabs `eleven_v3`, fed paragraph by paragraph through a render script that chunks, calls the API, and stitches the MP3s back together.

Episode one, chunk four. I hit play.

A man with a faint but unmistakable Russian accent reads the opening of my essay about coding agents.

It is not me.

## The first theory

The script already had a defensive comment about this. eleven_v3 is the most expressive ElevenLabs model and the most drift-prone — feed it a chunk dense with technical syntax and it sometimes wanders into a foreign accent. The render script strips markdown backticks and replaces dots between word characters with spaces, so `crypto.randomUUID()` becomes the spoken phrase "crypto randomUUID". I had assumed that was enough.

The chunk was 967 characters. Well under the 2500-character limit I'd been using. But maybe density mattered more than length.

So I reduced the chunk limit. 2500 → 2000. Re-render. Same drift.

2000 → 1500. Re-render. Same drift.

1500 → 1000. Re-render. Same drift.

At each step I was pulling the chunk boundaries tighter, hoping the paragraph in question would land in a less crowded neighborhood, or that the surrounding context would calm the model down. It didn't. The chunk got shorter; the accent stayed.

## The second theory

I started thinking about the model.

`eleven_multilingual_v2` is the older, less expressive sibling — flatter delivery, no `[sighs]` tags, no emotional inflection — but it's much more stable on technical text. Switching the whole episode would cost me the expressiveness I liked everywhere else. Switching for one chunk meant flipping the frontmatter, rendering, and flipping it back. Workable but ugly.

I was about to do it anyway when I went back and actually read the chunk.

## What was actually in the chunk

Three sentences, near each other, with the same camelCase identifier in all three:

> Don't write `crypto.randomUUID()` — because we ship to enterprise customers on Safari builds older than my niece, and `randomUUID` is undefined in non-secure contexts...
>
> That last one. `crypto.randomUUID`. That actually happened.

After the script's existing cleanup, the spoken text contained the token "randomUUID" four times across one chunk. CamelCase. No spaces. Phonetically unlike anything a voice trained on natural English would have seen often.

The drift wasn't about density. It was about a specific token, repeated, that the model didn't know how to pronounce — and when it doesn't know, it reaches for the nearest phonetic shape it has, which apparently lives near Russian.

I removed one occurrence. Drift reduced but didn't disappear.

I removed the rest. Rephrased to "the browser's built-in UUID call" and "the UUID one." The same content, in spoken-English shape.

Clean read. My voice. No accent.

## The lesson

When a system is non-deterministic, "make the input smaller" is the move that feels like progress. You can always shrink something. Each shrink generates a new render, a new sample, a new chance the dice land differently. It feels like you're closing in.

You're not closing in. You're rolling more dice.

The closer-in move is: read the input. Find the specific thing the model can't handle, and remove it. Not "make the chunk smaller" — `remove the trigger`.

I almost solved this by switching models. That would have worked — v2 would have read "randomUUID" without drifting — but I'd have given up v3's expressiveness across the whole episode for one bad token in one chunk. The right fix was thirty seconds of rewriting in the source markdown.

There's a more general version of this, which is the version I want to remember:

When debugging stochastic systems, the seductive lever is the global knob — chunk size, temperature, model choice, stability. Those knobs are real and they work. But they obscure the local cause. Before you turn a knob, look at the input. The thing that broke is usually visible if you read for it.

The render script's comment had even told me this. *"eleven_v3 drifts into a Russian-sounding accent when a chunk is dense with code spans."* I read "dense" and reached for the chunk-size knob. The comment's actual claim was about `code spans` — specific tokens, not aggregate density. I'd skimmed past the noun.

CamelCase identifiers, in spoken-audio scripts, are a smell. If your TTS model is reading source code at you, it's going to find a way to be weird about it. Rephrase to English shape and the weirdness goes away.

That's it. That's the post.
