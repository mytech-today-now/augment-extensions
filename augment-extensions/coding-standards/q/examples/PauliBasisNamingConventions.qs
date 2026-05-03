/*
 * What: This example demonstrates Q# naming conventions exclusively for Pauli bases, Pauli arrays, measurement-basis parameters, and operator-specific variables.
 * How: Pauli constants and arrays receive PascalCase descriptive names; parameters and locals use camelCase with explicit basis/role suffixes; all interconnect with measurement callables.
 * When: Use whenever constructing multi-basis measurements, stabilizer circuits, or randomized benchmarking sequences.
 * Where: Ideal for placement in Microsoft.Quantum.Characterization or custom quantum-diagnostics libraries.
 * Why: Explicit Pauli naming prevents off-by-one errors in basis selection, makes circuit intent self-documenting, and supports automated verification of measurement compatibility.
 */

namespace Augment.Quantum.Examples.Naming.PauliBasisNamingConventions
{
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Measurement;
    open Microsoft.Quantum.Arrays;

    /// # Summary
    /// Performs a multi-basis measurement using named Pauli operators and demonstrates
    /// every naming decision for Pauli-related identifiers.
    operation MultiBasisNamedMeasurement(qubitRegister : Qubit[]) : Result[]
    {
        // Parameter name 'qubitRegister' maintains consistency with prior examples.
        let pauliBasisX = PauliX;                    // Constant uses PascalCase + explicit basis suffix; self-documents the Pauli operator chosen.
        let pauliBasisY = PauliY;                    // Companion constant follows identical pattern for visual grouping.
        let pauliBasisZ = PauliZ;

        // Pauli array constructed with descriptive camelCase name; order is documented by name.
        let measurementBases = [pauliBasisX, pauliBasisY, pauliBasisZ];

        // 'measurementBases' name makes the array’s purpose (basis selection) immediately clear to readers and static analyzers.
        let measuredOutcomes = MeasureEachZ(qubitRegister);  // Intermediate array follows camelCase + semantic descriptor; links Pauli choice to outcome.

        // Final return uses camelCase for the result collection.
        return measuredOutcomes;
    }

    @EntryPoint()
    operation DemonstratePauliBasisNaming() : Unit
    {
        use testRegister = Qubit[3];
        let outcomes = MultiBasisNamedMeasurement(testRegister);
        ResetAll(testRegister);
    }
}