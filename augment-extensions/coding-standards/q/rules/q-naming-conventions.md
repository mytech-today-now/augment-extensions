Q# Naming Conventions
This document defines the authoritative, production-ready naming conventions for Q# within the Augment Extensions ecosystem for Augment Code AI.
These rules are strictly quantum-specific, optimized for qubit management, circuit readability, resource estimation, functor support, simulator compatibility, and Azure Quantum workflows. Every convention is designed for immediate enforcement by AI augmentation tools.
Namespaces
Rule: Namespace names MUST use PascalCase and follow a hierarchical dot-separated structure that reflects logical quantum domains (algorithms, libraries, hardware targets).
Rationale: Q# namespaces organize the entire quantum codebase. Hierarchical PascalCase mirrors Microsoft.Quantum.* libraries, prevents name collisions in large-scale quantum projects, improves IDE navigation, and enables precise circuit export/resource estimation grouping. Flat or lowercase namespaces degrade discoverability and increase cognitive load when reasoning about entangled subsystems.

✅ Good
namespace Augment.Quantum.Algorithms.Grover {
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Canon;

    // Grover search implementation
}
❌ Avoid
namespace grover_search {  // lowercase + snake_case
    // Hard to discover, breaks QDK patterns
}
Edge cases: Reusable Augment modules MUST prefix with AugmentQuantum.. Hardware-specific namespaces follow Augment.Quantum.Hardware.IonQ.

Operations & Functions (Callables)
Rule: Operation and function names MUST be PascalCase and verb-led for operations (Prepare, Apply, Measure, Estimate) or descriptive for functions.
Rationale: Operations define quantum unitary transformations and measurements; clear verb-led names instantly convey circuit intent, simplify functor application (Adj + Ctl), and improve resource estimator output readability. Distinguishing operations from pure functions is critical for hybrid quantum-classical correctness and AI generation accuracy.

✅ Good
operation PrepareBellState(q1 : Qubit, q2 : Qubit) : Unit is Adj + Ctl {
    H(q1);
    CNOT(q1, q2);
}

function CalculatePhaseEstimationPrecision(nQubits : Int) : Double {
    return 1.0 / (2.0 * IntAsDouble(nQubits));
}
❌ Avoid
operation bell(q1 : Qubit, q2 : Qubit) : Unit { // vague, not PascalCase
}
Exceptions: Intrinsic gates (H, X, CNOT, etc.) retain their canonical short names for literature compatibility.

Qubits & Registers
Rule: Qubit and register identifiers MUST use camelCase and be descriptively named (targetQubit, dataRegister, controlQubits).
Rationale: Qubits are scarce, stateful resources. Descriptive names reduce allocation errors in use/borrow blocks, improve simulator debugging, and make resource estimation reports far more interpretable. Poor naming leads to subtle bugs in multi-qubit entanglement circuits.

use targetQubit = Qubit();
use dataRegister = Qubit[5];
use controlQubits = Qubit[3];
Pitfall: Single-letter names outside tight mathematical contexts (e.g., q only in minimal examples).

Variables & Parameters
Rule: All local variables and parameters MUST use camelCase.
Rationale: Q# heavily interleaves classical control with quantum operations. camelCase maintains visual consistency with the language’s type system and improves flow in dense loops, measurement post-processing, and hybrid algorithms.

let inputAngle = 1.57;
let nIterations = 10;
let measurementOutcomes = MeasureAllZ(register);
Constants & Literals
Rule: Constants MUST be UPPER_SNAKE_CASE.
Rationale: Quantum constants frequently represent rotation angles (π/4), tolerance thresholds, or circuit depths. UPPER_SNAKE_CASE clearly separates immutable values from mutable quantum state, aiding maintenance and static analysis tools.

const PI_OVER_4 = 0.7853981633974483;
const MAX_SIMULATOR_QUBITS = 30;
User-Defined Types (UDTs)
Rule: UDT names MUST be PascalCase.
Rationale: UDTs encapsulate complex quantum data (amplitudes, Hamiltonians, measurement results). PascalCase aligns with Q#’s type system and improves type safety in AI-generated code for large quantum simulations.

newtype ComplexAmplitude = (Real : Double, Imag : Double);
newtype QuantumStateVector = (Qubits : Qubit[], Amplitudes : ComplexAmplitude[]);
Files & Modules
Rule: Q# source files (.qs) MUST use kebab-case (e.g., bell-state-preparation.qs).
Rationale: File names directly influence project structure, import clarity, and build tooling in QDK solutions. kebab-case maximizes readability across operating systems and version control.

Attributes
Rule: Custom attributes and built-in attribute usage MUST follow PascalCase conventions (e.g., @EntryPoint()).
Rationale: Attributes control compilation behavior, testing, and entry-point execution. Consistent naming ensures compatibility with the Q# compiler and Azure Quantum deployment pipelines.

@EntryPoint()
operation RunQuantumProgram() : Unit {
    // Main quantum entry point
}
Additional Q#-specific guidance:
• Prefix reusable Augment modules with AugmentQuantum.
• Avoid single-letter names except in standard quantum literature shorthand (q, qs) or tight mathematical loops.
• Names MUST enhance circuit readability for visualizers, resource estimators, and hybrid C#/IQ# hosts.