# Spring Framework and Spring Boot Standards

Version 1.0.0 provides practical guidance for applications built with Spring Framework and Spring Boot. The module is useful on its own and complements the Java Coding Standards module.

## Overview

Use these rules for Spring-specific design and operation: constructor injection, bean lifecycle, Boot auto-configuration, external settings, Spring MVC or WebFlux, request validation, error handling, transaction boundaries, Spring testing, Spring Security, observability, health, and Actuator exposure.

The module does not prescribe a Spring release, database, deployment platform, or build tool. Inspect the consuming project's Spring Boot and Spring Framework versions, Java toolchain, dependency management, and official compatibility requirements before suggesting APIs or dependencies. Spring Cloud, Spring AI, Spring Batch, Spring Data, and other Spring portfolio projects are separate products. This module covers their integration only when an application already uses them and the concern is directly relevant.

## Installation

Link the module directly:

```bash
augx link coding-standards/spring
```

Inspect its guidance with:

```bash
augx show coding-standards/spring
```

## Usage

1. Identify the project's Spring Framework, Spring Boot, Spring Security, and Java versions before suggesting annotations, configuration keys, or dependencies.
2. Choose the rule file for the concern: bean and Boot configuration, web APIs and security, data and tests, or production operations.
3. Use this module for Spring-specific decisions. Link the Java module separately for general language, API, and platform guidance.

## Contents

- [Beans, configuration, and Boot](rules/beans-configuration-and-boot.md): dependency injection, bean lifecycle, application structure, auto-configuration, and externalized settings.
- [Web APIs and security](rules/web-apis-and-security.md): MVC and WebFlux choice, endpoints, validation, consistent errors, and Spring Security.
- [Data, testing, and transactions](rules/data-testing-and-transactions.md): persistence boundaries, transaction behavior, unit tests, slices, and integration tests.
- [Production operations](rules/production-operations.md): production configuration, observability, health checks, graceful lifecycle, and safe Actuator exposure.
- [OrderController.java](examples/OrderController.java): an illustrative Spring Boot 3+ MVC endpoint using constructor injection and Jakarta validation. It is not a compiled project.

## Relationship to Java guidance

[Java Coding Standards](../java/README.md) owns general Java language, API, exception, concurrency, build, testing, and security practices. This module owns Spring Framework and Spring Boot behavior. Link either module independently. When both are linked, apply Java rules to language choices and this module to framework choices, without duplicating general Java advice.

## Version and source policy

Follow the versions declared by the consuming project and its supported Java baseline. Use the official compatibility and reference documentation for those exact versions. Do not add a starter or portfolio project just because an example uses it. Versioned details in examples are labeled so teams can adjust them to their own supported releases.

Official sources:

- [Spring projects](https://spring.io/projects)
- [Spring Framework reference](https://docs.spring.io/spring-framework/reference/)
- [Spring Boot reference](https://docs.spring.io/spring-boot/reference/)
- [Spring Boot system requirements](https://docs.spring.io/spring-boot/system-requirements.html)
- [Spring Security reference](https://docs.spring.io/spring-security/reference/)

## Character count

The count covers every file in this module directory, including manifests, documentation, rules, and examples: see `module.json` and `metadata.json` for the verified total.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
