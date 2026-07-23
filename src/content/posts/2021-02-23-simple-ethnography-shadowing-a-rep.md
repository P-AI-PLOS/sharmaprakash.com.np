---
title: "Simple Ethnography: A Full Day Shadowing a Rep Through Their Pipeline"
date: "2021-02-23T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "We'd studied the CRM in isolated feature sessions for years. Shadowing one rep for a full day, watching every tool she actually touched, showed how small a fraction of her real workflow the CRM was — and where the real friction lived."
tags: [liberating-structures, recap-crm]
series: ls-discovery
seriesOrder: 14
use_featured_image: false
---

Every feature review we'd ever run on the CRM happened one feature at a time, in isolation — test the new deal-stage view, test the updated activity feed, test the redesigned dashboard. That's a sensible way to validate a specific change, and a poor way to understand what a rep's actual working day looks like, because a day is not a sequence of isolated feature encounters — it's a continuous, messy flow across our product, a calendar app, email, a couple of spreadsheets, and Slack, and the CRM is only one participant in that flow, not the whole stage. **Simple Ethnography** — quiet, structured observation in the real setting — was the way to see the whole day rather than another slice of one feature.

## The method, briefly

Pick a real setting where the behavior happens, observe without steering, and keep two disciplined columns: what you actually saw and heard, separate from what you think it means, plus a note for whatever surprised you. The value comes almost entirely from that discipline — an unstructured "sat with a rep for a day" observation tends to produce vague, interpretation-heavy notes; forcing the raw observation and the inference apart produces a debrief the team can actually argue about productively, because everyone can see which parts are fact and which are theory.

## What a full day actually looked like

We shadowed one mid-tenure rep for a full working day, remotely, with her consent and full transparency to anyone she spoke with.

**Observed:** Her morning started not in the CRM but in her calendar app, reviewing the day's meetings. Before her first call, she opened three things in sequence: the CRM deal page, a personal spreadsheet (not one we'd built or knew existed) tracking "things to remember per account" in free text, and her email inbox, scanning for the most recent thread with that prospect. During the call itself, she took notes in a physical notebook, not in the CRM. Only after the call — roughly fifteen to twenty minutes later, once she'd moved to her next task — did she open the CRM again to log a summary, at which point she also updated her personal spreadsheet with a couple of details that never made it into the CRM note at all.

**Interpreted:** The personal spreadsheet was doing real work our CRM should have been doing: capturing account-specific context in a form flexible and quick enough to actually use in the moment, which our structured note fields apparently weren't. The gap between the call ending and the CRM being updated (fifteen to twenty minutes, filled with other tasks) meant her CRM notes were reconstructed from memory and her notebook, not captured live — consistent with something we'd suspected but never watched directly. And the fact that some details landed in the spreadsheet but never in the CRM was, on its own, the most concrete finding of the day: there was a category of information she needed for her own workflow that she'd concluded, implicitly, wasn't worth the friction of putting into our tool.

**Surprise:** The biggest surprise wasn't the spreadsheet's existence — reps keeping personal trackers is an old story — it was *what kind of information* lived there versus in the CRM. The CRM held facts about the deal (stage, value, next step). Her spreadsheet held facts about the *person* — a throwaway comment a contact had made about their kid's soccer game, a note that a particular stakeholder always pushed back in meetings until given time to think overnight. Relationship texture, not deal mechanics. We'd built fields for the thing that was easy to structure (deal facts) and left the thing that actually seemed to drive her follow-up quality (relationship texture) with nowhere natural to live.

## What changed because we watched a whole day, not one feature

No single-feature test would have produced this, because the finding lives in the *gap between tools*, not inside any one screen. The fix that came out of it wasn't a bigger form with more structured fields — that would have repeated the original mistake, formalizing something that resists formalization. It was a single freeform "about them" note per contact, deliberately unstructured, positioned prominently on the contact page rather than buried in a custom-fields section, explicitly scoped for exactly the kind of texture we'd watched her keep in a spreadsheet instead. We also moved the CRM's mobile quick-note capture to work from the calendar view directly, shortening the gap between "call ends" and "note captured" by removing a navigation step, rather than trying to eliminate her notebook — which, watching her, was clearly still going to be part of her process regardless of what we built, and fighting that would have been a losing, unnecessary battle.

## Why a full day beats a feature session

Feature-by-feature testing answers "does this screen work." A full-day shadow answers a different question entirely: "where does our product sit in the actual, complete set of tools this person uses to do their job, and what's flowing across the seams between them." Those seams — the personal spreadsheet, the notebook, the fifteen-minute delay — are invisible to any test scoped to a single screen, because by definition a single-screen test starts and ends inside our product. The rep's actual day doesn't respect that boundary, and neither should the observation.

## Failure modes and when to skip it

A full-day shadow is a bigger ask than a normal usability session, and it needs real consent and comfort from the person being observed — a rep who feels surveilled rather than helped will behave differently, consciously or not, and the observation will reflect that self-consciousness rather than her genuine workflow. Be explicit up front about what's being observed and why, and be prepared to stop if it's clearly changing her behavior.

It's also a lot of observer time and attention for one data point, which means it's best used sparingly, for genuinely open questions ("what does a whole day actually look like") rather than routinely — running it every sprint would be expensive and would mostly reconfirm what's already known. And keep the observation-versus-interpretation discipline strict even under the volume of a full day; it's tempting, six hours in, to start writing conclusions instead of notes, and that's exactly when the method's value quietly erodes.
