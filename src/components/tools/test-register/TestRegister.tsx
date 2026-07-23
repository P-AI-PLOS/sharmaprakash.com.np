/**
 * Test Register root island — resolves the active product, loads its scenarios
 * and the sibling source index, and owns the register/coverage tab state.
 *
 * Everything downstream re-derives from two things: the scenario records
 * (`pm-testreg-v1`) and a freshly-read snapshot of the sibling stores. There is
 * no cached staleness anywhere, so a reload always tells the truth about drift.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, ListChecks, Plus, Target } from "lucide-react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import { resolveActiveProduct } from "~/utils/pipeline-store";
import { trackEvent } from "~/utils/analytics";
import ScenarioEditor from "./ScenarioEditor";
import ScenarioList from "./ScenarioList";
import CoveragePanel from "./CoveragePanel";
import RegisterHelpModal from "./RegisterHelpModal";
import {
  buildCoverage,
  buildSourceIndex,
  createScenario,
  deleteScenario,
  listScenariosForProduct,
  markRegenerated,
  markReviewed,
  resolveScenarioLinks,
  saveScenario,
  unlinkSource,
  type LinkTarget,
  type ScenarioDraft,
  type SourceIndex,
  type TestScenarioRecord,
} from "~/utils/test-register-store";

type Tab = "register" | "coverage";

export default function TestRegister() {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [scenarios, setScenarios] = useState<TestScenarioRecord[]>([]);
  const [index, setIndex] = useState<SourceIndex | null>(null);
  const [tab, setTab] = useState<Tab>("register");
  const [editing, setEditing] = useState<TestScenarioRecord | null>(null);
  const [composing, setComposing] = useState(false);
  const [notice, setNotice] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  /** `test_register_stale_seen` fires at most once per page session. */
  const staleReported = useRef(false);

  useEffect(() => {
    const product = resolveActiveProduct();
    setProductId(product.id);
    setProductName(product.name);
    setIndex(buildSourceIndex(product.id));
    setScenarios(listScenariosForProduct(product.id));
  }, []);

  /** Re-reads both the register and the sibling sources — the only refresh path. */
  const refresh = useCallback((id: string) => {
    setIndex(buildSourceIndex(id));
    setScenarios(listScenariosForProduct(id));
  }, []);

  const staleCount = useMemo(() => {
    if (!index) return 0;
    return scenarios.filter((rec) => resolveScenarioLinks(rec, index).stale).length;
  }, [scenarios, index]);

  useEffect(() => {
    if (staleReported.current || staleCount === 0) return;
    staleReported.current = true;
    trackEvent("test_register_stale_seen", { staleCount, scenarioCount: scenarios.length });
  }, [staleCount, scenarios.length]);

  const coverage = useMemo(
    () => (index ? buildCoverage(scenarios, index) : null),
    [scenarios, index],
  );

  if (!index) return null;

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4000);
  };

  const handleSave = (draft: ScenarioDraft) => {
    if (editing) {
      if (!saveScenario(editing.id, draft)) {
        flash("That scenario needs at least one link — nothing was saved.");
        return;
      }
    } else {
      const created = createScenario(productId, draft);
      if (!created) {
        flash("That scenario needs at least one link — nothing was saved.");
        return;
      }
      trackEvent("test_register_scenario_created", {
        storyLinks: draft.stories.length,
        criterionLinks: draft.criteria.length,
        hasSpecPath: draft.specPath !== "",
      });
    }
    setEditing(null);
    setComposing(false);
    refresh(productId);
  };

  const handleRegenerate = (id: string) => {
    if (!markRegenerated(id, index)) return;
    trackEvent("test_register_marked_regenerated");
    refresh(productId);
    flash("Re-baselined to the current wording and dropped back to AI-drafted — review it before you trust it.");
  };

  const handleReview = (id: string) => {
    if (!markReviewed(id, index)) {
      flash("Only a non-stale, AI-drafted scenario can be marked reviewed.");
      return;
    }
    trackEvent("test_register_marked_reviewed");
    refresh(productId);
  };

  const handleUnlink = (id: string, target: LinkTarget) => {
    if (!unlinkSource(id, target)) {
      flash("That's the scenario's only link. Link something else first, or delete the scenario.");
      return;
    }
    refresh(productId);
  };

  const handleDelete = (id: string) => {
    deleteScenario(id);
    if (editing?.id === id) setEditing(null);
    refresh(productId);
  };

  const startEdit = (id: string) => {
    const rec = scenarios.find((r) => r.id === id) ?? null;
    setEditing(rec);
    setComposing(false);
    setTab("register");
  };

  const editorOpen = composing || editing !== null;

  return (
    <>
      <ExerciseShell
        kicker="Free tool"
        title="Keep the tests honest about the spec"
        instructions="Register the scenarios that matter, anchor each to an acceptance criterion or a sliced story, and let the register tell you when the spec has moved out from under a generated test. It saves in your browser — nothing is sent anywhere."
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("register")}
              aria-pressed={tab === "register"}
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-caption font-semibold transition-colors ${
                tab === "register"
                  ? "border-accent-600 bg-accent-50 text-accent-700"
                  : "border-ink-200 bg-surface-base text-muted hover:border-accent-600"
              }`}
            >
              <ListChecks size={13} strokeWidth={2} /> Register ({scenarios.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("coverage")}
              aria-pressed={tab === "coverage"}
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-caption font-semibold transition-colors ${
                tab === "coverage"
                  ? "border-accent-600 bg-accent-50 text-accent-700"
                  : "border-ink-200 bg-surface-base text-muted hover:border-accent-600"
              }`}
            >
              <Target size={13} strokeWidth={2} /> Coverage gaps
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="inline-flex items-center gap-1 text-caption font-semibold text-muted transition-colors hover:text-accent-700"
          >
            <HelpCircle size={14} strokeWidth={2} />
            Statuses and actions
          </button>
        </div>

        <p className="mt-3 text-caption text-faint">
          Product: <span className="text-muted">{productName}</span>
          {staleCount > 0 && (
            <span className="text-accent-800">
              {" "}
              · {staleCount} stale {staleCount === 1 ? "scenario" : "scenarios"}
            </span>
          )}
        </p>

        {notice && (
          <p
            role="status"
            className="mt-3 rounded-md border border-accent-600 bg-accent-50 px-3 py-2 text-caption text-accent-800"
          >
            {notice}
          </p>
        )}

        {tab === "register" ? (
          <>
            {!editorOpen && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setComposing(true);
                }}
                className="btn btn-primary mt-4 !py-2"
              >
                <Plus size={14} strokeWidth={2} className="mr-1 inline" />
                Add a scenario
              </button>
            )}

            {editorOpen && (
              <div className="mt-4">
                <ScenarioEditor
                  key={editing?.id ?? "new"}
                  index={index}
                  editing={editing}
                  onSave={handleSave}
                  onCancel={() => {
                    setEditing(null);
                    setComposing(false);
                  }}
                />
              </div>
            )}

            {scenarios.length === 0 ? (
              <p className="mt-4 rounded-lg border border-ink-200 bg-surface-base p-4 text-caption text-muted">
                Nothing registered yet. Start with the scenarios you'd be nervous to ship without —
                the ones that would cost real money or real trust if they broke — and anchor each to
                the acceptance criterion or story it verifies.
              </p>
            ) : (
              <ScenarioList
                scenarios={scenarios}
                index={index}
                onEdit={startEdit}
                onRegenerate={handleRegenerate}
                onReview={handleReview}
                onUnlink={handleUnlink}
                onDelete={handleDelete}
              />
            )}
          </>
        ) : (
          coverage && <CoveragePanel report={coverage} />
        )}
      </ExerciseShell>
      <RegisterHelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
