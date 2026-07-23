"use client";

import { useEffect, useState } from "react";
import type { SpecRecord, OstPickRef, SpecFormat } from "~/utils/spec-store";

interface SpecOstPickerProps {
  activeSpec?: SpecRecord | null;
  onPickChange?: (pick: OstPickRef | null) => void;
}

export default function SpecOstPicker({ activeSpec, onPickChange }: SpecOstPickerProps) {
  const [trees, setTrees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import("~/utils/ost-store").then((module) => {
      setTrees(module.listTrees());
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="bg-surface-raised rounded-lg p-6">
        <h3 className="text-h3 mb-4">Select from your Opportunity Trees</h3>
        <div className="text-muted">Loading trees...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface-raised rounded-lg p-6">
      <h3 className="text-h3 mb-4">Select from your Opportunity Trees</h3>

      {trees.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted mb-4">No opportunity trees yet.</p>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.pathname = "/tools/opportunity-solution-tree";
              window.history.replaceState({}, "", url);
            }}
            className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-500"
          >
            Create first tree
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trees.map((tree) => (
            <div
              key={tree.id}
              className="p-4 border border-border-strong rounded-md hover:bg-surface-sunken cursor-pointer"
              onClick={() => {
                // Open the tree in a new window or overlay for now
                window.open(`/tools/opportunity-solution-tree#${tree.id}`, "_blank");
              }}
            >
              <h4 className="font-medium text-strong">{tree.title || "Unnamed Tree"}</h4>
              <p className="text-sm text-muted">
                {tree.tree.opportunities.length} opportunities
              </p>
            </div>
          ))}
        </div>
      )}

      {activeSpec?.sourcePick && (
        <div className="mt-6 p-4 bg-accent-50 rounded-md">
          <h4 className="font-medium text-accent-700 mb-2">Current Pick</h4>
          <p className="text-sm text-accent-600">{activeSpec.sourcePick.opportunityText}</p>
          <p className="text-xs text-accent-500">→ {activeSpec.sourcePick.solutionText}</p>
        </div>
      )}
    </div>
  );
}
