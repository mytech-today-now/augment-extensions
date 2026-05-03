# Q# Performance and Resource Estimation

> Skeleton rule file. See `q-standards.md` for full context.

- Run the QDK `ResourcesEstimator` or Azure Quantum Resource Estimator before any hardware submission. Report qubit count, T-count, gate count, and depth.
- Minimize two-qubit gates; prefer hardware-native gates of the target provider.
- Reuse qubits via `Reset` and `borrow`. Offload classical loops to the host language.
- Choose simulators by scale: full-state (<= 20 qubits), Toffoli/sparse (larger), resource estimator (scaling studies).
- Apply provider-appropriate error mitigation; document the choice.
- Prefer library-optimized primitives from `Microsoft.Quantum.Canon` and `Preparation` over hand-rolled gate sequences.
