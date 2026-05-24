---
draft: false
title: "Automating Release Notes with AI Agents"
date: "2026-04-21T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "From git log to structured release notes in Notion and Jira — a real end-to-end automation flow, not a toy example."
cover: "/images/blog/ai/automating-release-notes-ai-agents.png"
thumb: "/images/blog/ai/automating-release-notes-ai-agents.png"
last_modified_at: "2026-05-30"
use_featured_image: true
series: ai-tooling
seriesOrder: 4
---

Every release, someone on the team reads through git log, groups commits by type, writes the release notes, posts them to Notion, updates the Jira epic, and creates the git tag. It takes 30–45 minutes. It's exactly the kind of work that's boring enough to do badly: squash a fix into the wrong category, miss a breaking change, forget to update the Jira epic because standup started.

This post is a real end-to-end automation for that workflow — not a toy example. It uses the Jira MCP (Post 2), the Notion MCP (Post 3), and beads for task tracking. You can adapt it to whatever subset of those tools you actually use.

---

## What the Agent Needs

Three inputs:

1. **Git log since the last tag** — conventional commits, one per line
2. **Closed tasks since the last release** — human-readable task titles, not just commit hashes
3. **The release notes template** — your structure, your sections, your voice

The agent's job is to group, write, post, and tag. The human's job is to decide the version number and give final approval before the tag lands.

---

## The Inputs

### Git log

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline --no-merges
```

`git describe --tags --abbrev=0` gives you the most recent tag. `--no-merges` skips merge commits that would otherwise clutter the list. This gives you something like:

```
a1b2c3d feat: add OAuth2 support for GitHub integration
d4e5f6a fix: correct pagination offset in sprint sync
7890abc chore: upgrade Tailwind to v3.4.17
b1c2d3e feat: add beads export command
```

### Closed tasks from beads

If you're using [beads for local task tracking](/ai/2026-04-16-beads-local-first-task-graph/), closed tasks give you the human-readable work items that correspond to these commits. Beads stores issues as newline-delimited JSON:

```bash
# All tasks closed since the last release date
bd export | jq -c 'select(.status=="closed" and .closed_at > "2026-05-01T00:00:00Z")'
```

This output pairs with the git log: commits tell you what changed at the code level, closed beads tell you what the user-facing work items were. Together they give the agent enough context to write notes that mean something to someone who wasn't watching the commits.

If you're not using beads, a GitHub issues query or your Jira sprint data works the same way — any list of completed work items with human-readable titles.

### The template

Store your release notes template as a local markdown file (`.claude/templates/release-notes.md`) or as a Notion page. The agent reads it for structure:

```markdown
## Release Notes Template

# [Product] v{VERSION} — {DATE}

## What's new
{feat commits grouped here}

## Bug fixes
{fix commits here}

## Under the hood
{chore, refactor, build commits here}

## Breaking changes
{any commits with BREAKING CHANGE footer}

---
Full changelog: {github-compare-url}
```

---

## The Agent Flow

```
1. git log <last-tag>..HEAD --oneline --no-merges
2. bd export | jq 'select(closed since last tag)'
3. Agent: group commits by conventional type, merge with bead titles
4. Agent: write structured notes using the template
5. Agent: create Notion page via Notion MCP
6. Agent: update Jira release epic via Jira MCP
7. Agent: git tag v<version> -m "Release v<version>"
```

Steps 1–4 are read and write operations on local data. Steps 5 and 6 are MCP writes — justified, because you're creating structured content in external systems. Step 7 is a local git operation.

---

## The Rule That Drives It

Store this in `.claude/rules/release.md` or directly in `AGENTS.md`:

```markdown
## Release workflow

When asked to "cut a release" or "prepare release notes":

### Step 1: gather inputs
Run these commands:
```
git log $(git describe --tags --abbrev=0)..HEAD --oneline --no-merges
bd export | jq -c 'select(.status=="closed")'
```
Note the last tag and its date.

### Step 2: group and write
Group commits by conventional commit prefix:
- `feat:` → What's new
- `fix:` → Bug fixes
- `chore:`, `refactor:`, `build:`, `ci:` → Under the hood
- Any commit with `BREAKING CHANGE:` → Breaking changes section (always first)

For each feat or fix, check if there's a matching closed bead with a better
human-readable description. Use the bead title if it's more descriptive.

Use the template in `.claude/templates/release-notes.md`.

### Step 3: write to Notion
Create a page in the "Releases" database using the Notion MCP.
Parent: {your-releases-database-id}
Title: "{Product} v{VERSION} — {DATE}"

### Step 4: update Jira
Update the release epic {PROJ-000} using the Jira MCP:
- Set status to "Done"
- Add a comment with the Notion page URL and git tag

### Step 5: wait for approval
Print the draft release notes and ask: "Version number? (patch/minor/major from
current {LAST_TAG}). Approve to tag."

### Step 6: tag
After approval:
git tag v{VERSION} -m "Release v{VERSION}"
```
```

---

## Handling Edge Cases

**Squashed commits.** If your team squashes on merge, the squash commit message needs the conventional commit type. Enforce this in your GitHub or GitLab merge settings. Without it, the agent sees "Merge PR #42" and has nothing useful to group.

**Hotfix branches.** For hotfixes, the version suffix changes: `v1.2.1-hotfix.1`. Tell the agent in the rule: "If the current branch is named `hotfix/*`, use `-hotfix.N` suffix and only include commits from the hotfix branch."

**Breaking changes.** Conventional commits support a `BREAKING CHANGE:` footer in the commit body. The git log `--oneline` output won't show this. For breaking change detection, use:

```bash
git log $(git describe --tags --abbrev=0)..HEAD --format="%H %s%n%b" --no-merges \
  | grep -B1 "BREAKING CHANGE"
```

Add this as an additional step in the rule when the release might contain breaking changes.

**Missing conventional commit types.** Developers forget. Add a fallback in the rule: "If a commit doesn't have a recognisable prefix, put it under 'Other changes' rather than dropping it."

---

## What to Keep Human

**The version number.** Patch, minor, or major — this is a judgment call about user impact. The agent proposes based on what it sees (breaking change → major, new feat → minor, only fixes → patch), but you confirm.

**The "is this ready to ship?" call.** The agent doesn't know if the feature is actually working in staging, if the QA cycle finished, if the team lead signed off. It knows what committed. The release decision is yours.

**Final read of the notes.** Read them before they go live. The agent will occasionally misclassify a commit or use a technical description where a user-facing one would be better. Thirty seconds of review before the tag is worth it.

---

## The Cost

One agent session, 15–20 minutes wall time (including the Notion and Jira API calls), roughly $0.15–0.35 in API tokens depending on commit volume and note length.

The 30-minute manual task now costs you about two minutes: invoke the agent, read the draft, type the version number, approve. The drudgery is automated. The judgment stays with you.

---

## Coming next

Post 5 introduces Paperclip — what happens when you're running multiple agents (a coding agent, an inbox agent, a research agent) and need org-level visibility into budgets, decisions, and what each one is doing.
