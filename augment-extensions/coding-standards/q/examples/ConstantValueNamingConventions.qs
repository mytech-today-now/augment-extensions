/*
WHAT: Constant value naming conventions in Q#.
HOW: Constants use camelCase (preferred) or UPPER_SNAKE_CASE only for truly global immutable values (e.g., maxQubitsAllowed); never magic numbers.
WHEN: Defining reusable numeric or string constants for qubit counts, angles, or tolerances.
WHERE: Top-level let statements inside namespace or inside operations.
WHY: Quantum code often uses fixed values (angles, qubit limits); named constants improve maintainability and prevent hard-coded value errors in simulations or hardware runs.
*/

// GOOD: camelCase constants with descriptive names
namespace AugmentExtensions.Quantum.NamingStandards.Constants {

    // GOOD: camelCase for local constants
    let piOverFour = 3.1415926535 / 4.0;

    operation UseConstantAngle(targetQubit : Qubit) : Unit {
        // GOOD: Reusing constant
        Rz(piOverFour, targetQubit);
    }
}