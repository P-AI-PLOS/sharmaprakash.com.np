import { useMemo } from "react";
import { CopyButton, DownloadButton, Field, ToolCard, inputClass, selectClass, uid, usePersistentState } from "~/components/tools/shared/ToolUi";

type EventName = "PreToolUse" | "PostToolUse" | "UserPromptSubmit" | "Stop" | "SubagentStop" | "SessionStart" | "SessionEnd" | "Notification" | "PreCompact";
type Hook = { id: string; event: EventName; matcher: string; command: string; timeout: number };
type Saved = { schemaVersion: 1; hooks: Hook[] };

const events: { name: EventName; note: string }[] = [
  { name: "PreToolUse", note: "Runs before a tool; exit 2 blocks it and stdout JSON can explain the decision." },
  { name: "PostToolUse", note: "Runs after a tool finishes; useful for formatting, validation, or audit logs." },
  { name: "UserPromptSubmit", note: "Runs when a prompt is submitted; hookSpecificOutput can add context." },
  { name: "Stop", note: "Runs when the assistant is about to stop." },
  { name: "SubagentStop", note: "Runs when a subagent is about to stop." },
  { name: "SessionStart", note: "Runs at session start; hookSpecificOutput can inject context." },
  { name: "SessionEnd", note: "Runs when a session closes." },
  { name: "Notification", note: "Runs for Claude Code notifications." },
  { name: "PreCompact", note: "Runs before context compaction." },
];
const presets: Record<string, Omit<Hook, "id">[]> = {
  "block-dangerous-bash": [{ event: "PreToolUse", matcher: "Bash", command: "bash -c 'if grep -Eq \"rm -rf|git reset --" + "hard\"; then echo blocked >&2; exit 2; fi'", timeout: 10 }],
  "format-on-edit": [{ event: "PostToolUse", matcher: "Edit|Write", command: "pnpm exec prettier --write \"$CLAUDE_FILE_PATH\"", timeout: 30 }],
  "protect-paths": [{ event: "PreToolUse", matcher: "Edit|Write", command: "./scripts/protect-paths.sh", timeout: 10 }],
  "session-context-injector": [{ event: "SessionStart", matcher: "", command: "cat .claude/session-context.md", timeout: 10 }],
  "audit-log": [{ event: "PostToolUse", matcher: ".*", command: "./scripts/log-claude-tool.sh", timeout: 10 }],
};

const blankHook = (): Hook => ({ id: uid("hook"), event: "PreToolUse", matcher: "", command: "", timeout: 10 });
function settingsJson(hooks: Hook[]) {
  const grouped: Record<string, { matcher: string; hooks: { type: "command"; command: string; timeout?: number }[] }[]> = {};
  hooks.filter((hook) => hook.command.trim()).forEach((hook) => {
    const entry = { matcher: hook.matcher, hooks: [{ type: "command" as const, command: hook.command, ...(hook.timeout > 0 ? { timeout: hook.timeout } : {}) }] };
    grouped[hook.event] = [...(grouped[hook.event] ?? []), entry];
  });
  return { hooks: grouped };
}

export default function ClaudeHookBuilder() {
  const [saved, setSaved] = usePersistentState<Saved>("tool:claude-hook-builder", { schemaVersion: 1, hooks: [blankHook()] });
  const hooks = saved.hooks;
  const update = (id: string, patch: Partial<Hook>) => setSaved((current) => ({ ...current, hooks: current.hooks.map((hook) => hook.id === id ? { ...hook, ...patch } : hook) }));
  const preview = useMemo(() => JSON.stringify(settingsJson(hooks), null, 2), [hooks]);
  const loadPreset = (name: string) => setSaved({ schemaVersion: 1, hooks: presets[name].map((hook) => ({ ...hook, id: uid("hook") })) });

  return <div className="grid gap-6">
    <ToolCard title="Start with a recipe"><div className="flex flex-wrap gap-2">{Object.keys(presets).map((name) => <button key={name} type="button" className="btn btn-secondary btn-sm" onClick={() => loadPreset(name)}>{name.replaceAll("-", " ")}</button>)}</div><p className="mt-3 text-caption text-muted">Matchers are tool-name regexes for tool events; leave one empty to match every tool. Commands run locally when you paste this block into Claude Code.</p></ToolCard>
    <div className="grid gap-4">{hooks.map((hook, index) => { const event = events.find((item) => item.name === hook.event) ?? events[0]; return <ToolCard key={hook.id} title={`Hook ${index + 1}`}>
      <div className="grid gap-4 md:grid-cols-2"><Field label="Lifecycle event"><select className={selectClass} value={hook.event} onChange={(e) => update(hook.id, { event: e.target.value as EventName })}>{events.map((item) => <option key={item.name}>{item.name}</option>)}</select></Field><Field label="Matcher" hint={hook.event.startsWith("PreTool") || hook.event === "PostToolUse" ? "Tool name regex; empty means all tools." : "Optional matcher passed to Claude Code."}><input className={inputClass} value={hook.matcher} onChange={(e) => update(hook.id, { matcher: e.target.value })} placeholder="Bash|Edit" /></Field><Field label="Command"><input className={inputClass} value={hook.command} onChange={(e) => update(hook.id, { command: e.target.value })} placeholder="./scripts/check.sh" /></Field><Field label="Timeout (seconds)"><input className={inputClass} type="number" min="0" value={hook.timeout} onChange={(e) => update(hook.id, { timeout: Number(e.target.value) || 0 })} /></Field></div>
      <p className="mt-3 text-caption text-muted">{event.note}</p><button type="button" className="mt-3 text-caption font-semibold text-danger-700 link-underline" onClick={() => setSaved((current) => ({ ...current, hooks: current.hooks.filter((item) => item.id !== hook.id) }))}>Remove hook</button>
    </ToolCard>; })}</div>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-primary btn-sm" onClick={() => setSaved((current) => ({ ...current, hooks: [...current.hooks, blankHook()] }))}>Add hook</button><CopyButton value={preview} label="Copy settings.json" /><DownloadButton value={preview} filename="settings.json" label="Download settings.json" /></div>
    <ToolCard title="Live settings.json preview"><pre className="max-h-[32rem] overflow-auto rounded-lg bg-surface-inverse p-4 text-caption text-on-inverse">{preview}</pre></ToolCard>
  </div>;
}
