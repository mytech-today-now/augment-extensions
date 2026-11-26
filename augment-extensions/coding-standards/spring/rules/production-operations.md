# Spring Production Operations

Make runtime behavior diagnosable while keeping operational data and control endpoints protected.

## Configure for each environment safely

- Keep operational settings outside the artifact and document required values, defaults, and validation. Fail startup when a required safety-critical value is missing or invalid.
- Use profiles and property sources intentionally. Verify precedence and active profiles in the exact Boot version rather than assuming a local configuration file wins.
- Set explicit connection, request, and shutdown timeouts for external resources using the settings supported by the chosen libraries. Bound queues and concurrency according to available capacity.
- Do not log secrets, full authorization headers, or sensitive request data. Use structured, consistently named fields and an appropriate request or trace identifier.

## Add observability that answers operational questions

- Use the project's supported logging and observability integrations. Record failures with useful context and avoid logging the same exception at every layer.
- Expose health and metrics only to the monitoring system that needs them. Review endpoint access, exposure, sanitization, network binding, and authentication together.
- A health response should communicate actionable health without revealing environment values, credentials, or internal topology.
- Separate liveness from readiness. Liveness should reflect whether the process can continue; do not make it fail solely because a downstream service is temporarily unavailable. Readiness may reflect whether the application can safely receive traffic, according to its deployment contract.
- Do not add an observability backend or deployment platform as a prerequisite when the project has not selected one.

## Expose Actuator deliberately

- Treat Actuator endpoints as operational interfaces. Expose only the endpoints the deployment requires, and control access using the supported security configuration.
- Review the data returned by environment, configuration, mappings, beans, loggers, and similar diagnostic endpoints before exposing them beyond a trusted boundary.
- Keep health detail and component indicators at the minimum level appropriate for the intended audience.
- Do not assume an endpoint is unavailable simply because it is not exposed over HTTP; review every configured management transport and port.
- Test access control and the public health contract in the production configuration profile, not only in a development profile.

## Manage lifecycle and failure recovery

- Use framework lifecycle and graceful shutdown support so in-flight work can complete within the deployment's termination window.
- Make background work cancellable and bounded. Ensure executors and clients are closed when their owning context ends.
- Make retries explicit, bounded, and safe for duplicate execution. Avoid retrying non-idempotent operations without an idempotency design.
- Record startup and shutdown failures clearly while withholding secret configuration values.
- Check the current Spring Boot operations and Actuator documentation for settings supported by the application's exact release.

## Official references

- [Spring Boot Actuator endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)
- [Spring Boot externalized configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html)
- [Spring Boot system requirements](https://docs.spring.io/spring-boot/system-requirements.html)
