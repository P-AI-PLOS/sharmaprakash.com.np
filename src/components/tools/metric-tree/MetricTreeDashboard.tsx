/**
 * "Your trees" management grid — lists every saved metric tree, links back to
 * the post it was built from (if any), and lets you open or delete one.
 * Rendered only where `showDashboard` is set (the standalone tool page).
 * Mirrors OstDashboard.
 */
import { FileText, Globe, Trash2 } from "lucide-react";
import { titleFor, type MetricNode, type MetricTreeRecord } from "~/utils/metric-tree-store";

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const nodeCount = (node: MetricNode): number =>
  1 + node.children.reduce((sum, child) => sum + nodeCount(child), 0);

export default function MetricTreeDashboard({
  records,
  activeId,
  onOpen,
  onDelete,
}: {
  records: MetricTreeRecord[];
  activeId: string;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (records.length === 0) return null;

  return (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <p className="text-caption font-semibold text-muted">Your trees ({records.length})</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r) => (
          <div
            key={r.id}
            className={`rounded-lg border p-4 ${r.id === activeId ? "border-accent-600 bg-accent-50" : "border-ink-200 bg-surface-base"}`}
          >
            <p className="line-clamp-2 text-body font-semibold text-strong">{titleFor(r)}</p>
            <p className="mt-1 flex items-center gap-1 text-caption text-faint">
              {r.source.type === "post" ? <FileText size={12} strokeWidth={2} /> : <Globe size={12} strokeWidth={2} />}
              {r.source.type === "post" ? (
                <>
                  From{" "}
                  <a href={r.source.href} className="link-underline text-accent-700">
                    {r.source.postTitle}
                  </a>
                </>
              ) : (
                "Standalone tool"
              )}
            </p>
            <p className="mt-1 text-caption text-faint">
              {nodeCount(r.tree.root)} metric{nodeCount(r.tree.root) === 1 ? "" : "s"} · Updated {formatDate(r.updatedAt)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onOpen(r.id)}
                disabled={r.id === activeId}
                className="text-caption font-semibold text-accent-700 link-underline disabled:cursor-default disabled:text-faint disabled:no-underline"
              >
                {r.id === activeId ? "Open in builder above" : "Open in builder"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${titleFor(r)}"? This can't be undone.`)) onDelete(r.id);
                }}
                aria-label={`Delete ${titleFor(r)}`}
                className="text-faint transition-colors hover:text-accent-700"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
