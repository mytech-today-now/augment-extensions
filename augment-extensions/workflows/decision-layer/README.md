# Decision Layer Workflow

## Overview

An optional Augx runtime for TypeSafe judgments, code-owned policy, and durable local worker execution. Codex and Claude Code can also reach it through a native chat tool under saved automatic-use policy. Existing generative models retain planning, writing, coding, and argument generation. Jev returns judgments. Application code grants permissions, enforces limits, executes registered handlers, and verifies completion.

## Installation

Run these commands from a consuming project using an Augx package containing this module:

```bash
augx link workflows/decision-layer
augx decision setup --dry-run --host codex
augx decision setup --host codex
augx decision doctor
```

Setup automatically installs the pinned official JavaScript SDK and official TypeSafe skill. The default skill host is Codex (`.agents/skills/typesafe-ai`); `--host claude-code` uses `.claude/skills/typesafe-ai`. The official documentation supports copying the complete skill directory manually. Setup performs that verified method with commit-pinned downloads and SHA-256 checks, including the license. It does not invoke a plugin marketplace or skills.sh as well.

Software lives in `.augx-decision/software`. Existing compatible Node 22+ with npm is reused. Otherwise setup downloads official Node 22.23.5, verifies its pinned archive checksum, extracts a separate runtime including npm, and invokes that executable explicitly. `--portable` forces this path. Supported distribution targets are Windows x64/arm64, macOS x64/arm64, and glibc Linux x64/arm64 with `/usr/bin/tar`. Other targets fail with a clear diagnostic. Actual platform verification is recorded in the implementation report. No administrator privilege, global upgrade, Python, database, or container is required.

Augx retains its declared Node 16 compatibility. Discovery, help, linking, exporting and mirroring neither load nor install the SDK. When the main CLI runs on Node 16, explicit decision execution launches the installed separate runtime. A source checkout needs `npm install` and `npm run build`; use `node cli/dist/cli.js` in place of `augx` to validate source changes. Installed packages contain compiled CLI code and module assets and need no TypeScript compiler for module setup.

The dry run detects platform, architecture, Node, npm, existing skill host directories and configuration scope without creating directories or downloading anything. Setup uses npm ci with an integrity-locked dependency, disables lifecycle scripts and audit, uses the explicit official registry, and excludes provider credentials from installer subprocesses. It writes a partial-install journal before installing and a hashed ownership receipt only after SDK loading and config validation. A failed or interrupted install can be retried. Existing edited software and skill files cause a preservation error. Existing valid config is retained. Offline setup works when compatible installed software and the skill are already present; missing downloads fail explicitly while offline. There is no offline bundle of the SDK or Node.

Doctor reports software installation, configuration validity, credential availability, connectivity verification, and live activation independently. Setup and offline validation need no credentials. Live calls use only `TYPESAFE_API_KEY` from the environment. Configure it using your shell or secret manager, never chat or a committed file. Inspect `.augx-decision/config.json`, enable `allowProviderData` for approved de-identified public/internal inputs, then explicitly request live operation:

```bash
augx decision decide --input decision.json --live --requests 1 --id first-live-probe
```

A successful live probe is connectivity evidence for that request only. Doctor never silently calls the provider and continues reporting connectivity as NOT VERIFIED. Explicit administrative live operations retain their per-invocation budget. Saved automatic-use policy is a separate opt-in described below. There is no fallback from live calls to fixtures.

## Configure automatic chat judgments once

After reviewing data access and setting the existing environment credential locally, run:

```bash
augx decision setup --host codex --automatic --requests 6 --dry-run
augx decision setup --host codex --automatic --requests 6
augx decision doctor
```

