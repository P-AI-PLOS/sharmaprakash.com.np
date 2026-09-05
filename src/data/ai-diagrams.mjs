// Shared by the browser enhancement and the static SVG renderer. All scenarios
// are illustrative; these steps and dimensions are not measured performance.
export const diagramTitles = {
  inference: "From prompt to first token",
  memory: "Where the memory goes",
  topology: "Follow the transfer path",
  split: "Layer splitting or tensor splitting?",
  requests: "A stable beginning, different questions",
  prefix: "Change a block. What can still be reused?",
  scheduler: "Make room for an ongoing answer",
  placements: "Three different ways to share the work",
};

export const initialState = (kind) => ({
  step: 0, mode: kind === "prefix" ? "question" : kind === "scheduler" ? "chunked" : "layer",
  tokens: 32768, requests: 1, precision: 2, warm: false,
});

export function memoryBudget({ tokens, requests, precision }) {
  const kv = tokens * 80 * 8 * 128 * precision * 2 * requests / 2 ** 30;
  return { kv, total: 56 + kv, available: 112, remaining: 56 - kv };
}

export function prefixBlocks(mode) {
  const matching = mode === "question" ? 3 : mode === "policy" ? 1 : 0;
  const labels = mode === "instructions" ? ["A′", "B", "C", "E"]
    : mode === "policy" ? ["A", "B′", "C", "E"] : ["A", "B", "C", "E"];
  return labels.map((label, i) => ({ label, hit: i < matching }));
}

export function schedule(state) {
  const bob = state.warm ? 4 : 8;
  return state.mode === "chunked"
    ? [...Array.from({ length: bob }, () => ["A", "B"]).flat(), ...Array(8 - bob).fill("A")]
    : [...Array(bob).fill("B"), ...Array(8).fill("A")];
}

export const lastStep = (kind, state) => kind === "inference" ? 5
  : kind === "prefix" ? 4 : kind === "split" ? 4
  : kind === "scheduler" ? schedule(state).length : 0;

export function description(kind, state) {
  const step = state.step;
  if (kind === "inference") return [
    "The prompt is ready. The weights are already resident; no answer tokens have been produced.",
    "Prefill processes the prompt and constructs attention state. The reader is still waiting for the first token.",
    "The first answer token appears. Time to first token ends here; the answer is not finished.",
    "Decode adds another token and its KV state. The model reuses earlier keys and values.",
    "Decode continues. A faster decode rate would shorten this stage, without removing the initial prefill wait.",
    "The answer is complete. Output tokens have also enlarged the retained context. Step spacing is illustrative, not elapsed time.",
  ][step];
  if (kind === "memory") {
    const b = memoryBudget(state);
    return `Illustrative calculation: ${state.requests} independent request${state.requests > 1 ? "s" : ""} × ${state.tokens.toLocaleString("en-US")} retained tokens needs ${b.kv.toFixed(1)} GiB of raw KV state. Total budget including 40 GiB weights, 8 GiB workspace and 8 GiB reserved headroom: ${b.total.toFixed(1)} / 112 GiB. ${b.remaining >= 0 ? `${b.remaining.toFixed(1)} GiB remains.` : `Exceeds the allowance by ${(-b.remaining).toFixed(1)} GiB.`} No prefix sharing, padding or quantization scales are included.`;
  }
  if (kind === "prefix") {
    if (!step) return "The upper row is retained state for A → B → C → D. Choose what changes, then inspect each new block. Letters illustrate dependencies, not real cache-block sizes.";
    const block = prefixBlocks(state.mode)[step - 1];
    return `Block ${block.label}: ${block.hit ? "reuse retained state: both this block and its preceding context match." : state.mode === "evicted" ? "process again: the retained state was evicted, even where the text matches." : "process again: this block or its preceding context changed. Identical later text cannot automatically reuse its old state."}${step === 4 ? " The new question still needs a new answer." : ""}`;
  }
  if (kind === "scheduler") {
    const steps = schedule(state), done = steps.slice(0, step);
    return `Illustrative schedule: Alice has received ${done.filter(x => x === "A").length} decode steps; Bob has processed ${done.filter(x => x === "B").length} of ${steps.filter(x => x === "B").length} uncached prefill slices. ${state.mode === "chunked" ? "Interleaving lets Alice progress before Bob finishes reading." : "The uninterrupted prefill delays Alice's next output."} Equal boxes do not imply equal durations; real engines can batch both kinds of work in one execution step.`;
  }
  if (kind === "split") return (state.mode === "layer" ? [
    "Layer split: GPU A holds earlier layers; GPU B holds later layers. Follow a single request through the stages.",
    "GPU A executes its earlier layers. GPU B depends on the resulting activations.",
    "Activations cross from GPU A through the switch to GPU B. We are not moving all the model weights.",
    "GPU B executes the later layers. A single sequence follows the layer dependency.",
    "The step completes. Suitable pipelines can overlap different requests, but that is not shown here.",
  ] : [
    "Tensor split: each GPU holds shards of a layer's operation. Both compute local results.",
    "GPU A and GPU B compute their shards. This exposes parallel arithmetic within the layer.",
    "The shards exchange or reduce results through the supported communication path.",
    "The synchronized result enables the next operation. Exact collectives depend on the engine and model.",
    "Communication can recur within successive layers. Highlighted paths show dependencies, not measured speed or traffic volume.",
  ])[step];
  return {
    topology: "A supported peer transfer can remain below the switch. A host-staged fallback uses the upstream link and host memory. The drawing is conceptual, not a verified enclosure specification.",
    requests: "All requests share instructions, tools and a repository snapshot. Different questions branch after that beginning. Reuse still requires retained compatible state and eligible routing.",
    placements: "Replicas serve separate requests; a split model requires communication during inference; remote KV transfer moves compatible state. Separate memory pools do not become one unified device.",
  }[kind];
}

