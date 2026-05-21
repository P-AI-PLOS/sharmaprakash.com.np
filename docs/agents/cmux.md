# Parallel work via cmux

The owner (Prakash) uses cmux. Any task that decomposes into ≥3 roughly
independent units should fan out into parallel cmux sessions instead of running
sequentially in one long chat. Typical fan-out candidates:

- **Multi-section plans** — one session per section of the plan file.
- **Batch blog drafting** — one session per post in a shared brief.
- **Batch design fixes** — one session per file/component getting reworked.
- **Token / convention sweeps** — one session per directory under audit.

## Handoff pattern

1. Write the plan / brief to a single file at the repo root (or `briefs/`).
2. Run `scripts/cmux-fanout.sh <plan-file> "<label-1>" "<label-2>" ...` — one
   label per parallel session. The label is what each spawned Claude is told to
   "work only on".
3. Verify the sessions actually started: `cmux list-workspaces`, then
   `cmux read-screen --workspace workspace:N --scrollback --lines 80` for a new
   workspace. If the terminal only shows the `claude ...` command sitting at the
   prompt, send Enter with `cmux send-key --workspace workspace:N Enter`.
4. End the parent session. Each child session lives in its own cmux workspace
   with its own context window.

The launcher invokes `cmux new-workspace --cwd <repo> --command "claude …"` per
label. See the script header for examples.

Do **not** execute a multi-section plan inline in one session — context bloat
and repeated re-reads waste tokens and degrade output. Fan out by default.

## Same-terminal cmux split

If Prakash asks for a Claude/cmux run "inside this terminal" or "in side of this
terminal", do **not** use `scripts/cmux-fanout.sh`; create a split in the current
cmux workspace and run Claude there.

```sh
cmux current-workspace
cmux new-split right --workspace workspace:N --focus true
cmux send --workspace workspace:N --surface surface:M \
  "cd /Users/prakash/workspaces/2023/personal/sharmaprakash-astro && claude 'Read briefs/<plan>.md. Work only on: <label>. Do not touch other sections. Commit when done.'"
cmux send-key --workspace workspace:N --surface surface:M Enter
cmux read-screen --workspace workspace:N --surface surface:M --scrollback --lines 80
```

Use the returned `surface:M` from `new-split`. This keeps the child Claude visible
next to the current terminal instead of opening a separate cmux workspace.

## Trigger phrases (so Prakash doesn't have to remember the syntax)

If Prakash says any of these, propose the exact `scripts/cmux-fanout.sh` call
and run it (don't make him type it):

- "fan this out", "fanout", "split this into cmux sessions", "parallelize this"
- "spawn cmux sessions for X, Y, Z"
- "draft these blog posts in parallel" / "write these N posts at once"
- "fix designs across A, B, C in parallel"
- "run this plan in parallel"

Standard recipe to propose:

```sh
# Multi-section plan
scripts/cmux-fanout.sh PLAN.md "Section A" "Section B" "Section C"

# Batch blog drafts (one session per slug)
scripts/cmux-fanout.sh briefs/<batch>.md "slug-1" "slug-2" "slug-3"

# Batch design fixes (label is the file path)
scripts/cmux-fanout.sh "design.md §3 cleanup" \
  "src/components/marketing/Hero.astro" \
  "src/components/marketing/CurrentRoleStrip.astro"
```

If the plan file doesn't exist yet, write it first, then fan out. If labels
aren't obvious, infer them from the plan's section headings or the list of
posts/files Prakash mentioned, and confirm them in one line before running.
