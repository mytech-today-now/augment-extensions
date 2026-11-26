# Spring Persistence, Testing, and Transactions

Put transaction and framework behavior at deliberate application boundaries, and test only the integration level each behavior needs.

## Define transaction boundaries around use cases

- Place a transaction around an application operation that must commit or roll back as one unit. Keep the boundary on a Spring-managed service or application component rather than scattering it across controller methods.
- Review what the configured transaction manager controls. A database transaction does not automatically make HTTP calls, messages, files, or multiple independent stores atomic.
- Keep slow network calls and user interaction outside database transactions where possible. Holding a transaction open can retain locks and connections longer than necessary.
- Check the project's configured propagation, isolation, timeout, read-only, and rollback behavior. Do not assume that a method annotation alone gives the intended semantics for every exception or transaction manager.
- Understand proxy-based interception: calls made within the same object may not pass through the proxy. Avoid relying on an annotation for self-invocation; extract the transactional operation or use the documented programmatic approach when needed.
- Do not catch and suppress a failure inside a transaction if the caller expects rollback. Make rollback and retry policy explicit and safe for repeated execution.
- Keep persistence technology and repository APIs behind an application boundary where practical. Add Spring Data or another persistence project only when the application chooses it; it is outside this module's core scope.

## Use the smallest Spring test context that proves the behavior

- Unit test domain and application logic without a Spring context when dependency wiring is not under test.
- Use a focused test slice for a web, persistence, or serialization boundary where the selected Spring version provides one. Keep the slice narrow and replace only external collaborators needed for isolation.
- Use `@SpringBootTest` when behavior depends on application configuration, auto-configuration, or interactions across several layers. Avoid loading the full context for every test.
- For web behavior, assert externally visible status, headers, and payload. For persistence, use isolated test data and verify constraints and transaction outcomes against the project's supported database setup.
- Test both success and failure paths, including validation, authorization, rollback, and startup configuration failures where those outcomes are contractual.
- Keep test properties deterministic and credentials fake. Do not weaken production security or transactions just to simplify a test.
- Verify test annotations and context setup against the exact Boot, Framework, JUnit, and test-library versions declared by the application.

## Keep dependency management consistent

- Use the Spring Boot dependency management already selected by the project when available. Avoid pinning a Spring Framework or Spring test artifact independently without checking the supported dependency set.
- Add only the starter or testing support that is needed. Check whether the project already includes an equivalent dependency before suggesting another one.
- For a non-Boot Spring application, follow its existing dependency alignment and refer to the matching Framework documentation instead of assuming Boot's dependency management.

## Official references

- [Spring declarative transaction management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html)
- [Using `@Transactional`](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [Spring Boot testing](https://docs.spring.io/spring-boot/reference/testing/index.html)
- [Testing Spring Boot applications](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html)
