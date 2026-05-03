/*
WHAT: Callable alias naming conventions in Q#.
HOW: Aliases use PascalCase matching the original callable style (e.g., MyHadamard = H); open directives use full hierarchical PascalCase.
WHEN: Creating shorter or domain-specific names for frequently used library callables.
WHERE: After open statements or inside namespace with "let" alias syntax.
WHY: Aliases reduce verbosity in long quantum circuits while preserving clarity; maintains consistency with original PascalCase for discoverability.
*/

// GOOD: PascalCase alias for library callable
namespace AugmentExtensions.Quantum.NamingStandards.Aliases {

    open Microsoft.Quantum.Intrinsic as IntrinsicGates;

    // GOOD: PascalCase alias
    let MyHadamard = IntrinsicGates.H;

    operation UseAlias(targetQubit : Qubit) : Unit {
        MyHadamard(targetQubit);  // Alias call retains style
    }
}