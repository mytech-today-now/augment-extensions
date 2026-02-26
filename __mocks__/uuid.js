/**
 * Mock for uuid module
 * Used in Jest tests to avoid ESM import issues
 */

let counter = 0;

module.exports = {
  v4: () => {
    counter++;
    return `mock-uuid-${counter.toString().padStart(4, '0')}`;
  }
};