Choose `--host claude-code` for Claude Code. The terminal GUI also provides **Configure automatic chat judgments once** and **Disable automatic chat judgments**. Automatic setup explicitly saves consent for selected de-identified public context, enables `allowProviderData`, installs the separate `augx-judgments` skill and registers the `augx_decision` MCP server with only `judge` pre-approved. It leaves the official TypeSafe skill unchanged. Existing automatic policy refinements are retained. Setup makes no provider calls and stores no keys. Internal data requires an explicit approved edit adding `internal` to `automatic.dataClasses`.

Restart the host in this project. Codex must trust the project to load `.codex/config.toml`; Claude Code must approve the project `.mcp.json` server once. Host and organization deny/ask rules remain authoritative. Setup does not change global host settings, trust an untrusted repository, or override a higher-priority policy. A shell or desktop host must inherit `TYPESAFE_API_KEY` from its launch environment. Project paths are absolute in the registration; rerun setup after moving the project or changing the package location.

During an ordinary task such as classifying an ambiguous report among categories, or ranking already accessible retrieved evidence, the host can implicitly select the skill and call the native MCP tool. The user need not mention Jev, run a terminal command, or approve each call already covered by saved host permission and runtime policy. The typed result returns to the same agent task flow as advice. Implicit model selection is host-controlled, not guaranteed on every eligible turn. No turn interceptor or message watcher is installed.

| Host | Native registration | Evidence and boundary |
|---|---|---|
| Codex | Project `.codex/config.toml`, `.agents/skills/augx-judgments/SKILL.md` | Installed Codex CLI accepted generated registration in an isolated trusted profile. Manual ordinary-chat selection remains NOT VERIFIED. |
| Claude Code | Project `.mcp.json`, `.claude/skills/augx-judgments/SKILL.md`, exact tool allow entry in `.claude/settings.local.json` | Installed Claude Code connected to the stdio server in an isolated approved profile. Manual ordinary-chat selection remains NOT VERIFIED. |
| Augment, Cursor, Windsurf, Copilot, hosted/cloud sessions | Existing static guidance only | No automatic runtime integration is claimed for these surfaces. |

The tool accepts only classification and retrieval ranking with two to eight described candidates, a short original goal, current revision and relevant evidence. Context fields are allowlisted strings. It reads no project files, full conversation or hidden reasoning. Greetings, exact lookups, arithmetic, obvious deterministic choices and self-evaluation of this tool are excluded by the skill. Unsupported, incomplete, disabled, unauthorized, oversized and secret-bearing inputs fail before requesting the provider. The runtime enforces saved capability and data-class lists. Existing host access controls determine which material the agent may supply; secret scanning is additional defense and cannot prove de-identification.

`automatic.requests` is a cumulative project ceiling, also capped by `limits.requests`, across conversations, processes, restarts, setup repetition and host changes. It has no automatic daily or per-turn reset. Increase the saved ceiling deliberately through setup to allocate more requests within the configured limit. The ledger retains only input digests, request count and reserved/answered/failed status. It stores no submitted context or provider results. A changed revision alone never causes another request for identical state. Changed evidence or candidates can be reconsidered if budget remains. One writer per project prevents concurrent overspending; busy requests return a fallback without queueing. A crash after reservation consumes that request and suppresses duplicate state.

Requests use the existing pinned SDK adapter, fixed endpoint/model, zero retries and the smaller of `automatic.timeoutMs` and `limits.requestMs`. Complete typed answers are validated before returning. Missing credentials/software, provider failures, malformed answers, cancellation, timeout, exhausted budget and unavailable writers return an explicit fallback with no answer. Continue existing deterministic work or review and report material failures. The MCP transport supports cancellation and aborts outstanding work on input close. A judgment executes no tool, grants no permissions and verifies no completion. There is no automatic fixture mode or credential/endpoint argument in the tool.

Doctor's `automatic` block separately reports saved enablement, registration integrity, request ceiling and consumed requests. Legacy `liveEnabled: false` means no explicit manual live operation is currently activated; it is not the automatic enablement field. `hostSession` and connectivity remain NOT VERIFIED until separately checked. See the [implementation evidence report](https://github.com/mytech-today-now/augment-extensions/blob/main/docs/reports/decision-chat-2026-11-27.md) for exact validation categories and acceptance gaps.

