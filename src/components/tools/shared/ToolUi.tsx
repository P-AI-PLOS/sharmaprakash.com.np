import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";

export const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";
export const selectClass = inputClass;
export const cardClass = "rounded-xl border border-ink-200 bg-surface-base p-5 shadow-sm";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-caption font-semibold text-muted">{label}</span>
      {hint && <span className="text-caption text-faint">{hint}</span>}
      {children}
    </label>
  );
}

export function ToolCard({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${cardClass} ${className}`}>
      {title && <h2 className="mb-4 text-h5 text-strong">{title}</h2>}
      {children}
    </section>
  );
}

export function CopyButton({ value, label = "Copy markdown" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button type="button" onClick={copy} className="btn btn-secondary btn-sm">
      {copied ? "Copied" : label}
    </button>
  );
}

export function DownloadButton({ value, filename, label = "Download" }: { value: string; filename: string; label?: string }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([value], { type: "application/octet-stream" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" onClick={download} className="btn btn-ghost btn-sm">
      {label}
    </button>
  );
}

export function usePersistentState<T>(key: string, initial: T): [T, (value: T | ((current: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setState(JSON.parse(saved) as T);
    } catch {
      // Ignore malformed or unavailable browser storage and use defaults.
    }
    setHydrated(true);
  }, [key]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(key, JSON.stringify(state));
  }, [hydrated, key, state]);
  return [state, setState];
}

export const onNumber = (setter: (value: number) => void) => (event: ChangeEvent<HTMLInputElement>) =>
  setter(Number(event.target.value));

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SvgBar({ label, value, max, color = "var(--accent-600)" }: { label: string; value: number; max: number; color?: string }) {
  const width = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="grid gap-1">
      <div className="flex justify-between gap-3 text-caption text-muted"><span className="truncate">{label}</span><span>{value}</span></div>
      <div className="h-2 rounded-full bg-ink-100"><div className="h-2 rounded-full" style={{ width: `${width}%`, background: color }} /></div>
    </div>
  );
}
