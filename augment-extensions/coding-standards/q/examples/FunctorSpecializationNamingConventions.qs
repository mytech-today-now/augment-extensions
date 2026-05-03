/*
WHAT: Functor and specialization naming conventions in Q#.
HOW: Callables supporting functors keep the base name in PascalCase; specializations are declared with 'is Adj + Ctl' or similar. When naming adjoint or controlled versions explicitly (rare), append "Adjoint" or "Controlled" in PascalCase.
WHEN: For any operation that needs adjoint or controlled variants, which is common in quantum algorithms requiring reversibility or multi-qubit control.
WHERE: In operation declarations and when applying functors (e.g., Adjoint OpName()).
WHY: Functors are a quantum-specific Q# feature enabling automatic generation of adjoint/controlled versions; consistent naming ensures the compiler and developers can reliably apply them, reducing gate count and improving performance in resource estimation.
*/

namespace MyTechToday.Quantum.NamingStandards.Functors {

    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Canon;

    // Good: Base operation name in PascalCase with explicit functor support
    operation ApplyPhaseRotation(targetQubit : Qubit) : Unit is Adj + Ctl {
        Rz(PI() / 4.0, targetQubit);  // Supports Adjoint and Controlled automatically
    }

    // Good: Explicit use of functor in calling code
    operation DemonstrateFunctor() : Unit {
        use q = Qubit();
        Adjoint ApplyPhaseRotation(q);  // Adjoint applied to PascalCase name
        Controlled ApplyPhaseRotation([q], q);  // Controlled variant
        Reset(q);
    }

    // Bad example (commented for illustration only):
    // operation apply_phase() is Adj { ... }  // Incorrect: lowercase and missing clear verb
}