/*
WHAT: Pauli operator and basis state naming conventions in Q#.
HOW: Pauli constants and variables use UPPER_SNAKE_CASE for built-ins (e.g., PAULI_Z) or camelCase when custom (e.g., customPauliX); basis states use camelCase with "Basis" suffix.
WHEN: When specifying Pauli bases for measurements or Pauli strings in Hamiltonians.
WHERE: Parameter lists for Measure, within Pauli arrays, or in custom operator definitions.
WHY: Pauli operators are foundational to quantum error correction and simulation; consistent naming ensures correct basis selection, prevents mixing I/X/Y/Z, and aligns with Q# standard library expectations.
*/

// GOOD: UPPER_SNAKE_CASE for standard Paulis and camelCase for custom
namespace AugmentExtensions.Quantum.NamingStandards.Paulis {

    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Measurement;

    operation PauliBasisMeasurement(targetQubit : Qubit) : Result {
        // GOOD: UPPER_SNAKE_CASE for built-in Pauli constants
        let basisPauli = PAULI_Z;  // Standard library constant

        // GOOD: camelCase custom Pauli variable
        let customPauliX = PauliX;

        return Measure([basisPauli], [targetQubit]);
    }
}