# Q# Testing

> Skeleton rule file. See `q-standards.md` for full context.

- Use `Microsoft.Quantum.Diagnostics` assertions (`AssertQubit`, `AssertAllZero`, `AssertOperationsEqualReferenced`) for unit tests.
- Run tests via `dotnet test` against the full-state simulator first, then resource estimator.
- Property-test parameterized circuits over representative input domains.
- Verify adjoint and controlled variants explicitly; missing functor tests is a defect.
- Pin QDK and Azure Quantum SDK versions in `.qsproj` so test runs are reproducible.
- For hybrid apps, add host-language tests (Python/IQ# or C#) wrapping the Q# entry points.
