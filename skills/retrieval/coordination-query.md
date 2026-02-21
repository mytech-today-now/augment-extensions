---
id: coordination-query
name: Coordination Query
version: 1.0.0
category: retrieval
tags: [coordination, openspec, beads, rules, relationships]
tokenBudget: 3000
priority: high
dependencies: []
cliCommand: augx-coord
---

# Coordination Query

## Purpose

Query the coordination manifest (`.augment/coordination.json`) to discover relationships between OpenSpec specs, Beads tasks, `.augment/` rules, and files. Essential for understanding project structure and dependencies.

## Usage

1. **Query specs**: List all active OpenSpec specifications
2. **Query tasks**: Find Beads tasks related to a spec
3. **Query rules**: Find `.augment/` rules related to a task
4. **Query files**: Find specs and tasks governing a file

**Query Types**:
- Active specs: All OpenSpec specs with status "active"
- Tasks for spec: Beads tasks implementing a spec
- Rules for task: `.augment/` rules applicable to a task
- Specs for file: Specs governing a specific file
- Tasks for file: Tasks that created/modified a file

## Examples

### Example 1: List Active Specs

```bash
augx coord specs
```

**Result**:
```
📋 Active Specs

testing/functional-tests
  Path: openspec/specs/testing/functional-tests.md
  Status: active
  Related Tasks: 3
  Related Rules: testing-standards, typescript-standards

api/authentication
  Path: openspec/specs/api/authentication.md
  Status: active
  Related Tasks: 5
  Related Rules: security-standards, api-design
```

### Example 2: Find Tasks for Spec

```bash
augx coord tasks testing/functional-tests
```

**Result**:
```
📋 Tasks for Spec: testing/functional-tests

bd-test.1 - Implement unit tests
  Status: in_progress
  Priority: 0
  Owner: augment-ai

bd-test.2 - Implement integration tests
  Status: open
  Priority: 1
  Owner: augment-ai

bd-test.3 - Setup test infrastructure
  Status: closed
  Priority: 0
  Owner: augment-ai
```

### Example 3: Find Rules for Task

```bash
augx coord rules bd-test.1
```

**Result**:
```
📋 Rules for Task: bd-test.1

testing-standards
  Path: .augment/rules/testing-standards.md
  Type: testing

typescript-standards
  Path: .augment/rules/typescript-standards.md
  Type: coding-standards
```

### Example 4: Find Specs for File

```bash
augx coord file src/tests/auth.test.ts
```

**Result**:
```
📋 Specs for File: src/tests/auth.test.ts

testing/functional-tests
  Status: active
  Related Tasks: 3

api/authentication
  Status: active
  Related Tasks: 5
```

### Example 5: Find Tasks for File

```bash
augx coord file-tasks src/tests/auth.test.ts
```

**Result**:
```
📋 Tasks for File: src/tests/auth.test.ts

bd-test.1 - Implement unit tests
  Created file: src/tests/auth.test.ts
  Status: in_progress

bd-api.3 - Add authentication tests
  Modified file: src/tests/auth.test.ts
  Status: closed
```

### Example 6: JSON Output for Scripting

```bash
augx coord specs --json
```

**Result**:
```json
[
  {
    "id": "testing/functional-tests",
    "path": "openspec/specs/testing/functional-tests.md",
    "status": "active",
    "relatedTasks": ["bd-test.1", "bd-test.2", "bd-test.3"],
    "relatedRules": ["testing-standards", "typescript-standards"],
    "affectedFiles": ["src/tests/**/*.test.ts"]
  }
]
```

## CLI

### Command Syntax

```bash
augx coord specs [options]
augx coord tasks <spec-id> [options]
augx coord rules <task-id> [options]
augx coord file <file-path> [options]
augx coord file-tasks <file-path> [options]
```

### Options

- `--json` - JSON output format

### Examples

```bash
# List active specs
augx coord specs
augx coord specs --json

# Find tasks for spec
augx coord tasks testing/functional-tests
augx coord tasks testing/functional-tests --json

# Find rules for task
augx coord rules bd-test.1
augx coord rules bd-test.1 --json

# Find specs for file
augx coord file src/tests/auth.test.ts
augx coord file src/tests/auth.test.ts --json

# Find tasks for file
augx coord file-tasks src/tests/auth.test.ts
```

## Notes

**Features**:
- **Bidirectional Queries**: Navigate from specs to tasks to files and back
- **Fast**: In-memory queries from coordination manifest
- **JSON Output**: Machine-readable for scripting
- **Comprehensive**: Covers all coordination relationships

**Coordination Manifest Structure**:
```json
{
  "specs": {
    "testing/functional-tests": {
      "path": "openspec/specs/testing/functional-tests.md",
      "status": "active",
      "relatedTasks": ["bd-test.1", "bd-test.2"],
      "relatedRules": ["testing-standards"],
      "affectedFiles": ["src/tests/**/*.test.ts"]
    }
  },
  "tasks": {
    "bd-test.1": {
      "relatedSpecs": ["testing/functional-tests"],
      "relatedRules": ["testing-standards"],
      "createdFiles": ["src/tests/auth.test.ts"],
      "modifiedFiles": []
    }
  }
}
```

**Use Cases**:
- AI agents discovering project structure
- Finding which spec governs a file
- Identifying tasks implementing a spec
- Discovering applicable rules for a task
- Tracing file changes to tasks and specs

