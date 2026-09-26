---
title: "Why I Self-Host Campsite for My AI Agents"
date: "2026-09-27T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "MCP", "AI agents", "self-hosting", "Rails"]
excerpt: "My AI agents post updates, read notes and reply in threads the same way people do. They do it in Campsite, an open-sourced Slack alternative I run in my homelab, through its MCP server."
series: campsite-for-agents
seriesOrder: 1
cover: "/images/blog/campsite-for-agents/why-i-self-host-campsite-for-ai-agents/cover.png"
thumb: "/images/blog/campsite-for-agents/why-i-self-host-campsite-for-ai-agents/thumb.png"
use_featured_image: false
draft: true
comments: true
share: true
---

Most of my agent work used to end in a terminal. An agent would finish a task, print a summary, and that summary would scroll away. If I wanted a record, I copied it somewhere. If another agent needed that context the next day, I pasted it into a prompt.

Now the agents write where I write. They post an update when a piece of work lands, read the notes I've left for them, reply in threads and react to each other's posts. The place they do that is Campsite, a team-communication app I run on my own hardware at home.

This series covers why I set it up that way, where it runs, how I deploy it, the database migration that's under way, and how much of the work was done by coding agents. This first part is about the why.

## What Campsite is

Campsite was a commercial product: posts, notes, calls and chat for teams, positioned as a calmer alternative to Slack. The company behind it shut down and open-sourced the code. I run a maintained fork.

It's a substantial application, not a toy:

- a Rails 8.1 API, with Sidekiq for background jobs, Elasticsearch for search and Pusher-style realtime updates;
- a Next.js 16 web app;
- a Yjs/Hocuspocus server for collaborative note editing;
- a small service that converts between rich-text JSON, HTML and Markdown;
- a Puppeteer service that renders HTML to images.

For most of the time I've run it, the fork was in what I called stewardship mode: security patches and dependency updates, nothing else. On 23 September 2026 I ended that and started active development. The first project is moving the database from MySQL to PostgreSQL, which gets its own part of this series.

The scale is deliberately small. At the last release it held 46 users, 768 posts and 5,230 messages. The people are a handful; the rest of the activity comes from agents working alongside them.

## Why a chat app for agents?

A chat app gives agents the same shared memory my team gets from one. An agent that finishes a task can post what it did, with links, in the project it belongs to. Tomorrow's agent can search for that post instead of relying on whatever I remember to paste in. When I'm reviewing, I read one feed rather than five terminal scrollbacks.

It also makes agents legible to each other. If an orchestrating agent hands out work, the hand-off and the result can live in one thread. If an agent gets stuck, it can say so in a place I'll see from my phone.

None of this needs a special "agent platform". Posts, comments, notes, reactions and direct messages are enough. What makes it work is a way for agents to use those features directly.

## The MCP server is what makes it work

The original Campsite had no MCP server. I added one to the fork in June 2026, in three rounds: first the core read and post tools, then coordination tools, then prompts, resources and attachments. It's a remote [MCP](https://modelcontextprotocol.io) server that lives inside the Rails API. Any MCP client, Claude included, can connect to it the way it would connect to Notion or a tracker: add the connector, sign in, approve access.

Behind that, the client runs the standard remote-MCP OAuth flow. It discovers the authorization server from the API's well-known metadata, registers itself, then goes through an authorization-code flow with PKCE. The person signing in sees a consent screen, and approving it issues a token scoped to MCP.

Three details of that design matter a lot when the "person" signing in is an agent.

**The token acts as a user, never as the app.** Every tool goes through the same authorization policies and serializers as the REST API. An agent connected as a given account can see and do exactly what that account could through the web app, and nothing more. I don't have a second permission model to keep in sync.

**Writes are gated by scope.** Reading needs read scopes. Creating posts, sending messages, writing notes and creating projects each need their own write scope. An agent that only summarises threads doesn't need to be able to post at all.

**The tool list is deliberately narrow.** There are around two dozen read tools (list and search posts, read a thread, list notes, check notifications) and a set of write and lifecycle tools (create a post, comment, react, resolve, send a message, create or edit a note, attach a file). There are no bulk tools, no hard deletes, no membership or OAuth administration and no export. The archive, cancel and remove tools advertise MCP's destructive hint even when the record is recoverable, so a client can ask before calling them.

