/**
 * Source picker — choose a tree, an opportunity (the 🎯 target is recommended,
 * never required) and one of its solutions, and hand back an `OstPickRef`.
 * Reads ost-store only; when the visitor has no trees yet it offers a link to
 * the OST tool plus a manual-entry fallback (`sourcePick` stays null).
 */
import { useEffect, useMemo, useState } from "react";
import { listTrees, titleFor, type OstRecord } from "~/utils/ost-store";
import { pickStatusLabel, resolvePick, type OstPickRef } from "~/utils/spec-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

const OST_HREF = "/tools/opportunity-solution-tree/";

/** The stored pick, rendered from its snapshot with a drift badge (D5). */
function PickSummary({ pick, onChange }: { pick: OstPickRef; onChange: () => void }) {
  const resolved = resolvePick(pick);
  const badge = pickStatusLabel(resolved.status);

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Source</p>
        <div className="flex shrink-0 items-center gap-3">
          {badge && (
            <span className="rounded-full bg-accent-50 px-2 py-0.5 text-caption font-semibold text-accent-700">
              {badge}
            </span>
          )}
          <button
            type="button"
            onClick={onChange}
            className="text-caption font-semibold text-accent-700 link-underline"
          >
            Change source
          </button>
        </div>
      </div>
      <p className="mt-2 text-body text-strong">
        <span aria-hidden="true">🎯 </span>
        {resolved.opportunityText || "(no opportunity text)"}
      </p>
      <p className="text-body text-muted">
        <span aria-hidden="true">💡 </span>
        {resolved.solutionText || "(no solution text)"}
      </p>
      {resolved.status === "drifted" && (
        <p className="mt-2 text-caption text-faint">
          The tree now reads “{resolved.currentOpportunityText}” → “{resolved.currentSolutionText}”.
          Your spec keeps what you picked; re-pick if you want the new wording.
        </p>
      )}
      {resolved.status === "missing" && (
        <p className="mt-2 text-caption text-faint">
          That opportunity or solution is no longer in your trees. The snapshot above is kept.
        </p>
      )}
    </div>
  );
}

