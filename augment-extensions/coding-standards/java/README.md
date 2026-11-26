# Java Coding Standards

Version 1.0.0 provides practical, project-agnostic guidance for modern Java development. It is designed to be linked by itself or alongside the Spring module.

## Overview

Use these rules for Java language and platform decisions that apply across application types: packages, naming, API design, types, collections, null handling, exceptions, resources, concurrency, tests, build tools, documentation, and secure coding.

This module does not assume a JDK release, framework, build system, or project layout. Before generating code, inspect the project's Maven or Gradle configuration, toolchain settings, wrapper, CI configuration, and supported runtime. Keep generated syntax and APIs within that declared baseline. The included value-object example is explicitly labeled for Java 17.

## Installation

Link the module directly:

```bash
augx link coding-standards/java
```

It can also be inspected without linking:

```bash
augx show coding-standards/java
```

## Usage

1. Read the project's JDK toolchain, compiler release, CI matrix, and supported runtime before selecting language features.
2. Load the rule file that matches the change: language and API design, reliability and concurrency, or testing, tooling, and security.
3. Use this module for Java decisions. If the project uses Spring, use the Spring module for container and framework behavior.

## Contents

- [Language and API design](rules/language-and-api-design.md): project baseline, naming, packages, encapsulation, generics, collections, null handling, and stable language features.
- [Reliability and concurrency](rules/reliability-and-concurrency.md): validation, exceptions, resource management, concurrency, and measured performance.
- [Testing, tooling, and security](rules/testing-tooling-and-security.md): useful tests, Maven and Gradle practices, documentation, and secure coding.
- [SearchRequest.java](examples/SearchRequest.java): an illustrative Java 17 record with boundary validation and a defensive collection copy.

## Relationship to Spring guidance

This module owns general Java language and platform guidance. [Spring Framework and Spring Boot Standards](../spring/README.md) owns dependency injection, bean configuration, Boot behavior, HTTP endpoints, framework testing, transactions, Spring Security integration, and Actuator operations. Link either module on its own. When both are linked, use this module for Java decisions and the Spring module for Spring-specific decisions.

## Version and source policy

Treat the JDK release and compiler target configured by the consuming project as authoritative. Use stable language features supported by that target. Do not enable preview features by default. Preview and incubator APIs require explicit project approval, matching build and runtime flags, and tests on every supported runtime.

For language and API changes, consult the [Java SE specifications](https://docs.oracle.com/javase/specs/) and the version-specific [Java language changes by release](https://docs.oracle.com/en/java/javase/21/language/java-language-changes-release.html). For reproducible builds, use the project's existing Maven or Gradle wrapper and toolchain configuration. See the official [Maven toolchains guide](https://maven.apache.org/guides/mini/guide-using-toolchains.html) and [Gradle toolchains guide](https://docs.gradle.org/current/userguide/toolchains.html).

## Character count

The count covers every file in this module directory, including manifests, documentation, rules, and examples: see `module.json` and `metadata.json` for the verified total.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