Collaborative notes get special handling. Changing a note's body goes through the sync server rather than overwriting stored state, so it respects people who are editing the same note, keeps edit history intact and is rate-limited. If that coordination isn't available, the edit fails rather than guessing.

The server also offers a few prompts: triage my inbox, draft a stand-up from my recent posts, summarise a thread. They don't write anything themselves. They're instructions that drive the tools above. And the server runs no model inference of its own. The intelligence stays in the client. Campsite just provides the tools.

I've written before about [when MCP earns its token cost over a CLI](/ai/mcp-vs-cli-token-cost/). Here the case is simple: the agents need to authenticate as someone, respect the same permissions as that someone, and work from any MCP client I happen to be using. That's what a remote MCP server with OAuth is for.

## Why self-host it?

I could have pointed agents at a hosted chat product. I chose not to, for four reasons.

**There's no hosted Campsite anymore.** The company is gone. Self-hosting is the only way to keep using the product, so the real question was whether to keep it, not where to run it.

**The conversation is the context.** Agent updates quote code, name internal services, describe what broke and why. That's precisely the material I want searchable later, and it's also material I'd rather keep on my own disks. Campsite in my homelab has no public ingress at all. It lives behind private `.home` names, and I reach it over the home network or Tailscale.

**I can change the tools.** Because I run the fork, when an agent needs a tool that doesn't exist, I can add one, with the same policies and tests as everything else. The whole MCP server exists because of that. With a hosted product, I'd be waiting on someone else's roadmap.

**Agents are cheap to add.** An agent is just another user in my own install. There's no per-seat decision to make before trying an idea.

## What it costs me

Self-hosting has real costs, and I'd be misleading you if this section were shorter than the last.

I'm the operations team. When a hypervisor host went down in the middle of recent work, it was mine to notice, and mine to re-verify everything once it came back. Upgrades, certificates, disk space and backups are all mine.

The backups aren't where I want them yet. I have a one-time database backup, copied to a second machine and restore-tested, plus a verified archive of the object store. A recurring backup schedule is designed but not deployed. Until it is, a bad week could cost me more than I'd like.

Some flows are still unproven on this install. Health checks, background jobs and search are verified. An authenticated end-to-end browser test, a two-client collaborative edit and a browser upload round trip are still on my acceptance list.

And it's a real application with real dependencies: MySQL (for now), Redis, Elasticsearch, S3-compatible storage, a mail relay, a sync server. Each is something that can break. The next part is about where each one runs and what happens when a machine goes away.

## What the rest of the series covers

1. **Why I self-host Campsite for my AI agents** (this post).
2. [Where Campsite runs in my homelab](/homelab/where-campsite-runs-in-my-homelab/): the virtual machines, how I placed them, and the failure domains.
3. [Deploying Campsite with Kamal](/homelab/deploying-campsite-with-kamal/): one config per runtime, why the job worker deploys separately, exact-commit images and a secrets check that never prints values.
4. [From MySQL to PostgreSQL with Patroni](/homelab/campsite-mysql-to-postgresql-patroni/): what MySQL was hiding, a test suite that runs on both databases, and a high-availability cluster that is live but not yet carrying production.
5. [Letting coding agents build it](/homelab/letting-coding-agents-build-campsite/): one orchestrator, many implementation lanes, and why every result was verified before it merged.

If you want the hardware underneath all this first, start with [Inside My Homelab](/homelab/my-homelab-hardware-and-network/).

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/campsite-for-agents/why-i-self-host-campsite-for-ai-agents/cover.png
and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. A small
evening campsite in a quiet forest clearing, seen from a slight elevation. Around
a low campfire sit a few simple human silhouettes alongside several small,
friendly geometric robot figures (rounded cubes and cylinders with a single soft
light for a face). Everyone faces a shared glowing notice board planted in the
ground, covered in abstract cards and threads connected by thin lines, suggesting
posts and replies. Behind them, a modest cabin with a softly lit window hints at
a home server rack inside. Cool deep-teal and slate night palette with a single
warm amber accent from the fire and the board. Calm, geometric, slightly
isometric composition with generous negative space. Matte finish, restrained
palette, no neon. Aspect ratios: 21:9 hero crop and 16:9 card crop of the same
composition.
-->
