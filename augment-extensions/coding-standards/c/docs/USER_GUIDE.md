# C Coding Standards - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Configuration](#configuration)
3. [Using the Extension](#using-the-extension)
4. [Categories](#categories)
5. [Rules](#rules)
6. [Customization](#customization)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

The C Coding Standards extension is part of the Augment Extensions package. It provides AI-powered coding assistance for C programming across 7 specialized categories.

### Quick Start

1. **Initialize Configuration**

Create a `.augment/c-standards.json` file in your project root:

```json
{
  "c_standards": {
    "version": "1.0.0",
    "categories": ["systems", "embedded"],
    "c_standard": "c11",
    "universal_rules": {
      "naming": "enabled",
      "memory_safety": "enabled",
      "error_handling": "enabled",
      "documentation": "enabled",
      "header_guards": "enabled",
      "const_correctness": "enabled"
    }
  }
}
```

2. **Start Coding**

The extension automatically provides context-aware suggestions as you code.

---

## Configuration

### Configuration File Location

Place your configuration in one of these locations:
- `.augment/c-standards.json` (JSON format)
- `.augment/c-standards.yaml` (YAML format)

### Configuration Options

#### Basic Settings

```json
{
  "c_standards": {
    "version": "1.0.0",
    "categories": ["systems", "embedded", "kernel"],
    "c_standard": "c11"
  }
}
```

**Options:**
- `version` - Configuration version (currently "1.0.0")
- `categories` - Array of active categories
- `c_standard` - C standard to follow ("c89", "c99", "c11", "c17", "c23")

#### Universal Rules

Six universal rules apply to all categories:

```json
{
  "universal_rules": {
    "naming": "enabled",
    "memory_safety": "enabled",
    "error_handling": "enabled",
    "documentation": "warning",
    "header_guards": "enabled",
    "const_correctness": "enabled"
  }
}
```

**Rule States:**
- `"enabled"` - Rule violations are errors
- `"warning"` - Rule violations are warnings
- `"disabled"` - Rule is not checked

#### Category Overrides

Customize rules for specific categories:

```json
{
  "category_overrides": {
    "embedded": {
      "allow_dynamic_allocation": false,
      "require_volatile_hardware": true
    },
    "realtime": {
      "max_function_complexity": 10,
      "require_deterministic_paths": true
    }
  }
}
```

#### Static Analysis Integration

```json
{
  "static_analysis": {
    "clang_tidy": true,
    "cppcheck": true,
    "valgrind": false
  }
}
```

#### Custom Rules

```json
{
  "custom_rules": {
    "enabled": true,
    "path": ".augment/c-standards/custom-rules/"
  }
}
```

### Complete Configuration Example

```json
{
  "c_standards": {
    "version": "1.0.0",
    "categories": ["systems", "embedded", "kernel"],
    "c_standard": "c11",
    "universal_rules": {
      "naming": "enabled",
      "memory_safety": "enabled",
      "error_handling": "enabled",
      "documentation": "warning",
      "header_guards": "enabled",
      "const_correctness": "enabled"
    },
    "category_overrides": {
      "embedded": {
        "allow_dynamic_allocation": false
      }
    },
    "static_analysis": {
      "clang_tidy": true,
      "cppcheck": true,
      "valgrind": false
    },
    "custom_rules": {
      "enabled": false,
      "path": ".augment/c-standards/custom-rules/"
    }
  }
}
```

---

## Using the Extension

### AI-Powered Suggestions

The extension provides context-aware suggestions based on:
- File path (automatically detects category)
- Code context
- Active rules
- Configuration settings

### Code Evaluation

Evaluate your code against standards:

```typescript
import { RuleEvaluator } from '@augment/c-standards';

const evaluator = new RuleEvaluator(registry, configManager);
const violations = await evaluator.evaluate(code, {
  filePath: '/project/src/main.c',
  rules: ['universal-naming', 'universal-memory-safety']
});
```

### Prompt Generation

Generate AI prompts for code assistance:

```typescript
import { PromptGenerator } from '@augment/c-standards';

const generator = new PromptGenerator(registry, configManager);
const prompt = await generator.generatePrompt({
  filePath: '/project/embedded/sensor.c',
  codeContext: 'volatile uint32_t* reg;'
});
```

---

## Categories

The extension supports 7 specialized C programming categories:

### 1. Systems Programming

**Focus:** POSIX compliance, system calls, process management

**File Patterns:** `**/systems/**`, `**/posix/**`

**Key Rules:**
- POSIX API usage
- Error handling for system calls
- Resource management

### 2. Embedded Systems

**Focus:** Hardware interaction, resource constraints, real-time behavior

**File Patterns:** `**/embedded/**`, `**/firmware/**`

**Key Rules:**
- Volatile for hardware registers
- No dynamic allocation (configurable)
- Interrupt safety

### 3. Kernel Development

**Focus:** Linux kernel style, kernel APIs, module development

**File Patterns:** `**/kernel/**`, `**/drivers/kernel/**`

**Key Rules:**
- Kernel coding style
- Kernel API usage
- Module initialization

### 4. Device Drivers

**Focus:** Hardware drivers, DMA, interrupt handling

**File Patterns:** `**/drivers/**`

**Key Rules:**
- Driver error handling
- Resource cleanup
- Hardware abstraction

### 5. Real-time Systems

**Focus:** Deterministic execution, timing constraints

**File Patterns:** `**/realtime/**`, `**/rtos/**`

**Key Rules:**
- Deterministic paths
- Priority inversion prevention
- Timing analysis

### 6. Networking

**Focus:** Network protocols, byte order, socket programming

**File Patterns:** `**/network/**`, `**/net/**`

**Key Rules:**
- Network byte order
- Socket error handling
- Protocol compliance

### 7. Legacy Code

**Focus:** Maintaining compatibility, gradual modernization

**File Patterns:** `**/legacy/**`, `**/compat/**`

**Key Rules:**
- Backward compatibility
- Gradual refactoring
- Documentation of legacy patterns

---

## Rules

### Universal Rules

These 6 rules apply to all categories:

#### 1. Naming Conventions

**Rule ID:** `universal-naming`

**Description:** Use snake_case for functions and variables, UPPER_CASE for macros and constants.

**Examples:**

✅ Good:
```c
int calculate_sum(int a, int b);
const int MAX_BUFFER_SIZE = 1024;
#define PI 3.14159
```

❌ Bad:
```c
int CalculateSum(int a, int b);
const int maxBufferSize = 1024;
#define Pi 3.14159
```

#### 2. Memory Safety

**Rule ID:** `universal-memory-safety`

**Description:** Always check malloc/calloc return values and free allocated memory.

**Examples:**

✅ Good:
```c
int* ptr = malloc(sizeof(int) * 10);
if (ptr == NULL) {
    return -1;
}
// Use ptr
free(ptr);
```

❌ Bad:
```c
int* ptr = malloc(sizeof(int) * 10);
*ptr = 5; // No null check
// Memory leak - no free
```

#### 3. Error Handling

**Rule ID:** `universal-error-handling`

**Description:** Check return values and handle errors appropriately.

#### 4. Documentation

**Rule ID:** `universal-documentation`

**Description:** Document functions, complex logic, and public APIs.

#### 5. Header Guards

**Rule ID:** `universal-header-guards`

**Description:** Use include guards in all header files.

#### 6. Const Correctness

**Rule ID:** `universal-const-correctness`

**Description:** Use const for read-only data and parameters.

---

## Customization

### Creating Custom Rules

1. **Enable Custom Rules**

```json
{
  "custom_rules": {
    "enabled": true,
    "path": ".augment/c-standards/custom-rules/"
  }
}
```

2. **Create Rule File**

Create a Markdown file in the custom rules directory:

```markdown
# Rule: My Custom Rule

## Metadata
- **ID**: custom-my-rule
- **Category**: custom
- **Severity**: WARNING

## Description
Description of your custom rule.

## Examples

### Bad Example
\`\`\`c
// Bad code
\`\`\`

### Good Example
\`\`\`c
// Good code
\`\`\`
```

### Rule Overrides

Override rule severity or enable/disable rules:

```typescript
import { RuleOverrideSystem } from '@augment/c-standards';

const overrideSystem = new RuleOverrideSystem(registry, configManager);

// Change severity
overrideSystem.applyOverride('universal-naming', {
  severity: 'WARNING'
});

// Disable rule
overrideSystem.applyOverride('universal-documentation', {
  enabled: false
});
```

### Custom Templates

Create custom prompt templates:

```markdown
# C Coding Standards - {category}

## Active Rules
{rules}

## Project-Specific Guidelines
- Follow our team's coding style
- Use our custom error handling macros
```

---

## Troubleshooting

### Common Issues

#### Configuration Not Loading

**Problem:** Configuration file is not being loaded.

**Solutions:**
1. Check file location: `.augment/c-standards.json` or `.augment/c-standards.yaml`
2. Validate JSON/YAML syntax
3. Check file permissions

#### Rules Not Applying

**Problem:** Rules are not being applied to code.

**Solutions:**
1. Verify rules are enabled in configuration
2. Check category matches file path
3. Reload configuration: `configManager.reload()`

#### Performance Issues

**Problem:** Slow rule evaluation.

**Solutions:**
1. Reduce number of active categories
2. Disable unused rules
3. Use caching: `registry.clearCache()` to reset if needed

### Getting Help

- Check the [API Documentation](./API.md)
- Review [Configuration Reference](./CONFIGURATION.md)
- See [Examples](../examples/)

### Debugging

Enable debug logging:

```typescript
import { setLogLevel } from '@augment/c-standards';

setLogLevel('debug');
```

View configuration:

```typescript
const config = configManager.getConfiguration();
console.log(JSON.stringify(config, null, 2));
```

List loaded rules:

```typescript
const allRules = registry.getAllRules();
console.log(`Loaded ${allRules.length} rules`);
```

---

## Best Practices

### 1. Start with Universal Rules

Enable all 6 universal rules first, then add category-specific rules as needed.

### 2. Use Appropriate Categories

Select categories that match your project type:
- Embedded firmware → `embedded`
- Linux kernel module → `kernel`
- Network application → `systems`, `networking`

### 3. Customize Gradually

Start with default configuration, then customize based on your team's needs.

### 4. Document Overrides

When overriding rules, document the reason in your configuration:

```json
{
  "category_overrides": {
    "embedded": {
      "allow_dynamic_allocation": false,
      "_comment": "Disabled for safety-critical embedded systems"
    }
  }
}
```

### 5. Regular Updates

Keep rules and configuration up to date with your project's evolution.

---

## Next Steps

- Read the [API Documentation](./API.md) for programmatic usage
- Explore [Examples](../examples/) for common patterns
- Review the [Rule Catalog](./RULES.md) for all available rules
- Check the [Configuration Reference](./CONFIGURATION.md) for detailed options

