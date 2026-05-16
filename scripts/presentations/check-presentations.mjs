#!/usr/bin/env node
/**
 * Verify that committed presentation artifacts match their markdown sources.
 *
 * Compares the sha256 of each source deck against the value recorded in
 * public/presentations/manifest.json by `presentations:build`. Exits non-zero
 * (with a clear message) on any drift, missing artifact, or missing manifest.
 *
 * Suitable for CI or a pre-commit hook. Not invoked from `pnpm build`.
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..", "..");

const SRC_DIR = join(repoRoot, "src", "content", "presentations");
const OUT_DIR = join(repoRoot, "public", "presentations");
const MANIFEST = join(OUT_DIR, "manifest.json");

const sha256 = (data) => createHash("sha256").update(data).digest("hex");

function fail(msg) {
  console.error(`presentations:check — ${msg}`);
  console.error("Run `pnpm presentations:build` and commit the generated files.");
  process.exit(1);
}

function check() {
  if (!existsSync(SRC_DIR)) {
    console.log("No src/content/presentations/ directory — nothing to check.");
    return;
  }

  const sources = readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f.toLowerCase() !== "readme.md")
    .map((f) => f.replace(/\.md$/, ""));

  if (!sources.length) {
    console.log("No decks to check.");
    return;
  }

  if (!existsSync(MANIFEST)) {
    fail(`manifest missing at ${MANIFEST}`);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST, "utf-8"));
  const recorded = manifest.decks ?? {};

  const problems = [];

  for (const slug of sources) {
    const sourcePath = join(SRC_DIR, `${slug}.md`);
    const hash = sha256(readFileSync(sourcePath));

    const rec = recorded[slug];
    if (!rec) {
      problems.push(`${slug}: source has no entry in manifest`);
      continue;
    }
    if (rec.sha256 !== hash) {
      problems.push(`${slug}: source sha256 has changed since last build`);
    }
    const html = join(OUT_DIR, slug, "index.html");
    if (!existsSync(html)) {
      problems.push(`${slug}: missing ${html}`);
    }
  }

  for (const slug of Object.keys(recorded)) {
    if (!sources.includes(slug)) {
      problems.push(`${slug}: manifest entry has no matching source markdown`);
    }
  }

  if (problems.length) {
    for (const p of problems) console.error(`  · ${p}`);
    fail(`${problems.length} issue(s) — artifacts are out of date.`);
  }

  console.log(`presentations:check — OK (${sources.length} deck(s) in sync).`);
}

check();
