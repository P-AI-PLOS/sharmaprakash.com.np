/**
 * PR/FAQ Builder — the island root. Renders press-release fields as
 * labeled inputs, FAQ list with add/remove, export, and optional dashboard.
 * Mirrors TreeBuilder.tsx's prop shape and store wiring.
 */
import { useEffect, useRef, useState } from "react";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import PrFaqSwitcher from "./PrFaqSwitcher";
import PrFaqDashboard from "./PrFaqDashboard";
import PrFaqHelpModal, { type PrFaqConcept } from "./PrFaqHelpModal";
import {
  contextKeyFor,
  createDoc,
  deleteDoc,
  listDocs,
  resolveActivePrFaq,
  saveDocData,
  setActiveId as setActiveIdInStore,
  titleFor,
  toMarkdown,
  newFaqEntry,
  type PrFaqDoc,
  type PrFaqRecord,
  type PrFaqSource,
} from "~/utils/prfaq-store";

interface PrFaqBuilderProps {
  source?: PrFaqSource;
  kicker?: string;
  title?: string;
  instructions?: string;
  showDashboard?: boolean;
}

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

export default function PrFaqBuilder({
  source = { type: "standalone" },
  kicker = "Free tool",
  title = "Your PR/FAQ draft",
  instructions = "Write the press release first, then answer the five questions you hope nobody asks. Draft as many as you need; everything saves in your browser.",
  showDashboard = false,
}: PrFaqBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [doc, setDoc] = useState<PrFaqDoc | null>(null);
  const [records, setRecords] = useState<PrFaqRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [helpConcept, setHelpConcept] = useState<PrFaqConcept | null>(null);
  const [faqDraft, setFaqDraft] = useState("");
  const hydrated = useRef(false);
  const contextKey = contextKeyFor(source);

  useEffect(() => {
    const record = resolveActivePrFaq(source);
    setActiveId(record.id);
    setDoc(record.doc);
    setRecords(listDocs());
    hydrated.current = true;
  }, [contextKey]);

  useEffect(() => {
    if (!hydrated.current || !activeId || !doc) return;
    saveDocData(activeId, doc);
    setRecords(listDocs());
  }, [doc]);

  const switchTo = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    setActiveIdInStore(contextKey, id);
    setActiveId(id);
    setDoc(record.doc);
  };

  const createAndSwitch = () => {
    const record = createDoc(source);
    setActiveIdInStore(contextKey, record.id);
    setActiveId(record.id);
    setDoc(record.doc);
    setRecords(listDocs());
  };

  const removeDoc = (id: string) => {
    deleteDoc(id);
    const remaining = listDocs();
    setRecords(remaining);
    if (id === activeId) {
      const next = remaining[0] ?? createDoc(source);
      setActiveIdInStore(contextKey, next.id);
      setActiveId(next.id);
      setDoc(next.doc);
      if (remaining.length === 0) setRecords(listDocs());
    }
  };

  const updateField = (field: keyof PrFaqDoc, value: string) => {
    if (!doc) return;
    setDoc({ ...doc, [field]: value });
  };

  const addFaq = () => {
    if (!doc || !faqDraft.trim()) return;
    setDoc({ ...doc, faqs: [...doc.faqs, newFaqEntry(faqDraft.trim())] });
    setFaqDraft("");
  };

  const removeFaq = (id: string) => {
    if (!doc) return;
    setDoc({ ...doc, faqs: doc.faqs.filter((f) => f.id !== id) });
  };

  const updateFaq = (id: string, field: "question" | "answer", value: string) => {
    if (!doc) return;
    setDoc({
      ...doc,
      faqs: doc.faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    });
  };

  const copyMarkdown = async () => {
    if (!doc) return;
    try {
      await navigator.clipboard.writeText(toMarkdown(doc));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the textarea below still shows the export */
    }
  };

  if (!doc) return null;

  const hasContent = doc.headline || doc.summary || doc.faqs.some((f) => f.answer);

  const editor = (
    <>
      <div className="space-y-4">
        {/* Press release fields */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-caption font-semibold text-muted">Headline</label>
            <button
              type="button"
              onClick={() => setHelpConcept("headline")}
              className="inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
            >
              <HelpCircle size={14} strokeWidth={2} />
              Help
            </button>
          </div>
          <input
            type="text"
            value={doc.headline}
            onChange={(e) => updateField("headline", e.target.value)}
            placeholder="e.g. Introducing Acme Sync: Never Lose a Meeting Follow-Up Again"
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <label className="text-caption font-semibold text-muted">Subheadline</label>
          <input
            type="text"
            value={doc.subheadline}
            onChange={(e) => updateField("subheadline", e.target.value)}
            placeholder="e.g. A one-page internal announcement"
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <label className="text-caption font-semibold text-muted">Summary (the news)</label>
          <textarea
            value={doc.summary}
            onChange={(e) => updateField("summary", e.target.value)}
            placeholder="One paragraph: what happened, why it matters, who it's for."
            rows={3}
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-caption font-semibold text-muted">Customer problem</label>
            <button
              type="button"
              onClick={() => setHelpConcept("customer-language")}
              className="inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
            >
              <HelpCircle size={14} strokeWidth={2} />
              Customer language?
            </button>
          </div>
          <textarea
            value={doc.problem}
            onChange={(e) => updateField("problem", e.target.value)}
            placeholder="In the customer's own words — what's the problem?"
            rows={2}
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <label className="text-caption font-semibold text-muted">Solution</label>
          <textarea
            value={doc.solution}
            onChange={(e) => updateField("solution", e.target.value)}
            placeholder="How does the product solve the problem?"
            rows={2}
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-caption font-semibold text-muted">Customer quote</label>
            <button
              type="button"
              onClick={() => setHelpConcept("customer-quote")}
              className="inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
            >
              <HelpCircle size={14} strokeWidth={2} />
              Why a quote?
            </button>
          </div>
          <textarea
            value={doc.quote}
            onChange={(e) => updateField("quote", e.target.value)}
            placeholder='e.g. "I used to spend twenty minutes after every call writing up what we decided."'
            rows={2}
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <label className="text-caption font-semibold text-muted">Availability</label>
          <input
            type="text"
            value={doc.availability}
            onChange={(e) => updateField("availability", e.target.value)}
            placeholder="e.g. Available today for all Pro plan users."
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </div>

      {/* FAQ section */}
      <div className="mt-6 border-t border-ink-200 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-caption font-semibold text-muted">FAQ — the questions you hope nobody asks</p>
        </div>

        <div className="mt-3 grid gap-3">
          {doc.faqs.map((faq) => (
            <div key={faq.id} className="rounded-lg border border-ink-200 bg-surface-base p-4">
              <div className="flex items-start justify-between gap-2">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                  className={`flex-1 font-semibold ${inputClass}`}
                  placeholder="Question"
                />
                <button
                  type="button"
                  onClick={() => {
                    const conceptMap: Record<string, PrFaqConcept> = {
                      "What does it cost": "faq-pricing",
                      "Why will people switch": "faq-switching",
                      "Which existing product": "faq-cannibalization",
                      "hardest technical problem": "faq-hardest-problem",
                      "Why us": "faq-why-us",
                    };
                    const concept = Object.entries(conceptMap).find(([k]) =>
                      faq.question.includes(k),
                    )?.[1];
                    if (concept) setHelpConcept(concept);
                  }}
                  aria-label="Explain this FAQ question"
                  className="shrink-0 text-muted transition-colors hover:text-accent-700"
                >
                  <HelpCircle size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => removeFaq(faq.id)}
                  aria-label={`Remove: ${faq.question}`}
                  className="shrink-0 text-faint transition-colors hover:text-accent-700"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                placeholder="Your honest answer..."
                rows={2}
                className={`mt-2 ${inputClass}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={faqDraft}
            onChange={(e) => setFaqDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFaq()}
            placeholder="Add a question..."
            className={inputClass}
          />
          <button type="button" onClick={addFaq} className="btn btn-primary shrink-0 !py-2">
            <Plus size={14} strokeWidth={2} />
            Add
          </button>
        </div>
      </div>
    </>
  );

  const exportBlock = hasContent && (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Export</p>
        <div className="flex gap-4">
          <button type="button" onClick={copyMarkdown} className="text-caption font-semibold text-accent-700 link-underline">
            {copied ? "Copied ✓" : "Copy as Markdown"}
          </button>
        </div>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-md bg-ink-100 p-3 text-caption text-strong">{toMarkdown(doc)}</pre>
    </div>
  );

  const switcher = activeId && (
    <PrFaqSwitcher
      records={records}
      activeId={activeId}
      onSelect={switchTo}
      onCreate={createAndSwitch}
      onDelete={removeDoc}
    />
  );

  const helpModal = <PrFaqHelpModal concept={helpConcept} onClose={() => setHelpConcept(null)} />;

  return (
    <>
      <ExerciseShell
        kicker={kicker}
        title={title}
        instructions={instructions}
        headerAction={<div className="flex shrink-0 items-center gap-2">{switcher}</div>}
      >
        {editor}
        {exportBlock}
        {showDashboard && activeId && (
          <PrFaqDashboard records={records} activeId={activeId} onOpen={switchTo} onDelete={removeDoc} />
        )}
      </ExerciseShell>
      {helpModal}
    </>
  );
}
