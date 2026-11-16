---
title: "Why I Self-Host Campsite for My AI Agents"
date: "2026-09-27T18:00:00+05:45"
last_modified_at: "2026-11-16T21:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "MCP", "AI agents", "self-hosting", "Rails"]
excerpt: "Campsite is an open-sourced Slack alternative I run in my homelab. Through an MCP server I added to it, my agents read and write docs and posts with the same permissions as a person."
series: campsite-for-agents
seriesOrder: 1
cover: "/images/blog/campsite-for-agents/why-i-self-host-campsite-for-ai-agents/cover.png"
thumb: "/images/blog/campsite-for-agents/why-i-self-host-campsite-for-ai-agents/thumb.png"
use_featured_image: false
draft: false
comments: true
share: true
---

Agent work that ends in a terminal is easy to lose. A summary scrolls away, and the next agent only knows what I remember to paste into its prompt.

So my agents write where I write. They post updates, read notes I leave for them and reply in threads. The place they do that is Campsite, a team-communication app I run on my own hardware.

This series covers why, where it runs, how it's deployed, its move from MySQL to PostgreSQL, and how coding agents did much of the work.

## What Campsite is

Campsite was a commercial product: posts, notes, calls and chat for teams, positioned as a calmer Slack. The company shut down and open-sourced the code. I run a maintained fork.

It's a real application:

- a Rails API with Sidekiq for background jobs and Elasticsearch for search;
- a Next.js web app;
- a Yjs/Hocuspocus server for collaborative notes;
- small services for rich-text conversion and HTML-to-image rendering.

The user count is small. A handful of people use it, and agents do the rest.

## How I use it today

Campsite is where my docs live, and its MCP server is how the agent factory reads and writes them. Agents post what they did, with links, in the project it belongs to, and later agents search for it.

For chat-style work with agents I use Hermes, which gives me several instances with rooms and an official mobile app. Campsite gets less of that conversation now; it holds the longer-lived writing.

## The MCP server

The original Campsite had no MCP server. I added a remote [MCP](https://modelcontextprotocol.io) server inside the Rails API. Any MCP client connects the way it would to Notion: add the connector, sign in, approve access. Underneath, that's the standard remote-MCP OAuth flow with PKCE and a consent screen.

Three design choices matter when the user signing in is an agent.

**The token acts as a user, never as the app.** Every tool goes through the same authorization policies and serializers as the REST API. An agent sees and does exactly what its account could in the web app. There's no second permission model to keep in sync.

**Writes are gated by scope.** Reading needs read scopes. Posting, messaging, writing notes and creating projects each need their own write scope. An agent that only summarises threads never gets to post.

**The tool list is narrow.** There are read tools (search posts, read a thread, list notes, check notifications) and write tools (post, comment, react, resolve, message, edit a note, attach a file). There are no bulk tools, hard deletes, membership or OAuth administration, or export. Archive and remove tools carry MCP's destructive hint so clients can ask first.

Note edits go through the sync server rather than overwriting stored state. That respects people editing the same note and keeps history intact. If sync isn't available, the edit fails instead of guessing.

The server runs no model inference. The intelligence stays in the client; Campsite only provides tools. I've written about [when MCP earns its token cost over a CLI](/ai/mcp-vs-cli-token-cost/). Here the case is simple: agents need to authenticate as someone, inherit that someone's permissions and work from any client.

## Why self-host it?

**There's no hosted Campsite.** The company is gone, so self-hosting is the only way to use it.

**The conversation is the context.** Agent updates quote code, name internal services and describe failures. I want that searchable, and I want it on my own disks. Campsite has no public ingress; I reach it on private `.home` names, at home or over Tailscale.

**I can change the tools.** When an agent needs a tool that doesn't exist, I add it with the same policies and tests as everything else. The MCP server exists because of that.

**Agents cost nothing to add.** An agent is just another user on my install.

## What it costs

I'm the operations team. Upgrades, certificates, disk space, backups and recovery after a host goes down are all mine. Campsite also depends on PostgreSQL, Redis, Elasticsearch, S3-compatible storage, a mail relay and a sync server, and each of them can break.

## The series

1. **Why I self-host Campsite for my AI agents** (this post).
2. [Where Campsite runs in my homelab](/homelab/where-campsite-runs-in-my-homelab/).
3. [Deploying Campsite with Kamal](/homelab/deploying-campsite-with-kamal/).
4. [From MySQL to PostgreSQL with Patroni HA](/homelab/campsite-mysql-to-postgresql-patroni/).
5. [Letting coding agents build it](/homelab/letting-coding-agents-build-campsite/).

For the hardware underneath, start with [Inside My Homelab](/homelab/my-homelab-hardware-and-network/).

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
