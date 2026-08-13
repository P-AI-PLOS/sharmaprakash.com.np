import statuslineTemplate from "./statusline-template.sh?raw";

export type Layout = "one" | "three";
export type Alignment = "left" | "right";
export type Kind =
  | "cwd" | "branch" | "model" | "tokens" | "diff" | "context" | "cache"
  | "rate5" | "style" | "cost" | "time" | "custom" | "worktree" | "pr"
  | "ci" | "session" | "duration" | "api" | "rate7" | "x200k" | "gsd"
  | "openspec" | "beads";

export type ColorKey = "cyan" | "violet" | "green" | "amber" | "red" | "blue" | "slate" | "white";

export type Segment = {
  id: string;
  kind: Kind;
  color: ColorKey;
  enabledOne: boolean;
  enabledThree: boolean;
  row: 0 | 1 | 2;
  align: Alignment;
  orderOne: number;
  orderThree: number;
};

export type Sample = {
  ctxPct: number;
  ctxSize: number;
  costUsd: number;
  branch: string;
  dirty: boolean;
  ahead: number;
  behind: number;
  model: string;
  tokens: number;
  linesAdded: number;
  linesRemoved: number;
  cwd: string;
  custom: string;
  cachePct: number;
  rate5: number;
  rate5Reset: string;
  rate5Ahead: boolean;
  rate7: number;
  rate7Reset: string;
  rate7Ahead: boolean;
  style: string;
  worktree: string;
  prNumber: number;
  prState: "approved" | "changes_requested" | "draft" | "pending";
  ciState: "pass" | "pending" | "fail";
  session: string;
  duration: string;
  apiPct: number;
  effort: "low" | "medium" | "high" | "max";
  fast: boolean;
  thinking: boolean;
  exceeds200k: boolean;
  gsd: boolean;
  gsdPhase: string;
  openspec: boolean;
  openspecNew: number;
  openspecWip: number;
  beads: boolean;
  beadsReady: number;
  beadsWip: number;
  beadsBlocked: number;
};

export type Saved = {
  schemaVersion: 2;
  layout: Layout;
  segments: Segment[];
  sample: Sample;
  options: {
    scriptPath: string;
    refreshInterval: number;
    capturePayload: boolean;
    hyperlinks: boolean;
  };
};

export const colors: { key: ColorKey; label: string; css: string; ansi: string }[] = [
  { key: "cyan", label: "Cyan", css: "var(--accent-500)", ansi: "38;5;81" },
  { key: "violet", label: "Violet", css: "var(--accent-700)", ansi: "38;5;140" },
  { key: "green", label: "Green", css: "var(--positive-600)", ansi: "38;5;114" },
  { key: "amber", label: "Amber", css: "var(--warning-600)", ansi: "38;5;220" },
  { key: "red", label: "Red", css: "var(--danger-600)", ansi: "38;5;203" },
  { key: "blue", label: "Blue", css: "var(--accent-600)", ansi: "38;5;75" },
  { key: "slate", label: "Slate", css: "var(--ink-400)", ansi: "38;5;245" },
  { key: "white", label: "White", css: "var(--text-on-inverse)", ansi: "38;5;255" },
];

