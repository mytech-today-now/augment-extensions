module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/cli/src', '<rootDir>/augment-extensions'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'cli/src/**/*.ts',
    'augment-extensions/**/*.ts',
    '!cli/src/**/*.d.ts',
    '!augment-extensions/**/*.d.ts',
    '!cli/src/**/__tests__/**',
    '!augment-extensions/**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};

