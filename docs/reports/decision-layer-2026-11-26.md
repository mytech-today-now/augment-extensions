# Decision Layer Implementation Evidence

Date: 2026-11-26, America/Chicago. Status: implemented with local Windows evidence. Live provider, production, external-worker and other-platform evidence remains explicitly unverified.

## Outcome and source basis

Added independently linkable workflows/decision-layer 1.0.0 and the `augx decision` command group. It supplies isolated installation, the official TypeSafe SDK adapter, validated Choice/Score/Noul contracts, all eleven decision capabilities, code-owned authorization and budgets, consumed local queues, bounded subprocess workers, independent artifact verification, recovery, review requests, matched-case evaluation and safe removal. Existing Agent Engineering sources remain unchanged; its guidance and contracts informed the boundary, while its deterministic fixtures are not presented as this integration's operational proof.

The article reproduction was retrieved with its embedded Markdown examples. Current official sources differ from its illustrative constructor, answer maps, Score property, model default and text-only description. The implementation uses TypeSafeClient.systemOne, answers keyed by ID, ordered criteria and a pinned model. It does not promise article savings, prices or latency. [Source notes](../../augment-extensions/workflows/decision-layer/sources.md) record provenance, unavailable image-only details, SDK/runtime checks and primary links.

Root VERSION and package version remain 3.2.0 because no release or publication was requested. The new module is version 1.0.0. VERSIONING.md and version-sync scripts are absent in this checkout. No npm publication, global runtime change, task-database migration, stash deletion or history rewrite was performed. The unrelated untracked ai-prompts/jev.md is excluded from the implementation commit.

## Files and installation

| Files | Purpose |
|---|---|
| Module README, indexed rules, sources.md | Commands, provider contract review, trust boundaries, adoption and seven-day observation protocol |
| Module runtime/decisions.cjs and contracts.d.ts | Runtime validation, TypeSafe adapter, shared primitives and eleven capabilities |
| Module runtime/install.cjs and installation/ | Checksum/integrity-pinned software, explicit setup plan, diagnostics, partial recovery and ownership-based removal |
| Module runtime/runner.cjs, worker-child.cjs, workers.cjs | Durable dispatcher, queue claims, isolated subprocess interface, local handlers and independent verifier |
| Module runtime/integrations.cjs and evaluate.cjs | Registered tools/models, scoped guidance, retriever reranking, read-only inspection and matched-case evaluation |
| Module schemas/, examples/, scripts/validate.cjs | Strict configuration, 24 labeled cases, usable local inputs and exact metadata counts |
| cli/src/commands/decision.ts and cli/src/cli.ts | Lazy command group preserving optional dependency and Node boundaries |
| tests/decision-layer.test.ts and scripts/test-decision-layer.cjs | Deterministic behavior tests plus an explicit official-software integration prerequisite |
| scripts/verify-decision-package.cjs | Clean consuming-project installation from an actual npm tarball |
| package.json, README.md, both catalogs, .gitattributes, .gitignore | Package inclusion, entry points, LF-stable counts and ignored local runtime artifacts |
| OpenSpec proposal/spec/tasks, coordination, Beads JSONL | Architecture, source-of-truth requirements, task ownership and verification follow-up |

Installed in disposable project scopes: @typesafe-ai/sdk 0.7.0, official TypeSafe skill at commit 302eea662c54bca6730873fe245bec1d69ebc23d, and separate official Node 22.23.5 with npm. SDK integrity is locked; skill and Node archives use checked SHA-256 pins. Existing Node 24.14.1 was also reused. Official Node 16.20.2 executable checksum was verified and its packaged CLI behavior exercised. Augx does not import the optional SDK on ordinary startup.

Runtime software and config live under `.augx-decision` in the selected project. The skill uses project-local `.agents/skills/typesafe-ai` by default or `.claude/skills/typesafe-ai` when selected. Credentials remain in the local environment and were not available for real provider requests. SDK contract tests used a fake key only against a loopback HTTP server.

```bash
augx link workflows/decision-layer
augx decision setup --dry-run --host codex
augx decision setup --host codex
augx decision doctor
augx decision examples --offline
augx decision decide --input decision.json --offline --id probe
augx decision run --input task.json --offline --id briefing
augx decision resume --id briefing --offline
augx decision evaluate --input labeled-cases.json --offline --id trial
augx decision inventory --input call-inventory.json
augx decision remove
```

For live use, inspect and explicitly enable allowProviderData, configure TYPESAFE_API_KEY locally, and replace `--offline` with `--live --requests N`. A reviewed escalation is resumed using `--approve` and its exact stored digest. No live operation is silently enabled by setup or doctor.

## Requirement and risk traceability

