# Java Reliability and Concurrency

Use explicit contracts and ownership to make failures, resources, and shared state predictable.

## Validate inputs and handle failures

- Validate untrusted or externally supplied values at the boundary where they enter the application. Keep domain invariants close to the type or operation that owns them.
- Use exceptions for exceptional failure, not routine branching. Select checked or unchecked exceptions according to the existing API and recovery contract; do not convert every failure into a generic `RuntimeException`.
- Catch an exception only where the code can recover, add useful context, translate it at a layer boundary, or complete required cleanup. Preserve the cause when translating. Do not catch `Throwable` for normal application flow.
- Never swallow an exception or log it and then report success. Include stable identifiers and operation context in logs, but exclude credentials, tokens, and sensitive payloads.
- Avoid using exceptions for expected absence when a return type or explicit result is clearer.
- Keep error messages useful to operators and safe for users. Do not return implementation details or stack traces through public APIs.

## Manage resources with clear ownership

- Use try-with-resources for `AutoCloseable` resources so cleanup runs on both success and failure.
- Define who owns and closes streams, clients, executors, and other resources. Do not close a resource supplied by a caller unless the contract says ownership transfers.
- Avoid keeping sockets, files, database resources, or locks open longer than necessary. Set timeouts for network operations using the APIs and project defaults that apply.
- Use shutdown hooks only when the application lifecycle requires them. Prefer the existing framework or container lifecycle for managed services.

## Keep concurrent state safe

- Prefer immutable values and confinement over shared mutable state. Make thread-safety assumptions visible in type and method documentation when they affect callers.
- Use the concurrency primitive that expresses the requirement: executor services for task lifecycle, atomics for simple shared values, locks for compound invariants, and concurrent collections for supported concurrent access. A concurrent collection does not make a multi-step workflow atomic.
- Preserve interruption. If a method cannot rethrow `InterruptedException`, restore the interrupt flag before translating or returning.
- Avoid blocking calls on event-loop or request threads when the surrounding framework requires non-blocking work. Do not introduce thread pools without defining capacity, queueing, rejection, shutdown, and cancellation behavior.
- Consider virtual threads only when the project's JDK supports them, dependencies are compatible, and workload measurements support the choice. Do not assume they make CPU-heavy work faster or remove the need for limits on scarce downstream resources.
- Avoid `ThreadLocal` state unless its lifecycle and cleanup are well-defined, especially in pooled threads.

## Measure performance before tuning

- Choose an appropriate algorithm and data structure before micro-optimizing syntax. Use a representative profiler or benchmark when performance is material.
- Avoid repeated expensive work in loops, unbounded caches, unnecessary object retention, and accidental quadratic algorithms. Do not add caching without an invalidation and memory policy.
- Do not replace clear loops with streams or vice versa for assumed speed. Choose the form that best expresses the operation, and measure if speed is a requirement.
- Check allocation, I/O, lock contention, and database round trips at the relevant system boundary. Avoid speculative optimization based on tiny synthetic examples.

## Apply security checks at trust boundaries

- Treat network, file, environment, and user input as untrusted. Validate type, length, range, and allowed values before use.
- Use parameterized APIs for database queries and safe encoders for output contexts. Do not assemble executable SQL, shell commands, HTML, or expression strings from untrusted input.
- Use maintained cryptographic libraries and documented algorithms. Do not create custom encryption, password hashing, or random-number schemes.
- Keep secrets out of source files, logs, test fixtures, and exception messages. Use the project's approved secret configuration and rotation path.
- Avoid unsafe deserialization and unrestricted polymorphic type handling for untrusted data. Review dependency and serialization behavior against the project's supported JDK and libraries.
