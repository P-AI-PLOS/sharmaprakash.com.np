---
title: "Celebrity Interview: Putting a Power User on Stage in Front of the Product Team"
date: "2021-02-26T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "We'd read this power user's feedback in tickets for a year. Interviewing her live, in front of the whole product team, with a real audience and real follow-up questions, surfaced things a ticket never could — including how wrong we'd gotten her mental model."
tags: [liberating-structures, recap-crm]
series: ls-discovery
seriesOrder: 15
use_featured_image: false
---

She'd filed dozens of support tickets and feature requests over two years — sharp, specific, clearly the product of someone who'd pushed the CRM harder than almost any other customer we had. We knew her name, we knew her account, and we'd built a mental model of what she wanted almost entirely from text she'd typed into a form under time pressure, usually mid-frustration. That's a real but thin signal. **Celebrity Interview** is the Liberating Structure built to turn that thin signal into something much richer: a live, public interview with someone whose experience or expertise the room genuinely wants to hear, conducted in front of an audience who can ask their own follow-ups rather than reading a static summary secondhand.

## What it is and how it runs

Celebrity Interview stages an interview the way a talk-show format does — one "celebrity" (in our case, a customer, though the structure is equally built for internal experts) is interviewed on stage by a moderator in front of a live audience, with the audience itself invited to contribute questions partway through. The structure has real steps that keep it from becoming an unstructured Q&A: the group first generates candidate questions in small groups before the interview even starts, which surfaces what people genuinely want to know rather than leaving it to whatever the moderator happens to think of live. A moderator then runs the interview, working through the group's best questions plus their own follow-ups, with the celebrity given real room to tell stories, not just answer in one line. Partway through, the floor opens to direct audience questions.

The "celebrity" framing matters more than it sounds like it should — treating the interviewee as someone with expertise worth genuinely admiring, on a stage, changes the tenor of the conversation from "customer feedback session" (where the company is implicitly in the position of receiving complaints) to something closer to genuine curiosity about how an expert practitioner actually thinks, which tends to produce far more generous, detailed answers.

## Running it with our power user

We asked her, honestly, if she'd be willing to be interviewed live in front of our product and engineering teams about how she actually used the CRM day to day — framed explicitly as "you know things about running a sales pipeline that we want to learn from," not "help us fix your complaints." She said yes immediately, and it was clear from her tone that being asked this way, rather than being surveyed again, mattered.

The product team generated questions in small groups beforehand: how does she actually structure her pipeline stages versus our defaults, what does she do the CRM doesn't support at all, what's the first thing she does every morning. The interview itself, on stage, surfaced something none of her two years of tickets had ever contained: her single biggest daily workflow wasn't inside the CRM's pipeline view at all — it was a manual, personally-maintained ranking of her top fifteen deals that she re-sorted by hand every morning based on a gut sense of urgency that combined deal value, days since last contact, and a subjective read on stakeholder engagement that no single CRM field captured. Every feature request she'd ever filed, we realized live in the room, had been an attempt to get some *piece* of that manual ranking process supported by the tool — a better activity-recency sort here, a custom field there — without ever describing the ranking behavior itself, because from her side, it wasn't the "problem," it was just how she worked, and nobody had ever asked her to narrate her actual morning routine end to end.

The audience-question portion produced the other valuable moment: an engineer, not a PM, asked her directly why she never used our built-in deal-scoring feature, something we'd assumed power users would love. Her answer was blunt and specific — she'd tried it for a month, found its scoring logic opaque (she couldn't tell why a deal's score moved), and quietly stopped trusting it, going back to her own gut ranking instead. That's the kind of direct, slightly uncomfortable answer that a written survey rarely produces, because a survey doesn't have a live room's momentum carrying an honest answer forward, and a moderator on stage can push gently — "opaque how, can you give an example" — in a way a form field never will.

## What changed because it was live, in front of an audience

Nothing in this session was information we couldn't theoretically have gotten from a one-on-one customer call. What the *public, staged* format changed was who was in the room to hear it directly, unfiltered through a PM's summary written afterward. Engineers who'd built the deal-scoring feature heard, in her own words and tone, exactly why she'd abandoned it — a very different experience than reading "some users find scoring confusing" in a research report. That direct exposure is what drove the actual roadmap change: a redesigned deal-scoring feature with visible, explained factors (a hover state showing exactly why a score is what it is), championed afterward by one of the engineers who'd been in the audience for her answer, not assigned to it from a backlog ticket.

## Why staging it publicly beats a private customer call

A private call produces a report; a report gets read by some people, skimmed by others, and its nuance — tone, hesitation, the specific phrase someone used — evaporates in the summarizing. A public Celebrity Interview puts the whole team in the room for the actual moment of insight, and lets people who weren't going to ask the right question themselves benefit from someone else's. It also, subtly, honors the interviewee in a way a one-on-one research call doesn't quite manage — being invited on stage as someone worth learning from, rather than being surveyed as a source of complaints, changes what people are willing to say.

## Failure modes and when to skip it

The format depends on a moderator who can hold real structure — resisting the temptation to jump straight to their own favorite question instead of working through what the group actually generated, and knowing when to let a good story run long versus redirecting toward specificity. It also requires a genuinely willing, comfortable interviewee; putting someone on a public stage who's shy, or who has an axe to grind, can go badly in front of an audience in a way a private conversation contains more safely — read the person's comfort level honestly before committing to the public format.

It's the wrong tool for information that's genuinely sensitive or that the interviewee would only share privately — churn concerns, competitive intelligence, anything they might reasonably not want said in front of a room, however friendly. And it works best with someone who has real depth to draw on; a Celebrity Interview with someone who's used the product lightly and has little to say produces an awkward, thin session regardless of how well the structure is run.
