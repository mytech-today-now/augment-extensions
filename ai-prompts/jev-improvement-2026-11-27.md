You are a senior software architect and agent-runtime engineer with experience integrating bounded decision systems into interactive coding assistants. Work in the Augment Extensions repository and implement the requested change directly.

## Objective

Refactor the Jev decision-layer application so that, after one-time configuration, Jev is used automatically and routinely during ordinary chat sessions whenever a task reaches a relevant, permitted decision point. The user must not need to mention Jev, invoke a Jev command in chat, or run a terminal command for each use.

Original request: “Refactor the application so that automatic, routine use of Jev occurs during conversations in the chat session. It should not need to be invoked in the chat session or from the terminal to run.”

Treat “automatic” as automatic agent-side invocation for eligible decisions under saved policy. Do not make a provider request for every message or tool action. Routine use must be observable in supported chat sessions, not merely described in documentation.

## Repository Context and Inspection

Before editing:

1. Read the current root and nested AGENTS.md files, README and module-development guidance, OpenSpec context and specs, package manifests, lockfiles, ignore rules, and applicable module rules.
2. Inspect git status, staged and unstaged diffs, untracked files, and ignored local artifacts. Preserve all unrelated user work.
3. Trace the existing decision-layer workflow end to end, including installation, the TypeSafe skill, runtime adapter, policy/configuration, CLI and GUI commands, agent-engineering patterns, supported host targets, tests, packaging, and documentation.
4. Identify the actual host capabilities available for normal chat-session integration. Check current primary documentation for any host lifecycle, skill activation, tool, hook, or extension API that the implementation relies on. Do not invent an API or infer automatic runtime behavior from static rule linking.
5. Review current Jev and decision-layer specs and active OpenSpec changes. Create or update the proposal, spec delta, task list, and coordination records required by repository instructions for this architectural change. Use the repository’s native Beads workflow if required. Do not hand-edit exported task data.
6. Record relevant assumptions and distinguish verified host behavior from simulated behavior.

The repository already separates static decision-layer guidance from actual Jev execution. Linking rules or installing a skill alone does not prove that Jev runs during chat. Preserve this distinction in both implementation and claims.

## Required User Experience

Deliver a real automatic invocation path for the chat host or hosts the repository supports:

- After one-time setup and activation of the saved automatic-use policy, an ordinary conversation can reach an eligible decision and invoke the configured Jev runtime without the user naming Jev or issuing a command.
- The path runs through a host-supported agent/session integration, such as a verified automatic skill activation or a native lifecycle/tool integration. A new instruction file may contribute, but documentation or static linking alone is not sufficient evidence.
- The integration continues the normal task after receiving Jev’s typed judgment. It must not require the user to launch the CLI, open a terminal, manually select “run Jev,” or approve every eligible invocation separately when saved policy already authorizes it.
- Retain existing explicit setup, diagnostics, and administrative CLI/GUI operations where useful. They may be used during development and one-time configuration, but must not be required for each conversational invocation.
- Inspect which hosts are actually supported by the current installer and package. Implement and validate the relevant supported path, prioritizing the active chat host when repository evidence identifies it. Do not claim universal integration across hosts that were not connected and verified.
- If a host exposes no supported way to activate the runtime automatically, do not disguise manual invocation as automation. Implement the strongest supported integration within scope, state the exact host limitation, and mark the affected acceptance criterion as blocked or unverified.

## Safe Invocation Policy

Keep Jev’s role narrow: it supplies typed judgments such as classification, relevance, routing, or evaluation when those decisions benefit from it. Existing deterministic application code remains authoritative for permissions, policy thresholds, budgets, arithmetic, schema validation, execution, and completion verification.

Inspect and reuse existing configuration and policy. Define clear eligibility conditions, supported decision types, minimum context requirements, request limits, timeouts, and failure behavior. Make the automatic-use setting visible and persistent during one-time setup if activation is needed. Do not add a per-turn approval gate for an invocation already covered by saved user authorization.

For each invocation:

- Send only the minimum task context needed for the configured judgment.
- Apply existing data-access, privacy, permission, and provider policies before sending context.
- Enforce request and retry budgets in code before the request is made.
- Validate the complete typed response before using it.
- Prevent recursive self-triggering, duplicate calls for the same state, and unbounded calls across turns.
- Re-evaluate eligibility when the relevant task state changes.
- Keep secrets, private keys, hidden model reasoning, and unrelated conversation history out of requests, logs, traces, exports, and test artifacts.
- Never let a Jev recommendation grant permission or override a prohibition.

When a task is ineligible, deterministic code is sufficient, saved policy disables automatic use, a budget is exhausted, or the provider is unavailable, do not make the request. Continue through a safe existing fallback when possible. Never fabricate a Jev result or silently treat an offline fixture as a live provider answer. Report a material fallback or failure accurately without interrupting unrelated conversation behavior unnecessarily.

## Implementation Plan

