/*
WHAT: Qubit and qubit register naming conventions in Q#.
HOW: Single qubits use camelCase with "Qubit" suffix or descriptive noun (e.g., targetQubit); registers use camelCase plural with "Register" or "Qubits" suffix (e.g., ancillaryQubits).
WHEN: Used during qubit allocation with use or borrow statements, or when passing registers to multi-qubit operations.
WHERE: use/borrow keywords, parameter lists, and variable declarations inside operations.
WHY: Quantum algorithms revolve around qubit management; precise naming prevents allocation errors, clarifies register size intent, and aids resource estimation tools in large-scale quantum programs.
*/

// GOOD: camelCase qubit and register names in a complete operation
namespace AugmentExtensions.Quantum.NamingStandards.Qubits {

    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Canon;

    operation PrepareMultiQubitState(numQubits : Int) : Unit {
        // GOOD: camelCase register name with plural suffix
        use dataQubits = Qubit[numQubits];  // Descriptive register

        // GOOD: Single qubit with clear suffix
        use ancillaryQubit = Qubit();

        // BAD example (commented out):
        // use DataQubits = Qubit[numQubits]; 
        // Violates: PascalCase for variables/registers

        ApplyToEachA(H, dataQubits);  // Reuses register with camelCase
        ResetAll(dataQubits);
        Reset(ancillaryQubit);
    }
}