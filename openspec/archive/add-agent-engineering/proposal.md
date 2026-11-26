# Agent Engineering Workflow

## Why

Source inspection found no canonical agent-engineering module. Existing MCP and cross-platform modules cover tool integration and distribution, but not protected verification, bounded repair, or durable graph execution. The module loader discovers workflow directories recursively; npm's explicit files allowlist currently omits a new workflow unless it is added.

## What Changes

- Add `workflows/agent-engineering` with indexed static guidance, JSON contracts, and a small local reference using deterministic child processes and the existing Ajv dependency.
- Demonstrate protected verification, shared finite budgets, resume compatibility, ownership, four graph shapes, local idempotent effects, and controlled improvement replay.
- Add behavior tests in the existing Vitest harness and exercise the compiled CLI in disposable consumers.
- Add the module to npm packaging and maintained discovery catalogs. No new CLI commands, dependencies, provider adapters, or workspace release version change.

## Compatibility and Assumptions

The maintained loader requires `type: workflows` and an array of dependencies, despite older manifests using singular workflow and objects. Character count includes every module file, including its own manifest. Keep runnable fixtures outside rules because exports aggregate rules only. Use CommonJS and Node >=16 APIs; only installed runtimes count as runtime evidence. `VERSIONING.md` and version sync scripts are absent, so preserve root VERSION 3.2.0 and give the new module version 1.0.0.

Direct X reads returned 403 on 2026-11-26; FXTwitter reproduced all four articles, including embedded code. Their concepts inform original guidance, with no adopted benchmark or vendor capability claims.

## Review Before Implementation

Reviewed against the request and current source: favor one deterministic local task over a general orchestration service; isolate writable candidates from the verifier; bind evidence to candidate, policy, and revision; reject incompatible resume; use one controller writer and argument arrays. Graph execution is deliberately sequential, including fan-out, so native subagents are optional. The host example is not a security sandbox. External effects are unavailable. These decisions fit the authorized implementation request without an additional approval gate.

## Tracking and Constraints

Installed bd 1.3.1 refuses the legacy 0.60.0 Dolt workspace. Preserve the database and append task events to the existing JSONL convention; synchronization remains tracked by the existing compatibility issue. The pre-existing .augment character count is 218,378, already beyond its local target; do not delete unrelated coordination/history to meet that target.

## Acceptance

See [spec delta](specs/agent-engineering/spec.md) and the requirement/risk matrix in the final implementation report. All execution is local fixture evidence. Provider behavior and OS sandbox enforcement remain outside the reference's claims.
