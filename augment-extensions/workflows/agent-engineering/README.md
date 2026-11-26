# Agent Engineering

## Overview

Reusable guidance for creating agents and designing the harness, loop, and graph around them. Start with one task and a check that can reject a bad result. Add machinery only for an observed need. This module supplies static rules and local executable fixtures, not an orchestration service.

## Contents

- [Responsibilities and adoption](rules/01-adoption.md)
- [Agent roles, delegation, and ownership](rules/02-agents.md)
- [Contracts, evidence, and trust](rules/03-contracts.md)
- [Bounded loops and recovery](rules/04-loops.md)
- [Graphs and durable state](rules/05-graphs.md)
- [Controlled improvement and evaluation](rules/06-improvement.md)
- [Source review and attribution](sources.md)
- [Machine-readable schemas](schemas/contracts.schema.json)
- [Agent](templates/agent.json), [invocation](templates/invocation.json), [task](templates/task.json), [tool](templates/tool.json), [checker tool](templates/check-tool.json), [node](templates/node.json), [evidence](templates/evidence.json), and [state](templates/state.json) templates
- [Loop controller](examples/loop.cjs), [graph examples](examples/graphs.cjs), [recovery and replay](examples/recovery.cjs), [saved cases](examples/evaluation-cases.json)
- [Executable demo](examples/demo.cjs) and [module validator](scripts/validate.cjs)

## Installation

```bash
augx link workflows/agent-engineering
augx show workflows/agent-engineering rules/01-adoption.md
```

Linking loads static guidance. It does not execute examples or change permissions. Use the CLI from a checkout or installed package that contains this module. Existing installed releases will not discover unpublished source changes.

## Usage

From this module directory, with Node.js and the package's existing Ajv dependency installed:

```bash
node scripts/validate.cjs
node examples/demo.cjs loop repair ./local-repair
node examples/demo.cjs loop exhaust ./local-exhaust
node examples/demo.cjs loop stall ./local-stall
node examples/demo.cjs loop denied ./local-denied
node examples/demo.cjs loop error ./local-error
node examples/demo.cjs loop transient ./local-transient
node examples/demo.cjs loop timeout ./local-timeout
node examples/demo.cjs graph chain ./local-chain
node examples/demo.cjs graph router ./local-router
node examples/demo.cjs graph fan-out ./local-join
node examples/demo.cjs graph cycle ./local-cycle
```

Use a new explicitly chosen disposable directory for each scenario. Repeating a command resumes its compatible checkpoint and preserves accounting. Exit 0 means the selected fixture succeeded, 1 means a terminal non-success, and 2 means invalid input, an ownership conflict, incompatible state, or a filesystem failure requiring local inspection. Ctrl+C requests cancellation and kills a running loop subprocess. No external handoff is sent.

Example loop defaults are five total attempts, twelve subprocess calls, five seconds including downtime, 750 milliseconds per call, two rounds without improved score, and one worker. The `exhaust` CLI scenario narrows attempts to two to expose exhaustion before stall. The independent checker rejects the first `repair` candidate and accepts the repaired candidate. Check records bind the file bytes, contract, protected code, and caller-supplied revision. The revision is a fixture identity; an adapter must supply the actual repository revision and dirty-candidate digest.

The controller owns `state.json`, `receipt.json`, and `handoff.json`; the worker can only return a small candidate for the controller to write to `candidate.json`. Graph examples use `graph-state.json` and `graph-receipt.json`. All joins require every named branch. Fan-out is intentionally executed sequentially, demonstrating the same data contract without native subagents. Branch outputs survive later branch failures for inspection; failed graphs require a reviewed repair plan rather than automatic terminal-state reset.

## Limits and Recovery

These are deterministic fixtures, not provider or production evidence. No provider token, request-price, or monetary cap is claimed: no provider is called. Actual adapters must reserve aggregate requests and tokens, reconcile measured usage including failures, and enforce spend externally where possible. Report unknown cost as unknown.

There is no OS sandbox. Fixed subprocesses receive no inherited credentials, but a same-user hostile process could alter files or race path checks. Trusted graph handlers must honor cancellation; JavaScript cannot forcibly stop an arbitrary synchronous handler. Use isolated processes or containers with enforced filesystem, network, credential, and process restrictions before executing untrusted code. Full external diagnostics must remain in a separately protected, redacted local artifact; the demo's small typed outputs are its complete diagnostics and are capped at 32 KiB.

Atomic checkpoints use a temporary file, fsync, rename, checksum, and an exclusive writer lock. A crash can consume allocation without producing output. Never refund counters automatically. Preserve corrupt checkpoints and incomplete temporary files, inspect the candidate and last durable evidence, then start a new run directory with a reviewed contract. A stale lock is not a lease: inspect its PID, confirm no writer remains, and explicitly remove only that lock after reconciliation. Do not clear locks by age. File fsync and rename are not a promise against every filesystem or power failure.

Graph handlers and runtime contracts are version-bound. The scheduler supports DAGs and bounded single-node repair cycles; multi-node cycles need a different scheduler. Callers must version closed-over handler configuration in the revision. For real external effects, use service-supported idempotency or reconcile the service state after a crash. [localEffect](examples/recovery.cjs) demonstrates duplicate-trigger and crash-window reconciliation for a local artifact only. No exactly-once guarantee is made.

## Character Count

The loader counts UTF-8-decoded JavaScript string lengths across every module file, including this README, schema, examples, and manifest. `node scripts/validate.cjs --update-count` reconciles the self-inclusive manifest count; plain validation is read-only. Export aggregation reads `rules/`, so example state, templates, source references, and saved evaluation cases are not inserted into native rule surfaces. Keep execution directories outside the module when using it from a checkout.
