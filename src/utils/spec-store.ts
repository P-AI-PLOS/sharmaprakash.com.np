/**
 * Local storage for spec records, persisted via the pipeline store factory
 * (`./pipeline-store.ts`). Spec Builder tools read OST picks (read-only) but
every spec record (specShape, format, sections, acceptance criteria) lives here.
 */

import {
  createToolStore,
  resolveActiveProduct,
  uid,
  type ToolRecordBase,
  type QuarterRef,
  type OstPickRef,
  type ToolStore,
} from "./pipeline-store";
import { type OstRecord } from "./ost-store";

export type SpecFormat = "prd" | "shape-up-pitch" | "story-map";

export interface SpecRecord extends ToolRecordBase {
  title: string;
  sourcePick: OstPickRef | null;
  framingJob: "align" | "handoff" | "sequence" | null;
  format: SpecFormat;
  sections: Record<string, string>;
  acceptanceCriteria: Array<{ id: string; text: string }>;
}

// ---------------------------------------------------------------- section keys (D4)
/** Mapping of format -> section keys in render order. */
export const specSectionKeys: Record<SpecFormat, string[]> = {
  prd: ["problem", "outcome", "nonGoals", "successMetric"],
  "shape-up-pitch": ["problem", "appetite", "solution", "rabbitHoles", "noGos"],
  "story-map": ["backbone", "walkingSkeleton", "laterSlices"],
};

/** All section keys across all formats, for testing/generation logic. */
export const ALL_SPEC_SECTION_KEYS = [
  "problem",
  "outcome",
  "nonGoals",
  "successMetric",
  "appetite",
  "solution",
  "rabbitHoles",
  "noGos",
  "backbone",
  "walkingSkeleton",
  "laterSlices",
];

// ---------------------------------------------------------------- store functions

const STORE_KEY = "pm-spec-v1";
const ACTIVE_KEY = "pm-spec-v1-active";

/**
 * Resolves an OstPickRef against live OST data for the source pick rule D5:
 * snapshot at pick time, badge on drift, never block editing.
 */
export const resolvePick = (pick: OstPickRef): {
  status: "live" | "drifted" | "missing";
  opportunityText: string;
  solutionText: string;
} => {
  const { ostRecordId, opportunityIndex, solutionIndex, opportunityText, solutionText } = pick;

  const { getTree } = require("./ost-store");

  const tree = getTree(ostRecordId);
  if (!tree) return { status: "missing", opportunityText, solutionText };

  const opportunity = tree.tree.opportunities[opportunityIndex];
  const solution = opportunity?.solutions[solutionIndex];

  const currentOpportunityText = opportunity?.text ?? "";
  const currentSolutionText = solution?.text ?? "";

  const opportunityDrifted = currentOpportunityText !== opportunityText;
  const solutionDrifted = currentSolutionText !== solutionText;

  if (!opportunity || !solution) return { status: "missing", opportunityText, solutionText };

  const status: "live" | "drifted" | "missing" = opportunityDrifted || solutionDrifted
    ? "drifted"
    : "live";

  return {
    status,
    opportunityText: currentOpportunityText,
    solutionText: currentSolutionText,
  };
};

/** Gets a display string for an OstPickRef, used in UI labels. */
export const displayPick = (pick: OstPickRef): string => {
  const { opportunityText, solutionText, opportunityIndex, solutionIndex } = pick;

  return `🔗 Opportunity ${opportunityIndex + 1}: ${opportunityText}
  📱 Solution ${solutionIndex + 1}: ${solutionText}`;
};

/** Pre-filled text for each format's required sections from an OstPickRef. */
export const prefilledByPick = (
  pick: OstPickRef,
  format: SpecFormat,
): Record<string, string> => {
  const { opportunityText, solutionText } = pick;

  const base: Record<string, string> = {};

  switch (format) {
    case "prd":
      base.problem = opportunityText;
      base.outcome = solutionText;
      break;
    case "shape-up-pitch":
      base.problem = opportunityText;
      base.solution = solutionText;
      break;
    case "story-map":
      base.backbone = `${solutionText} unlocks ${opportunityText}`;
      break;
    default:
      break; // handled by guard at call site
  }

  return base;
};

const store = createToolStore<SpecRecord>({
  storageKey: STORE_KEY,
  idPrefix: "spec",
});

export const listSpecs = (): SpecRecord[] => store.list();
export const listSpecsForProduct = (productId: string): SpecRecord[] => store.listForProduct(productId);
export const getSpec = (id: string): SpecRecord | undefined => store.get(id);

export const createSpec = (data: Omit<SpecRecord, "id" | "createdAt" | "updatedAt">): SpecRecord => {
  return store.create(data);
};

export const updateSpec = (id: string, patch: Partial<Omit<SpecRecord, "id" | "createdAt">>): void => {
  store.update(id, patch);
};

export const deleteSpec = (id: string): void => {
  store.remove(id);
};

export const getSpecActiveId = (scopeKey: string): string | null => {
  return store.getActiveId(scopeKey);
};

export const setSpecActiveId = (scopeKey: string, id: string): void => {
  store.setActiveId(scopeKey, id);
};

/** Store state management for React components */
interface SpecStoreState {
  specs: SpecRecord[];
  activeId: string | null;
  isLoading: boolean;
}

class SpecStore {
  private state: SpecStoreState = {
    specs: [],
    activeId: null,
    isLoading: false,
  };

  private subscribers: Array<(state: SpecStoreState) => void> = [];

  public subscribe(callback: (state: SpecStoreState) => void): () => void {
    this.subscribers.push(callback);
    callback(this.state);

    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  public getState(): SpecStoreState {
    return { ...this.state };
  }

  public updateSpecs(specs: SpecRecord[]): void {
    this.state.specs = specs;
    this.notify();
  }

  public updateActiveId(id: string | null): void {
    this.state.activeId = id;
    this.notify();
  }

  public updateLoading(loading: boolean): void {
    this.state.isLoading = loading;
    this.notify();
  }

  private notify(): void {
    this.subscribers.forEach((callback) => {
      callback(this.state);
    });
  }

  // Store initialization
  public initialize(): void {
    this.updateSpecs(listSpecs());

    const active = listSpecs().find((s) => s.id === getSpecActiveId("default"))?.id || null;
    this.updateActiveId(active);
  }

  // Convenience methods for store operations
  public createSpec(data: Omit<SpecRecord, "id" | "createdAt" | "updatedAt">): SpecRecord {
    const newSpec = createSpec(data);
    this.updateSpecs([...this.state.specs, newSpec]);
    this.updateActiveId(newSpec.id);
    return newSpec;
  }

  public updateSpec(id: string, patch: Partial<Omit<SpecRecord, "id" | "createdAt">>): void {
    updateSpec(id, patch);
    const updatedSpecs = listSpecs();
    this.updateSpecs(updatedSpecs);
  }

  public deleteSpec(id: string): void {
    deleteSpec(id);
    this.updateSpecs(this.state.specs.filter((s) => s.id !== id));
    if (this.state.activeId === id) {
      this.updateActiveId(null);
    }
  }

  public setActiveId(id: string): void {
    setSpecActiveId(id);
    this.updateActiveId(id);
  }
}

export const specStore = new SpecStore();

/** Export all for tree/shape compatibility with the rest of the pipeline. */
export {
  resolveActiveProduct,
  uid,
  type ToolRecordBase,
  type QuarterRef,
  type OstPickRef,
};
