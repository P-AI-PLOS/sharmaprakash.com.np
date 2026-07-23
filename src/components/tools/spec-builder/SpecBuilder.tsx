"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Download, Maximize2, X } from "lucide-react";
import { ExerciseShell, ChoiceButton } from "~/components/course/exercises/exercise-ui";
import SpecOstPicker from "./SpecOstPicker";
import SpecFormatPicker from "./SpecFormatPicker";
import SpecSwitcher from "./SpecSwitcher";
import SpecMarkdownExport from "./SpecMarkdownExport";
import { useSpecStore } from "~/utils/spec-store";
import type { SpecRecord, SpecFormat } from "~/utils/spec-store";

const FULLSCREEN_PARAM = "spec";
const FULLSCREEN_VALUE = "full";

interface SpecBuilderProps {
  source?: { type: "standalone" };
  kicker?: string;
  title?: string;
  instructions?: string;
  showDashboard?: boolean;
}

const SpecBuilder = ({
  source = { type: "standalone" },
  kicker = "Free tool",
  title = "Build your spec artifact",
  instructions = "Pick an opportunity from your tree (🎯 target or any), select a solution, choose framing job, select format, then fill the scaffolded sections. Acceptance criteria applied to every format, regardless of format.",
  showDashboard = false,
}: SpecBuilderProps) => {
  const [specs, setSpecs] = useState<SpecRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Load specs from store
  useEffect(() => {
    setSpecs(useSpecStore((state) => state.specs));
  }, []);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useSpecStore.subscribe((state) => {
      setSpecs(state.specs);
      setActiveId(state.activeId);
    });

    return unsubscribe;
  }, []);

  // URL fullscreen toggle (mirrors TreeBuilder)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get(FULLSCREEN_PARAM) === FULLSCREEN_VALUE) {
      setFullscreen(true);
    }
  }, []);

  const activeSpec = specs.find((s) => s.id === activeId) || null;

  const exportAsMarkdown = (spec: SpecRecord): string => {
    const lines = [
      `# ${spec.title}`, 
      "", 
      `**Format:** ${spec.format}`, 
      "", 
      "**Source:**"
    ];

    if (spec.sourcePick) {
      const {
        opportunityText,
        solutionText,
        opportunityIndex,
        solutionIndex,
      } = spec.sourcePick;
      lines.push(
        `- Opportunity ${opportunityIndex + 1}: ${opportunityText}`,
        `- Solution ${solutionIndex + 1}: ${solutionText}`
      );
    } else {
      lines.push("- Manual entry (no tree pick)");
    }

    if (spec.framingJob) {
      lines.push(`- Framing job: ${spec.framingJob}`);
    }

    lines.push("", "---", "");

    // Format-specific sections
    const sectionKeys = useSpecStore.getState().specSectionKeys[spec.format];
    sectionKeys.forEach((key) => {
      const value = spec.sections[key];
      if (value) {
        lines.push(`## ${key}`);
        lines.push(value);
        lines.push("");
      }
    });

    lines.push("## Acceptance criteria");
    lines.push("");

    spec.acceptanceCriteria.forEach((ac) => {
      lines.push(`- ${ac.text}`);
    });

    return lines.join("\n");
  };

  const downloadMarkdown = (spec: SpecRecord) => {
    const markdown = exportAsMarkdown(spec);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.title.replace(/[^a-z0-9]/gi, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (fullscreen) {
    return (
      <div class="fixed inset-0 z-50 bg-surface-base p-6 overflow-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-display-md">Spec Builder (fullscreen)</h2>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete(FULLSCREEN_PARAM);
              window.history.replaceState({}, "", url.toString());
              setFullscreen(false);
            }}
            class="p-2 text-muted hover:text-default"
          >
            <X size={20} />
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1 space-y-6">
            <SpecSwitcher specs={specs} activeId={activeId} onSelect={setActiveId} />
            <SpecOstPicker activeSpec={activeSpec} onPickChange={(pick) => {
              if (activeSpec) {
                useSpecStore.getState().updateSpec(activeSpec.id, { sourcePick: pick });
              }
            }} />
          </div>

          <div class="lg:col-span-2 space-y-6">
            <SpecFormatPicker
              spec={activeSpec}
              onFormatChange={(format: SpecFormat) => {
                if (activeSpec) {
                  useSpecStore.getState().updateSpec(activeSpec.id, { format });
                }
              }}
              onFramingChange={(job: "align" | "handoff" | "sequence" | null) => {
                if (activeSpec) {
                  useSpecStore.getState().updateSpec(activeSpec.id, { framingJob: job });
                }
              }}
            />

            {activeSpec && (
              <div class="bg-surface-raised rounded-lg p-6">
                <h3 class="text-h3 mb-4">Spec Sections</h3>
                {useSpecStore.getState().specSectionKeys[activeSpec.format].map((key) => (
                  <div key={key} class="mb-4">
                    <label class="block text-caption mb-2 text-muted">{key}</label>
                    <textarea
                      value={activeSpec.sections[key] || ""}
                      onChange={(e) => {
                        if (activeSpec) {
                          const newSections = { ...activeSpec.sections, [key]: e.target.value };
                          useSpecStore.getState().updateSpec(activeSpec.id, { sections: newSections });
                        }
                      }}
                      class="w-full p-3 border border-border-strong rounded-md text-body resize-none min-h-[80px]"
                      placeholder={`Enter ${key}...`}
                    />
                  </div>
                ))}

                <div class="mt-6">
                  <h3 class="text-h3 mb-4">Acceptance Criteria</h3>
                  {activeSpec.acceptanceCriteria.map((ac) => (
                    <div key={ac.id} class="flex gap-2 mb-2">
                      <span class="text-muted">•</span>
                      <input
                        type="text"
                        value={ac.text}
                        onChange={(e) => {
                          if (activeSpec) {
                            const newCriteria = activeSpec.acceptanceCriteria.map((c) =>
                              c.id === ac.id ? { ...c, text: e.target.value } : c,
                            );
                            useSpecStore.getState().updateSpec(activeSpec.id, { acceptanceCriteria: newCriteria });
                          }
                        }}
                        class="flex-1 p-2 border border-border-strong rounded-md text-body"
                        placeholder="Enter acceptance criterion..."
                      />
                      <button
                        onClick={() => {
                          if (activeSpec) {
                            const newCriteria = activeSpec.acceptanceCriteria.filter((c) => c.id !== ac.id);
                            useSpecStore.getState().updateSpec(activeSpec.id, { acceptanceCriteria: newCriteria });
                          }
                        }}
                        class="p-2 text-danger hover:bg-danger/10 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      if (activeSpec) {
                        const newId = `ac_${Date.now()}`;
                        const newCriterion = { id: newId, text: "" };
                        const newCriteria = [...activeSpec.acceptanceCriteria, newCriterion];
                        useSpecStore.getState().updateSpec(activeSpec.id, { acceptanceCriteria: newCriteria });
                      }
                    }}
                    class="mt-3 px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-500"
                  >
                    + Add Criterion
                  </button>
                </div>

                <div class="mt-8 pt-6 border-t border-border-default">
                  <button
                    onClick={() => activeSpec && downloadMarkdown(activeSpec)}
                    class="flex items-center gap-2 px-6 py-3 bg-surface-raised border border-border-strong rounded-md hover:bg-surface-sunken"
                  >
                    <Download size={20} />
                    Download Spec as Markdown
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ExerciseShell
      kicker={kicker}
      title={title}
      instructions={instructions}
      helpContent={
        <div class="space-y-4 text-body">
          <p>
            <strong>Purpose:</strong> Turn an opportunity + solution from your tree into a spec artifact.
          </p>
          <p>
            <strong>Pick:</strong> Select an opportunity (🎯 recommended) and one of its solutions from
            your existing trees (or enter manually if none exist).
          </p>
          <p>
            <strong>Framing:</strong> Choose what job this spec serves — align a room, hand off
            scope, or sequence a release. This pre-selects but doesn't lock the format.
          </p>
          <p>
            <strong>Format:</strong> Visible, stored, switchable choice among PRD, Shape-Up pitch, Story-map.
            All formats include acceptance criteria as the common surface downstream.
          </p>
          <p>
            <strong>Sections:</strong> Format-appropriate fields pre-filled from your pick. All data
            persists in your browser; switching formats keeps sections.
          </p>
          <p>
            <strong>Acceptance Criteria:</strong> Applied to every format. Add/remove/edit criteria to
            define what "done" looks like for this spec.
          </p>
          <p>
            <strong>Export:</strong> Download the finished spec as Markdown, with source attribution
            (or "manual entry").
          </p>
        </div>
      }
      onHelpToggle={setShowHelp}
    >
      <div class="space-y-8">
        <SpecSwitcher specs={specs} activeId={activeId} onSelect={setActiveId} />

        <SpecOstPicker activeSpec={activeSpec} onPickChange={(pick) => {
          if (activeSpec) {
            useSpecStore.getState().updateSpec(activeSpec.id, { sourcePick: pick });
          }
        }} />

        {activeSpec && (
          <div class="space-y-6">
            <SpecFormatPicker
              spec={activeSpec}
              onFormatChange={(format: SpecFormat) => {
                if (activeSpec) {
                  useSpecStore.getState().updateSpec(activeSpec.id, { format });
                }
              }}
              onFramingChange={(job: "align" | "handoff" | "sequence" | null) => {
                if (activeSpec) {
                  useSpecStore.getState().updateSpec(activeSpec.id, { framingJob: job });
                }
              }}
            />

            <div class="bg-surface-raised rounded-lg p-6">
              <h3 class="text-h3 mb-4">Spec Sections</h3>
              {useSpecStore.getState().specSectionKeys[activeSpec.format].map((key) => (
                <div key={key} class="mb-4">
                  <label class="block text-caption mb-2 text-muted">{key}</label>
                  <textarea
                    value={activeSpec.sections[key] || ""}
                    onChange={(e) => {
                      if (activeSpec) {
                        const newSections = { ...activeSpec.sections, [key]: e.target.value };
                        useSpecStore.getState().updateSpec(activeSpec.id, { sections: newSections });
                      }
                    }}
                    class="w-full p-3 border border-border-strong rounded-md text-body resize-none min-h-[80px]"
                    placeholder={`Enter ${key}...`}
                  />
                </div>
              ))}

              <div class="mt-6">
                <h3 class="text-h3 mb-4">Acceptance Criteria</h3>
                {activeSpec.acceptanceCriteria.map((ac) => (
                  <div key={ac.id} class="flex gap-2 mb-2">
                    <span class="text-muted">•</span>
                    <input
                      type="text"
                      value={ac.text}
                      onChange={(e) => {
                        if (activeSpec) {
                          const newCriteria = activeSpec.acceptanceCriteria.map((c) =>
                            c.id === ac.id ? { ...c, text: e.target.value } : c,
                          );
                          useSpecStore.getState().updateSpec(activeSpec.id, { acceptanceCriteria: newCriteria });
                        }
                      }}
                      class="flex-1 p-2 border border-border-strong rounded-md text-body"
                      placeholder="Enter acceptance criterion..."
                    />
                    <button
                      onClick={() => {
                        if (activeSpec) {
                          const newCriteria = activeSpec.acceptanceCriteria.filter((c) => c.id !== ac.id);
                          useSpecStore.getState().updateSpec(activeSpec.id, { acceptanceCriteria: newCriteria });
                        }
                      }}
                      class="p-2 text-danger hover:bg-danger/10 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => {
                    if (activeSpec) {
                      const newId = `ac_${Date.now()}`;
                      const newCriterion = { id: newId, text: "" };
                      const newCriteria = [...activeSpec.acceptanceCriteria, newCriterion];
                      useSpecStore.getState().updateSpec(activeSpec.id, { acceptanceCriteria: newCriteria });
                    }
                  }}
                  class="mt-3 px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-500"
                >
                  + Add Criterion
                </button>
              </div>

              <div class="mt-8 pt-6 border-t border-border-default">
                <button
                  onClick={() => activeSpec && downloadMarkdown(activeSpec)}
                  class="flex items-center gap-2 px-6 py-3 bg-surface-raised border border-border-strong rounded-md hover:bg-surface-sunken"
                >
                  <Download size={20} />
                  Download Spec as Markdown
                </button>
              </div>
            </div>
          </div>
        )}

        {!activeSpec && (
          <div class="text-center py-12 bg-surface-raised rounded-lg border border-dashed border-border-strong">
            <p class="text-muted">No spec created yet. Pick from your trees or add manually.</p>
          </div>
        )}
      </div>

      {showHelp && (
        <div class="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div class="bg-surface-base rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-h2">Help: How Spec Builder Works</h3>
              <button onClick={() => setShowHelp(false)} class="p-1 text-muted hover:text-default">
                <X size={20} />
              </button>
            </div>
            <div class="prose prose-sm text-body max-w-none">
              <p>
                <strong>Purpose:</strong> Turn an opportunity + solution from your opportunity solution tree
                into a spec artifact.
              </p>
              <p>
                <strong>Pick:</strong> Select an opportunity (🎯 recommended) and one of its solutions from
                your existing trees (or enter manually if none exist).
              </p>
              <p>
                <strong>Framing:</strong> Choose what job this spec serves — align a room, hand off
                scope, or sequence a release. This pre-selects but doesn't lock the format.
              </p>
              <p>
                <strong>Format:</strong> Visible, stored, switchable choice among PRD, Shape-Up pitch, Story-map.
                All formats include acceptance criteria as the common surface downstream.
              </p>
              <p>
                <strong>Sections:</strong> Format-appropriate fields pre-filled from your pick. All data
                persists in your browser; switching formats keeps sections.
              </p>
              <p>
                <strong>Acceptance Criteria:</strong> Applied to every format. Add/remove/edit criteria to
                define what "done" looks like for this spec.
              </p>
              <p>
                <strong>Export:</strong> Download the finished spec as Markdown, with source attribution
                (or "manual entry").
              </p>
              <p>
                <strong>Drift protection:</strong> If the source tree is deleted or changed after you pick,
                the spec preserves the snapshots and badges you with "source changed/removed".
                You're never blocked from editing.
              </p>
            </div>
          </div>
        </div>
      )}
    </ExerciseShell>
  );
};

export default SpecBuilder;
