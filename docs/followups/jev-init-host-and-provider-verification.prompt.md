# Verify Jev host selection and provider gates with real evidence

You are a senior TypeScript integration and reliability engineer working in the Augment Extensions repository.

## Objective

Verify the real host and provider gates that remain after the staged Jev onboarding implementation. Establish whether a supported host can load the project registration and select the Jev judgment tool during an ordinary chat. Verify a live TypeSafe response only when the active user has explicitly authorized a positive request budget and synthetic data scope. Report evidence by category. Do not describe fixtures, loopback responses, registration checks, or simulated host output as real provider or ordinary-chat evidence.

This follow-up covers existing Beads tasks `bd-in32` and `bd-758d`. Reuse those tasks and the existing implementation. Do not create duplicate tasks or expand into unrelated work.

## Repository and evidence to inspect

1. Read the repository `AGENTS.md`, the decision-layer module guide, the init onboarding code, and the current decision-layer implementation report.
2. Inspect `docs/followups/decision-layer-provider-and-platform-verification.prompt.md`, `docs/reports/decision-chat-2026-11-27.md`, and the status of `bd-in32` and `bd-758d`.
3. Build the checkout-local CLI before using it. Prefer `node cli/dist/cli.js` so the tested source checkout is used.
4. Recheck the current host executable and `TYPESAFE_API_KEY` availability. The previous inspection found Codex startup failed because `@openai/codex-linux-x64` was missing, Claude Code was absent, and the key was unavailable. These facts may have changed. Report only current observations.
5. Reuse `augx init`, `augx decision setup`, `augx decision doctor`, and the existing decision-layer runtime. Do not build a separate provider client or registration path.

## Safety and authorization

- Never ask anyone to paste a key into chat or a prompt. Read credentials only from the local execution environment or secret manager. Report only AVAILABLE or MISSING.
- A live provider call requires explicit authorization in the active session, a caller-supplied positive request budget, an approved data scope, an available environment credential, a visible synthetic request, and the final confirmation in the same invocation. If any condition is absent, make no provider call.
- Do not infer authorization from an existing key, saved policy, prior session, `--yes`, or a test fixture. Do not assume a positive default budget.
- Use only a small synthetic public sample for any authorized live check. Send no project files, conversation history, secrets, restricted data, or hidden reasoning. Do not exceed the approved request budget. Treat failed reserved attempts as consumed.
- Do not install or repair a global host CLI, alter global profiles, or change unrelated host settings. Use a disposable trusted project for project registration. Preserve user edits and existing registrations.
- Do not claim billing, accuracy, ordinary-chat selection, or provider success without direct evidence. Redact errors and retain no request data or credentials in logs or artifacts.
- Do not use em-dashes in generated content, documentation, comments, test descriptions, summaries, or other written output.

## Verification steps

### 1. Local checks

Run the focused init and decision-layer tests, build, lint, module validation, and strict OpenSpec validation. Record the exact commands and outcomes. These checks establish local implementation behavior only. They do not establish a real provider response or ordinary-chat tool selection.

### 2. Host availability and project registration

For each host executable that is already installed, record whether it is available, missing, or installed but broken. Keep startup checks bounded and shell-free. Do not echo raw host output that may contain sensitive values. If no host is usable, stop host activation work and record the exact diagnostic and manual next step.

In a disposable trusted project, choose one available host and configure the existing project-scoped automatic policy using public context and a caller-approved cumulative ceiling. Inspect the doctor output for software, configuration, credentials, registration integrity, and local MCP health as separate states. Verify that host trust or project MCP approval is completed by the operator. Do not treat a healthy local MCP check as evidence that ordinary chat selected the tool.

### 3. Ordinary-chat selection

After a supported host is ready and the operator has approved the project, use a normal chat that requests an ambiguous, synthetic public classification or evidence-ranking judgment. Do not name Jev, TypeSafe, or the MCP tool in the user task. Capture direct host evidence that the registered tool was selected, the typed decision response was accepted, and the ordinary task continued. If the host does not select the tool, record that result without substituting a scripted agent fixture. Repeat once with changed synthetic state only if the approved automatic cumulative ceiling allows it. Keep automatic-chat usage separate from any one-time probe budget.

### 4. Live provider probe

Run this step only when the active user explicitly authorizes it and every safety prerequisite above is satisfied. Use the onboarding flow's synthetic sample, show the selected model, destination, exact request data, and approved maximum before the final default-no confirmation. Verify the returned model, typed response, reservation count, and sanitized failure behavior. If the key is absent, the user does not authorize a budget, the host or runtime is unavailable, or confirmation is declined, do not call the provider and report NOT VERIFIED with the reason.

### 5. Follow-up tracking

Update `bd-in32` and `bd-758d` through the native `bd` CLI. Close a task only when its evidence criteria are actually satisfied. Keep unresolved host, live provider, ordinary-chat, platform, or billing checks open with a concrete reason. Update `.augment/coordination.json` for any files changed. Never hand-edit `.beads/issues.jsonl`.

## Acceptance criteria

1. Current host availability and credential availability are reported separately and match direct local observations.
2. Project registration integrity and local MCP health are verified independently in a disposable project, or remain NOT VERIFIED with an exact blocker.
3. Ordinary-chat tool selection is reported only when observed in an actual host conversation. The evidence shows whether typed output was used and the task continued.
4. A live TypeSafe response is reported only after explicit in-session authorization and a request within the caller-approved budget. Otherwise no live call occurs and the result remains NOT VERIFIED.
5. Automatic and one-time probe budgets remain separate, and ledger reservations are not reset.
6. No credential value, project data, hidden reasoning, or unredacted sensitive error is written to logs or artifacts.
7. Existing Beads tasks reflect verified work, and the final report distinguishes real host observations, local protocol checks, loopback SDK tests, simulated tests, live provider results, and unverified claims.

## Required final report

Provide a concise evidence matrix mapping each acceptance criterion to the command or direct observation, result, and verification status. List the host and runtime versions, environment, commands, test results, current Beads status, and exact remaining blockers. Explicitly state whether a live provider call or actual ordinary-chat tool selection was observed. If a check could not be run, say why and leave it NOT VERIFIED. Do not create another follow-up prompt from this prompt.

Refinement provenance: this request was refined once using the [highest-quality prompt refinement template](https://raw.githubusercontent.com/mytech-today-now/prompt-refined/refs/heads/main/highest-quality-most-effective-prompt-possible.md), applying its clarity, scope, safety, acceptance, and evidence requirements. No recursive refinement was performed.
