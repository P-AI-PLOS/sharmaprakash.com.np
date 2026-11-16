---
title: "Agents Aren't Cron Jobs With a Personality"
date: "2026-11-17T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Hermes", "AI agents", "harness engineering", "multi-agent"]
excerpt: "Cron decides when work starts. An agent decides what happens next. Why I run four Hermes instances, and why the harness around a model matters more than the schedule that wakes it."
series: hermes-agent-factory
seriesOrder: 1
cover: "/images/blog/hermes-factory/factory-hq-room.webp"
thumb: "/images/blog/hermes-factory/factory-hq-room.webp"
use_featured_image: true
draft: false
comments: true
share: true
---

On 15 November an SRE named Yoshik posted a one-liner that collected thousands of likes:

> AI mfs basically rebranded cron jobs as autonomous agents😭
>
> — [@AskYoshik](https://x.com/AskYoshik/status/2121948458202615872)

He has a point. A lot of what gets sold as an "autonomous agent" is a fixed prompt on a timer. It wakes up, says something in a confident voice and goes back to sleep. That is cron with a personality.

Some of my agents are cron-triggered too. My estate maintenance team wakes at 01:00 every Saturday. So I can't claim the schedule is what makes them agents. It isn't. Cron is the trigger. The agent is what happens after the trigger fires.

This series is about running several [Hermes](/ai/hermes-self-improving-agents-cheap-infrastructure/) instances in my [homelab](/homelab/my-homelab-hardware-and-network/), talking to them from one place, and keeping each one in its lane.

## Trigger versus behaviour

A cron job runs the same command every time. If the disk is full, it fails the same way every time until someone reads the log.

The Saturday butler on my maintenance board starts the same way, from a schedule. After that, it reads the board, hands each host to its steward, and the stewards decide what to check based on what they find. A steward that finds a problem it is allowed to fix opens a controlled repair. One that finds something outside its authority stops and reports. None of that branching is in the schedule.

The difference shows up in three things a cron job doesn't have:

- **Tools.** The agent can inspect, query and act, within limits.
- **Memory and state.** It keeps a board, task receipts and prior conversations, so the next run starts from what the last one learned.
- **Steering.** I can change its direction while it's working.

If you use an agent only as a scheduled prompt with no tools, no state and no way to talk back, you are using it as cron. That's fine for a daily summary. It under-uses what the thing can do.

## Steering is the part people skip

Most of my useful agent work starts from a conversation, not a timer. I ask for something, the agent plans, and partway through I correct it.

A recent example: I asked my assistant to move my Google Photos library to the NAS. Its first answer was a polite list of reasons it couldn't. After a few corrections in a shared room, the agents moved the Takeout archives to the NAS, and an engineering agent later verified every file in the library. Part 3 covers that thread in detail.

![The Factory HQ room in the Hermes web app, with EM, Reviewer, HOP, HOG and Potts as members and the engineering roster in the sidebar.](/images/blog/hermes-factory/factory-hq-room.webp)

A cron job can't be told "the archive step is done, just restore the photos and skip duplicates." An agent in a room can.

## Harness engineering

The four Hermes instances I run use the same underlying model. They behave very differently. The reason is the harness around the model, not the model.

By harness I mean everything that sits between the model and the world:

- **Profile.** Who the agent is, what it owns and what it must refuse. An engineering manager profile coordinates; an assistant profile asks engineering for help.
- **Scoped skills and tools.** The assistant has inbox and calendar skills. Engineering has Kanban, repository and deployment tools. Neither has the other's.
- **Permissions.** Who holds which credential, and what has to be true before a tool runs. On my engineering gateway, a room conversation can't run engineering commands without an admitted Kanban claim.
- **Separate memory and boards.** Each instance keeps its own sessions, skills and task boards.
- **Escalation rules.** When to hand off, to whom, and what counts as proof that the handoff landed.

That's harness engineering. Rooms, @mentions and the mobile app sit on top as orchestration and a human in the loop. Put four harnesses together with rules for how they talk and you have something closer to organisation design than to a script.

## The four instances

| Instance | Job |
|---|---|
| Engineering (`factory`) | Engineering manager, engineers, reviewers; repository, server and NAS work |
| Product (`factory-product`) | Research and discovery, led by a Head of Product |
| Growth (`factory-growth`) | Growth work behind an approval-gated sender and a kill switch, led by a Head of Growth |
| Assistant Hub (Potts) | My personal assistant: inbox, calendar, documents, errands |

Each is a separate Debian VM on the same XCP-ng host, with its own Hermes gateway, profiles, skills and boards. They meet in one room, Factory HQ, where I can address any of them with an @mention.

A separate estate maintenance board also runs on the engineering VM. It's infrastructure, not one of the four, and it's the cron-triggered part: a butler, a steward per host and a few specialists, working inside a Saturday window.

## What the separation buys

The assistant doesn't fix servers. When it needs a package installed on the NAS, it asks engineering, and engineering's infrastructure engineer does it with credentials the assistant never sees.

Assistant-specific features, like calendar and inbox management, are built and tested only on the assistant. No other instance needs those skills, and giving them to engineering would only widen what engineering can touch.

Separation made specific tasks easier to finish. Each instance has a short list of things it owns, and a clear way to ask for the rest.

## The rest of the series

1. **Agents aren't cron jobs with a personality** (this post)
2. [Four Hermes instances, one model](/homelab/four-hermes-instances-one-model/): how each instance is set up and kept apart
3. [Steering agents from one place](/homelab/steering-hermes-agents-from-rooms/): Factory HQ, @mentions, the web app and the mobile app, with the Google Photos migration as the worked example
4. [One skill registry for every harness](/homelab/one-skill-registry-for-every-harness/): pinned upstream skills, forks with provenance, and skill-doctor
5. [Assistant-only work](/homelab/assistant-only-work-calendar-and-inbox/): calendar and inbox on Potts

Yoshik's joke lands because a lot of agent demos really are cron jobs. The fix isn't a better schedule. It's tools, state, a harness that says what the agent may do, and a way to steer it mid-task.
