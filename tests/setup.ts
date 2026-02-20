/**
 * Vitest Global Setup
 * 
 * This file runs before all tests and sets up the global test environment.
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { registerMatchers } from './helpers/matchers';

// Register custom matchers
registerMatchers();

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.AUGMENT_TEST_MODE = 'true';
});

// Global test teardown
afterAll(() => {
  // Cleanup any global resources
});

// Per-test setup
beforeEach(() => {
  // Reset any global state before each test
});

// Per-test teardown
afterEach(() => {
  // Cleanup after each test
});

