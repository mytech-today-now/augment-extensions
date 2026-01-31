# Bash Coding Standards

Comprehensive Bash coding standards for professional, maintainable, and secure Bash scripts.

## Overview

This module provides AI-driven guidance for writing high-quality Bash scripts across diverse project types. It includes universal best practices that apply to all Bash code, plus category-specific rules for automation, CI/CD, CLI tools, configuration, data processing, system administration, and cross-platform development.

## Installation

### With CLI (Future)
```bash
augx link coding-standards/bash
```

### Manual Setup
1. Copy this module to your project's `.augment/` folder
2. Create `.augment/bash-config.json` to configure categories
3. Reference rules in your project documentation

## Directory Structure

```
augment-extensions/coding-standards/bash/
├── module.json                          # Module metadata
├── README.md                            # This file
├── rules/
│   ├── universal-standards.md          # Cross-cutting standards
│   ├── naming-conventions.md           # Variables, functions, constants
│   ├── error-handling.md               # set -euo pipefail, traps
│   ├── security-practices.md           # Input sanitization, injection prevention
│   ├── performance-optimization.md     # Subshells, loops, pipes
│   ├── testing-guidelines.md           # Bats, shunit2 integration
│   ├── automation-scripts.md           # Category: Automation
│   ├── cicd-pipelines.md               # Category: CI/CD
│   ├── cli-tools.md                    # Category: Command-line tools
│   ├── configuration-files.md          # Category: Configuration
│   ├── data-processing.md              # Category: Data processing
│   ├── system-administration.md        # Category: System administration
│   └── cross-platform.md               # Category: Cross-platform
└── examples/
    ├── automation-example.sh
    ├── cicd-example.sh
    ├── cli-example.sh
    ├── config-example.sh
    ├── data-processing-example.sh
    ├── sysadmin-example.sh
    └── cross-platform-example.sh
```

## Core Guidelines

### Universal Standards
- **Shebang**: `#!/usr/bin/env bash` (portable) or `#!/bin/bash` (system-specific)
- **Strict Mode**: `set -euo pipefail` (exit on error, undefined variables, pipe failures)
- **Quoting**: Always quote variables: `"$var"` not `$var`
- **Functions**: Modularize code into functions
- **Error Handling**: Use traps for cleanup, check exit codes
- **Logging**: Include timestamps and severity levels

### Naming Conventions
```bash
# Variables: lowercase with underscores
user_name="john"
file_path="/tmp/data.txt"

# Constants: UPPERCASE with underscores
readonly MAX_RETRIES=3
readonly API_URL="https://api.example.com"

# Functions: lowercase with underscores
function process_data() {
    local input="$1"
    # ...
}
```

### Error Handling
```bash
#!/usr/bin/env bash
set -euo pipefail

# Trap for cleanup
trap 'cleanup' EXIT ERR

function cleanup() {
    rm -f "$temp_file"
}

# Check command success
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required" >&2
    exit 1
fi
```

### Security
```bash
# Input validation
if [[ ! "$user_input" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "Error: Invalid input" >&2
    exit 1
fi

# Avoid command injection
# ❌ Bad: eval "ls $user_input"
# ✅ Good: Use arrays and proper quoting
files=("$user_input"/*.txt)
```

## Configuration

Create `.augment/bash-config.json`:

```json
{
  "bash_categories": ["automation", "cicd"],
  "bash_version": "4.0",
  "strict_mode": true,
  "static_analysis": {
    "tool": "shellcheck",
    "severity": "warning"
  },
  "testing": {
    "framework": "bats",
    "version": "1.x"
  },
  "posix_compliance": false
}
```

## Categories

### Automation Scripts
- Idempotency patterns
- Dry-run mode
- Task scheduling integration
- Atomic operations

### CI/CD Pipelines
- Environment variable validation
- Secret management
- Debugging with `set -x`
- Rollback on failure

### CLI Tools
- Argument parsing with `getopts`
- Help output formatting
- Exit status management
- Input validation

### Configuration Files
- Sourcing mechanisms
- Conditional loading
- Alias and function definitions
- No side effects

### Data Processing
- Stream processing for large files
- awk, sed, grep patterns
- Special character escaping
- Memory-efficient operations

### System Administration
- Privilege checks
- User/group management
- Service control
- Logging and auditing

### Cross-Platform
- OS detection
- Portable command usage
- Path handling differences
- Fallback mechanisms

## Character Count

**Total**: ~TBD characters

## Contents

- 6 universal rule files
- 7 category-specific rule files
- 7 code examples
- Configuration schema
- shellcheck integration guide
- Bats testing framework guide

## References

- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- [Bash Pitfalls](https://mywiki.wooledge.org/BashPitfalls)
- [OWASP Shell Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)
- [shellcheck](https://www.shellcheck.net/)
- [Bats](https://github.com/bats-core/bats-core)

