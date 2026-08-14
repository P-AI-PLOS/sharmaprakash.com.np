#!/usr/bin/env node

/**
 * Renders the "title card + schematic" header used by AI-category posts.
 *
 *   pnpm blog-image:ai src/content/posts/<post>.md
 *
 * Output: public/images/blog/ai/<slug>.png at 1915x821 (21:9). One image per
 * post — `cover` and `thumb` both point at it (see docs/agents/recipes.md).
 *
 * The card copy comes from frontmatter, but the schematic on the right is the
 * bespoke part: each post gets an entry in HEADERS below, following the same
 * per-slug registry pattern as getVisualLines() in render-blog-header.mjs. A
 * registered entry also pins its own line breaks and type sizes, so re-running
 * this script reproduces a published image byte for byte. Posts with no entry
 * fall back to auto-layout, which is a starting point to tune, not a finish.
 */

import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const WIDTH = 1915;
const HEIGHT = 821;
const MAX_SUBLINE_LINES = 3;

// Card geometry. The headline/subline x values are deliberately staggered
// against the chip — that stagger is the established look, not a rounding slip.
const CARD = { x: 94, y: 112, width: 690, height: 548 };
const CHIP_X = 127;
const HEADLINE_X = 190;
const SUBLINE_X = 221;

const palette = {
  paper: "#F8FAFC",
  surface: "#FFFFFF",
  ink50: "#F1F5F9",
  ink100: "#E2E8F0",
  ink200: "#CBD5E1",
  ink300: "#94A3B8",
  ink400: "#64748B",
  ink500: "#475569",
  ink600: "#334155",
  navy: "#1E293B",
  midnight: "#0F172A",
  amber50: "#FFFBEB",
  amber100: "#FEF3C7",
  amber200: "#FDE68A",
  amber300: "#FCD34D",
  amber400: "#FBBF24",
  amber500: "#F59E0B",
  amber600: "#D97706",
  amber700: "#B45309",
};

/**
 * Per-slug overrides. Every field is optional; anything omitted is derived
 * from frontmatter. `diagram` picks the schematic — add a new builder below
 * rather than overloading an existing one.
 */
const HEADERS = {
  "2026-08-15-two-claude-accounts-one-machine": {
    chip: "AI · DEVELOPER SETUP",
    chipWidth: 275,
    headline: ["Two Claude Accounts,", "One Machine"],
    headlineSize: 55,
    subline: [
      "One environment variable. Two subscriptions.",
      "Both stay logged in, side by side.",
    ],
    sublineSize: 25,
    pill: "claude · claudep",
    pillWidth: 500,
    pillTextSize: 23,
    glyph: "link",
    diagram: "parallel-workspaces",
  },
  "2026-08-16-claude-code-many-users-one-debian-box": {
    chip: "AI · SYSADMIN",
    chipWidth: 172,
    headline: ["Running Claude Code", "for a Team on One", "Debian Box"],
    headlineSize: 51,
    headlineX: 219,
    subline: [
      "One Unix user per identity. Managed",
      "settings on top. The kernel draws",
      "the boundary.",
    ],
    sublineSize: 27,
    pill: "apt install claude-code",
    pillWidth: 602,
    pillTextSize: 22,
    glyph: "terminal",
    diagram: "policy-stack",
  },
};

const diagrams = {
  "parallel-workspaces": parallelWorkspaces,
  "policy-stack": policyStack,
  none: () => "",
};

/**
 * Arial/Helvetica advance widths in units per 1000em, ASCII 0x20..0x7E in
 * order. Only used to wrap text and size the chip and pill when a post has no
 * HEADERS entry — registered posts pin their own numbers, so an approximation
 * here can't shift an already-published image. Declared above the render call
 * below: these are consts, so a later declaration would be in the temporal dead
 * zone by the time auto-layout reaches for them.
 */
const ARIAL_REGULAR = buildWidths(
  "278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278",
  "556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556",
  "1015 667 667 722 722 667 611 778 722 278 500 667 556 833 722 778",
  "667 778 722 667 611 722 667 944 667 667 611 278 278 278 469 556",
  "333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556",
  "556 556 333 500 278 556 500 722 500 500 500 334 260 334 584",
);

