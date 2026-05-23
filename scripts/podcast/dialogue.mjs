#!/usr/bin/env node
/**
 * Render a two-host dialogue script with ElevenLabs Text-to-Dialogue.
 *
 *   node scripts/podcast/dialogue.mjs <series-slug> <NN> [--dry-run] [--test]
 *   node scripts/podcast/dialogue.mjs hooks-subagents-skills 00 --test
 *
 * Reads:  podcast/<series>/ep-<NN>-dialogue.md
 * Writes: podcast/<series>/ep-<NN>-dialogue.json  (committed snapshot of API input)
 *         podcast/<series>/ep-<NN>-raw.mp3        (gitignored — feeds finalize.sh)
 *
 * Frontmatter: `voices:` is a flat map of speaker label → voice_id.
 * Body: lines that begin with `**Name:**` start a new turn; continuation
 *       lines are appended to the current turn.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");

// Lazy-load .env from repo root so users don't have to `source` it. Only sets
// variables that aren't already present in process.env (CLI exports win).
const envFile = join(repoRoot, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, k, rawV] = m;
    if (process.env[k] !== undefined) continue;
    const v = rawV.replace(/^['"]|['"]$/g, "");
    process.env[k] = v;
  }
}

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const [seriesSlug, nnArg] = positional;

if (!seriesSlug || !nnArg) {
  console.error("usage: dialogue.mjs <series-slug> <NN> [--dry-run] [--test]");
  process.exit(1);
}
const nn = String(nnArg).padStart(2, "0");
const dryRun = flags.has("--dry-run");
const testMode = flags.has("--test");

const dir = join(repoRoot, "podcast", seriesSlug);
const src = join(dir, `ep-${nn}-dialogue.md`);
const jsonOut = join(dir, `ep-${nn}-dialogue.json`);
const rawOut = join(dir, `ep-${nn}-raw.mp3`);

const raw = readFileSync(src, "utf8");
const { data: fm, content } = matter(raw);

const voices = fm.voices ?? {};
if (!voices || typeof voices !== "object" || Object.keys(voices).length === 0) {
  console.error(`${src}: frontmatter must define a non-empty 'voices' map.`);
  process.exit(1);
}
const voiceSettings = fm.voice_settings ?? {};

const inputs = [];
let current = null;
for (const line of content.split("\n")) {
  const m = line.match(/^\*\*([^*:]+):\*\*\s*(.*)$/);
  if (m) {
    if (current && current.text.trim()) inputs.push(current);
    const speaker = m[1].trim();
    const voice_id = voices[speaker];
    if (!voice_id) {
      console.error(`${src}: speaker "${speaker}" has no voice_id in frontmatter.`);
      process.exit(1);
    }
    current = { speaker, voice_id, text: m[2] };
  } else if (current) {
    const stripped = line.trim();
    if (stripped) current.text += (current.text.endsWith(" ") ? "" : " ") + stripped;
  }
}
if (current && current.text.trim()) inputs.push(current);

if (inputs.length === 0) {
  console.error(`${src}: no dialogue lines found. Use **Speaker:** text.`);
  process.exit(1);
}

// Text-to-Dialogue only supports eleven_v3 right now. --test is a semantic
// flag meaning "render the cheap ep-00 script" — credit savings come from
// the shorter dialogue, not a model swap.
const model_id = (fm.model || "eleven_v3").trim();
if (testMode) console.log("(--test mode — using shorter ep-00 script for cheap iteration)");

const apiBody = {
  model_id,
  inputs: inputs.map(({ speaker, text, voice_id }) => {
    const entry = { text: text.trim(), voice_id };
    if (voiceSettings[speaker]) entry.voice_settings = voiceSettings[speaker];
    return entry;
  }),
};

mkdirSync(dir, { recursive: true });
writeFileSync(jsonOut, JSON.stringify({ ...apiBody, _speakers: inputs.map((i) => i.speaker) }, null, 2) + "\n");
console.log(`wrote ${jsonOut}  (${inputs.length} turns, model=${model_id})`);

if (dryRun) {
  console.log("--dry-run: skipping API call.");
  process.exit(0);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY is not set. Export it or pass --dry-run.");
  process.exit(1);
}

console.log(`→ POST https://api.elevenlabs.io/v1/text-to-dialogue  (model=${model_id})`);
const res = await fetch("https://api.elevenlabs.io/v1/text-to-dialogue", {
  method: "POST",
  headers: {
    "xi-api-key": apiKey,
    "content-type": "application/json",
    accept: "audio/mpeg",
  },
  body: JSON.stringify(apiBody),
});

if (!res.ok) {
  const errText = await res.text();
  console.error(`ElevenLabs API error ${res.status}: ${errText}`);
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
writeFileSync(rawOut, buf);
console.log(`wrote ${rawOut}  (${(buf.length / 1024).toFixed(1)} KB)`);
console.log(`next: pnpm podcast:finalize ${seriesSlug} ${nn}`);
