/**
 * Cadence & Reflection Kit — island root. Resolves the active product and its
 * current-quarter cadence record, owns all state, and renders the kit in the
 * order the tool teaches: name the job → pick a cadence mode → (only then)
 * track metrics, log retros, and check off demos.
 *
 * The mode gate is the point: with `mode: null` nothing but the ModePicker
 * renders (spec "mode must be chosen before any tracking UI"). Past quarters are
 * browsable read-only history; only the current quarter is editable (D1).
 *
 * Persists via cadence-store; nothing leaves the browser.
 */
import { useEffect, useState } from "react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import { useReveal } from "~/components/tools/vertical-slicer/useReveal";
import { currentQuarter, quarterKey, resolveActiveProduct } from "~/utils/pipeline-store";
import {
  addDemo,
  addPeriod,
  addRetro,
  listKeyResultOptions,
  listQuartersForProduct,
  removeDemo,
  removePeriod,
  resolveQuarterRecord,
  setMode,
  setRetroActionStatus,
  updateDemo,
  updatePeriod,
  type CadenceMode,
  type CadenceRecord,
  type KeyResultOption,
} from "~/utils/cadence-store";
import ModePicker from "./ModePicker";
import MetricsPanel from "./MetricsPanel";
import RetroLog from "./RetroLog";
import DemoChecklist from "./DemoChecklist";
import QuarterSwitcher from "./QuarterSwitcher";

export default function CadenceKit() {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [record, setRecord] = useState<CadenceRecord | null>(null);
  const [history, setHistory] = useState<CadenceRecord[]>([]);
  const [viewingId, setViewingId] = useState("");
  const [krOptions, setKrOptions] = useState<KeyResultOption[]>([]);
  const { containerRef, revealProps } = useReveal<HTMLDivElement>(record?.mode);

  useEffect(() => {
    const product = resolveActiveProduct();
    const quarter = currentQuarter();
    const current = resolveQuarterRecord(product.id, quarter);
    setProductId(product.id);
    setProductName(product.name);
    setRecord(current);
    setViewingId(current.id);
    setHistory(listQuartersForProduct(product.id));
    setKrOptions(listKeyResultOptions(product.id, quarter));
  }, []);

  if (!record) return null;

  /** Adopt a mutator's freshly persisted record and refresh the history list. */
  const apply = (updated: CadenceRecord | undefined) => {
    if (!updated) return;
    setRecord(updated);
    setHistory(listQuartersForProduct(productId));
  };

  const viewing = viewingId === record.id ? record : history.find((r) => r.id === viewingId) ?? record;
  const readOnly = viewing.id !== record.id;

  return (
    <ExerciseShell
      kicker="Free tool"
      title="Run your delivery cadence"
      instructions="Name the job, pick the rhythm that fits, and keep a light reflection loop. A handful of hand-entered numbers per period — enough to see the trend, not a system of record. It saves in your browser; nothing is sent anywhere."
      headerAction={
        history.length > 1 ? (
          <QuarterSwitcher
            records={history}
            currentId={record.id}
            viewingId={viewing.id}
            onSelect={setViewingId}
          />
        ) : undefined
      }
    >
      <p className="text-caption text-muted">
        Product: <span className="font-semibold text-strong">{productName}</span> ·{" "}
        <span className="font-semibold text-strong">{quarterKey(viewing.quarter)}</span>
        {readOnly && <span className="ml-1 text-faint">(past quarter — read-only)</span>}
      </p>

      <div ref={containerRef} className="mt-5 space-y-8">
        {viewing.mode === null ? (
          readOnly ? (
            <p className="text-caption text-muted">No cadence mode was chosen for this quarter.</p>
          ) : (
            <ModePicker onChoose={(mode: CadenceMode) => apply(setMode(record.id, mode))} />
          )
        ) : (
          <>
            <div {...revealProps("metrics", 0)}>
              <MetricsPanel
                mode={viewing.mode}
                record={viewing}
                readOnly={readOnly}
                onChangeMode={(mode) => apply(setMode(record.id, mode))}
                onAddPeriod={(label) => apply(addPeriod(record.id, label))}
                onUpdatePeriod={(periodId, patch) => apply(updatePeriod(record.id, periodId, patch))}
                onRemovePeriod={(periodId) => apply(removePeriod(record.id, periodId))}
              />
            </div>

            <div {...revealProps("retro", 1)}>
              <RetroLog
                record={viewing}
                readOnly={readOnly}
                onAdd={(data) => apply(addRetro(record.id, data))}
                onSetStatus={(retroId, status) =>
                  apply(setRetroActionStatus(record.id, retroId, status))
                }
              />
            </div>

            <div {...revealProps("demo", 2)}>
              <DemoChecklist
                productId={productId}
                record={viewing}
                readOnly={readOnly}
                krOptions={krOptions}
                onAdd={(data) => apply(addDemo(record.id, data))}
                onUpdate={(demoId, patch) => apply(updateDemo(record.id, demoId, patch))}
                onRemove={(demoId) => apply(removeDemo(record.id, demoId))}
              />
            </div>
          </>
        )}
      </div>
    </ExerciseShell>
  );
}