| Requirement or risk | Test level | Positive or negative path | Expected result | Verification status |
|---|---|---|---|---|
| 1. Discoverable, linkable, packaged module | CLI, metadata, tarball consumer | Positive | Search/show/link find module and executable assets are included | PASS locally |
| 2. Automated software installation | Actual installer and packed consumer | Positive | Official SDK/skill and separate runtime install, load and validate | PASS Windows x64 |
| 3. Repeat setup preserves state | Installer and packed consumer | Positive/boundary | Compatible software reused, valid config retained, byte-identical receipt on repeat | PASS locally |
| 4. Eleven working capabilities/examples | Unit/integration executable examples | Positive | All capabilities use reviewed primitives and return explicit outcomes | PASS offline; SDK shapes tested with loopback |
| 5. Complete worker/verifier path | Real local subprocess and packed consumer | Positive | Queue consumed, worker runs, actual artifact independently accepted | PASS locally |
| 6. Permissions, budgets, retries, recovery and escalation | Unit/integration and real HTTP stub | Positive/negative | Confidence cannot authorize denied work; reservations, original deadline and attempts survive resume | PASS locally |
| 7. Matched baseline and labeled evaluation | 24 cases with 16 calibration/8 held-out | Positive/negative | Real local workers, 20 verified completions and 4 expected reviews; explicit simulated routing provenance | PASS offline; production quality NOT VERIFIED |
| 8. Existing Augx behavior | Full suites and packaged Node 16/24 | Regression | Ordinary commands need no optional SDK; static export/mirror behavior preserved | PASS locally |
| 9. Applicable quality checks | Lint, build, schemas, OpenSpec, suites, package | Positive/negative | Required checks pass; unavailable environments remain explicit | See command evidence below |
| 10. Tracking, coordination, commit and push | JSON/JSONL, Git and remote ref checks | Positive | Narrow authored changes committed and remote verified | Final commit/push reported in session handoff |
| Invalid provider output | Real SDK against loopback HTTP | Negative/boundary | Missing IDs, invalid types/values, bad distributions/legends and unsupported model are rejected | PASS locally |
| Threshold equality and ambiguity | SDK contract tests | Boundary | Equality accepted by probability rule; ties go to review despite confidence | PASS locally |
| Authentication, rate limits, timeout and redirects | Real SDK against loopback HTTP | Negative | Sanitized errors, no hidden retries or fixture substitution, no credential forwarding | PASS locally |
| Missing credentials/data permission | Unit/diagnostic | Negative | Actionable failure before provider transport | PASS locally |
| Malformed/unsupported runtime and config | Installer/config tests and actual Node 16 bridge | Negative/positive | Unsupported platform/model refused; older Augx runtime launches separate Node 22 | PASS Windows; other OS NOT VERIFIED |
| Installation failure/partial state | Installer, transport and ownership tests | Negative/recovery | Unowned or edited resources preserved; journal recovery does not claim ready prematurely | PASS local fixtures, checksum/network-failure fixtures and actual successful install; real offline-download/ACL failures not physically reproduced |
| Stale actions and source observations | Revision checks, task/source digests | Negative | Reject changed menu or changed source before applying action/accepting output | PASS local menu tests and controller checks |
| Duplicate/concurrent claims and interrupted writes | Durable state and ownership tests | Boundary/recovery | Single owner, unchanged valid checkpoint retained, uncertain effect reconciled | PASS locally; forced machine power loss NOT VERIFIED |
| Windows readers and cancellation | Filesystem and subprocess integration | Negative/recovery | Retry brief replacement locks, preserve checkpoint on persistent denial, cancel the owned worker and persist cancellation | PASS Windows x64, including reproduced reader-lock failure and corrected rerun |
| Completion confidence without evidence | Unit and worker verifier | Negative | Missing, modified or rejected artifact cannot complete | PASS locally |
| Prompt injection, secrets and unsafe paths | Unit/integration | Negative | Untrusted text cannot create authority; paths/devices/receipt traversal refused; secrets excluded | PASS tested patterns; universal secret detection not claimed |
| Removal preserves edits and unrelated files | Installer and packed consumer | Negative/boundary | Unchanged owned files removed; edits, unrelated files, credentials and run history retained | PASS locally |
| Aggregate worker/provider usage | Reservations and HTTP contract evaluation | Boundary | One aggregate evaluation cap across tasks; unknown charges stay null | PASS local contract; external adapter enforcement NOT VERIFIED |
| Provider economics and production operation | External evidence | Positive/longitudinal | Actual matched tasks, billing and seven-day observations required before promotion | NOT VERIFIED; bd-758d |
| macOS/Linux and additional architectures | Actual environment execution | Positive/negative | Clean package, portable runtime, recovery and removal run on actual targets | NOT VERIFIED; bd-758d |
| External generative workers and OS isolation | Integration boundary review | Positive/negative | Registered interface only; no transparent host hook, sandbox or exactly-once claim | Interface implemented; real external adapters NOT VERIFIED |

## Commands and observed results

