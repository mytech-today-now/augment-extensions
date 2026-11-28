# decision-layer Specification

## Purpose

Provide an optional operational TypeSafe decision workflow with isolated installation, typed judgments, code-owned policy, durable local worker execution, independent verification, and reproducible evaluation.

## Requirements

### Requirement: Saved-policy chat integration

Setup SHALL optionally register a project-owned native MCP tool and an implicitly discoverable skill for Codex or Claude Code. Eligible ordinary tasks SHALL reach the existing runtime through that tool without a user command. Registration SHALL preserve unrelated settings and edited owned files, report partial activation, support disabling and removal, and keep provider credentials out of files.

#### Scenario: Ordinary classification task
- GIVEN one-time host trust, tool approval and enabled saved public-data policy
- WHEN the agent reaches classification among supplied candidates
- THEN the host invokes the tool and receives validated typed judgments to continue its task.

### Requirement: Bounded automatic judgments

Automatic execution SHALL permit only configured classification and retrieval ranking, reject unknown context fields and prohibited data, reserve cumulatively across turns and processes before requests, suppress duplicate state, bound deadlines without automatic retries, honor cancellation and return explicit fallback outcomes without manufacturing provider answers. Advice SHALL grant no permissions and execute no actions.

#### Scenario: Restart or failure
- GIVEN a reserved request or previously evaluated state
- WHEN a process restarts or a provider fails
- THEN reservations remain consumed, duplicate requests are suppressed and unrelated work can continue using the normal fallback.

### Requirement: Evidence for host automation

Reports SHALL distinguish simulated agent choice, real host registration inspection, manual ordinary-chat execution and live provider execution. Static guidance alone SHALL NOT count as runtime activation evidence.

#### Scenario: No authorized provider check
- WHEN only protocol and host configuration checks are performed
- THEN manual chat selection and live provider behavior remain explicitly unverified.

### Requirement: Optional operational module

The system SHALL discover, link, export static rules, mirror static rules, and package decision-layer independently. Ordinary commands SHALL NOT load or install its SDK.

#### Scenario: Missing optional SDK
- GIVEN a clean Augx installation
- WHEN help, list, show, export, or mirror is requested
- THEN existing behavior succeeds without installing operational software.

### Requirement: Explicit installation and diagnostics

Setup SHALL plan without writes, install pinned verified software in project-owned scope, preserve edits, retain a hashed ownership receipt, recover partial installation, and distinguish software, configuration, credentials, connectivity, and activation. Removal SHALL only remove unchanged owned resources.

#### Scenario: Credentials unavailable
- WHEN setup and offline validation run without a key
- THEN installation can finish and diagnostics report live connectivity as unverified.

### Requirement: Typed decisions and deterministic policy

Choice, Score, and Noul SHALL validate both directions. The eleven article capabilities SHALL share these primitives. Permissions, fresh menus, protected context, budgets, and independent completion checks SHALL remain authoritative over provider confidence.

#### Scenario: Confident prohibited action
- GIVEN deterministic denial
- WHEN a model recommends allow with confidence one
- THEN execution remains denied.

### Requirement: Durable bounded execution

The controller SHALL reserve requests and attempts durably, serialize writers, consume local queues, run available registered workers, verify artifacts outside worker control, and persist terminal or review outcomes. Resume SHALL retain consumed budgets and reject changed task, policy, or stale approval.

#### Scenario: Interrupted worker
- GIVEN an attempt reserved before an interrupted worker
- WHEN resume reconciles the run
- THEN it verifies any candidate effect before retrying and preserves all reservations.

### Requirement: Reproducible evaluation

The system SHALL provide twenty or more labeled cases with held-out cases, matched deterministic baseline execution, provider-aware metric availability, trace evaluation, explicit policy promotion, and a seven-day observation guide without invented results.

#### Scenario: Offline evaluation
- WHEN fixtures are evaluated
- THEN every result identifies fixture provenance and unknown provider cost remains null.

### Requirement: Init-time Jev onboarding
Interactive `augx init` SHALL offer optional Jev setup paths and preserve successful base initialization when Jev is skipped, cancelled, or blocked.

#### Scenario: Skip or cancel Jev setup
- GIVEN a project initialization
- WHEN the user skips or cancels Jev onboarding
- THEN Augx completes unrelated base initialization and makes no provider request

#### Scenario: Non-interactive initialization
- GIVEN `augx init --yes` or a non-interactive terminal
- WHEN initialization reaches Jev onboarding
- THEN it does not infer consent, approve a budget, enable automatic chat, call a provider, or install host software

### Requirement: Automatic chat consent
Automatic chat setup SHALL require an available supported host, an explicit data-class choice, and a positive cumulative request ceiling within the current policy limit.

#### Scenario: Automatic setup preserves accounting
- GIVEN explicit host, data scope, and cumulative ceiling choices
- WHEN automatic setup completes
- THEN it uses existing project-scoped setup and preserves existing request reservations
- AND setup makes no provider request

### Requirement: Internal data consent
Public context SHALL remain the default automatic data scope. Internal context requires its own explicit choice. Secrets and restricted data remain prohibited.

#### Scenario: Internal scope selection
- GIVEN the user selects automatic chat
- WHEN the user chooses `public,internal` and confirms the displayed scope
- THEN automatic policy stores both selected classes
- AND declining confirmation leaves automatic chat disabled

### Requirement: One-time live probe
A live probe SHALL use a positive caller-entered ceiling within policy, separate from the automatic ceiling. Init SHALL show the synthetic request, model, destination, and ceiling before a default-no final confirmation.

#### Scenario: Confirmed synthetic probe
- GIVEN a valid probe ceiling and available credential
- WHEN the user confirms the displayed sample in the same init invocation
- THEN Augx sends only that synthetic sample within the probe ceiling
- AND probe consent does not change saved automatic policy

#### Scenario: Rejected or incomplete live gate
- GIVEN a missing credential, invalid budget, denied consent, cancellation, or failed software check
- WHEN init reaches the live probe gate
- THEN no provider request is made and the live result remains NOT VERIFIED

### Requirement: Credential handling
Provider credentials SHALL be read from the execution environment and SHALL NOT be displayed, persisted, or passed as command-line arguments.

#### Scenario: Missing or available credential
- GIVEN the credential is absent or present in the execution environment
- WHEN init reports credential availability
- THEN it reports only AVAILABLE or MISSING and never prints the value

### Requirement: Host and initialization evidence
Init SHALL report host CLI availability, project registration integrity, and bounded local MCP health as separate states. Ordinary-chat model selection remains NOT VERIFIED without direct evidence.

#### Scenario: Missing or broken host
- GIVEN a host executable is absent or fails startup
- WHEN init reports host status
- THEN it distinguishes MISSING from BROKEN and offers an available host, offline continuation, repair guidance, or cancellation

#### Scenario: Registration and MCP evidence
- GIVEN project registration or local MCP checks run
- WHEN init prints its gate summary
- THEN each result is reported separately and no host check claims ordinary-chat selection
