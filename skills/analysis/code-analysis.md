---
id: code-analysis
name: Code Analysis
version: 1.0.0
category: analysis
tags: [mcp, analysis, quality, review, patterns]
tokenBudget: 2000
priority: medium
dependencies: []
cliCommand: augx-code-analysis
mcpServer: "@modelcontextprotocol/server-analysis"
replaces: ["domain-rules/mcp"]
---

# Code Analysis

## Purpose

Analyze code for patterns, anti-patterns, complexity, and quality issues using static analysis and pattern recognition.

## Usage

1. **Specify target**: File, directory, or pattern to analyze
2. **Choose analysis type**: complexity, patterns, security, quality
3. **Review results**: Get actionable insights and recommendations

**Analysis Types**:
- Complexity: Cyclomatic complexity, cognitive complexity
- Patterns: Design patterns, anti-patterns
- Security: Common vulnerabilities, security smells
- Quality: Code smells, maintainability issues

## Examples

### Example 1: Complexity Analysis

```bash
augx-code-analysis --file src/services/UserService.ts --type complexity
```

**Result**:
```
src/services/UserService.ts:
  authenticate() - Cyclomatic: 8, Cognitive: 12 (HIGH)
    - Recommendation: Extract validation logic to separate method
    - Lines: 45-78
  
  createUser() - Cyclomatic: 4, Cognitive: 5 (MEDIUM)
    - Acceptable complexity
    - Lines: 80-105
```

### Example 2: Pattern Detection

```bash
augx-code-analysis --dir src/services --type patterns
```

**Result**:
```
Design Patterns Found:
  ✓ Singleton: DatabaseConnection (src/db/connection.ts)
  ✓ Factory: UserFactory (src/factories/UserFactory.ts)
  ✓ Repository: UserRepository (src/repositories/UserRepository.ts)

Anti-Patterns Found:
  ⚠ God Object: ApplicationService (src/services/ApplicationService.ts)
    - 45 methods, 1200 lines
    - Recommendation: Split into domain-specific services
  
  ⚠ Circular Dependency: UserService ↔ OrderService
    - Recommendation: Introduce mediator or event bus
```

### Example 3: Security Analysis

```bash
augx-code-analysis --file src/api/auth.ts --type security
```

**Result**:
```
Security Issues:
  🔴 HIGH: SQL Injection Risk (line 45)
    - Direct string concatenation in query
    - Fix: Use parameterized queries
  
  🟡 MEDIUM: Weak Password Validation (line 78)
    - No complexity requirements
    - Fix: Enforce minimum 8 chars, mixed case, numbers
  
  🟢 LOW: Missing Rate Limiting (endpoint /login)
    - Recommendation: Add rate limiting middleware
```

### Example 4: Quality Analysis

```bash
augx-code-analysis --dir src --type quality --format json
```

**Result**:
```json
{
  "summary": {
    "filesAnalyzed": 45,
    "issuesFound": 23,
    "averageMaintainability": 72
  },
  "issues": [
    {
      "file": "src/utils/helpers.ts",
      "type": "code-smell",
      "severity": "medium",
      "issue": "Long Parameter List",
      "line": 12,
      "recommendation": "Use parameter object pattern"
    }
  ]
}
```

## CLI

### Command Syntax

```bash
augx-code-analysis [options]
```

### Options

- `--file <path>` - Single file to analyze
- `--dir <path>` - Directory to analyze (recursive)
- `--pattern <glob>` - File pattern (e.g., "src/**/*.ts")
- `--type <type>` - Analysis type: complexity, patterns, security, quality (default: quality)
- `--severity <level>` - Minimum severity: low, medium, high (default: low)
- `--format <format>` - Output format: text, json, markdown (default: text)
- `--fix` - Auto-fix issues where possible

### Examples

```bash
# Analyze single file
augx-code-analysis --file src/app.ts

# Analyze directory
augx-code-analysis --dir src/services --type complexity

# Security scan
augx-code-analysis --pattern "src/**/*.ts" --type security

# High severity only
augx-code-analysis --dir src --severity high

# JSON output
augx-code-analysis --dir src --format json
```

## Notes

**Features**:
- **Multi-Language**: Supports TypeScript, JavaScript, Python, PHP
- **Fast**: Incremental analysis with caching
- **Actionable**: Provides specific recommendations
- **Configurable**: Custom rules and thresholds

**Limitations**:
- Static analysis only (no runtime behavior)
- May produce false positives
- Best for well-typed codebases

**Performance**:
- Average analysis time: 500ms-2s per file
- Token usage: 800-2500 tokens per analysis
- Cache hit rate: ~60% for unchanged files

