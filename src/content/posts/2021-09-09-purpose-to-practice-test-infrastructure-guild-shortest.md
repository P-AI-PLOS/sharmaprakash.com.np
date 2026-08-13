---
title: "Purpose-to-Practice: Giving a Guild Enough Structure to Survive Its Founder"
date: "2021-09-09T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Shortest's test-infrastructure guild ran entirely on one staff engineer's enthusiasm, which meant it would end when she went on leave. Purpose-to-Practice turned a volunteer habit into something with named decision rights — and the Structure step was where it stopped being a book club."
tags: [liberating-structures, shortest]
series: ls-culture
seriesOrder: 3
use_featured_image: false
---

Shortest's test-infrastructure guild met every second Thursday, had a Slack channel with 40 people in it, and produced roughly nothing that outlived the meeting. It was not a failure of effort. It was that everything the guild did depended on one staff engineer — she set the agenda, chased the follow-ups, and made the calls — and she was going on three months' leave in October. The guild was going to quietly stop existing and everyone in it knew that, which was itself part of why nobody invested in it.

We spent one long Thursday running **Purpose-to-Practice** on it instead of holding the usual meeting.

## The five elements and what they're for

P2P settles the five things a self-organizing group needs to run without a hero: **Purpose**, **Principles**, **Participants**, **Structure**, **Practices**. Each is worked with 1-2-4-All — solo writing, then pairs, then fours, then the whole room — and the sequence loops back on itself whenever a later element exposes a problem in an earlier one.

For a guild specifically, I'd argue the load-bearing element is Structure, which is also the one groups most want to skip. "How will control be distributed?" sounds bureaucratic when eleven friendly engineers are in a room agreeing with each other. It stops sounding bureaucratic the moment the person who has been informally holding all the control goes on leave.

## Running it on the guild

**Purpose** clarified something the group had been fuzzy about for a year. Half the room thought the guild existed to share testing knowledge; the other half thought it existed to actually own shared testing infrastructure — the CI harness, the fixture library, the flake dashboard. Those are different organisms. A knowledge-sharing guild needs an agenda; an ownership guild needs an on-call rotation. Written down individually, the split was almost exactly even, which explained a year of mismatched expectations. The room chose ownership, deliberately and with some reluctance, because the flake dashboard had no owner and everyone knew it.

**Principles** followed from that. Must-do: anything the guild owns has a named steward and a documented escalation path. Must-not-do: never merge a change to shared test infrastructure that no other squad has reviewed — a rule aimed squarely at the "I'll just fix it quickly" pattern that had produced two of the year's worst CI outages.

**Participants** shrank the group, which surprised people. Forty in a Slack channel, but ownership needs a smaller committed core: six engineers, one from each squad that actually depends on the shared harness, each with their manager's explicit agreement on time. The other thirty-four stayed as an audience, not as members.

**Structure** was the hour that mattered. The group wrote down four decisions and who makes them: framework upgrades — the six-person core, by consent, in the biweekly; breaking changes to the fixture API — core plus a two-week deprecation notice; incident response for CI-wide breakage — whoever's on the rotation, unilaterally; anything requiring headcount or budget — not the guild's call, escalate. Twenty minutes of writing replaced a year of "ask her."

**Practices** were then almost mechanical: rotate facilitation alphabetically, keep a one-page decision log in the repo, and publish a monthly flake-rate number whether or not it's improving.

She went on leave in October. The guild's November decision log has four entries in it, none of them hers.

## Why the structure step does the work

The failure mode P2P is built against is a group that has plenty of purpose and no distributed control — energetic, well-intentioned, and completely dependent on one person's attention. Purpose and Principles feel like the meaningful parts and they're the parts groups do naturally. Structure is the part nobody does voluntarily, because writing "who decides X without asking" makes visible an authority that has been operating comfortably in the dark. The 1-2-4-All helps here too: people will write "actually I don't know if I'm allowed to do that" on a card long before they'll say it to the person they'd be asking.

Naming decision rights also converts a guild from a meeting into an institution. A meeting can be skipped. A documented steward with an escalation path is something a new engineer can discover in the repo six months later without knowing anyone's name.

## Where it breaks

P2P on a volunteer group can quietly conscript people. The Participants step produces a list of who *must* be involved, and if those people's managers haven't agreed to the time, you have created an obligation with no budget behind it — which is a reliable way to kill a guild faster than neglect would have. We asked each of the six to confirm with their manager before the Practices step, and one seat changed hands because of it.

Skip P2P entirely for a genuinely informal group. If a set of people enjoy meeting to discuss testing and nothing depends on them, formalizing it removes the only thing making it pleasant. Run this when something real is about to be dropped — not to make a healthy habit look more serious.
