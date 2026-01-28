/**
 * Tests for documentation validation utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateReadmeStructure, validateModuleDocumentation } from '../documentation-validator';
import { Module } from '../module-system';

// Mock fs module
jest.mock('fs');

describe('Documentation Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateReadmeStructure', () => {
    it('should validate README with all required sections', () => {
      const mockReadme = `
# Test Module

This is a test module.

## Overview

This module provides testing functionality.

## Contents

- Rule 1
- Rule 2

## Character Count

Total: ~5,000 characters
`;

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockReadme);

      const result = validateReadmeStructure('/test/module');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required sections', () => {
      const mockReadme = `
# Test Module

This is a test module.
`;

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockReadme);

      const result = validateReadmeStructure('/test/module');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('README.md missing required section: Overview');
      expect(result.errors).toContain('README.md missing required section: Contents');
      expect(result.errors).toContain('README.md missing required section: Character Count');
    });

    it('should warn about short README', () => {
      const mockReadme = `# Test`;

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockReadme);

      const result = validateReadmeStructure('/test/module');

      expect(result.warnings).toContain('README.md appears to be too short (< 100 characters)');
    });

    it('should handle missing README', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = validateReadmeStructure('/test/module');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('README.md file is missing');
    });
  });

  describe('validateModuleDocumentation', () => {
    it('should validate complete module documentation', () => {
      const mockModule: Module = {
        metadata: {
          name: 'test-module',
          version: '1.0.0',
          displayName: 'Test Module',
          description: 'A comprehensive test module for validation',
          type: 'coding-standards',
          tags: ['test', 'validation'],
          augment: {
            characterCount: 5000,
            priority: 'high',
            category: 'coding-standards'
          }
        },
        path: '/test/module',
        fullName: 'coding-standards/test-module',
        rules: ['rule1.md', 'rule2.md'],
        examples: ['example1.ts']
      };

      const mockReadme = `
# Test Module

## Overview
Complete overview

## Contents
- Rules

## Character Count
~5,000

## Usage
Example usage

## Installation
Setup instructions
`;

      const mockRule = `
# Rule 1

This is a comprehensive rule.

## Steps

1. Step one
2. Step two

\`\`\`typescript
// Example code
\`\`\`
`;

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('README.md')) return mockReadme;
        if (filePath.includes('rule')) return mockRule;
        return '';
      });

      const result = validateModuleDocumentation(mockModule);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require examples for examples modules', () => {
      const mockModule: Module = {
        metadata: {
          name: 'test-examples',
          version: '1.0.0',
          displayName: 'Test Examples',
          description: 'Test examples module',
          type: 'examples',
          augment: {
            characterCount: 5000
          }
        },
        path: '/test/module',
        fullName: 'examples/test-examples',
        rules: ['rule1.md'],
        examples: []
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('# Test\n\n## Overview\n\n## Contents\n\n## Character Count\n~5000');

      const result = validateModuleDocumentation(mockModule);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Examples module must have files in examples/ directory');
    });
  });
});

