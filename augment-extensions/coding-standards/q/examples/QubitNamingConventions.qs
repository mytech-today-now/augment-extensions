/*
 * What: This example demonstrates Q# naming conventions exclusively for qubits, qubit registers, use/borrow statements, and their integration with operation parameters, local variables, and classical post-processing.
 * How: Naming follows the repository’s observed patterns—PascalCase for operations/functions, camelCase for qubit variables/registers/parameters, descriptive verb-noun structure for callables, and hierarchical namespaces—while interconnecting them in a realistic entangled-state-preparation protocol.
 * When: These conventions should be applied whenever allocating or borrowing qubits, defining qubit-scoped operations, or passing qubit registers in any Q# library or application.
 * Where: They fit naturally within larger Q# projects and libraries (e.g., inside Microsoft.Quantum.Preparation or custom domain modules) as the foundational layer for resource-aware algorithms.
 * Why: Precise qubit naming dramatically improves code readability, prevents accidental reuse errors, enables static analysis tools to enforce resource estimation, and supports collaborative quantum development by making lifetime and ownership immediately obvious to other developers and the QDK compiler.
 */

namespace Augment.Quantum.Examples.Naming.QubitNamingConventions
{
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Canon;
    open Microsoft.Quantum.Measurement;
    open Microsoft.Quantum.Diagnostics;

    /// # Summary
    /// Prepares a Bell pair using explicitly named qubits and demonstrates
    /// every qubit-naming decision with inline rationale.
    operation PrepareNamedBellPair() : Unit
    {
        // The operation name 'PrepareNamedBellPair' uses PascalCase with a clear verb-noun pattern,
        // making its purpose immediately discoverable in IntelliSense and library documentation.
        use controlQubit = Qubit();          // Single qubit variable uses camelCase + descriptive suffix; 'controlQubit' clarifies role in the upcoming CNOT.
        use targetQubit = Qubit();           // Companion qubit follows identical camelCase pattern for visual pairing and self-documenting intent.

        // 'controlQubit' and 'targetQubit' are chosen over generic names (e.g., 'q0') because they convey semantic role,
        // improving maintainability when the circuit grows or is refactored by collaborators.
        H(controlQubit);                     // Intrinsic call site benefits from the descriptive qubit name—readers instantly know which qubit receives the Hadamard.

        CNOT(controlQubit, targetQubit);     // CNOT parameters receive the named qubits; the call itself documents entanglement intent without extra comments.

        // Demonstrates borrow scoping for temporary ancillary use.
        borrow ancillaryQubit = Qubit();     // 'borrow' keyword + camelCase name 'ancillaryQubit' signals temporary, non-owning lifetime.
        X(ancillaryQubit);                   // Short-lived borrow usage; name prevents confusion with owned qubits.

        // Explicit Reset calls reinforce ownership conventions.
        Reset(ancillaryQubit);               // Reset on named borrowed qubit follows the repository’s resource-hygiene pattern.

        // Measure using the named register for classical extraction.
        let measurementResult = M(targetQubit);  // Result variable uses camelCase + semantic name; 'measurementResult' ties directly to the target qubit’s role.
        Reset(controlQubit);
        Reset(targetQubit);
    }

    /// # Summary
    /// Entry point that exercises the named-qubit operation and demonstrates
    /// how qubit naming propagates into classical result handling.
    @EntryPoint()
    operation DemonstrateQubitNaming() : Unit
    {
        PrepareNamedBellPair();              // Callable name is PascalCase and verb-led, consistent with all other examples in the standards module.
    }
}