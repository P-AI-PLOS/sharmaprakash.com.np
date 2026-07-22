---
title: "Celebrity Interview: Letting a Top Instructor Tell Us What We're Getting Wrong"
date: "2021-03-02T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "We invited our top-performing instructor on stage specifically to criticize the product, in front of the people who built it. What she said reframed a whole quarter of roadmap priorities in ninety minutes."
tags: [liberating-structures, course-guru]
series: ls-discovery
seriesOrder: 16
use_featured_image: false
---

We'd built a pretty good track record of asking instructors what was working — the [Appreciative Interviews session on successful instructors](/product-management/appreciative-interviews-successful-instructors/) had come out of a genuinely useful appreciative cycle. This session was the deliberate opposite: we asked our single top-performing instructor, by every metric we tracked (enrollment, completion, repeat purchase), to come on stage in front of the whole product team and tell us, in detail, what the platform got wrong. **Celebrity Interview** turned out to be exactly the right format for that — not because it's built for criticism specifically, but because the public, structured, story-driven format makes criticism land differently than a written survey ever does.

## The structure

Celebrity Interview stages a live interview — one interviewee, a moderator, and an audience that both submits questions in advance and gets a chance to ask directly partway through. Before the interview starts, the room works in small groups to generate the questions they most want answered, which the moderator uses as the interview's backbone; the moderator's own follow-ups fill in around them. The "celebrity" framing — treating the interviewee as an expert worth learning from, on stage, rather than a customer being surveyed — changes the tone of what people are willing to say, in both directions: praise lands more genuinely, and criticism, delivered as expertise rather than complaint, is easier for a room to actually hear without getting defensive.

## What she told us

The pre-interview question-gathering session produced a list weighted toward course-authoring tools — curriculum builder, video upload, pricing controls — because that's where the product team's own attention had been for two quarters. The interview itself went somewhere different almost immediately, because the moderator's first real question was open enough to let her set the agenda: "what's the thing about running your course on this platform that frustrates you most, that we've probably never properly heard?"

Her answer, told as a story rather than a complaint list: she'd had a student, partway through her course, post a public review on the merchant storefront — not inside the course platform at all, on the underlying Shopify store's product review section — flagging that a specific lesson's instructions were outdated after a software update the course covered had changed its interface. She hadn't found out until a fellow instructor, browsing the storefront for unrelated reasons, happened to see it and mentioned it to her a week later. There was no notification, no dashboard signal, nothing in the instructor-facing tools that would have surfaced a student's public complaint back to her. She'd been building excellent course content in isolation from a whole channel of real, actionable feedback that existed one click away from where she worked, invisible to her the entire time.

Asked a follow-up (from the audience, an engineer this time) about how she currently found out about problems with her courses at all, her answer was similarly revealing: she relied almost entirely on direct student messages and her own periodic manual re-watching of old lessons to check for staleness, a process she described, unprompted, as "basically hoping I remember to check." That's an extraordinary amount of unsupported manual vigilance from someone we'd been treating, based on her enrollment and completion numbers, as a fully successful power user of the platform — the metrics we tracked had no way to show us the invisible, effortful workaround underneath those good numbers.

## Why this reframed the roadmap

Going into the session, the product team's working theory was that top instructors were mostly satisfied and needed marginal authoring-tool improvements — better editing, more granular pricing. What came out instead was a much larger, previously invisible gap: instructors had no feedback loop at all connecting what happened on the merchant storefront (reviews, comments, support questions routed through the merchant rather than us) back to the course itself. We were building tools to help instructors create content and almost nothing to help them *maintain and respond to* it once it was live in someone else's storefront — a genuinely different job, and one our top instructor had been doing entirely by hand, invisibly, for as long as she'd been on the platform.

That became the seed for a "course health" surface — a simple, direct feed of storefront-side signals relevant to a course (reviews mentioning the course, support tickets tagged with course-related keywords) routed to the instructor dashboard, something not on the roadmap in any form before this session and a much higher-leverage fix than anything in the authoring-tool backlog the pre-session question list had assumed was the priority.

## Why the public format mattered here specifically

Had this been a written survey, "there's no way to know if a student publicly flagged my course as outdated" is exactly the kind of finding that gets buried in a paragraph of a research report, competing for attention against a dozen smaller UI complaints that are easier to action and therefore get picked up first. On stage, in front of engineers who could immediately start asking their own technical follow-ups about what data already existed and where, the finding got the weight it deserved in real time, and the engineer who ended up owning the course-health feature was in the room for the exact moment the gap became obvious — a much stronger form of buy-in than a ticket assigned from a backlog.

The public setting also gave her criticism more standing than a complaint typically gets. Framing her as a celebrity — an expert we'd invited specifically to teach the room something — meant her frustration read as insight rather than grievance, which changed how seriously the room treated it.

## Failure modes and when to skip it

Running a Celebrity Interview explicitly to surface criticism requires real discipline from the moderator to keep the room receptive rather than defensive — the instinct to explain or justify a design choice the interviewee is criticizing has to be resisted in the moment, or the format collapses into exactly the defensiveness a written ticket triage would have produced anyway. Brief the audience beforehand: this session exists to listen, not to respond or defend.

It also depends on choosing an interviewee with enough standing and enough genuine expertise that the "celebrity" framing feels earned rather than performative — doing this with someone who hasn't actually pushed the product hard produces thin, generic criticism no different from an ordinary feedback form. And a single instructor's story, however vivid, is one perspective; treat what surfaces as a strong, well-evidenced hypothesis worth validating further (do other instructors have the same invisible-feedback-loop problem), not as a settled fact about the whole instructor base.
