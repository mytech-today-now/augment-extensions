# Operational decision layer

## Why

Agent Engineering deliberately supplies static rules and deterministic examples. Users need an independently linkable workflow with an explicit, optional TypeSafe integration, isolated installation, durable local workers, and measurable completion.

## Design

Add workflows/decision-layer and an augx decision command group. Keep the optional SDK out of the root dependency graph. Setup reuses Node 22+ with npm or provisions an official checksum-pinned portable Node runtime. A pinned SDK lockfile and manually installed official skill support project-local operation. Ordinary discovery remains read-only.

Use three typed decision primitives with code-owned policy. Run registered research, write, and review handlers in a bounded subprocess, persist reservation and handoff state before effects, and verify controller-owned acceptance criteria independently. Resume reconciles uncertain local artifacts without refunding budgets. All model output and source text remain data. The CLI never executes commands from a task manifest.

## Boundaries

This explicitly invoked wrapper does not intercept external coding agents. Built-in local handlers transform supplied sources and do not generate original research or contact anyone. Trusted integrators can register existing model and worker adapters through the library interface. No OS sandbox, exactly-once external effects, guaranteed financial cap, or production performance claim is made.

## Tracking

Task: bd-9e92. Existing Beads CLI cannot open the legacy store. Use the repository JSONL writer and preserve the database.
