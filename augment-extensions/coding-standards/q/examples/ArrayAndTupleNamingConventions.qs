/*
WHAT: Array and tuple naming conventions in Q#.
HOW: Arrays use camelCase plural names ending in "s" or "Array" (e.g., measurementResults, qubitArray). Tuples use camelCase descriptive names; when deconstructing, use meaningful variable names. Avoid generic names like "data".
WHEN: For qubit registers, measurement outcomes, or any multi-value classical data returned from callables.
WHERE: In variable declarations, operation parameters, and return types throughout quantum algorithms.
WHY: Arrays and tuples are fundamental to representing qubit registers and measurement statistics in Q#; clear naming prevents off-by-one errors in indexing and makes resource estimation and debugging significantly easier in large-scale quantum programs.
*/

namespace MyTechToday.Quantum.NamingStandards.Collections {

    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Measurement;
    open Microsoft.Quantum.Arrays;

    // Good: camelCase plural array and descriptive tuple
    operation RunMultipleMeasurements(qubitArray : Qubit[], repetitions : Int) : Result[] {
        mutable measurementResults = new Result[0];  // camelCase plural array
        for _ in 1..repetitions {
            let singleShotResult = M(qubitArray[0]);  // Descriptive tuple element name
            set measurementResults += [singleShotResult];
        }
        return measurementResults;
    }

    // Bad example (commented for illustration only):
    // let results = ...;  // Incorrect: vague singular name for array
}