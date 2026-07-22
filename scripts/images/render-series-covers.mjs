#!/usr/bin/env node
// One-off: render missing series cover images in the site's header style.
import { Resvg } from "@resvg/resvg-js";
import React from "react";
import satori from "satori";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = "/Users/prakash/workspaces/2023/personal/sharmaprakash-astro";
const outDir = join(repoRoot, "public", "images", "blog", "series");

const SERIES = [
  {
    slug: "product-stories",
    label: "series / 13 parts",
    title: "Product Stories",
    tagline: "Famous product legends, retold from the record — Blockbuster to Builder.ai.",
    lines: [
      { text: "legend: 'they laughed at Netflix'", color: "#f97316" },
      { text: "record: Total Access was winning", color: "#38bdf8" },
      { text: "diff legend record", color: "#f8fafc" },
      { text: "13 stories, sources attached", color: "#fbbf24" },
      { text: "reality holds the retro", color: "#86efac" },
    ],
  },
  {
    slug: "agile-first-principles",
    label: "series / 9 parts",
    title: "Agile from First Principles",
    tagline: "Four values, twelve principles, zero rituals — agile as reasoning, not ceremony.",
    lines: [
      { text: "cat manifesto.txt | wc -w  # 4 min", color: "#f8fafc" },
      { text: "rm -rf ceremonies/", color: "#f97316" },
      { text: "working software > documents", color: "#38bdf8" },
      { text: "respond to change", color: "#fbbf24" },
      { text: "principles, not packaging", color: "#86efac" },
    ],
  },
  {
    slug: "innovation-from-within",
    label: "series / innovation",
    title: "Innovation From Within",
    tagline: "How new bets survive inside big companies — labs, horizons, and honest accounting.",
    lines: [
      { text: "horizon 3 needs a different P&L", color: "#f8fafc" },
      { text: "good management kills new ideas", color: "#f97316" },
      { text: "build a school, not a showroom", color: "#38bdf8" },
      { text: "innovation accounting", color: "#fbbf24" },
      { text: "survive budget season", color: "#86efac" },
    ],
  },
  {
    slug: "leadership-frameworks",
    label: "series / 7 parts",
    title: "The Strategy Cascade",
    tagline: "The leadership frameworks that earn their keep, layer by layer — and when to drop them.",
    lines: [
      { text: "strategy -> objectives -> teams", color: "#f8fafc" },
      { text: "a goal is not a strategy", color: "#f97316" },
      { text: "where to play / how to win", color: "#38bdf8" },
      { text: "metrics with counter-metrics", color: "#fbbf24" },
      { text: "principle-first, framework-second", color: "#86efac" },
    ],
  },
  {
    slug: "operating-rhythm",
    label: "series / 5 parts",
    title: "The Product Operating Rhythm",
    tagline: "The work between strategy and shipping — intake, planning stack, and stakeholders.",
    lines: [
      { text: "intake you can defend", color: "#f8fafc" },
      { text: "vision -> 3yr -> yearly -> quarter", color: "#38bdf8" },
      { text: "quarterly planning as runbook", color: "#fbbf24" },
      { text: "stakeholders as a system", color: "#86efac" },
      { text: "recover from sold roadmaps", color: "#f97316" },
    ],
  },
  {
    slug: "innovation-vto",
    label: "series / 3 parts",
    title: "The Innovation V/TO",
    tagline: "Traction's Vision/Traction Organizer applied to innovation — rocks, bets, and long holds.",
    lines: [
      { text: "1-year plan: quarterly rocks", color: "#f8fafc" },
      { text: "metered money, not budgets", color: "#38bdf8" },
      { text: "3-year picture: portfolio of bets", color: "#fbbf24" },
      { text: "10-year target: the long hold", color: "#86efac" },
      { text: "IBM EBOs -> AWS -> ASML EUV", color: "#f97316" },
    ],
  },
  {
    slug: "pm-context-repo",
    label: "series / 6 parts",
    title: "The Product Context Repo",
    tagline: "A git repo for what your product knows — signals in, grounded stories out, slop starved.",
    lines: [
      { text: "git init product-context", color: "#f8fafc" },
      { text: "tickets + calls + crm -> signals/", color: "#38bdf8" },
      { text: "no claim without a card", color: "#f97316" },
      { text: "/story --grounded", color: "#fbbf24" },
      { text: "slop can't cite", color: "#86efac" },
    ],
  },

];

const fonts = [
  { name: "Arial", weight: 400, style: "normal", data: loadFont([
    join(repoRoot, "public", "fonts", "Inter-Regular.ttf"),
    "/System/Library/Fonts/Supplemental/Arial.ttf",
  ]) },
  { name: "Arial", weight: 700, style: "normal", data: loadFont([
    join(repoRoot, "public", "fonts", "Inter-Bold.ttf"),
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  ]) },
];

const width = 1600;
const height = 900;

const only = process.argv[2];
for (const s of SERIES.filter((s) => !only || s.slug === only)) {
  const svg = await satori(template(s), { width, height, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
  const out = join(outDir, `${s.slug}.png`);
  writeFileSync(out, png);
  console.log(`Wrote ${out}`);
}

function template({ label, title, tagline, lines }) {
  const h = (type, style, ...children) => React.createElement(type, { style }, ...children);
  return h(
    "div",
    { position: "relative", display: "flex", width, height, overflow: "hidden", background: "#f8fafc", color: "#0f172a", fontFamily: "Arial" },
    h("div", { position: "absolute", inset: 0, background: "linear-gradient(135deg, #fff7ed 0%, #f8fafc 36%, #e0f2fe 100%)" }),
    h("div", { position: "absolute", width: 560, height: 560, right: -130, top: -180, borderRadius: 280, background: "#f59e0b", opacity: 0.16 }),
    h("div", { position: "absolute", width: 500, height: 500, left: -150, bottom: -200, borderRadius: 250, background: "#0f766e", opacity: 0.14 }),
    h(
      "div",
      { position: "absolute", left: 90, top: 110, width: 860, display: "flex", flexDirection: "column", gap: 30 },
      h("div", { display: "flex", color: "#b45309", fontSize: 24, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }, label),
      h("div", { display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.02 }, title),
      h("div", { display: "flex", maxWidth: 700, color: "#475569", fontSize: 30, lineHeight: 1.45 }, tagline)
    ),
    h(
      "div",
      { position: "absolute", right: 90, bottom: 90, width: 620, height: 340, display: "flex", flexDirection: "column", overflow: "hidden", border: "2px solid #cbd5e1", borderRadius: 26, background: "#0f172a" },
      h(
        "div",
        { display: "flex", alignItems: "center", height: 58, paddingLeft: 28, gap: 10, background: "#1e293b" },
        ...["#ef4444", "#f59e0b", "#22c55e"].map((c) => h("span", { width: 14, height: 14, borderRadius: 7, background: c }))
      ),
      h(
        "div",
        { display: "flex", flexDirection: "column", flex: 1, padding: 30, gap: 12, color: "#e2e8f0", fontSize: 24, lineHeight: 1.34 },
        ...lines.map((line) =>
          h("div", { display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" },
            h("span", { color: "#64748b" }, "$"),
            h("span", { color: line.color }, line.text))
        )
      )
    )
  );
}

function loadFont(paths) {
  const p = paths.find((c) => existsSync(c));
  if (!p) { console.error("no font found"); process.exit(1); }
  return readFileSync(p);
}
