/**
 * Markdown export for one spec — a pure `specToMarkdown` renderer plus the
 * copy/download block, mirroring TreeBuilder's exporter.
 */
import { useState } from "react";
import {
  SPEC_SECTION_KEYS,
  formatLabel,
  resolvePick,
  sectionLabel,
  titleForSpec,
  type SpecRecord,
} from "~/utils/spec-store";

/** The "Source:" line — the OST pick with its drift status, or manual entry. */
const sourceLine = (spec: SpecRecord): string => {
  if (!spec.sourcePick) return "**Source:** manual entry";
  const { status, opportunityText, solutionText } = resolvePick(spec.sourcePick);
  const suffix =
    status === "drifted"
      ? " _(source changed since this spec was written)_"
      : status === "missing"
        ? " _(source removed since this spec was written)_"
        : "";
  return `**Source:** 🎯 ${opportunityText} → 💡 ${solutionText}${suffix}`;
};

export const specToMarkdown = (spec: SpecRecord): string => {
  const lines = [
    `# ${titleForSpec(spec)}`,
    "",
    `**Format:** ${formatLabel(spec.format)}`,
    sourceLine(spec),
    "",
  ];

  for (const key of SPEC_SECTION_KEYS[spec.format]) {
    lines.push(
      `## ${sectionLabel(key)}`,
      "",
      spec.sections[key]?.trim() || "_(not filled in yet)_",
      "",
    );
  }

  lines.push("## Acceptance criteria", "");
  const criteria = spec.acceptanceCriteria.filter((c) => c.text.trim());
  if (criteria.length === 0) lines.push("_(none yet)_");
  else criteria.forEach((c) => lines.push(`- [ ] ${c.text.trim()}`));

  return `${lines.join("\n")}\n`;
};

const fileName = (spec: SpecRecord): string => {
  const slug = titleForSpec(spec)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "spec"}.md`;
};

export default function SpecMarkdownExport({ spec }: { spec: SpecRecord }) {
  const [copied, setCopied] = useState(false);
  const markdown = specToMarkdown(spec);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the preview below still shows the export */
    }
  };

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName(spec);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Export</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={copy}
            className="text-caption font-semibold text-accent-700 link-underline"
          >
            {copied ? "Copied ✓" : "Copy as Markdown"}
          </button>
          <button
            type="button"
            onClick={download}
            className="text-caption font-semibold text-accent-700 link-underline"
          >
            Download .md
          </button>
        </div>
      </div>
      <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-ink-100 p-3 text-caption text-strong">
        {markdown}
      </pre>
    </div>
  );
}