```bash
augx decision setup --disable-automatic
```

Disabling saves `automatic.enabled=false` before removing unchanged owned host entries and the companion skill. Unrelated host settings and edited owned files are retained. `augx decision remove` also disconnects tracked chat integration before removing software. The cumulative ledger is retained. `.augx-decision/chat-receipt.json` tracks only generated entry hashes and relative ownership paths. Partial activation remains disabled and retryable; inspect preserved-file errors locally, then rerun setup. Existing sessions may need restart to unload their tool, but disabled runtime policy prevents requests immediately.

## Usage

Copy [source.txt](examples/source.txt), [task.json](examples/task.json), and [labeled-cases.json](examples/labeled-cases.json) into a disposable project after setup. The task and cases expect `source.txt` at the project root.

```bash
augx decision examples --offline
augx decision run --input task.json --offline --id briefing
augx decision resume --id briefing --offline
augx decision evaluate --input labeled-cases.json --offline --id trial
augx decision inventory --input call-inventory.json
```

The examples command executes all eleven capabilities. The run command dispatches, saves a local queue handoff, claims it, executes a real subprocess worker, writes its output, and independently verifies acceptance criteria and source digests. Built-in research collects supplied local evidence; write composes a draft from it; review produces a local inspection record. They do not search the web or call a generative model. Fixture routing is a deliberately simple lexical rule with explicit provenance. It provides repeatable runtime exercises, not evidence of Jev quality.

Use [decision.json](examples/decision.json) for an individual input. Every state requires original `goal`, nonnegative `revision`, and arrays for `evidence`, `completed`, `issues`, `constraints`, and `capabilities`. See [contracts](runtime/contracts.d.ts), [config schema](schemas/config.schema.json), and the executable examples for the supported narrow contracts. Unsupported fields never become executable commands or permissions.

## Capabilities and actual integration boundary

| Capability | Runtime behavior and example |
|---|---|
| Model routing | Filters available compatible adapters by capabilities and data class, considers supplied cost information, then selects a generative adapter. `routeGeneration` invokes its registered generate method. |
| Tool assessment | Recommends allow/review/deny only after registered JSON Schema validation and caller authorization. `executeAction` checks authorization again before executing. CLI probes default to deny because they have no registered tool authority. |
| Context selection | Scores identified chunks in one batch, retains protected instructions/constraints/evidence/blockers, and returns selected, omitted and original views with source references. |
| Stuck detection | Combines progress and repetition Nouls with exact repeated-action and runtime no-progress limits. |
| Worker dispatch | Selects from currently available, capable registered workers; queues and consumes an actual local handler. |
| Action selection | Uses a revision-bound fresh menu and optional caller re-observation and argument validation. Selecting an identifier alone executes nothing. |
| Completion | Uses a Noul proposal plus a separate verifier callback. Missing evidence always produces review. Runs verify actual bytes independently of worker output. |
| Human escalation | Saves inspectable review.json; resume requires the exact review digest when approval is needed. Changed task, sources, policy or action invalidate approval. |
| Retrieval | Scores a supplied small corpus or uses `rerank` on up to 64 access-filtered results from an existing retriever, preserving references. No vector store added. |
| Trace evaluation | Batches satisfaction, efficiency and failure-category judgments. Evaluation records do not automatically alter production policy. |
| Input classification | Selects local destination criteria with a companion fit question and review fallback. Sends no messages. |

`augx decision examples --offline` is the executable example for each row. [Integrations](runtime/integrations.cjs) also implements scoped ancestor AGENTS.md loading, registered action schemas loaded on demand, existing generative-model adapter invocation, existing-retriever reranking, and bounded read-only file inspection. Context selection is query-dependent and reversible. Workers receive a scoped goal and source corpus and merge only their candidate artifact through the controller. Call read-only inspection or trace evaluation explicitly from your existing background runner when needed; no scheduler is installed.