1. Map the normal chat-session lifecycle and identify the narrowest supported integration point. Define how eligible decisions are detected and how the configured runtime is reached without a per-turn terminal command.
2. Reuse existing decision-layer contracts, installer ownership rules, receipts, policy configuration, and agent-engineering patterns where they fit. Avoid creating a competing runtime, duplicate configuration system, or unrelated framework.
3. Implement the host integration, automatic eligibility policy, runtime call path, persistence or deduplication needed for safe repeated turns, and graceful failure behavior. Keep existing manual administration paths working unless a verified incompatibility requires a scoped change.
4. Update setup so a user can configure automatic use once. Preserve existing installations and user edits. Any installation or activation change must be idempotent, scoped, reversible where practical, and report partial failure accurately.
5. Update module guidance, supported-host documentation, configuration schemas, CLI or GUI help where relevant, package contents, catalogs, OpenSpec artifacts, coordination metadata, and version counts using established repository mechanisms.
6. Keep Node/runtime compatibility intact. Verify current TypeSafe SDK requirements and isolate any optional newer runtime instead of breaking ordinary Augx commands.
7. Implement production-quality code. Do not leave stubs, disconnected examples, placeholder comments, or a prompt-only solution.

## Tests and Verification

Use the repository’s current test tools and conventions. Add focused behavior tests before broader checks. Map each acceptance criterion and material risk to at least one test.

Positive-path tests must prove that:

- One-time configuration persists a valid automatic-use policy and can be repeated safely.
- A representative ordinary chat-session event reaches an eligible configured decision and invokes Jev automatically without a Jev command or explicit Jev mention.
- The typed result is validated and returned to the normal task flow.
- A subsequent eligible turn can invoke again when policy allows and the relevant state is new.
- Existing explicit setup, diagnostics, and administrative operations continue to behave as specified.

Negative, boundary, and regression tests must prove that:

- Irrelevant turns, unsupported decisions, disabled policy, unchanged state, or missing required context do not trigger a request.
- Denied permissions, exhausted budgets, retries, timeout, missing credentials, invalid responses, provider failure, cancellation, and unsupported host conditions fail safely.
- Failure does not bypass authorization, corrupt state, leak secrets, loop, or prevent unrelated conversation behavior from continuing where a safe fallback exists.
- Repeated triggers are deduplicated, state changes are handled, and concurrent calls respect configured limits.
- Existing CLI behavior, static exports, mirrors, unrelated host integrations, and ordinary Augx commands do not regress.

Prefer deterministic host/runtime fixtures and contract tests for automated coverage. Use a real chat-host or provider check only where credentials and a supported environment are already available. Clearly distinguish fixture, automated host, manual host, and live-provider evidence. Do not claim a live or manual chat-session test passed if it was not performed.

Run the narrowest relevant checks first, then appropriate package, lint, type, build, integration, or broader suites. Report every command actually run, its result, failures, skipped checks and reasons, and what remains unverified. Do not weaken valid tests or controls to obtain a passing result.

## Acceptance Criteria

The implementation is complete only when:

1. With the supported chat integration configured once and saved policy allowing it, an eligible decision in an ordinary conversation invokes Jev automatically without the user invoking Jev in chat or from a terminal.
2. The invocation is selective, bounded, policy-controlled, privacy-aware, and integrated into the normal conversation task flow.
3. Ineligible or unauthorized cases do not invoke Jev, and provider or runtime failures follow tested safe behavior.
4. The integration uses a real supported host activation mechanism. Static rule availability by itself does not satisfy this criterion.
5. Existing administrative workflows and unrelated behavior remain compatible.
6. Tests cover positive paths, prohibited invocations, boundaries, failures, repeated turns, and regression risks.
7. Documentation describes setup once, supported hosts, automatic-use policy, invocation boundaries, limits, troubleshooting, and known verification gaps accurately.
8. The final report makes no claims beyond repository, test, host, and provider evidence.

## Constraints

- Make the smallest change that fully delivers the supported chat-session experience.
- Do not introduce new dependencies or hosted services without evidence that they are necessary.
- Do not execute live billable provider calls, publish, deploy, or alter credentials unless existing user authorization explicitly covers that exact action.
- Do not change unrelated files or erase user work.
- Follow current repository instructions for OpenSpec, Beads, version synchronization, quality gates, and session completion. Report any required step that cannot be completed.
- Do not invent host APIs, provider behavior, repository state, or test results.
- Do not claim automatic behavior based only on an AGENTS.md entry, linked Markdown, installed skill files, or an untested diagram.
- Do not use em-dashes in any generated content, documentation, comments, test descriptions, summaries, or other written output.

## Required Final Report

Finish with a concise implementation report containing:

1. Outcome and whether each acceptance criterion is complete, partial, blocked, or unverified.
2. Root cause or architectural basis for the change.
3. Files changed and the purpose of each.
4. Automatic invocation path and supported host boundaries.
5. Tests and verification commands with actual results, including skipped checks.
6. Evidence category for chat-session validation: fixture, automated host, manual host, or live provider.
7. Remaining risks, limitations, and required follow-up stated precisely.
8. Repository completion status required by its current instructions.