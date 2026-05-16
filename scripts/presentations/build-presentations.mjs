#!/usr/bin/env node
/**
 * Build Marp decks in src/content/presentations/ into public/presentations/<slug>/.
 *
 * Emits:
 *   public/presentations/<slug>/index.html
 *   public/presentations/<slug>/slides.pdf   (requires Chromium; skipped on failure)
 *   public/presentations/<slug>/thumb.png    (first-slide image when available)
 *   public/presentations/manifest.json       (source-hash record for `check`)
 *
 * Not wired into `pnpm build`. Run explicitly when a deck changes.
 */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..", "..");

const SRC_DIR = join(repoRoot, "src", "content", "presentations");
const OUT_DIR = join(repoRoot, "public", "presentations");
const THEME = join(repoRoot, "src", "styles", "marp-theme.css");
const MANIFEST = join(OUT_DIR, "manifest.json");

const sha256 = (data) => createHash("sha256").update(data).digest("hex");

function discoverDecks() {
  if (!existsSync(SRC_DIR)) return [];
  return readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      slug: f.replace(/\.md$/, ""),
      file: join(SRC_DIR, f),
    }));
}

function runMarp(args) {
  const result = spawnSync("pnpm", ["exec", "marp", ...args], {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
  return result.status === 0;
}

function build() {
  const decks = discoverDecks();
  if (!decks.length) {
    console.log("No decks found in src/content/presentations/.");
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = { decks: {} };

  for (const deck of decks) {
    const outSubdir = join(OUT_DIR, deck.slug);
    mkdirSync(outSubdir, { recursive: true });

    const source = readFileSync(deck.file);
    const hash = sha256(source);

    console.log(`\n→ Building ${deck.slug}`);

    const htmlOk = runMarp([
      deck.file,
      "--theme",
      THEME,
      "--html",
      "--allow-local-files",
      "--output",
      join(outSubdir, "index.html"),
    ]);
    if (!htmlOk) {
      console.error(`  HTML render failed for ${deck.slug}`);
      process.exitCode = 1;
      continue;
    }

    const pdfOk = runMarp([
      deck.file,
      "--theme",
      THEME,
      "--pdf",
      "--allow-local-files",
      "--output",
      join(outSubdir, "slides.pdf"),
    ]);
    if (!pdfOk) {
      console.warn(`  PDF render failed for ${deck.slug} (skipping — Chromium may be unavailable).`);
    }

    const pngOk = runMarp([
      deck.file,
      "--theme",
      THEME,
      "--image",
      "png",
      "--image-scale",
      "1",
      "--allow-local-files",
      "--output",
      join(outSubdir, "thumb.png"),
    ]);
    if (!pngOk) {
      console.warn(`  Thumbnail render failed for ${deck.slug} (skipping).`);
    }

    manifest.decks[deck.slug] = {
      source: `src/content/presentations/${deck.slug}.md`,
      sha256: hash,
      builtAt: new Date().toISOString(),
      artifacts: {
        html: existsSync(join(outSubdir, "index.html")),
        pdf: existsSync(join(outSubdir, "slides.pdf")),
        thumb: existsSync(join(outSubdir, "thumb.png")) ? "thumb.png" : null,
      },
    };
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nWrote ${MANIFEST}`);
}

build();
