# Q# Error Handling

> Skeleton rule file. See `q-standards.md` for full context.

- Use `fail "message"` for unrecoverable conditions (invalid qubit count, violated state assumption).
- Branch on `Result` (`Zero` / `One`) explicitly; convert with `ResultAsBool` when needed.
- Use `Microsoft.Quantum.Diagnostics` (`AssertQubit`, `AssertAllZero`, `DumpMachine`, `DumpRegister`) during development; gate them out for hardware runs.
- Validate classical inputs before allocating qubits.
- In hybrid apps, surface quantum failures as host-language exceptions; never silently retry on real hardware.

```qsharp
if (nQubits < 2) {
    fail "Grover search requires at least 2 qubits.";
}
```
