/**
 * Performance Benchmarks for C Coding Standards
 * Tests critical paths: rule loading, configuration parsing, prompt generation
 * Target: <100ms response time for prompt generation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigurationManager } from '../../src/config-manager';
import { RuleRegistry } from '../../src/registry';
import { PromptGenerator } from '../../src/prompt-generator';
import { RuleEvaluator } from '../../src/rule-evaluator';
import { Configuration } from '../../src/types';

describe('Performance Benchmarks', () => {
  let tempDir: string;
  let rulesPath: string;
  let configPath: string;

  beforeAll(async () => {
    tempDir = path.join(__dirname, '../fixtures/temp-perf');
    rulesPath = path.join(tempDir, 'rules');
    configPath = tempDir;
    
    await fs.mkdir(path.join(rulesPath, 'universal'), { recursive: true });
    await fs.mkdir(path.join(rulesPath, 'categories'), { recursive: true });
    await fs.mkdir(path.join(configPath, '.augment'), { recursive: true });
    
    // Create comprehensive test data
    await createBenchmarkData();
  });

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  async function createBenchmarkData() {
    // Create 6 universal rules
    const universalRules = [
      'naming', 'memory-safety', 'error-handling',
      'documentation', 'header-guards', 'const-correctness'
    ];

    for (const ruleName of universalRules) {
      const rule = `# Rule: ${ruleName}

## Metadata
- **ID**: universal-${ruleName}
- **Category**: universal
- **Severity**: ERROR

## Description
Universal rule for ${ruleName}.

## Examples

### Good Example
\`\`\`c
// Good code
\`\`\`
`;
      await fs.writeFile(
        path.join(rulesPath, `universal/${ruleName}.md`),
        rule
      );
    }

    // Create category-specific rules (7 categories)
    const categories = [
      'systems', 'embedded', 'kernel', 'drivers',
      'realtime', 'networking', 'legacy'
    ];

    for (const category of categories) {
      const rule = `# Rule: ${category} specific

## Metadata
- **ID**: ${category}-rule
- **Category**: ${category}
- **Severity**: ERROR

## Description
Category-specific rule for ${category}.
`;
      await fs.writeFile(
        path.join(rulesPath, `categories/${category}.md`),
        rule
      );
    }

    // Create configuration
    const config: Configuration = {
      c_standards: {
        version: '1.0.0',
        categories: categories,
        c_standard: 'c11',
        universal_rules: {
          naming: 'enabled',
          memory_safety: 'enabled',
          error_handling: 'enabled',
          documentation: 'enabled',
          header_guards: 'enabled',
          const_correctness: 'enabled'
        },
        category_overrides: {},
        static_analysis: {
          clang_tidy: true,
          cppcheck: true,
          valgrind: false
        },
        custom_rules: {
          enabled: false,
          path: ''
        }
      }
    };

    await fs.writeFile(
      path.join(configPath, '.augment/c-standards.json'),
      JSON.stringify(config, null, 2)
    );
  }

  describe('Configuration Loading Performance', () => {
    it('should load configuration in <50ms', async () => {
      const configManager = new ConfigurationManager(configPath);
      
      const startTime = performance.now();
      await configManager.load();
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      console.log(`Configuration loading: ${duration.toFixed(2)}ms`);
      
      expect(duration).toBeLessThan(50);
    });

    it('should parse JSON configuration in <20ms', async () => {
      const configPath = path.join(tempDir, '.augment/c-standards.json');
      
      const startTime = performance.now();
      const content = await fs.readFile(configPath, 'utf-8');
      JSON.parse(content);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      console.log(`JSON parsing: ${duration.toFixed(2)}ms`);
      
      expect(duration).toBeLessThan(20);
    });

    it('should validate configuration in <30ms', async () => {
      const configManager = new ConfigurationManager(configPath);
      await configManager.load();
      const config = configManager.getConfiguration();
      
      const startTime = performance.now();
      configManager.validateConfiguration(config);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      console.log(`Configuration validation: ${duration.toFixed(2)}ms`);
      
      expect(duration).toBeLessThan(30);
    });
  });

  describe('Rule Loading Performance', () => {
    it('should load all rules in <100ms', async () => {
      const registry = new RuleRegistry(rulesPath);

      const startTime = performance.now();
      await registry.loadRules();
      const endTime = performance.now();

      const duration = endTime - startTime;
      const ruleCount = registry.getAllRules().length;
      console.log(`Rule loading: ${duration.toFixed(2)}ms (${ruleCount} rules)`);

      expect(duration).toBeLessThan(100);
    });

    it('should parse individual rule in <10ms', async () => {
      const registry = new RuleRegistry(rulesPath);
      await registry.loadRules();

      const startTime = performance.now();
      registry.getRule('universal-naming');
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`Rule retrieval: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(10);
    });

    it('should query rules by category in <20ms', async () => {
      const registry = new RuleRegistry(rulesPath);
      await registry.loadRules();

      const startTime = performance.now();
      registry.getRulesByCategory('embedded');
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`Category query: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(20);
    });

    it('should use cache effectively', async () => {
      const registry = new RuleRegistry(rulesPath);
      await registry.loadRules();

      // First query (uncached)
      const start1 = performance.now();
      registry.getRulesByCategory('embedded');
      const end1 = performance.now();
      const duration1 = end1 - start1;

      // Second query (cached)
      const start2 = performance.now();
      registry.getRulesByCategory('embedded');
      const end2 = performance.now();
      const duration2 = end2 - start2;

      console.log(`Uncached query: ${duration1.toFixed(2)}ms, Cached query: ${duration2.toFixed(2)}ms`);

      expect(duration2).toBeLessThan(duration1);
      expect(duration2).toBeLessThan(5); // Cached should be very fast
    });
  });

  describe('Prompt Generation Performance', () => {
    it('should generate prompt in <100ms (TARGET)', async () => {
      const configManager = new ConfigurationManager(configPath);
      await configManager.load();

      const registry = new RuleRegistry(rulesPath);
      await registry.loadRules();

      const generator = new PromptGenerator(registry, configManager);

      const startTime = performance.now();
      await generator.generatePrompt({
        filePath: '/project/embedded/sensor.c',
        codeContext: 'volatile uint32_t* reg;'
      });
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`Prompt generation: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(100);
    });

    it('should detect category in <5ms', async () => {
      const configManager = new ConfigurationManager(configPath);
      await configManager.load();

      const registry = new RuleRegistry(rulesPath);
      await registry.loadRules();

      const generator = new PromptGenerator(registry, configManager);

      const startTime = performance.now();
      generator.detectCategory('/project/embedded/sensor.c');
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`Category detection: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(5);
    });

    it('should use prompt cache effectively', async () => {
      const configManager = new ConfigurationManager(configPath);
      await configManager.load();

      const registry = new RuleRegistry(rulesPath);
      await registry.loadRules();

      const generator = new PromptGenerator(registry, configManager);

      const context = {
        filePath: '/project/src/main.c',
        codeContext: 'int main() { return 0; }'
      };

      // First generation (uncached)
      const start1 = performance.now();
      await generator.generatePrompt(context);
      const end1 = performance.now();
      const duration1 = end1 - start1;

      // Second generation (cached)
      const start2 = performance.now();
      await generator.generatePrompt(context);
      const end2 = performance.now();
      const duration2 = end2 - start2;

      console.log(`Uncached prompt: ${duration1.toFixed(2)}ms, Cached prompt: ${duration2.toFixed(2)}ms`);

      expect(duration2).toBeLessThan(duration1);
      expect(duration2).toBeLessThan(10);
    });
  });

  describe('Rule Evaluation Performance', () => {
    it('should evaluate code in <200ms', async () => {
      const configManager = new ConfigurationManager(configPath);
      await configManager.load();

      const registry = new RuleRegistry(rulesPath);
      await registry.loadRules();

      const evaluator = new RuleEvaluator(registry, configManager);

      const code = `
int myFunction() {
    int* ptr = malloc(sizeof(int));
    *ptr = 5;
    return *ptr;
}
`;

      const startTime = performance.now();
      await evaluator.evaluate(code, {
        filePath: '/project/src/main.c',
        rules: ['universal-naming', 'universal-memory-safety']
      });
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`Code evaluation: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(200);
    });

    it('should evaluate batch of files efficiently', async () => {
      const configManager = new ConfigurationManager(configPath);
      await configManager.load();

      const registry = new RuleRegistry(rulesPath);
      await registry.loadRules();

      const evaluator = new RuleEvaluator(registry, configManager);

      const files = Array.from({ length: 10 }, (_, i) => ({
        path: `/project/src/file${i}.c`,
        content: 'int my_function() { return 0; }'
      }));

      const startTime = performance.now();
      await evaluator.evaluateBatch(files, {
        rules: ['universal-naming']
      });
      const endTime = performance.now();

      const duration = endTime - startTime;
      const avgPerFile = duration / files.length;
      console.log(`Batch evaluation: ${duration.toFixed(2)}ms (${avgPerFile.toFixed(2)}ms per file)`);

      expect(avgPerFile).toBeLessThan(50);
    });
  });

  describe('Overall System Performance', () => {
    it('should complete full workflow in <300ms', async () => {
      const startTime = performance.now();

      // Load configuration
      const configManager = new ConfigurationManager(configPath);
      await configManager.load();

      // Load rules
      const registry = new RuleRegistry(rulesPath);
      await registry.loadRules();

      // Generate prompt
      const generator = new PromptGenerator(registry, configManager);
      await generator.generatePrompt({
        filePath: '/project/embedded/sensor.c',
        codeContext: 'volatile uint32_t* reg;'
      });

      // Evaluate code
      const evaluator = new RuleEvaluator(registry, configManager);
      await evaluator.evaluate('int my_function() { return 0; }', {
        filePath: '/project/src/main.c',
        rules: ['universal-naming']
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Full workflow: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(300);
    });
  });
});

