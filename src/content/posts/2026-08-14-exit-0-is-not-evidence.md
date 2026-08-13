---
title: "Exit 0 Is Not Evidence: Why AI Coding Agents Need Receipts, Not More Memory"
date: "2026-08-14T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Claude, Codex, Beads, and gbrain each preserve a different kind of truth. One week of silent failures taught me that an agent's report is a claim, memory is a hypothesis, and done requires evidence bound to the exact state that was tested."
last_modified_at: "2026-08-14T10:00:00+05:45"
use_featured_image: false
---

Three operations reported success. None of them did what I thought.

In the first case, a message-sending script returned success, but the instruction was still sitting unsent in an agent's terminal input box. In the second, a file command exited with code zero after an interactive shell alias quietly declined to change the file. In the third, a parallel agent appeared alive in the dashboard but had stopped at an account-capacity prompt before doing any work.

The logs looked healthy. The work had not happened.

These were not hallucinations in the familiar sense. The agents did not invent a library or fabricate an API. The failures were more ordinary and therefore more dangerous: each layer reported something true about itself, and I promoted that report into a stronger claim it could not support.

The script had pasted text into a terminal. The command had exited. The process was alive. None of those facts meant the intended outcome existed.

After a week of moving work between Claude Code, Codex, Beads, and gbrain, I have a sharper rule:

> **An agent's report is a claim. A task tracker records intent. Memory preserves lessons. Only evidence bound to the exact state being discussed can justify “done.”**

The missing layer is not more memory. It is receipts.

## Four systems, four kinds of truth

I had been treating my agent stack as if every tool were contributing to one shared record. It is more accurate to see four ledgers:

| Ledger | Example | What it can establish | What it cannot establish |
| --- | --- | --- | --- |
| Intent | [Beads](/ai/beads-local-first-task-graph/) | What work exists, who claimed it, and what blocks it | That the implementation works |
| Narrative | Claude or Codex session logs | What the agent attempted, observed, and reported | That its interpretation is correct |
| Evidence | Commands, test output, workspace snapshots, deployment checks | What ran, against which state, with what result | That the test or check was sufficient |
| Learning | gbrain or durable agent memory | What should influence a future run | That a remembered fact is still current |

All four are useful. Trouble starts when one impersonates another.

A closed Bead is not a test result. A confident handoff is not a deployment check. A remembered workaround is not proof that the same cause still applies. A green command is not proof that the user-visible outcome exists.

This sounds obvious when written as a table. In a live agent run, the boundaries blur quickly. The agent says it sent the remediation. The terminal helper says `submitted`. The lane still looks active. Ten minutes later, you discover the text never left the input box.

Every component told a locally defensible truth. The system-level conclusion was false.

## “Exit 0” is a transport fact

Shell culture trains us to trust exit codes. Zero means success; non-zero means failure. That contract is essential, but narrower than it looks.

An exit code tells you what the program chose to report. It does not tell you that:

- the program understood your intent;
- the target state changed;
- another process did not change it again;
- the command ran in the environment you thought it did;
- the result remained true after the next agent turn.

The file-command incident made this painfully concrete. Interactive aliases had added confirmation behavior. In a non-interactive run the command read end-of-input, skipped the change, and still returned zero. Trusting the exit code made the next validation meaningless because it ran against the old file.

The repair was not “tell the agent to be more careful.” It was mechanical:

1. use explicitly non-interactive commands;
2. inspect the target after the command;
3. capture the before and after state;
4. treat the exit code as one field in the evidence, not the verdict.

The same pattern applies above the shell. A queue can accept a job that never runs. A deployment command can finish before the service becomes healthy. An HTTP 200 can prove a health endpoint while the feature remains broken. A successful push says nothing about the Pages build that follows it.

Success is always scoped to the layer reporting it.

## What an evidence receipt needs

