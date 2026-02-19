/**
 * Integration Tests for End-to-End Workflows
 * Tests complete workflows from configuration loading to violation reporting
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigurationManager } from '../../src/config-manager';
import { RuleRegistry } from '../../src/registry';
import { PromptGenerator } from '../../src/prompt-generator';
import { RuleEvaluator } from '../../src/rule-evaluator';
import { Configuration } from '../../src/types';

describe('End-to-End Workflow Integration Tests', () => {
  let tempDir: string;
  let rulesPath: string;
  let configPath: string;
  let configManager: ConfigurationManager;
  let registry: RuleRegistry;
  let promptGenerator: PromptGenerator;
  let evaluator: RuleEvaluator;

  beforeEach(async () => {
    // Create temporary test environment
    tempDir = path.join(__dirname, '../fixtures/temp-e2e');
    rulesPath = path.join(tempDir, 'rules');
    configPath = tempDir;
    
    await fs.mkdir(path.join(rulesPath, 'universal'), { recursive: true });
    await fs.mkdir(path.join(rulesPath, 'categories'), { recursive: true });
    await fs.mkdir(path.join(configPath, '.augment'), { recursive: true });
    
    // Create comprehensive test rules
    await createTestRules();
    
    // Create test configuration
    await createTestConfiguration();
    
    // Initialize all components
    configManager = new ConfigurationManager(configPath);
    await configManager.load();
    
    registry = new RuleRegistry(rulesPath);
    await registry.loadRules();
    
    promptGenerator = new PromptGenerator(registry, configManager);
    evaluator = new RuleEvaluator(registry, configManager);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  async function createTestRules() {
    // Universal naming rule
    const namingRule = `# Rule: Naming Conventions

## Metadata
- **ID**: universal-naming
- **Category**: universal
- **Severity**: ERROR

## Description
Use snake_case for functions and variables, UPPER_CASE for macros.

## Pattern
^[a-z][a-z0-9_]*$ for functions/variables
^[A-Z][A-Z0-9_]*$ for macros

## Examples

### Bad Example
\`\`\`c
int myFunction() { return 0; }
#define myMacro 1
\`\`\`

### Good Example
\`\`\`c
int my_function() { return 0; }
#define MY_MACRO 1
\`\`\`
`;

    await fs.writeFile(path.join(rulesPath, 'universal/naming.md'), namingRule);

    // Memory safety rule
    const memoryRule = `# Rule: Memory Safety

## Metadata
- **ID**: universal-memory-safety
- **Category**: universal
- **Severity**: ERROR

## Description
Always check malloc/calloc return values and free allocated memory.

## Examples

### Bad Example
\`\`\`c
int* ptr = malloc(sizeof(int));
*ptr = 5; // No null check
\`\`\`

### Good Example
\`\`\`c
int* ptr = malloc(sizeof(int));
if (ptr == NULL) return -1;
*ptr = 5;
free(ptr);
\`\`\`
`;

    await fs.writeFile(path.join(rulesPath, 'universal/memory-safety.md'), memoryRule);

    // Embedded systems rule
    const embeddedRule = `# Rule: Volatile Hardware Access

## Metadata
- **ID**: embedded-volatile
- **Category**: embedded
- **Severity**: ERROR

## Description
Use volatile keyword for hardware register access.

## Examples

### Bad Example
\`\`\`c
uint32_t* reg = (uint32_t*)0x40000000;
*reg = 0x01;
\`\`\`

### Good Example
\`\`\`c
volatile uint32_t* reg = (volatile uint32_t*)0x40000000;
*reg = 0x01;
\`\`\`
`;

    await fs.writeFile(path.join(rulesPath, 'categories/embedded.md'), embeddedRule);
  }

  async function createTestConfiguration() {
    const config: Configuration = {
      c_standards: {
        version: '1.0.0',
        categories: ['systems', 'embedded'],
        c_standard: 'c11',
        universal_rules: {
          naming: 'enabled',
          memory_safety: 'enabled',
          error_handling: 'enabled',
          documentation: 'warning',
          header_guards: 'enabled',
          const_correctness: 'enabled'
        },
        category_overrides: {
          embedded: {
            allow_dynamic_allocation: false
          }
        },
        static_analysis: {
          clang_tidy: true,
          cppcheck: true,
          valgrind: false
        },
        custom_rules: {
          enabled: false,
          path: '.augment/c-standards/custom-rules/'
        }
      }
    };

    await fs.writeFile(
      path.join(configPath, '.augment/c-standards.json'),
      JSON.stringify(config, null, 2)
    );
  }

  describe('Complete Workflow: Configuration → Rules → Evaluation', () => {
    it('should load configuration and rules successfully', async () => {
      const config = configManager.getConfiguration();
      const allRules = registry.getAllRules();

      expect(config).toBeDefined();
      expect(allRules.length).toBeGreaterThan(0);
    });

    it('should evaluate code and detect violations', async () => {
      const code = `
int myFunction() {
    int* ptr = malloc(sizeof(int));
    *ptr = 5;
    return *ptr;
}
`;

      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming', 'universal-memory-safety']
      });

      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.ruleId === 'universal-naming')).toBe(true);
      expect(violations.some(v => v.ruleId === 'universal-memory-safety')).toBe(true);
    });

    it('should generate AI prompt with active rules', async () => {
      const prompt = await promptGenerator.generatePrompt({
        filePath: '/project/src/main.c',
        codeContext: 'int main() { return 0; }'
      });

      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('C Coding Standards');
    });

    it('should respect configuration overrides', async () => {
      const config = configManager.getConfiguration();
      expect(config.c_standards.categories).toContain('embedded');

      const embeddedRules = registry.getRulesByCategory('embedded');
      expect(embeddedRules.length).toBeGreaterThan(0);
    });

    it('should filter rules by enabled status', async () => {
      registry.setRuleEnabled('universal-naming', false);

      const code = 'int myFunction() { return 0; }';
      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });

      expect(violations.length).toBe(0);
    });
  });

  describe('Category-Specific Workflows', () => {
    it('should apply embedded category rules', async () => {
      const code = `
uint32_t* reg = (uint32_t*)0x40000000;
*reg = 0x01;
`;

      const violations = await evaluator.evaluate(code, {
        filePath: '/project/embedded/sensor.c',
        rules: ['embedded-volatile']
      });

      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('embedded-volatile');
    });

    it('should generate category-specific prompts', async () => {
      const prompt = await promptGenerator.generatePrompt({
        filePath: '/project/embedded/sensor.c',
        codeContext: 'volatile uint32_t* reg;',
        category: 'embedded'
      });

      expect(prompt).toBeDefined();
      expect(prompt).toContain('embedded');
    });
  });

  describe('Multi-File Evaluation', () => {
    it('should evaluate multiple files in batch', async () => {
      const files = [
        {
          path: '/project/src/file1.c',
          content: 'int myFunction() { return 0; }'
        },
        {
          path: '/project/src/file2.c',
          content: 'int my_function() { return 0; }'
        },
        {
          path: '/project/src/file3.c',
          content: 'int anotherBadName() { return 0; }'
        }
      ];

      const results = await evaluator.evaluateBatch(files, {
        rules: ['universal-naming']
      });

      expect(results.length).toBe(3);
      expect(results[0].violations.length).toBeGreaterThan(0);
      expect(results[1].violations.length).toBe(0);
      expect(results[2].violations.length).toBeGreaterThan(0);
    });

    it('should generate summary report for batch evaluation', async () => {
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

      const allViolations = results.flatMap(r => r.violations);
      const report = evaluator.generateReport(allViolations, {
        format: 'json',
        includeSummary: true
      });

      const parsed = JSON.parse(report);
      expect(parsed.summary).toBeDefined();
      expect(parsed.summary.total).toBeGreaterThan(0);
    });
  });

  describe('Configuration Hot-Reload', () => {
    it('should reload configuration and update rules', async () => {
      const config1 = configManager.getConfiguration();
      expect(config1.c_standards.categories).toContain('systems');

      // Modify configuration
      const newConfig: Configuration = {
        c_standards: {
          ...config1.c_standards,
          categories: ['networking', 'kernel']
        }
      };

      await fs.writeFile(
        path.join(configPath, '.augment/c-standards.json'),
        JSON.stringify(newConfig, null, 2)
      );

      await configManager.reload();

      const config2 = configManager.getConfiguration();
      expect(config2.c_standards.categories).toEqual(['networking', 'kernel']);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle invalid code gracefully', async () => {
      const invalidCode = 'this is not valid C code @#$%';

      await expect(evaluator.evaluate(invalidCode, {
        filePath: '/project/src/invalid.c',
        rules: ['universal-naming']
      })).resolves.not.toThrow();
    });

    it('should handle missing rules gracefully', async () => {
      const code = 'int my_function() { return 0; }';

      const violations = await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['nonexistent-rule']
      });

      expect(violations).toBeDefined();
    });
  });
});

