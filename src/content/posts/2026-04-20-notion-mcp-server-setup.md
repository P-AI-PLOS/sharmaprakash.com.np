---
draft: false
title: "Setting Up the Notion MCP Server"
date: "2026-04-20T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Notion's MCP server is the fastest path to an agent that can read your docs and write structured pages. The quirks are worth knowing before your first session."
cover: "/images/blog/ai/notion-mcp-server-setup.png"
thumb: "/images/blog/ai/notion-mcp-server-setup.png"
last_modified_at: "2026-05-29"
use_featured_image: true
series: ai-tooling
seriesOrder: 3
---

What I want: my agent reads a Notion spec page at the start of a session, doesn't ask me to paste it into the conversation, and can write structured output back to Notion — meeting summaries, release notes, task breakdowns — without me leaving the terminal.

Notion MCP gets you there. It also has a handful of quirks that will surprise you in a long session if you don't know about them upfront. This post covers the setup and the gotchas.

---

## Prerequisites

- A Notion account (free tier works)
- An internal integration — create one at [notion.so/my-integrations](https://www.notion.so/my-integrations). Call it something like "Claude Code Agent".
- The integration token (starts with `secret_...`)
- The integration connected to the specific pages and databases it needs access to — Notion requires explicit connection per-page, it doesn't see everything by default
- Node.js 18+

The explicit connection step catches people. After creating the integration, open each Notion page or database you want the agent to access, click the `...` menu in the top right, go to "Connections", and add your integration. The MCP server only sees what you've explicitly shared.

---

## Installation

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notion-ai/mcp-server"],
      "env": {
        "NOTION_API_KEY": ""
      }
    }
  }
}
```

The actual token goes in `.claude/settings.local.json` (gitignored):

```json
{
  "mcpServers": {
    "notion": {
      "env": {
        "NOTION_API_KEY": "secret_your_integration_token_here"
      }
    }
  }
}
```

Test it: start a Claude Code session and ask "search Notion for my project specs". If the server is running correctly and the integration is connected to relevant pages, you'll get results. If you get an empty response, the integration probably isn't connected to those pages yet.

---

## What It Enables

| Tool | What it does |
|---|---|
| `search` | Full-text search across connected pages and databases |
| `get_page` | Retrieve a page by ID, including its full block content |
| `create_page` | Create a new page inside a specified parent page or database |
| `update_page` | Update page properties (title, database fields) |
| `get_database` | Get database schema and properties |
| `query_database` | Filter and sort database rows |
| `create_database_item` | Add a row to a database |
| `update_database_item` | Update an existing database row |

For writing structured content — pages with headings, bullet lists, callouts — the agent uses `create_page` with a block-based content structure. The MCP server handles the translation between the agent's markdown-like output and Notion's block format.

---

## Notion-Specific Quirks

### 1. Block-based content round-trips imperfectly

Notion stores everything as blocks, not markdown. The MCP server converts in both directions, but the round-trip isn't lossless. Complex formatting — nested toggles, columns, synced blocks, custom callout icons — may come out differently than it went in. Before committing to an automated write flow, test it with a throwaway page and check the output in the Notion UI.

For simple content — headings, bullet lists, code blocks, paragraphs — the conversion is reliable. For complex layout, keep it simple or accept that the agent is writing "good enough" Notion, not pixel-perfect Notion.

### 2. Permission scope requires care

The integration sees everything you've connected to it. Be deliberate. Don't connect your entire workspace — connect the specific pages and databases the agent needs. If the agent has access to your personal journal and your work project database, it might search across both when you only intended one.

Create a dedicated section in Notion for agent-accessible content if you work in a shared workspace. This also makes auditing easier: you know exactly what the agent can see.

### 3. Rate limits surface in long sessions

Notion's API enforces a limit of 3 requests per second per integration. In a typical interactive session this isn't noticeable. In a long autonomous session — writing 20 meeting summaries, populating a database from a large dataset — you'll hit intermittent `429 Too Many Requests` errors. The MCP server handles retries, but it means your session will slow down or stall.

If you're doing bulk writes, add delays between agent tool calls or batch the work across multiple sessions.

### 4. No page move via API

You can create pages and update their content, but you can't move a page from one parent to another via the Notion API. If your workflow involves moving pages between sections as they progress through a status, that step stays manual (or you restructure so "moving" is just a status field in a database, not a literal page move).

---

## Where It Earns Its Token Cost

**Writing structured release notes.** The agent generates grouped, formatted release notes and posts them as a Notion page. The block structure comes through cleanly, the page is immediately shareable, and it took the agent two minutes instead of you thirty.

**Meeting summary automation.** Paste a transcript or rough notes into the conversation; the agent writes a structured summary — decisions, action items, attendees — directly to a Notion page in your meeting database. The summary is searchable and linked to the date.

**Spec document creation.** The agent reads requirements from your `AGENTS.md` or a feature description, expands them into a structured Notion spec with sections, acceptance criteria, and open questions.

**Database item creation.** For project tracking in Notion databases — adding tasks with due dates and assignees, logging incidents with structured fields — the MCP write path is clean and reliable.

---

## Where CLI Wins

**Reading a known spec page for orientation.** If your agent just needs to read one page at session start to understand what it's working on, cache it locally. One API call at session start, then the agent reads a flat file for the rest of the session. No MCP overhead per request.

Here's a session-start hook that caches a specific Notion page:

```bash
#!/usr/bin/env bash
# bin/sync-notion-context
# Run at session start

set -euo pipefail

PAGE_ID="${NOTION_SPEC_PAGE_ID}"  # set in your shell env
TOKEN="${NOTION_API_KEY}"

# Fetch page blocks and extract plain text
curl -s \
  -H "Authorization: Bearer $TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  "https://api.notion.com/v1/blocks/$PAGE_ID/children?page_size=100" \
  | jq -r '
    .results[] |
    if .type == "paragraph" then
      .paragraph.rich_text[].plain_text
    elif .type == "heading_2" then
      "\n## " + .heading_2.rich_text[].plain_text
    elif .type == "heading_3" then
      "\n### " + .heading_3.rich_text[].plain_text
    elif .type == "bulleted_list_item" then
      "- " + .bulleted_list_item.rich_text[].plain_text
    else empty end
  ' \
  > .notion-context.md 2>/dev/null || true

echo "Notion context cached: $(wc -l < .notion-context.md) lines"
```

Add `NOTION_SPEC_PAGE_ID` to your `.env` (gitignored). The agent reads `.notion-context.md` directly — markdown, flat, fast.

---

## The Combination Pattern

Session-start hook caches the spec page as flat markdown. The agent reads `.notion-context.md` for orientation — free, no MCP overhead. The agent uses the Notion MCP only when writing structured output back.

Add this to `AGENTS.md`:

```markdown
## Notion integration

**For reading context:** read `.notion-context.md` (refreshed at session start).
Do not use the Notion MCP to re-fetch the spec page mid-session.

**For writes only:** use the Notion MCP to:
- Create meeting summary pages in the "Meeting Notes" database
- Write release notes pages to the "Releases" section
- Add items to the "Tasks" database

Spec page ID: <your-page-id>
Meeting Notes database ID: <your-database-id>
```

Reads are free. Writes go through MCP where they need the structure. The session costs what it should.

---

## Coming next

Post 4 puts Jira and Notion MCP together in a real end-to-end automation: automating release notes from git log to structured Notion page and Jira epic update. That's where the individual setup steps start earning their keep.
