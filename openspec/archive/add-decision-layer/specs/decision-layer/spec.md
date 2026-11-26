## ADDED Requirements

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
