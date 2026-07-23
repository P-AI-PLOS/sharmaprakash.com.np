/**
 * Self-check list for "What you should have now" recaps. Replaces raw GFM
 * task-list markdown (`- [ ]`) with real checkboxes that persist per reader
 * in localStorage, keyed by `id` — so a chapter revisit keeps ticked items.
 */
import { useEffect, useState, type ReactNode } from "react";

const load = (key: string, count: number): boolean[] => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return Array(count).fill(false);
    return Array.from({ length: count }, (_, i) => Boolean(parsed[i]));
  } catch {
    return Array(count).fill(false);
  }
};

export default function Checklist({ id, items }: { id: string; items: ReactNode[] }) {
  const storageKey = `checklist:${id}`;
  const [checked, setChecked] = useState<boolean[]>(() => Array(items.length).fill(false));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChecked(load(storageKey, items.length));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      /* private mode — checklist still works, just doesn't persist */
    }
  }, [checked, hydrated, storageKey]);

  const toggle = (i: number) => setChecked((c) => c.map((v, j) => (j === i ? !v : v)));
  const doneCount = checked.filter(Boolean).length;

  return (
    <div className="not-prose my-6 rounded-xl border border-ink-200 bg-surface-raised p-5 lg:p-6">
      <ul className="grid gap-3">
        {items.map((item, i) => {
          const itemId = `${storageKey}-${i}`;
          const isChecked = checked[i];
          return (
            <li key={i} className="flex items-start gap-3">
              <input
                type="checkbox"
                id={itemId}
                checked={isChecked}
                onChange={() => toggle(i)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-ink-300 text-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:ring-offset-1"
              />
              <label
                htmlFor={itemId}
                className={`cursor-pointer text-body transition-colors ${
                  isChecked ? "text-faint line-through" : "text-strong"
                }`}
              >
                {item}
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-200 pt-3">
        <p className="text-caption text-muted">
          {doneCount} of {items.length} done
        </p>
        {doneCount > 0 && (
          <button
            type="button"
            onClick={() => setChecked(Array(items.length).fill(false))}
            className="text-caption font-semibold text-faint link-underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
