import { diagramTitles, initialState, lastStep, renderDiagram, description } from "../data/ai-diagrams.mjs";

class AiDiagram extends HTMLElement {
  connectedCallback() {
    if (this.abort) return;
    this.kind = this.dataset.diagram;
    if (!diagramTitles[this.kind]) return;
    this.state = initialState(this.kind);
    this.abort = new AbortController();
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const signal = this.abort.signal;
    this.innerHTML = `<div class="ai-visual"></div><div class="ai-options"></div><div class="ai-actions"></div><p class="ai-explanation" aria-live="polite" aria-atomic="true"></p><p class="ai-motion-note"></p>`;
    this.setAttribute("role", "group");
    this.setAttribute("aria-label", diagramTitles[this.kind]);
    this.setAttribute("data-enhanced", "");
    const options = this.querySelector(".ai-options");
    if (this.kind === "memory") {
      options.innerHTML = `<label>Retained tokens per request <output data-tokens></output><input aria-label="Retained tokens per request" name="tokens" type="range" min="32768" max="131072" step="32768" value="32768"></label><label>Independent requests <output data-requests></output><input aria-label="Independent requests" name="requests" type="range" min="1" max="4" step="1" value="1"></label><label>Cache element size<select name="precision"><option value="2">2 bytes (baseline)</option><option value="1">1 byte (hypothetical quantized cache)</option></select></label>`;
    } else if (this.kind === "prefix") {
      options.innerHTML = `<label>Change the next request<select name="mode"><option value="question">Latest question only (E)</option><option value="policy">Earlier policy (B′)</option><option value="instructions">First instructions (A′)</option><option value="evicted">Same prefix, but cache evicted</option></select></label>`;
    } else if (this.kind === "scheduler") {
      options.innerHTML = `<label>Scheduling strategy<select name="mode"><option value="chunked">Interleave decode and prefill</option><option value="whole">Uninterrupted prefill first</option></select></label><label class="ai-checkbox"><input name="warm" type="checkbox">Reuse half of Bob’s prompt (prefix hit)</label>`;
    } else if (this.kind === "split") {
      options.innerHTML = `<label>Model partition<select name="mode"><option value="layer">Layer split</option><option value="tensor">Tensor split</option></select></label>`;
    }
    const interactive = this.kind === "memory" || lastStep(this.kind, this.state) > 0;
    if (interactive) {
      this.querySelector(".ai-actions").innerHTML = `${this.kind !== "memory" ? '<button type="button" data-action="step">Step</button><button type="button" data-action="play">Play</button>' : ""}<button type="button" data-action="reset">Reset</button>`;
    }
    this.addEventListener("click", (event) => {
      const action = event.target.closest("button")?.dataset.action;
      if (action === "step") { this.stop(); this.advance(); }
      if (action === "reset") {
        this.stop();
        if (this.kind === "memory") {
          this.state = initialState(this.kind);
          for (const input of this.querySelectorAll("input, select")) input.value = String(this.state[input.name]);
        } else this.state.step = 0;
        this.draw();
      }
      if (action === "play") this.timer ? this.stop() : this.play();
    }, { signal });
    this.addEventListener("input", (event) => {
      const input = event.target;
      if (!input.name) return;
      this.stop();
      this.state[input.name] = input.name === "mode" ? input.value : input.name === "warm" ? input.checked : Number(input.value);
      this.state.step = 0;
      this.draw();
    }, { signal });
    this.reduced.addEventListener("change", () => { this.stop(); this.draw(); }, { signal });
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.stop(); }, { signal });
    this.observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) this.stop(); });
    this.observer.observe(this);
    this.draw();
  }

  draw() {
    this.querySelector(".ai-visual").innerHTML = renderDiagram(this.kind, this.state);
    this.querySelector(".ai-explanation").textContent = description(this.kind, this.state);
    const step = this.querySelector('[data-action="step"]');
    if (step) step.disabled = this.state.step >= lastStep(this.kind, this.state);
    const play = this.querySelector('[data-action="play"]');
    if (play) {
      play.disabled = this.reduced.matches;
      play.textContent = this.timer ? "Pause" : "Play";
      this.querySelector(".ai-motion-note").textContent = this.reduced.matches
        ? "Reduced motion: use Step to explore at your own pace."
        : "Illustrative sequence. Play advances steps; spacing does not represent measured time.";
    }
    if (this.kind === "memory") {
      this.querySelector("[data-tokens]").textContent = this.state.tokens.toLocaleString("en-US");
      this.querySelector("[data-requests]").textContent = String(this.state.requests);
      this.querySelector(".ai-motion-note").textContent = "Cache precision is hypothetical: verify backend support and answer quality. This is a capacity budget, not a performance prediction.";
    }
    this.dataset.step = String(this.state.step);
  }

  advance() {
    this.state.step = Math.min(this.state.step + 1, lastStep(this.kind, this.state));
    if (this.state.step === lastStep(this.kind, this.state)) this.stop();
    this.draw();
  }

  play() {
    if (this.reduced.matches) return;
    if (this.state.step === lastStep(this.kind, this.state)) this.state.step = 0;
    const token = getComputedStyle(document.documentElement).getPropertyValue("--dur-pageturn").trim();
    const duration = parseFloat(token) * (token.endsWith("ms") ? 1 : 1000);
    this.querySelector(".ai-explanation").setAttribute("aria-live", "off");
    this.timer = setInterval(() => this.advance(), duration * 4);
    this.draw();
  }

  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    this.querySelector(".ai-explanation")?.setAttribute("aria-live", "polite");
    const button = this.querySelector('[data-action="play"]');
    if (button) button.textContent = "Play";
  }

  disconnectedCallback() {
    this.stop();
    this.abort?.abort();
    this.abort = undefined;
    this.observer?.disconnect();
  }
}

if (!customElements.get("ai-diagram")) customElements.define("ai-diagram", AiDiagram);
