---
title: "User Experience Fishbowl: The Whole Team Watches a Rep Prep for a Meeting"
date: "2021-03-12T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Meeting-prep tooling had been debated in the abstract for two quarters. Watching one rep actually prepare for a real call, live, in front of the whole team, ended the debate in twenty minutes."
tags: [liberating-structures, recap-crm]
series: ls-discovery
seriesOrder: 19
use_featured_image: false
---

Meeting-prep tooling had been a two-quarter-old debate that never seemed to actually resolve: should we build an auto-generated pre-meeting brief, or invest instead in making the deal timeline more scannable so reps could assemble their own picture faster, or something else entirely. Every planning session rehearsed the same positions, because everyone was arguing from a different mental model of what "preparing for a meeting" actually looks like, and nobody's mental model had been checked against a real rep doing it. We ended the debate with a **User Experience Fishbowl**: one rep, live, thirty minutes before an actual call, prepping in front of the whole team.

## The format

Fishbowl puts the real activity — here, a rep's genuine pre-meeting prep routine, unscripted, for a real upcoming call — in an inner circle with a facilitator, and seats everyone else in a silent outer ring, watching live and unedited. The debrief that follows starts with concrete, specific observations from multiple people before opening into broader discussion, which is what turns a shared viewing experience into a shared, actionable finding rather than just a shared memory.

What makes Fishbowl specifically suited to ending a long-running internal debate like ours is that it replaces competing *opinions* about what reps need with a *shared, lived observation* of what one rep actually does — and because the whole team watches simultaneously, the debrief starts from common ground instead of each side re-arguing its priors.

## What the room watched

A rep, thirty minutes before a real renewal call, walked through her prep live while eleven people — the same group that had been debating meeting-prep tooling for two quarters — watched silently.

She didn't open the deal page first. She opened the account's activity timeline and scrolled backward, fast, skimming — not reading closely — until she hit the most recent call note, then read that one closely. She said aloud, unprompted, "I just want to know what we talked about last time and whether anything's changed since." From there she jumped to email, searching the contact's name to check for anything sent since that last call that hadn't been logged as a CRM activity — and found one: an email from the prospect, three days earlier, asking a pricing question that a colleague had answered but never logged in the CRM at all. She flagged it out loud, slightly frustrated — "this is exactly the thing I always worry I'm missing" — then spent close to ninety seconds cross-referencing the deal's stated pricing tier against what her colleague's email had actually promised the prospect, to make sure she wouldn't contradict it on the call.

Watching that live, in real time, settled the two-quarter debate almost immediately, and not in the direction either camp had been arguing. The "auto-generated brief" camp had assumed the core need was *summarization* — condense a long history into a digestible paragraph. The "better timeline" camp had assumed the core need was *scanning speed* — make the existing history faster to skim. What the room actually watched was neither: her real bottleneck was a **completeness gap** — a real communication (the pricing email) had happened entirely outside the CRM's field of view, and no amount of better-summarized or better-scannable CRM history would ever surface something the CRM never captured in the first place. She wasn't slow at finding what was in the CRM; she was compensating, live, for a hole in what the CRM knew.

## What the debrief converged on

Several people in the outer circle had independently noticed the same moment — the email search, the "this is exactly what I always worry about" comment — which gave the finding real weight rather than resting on one observer's read. The debrief reframed the roadmap discussion entirely: instead of choosing between a summarization feature and a faster-scanning timeline, the team scoped a lighter-weight but more structurally important fix — a prompt, surfaced to any teammate who emails a contact already linked to an open deal, nudging them to log that email as a CRM activity in one click, closing the exact gap the room had just watched a rep manually and anxiously patch together in real time.

That's a meaningfully different feature than anything either side of the two-quarter debate had been proposing, and it came out of twenty minutes of live observation rather than another round of the same argument, because the observation replaced two competing *theories* about rep behavior with one *directly witnessed instance* of it.

## Why watching together ended an argument that talking hadn't

The two-quarter stalemate persisted because both camps were reasoning from plausible but untested assumptions about what reps actually needed, and neither side had direct evidence strong enough to change the other's mind — every planning meeting was, structurally, priors versus priors. A Fishbowl session replaces that with shared, simultaneous, unmediated evidence: everyone in the room watched the same real rep hit the same real gap at the same real moment, which collapsed the debate not because one side "won" but because the actual bottleneck turned out to be a third thing neither side had been debating at all.

## Failure modes and when to skip it

A single observed session resolved a genuine, long-running internal disagreement here, but it's worth being clear-eyed that one rep's prep routine is one data point — the completeness-gap finding was compelling enough, and specific enough, to act on directly, but a broader check (how often do reps encounter deal-relevant emails or messages that never made it into the CRM) is still worth doing before assuming the pattern holds at scale across the whole sales team.

The format also only works if the outer circle can actually stay silent through something as mundane-looking as a rep scrolling and searching — there's a temptation to treat quiet, unglamorous prep work as "nothing's happening yet" and start side conversations, which breaks the shared attention the debrief depends on. And Fishbowl isn't the right tool for settling a debate that's actually about strategy or trade-offs rather than about what users do — if the two camps had disagreed about which of two known needs to prioritize given limited engineering time, watching a rep prep wouldn't resolve that; it only resolves disagreements rooted in different, untested assumptions about actual behavior, which happened to be exactly what was going on here.
