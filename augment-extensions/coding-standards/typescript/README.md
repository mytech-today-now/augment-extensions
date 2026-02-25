# TypeScript Coding Standards

> **Version 2.0.0** | Comprehensive TypeScript coding standards and best practices for Augment Code AI

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Module Contents](#module-contents)
  - [Core Rules](#core-rules)
  - [Advanced Topics](#advanced-topics)
  - [Examples](#examples)
- [Usage Guide](#usage-guide)
- [Version History](#version-history)
- [Contributing](#contributing)

## Overview

This module provides comprehensive TypeScript coding standards that exceed the `.augment/` character limit (~25,000 characters). It covers everything from basic naming conventions to advanced architecture patterns, modern tooling, and security best practices.

### What's Included

- ✅ **9 comprehensive rule files** covering all aspects of TypeScript development
- ✅ **Modern TypeScript 5.x features** including decorators and const type parameters
- ✅ **Tooling guides** for ESLint, Biome, tsup, and Vitest
- ✅ **Architecture patterns** for scalable applications
- ✅ **Security & performance** best practices
- ✅ **Monorepo support** with Turborepo and pnpm
- ✅ **Real-world examples** with working configurations

## Installation

### Using augx CLI (Recommended)

```bash
# Link this module to your project
augx link coding-standards/typescript

# Verify installation
augx list --linked
```

### Manual Installation

Copy the contents of this directory to your project's `.augment/extensions/` folder.

## Quick Start

### For AI Agents

```bash
# Query the module
augx show typescript-standards

# Search for specific topics
augx search "error handling"
augx search "monorepo"
```

### For Developers

1. Link the module to your project
2. Configure your IDE to use the provided ESLint/Biome configs
3. Reference the rules when writing TypeScript code
4. Use the examples as templates for your own configurations

## Module Contents

### Core Rules

#### 1. [Naming Conventions](rules/naming-conventions.md)
Comprehensive naming guidelines for variables, functions, classes, types, and more.

**Topics covered:**
- Variable and function naming
- Class and interface naming
- Type and enum naming
- File and directory naming
- Constant naming patterns

**Cross-references:** See [Type Patterns](rules/type-patterns.md) for branded types naming

---

#### 2. [Type Patterns](rules/type-patterns.md)
Advanced TypeScript type patterns and type-level programming.

**Topics covered:**
- Branded types for type safety
- Discriminated unions
- Conditional types
- Mapped types
- Template literal types
- Type-level programming

**Cross-references:** See [Modern Features](rules/modern-features.md) for TypeScript 5.x features

---

#### 3. [Error Handling](rules/error-handling.md)
Modern error handling patterns including Result types and Effect-TS.

**Topics covered:**
- Traditional try/catch patterns
- Result types with Neverthrow
- Effect-TS introduction
- Error boundary patterns
- Custom error classes

**Cross-references:** See [Testing](rules/testing.md) for error testing strategies

---

### Advanced Topics

#### 4. [Modern Features](rules/modern-features.md)
TypeScript 5.x features and modern language capabilities.

**Topics covered:**
- Decorators (Stage 3)
- Const type parameters
- `satisfies` operator
- `using` declarations
- Import attributes

**Cross-references:** See [Type Patterns](rules/type-patterns.md) for advanced type usage

---

#### 5. [Tooling](rules/tooling.md)
Modern tooling setup and configuration.

**Topics covered:**
- ESLint flat config (ESLint 9+)
- Biome setup and migration
- tsup for library bundling
- Vitest + MSW for testing

**Cross-references:** See [Testing](rules/testing.md) for test configuration details

---

#### 6. [Security & Performance](rules/security-performance.md)
Security best practices and performance optimization.

**Topics covered:**
- Secure headers in Next.js
- Type-safe runtime validation with Zod
- Memoization patterns
- Bundle analysis and optimization
- Tree-shaking strategies

**Cross-references:** See [Tooling](rules/tooling.md) for build optimization tools

---

#### 7. [Testing](rules/testing.md)
Comprehensive testing strategies and patterns.

**Topics covered:**
- Unit/integration/e2e testing patterns
- Snapshot vs assertion testing
- Property-based testing introduction
- Test organization patterns
- MSW for API mocking

**Cross-references:** See [Tooling](rules/tooling.md) for Vitest setup

---

#### 8. [Architecture](rules/architecture.md)
Architectural patterns for scalable TypeScript applications.

**Topics covered:**
- Folder-by-convention vs folder-by-feature
- Dependency inversion principles
- Domain-driven design basics
- Layered/clean/hexagonal architecture
- Module boundaries

**Cross-references:** See [Monorepo](rules/monorepo.md) for multi-package architecture

---

#### 9. [Monorepo](rules/monorepo.md)
Complete guide to TypeScript monorepo setup and management.

**Topics covered:**
- Turborepo configuration
- pnpm workspaces
- Shared TypeScript configs
- Dependency management
- Versioning with changesets

**Cross-references:** See [Tooling](rules/tooling.md) for build tools

---

### Examples

#### Configuration Files

- **[eslint-flat-config.js](examples/eslint-flat-config.js)** - ESLint 9+ flat config with TypeScript
- **[biome.json](examples/biome.json)** - Biome configuration for linting and formatting
- **[vitest-setup.ts](examples/vitest-setup.ts)** - Vitest configuration with MSW

#### Monorepo Examples

- **[monorepo-config/](examples/monorepo-config/)** - Complete monorepo setup examples

## Usage Guide

### For AI Code Generation

When generating TypeScript code, AI agents should:

1. **Check naming conventions** in [naming-conventions.md](rules/naming-conventions.md)
2. **Use appropriate type patterns** from [type-patterns.md](rules/type-patterns.md)
3. **Follow error handling** guidelines from [error-handling.md](rules/error-handling.md)
4. **Apply modern features** when appropriate from [modern-features.md](rules/modern-features.md)
5. **Consider architecture** patterns from [architecture.md](rules/architecture.md)

### For Code Review

Use this module as a reference when reviewing TypeScript code:

- Check naming consistency
- Verify type safety practices
- Ensure proper error handling
- Validate security practices
- Review test coverage

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### Current Version: 2.0.0 (2026-02-25)

**Major additions:**
- Modern TypeScript 5.x features guide
- Comprehensive tooling setup (ESLint, Biome, tsup, Vitest)
- Security and performance best practices
- Testing strategies guide
- Architecture patterns
- Monorepo support

### Previous Versions

- **1.0.0** (2024-01-01) - Initial release with core standards

## Contributing

To contribute to this module:

1. Follow the existing structure and formatting
2. Add cross-references to related sections
3. Include practical examples
4. Update the table of contents
5. Update CHANGELOG.md with your changes
6. Increment version in VERSION file

## Metadata

- **Character Count:** ~25,000 characters
- **Files:** 9 rule files + 3 example files
- **Compatibility:** Augment Code AI 1.0.0+, Node.js 18+, TypeScript 5.0+
- **License:** MIT
- **Author:** Augment Extensions

---

**Need help?** Use `augx show typescript-standards` to view this module's content or `augx search <topic>` to find specific information.

