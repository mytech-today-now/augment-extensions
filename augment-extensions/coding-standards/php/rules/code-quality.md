# Code Quality Tools

## Overview

Code quality tools help maintain consistent standards, catch bugs early, and improve overall code quality. This document defines standards for static analysis, code style enforcement, and dependency management.

---

## Static Analysis

### PHPStan

**Rules:**
- Use PHPStan for static analysis
- Start with level 0 and progressively increase
- Run static analysis in CI/CD pipeline
- Use baseline files for legacy code

**Configuration (phpstan.neon):**
```neon
# ✅ Good - PHPStan configuration
parameters:
    level: 8
    paths:
        - src
        - tests
    excludePaths:
        - src/Legacy/*
    ignoreErrors:
        - '#Call to an undefined method#'
```

**Usage:**
```bash
# ✅ Good - Run PHPStan
./vendor/bin/phpstan analyse

# ✅ Good - Generate baseline for legacy code
./vendor/bin/phpstan analyse --generate-baseline

# ✅ Good - Run with specific level
./vendor/bin/phpstan analyse --level=8
```

**Levels:**
- Level 0: Basic checks
- Level 4: Dead code detection
- Level 6: Type checking
- Level 8: Strict type checking (recommended for new projects)

### Psalm

**Rules:**
- Psalm is an alternative to PHPStan
- Use either PHPStan or Psalm, not both
- Configure error levels appropriately

**Configuration (psalm.xml):**
```xml
<?xml version="1.0"?>
<psalm
    errorLevel="3"
    resolveFromConfigFile="true"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="https://getpsalm.org/schema/config"
    xsi:schemaLocation="https://getpsalm.org/schema/config vendor/vimeo/psalm/config.xsd"
>
    <projectFiles>
        <directory name="src" />
        <ignoreFiles>
            <directory name="vendor" />
        </ignoreFiles>
    </projectFiles>
</psalm>
```

**Usage:**
```bash
# ✅ Good - Run Psalm
./vendor/bin/psalm

# ✅ Good - Fix issues automatically
./vendor/bin/psalm --alter --issues=all
```

---

## Code Style Enforcement

### PHP_CodeSniffer

**Rules:**
- Use PHP_CodeSniffer to detect style violations
- Follow PSR-12 coding standard
- Configure custom rules when needed
- Run in CI/CD pipeline

**Configuration (phpcs.xml):**
```xml
<?xml version="1.0"?>
<ruleset name="Project Coding Standard">
    <description>Project coding standard based on PSR-12</description>
    
    <!-- Use PSR-12 as base -->
    <rule ref="PSR12"/>
    
    <!-- Paths to check -->
    <file>src</file>
    <file>tests</file>
    
    <!-- Exclude patterns -->
    <exclude-pattern>*/vendor/*</exclude-pattern>
    <exclude-pattern>*/cache/*</exclude-pattern>
    
    <!-- Custom rules -->
    <rule ref="Generic.Files.LineLength">
        <properties>
            <property name="lineLimit" value="120"/>
            <property name="absoluteLineLimit" value="150"/>
        </properties>
    </rule>
</ruleset>
```

**Usage:**
```bash
# ✅ Good - Check code style
./vendor/bin/phpcs

# ✅ Good - Check specific files
./vendor/bin/phpcs src/Services/UserService.php

# ✅ Good - Show progress
./vendor/bin/phpcs -p

# ✅ Good - Generate report
./vendor/bin/phpcs --report=summary
```

### PHP-CS-Fixer

**Rules:**
- Use PHP-CS-Fixer for automatic code formatting
- Configure to match PSR-12 standard
- Run before committing code
- Use in pre-commit hooks

**Configuration (.php-cs-fixer.php):**
```php
<?php

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__ . '/src')
    ->in(__DIR__ . '/tests')
    ->exclude('vendor')
    ->exclude('cache');

$config = new PhpCsFixer\Config();
return $config
    ->setRules([
        '@PSR12' => true,
        'array_syntax' => ['syntax' => 'short'],
        'ordered_imports' => ['sort_algorithm' => 'alpha'],
        'no_unused_imports' => true,
        'not_operator_with_successor_space' => true,
        'trailing_comma_in_multiline' => true,
        'phpdoc_scalar' => true,
        'unary_operator_spaces' => true,
        'binary_operator_spaces' => true,
        'blank_line_before_statement' => [
            'statements' => ['break', 'continue', 'declare', 'return', 'throw', 'try'],
        ],
        'phpdoc_single_line_var_spacing' => true,
        'phpdoc_var_without_name' => true,
    ])
    ->setFinder($finder);
```

