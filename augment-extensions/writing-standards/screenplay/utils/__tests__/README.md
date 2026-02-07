# Screenplay Module Testing

## Overview

This directory contains test utilities and test suites for the screenplay module.

## Test Structure

```
__tests__/
├── README.md                    # This file
├── test-utils.ts               # Shared test utilities and sample data
├── config-loader.test.ts       # Configuration loading tests
└── file-organization.test.ts   # File organization tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Verbose Output
```bash
npm run test:verbose
```

## Test Utilities

### Sample Configurations

The `test-utils.ts` file provides sample configurations for testing:

- `sampleConfigs.singleGenre` - Single genre selection
- `sampleConfigs.hybridGenre` - Multiple genres with hybrid mode
- `sampleConfigs.multipleThemes` - Multiple theme selection
- `sampleConfigs.fullFeatures` - All features enabled
- `sampleConfigs.allDisabled` - All features disabled

### Helper Functions

- `createTempConfig(config)` - Creates temporary configuration file
- `cleanupTempFiles(filePath)` - Removes temporary test files
- `validateConfig(config)` - Validates configuration against schema

### Sample Test Data

- `sampleTestData.genres` - List of available genres
- `sampleTestData.themes` - List of available themes
- `sampleTestData.styles` - List of available styles

## Writing Tests

### Example Test

```typescript
import { sampleConfigs, validateConfig } from './test-utils';

describe('My Feature', () => {
  test('should validate configuration', () => {
    const result = validateConfig(sampleConfigs.singleGenre);
    expect(result.valid).toBe(true);
  });
});
```

### Best Practices

1. **Use Sample Configs**: Leverage `sampleConfigs` for consistent test data
2. **Clean Up**: Always clean up temporary files in `afterEach` hooks
3. **Descriptive Names**: Use clear, descriptive test names
4. **Test Edge Cases**: Include tests for invalid inputs and edge cases
5. **Coverage**: Aim for >80% code coverage

## Coverage Thresholds

The module enforces the following coverage thresholds:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Categories

### Configuration Tests (`config-loader.test.ts`)

Tests for configuration loading and validation:
- Valid configuration validation
- Invalid configuration rejection
- File operations (create, read, cleanup)
- Feature selection logic

### File Organization Tests (`file-organization.test.ts`)

Tests for file organization utilities:
- Project naming logic
- Directory creation
- File path resolution
- Conflict resolution

## Adding New Tests

1. Create test file in `__tests__/` directory
2. Import test utilities: `import { ... } from './test-utils'`
3. Write test suites using Jest
4. Run tests to verify
5. Check coverage report

## Continuous Integration

Tests are run automatically on:
- Pull requests
- Commits to main branch
- Release builds

## Troubleshooting

### Tests Failing

1. Check test output for specific errors
2. Verify sample data is correct
3. Ensure temporary files are cleaned up
4. Check Jest configuration

### Coverage Below Threshold

1. Identify uncovered code in coverage report
2. Add tests for uncovered branches/functions
3. Run `npm run test:coverage` to verify

### TypeScript Errors

1. Run `npm run type-check` to identify issues
2. Ensure types are correctly imported
3. Check tsconfig.json configuration

## Resources

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://testingjavascript.com/)

