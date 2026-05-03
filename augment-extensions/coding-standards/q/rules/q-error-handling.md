Q# Error Handling
Authoritative content lives in q-standards.md. This rule file expands the error-handling principles with complete rationales, production-grade examples, anti-patterns, hardware/simulator distinctions, hybrid-host integration, and AI-generation guardrails required for reliable quantum software.
Why Error Handling Matters in Q#
Quantum programs operate under extreme resource constraints: every qubit allocation consumes scarce physical or simulated hardware, circuit depth directly impacts decoherence, and measurements are destructive and probabilistic. Unhandled or silently ignored failures waste quantum resources, produce misleading results, and can corrupt entangled states across an entire program. Robust error handling enforces early termination on invalid classical inputs, explicit branching on measurement outcomes, and clear separation between development-time diagnostics and production hardware execution. These practices align with the QDK’s library-first philosophy, the no-cloning theorem, and Azure Quantum’s cost model, where unnecessary shots or failed runs incur real monetary and temporal penalties.

1. Validate Classical Inputs Before Any Qubit Allocation
Rule: Perform all classical precondition checks and throw via fail before any use or borrow statement. This prevents unnecessary qubit lifetime extension and avoids allocating resources on hardware targets that will immediately fail.

Rationale: Qubit allocation is the most expensive operation in both simulators (memory) and real devices (calibration time, queue wait). Early validation keeps the quantum kernel pure and minimal, improving resource estimation accuracy and allowing the classical host to handle input sanitization.

Correct Example (standalone operation with full validation)
operation GroverSearch(nQubits: Int, iterations: Int) : Result[] {
    if (nQubits < 2) {
        fail "Grover search requires at least 2 qubits for meaningful oracle superposition.";
    }
    if (iterations < 0) {
        fail $"Number of iterations must be non-negative; received {iterations}.";
    }
    // All classical validation complete before allocation
    use register = Qubit[nQubits];
    // ... oracle and diffusion implementation ...
    return MeasureAllZ(register);
}
Anti-pattern (allocation before validation – rejected by this standard)
operation BadGrover(nQubits: Int) : Result[] {
    use register = Qubit[nQubits];  // Allocation happens unconditionally
    if (nQubits < 2) { fail "..."; }  // Wastes qubits on every call
    // ...
}
Edge case: When the operation is called from a controlled functor or inside a within block, early fail still terminates the entire scope cleanly without leaving qubits in an undefined state.

2. Use fail Exclusively for Unrecoverable Quantum-State or Resource Violations
Rule: Reserve the fail statement for conditions that violate physical invariants, state assumptions, or resource limits that cannot be recovered within the quantum kernel. Never use fail for normal control flow or expected measurement outcomes.

Rationale: fail raises an ExecutionFailException (or equivalent runtime exception) that propagates through the Q# runtime and host language, ensuring the entire quantum program aborts. This is the only mechanism that guarantees deterministic termination across simulators, resource estimators, and hardware targets.

Supported unrecoverable conditions:

Invalid qubit count or register size for a specific algorithm.
Violation of a known state assumption after a unitary (e.g., expected |0⟩ after an inverse operation).
Classical parameters outside hardware-supported ranges (e.g., depth exceeding coherence time estimates).
Post-measurement state that contradicts an assertion required by later operations.
Correct multi-line example (state assumption after uncomputation)
operation PrepareAndUncompute(target: Qubit, ancillary: Qubit) : Unit is Adj + Ctl {
    H(target);
    CNOT(target, ancillary);
    // ... oracle application ...
    Adjoint CNOT(target, ancillary);  // uncompute
    Adjoint H(target);
    // State must now be |00⟩
    if (MResetZ(ancillary) == One) {
        fail "Uncomputation failed: ancillary did not return to |0⟩ state.";
    }
}
Anti-pattern (using return for error signaling – breaks composability)
operation BadErrorSignal(qubits: Qubit[]) : Result {  // Do not do this
    if (Length(qubits) == 0) { return Zero; }  // Ambiguous success/failure
    // ...
}
3. Branch Explicitly on Result Values; Convert Only When Necessary
Rule: Always compare Result values directly with Zero or One. Use Microsoft.Quantum.Convert.ResultAsBool only when interfacing with classical Boolean logic or host-language interop. Never rely on implicit conversion.

Rationale: Result is a distinct Q# type with no implicit Boolean conversion. Explicit branching preserves quantum-specific semantics and makes intent obvious to static analyzers, resource estimators, and AI code reviewers.

