# C Coding Standards

Comprehensive C programming language coding standards for Augment Code AI, covering systems programming, embedded systems, kernel development, device drivers, real-time systems, networking, and legacy code maintenance.

## Overview

This extension provides category-based coding standards for C development, with universal rules that apply across all categories and specialized rules for specific domains.

## Installation

### Using augx CLI

```bash
# Link the module to your project
augx link coding-standards/c

# Verify installation
augx show c-standards
```

### Manual Installation

Copy the contents of this directory to your project's `.augment/` folder.

## Quick Start

1. **Configure Categories**: Create `.augment/c-standards.json`:

```json
{
  "c_standards": {
    "version": "1.0.0",
    "categories": ["systems"],
    "c_standard": "c11"
  }
}
```

2. **Start Coding**: The extension will automatically apply rules based on your configuration.

## Categories

### Systems Programming
- POSIX compliance
- Process management
- Inter-process communication (IPC)
- Signal handling
- File I/O and system calls

### Embedded Systems
- Microcontroller programming
- Interrupt service routines (ISRs)
- Hardware register access
- Memory-constrained environments
- Fixed-size buffers

### Kernel Development
- Linux kernel modules
- Kernel subsystems
- Device drivers (character, block, network)
- Kernel APIs and conventions

### Device Drivers
- GPIO drivers
- DMA transfers
- Interrupt handling
- Platform devices
- Device tree integration

### Real-Time Systems
- RTOS integration
- Task scheduling
- Priority management
- Deterministic execution
- Timing constraints

### Networking
- Socket programming
- Protocol implementation
- Packet processing
- Network drivers
- TCP/IP stack integration

### Legacy Code
- Code modernization
- Refactoring strategies
- Migration to modern C standards
- Compatibility maintenance

## Universal Rules

These rules apply to all categories:

1. **Naming Conventions**: snake_case for functions/variables, UPPER_CASE for macros
2. **Memory Safety**: Proper allocation, deallocation, and bounds checking
3. **Error Handling**: Check all return values, use errno appropriately
4. **Documentation**: Doxygen-style comments for all public APIs
5. **Header Guards**: Use include guards or `#pragma once`
6. **Const Correctness**: Use `const` for immutable data

## Configuration

### Configuration File

Create `.augment/c-standards.json` or `.augment/c-standards.yaml`:

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
      "documentation": "warning",
      "header_guards": "enabled",
      "const_correctness": "warning"
    },
    "category_overrides": {
      "embedded": {
        "allow_dynamic_allocation": false,
        "require_volatile_hardware": true,
        "max_stack_depth": 5
      }
    },
    "static_analysis": {
      "clang_tidy": true,
      "cppcheck": true,
      "valgrind": false
    }
  }
}
```

### Rule Severity Levels

- `enabled`: Enforce rule (errors)
- `warning`: Warn about violations
- `disabled`: Ignore rule

## Examples

See the `examples/` directory for complete, compilable examples for each category.

## Static Analysis Integration

This extension integrates with:
- **clang-tidy**: Modern C/C++ linter
- **cppcheck**: Static analysis tool
- **valgrind**: Memory debugging and profiling

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file.

## Links

- [Documentation](https://github.com/mytech-today-now/augment-extensions/tree/main/augment-extensions/coding-standards/c)
- [Issues](https://github.com/mytech-today-now/augment-extensions/issues)
- [Augment Extensions](https://github.com/mytech-today-now/augment-extensions)

