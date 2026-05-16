---
marp: true
theme: sharmaprakash
paginate: true
title: "From scripts to systems"
description: "A short demo deck — the shape of a Marp presentation on this site."
author: "Prakash Poudel Sharma"
date: 2026-05-16
---

<!-- _class: lead -->

# From scripts to systems

A short demo deck — Marp on **sharmaprakash.com.np**.

Prakash Poudel Sharma · Ruby Nepal · 2026

---

## Why a deck in the repo?

- Markdown is the source of truth.
- The site theme renders it; no external slide tool to chase.
- `pnpm presentations:build` produces HTML + PDF.
- Generated files are committed so deploys stay fast.

---

## How it fits the site

1. Editable source: `src/content/presentations/<slug>.md`
2. Theme: `src/styles/marp-theme.css` (mirrors design tokens)
3. Output: `public/presentations/<slug>/index.html` and `slides.pdf`
4. Listing: `/presentations/`

---

## A code slide

```rb
# A tiny Ruby aside, in keeping with the reference deck.
def greet(name)
  "Namaste, #{name}"
end

puts greet("Kathmandu")
```

The theme keeps code blocks calm; the accent only appears under headings and on
emphasis.

---

## What this deck is **not**

- Not a port of any third-party deck.
- Not a marketing landing page in disguise.
- Not wired into `pnpm build` — generation is explicit.

---

<!-- _class: lead -->

# Thanks

Source: `src/content/presentations/ruby-nepal-example.md`

`pnpm presentations:build` to regenerate.
