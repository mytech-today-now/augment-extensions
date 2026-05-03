/*
WHAT: Quantum circuit and gate sequence naming conventions in Q#.
HOW: Circuit variables use camelCase with "Circuit" suffix (e.g., bellCircuit); gate sequences use camelCase plural (e.g., gateSequence).
WHEN: Building, composing, or applying sequences of gates or sub-circuits.
WHERE: Variable declarations for ApplyUnitary or custom circuit types.
WHY: Modern quantum programming treats circuits as first-class; descriptive naming clarifies composition order and prevents errors in layered algorithms.
*/

// GOOD: camelCase for circuit variables
namespace AugmentExtensions.Quantum.NamingStandards.Circuits {

    open Microsoft.Quantum.Canon;

    operation BuildAndApplyCircuit() : Unit {
        // GOOD: camelCase circuit variable
        let bellCircuit = [H, CNOT];  // Gate sequence

        // GOOD: camelCase gate sequence
        let gateSequence = [X, Y, Z];

        // BAD example (commented): let BellCircuit = ...
        // Violates: PascalCase
    }
}