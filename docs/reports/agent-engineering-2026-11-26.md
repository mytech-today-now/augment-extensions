# Agent Engineering Implementation Evidence

Date: 2026-11-26. Evidence is local deterministic execution unless explicitly identified otherwise.

## Outcome and Design Basis

Added the canonical [Agent Engineering Workflow](../../augment-extensions/workflows/agent-engineering/README.md), version 1.0.0. Inspection found no existing module covering protected harnesses, bounded repair loops, scoped agents, and durable graph execution together. The maintained CLI recursively discovers modules, aggregates rules separately from examples, and requires `workflows` metadata with array dependencies. npm uses an explicit packaging allowlist, so the new directory is included explicitly.

The implementation consists of six indexed rules, eight complete JSON templates, strict Ajv schemas using the existing dependency, a deterministic worker and independent checker, a bounded controller, four graph shapes with sequential execution, local effect reconciliation, saved evaluation cases, and a read-only validation command with an explicit count-update option. No CLI command, dependency declaration, hosted service, provider adapter, scheduler, or package release was added.

The reviewed proposal records compatibility and security decisions before implementation. Root VERSION and package version remain 3.2.0 because this is a source change without a release request; the referenced VERSIONING.md and version-sync scripts do not exist in this checkout. Role definitions remain separate from deployment settings and secrets. Example execution requires an explicit local directory and exposes no production, messaging, purchase, deployment, or privileged-configuration capability.

All four supplied articles were read through FXTwitter's public API after original X access returned 403. [Source notes](../../augment-extensions/workflows/agent-engineering/sources.md) map each input to adopted recommendations and disclose third-party retrieval. No benchmark, pricing, or vendor capability claim was adopted, and no article implementation was copied.

## Files and Purposes

| Paths | Purpose |
|---|---|
| `augment-extensions/workflows/agent-engineering/README.md`, `rules/`, `sources.md` | Progressive adoption, roles, contracts, trust, loops, graphs, improvement, and attribution |
| Module `schemas/` and `templates/` | Machine-checked task, tool, node, evidence, agent, invocation, and checkpoint contracts |
| Module `examples/` | Deterministic subprocess work/check loop, sequential graphs, idempotent local effects, discovery deduplication, failure grouping, and replay |
| Module `scripts/validate.cjs`, `module.json` | Asset/schema/link validation, canonical metadata, and exact self-inclusive count |
| `tests/agent-engineering.test.ts` | 33 positive, negative, boundary, recovery, and consumer tests |
| `package.json`, `README.md`, `modules.md`, `cli/MODULES.md` | npm inclusion, entry points, and focused catalog/statistics updates |
| `.gitattributes` | Preserve LF only for this module so Windows autocrlf does not invalidate exact character counts |
| OpenSpec proposal/spec/tasks, `.beads/issues.jsonl`, `.augment/coordination.json` | Reviewed design, acceptance criteria, implementation ownership, and traceability |

## Requirement and Risk Matrix

| Criterion | Positive evidence | Negative, boundary, or regression evidence |
|---|---|---|
| Discoverable module | Metadata, asset validator, exact character count, real search/show/link, tarball contents, installed consumer | Missing required template, wrong count, malformed schema, packaging allowlist regression guard |
| Agent ownership | Scoped work packet, explicit owner, shared allocation, sequential fallback | Overlapping writes, excess workers, unauthorized tools, recursive delegation, unresolved owner lock |
| Honest verification | Defect rejected by a separate subprocess, repaired candidate accepted with exact digest | Defective candidate subprocess exit 1, stale candidate, changed policy/contract/revision, verifier-write denial, always-green replay rejected |
| Bounded work | Repair then verified success; transient failure clears before retry | Attempt/call/deadline exhaustion, call-limit boundary, stall, preflight and in-flight cancellation, denied authority, unrecoverable error, subprocess timeout |
| Durable state | Interrupted loop and graph resume retain counters, decisions, rejections, and deadline | Corrupt checkpoint preserved, incompatible revision/contract/handler rejected, stale evidence rejected, lock not stolen |
| Correct graph | Chain, both router paths, all-required fan-out/join, bounded self-cycle | Invalid route/output/identifier/schema, missing input edge, unreachable terminal, missing required branch, failed branch, timeout, cancellation, cycle exhaustion |
| Safe effects | Same-key local effect reconciliation and durable receipt | Duplicate trigger, simulated crash after effect before receipt, conflicting payload refused |
| Trust boundaries | Fixed executables, typed payloads, candidate-only gateway, stripped subprocess environment | Traversal, device names, path metacharacters, junction escape, injected payload, policy mutation, secret absent from traces/receipts |
| Controlled improvement | Repeated-failure grouping and non-regressing saved-case replay eligible for review | Always-green and always-red regressions rejected; provider quality explicitly NOT VERIFIED |
| Existing consumers | Four exported destinations, nine mirrored entries, byte-identical repeat runs, configured MCP snippet | Human export edit retained with exit 3; live task fixture excluded; existing EPERM copy-fallback and mirror-drift tests retained |

