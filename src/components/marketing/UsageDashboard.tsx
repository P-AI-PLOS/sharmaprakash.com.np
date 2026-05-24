"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

// ── types ────────────────────────────────────────────────────────────────────

interface ModelBreakdown {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  cost: number;
}

interface MonthEntry {
  period: string;
  agent: string;
  totalTokens: number;
  totalCost: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  inputTokens: number;
  outputTokens: number;
  metadata: { agents: string[] };
  modelBreakdowns: ModelBreakdown[];
}

interface Props {
  monthly: MonthEntry[];
}

// ── constants ────────────────────────────────────────────────────────────────

const HARNESS_COLORS: Record<string, string> = {
  "Claude Code": "#8B5CF6",
  Codex: "#3B82F6",
  OpenCode: "#10B981",
  Hermes: "#EC4899",
};

const HARNESS_ORDER = ["Claude Code", "Codex", "OpenCode", "Hermes"];

function getHarness(modelName: string): string {
  if (modelName.startsWith("claude-")) return "Claude Code";
  if (modelName.startsWith("gpt-")) return "Codex";
  if (modelName === "big-pickle") return "Hermes";
  return "OpenCode";
}

function getProviderGroup(modelName: string): string {
  if (modelName.startsWith("claude-")) return "Claude";
  if (modelName.startsWith("gpt-")) return "OpenAI";
  if (modelName === "big-pickle") return "Hermes";
  if (modelName.startsWith("deepseek") || modelName.includes("deepseek")) return "DeepSeek";
  if (modelName.startsWith("glm-")) return "GLM";
  if (modelName.startsWith("qwen")) return "Qwen";
  if (modelName.startsWith("minimax")) return "MiniMax";
  if (modelName.startsWith("kimi")) return "Kimi";
  return "Other";
}

const PROVIDER_COLORS: Record<string, string> = {
  Claude: "#8B5CF6",
  OpenAI: "#3B82F6",
  Hermes: "#EC4899",
  DeepSeek: "#F59E0B",
  GLM: "#10B981",
  Qwen: "#06B6D4",
  MiniMax: "#F97316",
  Kimi: "#84CC16",
  Other: "#6B7280",
};

// ── helpers ──────────────────────────────────────────────────────────────────

function humanize(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function monthLabel(period: string): string {
  const [year, month] = period.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleString("en", { month: "short", year: "2-digit" });
}

// ── sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-muted,#334155)] bg-[var(--surface-raised)] p-5">
      <p className="text-sm text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-3xl font-bold text-[var(--text-strong)] tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">{children}</h2>
  );
}

const CustomTooltipStyle: React.CSSProperties = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border-muted, #334155)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--text-strong)",
};

// ── main component ───────────────────────────────────────────────────────────

