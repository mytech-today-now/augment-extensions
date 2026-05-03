/*
WHAT: Hamiltonian operator and term naming conventions in Q#.
HOW: Hamiltonians use camelCase with "Hamiltonian" suffix (e.g., molecularHamiltonian); individual terms use camelCase plural (e.g., pauliTerms).
WHEN: Defining or evolving under Hamiltonians for variational algorithms or simulation.
WHERE: Parameter lists or variable declarations for time evolution or expectation values.
WHY: Variational quantum algorithms depend on accurate Hamiltonian representation; clear naming prevents term misordering and improves readability in chemistry or physics simulations.
*/

// GOOD: camelCase Hamiltonian and term names
namespace AugmentExtensions.Quantum.NamingStandards.Hamiltonians {

    open Microsoft.Quantum.Canon;

    operation EvolveUnderHamiltonian(time : Double) : Unit {
        // GOOD: camelCase Hamiltonian variable
        let molecularHamiltonian = [/* Pauli terms */];

        // GOOD: camelCase terms array
        let pauliTerms = new Pauli[2];

        // BAD example (commented): let MolecularHamiltonian = ...
        // Violates: PascalCase
    }
}