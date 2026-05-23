#!/usr/bin/env node
/**
 * Render a single-voice monologue with ElevenLabs Text-to-Speech.
 *
 *   node scripts/podcast/monologue.mjs <series-slug> <NN> [--dry-run]
 *   node scripts/podcast/monologue.mjs greenfield 02
 *
 * Reads:  podcast/<series>/ep-<NN>-monologue.md
 * Writes: podcast/<series>/ep-<NN>-monologue.json  (committed API-body snapshot)
 *         podcast/<series>/ep-<NN>-raw.mp3         (gitignored — feeds finalize.sh)
 *
 * Frontmatter shape:
 *   voice: { name: "Prakash", id: "7a94qxTnWOxNUMLOxXGR" }
 *   voice_settings: { stability: 0.3, similarity_boost: 0.75, style: 0.65, use_speaker_boost: true }
 *   model: eleven_v3
 *
 * Body: plain prose. Paragraphs and punctuation drive pacing. ElevenLabs v3
 * inline tags ([excited], [laughs], [short pause]) work.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");

// Lazy-load .env from repo root.
const envFile = join(repoRoot, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, k, rawV] = m;
    if (process.env[k] !== undefined) continue;
    process.env[k] = rawV.replace(/^['"]|['"]$/g, "");
  }
}

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const [seriesSlug, nnArg] = positional;

if (!seriesSlug || !nnArg) {
  console.error("usage: monologue.mjs <series-slug> <NN> [--dry-run]");
  process.exit(1);
}
const nn = String(nnArg).padStart(2, "0");
const dryRun = flags.has("--dry-run");

const dir = join(repoRoot, "podcast", seriesSlug);
const src = join(dir, `ep-${nn}-monologue.md`);
const jsonOut = join(dir, `ep-${nn}-monologue.json`);
const rawOut = join(dir, `ep-${nn}-raw.mp3`);

const raw = readFileSync(src, "utf8");
const { data: fm, content } = matter(raw);

const voice = fm.voice;
if (!voice || !voice.id) {
  console.error(`${src}: frontmatter must define 'voice: { name, id }'.`);
  process.exit(1);
}

// Collapse the body to clean prose. Preserve paragraph breaks (double newline
// → "\n\n") and let the model handle pacing from punctuation + tags.
const text = content
  .split(/\n\n+/)
  .map((p) => p.replace(/\s+/g, " ").trim())
  .filter(Boolean)
  .join("\n\n");

if (!text) {
  console.error(`${src}: body is empty.`);
  process.exit(1);
}

const model_id = (fm.model || "eleven_v3").trim();
const voice_settings = fm.voice_settings || {};

const apiBody = {
  text,
  model_id,
  voice_settings,
};

mkdirSync(dir, { recursive: true });
writeFileSync(jsonOut, JSON.stringify({ ...apiBody, _voice: voice }, null, 2) + "\n");
console.log(`wrote ${jsonOut}  (${text.length} chars, model=${model_id}, voice=${voice.name})`);

if (dryRun) {
  console.log("--dry-run: skipping API call.");
  process.exit(0);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY is not set. Export it or pass --dry-run.");
  process.exit(1);
}

const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`;
console.log(`→ POST ${url}  (model=${model_id})`);
const res = await fetch(url, {
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
