# Category Configuration

## Overview

The PHP coding standards module supports multiple project categories, each with specific rules and best practices. This document explains how to configure category selection for your project.

---

## Supported Categories

The module supports the following PHP project categories:

- **web** - Web applications (MVC, template engines, form handling)
- **api** - RESTful APIs (HTTP methods, authentication, response formatting)
- **cli** - Command-line tools (Symfony Console, argument handling)
- **cms** - CMS integrations (WordPress, Drupal plugins/themes)
- **ecommerce** - E-commerce systems (shopping carts, payment gateways, WooCommerce)
- **legacy** - Legacy code migration (refactoring, namespace introduction, type hints)

---

## Configuration File

### Location

Create a configuration file in your project root:

```
.augment/php-config.json
```

### Format

```json
{
  "php_categories": ["web", "api"],
  "psr_standards": ["PSR-1", "PSR-12", "PSR-4", "PSR-7"],
  "php_version": "8.2",
  "strict_types": true,
  "static_analysis": {
    "tool": "phpstan",
    "level": 8
  },
  "code_style": {
    "tool": "php-cs-fixer",
    "ruleset": "PSR-12"
  }
}
```

### Configuration Options

#### php_categories (required)

Array of category identifiers to apply to your project.

**Examples:**
```json
// Single category
"php_categories": ["web"]

// Multiple categories
"php_categories": ["web", "api"]

// CMS-focused project
"php_categories": ["cms", "ecommerce"]
```

#### psr_standards (optional)

Array of PSR standards to enforce. Defaults to all applicable standards.

**Available standards:**
- `PSR-1` - Basic Coding Standard
- `PSR-12` - Extended Coding Style
- `PSR-4` - Autoloading
- `PSR-7` - HTTP Messages
- `PSR-11` - Container Interface
- `PSR-15` - HTTP Handlers
- `PSR-18` - HTTP Client

**Example:**
```json
"psr_standards": ["PSR-1", "PSR-12", "PSR-4"]
```

#### php_version (optional)

Minimum PHP version for your project. Defaults to `8.0`.

**Example:**
```json
"php_version": "8.2"
```

#### strict_types (optional)

Whether to enforce strict type declarations. Defaults to `true`.

**Example:**
```json
"strict_types": true
```

#### static_analysis (optional)

Configuration for static analysis tools.

**Options:**
- `tool` - Tool to use (`phpstan` or `psalm`)
- `level` - Analysis level (0-8 for PHPStan, 1-8 for Psalm)

**Example:**
```json
"static_analysis": {
  "tool": "phpstan",
  "level": 8
}
```

#### code_style (optional)

Configuration for code style enforcement.

**Options:**
- `tool` - Tool to use (`php-cs-fixer` or `phpcs`)
- `ruleset` - Ruleset to apply (`PSR-12`, `PSR-2`, etc.)

**Example:**
```json
"code_style": {
  "tool": "php-cs-fixer",
  "ruleset": "PSR-12"
}
```

---

## Rule Application

### Universal Rules

The following rules are applied to ALL categories:

- PSR Standards (psr-standards.md)
- Naming Conventions (naming-conventions.md)
- Type Declarations (type-declarations.md)
- Error Handling (error-handling.md)
- Security (security.md)
- Performance (performance.md)
- Testing (testing.md)
- Documentation (documentation.md)
- Code Quality (code-quality.md)

### Category-Specific Rules

Category-specific rules are applied based on your `php_categories` configuration:

- **web** → web-applications.md
- **api** → api-development.md
- **cli** → cli-tools.md
- **cms** → cms-integration.md
- **ecommerce** → ecommerce.md
- **legacy** → legacy-migration.md

### Rule Priority

When rules conflict between universal and category-specific:

1. **Category-specific rules take precedence** over universal rules
2. **Later categories override earlier categories** (in array order)
3. **Conflicts are logged** for manual review

---

## Conflict Detection

### Automatic Detection

The module automatically detects conflicts between:

- Universal rules and category-specific rules
- Multiple category-specific rules
- Configuration options

### Conflict Resolution

When conflicts are detected:

1. **Warning is logged** to `.augment/php-conflicts.log`
2. **Category-specific rule takes precedence**
3. **Manual review recommended** for critical conflicts

**Example conflict log:**
```
[2024-01-15 10:30:00] CONFLICT: web-applications.md overrides naming-conventions.md
  - Universal: Use camelCase for all functions
  - Web: Use snake_case for WordPress hook functions
  - Resolution: Applied web-applications.md rule
```

---

## Example Configurations

### Web Application

```json
{
  "php_categories": ["web"],
  "php_version": "8.2",
  "strict_types": true,
  "static_analysis": {
    "tool": "phpstan",
    "level": 6
  }
}
```

### RESTful API

```json
{
  "php_categories": ["api"],
  "psr_standards": ["PSR-1", "PSR-12", "PSR-4", "PSR-7"],
  "php_version": "8.2",
  "strict_types": true,
  "static_analysis": {
    "tool": "phpstan",
    "level": 8
  }
}
```

### WordPress Plugin

```json
{
  "php_categories": ["cms"],
  "php_version": "7.4",
  "strict_types": false,
  "static_analysis": {
    "tool": "phpstan",
    "level": 4
  }
}
```

### WooCommerce Extension

```json
{
  "php_categories": ["cms", "ecommerce"],
  "php_version": "7.4",
  "strict_types": false
}
```

### CLI Tool

```json
{
  "php_categories": ["cli"],
  "php_version": "8.2",
  "strict_types": true,
  "static_analysis": {
    "tool": "phpstan",
    "level": 8
  }
}
```

### Legacy Migration Project

```json
{
  "php_categories": ["legacy"],
  "php_version": "7.4",
  "strict_types": false,
  "static_analysis": {
    "tool": "phpstan",
    "level": 2
  }
}
```

---

## Default Configuration

If no configuration file is found, the following defaults are applied:

```json
{
  "php_categories": [],
  "psr_standards": ["PSR-1", "PSR-12", "PSR-4"],
  "php_version": "8.0",
  "strict_types": true,
  "static_analysis": {
    "tool": "phpstan",
    "level": 5
  },
  "code_style": {
    "tool": "php-cs-fixer",
    "ruleset": "PSR-12"
  }
}
```

**Note:** With empty `php_categories`, only universal rules are applied.

---

## Validation

### Configuration Validation

The configuration file is validated on load:

- `php_categories` must be an array of valid category identifiers
- `php_version` must be a valid PHP version string
- `static_analysis.level` must be within valid range
- All referenced tools must be available

### Error Handling

Invalid configurations result in:

1. **Error message** describing the issue
2. **Fallback to defaults** for invalid options
3. **Log entry** in `.augment/php-config-errors.log`

