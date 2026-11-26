# Java Testing, Tooling, and Documentation

Make changes repeatable through the project's existing build, test, and review workflow.

## Test observable behavior

- Follow the project's existing test framework and directory conventions. Do not add another test framework for a small change.
- Write focused unit tests for domain logic and edge cases. Assert outcomes and behavior rather than private implementation details.
- Add integration tests where behavior depends on a real boundary such as persistence, serialization, network configuration, or framework wiring. Use isolated fixtures and deterministic inputs.
- Keep tests repeatable: control clocks, random values, environment, ordering, and shared state when they affect results. Clean up temporary files and resources.
- Test failure paths and invalid input when they form part of the contract. Do not test only that a method was called if the observable result matters.
- Keep the test command and target JDK consistent with CI. A test passing locally on a newer JDK does not prove compatibility with the project's minimum runtime.

## Keep builds reproducible

- Use the checked-in Maven Wrapper or Gradle Wrapper. Preserve established plugin and dependency management.
- Set the Java toolchain or compiler release explicitly when the project supports it. Compile and test against the declared minimum release in CI, and use a separate job for newer supported runtimes where required.
- Keep dependency versions centrally managed through the existing parent, BOM, version catalog, or plugin conventions. Add only dependencies needed by the feature.
- Preserve deterministic builds and lock down versions according to project policy. Do not change wrappers, plugins, or build structure as an incidental cleanup.
- Run the narrow relevant build or test task first, then the broader checks required by the change and repository instructions. Report skipped commands accurately.

## Document public contracts

- Add Javadoc when a public type or method has non-obvious purpose, constraints, lifecycle, threading, nullability, or failure behavior.
- Document observable behavior and examples rather than restating every method name. Keep documentation current when public behavior changes.
- Use comments to explain a reason, invariant, workaround, or surprising constraint. Remove stale comments instead of leaving contradictory guidance.

## Review security and maintenance risks

- Check dependency provenance, maintenance, license policy, and known vulnerabilities using the repository's approved tools.
- Use least privilege for file, process, network, and cloud access. Avoid hard-coded credentials, insecure random values, and unsafe trust decisions.
- Check logs and error responses for secret or personal data exposure. Avoid logging full request bodies by default.
- Use maintained APIs supported by the project's baseline. Before replacing a deprecated API, verify the target library version and migration guidance.

## Official references

- [Java SE specifications](https://docs.oracle.com/javase/specs/)
- [Maven toolchains](https://maven.apache.org/guides/mini/guide-using-toolchains.html)
- [Gradle Java toolchains](https://docs.gradle.org/current/userguide/toolchains.html)