export const definitions: { kind: Kind; label: string; description: string; modes: Layout[]; docsHref: string; docsLabel: string; source: "Claude JSON" | "Local command" | "Project files" }[] = [
  { kind: "cwd", label: "Working directory", description: "Collapses $HOME to ~; clickable in Three rows.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#available-data", docsLabel: "cwd fields", source: "Claude JSON" },
  { kind: "branch", label: "Git branch + state", description: "Dirty, ahead, and behind markers from one git status call.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#git-status-with-colors", docsLabel: "git example", source: "Local command" },
  { kind: "worktree", label: "Worktree", description: "Linked or named worktree from the Claude payload.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#available-data", docsLabel: "worktree fields", source: "Claude JSON" },
  { kind: "pr", label: "Pull request", description: "PR number plus review-state glyph; clickable when enabled.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#available-data", docsLabel: "PR fields", source: "Claude JSON" },
  { kind: "ci", label: "CI checks", description: "Cached gh pr checks result; refreshes in the background.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#cache-expensive-operations", docsLabel: "caching pattern", source: "Local command" },
  { kind: "session", label: "Session name", description: "Custom /rename name or the AI-generated session title, when present.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#available-data", docsLabel: "session_name", source: "Claude JSON" },
  { kind: "duration", label: "Session duration", description: "Wall-clock session uptime.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#cost-and-duration-tracking", docsLabel: "duration example", source: "Claude JSON" },
  { kind: "api", label: "API busy ratio", description: "Share of session time spent waiting for API responses.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#available-data", docsLabel: "cost fields", source: "Claude JSON" },
  { kind: "cost", label: "Session cost", description: "Client-estimated USD; Three rows adds hourly burn rate after five minutes.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#cost-and-duration-tracking", docsLabel: "cost example", source: "Claude JSON" },
  { kind: "model", label: "Model badge", description: "Model name; Three rows adds effort, fast, and thinking qualifiers.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#available-data", docsLabel: "model fields", source: "Claude JSON" },
  { kind: "tokens", label: "Context tokens", description: "Humanized input plus output token counts from the latest API response.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#context-window-fields", docsLabel: "token semantics", source: "Claude JSON" },
  { kind: "context", label: "Context budget", description: "Free percent in One row; used/window/free in Three rows.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#context-window-fields", docsLabel: "context fields", source: "Claude JSON" },
  { kind: "rate5", label: "5-hour limit", description: "Usage percent; Three rows adds reset countdown and pacing arrow.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#rate-limit-usage", docsLabel: "rate-limit example", source: "Claude JSON" },
  { kind: "rate7", label: "7-day limit", description: "Usage, reset countdown, and pacing arrow.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#rate-limit-usage", docsLabel: "rate-limit example", source: "Claude JSON" },
  { kind: "cache", label: "Prompt cache", description: "cc/cr totals in One row; last-request hit rate in Three rows.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#context-window-fields", docsLabel: "cache fields", source: "Claude JSON" },
  { kind: "style", label: "Output style", description: "Shown only when the style is not default.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#available-data", docsLabel: "output_style.name", source: "Claude JSON" },
  { kind: "x200k", label: "200k warning", description: "Fixed-threshold warning from exceeds_200k_tokens.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#available-data", docsLabel: "200k field", source: "Claude JSON" },
  { kind: "diff", label: "Lines changed", description: "Session lines added and removed.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#cost-and-duration-tracking", docsLabel: "change fields", source: "Claude JSON" },
  { kind: "gsd", label: "GSD phase", description: "Phase, status, plan progress, and handoff state from .planning; not supplied by Claude.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#cache-expensive-operations", docsLabel: "external-data pattern", source: "Project files" },
  { kind: "openspec", label: "OpenSpec proposals", description: "Not-started and in-flight proposal counts from project files; not supplied by Claude.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#cache-expensive-operations", docsLabel: "external-data pattern", source: "Project files" },
  { kind: "beads", label: "Beads issues", description: "Cached ready, in-progress, and blocked counts; not supplied by Claude.", modes: ["three"], docsHref: "https://code.claude.com/docs/en/statusline#cache-expensive-operations", docsLabel: "caching pattern", source: "Local command" },
  { kind: "time", label: "Time", description: "Optional local terminal time (extra beyond the posts).", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#manually-configure-a-status-line", docsLabel: "refreshInterval", source: "Local command" },
  { kind: "custom", label: "Custom text", description: "Your own static status marker.", modes: ["one", "three"], docsHref: "https://code.claude.com/docs/en/statusline#how-status-lines-work", docsLabel: "output contract", source: "Local command" },
];

const defaults: Record<Kind, Omit<Segment, "id" | "kind" | "orderOne" | "orderThree">> = {
  cwd: { color: "cyan", enabledOne: true, enabledThree: true, row: 0, align: "left" },
  branch: { color: "violet", enabledOne: true, enabledThree: true, row: 0, align: "left" },
  worktree: { color: "violet", enabledOne: false, enabledThree: true, row: 0, align: "left" },
  pr: { color: "violet", enabledOne: false, enabledThree: true, row: 0, align: "left" },
  ci: { color: "green", enabledOne: false, enabledThree: true, row: 0, align: "left" },
  session: { color: "blue", enabledOne: false, enabledThree: true, row: 0, align: "left" },
  duration: { color: "slate", enabledOne: false, enabledThree: true, row: 0, align: "right" },
  api: { color: "slate", enabledOne: false, enabledThree: true, row: 0, align: "right" },
  cost: { color: "amber", enabledOne: false, enabledThree: true, row: 0, align: "right" },
  model: { color: "blue", enabledOne: true, enabledThree: true, row: 1, align: "left" },
  tokens: { color: "slate", enabledOne: true, enabledThree: false, row: 1, align: "left" },
  context: { color: "green", enabledOne: true, enabledThree: true, row: 1, align: "left" },
  rate5: { color: "slate", enabledOne: true, enabledThree: true, row: 1, align: "left" },
  rate7: { color: "slate", enabledOne: false, enabledThree: true, row: 1, align: "left" },
  cache: { color: "green", enabledOne: true, enabledThree: true, row: 1, align: "left" },
  style: { color: "violet", enabledOne: true, enabledThree: true, row: 1, align: "left" },
  x200k: { color: "red", enabledOne: false, enabledThree: true, row: 1, align: "left" },
  diff: { color: "green", enabledOne: true, enabledThree: true, row: 1, align: "right" },
  gsd: { color: "green", enabledOne: false, enabledThree: true, row: 2, align: "left" },
  openspec: { color: "amber", enabledOne: false, enabledThree: true, row: 2, align: "left" },
  beads: { color: "blue", enabledOne: false, enabledThree: true, row: 2, align: "left" },
  time: { color: "slate", enabledOne: false, enabledThree: false, row: 0, align: "right" },
  custom: { color: "white", enabledOne: false, enabledThree: false, row: 2, align: "left" },
};

const oneRowOrder: Kind[] = ["cwd", "branch", "model", "tokens", "diff", "context", "cache", "rate5", "style", "cost", "time", "custom"];
const threeRowOrder: Kind[] = definitions.map(({ kind }) => kind);
const orderFor = (kind: Kind, order: Kind[]) => {
  const index = order.indexOf(kind);
  return index < 0 ? order.length + definitions.findIndex((definition) => definition.kind === kind) : index;
};

export const makeInitial = (): Saved => ({
  schemaVersion: 2,
  layout: "one",
  segments: definitions.map(({ kind }) => ({ id: `segment-${kind}`, kind, ...defaults[kind], orderOne: orderFor(kind, oneRowOrder), orderThree: orderFor(kind, threeRowOrder) })),
  sample: {
    ctxPct: 72, ctxSize: 1000000, costUsd: 4.82, branch: "codex/blog-tools", dirty: true,
    ahead: 1, behind: 0, model: "Opus 4.7", tokens: 70400, linesAdded: 93, linesRemoved: 45,
    cwd: "~/workspaces/site", custom: "ready", cachePct: 91, rate5: 38, rate5Reset: "2h10m",
    rate5Ahead: true, rate7: 24, rate7Reset: "4d3h", rate7Ahead: false, style: "default",
    worktree: "blog-tools", prNumber: 142, prState: "approved", ciState: "pass", session: "statusline",
    duration: "1h13m", apiPct: 64, effort: "high", fast: false, thinking: true, exceeds200k: false,
    gsd: true, gsdPhase: "04-ingest ▶ 3/7", openspec: true, openspecNew: 1, openspecWip: 2,
    beads: true, beadsReady: 6, beadsWip: 2, beadsBlocked: 0,
  },
  options: { scriptPath: "~/.claude/statusline-command.sh", refreshInterval: 5, capturePayload: true, hyperlinks: true },
});

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const tokenCount = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return fallback;
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*([km])?$/i);
  if (!match) return fallback;
  const multiplier = match[2]?.toLowerCase() === "m" ? 1000000 : match[2]?.toLowerCase() === "k" ? 1000 : 1;
  return Math.round(Number(match[1]) * multiplier);
};
const colorFromLegacy = (value: unknown): ColorKey => {
  if (colors.some((color) => color.key === value)) return value as ColorKey;
  const legacy: Record<string, ColorKey> = {
    "var(--accent-700)": "violet", "var(--accent-500)": "cyan", "var(--positive-600)": "green",
    "var(--warning-600)": "amber", "var(--danger-600)": "red", "var(--ink-400)": "slate",
    "var(--text-on-inverse)": "white", "var(--ink-100)": "white",
  };
  return typeof value === "string" ? legacy[value] ?? "white" : "white";
};