A linked Markdown module cannot intercept an external coding agent. Explicit Augx calls, trusted programmatic adapters and the opt-in native MCP chat path above are separate entry points. The chat tool supplies advisory judgments and does not transparently wrap arbitrary providers, editors, tools or external recipients.

To connect an existing worker, call `run(root, policy, task, options)` from `runtime/runner.cjs` and supply `options.workers` containing trusted `{id, description, capabilities, available, modulePath, sha256}` registrations. Each fixed module exports `async execute(context)`, as [workers.cjs](runtime/workers.cjs) demonstrates. Registration comes from trusted application code, never a task or provider answer. The subprocess validates the module digest before loading it. Keep verifiers outside that module. Custom adapters must reconcile their own external receipts, idempotency and usage; the built-in verifier supports the local artifact contract only. No external generative-worker integration is claimed as tested here.

## Policy, budgets, and recovery

Config pins `jev-1.14.0` and policy version `initial-1`. Choice/Score confidence and probabilities are validated separately. Actions use selected probability at or above the configured threshold and require it to exceed one-half, so ties always go to review. Noul uncertainty and contradictory answers have explicit review/error outcomes. Score bounds follow the descriptive rubric. Independent questions share state; dependent decisions need another observation and call.

Defaults: one active worker per run, three worker attempts, two no-progress rounds, twelve maximum provider requests, sixty seconds total run duration including downtime, five seconds per worker, ten seconds per provider request, and 24,000 serialized request bytes. The byte limit is deliberately more conservative than provider token limits; no exact tokenizer or long-context mode is claimed. SDK retries are disabled so one durable reservation permits at most one provider HTTP attempt. Failures consume reservations. Evaluation additionally reserves from one aggregate budget across all matched tasks. Different run identities are separate budgets.

Run state contains a schema version, task identity/digest, policy digest/version, observation revision, decision provenance, selected worker, status, attempts, request reservations, token usage where reported, artifacts, independent verification, and next action. Writes use flushed temporary files and same-directory rename. An exclusive per-run writer lock serializes claims and duplicate invocations. The lock records PID and ownership token; a live PID is never automatically displaced. A dead writer can be recovered with a second exclusive recovery claim. A leftover recovery claim requires manual inspection. PID reuse can conservatively block recovery.

Resume retains consumed budgets and the original deadline. It verifies an uncertain local artifact before retrying. Existing unverified artifacts require review and are not overwritten. Completed artifacts are rechecked and changed bytes invalidate completion. Crashed in-flight provider requests remain charged and go to review. Ctrl+C aborts requests and terminates owned worker processes and their normal process tree. Same-user hostile mutation, detached custom subprocesses, power-loss filesystem guarantees, exactly-once external effects, and OS sandboxing are outside this implementation's guarantees.

Review requests contain an action, concrete arguments, task/source digest, state revision and policy digest. After inspecting the file, explicitly authorize that concrete action:

```bash
augx decision resume --id briefing --offline --approve DIGEST_FROM_REVIEW
```

Approval resumes only the required registered worker and cannot authorize prohibited paths, a changed task, a different policy or missing capability. Do not modify state files to reset budgets. Use a new reviewed run identity for changed work. Exit 0 means the command succeeded, 1 means a run ended without verified completion, and 2 means invalid input, installation/provider failure, or ownership/configuration conflict.

Costs absent from SDK usage remain unknown (`null`), including worker charges and cache costs. Tokens are recorded only where reported; failed requests remain unknown. This module does not enforce a hard monetary spending cap. Use a provider-side spending limit where available and conservative request/duration reservations locally. A provider answer cannot grant data access or permission. Secret scanning is defense in depth; operators remain responsible for de-identification. Governing instructions are never filtered by a relevance score. Hidden model reasoning is never collected.

