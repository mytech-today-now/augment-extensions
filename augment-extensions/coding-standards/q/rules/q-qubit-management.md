# Q# Qubit Management

> Skeleton rule file. See `q-standards.md` for full context.

- Allocate with `use` (fresh) or `borrow` (clean borrowed). Never extend qubit lifetime beyond its tight scope.
- `Reset` qubits before scope exit when they may be non-zero, especially for hardware targets.
- Prefer `within { ... } apply { ... }` for automatic uncomputation over manual adjoint inversion.
- Declare `is Adj + Ctl` on operations whenever semantically valid.
- Never hold qubits across host-language boundaries.
- Respect the no-cloning theorem: never assume a qubit can be copied.
