/*
WHAT: Operation and function (callable) naming conventions in Q#.
HOW: Use PascalCase for all callable names. Operations (which may have side effects on qubits) start with verbs like "Prepare", "Apply", or "Measure". Pure functions start with nouns or adjectives like "Calculate" or "Get". Never use abbreviations unless they are QDK-standard (e.g., QFT).
WHEN: Every time declaring an operation or function to clearly communicate intent and quantum vs. classical behavior.
WHERE: In namespace scope for public callables; local callables within operations use the same PascalCase rule.
WHY: Makes code self-documenting for quantum algorithm readers, enables easy functor application (Adj, Ctl), improves collaboration in team quantum projects, and aligns with Microsoft Quantum Development Kit library patterns for readability and maintainability.
*/

namespace MyTechToday.Quantum.NamingStandards.Callables {

    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Canon;

    // Good: Operation name uses verb + descriptive noun in PascalCase
    operation PrepareBellState() : Unit {
        use qs = Qubit[2];
        H(qs[0]);
        CNOT(qs[0], qs[1]);
        ResetAll(qs);
    }

    // Good: Pure function name uses noun/adjective form
    function CalculatePhaseEstimate(measurements : Result[]) : Double {
        // Pure computation - no qubit side effects
        return 0.0;  // Placeholder for educational clarity
    }

    // Bad example (commented for illustration only):
    // operation prepare_bell() : Unit { ... }  // Incorrect: snake_case and lowercase verb
    // function calcPhase() : Double { ... }     // Incorrect: abbreviation and camelCase
}