#!/usr/bin/env python3
"""Run on Shuri via SSH stdin; JSONL stdout is the benchmark receipt."""
import argparse
import hashlib
import json
import pathlib
import socket
import subprocess
import time
import urllib.request

NATIVE = 'http://192.168.10.15:8080'
OLLAMA = 'http://127.0.0.1:11434'
MODEL = 'qwen3.8:27b'
KEY = ''


def emit(kind, **values):
    print(json.dumps({'event': kind, **values}), flush=True)


def systemctl(*args, user=False, check=True):
    cmd = ['systemctl', '--user'] if user else ['sudo', '-n', 'systemctl']
    return subprocess.run(cmd + list(args), check=check, capture_output=True, text=True)


def active(unit, user=False):
    return systemctl('is-active', unit, user=user, check=False).stdout.strip() == 'active'


def request(base, path, payload=None, timeout=900):
    headers = {'Content-Type': 'application/json'}
    if base == NATIVE:
        headers['Authorization'] = 'Bearer ' + KEY
    body = None if payload is None else json.dumps(payload).encode()
    return urllib.request.urlopen(urllib.request.Request(base + path, body, headers), timeout=timeout)


def api(base, path, payload=None):
    with request(base, path, payload) as response:
        return json.load(response)


def healthy(base, path):
    deadline = time.monotonic() + 180
    while time.monotonic() < deadline:
        try:
            api(base, path)
            return
        except (OSError, ValueError):
            time.sleep(2)
    raise RuntimeError('service did not become healthy: ' + base)


def sample(runtime, name, prompt, limit=256, repeat=0):
    if runtime == 'native':
        base, path = NATIVE, '/completion'
        payload = {'prompt': prompt, 'n_predict': limit, 'temperature': 0,
                   'seed': 42, 'stream': True, 'cache_prompt': True}
    else:
        base, path = OLLAMA, '/api/generate'
        payload = {'model': MODEL, 'prompt': prompt, 'raw': True, 'stream': True,
                   'keep_alive': '15m', 'think': False,
                   'options': {'num_ctx': 32768, 'num_predict': limit,
                               'temperature': 0, 'seed': 42, 'num_thread': 8}}
    started = time.monotonic()
    first = None
    output = []
    final = {}
    with request(base, path, payload) as response:
        for line in response:
            line = line.decode().strip()
            if not line or line == 'data: [DONE]':
                continue
            if line.startswith('data: '):
                line = line[6:]
            item = json.loads(line)
            if item.get('error'):
                raise RuntimeError(str(item['error']))
            content = item.get('content', '') if runtime == 'native' else item.get('response', '')
            if content:
                if first is None:
                    first = time.monotonic() - started
                output.append(content)
            final = item
    elapsed = time.monotonic() - started
    if runtime == 'native':
        timing = final.get('timings', {})
        count = timing.get('predicted_n', final.get('tokens_predicted', 0))
        decode = timing.get('predicted_ms', 0) / 1000
        prompt_count = timing.get('prompt_n', final.get('tokens_evaluated', 0))
        prefill = timing.get('prompt_ms', 0) / 1000
    else:
        timing = {k: v for k, v in final.items() if k.endswith(('duration', 'count'))}
        count = final.get('eval_count', 0)
        decode = final.get('eval_duration', 0) / 1e9
        prompt_count = final.get('prompt_eval_count', 0)
        prefill = final.get('prompt_eval_duration', 0) / 1e9
    if not output or not count:
        raise RuntimeError('no measured generated text from ' + runtime)
    emit('sample', runtime=runtime, case=name, repeat=repeat, output_limit=limit,
         prompt_sha256=hashlib.sha256(prompt.encode()).hexdigest(),
         ttft_s=first, elapsed_s=elapsed, output_tokens=count,
         decode_tps=timing.get('predicted_per_second', count / decode if decode else None),
         wall_decode_tps=(count - 1) / (elapsed - first) if first is not None and elapsed > first else None,
         evaluated_prompt_tokens=prompt_count,
         prefill_tps=prompt_count / prefill if prefill else None,
         timing=timing, output=''.join(output))


