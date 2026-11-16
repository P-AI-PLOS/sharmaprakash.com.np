---
title: "Steering Hermes Agents From One Place"
date: "2026-11-19T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Hermes", "AI agents", "multi-agent", "Synology"]
excerpt: "One shared room, @mentions and the Hermes web and mobile apps let me redirect four agent instances mid-task. The Google Photos to NAS migration shows how that works in practice."
series: hermes-agent-factory
seriesOrder: 3
cover: "/images/blog/hermes-factory/factory-hq-steering.webp"
thumb: "/images/blog/hermes-factory/factory-hq-steering.webp"
use_featured_image: true
draft: false
comments: true
share: true
---

[Part 2](/homelab/four-hermes-instances-one-model/) kept four Hermes instances apart. This part is about talking to all of them from one place, and changing their direction while they work.

## Factory HQ

The engineering gateway owns a room called Factory HQ. It has five members:

| Mention | Who | Runs on |
|---|---|---|
| `@em` | Engineering manager, the room lead | Engineering |
| `@reviewer` | Independent verification | Engineering |
| `@hop` | Head of Product | Product |
| `@hog` | Head of Growth | Growth |
| `@potts` | My personal assistant | Assistant Hub |

A message without a mention goes to EM. A mention selects the member I name. Agents mention each other the same way, and the room shows each handoff as a small "EM asked Potts" marker under the message.

The room is for coordination. Work that needs doing goes onto a Kanban card on the owning board, and the room carries the receipts. EM has one tool, `factory_hq_update`, that posts a card's status back into the room after reading it back from the board.

## The web app and the mobile app

Newer Hermes versions ship a chat web app. Mine is served by the engineering gateway. I sign in, pick **Bots**, and see the rooms and every engineering profile in one sidebar. It works on my home network, over Tailscale, and over my router's VPN when I'm out.

![The Factory HQ room in the Hermes web app. The sidebar lists the rooms and engineering profiles; the header shows each member's last state.](/images/blog/hermes-factory/factory-hq-room.webp)

The official Hermes mobile app connects to the same gateway. It feels more like a chat app than a dashboard: agents and rooms as conversations, and a message box at the bottom. A lot of my steering happens there, from my phone.

Each instance also has its own dashboard for sessions, skills, cron and boards. I use those to inspect an instance, not to talk to it.

## Worked example: Google Photos to the NAS

I asked Potts, in a direct chat, to move my Google Photos library to my NAS and free up the space.

![Potts's first reply: it can't reach Google Photos or the NAS, explains why Google Takeout is the route, and asks what NAS I have.](/images/blog/hermes-factory/potts-photos-first-ask.webp)

The answer was honest and useless. Potts had no route to the NAS and didn't know which NAS I owned. It was right about one thing: Google's Photos API only exposes photos an app uploaded itself, so a full export has to go through Google Takeout.

### Engineering builds the route

Potts doesn't fix servers, so engineering built the path it was missing:

- A small transport script on the engineering VM that accepts NAS tasks for one board, `nas-ops`, and always assigns them to the existing infrastructure engineer.
- A dedicated key on the assistant VM that can run only that transport, from only that address, with no shell.
- Two Potts skills: `potts-nas-operator` for submitting and checking NAS tasks, and `potts-photo-migration` for the migration itself.

The first live task checked that Synology Photos was running, that there was space, and that the operator could write to my Photos library. A second wrote a probe file, verified its hash and cleaned it up without touching my files.

### The archives land

The Takeout export came as three archives, about 31 GB. They streamed from my signed-in browser straight to the NAS, into a staging folder beside the Photos library rather than inside it, so Synology Photos wouldn't index ZIP files and JSON sidecars.

While that ran, a monitor job posted progress into my original conversation with Potts through a dedicated `potts_photo_update` tool. Updates arrived where I'd asked the question, not in a separate notification channel.

### Steering in the room

The work then stalled on details I didn't care about: a disk-space discrepancy, units, which folder layout to use. So I stepped into Factory HQ and said what I wanted.

![In Factory HQ I tell the agents the archive step is done and to restore the photos the way Synology Photos stores them. EM restates the scope on the existing task and tags Potts.](/images/blog/hermes-factory/factory-hq-steering.webp)

EM restated the scope on the same card instead of starting over. Then the reviewer added two rules I hadn't thought of. Takeout often stores the same photo in a year folder and an album folder, so duplicates have to be checked within the export as well as against the library. And two different photos can share a name like `IMG_0001.jpg`, so a file is skipped only when its hash matches. A differing file gets a suffix. Potts offered two folder layouts and recommended year/month, which matches how the Synology Photos mobile app files uploads.

That exchange took a few minutes. Without the room, each of those points would have been a separate round trip through a different agent.

### The harness holds

Not everything moved. Potts asked EM to schedule a one-shot job to resume the import when the worker's usage limit reset. EM couldn't.

![Potts asks EM to set a one-shot job to resume the import; EM replies that even listing cron jobs was refused because room work needs an admitted Kanban claim.](/images/blog/hermes-factory/em-claim-refusal.webp)

Engineering commands from a room turn need an admitted Kanban claim, and a chat message isn't one. EM recorded the refusal on the card and asked for the authorised route instead. That's the harness doing its job. It's slower in the moment, and it's why I trust what EM tells me.

## What the migration taught the agents

The rule that came out of this thread is now written into every NAS task brief and the engineering runbook: **a ready email or a completed task does not prove the migration is complete.** Completion means counted files, matched hashes and photos visible in Synology Photos.

The migration is done. The library now lives in `/volume1/homes/prakash/Photos`: about 33,000 files, 129 GB, in the year/month layout Synology Photos expects. One loose end proves the rule: the agents finished the import but left their task cards marked blocked, so the board said less was done than the NAS showed. Counting the files, not reading the card, is what settled it.

None of this was one prompt on a timer. It was one request, a route engineering built on demand, and a few corrections typed into a room at the right moment.

Next: [one skill registry for every harness](/homelab/one-skill-registry-for-every-harness/).
