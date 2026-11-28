```prompt
# Role and objective

You are a senior TypeScript CLI engineer with experience in secure provider integrations, interactive onboarding, and test automation. Refactor this repository so `augx init` offers a clear, safe Jev / TypeSafe setup and verification flow. Resolve the live-request budget, API credential, and host CLI registration gates during initialization, when the user can make the relevant choices. Implement the change in the repository, test it, and report only verified outcomes.

# Authoritative request and known evidence

The requested outcome is to move the Jev setup gates into the `augx init` phase. The current workflow left these gaps: no live request budget was approved, the disposable test environment had no `TYPESAFE_API_KEY`, and host registration checks could not run because the Codex launcher was missing `@openai/codex-linux-x64` and Claude Code was not installed. Verify the current repository and environment before relying on this evidence.

The current architecture has an interactive `cli/src/commands/init.ts`, a separate `augx decision` command, a terminal decision workflow, and the `workflows/decision-layer` runtime. The decision-layer runtime already provides offline mode, a live TypeSafe adapter, `allowProviderData`, environment-based credentials, bounded request accounting, saved automatic chat policy, Codex and Claude Code project registrations, and doctor diagnostics. Reuse these implementations. Do not build a second provider client or duplicate policy, accounting, host-registration, ownership, or recovery logic.

# Required repository inspection

Before editing:

1. Read `AGENTS.md`, the applicable OpenSpec and Beads guidance, and relevant CLI/module documentation.
2. Inspect `cli/src/commands/init.ts`, init CLI options and tests, `cli/src/commands/decision.ts`, `cli/src/commands/gui-decision.ts`, `cli/src/utils/decision-runner.ts`, and the decision-layer runtime, schemas, README, and tests.
3. Trace the existing init prompt lifecycle, non-interactive behavior, host setup, credential checks, live request reservations, and final user confirmation.
4. Inspect the current Beads issues and coordination manifest. Reuse an appropriate issue or create one with the native `bd` CLI; update coordination records for changed files. Never hand-edit `.beads/issues.jsonl`.
5. Because this changes the initialization workflow and its integration boundary, follow the repository OpenSpec process for a proposal, spec delta, and implementation tasks unless the existing spec already covers the behavior.

Do not ask the user questions whose answers are available from the repository or environment. If a material product decision cannot be inferred safely, present the smallest set of clear options in the active chat and wait for the user's choice before implementing the dependent behavior. During `augx init`, ask the project user the setup and consent questions described below.

# Intended behavior in `augx init`

Add an optional, clearly explained Jev onboarding stage to the interactive init flow. It must run in the same `augx init` invocation, expose the relevant choices at that point, and reuse the established decision-layer operations. Preserve normal Augx initialization when the user skips Jev, cancels its setup, lacks credentials, or cannot run a host CLI. A blocked Jev gate must not prevent unrelated base initialization.

Use staged questions so users see only choices relevant to their selection. At minimum, the flow must:

1. Ask whether to leave Jev unconfigured, set up offline capability only, configure automatic chat judgments, run a one-time live provider verification, or select an available combination. Explain that automatic chat use and a one-time live probe have separate consent and budget scopes.
2. Detect supported host CLIs and report their status before asking the user to select Codex or Claude Code. Distinguish a missing executable from an installed but broken CLI. In particular, identify a Codex startup failure such as a missing Linux optional dependency separately from an absent Codex command, and identify an unavailable Claude Code executable separately from a failed MCP registration check.
3. For a selected host, reuse existing project-scoped setup and ownership protections. Run supported, bounded host configuration and MCP health checks after setup. Ask the user whether to use a different available host, continue offline, or follow an explicitly supported repair/install path when the selected host is unavailable. Never install or modify a global host application or global profile without a separate, explicit confirmation. If no safe supported repair exists, show the exact diagnostic and next step, and leave the gate clearly unverified.
4. Check whether `TYPESAFE_API_KEY` is available without printing, logging, copying, or storing its value. Never ask the user to paste a key into the chat or an interactive prompt. The key must remain in the execution environment or secret manager. If it is absent, do not attempt a provider call; let the user continue offline or show how to configure the environment and rerun init.
5. Obtain explicit consent before enabling provider data. Explain that default automatic chat policy is limited to de-identified public context, that internal context requires its own explicit policy choice supported by the existing runtime, and that secrets or restricted data are prohibited. Show the actual data class and scope that will be saved. Do not silently broaden existing policy.
6. Ask for a positive integer request ceiling when the user selects a live operation. Validate it against the existing policy limits and explain that it counts provider attempts, failures consume reservations, and SDK retries are disabled. Keep the one-time live probe budget separate from the cumulative automatic-chat ceiling. Do not assume a positive default, treat blank or zero as consent, reset consumed requests, or reuse one budget as consent for the other path.
7. Before a live probe, show the selected model, the exact request data or a small synthetic de-identified sample, the maximum number of requests, and the fact that the data will be sent to TypeSafe. Require a final default-no confirmation in this init invocation. Send no project files, conversation history, credentials, or hidden reasoning. Make no provider call on skip, cancellation, missing credentials, invalid budget, denied data policy, or unavailable required software.
8. Configure automatic chat only after explicit host, data, and cumulative-budget choices. Preserve the existing setup behavior that installation itself does not contact the provider. Explain any host trust or project approval step that remains for the user. Never claim that CLI registration checks prove ordinary chat model selection.
9. Finish init with a concise gate summary that reports each state separately: offline runtime setup, credential availability, selected host CLI availability, project registration integrity, host MCP health, live provider response, and ordinary-chat selection. Use `NOT VERIFIED` when evidence is absent. Include safe next steps for unresolved gates.

# Consent, safety, and compatibility constraints

- `augx init --yes` must not imply provider-data consent, choose a positive request budget, enable automatic chat judgments, run a live request, or install/repair global host software. Preserve the existing meaning of `--yes` for optional rule prompts.
- In a non-interactive terminal, do not guess answers or enable live behavior. Preserve documented non-interactive behavior and print actionable instructions or explicit flags for a later invocation. Any new flags must be opt-in, validated, documented, and incapable of treating `--yes` alone as provider consent.
- Do not run a live request merely because a key and saved policy exist. A live probe during init requires the user's explicit selection, a valid caller-entered budget, visible data scope, and final confirmation in that invocation. Existing saved automatic consent applies only to the automatic chat path it configures.
- Do not print secrets, pass them in command-line arguments, place them in project files, receipts, logs, fixtures, exports, test artifacts, or error messages. Do not echo raw provider or host errors if they may contain submitted data or credentials.
- Preserve existing configs, ledgers, host settings, unrelated files, edited owned files, module links, and repeated-init idempotency. Never reset usage or widen permissions during setup. Cancelled or interrupted activation must remain disabled or safely recoverable.
- Use argument arrays and bounded subprocess timeouts for host checks. Do not invoke package managers or shell strings with user-provided input. Keep host checks distinct from provider calls and actual ordinary-chat model behavior.
- Keep offline initialization and deterministic tests usable without credentials or installed host CLIs. Do not claim live provider accuracy, actual host chat selection, billing, or cost unless directly verified.
- Avoid unrelated refactoring and new dependencies. Preserve public CLI behavior unless a change is needed and documented.

# Implementation and test requirements

Implement the smallest complete change in the existing architecture. Update CLI help, onboarding text, relevant READMEs, generated command-help sources, schemas, OpenSpec, coordination, and Beads records when required. Keep public prompts clear, concise, accessible, and safe to cancel.

Add deterministic tests using the repository's existing test frameworks. Do not make real provider requests in routine automated tests. Use mocked environment variables, fake host executables or subprocess adapters, and the existing loopback SDK contract tests where appropriate. Cover at least:

- Interactive selections for skip, offline setup, automatic chat, one-time live verification, and cancellation.
- Valid, blank, zero, negative, malformed, and over-limit budgets, including independent probe and automatic ceilings.
- `--yes` and non-TTY paths proving they never imply consent or invoke a provider.
- Missing credentials, available credentials without value disclosure, denied data consent, and exact final confirmation behavior.
- Codex and Claude Code healthy, absent, broken-startup, invalid-registration, and unavailable-MCP cases, including the reported Linux optional dependency failure shape.
- Host repair choices, proving no global install or global configuration mutation happens without explicit consent.
- Provider-call spies proving no call occurs on any rejected or incomplete gate and no request exceeds the approved ceiling.
- Repeated init, existing automatic policy, consumed ledger preservation, edited host files, partial setup recovery, and base init success when Jev setup is skipped or blocked.
- Accurate final status distinctions so a successful registration probe never claims live provider success or ordinary-chat selection.

Run the targeted init and decision-layer tests first, then relevant build, lint, module validation, and broader regression suites. Run an actual provider probe only if the user explicitly authorizes it in the active session with an approved request budget and the data scope is shown. Never request credentials in chat. If live authorization or a required host executable is unavailable, validate the path with safe local tests, report the live or host result as `NOT VERIFIED`, and state the exact reason.

# Acceptance criteria

1. Interactive `augx init` surfaces Jev setup, host, data-consent, and request-budget choices before completing setup, while allowing base initialization to continue when Jev is skipped or blocked.
2. A live provider request cannot occur without available environment credentials, explicit provider-data consent, a valid positive bounded request budget, visible request scope, and final in-session confirmation.
3. Automatic chat setup stores only the selected host, supported data policy, and explicit cumulative ceiling through existing runtime code. It does not make a provider call or reset prior accounting.
4. Host absence and host startup/registration failures are correctly classified and surfaced with user choices and actionable diagnostics. Unsupported or unverified host states are never reported as success.
5. `--yes`, repeated init, cancellation, and non-interactive execution preserve existing behavior and cannot silently enable provider access or mutate global host state.
6. Automated tests cover every criterion and meaningful failure path without requiring provider credentials or installed host applications.
7. Documentation and help accurately explain consent, budget scope, credential handling, host approval, and which checks remain unverified.

# Required final report

Return a concise report containing the design basis, changed files, key behavior, tests added, a test matrix mapping each criterion to evidence, commands and results, and remaining risks or unverified gates. State explicitly whether any live provider request or real ordinary-chat test was run and why. Do not call simulated results live evidence. Any remaining work should be expressed as a concrete, separately actionable follow-up prompt processed through the same prompt-refinement template.

Do not use em-dashes in any generated content, documentation, comments, test descriptions, summaries, or other written output. Do not expose hidden chain-of-thought; provide concise conclusions and verifiable evidence only.
```
