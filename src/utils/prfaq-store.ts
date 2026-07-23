import { createToolStore, resolveActiveProduct, uid, type ToolRecordBase } from "./pipeline-store";

export interface PrFaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface PrFaqDoc {
  headline: string;
  subheadline: string;
  summary: string;
  problem: string;
  solution: string;
  quote: string;
  availability: string;
  faqs: PrFaqEntry[];
}

export type PrFaqSource =
  | { type: "standalone" }
  | { type: "post"; postSlug: string };

export interface PrFaqRecord extends ToolRecordBase {
  doc: PrFaqDoc;
  source: PrFaqSource;
}

export const EMPTY_DOC: PrFaqDoc = {
  headline: "",
  subheadline: "",
  summary: "",
  problem: "",
  solution: "",
  quote: "",
  availability: "",
  faqs: [
    { id: uid("faq"), question: "What does it cost and what will customers pay?", answer: "" },
    { id: uid("faq"), question: "Why will people switch from what they do today?", answer: "" },
    { id: uid("faq"), question: "Which existing product does this cannibalize?", answer: "" },
    { id: uid("faq"), question: "What's the hardest technical problem, and what if it doesn't yield?", answer: "" },
    { id: uid("faq"), question: "Why us?", answer: "" },
  ],
};

export const newFaqEntry = (question: string, answer = ""): PrFaqEntry => ({
  id: uid("faq"),
  question,
  answer,
});

export const contextKeyFor = (source: PrFaqSource): string =>
  source.type === "post" ? `post:${source.postSlug}` : "standalone";

const store = createToolStore<PrFaqRecord>({
  storageKey: "pm-prfaq-v1",
  idPrefix: "prfaq",
});

export const listDocs = (): PrFaqRecord[] => store.list();

export const getDoc = (id: string): PrFaqRecord | undefined => store.get(id);

export const createDoc = (source: PrFaqSource): PrFaqRecord =>
  store.create({
    productId: resolveActiveProduct().id,
    doc: { ...EMPTY_DOC },
    source,
  });

export const saveDocData = (id: string, doc: PrFaqDoc): void => store.update(id, { doc });

export const deleteDoc = (id: string): void => store.remove(id);

export const getActiveId = (contextKey: string): string | null => store.getActiveId(contextKey);

export const setActiveId = (contextKey: string, id: string): void => store.setActiveId(contextKey, id);

export const resolveActivePrFaq = (source: PrFaqSource): PrFaqRecord => {
  const ck = contextKeyFor(source);
  const activeId = getActiveId(ck);
  const existing = activeId ? getDoc(activeId) : undefined;
  if (existing) return existing;
  const created = createDoc(source);
  setActiveId(ck, created.id);
  return created;
};

export const titleFor = (record: PrFaqRecord): string =>
  record.doc.headline.trim() || "Untitled press release";

export const toMarkdown = (doc: PrFaqDoc): string => {
  const lines = [
    `# ${doc.headline || "(headline not set)"}`,
    ...(doc.subheadline ? [``, `_${doc.subheadline}_`] : []),
    ``,
    doc.summary || "(summary not set)",
    ``,
    `**The problem:** ${doc.problem || "(not set)"}`,
    ``,
    `**The solution:** ${doc.solution || "(not set)"}`,
    ``,
    doc.quote ? `> "${doc.quote}"` : `> (customer quote not set)`,
    ``,
    `**Availability:** ${doc.availability || "(not set)"}`,
    ``,
    `## FAQ`,
    ``,
  ];
  doc.faqs.forEach((f) => {
    lines.push(`**Q: ${f.question || "(question not set)"}**`);
    lines.push(`A: ${f.answer || "(answer not set)"}`);
    lines.push(``);
  });
  return lines.join("\n");
};
