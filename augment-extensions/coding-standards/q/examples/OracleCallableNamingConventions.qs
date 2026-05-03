/*
 * What: This example demonstrates Q# naming conventions exclusively for oracle/black-box callables, their qubit-register parameters, and internal phase-marking variables.
 * How: Oracle operations follow PascalCase verb-noun-plus-domain pattern; parameters combine camelCase with semantic descriptors; all names interconnect with qubit and result naming.
 * When: Apply whenever defining custom oracles, phase oracles, or black-box unitaries in quantum algorithms.
 * Where: These conventions belong in algorithm-specific libraries (e.g., Microsoft.Quantum.Oracles or domain Grover modules).
 * Why: Descriptive oracle naming makes algorithmic intent transparent, facilitates functor application (Adjoint/Controlled), and enables library consumers to compose oracles confidently without inspecting implementation details.
 */

namespace Augment.Quantum.Examples.Naming.OracleCallableNamingConventions
{
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Canon;
    open Microsoft.Quantum.Measurement;

    /// # Summary
    /// Example phase oracle that marks a specific basis state using strictly named identifiers.
    operation PhaseOracleMarkTargetState(targetIndex : Int, register : Qubit[]) : Unit is Adj + Ctl
    {
        // Operation name 'PhaseOracleMarkTargetState' is PascalCase, verb-led, and domain-specific—clearly signals its role in Grover/phase estimation.
        // 'is Adj + Ctl' functor declaration follows FunctorSpecializationNamingConventions.qs style while remaining on-topic for callable naming.
        let phaseMarkerQubit = register[0];      // Local qubit extraction uses camelCase + descriptive name; documents which register element is the marker.
        Rz(2.0 * PI() / IntAsDouble(targetIndex + 1), phaseMarkerQubit);  // Rotation uses named qubit; name prevents misinterpretation of index usage.
    }

    /// # Summary
    /// Wrapper callable demonstrating oracle composition and result extraction naming.
    operation RunNamedOracleOnRegister() : Result
    {
        use dataRegister = Qubit[2];
        PhaseOracleMarkTargetState(0, dataRegister);   // Oracle call uses the full PascalCase name; parameters follow established qubit-register convention.
        let finalMeasurementOutcome = M(dataRegister[0]);  // Result variable camelCase + semantic descriptor tying back to oracle action.
        ResetAll(dataRegister);
        return finalMeasurementOutcome;
    }

    @EntryPoint()
    operation DemonstrateOracleCallableNaming() : Unit
    {
        let outcome = RunNamedOracleOnRegister();
    }
}