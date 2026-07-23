/**
 * Reads OKR Organizer key results for the active product, filtered to the board's
 * quarter (design.md D5). The OKR record shape IS contract-fixed (D8:
 * `{ ...ToolRecordBase, quarter, objective, keyResults: [{ id, who, doesWhat, byHowMuch }], tag }`),
 * so we can read it structurally — but the lane may not have merged, so the raw
 * `pm-okr-v1` read degrades to `[]` when absent or malformed. Links go out as
 * `OkrKeyResultRef`; the label is a `who — doesWhat by byHowMuch` snapshot.
 */
import { quarterKey, type OkrKeyResultRef, type QuarterRef } from "~/utils/pipeline-store";

export interface KrOption {
  ref: OkrKeyResultRef;
  label: string;
}

const OKR_KEY = "pm-okr-v1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const asQuarter = (value: unknown): QuarterRef | null => {
  if (!isRecord(value)) return null;
  const year = Number(value.year);
  const quarter = Number(value.quarter);
  if (!Number.isFinite(year) || quarter < 1 || quarter > 4) return null;
  return { year, quarter: quarter as QuarterRef["quarter"] };
};

const labelFor = (kr: Record<string, unknown>): string => {
  const who = asString(kr.who) ?? "";
  const doesWhat = asString(kr.doesWhat) ?? "";
  const byHowMuch = asString(kr.byHowMuch) ?? "";
  const composed = [who, doesWhat && `— ${doesWhat}`, byHowMuch && `by ${byHowMuch}`]
    .filter(Boolean)
    .join(" ")
    .trim();
  return composed || asString(kr.text) || "Key result";
};

/** Key results for the product's OKRs in `quarter`. `[]` when OKR Organizer is absent. */
export function listKeyResults(productId: string, quarter: QuarterRef): KrOption[] {
  if (typeof localStorage === "undefined") return [];

  let parsed: unknown;
  try {
    const raw = localStorage.getItem(OKR_KEY);
    if (!raw) return [];
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!isRecord(parsed)) return [];

  const options: KrOption[] = [];
  for (const record of Object.values(parsed)) {
    if (!isRecord(record)) continue;
    if (asString(record.productId) !== productId) continue;

    const recordQuarter = asQuarter(record.quarter);
    if (!recordQuarter || quarterKey(recordQuarter) !== quarterKey(quarter)) continue;

    const okrId = asString(record.id);
    if (!okrId) continue;
    if (!Array.isArray(record.keyResults)) continue;

    for (const kr of record.keyResults) {
      if (!isRecord(kr)) continue;
      const keyResultId = asString(kr.id);
      if (!keyResultId) continue;
      options.push({ ref: { okrId, keyResultId }, label: labelFor(kr) });
    }
  }
  return options;
}
