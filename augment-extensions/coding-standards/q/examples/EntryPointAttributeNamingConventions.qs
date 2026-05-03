/*
WHAT: Entry point and attribute naming conventions in Q#.
HOW: @EntryPoint() uses exact PascalCase attribute; custom attributes follow PascalCase.
WHEN: Marking the main executable operation in Q# programs for simulators or hardware.
WHERE: Immediately above the primary operation declaration.
WHY: Ensures the quantum program has a clear starting point for execution; consistent attribute naming aligns with Q# compiler and Azure Quantum requirements.
*/

// GOOD: Exact @EntryPoint() attribute
namespace AugmentExtensions.Quantum.NamingStandards.EntryPoints {

    @EntryPoint()
    operation MainQuantumProgram() : Unit {
        // GOOD: Operation follows PascalCase as usual
        Message("Quantum program started with proper entry point");
    }
}