[OpenAI describes Codex](https://openai.com/index/introducing-codex/) as providing traceable evidence through terminal logs and test output. That is the right direction, but a useful receipt needs to bind the output to the state it describes.

Here is the minimum shape I now want from consequential agent work:

```json title="receipt.json"
{
  "claim": "focused tests passed",
  "revision": "66b14dd0",
  "workspace_before": "sha256:…",
  "workspace_after": "sha256:…",
  "command": "pnpm test -- useNlSearch.test.ts",
  "exit_code": 0,
  "started_at": "2026-08-13T06:41:12Z",
  "finished_at": "2026-08-13T06:41:18Z",
  "output": "receipts/focused-tests.log",
  "output_digest": "sha256:…",
  "limitations": [
    "focused test only",
    "not deployed",
    "no browser acceptance performed"
  ]
}
```

The two workspace fingerprints matter as much as the Git revision. Agents routinely work in dirty worktrees. `HEAD` identifies the committed base, not the uncommitted code the test actually exercised. A receipt that says only “tests passed on commit X” can be wrong even when every field in it is honest.

The limitations field matters too. Evidence should make unsupported inference harder. If a focused test passed, the receipt should not let “the full suite is green” slip into the handoff by grammatical momentum.

Recent research makes the same distinction more formally. [*Looping Is Not Reliability*](https://arxiv.org/abs/2607.24604) separates finding a correct patch from preserving and certifying it, and argues for verifier evidence bound to exact code states. Another recent paper, [*Tool Receipts, Not Zero-Knowledge Proofs*](https://arxiv.org/abs/2603.10060), explores lightweight receipts as a practical way to check whether agent claims are grounded in real tool executions.

The practical point is simpler than either paper: preserve enough context that another person—or another agent—can tell exactly what the result supports.

## Receipts do not prove correctness

This is the important limit.

A receipt can prove that a test ran against a particular workspace and returned zero. It cannot prove that the test covered the bug.

I saw the mirror image of the silent command failures in reviewer agents. A cross-model reviewer produced several plausible findings, including a high-severity one. Reading the implementation showed that some were based on incorrect assumptions about the contract. Applying them would have “fixed” correct code into rejecting valid requests.

So I do not want a system where receipts automatically turn every agent claim into truth. I want a system where claims are classified honestly:

- **PROVEN** — direct evidence supports this exact claim for this exact state;
- **PARTIAL** — some of the claim is supported, with named gaps;
- **UNPROVEN** — the available evidence does not establish it;
- **UNAVAILABLE** — the required environment or authority was not available.

Then I want independent judgment for the part machines cannot settle. Review findings must be checked against the code and contract. A deployment needs a runtime check. A user workflow needs browser acceptance. A production mutation may still require a human approval even if every technical check passes.

Receipts make review possible. They do not eliminate review.

## Memory should inherit from evidence, not outrank it

My gbrain setup runs maintenance cycles that extract and reconnect useful knowledge. This week it gave me another version of the same lesson: several nightly summaries showed many children failing or timing out and zero pages written, even while the current job queue looked healthy.

Both observations were true. Queue health described the present scheduler. The dream summaries described the useful output of earlier cycles. “The system is healthy” was too broad for either one.

This is why I now treat memory as a promoted lesson with a scope, not a timeless fact.

Good memory says:

> In this repository, under this tool version, a read command refreshed a tracked export. Recheck before relying on a clean worktree.

Bad memory says:

> Reads are safe.

Good memory preserves the trigger, evidence, and revalidation rule. It helps the next agent start with a better hypothesis. It does not authorize the agent to skip inspecting the current state.

The direction of trust should be one-way:

```text
current evidence → scoped lesson → future hypothesis → fresh evidence
```

Never reverse it into:

```text
old memory → current fact
```

More retrieval cannot fix that category error. A system can remember the wrong thing instantly and forever.

## “Done” is a ladder, not a boolean

The word *done* hides several independent transitions:

```text
planned
  → implemented
    → locally validated
      → committed
        → pushed
          → deployed
            → human-accepted
```

Each arrow needs different evidence.

- A diff proves implementation exists locally.
- Test output proves a particular validation ran.
- A Git object proves a commit exists.
- The remote ref proves it was pushed.
- A successful workflow, matching deployed revision, and runtime check prove deployment.
- A human completing the real workflow proves acceptance.

Nothing lower on the ladder implies the next step. “Committed” does not mean pushed. “Pushed” does not mean deployed. “HTTP 200” does not mean a person successfully used the feature.

This separation initially feels pedantic. It becomes liberating once agents run for hours without supervision. You no longer have to decide whether to trust a polished completion message. You ask which rung it reached and inspect the receipt for that rung.

## The operating system I want for agents

I do not want one giant platform to replace Claude, Codex, Beads, gbrain, Git, CI, and the browser. Their separation is useful because they answer different questions.

I want a small protocol between them:

1. **Beads records intent.** The task, dependencies, owner, and acceptance criteria live there.
2. **The agent narrates execution.** Claude or Codex explains decisions, surprises, and limitations.
3. **Tools emit state-bound receipts.** Important commands record revision, dirty state, output, and scope.
4. **An independent verifier judges claims.** Unsupported claims become `PARTIAL` or `UNPROVEN`, not confident prose.
5. **gbrain promotes scoped lessons.** It remembers what is reusable and when it must be checked again.
6. **Humans retain authority at consequential boundaries.** Merge, push, deployment, data mutation, and acceptance remain separate gates.

The model can change. The harness can change. The durable asset is the custody chain from intent to evidence to learning.

That is the real lesson from the three operations that reported success without producing the intended outcome. The problem was not that the agents lacked intelligence or context. The system lacked a disciplined answer to one ordinary question:

> **What, exactly, proves that?**

Ask it at every handoff. Store the answer next to the claim. Let memory carry the lesson forward—but make the next run earn the fact again.
