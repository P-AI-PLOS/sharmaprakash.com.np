---
draft: false
title: "MCP vs CLI: The Token Cost You're Not Tracking"
date: "2026-04-18T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Every MCP tool call ships your entire tool schema to the model. On a long session that's thousands of tokens before you've done anything. CLI tools don't have that problem."
cover: "/images/blog/ai/mcp-vs-cli-token-cost.png"
thumb: "/images/blog/ai/mcp-vs-cli-token-cost.png"
last_modified_at: "2026-05-27"
use_featured_image: true
series: ai-tooling
seriesOrder: 1
---

You added four MCP servers to your Claude setup — Jira, Notion, GitHub, and a database connector. The responses feel slightly slower. Your API bill crept up 30%. You haven't changed any of your tasks or prompts. What changed?

The answer is invisible unless you know where to look: every single request now ships thousands of tokens of tool schema before your actual prompt even starts. You didn't add workload. You added overhead.

This post is about understanding that overhead, when MCP is worth it, and when a plain CLI call is the right move. If you're building toward the kind of setup described in [The Agentic Developer's Field Guide](/ai/2026-04-07-agentic-developer-field-guide/), this decision matters from day one.

---

## What MCP Actually Is

The Model Context Protocol is a standard for connecting AI agents to external tools — Jira, Notion, GitHub, databases — via a server process. When you configure an MCP server, you're giving the model a structured, bidirectional channel to an external system. The model can read data, write data, trigger actions, and get structured results back.

It's genuinely powerful. The problem is the cost structure.

---

## The Token Math

Every MCP server you have active ships its full tool schema in every request's context window. Tool schema means: tool names, descriptions, parameter definitions, optional enum values, examples. It adds up faster than you'd expect.

A moderately-featured MCP server exposes maybe 10–15 tools. Each tool description runs 80–150 tokens once you include the name, description, and parameter schema. That's 1,000–2,000 tokens per server.

Four servers? You're looking at 4,000–8,000 tokens of overhead on every request before your prompt, before the conversation history, before anything. On a long session with 40–50 exchanges, you've spent 160,000–400,000 tokens on tool schema that you're not using most of the time.

On Claude Sonnet this costs roughly $0.50–$1.50 per long session purely in schema overhead. It's not catastrophic, but it's also not nothing — and it compounds across sessions.

---

## What CLI Tools Are

Shell commands. The agent calls them via `Bash`. No schema overhead. The agent runs `gh issue list` or reads a local cache file or pipes `jq` over a JSON response. The model knows how to use shell tools generically; it doesn't need a per-tool schema registered at session start.

```bash
# Read current sprint from local cache — zero token overhead
jq '.[] | select(.status=="In Progress") | {key, summary}' .sprint-cache.json

# List open GitHub issues — one bash call, no schema
gh issue list --state open --assignee @me --json number,title,labels
```

These calls cost exactly what they cost: the tokens in the command itself and the tokens in the output. No structural overhead registered at session start.

---

## The Decision Framework

The question isn't "MCP or CLI?" as a global setting. It's a per-task decision.

| Use MCP when… | Use CLI when… |
|---|---|
| The tool has no good CLI | A CLI exists and is well-documented |
| You need structured data back (not just text) | Plain text or JSON output is sufficient |
| The integration handles auth complexity (OAuth, pagination) | A simple `curl` + API token works |
| The agent needs to *write* back (create ticket, update page) | You only need to *read* data |
| You're doing this operation many times per session | It's a one-off orientation query |
| Error handling and retries matter | A failed call is acceptable to just retry manually |

The key insight: reads and writes have different value propositions. MCP's structured, reliable channel is most justified when you're *writing* back to an external system. For reads — especially orientation reads at session start — CLI often wins.

---

## Practical Examples

**Jira**

Creating a ticket from a spec: MCP. The structured fields, the project selection, the assignee lookup — MCP handles this cleanly.

Reading the current sprint to orient the agent: `curl` + `jq` to a local cache file. One call, run once per day by a session-start hook. The agent reads `.sprint-cache.json` directly on every subsequent request. Zero MCP overhead.

**Notion**

Writing release notes or a meeting summary as a structured page: MCP. You want the block structure, the database properties, the formatting to come through correctly.

Reading a spec page for context: cache it to `.notion-context.md` at session start. The agent reads a flat markdown file for the rest of the session.

**GitHub**

Checking PR status, reading issue lists, viewing file contents: `gh` CLI. GitHub's CLI is excellent and the agent knows how to use it.

Creating a PR with specific reviewers, labels, and linked issues from structured data: MCP might be worth it if you're doing this repeatedly in automated flows.

---

## The Hybrid Pattern

Use MCP for writes. Use CLI for reads. This roughly halves the overhead on read-heavy sessions, which is most development sessions.

In your `AGENTS.md` or `.claude/rules/`, make this explicit:

```markdown
## Tool selection

- Read sprint/issue data from `.sprint-cache.json` (refreshed by session-start hook)
- Read Notion spec context from `.notion-context.md` (refreshed by session-start hook)
- Use Jira MCP only for: creating tickets, updating status, adding comments
- Use Notion MCP only for: creating pages, updating database items
- Use `gh` CLI for all GitHub reads (issues, PRs, file contents)
```

The agent follows explicit rules. Write the rules.

---

## Auditing Your Current Setup

Run `cat .claude/settings.json` and count the entries under `mcpServers`. That's your baseline overhead. For each server, ask: am I using this for reads, writes, or both?

Disable one server for a full day session. Watch whether anything breaks. If nothing breaks, the server was overhead for no benefit. If something breaks, you've identified a genuine dependency.

The goal isn't to eliminate MCP. It's to be deliberate about it. MCP is powerful infrastructure. It's also a recurring cost that compounds silently across every session you run. Know what you're paying for.

---

## Coming next

Post 2 covers the Jira MCP server specifically — installation, configuration, what it does well, and how to set up the local cache pattern that makes the reads cheap. If Jira is part of your workflow, that's where to go next.