const ARIAL_BOLD = buildWidths(
  "278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278",
  "556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611",
  "975 722 722 722 722 667 611 778 722 278 556 722 611 833 722 778",
  "667 778 722 667 611 722 667 944 667 667 611 333 278 333 584 556",
  "333 556 611 556 611 556 333 611 611 278 278 556 278 889 611 611",
  "611 611 389 556 333 611 556 778 556 556 500 389 280 389 584",
);

const postPath = process.argv[2];

if (!postPath) {
  fail("Usage: pnpm blog-image:ai src/content/posts/<post>.md");
}

const absolutePostPath = join(repoRoot, postPath);

if (!existsSync(absolutePostPath)) {
  fail(`Post not found: ${postPath}`);
}

const slug = basename(postPath, ".md");
const { data } = matter(readFileSync(absolutePostPath, "utf8"));
const overrides = HEADERS[slug] ?? {};

if (!HEADERS[slug]) {
  console.warn(
    `render-ai-header: no HEADERS entry for "${slug}".\n` +
      `  Card copy is auto-laid-out from frontmatter and the right half will be\n` +
      `  EMPTY — the schematic is per-post and cannot be derived. Add an entry to\n` +
      `  HEADERS with a diagram, then re-run to pin the result.`,
  );
}

const publicSlug = stripDatePrefix(slug);
const spec = buildSpec({ data, overrides, publicSlug });
const outputPath = join(repoRoot, "public", "images", "blog", "ai", `${publicSlug}.png`);

mkdirSync(dirname(outputPath), { recursive: true });

