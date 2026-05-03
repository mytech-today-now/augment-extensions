# Q# AI Prompter Rules

You are generating, reviewing, or refactoring Q# code for the Quantum Development Kit (QDK 1.0+) and Azure Quantum. Apply every rule below. Treat qubits, gates, and circuit depth as scarce, expensive resources.

## Role and Output Contract

- Default to library-first solutions using `Microsoft.Quantum.Intrinsic`, `Canon`, `Preparation`, `Diagnostics`, `ResourceEstimation`, and `Convert`. Implement custom gates only when no library primitive fits.
- Every public `operation`/`function` MUST carry `///` doc comments with `# Summary`, `# Input`, `# Output`, and a `# Remarks` block stating qubit state assumptions (e.g., "expects |0> input") and resource implications.
- Never violate the no-cloning theorem. Never assume a qubit can be copied; use entanglement or teleportation patterns explicitly.
- Prefer correctness, then resource economy, then readability. Reject solutions that submit un-estimated circuits to hardware.

## Naming

| Element | Convention | Example |
|---|---|---|
| Namespaces | PascalCase, hierarchical | `Augment.Quantum.Algorithms.Grover` |
| Operations / Functions | PascalCase, verb-led | `PrepareBellState`, `ApplyOracle`, `MeasureAllZ` |
| Qubits / Registers | camelCase, descriptive | `targetQubit`, `dataRegister` |
| Variables / Parameters | camelCase | `inputAngle`, `nIterations` |
| Constants | UPPER_SNAKE_CASE | `PI_OVER_4` |
| User-Defined Types | PascalCase | `QuantumRegister` |
| Files | kebab-case `.qs` | `bell-state.qs`, `oracle-utils.qs` |

Prefix reusable Augment quantum modules with `AugmentQuantum`. Avoid single-letter names outside tight loop indices.

## Formatting

- 4-space indent, no tabs. Target line length <= 100. Brace on same line as declaration.
- Single space after `operation`, `function`, `let`, `mutable`, `use`, `borrow`. Spaces around operators.
- Group `open` statements: `Microsoft.Quantum.*` first, then project namespaces.
- Use `within { ... } apply { ... }` for automatic uncomputation.
- Visually align gate sequences in circuits.

## Operations vs. Functions

- `function`: deterministic, side-effect-free classical logic only.
- `operation`: anything touching qubits, gates, measurement, or randomness.
- Declare `is Adj + Ctl` whenever semantically valid. Missing functors blocks circuit optimization and is a defect.

## Qubit Management

- Allocate with `use` (fresh) or `borrow` (clean borrowed). Never extend qubit lifetime beyond its tight scope.
- `Reset` qubits before scope exit when they may be non-zero, especially on hardware targets.
- Prefer `within/apply` over manual adjoint inversion.
- Never hold qubits across host-language boundaries.

## Hybrid Classical-Quantum

- Do classical pre/post-processing in the host (Python via IQ#, C# via QDK libs). Keep `operation` bodies quantum-dense.
- Expose entry points with `@EntryPoint()` for Azure Quantum job submission.
- Bridge types via `Microsoft.Quantum.Convert`.
- Wrap quantum failures in host-language exceptions; never silently retry on hardware.

## Error Handling

- Use `fail "message"` for unrecoverable conditions (invalid qubit count, violated state assumption).
- Branch on `Result` (`Zero`/`One`) explicitly; convert with `ResultAsBool` when needed.
- Use `Microsoft.Quantum.Diagnostics` (`AssertQubit`, `AssertAllZero`, `DumpMachine`, `DumpRegister`) during development; gate them out for hardware runs.
- Validate classical inputs before allocating qubits.

```qsharp
if (nQubits < 2) {
    fail "Grover search requires at least 2 qubits.";
}
```

## Performance and Resource Estimation

- Run the QDK `ResourcesEstimator` or Azure Quantum Resource Estimator before any hardware submission. Report qubit count, T-count, gate count, and depth.
- Minimize two-qubit gates; prefer hardware-native gates of the target provider.
- Reuse qubits via `Reset` and `borrow`. Offload classical loops to the host.
- Choose simulators by scale: full-state (<= 20 qubits), Toffoli/sparse (larger), resource estimator (scaling studies).
- Apply provider-appropriate error mitigation; document the choice.

## Security and Quantum Hygiene

- No-cloning compliance is mandatory. No state duplication shortcuts.
- For QKD or QRNG, follow standard protocols and document measurement bases.
- Sanitize and, where appropriate, encrypt parameters and results crossing the host/Q# boundary, especially for Azure Quantum jobs.
- Use authenticated Azure Quantum workspaces; never log raw job outputs that could leak superposition-derived data.
- Pair Q# components with post-quantum-resistant classical algorithms.

## Canonical Examples

```qsharp
/// # Summary
/// Prepares a Bell pair (|00> + |11>)/sqrt(2) on two qubits.
/// # Input
/// q1, q2 : Qubits assumed in |0> state.
operation PrepareBellState(q1 : Qubit, q2 : Qubit) : Unit is Adj + Ctl {
    H(q1);
    CNOT(q1, q2);
}
```

```qsharp
@EntryPoint()
operation RunGroverSearch(nQubits : Int, markedItem : Int) : Result[] {
    use qubits = Qubit[nQubits];
    // Grover iteration via Microsoft.Quantum.* library ops
    return MeasureEachZ(qubits);
}
```

## Anti-Patterns (Reject in Review)

- Long-lived qubits outside tight `use`/`borrow` scopes; missing `Reset`.
- `operation` declared without `is Adj + Ctl` when it qualifies.
- Heavy classical loops or arithmetic inside `operation` bodies.
- Magic numbers for qubit counts, angles, or iteration counts.
- Submitting circuits to hardware without resource estimation.
- Re-implementing standard gates or oracles instead of using libraries.
- Missing or incomplete `///` docs on public callables.

## When Asked to Generate Q#

1. Confirm the target (simulator vs. provider) and qubit budget. If unstated, assume full-state simulator and note assumptions.
2. Sketch the circuit at the operation level, choosing library primitives.
3. Implement with `is Adj + Ctl` where valid and `within/apply` for uncomputation.
4. Add `///` docs, input validation, and resource-estimation guidance.
5. Provide a brief host-language invocation snippet only if requested.

## Augment Extensions Integration

- Link with `augx link coding-standards/q`.
- Combine with `coding-standards/python` (IQ# host) or `coding-standards/c` style modules for full-stack hybrid solutions.
- When prompting Augment Code AI, cite this file: "Follow Q# AI Prompter Rules for qubit scoping, functors, and resource estimation."
