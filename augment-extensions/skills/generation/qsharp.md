**Analysis Summary**  
The SKILL template (from code-analysis.md and add-mcp-skill.md) uses YAML frontmatter with keys: `id`, `name`, `version`, `category`, `tags`, `tokenBudget`, `priority`, `dependencies`, `cliCommand` (plus optional mcpServer/replaces). The Markdown body starts with `# Skill Name`, followed by `## Purpose`, `## Usage` (or `## Workflow`), `## Examples` (with code blocks and results), `## CLI` (syntax, options, examples), and `## Notes` (features, limitations, best practices). Files use kebab-case in category subdirs; tone is professional, concise, actionable with realistic examples and CLI focus.

**Recommended Filename & Path**  
`qsharp.md` in `/skills/generation/` (language-specific code generation/integration skill, consistent with generation/analysis patterns).

**SKILL File Content**
```markdown
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

Provide comprehensive guidance for writing, structuring, and optimizing Q# programs — Microsoft's domain-specific language for quantum algorithms. Focus on hardware-agnostic quantum-classical interoperability, qubit management, standard library usage, Azure Quantum integration, resource estimation, and best practices for simulation and hardware execution.

## Usage

1. **Project Setup**: Use the Quantum Development Kit (QDK) with VS Code, Jupyter, or Azure Quantum portal.
2. **Structure Programs**: Define namespaces, operations/functions, entry points (`@EntryPoint()` or `Main()`).
3. **Manage Qubits**: Allocate with `use`/`borrow`, apply gates, measure, and always reset before release.
4. **Interoperate**: Combine quantum operations with classical logic, loops, and conditionals.
5. **Test & Deploy**: Simulate locally, estimate resources, then run on Azure Quantum hardware targets.
6. **Follow Physics**: Respect no-cloning, measurement collapse, and qubit reset rules.

**Core Constructs**:
- **Operations**: Mutable quantum subroutines (e.g., `operation MyOp(...) : Result`).
- **Functions**: Pure classical subroutines (e.g., `function MyFunc(...) : Int`).
- **Types**: `Qubit`, `Result` (`Zero`/`One`), `Pauli` (`I`/`X`/`Y`/`Z`), arrays, tuples, user-defined.
- **Intrinsics**: `H`, `X`, `CNOT`, `M`, `MResetZ`, etc. from `Std.Intrinsic`.

## Examples

### Example 1: Basic Superposition & Measurement

```qsharp
namespace SuperpositionExample {
    @EntryPoint()
    operation MeasureSuperposition() : Result {
        use q = Qubit();           // Allocate in |0⟩
        H(q);                      // Create superposition
        let result = MResetZ(q);   // Measure + reset in one step
        return result;
    }
}
Expected Output (simulation): Zero or One with ~50% probability each.
Example 2: Bell State Entanglement
qsharpimport Std.Intrinsic.*;
import Std.Measurement.*;

operation BellState() : (Result, Result) {
    use (q1, q2) = (Qubit(), Qubit());
    H(q1);
    CNOT(q1, q2);              // Entangle
    let r1 = MResetZ(q1);
    let r2 = MResetZ(q2);
    return (r1, r2);
}
Result: Measurements always agree (00 or 11).
Example 3: Quantum Teleportation (Simplified)
qsharpoperation Teleport(msg : Qubit, target : Qubit) : Unit {
    use bell = Qubit();
    H(bell);
    CNOT(bell, target);
    // ... (classical communication and corrections omitted for brevity)
    Reset(bell);
}
Example 4: Resource Estimation & Classical Integration
qsharpfunction Factorial(n : Int) : Int {
    // Classical helper
    return n <= 1 ? 1 | n * Factorial(n - 1);
}

operation GroverSearch() : Unit {
    // Quantum search algorithm skeleton with classical pre/post-processing
    Message($"Classical prep: Factorial(5) = {Factorial(5)}");
    // ... apply Grover iterations ...
}
CLI
Command Syntax
Bashaugx-qsharp [command] [options]
Commands & Options

generate — Scaffold new operation/namespace.
simulate — Run locally with simulator.
estimate — Resource estimation (qubits, depth, gates).
validate — Check syntax, qubit resets, best practices.
--file <path> — Target .qs file.
--target <sim|azure|ionq|quantinuum> — Execution target.
--shots <n> — Number of simulation runs.
--namespace <name> — Filter by namespace.
--format <text|json|markdown> — Output format.

Examples
Bash# Generate skeleton
augx-qsharp generate --name BellPair --type operation

# Simulate
augx-qsharp simulate --file BellState.qs --shots 1000

# Resource estimate
augx-qsharp estimate --file Grover.qs --target azure

# Validate codebase
augx-qsharp validate --dir ./QuantumAlgorithms
Notes
Best Practices:

Always reset qubits (Reset/MResetZ) before release.
Prefer MResetZ/MResetX for combined measure+reset.
Use import Std.* for readability; qualify when ambiguous.
Separate classical logic into functions; quantum into operations.
Leverage Azure Quantum for hardware execution and resource estimation.
Test extensively with simulators before hardware runs.
Document adjoint/controlled specializations where applicable (is Adj + Ctl).

Common Anti-Patterns:

Forgetting qubit resets (runtime errors on hardware).
Direct qubit state access (impossible by design).
Over-allocating qubits without reuse.
Mixing heavy classical computation inside operations.

Ecosystem:

QDK: VS Code extension, Python interop via qsharp package.
Azure Quantum: Cloud targets, job submission, hybrid algorithms.
Libraries: Microsoft.Quantum.* for chemistry, numerics, machine learning.
Debugging: Use DumpMachine(), Message(), and simulators with tracing.

Performance & Limitations:

Simulations scale to ~30-40 qubits on classical hardware.
Real hardware: Limited qubits, noise, and coherence times.
Resource estimation is essential for feasibility checks.

This skill enables Augment Code AI to generate production-ready, idiomatic Q# code for quantum algorithms, hybrid applications, and Azure Quantum workflows.