---
title: "Assistant-Only Work: Calendar and Inbox on Potts"
date: "2026-11-21T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Hermes", "AI agents", "Gmail", "Google Calendar", "personal assistant"]
excerpt: "Inbox triage, a morning digest and calendar management run only on my assistant instance. Nothing else needs those skills or that Google grant, so nothing else gets them."
series: hermes-agent-factory
seriesOrder: 5
cover: "/images/blog/hermes-factory/potts-skills.webp"
thumb: "/images/blog/hermes-factory/potts-skills.webp"
use_featured_image: true
draft: false
comments: true
share: true
---

The [registry](/homelab/one-skill-registry-for-every-harness/) exists so that shared roles stay identical across harnesses. Some work should never be shared. My inbox and calendar are the clearest case, and they live on one Hermes instance: Potts, on the Assistant Hub VM.

## Why only one instance

Engineering, product and growth have no reason to read my mail or move my meetings. Giving them those skills would widen what each of them can touch and add choices they'd sometimes make wrongly.

So the Google grant, the mail plugin and the assistant skills exist only on Potts. I build and test them there. When another instance needs something from my inbox or calendar, it asks Potts in [Factory HQ](/homelab/steering-hermes-agents-from-rooms/), the same way Potts asks engineering for server work.

## Two profiles, one gateway

Potts runs two Hermes profiles on one gateway:

- **`default`**, displayed as Potts, is the one I talk to. It runs on Claude Opus through my subscription and handles chat, documents and anything that crosses domains.
- **`inbox-worker`** owns the scheduled mail work. Its cron jobs get only the two mail toolsets they need, low effort and a short turn limit.

The worker stays out of every room. It has one job and no reason to be addressed.

## The inbox

Two native Hermes cron jobs drive the inbox:

| Job | Schedule | What it does |
|---|---|---|
| `potts-ingest` | Every 2 minutes, behind a pre-check gate | Pulls new Gmail history and triages it with the `potts-triage` skill |
| `potts-digest` | 08:00 Kathmandu time | Writes the morning inbox and task digest |

The gate is a small script that checks whether there's anything new before the model is called, so most two-minute ticks cost nothing.

The scheduled worker runs in read-only mode. It reads, sorts and drafts, but it doesn't send or delete. Anything that changes the mailbox happens in a conversation with me. The `potts-inbox-cleanup` skill clears a large unread backlog by deciding per sender: marketing goes to Gmail's Bin and the rest is marked read, with my approval before anything changes. The latest cleanup took my inbox to zero unread.

Potts has its own tab on the Hermes dashboard. It reads the saved digest and triage state and shows queue coverage, review items, tasks, drafts and errors. It never triggers a new digest or touches the mailbox.

## The calendar

Calendar work runs in a separate room on Potts, the Assistant Hub room. It has six members: Potts, Calendar, Finance, Contacts, Research and Jobs. An unaddressed message goes to whichever specialist fits the request; an @mention picks a member directly.

Calendar, Contacts, Drive, Docs and Sheets share one Google grant with the mail plugin. I connected it from my phone using a short-lived consent link Potts generates with its `potts-google-connection` skill. Each scope was tested live by creating, reading, updating and deleting a throwaway item. The test items were cleaned up, no messages were sent and no attendees were invited.

Granting a scope isn't the same as allowing every action it permits. Creating events and drafting replies are opt-ins I approved. Gmail filter changes need approval in the conversation. Deleting a draft or a label asks first, and removing a label never deletes the messages under it.

## What Potts doesn't do

Potts doesn't fix servers, install packages or touch the NAS directly. When the [Google Photos migration](/homelab/steering-hermes-agents-from-rooms/) needed NAS work, Potts submitted tasks to engineering's `nas-ops` board through a transport that can run nothing else. Engineering's infrastructure engineer did the work with credentials Potts never sees.

Potts has its own browser on its VM for web tasks. It isn't my browser and doesn't share my logins.

Its own board, `potts-ops`, holds assistant work and handoffs, one card at a time. Engineering work goes on engineering's boards.

## What I'd tell someone starting out

Put personal-data skills on one instance and nowhere else. Build them, test them and break them there. Let the other agents ask for what they need through a room, and let the assistant ask engineering for what it can't do.

The model underneath Potts is the same one my engineering manager uses. The difference is the harness: a profile that knows it's an assistant, skills only it has, a Google grant only it holds, and a clear rule for when to hand work to someone else.

That's the series. [Part 1](/homelab/agents-are-not-cron-jobs/) starts with why none of this is cron with a personality.