Correct patterns
let measurement = M(qubit);
if (measurement == One) {
    X(qubit);  // Corrective Pauli
}
When conversion is justified (hybrid boundary)
open Microsoft.Quantum.Convert;

operation MeasureAndReport(qubit: Qubit) : Bool {
    let result = M(qubit);
    return ResultAsBool(result);  // Explicit, documented conversion for host
}
Anti-pattern (implicit or unsafe comparison)
if (M(qubit)) { ... }  // Compile error in modern Q#
if (M(qubit) == true) { ... }  // Type mismatch
4. Leverage Microsoft.Quantum.Diagnostics Only During Development
Rule: Use AssertQubit, AssertAllZero, AssertMeasurementProbability, DumpMachine, and DumpRegister freely in development and testing workflows. Explicitly gate or remove these calls before hardware submission or production resource estimation.

Rationale: Diagnostics throw on simulator failure (providing immediate feedback) but are either no-ops or cause undefined behavior on real hardware. Leaving them active inflates circuit depth and can trigger unnecessary queue retries on Azure Quantum.

Development-only wrapper pattern (recommended for reusable libraries)
open Microsoft.Quantum.Diagnostics;

function AssertInDev(reg: Qubit[], expected: Result[]) : Unit {
    #if DEBUG
    AssertAllZero(reg);  // Only compiled in debug builds
    #endif
}
Correct production call site
operation SafeAlgorithm(register: Qubit[]) : Unit {
    // ... core logic ...
    #if DEBUG
    DumpRegister((), register);  // Simulator-only visibility
    #endif
}
Hardware-safe alternative: Replace runtime assertions with classical post-processing in the host after measurement results are returned.

5. Surface Quantum Failures as Host-Language Exceptions in Hybrid Applications
Rule: In Python, C#, or JavaScript host programs, catch Q# fail exceptions and rethrow them as native exceptions. Never implement automatic retry logic inside the quantum kernel or silently swallow failures on real hardware targets.

Rationale: Real hardware shots are expensive and non-deterministic. Silent retries violate the principle of least surprise and can mask calibration drift or coherence loss. The classical host is the proper place for retry policies, exponential back-off, or circuit cutting.

Python host example (using Azure Quantum or IQ#)
from qsharp import AzureQuantum, ExecutionFailException

try:
    result = my_operation.run(...)
except ExecutionFailException as e:
    raise RuntimeError(f"Quantum kernel failed: {e.message}") from e
    # Or implement host-level retry with circuit modification
Prohibited (kernel-level silent retry)
operation BadRetry(target: Qubit) : Unit {
    mutable attempts = 0;
    while (attempts < 3) {
        let res = M(target);
        if (res == One) { attempts += 1; continue; }  // Never do this on hardware
    }
}
Common Pitfalls and Anti-Patterns
Anti-Pattern	Why It Violates This Standard	Correct Alternative
Allocating qubits then checking parameters	Wastes resources on every invocation	Validate before use/borrow
Using return to signal quantum error	Breaks operation composability and functor support	Use fail for unrecoverable cases
Leaving DumpMachine calls in production code	Pollutes logs and adds simulator-only overhead	Gate behind #if DEBUG or remove
Implicit Result → bool conversion attempts	Compile-time or runtime errors	Use ResultAsBool explicitly only at boundaries
Retry loops inside Q# for hardware failures	Ignores decoherence and cost model	Surface to host for intelligent retry
Testing and Debugging Strategies
Unit tests: Use the Q# testing framework with Microsoft.Quantum.Testing and simulator assertions.
Resource estimation: Run Estimate on code with all diagnostics removed to obtain accurate T-count and qubit metrics.
Hardware preview: Submit minimal circuits with validation guards to Azure Quantum’s simulator targets first.
Logging: Use Message from Microsoft.Quantum.Intrinsic for non-fatal classical debug output; reserve fail for termination.
AI Code-Generation Implications
When generating Q# code via Augment Code AI or similar systems:

Every public operation must include at least one classical precondition check before qubit allocation.
All measurement branches must be exhaustive and explicit.
Diagnostics must be annotated with a clear #if DEBUG guard or equivalent comment explaining removal before hardware deployment.
Any generated fail message must be descriptive, include variable values where possible, and reference the exact violated invariant.
Generated hybrid host wrappers must catch and rethrow quantum exceptions without silent recovery.
Adhering to these rules produces auditable, resource-efficient, and production-ready Q# libraries that integrate seamlessly with the broader Augment Extensions ecosystem.