export function normalizeSaved(value: unknown): Saved {
  const next = makeInitial();
  if (!isRecord(value)) return next;
  next.layout = value.layout === "three" ? "three" : "one";
  if (isRecord(value.sample)) {
    next.sample = { ...next.sample, ...value.sample } as Sample;
    next.sample.tokens = tokenCount(value.sample.tokens, next.sample.tokens);
  }
  if (isRecord(value.options)) next.options = { ...next.options, ...value.options } as Saved["options"];
  if (!Array.isArray(value.segments)) return next;

  for (const [candidateIndex, candidate] of value.segments.entries()) {
    if (!isRecord(candidate) || typeof candidate.kind !== "string") continue;
    const segment = next.segments.find((item) => item.kind === candidate.kind);
    if (!segment) continue;
    segment.color = colorFromLegacy(candidate.color);
    if (value.schemaVersion === 2) {
      segment.enabledOne = candidate.enabledOne === true;
      segment.enabledThree = candidate.enabledThree === true;
      segment.row = candidate.row === 1 || candidate.row === 2 ? candidate.row : 0;
      segment.align = candidate.align === "right" ? "right" : "left";
      segment.orderOne = typeof candidate.orderOne === "number" ? candidate.orderOne : candidateIndex;
      segment.orderThree = typeof candidate.orderThree === "number" ? candidate.orderThree : candidateIndex;
    } else {
      const enabled = candidate.enabled === true;
      segment.enabledOne = enabled;
      segment.enabledThree = enabled;
      segment.row = candidate.row === 1 || candidate.row === 2 ? candidate.row : 0;
      segment.orderOne = candidateIndex;
      segment.orderThree = candidateIndex;
    }
  }
  return next;
}

