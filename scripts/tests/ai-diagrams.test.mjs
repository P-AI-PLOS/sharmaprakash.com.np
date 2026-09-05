import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initialState, prefixBlocks, memoryBudget, schedule, lastStep, renderDiagram, diagramTitles } from "../../src/data/ai-diagrams.mjs";
import { aiGlossary } from "../../src/data/ai-glossary.mjs";

test("prefix reuse stops at the first changed predecessor; eviction removes every hit", () => {
  assert.deepEqual(prefixBlocks("question").map(b => b.hit), [true, true, true, false]);
  assert.deepEqual(prefixBlocks("policy").map(b => b.hit), [true, false, false, false]);
  assert.deepEqual(prefixBlocks("instructions").map(b => b.hit), [false, false, false, false]);
  assert.deepEqual(prefixBlocks("evicted").map(b => b.hit), [false, false, false, false]);
  assert.equal(prefixBlocks("policy")[2].label, "C", "unchanged C still needs recomputation");
});

test("memory controls preserve the fixed budget and expose overflow", () => {
  const state = initialState("memory");
  assert.deepEqual(memoryBudget(state), { kv: 10, total: 66, available: 112, remaining: 46 });
  assert.equal(memoryBudget({ ...state, tokens: 131072, requests: 4 }).remaining, -104);
  assert.equal(memoryBudget({ ...state, precision: 1 }).kv, 5);
});

test("chunking changes the execution order; a prefix hit reduces fresh prefill work", () => {
  const state = initialState("scheduler");
  const chunked = schedule(state), whole = schedule({ ...state, mode: "whole" });
  assert.equal(chunked.filter(x => x === "B").length, whole.filter(x => x === "B").length);
  assert.equal(chunked.indexOf("A"), 0);
  assert.equal(whole.indexOf("A"), 8);
  assert.equal(schedule({ ...state, warm: true }).filter(x => x === "B").length, 4);
  assert.equal(schedule({ ...state, warm: true }).filter(x => x === "A").length, 8, "cache hits do not shorten Alice's answer");
  assert.equal(lastStep("scheduler", state), chunked.length);
});

test("every diagram has an accessible SVG and a static fallback", () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  for (const kind of Object.keys(diagramTitles)) {
    const svg = renderDiagram(kind);
    assert.match(svg, /role="img" aria-label="[^"]+"/);
    assert.match(svg, /<desc>.+<\/desc>/);
    const asset = resolve(root, `public/images/blog/running-ai-yourself/${kind}.svg`);
    assert.ok(existsSync(asset));
    assert.doesNotMatch(readFileSync(asset, "utf8"), /var\(--/, "standalone SVG resolves color tokens");
  }
});

test("glossary entries have stable unique fragment IDs and definitions", () => {
  assert.equal(new Set(aiGlossary.map(x => x.id)).size, aiGlossary.length);
  assert.ok(aiGlossary.some(x => x.id === "inference-server"));
  for (const entry of aiGlossary) {
    assert.match(entry.id, /^[a-z]+(?:-[a-z]+)*$/);
    assert.ok(entry.definition.length > 60);
  }
});
