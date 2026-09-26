# Qwen3.8 native versus Ollama: reproduction snapshot

This snapshot accompanies “I Tuned My Local AI Server. Then I Tried Ollama.”
Measured on Shuri on 2026-09-26. It records the installed configurations, not
an engine-only experiment: quantized weights and draft settings differ.

## Files

- `benchmark_shuri_qwen38.py`: exact runner for the final corrected pass.
- `results.jsonl`: final raw prompts, hashes, timing fields, outputs and restoration state.
- `initial-unmatched-cache-results.jsonl`: diagnostic pass with unmatched cache behavior;
  excluded from the article's tables. The snapshot runner represents the corrected pass.
- `serve-qwen38.sh`, `shuri-qwen38.service`, `shuri-ollama.service`: source configuration snapshots.
  The native unit's firewall dependency is estate-specific and is not included as an installer.
- `environment.json`: runtime versions, model identities and later readback of weight hashes.
- `response-checks.json`: basic saved output-check results; not a comprehensive quality evaluation.
- `summarize.py`: recompute generation-rate means and verify the recorded prompt hashes.
- `SHA256SUMS`: integrity hashes for the other snapshot files.

## Inspect without running models

From this directory, using Python's standard library:

```sh
python3 summarize.py results.jsonl
```

On Linux use `sha256sum -c SHA256SUMS`; on macOS use `shasum -a 256 -c SHA256SUMS`.

## Original benchmark invocation

From the homelab checkout, the approved command was:

```sh
ssh -o BatchMode=yes prakash@192.168.10.15 'python3 - --apply' \
  < scripts/benchmark_shuri_qwen38.py \
  > docs/benchmarks/shuri-qwen38-native-vs-ollama.jsonl
```

With this downloaded snapshot, the equivalent command is:

```sh
ssh -o BatchMode=yes prakash@192.168.10.15 'python3 - --apply' \
  < benchmark_shuri_qwen38.py > rerun-results.jsonl
```

This is a host-specific operations script, not a portable installer. It checks
hostname `shuri`, reads `/etc/shuri-llama-api-key` on the host, requires
noninteractive sudo for system units, and expects the three named services,
model files and endpoints already installed. No credential value is included.
Adapt and review hostnames, paths, units and authentication for another machine.
Do not remove the guard and run blindly.

The command interrupts Qwen3-4B and both benchmark runtimes. Obtain the operator's
approval and preserve the current configuration before rerunning it. The script
records which units were active and attempts restoration in `finally`; verify
unit state and an authenticated endpoint response afterward. Abrupt process or
host failure can prevent cleanup. Restart only services that were active before
the test. Leave weights and service definitions available for rollback.

The runner executes native first, then Ollama, with no simultaneous benchmark
GPU workloads. There is a separate 32-token first request, then fresh and cached
requests for each of three cases, capped at 256 output tokens. The shared rendered
prompt is obtained from native `/apply-template`; both runtimes receive the same
bytes. Native enables `cache_prompt`; Ollama uses automatic reuse. `keep_alive`
changes from the service default of zero to 15 minutes for measured Ollama requests.
The runtime tag can change upstream: verify its digest in `environment.json`.
The snapshot does not redistribute weights or establish the right to redistribute them.

## Boundaries of reproducibility

Model SHA-256 values were read after the run, not captured in the original receipt.
Original weight download URLs, complete GPU-driver/OS package versions and native
compiler options are not preserved here. The manifest does not make this a fully
hermetic build. It gives future runs a concrete baseline and makes those gaps explicit.
The fixed seed does not guarantee identical output across runtimes or versions.
Only two samples per workload were collected. Long-plan outputs hit the token cap;
syntax validity of partial code does not demonstrate a completed implementation.

Server-reported `decode_tps` is averaged for the article. `wall_decode_tps` also
records `(output_tokens - 1) / (elapsed_s - ttft_s)` for comparable client timing.
Do not compare cached `prefill_tps` as if all input tokens were recomputed.
