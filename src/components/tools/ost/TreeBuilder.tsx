/**
 * Build an opportunity solution tree — outcome, opportunities, solutions —
 * pick a target opportunity, and export it as Markdown. Persists to
 * localStorage via ost-store, which can hold several trees (one per course
 * chapter embed, or any number created from the standalone tool) and
 * remembers which tree each embed context last had open.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, Maximize2, Workflow, X } from "lucide-react";
import { ExerciseShell, ChoiceButton } from "~/components/course/exercises/exercise-ui";
import TreeDiagram, { type TreeDirection } from "./TreeDiagram";
import OstTreeSwitcher from "./OstTreeSwitcher";
import OstHelpModal, { type OstConcept } from "./OstHelpModal";
import OstDashboard from "./OstDashboard";
import {
  contextKeyFor,
  createTree,
  deleteTree,
  listTrees,
  newOpportunity,
  newSolution,
  resolveActiveTree,
  saveTreeData,
  setActiveId as setActiveIdInStore,
  EMPTY_TREE,
  type OstRecord,
  type OstSource,
  type OstTree,
} from "~/utils/ost-store";

const FULLSCREEN_PARAM = "ost";
const FULLSCREEN_VALUE = "full";

interface TreeBuilderProps {
  /** Which embed this is — a specific course chapter, or the standalone tool. Defaults to standalone. */
  source?: OstSource;
  kicker?: string;
  title?: string;
  instructions?: string;
  /** Show the "your trees" management grid below the export block (used on the standalone tool page). */
  showDashboard?: boolean;
}

// Same icon language as the tree diagram: 🚩 outcome, 🧭 opportunity, 🎯 target opportunity, 💡 solution.
const toMarkdown = (tree: OstTree): string => {
  const lines = [`# Opportunity solution tree`, ``, `**Outcome:** 🚩 ${tree.outcome || "(not set)"}`, ``];
  tree.opportunities.forEach((opp) => {
    lines.push(`- ${opp.target ? "🎯 " : "🧭 "}${opp.text}`);
    opp.solutions.forEach((sol) => lines.push(`  - 💡 ${sol.text}`));
  });
  return lines.join("\n");
};

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

