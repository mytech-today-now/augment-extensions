/*
WHAT: State vector and amplitude naming conventions in Q#.
HOW: State vectors use camelCase with "State" or "Vector" suffix (e.g., initialStateVector); amplitudes use camelCase (e.g., zeroAmplitude).
WHEN: Defining or manipulating classical representations of quantum states.
WHERE: In functions returning Complex[] or custom UDTs for state vectors.
WHY: State vectors are core to quantum simulation and debugging; precise naming distinguishes initial vs. final states and aids verification of unitarity.
*/

// GOOD: camelCase state vector handling
namespace AugmentExtensions.Quantum.NamingStandards.States {

    open Microsoft.Quantum.Math;

    function PrepareStateVector() : Complex[] {
        // GOOD: camelCase state vector name
        let initialStateVector = [Complex(1.0, 0.0), Complex(0.0, 0.0)];

        // GOOD: camelCase amplitude variables
        let zeroAmplitude = initialStateVector[0];

        return initialStateVector;
    }
}