const png = new Resvg(render(spec), {
  fitTo: { mode: "width", value: WIDTH },
  font: {
    fontFiles: [
      "/System/Library/Fonts/Supplemental/Arial.ttf",
      "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ].filter((path) => existsSync(path)),
    loadSystemFonts: true,
    defaultFontFamily: "Arial",
  },
})
  .render()
  .asPng();

writeFileSync(outputPath, png);
console.log(`Wrote ${outputPath} (${WIDTH}x${HEIGHT})`);
console.log(`  cover/thumb: /images/blog/ai/${publicSlug}.png`);

// ---------------------------------------------------------------- spec

function buildSpec({ data, overrides, publicSlug }) {
  const chip = overrides.chip ?? autoChip(data);
  const headlineSize = overrides.headlineSize ?? 55;
  const headlineX = overrides.headlineX ?? HEADLINE_X;
  const headline =
    overrides.headline ??
    wrap(autoHeadline(String(data.title ?? publicSlug)), {
      maxWidth: CARD.x + CARD.width - 40 - headlineX,
      fontSize: headlineSize,
      weight: 700,
      letterSpacing: -1.1,
    });
  const sublineSize = overrides.sublineSize ?? 25;
  const subline =
    overrides.subline ??
    autoSubline(String(data.excerpt ?? ""), {
      maxWidth: CARD.x + CARD.width - 40 - SUBLINE_X,
      fontSize: sublineSize,
    });
  const pill = overrides.pill ?? "";
  const pillTextSize = overrides.pillTextSize ?? 22;

  return {
    chip,
    chipWidth:
      overrides.chipWidth ??
      Math.round(measure(chip, 16, 700, 2.5)) + 52,
    headline,
    headlineSize,
    headlineX,
    subline,
    sublineSize,
    pill,
    pillTextSize,
    pillWidth:
      overrides.pillWidth ??
      Math.round(measure(pill, pillTextSize, 700, 0.3)) + 116,
    glyph: overrides.glyph ?? "terminal",
    diagram: diagrams[overrides.diagram ?? "none"] ?? diagrams.none,
  };
}

function autoChip(data) {
  const directory = String(data.directory ?? "ai");
  const tag = Array.isArray(data.tags) ? data.tags[0] : data.tags;
  const parts = [directory, tag].filter(Boolean).map((part) => String(part).replace(/-/g, " "));

  return parts.join(" · ").toUpperCase();
}

/**
 * Titles here are usually "Headline: subtitle" — the headline is the half worth
 * setting large. Which half that is isn't reliably derivable (compare
 * "Two Claude Accounts, One Machine: Hot-Swapping…" against
 * "Past Ten: Running Claude Code…"), so this takes the part before the colon
 * and leaves the judgement call to a HEADERS entry.
 */
function autoHeadline(title) {
  const cleaned = title.replace(/`/g, "").replace(/\s+/g, " ").trim();
  const [before] = cleaned.split(/:\s/);

  return before || cleaned;
}

/**
 * Excerpts run long, and the card holds three lines. Add whole sentences while
 * they fit, then stop — a subline that ends mid-clause ("…rate-limit pacing a")
 * reads as a rendering fault. If even one sentence overruns, trim it on a word
 * boundary and mark the cut.
 */
function autoSubline(excerpt, { maxWidth, fontSize }) {
  const measured = (text) =>
    wrap(text, { maxWidth, fontSize, weight: 400, letterSpacing: 0.05 });
  const cleaned = excerpt.replace(/`/g, "").replace(/\s+/g, " ").trim();

  if (!cleaned) return [""];

  const sentences = cleaned.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [cleaned];
  let kept = "";

  for (const sentence of sentences) {
    const candidate = (kept + sentence).trim();

    if (measured(candidate).length > MAX_SUBLINE_LINES) break;
    kept = candidate;
  }

  if (kept) return measured(kept);

  // A single sentence longer than the card: cut it on a word boundary.
  const words = cleaned.split(" ");
  let truncated = "";

  for (const word of words) {
    const candidate = truncated ? `${truncated} ${word}` : word;

    if (measured(`${candidate}…`).length > MAX_SUBLINE_LINES) break;
    truncated = candidate;
  }

  return measured(`${truncated}…`);
}

// ------------------------------------------------------------- rendering

function render(spec) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="${palette.ink200}" stroke-width="1" opacity="0.32"/>
    </pattern>
    <radialGradient id="wash" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1175 330) rotate(90) scale(510 770)">
      <stop offset="0" stop-color="${palette.amber200}" stop-opacity="0.60"/>
      <stop offset="0.50" stop-color="${palette.amber100}" stop-opacity="0.36"/>
      <stop offset="1" stop-color="${palette.amber50}" stop-opacity="0"/>
    </radialGradient>
    <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="${palette.navy}" flood-opacity="0.08"/>
    </filter>
    <filter id="mini-shadow" x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy="14" stdDeviation="17" flood-color="${palette.navy}" flood-opacity="0.11"/>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${palette.paper}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wash)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>
  <path d="M0 700 C300 625 530 710 790 655 C1080 570 1430 530 1915 610 L1915 821 L0 821 Z" fill="${palette.ink200}" opacity="0.48"/>

  <rect x="${CARD.x}" y="${CARD.y}" width="${CARD.width}" height="${CARD.height}" rx="30" fill="${palette.surface}" fill-opacity="0.93" stroke="${palette.ink100}" stroke-width="2" filter="url(#card-shadow)"/>
  ${chipMark(spec)}
  ${headlineMark(spec)}
  ${sublineMark(spec)}

  ${spec.diagram()}
  ${bottomPill(spec)}
</svg>`;
}

function chipMark({ chip, chipWidth }) {
  return `
  <rect x="${CHIP_X}" y="150" width="${chipWidth}" height="37" rx="19" fill="${palette.amber100}" stroke="${palette.amber300}" stroke-width="1"/>
  <text x="${CHIP_X + 26}" y="175" fill="${palette.amber700}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="2.5">${escapeXml(chip)}</text>`;
}