| Command/check | Observed result |
|---|---|
| Checkout-local build, help, linked modules and source inspection | PASS; used maintained compiled CLI, inspected three linked modules and applicable rules |
| npm run lint and npm run build | PASS |
| openspec validate add-decision-layer --strict and openspec validate decision-layer --type spec --strict | PASS; proposal archived under openspec/archive/add-decision-layer and canonical spec added |
| Agent Engineering scripts/validate.cjs | PASS; 87,100 characters, existing sources unchanged |
| Initial decision-layer focused tests | 55 PASS, then 64 PASS after expanded negative/boundary coverage |
| Final focused decision-layer checks | PASS: 70 tests, including real SDK loopback contracts, cancellation and Windows checkpoint replacement |
| npm run test:vitest -- --maxWorkers 2 | PASS: 64 files, 894 tests, 64.57 seconds |
| npm test -- --runInBand | PASS: 25 suites, 315 tests, 135.381 seconds |
| Module validator | PASS: 27 files and 117,091 self-inclusive characters; warnings about recommended module size, external source/schema URLs and prose-only rules |
| npm pack --json --ignore-scripts and packed consumer verifier | PASS: 24 command checks in the final clean consumer, on Windows x64 with Node 24.14.1 and Node 16.20.2 bridging to Node 22.23.5; final packed catalog exactly matches reviewed source |
| bd list --json and bd sync --no-adopt --attempts 1 | BLOCKED by existing legacy Dolt guard; no migration or database sync claimed |
| git diff --check, changed-file punctuation and structured-data checks | PASS: 46 authored files; valid JSON/JSONL, CJS syntax, coordination paths and package asset inclusion; no prohibited punctuation in generated content |

Final tarball: `test-artifacts/decision-package/mytechtoday-augment-extensions-3.2.0.tgz`. SHA-256: `9521ff75cf10e4699af60792cea7e74f8c5b3314e6ad64b8f077c2aa8ab1bfd4`. The clean consuming project and detailed command statuses are retained at `C:\Users\kyle_\AppData\Local\Temp\augx-decision-packed-ffkSMs\verification.json`. Its final run exercised discovery without SDK side effects, four repeatable exports, six mirrors, Node 16 setup and runtime bridging, repeated setup, doctor, consumed worker execution, resume, eleven examples, 24 matched cases, edited-skill preservation, removal and unlink. Test artifacts are ignored and excluded from the implementation commit.

Task bd-9e92 is closed in the append-only JSONL log; bd-758d remains open. Coordination points to the canonical specification and archived proposal. Native Beads sync was attempted again and rejected by its existing legacy-store guard. Git commit and remote verification are reported in the final session handoff because a commit cannot contain its own hash.

The first packed verifier mistakenly used a consumer under the repository and resolved the ancestor configuration. Its generated mirrors/exports were removed, the original three-module linked configuration was restored, and the tracked coordination file was restored before adding this task's narrow records. The verifier now creates a local `.augment/extensions.json` in an OS temporary directory outside the repository. A second check encountered the existing CLAUDE include-stub/export drift protection; verification now establishes exports before adding mirrors. No exporter behavior was changed. The initial expanded focused run hit a five-second fixture timeout because a copied SDK-only fixture retained thousands of unrelated portable-runtime receipt entries; the fixture now tracks only the files it copies, and the rerun passed without increasing that timeout.

An initial full Jest run measured search at 114.30 ms against its 100 ms limit while other heavy checks were active. The isolated performance test passed, and the serial full rerun passed all 315 tests with search at 82.60 ms. The final Vitest run also exposed a transient Windows reader preventing checkpoint rename during cancellation. Atomic replacement now retries that error for at most 200 ms, with a regression check proving that persistent denial preserves the existing checkpoint. Actual subprocess cancellation passed in both the focused and full reruns. Setup discovery launches bounded real executable probes; its side-effect-free integration check now has an explicit 30-second test budget rather than the generic five-second default. No assertions or production limits were relaxed.

Staged review found CRLF line endings in the labeled-case JSON that Git would normalize. Module files were normalized to LF before recomputing metadata and both catalogs. The final 117,091-character count also matches the actual Git index text, and the final packed module validator passes. This changes JSON formatting only, preserving all case values.

## Limits, recovery and follow-up

This is an explicitly invoked wrapper, not a transparent coding-agent interceptor. Built-in workers operate only on supplied local documents. There is no OS sandbox, universal injection/secret protection, provider-enforced monetary cap, exactly-once external effects guarantee, or production performance result. Unknown provider, worker and cache costs remain null. Registered external workers must honor allocated requests and reconcile their own effects and billing.

Use setup again after an interrupted installation. Do not replace edited owned software or skills automatically. Use resume for an unchanged task/source/policy, preserving consumed reservations and the original deadline; inspect review.json and any uncertain artifact before approval. Completed artifacts are reverified. Removal retains user edits, credentials, data and unrelated runtimes.

Follow-up bd-758d covers live credentials/budgeted provider verification, real baseline and independently labeled traffic, external worker integration, macOS/Linux and longitudinal measurement. The [focused follow-up prompt](../followups/decision-layer-provider-and-platform-verification.prompt.md) was refined once using the supplied template. Existing bd-18f800ab tracks the incompatible Beads store; no duplicate migration or unauthorized database change was attempted.
