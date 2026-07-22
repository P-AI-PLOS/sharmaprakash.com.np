/**
 * Exercise: build your own opportunity solution tree — outcome, opportunities,
 * solutions — pick a target opportunity, and export the tree as Markdown.
 * Persists to localStorage so readers can return across modules.
 */
import { useEffect, useRef, useState } from "react";
import { ExerciseShell } from "./exercise-ui";

interface Opportunity {
  text: string;
  solutions: string[];
  target: boolean;
}

interface Tree {
  outcome: string;
  opportunities: Opportunity[];
}

const STORAGE_KEY = "ost-tree-builder";
const EMPTY: Tree = { outcome: "", opportunities: [] };

const load = (): Tree => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Tree) : EMPTY;
  } catch {
    return EMPTY;
  }
};

const toMarkdown = (tree: Tree): string => {
  const lines = [`# Opportunity solution tree`, ``, `**Outcome:** ${tree.outcome || "(not set)"}`, ``];
  tree.opportunities.forEach((opp) => {
    lines.push(`- ${opp.target ? "🎯 " : ""}${opp.text}`);
    opp.solutions.forEach((sol) => lines.push(`  - 💡 ${sol}`));
  });
  return lines.join("\n");
};

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

export default function TreeBuilder() {
  const [tree, setTree] = useState<Tree>(EMPTY);
  const [oppDraft, setOppDraft] = useState("");
  const [solDrafts, setSolDrafts] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    setTree(load());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
    } catch {
      /* private mode: builder still works, just doesn't persist */
    }
  }, [tree]);

  const addOpportunity = () => {
    const text = oppDraft.trim();
    if (!text) return;
    setTree((t) => ({ ...t, opportunities: [...t.opportunities, { text, solutions: [], target: false }] }));
    setOppDraft("");
  };

  const addSolution = (i: number) => {
    const text = (solDrafts[i] ?? "").trim();
    if (!text) return;
    setTree((t) => ({
      ...t,
      opportunities: t.opportunities.map((o, j) => (j === i ? { ...o, solutions: [...o.solutions, text] } : o)),
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

  return (
    <ExerciseShell
      kicker="Build yours"
      title="Your opportunity solution tree"
      instructions="Fill this in for your own product, not Donut CRM. It saves in your browser, so you can keep growing it as the course goes — outcome first, opportunities as you hear them, solutions only under the opportunity they serve."
    >
      <label className="block">
        <span className="text-caption font-semibold text-muted">Desired outcome (one metric you want to move)</span>
        <input
          type="text"
          value={tree.outcome}
          placeholder="e.g. Increase the share of trials that invite a teammate in week 1"
          onChange={(e) => setTree((t) => ({ ...t, outcome: e.target.value }))}
          className={`mt-1 ${inputClass}`}
        />
      </label>

      <div className="mt-5 grid gap-3">
        {tree.opportunities.map((opp, i) => (
          <div key={i} className="rounded-lg border border-ink-200 bg-surface-base p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-body font-semibold text-strong">
                {opp.target && <span aria-hidden="true">🎯 </span>}
                {opp.text}
              </p>
              <div className="flex shrink-0 gap-2">
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
                  <li key={s} className="flex items-baseline justify-between gap-3 text-body text-muted">
                    <span>💡 {sol}</span>
                    <button
                      type="button"
                      onClick={() => removeSolution(i, s)}
                      aria-label={`Remove solution: ${sol}`}
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

      {(tree.outcome || tree.opportunities.length > 0) && (
        <div className="mt-6 border-t border-ink-200 pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-caption font-semibold text-muted">Export</p>
            <div className="flex gap-4">
              <button type="button" onClick={copyMarkdown} className="text-caption font-semibold text-accent-700 link-underline">
                {copied ? "Copied ✓" : "Copy as Markdown"}
              </button>
              <button
                type="button"
                onClick={() => setTree(EMPTY)}
                className="text-caption font-semibold text-faint link-underline"
              >
                Clear tree
              </button>
            </div>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-md bg-ink-100 p-3 text-caption text-strong">
            {toMarkdown(tree)}
          </pre>
        </div>
      )}
    </ExerciseShell>
  );
}