The graph interpreter supports DAGs and bounded single-node repair cycles, one controller writer, and all-required joins. It rejects unsupported multi-node cycles. Other join policies, actual parallel agents, and live provider execution are documented extension boundaries, not implemented adapter claims.

## Commands and Results

| Command or check | Result |
|---|---|
| `augx list --linked`, current help, local compiled `show` for TypeScript testing/security rules | Inspected; three existing linked modules preserved. Installed global CLI/help is older than checkout capabilities, so consumer checks use the compiled checkout or packaged CLI. |
| `node augment-extensions/workflows/agent-engineering/scripts/validate.cjs` | PASS: eight templates, four graph shapes, all local links and punctuation; exact 87,100 characters |
| `npm run test:vitest -- tests/agent-engineering.test.ts --maxWorkers 1` | PASS: final 33 tests |
| Affected discovery/export/mirror/catalog Vitest selection | PASS: 15 files, 162 tests |
| `npm run test:vitest -- --maxWorkers 2` | PASS: 63 files, 823 tests. This run preceded one additional negative validation test, which passed in the final 33-test selection. No runtime code changed afterward. |
| `npm run lint`; `npm run build`; JavaScript parse checks | PASS: maintained lint scope, TypeScript build, seven runnable JavaScript sources |
| `node cli/dist/cli.js validate workflows/agent-engineering --verbose` | PASS WITH WARNINGS: schema/source URLs flagged by broad project-specific-URL heuristic; total module exceeds recommended 50,000 characters |
| `openspec validate add-agent-engineering --strict` | PASS before archive |
| `npm pack --json --ignore-scripts --pack-destination tmp/agent-engineering` and actual offline consumer install | PASS: all 27 module assets included; installed 131 dependency packages in isolated consumer with scripts disabled; no publication |
| Packaged CLI/module smoke on Node 24.14.1 and Node 16.20.2 | PASS: search/show/link, four exports, nine mirror entries, repeat-run bytes, drift refusal, configured MCP snippet without live fixture data, loop repair, and graph join. Actual Windows mirror mode was copy. |
| Node 16 acquisition | Downloaded official v16.20.2 executable and verified SHA256 against that release's SHASUMS256.txt; no global runtime installation |
| `npm test -- --runInBand` | Final serial rerun PASS: 25 suites, 315 tests. Initial run had two failures, resolved and checked as described below. |
| Isolated Jest failure checks | PASS: performance 5/5, module search median 79.15 ms against 100 ms; runtime compatibility 1/1 after restoring locked Chalk |
| Native `bd list --limit 3` | BLOCKED: installed bd 1.3.1 refuses legacy 0.60.0 Dolt workspace; no initialization or migration performed |
| `bd sync --no-adopt --attempts 1` | BLOCKED with exit 1 by the same legacy-store guard; no database synchronization claimed |
| Final package and static review | PASS: 27 module assets byte-identical to the package tested on both runtimes; JSON/JSONL valid, changed files scanned without em-dashes, and `git diff --check` passed |
| Windows checkout reproducibility | PASS: staged checkout with `core.autocrlf=true` retains exact 87,100 module characters; the LF attribute applies only to module paths |

