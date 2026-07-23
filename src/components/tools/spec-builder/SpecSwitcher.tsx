"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Check, X } from "lucide-react";
import type { SpecRecord } from "~/utils/spec-store";

interface SpecSwitcherProps {
  specs: SpecRecord[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}

export default function SpecSwitcher({ specs, activeId, onSelect }: SpecSwitcherProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSpecTitle, setNewSpecTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSpecs = specs.filter((spec) =>
    spec.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSpec = () => {
    if (!newSpecTitle.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const newSpec: SpecRecord = {
      id: tempId,
      title: newSpecTitle,
      sourcePick: null,
      framingJob: null,
      format: "prd",
      sections: { problem: "", outcome: "", nonGoals: "", successMetric: "" },
      acceptanceCriteria: [],
      productId: "sample-product",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSelect?.(tempId);
    setNewSpecTitle("");
    setIsCreateModalOpen(false);
  };

  return (
    <div class="bg-surface-raised rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-h3">Your Specs</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          class="p-2 bg-accent-600 text-white rounded-md hover:bg-accent-500 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Search */}
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={16} />
        <input
          type="text"
          placeholder="Search specs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          class="w-full pl-10 pr-4 py-2 border border-border-strong rounded-md text-sm"
        />
      </div>

      {/* Spec List */}
      {filteredSpecs.length === 0 ? (
        <div class="text-center py-8">
          <p class="text-muted mb-2">No specs found</p>
          <p class="text-sm text-muted">
            {searchTerm ? "Try a different search term" : "Create your first spec"}
          </p>
        </div>
      ) : (
        <div class="space-y-2">
          {filteredSpecs.map((spec) => (
            <div
              key={spec.id}
              class={`p-3 rounded-md border cursor-pointer transition-colors ${activeId === spec.id ? "border-accent-600 bg-accent-50" : "border-border-strong hover:bg-surface-sunken"}`}
              onClick={() => onSelect?.(spec.id)}
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-strong">{spec.title}</h4>
                  <div class="flex items-center gap-3 text-xs text-muted mt-1">
                    <span>{spec.format}</span>
                    {spec.sourcePick && <span>🔗 from tree</span>}
                    <span>{spec.acceptanceCriteria.length} criteria</span>
                  </div>
                </div>
                <div class="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit functionality would go here
                    }}
                    class="p-1 text-muted hover:text-default rounded"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Delete functionality would go here
                    }}
                    class="p-1 text-danger hover:bg-danger/10 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="bg-surface-base rounded-lg p-6 max-w-md w-full">
            <h3 class="text-h3 mb-4">Create New Spec</h3>
            <input
              type="text"
              placeholder="Spec title..."
              value={newSpecTitle}
              onChange={(e) => setNewSpecTitle(e.target.value)}
              class="w-full p-3 border border-border-strong rounded-md mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateSpec()}
            />
            <div class="flex gap-3 justify-end">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                class="px-4 py-2 text-muted hover:text-default"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSpec}
                disabled={!newSpecTitle.trim()}
                class="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-500 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
