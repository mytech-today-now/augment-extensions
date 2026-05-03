/*
WHAT: Namespace naming conventions in Q#.
HOW: Use PascalCase for every segment, separated by periods (e.g., Company.Quantum.Module.SubModule). Begin with a clear organization/project prefix. Never use underscores, hyphens, or all-lowercase. Keep segments descriptive but concise; avoid generic terms like "Utils".
WHEN: For every .qs file and when organizing related operations, functions, and types into logical groups.
WHERE: Declared as the first non-comment line in each source file, immediately before any open statements.
WHY: Enables hierarchical organization that scales with large quantum libraries, prevents name collisions across Microsoft.Quantum.* packages, improves IntelliSense and discoverability in the Quantum Development Kit, and follows .NET ecosystem conventions for seamless integration with classical host code.
*/

namespace MyTechToday.Quantum.NamingStandards.Namespaces {  // Good: PascalCase segments with meaningful hierarchy starting with organization prefix

    // Bad example (commented for illustration only):
    // namespace mytech_quantum_namingstandards {  // Incorrect: snake_case, missing hierarchy, lowercase

    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Canon;
    open Microsoft.Quantum.Measurement;

    // Good: Operation placed inside the properly named namespace
    operation PrepareBellState() : Unit {
        use q1 = Qubit();
        use q2 = Qubit();
        H(q1);
        CNOT(q1, q2);
        let result = M(q2);  // Measurement result demonstrates namespace isolation
        ResetAll([q1, q2]);
    }

    // Additional example showing nested conceptual grouping via namespace
    // (in practice, deeper nesting would use a separate file with matching namespace)
}