#!/usr/bin/env python3
"""Recompute article means from a saved receipt; no network or host changes."""
import hashlib
import json
from pathlib import Path
import statistics
import sys

rows = [json.loads(line) for line in Path(sys.argv[1] if len(sys.argv) > 1 else 'results.jsonl').read_text().splitlines() if line.strip()]
prompts = next(row['values'] for row in rows if row['event'] == 'prompts')
samples = [row for row in rows if row['event'] == 'sample' and row['case'] != 'first_request']
for row in samples:
    assert row['prompt_sha256'] == hashlib.sha256(prompts[row['case']].encode()).hexdigest()
print('case,native_tokens_per_second,ollama_tokens_per_second')
for case in ('code', 'intel', 'plan_code'):
    values = []
    for runtime in ('native', 'ollama'):
        group = [row for row in samples if row['case'] == case and row['runtime'] == runtime]
        assert len(group) == 2 and {row['repeat'] for row in group} == {0, 1}
        values.append(statistics.mean(row['decode_tps'] for row in group))
    print(f'{case},{values[0]:.2f},{values[1]:.2f}')