OpenSpec archival applied four requirements to the canonical `openspec/specs/agent-engineering/spec.md`. The installed CLI initially wrote its default dated archive under `openspec/changes/archive/`; the reviewed files were then moved into this repository's prescribed `openspec/archive/add-agent-engineering/` location. The generated placeholder purpose was replaced with the capability's actual purpose before final strict validation.

The initial consumer failure came from installed minimatch 10.2.5 despite locked 6.2.3. Jest also exposed installed Chalk 5.6.2 despite locked 4.1.2. Both original ignored directories were preserved under `tmp/agent-engineering/original-minimatch` and `original-chalk`; only these two local dependency roots were restored from isolated installs of their existing locked versions. `npm ls chalk minimatch --depth=0` then passed. No lockfile or dependency declaration changed. The initial timing failure occurred during concurrent broad validation; its isolated rerun passed without altering thresholds or product code.

## Limits, Tracking, and Recovery

Provider tests: NOT RUN. Deployed behavior, provider quality/cost controls, actual independent model reviewers, OS sandbox enforcement, and exactly-once external effects: NOT VERIFIED. There is no browser interface, so browser tests were not applicable. The fixture does not claim those outcomes from routing tests. Token usage and provider monetary cost are null because no provider adapter runs. Graph handlers are trusted code and must cooperate with cancellation; untrusted synchronous code requires process isolation.

Static rules total 21,761 characters. Full module size is larger because schemas, templates, runnable examples, and recovery guidance are counted by the loader. They remain outside rule aggregation. Keeping one cohesive module avoids an artificial dependency between the contracts and the reference that demonstrates them. The pre-existing `.augment/` count was 218,378, already outside the local 48,599-49,299 target; after preserving history and adding coordination records it is 227,361. Coordination additions do not claim to resolve that unrelated size debt.

Implementation tracking uses the repository's existing `.beads/bd-write.ps1` JSONL helper, with task `bd-b51a`. Native database synchronization remains owned by the already-open `bd-18f800ab`. No legacy database format was modified. Disposable package consumers and diagnostics remain in ignored `tmp/agent-engineering/`. Existing stashes and user-linked modules were preserved.

Rollback is a normal revert of the implementation commit, followed by a rebuild. In a consumer, use `augx unlink workflows/agent-engineering` to remove tracked materializations; review hand-edited files left by the CLI. Preserve execution evidence before removing a disposable run directory. Inspect and reconcile stale lock ownership explicitly. Never clear a lock by age, reset persisted counters, or reuse evidence after a candidate, policy, contract, handler configuration, or repository revision changes.

## Separate Follow-up

The following existing tooling issue is separate from module implementation. This prompt was refined once using the clarity, bounded scope, evidence, and output principles in the [linked refinement template](https://raw.githubusercontent.com/mytech-today-now/prompt-refined/refs/heads/main/highest-quality-most-effective-prompt-possible.md). Its embedded example request was not executed.

```prompt
You are maintaining Beads compatibility for this Augment Extensions checkout.
Inputs: current AGENTS.md, the existing legacy 0.60.0 Dolt store, task bd-18f800ab,
and the observed bd 1.3.1 refusal. Inspect current state before making changes.
Find a compatible read-only access path first. Preserve the database, JSONL history,
ignored server state, locks, Git work, and existing task identities. Do not initialize,
migrate, replace, or adopt a database/remote without the separately required authority.
If migration is necessary, prepare a concrete reviewed plan with backups, rollback,
format compatibility, and verification before seeking the missing authorization.
Acceptance: existing tasks can be read without data loss, and authorized synchronization
succeeds without unexpected adoption or mutation. Report exact commands, exit results,
revision, backup evidence, remaining limits, and the next owner. Do not infer database
synchronization from a Git push. Do not use em-dashes or expose credentials.
```