const escape = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const text = (x, y, label, size = 20, anchor = "start") => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}">${escape(label)}</text>`;
const box = (x, y, w, label, active = false, sub = "") => `<g class="${active ? "active" : "idle"}"><rect x="${x}" y="${y}" width="${w}" height="${sub ? 76 : 54}" rx="10"/>${text(x + w / 2, y + 33, label, label.length > 30 ? 17 : 20, "middle")}${sub ? text(x + w / 2, y + 60, sub, 17, "middle") : ""}</g>`;
const line = (d, active = false, dashed = false) => `<path class="wire ${active ? "lit" : ""}" d="${d}"${dashed ? ' stroke-dasharray="7 6"' : ""}/>`;

export function renderDiagram(kind, state = initialState(kind)) {
  let drawing = "", height = 410;
  if (kind === "inference") {
    const count = Math.max(0, state.step - 1);
    drawing = line("M240 82V120 M240 196V238")
      + box(60, 20, 360, "Repository prompt", state.step === 0)
      + box(60, 120, 360, "Prefill", state.step === 1, "Read input · construct KV state")
      + box(60, 238, 360, "Decode", state.step >= 2, "First token → continued answer")
      + text(24, 350, "Answer:")
      + ["Edit", "requires", "permission", "."].map((t, i) => box(24 + i * 114, 365, 106, i < count ? t : "…", i < count)).join("")
      + text(24, 453, state.step === 0 ? "KV: no prompt state yet" : state.step === 1 ? "KV: prompt state is being prepared" : `KV: prompt + ${count} output token${count === 1 ? "" : "s"}`, 19);
    height = 480;
  } else if (kind === "prefix") {
    drawing = text(24, 32, state.mode === "evicted" ? "Previous state: evicted" : "Previous state: retained")
      + ["A", "B", "C", "D"].map((t, i) => box(24 + i * 114, 52, 106, t)).join("")
      + text(24, 152, "New request: inspect from the start")
      + prefixBlocks(state.mode).map((b, i) => box(24 + i * 114, 178, 106, b.label, i < state.step, i < state.step ? b.hit ? "HIT" : "NEW" : "waiting")).join("")
      + text(24, 302, "A  instructions + tools", 19)
      + text(24, 335, "B  policy    C  invoice code", 19)
      + text(24, 368, "D / E  different questions", 19);
  } else if (kind === "scheduler") {
    const steps = schedule(state);
    drawing = text(24, 30, "A = Alice: next output token", 19)
      + text(24, 60, "B = Bob: uncached prompt slice", 19)
      + text(24, 104, "Execution order → (not elapsed time)", 19)
      + steps.map((t, i) => box(24 + i % 4 * 114, 128 + Math.floor(i / 4) * 82, 106, t, i < state.step, i < state.step ? "done" : "waiting")).join("");
    height = 150 + Math.ceil(steps.length / 4) * 82;
  } else if (kind === "memory") {
    const budget = memoryBudget(state);
    const rows = [["Weights", 40], ["Workspace", 8], ["Headroom", 8], ["KV state", budget.kv]];
    const scale = 432 / Math.max(112, budget.total);
    drawing = text(24, 32, "Assumed usable allowance: 112 GiB", 20);
    let x = 24;
    drawing += rows.map(([label, value], i) => {
      const bar = `<rect class="budget-${i}" x="${x}" y="55" width="${value * scale}" height="54"/>`;
      x += value * scale;return bar;
    }).join("");
    drawing += line(`M${24 + 112 * scale} 45V122`, true, true)
      + rows.map(([label, value], i) => `<rect class="budget-${i}" x="24" y="${146 + i * 44}" width="20" height="20"/>${text(58, 163 + i * 44, `${label}: ${Number(value).toFixed(1)} GiB`)}`).join("")
      + text(24, 358, budget.remaining >= 0 ? `Remaining: ${budget.remaining.toFixed(1)} GiB` : `OVER BUDGET: ${(-budget.remaining).toFixed(1)} GiB`, 22);
  } else if (kind === "split") {
    const tensor = state.mode === "tensor";
    drawing = box(24, 28, 200, "GPU A", state.step === 1 || tensor && state.step === 3, tensor ? "layer shard A" : "earlier layers")
      + box(256, 28, 200, "GPU B", tensor && state.step === 1 || state.step === 3, tensor ? "layer shard B" : "later layers")
      + line("M124 104V228H356V104", state.step === 2)
      + box(145, 202, 190, "PCIe switch", state.step === 2)
      + text(240, 327, tensor ? "A ↔ B  exchange / reduce" : "A → B  activations", 23, "middle")
      + text(240, 370, "Path highlights are not bandwidth measurements.", 17, "middle");
  } else if (kind === "topology") {
    drawing = box(40, 22, 400, "CPU + shared memory / integrated GPU")
      + line("M240 76V196", true, true)
      + text(255, 135, "upstream", 18)
      + box(150, 196, 180, "PCIe switch", true)
      + line("M240 250V300H124V340 M240 300H356V340", true)
      + box(24, 340, 200, "GPU A + VRAM") + box(256, 340, 200, "GPU B + VRAM")
      + text(240, 435, "Peer: A ↔ switch ↔ B", 21, "middle")
      + text(240, 474, "Fallback: A ↔ host memory ↔ B", 21, "middle");height = 505;
  } else if (kind === "requests") {
    drawing = box(24, 24, 432, "Stable prefix", true, "instructions · tools · repository")
      + line("M240 100V152H92V192 M240 152V300 M240 152H388V192")
      + box(24, 192, 136, "Question A") + box(320, 192, 136, "Question C")
      + box(172, 300, 136, "Question B")
      + text(240, 394, "New questions branch after shared context.", 19, "middle");height = 425;
  } else if (kind === "placements") {
    drawing = text(24, 32, "REPLICAS · route separate requests", 20)
      + box(24, 55, 205, "Model on A") + box(251, 55, 205, "Model on B")
      + text(24, 160, "SPLIT MODEL · communicate to answer", 20)
      + box(24, 183, 205, "Layers on A") + box(251, 183, 205, "Layers on B")
      + text(240, 220, "↔", 24, "middle")
      + text(24, 288, "KV TRANSFER · reuse compatible state", 20)
      + box(24, 311, 205, "Cache source") + box(251, 311, 205, "Model worker")
      + text(240, 348, "→", 24, "middle");
  }
  const title = diagramTitles[kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 ${height}" role="img" aria-label="${escape(title)}"><title>${escape(title)}</title><desc>${escape(description(kind, state))}</desc><style>
    text{fill:var(--text-strong);font-family:Arial,sans-serif}rect{fill:var(--surface-raised);stroke:var(--border-strong);stroke-width:2}.active rect{fill:var(--accent-100);stroke:var(--accent-700);stroke-width:3}.wire{fill:none;stroke:var(--ink-400);stroke-width:3}.wire.lit{stroke:var(--accent-700);stroke-width:5}.budget-0{fill:var(--ink-800)}.budget-1{fill:var(--ink-400)}.budget-2{fill:var(--ink-200)}.budget-3{fill:var(--accent-500)}
  </style>${drawing}</svg>`;
}
