/*
WHAT: Variable and parameter naming conventions in Q#.
HOW: Use camelCase for all variables, parameters, and locals. Be descriptive (e.g., targetQubit, measurementResult). Constants use PascalCase when declared with 'let' at namespace scope. Avoid single-letter names except for common qubit indices (i, j) in tight loops.
WHEN: For every let, mutable, use, borrow, and parameter declaration.
WHERE: Inside operations/functions for locals and parameters; at namespace level for constants.
WHY: Distinguishes mutable quantum state from classical values, reduces cognitive load when reading hybrid quantum-classical code, prevents shadowing issues, and maintains consistency with QDK library code for faster debugging and resource estimation.
*/

namespace MyTechToday.Quantum.NamingStandards.Variables {

    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Measurement;

    // Good: camelCase parameters and locals with descriptive names
    operation MeasureInPauliBasis(targetQubit : Qubit, basisPauli : Pauli) : Result {
        let measurementResult = Measure([basisPauli], [targetQubit]);  // camelCase local
        Reset(targetQubit);
        return measurementResult;
    }

    // Good: Namespace-level constant uses PascalCase
    let DefaultMeasurementRepetitions = 1000;

    // Bad example (commented for illustration only):
    // operation MeasureInPauliBasis(tq : Qubit, p : Pauli) : Result { ... }  // Incorrect: cryptic single-letter names
}