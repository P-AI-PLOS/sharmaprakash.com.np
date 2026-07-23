"use client";

import { useState } from "react";
import type { SpecRecord, SpecFormat } from "~/utils/spec-store";

interface SpecFormatPickerProps {
  spec?: SpecRecord | null;
  onFormatChange?: (format: SpecFormat) => void;
  onFramingChange?: (framing: "align" | "handoff" | "sequence" | null) => void;
}

export default function SpecFormatPicker({
  spec,
  onFormatChange,
  onFramingChange,
}: SpecFormatPickerProps) {
  const [framing, setFraming] = useState(spec?.framingJob || null);

  if (!spec) {
    return (
      <div class="bg-surface-raised rounded-lg p-6">
        <h3 class="text-h3 mb-4">Choose Spec Format</h3>
        <div class="text-muted">No spec selected</div>
      </div>
    );
  }

  const handleFramingChange = (newFraming: "align" | "handoff" | "sequence") => {
    setFraming(newFraming);
    onFramingChange?.(newFraming);
  };

  const handleSkipFraming = () => {
    setFraming(null);
    onFramingChange?.(null);
  };

  const formatCards = [
    {
      name: "prd" as const,
      title: "PRD (Product Requirements Document)",
      description: "Hand off unambiguous scope to engineering",
      icon: "📋",
    },
    {
      name: "shape-up-pitch" as const,
      title: "Shape Up Pitch",
      description: "Align a room, define appetite and rabbit holes",
      icon: "🎯",
    },
    {
      name: "story-map" as const,
      title: "Story Map",
      description: "Sequence a release with backbone activities",
      icon: "🗺️",
    },
  ];

  return (
    <div class="bg-surface-raised rounded-lg p-6">
      <h3 class="text-h3 mb-6">Choose Spec Format</h3>

      {/* Framing Question */}
      <div class="mb-6 p-4 bg-surface-sunken rounded-md">
        <h4 class="font-medium mb-3">What's the job here?</h4>
        <div class="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleFramingChange("align")}
            class={`p-3 rounded-md border text-left transition-colors ${framing === "align" ? "border-accent-600 bg-accent-50" : "border-border-strong hover:bg-surface-base"}`}
          >
            <div class="font-medium">Align a room</div>
            <div class="text-xs text-muted">→ Suggests Shape Up pitch</div>
          </button>
          <button
            onClick={() => handleFramingChange("handoff")}
            class={`p-3 rounded-md border text-left transition-colors ${framing === "handoff" ? "border-accent-600 bg-accent-50" : "border-border-strong hover:bg-surface-base"}`}
          >
            <div class="font-medium">Hand off scope</div>
            <div class="text-xs text-muted">→ Suggests PRD</div>
          </button>
          <button
            onClick={() => handleFramingChange("sequence")}
            class={`p-3 rounded-md border text-left transition-colors ${framing === "sequence" ? "border-accent-600 bg-accent-50" : "border-border-strong hover:bg-surface-base"}`}
          >
            <div class="font-medium">Sequence a release</div>
            <div class="text-xs text-muted">→ Suggests Story Map</div>
          </button>
        </div>

        <div class="mt-3 text-center">
          <button
            onClick={handleSkipFraming}
            class="text-xs text-muted hover:text-default underline"
          >
            Skip framing (no suggestion)
          </button>
        </div>
      </div>

      {/* Format Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formatCards.map((card) => (
          <button
            key={card.name}
            onClick={() => onFormatChange?.(card.name)}
            class={`p-5 rounded-lg border-2 transition-all text-left ${spec.format === card.name ? "border-accent-600 bg-accent-50" : "border-border-strong hover:border-accent-300 hover:bg-surface-sunken"}`}
          >
            <div class="text-2xl mb-2">{card.icon}</div>
            <h4 class="font-semibold mb-2">{card.title}</h4>
            <p class="text-sm text-muted">{card.description}</p>
          </button>
        ))}
      </div>

      {spec.sourcePick && (
        <div class="mt-6 p-4 bg-accent-50 rounded-md">
          <h4 class="font-medium text-accent-700 mb-2">Source from Tree</h4>
          <p class="text-sm">
            <span class="text-muted">Opportunity:</span> {spec.sourcePick.opportunityText}
          </p>
          <p class="text-sm">
            <span class="text-muted">Solution:</span> {spec.sourcePick.solutionText}
          </p>
        </div>
      )}
    </div>
  );
}
