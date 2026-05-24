---
draft: false
title: "Setting Up the Jira MCP Server (And When Not To)"
date: "2026-04-19T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Step-by-step Jira MCP setup, what it does well, where it burns tokens unnecessarily, and when a simple jq query on a local cache beats the whole thing."
cover: "/images/blog/ai/jira-mcp-server-setup.png"
thumb: "/images/blog/ai/jira-mcp-server-setup.png"
last_modified_at: "2026-05-28"
use_featured_image: true
series: ai-tooling
seriesOrder: 2
---

What I actually want: my agent reads the current sprint, picks up the right ticket, understands what "done" looks like, and doesn't ask me to copy-paste the ticket description into the conversation. That's the baseline I'm optimizing for.

Jira MCP gets you there. But it comes with token overhead — and for a lot of what you do with Jira, a local JSON cache and a `jq` query does the same job for free. This post covers both: the full MCP setup, and the lighter-weight alternative for reads.

---

## Prerequisites

- Jira Cloud account with at least one project
- An API token — generate one at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
- Node.js 18+ installed (`node --version`)
- Claude Code with MCP support

Your Jira workspace URL will look like `https://yourcompany.atlassian.net`. Keep that handy.

---

## Installation

The MCP server for Atlassian tools is published as an npm package. You don't need to install it globally — Claude Code will run it via `npx` on demand.

Add this to `.claude/settings.json` (the file checked into your repo):

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-atlassian"],
      "env": {
        "ATLASSIAN_URL": "https://yourcompany.atlassian.net",
        "ATLASSIAN_EMAIL": "you@company.com",
        "ATLASSIAN_API_TOKEN": ""
      }
    }
  }
}
```

The `ATLASSIAN_API_TOKEN` value stays blank in the committed file. The actual token goes in `.claude/settings.local.json`, which you add to `.gitignore`:

```json
{
  "mcpServers": {
    "jira": {
      "env": {
        "ATLASSIAN_API_TOKEN": "your-actual-token-here"
      }
    }
  }
}
```

Claude Code merges these two files, so the token is available to the server but never committed. If you're on a team, each developer generates their own token and sets it locally.

Verify it's running: start a Claude Code session and ask "what Jira projects do I have access to?" If the MCP server is working, you'll get a list. If not, check `claude mcp list` for error output.

---

## What the Jira MCP Enables

Once configured, the agent has access to these operations:

| Tool | What it does |
|---|---|
| `search_issues` | JQL search across your Jira instance |
| `get_issue` | Full issue detail by key (e.g. `PROJ-123`) |
| `create_issue` | Create a new ticket with fields |
| `update_issue` | Edit summary, description, status, assignee, etc. |
| `add_comment` | Add a comment to an issue |
| `get_projects` | List accessible projects |
| `get_boards` | List Scrum/Kanban boards |
| `get_sprints` | List sprints for a board (active, future, closed) |

That's a solid surface area. The agent can navigate your entire Jira instance without you touching the browser.

---

## Where It Earns Its Token Cost

**Creating tickets from a spec.** The agent reads a Notion page or a local markdown spec, extracts work items, and creates Jira tickets with the right project, type, priority, and description. This is genuinely tedious to do by hand. The MCP write path is worth every token.

**Updating ticket status from a completed task.** When the agent finishes a coding task, it can update the linked Jira ticket to "In Review" and add a comment with the PR link. One less thing to do before standup.

**Posting a standup comment.** After generating a daily summary of what was completed, the agent posts it as a comment on the sprint epic. Automated standup notes, logged in Jira, searchable later.

**Linking PRs to tickets.** On merge, a hook can trigger the agent to find the related Jira ticket and add the PR URL as a remote link. Your Jira history becomes a searchable record of what shipped when.

---

## Where It Burns Tokens Unnecessarily

**Orientation queries at session start.** Asking "what's in the current sprint?" via MCP at the beginning of every session is expensive. That query goes through the MCP server, returns structured data, and costs tokens — not just for the data, but for the schema overhead discussed in [Post 1](/ai/2026-04-18-mcp-vs-cli-token-cost/).

If you're doing this once per day or per session, cache it locally instead.

**Listing all projects.** The agent will sometimes try to list projects to orient itself. If you only ever work in one or two projects, tell it explicitly in `AGENTS.md` and it won't need to enumerate them.

**Reading ticket descriptions mid-session.** If the agent needs to refer back to a ticket description it already read, it shouldn't re-fetch via MCP. Tell it to keep relevant ticket data in its working context, not to re-query.

---

## The Leaner Alternative for Reads

Set up a daily sync script that pulls the current sprint into a local JSON file. The agent reads this file directly — no MCP call, no overhead.

```bash
#!/usr/bin/env bash
# bin/sync-sprint
# Run once per day or as a session-start hook

set -euo pipefail

JIRA_EMAIL="${ATLASSIAN_EMAIL}"
JIRA_TOKEN="${ATLASSIAN_API_TOKEN}"
JIRA_URL="${ATLASSIAN_URL}"
BOARD_ID="42"   # your board ID — find it in your Jira board URL
SPRINT_ID="$(curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
  "$JIRA_URL/rest/agile/1.0/board/$BOARD_ID/sprint?state=active" \
  | jq -r '.values[0].id')"

curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
  "$JIRA_URL/rest/agile/1.0/sprint/$SPRINT_ID/issue?maxResults=50" \
  | jq '[.issues[] | {
      key: .key,
      summary: .fields.summary,
      status: .fields.status.name,
      assignee: (.fields.assignee.displayName // "unassigned"),
      priority: .fields.priority.name,
      storyPoints: .fields.story_points
    }]' \
  > .sprint-cache.json

echo "Sprint cache updated: $(jq length .sprint-cache.json) issues"
```

Add `.sprint-cache.json` to `.gitignore`. Add this script to your session-start hook so it runs automatically before Claude Code loads.

The agent reads `.sprint-cache.json` for orientation:

```bash
# Agent can run this directly — no MCP, no schema overhead
jq '.[] | select(.status == "In Progress")' .sprint-cache.json
jq '.[] | select(.assignee == "Prakash Poudel")' .sprint-cache.json
```

---

## The AGENTS.md Rule

Make the read/write split explicit so the agent doesn't fall back to MCP for reads:

```markdown
## Jira integration

**For reading sprint data:** use `.sprint-cache.json`. This is refreshed automatically
at session start. Never use the Jira MCP to query sprint issues mid-session.

**For writes only:** use the Jira MCP for:
- Creating new tickets (`create_issue`)
- Updating ticket status (`update_issue`)
- Adding comments with PR links (`add_comment`)

Current project: MYPROJ
Current board ID: 42
```

The agent follows this. The session runs leaner. You get the same outcome.

---

## Security Note

Never put your API token in a committed file. The `.claude/settings.local.json` pattern handles this. If you're using environment variables instead (e.g. sourced from a `.env` file or a secrets manager like 1Password CLI), reference them as `$ATLASSIAN_API_TOKEN` in your shell environment and the MCP server will pick them up.

Rotate your API token if it ever appears in a git diff. Atlassian tokens are account-level — a leaked token has access to everything your account can see.

---

## Coming next

Post 3 covers the Notion MCP server — same pattern, different quirks. Notion's block-based content model creates some interesting edge cases that are worth knowing before your first agent session.
