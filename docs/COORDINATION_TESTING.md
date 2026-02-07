# OpenSpec/Beads Coordination Testing

This document describes the integration testing strategy for the OpenSpec/Beads coordination system.

## Overview

The coordination system harmonizes three key components:
- **OpenSpec**: Specifications defining what needs to be built
- **Beads**: Tasks tracking how it's being built
- **`.augment/` Rules**: Guidelines for building

Integration tests ensure these components work together seamlessly.

## Test Coverage

### Core Functionality Tests
Located in `cli/src/__tests__/integration/coordination.integration.test.ts`

#### 1. Coordination Manifest Reading
- ✅ Read manifest successfully
- ✅ Cache manifest for performance
- ✅ Handle missing manifest files
- ✅ Handle malformed JSON

#### 2. OpenSpec Integration
- ✅ Get all active specs
- ✅ Filter out archived specs
- ✅ Get tasks for a specific spec
- ✅ Match file patterns with wildcards
- ✅ Get specs governing a file

#### 3. Beads Integration
- ✅ Get rules for a specific task
- ✅ Get tasks that created a file
- ✅ Get tasks that modified a file
- ✅ Distinguish between creator and modifier tasks

#### 4. Cross-System Integration
- ✅ Bidirectional linking: specs ↔ tasks
- ✅ Bidirectional linking: tasks ↔ rules
- ✅ File lineage through tasks
- ✅ Rule application through tasks

#### 5. Performance Requirements
- ✅ All queries complete in <100ms
- ✅ Handle large manifests (100 specs, 500 tasks, 1000 files)
- ✅ Efficient caching

#### 6. Data Integrity
- ✅ Referential integrity: specs → tasks
- ✅ Referential integrity: tasks → rules
- ✅ Referential integrity: files → tasks
- ✅ Referential integrity: files → specs

#### 7. Error Handling
- ✅ Malformed JSON
- ✅ Missing required fields
- ✅ Circular dependencies

### Workflow Tests
Located in `cli/src/__tests__/integration/coordination-workflow.integration.test.ts`

#### 1. New Feature Development Workflow
Tests complete workflow from specification to implementation:
1. Create OpenSpec specification
2. Create coordination manifest with spec
3. AI agent queries for active work
4. AI agent finds tasks for the spec
5. AI agent identifies ready tasks (no blockers)
6. AI agent loads rules for the task
7. AI agent creates file and tracks it

#### 2. Task Dependency Resolution
- ✅ Identify tasks blocked by dependencies
- ✅ Identify ready tasks (no open dependencies)
- ✅ Identify parallelizable tasks

#### 3. File Tracking and Lineage
- ✅ Track complete file history
- ✅ Distinguish creator from modifiers
- ✅ Link files to governing specs

## Running Tests

### All Integration Tests
```bash
npm test -- --testPathPattern=integration
```

### Specific Test File
```bash
npm test -- coordination.integration.test.ts
npm test -- coordination-workflow.integration.test.ts
```

### With Coverage
```bash
npm test -- --coverage --testPathPattern=integration
```

### Watch Mode
```bash
npm test -- --watch --testPathPattern=integration
```

## Test Data

Tests use dynamically created fixtures in `__fixtures__/` directories:

### Example Coordination Manifest
```json
{
  "version": "1.0.0",
  "specs": {
    "test-feature": {
      "path": "openspec/specs/test-feature.md",
      "status": "active",
      "relatedTasks": ["bd-test1", "bd-test2"],
      "relatedRules": ["test-rule.md"],
      "affectedFiles": ["src/**/*.ts"],
      "dependencies": []
    }
  },
  "tasks": {
    "bd-test1": {
      "title": "Implement core functionality",
      "status": "in_progress",
      "relatedSpecs": ["test-feature"],
      "relatedRules": ["test-rule.md"],
      "outputFiles": ["src/core.ts"],
      "dependencies": []
    }
  },
  "rules": {
    "test-rule.md": {
      "path": ".augment/rules/test-rule.md",
      "appliesTo": {
        "filePatterns": ["src/**/*.ts"],
        "specs": ["test-feature"],
        "tasks": ["bd-test1"]
      },
      "priority": "high"
    }
  },
  "files": {
    "src/core.ts": {
      "createdBy": "bd-test1",
      "modifiedBy": [],
      "governedBy": ["test-feature"],
      "rulesApplied": ["test-rule.md"]
    }
  }
}
```

## Performance Benchmarks

All coordination queries must meet these performance requirements:

| Query Type | Max Duration | Test Coverage |
|------------|--------------|---------------|
| `getActiveSpecs()` | <100ms | ✅ |
| `getTasksForSpec()` | <100ms | ✅ |
| `getRulesForTask()` | <100ms | ✅ |
| `getSpecForFile()` | <100ms | ✅ |
| `getTasksForFile()` | <100ms | ✅ |

Large manifest performance (100 specs, 500 tasks, 1000 files):
- All queries: <100ms ✅

## CI/CD Integration

Integration tests run automatically:
- ✅ On pull requests
- ✅ On commits to main branch
- ✅ Before releases

## Adding New Tests

When adding new integration tests:

1. **Create test file** in `cli/src/__tests__/integration/`
2. **Follow naming**: `*.integration.test.ts`
3. **Use fixtures**: Create in `__fixtures__/` subdirectory
4. **Clean up**: Remove fixtures in `afterAll()`
5. **Document**: Update this file and README

## Related Documentation

- [Coordination System Rules](../.augment/rules/coordination-system.md)
- [OpenSpec Workflow](../augment-extensions/workflows/openspec/)
- [Beads Workflow](../augment-extensions/workflows/beads/)
- [Integration Test README](../cli/src/__tests__/integration/README.md)

