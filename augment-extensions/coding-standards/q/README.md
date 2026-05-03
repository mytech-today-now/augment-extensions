# Q# Coding Standards

AI prompter rules and coding standards for Q# quantum development with the Quantum Development Kit (QDK) and Azure Quantum.

## Overview

This module ships a single, AI-optimized prompter rules file that Augment Code AI loads when generating, reviewing, or refactoring Q# code. Guidance covers qubit management, functor support, hybrid classical-quantum patterns, resource estimation, and Microsoft.Quantum.* library usage.

## Key Benefits

- **Quantum Correctness**: Operations vs. functions, `Adj + Ctl` functors, qubit scoping rules
- **Resource Awareness**: Resource estimation, gate-count and depth minimization
- **Hybrid Interop**: Classical-quantum separation, `@EntryPoint`, IQ#/C# host patterns
- **Library-First**: `Microsoft.Quantum.Intrinsic`, `Canon`, `Preparation`, `Diagnostics`
- **QDK 1.0+**: Targets modern QDK, Azure Quantum, and current simulators

## Installation

```bash
augx link coding-standards/q
```

Verify with:

```bash
augx list --linked
```

## Contents

### Rules

- **q-standards.md** - Q# AI prompter: naming, formatting, qubit management, functors, error handling, resource estimation, security, anti-patterns
- **naming-conventions.md** - Naming rules (skeleton)
- **qubit-management.md** - `use`/`borrow`, `Reset`, `within/apply`, functors (skeleton)
- **error-handling.md** - `fail`, `Result` branching, diagnostics assertions (skeleton)
- **performance-optimization.md** - Resource estimation, gate-count and depth (skeleton)
- **security.md** - No-cloning, QKD/QRNG, host boundary hygiene (skeleton)
- **testing.md** - Diagnostics assertions, simulators, functor tests (skeleton)

### Examples

- **bell-state.qs** - Skeleton Bell-pair preparation with `@EntryPoint`

## Discovery

```bash
augx show q-standards
augx search "qubit"
augx search "resource estimation"
```

This module is auto-discovered by the `augx` CLI and `augx gui` interface via the standard module loader; no additional configuration is required.
