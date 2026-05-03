/*
 * What: This example demonstrates Q# naming conventions exclusively for measurement results, Result arrays, classical extraction variables, and post-processing counters.
 * How: Result variables and arrays use camelCase with semantic descriptors; functions are PascalCase verb-led; all names interconnect with qubit and operation names to form a cohesive classical readout pipeline.
 * When: Apply these conventions in any measurement-heavy routine, tomography, or variational algorithm where classical data must be extracted and analyzed.
 * Where: They belong inside utility libraries (e.g., Microsoft.Quantum.Measurement extensions) or domain-specific modules that bridge quantum hardware and classical host code.
 * Why: Consistent result naming eliminates ambiguity in large-scale circuits, accelerates debugging of measurement statistics, and enables automated tools to trace data flow from quantum to classical domains.
 */

namespace Augment.Quantum.Examples.Naming.MeasurementResultNamingConventions
{
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Measurement;
    open Microsoft.Quantum.Convert;
    open Microsoft.Quantum.Arrays;

    /// # Summary
    /// Measures a named register and returns processed classical results using
    /// strictly observed naming conventions for every Result-related identifier.
    operation MeasureAndProcessNamedRegister(qubitRegister : Qubit[]) : Int
    {
        // Parameter 'qubitRegister' uses camelCase + descriptive noun; plural form signals array of qubits (interconnected with array-naming rules).
        let rawMeasurementResults = MeasureAllZ(qubitRegister);  // Result array uses camelCase + 'raw' prefix to indicate unprocessed hardware output.

        // 'rawMeasurementResults' name makes the origin (hardware measurement) explicit, preventing confusion with derived classical data.
        mutable bitStringValue = ResultArrayAsInt(rawMeasurementResults);  // Mutable classical variable follows camelCase; 'bitStringValue' documents conversion intent.

        // Function 'ResultArrayAsInt' is PascalCase and verb-led, matching repository OperationAndFunctionNamingConventions.qs style.
        mutable successCount = 0;                     // Counter variable camelCase + semantic name; used in post-processing loop below.
        for result in rawMeasurementResults
        {
            if result == One
            {
                set successCount += 1;                // Mutation of named counter; name clearly communicates its purpose (counting |1⟩ outcomes).
            }
        }

        // Final return value uses descriptive name inside the operation for traceability.
        return bitStringValue;
    }

    @EntryPoint()
    operation DemonstrateMeasurementResultNaming() : Unit
    {
        use registerForMeasurement = Qubit[3];        // Register name camelCase; demonstrates interconnection with qubit naming.
        let finalClassicalValue = MeasureAndProcessNamedRegister(registerForMeasurement);  // Local variable camelCase + semantic descriptor.
        ResetAll(registerForMeasurement);
    }
}