**Usage:**
```bash
# ✅ Good - Fix code style
./vendor/bin/php-cs-fixer fix

# ✅ Good - Dry run (show what would be fixed)
./vendor/bin/php-cs-fixer fix --dry-run --diff

# ✅ Good - Fix specific directory
./vendor/bin/php-cs-fixer fix src/Services
```

---

## Dependency Management

### Composer

**Rules:**
- Use Composer for ALL dependency management
- Specify version constraints appropriately
- Commit composer.lock to version control
- Regularly check for security vulnerabilities

**composer.json Best Practices:**
```json
{
    "name": "myapp/project",
    "description": "Project description",
    "type": "project",
    "require": {
        "php": "^8.2",
        "symfony/console": "^6.0",
        "monolog/monolog": "^3.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^10.0",
        "phpstan/phpstan": "^1.10",
        "friendsofphp/php-cs-fixer": "^3.0"
    },
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\": "tests/"
        }
    },
    "config": {
        "optimize-autoloader": true,
        "preferred-install": "dist",
        "sort-packages": true
    }
}
```

**Version Constraints:**
```json
{
    "require": {
        "vendor/package": "^1.0",      // ✅ Good - Caret (allows 1.x updates)
        "vendor/package": "~1.2",      // ✅ Good - Tilde (allows 1.2.x updates)
        "vendor/package": "1.2.3",     // ⚠️ Caution - Exact version (no updates)
        "vendor/package": "*",         // ❌ Bad - Any version (unstable)
        "vendor/package": "dev-main"   // ❌ Bad - Development branch (unstable)
    }
}
```

**Usage:**
```bash
# ✅ Good - Install dependencies
composer install

# ✅ Good - Update dependencies
composer update

# ✅ Good - Add new dependency
composer require vendor/package

# ✅ Good - Add dev dependency
composer require --dev phpunit/phpunit

# ✅ Good - Check for security vulnerabilities
composer audit

# ✅ Good - Validate composer.json
composer validate

# ✅ Good - Optimize autoloader for production
composer dump-autoload --optimize
```

### Security Auditing

**Rules:**
- Run security audits regularly
- Update vulnerable dependencies promptly
- Subscribe to security advisories

**Tools:**
```bash
# ✅ Good - Composer audit
composer audit

# ✅ Good - Local PHP Security Checker
local-php-security-checker

# ✅ Good - Roave Security Advisories (prevents installation of vulnerable packages)
composer require --dev roave/security-advisories:dev-latest
```

---

## Pre-commit Hooks

### Git Hooks

**Rules:**
- Use pre-commit hooks to enforce quality standards
- Run fast checks only (save slow checks for CI)
- Allow developers to bypass in emergencies

**Example (.git/hooks/pre-commit):**
```bash
#!/bin/bash

echo "Running pre-commit checks..."

# Run PHP-CS-Fixer
echo "Checking code style..."
./vendor/bin/php-cs-fixer fix --dry-run --diff
if [ $? -ne 0 ]; then
    echo "Code style issues found. Run: ./vendor/bin/php-cs-fixer fix"
    exit 1
fi

# Run PHPStan
echo "Running static analysis..."
./vendor/bin/phpstan analyse --no-progress
if [ $? -ne 0 ]; then
    echo "Static analysis failed."
    exit 1
fi

# Run tests
echo "Running tests..."
./vendor/bin/phpunit --testsuite=unit
if [ $? -ne 0 ]; then
    echo "Tests failed."
    exit 1
fi

echo "All checks passed!"
exit 0
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: PHP Quality Checks

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          
      - name: Install dependencies
        run: composer install --prefer-dist --no-progress
        
      - name: Run PHP-CS-Fixer
        run: ./vendor/bin/php-cs-fixer fix --dry-run --diff
        
      - name: Run PHPStan
        run: ./vendor/bin/phpstan analyse
        
      - name: Run tests
        run: ./vendor/bin/phpunit --coverage-text
        
      - name: Security audit
        run: composer audit
```

---

## Best Practices

### Progressive Improvement

**Rules:**
- Start with lower strictness levels
- Gradually increase standards
- Use baseline files for legacy code
- Fix new code to higher standards

### Automation

**Rules:**
- Automate quality checks in CI/CD
- Use pre-commit hooks for fast feedback
- Generate reports for tracking progress

### Team Alignment

**Rules:**
- Document quality standards in README
- Share configurations across team
- Review and update standards regularly

