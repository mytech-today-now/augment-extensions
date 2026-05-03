/*
WHAT: User-defined type (UDT) naming conventions in Q#.
HOW: Use PascalCase for UDT names. Field names inside the UDT also follow PascalCase. Prefer descriptive names that convey quantum meaning (e.g., QuantumState, MeasurementRecord).
WHEN: When grouping related data that needs strong typing beyond tuples, especially for complex quantum return values or classical results.
WHERE: Declared with 'newtype' at namespace scope; used as parameter/return types in operations and functions.
WHY: Provides type safety in hybrid quantum programs, improves code clarity for complex data structures common in quantum algorithms, enables better error checking by the Q# compiler, and supports future-proof extensibility in library development.
*/

namespace MyTechToday.Quantum.NamingStandards.Types {

    // Good: UDT name in PascalCase with PascalCase fields
    newtype MeasurementRecord = (QubitIndex : Int, ResultValue : Result, BasisUsed : Pauli);

    // Good: UDT used in operation signature
    operation RecordMeasurement(record : MeasurementRecord) : Unit {
        let (qubitIndex, resultValue, basisUsed) = record!;  // Unwrap with ! operator
        // Process record...
    }

    // Bad example (commented for illustration only):
    // newtype measurement_record = (i : Int, r : Result);  // Incorrect: lowercase and poor naming
}