export default function TreeBuilder({
  source = { type: "standalone" },
  kicker = "Build yours",
  title = "Your opportunity solution tree",
  instructions = "Fill this in for your own product, not Donut CRM. It saves in your browser, so you can keep growing it as the course goes — outcome first, opportunities as you hear them, solutions only under the opportunity they serve.",
  showDashboard = false,
}: TreeBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tree, setTree] = useState<OstTree>(EMPTY_TREE);
  const [records, setRecords] = useState<OstRecord[]>([]);
  const [oppDraft, setOppDraft] = useState("");
  const [solDrafts, setSolDrafts] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState<TreeDirection>("top-down");
  const [fullscreen, setFullscreen] = useState(false);
  const [helpConcept, setHelpConcept] = useState<OstConcept | null>(null);
  const hydrated = useRef(false);
  const contextKey = contextKeyFor(source);

  useEffect(() => {
    const record = resolveActiveTree(source);
    setActiveId(record.id);
    setTree(record.tree);
    setRecords(listTrees());
    hydrated.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get(FULLSCREEN_PARAM) === FULLSCREEN_VALUE) setFullscreen(true);
    // Only the resolved source (via contextKey) should ever re-run this — source is a fresh object per render otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey]);

  // Mirror fullscreen state into the URL (replaceState, not pushState — this
  // is a view mode, not a new history entry) so a refresh re-opens in place.
  const skipFirstUrlSync = useRef(true);
  useEffect(() => {
    if (skipFirstUrlSync.current) {
      skipFirstUrlSync.current = false;
      return;
    }
    const url = new URL(window.location.href);
    if (fullscreen) url.searchParams.set(FULLSCREEN_PARAM, FULLSCREEN_VALUE);
    else url.searchParams.delete(FULLSCREEN_PARAM);
    window.history.replaceState(window.history.state, "", url);
  }, [fullscreen]);

  useEffect(() => {
    if (!hydrated.current || !activeId) return;
    saveTreeData(activeId, tree);
    setRecords(listTrees());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen]);

  const switchTo = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    setActiveIdInStore(contextKey, id);
    setActiveId(id);
    setTree(record.tree);
  };

  const createAndSwitch = () => {
    const record = createTree(source);
    setActiveIdInStore(contextKey, record.id);
    setActiveId(record.id);
    setTree(record.tree);
    setRecords(listTrees());
  };

  const removeTree = (id: string) => {
    deleteTree(id);
    const remaining = listTrees();
    setRecords(remaining);
    if (id === activeId) {
      const next = remaining[0] ?? createTree(source);
      setActiveIdInStore(contextKey, next.id);
      setActiveId(next.id);
      setTree(next.tree);
      if (remaining.length === 0) setRecords(listTrees());
    }
  };

  const addOpportunity = () => {
    const text = oppDraft.trim();
    if (!text) return;
    setTree((t) => ({ ...t, opportunities: [...t.opportunities, newOpportunity(text)] }));
    setOppDraft("");
  };

  const addSolution = (i: number) => {
    const text = (solDrafts[i] ?? "").trim();
    if (!text) return;
    setTree((t) => ({
      ...t,
      opportunities: t.opportunities.map((o, j) =>
        j === i ? { ...o, solutions: [...o.solutions, newSolution(text)] } : o,
      ),
    }));
    setSolDrafts((d) => ({ ...d, [i]: "" }));
  };

  const setTarget = (i: number) => {
    setTree((t) => ({
      ...t,
      opportunities: t.opportunities.map((o, j) => ({ ...o, target: j === i ? !o.target : false })),
    }));
  };

  const removeOpportunity = (i: number) => {
    setTree((t) => ({ ...t, opportunities: t.opportunities.filter((_, j) => j !== i) }));
  };

  const removeSolution = (i: number, s: number) => {
    setTree((t) => ({
      ...t,
      opportunities: t.opportunities.map((o, j) =>
        j === i ? { ...o, solutions: o.solutions.filter((_, k) => k !== s) } : o,
      ),
    }));
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(toMarkdown(tree));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the textarea below still shows the export */
    }
  };

  const hasTree = tree.outcome || tree.opportunities.length > 0;

  const editor = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-semibold text-muted">Desired outcome (one metric you want to move)</span>
        <button
          type="button"
          onClick={() => setHelpConcept("outcome")}
          className="shrink-0 inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
        >
          <HelpCircle size={14} strokeWidth={2} />
          Explain
        </button>
      </div>
      <input
        type="text"
        value={tree.outcome}
        placeholder="e.g. Increase the share of trials that invite a teammate in week 1"
        onChange={(e) => setTree((t) => ({ ...t, outcome: e.target.value }))}
        className={`mt-1 ${inputClass}`}
      />

      <div className="mt-6 flex items-center justify-between gap-2">
        <span className="text-caption font-semibold text-muted">Opportunities &amp; solutions</span>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setHelpConcept("opportunity")}
            className="inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
          >
            <HelpCircle size={14} strokeWidth={2} />
            Opportunity?
          </button>
          <button
            type="button"
            onClick={() => setHelpConcept("solution")}
            className="inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
          >
            <HelpCircle size={14} strokeWidth={2} />
            Solution?
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        {tree.opportunities.map((opp, i) => (
          <div key={opp.id} className="rounded-lg border border-ink-200 bg-surface-base p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-body font-semibold text-strong">
                <span aria-hidden="true">{opp.target ? "🎯" : "🧭"} </span>
                {opp.text}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHelpConcept("target")}
                  aria-label="Explain target opportunity"
                  className="inline-flex items-center text-muted transition-colors hover:text-accent-700"
                >
                  <HelpCircle size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => setTarget(i)}
                  aria-pressed={opp.target}
                  className={`text-caption font-semibold link-underline ${opp.target ? "text-accent-700" : "text-muted"}`}
                >
                  {opp.target ? "Target ✓" : "Make target"}
                </button>
                <button
                  type="button"
                  onClick={() => removeOpportunity(i)}
                  aria-label={`Remove opportunity: ${opp.text}`}
                  className="text-caption font-semibold text-faint link-underline"
                >
                  Remove
                </button>
              </div>
            </div>

            {opp.solutions.length > 0 && (
              <ul className="mt-2 grid gap-1 pl-4">
                {opp.solutions.map((sol, s) => (
                  <li key={sol.id} className="flex items-baseline justify-between gap-3 text-body text-muted">
                    <span>💡 {sol.text}</span>
                    <button
                      type="button"
                      onClick={() => removeSolution(i, s)}
                      aria-label={`Remove solution: ${sol.text}`}
                      className="shrink-0 text-caption text-faint link-underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={solDrafts[i] ?? ""}
                placeholder="Add a solution under this opportunity…"
                onChange={(e) => setSolDrafts((d) => ({ ...d, [i]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addSolution(i)}
                className={inputClass}
              />
              <button type="button" onClick={() => addSolution(i)} className="btn btn-primary shrink-0 !py-2">
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={oppDraft}
          placeholder="Add an opportunity — a need, pain, or desire, in the customer's words…"
          onChange={(e) => setOppDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOpportunity()}
          className={inputClass}
        />
        <button type="button" onClick={addOpportunity} className="btn btn-primary shrink-0 !py-2">
          Add
        </button>
      </div>
    </>
  );

  const directionToggle = (
    <div className="flex gap-2">
      <ChoiceButton label="Top-down" selected={direction === "top-down"} onClick={() => setDirection("top-down")} />
      <ChoiceButton label="Left-right" selected={direction === "left-right"} onClick={() => setDirection("left-right")} />
      <ChoiceButton label="Right-left" selected={direction === "right-left"} onClick={() => setDirection("right-left")} />
    </div>
  );

  const exportBlock = hasTree && (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Export</p>
        <div className="flex gap-4">
          <button type="button" onClick={copyMarkdown} className="text-caption font-semibold text-accent-700 link-underline">
            {copied ? "Copied ✓" : "Copy as Markdown"}
          </button>
          <button type="button" onClick={() => setTree(EMPTY_TREE)} className="text-caption font-semibold text-faint link-underline">
            Clear tree
          </button>
        </div>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-md bg-ink-100 p-3 text-caption text-strong">{toMarkdown(tree)}</pre>
    </div>
  );

  const switcher = activeId && (
    <OstTreeSwitcher
      records={records}
      activeId={activeId}
      onSelect={switchTo}
      onCreate={createAndSwitch}
      onDelete={removeTree}
    />
  );

  const helpModal = <OstHelpModal concept={helpConcept} onClose={() => setHelpConcept(null)} />;

  if (fullscreen) {
    return (
      <>
        {createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col bg-surface-base"
            role="dialog"
            aria-modal="true"
            aria-label="Your opportunity solution tree — full screen"
          >
            <div className="flex items-center justify-between gap-3 border-b border-ink-200 bg-surface-raised px-5 py-4 shadow-sm lg:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                  <Workflow size={20} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="eyebrow mb-0.5">Build yours · Full screen</p>
                  <h3 className="truncate text-h4 text-strong leading-tight">
                    {tree.outcome ? tree.outcome : title}
                  </h3>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {switcher}
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="btn btn-secondary btn-sm shrink-0"
                  aria-label="Exit full screen"
                >
                  <X size={16} strokeWidth={2.5} />
                  <span>Exit full screen</span>
                  <kbd className="rounded border border-current/30 px-1.5 py-0.5 text-[11px] font-normal opacity-70">Esc</kbd>
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:gap-6 lg:p-6">
              <div className="min-h-0 overflow-y-auto lg:w-[380px] lg:shrink-0 lg:pr-2">
                {editor}
                {exportBlock}
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-caption font-semibold text-muted">Tree diagram</p>
                  {directionToggle}
                </div>
                <div className="mt-3 min-h-0 flex-1">
                  <TreeDiagram outcome={tree.outcome} opportunities={tree.opportunities} direction={direction} heightClassName="h-full" />
                </div>
                <p className="mt-2 text-caption text-faint">Drag to pan, scroll to zoom.</p>
              </div>
            </div>
          </div>,
          document.body,
        )}
        {helpModal}
      </>
    );
  }

  return (
    <>
      <ExerciseShell
        kicker={kicker}
        title={title}
        instructions={instructions}
        headerAction={
          <div className="flex shrink-0 items-center gap-2">
            {switcher}
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="btn btn-ghost shrink-0 !py-1.5 !text-caption"
              aria-label="Expand to full screen"
            >
              <Maximize2 size={14} strokeWidth={2} />
              <span>Full screen</span>
            </button>
          </div>
        }
      >
        {editor}

        {hasTree && (
          <div className="mt-6 border-t border-ink-200 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-caption font-semibold text-muted">Tree diagram</p>
              {directionToggle}
            </div>
            <div className="mt-3">
              <TreeDiagram outcome={tree.outcome} opportunities={tree.opportunities} direction={direction} />
            </div>
            <p className="mt-2 text-caption text-faint">Drag to pan, scroll to zoom.</p>
          </div>
        )}

        {exportBlock}

        {showDashboard && activeId && (
          <OstDashboard records={records} activeId={activeId} onOpen={switchTo} onDelete={removeTree} />
        )}
      </ExerciseShell>
      {helpModal}
    </>
  );
}
