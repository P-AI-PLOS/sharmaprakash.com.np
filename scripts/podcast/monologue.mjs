#!/usr/bin/env node
/**
 * Render a single-voice monologue with ElevenLabs Text-to-Speech.
 *
 *   node scripts/podcast/monologue.mjs <series-slug> <NN> [--dry-run] [--chunk N[,M,...]] [--force]
 *   node scripts/podcast/monologue.mjs greenfield 02
 *   node scripts/podcast/monologue.mjs greenfield 02 --chunk 4     # re-render only chunk 4
 *   node scripts/podcast/monologue.mjs greenfield 02 --force       # re-render every chunk
 *
 * Reads:  podcast/<series>/ep-<NN>-monologue.md
 * Writes: podcast/<series>/ep-<NN>-monologue.json  (committed API-body snapshot)
 *         podcast/<series>/ep-<NN>-chunks/MM.mp3   (gitignored — one file per chunk)
 *         podcast/<series>/ep-<NN>-chunks/MM.txt   (committed — chunk source text)
 *         podcast/<series>/ep-<NN>-raw.mp3         (gitignored — stitched chunks, feeds finalize.sh)
 *
 * Workflow: chunks render only if their MP3 is missing (so re-running is idempotent
 * and cheap). To re-roll a bad chunk, delete its MP3 or pass --chunk N. eleven_v3
 * is non-deterministic, so a second pass on a drifting chunk often comes out clean.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
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
const flags = new Map();
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith("--")) {
    const key = a.slice(2);
    const next = args[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags.set(key, next);
      i++;
    } else {
      flags.set(key, true);
    }
  } else {
    positional.push(a);
  }
}
const [seriesSlug, nnArg] = positional;

if (!seriesSlug || !nnArg) {
  console.error("usage: monologue.mjs <series-slug> <NN> [--dry-run] [--chunk N[,M,...]] [--force]");
  process.exit(1);
}
const nn = String(nnArg).padStart(2, "0");
const dryRun = flags.has("dry-run");
const force = flags.has("force");
const onlyChunks = flags.has("chunk")
  ? new Set(String(flags.get("chunk")).split(",").map((s) => parseInt(s, 10)))
  : null;

const dir = join(repoRoot, "podcast", seriesSlug);
const src = join(dir, `ep-${nn}-monologue.md`);
const jsonOut = join(dir, `ep-${nn}-monologue.json`);
const rawOut = join(dir, `ep-${nn}-raw.mp3`);
const chunksDir = join(dir, `ep-${nn}-chunks`);

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

// Per-request char limit. The public TTS endpoint caps at 5000; we leave
// headroom. Long scripts get chunked first on `---` section dividers (which
// are dropped — they're narrative breaks, not spoken content), then by
// paragraph within any oversize section. eleven_v3 hallucinates repeats when
// a single chunk gets too dense, so we keep chunks well under the limit.
const CHUNK_LIMIT = 1500;
const sections = text
  .split(/\n\n---\n\n/)
  .map((s) => s.trim())
  .filter(Boolean);
const chunks = [];
for (const section of sections) {
  if (section.length <= CHUNK_LIMIT) {
    chunks.push(section);
    continue;
  }
  let buf = "";
  for (const p of section.split("\n\n")) {
    if (buf && buf.length + 2 + p.length > CHUNK_LIMIT) {
      chunks.push(buf);
      buf = p;
    } else {
      buf = buf ? `${buf}\n\n${p}` : p;
    }
  }
  if (buf) chunks.push(buf);
}

mkdirSync(dir, { recursive: true });
writeFileSync(
  jsonOut,
  JSON.stringify({ text, model_id, voice_settings, _voice: voice, _chunks: chunks.length }, null, 2) + "\n"
);
console.log(`wrote ${jsonOut}  (${text.length} chars, ${chunks.length} chunk(s), model=${model_id}, voice=${voice.name})`);

if (dryRun) {
  console.log("--dry-run: skipping API call.");
  process.exit(0);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY is not set. Export it or pass --dry-run.");
  process.exit(1);
}

mkdirSync(chunksDir, { recursive: true });
const chunkPath = (i) => join(chunksDir, `${String(i + 1).padStart(2, "0")}.mp3`);
const chunkTextPath = (i) => join(chunksDir, `${String(i + 1).padStart(2, "0")}.txt`);

// Always (re)write the source text for each chunk so they stay in sync with the script.
for (let i = 0; i < chunks.length; i++) writeFileSync(chunkTextPath(i), chunks[i] + "\n");

const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`;
const supportsContext = !model_id.includes("v3");
for (let i = 0; i < chunks.length; i++) {
  const path = chunkPath(i);
  const num = i + 1;
  const targeted = onlyChunks ? onlyChunks.has(num) : true;
  const exists = existsSync(path);
  if (!targeted) continue;
  if (exists && !force && !onlyChunks) {
    console.log(`✓ chunk ${num}/${chunks.length}  (cached)`);
    continue;
  }
  if (exists && (force || onlyChunks)) unlinkSync(path);

  const body = {
    text: chunks[i],
    model_id,
    voice_settings,
    ...(supportsContext && i > 0 ? { previous_text: chunks[i - 1] } : {}),
    ...(supportsContext && i < chunks.length - 1 ? { next_text: chunks[i + 1] } : {}),
  };
  console.log(`→ chunk ${num}/${chunks.length}  (${chunks[i].length} chars)`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`ElevenLabs API error ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
}

// Stitch: concatenate all chunk MP3s in order. Fails loudly if any are missing.
const audioParts = [];
for (let i = 0; i < chunks.length; i++) {
  const path = chunkPath(i);
  if (!existsSync(path)) {
    console.error(`missing ${path} — run without --chunk to render all`);
    process.exit(1);
  }
  audioParts.push(readFileSync(path));
}
const merged = Buffer.concat(audioParts);
writeFileSync(rawOut, merged);
console.log(`stitched ${audioParts.length} chunk(s) → ${rawOut}  (${(merged.length / 1024).toFixed(1)} KB)`);
console.log(`next: pnpm podcast:finalize ${seriesSlug} ${nn}`);
