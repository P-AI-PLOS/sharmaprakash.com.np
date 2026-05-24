#!/usr/bin/env node
/**
 * Build a NotebookLM-ready source file for a single podcast episode.
 *
 *   node scripts/podcast/bundle.mjs <series-slug> <order>
 *   node scripts/podcast/bundle.mjs ai-coding-setup 1
 *
 * Reads the matching post from src/content/posts/, strips MDX-ish
 * artifacts, and writes podcast/<series>/ep-<NN>-source.md with a
 * "two-host discussion" preamble that NotebookLM can use as the sole
 * source for an Audio Overview.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const postsDir = join(repoRoot, "src", "content", "posts");

const [seriesSlug, orderArg] = process.argv.slice(2);
if (!seriesSlug || !orderArg) {
  console.error("usage: bundle.mjs <series-slug> <order>");
  process.exit(1);
}
const order = Number(orderArg);
const pad = String(order).padStart(2, "0");

const match = readdirSync(postsDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const { data, content } = matter(readFileSync(join(postsDir, f), "utf8"));
    return { file: f, data, content };
  })
  .find(({ data }) => data.series === seriesSlug && Number(data.seriesOrder) === order);

if (!match) {
  console.error(`No post found for series=${seriesSlug} order=${order}`);
  process.exit(1);
}

const { data, content } = match;

// Strip MDX/HTML noise that NotebookLM doesn't need to "speak."
const cleaned = content
  .replace(/^import\s+.*$/gm, "")
  .replace(/<[^>]+>/g, "")
  .replace(/:::\w+[\s\S]*?:::/g, "")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const preamble = `# Podcast brief — ${data.title}

You are scripting a two-host technical podcast aimed at working software developers.
Treat this document as the **only** source. Do not invent examples that aren't here.

- Tone: curious, conversational, a little dry. No hype, no corporate filler.
- Length target: 10–14 minutes.
- Open with a 15-second cold-open framing the problem.
- Close with one concrete "try this tomorrow" takeaway.
- When code or commands appear, describe them by intent — do not read syntax aloud
  character-by-character.

Episode metadata:
- Series: ${seriesSlug}
- Episode: ${order}
- Original essay: ${data.title}
- Published: ${data.date}

---

`;

const outDir = join(repoRoot, "podcast", seriesSlug);
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `ep-${pad}-source.md`);
writeFileSync(outFile, preamble + cleaned + "\n");
console.log(`wrote ${outFile}`);

// Per-episode focus prompt — paste into NotebookLM's
// "What should the AI hosts focus on in this episode?" box.
const excerpt = (data.excerpt ?? "").trim();
const focus = `Two-host technical podcast, Deep Dive format, for working software developers.
Cover the source in order. Conversational, a little dry — no hype.
Describe code and commands by intent, not character-by-character.

Focus of this episode: ${excerpt || data.title}

Open with a 15-second cold-open framing the specific problem the source
identifies. Close with one concrete "try this tomorrow" takeaway the listener
can act on before their next coding session.
`;
const focusFile = join(outDir, `ep-${pad}-focus.txt`);
writeFileSync(focusFile, focus);
console.log(`wrote ${focusFile}`);
