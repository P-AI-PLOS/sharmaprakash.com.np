import { useMemo, useState } from "react";
import { Field, ToolCard, inputClass, usePersistentState } from "~/components/tools/shared/ToolUi";

type Severity = "pass" | "warn" | "fail";
type Issue = { family: string; severity: Severity; message: string; lines?: number[] };
type Saved = { schemaVersion: 1; input: string };
const vague = /\b(try to|if possible|be careful|as appropriate|generally)\b/i;
const stale = /\b(TODO|FIXME|HACK|temporary|deprecated|remove after)\b/i;
const secret = /(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|github_pat_[A-Za-z0-9_]{20,}|(?:api[_-]?key|secret)\s*[:=]\s*["']?[A-Za-z0-9_-]{16,})/i;
const opposites = [{ keyword: "commit", positive: /always .*commit|must commit|commit every/i, negative: /never .*commit|do not commit|don't commit/i }, { keyword: "push", positive: /always .*push|must push/i, negative: /never .*push|do not push|don't push/i }, { keyword: "test", positive: /always .*test|must test/i, negative: /never .*test|do not test|don't test/i }, { keyword: "format", positive: /always .*format|must format/i, negative: /never .*format|do not format|don't format/i }, { keyword: "deploy", positive: /always .*deploy|must deploy/i, negative: /never .*deploy|do not deploy|don't deploy/i }];

function issue(family: string, severity: Severity, message: string, lines?: number[]): Issue { return { family, severity, message, lines }; }
function lint(text: string): { score: number; issues: Issue[] } {
  const lines = text.split(/\r?\n/);
  const issues: Issue[] = [];
  const headingLines = lines.map((line, index) => /^\s*#{1,6}\s+/.test(line) ? index + 1 : 0).filter(Boolean);
  const commandLines = lines.map((line, index) => /```|\b(pnpm|npm|yarn|bun|make|cargo|bundle|uv)\b/i.test(line) ? index + 1 : 0).filter(Boolean);
  if (text.length > 40000) issues.push(issue("Length", "fail", "The file is over 40,000 characters; split durable instructions into focused docs."));
  else if (lines.length > 300 || text.length > 12000) issues.push(issue("Length", "warn", `Long instruction file (${lines.length} lines, ${text.length.toLocaleString()} characters) may dilute attention.`));
  else issues.push(issue("Length", "pass", "Length is within the heuristic budget."));
  if (!headingLines.length) issues.push(issue("Structure", "warn", "Add headings so an agent can scan the instruction hierarchy."));
  if (!commandLines.length) issues.push(issue("Structure", "warn", "Add a Commands section with at least one fenced or recognizable command."));
  const firstContent = lines.find((line) => line.trim() && !line.startsWith("---") && !line.startsWith("#"));
  if (!firstContent || firstContent.trim().length < 30) issues.push(issue("Structure", "warn", "Open with a short project description before the rules."));
  else issues.push(issue("Structure", "pass", "Headings, command guidance, and an opening description are present."));
  opposites.forEach(({ keyword, positive, negative }) => { const positives = lines.map((line, index) => positive.test(line) ? index + 1 : 0).filter(Boolean); const negatives = lines.map((line, index) => negative.test(line) ? index + 1 : 0).filter(Boolean); if (positives.length && negatives.length) issues.push(issue("Contradiction", "fail", `Conflicting polarity for “${keyword}”: both permissive and prohibitive instructions appear.`, [...positives.slice(0, 2), ...negatives.slice(0, 2)])); });
  const vagueLines = lines.map((line, index) => vague.test(line) ? index + 1 : 0).filter(Boolean);
  if (vagueLines.length) issues.push(issue("Vague language", "warn", "Replace vague wording with an observable action or check.", vagueLines.slice(0, 12))); else issues.push(issue("Vague language", "pass", "No common vague-language markers found."));
  const seen = new Map<string, number[]>();
  lines.forEach((line, index) => { const normalized = line.trim().toLowerCase().replace(/[`*_]/g, "").replace(/\s+/g, " "); if (normalized.length > 20) seen.set(normalized, [...(seen.get(normalized) ?? []), index + 1]); });
  const duplicateLines = [...seen.values()].filter((values) => values.length > 1).flat();
  if (duplicateLines.length) issues.push(issue("Duplication", "warn", "Near-identical instruction lines repeat; keep one authoritative version.", duplicateLines.slice(0, 16))); else issues.push(issue("Duplication", "pass", "No repeated long instruction lines found."));
  const staleLines = lines.map((line, index) => stale.test(line) ? index + 1 : 0).filter(Boolean);
  if (staleLines.length) issues.push(issue("Stale markers", "warn", "Review TODO/FIXME/deprecated wording before relying on this file.", staleLines)); else issues.push(issue("Stale markers", "pass", "No common stale markers found."));
  const secretLines = lines.map((line, index) => secret.test(line) ? index + 1 : 0).filter(Boolean);
  if (secretLines.length) issues.push(issue("Secrets", "fail", "An API-key-like value is visible. Remove it and rotate the credential.", secretLines)); else issues.push(issue("Secrets", "pass", "No obvious API-key patterns found."));
  const deductions = issues.reduce((sum, item) => sum + (item.severity === "fail" ? 20 : item.severity === "warn" ? 7 : 0), 0);
  return { score: Math.max(0, 100 - deductions), issues };
}

export default function AgentsMdLinter() {
  const [saved, setSaved] = usePersistentState<Saved>("tool:agents-md-linter", { schemaVersion: 1, input: "" });
  const [ran, setRan] = useState(false);
  const result = useMemo(() => lint(saved.input), [saved.input]);
  const loadFile = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setSaved((current) => ({ ...current, input: String(reader.result ?? "") })); reader.readAsText(file); };
  return <div className="grid gap-6">
    <ToolCard title="Paste or open an instruction file"><Field label="CLAUDE.md / AGENTS.md"><textarea className={`${inputClass} min-h-96 font-mono text-caption`} value={saved.input} onChange={(e) => setSaved((current) => ({ ...current, input: e.target.value }))} placeholder="# Project instructions\n\nDescribe the project, then make each rule observable…" /></Field><div className="mt-4 flex flex-wrap items-center gap-3"><label className="btn btn-secondary btn-sm cursor-pointer">Open file<input className="sr-only" type="file" accept=".md,.markdown,text/markdown" onChange={(e) => loadFile(e.target.files?.[0])} /></label><button type="button" className="btn btn-primary btn-sm" onClick={() => setRan(true)}>Run lint</button><span className="text-caption text-muted">Heuristics only; no network or LLM calls.</span></div></ToolCard>
    {ran && <><div className="grid gap-4 md:grid-cols-[auto_1fr]"><ToolCard title="Score"><p className="text-display-lg text-strong">{result.score}</p><p className="text-caption text-muted">out of 100</p></ToolCard><ToolCard title="Summary"><p className="text-body text-strong">{result.issues.filter((item) => item.severity === "fail").length} fail · {result.issues.filter((item) => item.severity === "warn").length} warn · {result.issues.filter((item) => item.severity === "pass").length} pass</p><p className="mt-2 text-caption text-muted">A heuristic score is a conversation starter, not proof that an instruction file is correct.</p></ToolCard></div><ToolCard title="Checks"><div className="grid gap-3">{result.issues.map((item, index) => <div key={`${item.family}-${index}`} className="rounded-lg border border-ink-200 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-caption text-strong">{item.family}</strong><span className={`text-caption font-semibold ${item.severity === "fail" ? "text-danger-700" : item.severity === "warn" ? "text-warning-700" : "text-positive-700"}`}>{item.severity}</span></div><p className="mt-1 text-caption text-muted">{item.message}</p>{item.lines?.length ? <p className="mt-1 font-mono text-[11px] text-faint">lines {item.lines.join(", ")}</p> : null}</div>)}</div></ToolCard></>}
  </div>;
}
