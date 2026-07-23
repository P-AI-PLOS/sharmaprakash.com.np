"use client";

import { Download, FileText } from "lucide-react";
import type { SpecRecord } from "~/utils/spec-store";

interface SpecMarkdownExportProps {
  spec?: SpecRecord;
  onDownload?: (content: string) => void;
}

export default function SpecMarkdownExport({ spec, onDownload }: SpecMarkdownExportProps) {
  const exportAsMarkdown = (specRecord: SpecRecord): string => {
    const lines = [ `# ${specRecord.title}`, "", `**Format:** ${specRecord.format}`, "", "**Source:**" ];

    if (specRecord.sourcePick) {
      lines.push(
        `- Opportunity ${specRecord.sourcePick.opportunityIndex + 1}: ${specRecord.sourcePick.opportunityText}`,
        `- Solution ${specRecord.sourcePick.solutionIndex + 1}: ${specRecord.sourcePick.solutionText}`
      );
    } else {
      lines.push("- Manual entry (no tree pick)");
    }

    if (specRecord.framingJob) {
      lines.push(`- Framing job: ${specRecord.framingJob}`);
    }

    lines.push("", "---", "");

    const formatSectionKeys = [
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

    formatSectionKeys.forEach((key) => {
      const value = specRecord.sections[key];
      if (value) {
        lines.push(`## ${key}`);
        lines.push(value);
        lines.push("");
      }
    });

    lines.push("## Acceptance criteria");
    lines.push("");

    specRecord.acceptanceCriteria.forEach((ac) => {
      lines.push(`- ${ac.text}`);
    });

    return lines.join("\n");
  };

  if (!spec) {
    return null;
  }

  const handleDownload = () => {
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

    onDownload?.(markdown);
  };

  return (
    <div class="bg-surface-raised rounded-lg p-6">
      <h3 class="text-h3 mb-4">Export to Markdown</h3>

      <div class="space-y-4">
        <div class="p-4 bg-surface-sunken rounded-md">
          <h4 class="font-medium mb-2">Preview</h4>
          <div class="text-sm text-muted space-y-1">
            <div>Title: {spec.title}</div>
            <div>Format: {spec.format}</div>
            <div>Source: {spec.sourcePick ? "Opportunity solution tree" : "Manual entry"}</div>
            <div>Sections: {Object.keys(spec.sections).filter((k) => spec.sections[k]).length} populated</div>
            <div>Acceptance Criteria: {spec.acceptanceCriteria.length}</div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-raised border border-border-strong rounded-md hover:bg-surface-sunken transition-colors"
        >
          <Download size={20} />
          Download as Markdown
        </button>

        <div class="text-xs text-muted">
          Exported spec includes all sections for the chosen format, plus acceptance criteria,
          source attribution, and framing job if set.
        </div>
      </div>
    </div>
  );
}
