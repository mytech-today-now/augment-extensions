# Spring Web APIs and Security

Keep transport concerns at the web boundary. Choose the web stack to match the application's I/O model and security requirements.

## Choose MVC or WebFlux intentionally

- Prefer Spring MVC for conventional servlet applications, especially when the application and its dependencies use blocking I/O.
- Choose WebFlux when non-blocking request handling and reactive composition are requirements across the relevant call path. Evaluate client libraries, persistence access, streaming needs, operational skills, and measured workload before choosing it.
- Do not call blocking database, file, or network APIs on a reactive event loop. If a blocking boundary is unavoidable, isolate it using the supported scheduler and capacity controls for the project's Reactor and Spring versions.
- Avoid converting between imperative and reactive types repeatedly. A reactive controller does not make blocking dependencies non-blocking.
- Use the testing and client tools appropriate to the chosen stack. Check the current reference for supported test clients and server setup.

## Design endpoints around validated contracts

- Keep controllers focused on HTTP mapping, request binding, validation, and response translation. Delegate business rules and multi-step use cases to an application service.
- Use dedicated request and response types instead of binding untrusted JSON directly to persistence entities or internal domain state.
- Validate request bodies and parameters at the boundary. Combine framework validation with domain checks; boundary validation does not replace business invariants.
- Return appropriate status codes and stable response shapes. Do not expose Java exception names, stack traces, SQL messages, internal paths, or secrets in error responses.
- Centralize cross-cutting exception-to-response mapping where that keeps behavior consistent. Map known failures deliberately and keep unexpected failures generic to clients while recording safe diagnostic context.
- Add API contract, serialization, and compatibility checks when clients depend on the endpoint shape.

## Apply Spring Security as the security boundary

- Use Spring Security's supported authentication and authorization mechanisms. Do not create a handwritten password store, request filter chain, token verifier, or role check when Spring Security provides the security integration.
- Define authorization rules for every route and method, starting from deny-by-default or authentication-required behavior and then opening only intentional public endpoints.
- Enforce authorization close to sensitive operations as well as at the HTTP boundary when the application has non-HTTP entry points. Use the currently supported API for the project's Spring Security version.
- Preserve CSRF protections for browser sessions unless the threat model and protocol justify a documented alternative. Configure CORS narrowly for known origins and methods; CORS is not authorization.
- Use secure password storage and vetted identity providers or protocols. Avoid leaking authentication failures, token contents, or user existence through responses and logs.
- Restrict access to operational endpoints and administration routes. Test both permitted and rejected cases, including unauthenticated and underprivileged callers.

## Keep tests focused on the web contract

- Use framework slice tests for the controller or web configuration boundary when possible, and full application tests only when auto-configuration or cross-layer behavior is part of the contract.
- Exercise validation failures, status codes, content types, response bodies, and security rules. Avoid tests that only assert the controller delegates to a mock.
- Keep test configuration and credentials isolated. Never use production secrets or shared production data in a test.

## Official references

- [Spring Boot servlet web applications](https://docs.spring.io/spring-boot/reference/web/servlet.html)
- [Spring Framework WebFlux](https://docs.spring.io/spring-framework/reference/web/webflux.html)
- [Spring MVC validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html)
- [Spring MVC exception handling](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html)
- [Spring Security request authorization](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)
