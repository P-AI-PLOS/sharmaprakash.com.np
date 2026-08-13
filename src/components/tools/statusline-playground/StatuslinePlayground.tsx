import { useMemo } from "react";
import { CopyButton, DownloadButton, Field, ToolCard, inputClass, selectClass, usePersistentState } from "~/components/tools/shared/ToolUi";
import {
  colorCss,
  colors,
  commandScript,
  definitions,
  makeInitial,
  normalizeSaved,
  previewText,
  settingsJson,
  type Alignment,
  type Layout,
  type Sample,
  type Saved,
  type Segment,
} from "./statusline";

const storageKey = "tool:statusline-playground";

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-body-sm text-muted">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-accent-600" />
      <span>{label}</span>
    </label>
  );
}

function NumberField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min?: number; max?: number; step?: number; onChange: (value: number) => void }) {
  return <Field label={label}><input className={inputClass} type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} /></Field>;
}

export default function StatuslinePlayground() {
  const [stored, setStored] = usePersistentState<unknown>(storageKey, makeInitial());
  const saved = useMemo(() => normalizeSaved(stored), [stored]);
  const update = (change: (current: Saved) => Saved) => setStored((current: unknown) => change(normalizeSaved(current)));
  const setSample = <K extends keyof Sample>(key: K, value: Sample[K]) => update((current) => ({ ...current, sample: { ...current.sample, [key]: value } }));
  const setLayout = (layout: Layout) => update((current) => ({ ...current, layout }));
  const enabledKey = saved.layout === "one" ? "enabledOne" : "enabledThree";
  const orderKey = saved.layout === "one" ? "orderOne" : "orderThree";
  const visible = saved.segments
    .filter((segment) => definitions.find((item) => item.kind === segment.kind)?.modes.includes(saved.layout))
    .sort((a, b) => a[orderKey] - b[orderKey]);
  const enabled = visible.filter((segment) => segment[enabledKey]);
  const script = useMemo(() => commandScript(saved), [saved]);
  const settings = useMemo(() => settingsJson(saved), [saved]);

  const updateSegment = (id: string, patch: Partial<Segment>) => update((current) => ({
    ...current,
    segments: current.segments.map((segment) => segment.id === id ? { ...segment, ...patch } : segment),
  }));

  const move = (id: string, direction: -1 | 1) => update((current) => {
    const currentOrderKey = current.layout === "one" ? "orderOne" : "orderThree";
    const modeKinds = current.segments
      .filter((segment) => definitions.find((item) => item.kind === segment.kind)?.modes.includes(current.layout))
      .sort((a, b) => a[currentOrderKey] - b[currentOrderKey]);
    const modeIndex = modeKinds.findIndex((segment) => segment.id === id);
    const target = modeKinds[modeIndex + direction];
    if (modeIndex < 0 || !target) return current;
    const source = modeKinds[modeIndex];
    return { ...current, segments: current.segments.map((segment) => {
      if (segment.id === source.id) return { ...segment, [currentOrderKey]: target[currentOrderKey] };
      if (segment.id === target.id) return { ...segment, [currentOrderKey]: source[currentOrderKey] };
      return segment;
    }) };
  });

  const restorePreset = () => update((current) => {
    const fresh = makeInitial();
    return {
      ...current,
      segments: current.segments.map((segment) => {
        const preset = fresh.segments.find((item) => item.kind === segment.kind);
        if (!preset) return segment;
        return current.layout === "one"
          ? { ...segment, enabledOne: preset.enabledOne, orderOne: preset.orderOne }
          : { ...segment, enabledThree: preset.enabledThree, row: preset.row, align: preset.align, orderThree: preset.orderThree };
      }),
    };
  });

  const previewRow = (row: 0 | 1 | 2) => {
    const rowSegments = saved.layout === "one" ? enabled : enabled.filter((segment) => segment.row === row);
    const groups = (["left", "right"] as Alignment[]).map((alignment) => rowSegments
      .filter((segment) => saved.layout === "one" || segment.align === alignment)
      .map((segment) => ({ segment, text: previewText(segment.kind, saved.sample, saved.layout) }))
      .filter((item): item is { segment: Segment; text: string } => Boolean(item.text)));
    if (groups.every((group) => group.length === 0)) return null;
    return (
      <div key={row} className="flex min-w-max items-center justify-between gap-8">
        {groups.map((group, groupIndex) => <div key={groupIndex} className="flex items-center gap-2">{group.map(({ segment, text }) => <span key={segment.id} style={{ color: colorCss(segment.color) }}>{text}</span>)}</div>)}
      </div>
    );
  };

  const docsForMode = saved.layout === "one"
    ? { href: "/ai/statusline-the-five-second-feedback-loop/", label: "Read the One row post" }
    : { href: "/ai/statusline-v2-three-rows-live-project-hud/", label: "Read the Three rows post" };

  return <div className="grid gap-6">
    <ToolCard title="Live preview">
      <div className="overflow-x-auto rounded-lg bg-surface-inverse p-4 font-mono text-caption text-on-inverse">
        <div className="grid min-w-max gap-2">{saved.layout === "one" ? previewRow(0) : ([0, 1, 2] as const).map(previewRow)}</div>
      </div>
      <p className="mt-3 text-caption text-muted">Empty or unavailable fields disappear at runtime. Right-aligned segments use the terminal width in Three rows.</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className={`btn btn-sm ${saved.layout === "one" ? "btn-primary" : "btn-secondary"}`} onClick={() => setLayout("one")}>One row</button>
        <button type="button" className={`btn btn-sm ${saved.layout === "three" ? "btn-primary" : "btn-secondary"}`} onClick={() => setLayout("three")}>Three rows</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={restorePreset}>Restore post preset</button>
        <a href={docsForMode.href} className="ml-auto text-caption font-semibold text-accent-700 underline-offset-4 hover:underline">{docsForMode.label} →</a>
      </div>
    </ToolCard>

    <ToolCard title="Sample data">
      <p className="mb-4 text-body-sm text-muted">Change the values to see thresholds, optional fields, and conditional project state before exporting.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Context free %"><input className={inputClass} type="range" min="0" max="100" value={saved.sample.ctxPct} onChange={(event) => setSample("ctxPct", Number(event.target.value))} /><span className="text-caption text-muted">{saved.sample.ctxPct}% free</span></Field>
        <NumberField label="Context window" value={saved.sample.ctxSize} min={1} step={1000} onChange={(value) => setSample("ctxSize", value)} />
        <NumberField label="Context tokens" value={saved.sample.tokens} min={0} step={1000} onChange={(value) => setSample("tokens", value)} />
        <Field label="Working directory"><input className={inputClass} value={saved.sample.cwd} onChange={(event) => setSample("cwd", event.target.value)} /></Field>
        <Field label="Branch"><input className={inputClass} value={saved.sample.branch} onChange={(event) => setSample("branch", event.target.value)} /></Field>
        <Field label="Model"><input className={inputClass} value={saved.sample.model} onChange={(event) => setSample("model", event.target.value)} /></Field>
        <NumberField label="Session cost (USD)" value={saved.sample.costUsd} min={0} step={0.01} onChange={(value) => setSample("costUsd", value)} />
        <NumberField label="Lines added" value={saved.sample.linesAdded} min={0} onChange={(value) => setSample("linesAdded", value)} />
        <NumberField label="Lines removed" value={saved.sample.linesRemoved} min={0} onChange={(value) => setSample("linesRemoved", value)} />
      </div>

      <details className="mt-5 rounded-lg border border-ink-200 p-4" open={saved.layout === "three"}>
        <summary className="cursor-pointer text-body-sm font-semibold text-strong">Git, limits, and model state</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="grid content-start gap-2"><Toggle checked={saved.sample.dirty} label="Uncommitted changes" onChange={(value) => setSample("dirty", value)} /><Toggle checked={saved.sample.fast} label="Fast mode" onChange={(value) => setSample("fast", value)} /><Toggle checked={saved.sample.thinking} label="Extended thinking" onChange={(value) => setSample("thinking", value)} /><Toggle checked={saved.sample.exceeds200k} label="Exceeds 200k" onChange={(value) => setSample("exceeds200k", value)} /></div>
          <NumberField label="Commits ahead" value={saved.sample.ahead} min={0} onChange={(value) => setSample("ahead", value)} />
          <NumberField label="Commits behind" value={saved.sample.behind} min={0} onChange={(value) => setSample("behind", value)} />
          <NumberField label="Cache hit %" value={saved.sample.cachePct} min={0} max={100} onChange={(value) => setSample("cachePct", value)} />
          <NumberField label="5-hour used %" value={saved.sample.rate5} min={0} max={100} onChange={(value) => setSample("rate5", value)} />
          <NumberField label="7-day used %" value={saved.sample.rate7} min={0} max={100} onChange={(value) => setSample("rate7", value)} />
          <Field label="Reasoning effort"><select className={selectClass} value={saved.sample.effort} onChange={(event) => setSample("effort", event.target.value as Sample["effort"])}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="max">Max</option></select></Field>
          <Field label="Output style"><input className={inputClass} value={saved.sample.style} onChange={(event) => setSample("style", event.target.value)} /></Field>
          <Field label="Custom text"><input className={inputClass} value={saved.sample.custom} onChange={(event) => setSample("custom", event.target.value)} /></Field>
        </div>
      </details>

      {saved.layout === "three" && <>
        <details className="mt-3 rounded-lg border border-ink-200 p-4">
          <summary className="cursor-pointer text-body-sm font-semibold text-strong">PR, session, and live-state samples</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Worktree"><input className={inputClass} value={saved.sample.worktree} onChange={(event) => setSample("worktree", event.target.value)} /></Field>
            <NumberField label="PR number" value={saved.sample.prNumber} min={0} onChange={(value) => setSample("prNumber", value)} />
            <Field label="PR review"><select className={selectClass} value={saved.sample.prState} onChange={(event) => setSample("prState", event.target.value as Sample["prState"])}><option value="approved">Approved</option><option value="pending">Pending</option><option value="changes_requested">Changes requested</option><option value="draft">Draft</option></select></Field>
            <Field label="CI checks"><select className={selectClass} value={saved.sample.ciState} onChange={(event) => setSample("ciState", event.target.value as Sample["ciState"])}><option value="pass">Pass</option><option value="pending">Pending</option><option value="fail">Fail</option></select></Field>
            <Field label="Session name"><input className={inputClass} value={saved.sample.session} onChange={(event) => setSample("session", event.target.value)} /></Field>
            <Field label="Session duration"><input className={inputClass} value={saved.sample.duration} onChange={(event) => setSample("duration", event.target.value)} /></Field>
            <NumberField label="API busy %" value={saved.sample.apiPct} min={0} max={100} onChange={(value) => setSample("apiPct", value)} />
            <Field label="5-hour reset"><input className={inputClass} value={saved.sample.rate5Reset} onChange={(event) => setSample("rate5Reset", event.target.value)} /></Field>
            <Field label="7-day reset"><input className={inputClass} value={saved.sample.rate7Reset} onChange={(event) => setSample("rate7Reset", event.target.value)} /></Field>
          </div>
        </details>
        <details className="mt-3 rounded-lg border border-ink-200 p-4">
          <summary className="cursor-pointer text-body-sm font-semibold text-strong">Project HUD samples</summary>
          <p className="mt-2 text-caption text-muted">These are project-derived previews. The exported script reads local files or a cached CLI result.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="grid content-start gap-2"><Toggle checked={saved.sample.gsd} label="GSD state present" onChange={(value) => setSample("gsd", value)} /><Toggle checked={saved.sample.openspec} label="OpenSpec present" onChange={(value) => setSample("openspec", value)} /><Toggle checked={saved.sample.beads} label="Beads present" onChange={(value) => setSample("beads", value)} /></div>
            <Field label="GSD phase"><input className={inputClass} value={saved.sample.gsdPhase} onChange={(event) => setSample("gsdPhase", event.target.value)} /></Field>
            <NumberField label="OpenSpec new" value={saved.sample.openspecNew} min={0} onChange={(value) => setSample("openspecNew", value)} />
            <NumberField label="OpenSpec in flight" value={saved.sample.openspecWip} min={0} onChange={(value) => setSample("openspecWip", value)} />
            <NumberField label="Beads ready" value={saved.sample.beadsReady} min={0} onChange={(value) => setSample("beadsReady", value)} />
            <NumberField label="Beads in progress" value={saved.sample.beadsWip} min={0} onChange={(value) => setSample("beadsWip", value)} />
            <NumberField label="Beads blocked" value={saved.sample.beadsBlocked} min={0} onChange={(value) => setSample("beadsBlocked", value)} />
          </div>
        </details>
      </>}
    </ToolCard>

    <ToolCard title={`${saved.layout === "one" ? "One row" : "Three rows"} elements`}>
      <p className="mb-4 text-body-sm text-muted">Every element names its runtime source and links to the relevant Claude Code documentation or implementation pattern.</p>
      <div className="grid gap-3">
        {visible.map((segment, index) => {
          const definition = definitions.find((item) => item.kind === segment.kind)!;
          return <div key={segment.id} className="rounded-lg border border-ink-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={`btn btn-sm ${segment[enabledKey] ? "btn-primary" : "btn-ghost"}`} onClick={() => updateSegment(segment.id, { [enabledKey]: !segment[enabledKey] })}>{segment[enabledKey] ? "On" : "Off"}</button>
              <strong className="min-w-36 text-caption text-strong">{definition.label}</strong>
              <span className="rounded-full bg-ink-100 px-2 py-1 text-caption text-muted">{definition.source}</span>
              <select aria-label={`${definition.label} color`} className={`${selectClass} w-auto`} value={segment.color} onChange={(event) => updateSegment(segment.id, { color: event.target.value as Segment["color"] })}>{colors.map((color) => <option key={color.key} value={color.key}>{color.label}</option>)}</select>
              {saved.layout === "three" && <><select aria-label={`${definition.label} row`} className={`${selectClass} w-auto`} value={segment.row} onChange={(event) => updateSegment(segment.id, { row: Number(event.target.value) as Segment["row"] })}><option value="0">Row 1</option><option value="1">Row 2</option><option value="2">Row 3</option></select><select aria-label={`${definition.label} alignment`} className={`${selectClass} w-auto`} value={segment.align} onChange={(event) => updateSegment(segment.id, { align: event.target.value as Alignment })}><option value="left">Left</option><option value="right">Right</option></select></>}
              <button type="button" aria-label={`Move ${definition.label} up`} className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => move(segment.id, -1)}>↑</button>
              <button type="button" aria-label={`Move ${definition.label} down`} className="btn btn-ghost btn-sm" disabled={index === visible.length - 1} onClick={() => move(segment.id, 1)}>↓</button>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 pl-1">
              <p className="text-caption text-muted">{definition.description}</p>
              <a href={definition.docsHref} target="_blank" rel="noreferrer" className="text-caption font-semibold text-accent-700 underline-offset-4 hover:underline">Claude docs: {definition.docsLabel} ↗</a>
            </div>
          </div>;
        })}
      </div>
    </ToolCard>

    <ToolCard title="Export">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Script path"><input className={inputClass} value={saved.options.scriptPath} onChange={(event) => update((current) => ({ ...current, options: { ...current.options, scriptPath: event.target.value } }))} /></Field>
        <NumberField label="Refresh interval (seconds)" value={saved.options.refreshInterval} min={1} onChange={(value) => update((current) => ({ ...current, options: { ...current.options, refreshInterval: Math.max(1, value) } }))} />
        <div className="grid content-start gap-2 pt-1"><Toggle checked={saved.options.capturePayload} label="Save last JSON payload for debugging" onChange={(value) => update((current) => ({ ...current, options: { ...current.options, capturePayload: value } }))} /><Toggle checked={saved.options.hyperlinks} label="Use clickable OSC 8 links" onChange={(value) => update((current) => ({ ...current, options: { ...current.options, hyperlinks: value } }))} /></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><CopyButton value={script} label="Copy bash script" /><DownloadButton value={script} filename="statusline-command.sh" label="Download script" /><CopyButton value={settings} label="Copy settings.json" /></div>
      <p className="mt-3 text-caption text-muted">Requires Bash, jq, and git. CI uses gh; Beads uses bd. Slow external reads are cached and refreshed in the background.</p>
      <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-surface-inverse p-4 text-caption text-on-inverse">{script}</pre>
    </ToolCard>
  </div>;
}
