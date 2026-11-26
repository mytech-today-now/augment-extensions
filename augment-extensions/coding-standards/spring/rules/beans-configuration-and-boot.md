# Spring Beans, Configuration, and Boot

Use the Spring container deliberately. Keep application behavior explicit and configuration external to compiled code.

## Inject dependencies and manage beans

- Prefer constructor injection for required collaborators. It makes dependencies visible, supports immutable fields, and lets a plain unit test construct the class without starting a container.
- Use Spring-managed beans for application services and infrastructure that need container lifecycle, configuration, or framework integration. Do not retrieve dependencies from the application context inside business code.
- Define a bean with `@Bean` when configuring a third-party type or when explicit factory logic is clearer than component scanning. Keep configuration focused and deterministic.
- Choose singleton scope unless per-request or per-operation state requires another scope. A singleton service should not keep mutable request state in fields.
- Keep constructors and bean initialization fast and side-effect light. Perform network calls or other fallible startup work only through an explicit lifecycle design with defined failure and shutdown behavior.
- Avoid circular dependencies. Extract a shared responsibility or change the direction of the dependency rather than hiding the cycle with setter injection or lazy lookups.
- Use lifecycle callbacks only for lifecycle work. Ensure external resources created by a bean have a corresponding managed close or destroy path.

## Structure Spring Boot applications clearly

- Use one primary `@SpringBootApplication` entry point and place it above the application packages it should discover. Add component scanning or auto-configuration exclusions only for a documented reason.
- Organize code around the application's domain or features when that makes ownership and changes easier to follow. Keep HTTP controllers thin and delegate use cases to application services.
- Let auto-configuration provide conventional infrastructure when it matches the application. Add explicit beans to replace behavior intentionally, not preemptively.
- When configuration is surprising, inspect the condition report with the supported Boot diagnostic options before excluding classes or copying internal auto-configuration details.
- Keep framework annotations at the integration boundary where possible. Avoid spreading container lookups and framework-specific types through domain logic without a need.
- Do not mix APIs or configuration conventions from different Spring Boot generations without checking migration notes, dependency management, and supported Java versions.

## Externalize and validate settings

- Put environment-specific settings in supported external configuration sources. Do not compile hostnames, credentials, tokens, or environment-specific paths into application code.
- Bind related settings to a typed configuration object when that improves validation and discoverability. Use direct property injection for a small isolated value when it is consistent with the codebase.
- Validate required configuration at startup and fail with a clear, non-secret diagnostic. Define safe defaults only for values that are genuinely optional.
- Use profiles for intentional environment-specific configuration, not as a replacement for a clear configuration model. Understand property-source precedence before relying on overrides.
- Keep secrets in the deployment's approved secret mechanism. Avoid committing secret values in properties, YAML, test fixtures, or build files. Redact them in logs and diagnostic endpoints.
- Add a new configuration source or secret manager only when the deployment actually requires it.

## Official references

- [Spring Framework dependency injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Spring bean lifecycle](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html)
- [Spring Boot auto-configuration](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)
- [Spring Boot externalized configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html)
- [Spring Boot system requirements](https://docs.spring.io/spring-boot/system-requirements.html)
