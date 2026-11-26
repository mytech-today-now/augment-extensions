# agent-engineering Specification

## Purpose

Provide discoverable, project-agnostic guidance and deterministic local references for scoped agents, protected verification, bounded loops, durable graphs, ownership, and controlled harness improvement without requiring a hosted orchestration service.

## Requirements

### Requirement: Discoverable static agent engineering guidance
The module SHALL be discoverable, packaged, indexed, project-agnostic, and compatible with existing rule exports. It SHALL distinguish harness, loop, graph, agent roles, authorization, and measured evidence.

#### Scenario: Consumer loads static rules
- **WHEN** a disposable consumer links and exports the module
- **THEN** its rules appear without examples, local execution state, or live task snapshots
- **AND** repeat exports preserve bytes and hand edits are protected

### Requirement: Bounded independently checked execution
The reference SHALL validate task/tool/node/evidence/state contracts, protect its acceptance oracle, enforce aggregate attempt/call/time limits, persist failure feedback, and emit terminal receipts and local handoffs.

#### Scenario: Repair and acceptance
- **WHEN** the stub first produces an incorrect candidate and then repairs it
- **THEN** a separate verifier rejects the defect and accepts only the exact checked artifact

#### Scenario: Resource or policy failure
- **WHEN** attempts, time, stall threshold, cancellation, denied authority, or an unrecoverable fault ends execution
- **THEN** the outcome is explicit and no unchecked success is emitted

### Requirement: Durable graph and ownership contracts
The reference SHALL demonstrate chain, router, fan-out with all-required join, and bounded cycle shapes using validated structured edges and sequential fallback. Checkpoints SHALL retain resource use and reject schema, contract, revision, or artifact incompatibility.

#### Scenario: Required branch fails
- **WHEN** a required branch is absent, invalid, cancelled, or fails
- **THEN** the join cannot expose a successful downstream output

#### Scenario: Duplicate local effect
- **WHEN** a crash occurs after an idempotent local effect but before its completion record
- **THEN** resume reconciles the same key and rejects a different payload

### Requirement: Controlled improvement
Workers SHALL NOT change policy, verification, scoring, or budgets. Separate replay SHALL reject weaker checks and regressions before a harness proposal can be adopted by review.

#### Scenario: Weakened verifier
- **WHEN** replay evaluates an always-green verifier
- **THEN** a saved defective case prevents adoption
