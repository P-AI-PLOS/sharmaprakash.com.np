"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SpecRecord, OstPickRef, SpecFormat } from "~/utils/spec-store";

interface SpecOstPickerProps {
  activeSpec?: SpecRecord | null;
  onPickChange?: (pick: OstPickRef | null) => void;
}

export default function SpecOstPicker({ activeSpec, onPickChange }: SpecOstPickerProps) {
  const [trees, setTrees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    import("~/utils/ost-store").then((module) => {
      setTrees(module.listTrees());
      setIsLoading(false);
    });
  }, []);

  const handleTreeSelect = (treeId: string) => {
    navigate(`/tools/opportunity-solution-tree/${treeId}`);
  };

  if (isLoading) {
    return (
      <div class="bg-surface-raised rounded-lg p-6">
        <h3 class="text-h3 mb-4">Select from your Opportunity Trees</h3>
        <div class="text-muted">Loading trees...</div>
      </div>
    );
  }

  return (
    <div class="bg-surface-raised rounded-lg p-6">
      <h3 class="text-h3 mb-4">Select from your Opportunity Trees</h3>

      {trees.length === 0 ? (
        <div class="text-center py-8">
          <p class="text-muted mb-4">No opportunity trees yet.</p>
          <button
            onClick={() => navigate("/tools/opportunity-solution-tree")}
            class="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-500"
          >
            Create first tree
          </button>
        </div>
      ) : (
        <div class="space-y-3">
          {trees.map((tree) => (
            <div
              key={tree.id}
              class="p-4 border border-border-strong rounded-md hover:bg-surface-sunken cursor-pointer"
              onClick={() => handleTreeSelect(tree.id)}
            >
              <h4 class="font-medium text-strong">{tree.title || "Unnamed Tree"}</h4>
              <p class="text-sm text-muted">
                {tree.tree.opportunities.length} opportunities
              </p>
            </div>
          ))}
        </div>
      )}

      {activeSpec?.sourcePick && (
        <div class="mt-6 p-4 bg-accent-50 rounded-md">
          <h4 class="font-medium text-accent-700 mb-2">Current Pick</h4>
          <p class="text-sm text-accent-600">{activeSpec.sourcePick.opportunityText}</p>
          <p class="text-xs text-accent-500">→ {activeSpec.sourcePick.solutionText}</p>
        </div>
      )}
    </div>
  );
}
