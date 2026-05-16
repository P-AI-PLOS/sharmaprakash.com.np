---
title: "Fix mise GitHub Rate Limit with a Token"
date: "2026-06-09T10:00:00+05:45"
category: ["code-quality", "technical"]
categories:
  - technical
directory:
excerpt: "mise makes unauthenticated GitHub API calls by default. When you hit the rate limit installing tools, a personal access token (no scopes required) fixes it permanently."
cover: "/images/blog/tech-notes/mise-github-token.png"
thumb: "/images/blog/tech-notes/mise-github-token.png"
use_featured_image: true
last_modified_at: "2026-06-09T10:00:00+05:45"
tags:
  - mise
  - devtools
  - cli
---

[mise](https://mise.jdx.dev/) installs most tools by pulling release archives from GitHub. It calls the GitHub API to find the right version tag — and without authentication, those calls count against the unauthenticated rate limit (60 requests/hour per IP). On a fresh machine or after running `mise upgrade`, you'll hit it fast.

The error looks like this:

```
mise WARN  GitHub rate limit exceeded. Resets at 2026-05-16 07:49:43 +05:45
mise WARN  No GitHub token was found, so mise is making unauthenticated requests
mise ERROR Failed to install aqua:openai/codex@latest: HTTP status client error (403 Forbidden)
```

## The fix

Create a [personal access token](https://github.com/settings/tokens) — no scopes required, read-only public access is enough — and add it to your root mise config via the `[env]` section:

```toml
# ~/.config/mise/config.toml

[env]
GITHUB_TOKEN = "github_pat_..."
```

That's it. mise exports this into its own environment automatically, no shell export needed. Authenticated requests get 5,000 calls/hour, which is effectively unlimited for tool installs.

## Why no scopes?

mise only reads public release metadata from GitHub — it never writes anything or accesses private repos. A token with zero scopes is the minimum viable credential: it authenticates your identity for rate-limit purposes without granting any permissions.

## Other supported token sources

If you prefer not to store the token in a config file, mise also reads from:

- `GITHUB_TOKEN` environment variable
- The `gh` CLI credential store (`gh auth login` sets this up automatically)
- A `credential_command` in the mise config (for secret managers like 1Password CLI)

See the [mise GitHub tokens docs](https://mise.jdx.dev/dev-tools/github-tokens.html) for the full list.
