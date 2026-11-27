Based on [the article reproduced by FXTwitter](https://api.fxtwitter.com/N01ennn/status/2103542021071978601), [your refinement template](https://raw.githubusercontent.com/mytech-today-now/prompt-refined/refs/heads/main/highest-quality-most-effective-prompt-possible.md), and the [official SDK requirements](https://raw.githubusercontent.com/typesafe-ai/typesafe-sdk-js/main/package.json).


You are a senior TypeScript engineer, agent-runtime architect, security engineer, and test-automation specialist working inside the Augment Extensions repository.

## Objective

Implement a new, independently installable Augx workflow module that operationalizes the decision-layer engineering process described in:

https://x.com/N01ennn/status/2103542021071978601

The post links to “Jev in the Agent Loop: A Complete Guide to Decision-Layer Automation”:

https://x.com/i/article/2103533489911984128

The module must provide executable functionality, installation automation, practical integrations, documentation, and meaningful tests. It must install the software necessary for its supported workflow rather than leaving users to assemble dependencies manually.

Separate three responsibilities:

1. Existing generative models continue planning, writing, coding, and generating arguments.
2. TypeSafe Jev supplies typed judgments for suitable routing, classification, relevance, and evaluation decisions.
3. Deterministic application code enforces permissions, thresholds, budgets, arithmetic, validation, execution, and completion requirements.

Implement the work directly. Do not stop after producing a proposal, scaffolding, static guidance, or demonstrations disconnected from a usable installation and execution path.

## 1. Verify the sources and current provider contract

Read the article, including available embedded examples. If X blocks access, its public reproduction is available at:

https://api.fxtwitter.com/N01ennn/status/2103542021071978601

Record retrieval date, source provenance, unavailable material, and any differences between the article and current official documentation. A reproduced article establishes design context, not independent proof of its performance claims.

Verify implementation details against current primary sources:

- https://docs.typesafe.ai/introduction/quickstart
- https://docs.typesafe.ai/primitives/choice
- https://docs.typesafe.ai/primitives/score
- https://docs.typesafe.ai/primitives/noul
- https://docs.typesafe.ai/concepts/state
- https://docs.typesafe.ai/confidence
- https://github.com/typesafe-ai/typesafe-sdk-js
- https://github.com/typesafe-ai/skills

Check SDK exports, request and response shapes, runtime requirements, model identifiers, limits, retry behavior, authentication, usage reporting, and installation methods. Pin compatible dependency versions and record the versions checked.

Treat article code as illustrative input requiring review. Do not copy outdated constructors, response properties, model names, prices, context limits, or installation commands without verification. Do not repeat numerical savings or latency claims as guarantees.

## 2. Inspect Augx before choosing the implementation

Begin in the current repository, expected to be:

C:\GitHub\augx\augment-extensions

Read applicable AGENTS.md files, README.md, module-development.md, package manifests, lockfiles, ignore rules, configuration, OpenSpec context, and relevant tests.

Inspect:

- Git status, staged changes, untracked files, and existing local work.
- .augment/COMMAND_HELP.md and current checkout-local CLI help.
- Linked modules and their applicable rules.
- .augment/coordination.json and related Beads tasks.
- Module discovery, metadata validation, linking, packaging, exports, mirrors, and lifecycle facilities.
- Existing dependency installation and configuration utilities.
- augment-extensions/workflows/agent-engineering/, including its contracts, bounded-loop examples, checkpoints, verification, and recovery behavior.

Prefer the checkout-local compiled CLI when validating source changes. Confirm its build is current.

The existing agent-engineering module is a reuse candidate. Inspect its boundaries before deciding what to reuse or narrowly extend. Preserve its supported behavior and clearly distinguish existing fixtures from the new operational integration.

Use a separately linkable module such as workflows/decision-layer unless repository evidence supports a better name. Treat that name as a proposed implementation choice.

Create the architectural proposal, specification deltas, tasks, and coordination records required by repository instructions. Proceed through implementation within the authorized scope.

## 3. Deliver a usable module and command surface

Provide:

1. Valid module metadata, README, indexed rules, configuration examples, source notes, and accurate character counts.
2. A runnable TypeSafe adapter and validated decision contracts.
3. An Augx-accessible installation, diagnostics, execution, and evaluation workflow.
4. Working local worker adapters and a documented interface for connecting existing workers.
5. Durable task handoffs, bounded execution, independent verification, and recovery.
6. Positive, negative, boundary, integration, and regression tests.
7. Package contents that support installation from a built release artifact.

Choose command names after inspecting existing commands. A coherent command group covering setup, doctor, decide, run, resume, evaluate, and removal is a possible design, not a claim that those commands already exist. Combine operations where that produces a smaller, clearer interface.

A linked Markdown module cannot inherently intercept every action performed by an external coding agent. Implement real supported hooks where available. Otherwise provide an explicitly invoked Augx runtime or wrapper around registered worker adapters. Document the actual integration boundary.

Do not claim transparent integration with a host, model provider, or tool whose execution path has not been connected and tested.

## 4. Install and verify required software

Implement an explicit setup operation that automatically resolves and installs the necessary supported dependencies within the selected project or user-owned installation scope.

Setup must:

1. Detect the operating system, architecture, available runtimes, package managers, host agent, installed versions, and existing configuration.
2. Present a concrete installation plan through a side-effect-free dry run.
3. Reuse compatible installations and install missing requirements from verified official sources.
4. Install the official TypeSafe JavaScript/TypeScript SDK and its required runtime.
5. Install the official TypeSafe agent skill through one verified method appropriate to the selected supported host.
6. Create validated configuration, sensible bounded defaults, and a redacted installation receipt.
7. Verify executable resolution, dependency loading, supported versions, configuration validity, and module discovery.
8. Be idempotent and recover predictably from partial failure.

Use the repository's package manager and lockfile conventions for repository dependencies. Isolate optional operational dependencies where necessary.

Reconcile the SDK's runtime requirement with Augx's declared Node compatibility. If the SDK requires a newer runtime, provision or locate a separate module runtime and invoke it explicitly. Existing Augx commands must remain usable on their supported runtimes without importing or installing the optional SDK.

Prefer user-scoped or project-local installation. Avoid unnecessary administrator privileges, global upgrades, Python environments, containers, orchestration frameworks, databases, and additional providers.

Use verified downloads, checksums or signatures where available, explicit executable arguments, bounded subprocesses, and recorded ownership. Do not execute commands copied from untrusted state or arbitrary manifest strings.

Ordinary discovery, help, list, show, and export operations must remain free of installation side effects. Explicit setup or an explicitly selected installation option authorizes routine dependency installation.

Provide clear outcomes for unsupported platforms, unavailable downloads, permission failures, incompatible versions, offline operation, and interrupted installation. A partial installation must not be reported as ready.

Removal must delete only tracked, unchanged module-owned resources. Preserve user edits, unrelated runtimes, credentials, and user data according to documented retention choices.

## 5. Authentication and activation

Use the provider's verified environment-variable or supported secret-store mechanism. The expected TypeSafe variable is TYPESAFE_API_KEY; confirm current behavior.

Never request secrets in chat, embed real credentials in examples, commit them, or expose them in logs, receipts, exports, traces, or test artifacts.

Dependency installation and offline validation must work without credentials. Diagnostics must distinguish:

- Software installed.
- Configuration valid.
- Credentials available.
- Provider connectivity verified.
- Live operation enabled.

Live requests require configured credentials and an explicit request or run budget. Missing credentials must produce actionable diagnostics without fabricating provider success.

Provide deterministic offline fixtures, clearly identified as fixtures. Never silently substitute fixture decisions for live decisions.

## 6. Implement the article's eleven decision points

Provide a working, configurable implementation and an executable example for each capability below. Use shared primitives and policy functions rather than eleven separate frameworks.

1. Model routing: Select among configured compatible generative-model adapters using task requirements, capability, cost information, and data-access policy. Preserve existing generative roles.

2. Tool-call assessment: Produce structured allow, review, or deny recommendations. Deterministic authorization remains authoritative. A model recommendation may restrict execution but cannot override a prohibition or manufacture permission.

3. Context selection: Score identified context chunks and construct a reversible selection view with source references. Preserve governing instructions, explicit constraints, protected evidence, and unresolved blockers.

4. Stuck detection: Combine judgment about progress with deterministic repetition checks, retry limits, and no-progress limits. Stop or escalate instead of consuming the remaining budget indefinitely.

5. Worker dispatch: Choose only among registered, currently available workers whose capabilities match the task. Uncertainty follows an explicit review path.

6. Action selection: Build a fresh menu from current observable state, select only valid action identifiers, validate arguments, and reject or reevaluate stale selections after state changes.

7. Completion assessment: Use the model to propose completion, then independently verify the required artifacts, tests, or external receipts. Model confidence alone cannot establish success.

8. Human escalation: Persist an inspectable review request for uncertainty, policy requirements, missing information, or unavailable capabilities. Resume only after a valid decision or applicable prior authorization.

9. Retrieval ranking: Support direct candidate scoring for a small supplied corpus and reranking of candidates from an existing retriever for larger collections. Preserve provenance and access controls.

10. Trace evaluation: Evaluate completed runs for task satisfaction, efficiency, and failure categories. Save results for offline analysis without automatically changing production policies.

11. Input classification: Route supplied local tickets, documents, messages, or log records using explicit destination criteria and a review fallback. Examples must not send real messages or contact external recipients.

Do not force an inference call where exact code suffices. Counting, arithmetic, date calculations, permission checks, budget enforcement, and schema validation belong in code.

## 7. Define typed contracts and code-owned policy

Support Choice, Score, and Noul using the verified provider contract:

- Choice selects from explicitly described options.
- Score evaluates an ordered descriptive rubric.
- Noul represents the probability of a yes/no proposition.

Validate requests and responses at runtime, including expected question identifiers, option membership, required fields, finite values, probability ranges, score bounds, and supported limits.

Keep policy thresholds in versioned configuration and code. Confidence and probability are distinct values with provider-specific meanings. Neither constitutes proof that an individual decision is correct.

Use state containing the original goal, observed evidence, completed work, unresolved issues, constraints, current capabilities, and relevant revisions. Clearly distinguish trusted instructions from untrusted content.

Describe the decision in instructions and criteria. Do not assume a question identifier supplies instructions to the model.

Batch independent questions that evaluate the same state. Decisions requiring a new observation or another decision's result must occur in a subsequent step.

Handle invalid, missing, contradictory, or unsupported answers through an explicit safe outcome.

## 8. Make worker execution durable and bounded

First implement the article's standalone dispatcher pattern using local research, write, and review queues or an equivalent repository-consistent mechanism.

A queued handoff is not completed work. Connect queue consumption to functioning local worker handlers and a real artifact verifier.

Persist schema-versioned records containing task identity, state revision, decision provenance, selected worker, status, attempt accounting, artifacts, verification results, and the next required action.

Provide:

- Validated state transitions and clear terminal outcomes.
- Atomic updates and controlled writer ownership.
- Duplicate-trigger protection and worker claims.
- Crash recovery and reconciliation of uncertain effects.
- Bounded retries, concurrency, execution time, provider requests, and overall run duration.
- Cancellation and cleanup of owned subprocesses.
- Aggregate usage accounting across workers and retries.
- Explicit failure, review, cancellation, exhaustion, and verification outcomes.

Account for SDK retries when enforcing limits. Unknown provider cost must remain unknown. If a hard spending cap cannot be enforced by the provider, document the practical limit and use conservative local reservations.

Do not claim exactly-once external effects or OS sandboxing without implementing and verifying those properties.

Keep verifiers and acceptance criteria outside the worker's authority to weaken.

## 9. Preserve security and context boundaries

Treat retrieved documents, task text, tool output, and provider answers as untrusted data.

Enforce workspace containment, registered action schemas, executable allowlists, provider data policies, and secret filtering before a model request or tool action.

Where approval is required, bind it to the concrete action, arguments, relevant state, and policy version. Changed actions invalidate stale approval. Respect authorization already granted within its defined scope.

Support the article's broader harness ideas through the same interfaces:

- Query-dependent context views.
- Scoped worker context and controlled result merging.
- Small capability hints with schemas loaded when needed.
- Applicable repository guidance loaded according to scope.
- Sensitive-data-aware provider routing.
- Bounded read-only background evaluation or inspection.

Use existing facilities where available. Do not introduce unrelated scheduling services, vector databases, multi-agent platforms, or cloud infrastructure merely to demonstrate these patterns.

Never discard governing instructions because a relevance model scored them poorly. Do not collect hidden model reasoning as application state.

## 10. Follow the staged adoption and measurement process

Provide a repeatable workflow that:

1. Inventories existing model calls and classifies them as generation, judgment, or deterministic logic.
2. Chooses one frequent decision point for initial adoption.
3. Allows inspection in the provider playground or an equivalent local probe before integration.
4. Runs the standalone dispatcher against at least twenty representative, de-identified, labeled cases.
5. Connects the selected decision point to worker execution and independent verification.
6. Compares baseline and decision-layer behavior on matched tasks.
7. Expands adoption only when measured quality, cost, and latency justify it.

Include a practical seven-day observation protocol without delaying implementation for seven days or inventing longitudinal results.

Measure independently verified completion rate, cost per completed task, end-to-end latency, provider latency, retry usage, escalation rate, inappropriate escalations, and missed escalations.

Include routing overhead, worker work, and available cache-related costs. Clearly distinguish measured, estimated, simulated, and unavailable values.

Use held-out examples for threshold evaluation. Version recommended policy changes and require explicit promotion rather than silently learning new production thresholds.

## 11. Integrate documentation and packaging

Update relevant module catalogs, package inclusion lists, CLI help, configuration schemas, coordination records, specifications, and tests.

Ensure the packed distribution contains the module, executable assets, required schemas, dependency declarations, installation resources, and documentation. Validate the actual packed artifact in a disposable consuming project.

Reconcile metadata and character counts using the repository's established method.

Preserve static export and mirror contracts. Do not embed credentials, queued work, live task snapshots, runtime traces, or installation receipts into exported rules.

Explain source checkout versus installed-package behavior, supported operating systems, runtime requirements, installation scope, setup, credentials, offline mode, live mode, diagnostics, recovery, removal, and known limitations.

Follow VERSION and synchronization rules if a workspace version change is required. Verify available scripts before invoking them.

## 12. Test observable behavior

Reuse existing test frameworks. Start with focused tests and broaden as needed.

Positive tests must cover installation, idempotent setup, SDK loading, typed decisions, batching, queue consumption, worker execution, verified completion, recovery, and evaluation output.

Negative tests must cover missing credentials, malformed configuration, invalid provider answers, unauthorized actions, unavailable workers, unsupported runtimes, installation failure, authentication errors, rate limits, timeouts, and exhausted budgets.

Boundary tests must cover threshold equality, ambiguous probabilities, empty and oversized inputs, stale menus, concurrent claims, duplicate events, interrupted writes, unsafe paths, Unicode paths, and partial installations.

Security and regression tests must prove that:

- High model confidence cannot bypass deterministic denial.
- A completion verdict cannot pass without required evidence.
- Untrusted text cannot modify policy or create tool permissions.
- A resumed run preserves consumed budgets.
- Removal preserves unrelated and edited files.
- Existing Augx commands work without optional dependencies.
- Existing modules retain supported linking, export, and mirror behavior.

Use deterministic fixtures for routine tests and a local HTTP contract stub for provider integration behavior. Keep real-provider tests explicitly identified and budgeted.

Run clean installation and execution from the packed artifact. Test supported operating-system and runtime combinations where available. Report unavailable environments as NOT VERIFIED.

Never weaken valid tests, hide failures through mocks, or present compile-only checks as behavioral proof.

## 13. Acceptance criteria

The work is complete when:

1. The module is independently discoverable, linkable, packaged, and documented.
2. Setup installs and verifies required supported dependencies.
3. Repeated setup preserves valid existing state.
4. All eleven decision capabilities have functioning implementations and examples.
5. At least one complete workflow executes workers and verifies its artifacts.
6. Permissions, budgets, retries, recovery, and escalation operate independently of model confidence.
7. Baseline comparison and labeled-case evaluation are reproducible.
8. Existing Augx behavior remains protected.
9. Applicable checks pass and remaining verification limits are explicit.
10. Repository-required task tracking, coordination, commit, and push steps are completed without disturbing unrelated work.

Do not migrate unrelated task databases, delete existing stashes, rewrite history, or publish packages merely to satisfy cleanup language.

## 14. Final implementation report

Return a concise report containing:

1. Outcome and completion status.
2. Verified design basis and source/API discrepancies.
3. Files changed and their purposes.
4. Exact installation and usage commands implemented.
5. Dependencies installed, versions, locations, and unresolved prerequisites.
6. Tests added or updated.
7. Commands executed, results, and relevant failures.
8. Remaining risks, recovery instructions, and unverified environments.
9. Commit and remote status where repository instructions require them.

Include this traceability matrix:

| Requirement or risk | Test level | Positive or negative path | Expected result | Verification status |
|---|---|---|---|---|

Every acceptance criterion and material risk must appear.

Distinguish local fixtures, contract tests, packed-artifact execution, actual provider calls, and production evidence. Never describe unexecuted checks as passing.

For genuinely unresolved or out-of-scope work, supply focused follow-up implementation prompts. Refine each once using:

https://raw.githubusercontent.com/mytech-today-now/prompt-refined/refs/heads/main/highest-quality-most-effective-prompt-possible.md

Replace its actual request placeholder with the follow-up request and return the refined result. Do not recursively generate further prompts.

Proceed autonomously when repository evidence resolves ordinary implementation choices. Ask only for information that materially blocks correct work. If blocked, complete independent authorized work and report the precise missing prerequisite.

Do not invent repository contents, APIs, credentials, installations, performance results, or test outcomes.

Do not use em-dashes in any generated content, documentation, comments, test descriptions, summaries, or other written output.