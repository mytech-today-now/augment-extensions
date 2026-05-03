# Q# Security and Quantum Hygiene

> Skeleton rule file. See `q-standards.md` for full context.

- No-cloning compliance is mandatory. No state-duplication shortcuts.
- For QKD or QRNG, follow standard protocols and document measurement bases.
- Sanitize, and where appropriate encrypt, parameters and results crossing the host/Q# boundary, especially for Azure Quantum jobs.
- Use authenticated Azure Quantum workspaces. Never log raw job outputs that could leak superposition-derived data.
- Minimize timing and resource variance that could leak information in cryptographic contexts.
- Pair Q# components with post-quantum-resistant classical algorithms.
