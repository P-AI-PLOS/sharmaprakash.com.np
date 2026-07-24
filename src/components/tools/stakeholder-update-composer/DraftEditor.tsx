/**
 * The editable draft: title input, markdown textarea (the single source of
 * truth after compose), a word count, copy-to-clipboard with a manual-selection
 * fallback, and the confirmed "Recompose from sources" action. When the human
 * has edited since the last compose (`updatedAt > composedAt`), an inline
 * warning makes clear that recomposing will overwrite those edits.
 */
import { useRef, useState } from "react";
import { Clipboard, RefreshCw } from "lucide-react";
import { wordCount } from "~/utils/update-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

type CopyState = "idle" | "copied" | "manual";

export default function DraftEditor({
  title,
  body,
  edited,
  onTitle,
  onBody,
  onRecompose,
}: {
  title: string;
  body: string;
  edited: boolean;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onRecompose: () => void;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // Clipboard API unavailable (older Safari, denied permission): select the
      // textarea so the visitor can copy manually — the text is always visible.
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
      setCopyState("manual");
    }
  };

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="update-title" className="text-caption font-semibold text-muted">
          Draft
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRecompose}
            className="inline-flex items-center gap-1 text-caption font-semibold text-muted transition-colors hover:text-accent-700"
          >
            <RefreshCw size={13} strokeWidth={2} />
            Recompose from sources
          </button>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 text-caption font-semibold text-accent-700 link-underline"
          >
            <Clipboard size={13} strokeWidth={2} />
            {copyState === "copied" ? "Copied ✓" : "Copy update"}
          </button>
        </div>
      </div>

      <input
        id="update-title"
        type="text"
        value={title}
        onChange={(event) => onTitle(event.target.value)}
        placeholder="Update title"
        className={`mt-2 ${inputClass} font-semibold`}
      />

      {edited && (
        <p role="status" className="mt-2 text-caption text-strong">
          You've edited this draft since the last compose — recomposing will replace your edits.
        </p>
      )}

      {copyState === "manual" && (
        <p role="status" className="mt-2 text-caption text-strong">
          Couldn't reach the clipboard — the draft is selected, press{" "}
          <kbd className="rounded border border-ink-200 bg-surface-raised px-1">⌘/Ctrl</kbd> +{" "}
          <kbd className="rounded border border-ink-200 bg-surface-raised px-1">C</kbd> to copy.
        </p>
      )}

      <textarea
        ref={textareaRef}
        value={body}
        onChange={(event) => onBody(event.target.value)}
        rows={18}
        aria-label="Stakeholder update draft"
        className={`mt-3 ${inputClass} resize-y font-mono text-caption leading-relaxed`}
      />

      <p className="mt-2 text-caption text-faint">
        {wordCount(body)} {wordCount(body) === 1 ? "word" : "words"} · markdown · copy it out and
        send through whatever channel you use — nothing is transmitted from here.
      </p>
    </div>
  );
}
