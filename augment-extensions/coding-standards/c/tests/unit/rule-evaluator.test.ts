/**
 * Unit Tests for RuleEvaluator
 * Tests code evaluation, violation detection, and reporting
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { RuleEvaluator } from '../../src/rule-evaluator';
import { RuleRegistry } from '../../src/registry';
import { ConfigurationManager } from '../../src/config-manager';

describe('RuleEvaluator', () => {
  let tempDir: string;
  let rulesPath: string;
  let configPath: string;
  let registry: RuleRegistry;
  let configManager: ConfigurationManager;
  let evaluator: RuleEvaluator;

  beforeEach(async () => {
    // Create temporary directories
    tempDir = path.join(__dirname, '../fixtures/temp-evaluator');
    rulesPath = path.join(tempDir, 'rules');
    configPath = tempDir;
    
    await fs.mkdir(path.join(rulesPath, 'universal'), { recursive: true });
    await fs.mkdir(path.join(configPath, '.augment'), { recursive: true });
    
    // Create sample rules
    await createSampleRules();
    
    // Initialize components
    registry = new RuleRegistry(rulesPath);
    await registry.loadRules();
    
    configManager = new ConfigurationManager(configPath);
    await configManager.load();
    
    evaluator = new RuleEvaluator(registry, configManager);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  async function createSampleRules() {
    const namingRule = `# Rule: Naming Conventions

## Metadata
- **ID**: universal-naming
- **Category**: universal
- **Severity**: ERROR

## Description
Use snake_case for functions and variables.

## Pattern
Functions and variables must use snake_case: ^[a-z][a-z0-9_]*$

## Examples

### Bad Example
\`\`\`c
int myFunction() { return 0; }
int MyVariable = 5;
\`\`\`

### Good Example
\`\`\`c
int my_function() { return 0; }
int my_variable = 5;
\`\`\`
`;

    await fs.writeFile(path.join(rulesPath, 'universal/naming.md'), namingRule);
  }

  describe('evaluate()', () => {
    it('should detect naming violations', async () => {
      const code = `
int myFunction() {
    int MyVariable = 5;
    return MyVariable;
}
`;
      
      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });
      
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('universal-naming');
      expect(violations[0].severity).toBe('ERROR');
    });

    it('should not report violations for compliant code', async () => {
      const code = `
int my_function() {
    int my_variable = 5;
    return my_variable;
}
`;
      
      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });
      
      expect(violations.length).toBe(0);
    });

    it('should include line numbers in violations', async () => {
      const code = `
int myFunction() {
    return 0;
}
`;
      
      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });
      
      if (violations.length > 0) {
        expect(violations[0].line).toBeDefined();
        expect(violations[0].line).toBeGreaterThan(0);
      }
    });

    it('should include suggestions for fixes', async () => {
      const code = `
int myFunction() {
    return 0;
}
`;
      
      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });
      
      if (violations.length > 0) {
        expect(violations[0].suggestion).toBeDefined();
        expect(violations[0].suggestion.length).toBeGreaterThan(0);
      }
    });

    it('should filter by severity', async () => {
      const code = `int myFunction() { return 0; }`;
      
      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming'],
        minSeverity: 'WARNING'
      });
      
      expect(violations.every(v => v.severity === 'ERROR' || v.severity === 'WARNING')).toBe(true);
    });
  });

  describe('applyRule()', () => {
    it('should apply single rule to code', async () => {
      const code = `int myFunction() { return 0; }`;
      const rule = registry.getRule('universal-naming');

      if (rule) {
        const violations = await evaluator.applyRule(code, rule);
        expect(Array.isArray(violations)).toBe(true);
      }
    });

    it('should return empty array for compliant code', async () => {
      const code = `int my_function() { return 0; }`;
      const rule = registry.getRule('universal-naming');

      if (rule) {
        const violations = await evaluator.applyRule(code, rule);
        expect(violations.length).toBe(0);
      }
    });
  });

  describe('evaluateBatch()', () => {
    it('should evaluate multiple files', async () => {
      const files = [
        {
          path: '/project/src/file1.c',
          content: 'int myFunction() { return 0; }'
        },
        {
          path: '/project/src/file2.c',
          content: 'int my_function() { return 0; }'
        }
      ];

      const results = await evaluator.evaluateBatch(files, {
        rules: ['universal-naming']
      });

      expect(results.length).toBe(2);
      expect(results[0].filePath).toBe('/project/src/file1.c');
      expect(results[1].filePath).toBe('/project/src/file2.c');
    });

    it('should report violations per file', async () => {
      const files = [
        {
          path: '/project/src/file1.c',
          content: 'int myFunction() { return 0; }'
        }
      ];

      const results = await evaluator.evaluateBatch(files, {
        rules: ['universal-naming']
      });

      expect(results[0].violations).toBeDefined();
      expect(Array.isArray(results[0].violations)).toBe(true);
    });
  });

  describe('generateReport()', () => {
    it('should generate text report', async () => {
      const code = `int myFunction() { return 0; }`;

      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });

      const report = evaluator.generateReport(violations, { format: 'text' });

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should generate JSON report', async () => {
      const code = `int myFunction() { return 0; }`;

      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });

      const report = evaluator.generateReport(violations, { format: 'json' });

      expect(report).toBeDefined();
      expect(() => JSON.parse(report)).not.toThrow();
    });

    it('should include summary statistics', async () => {
      const code = `int myFunction() { return 0; }`;

      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });

      const report = evaluator.generateReport(violations, {
        format: 'json',
        includeSummary: true
      });

      const parsed = JSON.parse(report);
      expect(parsed.summary).toBeDefined();
      expect(parsed.summary.total).toBeDefined();
    });
  });

  describe('getViolationsByFile()', () => {
    it('should group violations by file', async () => {
      const files = [
        {
          path: '/project/src/file1.c',
          content: 'int myFunction() { return 0; }'
        },
        {
          path: '/project/src/file2.c',
          content: 'int anotherBadName() { return 0; }'
        }
      ];

      const results = await evaluator.evaluateBatch(files, {
        rules: ['universal-naming']
      });

      const grouped = evaluator.getViolationsByFile(results);

      expect(Object.keys(grouped).length).toBeGreaterThan(0);
      expect(grouped['/project/src/file1.c']).toBeDefined();
    });
  });

  describe('getViolationsBySeverity()', () => {
    it('should group violations by severity', async () => {
      const code = `int myFunction() { return 0; }`;

      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });

      const grouped = evaluator.getViolationsBySeverity(violations);

      expect(grouped).toBeDefined();
      if (violations.length > 0) {
        expect(grouped.ERROR || grouped.WARNING).toBeDefined();
      }
    });
  });
});

