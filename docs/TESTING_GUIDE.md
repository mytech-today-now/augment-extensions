# Testing Guide

## Overview

This guide provides comprehensive documentation for testing the Augment Extensions project, including test setup, execution, debugging, coverage requirements, and best practices.

## Table of Contents

1. [Test Architecture](#test-architecture)
2. [Running Tests](#running-tests)
3. [Writing New Tests](#writing-new-tests)
4. [Debugging Test Failures](#debugging-test-failures)
5. [Coverage Requirements](#coverage-requirements)
6. [Best Practices](#best-practices)
7. [CI/CD Integration](#cicd-integration)

## Test Architecture

### Test Frameworks

The project uses two complementary testing approaches:

1. **Vitest** - Modern, fast unit and integration testing
   - Location: `tests/` directory
   - Config: `vitest.config.ts`
   - Coverage: V8 provider
   - Target: ≥80% line, ≥70% branch

2. **Standalone Test Suite** - Comprehensive CLI command testing
   - Location: `test-all.ts`
   - Sandboxed execution
   - JSONL result output
   - Real-time progress indicators

### Directory Structure

```
augment-extensions/
├── tests/
│   ├── unit/              # Unit tests
│   │   ├── modules/       # Module operation tests
│   │   └── collections/   # Collection management tests
│   ├── integration/       # Integration tests
│   ├── helpers/           # Test utilities
│   │   ├── test-env.ts    # TestEnvironment class
│   │   ├── factories.ts   # Test data factories
│   │   └── matchers.ts    # Custom matchers
│   └── setup.ts           # Global test setup
├── test-all.ts            # Standalone test suite
└── vitest.config.ts       # Vitest configuration
```

### Core Test Components

#### 1. TestEnvironment Class (`tests/helpers/test-env.ts`)

Provides isolated test environments:

```typescript
const env = new TestEnvironment();
await env.createProject('my-project');
await env.createModule('test-module', { /* config */ });
// ... run tests
await env.cleanup();
```

Features:
- Temporary directory creation/cleanup
- Project structure setup
- Module/collection creation
- File tracking
- Automatic cleanup

#### 2. Test Factories (`tests/helpers/factories.ts`)

Generate test data:

```typescript
const module = ModuleFactory.createValid({ name: 'test' });
const collection = CollectionFactory.createWithModules(['mod1', 'mod2']);
const project = ProjectFactory.create();
```

#### 3. Custom Matchers (`tests/helpers/matchers.ts`)

Domain-specific assertions:

```typescript
expect(module).toBeValidModule();
expect(project).toHaveLinkedModule('typescript-standards');
expect(collection).toHaveCollection('web-dev');
```

## Running Tests

### Vitest Tests

```bash
# Run all tests
npm run test:vitest

# Watch mode
npm run test:vitest:watch

# With UI
npm run test:vitest:ui

# Coverage report
npm run test:vitest:coverage

# Specific test file
npx vitest run tests/unit/modules/link.test.ts

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

### Standalone Test Suite

```bash
# Run comprehensive CLI tests
npm run test:all

# Or directly
npx tsx test-all.ts
```

### All Tests

```bash
# Run both Vitest and standalone tests
npm test
```

## Writing New Tests

### Unit Test Example

```typescript
// tests/unit/my-feature.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestEnvironment } from '../helpers/test-env';

describe('My Feature', () => {
  let env: TestEnvironment;

  beforeEach(async () => {
    env = new TestEnvironment();
    await env.createProject('test-project');
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it('should do something', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await myFeature(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example

```typescript
// tests/integration/workflow.test.ts
import { describe, it, expect } from 'vitest';
import { TestEnvironment } from '../helpers/test-env';
import { ModuleFactory } from '../helpers/factories';

describe('Module Workflow', () => {
  it('should link, show, and unlink module', async () => {
    const env = new TestEnvironment();
    await env.createProject('test-project');
    
    // Create module
    const module = ModuleFactory.createValid();
    await env.createModule(module.name, module);
    
    // Link module
    await linkModule(env.projectPath, module.name);
    expect(env.projectPath).toHaveLinkedModule(module.name);
    
    // Show module
    const info = await showModule(module.name);
    expect(info).toMatchObject(module);
    
    // Unlink module
    await unlinkModule(env.projectPath, module.name);
    expect(env.projectPath).not.toHaveLinkedModule(module.name);
    
    await env.cleanup();
  });
});
```

### Adding Tests to Standalone Suite

```typescript
// test-all.ts
function testMyNewCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing MY NEW commands...\n');

  const testCases: TestCase[] = [
    {
      name: 'my command --help',
      args: ['--help'],
      expectedExitCode: 0,
      shouldContain: ['Usage:', 'Options:'],
      shouldNotContain: ['Error']
    }
  ];

  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();

    logTestStart('my-command', testCase.name);
    const result = runner.runCommand(sandbox, 'my-command', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      shouldContain: testCase.shouldContain
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}
```

## Debugging Test Failures

### Vitest Debugging

1. **Run specific test**: `npx vitest run tests/unit/modules/link.test.ts`
2. **Use debug mode**: `DEBUG=* npx vitest run`
3. **Use Vitest UI**: `npm run test:vitest:ui`

### Common Issues

#### Test Timeouts
- Increase timeout: `it('slow test', async () => { /* ... */ }, 30000);`
- Check for interactive prompts
- Verify cleanup runs

#### File System Errors
- Ensure cleanup runs in `afterEach`
- Use absolute paths
- Check file existence before operations

## Coverage Requirements

### Target Metrics
- **Line Coverage**: ≥80%
- **Branch Coverage**: ≥70%
- **Function Coverage**: ≥75%
- **Statement Coverage**: ≥80%

### Checking Coverage

```bash
npm run test:vitest:coverage
open coverage/index.html
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` and `afterEach` for setup/cleanup
- Don't rely on test execution order

### 2. Descriptive Test Names
```typescript
// Good
it('should throw error when module name is empty', () => {});

// Bad
it('test1', () => {});
```

### 3. Arrange-Act-Assert Pattern
```typescript
it('should calculate total', () => {
  // Arrange
  const items = [1, 2, 3];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(6);
});
```

### 4. Test Edge Cases
- Empty inputs
- Null/undefined values
- Maximum/minimum values
- Invalid inputs
- Boundary conditions

### 5. Use Factories for Test Data
```typescript
// Good
const module = ModuleFactory.createValid();

// Bad
const module = {
  name: 'test',
  version: '1.0.0',
  // ... many fields
};
```

### 6. Mock External Dependencies
```typescript
import { vi } from 'vitest';

vi.mock('fs-extra', () => ({
  readFile: vi.fn().mockResolvedValue('content'),
  writeFile: vi.fn().mockResolvedValue(undefined)
}));
```

### 7. Clean Up Resources
```typescript
afterEach(async () => {
  await env.cleanup();
  vi.clearAllMocks();
});
```

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Multiple platforms (Windows, Linux, macOS)
- Multiple Node versions (16, 18, 20)

See `.github/workflows/test.yml` for configuration.

### Quality Gates

All PRs must pass:
- ✅ All tests pass (100% pass rate)
- ✅ Coverage thresholds met (≥80% line, ≥70% branch)
- ✅ No linting errors
- ✅ No type errors
- ✅ Build succeeds

## Test Results Analysis

### Standalone Suite Results

```powershell
# View summary
Get-Content test-results.jsonl | ConvertFrom-Json |
  Group-Object status | Select-Object Name, Count

# View failures
Get-Content test-results.jsonl | ConvertFrom-Json |
  Where-Object { $_.status -eq 'failure' } |
  Format-Table name, exitCode

# View slowest tests
Get-Content test-results.jsonl | ConvertFrom-Json |
  Sort-Object durationMs -Descending |
  Select-Object -First 10 name, durationMs
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Coverage Reports](./coverage/index.html)

