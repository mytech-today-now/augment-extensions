module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/cli/src', '<rootDir>/augment-extensions', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^uuid$': '<rootDir>/__mocks__/uuid.js',  // Mock uuid module
    '^chalk$': '<rootDir>/__mocks__/chalk.js'  // Mock chalk module for ESM compatibility
  },
  collectCoverageFrom: [
    'cli/src/**/*.ts',
    'augment-extensions/**/*.ts',
    '!cli/src/**/*.d.ts',
    '!augment-extensions/**/*.d.ts',
    '!cli/src/**/__tests__/**',
    '!augment-extensions/**/__tests__/**',
    '!test-all.ts'  // Exclude test-all.ts from coverage (it's a test file)
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 120000  // 2 minute timeout for comprehensive tests
};