export default function UsageDashboard({ monthly }: Props) {
  // ── derived data ──────────────────────────────────────────────────────────

  const totals = monthly.reduce(
    (acc, m) => ({
      tokens: acc.tokens + m.totalTokens,
      cost: acc.cost + m.totalCost,
      creates: acc.creates + m.cacheCreationTokens,
      reads: acc.reads + m.cacheReadTokens,
    }),
    { tokens: 0, cost: 0, creates: 0, reads: 0 }
  );

  const allHarnesses = new Set<string>();
  monthly.forEach((m) =>
    m.modelBreakdowns.forEach((mb) => allHarnesses.add(getHarness(mb.modelName)))
  );

  // Monthly stacked bar by harness
  const monthlyByHarness = monthly.map((m) => {
    const row: Record<string, number | string> = { month: monthLabel(m.period) };
    const harnessTokens: Record<string, number> = {};
    m.modelBreakdowns.forEach((mb) => {
      const h = getHarness(mb.modelName);
      const t = mb.inputTokens + mb.outputTokens + mb.cacheCreationTokens + mb.cacheReadTokens;
      harnessTokens[h] = (harnessTokens[h] || 0) + t;
    });
    HARNESS_ORDER.forEach((h) => { row[h] = harnessTokens[h] || 0; });
    return row;
  });

  // Harness donut (all time)
  const harnessTotals: Record<string, number> = {};
  monthly.forEach((m) =>
    m.modelBreakdowns.forEach((mb) => {
      const h = getHarness(mb.modelName);
      const t = mb.inputTokens + mb.outputTokens + mb.cacheCreationTokens + mb.cacheReadTokens;
      harnessTotals[h] = (harnessTotals[h] || 0) + t;
    })
  );
  const harnessDonut = HARNESS_ORDER.filter((h) => harnessTotals[h] > 0).map((h) => ({
    name: h,
    value: harnessTotals[h],
  }));

  // Provider bar (top providers by token total)
  const providerTotals: Record<string, number> = {};
  monthly.forEach((m) =>
    m.modelBreakdowns.forEach((mb) => {
      const p = getProviderGroup(mb.modelName);
      const t = mb.inputTokens + mb.outputTokens + mb.cacheCreationTokens + mb.cacheReadTokens;
      providerTotals[p] = (providerTotals[p] || 0) + t;
    })
  );
  const providerBar = Object.entries(providerTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // Cache efficiency (cc vs cr per month)
  const cacheChart = monthly.map((m) => ({
    month: monthLabel(m.period),
    "Cache writes": m.cacheCreationTokens,
    "Cache reads": m.cacheReadTokens,
  }));

  // Model evolution: collect all models that appeared, sorted by total tokens desc
  const modelTotals: Record<string, number> = {};
  monthly.forEach((m) =>
    m.modelBreakdowns.forEach((mb) => {
      const t = mb.inputTokens + mb.outputTokens + mb.cacheCreationTokens + mb.cacheReadTokens;
      modelTotals[mb.modelName] = (modelTotals[mb.modelName] || 0) + t;
    })
  );
  // top 10 models by total usage, rest → "Other"
  const TOP_N = 10;
  const topModels = Object.entries(modelTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N)
    .map(([name]) => name);

  const modelEvolution = monthly.map((m) => {
    const row: Record<string, number | string> = { month: monthLabel(m.period) };
    const seen: Record<string, number> = {};
    m.modelBreakdowns.forEach((mb) => {
      const t = mb.inputTokens + mb.outputTokens + mb.cacheCreationTokens + mb.cacheReadTokens;
      const key = topModels.includes(mb.modelName) ? mb.modelName : "Other";
      seen[key] = (seen[key] || 0) + t;
    });
    topModels.forEach((k) => { row[k] = seen[k] || 0; });
    row["Other"] = seen["Other"] || 0;
    return row;
  });

  // friendly short model name for display
  function shortModel(name: string): string {
    return name
      .replace("claude-", "")
      .replace("-20251001", "")
      .replace("claude-", "")
      .replace(/^(claude|gpt|glm|qwen)-?/, (m) => m.toUpperCase());
  }

  // color a model by its vendor
  function modelColor(name: string): string {
    const p = getProviderGroup(name);
    const base = PROVIDER_COLORS[p] ?? "#6B7280";
    // vary lightness for same-vendor models so they're distinguishable
    const variants: Record<string, string[]> = {
      Claude: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#7C3AED"],
      OpenAI: ["#3B82F6", "#60A5FA", "#2563EB"],
      GLM: ["#10B981", "#34D399", "#6EE7B7", "#059669", "#047857"],
      Qwen: ["#06B6D4", "#22D3EE"],
      DeepSeek: ["#F59E0B", "#FBBF24"],
      Hermes: ["#EC4899"],
      MiniMax: ["#F97316", "#FB923C"],
      Kimi: ["#84CC16"],
    };
    const palette = variants[p];
    if (palette) {
      const idx = topModels.filter((m) => getProviderGroup(m) === p).indexOf(name);
      return palette[idx % palette.length] ?? base;
    }
    return base;
  }

  // Cache hit rate overall
  const cacheHitRate =
    totals.reads + totals.creates > 0
      ? Math.round((totals.reads / (totals.reads + totals.creates)) * 100)
      : 0;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10">
      {/* headline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total tokens"
          value={humanize(totals.tokens)}
          sub={`across ${monthly.length} months`}
        />
        <StatCard
          label="API-equivalent value"
          value={`$${totals.cost.toFixed(0)}`}
          sub="at API rates (subscription pays flat)"
        />
        <StatCard
          label="Cache hit rate"
          value={`${cacheHitRate}%`}
          sub="reads vs writes — higher is better"
        />
        <StatCard
          label="Harnesses used"
          value={String(allHarnesses.size)}
          sub={[...allHarnesses].join(", ")}
        />
      </div>

      {/* monthly volume by harness */}
      <div>
        <SectionHeading>Monthly token volume by harness</SectionHeading>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyByHarness} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} />
            <YAxis
              tickFormatter={(v) => humanize(v as number)}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              width={48}
            />
            <Tooltip
              contentStyle={CustomTooltipStyle}
              formatter={(v, name) => [humanize(v as number), name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {HARNESS_ORDER.filter((h) => allHarnesses.has(h)).map((h) => (
              <Bar key={h} dataKey={h} stackId="a" fill={HARNESS_COLORS[h]} radius={h === "Hermes" ? [3, 3, 0, 0] : undefined} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* harness donut + provider bar side by side */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <SectionHeading>Harness distribution</SectionHeading>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={harnessDonut}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {harnessDonut.map((entry) => (
                  <Cell key={entry.name} fill={HARNESS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CustomTooltipStyle}
                formatter={(v) => [humanize(v as number), "tokens"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <SectionHeading>Token volume by model provider</SectionHeading>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              layout="vertical"
              data={providerBar}
              margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => humanize(v as number)}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#94A3B8" }} width={64} />
              <Tooltip
                contentStyle={CustomTooltipStyle}
                formatter={(v) => [humanize(v as number), "tokens"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {providerBar.map((entry) => (
                  <Cell key={entry.name} fill={PROVIDER_COLORS[entry.name] ?? "#6B7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* model evolution by month */}
      <div>
        <SectionHeading>Model evolution — which models I actually used each month</SectionHeading>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Same vendor, different model each month shows AI tooling churn. Colors group by provider
          family; shades distinguish models within the same vendor.
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={modelEvolution} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} />
            <YAxis
              tickFormatter={(v) => humanize(v as number)}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              width={48}
            />
            <Tooltip
              contentStyle={CustomTooltipStyle}
              formatter={(v, name) => [humanize(v as number), name as string]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => shortModel(value)}
            />
            {topModels.map((model) => (
              <Bar
                key={model}
                dataKey={model}
                stackId="m"
                fill={modelColor(model)}
                name={model}
              />
            ))}
            <Bar key="Other" dataKey="Other" stackId="m" fill="#4B5563" name="Other" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* cache efficiency area chart */}
      <div>
        <SectionHeading>Cache efficiency — writes vs reads</SectionHeading>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Cache reads are ~10× cheaper than writes. A healthy session has a small write spike at start,
          then overwhelmingly reads.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={cacheChart} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="gradReads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWrites" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} />
            <YAxis
              tickFormatter={(v) => humanize(v as number)}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              width={48}
            />
            <Tooltip
              contentStyle={CustomTooltipStyle}
              formatter={(v, name) => [humanize(v as number), name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="Cache reads" stroke="#10B981" fill="url(#gradReads)" strokeWidth={2} />
            <Area type="monotone" dataKey="Cache writes" stroke="#EC4899" fill="url(#gradWrites)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