export const colorCss = (key: ColorKey) => colors.find((color) => color.key === key)?.css ?? "var(--text-on-inverse)";

export function previewText(kind: Kind, sample: Sample, layout: Layout): string | null {
  const branchMarks = `${sample.dirty ? "*" : ""}${sample.ahead ? `↑${sample.ahead}` : ""}${sample.behind ? `↓${sample.behind}` : ""}`;
  const values: Record<Kind, string | null> = {
    cwd: sample.cwd,
    branch: `(${sample.branch}${branchMarks})`,
    worktree: sample.worktree ? `⎇ ${sample.worktree}` : null,
    pr: sample.prNumber ? `#${sample.prNumber}${({ approved: "✓", changes_requested: "✗", draft: "◐", pending: "●" })[sample.prState]}` : null,
    ci: sample.prNumber ? `ci:${({ pass: "ok", pending: "~", fail: "x" })[sample.ciState]}` : null,
    session: sample.session ? `@${sample.session}` : null,
    duration: sample.duration ? `up:${sample.duration}` : null,
    api: `api:${sample.apiPct}%`,
    cost: `$${sample.costUsd.toFixed(2)}${layout === "three" ? "(~$2/h)" : ""}`,
    model: `${sample.model}${layout === "three" ? ` (${[sample.effort, sample.fast && "fast", sample.thinking && "think"].filter(Boolean).join(",")})` : ""}`,
    tokens: `${humanize(sample.tokens)} tok`,
    context: layout === "three" ? `ctx:${humanize(Math.round(sample.ctxSize * (100 - sample.ctxPct) / 100))}/${humanize(sample.ctxSize)} (${sample.ctxPct}% free)` : `ctx:${sample.ctxPct}%`,
    rate5: `5h:${sample.rate5}%${layout === "three" ? `${sample.rate5Ahead ? "▲" : ""}(${sample.rate5Reset})` : ""}`,
    rate7: `7d:${sample.rate7}%${sample.rate7Ahead ? "▲" : ""}(${sample.rate7Reset})`,
    cache: layout === "three" ? `cache:${sample.cachePct}%` : `cc:${humanize(Math.round(sample.tokens * (100 - sample.cachePct) / 100))}|cr:${humanize(Math.round(sample.tokens * sample.cachePct / 100))}`,
    style: sample.style !== "default" ? `[${sample.style}]` : null,
    x200k: sample.exceeds200k ? "!200k" : null,
    diff: `+${sample.linesAdded}/-${sample.linesRemoved}`,
    gsd: sample.gsd ? `gsd:${sample.gsdPhase}` : null,
    openspec: sample.openspec ? `os new:${sample.openspecNew} wip:${sample.openspecWip}` : null,
    beads: sample.beads ? `bd ready:${sample.beadsReady} wip:${sample.beadsWip} blocked:${sample.beadsBlocked}` : null,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    custom: sample.custom || null,
  };
  return values[kind];
}

