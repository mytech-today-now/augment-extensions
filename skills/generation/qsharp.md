---
id: qsharp
name: Q# Quantum Programming
version: 1.0.0
category: generation
tags: [qsharp, quantum, microsoft, azure-quantum, qdk, qubits, operations, quantum-computing]
tokenBudget: 3500
priority: medium
dependencies: []
cliCommand: augx-qsharp
---

# Q# Quantum Programming

## Purpose

Provide guidance for writing, structuring, and optimizing Q# programs - Microsoft's domain-specific language for quantum algorithms. Covers hardware-agnostic quantum-classical interoperability, qubit lifecycle management, standard-library usage, Azure Quantum integration, resource estimation, and best practices for both local simulation and physical hardware execution.

## Usage

1. **Project Setup**: Use the Quantum Development Kit (QDK) with VS Code, Jupyter, or the Azure Quantum portal.
2. **Structure Programs**: Define namespaces, operations and functions, and an entry point (`@EntryPoint()` or `Main()`).
3. **Manage Qubits**: Allocate with `use` / `borrow`, apply gates, measure, and always reset before release.
4. **Interoperate**: Combine quantum operations with classical control flow (loops, conditionals, helpers).
5. **Test and Deploy**: Simulate locally, estimate resources, then submit to Azure Quantum hardware targets.
6. **Respect Physics**: Honor the no-cloning theorem, measurement collapse, and qubit-reset requirements.

**Core Constructs**:
- **Operations**: Quantum subroutines (e.g., `operation MyOp(...) : Result`).
- **Functions**: Pure classical subroutines (e.g., `function MyFunc(...) : Int`).
- **Types**: `Qubit`, `Result` (`Zero`/`One`), `Pauli` (`I`/`X`/`Y`/`Z`), arrays, tuples, user-defined types.
- **Intrinsics**: `H`, `X`, `CNOT`, `M`, `MResetZ`, etc. from `Std.Intrinsic`.

## Examples

### Example 1: Basic Superposition and Measurement

```qsharp
namespace SuperpositionExample {
    @EntryPoint()
    operation MeasureSuperposition() : Result {
        use q = Qubit();           // Allocate in |0>
        H(q);                      // Create superposition
        let result = MResetZ(q);   // Measure and reset in one step
        return result;
    }
}
```

**Result** (simulation): `Zero` or `One` with approximately 50% probability each.

### Example 2: Bell State Entanglement

```qsharp
import Std.Intrinsic.*;
import Std.Measurement.*;

operation BellState() : (Result, Result) {
    use (q1, q2) = (Qubit(), Qubit());
    H(q1);
    CNOT(q1, q2);              // Entangle
    let r1 = MResetZ(q1);
    let r2 = MResetZ(q2);
    return (r1, r2);
}
```

**Result**: Measurements always agree (`(Zero, Zero)` or `(One, One)`).

### Example 3: Quantum Teleportation (Skeleton)

```qsharp
operation Teleport(msg : Qubit, target : Qubit) : Unit {
    use bell = Qubit();
    H(bell);
    CNOT(bell, target);
    // ... classical communication and corrections omitted for brevity ...
    Reset(bell);
}
```

### Example 4: Resource Estimation and Classical Integration

```qsharp
function Factorial(n : Int) : Int {
    // Classical helper
    return n <= 1 ? 1 | n * Factorial(n - 1);
}

operation GroverSearch() : Unit {
    // Quantum search skeleton with classical pre/post-processing
    Message($"Classical prep: Factorial(5) = {Factorial(5)}");
    // ... apply Grover iterations ...
}
```

## CLI

### Command Syntax

```bash
augx-qsharp [command] [options]
```

### Options

- `generate` - Scaffold a new operation or namespace.
- `simulate` - Run locally with the built-in simulator.
- `estimate` - Resource estimation (qubits, depth, gate count).
- `validate` - Check syntax, qubit resets, and best practices.
- `--file <path>` - Target `.qs` file.
- `--dir <path>` - Target directory (recursive).
- `--target <sim|azure|ionq|quantinuum>` - Execution target.
- `--shots <n>` - Number of simulation runs.
- `--namespace <name>` - Filter by namespace.
- `--format <text|json|markdown>` - Output format (default: text).

### Examples

```bash
# Generate skeleton
augx-qsharp generate --name BellPair --type operation

# Simulate
augx-qsharp simulate --file BellState.qs --shots 1000

# Resource estimate
augx-qsharp estimate --file Grover.qs --target azure

# Validate codebase
augx-qsharp validate --dir ./QuantumAlgorithms
```

## Notes

**Best Practices**:
- Always reset qubits (`Reset` / `MResetZ`) before release.
- Prefer `MResetZ` / `MResetX` for combined measure-and-reset.
- Use `import Std.*;` for readability; qualify identifiers when ambiguous.
- Separate classical logic into functions; reserve operations for quantum work.
- Leverage Azure Quantum for hardware execution and resource estimation.
- Test extensively with simulators before hardware runs.
- Document `Adj` and `Ctl` specializations where applicable (`is Adj + Ctl`).

**Common Anti-Patterns**:
- Forgetting qubit resets (runtime errors on hardware).
- Attempting direct qubit-state access (impossible by design).
- Over-allocating qubits without reuse.
- Mixing heavy classical computation inside operations.

**Ecosystem**:
- **QDK**: VS Code extension, Python interop via the `qsharp` package.
- **Azure Quantum**: Cloud targets, job submission, hybrid algorithms.
- **Libraries**: `Microsoft.Quantum.*` for chemistry, numerics, and machine learning.
- **Debugging**: `DumpMachine()`, `Message()`, and tracing simulators.

**Performance and Limitations**:
- Local simulation scales to roughly 30-40 qubits on classical hardware.
- Real hardware: limited qubit counts, noise, and finite coherence times.
- Resource estimation is essential for feasibility checks before hardware submission.
