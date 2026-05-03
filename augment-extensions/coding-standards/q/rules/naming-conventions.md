# Q# Naming Conventions

> Skeleton rule file. Authoritative content lives in `q-standards.md`; this file isolates naming guidance for targeted lookup.

- Namespaces: PascalCase, hierarchical (`Augment.Quantum.Algorithms.Grover`).
- Operations / Functions: PascalCase, verb-led (`PrepareBellState`, `MeasureAllZ`).
- Qubits / Registers: camelCase, descriptive (`targetQubit`, `dataRegister`).
- Variables / Parameters: camelCase (`inputAngle`, `nIterations`).
- Constants: UPPER_SNAKE_CASE (`PI_OVER_4`).
- User-Defined Types: PascalCase (`QuantumRegister`).
- Files: kebab-case `.qs` (`bell-state.qs`).

Prefix reusable Augment quantum modules with `AugmentQuantum`. Avoid single-letter names outside tight loop indices.
