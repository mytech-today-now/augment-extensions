import { describe, it, expect } from 'vitest';

describe('Sample Test', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify test environment is set up', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.AUGMENT_TEST_MODE).toBe('true');
  });
});

