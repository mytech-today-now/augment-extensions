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