def main():
    global KEY
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    if not args.apply or socket.gethostname() != 'shuri':
        raise SystemExit('Requires --apply on Shuri')
    KEY = pathlib.Path('/etc/shuri-llama-api-key').read_text().strip()
    before = {'native': active('shuri-qwen38.service'),
              'qwen4b': active('shuri-qwen3-4b.service'),
              'ollama': active('shuri-ollama.service', user=True)}
    emit('preflight', before=before, context=32768, output_limit=256,
         note='Installed quantizations and draft settings differ; not an engine-only comparison.')
    cases = {
        'code': 'Implement a Python function dedupe(items, key) preserving first occurrence order. '
                'Return only code with type hints, a short docstring, and three assertions covering empty input, '
                'duplicate IDs and stable order. Do not explain.',
        'intel': 'Return JSON only with keys summary, facts, uncertainties, next_actions. '
                 'Evidence: Acme reported revenue of 12 million versus 10 million last year. '
                 'Operating expense rose from 7 to 9 million. Cash is 4 million. '
                 'The CEO expects growth next year but supplied no forecast. '
                 'Distinguish reported facts from predictions and calculate revenue growth.',
        'plan_code': '\n'.join(f'Context note {i}: requests must validate input, preserve order, '
                               'avoid shared mutable state, and handle missing keys explicitly.' for i in range(40))
                     + '\nImplement this approved plan in Python: accept records with id and value; '
                       'reject missing id; merge duplicates keeping the last value but first-seen id order; '
                       'return a new list without changing inputs. Return only the function and three assertions.'
    }
    try:
        systemctl('stop', 'shuri-qwen38.service', 'shuri-qwen3-4b.service')
        systemctl('stop', 'shuri-ollama.service', user=True)
        systemctl('reset-failed', 'shuri-qwen38.service')
        start = time.monotonic()
        systemctl('start', 'shuri-qwen38.service')
        healthy(NATIVE, '/health')
        emit('startup', runtime='native', ready_s=time.monotonic() - start)
        prompts = {}
        for name, text in cases.items():
            rendered = api(NATIVE, '/apply-template', {
                'messages': [{'role': 'user', 'content': text}],
                'chat_template_kwargs': {'enable_thinking': False},
            })['prompt']
            if rendered.rstrip().endswith('<think>'):
                rendered = rendered.rstrip() + '\n\n</think>\n\n'
            prompts[name] = rendered
        emit('prompts', values=prompts)
        warmup = api(NATIVE, '/apply-template', {
            'messages': [{'role': 'user', 'content': 'List the integers from one through twenty, separated by commas.'}],
            'chat_template_kwargs': {'enable_thinking': False},
        })['prompt']
        if warmup.rstrip().endswith('<think>'):
            warmup = warmup.rstrip() + '\n\n</think>\n\n'
        sample('native', 'first_request', warmup, limit=32)
        for name, prompt in prompts.items():
            for repeat in range(2):
                sample('native', name, prompt, repeat=repeat)
        systemctl('stop', 'shuri-qwen38.service')
        start = time.monotonic()
        systemctl('start', 'shuri-ollama.service', user=True)
        healthy(OLLAMA, '/api/version')
        emit('startup', runtime='ollama_daemon', ready_s=time.monotonic() - start)
        sample('ollama', 'first_request', warmup, limit=32)
        emit('placement', runtime='ollama', value=api(OLLAMA, '/api/ps'))
        for name, prompt in prompts.items():
            for repeat in range(2):
                sample('ollama', name, prompt, repeat=repeat)
        api(OLLAMA, '/api/generate', {'model': MODEL, 'keep_alive': 0})
    finally:
        # Stop benchmark GPU loads before restoring the original active services.
        systemctl('stop', 'shuri-qwen38.service', check=False)
        systemctl('stop', 'shuri-ollama.service', user=True, check=False)
        if before['ollama']:
            systemctl('start', 'shuri-ollama.service', user=True)
        if before['native']:
            systemctl('start', 'shuri-qwen38.service')
        if before['qwen4b']:
            systemctl('start', 'shuri-qwen3-4b.service')
        emit('restored', native=active('shuri-qwen38.service'),
             qwen4b=active('shuri-qwen3-4b.service'),
             ollama=active('shuri-ollama.service', user=True))


if __name__ == '__main__':
    main()