function humanize(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

const shellQuote = (value: string) => `'${value.replaceAll("'", `'"'"'`)}'`;
const shellName = (kind: Kind) => kind.toUpperCase().replaceAll(/[^A-Z0-9]/g, "_");

export function commandScript(saved: Saved) {
  const orderKey = saved.layout === "one" ? "orderOne" : "orderThree";
  const enabled = saved.segments
    .filter((segment) => saved.layout === "one" ? segment.enabledOne : segment.enabledThree)
    .sort((a, b) => a[orderKey] - b[orderKey]);
  const has = (kind: Kind) => enabled.some((segment) => segment.kind === kind);
  const assignments = saved.segments.map((segment) => {
    const ansi = colors.find((color) => color.key === segment.color)?.ansi ?? "38;5;255";
    return `SEG_${shellName(segment.kind)}=$'\\033[${ansi}m'`;
  }).join("\n");

  let rows: string;
  if (saved.layout === "one") {
    rows = `join_segments line ${enabled.map((segment) => segment.kind).join(" ")}\n[ -n "$line" ] && printf '%s\\n' "$line"`;
  } else {
    rows = [0, 1, 2].map((row) => {
      const left = enabled.filter((segment) => segment.row === row && segment.align === "left").map((segment) => segment.kind).join(" ");
      const right = enabled.filter((segment) => segment.row === row && segment.align === "right").map((segment) => segment.kind).join(" ");
      return `join_segments row${row + 1}_left ${left}\njoin_segments row${row + 1}_right ${right}\nprint_row "$row${row + 1}_left" "$row${row + 1}_right" "$(printf '%s' "$row${row + 1}_right" | sed -E $'s/\\x1b\\[[0-9;]*m//g')"`;
    }).join("\n");
  }

  const replacements: [string, string][] = [
    ["__LAYOUT__", saved.layout],
    ["__CAPTURE_PAYLOAD__", String(saved.options.capturePayload)],
    ["__HYPERLINKS__", String(saved.options.hyperlinks)],
    ["__WANT_CI__", String(has("ci"))],
    ["__WANT_GSD__", String(has("gsd"))],
    ["__WANT_OPENSPEC__", String(has("openspec"))],
    ["__WANT_BEADS__", String(has("beads"))],
    ["__CUSTOM_TEXT__", shellQuote(saved.sample.custom)],
    ["__COLOR_ASSIGNMENTS__", assignments],
    ["__RENDER_ROWS__", rows],
  ];
  return replacements.reduce((script, [marker, replacement]) => script.replace(marker, () => replacement), statuslineTemplate);
}

export function settingsJson(saved: Saved) {
  const statusLine: { type: "command"; command: string; refreshInterval?: number } = {
    type: "command",
    command: `bash ${saved.options.scriptPath}`,
  };
  const clockEnabled = saved.segments.some((segment) => segment.kind === "time" && (saved.layout === "one" ? segment.enabledOne : segment.enabledThree));
  if (saved.layout === "three" || clockEnabled) statusLine.refreshInterval = Math.max(1, saved.options.refreshInterval);
  return JSON.stringify({ statusLine }, null, 2);
}