function headlineMark({ headline, headlineSize, headlineX }) {
  const startY = headline.length >= 3 ? 243 : 286;
  const lineHeight = Math.round(headlineSize * 1.12);

  return `<text x="${headlineX}" y="${startY}" fill="${palette.midnight}" font-family="Arial, Helvetica, sans-serif" font-size="${headlineSize}" font-weight="700" letter-spacing="-1.1">${headline
    .map((line, index) => `<tspan x="${headlineX}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

function sublineMark({ subline, sublineSize }) {
  const startY = subline.length >= 3 ? 508 : 520;

  return `<text x="${SUBLINE_X}" y="${startY}" fill="${palette.ink500}" font-family="Arial, Helvetica, sans-serif" font-size="${sublineSize}" font-weight="400" letter-spacing="0.05">${subline
    .map((line, index) => `<tspan x="${SUBLINE_X}" dy="${index === 0 ? 0 : 34}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

/** Two mirrored workspaces, dashed symlinks down to one shared tool layer. */
function parallelWorkspaces() {
  return `
  <g>
    <path d="M1187 397 C1187 350 1177 325 1177 282" fill="none" stroke="${palette.ink300}" stroke-width="3" stroke-linecap="round" stroke-dasharray="10 10"/>
    <path d="M1475 397 C1475 350 1487 325 1487 282" fill="none" stroke="${palette.ink300}" stroke-width="3" stroke-linecap="round" stroke-dasharray="10 10"/>

    ${workspaceCard(1042, 166, "~/.claude")}
    ${workspaceCard(1352, 166, "~/.claude-p")}

    <rect x="1050" y="397" width="570" height="132" rx="24" fill="${palette.navy}" stroke="${palette.ink500}" stroke-width="2" filter="url(#mini-shadow)"/>
    <rect x="1080" y="424" width="110" height="8" rx="4" fill="${palette.amber500}"/>
    <rect x="1080" y="451" width="220" height="8" rx="4" fill="${palette.ink300}"/>
    <rect x="1080" y="475" width="165" height="8" rx="4" fill="${palette.ink400}"/>
    <text x="1080" y="512" fill="${palette.ink50}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="0.5">agents · skills · hooks</text>
    <circle cx="1187" cy="397" r="9" fill="${palette.surface}" stroke="${palette.ink300}" stroke-width="3"/>
    <circle cx="1475" cy="397" r="9" fill="${palette.surface}" stroke="${palette.ink300}" stroke-width="3"/>
  </g>`;
}

function workspaceCard(x, y, label) {
  return `
    <rect x="${x}" y="${y}" width="260" height="116" rx="20" fill="${palette.surface}" fill-opacity="0.94" stroke="${palette.ink200}" stroke-width="2" filter="url(#mini-shadow)"/>
    <rect x="${x + 28}" y="${y + 29}" width="82" height="8" rx="4" fill="${palette.amber600}"/>
    <rect x="${x + 28}" y="${y + 52}" width="126" height="7" rx="3.5" fill="${palette.ink300}"/>
    <rect x="${x + 28}" y="${y + 73}" width="94" height="7" rx="3.5" fill="${palette.ink200}"/>
    <text x="${x + 28}" y="${y + 104}" fill="${palette.ink600}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="0.25">${escapeXml(label)}</text>
    <circle cx="${x + 230}" cy="${y + 27}" r="10" fill="${palette.amber500}" stroke="${palette.amber600}" stroke-width="3"/>
  `;
}

/** Policy on top, shared tooling under it, isolated users at the bottom. */
function policyStack() {
  const users = ["alice", "bob", "carol", "dave"];
  const xs = [1028, 1180, 1332, 1484];

  return `
  <g>
    <rect x="1028" y="142" width="586" height="92" rx="20" fill="${palette.amber100}" fill-opacity="0.96" stroke="${palette.amber500}" stroke-width="2" filter="url(#mini-shadow)"/>
    <rect x="1028" y="142" width="586" height="14" rx="7" fill="${palette.amber500}"/>
    <circle cx="1070" cy="188" r="11" fill="${palette.amber500}" stroke="${palette.amber600}" stroke-width="3"/>
    <text x="1095" y="197" fill="${palette.amber700}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="0.4">/etc/claude-code</text>

    ${xs.map((x) => `<path d="M${x + 65} 234 V303 M${x + 65} 401 V483" fill="none" stroke="${palette.ink300}" stroke-width="3" stroke-linecap="round"/>`).join("\n    ")}

    <rect x="1028" y="303" width="586" height="98" rx="20" fill="${palette.navy}" stroke="${palette.ink500}" stroke-width="2" filter="url(#mini-shadow)"/>
    <rect x="1060" y="331" width="110" height="8" rx="4" fill="${palette.amber500}"/>
    <rect x="1060" y="353" width="188" height="7" rx="3.5" fill="${palette.ink300}"/>
    <text x="1060" y="387" fill="${palette.ink50}" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" letter-spacing="0.4">/opt/claude/shared</text>

    ${users.map((user, i) => userCard(xs[i], 483, user)).join("\n")}
  </g>`;
}

function userCard(x, y, label) {
  return `
    <rect x="${x}" y="${y}" width="130" height="112" rx="18" fill="${palette.surface}" fill-opacity="0.95" stroke="${palette.ink200}" stroke-width="2" filter="url(#mini-shadow)"/>
    <path d="M${x + 55} ${y + 42} V${y + 34} C${x + 55} ${y + 20}, ${x + 75} ${y + 20}, ${x + 75} ${y + 34} V${y + 42}" fill="none" stroke="${palette.ink400}" stroke-width="4" stroke-linecap="round"/>
    <rect x="${x + 50}" y="${y + 40}" width="30" height="25" rx="5" fill="none" stroke="${palette.ink400}" stroke-width="4"/>
    <circle cx="${x + 65}" cy="${y + 52}" r="3" fill="${palette.ink400}"/>
    <text x="${x + 65}" y="${y + 91}" text-anchor="middle" fill="${palette.ink600}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="0.3">${label}</text>
  `;
}

function bottomPill({ pill, pillWidth, pillTextSize, glyph }) {
  if (!pill) return "";

  const glyphs = {
    link: `<circle cx="1056" cy="691" r="18" fill="${palette.amber500}"/><circle cx="1050" cy="687" r="4" fill="${palette.navy}"/><circle cx="1062" cy="695" r="4" fill="${palette.navy}"/><path d="M1053 690 L1059 693" stroke="${palette.navy}" stroke-width="3" stroke-linecap="round"/>`,
    terminal: `<circle cx="1056" cy="691" r="18" fill="${palette.amber500}"/><path d="M1049 684 L1056 691 L1049 698 M1059 699 H1066" fill="none" stroke="${palette.navy}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  };

  return `
  <rect x="1012" y="655" width="${pillWidth}" height="72" rx="36" fill="${palette.navy}"/>
  ${glyphs[glyph] ?? glyphs.terminal}
  <text x="1094" y="700" fill="${palette.ink50}" font-family="Arial, Helvetica, sans-serif" font-size="${pillTextSize}" font-weight="700" letter-spacing="0.3">${escapeXml(pill)}</text>`;
}

// --------------------------------------------------------------- helpers

function buildWidths(...rows) {
  const values = rows.join(" ").split(/\s+/).map(Number);
  const table = {};

  // ASCII 0x20..0x7E in order.
  values.forEach((value, index) => {
    table[String.fromCharCode(0x20 + index)] = value;
  });
  table["·"] = 278;
  table["—"] = 1000;
  table["’"] = table["'"];

  return table;
}

function measure(text, fontSize, weight, letterSpacing = 0) {
  const table = weight >= 700 ? ARIAL_BOLD : ARIAL_REGULAR;
  const chars = [...String(text)];
  const units = chars.reduce((sum, char) => sum + (table[char] ?? 556), 0);

  return (units / 1000) * fontSize + letterSpacing * Math.max(0, chars.length - 1);
}

function wrap(text, { maxWidth, fontSize, weight, letterSpacing }) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (current && measure(candidate, fontSize, weight, letterSpacing) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);

  return lines.length ? lines : [""];
}

function stripDatePrefix(slug) {
  return slug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function fail(message) {
  console.error(`render-ai-header: ${message}`);
  process.exit(1);
}
