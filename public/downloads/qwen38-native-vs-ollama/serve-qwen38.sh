#!/usr/bin/env bash
set -euo pipefail

AI_ROOT="/home/prakash/ai"
LLAMA_BIN="$AI_ROOT/bin/llama-b10982"
MODEL="$AI_ROOT/models/Qwen3.8-27B-UD-Q4_K_M.gguf"
MTP_MODEL="$AI_ROOT/models/mtp-Qwen3.8-27B-Q4_0.gguf"

[[ -s "$MODEL" ]] || { echo "Model is missing or empty: $MODEL" >&2; exit 1; }

if "$LLAMA_BIN/llama-cli" --list-devices 2>&1 | grep -q 'Vulkan'; then
    GPU_ARGS=(--gpu-layers all --flash-attn on)
else
    GPU_ARGS=(--gpu-layers 0 --flash-attn off)
fi

SPEC_ARGS=()
if [[ -s "$MTP_MODEL" ]]; then
    SPEC_ARGS=(--spec-draft-model "$MTP_MODEL" --spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-ngl all)
fi

exec "$LLAMA_BIN/llama-server" \
    --model "$MODEL" --alias qwen3.8-27b \
    --host 192.168.10.15 --port 8080 \
    --api-key-file /etc/shuri-llama-api-key \
    --ctx-size "${QWEN_CTX:-32768}" --parallel 1 \
    --threads "${QWEN_THREADS:-8}" --threads-batch "${QWEN_BATCH_THREADS:-16}" \
    --batch-size 2048 --ubatch-size 512 \
    --cache-type-k f16 --cache-type-v f16 \
    --reasoning auto --reasoning-format deepseek --cache-prompt --prio 2 \
    "${GPU_ARGS[@]}" "${SPEC_ARGS[@]}" "$@"
