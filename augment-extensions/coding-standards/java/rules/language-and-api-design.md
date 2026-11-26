# Java Language and API Design

Use these rules when designing Java types, packages, public APIs, and language-level changes.

## Start with the project's actual baseline

1. Read the configured JDK and release target in Maven or Gradle, the wrapper version, CI jobs, and supported deployment runtimes. Check compiler and runtime settings together; a locally installed JDK does not raise the project's baseline by itself.
2. Prefer a toolchain or compiler `release` setting already established by the project. Keep source, target, and runtime compatibility aligned. Do not recommend a language feature until the project's minimum compiler accepts it.
3. Treat preview and incubator features as opt-in experiments. Identify the exact JDK release, enable flags, deployment constraints, and removal risk. Do not enable them in ordinary production code without an explicit project decision.
4. When documentation and examples disagree with the configured baseline, follow the project and call out the mismatch instead of silently raising the target.

Records became a permanent feature in Java 16, sealed classes in Java 17, and pattern matching for `switch` in Java 21. Check the selected release's official language changes before applying a feature. A feature being stable in one release does not make it valid for an older target.

## Name and organize code consistently

- Use the repository's formatter and checkstyle rules if present. If none exist, follow nearby code and avoid introducing a new formatter or style dependency as part of a routine change.
- Use `UpperCamelCase` for types, `lowerCamelCase` for methods and variables, and uppercase underscore-separated names only for `static final` constants that represent named constants. Prefer descriptive names over abbreviations.
- Keep package names lowercase and stable. Organize packages around a domain or feature when that matches the application, and avoid a large catch-all `util` package.
- Keep types cohesive and limit visibility. Use package-private visibility for implementation details unless a wider API is needed. Do not expose fields or mutable collections as an accidental API.
- Keep imports explicit and remove unused imports. Avoid wildcard imports when they hide ownership or create ambiguity.
- Follow the existing source, test, and resource layout. Do not move project files solely to match a generic template.

## Design types and APIs for callers

- Prefer small interfaces that describe a real boundary. Avoid interfaces with one implementation when they add no substitution, testing, or API value.
- Use generics to preserve useful type information. Avoid raw types, unchecked casts, and broad `Object` APIs when a parameterized type expresses the contract.
- Choose a collection based on required behavior: ordering, uniqueness, lookup, mutability, and expected size. Return the narrowest useful abstraction and document ordering when callers rely on it.
- Make value objects immutable where practical. Copy mutable inputs and outputs at ownership boundaries. A `final` reference does not make its referenced object immutable.
- Prefer enums for a fixed set of alternatives. Use sealed hierarchies when the project baseline supports them and limiting implementations is part of the model.
- Keep public API changes deliberate. Check source and binary compatibility expectations, nullability conventions, serialization format, and downstream callers before changing a public signature.

## Handle null and use language features deliberately

- Inspect the project's nullness annotations and static analysis configuration. Apply the established convention consistently. Validate required inputs at system boundaries and at constructors that enforce invariants.
- Use `Optional<T>` mainly to express a possibly absent return value. Do not use it as a substitute for validation or as a default field, parameter, or collection type unless project conventions require that shape.
- Use a primitive when absence is not part of the contract. If absence matters, model it explicitly rather than using a magic value.
- Use a record for a transparent data carrier when its component model fits the domain. Records are shallowly immutable: copy mutable collections and validate invariants in the canonical constructor where needed.
- Use pattern matching and other newer syntax only when the project's release supports the stable form and the result remains clearer to maintainers. Avoid preview syntax in general-purpose examples.

See [SearchRequest.java](../examples/SearchRequest.java) for an illustrative Java 17 record that validates input and defensively copies a collection. It is not a complete project or a substitute for the consuming project's nullness and validation conventions.

## Official references

- [Java SE specifications](https://docs.oracle.com/javase/specs/)
- [Java language changes by release](https://docs.oracle.com/en/java/javase/21/language/java-language-changes-release.html)
