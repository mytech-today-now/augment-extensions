# PHP Coding Standards Module

## Overview

Comprehensive PHP coding standards module for Augment Extensions, providing guidelines for modern PHP development following PSR standards and best practices across various project types.

**Version:** 1.0.0  
**Character Count:** ~186,539

---

## Key Benefits

✅ **PSR Compliance** - Full coverage of PSR-1, PSR-12, PSR-4, PSR-7, PSR-11, PSR-15, PSR-18  
✅ **Category-Specific Rules** - Tailored guidelines for web, API, CLI, CMS, e-commerce, and legacy projects  
✅ **Security-First** - OWASP PHP security best practices built-in  
✅ **Modern PHP** - PHP 8+ features including typed properties, union types, attributes  
✅ **Quality Tools** - Integration with PHPStan, Psalm, PHP-CS-Fixer, PHPUnit  
✅ **Flexible Configuration** - Category selection system for project-specific needs  

---

## Installation

### With CLI (Future)

```bash
augx link coding-standards/php
```

### Manual Setup

1. Copy module contents to your project's `.augment/` folder
2. Create configuration file at `.augment/php-config.json`
3. Configure categories for your project type

---

## Configuration

Create `.augment/php-config.json` in your project root:

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

### Supported Categories

- **web** - Web applications (MVC, template engines, form handling)
- **api** - RESTful APIs (HTTP methods, authentication, response formatting)
- **cli** - Command-line tools (Symfony Console, argument handling)
- **cms** - CMS integrations (WordPress, Drupal plugins/themes)
- **ecommerce** - E-commerce systems (shopping carts, payment gateways, WooCommerce)
- **legacy** - Legacy code migration (refactoring, namespace introduction, type hints)

---

## Directory Structure

```
augment-extensions/coding-standards/php/
├── module.json                      # Module metadata and configuration
├── README.md                        # This file
├── rules/                           # Rule files
│   ├── psr-standards.md            # PSR-1, PSR-12, PSR-4, PSR-7, PSR-11
│   ├── naming-conventions.md       # Variables, functions, classes, constants
│   ├── type-declarations.md        # Type hints, return types, strict types
│   ├── error-handling.md           # Exceptions, logging, retry patterns
│   ├── security.md                 # OWASP guidelines, input validation, XSS/SQL injection
│   ├── performance.md              # OPcache, database optimization, caching
│   ├── testing.md                  # PHPUnit, unit tests, integration tests
│   ├── documentation.md            # PHPDoc standards, inline comments
│   ├── code-quality.md             # PHPStan, PHP-CS-Fixer, Composer
│   ├── category-configuration.md   # Category selection and configuration
│   ├── web-applications.md         # MVC, template engines, form handling
│   ├── api-development.md          # RESTful design, authentication, responses
│   ├── cli-tools.md                # Symfony Console, argument handling
│   ├── cms-integration.md          # WordPress, Drupal hooks and security
│   ├── ecommerce.md                # Shopping carts, payment gateways, WooCommerce
│   └── legacy-migration.md         # Refactoring strategies, type hints, DI
└── examples/                        # Code examples
    ├── web-application-example.php
    ├── api-endpoint-example.php
    ├── cli-command-example.php
    ├── wordpress-plugin-example.php
    ├── woocommerce-extension-example.php
    └── legacy-refactoring-example.php
```

---

## Core Workflows

### 1. New PHP Project

```json
{
  "php_categories": ["web"],
  "php_version": "8.2",
  "strict_types": true,
  "static_analysis": {
    "tool": "phpstan",
    "level": 8
  }
}
```

### 2. RESTful API

```json
{
  "php_categories": ["api"],
  "psr_standards": ["PSR-1", "PSR-12", "PSR-4", "PSR-7"],
  "php_version": "8.2",
  "strict_types": true
}
```

### 3. WordPress Plugin

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

### 4. Legacy Migration

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

## Universal Rules (Applied to All Categories)

1. **PSR Standards** - PSR-1, PSR-12, PSR-4, PSR-7, PSR-11
2. **Naming Conventions** - camelCase, PascalCase, UPPER_SNAKE_CASE
3. **Type Declarations** - Strict types, type hints, return types
4. **Error Handling** - Exceptions, PSR-3 logging, retry patterns
5. **Security** - OWASP guidelines, input validation, XSS/SQL injection prevention
6. **Performance** - OPcache, database optimization, caching strategies
7. **Testing** - PHPUnit, AAA pattern, mocks and stubs
8. **Documentation** - PHPDoc blocks, inline comments
9. **Code Quality** - PHPStan, PHP-CS-Fixer, Composer best practices

---

## Category-Specific Rules

### Web Applications
- MVC architecture patterns
- Template engine usage (Twig, Blade)
- Form handling and CSRF protection
- Session management

### API Development
- RESTful design principles
- HTTP method semantics
- Authentication (OAuth 2.0, JWT)
- Response formatting and pagination

### CLI Tools
- Symfony Console component
- Argument and option handling
- Exit codes and error handling
- Progress bars for long operations

### CMS Integration
- WordPress/Drupal coding standards
- Hook and filter usage
- Nonce verification
- Shortcode implementation

### E-commerce
- Shopping cart management
- Payment gateway integration (PCI DSS)
- Order processing with transactions
- WooCommerce hooks and classes

### Legacy Migration
- Incremental refactoring strategies
- Namespace introduction
- Type hint addition
- Dependency injection patterns

---

## Contents

- **15 rule files** covering all aspects of PHP development
- **6 code examples** demonstrating best practices for each category
- **Configuration system** for category selection
- **Conflict detection** for overlapping rules
- **PSR compliance** for all major standards

---

## Dependencies

### Recommended Composer Packages

```json
{
  "require-dev": {
    "phpunit/phpunit": "^10.0",
    "phpstan/phpstan": "^1.10",
    "friendsofphp/php-cs-fixer": "^3.0"
  }
}
```

---

## Links

- [PHP-FIG PSR Standards](https://www.php-fig.org/psr/)
- [PHPStan Documentation](https://phpstan.org/)
- [PHP-CS-Fixer Documentation](https://cs.symfony.com/)
- [OWASP PHP Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html)