## Removal and retention

```bash
augx decision remove
augx unlink workflows/decision-layer
```

Removal uses receipt allowlists and hashes, unlinks only unchanged recorded files, and preserves edited files, unrelated runtimes, credentials, run history, user data, and empty directories. Existing matching skill files reused from another installation are not owned. A redacted preservation receipt remains if edits need review. Remove retained run data manually only when you intend to discard it. A failed install without a ready receipt remains diagnostic rather than ready; rerun setup before removal.

## Measurement and seven-day observation

Start with [call-inventory.json](examples/call-inventory.json). Choose its most frequent judgment for initial adoption. Probe representative de-identified state locally or in the provider playground before connecting a real worker. Run the 24 labeled cases, including held-out cases, then compare matched tasks using the same worker and verifier. The bundled cases are synthetic labels for runtime testing. Offline routing is simulated and does not prove model accuracy, provider performance, or savings. Labeling the task kind defines the required artifact contract; evaluation is not a blind benchmark. Replace cases with independently labeled held-out tasks and a real baseline adapter before making production quality claims.

Record independently verified completion rate, cost per completed task, end-to-end and provider latency, request reservations, worker attempts/retries, escalation rate, inappropriate escalations and missed escalations. Evaluation writes these fields with provenance and unavailable costs as null. Include routing overhead, worker time, provider charges and cache changes in real experiments. Trace judgments are separate observations and cannot overwrite artifact verification.

1. Day 1: Inventory current calls, freeze baseline/policy/model versions, choose one judgment and de-identify representative traffic.
2. Day 2: Inspect local probes, calibrate descriptions on the calibration split, and freeze a held-out split.
3. Day 3: Run matched shadow tasks and inspect every escalation and independently verified completion.
4. Day 4: Measure end-to-end latency and request/retry usage, including failed requests and worker work.
5. Day 5: Reconcile actual provider and worker charges and cache effects; retain unavailable figures as unknown.
6. Day 6: Evaluate held-out examples once, review inappropriate/missed escalations, and draft versioned policy recommendations.
7. Day 7: Explicitly approve or reject promotion against measured completion, cost and latency. Retain the prior policy and expand one judgment at a time only with evidence.

No seven-day production observation has been performed by installing this module.

## Contents and validation

- [Indexed rules](rules/00-index.md), [source notes](sources.md), [config schema](schemas/config.schema.json), [typed interface](runtime/contracts.d.ts)
- [Installer](runtime/install.cjs), [TypeSafe adapter](runtime/decisions.cjs), [controller](runtime/runner.cjs), [integration helpers](runtime/integrations.cjs), [evaluation](runtime/evaluate.cjs)
- [Pinned installation resources](installation/package.json), [source checksums](installation/sources.json), [example task](examples/task.json), [24 labeled cases](examples/labeled-cases.json)

```bash
node augment-extensions/workflows/decision-layer/scripts/validate.cjs
npm run test:decision
```

## Character Count

The metadata count is the fixed-point sum of decoded file contents, including metadata, matching the maintained CLI method. Reconcile it with `scripts/validate.cjs --update-count` after edits. Runtime files stay outside rules, so exports and mirrors preserve their static-only contract.

## Version

Module version: 1.1.0.

`npm run test:decision` explicitly installs the official SDK and skill into the ignored test-artifacts/decision-consumer-source prerequisite, then runs the existing Vitest harness. A plain Vitest run skips SDK and installation contract cases if this prerequisite is absent; it does not silently fake the SDK. The packed consumer verifier additionally exercises an actual clean package installation. To connect a custom worker that makes provider calls, declare `requestsPerAttempt` in its trusted registration. The controller reserves that allocation before launch and aggregates reported token usage. The worker must honor its allocation, report `usage.requests`, and reconcile external billing independently; unknown charges remain unknown. Offline mode never launches a worker with a positive provider-request allocation.
