import { useMemo, useState } from "react";
import { CopyButton, Field, SvgBar, ToolCard, inputClass, selectClass, uid, usePersistentState } from "~/components/tools/shared/ToolUi";

type Row = { id: string; model: string; input: number; output: number; cacheRead: number; cacheWrite: number };
type Price = { in: number; out: number; cacheRead: number; cacheWrite: number };
type Saved = { schemaVersion: 1; rows: Row[]; prices: Record<string, Price> };
const modelNames = ["claude-fable-5", "claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"];
const defaults: Record<string, Price> = { "claude-fable-5": { in: 5, out: 25, cacheRead: 0.5, cacheWrite: 6.25 }, "claude-opus-5": { in: 15, out: 75, cacheRead: 1.5, cacheWrite: 18.75 }, "claude-sonnet-5": { in: 3, out: 15, cacheRead: 0.3, cacheWrite: 3.75 }, "claude-haiku-4-5": { in: 1, out: 5, cacheRead: 0.1, cacheWrite: 1.25 } };
const blankRow = (): Row => ({ id: uid("tokens"), model: modelNames[2], input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0;
const findNumber = (record: Record<string, unknown>, names: string[]) => number(names.map((name) => record[name]).find((value) => value !== undefined));
function parseCcusage(value: unknown): Row[] {
  const output: Row[] = [];
  const visit = (node: unknown, inheritedModel = modelNames[2]) => {
    if (Array.isArray(node)) return node.forEach((item) => visit(item, inheritedModel));
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    const model = String(record.model ?? record.modelName ?? record.model_name ?? inheritedModel);
    const input = findNumber(record, ["input", "inputTokens", "input_tokens", "inputTokenCount", "input_tokens_count"]);
    const outputTokens = findNumber(record, ["output", "outputTokens", "output_tokens", "outputTokenCount", "output_tokens_count"]);
    const cacheRead = findNumber(record, ["cacheRead", "cache_read_input_tokens", "cacheReadTokens", "cache_read"]);
    const cacheWrite = findNumber(record, ["cacheWrite", "cache_creation_input_tokens", "cacheWriteTokens", "cache_write"]);
    if (input || outputTokens || cacheRead || cacheWrite) output.push({ id: uid("import"), model: modelNames.find((name) => model.toLowerCase().includes(name.split("-")[1])) ?? model, input, output: outputTokens, cacheRead, cacheWrite });
    Object.entries(record).forEach(([key, child]) => { if (typeof child === "object" && key !== "cost") visit(child, model); });
  };
  visit(value);
  return output;
}
const costFor = (row: Row, price: Price) => (row.input / 1e6) * price.in + (row.output / 1e6) * price.out + (row.cacheRead / 1e6) * price.cacheRead + (row.cacheWrite / 1e6) * price.cacheWrite;

export default function TokenCostCalculator() {
  const [saved, setSaved] = usePersistentState<Saved>("tool:token-cost-calculator", { schemaVersion: 1, rows: [blankRow()], prices: defaults });
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const rows = saved.rows;
  const updateRow = (id: string, patch: Partial<Row>) => setSaved((current) => ({ ...current, rows: current.rows.map((row) => row.id === id ? { ...row, ...patch } : row) }));
  const results = useMemo(() => rows.map((row) => ({ row, cost: costFor(row, saved.prices[row.model] ?? defaults[modelNames[2]]) })), [rows, saved.prices]);
  const total = results.reduce((sum, result) => sum + result.cost, 0);
  const cache = rows.reduce((sum, row) => sum + costFor({ ...row, input: 0, output: 0 }, saved.prices[row.model] ?? defaults[modelNames[2]]), 0);
  const fresh = Math.max(0, total - cache);
  const markdown = `| Model | Input | Output | Cache read | Cache write | Cost |\n| --- | ---: | ---: | ---: | ---: | ---: |\n${results.map(({ row, cost }) => `| ${row.model} | ${row.input.toLocaleString()} | ${row.output.toLocaleString()} | ${row.cacheRead.toLocaleString()} | ${row.cacheWrite.toLocaleString()} | $${cost.toFixed(4)} |`).join("\n")}\n\n**Total: $${total.toFixed(4)}**`;
  const importJson = () => { try { const parsed = parseCcusage(JSON.parse(raw)); if (!parsed.length) throw new Error("No token rows found"); setSaved((current) => ({ ...current, rows: parsed })); setError(""); } catch { setError("That JSON did not contain recognizable ccusage token rows. Try an export with model and input/output token fields."); } };

  return <div className="grid gap-6">
    <ToolCard title="Paste a ccusage JSON export"><textarea className={`${inputClass} min-h-32 font-mono text-caption`} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder='{"daily": [{"model":"claude-sonnet-5","inputTokens":100000,"outputTokens":20000}]}' /><div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" className="btn btn-secondary btn-sm" onClick={importJson}>Parse JSON</button>{error && <p className="text-caption text-danger-700">{error}</p>}</div></ToolCard>
    <ToolCard title="Manual token rows"><div className="grid gap-4">{rows.map((row) => <div key={row.id} className="grid gap-3 rounded-lg border border-ink-200 p-3 md:grid-cols-6"><Field label="Model"><select className={selectClass} value={row.model} onChange={(e) => updateRow(row.id, { model: e.target.value })}>{modelNames.map((model) => <option key={model}>{model}</option>)}</select></Field>{(["input", "output", "cacheRead", "cacheWrite"] as const).map((key) => <Field key={key} label={key === "cacheRead" ? "Cache read" : key === "cacheWrite" ? "Cache write" : `${key[0].toUpperCase()}${key.slice(1)} tokens`}><input className={inputClass} type="number" min="0" value={row[key]} onChange={(e) => updateRow(row.id, { [key]: number(e.target.value) })} /></Field>)}<button type="button" className="self-end text-caption font-semibold text-danger-700 link-underline" onClick={() => setSaved((current) => ({ ...current, rows: current.rows.filter((item) => item.id !== row.id) }))}>Remove</button></div>)}</div><button type="button" className="btn btn-primary btn-sm mt-4" onClick={() => setSaved((current) => ({ ...current, rows: [...current.rows, blankRow()] }))}>Add row</button></ToolCard>
    <ToolCard title="Editable price table"><p className="mb-4 text-caption text-muted">Prices are USD per million tokens and are deliberately editable because provider pricing changes. Nothing is fetched from the network.</p><div className="grid gap-3 md:grid-cols-4">{modelNames.map((model) => <div key={model} className="grid gap-2 rounded-lg border border-ink-200 p-3"><strong className="text-caption text-strong">{model}</strong>{(["in", "out", "cacheRead", "cacheWrite"] as const).map((key) => <label key={key} className="flex items-center justify-between gap-2 text-caption text-muted"><span>{key}</span><input className="w-20 rounded border border-ink-200 bg-surface-base px-2 py-1 text-right text-caption text-strong" type="number" step="0.01" value={saved.prices[model][key]} onChange={(e) => setSaved((current) => ({ ...current, prices: { ...current.prices, [model]: { ...current.prices[model], [key]: number(e.target.value) } } }))} /></label>)}</div>)}</div></ToolCard>
    <div className="grid gap-4 md:grid-cols-3"><ToolCard title="Total"><p className="text-display-md text-strong">${total.toFixed(4)}</p><p className="text-caption text-muted">{rows.length} row{rows.length === 1 ? "" : "s"}</p></ToolCard><ToolCard title="Fresh vs cache"><p className="text-body font-semibold text-strong">Fresh ${fresh.toFixed(4)}</p><p className="text-caption text-muted">Cache ${cache.toFixed(4)} · {total ? ((cache / total) * 100).toFixed(1) : 0}% of cost</p><div className="mt-3 flex h-3 overflow-hidden rounded-full bg-ink-100"><span className="bg-accent-600" style={{ width: `${total ? (fresh / total) * 100 : 0}%` }} /><span className="bg-positive-600" style={{ width: `${total ? (cache / total) * 100 : 0}%` }} /></div></ToolCard><ToolCard title="Cost by model"><div className="grid gap-2">{results.map(({ row, cost }) => <SvgBar key={row.id} label={row.model} value={Number(cost.toFixed(4))} max={Math.max(...results.map((item) => item.cost), 0.0001)} />)}</div></ToolCard></div>
    <div className="flex flex-wrap items-center gap-3"><CopyButton value={markdown} /><span className="text-caption text-muted">Summary uses current editable prices.</span></div>
  </div>;
}
