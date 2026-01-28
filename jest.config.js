module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/cli/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'cli/src/**/*.ts',
    '!cli/src/**/*.d.ts',
    '!cli/src/**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};