export default function SpecOstPicker({
  pick,
  onPick,
  onManualPick,
}: {
  pick: OstPickRef | null;
  onPick: (ref: OstPickRef) => void;
  onManualPick: (opportunityText: string, solutionText: string) => void;
}) {
  const [records, setRecords] = useState<OstRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [treeId, setTreeId] = useState<string>("");
  const [opportunityId, setOpportunityId] = useState<string>("");
  const [picking, setPicking] = useState(false);
  const [manualOpportunity, setManualOpportunity] = useState("");
  const [manualSolution, setManualSolution] = useState("");

  useEffect(() => {
    const trees = listTrees();
    setRecords(trees);
    setHydrated(true);
    const first = trees[0];
    if (first) {
      setTreeId(first.id);
      const target = first.tree.opportunities.find((o) => o.target) ?? first.tree.opportunities[0];
      if (target) setOpportunityId(target.id);
    }
  }, []);

  const tree = useMemo(() => records.find((r) => r.id === treeId), [records, treeId]);
  const opportunities = tree?.tree.opportunities ?? [];
  const opportunity = opportunities.find((o) => o.id === opportunityId);

  const selectTree = (id: string) => {
    setTreeId(id);
    const next = records.find((r) => r.id === id);
    const target = next?.tree.opportunities.find((o) => o.target) ?? next?.tree.opportunities[0];
    setOpportunityId(target?.id ?? "");
  };

  const choose = (solutionId: string, solutionText: string) => {
    if (!tree || !opportunity) return;
    onPick({
      ostRecordId: tree.id,
      opportunityId: opportunity.id,
      solutionId,
      opportunityText: opportunity.text,
      solutionText,
    });
    setPicking(false);
  };

  const submitManual = () => {
    const opp = manualOpportunity.trim();
    const sol = manualSolution.trim();
    if (!opp || !sol) return;
    onManualPick(opp, sol);
    setManualOpportunity("");
    setManualSolution("");
    setPicking(false);
  };

  if (!hydrated) {
    return <p className="text-caption text-faint">Loading your trees…</p>;
  }

  if (pick && !picking) {
    return <PickSummary pick={pick} onChange={() => setPicking(true)} />;
  }

  const manualEntry = (
    <div className="mt-4 border-t border-ink-200 pt-4">
      <p className="text-caption font-semibold text-muted">Or write it down here</p>
      <div className="mt-2 grid gap-2">
        <input
          type="text"
          value={manualOpportunity}
          onChange={(e) => setManualOpportunity(e.target.value)}
          placeholder="The opportunity — a need, pain or desire, in the customer's words…"
          className={inputClass}
          aria-label="Opportunity (manual entry)"
        />
        <input
          type="text"
          value={manualSolution}
          onChange={(e) => setManualSolution(e.target.value)}
          placeholder="The solution you want to spec…"
          className={inputClass}
          aria-label="Solution (manual entry)"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submitManual}
            disabled={!manualOpportunity.trim() || !manualSolution.trim()}
            className="btn btn-primary shrink-0 !py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Use this
          </button>
          {pick && (
            <button
              type="button"
              onClick={() => setPicking(false)}
              className="text-caption font-semibold text-faint link-underline"
            >
              Keep current source
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
        <p className="text-body text-strong">You don’t have an opportunity solution tree yet.</p>
        <p className="mt-1 text-body text-muted">
          A spec is easier to write when it starts from a real customer need.{" "}
          <a href={OST_HREF} className="link-underline text-accent-700">
            Build a tree first →
          </a>
        </p>
        {manualEntry}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption font-semibold text-muted">Pick the opportunity and solution</p>
        <label className="flex items-center gap-2 text-caption text-muted">
          <span>Tree</span>
          <select
            value={treeId}
            onChange={(e) => selectTree(e.target.value)}
            className="rounded-md border border-ink-200 bg-surface-base px-2 py-1 text-caption text-strong focus:border-accent-600 focus:outline-none"
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {titleFor(r)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {opportunities.length === 0 ? (
        <p className="mt-3 text-body text-muted">
          That tree has no opportunities yet.{" "}
          <a href={OST_HREF} className="link-underline text-accent-700">
            Add some →
          </a>
        </p>
      ) : (
        <>
          <ul className="mt-3 grid gap-1">
            {opportunities.map((opp) => (
              <li key={opp.id}>
                <button
                  type="button"
                  onClick={() => setOpportunityId(opp.id)}
                  aria-pressed={opp.id === opportunityId}
                  className={`w-full rounded-md border px-3 py-2 text-left text-body transition-colors ${
                    opp.id === opportunityId
                      ? "border-accent-600 bg-accent-50 text-accent-700"
                      : "border-ink-200 bg-surface-base text-muted hover:border-accent-600 hover:text-accent-700"
                  }`}
                >
                  <span aria-hidden="true">{opp.target ? "🎯 " : "🧭 "}</span>
                  {opp.text}
                  {opp.target && (
                    <span className="ml-2 text-caption font-semibold text-accent-700">
                      recommended
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {opportunity && (
            <div className="mt-3">
              <p className="text-caption font-semibold text-muted">
                Solutions under this opportunity
              </p>
              {opportunity.solutions.length === 0 ? (
                <p className="mt-1 text-body text-muted">
                  No solutions here yet.{" "}
                  <a href={OST_HREF} className="link-underline text-accent-700">
                    Add one in the tree →
                  </a>
                </p>
              ) : (
                <ul className="mt-1 grid gap-1">
                  {opportunity.solutions.map((sol) => (
                    <li key={sol.id}>
                      <button
                        type="button"
                        onClick={() => choose(sol.id, sol.text)}
                        className={`w-full rounded-md border px-3 py-2 text-left text-body transition-colors ${
                          pick?.solutionId === sol.id
                            ? "border-accent-600 bg-accent-50 text-accent-700"
                            : "border-ink-200 bg-surface-base text-muted hover:border-accent-600 hover:text-accent-700"
                        }`}
                      >
                        <span aria-hidden="true">💡 </span>
                        {sol.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {manualEntry}
    </div>
  );
}
