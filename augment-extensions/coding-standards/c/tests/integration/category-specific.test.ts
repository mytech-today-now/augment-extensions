/**
 * Integration Tests for All 7 C Coding Categories
 * Tests category-specific rules and workflows
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigurationManager } from '../../src/config-manager';
import { RuleRegistry } from '../../src/registry';
import { PromptGenerator } from '../../src/prompt-generator';
import { RuleEvaluator } from '../../src/rule-evaluator';

describe('Category-Specific Integration Tests', () => {
  let tempDir: string;
  let rulesPath: string;
  let configPath: string;
  let configManager: ConfigurationManager;
  let registry: RuleRegistry;
  let promptGenerator: PromptGenerator;
  let evaluator: RuleEvaluator;

  beforeEach(async () => {
    tempDir = path.join(__dirname, '../fixtures/temp-categories');
    rulesPath = path.join(tempDir, 'rules');
    configPath = tempDir;
    
    await fs.mkdir(path.join(rulesPath, 'categories'), { recursive: true });
    await fs.mkdir(path.join(configPath, '.augment'), { recursive: true });
    
    await createCategoryRules();
    
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

  async function createCategoryRules() {
    // Systems Programming
    const systemsRule = `# Rule: POSIX Compliance

## Metadata
- **ID**: systems-posix
- **Category**: systems
- **Severity**: WARNING

## Description
Follow POSIX standards for system programming.
`;

    await fs.writeFile(path.join(rulesPath, 'categories/systems.md'), systemsRule);

    // Embedded Systems
    const embeddedRule = `# Rule: Volatile Hardware Access

## Metadata
- **ID**: embedded-volatile
- **Category**: embedded
- **Severity**: ERROR

## Description
Use volatile for hardware register access.
`;

    await fs.writeFile(path.join(rulesPath, 'categories/embedded.md'), embeddedRule);

    // Kernel Development
    const kernelRule = `# Rule: Kernel Coding Style

## Metadata
- **ID**: kernel-style
- **Category**: kernel
- **Severity**: ERROR

## Description
Follow Linux kernel coding style guidelines.
`;

    await fs.writeFile(path.join(rulesPath, 'categories/kernel.md'), kernelRule);

    // Device Drivers
    const driversRule = `# Rule: Driver Error Handling

## Metadata
- **ID**: drivers-error-handling
- **Category**: drivers
- **Severity**: ERROR

## Description
Proper error handling in device drivers.
`;

    await fs.writeFile(path.join(rulesPath, 'categories/drivers.md'), driversRule);

    // Real-time Systems
    const realtimeRule = `# Rule: Deterministic Execution

## Metadata
- **ID**: realtime-deterministic
- **Category**: realtime
- **Severity**: ERROR

## Description
Ensure deterministic execution paths.
`;

    await fs.writeFile(path.join(rulesPath, 'categories/realtime.md'), realtimeRule);

    // Networking
    const networkingRule = `# Rule: Network Byte Order

## Metadata
- **ID**: networking-byte-order
- **Category**: networking
- **Severity**: ERROR

## Description
Use htons/htonl for network byte order.
`;

    await fs.writeFile(path.join(rulesPath, 'categories/networking.md'), networkingRule);

    // Legacy Code
    const legacyRule = `# Rule: Legacy Compatibility

## Metadata
- **ID**: legacy-compatibility
- **Category**: legacy
- **Severity**: WARNING

## Description
Maintain compatibility with legacy systems.
`;

    await fs.writeFile(path.join(rulesPath, 'categories/legacy.md'), legacyRule);
  }

  describe('Category 1: Systems Programming', () => {
    it('should load systems programming rules', () => {
      const systemsRules = registry.getRulesByCategory('systems');
      expect(systemsRules.length).toBeGreaterThan(0);
      expect(systemsRules[0].id).toBe('systems-posix');
    });

    it('should generate systems-specific prompts', async () => {
      const prompt = await promptGenerator.generatePrompt({
        filePath: '/project/systems/process.c',
        codeContext: 'fork();',
        category: 'systems'
      });
      
      expect(prompt).toBeDefined();
    });
  });

  describe('Category 2: Embedded Systems', () => {
    it('should load embedded systems rules', () => {
      const embeddedRules = registry.getRulesByCategory('embedded');
      expect(embeddedRules.length).toBeGreaterThan(0);
      expect(embeddedRules[0].id).toBe('embedded-volatile');
    });

    it('should detect embedded violations', async () => {
      const code = 'uint32_t* reg = (uint32_t*)0x40000000;';
      
      const violations = await evaluator.evaluate(code, {
        filePath: '/project/embedded/sensor.c',
        rules: ['embedded-volatile']
      });
      
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('Category 3: Kernel Development', () => {
    it('should load kernel development rules', () => {
      const kernelRules = registry.getRulesByCategory('kernel');
      expect(kernelRules.length).toBeGreaterThan(0);
      expect(kernelRules[0].id).toBe('kernel-style');
    });

    it('should generate kernel-specific prompts', async () => {
      const prompt = await promptGenerator.generatePrompt({
        filePath: '/project/kernel/scheduler.c',
        codeContext: 'schedule();',
        category: 'kernel'
      });

      expect(prompt).toBeDefined();
    });
  });

  describe('Category 4: Device Drivers', () => {
    it('should load device driver rules', () => {
      const driversRules = registry.getRulesByCategory('drivers');
      expect(driversRules.length).toBeGreaterThan(0);
      expect(driversRules[0].id).toBe('drivers-error-handling');
    });

    it('should generate driver-specific prompts', async () => {
      const prompt = await promptGenerator.generatePrompt({
        filePath: '/project/drivers/usb.c',
        codeContext: 'usb_register_driver();',
        category: 'drivers'
      });

      expect(prompt).toBeDefined();
    });
  });

  describe('Category 5: Real-time Systems', () => {
    it('should load real-time systems rules', () => {
      const realtimeRules = registry.getRulesByCategory('realtime');
      expect(realtimeRules.length).toBeGreaterThan(0);
      expect(realtimeRules[0].id).toBe('realtime-deterministic');
    });

    it('should generate real-time specific prompts', async () => {
      const prompt = await promptGenerator.generatePrompt({
        filePath: '/project/realtime/scheduler.c',
        codeContext: 'rt_task_create();',
        category: 'realtime'
      });

      expect(prompt).toBeDefined();
    });
  });

  describe('Category 6: Networking', () => {
    it('should load networking rules', () => {
      const networkingRules = registry.getRulesByCategory('networking');
      expect(networkingRules.length).toBeGreaterThan(0);
      expect(networkingRules[0].id).toBe('networking-byte-order');
    });

    it('should detect networking violations', async () => {
      const code = 'uint16_t port = 8080;'; // Should use htons

      const violations = await evaluator.evaluate(code, {
        filePath: '/project/network/tcp.c',
        rules: ['networking-byte-order']
      });

      expect(violations.length).toBeGreaterThan(0);
    });

    it('should generate networking-specific prompts', async () => {
      const prompt = await promptGenerator.generatePrompt({
        filePath: '/project/network/tcp.c',
        codeContext: 'socket();',
        category: 'networking'
      });

      expect(prompt).toBeDefined();
    });
  });

  describe('Category 7: Legacy Code', () => {
    it('should load legacy code rules', () => {
      const legacyRules = registry.getRulesByCategory('legacy');
      expect(legacyRules.length).toBeGreaterThan(0);
      expect(legacyRules[0].id).toBe('legacy-compatibility');
    });

    it('should generate legacy-specific prompts', async () => {
      const prompt = await promptGenerator.generatePrompt({
        filePath: '/project/legacy/old_system.c',
        codeContext: 'legacy_function();',
        category: 'legacy'
      });

      expect(prompt).toBeDefined();
    });
  });

  describe('Cross-Category Integration', () => {
    it('should handle multiple categories simultaneously', async () => {
      const systemsRules = registry.getRulesByCategory('systems');
      const embeddedRules = registry.getRulesByCategory('embedded');
      const kernelRules = registry.getRulesByCategory('kernel');

      expect(systemsRules.length).toBeGreaterThan(0);
      expect(embeddedRules.length).toBeGreaterThan(0);
      expect(kernelRules.length).toBeGreaterThan(0);
    });

    it('should evaluate code with multiple category rules', async () => {
      const code = `
volatile uint32_t* reg = (volatile uint32_t*)0x40000000;
int result = fork();
`;

      const violations = await evaluator.evaluate(code, {
        filePath: '/project/mixed/code.c',
        rules: ['embedded-volatile', 'systems-posix']
      });

      expect(violations).toBeDefined();
    });

    it('should generate prompts for mixed categories', async () => {
      const prompt = await promptGenerator.generatePrompt({
        filePath: '/project/mixed/code.c',
        codeContext: 'mixed code',
        category: 'systems,embedded'
      });

      expect(prompt).toBeDefined();
    });
  });

  describe('Category Detection from File Paths', () => {
    it('should detect embedded from path', () => {
      const category = promptGenerator.detectCategory('/project/embedded/sensor.c');
      expect(category).toContain('embedded');
    });

    it('should detect kernel from path', () => {
      const category = promptGenerator.detectCategory('/project/kernel/scheduler.c');
      expect(category).toContain('kernel');
    });

    it('should detect networking from path', () => {
      const category = promptGenerator.detectCategory('/project/network/tcp.c');
      expect(category).toContain('networking');
    });

    it('should detect drivers from path', () => {
      const category = promptGenerator.detectCategory('/project/drivers/usb.c');
      expect(category).toContain('drivers');
    });

    it('should detect realtime from path', () => {
      const category = promptGenerator.detectCategory('/project/realtime/task.c');
      expect(category).toContain('realtime');
    });

    it('should detect legacy from path', () => {
      const category = promptGenerator.detectCategory('/project/legacy/old.c');
      expect(category).toContain('legacy');
    });
  });
});

